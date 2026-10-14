# Surface — preflight a URL before your agent opens it

[![AllMCPs Verified](https://allmcps.com/api/badge/surface?style=shield)](https://allmcps.com/mcp/surface)

Surface is a remote MCP server and HTTP API. It unwraps short or unknown links (t.co, bit.ly, lnkd.in, youtu.be) and tells your agent whether to open them: `next: "fetch"` or `next: "skip"`. **It never returns the page body.**

This repo contains:

| Path | What it is |
|---|---|
| `src/client.js` | Zero-dependency JS client: REST `preflight()`, remote-MCP `mcpPreflight()`, and a minimal Streamable-HTTP `McpHttpClient` |
| `src/stdio-server.js` + `bin/surface-mcp.js` | Local **stdio MCP server** exposing `preflight_url`, which forwards to the remote endpoint (for clients that only run commands) |
| `bin/surface-preflight.js` | CLI: `surface-preflight <url>` prints `fetch`/`skip` (exit 0 = fetch, 2 = skip) |
| `examples/` | Python (stdlib only) and Node examples, plus client configs |
| `test/` | Offline tests against a local mock. They never hit the live meter. |
| `mcp-server.json`, `server-card.json`, `.well-known/mcp/server-card.json`, `smithery.yaml` | Registry and discovery metadata |

- **Remote MCP endpoint (Streamable HTTP):** `https://nova-otter-delta-cloud.grok.me/mcp`
- **Tool:** `preflight_url` `{ "url": "https://..." }`
- **Official MCP Registry:** `me.grok.nova-otter-delta-cloud/surface`
- **Docs:** https://nova-otter-delta-cloud.grok.me/docs · **OpenAPI:** https://nova-otter-delta-cloud.grok.me/openapi.json

## Quick start (remote, no install)

**Claude Code**
```bash
claude mcp add --transport http surface https://nova-otter-delta-cloud.grok.me/mcp
```

**Cursor** (`.cursor/mcp.json`)
```json
{ "mcpServers": { "surface": { "url": "https://nova-otter-delta-cloud.grok.me/mcp" } } }
```

See [`examples/mcp-clients.md`](examples/mcp-clients.md) for VS Code, Codex and Claude Desktop.

## Run locally (stdio bridge)

Requires Node.js 18 or later. No dependencies.

```bash
git clone https://github.com/Surface-ops/surface && cd surface
npm test                       # offline tests
node bin/surface-mcp.js        # stdio MCP server (JSON-RPC on stdin/stdout)
node bin/surface-preflight.js https://bit.ly/example --json
```

Or without cloning:

```json
{ "mcpServers": { "surface": { "command": "npx", "args": ["-y", "github:Surface-ops/surface"] } } }
```

Environment:

- `SURFACE_API_KEY`: optional. This is a `surf_live_…` key (the public demo key uses `surf_demo_…`), sent as `Authorization: Bearer …`. Without a key, calls bill the shared demo meter.
- `SURFACE_BASE_URL`: optional. It defaults to `https://nova-otter-delta-cloud.grok.me`.

## Use as a library

```js
import { preflight, mcpPreflight, shouldFetch } from "surface-mcp"; // or "./src/client.js"

const v = await preflight("https://bit.ly/example");
if (shouldFetch(v)) await fetch(v.final_url);
```

## Raw HTTP (30 seconds)

```bash
# REST
curl -s "https://nova-otter-delta-cloud.grok.me/v1/preflight?url=https://bit.ly/example"

# MCP
curl -s https://nova-otter-delta-cloud.grok.me/mcp \
  -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"preflight_url","arguments":{"url":"https://bit.ly/example"}}}'
```

Response fields: `next` (`fetch` | `skip`), `verdict` (`fetch` | `dead` | `wall` | `trap`), `unwrapped`, `from_host`, `final_host`, `final_url`. Private hosts and odd ports are refused.

## Pricing

**Free: the first 1,000,000 requests every month. No card needed.**

After that, Surface charges per call, in USD per 1,000 calls: Preflight $0.25 (REST or MCP `tools/call`), Hop $0.40, Pixel $0.15, Inspect $0.20. `POST /v1/event` is ingest and is not billed. A flat $50 CAD/month plan is also available (see /billing). `initialize` and `tools/list` are not tool calls. Details: https://nova-otter-delta-cloud.grok.me/docs.

## Directory listings

- Official MCP Registry: `me.grok.nova-otter-delta-cloud/surface`
- Smithery: https://smithery.ai/servers/canada-site-ops/surface
- CuratedMCP: https://www.curatedmcp.com/marketplace/surface
- AllMCPs: https://allmcps.com/mcp/surface [![AllMCPs Verified](https://allmcps.com/api/badge/surface)](https://allmcps.com/mcp/surface?verify=2223556a-bb4d-4dad-b124-7aac3c7f8adc)
- MCPizy: https://mcpizy.com/directory/surface

## Operator, privacy, license

- **Operator:** Canada Site Ops (canada.site.ops@gmail.com)
- **Privacy policy:** https://nova-otter-delta-cloud.grok.me/privacy (summary in [PRIVACY.md](PRIVACY.md))
- **Support:** open an issue or email canada.site.ops@gmail.com
- **License:** [MIT](LICENSE)
