import type { PromorangClient } from '../client.js';

/**
 * LangChain / CrewAI tool descriptor interface
 */
export interface LangChainToolDescriptor {
  name: string;
  description: string;
  func: (input: string | Record<string, any>) => Promise<string>;
}

/**
 * Creates an array of tool descriptors compatible with LangChain AgentExecutors and CrewAI
 */
export function createLangChainTools(client: PromorangClient): LangChainToolDescriptor[] {
  return [
    {
      name: 'promorang_search_promotions',
      description: 'Search active Promorang coupons, flash drops, and live merchant opportunities nearby or by category. Pass JSON string or object.',
      func: async (input) => {
        const params = typeof input === 'string' ? JSON.parse(input || '{}') : input;
        const result = await client.feed.search(params);
        return JSON.stringify(result, null, 2);
      }
    },
    {
      name: 'promorang_claim_deal',
      description: 'Claims a promotional coupon or brand opportunity on Promorang. Input: { opportunityId: string, recipientUserId?: string }',
      func: async (input) => {
        const params = typeof input === 'string' ? JSON.parse(input) : input;
        const receipt = await client.coupons.claim(params);
        return JSON.stringify(receipt, null, 2);
      }
    },
    {
      name: 'promorang_inspect_merchant_ops',
      description: 'Fetch real-time merchant operations, live budget allocation, and active menu/catalog. Input: { merchantId: string }',
      func: async (input) => {
        const params = typeof input === 'string' ? JSON.parse(input) : input;
        const merchantId = typeof params === 'string' ? params : params.merchantId;
        const ops = await client.merchants.getLiveOps(merchantId);
        return JSON.stringify(ops, null, 2);
      }
    }
  ];
}
