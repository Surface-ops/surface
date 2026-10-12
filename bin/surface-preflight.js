#!/usr/bin/env node
// CLI: surface-preflight <url> [--mcp] [--json]
// Prints "fetch" or "skip" (exit 0 / exit 2), or the full verdict with --json.
import { preflight, mcpPreflight } from "../src/client.js";

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--"));
if (!url || args.includes("--help") || args.includes("-h")) {
  console.error("usage: surface-preflight <url> [--mcp] [--json]\n  env: SURFACE_API_KEY, SURFACE_BASE_URL");
  process.exit(url ? 0 : 64);
}

try {
  const verdict = args.includes("--mcp") ? await mcpPreflight(url) : await preflight(url);
  if (args.includes("--json")) console.log(JSON.stringify(verdict, null, 2));
  else console.log(`${verdict.next}\t${verdict.final_url ?? ""}\t${verdict.verdict ?? ""}`.trimEnd());
  process.exit(verdict.next === "fetch" ? 0 : 2);
} catch (e) {
  console.error(`surface-preflight: ${e.message}`);
  process.exit(1);
}
