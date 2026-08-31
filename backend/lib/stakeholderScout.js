const LIVE_PILOT_HUBS = new Set([
  'kingston',
  'montego-bay',
  'trinidad',
  'barbados',
  'bahamas',
  'guyana',
  'accra',
  'dominican-republic',
  'medellin',
  'bogota',
  'panama-city',
]);

const LIVE_HUBS = new Set(['kingston', 'montego-bay']);
const SHORTLIST_SCORE = 70;
const WATCH_SCORE = 45;
const QUEUE_CAP = 10;
const TOKEN = /[^a-z0-9]+/g;

const ALLOWED_TRANSITIONS = {
  sourced: ['scored', 'suppressed'],
  scored: ['scored', 'watch', 'queued', 'rejected', 'suppressed'],
  watch: ['scored', 'queued', 'rejected', 'suppressed'],
  queued: ['approved', 'rejected', 'watch', 'suppressed'],
  approved: ['invite_ready', 'rejected', 'suppressed'],
  invite_ready: ['sent_by_human', 'approved', 'rejected', 'suppressed'],
  sent_by_human: ['suppressed'],
  rejected: ['scored', 'watch', 'suppressed'],
  suppressed: ['scored'],
};

const FOUNDING_SCOUT_CATALOG = [
  { candidateKey: 'kingston-glorias-seafood', kind: 'venue', displayName: "Gloria's Seafood", hubId: 'kingston', citySlug: 'kingston', neighborhood: 'Port Royal', categoryClusters: ['dinner'], job: 'dinner stop with a verified check-in', sourceKind: 'founding_catalog', sourceName: 'Visit Jamaica', sourceUrl: 'https://www.visitjamaica.com/', website: 'https://www.gloriasseafood.com/' },
  { candidateKey: 'kingston-scotchies', kind: 'venue', displayName: 'Scotchies Kingston', hubId: 'kingston', citySlug: 'kingston', neighborhood: 'Half Way Tree', categoryClusters: ['dinner'], job: 'jerk dinner stop', sourceKind: 'founding_catalog', sourceName: 'Visit Jamaica', sourceUrl: 'https://www.visitjamaica.com/' },
  { candidateKey: 'kingston-devon-house-ice-cream', kind: 'merchant', displayName: 'Devon House I-Scream', hubId: 'kingston', citySlug: 'kingston', neighborhood: 'Devon House', categoryClusters: ['dessert'], job: 'dessert stop', sourceKind: 'founding_catalog', sourceName: 'Devon House', sourceUrl: 'https://devonhousejamaica.com/', website: 'https://devonhousejamaica.com/' },
  { candidateKey: 'kingston-cannonball-cafe', kind: 'merchant', displayName: 'Cannonball Cafe', hubId: 'kingston', citySlug: 'kingston', neighborhood: 'New Kingston', categoryClusters: ['breakfast', 'dessert'], job: 'coffee or dessert stop', sourceKind: 'founding_catalog', sourceName: 'Kingston Creative', sourceUrl: 'https://kingstoncreative.org/' },
  { candidateKey: 'kingston-tracks-and-records', kind: 'venue', displayName: 'Tracks & Records Kingston', hubId: 'kingston', citySlug: 'kingston', neighborhood: 'New Kingston', categoryClusters: ['dinner', 'music'], job: 'music-and-dinner room', sourceKind: 'founding_catalog', sourceName: 'Visit Jamaica', sourceUrl: 'https://www.visitjamaica.com/' },
  { candidateKey: 'kingston-craft-market', kind: 'merchant', displayName: 'Kingston Craft Market', hubId: 'kingston', citySlug: 'kingston', neighborhood: 'Downtown', categoryClusters: ['retail', 'craft'], job: 'maker stall people can visit and prove', sourceKind: 'founding_catalog', sourceName: 'Visit Jamaica', sourceUrl: 'https://www.visitjamaica.com/' },
  { candidateKey: 'kingston-bookophilia', kind: 'merchant', displayName: 'Bookophilia', hubId: 'kingston', citySlug: 'kingston', neighborhood: 'Liguanea', categoryClusters: ['retail'], job: 'independent shop stop', sourceKind: 'founding_catalog', sourceName: 'Kingston Creative', sourceUrl: 'https://kingstoncreative.org/' },
  { candidateKey: 'kingston-red-stripe', kind: 'brand', displayName: 'Red Stripe', hubId: 'kingston', citySlug: 'kingston', neighborhood: 'Spanish Town Road', categoryClusters: ['beverage', 'music'], job: 'fund one verified beverage action', sourceKind: 'founding_catalog', sourceName: 'Red Stripe', sourceUrl: 'https://www.redstripebeer.com/', website: 'https://www.redstripebeer.com/' },
  { candidateKey: 'kingston-grace-foods', kind: 'brand', displayName: 'Grace Foods', hubId: 'kingston', citySlug: 'kingston', categoryClusters: ['grocery', 'dinner'], job: 'fund a grocery or cooking Moment people can prove', sourceKind: 'founding_catalog', sourceName: 'Grace Foods', sourceUrl: 'https://www.gracefoods.com/', website: 'https://www.gracefoods.com/' },
  { candidateKey: 'kingston-walkerswood-jerk', kind: 'product', displayName: 'Walkerswood Jerk Seasoning', hubId: 'kingston', citySlug: 'kingston', categoryClusters: ['dinner', 'grocery'], job: 'product sample tied to a jerk dinner stop', sourceKind: 'founding_catalog', sourceName: 'Walkerswood', sourceUrl: 'https://www.walkerswood.com/', website: 'https://www.walkerswood.com/' },
  { candidateKey: 'kingston-ting', kind: 'product', displayName: 'Ting', hubId: 'kingston', citySlug: 'kingston', categoryClusters: ['beverage'], job: 'beverage sample at a verified check-in', sourceKind: 'founding_catalog', sourceName: 'Ting', sourceUrl: 'https://www.ting.com/' },
  { candidateKey: 'montego-bay-miss-ts', kind: 'venue', displayName: "Miss T's Kitchen", hubId: 'montego-bay', citySlug: 'montego-bay', neighborhood: 'Orange Street', categoryClusters: ['dinner'], job: 'dinner stop with a verified check-in', sourceKind: 'founding_catalog', sourceName: 'Visit Jamaica', sourceUrl: 'https://www.visitjamaica.com/' },
];

