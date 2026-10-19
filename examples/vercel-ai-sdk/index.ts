// Vercel AI SDK + Surface remote MCP (preflight_url)
import { generateText, experimental_createMCPClient as createMCPClient, stepCountIs } from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { openai } from '@ai-sdk/openai';

// Optional free key: POST /v1/keys, then export SURFACE_KEY=surf_...
const key = process.env.SURFACE_KEY;
const mcp = await createMCPClient({
  transport: new StreamableHTTPClientTransport(new URL('https://nova-otter-delta-cloud.grok.me/mcp'), {
    requestInit: key ? { headers: { Authorization: `Bearer ${key}` } } : undefined,
  }),
});
const { text } = await generateText({
  model: openai('gpt-4o-mini'),
  tools: await mcp.tools(), // preflight_url
  stopWhen: stepCountIs(5),
  system: "Before fetching any URL, call preflight_url. If next is 'skip', don't fetch it.",
  prompt: 'Should I open https://bit.ly/example ?',
});
console.log(text);
await mcp.close();
