'use strict';
const DEFAULT_BASE = 'https://nova-otter-delta-cloud.grok.me';
class Surface {
  constructor({ apiKey, baseUrl = DEFAULT_BASE, headers = {} } = {}) {
    this.apiKey = apiKey; this.baseUrl = baseUrl.replace(/\/$/, ''); this.headers = headers;
  }
  async _req(method, path, body) {
    const h = { 'user-agent': 'surfaceapi-js/0.1.1', ...this.headers };
    if (this.apiKey) h.authorization = 'Bearer ' + this.apiKey;
    if (body) h['content-type'] = 'application/json';
    const r = await fetch(this.baseUrl + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined, redirect: 'manual' });
    const t = await r.text(); let data; try { data = JSON.parse(t); } catch { data = t; }
    if (r.status >= 400) { const e = new Error('Surface ' + r.status); e.status = r.status; e.data = data; throw e; }
    return { status: r.status, location: r.headers.get('location'), data };
  }
  /** Get a free API key (first 1M requests/month free). */
  async createKey(opts = {}) { return (await this._req('POST', '/v1/keys', opts)).data; }
  /** Preflight a URL: reachability, status, redirects, headers. */
  async preflight(url) { return (await this._req('POST', '/v1/preflight', { url })).data; }
  /** Inspect the calling request as Surface sees it. */
  async inspect() { return (await this._req('GET', '/v1/inspect')).data; }
  /** Resolve a hop short link; returns the redirect target. */
  async hop(code) { const r = await this._req('GET', '/h/' + encodeURIComponent(code)); return { status: r.status, location: r.location }; }
  /** Pixel URL for embedding. */
  pixelUrl(code) { return this.baseUrl + '/px/' + encodeURIComponent(code); }
  /** Usage for your key. */
  async usage() { return (await this._req('GET', '/v1/usage')).data; }
}
module.exports = { Surface, DEFAULT_BASE };
