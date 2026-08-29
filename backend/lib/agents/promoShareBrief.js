/**
 * PromoShare brief compiler.
 * Deterministic, testable, no LLM. Agents may polish copy; they do not invent
 * entries, winners, or funded value. Promorang remains the system of record.
 */

const ROLES = {
  PARTICIPANT: 'participant',
  HOST: 'host',
  CREATOR: 'creator',
  SPONSOR: 'sponsor',
  STEWARD: 'steward',
  ADMIN: 'admin',
};

const ROLE_ALIASES = {
  participant: ROLES.PARTICIPANT,
  regular: ROLES.PARTICIPANT,
  pioneer: ROLES.PARTICIPANT,
  promoter: ROLES.PARTICIPANT,
  marketing: ROLES.PARTICIPANT,
  host: ROLES.HOST,
  creator: ROLES.CREATOR,
  brand: ROLES.SPONSOR,
  agency: ROLES.SPONSOR,
  merchant: ROLES.SPONSOR,
  advertiser: ROLES.SPONSOR,
  sponsor: ROLES.SPONSOR,
  steward: ROLES.STEWARD,
  city_steward: ROLES.STEWARD,
  operator: ROLES.STEWARD,
  admin: ROLES.ADMIN,
  administrator: ROLES.ADMIN,
  master_admin: ROLES.ADMIN,
  moderator: ROLES.ADMIN,
};

const BOUNDARIES = [
  'This operator cannot invent tickets, change weight, or pick winners.',
  'Sharing stays a human act. Drafts are never posted automatically.',
  'Money, go-live, and draws stay with a person. Drafts are recommendations.',
];

const GAP_COPY = {
  moves: {
    kind: 'check_in',
    noun: 'visit',
    title: 'Show up and check in',
    why: 'One more verified visit closes the nearest gap and counts for today, this week, and the grand pot.',
  },
  moments: {
    kind: 'join_moment',
    noun: 'Moment',
    title: 'Join a Moment that is actually happening',
    why: 'A distinct Moment is still missing from this cycle. Joining one you would attend anyway is the next move.',
  },
  referrals: {
    kind: 'invite',
    noun: 'friend',
    title: 'Bring one person who will actually go',
    why: 'A verified friend join raises standing without empty spam. Invite someone already close.',
  },
};

function resolvePromoShareRole(activeRole, userType) {
  const raw = String(activeRole || userType || 'participant').toLowerCase().trim();
  return ROLE_ALIASES[raw] || ROLES.PARTICIPANT;
}

function findNearestGap(progress = {}) {
  const order = ['moves', 'moments', 'referrals'];
  for (const key of order) {
    const item = progress[key];
    if (!item) continue;
    if (!item.complete) {
      return {
        key,
        current: Number(item.current) || 0,
        required: Number(item.required) || 0,
        remaining: Math.max(0, (Number(item.required) || 0) - (Number(item.current) || 0)),
        ...GAP_COPY[key],
      };
    }
  }
  return {
    key: 'qualified',
    kind: 'share',
    noun: 'move',
    title: 'You are already in this pot',
    why: 'Stay in by checking in when you go, and share only what you would send a friend.',
    current: 1,
    required: 1,
    remaining: 0,
  };
}

function pickPrimaryCycle(cycles = []) {
  if (!Array.isArray(cycles) || cycles.length === 0) return null;
  const weekly = cycles.find((cycle) => cycle.cycle_type === 'weekly');
  return weekly || cycles[0];
}

function buildShareDraft({ moment, userName, cycleName, location }) {
  const title = moment?.name || moment?.title || 'this Moment';
  const city = location || moment?.location || 'your city';
  const firstName = String(userName || 'I').split(' ')[0];
  const momentId = moment?.id || null;
  const path = momentId ? `/moments/${momentId}` : '/discover';

  return {
    status: 'draft',
    posted: false,
    momentId,
    href: path,
    attributablePath: path,
    message: `${firstName} is going to ${title} in ${city}. Come through — it is a real night, not a flyer.`,
    caption: cycleName
      ? `If they check in, it can count toward ${cycleName}.`
      : 'If they check in, it can count toward this week’s pot.',
    warning: 'Draft only. You still send it. Clicks do not mint tickets.',
  };
}

