const {
  ROLES,
  resolvePromoShareRole,
  findNearestGap,
  buildShareDraft,
  parseOutcomeStatement,
  compilePoolDraftFromOutcome,
  compileParticipantBrief,
  compileSponsorBrief,
  compileHostBrief,
  compileBrief,
} = require('../../lib/agents/promoShareBrief');
const { runPromoShareOperator, runPromoShareShareDraft, runPromoSharePoolDraft } = require('../../lib/agents/promoShareAgent');

const almostQualified = {
  cycles: [
    {
      cycle_id: 'week-1',
      cycle_type: 'weekly',
      cycle_name: 'Kingston week pot',
      eligible: false,
      status: 'not_qualified',
      weight: 6,
      total_entries: 2,
      progress_to_qualify: {
        moves: { current: 2, required: 3, complete: false },
        moments: { current: 1, required: 1, complete: true },
        referrals: { current: 0, required: 1, complete: false },
      },
    },
  ],
};

describe('PromoShare role mapping', () => {
  test('maps stakeholder aliases onto operator roles', () => {
    expect(resolvePromoShareRole('brand')).toBe(ROLES.SPONSOR);
    expect(resolvePromoShareRole('merchant')).toBe(ROLES.SPONSOR);
    expect(resolvePromoShareRole('agency')).toBe(ROLES.SPONSOR);
    expect(resolvePromoShareRole('host')).toBe(ROLES.HOST);
    expect(resolvePromoShareRole('creator')).toBe(ROLES.CREATOR);
    expect(resolvePromoShareRole('steward')).toBe(ROLES.STEWARD);
    expect(resolvePromoShareRole('admin')).toBe(ROLES.ADMIN);
    expect(resolvePromoShareRole('participant')).toBe(ROLES.PARTICIPANT);
    expect(resolvePromoShareRole(null, 'regular')).toBe(ROLES.PARTICIPANT);
  });
});

describe('PromoShare qualification brief', () => {
  test('names the nearest incomplete gap first', () => {
    const gap = findNearestGap(almostQualified.cycles[0].progress_to_qualify);
    expect(gap.key).toBe('moves');
    expect(gap.remaining).toBe(1);
    expect(gap.kind).toBe('check_in');
  });

  test('participant brief is one move short, never a payout promise', () => {
    const brief = compileParticipantBrief({
      standing: almostQualified,
      moments: [{ id: 'm1', name: 'Thursday tasting', location: 'Kingston' }],
      location: 'Kingston',
      userName: 'Tia',
    });

    expect(brief.headline).toMatch(/one visit short/i);
    expect(brief.nextMove.href).toBe('/moments/m1/checkin');
    expect(brief.nextMove.ctaLabel).toMatch(/Check in at Thursday tasting/);
    expect(brief.unlock).toMatch(/Thursday tasting/);
    expect(brief.share.posted).toBe(false);
    expect(brief.share.message).toMatch(/Tia is going/);
    expect(brief.summary).not.toMatch(/guaranteed|income|yield/i);
    expect(brief.boundaries.some((line) => /cannot invent tickets/i.test(line))).toBe(true);
  });

  test('qualified users are told they are already in', () => {
    const brief = compileParticipantBrief({
      standing: {
        cycles: [{
          ...almostQualified.cycles[0],
          eligible: true,
          progress_to_qualify: {
            moves: { current: 3, required: 3, complete: true },
            moments: { current: 1, required: 1, complete: true },
            referrals: { current: 1, required: 1, complete: true },
          },
        }],
      },
      moments: [{ id: 'm1', name: 'Thursday tasting' }],
    });

    expect(brief.headline).toMatch(/already in/i);
    expect(brief.nextMove.kind).toBe('share');
    expect(brief.nextMove.ctaLabel).toMatch(/friend|tasting/i);
  });
});

