# Surface + crewai starter

Gives your agent a **check URL before fetch** tool: Surface's remote MCP server `https://nova-otter-delta-cloud.grok.me/mcp`, tool `preflight_url`. It unwraps short links and returns `next: fetch | skip` without downloading the page. Free up to 1M requests/month (once the free tier is live), then $0.25 per 1k.

```bash
pip install -r requirements.txt && OPENAI_API_KEY=... python crew.py
```
Bring your own OpenAI key. Surface needs no key (requests without one use the demo meter). Docs: https://nova-otter-delta-cloud.grok.me/docs
