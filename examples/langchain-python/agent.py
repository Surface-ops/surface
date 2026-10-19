"""LangChain agent with Surface preflight_url as a 'check URL before fetch' tool (via MCP)."""
import asyncio
import os
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

SURFACE_URL = "https://nova-otter-delta-cloud.grok.me/mcp"
HEADERS = {"Authorization": f"Bearer {os.environ['SURFACE_KEY']}"} if os.environ.get("SURFACE_KEY") else {}  # optional free key: POST /v1/keys

async def main():
    client = MultiServerMCPClient({"surface": {"url": SURFACE_URL, "transport": "streamable_http", "headers": HEADERS}})
    tools = await client.get_tools()  # -> preflight_url
    agent = create_react_agent("openai:gpt-4o-mini", tools,
        prompt="Before fetching any URL, call preflight_url. If next is 'skip', do not fetch; report verdict and reason.")
    r = await agent.ainvoke({"messages": [("user", "Is https://bit.ly/3xyz safe to open?")]})
    print(r["messages"][-1].content)

asyncio.run(main())