function tokens(...values) {
  return new Set(values.flatMap((value) => String(value || '').toLowerCase().split(TOKEN)).filter((value) => value.length > 2));
}

function isLiveOrPilotHub(hubId) {
  return LIVE_PILOT_HUBS.has(hubId);
}

function preferredChannel(candidate) {
  return candidate.kind === 'brand' || candidate.kind === 'product' ? 'steward_intro' : 'walk_in';
}

function clusterOverlap(candidate, moment) {
  const momentClusters = new Set(moment?.clusters || []);
  if (!momentClusters.size && moment?.category) {
    const category = String(moment.category).toLowerCase();
    ['dinner', 'dessert', 'breakfast', 'music', 'nightlife', 'retail', 'grocery', 'beverage', 'craft', 'wellness'].forEach((cluster) => {
      if (category.includes(cluster)) momentClusters.add(cluster);
    });
    if (/(food|dining|restaurant|rum|festival)/.test(category)) {
      momentClusters.add('dinner');
      momentClusters.add('beverage');
    }
    if (/(music|concert|fete|reggae)/.test(category)) momentClusters.add('music');
  }
  const titleTokens = tokens(moment?.title);
  return (candidate.categoryClusters || []).filter((cluster) => momentClusters.has(cluster) || titleTokens.has(cluster));
}

function withinLeadWindow(startsAt, asOf) {
  const start = new Date(startsAt).getTime();
  const now = asOf.getTime();
  return start >= now - 12 * 60 * 60 * 1000 && start <= now + 90 * 24 * 60 * 60 * 1000;
}

function getIsoWeekStart(asOf) {
  const date = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()));
  const weekday = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - (weekday === 0 ? 6 : weekday - 1));
  return date.toISOString().slice(0, 10);
}

