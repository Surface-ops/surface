// Talk to the remote Surface MCP endpoint directly: initialize, list tools, call preflight_url.
//   node examples/node/remote-mcp.js https://bit.ly/example
//   Optional: export SURFACE_KEY=surf_... (free: POST /v1/keys). Read by src/client.js and sent as a Bearer header.
import { McpHttpClient, mcpPreflight } from "../../src/client.js";

const url = process.argv[2] || "https://example.com/";
const client = new McpHttpClient();
const info = await client.initialize();
console.log("server:", info.serverInfo);
console.log("tools:", (await client.listTools()).map((t) => t.name));
console.log("verdict:", await mcpPreflight(url, client));
