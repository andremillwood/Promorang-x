/**
 * Server-trusted world-layer presentation.
 * Mirrors packages/shared/src/world-layer.ts — keep fixtures aligned.
 */

const KINGSTON_AFTER_DARK_SLICE = {
  sceneSlug: 'kingston-after-dark',
  sceneTitle: 'Kingston After Dark',
  seasonKey: 'the-city-wakes',
  seasonTitle: 'The City Wakes',
  area: 'Barbican',
  collectionKey: 'first-current',
  collectionTitle: 'First Current',
  runSlug: 'barbican-run',
  runTitle: 'Barbican Run',
  header: 'Tonight in Kingston',
  currentLine: 'The Current is moving through Barbican.',
  signalEyebrow: 'A Signal appeared',
  welcome: 'Find a night worth leaving home for. PromoCard is the passport that carries what comes back.',
  objectives: [
    { key: 'attend_moment', title: 'Show up at one participating Moment', proof: 'Verified check-in or accepted proof', actionTypes: ['MOMENT_ATTENDANCE', 'check_in', 'moment_join_verified', 'proof_verified'] },
    { key: 'support_place', title: 'Support one participating Place', proof: 'Verified visit, purchase, or perk use', actionTypes: ['MERCHANT_VISIT', 'PURCHASE', 'PERK_REDEMPTION', 'coupon_redeemed', 'order_paid', 'split_tender'] },
    { key: 'bring_newcomer', title: 'Bring one newcomer', proof: 'Activated referral or attributed Scene join', actionTypes: ['FRIEND_INVITE', 'REFERRAL', 'referral_activated'] },
    { key: 'keep_memory', title: 'Retain one Memory', proof: 'A Memory issued from verified participation', actionTypes: ['MOMENT_ATTENDANCE', 'proof_verified'] },
  ],
};

const SHOW_UP_ACTION_TYPES = ['MOMENT_ATTENDANCE', 'check_in', 'moment_join_verified', 'proof_verified'];

const ACTION_TO_PATH_DIMENSION = {
  DISCOVERY_RESPONSE: 'discover',
  discovery_vote: 'discover',
  FRIEND_INVITE: 'connect',
  REFERRAL: 'connect',
  referral_activated: 'connect',
  CONTENT_POST: 'create',
  share_completed: 'create',
  MOMENT_RSVP: 'host',
  CUSTOM: 'host',
  MOMENT_ATTENDANCE: 'keep',
  check_in: 'keep',
  moment_join_verified: 'keep',
  proof_verified: 'keep',
  PERK_CLAIM: 'support',
  PERK_REDEMPTION: 'support',
  PURCHASE: 'support',
  MERCHANT_VISIT: 'support',
  deal_claimed: 'support',
  coupon_redeemed: 'support',
  order_paid: 'support',
  split_tender: 'support',
};

const PATH_TITLES = {
  discover: 'Scout',
  connect: 'Connector',
  create: 'Creator',
  host: 'Host',
  keep: 'Keeper',
  support: 'Patron',
};

const PATH_EVIDENCE_THRESHOLD = 3;
const WORLD_LAW_FOOTER = 'What you put into the Scene changed what came back.';

function mapActionToPathDimension(actionType) {
  if (!actionType) return null;
  if (ACTION_TO_PATH_DIMENSION[actionType]) return ACTION_TO_PATH_DIMENSION[actionType];
  if (String(actionType).startsWith('organic_')) return 'create';
  return null;
}

function resolvePathEvidence(actions) {
  const counts = { discover: 0, connect: 0, create: 0, host: 0, keep: 0, support: 0 };
  for (const action of actions || []) {
    const dimension = mapActionToPathDimension(action.actionType || action.action_type);
    if (dimension) counts[dimension] += 1;
  }
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [topDimension, topCount] = ranked[0] || ['keep', 0];
  const forming = topCount >= PATH_EVIDENCE_THRESHOLD;
  return {
    counts,
    forming,
    title: forming ? PATH_TITLES[topDimension] : null,
    cue: forming ? `A path is forming · ${PATH_TITLES[topDimension]}` : null,
  };
}

