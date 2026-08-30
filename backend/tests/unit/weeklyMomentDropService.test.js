const service = require('../../services/weeklyMomentDropService');

describe('weekly moment drop service', () => {
  beforeEach(() => {
    global.supabase = {
      rpc: jest.fn(),
      from: jest.fn(),
    };
  });

  afterEach(() => {
    delete global.supabase;
  });

  test('keeps a 90-day lead window', () => {
    expect(service.LEAD_DAYS).toBe(90);
  });

  test('runs the weekly drop RPC with an explicit as-of timestamp', async () => {
    global.supabase.rpc.mockResolvedValue({
      data: { drop_id: 'drop-1', published_count: 4, new_this_week: 4, horizon_count: 8 },
      error: null,
    });

    const asOf = new Date('2026-08-28T21:10:00.000Z');
    const result = await service.runWeeklyMomentDrop(asOf);

    expect(global.supabase.rpc).toHaveBeenCalledWith('run_weekly_moment_drop', {
      p_as_of: asOf.toISOString(),
    });
    expect(result.published_count).toBe(4);
  });

  test('rejects catalog rows that are missing a dated source', async () => {
    await expect(service.addCalendarEvent({ title: 'Untitled' })).rejects.toThrow(
      'event_key, title, starts_at, and source_name are required',
    );
  });
});
