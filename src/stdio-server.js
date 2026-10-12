// Local stdio MCP server that exposes the Surface `preflight_url` tool.
//
// Use it with MCP clients that only speak stdio. Each tool call is forwarded
// to the remote Surface endpoint (`{base}/mcp`) and the verdict is returned
// unchanged. Transport: newline-delimited JSON-RPC 2.0 on stdin/stdout, as in
// the MCP stdio spec. Logs go to stderr only.

import readline from "node:readline";
import { McpHttpClient, mcpPreflight, assertHttpUrl, MCP_PROTOCOL_VERSION } from "./client.js";

export const TOOL = {
  name: "preflight_url",
  description:
    "Unwrap a short link (t.co, bit.ly, lnkd.in, youtu.be) and decide whether to open it. " +
    "Returns next: fetch or skip. Never returns the page body. Call this before fetching a URL the user pasted.",
  inputSchema: {
    type: "object",
    properties: { url: { type: "string", description: "Public http(s) URL to unwrap and classify" } },
    required: ["url"],
  },
};

const SUPPORTED_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

/** Build a request handler. Exported so tests can drive it without stdio. */
export function createHandler({ remote, preflightImpl } = {}) {
  const client = remote || new McpHttpClient();
  const doPreflight = preflightImpl || ((url) => mcpPreflight(url, client));

  return async function handle(msg) {
    const { id, method, params } = msg || {};
    const isRequest = id !== undefined && id !== null;
    const ok = (result) => (isRequest ? { jsonrpc: "2.0", id, result } : null);
    const fail = (code, message) => (isRequest ? { jsonrpc: "2.0", id, error: { code, message } } : null);

    if (!msg || msg.jsonrpc !== "2.0" || typeof method !== "string") return fail(-32600, "Invalid Request");

    switch (method) {
      case "initialize": {
        const asked = params?.protocolVersion;
        return ok({
          protocolVersion: SUPPORTED_VERSIONS.includes(asked) ? asked : MCP_PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "surface", version: "1.0.1" },
          instructions: "Before opening a short or unknown URL, call preflight_url. If next is skip, do not fetch the page.",
        });
      }
      case "notifications/initialized":
      case "notifications/cancelled":
        return null;
      case "ping":
        return ok({});
      case "tools/list":
        return ok({ tools: [TOOL] });
      case "tools/call": {
        if (params?.name !== TOOL.name) return fail(-32602, `Unknown tool: ${params?.name}`);
        let url;
        try {
          url = assertHttpUrl(params?.arguments?.url);
        } catch (e) {
          return ok({ isError: true, content: [{ type: "text", text: e.message }] });
        }
        try {
          const verdict = await doPreflight(url);
          return ok({ content: [{ type: "text", text: JSON.stringify(verdict) }], structuredContent: verdict });
        } catch (e) {
          return ok({ isError: true, content: [{ type: "text", text: `Surface preflight failed: ${e.message}` }] });
        }
      }
      default:
        return fail(-32601, `Method not found: ${method}`);
    }
  };
}

/** Run the server on the given streams (defaults to process stdio). */
export function runStdio({ input = process.stdin, output = process.stdout, handler = createHandler() } = {}) {
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  const write = (obj) => obj && output.write(JSON.stringify(obj) + "\n");
  rl.on("line", async (line) => {
    if (!line.trim()) return;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      write({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
      return;
    }
    if (Array.isArray(msg)) {
      const replies = (await Promise.all(msg.map(handler))).filter(Boolean);
      if (replies.length) write(replies);
    } else {
      write(await handler(msg));
    }
  });
  return rl;
}