function parseOutcomeStatement(statement = '', extras = {}) {
  const text = String(statement || '').trim();
  const countMatch = text.match(/(\d{1,5})\s+(verified\s+)?(visits?|check-?ins?|people|guests|dinners?|covers?)/i);
  const gemMatch = text.match(/(\d{2,7})\s*(gems?|usd|dollars?)/i);
  const ugcMatch = text.match(/(\d{1,4})\s+(ugc|photos?|videos?|pieces?\s+of\s+(real\s+)?content)/i);

  const targetCount = extras.targetCount || (countMatch ? Number(countMatch[1]) : 40);
  const budgetGems = extras.budgetGems || (gemMatch && Number(gemMatch[1]) >= 50 ? Number(gemMatch[1]) : 800);
  const ugcCount = extras.ugcCount || (ugcMatch ? Number(ugcMatch[1]) : 0);
  const location = extras.location || '';

  let outcomeKind = 'verified_visits';
  if (/ugc|content|photo|video/i.test(text) && !countMatch) outcomeKind = 'verified_content';
  if (/referr/i.test(text)) outcomeKind = 'verified_referrals';
  if (/return|repeat|loyalty/i.test(text)) outcomeKind = 'repeat_visits';

  return {
    statement: text || 'Fund a verified local outcome',
    outcomeKind,
    targetCount,
    budgetGems,
    ugcCount,
    location,
    timeframe: extras.timeframe || (/weekend/i.test(text) ? 'this weekend' : extras.timeframe || 'this week'),
  };
}

function compilePoolDraftFromOutcome(statement, extras = {}) {
  const parsed = parseOutcomeStatement(statement, extras);
  const gemsPerAction = Math.max(5, Math.round(parsed.budgetGems / Math.max(parsed.targetCount, 1)));
  const platformFeePercent = parsed.budgetGems >= 1000 ? 12 : parsed.budgetGems >= 200 ? 15 : 20;
  const platformFeeGems = Math.round(parsed.budgetGems * (platformFeePercent / 100));
  const prizePoolGems = parsed.budgetGems - platformFeeGems;
  const maxWinners = Math.min(20, Math.max(3, Math.ceil(parsed.targetCount / 10)));
  const maxEntriesPerUserPerDay = 3;
  const maxEntriesPerUserPerCycle = 12;

  return {
    status: 'draft',
    funded: false,
    published: false,
    outcome: parsed,
    eligibility: {
      min_verified_moves: parsed.outcomeKind === 'repeat_visits' ? 2 : 1,
      min_moments_joined: 1,
      min_referrals: parsed.outcomeKind === 'verified_referrals' ? 1 : 0,
      min_proofs_approved: parsed.ugcCount > 0 ? 1 : 0,
    },
    weights: {
      proof_verified: parsed.ugcCount > 0 ? 8 : 5,
      repeat_participation: 8,
      referral_conversion: 12,
      check_in: 5,
    },
    caps: {
      max_entries_per_user_per_day: maxEntriesPerUserPerDay,
      max_entries_per_user_per_cycle: maxEntriesPerUserPerCycle,
      max_winners: maxWinners,
      one_win_per_user: true,
      liability_cap_gems: parsed.budgetGems,
    },
    funding: {
      requested_gems: parsed.budgetGems,
      prize_pool_gems: prizePoolGems,
      platform_fee_gems: platformFeeGems,
      platform_fee_percent: platformFeePercent,
      gems_per_verified_action: gemsPerAction,
      currency: 'Gems',
    },
    cycles: ['daily', 'weekly', 'grand'],
    proof: parsed.ugcCount > 0 ? ['check_in', 'photo'] : ['check_in'],
    message: 'Pool rules compiled. Nothing is funded or live until a person confirms the liability cap.',
  };
}

