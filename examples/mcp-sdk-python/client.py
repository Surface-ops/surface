"""Call Surface's remote MCP server with the official MCP Python SDK.
pip install mcp
Note: some CDNs block the default Python-urllib User-Agent; the SDK uses httpx,
but if you call the REST API with urllib, set a User-Agent header."""
import asyncio, os, sys
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

URL = os.environ.get("SURFACE_BASE_URL", "https://nova-otter-delta-cloud.grok.me") + "/mcp"
HEADERS = {"User-Agent": "surface-mcp-sdk-example/1"}
if os.environ.get("SURFACE_KEY"):
    HEADERS["Authorization"] = "Bearer " + os.environ["SURFACE_KEY"]

async def main(url):
    async with streamablehttp_client(URL, headers=HEADERS) as (r, w, _):
        async with ClientSession(r, w) as s:
            await s.initialize()
            res = await s.call_tool("preflight_url", {"url": url})
            print(res.content[0].text)

asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else "https://bit.ly/example"))
