const { supabase: serviceSupabase } = require('../lib/supabase');
const worldSystemV2 = require('./worldSystemV2');

function toFacts(rows) {
  return (rows || []).map((row) => ({
    id: row.id,
    actionType: row.action_type || row.actionType,
    verifiedAt: row.verified_at || row.verifiedAt,
    userId: row.user_id || row.userId,
    referrerId: row.referrer_id || row.referrerId,
    contributorId: row.contributor_id || row.contributorId,
    merchantId: row.merchant_id || row.merchantId,
    sceneId: row.scene_id || row.sceneId,
    momentId: row.moment_id || row.momentId,
    placeId: row.place_id || row.action_metadata?.place_id || row.merchant_id,
    placeName: row.action_metadata?.venue_name || row.action_metadata?.place || row.placeName,
    firstMover: Boolean(row.action_metadata?.first_mover),
    invalid: Boolean(row.invalid || row.action_metadata?.invalid),
    fulfilled: Boolean(row.fulfilled),
  }));
}

async function recordEvent(userId, kind, payload, db = serviceSupabase) {
  if (!db || !kind) return;
  try {
    await db.from('world_system_events').insert({
      user_id: userId || null,
      kind,
      rule_version: worldSystemV2.WORLD_SYSTEM_RULE_VERSION,
      payload: payload || {},
    });
  } catch (error) {
    console.warn('[World System] event skipped:', error.message);
  }
}

async function loadPlayerRow(userId, db) {
  if (!db || !userId) return null;
  const row = await db
    .from('world_player_state')
    .select('user_id, faction_key, house_key, house_revealed_at, house_rule_version')
    .eq('user_id', userId)
    .maybeSingle();
  return row.data || null;
}

async function persistHouse(userId, assignment, db) {
  if (!userId || !assignment?.persist || !assignment.houseKey) return;
  const payload = {
    user_id: userId,
    house_key: assignment.houseKey,
    house_revealed_at: assignment.revealed ? new Date().toISOString() : undefined,
    house_rule_version: worldSystemV2.WORLD_SYSTEM_RULE_VERSION,
    updated_at: new Date().toISOString(),
  };
  if (!assignment.revealed) delete payload.house_revealed_at;
  const saved = await db.from('world_player_state').upsert(payload, { onConflict: 'user_id' });
  if (saved.error) throw saved.error;
  if (assignment.revealed) {
    await recordEvent(userId, 'house_revealed', { house: assignment.houseKey }, db);
  }
}

async function resolveForUser(userId, { ownActions, attributedActions, pathTitle, memoriesKept, hasLiveMoment, nextHref }, db = serviceSupabase) {
  const phases = worldSystemV2.resolveWorldSystemPhases();
  const ownFacts = toFacts(ownActions);
  const attributedFacts = toFacts(attributedActions);
  const resonance = worldSystemV2.resolveResonance(ownFacts);
  const influence = worldSystemV2.resolveInfluence(ownFacts);
  const reputation = worldSystemV2.resolveReputation(ownFacts);
  const traits = worldSystemV2.resolveTraits(ownFacts);
  const titles = worldSystemV2.resolveTitles({
    pathTitle: pathTitle || null,
    memoriesKept: memoriesKept || 0,
  });

  let returnChain = { counted: false, heading: null, hops: 0, movements: 0, influence: 0, moving: false, line: null };
  for (const origin of ownFacts.filter((fact) => worldSystemV2.isThrowAction(fact.actionType))) {
    const chain = worldSystemV2.resolveReturnChain({ origin, downstream: attributedFacts });
    if (chain.counted) {
      returnChain = chain;
      break;
    }
  }

  const player = await loadPlayerRow(userId, db);
  const assignment = worldSystemV2.resolveHouseAssignment({
    currentHouse: player?.house_key,
    revealedAt: player?.house_revealed_at,
    candidate: resonance.houseKey,
    revealEligible: resonance.revealEligible,
    scores: resonance.scores,
  });
  try {
    await persistHouse(userId, assignment, db);
  } catch (error) {
    console.warn('[World System] house persist skipped:', error.message);
  }

  const identity = worldSystemV2.resolveIdentityCard({
    phases,
    resonance,
    assignment,
    pathTitle: pathTitle || null,
    traits,
    influence,
    reputation,
    returnChain,
  });

  const house = assignment.houseKey ? worldSystemV2.resolveHouse(assignment.houseKey) : null;
  const invitation = worldSystemV2.resolveWorldInvitation({
    hasProof: ownFacts.some((fact) => fact.actionType && !worldSystemV2.IGNORED_RESONANCE_ACTIONS.has(fact.actionType)),
    identityLine: identity.line,
    hasLiveMoment: Boolean(hasLiveMoment),
    nextHref: nextHref || null,
  });

  return {
    ruleVersion: worldSystemV2.WORLD_SYSTEM_RULE_VERSION,
    phases,
    resonance: phases.identity
      ? {
          stage: resonance.stage,
          cue: resonance.cue,
          scores: resonance.scores,
          total: resonance.total,
          revealEligible: resonance.revealEligible,
        }
      : null,
    house: phases.identity && house
      ? { key: house.key, title: house.title, philosophy: house.philosophy, color: house.color, line: house.line }
      : null,
    identity: phases.identity ? identity : { house: null, pathTitle: pathTitle || null, line: pathTitle ? `A path is forming · ${pathTitle}` : null, traits: [], influenceLine: null, reputationLine: null, throwLine: null },
    influence: phases.identity ? { score: influence.score, counted: influence.counted, line: influence.line } : null,
    reputation: phases.identity ? { visible: reputation.visible, score: reputation.score, line: reputation.line } : null,
    traits: phases.identity ? traits.map((trait) => ({ key: trait.key, title: trait.title, criteria: trait.criteria })) : [],
    titles: phases.identity ? titles.map((title) => ({ key: title.key, title: title.title })) : [],
    returnChain: phases.identity && returnChain.counted
      ? { heading: returnChain.heading, line: returnChain.line, movements: returnChain.movements, moving: returnChain.moving }
      : null,
    invitation,
  };
}

module.exports = {
  toFacts,
  recordEvent,
  resolveForUser,
};
