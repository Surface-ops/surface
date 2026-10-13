"""CrewAI crew that preflights URLs through Surface's MCP server before researching them."""
from crewai import Agent, Task, Crew
from crewai_tools import MCPServerAdapter

server = {"url": "https://nova-otter-delta-cloud.grok.me/mcp", "transport": "streamable-http"}
with MCPServerAdapter(server) as tools:  # exposes preflight_url
    checker = Agent(role="Link checker", goal="Only fetch URLs Surface says to fetch",
                    backstory="You call preflight_url before opening any link.", tools=tools)
    task = Task(description="Preflight https://t.co/example and say whether to fetch it.",
                expected_output="fetch or skip, with the verdict and final host", agent=checker)
    print(Crew(agents=[checker], tasks=[task]).kickoff())
