# Surface + langchain-python starter

Gives your agent a **check URL before fetch** tool: Surface's remote MCP server `https://nova-otter-delta-cloud.grok.me/mcp`, tool `preflight_url`. It unwraps short links and returns `next: fetch | skip` without downloading the page. Free up to 1M requests/month, then $0.25 USD per 1k.

```bash
pip install -r requirements.txt && OPENAI_API_KEY=... python agent.py
```
Bring your own OpenAI key. Surface works without a key (60 calls per minute). For your own usage page and no rate cap, get a free key first: `export SURFACE_KEY=$(curl -s -X POST https://nova-otter-delta-cloud.grok.me/v1/keys | jq -r .key)` or use https://nova-otter-delta-cloud.grok.me/start#key. The example sends it as `Authorization: Bearer` when set. Docs: https://nova-otter-delta-cloud.grok.me/docs
