# Surface clients

[![Surface](https://nova-otter-delta-cloud.grok.me/badge/surface.svg)](https://nova-otter-delta-cloud.grok.me)

Tiny clients for [Surface](https://nova-otter-delta-cloud.grok.me): usage-priced infrastructure for machine traffic (preflight, hop, pixel, inspect, MCP, badge). First 1M requests/month free.

- JavaScript: `npm install @surfaceapi/surface` ([clients/js](js))
- Python: `pip install surfaceapi` ([clients/python](python))

## MCP
Add Surface to any MCP client:
```json
{ "mcpServers": { "surface": { "url": "https://nova-otter-delta-cloud.grok.me/mcp" } } }
```

## Python
```python
from surfaceapi import Surface
key = Surface().create_key().get("key")   # free key
s = Surface(api_key=key)
print(s.preflight("https://example.com"))
print(s.inspect())
```
