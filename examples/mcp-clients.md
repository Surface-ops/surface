# Client configs

Remote (recommended, no install). All of these point at `https://nova-otter-delta-cloud.grok.me/mcp`.

Optional: get a free key first (`curl -s -X POST https://nova-otter-delta-cloud.grok.me/v1/keys`, or https://nova-otter-delta-cloud.grok.me/start#key) and add the header `Authorization: Bearer surf_...`. Everything works without it, limited to 60 calls per minute.

**Claude Code**
```bash
claude mcp add --transport http surface https://nova-otter-delta-cloud.grok.me/mcp --header "Authorization: Bearer $SURFACE_KEY"
```

**Cursor** (`~/.cursor/mcp.json` or `.cursor/mcp.json`)
```json
{ "mcpServers": { "surface": { "url": "https://nova-otter-delta-cloud.grok.me/mcp", "headers": { "Authorization": "Bearer surf_..." } } } }
```

**VS Code (Copilot agent mode)**
```bash
code --add-mcp '{"name":"surface","type":"http","url":"https://nova-otter-delta-cloud.grok.me/mcp"}'
```

**Codex CLI** (`~/.codex/config.toml`)
```toml
[mcp_servers.surface]
url = "https://nova-otter-delta-cloud.grok.me/mcp"
http_headers = { Authorization = "Bearer surf_..." }  # optional
```

Local stdio bridge (for clients that only run commands), from this repo:

**Claude Desktop** (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "surface": {
      "command": "npx",
      "args": ["-y", "github:Surface-ops/surface"],
      "env": { "SURFACE_KEY": "surf_... (optional)" }
    }
  }
}
```

**AGENTS.md / .cursorrules line**
> Before fetching any short or user-pasted URL (t.co, bit.ly, lnkd.in, youtu.be), call the `surface` MCP tool `preflight_url`. If `next` is `skip`, do not fetch.
