import type { PromorangClient } from '../client.js';

/**
 * OpenAI Function / Tool Definitions for Promorang
 */
export const promorangOpenAITools = [
  {
    type: 'function' as const,
    function: {
      name: 'promorang_search_promotions',
      description: 'Search active Promorang coupons, flash drops, and live merchant opportunities nearby or by category.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Category filter e.g. "dining", "entertainment", "retail", "tech"'
          },
          lat: {
            type: 'number',
            description: 'Latitude for location-based deals'
          },
          lng: {
            type: 'number',
            description: 'Longitude for location-based deals'
          },
          radiusKm: {
            type: 'number',
            description: 'Search radius in kilometers'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of items to return (default: 10)'
          }
        }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'promorang_claim_deal',
      description: 'Claims a promotional coupon, drop, or brand opportunity on behalf of a user/agent.',
      parameters: {
        type: 'object',
        properties: {
          opportunityId: {
            type: 'string',
            description: 'The UUID of the brand opportunity or drop to claim'
          },
          recipientUserId: {
            type: 'string',
            description: 'Optional beneficiary user identifier or wallet ID'
          }
        },
        required: ['opportunityId']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'promorang_generate_campaign_plan',
      description: 'Headless AI Campaign Operator: generates target audience matching, creator mobilization, and budget plan.',
      parameters: {
        type: 'object',
        properties: {
          objective: {
            type: 'string',
            description: 'Marketing goal e.g. "Launch new weekend brunch with 50 local food creators"'
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
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'promorang_inspect_merchant_ops',
      description: 'Fetch real-time merchant operations, live budget allocation, and active menu/catalog.',
      parameters: {
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
  }
];

/**
 * Dispatcher helper: executes tool calls directly using the PromorangClient instance
 */
export async function executeOpenAITool(client: PromorangClient, name: string, args: Record<string, any>) {
  switch (name) {
    case 'promorang_search_promotions':
      return await client.feed.search(args);
    case 'promorang_claim_deal':
      return await client.coupons.claim({
        opportunityId: args.opportunityId,
        recipientUserId: args.recipientUserId
      });
    case 'promorang_generate_campaign_plan':
      return await client.campaigns.generatePlan({
        objective: args.objective,
        targetMarket: args.targetMarket,
        budget: args.budget
      });
    case 'promorang_inspect_merchant_ops':
      return await client.merchants.getLiveOps(args.merchantId);
    default:
      throw new Error(`Unknown Promorang tool: ${name}`);
  }
}
