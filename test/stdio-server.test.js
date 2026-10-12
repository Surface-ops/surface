// Offline tests: a local mock of the Surface /mcp and /v1/preflight endpoints.
// These never call the live service, so they don't touch any meter.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { PassThrough } from "node:stream";
import { McpHttpClient, mcpPreflight, preflight, parseMcpResponse, assertHttpUrl } from "../src/client.js";
import { createHandler, runStdio } from "../src/stdio-server.js";

const VERDICT = { next: "fetch", verdict: "fetch", unwrapped: true, from_host: "bit.ly", final_host: "example.com", final_url: "https://example.com/" };
let server, base, seen;

before(async () => {
  seen = [];
  server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      seen.push({ method: req.method, url: req.url, auth: req.headers.authorization, body });
      if (req.method === "GET" && req.url.startsWith("/v1/preflight")) {
        res.setHeader("content-type", "application/json");
        return res.end(JSON.stringify(VERDICT));
      }
      if (req.method === "POST" && req.url === "/mcp") {
        const msg = JSON.parse(body);
        if (msg.id === undefined) { res.statusCode = 202; return res.end(); }
        let result;
        if (msg.method === "initialize") result = { protocolVersion: "2025-03-26", capabilities: { tools: {} }, serverInfo: { name: "surface", version: "1.0.0" } };
        else if (msg.method === "tools/list") result = { tools: [{ name: "preflight_url" }] };
        else if (msg.method === "tools/call") result = { content: [{ type: "text", text: JSON.stringify(VERDICT) }] };
        // Answer tools/call as SSE to exercise both transports.
        if (msg.method === "tools/call") {
          res.setHeader("content-type", "text/event-stream");
          return res.end(`event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", id: msg.id, result })}\n\n`);
        }
        res.setHeader("content-type", "application/json");
        return res.end(JSON.stringify({ jsonrpc: "2.0", id: msg.id, result }));
      }
      res.statusCode = 404; res.end("nope");
    });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test("assertHttpUrl rejects non-http schemes", () => {
  assert.throws(() => assertHttpUrl("file:///etc/passwd"));
  assert.throws(() => assertHttpUrl("not a url"));
  assert.equal(assertHttpUrl("https://bit.ly/x"), "https://bit.ly/x");
});

test("parseMcpResponse handles JSON and SSE", () => {
  assert.deepEqual(parseMcpResponse('{"a":1}', "application/json"), { a: 1 });
  assert.deepEqual(parseMcpResponse('event: message\ndata: {"a":2}\n\n', "text/event-stream"), { a: 2 });
});

test("REST preflight sends url and bearer key", async () => {
  const v = await preflight("https://bit.ly/x", { baseUrl: base, apiKey: "surf_test_key" });
  assert.equal(v.next, "fetch");
  const last = seen.at(-1);
  assert.match(last.url, /url=https%3A%2F%2Fbit\.ly%2Fx/);
  assert.equal(last.auth, "Bearer surf_test_key");
});

test("remote MCP client: initialize, tools/list, preflight_url", async () => {
  const c = new McpHttpClient({ baseUrl: base });
  assert.equal((await c.initialize()).serverInfo.name, "surface");
  assert.deepEqual((await c.listTools()).map((t) => t.name), ["preflight_url"]);
  assert.deepEqual(await mcpPreflight("https://bit.ly/x", c), VERDICT);
});

test("stdio server answers initialize, tools/list and tools/call", async () => {
  const handler = createHandler({ remote: new McpHttpClient({ baseUrl: base }) });
  const input = new PassThrough(), output = new PassThrough();
  runStdio({ input, output, handler });
  const lines = [];
  output.on("data", (d) => lines.push(...d.toString().trim().split("\n")));
  const send = (m) => input.write(JSON.stringify(m) + "\n");
  send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } });
  send({ jsonrpc: "2.0", method: "notifications/initialized" });
  send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
  send({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "preflight_url", arguments: { url: "https://bit.ly/x" } } });
  send({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "preflight_url", arguments: { url: "ftp://x" } } });
  await new Promise((r) => setTimeout(r, 300));
  const byId = Object.fromEntries(lines.map((l) => JSON.parse(l)).map((m) => [m.id, m]));
  assert.equal(byId[1].result.protocolVersion, "2025-06-18");
  assert.equal(byId[2].result.tools[0].name, "preflight_url");
  assert.deepEqual(byId[3].result.structuredContent, VERDICT);
  assert.equal(byId[4].result.isError, true);
  assert.equal(Object.keys(byId).length, 4, "notifications get no reply");
  input.end();
});

test("unknown method returns -32601", async () => {
  const h = createHandler({ preflightImpl: async () => VERDICT });
  assert.equal((await h({ jsonrpc: "2.0", id: 9, method: "nope" })).error.code, -32601);
});
