import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PromorangClient, promorangOpenAITools, createLangChainTools } from '../dist/index.js';

describe('Promorang SDK & AI Agent Tooling', () => {
  it('should initialize client with defaults', () => {
    const client = new PromorangClient({
      apiKey: 'pk_test_12345',
      baseUrl: 'http://localhost:5000/api/v1'
    });
    assert.ok(client.feed, 'Feed API namespace must exist');
    assert.ok(client.coupons, 'Coupons API namespace must exist');
    assert.ok(client.campaigns, 'Campaigns API namespace must exist');
    assert.ok(client.merchants, 'Merchants API namespace must exist');
  });

  it('should export valid OpenAI tool schemas', () => {
    assert.ok(Array.isArray(promorangOpenAITools), 'Must be an array of tools');
    assert.strictEqual(promorangOpenAITools.length, 4);

    const searchTool = promorangOpenAITools.find(t => t.function.name === 'promorang_search_promotions');
    assert.ok(searchTool, 'promorang_search_promotions must exist');
    assert.strictEqual(searchTool.type, 'function');
    assert.ok(searchTool.function.parameters.properties.category);
  });

  it('should generate LangChain compatible tools', () => {
    const client = new PromorangClient({ apiKey: 'pk_test_123' });
    const tools = createLangChainTools(client);
    assert.ok(Array.isArray(tools));
    assert.strictEqual(tools.length, 3);
    assert.strictEqual(typeof tools[0].func, 'function');
  });
});