function scoreStakeholderCandidate(candidate, moment, asOf = new Date()) {
  const reasons = [];
  const blockers = [];
  const breakdown = { hubFit: 0, momentFit: 0, categoryCluster: 0, evidence: 0, claimability: 0, specificity: 0 };

  if (!isLiveOrPilotHub(candidate.hubId)) {
    blockers.push('Hub is not live or pilot — do not recruit there yet');
  } else if (LIVE_HUBS.has(candidate.hubId)) {
    breakdown.hubFit = 25;
    reasons.push(`Fits the live ${candidate.hubId} hub`);
  } else {
    breakdown.hubFit = 18;
    reasons.push(`Fits the ${candidate.hubId} pilot`);
  }

  if (!String(candidate.displayName || '').trim()) blockers.push('Missing a real place, brand, or product name');
  if (candidate.suppressed || candidate.doNotContact) blockers.push('On the do-not-contact list');
  if (candidate.alreadyClaimed) blockers.push('Page already claimed — use the existing owner relationship');

  if (!moment) {
    blockers.push('No dated Moment to invite them into');
  } else if (moment.hubId && moment.hubId !== candidate.hubId && moment.hubId !== candidate.citySlug) {
    blockers.push('Moment belongs to a different hub');
  } else if (!withinLeadWindow(moment.startsAt, asOf)) {
    blockers.push('Moment sits outside the 90-day planning window');
  } else {
    const days = (new Date(moment.startsAt).getTime() - asOf.getTime()) / 86400000;
    breakdown.momentFit = days >= 0 && days <= 14 ? 30 : 22;
    reasons.push(`Can take a job on ${moment.title}`);
  }

  const overlap = clusterOverlap(candidate, moment);
  if (overlap.length) {
    breakdown.categoryCluster = Math.min(15, 9 + overlap.length * 3);
    reasons.push(`Matches the ${overlap.slice(0, 2).join(' / ')} cluster`);
  } else if ((candidate.categoryClusters || []).length) {
    breakdown.categoryCluster = 6;
  }

  if (candidate.sourceName && candidate.sourceUrl) {
    breakdown.evidence = 15;
    reasons.push(`Public source: ${candidate.sourceName}`);
  } else if (candidate.sourceName || candidate.website) {
    breakdown.evidence = 8;
    reasons.push('Has a public name or website to verify');
  } else {
    blockers.push('No public source to verify before a steward visit');
  }

  if (['venue', 'merchant', 'brand'].includes(candidate.kind)) {
    breakdown.claimability = candidate.alreadyClaimed ? 4 : 10;
    if (!candidate.alreadyClaimed) reasons.push('Can seed a claimable page for the owner');
  } else {
    breakdown.claimability = 6;
    reasons.push('Product should attach to a place or brand page');
  }

  if (candidate.job && String(candidate.job).trim().length >= 8) {
    breakdown.specificity = 5;
    reasons.push(`Concrete job: ${candidate.job}`);
  } else {
    blockers.push('Needs a concrete Moment job before anyone is contacted');
  }

  const total = Math.max(0, Math.min(100, Object.values(breakdown).reduce((sum, value) => sum + value, 0)));
  const fatal = blockers.some((item) => /do-not-contact|not live or pilot|already claimed|different hub|outside the 90-day|Missing a real/i.test(item));
  const ready = !fatal && Boolean(moment) && Boolean(String(candidate.job || '').trim()) && Boolean(candidate.sourceName || candidate.sourceUrl || candidate.website);

  let recommendation = 'reject';
  if (candidate.suppressed || candidate.doNotContact) recommendation = 'reject';
  else if (ready && total >= SHORTLIST_SCORE) recommendation = 'shortlist';
  else if (!fatal && total >= WATCH_SCORE) recommendation = 'watch';

  const nextStatus = candidate.suppressed || candidate.doNotContact
    ? 'suppressed'
    : recommendation === 'shortlist'
      ? 'queued'
      : recommendation === 'watch'
        ? 'watch'
        : 'rejected';

  return {
    total,
    breakdown,
    recommendation,
    nextStatus,
    reasons: reasons.slice(0, 4),
    blockers,
    preferredChannel: preferredChannel(candidate),
  };
}