function resolveCrewRunProgress(actions, slice = KINGSTON_AFTER_DARK_SLICE) {
  const types = new Set((actions || []).map((action) => String(action.actionType || action.action_type || '')));
  const keptMemory = (actions || []).some((action) => action.memoryKept || action.memory_kept);
  const objectives = slice.objectives.map((objective) => {
    const complete = objective.key === 'keep_memory'
      ? keptMemory
      : objective.actionTypes.some((type) => types.has(type));
    return { key: objective.key, title: objective.title, proof: objective.proof, complete };
  });
  return {
    completed: objectives.filter((item) => item.complete).length,
    total: objectives.length,
    objectives,
  };
}

function resolveWorldConsequence(facts = {}) {
  if (facts.pending && !facts.verified) {
    return {
      counted: false,
      heading: 'We received it',
      eyebrow: 'Waiting to count',
      lines: [
        { label: 'What happened', value: facts.momentTitle || 'You showed up' },
        ...(facts.placeName ? [{ label: 'Place', value: facts.placeName }] : []),
        { label: 'What counted', value: 'Proof is under review' },
        { label: 'What opened next', value: 'Recognition lands after it is accepted' },
      ],
      footer: 'Nothing is celebrated as complete until it is verified.',
      next: facts.nextHref ? { label: facts.nextLabel || 'See the Moment', href: facts.nextHref } : { label: 'Open Vault', href: '/vault' },
      kept: null,
    };
  }

  if (!facts.verified) {
    return {
      counted: false,
      heading: 'Not counted yet',
      eyebrow: 'Still in motion',
      lines: [{ label: 'What happened', value: 'This action has not been verified.' }],
      footer: 'Promorang only keeps what it can prove.',
      next: { label: 'Find a move', href: '/discover' },
      kept: null,
    };
  }

  const lines = [
    { label: 'What happened', value: facts.momentTitle ? `You showed up at ${facts.momentTitle}` : 'You showed up', strong: true },
  ];
  if (facts.placeName) lines.push({ label: 'Place', value: facts.placeName });
  if (facts.sceneTitle) lines.push({ label: 'Scene', value: facts.sceneTitle });
  if (facts.seasonTitle) lines.push({ label: 'Season', value: facts.seasonTitle });
  lines.push({ label: 'What counted', value: 'Verified presence' });
  if (facts.promoCardEligible) {
    lines.push({ label: 'What came back', value: facts.promoCardReturnLabel || 'PromoCard · eligible refill', strong: true });
  }
  if (facts.runTitle && facts.runTotal && facts.runCompleted != null) {
    lines.push({ label: 'Crew Run', value: `${facts.runTitle} · ${facts.runCompleted}/${facts.runTotal} objectives` });
  }
  if (facts.pathCue) lines.push({ label: 'Your path', value: facts.pathCue });
  if (facts.memoryKept && facts.memoryTitle) lines.push({ label: 'Kept', value: facts.memoryTitle, strong: true });
  else if (facts.rewardTitle) lines.push({ label: 'Kept', value: facts.rewardTitle });
  lines.push({
    label: 'What opened next',
    value: facts.nextLabel || (facts.memoryKept ? 'The memory is in your Vault' : 'Look for the next Signal'),
  });

  return {
    counted: true,
    heading: 'You showed up',
    eyebrow: 'It counted',
    lines,
    footer: WORLD_LAW_FOOTER,
    next: facts.nextHref
      ? { label: facts.nextLabel || 'See what opened', href: facts.nextHref }
      : { label: 'Open Vault', href: '/vault' },
    kept: facts.memoryKept && facts.memoryTitle
      ? { title: facts.memoryTitle, kind: 'memory' }
      : facts.rewardTitle
        ? { title: facts.rewardTitle, kind: 'perk' }
        : null,
  };
}

