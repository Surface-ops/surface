"""Tiny client for Surface (https://nova-otter-delta-cloud.grok.me)."""
import json, urllib.request, urllib.error
__version__ = "0.1.0"
DEFAULT_BASE = "https://nova-otter-delta-cloud.grok.me"

class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None

class SurfaceError(Exception):
    def __init__(self, status, data): super().__init__(f"Surface {status}"); self.status, self.data = status, data

class Surface:
    def __init__(self, api_key=None, base_url=DEFAULT_BASE, headers=None):
        self.api_key, self.base_url, self.headers = api_key, base_url.rstrip("/"), headers or {}
    def _req(self, method, path, body=None):
        h = {"User-Agent": f"surfaceapi-py/{__version__}", **self.headers}
        if self.api_key: h["Authorization"] = "Bearer " + self.api_key
        data = None
        if body is not None: data = json.dumps(body).encode(); h["Content-Type"] = "application/json"
        req = urllib.request.Request(self.base_url + path, data=data, headers=h, method=method)
        opener = urllib.request.build_opener(_NoRedirect)
        try: r = opener.open(req, timeout=30); status, hdrs, raw = r.status, r.headers, r.read()
        except urllib.error.HTTPError as e:
            status, hdrs, raw = e.code, e.headers, e.read()
            if status >= 400:
                try: d = json.loads(raw)
                except Exception: d = raw.decode(errors="replace")
                raise SurfaceError(status, d)
        try: d = json.loads(raw)
        except Exception: d = raw.decode(errors="replace")
        return status, hdrs, d
    def create_key(self, **opts):
        """Get a free API key (first 1M requests/month free)."""
        return self._req("POST", "/v1/keys", opts)[2]
    def preflight(self, url): return self._req("POST", "/v1/preflight", {"url": url})[2]
    def inspect(self): return self._req("GET", "/v1/inspect")[2]
    def hop(self, code):
        s, h, _ = self._req("GET", "/h/" + urllib.parse.quote(code)); return {"status": s, "location": h.get("Location")}
    def pixel_url(self, code): return f"{self.base_url}/px/{urllib.parse.quote(code)}"
    def usage(self): return self._req("GET", "/v1/usage")[2]

import urllib.parse  # noqa: E402
__all__ = ["Surface", "SurfaceError", "DEFAULT_BASE"]
