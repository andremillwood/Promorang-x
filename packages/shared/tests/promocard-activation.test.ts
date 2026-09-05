import { describe, expect, it } from 'vitest';
import {
  firstActionsForRole,
  landingPathForRole,
  merchantPerkPostedNext,
} from '../src/promocard-activation';

describe('promocard activation landings', () => {
  it('sends merchants to put a perk up, not a Discover tour', () => {
    expect(landingPathForRole('merchant')).toBe('/stock');
    expect(firstActionsForRole('merchant').map((a) => a.href)).toEqual([
      '/stock',
      '/give',
      '/staff/scanner',
    ]);
  });

  it('sends hosts to create a gathering, then attach a live perk', () => {
    expect(landingPathForRole('host')).toBe('/create/moment');
    expect(firstActionsForRole('host').map((a) => a.href)).toEqual([
      '/create/moment',
      '/give',
      '/staff/scanner',
    ]);
  });

  it('sends creators to take a live perk before sharing', () => {
    expect(landingPathForRole('creator')).toBe('/earn');
    expect(firstActionsForRole('creator').map((a) => a.id)).toEqual([
      'take-perk',
      'share-perk',
      'card',
    ]);
  });

  it('sends members to the card', () => {
    expect(landingPathForRole('people')).toBe('/card');
    expect(landingPathForRole('explorer')).toBe('/card');
  });

  it('after a perk is up, the next moves are share and validate', () => {
    const next = merchantPerkPostedNext('offer-9');
    expect(next[0].href).toBe('/give?offer=offer-9');
    expect(next[1].href).toBe('/staff/scanner');
  });
});
