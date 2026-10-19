# Surface + Haystack

A Haystack `Agent` that calls Surface's `preflight_url` (remote MCP) before it fetches any URL.

```bash
# optional: free Surface key (no card)
export SURFACE_KEY=$(curl -s -X POST https://nova-otter-delta-cloud.grok.me/v1/keys | jq -r .key)
pip install -r requirements.txt
export OPENAI_API_KEY=...
python agent.py
```

The key is optional: without it the example still works, limited to 60 calls per minute. You can also get a key at https://nova-otter-delta-cloud.grok.me/start#key. The first 1M requests every month are free.
