// Surface client: zero-dependency helpers for the Surface API.
//
//   preflight(url)       -> GET  {base}/v1/preflight?url=...      (plain HTTP)
//   mcpPreflight(url)    -> POST {base}/mcp  tools/call preflight_url (remote MCP)
//   McpHttpClient        -> minimal Streamable-HTTP MCP client (initialize, tools/list, tools/call)
//
// Surface never returns the body of the page it checks. Every call is metered
// against the API key you pass, or the shared demo meter if you pass none.

export const DEFAULT_BASE_URL = "https://nova-otter-delta-cloud.grok.me";
export const MCP_PROTOCOL_VERSION = "2025-03-26";
const PKG_VERSION = "1.0.1";

function resolveOptions(opts = {}) {
  const env = typeof process !== "undefined" ? process.env : {};
  return {
    baseUrl: (opts.baseUrl || env.SURFACE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    apiKey: opts.apiKey ?? env.SURFACE_API_KEY ?? "",
    fetch: opts.fetch || globalThis.fetch,
    timeoutMs: opts.timeoutMs ?? 15000,
    userAgent: opts.userAgent || `surface-mcp/${PKG_VERSION} (+https://github.com/Surface-ops/surface)`,
  };
}

function authHeaders(o) {
  const h = { "User-Agent": o.userAgent };
  if (o.apiKey) h.Authorization = `Bearer ${o.apiKey}`;
  return h;
}

/** Throws unless `url` is an absolute http(s) URL. Surface refuses everything else anyway. */
export function assertHttpUrl(url) {
  let u;
  try {
    u = new URL(String(url));
  } catch {
    throw new TypeError(`Not a valid URL: ${url}`);
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new TypeError(`Only http(s) URLs can be preflighted, got ${u.protocol}`);
  }
  return u.toString();
}

async function withTimeout(o, fn) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), o.timeoutMs);
  try {
    return await fn(ac.signal);
  } finally {
    clearTimeout(t);
  }
}

/**
 * Preflight a URL through the plain HTTP endpoint.
 * @returns {Promise<{next: "fetch"|"skip", verdict?: string, final_url?: string, unwrapped?: boolean, [k: string]: unknown}>}
 */
export async function preflight(url, opts) {
  const o = resolveOptions(opts);
  const target = assertHttpUrl(url);
  const endpoint = `${o.baseUrl}/v1/preflight?url=${encodeURIComponent(target)}`;
  return withTimeout(o, async (signal) => {
    const res = await o.fetch(endpoint, { headers: { Accept: "application/json", ...authHeaders(o) }, signal });
    const text = await res.text();
    if (!res.ok) throw new Error(`Surface preflight HTTP ${res.status}: ${text.slice(0, 300)}`);
    return JSON.parse(text);
  });
}

/** Parse a Streamable-HTTP MCP response, which may be plain JSON or an SSE stream. */
export function parseMcpResponse(text, contentType = "") {
  if (contentType.includes("text/event-stream") || /^\s*(event|data):/m.test(text)) {
    const messages = [];
    for (const block of text.split(/\r?\n\r?\n/)) {
      const data = block
        .split(/\r?\n/)
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trimStart())
        .join("\n");
      if (data) messages.push(JSON.parse(data));
    }
    return messages.length === 1 ? messages[0] : messages;
  }
  return text ? JSON.parse(text) : null;
}

/** Minimal Streamable-HTTP MCP client. Enough for initialize / tools/list / tools/call. */
export class McpHttpClient {
  constructor(opts) {
    this.o = resolveOptions(opts);
    this.endpoint = `${this.o.baseUrl}/mcp`;
    this.sessionId = null;
    this.nextId = 1;
    this.initialized = false;
  }

  async request(method, params) {
    const id = this.nextId++;
    const msg = await this.#post({ jsonrpc: "2.0", id, method, ...(params ? { params } : {}) });
    const reply = Array.isArray(msg) ? msg.find((m) => m && m.id === id) : msg;
    if (!reply) throw new Error(`No JSON-RPC reply for ${method}`);
    if (reply.error) {
      const err = new Error(`MCP ${method} failed: ${reply.error.message} (${reply.error.code})`);
      err.code = reply.error.code;
      err.data = reply.error.data;
      throw err;
    }
    return reply.result;
  }

  async notify(method, params) {
    await this.#post({ jsonrpc: "2.0", method, ...(params ? { params } : {}) });
  }

  async initialize() {
    if (this.initialized) return this.serverInfo;
    const result = await this.request("initialize", {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "surface-mcp", version: PKG_VERSION },
    });
    this.serverInfo = result;
    this.initialized = true;
    try {
      await this.notify("notifications/initialized");
    } catch {
      /* notifications are best effort */
    }
    return result;
  }

  async listTools() {
    await this.initialize();
    return (await this.request("tools/list")).tools;
  }

  async callTool(name, args) {
    await this.initialize();
    return this.request("tools/call", { name, arguments: args });
  }

  async #post(body) {
    const o = this.o;
    return withTimeout(o, async (signal) => {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "MCP-Protocol-Version": MCP_PROTOCOL_VERSION,
        ...authHeaders(o),
      };
      if (this.sessionId) headers["Mcp-Session-Id"] = this.sessionId;
      const res = await o.fetch(this.endpoint, { method: "POST", headers, body: JSON.stringify(body), signal });
      const sid = res.headers.get("mcp-session-id");
      if (sid) this.sessionId = sid;
      const text = await res.text();
      if (res.status === 202 || !text) return null;
      if (!res.ok) throw new Error(`Surface MCP HTTP ${res.status}: ${text.slice(0, 300)}`);
      return parseMcpResponse(text, res.headers.get("content-type") || "");
    });
  }
}

/** Pull the verdict object out of an MCP tools/call result. */
export function verdictFromToolResult(result) {
  if (!result) throw new Error("Empty tool result");
  if (result.structuredContent && typeof result.structuredContent === "object") return result.structuredContent;
  const text = (result.content || []).find((c) => c.type === "text")?.text;
  if (text == null) throw new Error("Tool result has no text content");
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text, next: /\bskip\b/i.test(text) ? "skip" : "fetch" };
  }
}

/** Preflight a URL through the remote MCP endpoint (tool: preflight_url). */
export async function mcpPreflight(url, opts) {
  const client = opts instanceof McpHttpClient ? opts : new McpHttpClient(opts);
  const result = await client.callTool("preflight_url", { url: assertHttpUrl(url) });
  if (result.isError) {
    const text = (result.content || []).map((c) => c.text).join(" ");
    throw new Error(`preflight_url error: ${text}`);
  }
  return verdictFromToolResult(result);
}

/** true when Surface says it is OK to fetch the URL. */
export const shouldFetch = (verdict) => verdict?.next === "fetch";
