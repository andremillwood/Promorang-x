import { Hono } from 'hono';
import { growthService } from '../services/growth';

const growthRouter = new Hono();

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Staking channels
growthRouter.get('/channels', async (c) => {
  try {
    const channels = await growthService.getStakingChannels();
    return c.json({ success: true, channels });
  } catch (error) {
    console.error('Error fetching growth channels:', error);
    return c.json({ success: false, error: 'Failed to fetch staking channels' }, 500);
  }
});

// User staking positions
growthRouter.get('/staking', async (c) => {
  try {
    const user = c.get('user') as { id?: string } | undefined;
    const positions = await growthService.getUserStakingPositions(user?.id ?? null);
    return c.json({ success: true, positions });
  } catch (error) {
    console.error('Error fetching staking positions:', error);
    return c.json({ success: false, error: 'Failed to fetch staking positions' }, 500);
  }
});

// Funding projects
growthRouter.get('/funding/projects', async (c) => {
  try {
    const limit = parseNumber(c.req.query('limit'), 10);
    const offset = parseNumber(c.req.query('offset'), 0);
    const status = c.req.query('status') ?? 'active';

    const fundingData = await growthService.getFundingProjects({ limit, offset, status });
    return c.json({ success: true, ...fundingData });
  } catch (error) {
    console.error('Error fetching funding projects:', error);
    return c.json({ success: false, error: 'Failed to fetch funding projects' }, 500);
  }
});

// Shield policies
growthRouter.get('/shield/policies', async (c) => {
  try {
    const policies = await growthService.getShieldPolicies();
    return c.json({ success: true, policies });
  } catch (error) {
    console.error('Error fetching shield policies:', error);
    return c.json({ success: false, error: 'Failed to fetch shield policies' }, 500);
  }
});

export { growthRouter };
