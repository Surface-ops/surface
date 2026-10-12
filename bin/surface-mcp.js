#!/usr/bin/env node
// stdio MCP server for Surface. Configure your client with:
//   { "command": "npx", "args": ["-y", "github:Surface-ops/surface"] }
// Optional env: SURFACE_API_KEY (bills your meter), SURFACE_BASE_URL.
import { runStdio } from "../src/stdio-server.js";

process.stderr.write("surface-mcp: stdio server ready (remote: " + (process.env.SURFACE_BASE_URL || "https://nova-otter-delta-cloud.grok.me") + "/mcp)\n");
runStdio();
