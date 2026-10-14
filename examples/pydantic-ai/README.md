# Surface + Pydantic AI

A Pydantic AI agent that uses Surface's remote MCP server as a toolset and calls `preflight_url` before it fetches any URL.

```bash
pip install -r requirements.txt
export OPENAI_API_KEY=...
python agent.py
```

No Surface key is needed to try it. The first 1M requests every month are free.
