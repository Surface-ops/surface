#!/usr/bin/env python3
"""Call Surface preflight from Python using only the standard library.

    python3 preflight.py https://bit.ly/example          # plain HTTP
    python3 preflight.py https://bit.ly/example --mcp    # remote MCP tools/call

Env: SURFACE_API_KEY (optional, bills your meter), SURFACE_BASE_URL.
"""
import json
import os
import sys
import urllib.parse
import urllib.request

BASE = os.environ.get("SURFACE_BASE_URL", "https://nova-otter-delta-cloud.grok.me").rstrip("/")
KEY = os.environ.get("SURFACE_API_KEY", "")
UA = "surface-mcp-example-python/1.0 (+https://github.com/Surface-ops/surface)"


def _headers(extra=None):
    h = {"User-Agent": UA, "Accept": "application/json"}
    if KEY:
        h["Authorization"] = f"Bearer {KEY}"
    h.update(extra or {})
    return h


def preflight(url: str) -> dict:
    q = urllib.parse.urlencode({"url": url})
    req = urllib.request.Request(f"{BASE}/v1/preflight?{q}", headers=_headers())
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)


def mcp_preflight(url: str) -> dict:
    body = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {"name": "preflight_url", "arguments": {"url": url}},
    }
    req = urllib.request.Request(
        f"{BASE}/mcp",
        data=json.dumps(body).encode(),
        headers=_headers({"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}),
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        text = r.read().decode()
    if text.lstrip().startswith(("event:", "data:")):
        text = "\n".join(l[5:].strip() for l in text.splitlines() if l.startswith("data:"))
    msg = json.loads(text)
    if "error" in msg:
        raise RuntimeError(msg["error"])
    result = msg["result"]
    if result.get("structuredContent"):
        return result["structuredContent"]
    return json.loads(next(c["text"] for c in result["content"] if c["type"] == "text"))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    target = sys.argv[1]
    verdict = mcp_preflight(target) if "--mcp" in sys.argv else preflight(target)
    print(json.dumps(verdict, indent=2))
    sys.exit(0 if verdict.get("next") == "fetch" else 2)
