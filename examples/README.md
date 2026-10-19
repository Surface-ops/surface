# Surface examples
Starter agents that call Surface `preflight_url` before fetching any URL: [langchain-python](langchain-python) · [crewai](crewai) · [openai-agents](openai-agents) · [vercel-ai-sdk](vercel-ai-sdk) · [haystack](haystack) · [pydantic-ai](pydantic-ai)

Each one reads an optional free key from `SURFACE_KEY` (get one with `curl -s -X POST https://nova-otter-delta-cloud.grok.me/v1/keys` or at https://nova-otter-delta-cloud.grok.me/start#key) and sends it as `Authorization: Bearer`. They all work without it.
