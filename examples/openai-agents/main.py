"""OpenAI Agents SDK + Surface remote MCP (preflight_url)."""
import asyncio
from agents import Agent, Runner
from agents.mcp import MCPServerStreamableHttp

async def main():
    async with MCPServerStreamableHttp(name="surface", params={"url": "https://nova-otter-delta-cloud.grok.me/mcp"}) as surface:
        agent = Agent(name="Fetcher", mcp_servers=[surface],
            instructions="Before fetching any URL, call preflight_url. If next == 'skip', don't fetch.")
        print((await Runner.run(agent, "Check https://lnkd.in/example before I open it.")).final_output)

asyncio.run(main())