function estimateLiability(budgetGems, targetCount) {
  const draft = compilePoolDraftFromOutcome(
    `${targetCount} verified visits`,
    { budgetGems, targetCount }
  );
  return {
    fundingRequired: true,
    ...draft.funding,
    targetCount,
    maxWinners: draft.caps.max_winners,
    note: 'Clicks and impressions are not in this number. Only verified downstream actions count.',
  };
}

function receiptLinesFromCycle(cycle, gap) {
  if (!cycle) {
    return [
      { label: 'Cycle', value: 'None live yet' },
      { label: 'Standing', value: 'Waiting on a live pot' },
    ];
  }

  const progress = cycle.progress_to_qualify || {};
  return [
    { label: 'This week', value: cycle.cycle_name || cycle.cycle_type || 'Community pot', strong: true },
    { label: 'In the pot', value: cycle.eligible ? 'Yes' : 'Not yet' },
    { label: 'Your tickets', value: String(cycle.total_entries || 0) },
    { label: 'Visits', value: `${progress.moves?.current || 0} / ${progress.moves?.required || 0}` },
    { label: 'Nights', value: `${progress.moments?.current || 0} / ${progress.moments?.required || 0}` },
    { label: 'Friends who showed', value: `${progress.referrals?.current || 0} / ${progress.referrals?.required || 0}` },
    { label: 'Still needed', value: gap.remaining === 0 ? 'Already in' : `${gap.remaining} more ${gap.noun}${gap.remaining === 1 ? '' : 's'}` },
  ];
}

function compileParticipantBrief({ standing, moments = [], location, userName } = {}) {
  const cycles = standing?.cycles || standing?.user_stats_by_cycle || [];
  const cycle = pickPrimaryCycle(cycles);
  const gap = findNearestGap(cycle?.progress_to_qualify);
  const moment = moments[0] || null;
  const share = buildShareDraft({
    moment,
    userName,
    cycleName: cycle?.cycle_name,
    location,
  });

  const place = moment?.name || moment?.title;
  const nextMove = {
    kind: gap.kind,
    title: place && gap.kind === 'check_in'
      ? `Check in at ${place}`
      : place && gap.kind === 'join_moment'
        ? `Join ${place}`
        : gap.title,
    why: gap.why,
    href: gap.kind === 'check_in' && moment?.id
      ? `/moments/${moment.id}/checkin`
      : moment?.id
        ? `/moments/${moment.id}`
        : share.href,
    momentId: moment?.id || null,
    momentName: place || null,
    ctaLabel: place && gap.kind === 'check_in'
      ? `Check in at ${place}`
      : place && gap.kind === 'join_moment'
        ? `I'm going to ${place}`
        : gap.kind === 'invite'
          ? 'Invite one friend who will go'
          : place
            ? `Send ${place} to a friend`
            : 'Find a night worth joining',
  };

  return {
    role: ROLES.PARTICIPANT,
    headline: cycle?.eligible
      ? `You're already in this week's pot.`
      : gap.remaining === 1
        ? `You are one ${gap.noun} short of this week’s pot.`
        : `You are ${gap.remaining} ${gap.noun}s short of this week’s pot.`,
    summary: cycle
      ? 'Show up. Check in. That ticket can count today, this week, and for the big pot. Nobody is owed a prize.'
      : 'Show up anyway. When a pot opens, nights you already proved still count.',
    stage: cycle?.eligible ? 'grow' : 'notice',
    theyGet: cycle?.eligible
      ? "You're in this week's pot. Standing gets stronger when someone you brought checks in."
      : place
        ? `A ticket from ${place} — today, this week, and the grand pot.`
        : 'A ticket from one real night.',
    promorangGets: 'Verified demand it can attach to a capped pot — not a click.',
    unlock: cycle?.eligible
      ? 'Bring one person tonight and your standing gets stronger without chasing a payout.'
      : place
        ? `Go to ${place}. Check in at the door. That is the whole move.`
        : 'One real night is the unlock. Not a share, not a click.',
    proof: 'A check-in or approved proof. RSVPs and views do not count.',
    nextMove,
    share,
    checkIn: {
      needed: gap.kind === 'check_in' || Boolean(moment),
      copy: moment
        ? `If you go to ${moment.name || moment.title}, check in so the ticket counts for today, this week, and the grand pot.`
        : 'When you go, check in. That is what turns a night out into a ticket.',
    },
    cycle: cycle ? {
      id: cycle.cycle_id || cycle.id,
      name: cycle.cycle_name,
      type: cycle.cycle_type,
      eligible: Boolean(cycle.eligible),
      status: cycle.status || 'not_qualified',
      tickets: cycle.total_entries || 0,
      weight: cycle.weight || 0,
    } : null,
    receiptLines: receiptLinesFromCycle(cycle, gap),
    trail: [
      { label: 'Tonight', title: nextMove.title, text: nextMove.why },
      { label: 'Prove it', title: 'Check in at the door', text: 'The ticket is the receipt, not the night.' },
      { label: 'Tell one person', title: 'Send the draft, do not blast', text: share.caption },
      { label: 'The pot', title: cycle?.eligible ? 'You are already in' : 'Get in this week', text: 'Daily, weekly, and grand can share one verified move.' },
    ],
    boundaries: BOUNDARIES,
  };
}

