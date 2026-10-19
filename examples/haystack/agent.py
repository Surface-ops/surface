"""Haystack Agent with Surface preflight_url as a 'check URL before fetch' tool (via MCP)."""
import os
from haystack.components.agents import Agent
from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.dataclasses import ChatMessage
from haystack_integrations.tools.mcp import MCPTool, StreamableHttpServerInfo

HEADERS = {"Authorization": f"Bearer {os.environ['SURFACE_KEY']}"} if os.environ.get("SURFACE_KEY") else {}  # optional free key: POST /v1/keys

surface = MCPTool(
    name="preflight_url",
    server_info=StreamableHttpServerInfo(url="https://nova-otter-delta-cloud.grok.me/mcp", headers=HEADERS),
)

agent = Agent(
    chat_generator=OpenAIChatGenerator(model="gpt-4o-mini"),
    tools=[surface],
    system_prompt="Before fetching any URL, call preflight_url. If next is 'skip', do not fetch; report verdict and reason.",
)

result = agent.run(messages=[ChatMessage.from_user("Is https://bit.ly/3xyz safe to open?")])
print(result["messages"][-1].text)