function matchMomentForCandidate(candidate, moments, asOf = new Date()) {
  return moments
    .map((moment) => ({ moment, score: scoreStakeholderCandidate(candidate, moment, asOf) }))
    .filter((row) => !row.score.blockers.some((item) => /different hub|outside the 90-day/i.test(item)))
    .sort((a, b) => b.score.total - a.score.total || a.moment.title.localeCompare(b.moment.title))[0]?.moment || null;
}

function canTransitionScoutStatus(from, to) {
  return Boolean(ALLOWED_TRANSITIONS[from]?.includes(to));
}

function transitionScoutStatus(from, to) {
  if (!canTransitionScoutStatus(from, to)) {
    throw new Error(`Cannot move a scout candidate from ${from} to ${to}`);
  }
  return to;
}

function claimPathForCandidate(candidate) {
  return `/claim-pages?from=scout&kind=${encodeURIComponent(candidate.kind)}&key=${encodeURIComponent(candidate.candidateKey)}`;
}

function draftClaimPageInvite(candidate, moment, options = {}) {
  const job = String(candidate.job || '').trim() || 'a specific verified role in this Moment';
  const hubName = options.hubName || candidate.hubId;
  const steward = options.stewardName || `${hubName} steward`;
  const when = new Date(moment.startsAt).toLocaleDateString('en-JM', { weekday: 'long', month: 'short', day: 'numeric' });
  const place = candidate.neighborhood ? ` in ${candidate.neighborhood}` : '';
  return {
    subject: `${when} ${job} — people are already coming through ${hubName}`,
    body: [
      `Hi ${candidate.displayName},`,
      '',
      `${when} we are running ${moment.title}${place}.`,
      `We need one ${job}. You only take part if people actually show up and check in.`,
      '',
      `A page is ready for you to claim when you want it: ${claimPathForCandidate(candidate)}`,
      'A steward can walk this in. Nothing is sent until a person decides to.',
      '',
      `— ${steward}`,
    ].join('\n'),
    claimPath: claimPathForCandidate(candidate),
    preferredChannel: preferredChannel(candidate),
    sendAllowed: false,
    autoSend: false,
    requiresHumanApproval: true,
    momentTitle: moment.title,
    job,
  };
}

function selectWeeklyShortlist(candidates, moments, asOf = new Date(), cap = QUEUE_CAP) {
  const ranked = candidates
    .map((candidate) => {
      const moment = matchMomentForCandidate(candidate, moments, asOf);
      return { candidate, moment, score: scoreStakeholderCandidate(candidate, moment, asOf) };
    })
    .sort((a, b) => b.score.total - a.score.total || a.candidate.displayName.localeCompare(b.candidate.displayName));

  const queuedByHub = new Map();
  return ranked.map((row) => {
    if (row.score.nextStatus !== 'queued') return row;
    const used = queuedByHub.get(row.candidate.hubId) || 0;
    if (used >= cap) {
      return {
        ...row,
        score: {
          ...row.score,
          recommendation: 'watch',
          nextStatus: 'watch',
          blockers: [...row.score.blockers, `Weekly steward cap of ${cap} already filled for this hub`],
        },
      };
    }
    queuedByHub.set(row.candidate.hubId, used + 1);
    return row;
  });
}

function canAutoSendScoutInvite() {
  return false;
}

module.exports = {
  FOUNDING_SCOUT_CATALOG,
  QUEUE_CAP,
  SHORTLIST_SCORE,
  scoreStakeholderCandidate,
  matchMomentForCandidate,
  selectWeeklyShortlist,
  draftClaimPageInvite,
  transitionScoutStatus,
  canTransitionScoutStatus,
  canAutoSendScoutInvite,
  claimPathForCandidate,
  preferredChannel,
  getIsoWeekStart,
  isLiveOrPilotHub,
};
