# Installing Surface (for AI coding agents)

Surface is a remote MCP server. There is nothing to clone, build or install, and an API key is optional. The first 1,000,000 requests every month are free.

## Optional: get a free key

```bash
curl -s -X POST https://nova-otter-delta-cloud.grok.me/v1/keys
# -> {"key":"surf_..."}
```

Or sign up at https://nova-otter-delta-cloud.grok.me/start#key. With a key you get a usage page (`GET /v1/usage`) and no keyless rate limit. Without one, calls still work, limited to 60 per minute.

## MCP settings

Add this server to your MCP settings file (for Cline: `cline_mcp_settings.json`):

Leave out the `headers` line if you have no key.

```json
{
  "mcpServers": {
    "surface": {
      "type": "streamableHttp",
      "url": "https://nova-otter-delta-cloud.grok.me/mcp",
      "headers": { "Authorization": "Bearer surf_..." },
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
  -H "Authorization: Bearer $SURFACE_KEY" \
  -H 'content-type: application/json' -d '{"url":"https://example.com"}'
```
