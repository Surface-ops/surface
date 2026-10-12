# Surface Privacy Policy

Canonical version: https://nova-otter-delta-cloud.grok.me/privacy

_Last updated: October 11, 2026_

Surface ("we", "us") is a usage-priced machine API at https://nova-otter-delta-cloud.grok.me. It offers short-link preflight (`/v1/preflight` and the MCP tool `preflight_url` at `/mcp`), caller classification (`/v1/inspect`), redirect hops (`/h/:code`), 1×1 pixels (`/px/:code`) and event ingest (`/v1/event`).

## Who operates Surface

**Operator:** Canada Site Ops
**Contact:** canada.site.ops@gmail.com

## What we collect

We record request metadata so we can meter usage, bill it, and keep the service working:

- the endpoint and path called (for example `/v1/preflight` or `/h/:code`) and the response status
- a timestamp
- a User-Agent classification (bot, browser or script, plus device and engine)
- the referring host, when your client sends a `Referer` header
- the API key or meter the request is billed to (calls without a key go to the shared demo meter)
- for preflight, the URL you submit and the result we return (final URL, verdict, `next`)
- for `/v1/event`, the JSON body you choose to send

Our hosting and network providers (including Cloudflare) process IP addresses and may set short-lived security cookies (for example `__cf_bm`) to protect the service against abuse.

## What we do not collect or do

- **Preflight never returns page bodies.** We follow redirects to find the final URL and verdict. We do not store or return the content of the page.
- **Hops only redirect to allow-listed hosts.** Each hop has one fixed destination on a host we have approved. We do not pass your query strings through to arbitrary destinations.
- **No accounts are needed for the demo meter.** We don't ask for your name or email to call the public endpoints.
- **We do not sell personal information.** We do not rent or trade it either.
- We do not use Surface request data for advertising profiles.

## URLs your agents send us

When an agent calls `preflight_url` or `/v1/preflight`, it sends us a URL. We use that URL only to follow its redirects and return a verdict (`final_url`, `verdict`, `next`). We request the URL and its redirect chain from our servers, so the destination site sees our request, not your user's. We do not store or return the page content. We do not use submitted URLs to build profiles, and we do not sell or share them except as described under "Sharing" below. We refuse private or internal hosts and unusual ports.

## Pixels

`/px/:code` returns a 1×1 GIF. When a site or email includes a Surface pixel, loading it sends us the request metadata listed above. If you embed a Surface pixel, you are responsible for telling your own visitors and recipients about it, as the law that applies to you requires.

## How we use data

- to count and bill requests per meter
- to show usage in the Surface console and on invoices
- to detect abuse, debug problems and improve the service

## Payments

Paid plans are processed by Stripe. We do not receive or store full card numbers. Stripe's privacy policy covers the data you give them.

## Sharing

We share data only with service providers that run Surface for us (hosting, network/CDN, payments), when the law requires it, or to protect the service and its users.

## Retention

We keep request metadata for as long as we need it to meter, bill and secure the service, and then delete or aggregate it.

## Your choices

You can stop sending requests at any time. To ask what we hold about you, or to ask us to correct or delete it, email canada.site.ops@gmail.com. If you are in Canada and not satisfied with our answer, you can contact the Office of the Privacy Commissioner of Canada (https://www.priv.gc.ca).

## Changes

If this policy changes, we will update the date at the top of this page.

## Contact

Canada Site Ops — canada.site.ops@gmail.com
