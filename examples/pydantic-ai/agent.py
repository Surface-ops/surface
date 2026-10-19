"""Pydantic AI agent with Surface preflight_url as a 'check URL before fetch' tool (via MCP)."""
import asyncio
import os
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStreamableHTTP

HEADERS = {"Authorization": f"Bearer {os.environ['SURFACE_KEY']}"} if os.environ.get("SURFACE_KEY") else {}  # optional free key: POST /v1/keys
surface = MCPServerStreamableHTTP("https://nova-otter-delta-cloud.grok.me/mcp", headers=HEADERS)

agent = Agent(
    "openai:gpt-4o-mini",
    toolsets=[surface],
    instructions="Before fetching any URL, call preflight_url. If next is 'skip', do not fetch; report verdict and reason.",
)

async def main():
    async with agent:
        result = await agent.run("Is https://bit.ly/3xyz safe to open?")
    print(result.output)

asyncio.run(main())
