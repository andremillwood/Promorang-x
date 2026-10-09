import { describe, expect, it } from 'vitest';
import { ENCORE_MOMENT_ID } from '@promorang/shared';
import { CURATED_KINGSTON_MOMENTS } from './curated-radar';

describe('retired event promotion scope', () => {
  it('preserves the unrelated Capleton concert at Plantation Cove', () => {
    const concert = CURATED_KINGSTON_MOMENTS.find(moment => moment.id === '00000000-0000-0000-0002-000000000052');
    expect(concert?.title).toBe('Capleton Encore Live — Culture Rising');
    expect(concert?.venueName).toBe('Plantation Cove');
    expect(concert?.description).toContain('Midas Entertainment');
  });
  it('removes the two confirmed discontinued series promotions', () => {
    expect(CURATED_KINGSTON_MOMENTS.some(moment => moment.id === ENCORE_MOMENT_ID)).toBe(false);
    expect(CURATED_KINGSTON_MOMENTS.some(moment => moment.id === '00000000-0000-0000-0002-000000000080')).toBe(false);
  });
});