describe('PromoShare share and pool drafts', () => {
  test('share drafts stay unposted', () => {
    const draft = buildShareDraft({
      moment: { id: 'm9', name: 'Harbour set', location: 'Kingston' },
      userName: 'Andre',
    });
    expect(draft.status).toBe('draft');
    expect(draft.posted).toBe(false);
    expect(draft.href).toBe('/moments/m9');
    expect(draft.warning).toMatch(/draft only/i);
  });

  test('outcome compiler writes caps and never marks the pot funded', () => {
    const parsed = parseOutcomeStatement('200 verified visits this weekend, 8000 Gems and 30 UGC photos', {
      location: 'Kingston',
    });
    expect(parsed.targetCount).toBe(200);
    expect(parsed.budgetGems).toBe(8000);
    expect(parsed.ugcCount).toBe(30);

    const draft = compilePoolDraftFromOutcome('200 verified visits this weekend with 8000 Gems', {
      location: 'Kingston',
      budgetGems: 8000,
      targetCount: 200,
    });

    expect(draft.status).toBe('draft');
    expect(draft.funded).toBe(false);
    expect(draft.published).toBe(false);
    expect(draft.caps.liability_cap_gems).toBe(8000);
    expect(draft.caps.one_win_per_user).toBe(true);
    expect(draft.funding.prize_pool_gems).toBeLessThan(8000);
    expect(draft.proof).toContain('check_in');
  });

  test('sponsor brief excludes clicks from the story', () => {
    const brief = compileSponsorBrief({
      outcome: '40 verified dinners this weekend',
      location: 'Kingston',
      budgetGems: 800,
      pools: [{ id: 'p1', cycle_name: 'Cafe pot', status: 'active', metrics: { qualified_users: 3 }, sponsor_config: { prize_pool: 400 } }],
    });

    expect(brief.role).toBe(ROLES.SPONSOR);
    expect(brief.poolDraft.funded).toBe(false);
    expect(brief.estimate.note).toMatch(/clicks/i);
    expect(brief.alerts[0]).toMatch(/Cafe pot/);
  });

  test('host brief refuses to count RSVPs', () => {
    const brief = compileHostBrief({
      moments: [{ id: 'm2', name: 'Friday supper club', location: 'Kingston' }],
    });
    expect(brief.nextMove.kind).toBe('nudge_check_in');
    expect(brief.receiptLines.some((line) => /RSVPs/i.test(line.value))).toBe(true);
  });
});

describe('PromoShare operator runner', () => {
  test('compiles a participant brief without an LLM', async () => {
    const result = await runPromoShareOperator(
      { location: 'Kingston', role: 'participant' },
      { userId: null, activeRole: 'participant', userName: 'Tia' }
    );

    expect(result.success).toBe(true);
    expect(result.role).toBe('participant');
    expect(result.brief.nextMove.title).toBeTruthy();
    expect(result.brief.share.posted).toBe(false);
    expect(result.traceId).toMatch(/^trace_/);
  });

  test('share runner never marks the draft posted', async () => {
    const result = await runPromoShareShareDraft(
      { momentName: 'Thursday tasting', location: 'Kingston' },
      { userId: null, userName: 'Tia' }
    );
    expect(result.draft.posted).toBe(false);
    expect(result.draft.status).toBe('draft');
  });

  test('pool runner rejects participants', async () => {
    await expect(runPromoSharePoolDraft(
      { outcome: '40 verified dinners', role: 'participant' },
      { userId: null, activeRole: 'participant' }
    )).rejects.toThrow(/sponsors, stewards, and admins/i);
  });

  test('pool runner returns an unfunded draft for sponsors', async () => {
    const result = await runPromoSharePoolDraft(
      { outcome: '40 verified dinners this weekend', budgetGems: 800, role: 'brand' },
      { userId: null, activeRole: 'brand' }
    );
    expect(result.draft.funded).toBe(false);
    expect(result.draft.published).toBe(false);
    expect(result.draft.caps.liability_cap_gems).toBe(800);
  });

  test('compileBrief dispatches by role', () => {
    expect(compileBrief('admin').role).toBe('admin');
    expect(compileBrief('steward', { location: 'Kingston' }).headline).toMatch(/Kingston/);
  });
});
