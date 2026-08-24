import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { PromorangClient } from '@promorang/sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.PROMORANG_API_KEY;
const baseUrl = process.env.PROMORANG_API_URL || 'https://api.promorang.co/api/v1';

const client = new PromorangClient({
  apiKey,
  baseUrl
});

export const server = new Server(
  {
    name: 'promorang-mcp-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
);

/**
 * 1. Expose MCP Tools for Agents
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_promotions',
        description: 'Search active Promorang coupon drops, flash deals, and live merchant opportunities nearby or by category.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter category: "dining", "entertainment", "retail", "tech", "wellness"'
            },
            lat: {
              type: 'number',
              description: 'User latitude for geo-fenced promotions'
            },
            lng: {
              type: 'number',
              description: 'User longitude for geo-fenced promotions'
            },
            radiusKm: {
              type: 'number',
              description: 'Search radius in kilometers (default: 25)'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of items to return'
            }
          }
        }
      },
      {
        name: 'claim_coupon_opportunity',
        description: 'Claim a promotional coupon, flash drop, or brand opportunity on Promorang.',
        inputSchema: {
          type: 'object',
          properties: {
            opportunityId: {
              type: 'string',
              description: 'The UUID of the brand opportunity or coupon drop to claim'
            },
            recipientUserId: {
              type: 'string',
              description: 'Optional beneficiary user ID or wallet ID'
            }
          },
          required: ['opportunityId']
        }
      },
      {
        name: 'generate_campaign_plan',
        description: 'Run the Promorang AI Campaign Operator to analyze a growth goal, match creators/audiences, and allocate budget.',
        inputSchema: {
          type: 'object',
          properties: {
            objective: {
              type: 'string',
              description: 'Marketing goal or campaign objective'
            },
            targetMarket: {
              type: 'string',
              description: 'Target city or geographic market e.g. "Kingston, Jamaica"'
            },
            budget: {
              type: 'number',
              description: 'Total campaign budget allocation'
            }
          },
          required: ['objective']
        }
      },
      {
        name: 'inspect_merchant_ops',
        description: 'Fetch real-time merchant operations, live budget allocation, and active menu/catalog.',
        inputSchema: {
          type: 'object',
          properties: {
            merchantId: {
              type: 'string',
              description: 'Merchant organization UUID'
            }
          },
          required: ['merchantId']
        }
      }
    ]
  };
});

/**
 * 2. Handle MCP Tool Invocations
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'search_promotions': {
        const results = await client.feed.search(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      }

      case 'claim_coupon_opportunity': {
        const receipt = await client.coupons.claim({
          opportunityId: args.opportunityId as string,
          recipientUserId: args.recipientUserId as string
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(receipt, null, 2)
            }
          ]
        };
      }

      case 'generate_campaign_plan': {
        const plan = await client.campaigns.generatePlan({
          objective: args.objective as string,
          targetMarket: args.targetMarket as string,
          budget: args.budget as number
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(plan, null, 2)
            }
          ]
        };
      }

      case 'inspect_merchant_ops': {
        const ops = await client.merchants.getLiveOps(args.merchantId as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ops, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown MCP Tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Promorang Tool Error: ${error.message || String(error)}`
        }
      ]
    };
  }
});

/**
 * 3. Expose MCP Resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'promorang://feed/active',
        name: 'Promorang Active Live Feed',
        mimeType: 'application/json',
        description: 'Snapshot of active promotions, drops, and live moments across Promorang.'
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'promorang://feed/active') {
    const feed = await client.feed.search({ limit: 50 });
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(feed, null, 2)
        }
      ]
    };
  }

  throw new Error(`Resource not found: ${uri}`);
});

export async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Promorang MCP] Server connected via STDIO transport.');
}

if (process.env.NODE_ENV !== 'test') {
  runServer().catch((err) => {
    console.error('[Promorang MCP] Fatal error starting server:', err);
    process.exit(1);
  });
}