function resolveWorldCurrentMove(facts = {}, slice = KINGSTON_AFTER_DARK_SLICE) {
  const sceneTitle = facts.sceneTitle || (facts.sceneSlug === slice.sceneSlug ? slice.sceneTitle : null);
  const seasonTitle = facts.seasonTitle || (facts.sceneSlug === slice.sceneSlug || !facts.sceneSlug ? slice.seasonTitle : null);
  const context = [sceneTitle, facts.placeName, facts.promoCardAccepted ? 'PromoCard accepted' : null].filter(Boolean);

  if (facts.arrived && !facts.hasMemory) {
    return {
      eyebrow: 'What opened',
      header: slice.header,
      title: 'Keep what counted',
      why: 'Your presence is verified. The Memory and any PromoCard Return now live in Vault.',
      ctaLabel: 'Open Vault',
      href: '/vault',
      sceneTitle,
      seasonTitle,
      placeName: facts.placeName || null,
      context,
    };
  }
  if (facts.joined && facts.momentId) {
    return {
      eyebrow: 'Your move',
      header: slice.header,
      title: facts.momentTitle ? `Check in at ${facts.momentTitle}` : 'Check in when you arrive',
      why: facts.signalReason || 'Let the host know you made it so PromoCard and the Scene can record what counted.',
      ctaLabel: 'Check in',
      href: `/moments/${facts.momentId}/checkin`,
      sceneTitle,
      seasonTitle,
      placeName: facts.placeName || null,
      context,
    };
  }
  if (facts.hasLiveMoment && facts.momentId) {
    return {
      eyebrow: slice.signalEyebrow,
      header: slice.header,
      title: facts.momentTitle || 'Follow the Signal',
      why: facts.signalReason || `${slice.currentLine} One clear move is enough.`,
      ctaLabel: 'Follow Signal',
      href: `/moments/${facts.momentId}`,
      sceneTitle,
      seasonTitle,
      placeName: facts.placeName || null,
      context,
    };
  }
  if (facts.hasPerk) {
    return {
      eyebrow: 'Your move',
      header: slice.header,
      title: 'Use what is already on your PromoCard',
      why: 'A perk is waiting. The next Return starts by using it at a participating Place.',
      ctaLabel: 'Open PromoCard',
      href: '/card',
      sceneTitle,
      seasonTitle,
      placeName: facts.placeName || null,
      context,
    };
  }
  return {
    eyebrow: slice.signalEyebrow,
    header: slice.header,
    title: `Find a night in ${slice.sceneTitle}`,
    why: slice.welcome,
    ctaLabel: 'Discover',
    href: `/scenes/${slice.sceneSlug}`,
    sceneTitle: slice.sceneTitle,
    seasonTitle: slice.seasonTitle,
    placeName: slice.area,
    context: [slice.sceneTitle, slice.area],
  };
}

const WORLD_FACTIONS = {
  seekers: { key: 'seekers', title: 'Seekers', verb: 'discovery', line: 'Find what the Current has not named yet.' },
  weavers: { key: 'weavers', title: 'Weavers', verb: 'connection', line: 'Introduce people who should already know each other.' },
  makers: { key: 'makers', title: 'Makers', verb: 'creation', line: 'Make the night worth remembering.' },
  keepers: { key: 'keepers', title: 'Keepers', verb: 'memory', line: 'Keep what happened so the Scene does not forget.' },
  stewards: { key: 'stewards', title: 'Stewards', verb: 'sustainability', line: 'Keep the Places able to do this again.' },
};

const CREW_RUN_ROLES = {
  captain: { key: 'captain', title: 'Captain', job: 'Keep the Crew moving toward the Run.' },
  scout: { key: 'scout', title: 'Scout', job: 'Find the Signal and the room.' },
  chronicler: { key: 'chronicler', title: 'Chronicler', job: 'Keep proof of what counted.' },
  keeper: { key: 'keeper', title: 'Keeper', job: 'Hold the Memory and what came back.' },
};

const DIMENSION_TO_HEALTH = {
  discover: 'discovery',
  connect: 'connection',
  create: 'creation',
  host: 'creation',
  keep: 'memory',
  support: 'sustainability',
};

function resolveFaction(key) {
  return key && WORLD_FACTIONS[key] ? WORLD_FACTIONS[key] : null;
}

function resolveCrewRunRole(key) {
  return key && CREW_RUN_ROLES[key] ? CREW_RUN_ROLES[key] : null;
}

function resolveSceneHealth(actions) {
  const counts = { discovery: 0, connection: 0, creation: 0, memory: 0, sustainability: 0 };
  for (const action of actions || []) {
    const dimension = mapActionToPathDimension(action.actionType);
    if (dimension) counts[DIMENSION_TO_HEALTH[dimension]] += 1;
  }
  return Object.entries(counts).map(([dimension, count]) => ({
    dimension,
    label: dimension[0].toUpperCase() + dimension.slice(1),
    count,
  }));
}

function resolveSeasonDispatch(facts = {}, slice = KINGSTON_AFTER_DARK_SLICE) {
  const season = facts.seasonTitle || slice.seasonTitle;
  if (facts.hasLiveMoment) {
    return {
      eyebrow: season,
      line: facts.placeName
        ? `A Signal is up at ${facts.placeName}. Follow it before the room thins.`
        : 'A Signal is up. Follow it before the room thins.',
    };
  }
  return { eyebrow: season, line: slice.currentLine };
}