function compileHostBrief({ standing, moments = [], location } = {}) {
  const hosted = moments.slice(0, 3);
  const liveCount = hosted.length;
  return {
    role: ROLES.HOST,
    headline: liveCount
      ? `${liveCount} of your Moments can mint tickets if people check in.`
      : 'Your room mints tickets only when guests prove they showed up.',
    summary: 'PromoShare is not extra marketing. It is whether your night produces verified joins, proofs, and return visits.',
    nextMove: {
      kind: 'nudge_check_in',
      title: 'Ask the door list to check in',
      why: 'RSVPs do not count. Check-ins do. One sentence at the door is the move.',
      href: hosted[0]?.id ? `/moments/${hosted[0].id}` : '/hosting',
      momentId: hosted[0]?.id || null,
      ctaLabel: hosted[0]?.name || hosted[0]?.title
        ? `Open ${hosted[0].name || hosted[0].title}`
        : 'Open tonight’s Moment',
    },
    unlock: 'When they check in, your room starts filling a live pot. Interest does not.',
    proof: 'Door check-in or a photo. Not a view count.',
    moments: hosted.map((moment) => ({
      id: moment.id,
      name: moment.name || moment.title,
      location: moment.location || location,
      note: 'Tickets mint on verified check-in, not on interest.',
    })),
    receiptLines: [
      { label: 'Moments that can count', value: String(liveCount), strong: true },
      { label: 'What counts', value: 'Check-in, proof, repeat visit' },
      { label: 'What does not', value: 'Views, RSVPs, unshared links' },
    ],
    trail: [
      { label: 'Door', title: 'Ask them to check in', text: 'One sentence at the door beats a recap post.' },
      { label: 'Proof', title: 'Keep the requirement human', text: 'QR or a photo. Do not invent extra tasks.' },
      { label: 'Repeat', title: 'Same room, next week', text: 'Repeat visits raise weight more honestly than one viral night.' },
    ],
    standingNote: standing?.cycles?.length
      ? 'Your guests already have live pots they can enter from this room.'
      : 'No live pot is attached, but verified nights still become receipts.',
    boundaries: BOUNDARIES,
  };
}

