// Gate an agent's fetch() behind Surface preflight.
//   node examples/node/safe-fetch.js https://bit.ly/example
import { preflight, shouldFetch } from "../../src/client.js";

export async function safeFetch(url, init) {
  const verdict = await preflight(url);
  if (!shouldFetch(verdict)) {
    return { skipped: true, verdict };
  }
  // Fetch the unwrapped destination, not the shortener.
  const res = await fetch(verdict.final_url || url, init);
  return { skipped: false, verdict, response: res };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2];
  if (!url) {
    console.error("usage: node examples/node/safe-fetch.js <url>");
    process.exit(64);
  }
  const out = await safeFetch(url);
  console.log(out.skipped ? `skip (${out.verdict.verdict})` : `fetched ${out.verdict.final_url} -> HTTP ${out.response.status}`);
}
