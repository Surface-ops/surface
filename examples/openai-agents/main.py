"""OpenAI Agents SDK + Surface remote MCP (preflight_url)."""
import asyncio
import os
from agents import Agent, Runner
from agents.mcp import MCPServerStreamableHttp

HEADERS = {"Authorization": f"Bearer {os.environ['SURFACE_KEY']}"} if os.environ.get("SURFACE_KEY") else {}  # optional free key: POST /v1/keys

async def main():
    async with MCPServerStreamableHttp(name="surface", params={"url": "https://nova-otter-delta-cloud.grok.me/mcp", "headers": HEADERS}) as surface:
        agent = Agent(name="Fetcher", mcp_servers=[surface],
            instructions="Before fetching any URL, call preflight_url. If next == 'skip', don't fetch.")
        print((await Runner.run(agent, "Check https://lnkd.in/example before I open it.")).final_output)

asyncio.run(main())
