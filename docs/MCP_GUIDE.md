# Promorang Model Context Protocol (MCP) Guide

The **Promorang MCP Server** (`@promorang/mcp-server`) provides standard [Model Context Protocol](https://modelcontextprotocol.io) tools and live resources for LLMs and AI Agents like **Claude Desktop**, **Cursor IDE**, **Antigravity**, **LangChain**, and **CrewAI**.

---

## 1. Connecting Promorang MCP to Claude Desktop or Cursor

Add the following to your MCP client configuration (e.g. `claude_desktop_config.json` or Cursor Settings):

```json
{
  "mcpServers": {
    "promorang": {
      "command": "node",
      "args": [
        "/absolute/path/to/Promorang-x/packages/mcp-server/bin/promorang-mcp.js"
      ],
      "env": {
        "PROMORANG_API_KEY": "pk_live_your_api_key_here",
        "PROMORANG_API_URL": "https://api.promorang.co/api/v1"
      }
    }
  }
}
```

---

## 2. Tools Available to AI Agents

Once connected, your AI Agent automatically gains the ability to discover and execute the following tools:

### `search_promotions`
Searches active Promorang coupon drops, live deals, and brand opportunities with geo-filtering.
- **Parameters**: `category`, `lat`, `lng`, `radiusKm`, `limit`
- **Example Agent Prompt**: *"Find me any food discounts or drops near Kingston within 10km."*

### `claim_coupon_opportunity`
Claims a deal and generates an instant redemption receipt and QR payload.
- **Parameters**: `opportunityId` (required), `recipientUserId` (optional)
- **Example Agent Prompt**: *"Claim the Devon House Nitro Cold Brew deal for me."*

### `generate_campaign_plan`
Runs the Promorang AI Campaign Operator to analyze a growth goal, match creators, and calculate expected return on spend.
- **Parameters**: `objective` (required), `targetMarket`, `budget`
- **Example Agent Prompt**: *"Build a campaign strategy to launch a new bakery menu in Kingston with a \$50k JMD budget."*

### `inspect_merchant_ops`
Fetches real-time merchant operations, live budget allocation, and active menu/catalog.
- **Parameters**: `merchantId` (required)

---

## 3. Direct AI Framework Integration (OpenAI & LangChain)

If you are writing custom autonomous agents in Python or TypeScript using OpenAI or LangChain, you can directly import the tool definitions:

### OpenAI Function Calling
```typescript
import OpenAI from 'openai';
import { promorangOpenAITools, executeOpenAITool, PromorangClient } from '@promorang/sdk';

const openai = new OpenAI();
const promorang = new PromorangClient({ apiKey: process.env.PROMORANG_API_KEY });

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'What dining deals are active today?' }],
  tools: promorangOpenAITools,
});

const toolCall = response.choices[0].message.tool_calls?.[0];
if (toolCall) {
  const result = await executeOpenAITool(
    promorang,
    toolCall.function.name,
    JSON.parse(toolCall.function.arguments)
  );
  console.log('Tool execution result:', result);
}
```

### LangChain Agent Integration
```typescript
import { createLangChainTools, PromorangClient } from '@promorang/sdk';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

const promorang = new PromorangClient({ apiKey: process.env.PROMORANG_API_KEY });
const tools = createLangChainTools(promorang);

// Pass tools directly into your LangChain Agent Executor
```