function timeAwareWorldHeader(now = new Date(), slice = KINGSTON_AFTER_DARK_SLICE) {
  const hour = now.getHours();
  if (hour >= 17 || hour < 4) return slice.header;
  if (hour < 12) return 'This morning in Kingston';
  return 'Today in Kingston';
}

const GUILD_CREW_MIN = 2;
const GUILD_CREW_MAX = 6;

function resolveGuildReadiness(crewCount) {
  const count = Math.max(0, Number(crewCount) || 0);
  const needsCrews = Math.max(0, GUILD_CREW_MIN - count);
  const forming = count < GUILD_CREW_MIN;
  const full = count >= GUILD_CREW_MAX;
  return {
    crewCount: count,
    min: GUILD_CREW_MIN,
    max: GUILD_CREW_MAX,
    needsCrews,
    forming,
    ready: !forming && !full,
    full,
    line: forming
      ? `Need ${needsCrews} more ${needsCrews === 1 ? 'Crew' : 'Crews'} before this is a Guild.`
      : full
        ? 'This Guild is full. Coordinate the Scene from here.'
        : `${count} Crews coordinating one Scene.`,
  };
}

const KINGSTON_AREAS = [
  { key: 'barbican', title: 'Barbican', corridor: 'First coherent test area', aliases: ['barbican'] },
  { key: 'red-hills', title: 'Red Hills Road', corridor: 'Participating corridor', aliases: ['red hills', 'red-hills', 'kingston 19'] },
  { key: 'new-kingston', title: 'New Kingston', corridor: 'After-hours corridor', aliases: ['new kingston'] },
];

function resolveArea(key) {
  return KINGSTON_AREAS.find((area) => area.key === key) || null;
}

function resolveAreaKey(text, explicitKey) {
  if (explicitKey && resolveArea(explicitKey)) return explicitKey;
  const hay = String(text || '').toLowerCase();
  if (!hay) return null;
  for (const area of KINGSTON_AREAS) {
    if (area.aliases.some((alias) => hay.includes(alias))) return area.key;
  }
  return null;
}

const TERRITORY_LINES = {
  unknown: (title) => `${title} has no proven standing yet.`,
  known: (title) => `${title} is known. Someone showed up or supported a Place.`,
  held: (title) => `${title} is held. Repeated verified presence is keeping it in the Current.`,
  stewarded: (title) => `${title} is stewarded. Presence and support are keeping the Places able to do this again.`,
};

function resolveTerritoryStanding({ areaKey, presenceCount = 0, supportCount = 0 } = {}) {
  const area = resolveArea(areaKey) || KINGSTON_AREAS[0];
  const presence = Math.max(0, Number(presenceCount) || 0);
  const support = Math.max(0, Number(supportCount) || 0);
  const total = presence + support;
  let state = 'unknown';
  if (total >= 5 && support >= 1) state = 'stewarded';
  else if (total >= 3) state = 'held';
  else if (total >= 1) state = 'known';
  return {
    key: area.key,
    title: area.title,
    corridor: area.corridor,
    state,
    standingLine: TERRITORY_LINES[state](area.title),
    presenceCount: presence,
    supportCount: support,
  };
}

function resolveKingstonTerritories(counts = {}) {
  return KINGSTON_AREAS.map((area) => resolveTerritoryStanding({
    areaKey: area.key,
    presenceCount: counts[area.key]?.presenceCount,
    supportCount: counts[area.key]?.supportCount,
  }));
}

function resolveCurrentStatic({ currentCount = 0, lastActionAt = null, now } = {}) {
  const count = Math.max(0, Number(currentCount) || 0);
  const at = (now || new Date()).getTime();
  const last = lastActionAt ? new Date(lastActionAt).getTime() : NaN;
  const stale = Number.isFinite(last) ? at - last > 7 * 24 * 60 * 60 * 1000 : count === 0;
  if (count <= 0 || stale) {
    return { polarity: 'static', currentCount: count, line: 'The Scene is Static. Nothing useful has moved recently.' };
  }
  if (count < 3) {
    return { polarity: 'thin', currentCount: count, line: 'The Current is thin. One more verified move can turn it.' };
  }
  return { polarity: 'current', currentCount: count, line: 'The Current is moving. Keep it from going still.' };
}

