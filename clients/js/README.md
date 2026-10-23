# Surface: check a short link before you open it

[![links checked | Surface](https://nova-otter-delta-cloud.grok.me/badge/surface.svg)](https://nova-otter-delta-cloud.grok.me)

[Surface](https://nova-otter-delta-cloud.grok.me) follows the hops on t.co, bit.ly, lnkd.in and youtu.be links (or any https URL) and says **fetch** or **skip**. It never returns the page, so it's one quick round trip.

Free for the first 1,000,000 requests every month, no card needed. After that: Preflight $0.25, Hop $0.40, Pixel $0.15, Inspect $0.20 per 1,000 requests (USD). Production plan with your own key and meter: $50 CAD/month ([billing](https://nova-otter-delta-cloud.grok.me/billing)).

[Get started](https://nova-otter-delta-cloud.grok.me/start) · [Docs](https://nova-otter-delta-cloud.grok.me/docs) · Free API key in 10 seconds: `curl -s -X POST https://nova-otter-delta-cloud.grok.me/v1/keys`

## One install for Cursor or Claude (MCP)
Paste this into your MCP settings. The agent then calls `preflight_url` before it opens a short link.
```json
{ "mcpServers": { "surface": { "type": "http", "url": "https://nova-otter-delta-cloud.grok.me/mcp" } } }
```

## JavaScript
`npm install @surfaceapi/surface`
```js
const { Surface } = require('@surfaceapi/surface');
const { key } = await new Surface().createKey();   // free key
const s = new Surface({ apiKey: key });
console.log(await s.preflight('https://youtu.be/jNQXAC9IVRw'));  // next: fetch or skip
console.log(await s.inspect());                                   // bot, browser, or script
```
Python: `pip install surfaceapi`