function compileCreatorBrief({ moments = [], standing } = {}) {
  const drop = moments[0] || null;
  return {
    role: ROLES.CREATOR,
    headline: drop
      ? `${drop.name || drop.title} is the piece that can convert into tickets.`
      : 'Residuals come from verified joins, not from the view count.',
    summary: 'Share the thing people will actually do. PromoShare residuals attach to check-ins, unlocks, and referred guests.',
    nextMove: {
      kind: 'share_converting',
      title: drop ? `Share ${drop.name || drop.title}` : 'Share one converting drop',
      why: 'One attributable link. One ask. The rest is noise.',
      href: drop?.id ? `/moments/${drop.id}` : '/content-drops',
      momentId: drop?.id || null,
      ctaLabel: drop ? `Send ${drop.name || drop.title}` : 'Pick one drop to send',
    },
    unlock: 'Residuals attach when someone actually joins, checks in, or unlocks — not when they watch.',
    proof: 'A verified join or unlock on your link.',
    share: buildShareDraft({ moment: drop, userName: 'I' }),
    receiptLines: [
      { label: 'What pays', value: 'Verified joins and unlocks', strong: true },
      { label: 'What does not', value: 'Impressions and empty shares' },
      { label: 'Your tickets', value: String(pickPrimaryCycle(standing?.cycles || [])?.total_entries || 0) },
    ],
    trail: [
      { label: 'Pick', title: 'The converting piece', text: 'If it does not get someone in a room or through a drop, it is vanity.' },
      { label: 'Share', title: 'One link, one person', text: 'Draft it. You still hit send.' },
      { label: 'Receipt', title: 'Watch who actually moved', text: 'That is the residual. Not the like count.' },
    ],
    boundaries: BOUNDARIES,
  };
}

function compileSponsorBrief({ outcome, pools = [], location, budgetGems, targetCount } = {}) {
  const draft = compilePoolDraftFromOutcome(outcome || '40 verified visits', {
    location,
    budgetGems,
    targetCount,
  });
  const livePools = (pools || []).filter((pool) => pool.status === 'active');
  const underfilled = livePools.filter((pool) => (pool.metrics?.qualified_users || 0) < 10);

  return {
    role: ROLES.SPONSOR,
    headline: `Fund ${draft.outcome.targetCount} verified ${draft.outcome.outcomeKind.replace(/_/g, ' ')} — not exposure.`,
    summary: 'You name the outcome and the Gem cap. Promorang writes the pool rules. Nothing spends until you confirm.',
    nextMove: {
      kind: 'review_draft_pool',
      title: 'Review the drafted pot',
      why: 'Liability is capped. Proof is required. Clicks are excluded on purpose.',
      href: '/sponsor-dashboard',
      ctaLabel: 'Review this pot',
    },
    unlock: `You pay for ${draft.outcome.targetCount} real actions, capped at ${draft.funding.requested_gems} Gems. Views are free and worthless here.`,
    proof: 'Verified visits, check-ins, or approved proof. Clicks never count.',
    poolDraft: draft,
    estimate: estimateLiability(draft.funding.requested_gems, draft.outcome.targetCount),
    livePools: livePools.map((pool) => ({
      id: pool.id,
      name: pool.cycle_name,
      qualified: pool.metrics?.qualified_users || 0,
      prize: pool.sponsor_config?.prize_pool || 0,
      status: pool.status,
    })),
    alerts: underfilled.map((pool) => `${pool.cycle_name} has only ${pool.metrics?.qualified_users || 0} qualified people.`),
    receiptLines: [
      { label: 'Outcome', value: `${draft.outcome.targetCount} verified actions`, strong: true },
      { label: 'Gem cap', value: `${draft.funding.requested_gems} Gems` },
      { label: 'Prize pot', value: `${draft.funding.prize_pool_gems} Gems` },
      { label: 'Platform cut', value: `${draft.funding.platform_fee_percent}%` },
      { label: 'Winner cap', value: String(draft.caps.max_winners) },
      { label: 'Live pots', value: String(livePools.length) },
    ],
    trail: [
      { label: 'Name it', title: 'The outcome, not the ad', text: draft.outcome.statement },
      { label: 'Cap it', title: 'Gems already set aside', text: `${draft.funding.requested_gems} Gems is the ceiling.` },
      { label: 'Prove it', title: 'Check-ins and proof only', text: 'PromoPush clicks never mint tickets.' },
      { label: 'Read it', title: 'A report, not a vibe', text: 'Qualified people, pending proof, held accounts.' },
    ],
    boundaries: BOUNDARIES,
  };
}

