# Surface clients

[![Surface](https://nova-otter-delta-cloud.grok.me/badge/surface.svg)](https://nova-otter-delta-cloud.grok.me)

Tiny clients for [Surface](https://nova-otter-delta-cloud.grok.me): usage-priced infrastructure for machine traffic (preflight, hop, pixel, inspect, MCP, badge). First 1M requests/month free.

- JavaScript: `npm install surfaceapi` ([clients/js](js))
- Python: `pip install surfaceapi` ([clients/python](python))

## MCP
Add Surface to any MCP client:
```json
{ "mcpServers": { "surface": { "url": "https://nova-otter-delta-cloud.grok.me/mcp" } } }
```
