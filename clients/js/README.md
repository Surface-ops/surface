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

## JavaScript
```js
const { Surface } = require( '@surfaceapi/surface');
const s = new Surface();
const { key } = await s.createKey();        // free key
const sk = new Surface({ apiKey: key });
console.log(await sk.preflight('https://example.com'));
console.log(await sk.inspect());
console.log(await sk.hop('abc123'));
```