function compileStewardBrief({ pools = [], moments = [], location } = {}) {
  const live = pools.filter((pool) => pool.status === 'active');
  const empty = live.filter((pool) => (pool.metrics?.qualified_users || 0) < 5);
  const unfundedActivity = moments.length > 0 && live.length === 0;

  return {
    role: ROLES.STEWARD,
    headline: empty.length
      ? `${empty.length} live pot${empty.length === 1 ? '' : 's'} in ${location || 'this hub'} need a sponsor.`
      : unfundedActivity
        ? `${location || 'This hub'} has nights worth joining and no funded pot.`
        : `${location || 'This hub'} is quiet. Keep the catalog honest.`,
    summary: 'Steward work is matching live culture to a capped pot — not inventing events or quietly boosting friends.',
    nextMove: {
      kind: 'pitch_merchant',
      title: empty.length || unfundedActivity ? 'Pitch one merchant a capped weekend pot' : 'Keep this week’s Moments dated and local',
      why: 'A funded pot on a real night beats a platform boost.',
      href: empty.length || unfundedActivity ? '/sponsor-dashboard' : '/discover',
      ctaLabel: empty.length || unfundedActivity ? 'Pitch one merchant' : 'Open this week’s nights',
    },
    unlock: 'A dated night plus a capped pot is how a hub feels alive.',
    proof: 'Dated Moments with a source. Do not invent calendars.',
    emptyPools: empty.map((pool) => ({
      id: pool.id,
      name: pool.cycle_name,
      qualified: pool.metrics?.qualified_users || 0,
    })),
    moments: moments.slice(0, 4).map((moment) => ({
      id: moment.id,
      name: moment.name || moment.title,
      location: moment.location,
    })),
    receiptLines: [
      { label: 'Hub', value: location || 'Unspecified', strong: true },
      { label: 'Live pots', value: String(live.length) },
      { label: 'Thin pots', value: String(empty.length) },
      { label: 'Dated nights', value: String(moments.length) },
    ],
    boundaries: BOUNDARIES,
  };
}

function compileAdminBrief({ pools = [], cycles = [] } = {}) {
  const live = (cycles.length ? cycles : pools).filter((item) => item.status === 'active' || item.cycle_type);
  return {
    role: ROLES.ADMIN,
    headline: 'PromoShare stays solvent when platform boosts stay rare.',
    summary: 'Simulate, review fraud holds, and recommend a small platform pot only when a hub is live and unfunded.',
    nextMove: {
      kind: 'review_audit',
      title: 'Open the cycle audit, do not rerun a live draw',
      why: 'Draws are deterministic. You may queue a review. You never silently re-roll.',
      href: '/admin/promoshare',
      ctaLabel: 'Open the audit',
    },
    unlock: 'Trust holds when winners can be explained and pots stay capped.',
    proof: 'An audit row for every draw. No silent reruns.',
    receiptLines: [
      { label: 'Live cycles', value: String(live.length), strong: true },
      { label: 'Operator power', value: 'Recommend only' },
      { label: 'Forbidden', value: 'Silent reruns, invented tickets' },
    ],
    boundaries: [
      ...BOUNDARIES,
      'Admins may simulate. Executing a live draw is a separate, audited action.',
    ],
  };
}

function compileBrief(role, input = {}) {
  switch (role) {
    case ROLES.HOST:
      return compileHostBrief(input);
    case ROLES.CREATOR:
      return compileCreatorBrief(input);
    case ROLES.SPONSOR:
      return compileSponsorBrief(input);
    case ROLES.STEWARD:
      return compileStewardBrief(input);
    case ROLES.ADMIN:
      return compileAdminBrief(input);
    default:
      return compileParticipantBrief(input);
  }
}

const PROVED_ACTIONS = new Set(['check_in', 'complete', 'proof', 'verified']);
const JOIN_ACTIONS = new Set(['join', 'rsvp', 'going']);
const GROW_ACTIONS = new Set(['invite', 'share']);

function normalizeLastAction(lastAction) {
  return String(lastAction || '').toLowerCase().trim();
}

function momentTitle(moment, fallback) {
  return moment?.name || moment?.title || fallback || null;
}

