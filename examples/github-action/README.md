# Surface link preflight — GitHub Action

Add `.github/workflows/links.yml` to any repo:

```yaml
name: links
on: [push, pull_request]
jobs:
  preflight:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Surface-ops/surface@main
        with:
          paths: "**/*.md"
          key: ${{ secrets.SURFACE_KEY }}   # optional; free from POST /v1/keys
```

Each external link is unwrapped (t.co, bit.ly, lnkd.in…) and gets `fetch` or `skip`. The job fails on `skip`. Calls send `User-Agent: surface-github-action/1`.