function resolveFactionContest({ factionCurrents = {}, unalignedCurrent = 0, mixedCrew = false } = {}) {
  const keys = Object.keys(WORLD_FACTIONS);
  const ranked = keys
    .map((key) => ({
      key,
      title: WORLD_FACTIONS[key].title,
      verb: WORLD_FACTIONS[key].verb,
      current: Math.max(0, Number(factionCurrents[key]) || 0),
    }))
    .sort((a, b) => b.current - a.current || a.key.localeCompare(b.key));

  let rank = 0;
  let previous = -1;
  const board = ranked.map((row, index) => {
    if (row.current !== previous) {
      rank = index + 1;
      previous = row.current;
    }
    return { ...row, rank };
  });

  const top = board[0];
  const tied = Boolean(top && top.current > 0 && board.filter((row) => row.current === top.current).length > 1);
  const leadingCurrent = top && top.current > 0 && !tied ? top.key : null;
  const unaligned = Math.max(0, Number(unalignedCurrent) || 0);
  const totalCurrent = board.reduce((sum, row) => sum + row.current, 0) + unaligned;

  let contestLine = 'No philosophy is moving the Scene yet. The war is Current versus Static.';
  if (leadingCurrent) {
    contestLine = `${WORLD_FACTIONS[leadingCurrent].title} lead ${WORLD_FACTIONS[leadingCurrent].verb}. The war is Current versus Static — not people versus people.`;
  } else if (tied && top) {
    const names = board.filter((row) => row.current === top.current).map((row) => row.title);
    contestLine = `${names.join(' and ')} are even. Mixed Crews usually move a Scene further than one banner.`;
  }

  return {
    board,
    leadingCurrent,
    contestLine,
    mixedCrewNote: mixedCrew
      ? 'This Crew holds more than one philosophy. That is valid, and usually stronger.'
      : null,
    totalCurrent,
    unalignedCurrent: unaligned,
  };
}

function consequenceFromCheckIn({ moment, memory, reward, verificationStatus, promoCardReturn, runProgress, pathCue, scene }) {
  const verified = verificationStatus === 'verified';
  const pending = verificationStatus === 'pending';
  return resolveWorldConsequence({
    verified,
    pending,
    momentTitle: moment?.title || null,
    placeName: moment?.venue_name || moment?.location || null,
    sceneTitle: scene?.title || (scene?.slug === KINGSTON_AFTER_DARK_SLICE.sceneSlug ? KINGSTON_AFTER_DARK_SLICE.sceneTitle : null),
    seasonTitle: scene?.metadata?.season_title || (scene?.slug === KINGSTON_AFTER_DARK_SLICE.sceneSlug ? KINGSTON_AFTER_DARK_SLICE.seasonTitle : null),
    promoCardEligible: Boolean(promoCardReturn?.eligible),
    promoCardReturnLabel: promoCardReturn?.label || null,
    runTitle: runProgress?.title || null,
    runCompleted: runProgress?.completed ?? null,
    runTotal: runProgress?.total ?? null,
    pathCue: pathCue || null,
    memoryKept: Boolean(memory?.id),
    memoryTitle: memory?.title || null,
    rewardTitle: reward?.title || null,
    nextLabel: memory?.id ? 'Open the memory' : 'Open Vault',
    nextHref: memory?.id ? `/vault?memory=${encodeURIComponent(memory.id)}` : '/vault',
  });
}

module.exports = {
  KINGSTON_AFTER_DARK_SLICE,
  PATH_EVIDENCE_THRESHOLD,
  SHOW_UP_ACTION_TYPES,
  WORLD_FACTIONS,
  CREW_RUN_ROLES,
  KINGSTON_AREAS,
  GUILD_CREW_MIN,
  GUILD_CREW_MAX,
  resolveWorldConsequence,
  resolveWorldCurrentMove,
  resolvePathEvidence,
  resolveCrewRunProgress,
  mapActionToPathDimension,
  timeAwareWorldHeader,
  consequenceFromCheckIn,
  resolveFaction,
  resolveCrewRunRole,
  resolveSceneHealth,
  resolveSeasonDispatch,
  resolveGuildReadiness,
  resolveArea,
  resolveAreaKey,
  resolveTerritoryStanding,
  resolveKingstonTerritories,
  resolveCurrentStatic,
  resolveFactionContest,
};