function resolveHandoffStage(lastAction, gap, eligible) {
  const action = normalizeLastAction(lastAction);
  if (GROW_ACTIONS.has(action)) return 'return';
  if (PROVED_ACTIONS.has(action)) return eligible || gap.key === 'qualified' ? 'grow' : 'unlock';
  if (JOIN_ACTIONS.has(action)) return 'move';
  return eligible || gap.key === 'qualified' ? 'grow' : 'notice';
}

function compileHandoffBrief({
  standing,
  moments = [],
  lastAction,
  momentName,
  momentId,
  location,
  userName,
} = {}) {
  const cycles = standing?.cycles || standing?.user_stats_by_cycle || [];
  const cycle = pickPrimaryCycle(cycles);
  const gap = findNearestGap(cycle?.progress_to_qualify);
  const eligible = Boolean(cycle?.eligible) || gap.key === 'qualified';
  const action = normalizeLastAction(lastAction);
  const stage = resolveHandoffStage(action, gap, eligible);
  const justProved = PROVED_ACTIONS.has(action);
  const justJoined = JOIN_ACTIONS.has(action);

  const thisMoment = (moments || []).find((item) => item.id === momentId) || null;
  const place = momentName || momentTitle(thisMoment) || 'this Moment';
  const otherMoments = (moments || []).filter((item) => item.id !== momentId);
  const nextPlace = otherMoments[0] || null;
  const share = buildShareDraft({
    moment: thisMoment || { id: momentId, name: place, title: place },
    userName,
    cycleName: cycle?.cycle_name,
    location,
  });

  let nextMove;
  if (justJoined) {
    nextMove = {
      kind: 'check_in',
      title: `Check in at ${place}`,
      why: 'Joining held your place. The ticket mints when you check in at the door.',
      href: momentId ? `/moments/${momentId}/checkin` : '/discover',
      momentId: momentId || null,
      momentName: place,
      ctaLabel: `Check in at ${place}`,
    };
  } else if (justProved) {
    if (eligible || gap.key === 'qualified' || gap.key === 'referrals') {
      nextMove = {
        kind: 'invite',
        title: `Bring one person to ${place}`,
        why: eligible || gap.key === 'qualified'
          ? "You're already in this week's pot. A friend who actually shows makes the night stronger."
          : gap.why,
        href: share.href,
        momentId: momentId || null,
        momentName: place,
        ctaLabel: 'Invite one friend who will go',
      };
    } else if (gap.key === 'moments') {
      const joinName = momentTitle(nextPlace, 'another night this week');
      nextMove = {
        kind: 'join_moment',
        title: nextPlace ? `Join ${joinName}` : 'Join another night this week',
        why: 'That visit counted. A distinct Moment is still missing from this cycle.',
        href: nextPlace?.id ? `/moments/${nextPlace.id}` : '/discover',
        momentId: nextPlace?.id || null,
        momentName: nextPlace ? joinName : null,
        ctaLabel: nextPlace ? `I'm going to ${joinName}` : 'Find another night',
      };
    } else {
      const goName = momentTitle(nextPlace);
      nextMove = nextPlace
        ? {
            kind: 'join_moment',
            title: `Go to ${goName}`,
            why: 'That visit counted. One more night closes the nearest gap.',
            href: `/moments/${nextPlace.id}`,
            momentId: nextPlace.id,
            momentName: goName,
            ctaLabel: `I'm going to ${goName}`,
          }
        : {
            kind: 'invite',
            title: 'Bring one person who will actually go',
            why: 'That visit counted. A friend who checks in closes the nearest gap.',
            href: share.href,
            momentId: momentId || null,
            momentName: place,
            ctaLabel: 'Invite one friend who will go',
          };
    }
  } else {
    nextMove = compileParticipantBrief({ standing, moments, location, userName }).nextMove;
  }

  if (justProved && nextMove.href === `/moments/${momentId}/checkin`) {
    nextMove = {
      ...nextMove,
      kind: 'invite',
      title: `Bring one person to ${place}`,
      href: share.href,
      ctaLabel: 'Invite one friend who will go',
    };
  }

  const theyGet = justProved
    ? `A ticket from ${place}. It can count today, this week, and for the grand pot.`
    : justJoined
      ? `A held place at ${place}. The ticket comes when you check in.`
      : eligible
        ? "You're in this week's pot. Standing gets stronger when someone you brought checks in."
        : gap.remaining
          ? `The next ${gap.noun} that closes this week's gap.`
          : 'A ticket from one real night.';

  const promorangGets = justProved
    ? 'A verified visit it can fund, match to a pot, and ask someone to repeat.'
    : justJoined
      ? 'Intent it can turn into a real night — only if they check in.'
      : 'Verified demand it can attach to a capped pot — not a click.';

  const headline = justProved
    ? `It counted at ${place}.`
    : justJoined
      ? `You're going to ${place}.`
      : eligible
        ? "You're already in this week's pot."
        : gap.remaining === 1
          ? `You are one ${gap.noun} short of this week’s pot.`
          : `You are ${gap.remaining} ${gap.noun}s short of this week’s pot.`;

  return {
    role: ROLES.PARTICIPANT,
    stage,
    headline,
    summary: justProved
      ? 'That visit is a ticket. Nobody is owed a prize. Here is the next move that helps both of you.'
      : 'Show up. Check in. That ticket can count today, this week, and for the big pot. Nobody is owed a prize.',
    theyGet,
    promorangGets,
    unlock: justProved
      ? (eligible ? 'Bring one person tonight. You are already in.' : nextMove.why)
      : justJoined
        ? `Check in at ${place}. That is the whole next move.`
        : eligible
          ? 'Bring one person tonight and your standing gets stronger without chasing a payout.'
          : `Go. Check in. That is the unlock.`,
    proof: 'A check-in or approved proof. RSVPs and views do not count.',
    nextMove,
    share,
    checkIn: {
      needed: nextMove.kind === 'check_in',
      copy: justProved
        ? 'You already proved this night. Do not check in here again.'
        : `If you go to ${place}, check in so the ticket counts.`,
    },
    cycle: cycle ? {
      id: cycle.cycle_id || cycle.id,
      name: cycle.cycle_name,
      type: cycle.cycle_type,
      eligible: Boolean(cycle.eligible),
      status: cycle.status || 'not_qualified',
      tickets: cycle.total_entries || 0,
      weight: cycle.weight || 0,
    } : null,
    receiptLines: [
      { label: 'It counted', value: justProved ? place : 'Not yet', strong: true },
      ...receiptLinesFromCycle(cycle, gap),
      { label: 'You get', value: theyGet },
      { label: 'Promorang gets', value: promorangGets },
    ],
    trail: [
      { label: 'Notice', title: place, text: 'A night worth going to.' },
      { label: 'Move', title: justJoined || justProved ? 'You showed up' : 'Go', text: justProved ? `You were at ${place}.` : 'Hold the place, then arrive.' },
      { label: 'Prove', title: justProved ? 'It counted' : 'Check in at the door', text: 'The ticket is the receipt, not the night.' },
      { label: 'Unlock', title: eligible ? 'You are in the pot' : gap.title, text: theyGet },
      { label: 'Grow', title: nextMove.title, text: nextMove.why },
      { label: 'Return', title: 'Same room, next week', text: 'Come back. Repeat visits count more honestly than one blast.' },
    ],
    lastAction: action || null,
    momentId: momentId || null,
    momentName: place,
    boundaries: BOUNDARIES,
  };
}

module.exports = {
  ROLES,
  BOUNDARIES,
  resolvePromoShareRole,
  findNearestGap,
  pickPrimaryCycle,
  buildShareDraft,
  parseOutcomeStatement,
  compilePoolDraftFromOutcome,
  estimateLiability,
  compileParticipantBrief,
  compileHostBrief,
  compileCreatorBrief,
  compileSponsorBrief,
  compileStewardBrief,
  compileAdminBrief,
  compileBrief,
  compileHandoffBrief,
  resolveHandoffStage,
};
