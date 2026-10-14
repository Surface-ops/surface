# Installing Surface (for AI coding agents)

Surface is a remote MCP server. There is nothing to clone, build or install, and no API key is needed for the free tier (first 1,000,000 requests every month).

## MCP settings

Add this server to your MCP settings file (for Cline: `cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "surface": {
      "type": "streamableHttp",
      "url": "https://nova-otter-delta-cloud.grok.me/mcp",
      "disabled": false,
      "autoApprove": ["preflight_url"]
    }
  }
}
```

## Verify

Call the `preflight_url` tool with `{"url": "https://example.com"}`. A working install returns JSON with `"next": "fetch"` and a `reason`.

## Tool

- `preflight_url(url)`: unwraps short links (t.co, bit.ly, lnkd.in, youtu.be), follows redirects, and returns `next: fetch` or `next: skip` with a reason. It never returns the page body. Call it before fetching a URL the user pasted.

## REST alternative

```bash
curl -s -X POST https://nova-otter-delta-cloud.grok.me/v1/preflight \
  -H 'content-type: application/json' -d '{"url":"https://example.com"}'
```
