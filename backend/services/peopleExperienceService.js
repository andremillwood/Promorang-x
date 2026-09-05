const crypto = require('crypto');
const { supabase: defaultDb } = require('../lib/supabase');
const offerService = require('./offerService');

const OPERATOR_ROLES = new Set(['operator', 'steward']);
const CONTRIBUTOR_ROLES = new Set(['contributor', 'operator', 'steward']);
const PLATFORM_CONTRIBUTOR_ROLES = new Set(['creator', 'host', 'promoter', 'merchant', 'brand', 'agency', 'admin']);

const PERK_KIND_TO_REWARD = {
  free_entry: 'experience',
  discount: 'coupon',
  complimentary: 'voucher',
  priority: 'experience',
  invitation: 'other',
  points: 'points',
  promokey: 'keys',
  merchant: 'product',
  custom: 'other',
};

function slugify(name) {
  const base = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'community';
}

function uniqueSlug(base) {
  return `${slugify(base)}-${crypto.randomBytes(2).toString('hex')}`;
}

const PLACEHOLDER_NAMES = new Set(['member', 'you', 'there', 'explorer', 'user', 'community']);

function isPlaceholderName(value) {
  const trimmed = String(value || '').trim();
  return !trimmed || PLACEHOLDER_NAMES.has(trimmed.toLowerCase());
}

function firstRealName(...values) {
  for (const value of values) {
    const trimmed = String(value || '').trim();
    if (!isPlaceholderName(trimmed)) return trimmed;
  }
  return '';
}

function nameFromEmail(email) {
  const local = String(email || '').split('@')[0].replace(/[._-]+/g, ' ').trim();
  if (isPlaceholderName(local)) return '';
  return local.replace(/\b\w/g, (character) => character.toUpperCase());
}

function displayName(row, fallback = 'Member') {
  return firstRealName(row?.display_name, row?.full_name, row?.username, row?.name, nameFromEmail(row?.email)) || fallback;
}

function givenName(row, fallback = 'there') {
  const resolved = displayName(row, '');
  return (resolved && resolved.split(/\s+/)[0]) || fallback;
}

function monthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function weekStart() {
  const now = new Date();
  const day = now.getUTCDay();
  const start = new Date(now);
  start.setUTCDate(now.getUTCDate() - day);
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

function classifyExperienceRole({ operatesHubs = 0, contributorHubs = 0, platformRoles = [] }) {
  if (operatesHubs > 0) return 'operator';
  if (contributorHubs > 0) return 'contributor';
  if (platformRoles.some((role) => PLATFORM_CONTRIBUTOR_ROLES.has(role))) return 'contributor';
  return 'member';
}

function contributorValueScore({ peopleBrought = 0, activePeople = 0, verifiedActions = 0, attributedValue = 0 }) {
  return Number(activePeople) * 8 + Number(verifiedActions) * 5 + Number(attributedValue) * 0.01 + Number(peopleBrought) * 0.4;
}

function classifyHappenedBucket(actionType) {
  const type = String(actionType || '');
  if (['MOMENT_ATTENDANCE', 'MERCHANT_VISIT', 'check_in', 'TEST_DRIVE', 'moment_join_verified', 'proof_verified', 'event_rsvp', 'MOMENT_RSVP'].includes(type)) return 'went';
  if (['PURCHASE', 'order_paid', 'split_tender'].includes(type)) return 'bought';
  if (['DISCOVERY_RESPONSE', 'discovery_vote'].includes(type)) return 'answered';
  if (['CONTENT_POST', 'share_completed'].includes(type) || type.startsWith('organic_')) return 'shared';
  if (['FRIEND_INVITE', 'REFERRAL', 'referral_activated'].includes(type)) return 'brought';
  if (['PERK_CLAIM', 'deal_claimed', 'PROMOKEY_USE'].includes(type)) return 'claimed';
  if (['PERK_REDEMPTION', 'coupon_redeemed'].includes(type)) return 'used';
  return 'other';
}

function happenedBuckets(actions) {
  const buckets = { went: 0, bought: 0, answered: 0, shared: 0, brought: 0, claimed: 0, used: 0, other: 0 };
  for (const action of actions || []) {
    buckets[classifyHappenedBucket(action.action_type)] += 1;
  }
  return buckets;
}

function accountStakeholderOutcomes(input = {}) {
  const role = input.role || 'member';
  const suppliesInventory = (input.platformRoles || []).some((item) => item === 'merchant' || item === 'brand')
    || Number(input.perksGiven || 0) > 0;
  const ledger = {
    people: Number(input.people || 0),
    peopleThisMonth: Number(input.peopleThisMonth || 0),
    active: Number(input.activePeople || 0),
    happening: Number(input.happening || 0),
    earned: Number(input.earned || 0),
    went: Number(input.buckets?.went || 0),
    bought: Number(input.buckets?.bought || 0),
    answered: Number(input.buckets?.answered || 0),
    shared: Number(input.buckets?.shared || 0),
    brought: Number(input.buckets?.brought || 0),
    claimed: Number(input.buckets?.claimed || 0),
    used: Number(input.buckets?.used || 0),
    perksGiven: Number(input.perksGiven || 0),
    perksClaimed: Number(input.perksClaimed || 0),
    perksUsed: Number(input.perksUsed || 0),
    perksAvailable: Number(input.perksAvailable || 0),
    opportunities: Number(input.opportunities || 0),
    memberships: Number(input.memberships || 0),
    cardPerks: Number(input.cardPerks || 0),
  };
  const cards = [];
  if (role === 'member') {
    cards.push(
      { key: 'cardPerks', label: 'On your card', value: ledger.cardPerks, hint: 'Perks you can use' },
      { key: 'memberships', label: 'Communities', value: ledger.memberships, hint: 'Rooms you belong to' },
    );
  } else {
    cards.push(
      {
        key: 'people',
        label: 'People',
        value: ledger.people,
        hint: ledger.peopleThisMonth ? `+${ledger.peopleThisMonth} this month` : 'Invite the first ones',
      },
      { key: 'earned', label: 'Earned', value: ledger.earned, hint: 'From verified activity' },
    );
  }
  if (role === 'operator') {
    cards.push({ key: 'happening', label: 'This week', value: ledger.happening, hint: 'Verified movement in your community' });
  }
  if (suppliesInventory) {
    cards.push(
      { key: 'perksGiven', label: 'Given', value: ledger.perksGiven, hint: 'Perks you put in front of people' },
      { key: 'perksClaimed', label: 'Claimed', value: ledger.perksClaimed, hint: 'On PromoCards now' },
      { key: 'perksUsed', label: 'Used', value: ledger.perksUsed, hint: 'Redeemed in the real world' },
    );
  }
  return { role, suppliesInventory, ledger, cards };
}

function firstMeta(metadata, keys, fallback = null) {
  const source = metadata && typeof metadata === 'object' ? metadata : {};
  for (const key of keys) {
    if (source[key] != null && source[key] !== '') return source[key];
  }
  return fallback;
}

function attributionFromMetadata(metadata = {}, extras = {}) {
  const amountRaw = firstMeta(metadata, ['amount', 'reward_value', 'rewardValue'], extras.amount);
  return {
    scene_id: firstMeta(metadata, ['scene_id', 'sceneId'], extras.scene_id),
    contributor_id: firstMeta(metadata, ['contributor_id', 'contributorId', 'invited_by_user_id', 'invitedByUserId'], extras.contributor_id),
    referrer_id: firstMeta(metadata, ['referrer_id', 'referrerId'], extras.referrer_id),
    moment_id: firstMeta(metadata, ['moment_id', 'momentId'], extras.moment_id),
    campaign_id: firstMeta(metadata, ['campaign_id', 'campaignId'], extras.campaign_id),
    merchant_id: firstMeta(metadata, ['merchant_id', 'merchantId'], extras.merchant_id),
    drop_id: firstMeta(metadata, ['drop_id', 'dropId'], extras.drop_id),
    amount: amountRaw == null || amountRaw === '' ? null : Number(amountRaw),
    verification_method: firstMeta(metadata, ['verification_method', 'verificationMethod', 'verification_mode'], extras.verification_method),
  };
}

function remainingQuantity(total, reserved = 0, redeemed = 0) {
  if (total == null) return null;
  return Math.max(0, Number(total) - Number(reserved || 0) - Number(redeemed || 0));
}

function fulfillmentFromStatus(status, expiresAt) {
  if (expiresAt) {
    const expiry = Date.parse(expiresAt);
    if (!Number.isFinite(expiry) || expiry <= Date.now()) return 'expired';
  }
  switch (String(status || '')) {
    case 'issued': return 'issued';
    case 'claimed': return 'claimed';
    case 'fulfillment_pending': return 'pending';
    case 'redeemed': return 'redeemed';
    case 'expired': return 'expired';
    case 'exhausted': return 'exhausted';
    case 'active':
    case 'available': return 'available';
    default: return status ? 'available' : 'issued';
  }
}

function contributorRewardAmount(offer = {}) {
  const meta = offer.metadata && typeof offer.metadata === 'object' ? offer.metadata : {};
  const fromMeta = Number(meta.contributor_reward_points ?? meta.you_earn_points);
  if (Number.isFinite(fromMeta) && fromMeta > 0) return Math.min(Math.round(fromMeta), 500);
  const value = Number(offer.value_amount);
  if (Number.isFinite(value) && value > 0) return Math.min(Math.max(5, Math.round(value)), 100);
  return 25;
}

function toPromoCardBenefit({
  id,
  offer = {},
  issuance = {},
  drop = {},
  issuerName = null,
  sharedBy = null,
}) {
  const remaining = remainingQuantity(offer.quantity_total, offer.quantity_reserved, offer.quantity_redeemed);
  const status = issuance.status || (drop.status === 'exhausted' ? 'exhausted' : drop.id ? 'claimed' : offer.status);
  const expiresAt = issuance.expires_at || offer.ends_at || null;
  const fulfillmentState = fulfillmentFromStatus(status, expiresAt);
  const recorded = fulfillmentState === 'redeemed' || Boolean(issuance.redeemed_at);
  const fulfillmentType = offer.fulfillment_type || 'merchant_validation';
  const presentable = Boolean(offer.id)
    && fulfillmentState === 'claimed'
    && ['code', 'merchant_validation'].includes(fulfillmentType)
    && Boolean(issuance.redemption_code)
    && !recorded;
  return {
    id,
    offerId: offer.id || drop.offer_id || null,
    issuanceId: issuance.id || null,
    dropId: drop.id || issuance.metadata?.drop_id || null,
    title: offer.title || drop.title || 'Perk',
    detail: offer.description || drop.description || '',
    issuer: {
      id: offer.owner_user_id || drop.creator_id || null,
      type: offer.owner_type || (drop.perk_kind === 'merchant' ? 'merchant' : 'creator'),
      name: issuerName || offer.metadata?.issuer_name || offer.metadata?.merchant_name || 'Participating business',
    },
    eligibility: {
      who: offer.metadata?.eligibility || (issuance.id ? 'Claimed members' : 'People this ambassador shared with'),
      perUserLimit: offer.per_user_limit ?? 1,
      startsAt: offer.starts_at || null,
      endsAt: offer.ends_at || null,
      remaining,
    },
    availableQuantity: remaining,
    budget: offer.value_amount != null && remaining != null
      ? Number(offer.value_amount) * remaining
      : (offer.value_amount != null ? Number(offer.value_amount) : null),
    expiresAt,
    fulfillmentState,
    fulfillmentType,
    redemption: {
      recorded,
      code: presentable ? issuance.redemption_code : null,
      redeemedAt: issuance.redeemed_at || null,
      redeemedBy: issuance.redeemed_by || null,
    },
    sharedBy,
    dropSlug: drop.slug || null,
    href: drop.slug ? `/drop/${drop.slug}` : recorded ? '/discover' : '/card',
    fulfillmentData: issuance.fulfillment_data || {},
    issuance: issuance.id
      ? {
          id: issuance.id,
          status: issuance.status,
          redemption_code: issuance.redemption_code || null,
          issued_at: issuance.issued_at,
          claimed_at: issuance.claimed_at,
          redeemed_at: issuance.redeemed_at,
          expires_at: issuance.expires_at || expiresAt,
          fulfillment_data: issuance.fulfillment_data || {},
          offers: {
            id: offer.id,
            title: offer.title || drop.title || 'Perk',
            description: offer.description || drop.description || '',
            reward_type: offer.reward_type,
            fulfillment_type: fulfillmentType,
            value_amount: offer.value_amount ?? null,
            value_currency: offer.value_currency ?? null,
          },
        }
      : null,
  };
}

function canUseBenefit(benefit) {
  if (!benefit || benefit.redemption?.recorded) return false;
  if (benefit.expiresAt) {
    const expiry = Date.parse(benefit.expiresAt);
    if (!Number.isFinite(expiry) || expiry <= Date.now()) return false;
  }
  const type = benefit.fulfillmentType || 'merchant_validation';
  if (!['code', 'merchant_validation'].includes(type)) return false;
  return benefit.fulfillmentState === 'claimed' && Boolean(benefit.redemption?.code);
}

function selectUseThis(benefits) {
  return (benefits || []).find((benefit) => canUseBenefit(benefit)) || null;
}

function selectNextBenefit(nearby, used) {
  const pool = nearby || [];
  if (!pool.length) return null;
  const usedOffer = used?.offerId;
  return pool.find((benefit) => benefit.offerId && benefit.offerId !== usedOffer) || pool[0] || null;
}

function summarizeRepeatUse(rows = []) {
  const redemptionsByUser = new Map();
  const merchants = new Set();
  const referred = new Set();
  const contributors = new Set();
  let pointsAwarded = 0;

  for (const row of rows) {
    redemptionsByUser.set(row.userId, (redemptionsByUser.get(row.userId) || 0) + 1);
    if (row.merchantId) merchants.add(row.merchantId);
    if (row.referrerId) referred.add(row.userId);
    if (row.contributorId) {
      contributors.add(row.contributorId);
      pointsAwarded += Number(row.contributorPoints || 0);
    }
  }

  let firstRedemptions = 0;
  let secondUses = 0;
  for (const count of redemptionsByUser.values()) {
    if (count === 1) firstRedemptions += 1;
    if (count >= 2) secondUses += 1;
  }

  return {
    firstRedemptions,
    secondUses,
    referredUsersWhoRedeem: referred.size,
    merchantOutcomes: {
      participatingBusinesses: merchants.size,
      verifiedRedemptions: rows.length,
      uniqueCustomers: redemptionsByUser.size,
    },
    contributorRewards: {
      rewardedContributors: contributors.size,
      pointsAwarded,
    },
  };
}

function loopProgress({ supplied = false, shared = false, claimed = false, validated = false, attributed = false, returnReason = false } = {}) {
  const stages = ['merchant_supplied', 'ambassador_shared', 'member_claimed', 'merchant_validated', 'attribution_updated', 'return_reason'];
  const done = {
    merchant_supplied: Boolean(supplied),
    ambassador_shared: Boolean(shared),
    member_claimed: Boolean(claimed),
    merchant_validated: Boolean(validated),
    attribution_updated: Boolean(attributed),
    return_reason: Boolean(returnReason),
  };
  const current = stages.find((stage) => !done[stage]) || 'return_reason';
  return { stages, done, current };
}

function createPeopleExperienceService(db = defaultDb) {
  const maybe = async (promise) => {
    try {
      return await promise;
    } catch (error) {
      console.warn('[people-experience]', error.message);
      return { data: null, error };
    }
  };

  async function profileFor(userId, identity = {}) {
    const users = await maybe(db.from('users').select('id, display_name, username, profile_image, full_name, email').eq('id', userId).maybeSingle());
    const profilesById = await maybe(db.from('profiles').select('id, user_id, full_name, display_name, username, avatar_url, email').eq('id', userId).maybeSingle());
    let profileRow = profilesById.data;
    if (!profileRow) {
      const profilesByUser = await maybe(db.from('profiles').select('id, user_id, full_name, display_name, username, avatar_url, email').eq('user_id', userId).maybeSingle());
      profileRow = profilesByUser.data;
    }
    const userRow = users.data || {};
    return {
      id: userId,
      display_name: firstRealName(
        userRow.display_name,
        profileRow?.display_name,
        profileRow?.full_name,
        userRow.full_name,
        identity.displayName,
        identity.display_name,
      ),
      full_name: firstRealName(userRow.full_name, profileRow?.full_name, identity.fullName, identity.full_name),
      username: firstRealName(userRow.username, profileRow?.username, identity.username),
      email: userRow.email || profileRow?.email || identity.email || null,
      profile_image: userRow.profile_image || profileRow?.avatar_url || identity.profileImage || null,
      name: firstRealName(
        userRow.display_name,
        profileRow?.display_name,
        profileRow?.full_name,
        userRow.full_name,
        identity.displayName,
        identity.display_name,
      ),
    };
  }

  async function platformRoles(userId) {
    const roles = new Set();
    const userRow = await maybe(db.from('users').select('role, user_type').eq('id', userId).maybeSingle());
    if (userRow.data?.role) roles.add(userRow.data.role);
    if (userRow.data?.user_type) roles.add(userRow.data.user_type);
    const extra = await maybe(db.from('user_roles').select('role').eq('user_id', userId));
    for (const row of extra.data || []) if (row.role) roles.add(row.role);
    return Array.from(roles);
  }

  async function membershipsFor(userId) {
    const result = await maybe(db.from('scene_memberships').select('*, scenes(*)').eq('user_id', userId).eq('membership_state', 'active'));
    return (result.data || []).map((row) => ({
      ...row,
      role: row.relationship === 'host' || row.relationship === 'creator' ? 'operator'
        : ['venue', 'merchant', 'brand', 'agency', 'supporter'].includes(row.relationship) ? 'contributor' : 'member',
    }));
  }

  async function recordVerifiedAction({
    userId,
    actionType,
    sceneId = null,
    contributorId = null,
    referrerId = null,
    momentId = null,
    campaignId = null,
    merchantId = null,
    dropId = null,
    amount = null,
    verificationMethod = 'system',
    metadata = {},
  }) {
    if (!userId || !actionType) return null;
    const base = {
      user_id: userId,
      action_type: actionType,
      action_metadata: metadata,
      surface: 'web',
    };
    const attribution = attributionFromMetadata(metadata, {
      scene_id: sceneId,
      contributor_id: contributorId,
      referrer_id: referrerId,
      moment_id: momentId,
      campaign_id: campaignId,
      merchant_id: merchantId,
      drop_id: dropId,
      amount,
      verification_method: verificationMethod,
    });
    const inserted = await maybe(db.from('verified_actions').insert({ ...base, ...attribution }).select().maybeSingle());
    const saved = inserted.data || (await maybe(db.from('verified_actions').insert(base).select().maybeSingle())).data || null;
    if (saved) {
      await bumpContributorStats({
        sceneId: attribution.scene_id,
        contributorId: attribution.contributor_id,
        amount: attribution.amount,
      });
    }
    return saved;
  }

  async function bumpContributorStats({ sceneId, contributorId, amount }) {
    if (!sceneId || !contributorId) return null;
    const row = await maybe(
      db.from('scene_memberships').select('id, verified_actions_count, attributed_value').eq('scene_id', sceneId).eq('user_id', contributorId).eq('membership_state', 'active').maybeSingle(),
    );
    if (!row.data) return null;
    return maybe(db.from('scene_memberships').update({
      verified_actions_count: Number(row.data.verified_actions_count || 0) + 1,
      attributed_value: Number(row.data.attributed_value || 0) + Number(amount || 0),
    }).eq('id', row.data.id));
  }

  async function ensureHubAttribution({ sceneId, memberUserId, attributedByUserId, source = 'invite', sourceEntityType = null, sourceEntityId = null }) {
    if (!sceneId || !memberUserId || !attributedByUserId || memberUserId === attributedByUserId) return null;
    const existing = await maybe(
      db.from('hub_member_attributions').select('id').eq('scene_id', sceneId).eq('member_user_id', memberUserId).maybeSingle(),
    );
    if (existing.data) return existing.data;
    const inserted = await maybe(db.from('hub_member_attributions').insert({
      scene_id: sceneId,
      member_user_id: memberUserId,
      attributed_by_user_id: attributedByUserId,
      source,
      source_entity_type: sourceEntityType,
      source_entity_id: sourceEntityId,
    }).select().maybeSingle());
    return inserted.data || null;
  }

  async function joinScene({ userId, sceneId, role = 'member', invitedBy = null }) {
    if (!userId || !sceneId) throw new Error('Scene and person are required');
    const relationship = role === 'operator' ? 'host' : role === 'contributor' ? 'supporter' : 'participant';
    await maybe(db.from('scene_memberships').upsert({
      scene_id: sceneId,
      user_id: userId,
      relationship,
      membership_state: 'active',
      invited_by: invitedBy,
      can_distribute: CONTRIBUTOR_ROLES.has(role),
    }, { onConflict: 'scene_id,user_id,relationship' }));
    if (invitedBy) {
      await ensureHubAttribution({
        sceneId,
        memberUserId: userId,
        attributedByUserId: invitedBy,
        source: 'invite',
      });
    }
  }

  async function getWallet(userId) {
    const wallet = await maybe(db.from('economy_wallets').select('*').eq('user_id', userId).maybeSingle());
    return wallet.data || { points: 0, promokeys: 0, gems: 0, usd: 0, gold: 0 };
  }

  async function getNetwork(userId, sceneId) {
    const referrals = await maybe(
      db.from('user_referrals')
        .select('id, referred_id, referrer_id, status, created_at, reward_points')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false }),
    );
    const direct = referrals.data || [];
    const referredIds = direct.map((row) => row.referred_id).filter(Boolean);

    let secondDegree = [];
    if (referredIds.length) {
      const downstream = await maybe(
        db.from('user_referrals').select('id, referred_id, referrer_id, status, created_at').in('referrer_id', referredIds),
      );
      secondDegree = downstream.data || [];
    }

    let attributions = [];
    if (sceneId) {
      const attr = await maybe(
        db.from('hub_member_attributions').select('*').eq('scene_id', sceneId).eq('attributed_by_user_id', userId),
      );
      attributions = attr.data || [];
    } else {
      const attr = await maybe(
        db.from('hub_member_attributions').select('*').eq('attributed_by_user_id', userId),
      );
      attributions = attr.data || [];
    }

    const month = monthStart();
    const thisMonth = [...direct, ...attributions].filter((row) => (row.created_at || '') >= month).length;

    const memberIds = Array.from(new Set([
      ...direct.map((row) => row.referred_id),
      ...secondDegree.map((row) => row.referred_id),
      ...attributions.map((row) => row.member_user_id),
    ].filter(Boolean)));
    const contributorIds = Array.from(new Set([
      ...direct.map((row) => row.referred_id),
      ...attributions.map((row) => row.member_user_id),
    ].filter(Boolean)));
    const contributorStats = [];
    for (const id of contributorIds.slice(0, 12)) {
      const theirPeople = await maybe(db.from('user_referrals').select('id, status').eq('referrer_id', id));
      const theirActions = await maybe(
        db.from('verified_actions').select('id, action_type, amount, contributor_id, user_id').or(`contributor_id.eq.${id},user_id.eq.${id}`).limit(200),
      );
      const person = await profileFor(id);
      const people = (theirPeople.data || []).length;
      const active = (theirPeople.data || []).filter((row) => row.status === 'active' || row.status === 'converted').length;
      const actions = theirActions.data || [];
      const attributedValue = actions.reduce((sum, row) => sum + Number(row.amount || 0), 0);
      contributorStats.push({
        id,
        name: displayName(person),
        image: person.profile_image || null,
        people,
        active,
        verifiedActions: actions.length,
        attributedValue,
        score: contributorValueScore({ peopleBrought: people, activePeople: active, verifiedActions: actions.length, attributedValue }),
      });
    }
    contributorStats.sort((a, b) => b.score - a.score);

    const hubs = await membershipsFor(userId);
    const firstHub = hubs.find((row) => OPERATOR_ROLES.has(row.role) || CONTRIBUTOR_ROLES.has(row.role)) || hubs[0];

    return {
      people: memberIds.length,
      direct: direct.length,
      throughNetwork: secondDegree.length,
      thisMonth,
      attributions: attributions.length,
      memberIds,
      sceneSlug: firstHub?.scenes?.slug || null,
      topContributors: contributorStats.slice(0, 8),
      referrals: direct,
    };
  }

  async function getHappened(userId, { sceneId } = {}) {
    const network = sceneId ? null : await getNetwork(userId);
    const networkIds = Array.from(new Set([userId, ...((network?.memberIds || network?.referrals || []).map((row) => (typeof row === 'string' ? row : row.referred_id)).filter(Boolean))]));
    let query = db.from('verified_actions').select('*').order('verified_at', { ascending: false }).limit(400);
    if (sceneId) {
      query = query.eq('scene_id', sceneId);
    } else if (networkIds.length) {
      query = query.or(`contributor_id.eq.${userId},referrer_id.eq.${userId},user_id.in.(${networkIds.join(',')})`);
    }
    const actions = await maybe(query);
    const rows = actions.data || [];
    const week = weekStart();
    const thisWeek = rows.filter((row) => (row.verified_at || row.created_at || '') >= week);
    const buckets = happenedBuckets(thisWeek);
    const earned = thisWeek.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    const interests = {};
    for (const row of rows) {
      const interest = row.action_metadata?.interest || row.action_metadata?.category;
      if (interest) interests[interest] = (interests[interest] || 0) + 1;
    }
    const topInterests = Object.entries(interests)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label]) => label);

    const recent = [];
    for (const row of thisWeek.slice(0, 8)) {
      const actor = row.user_id ? await profileFor(row.user_id) : null;
      recent.push({
        ...row,
        actorName: actor ? displayName(actor) : 'Someone',
      });
    }

    return {
      participated: thisWeek.length,
      buckets,
      earned,
      topInterests,
      recent,
    };
  }

  async function getGiveablePerks(userId) {
    const owned = await maybe(
      db.from('offers').select('*').eq('owner_user_id', userId).in('status', ['active', 'draft']).order('created_at', { ascending: false }).limit(40),
    );
    const publicOffers = await maybe(
      db.from('offers').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(40),
    );
    const inventory = [];
    const seen = new Set();
    const claims = await maybe(
      db.from('community_drop_claims').select('id, status, community_drops(offer_id, creator_id)').eq('referrer_id', userId),
    );
    const claimedByOffer = {};
    for (const claim of claims.data || []) {
      const offerId = claim.community_drops?.offer_id;
      if (!offerId) continue;
      claimedByOffer[offerId] = (claimedByOffer[offerId] || 0) + 1;
    }
    for (const offer of [...(owned.data || []), ...(publicOffers.data || [])]) {
      if (seen.has(offer.id)) continue;
      seen.add(offer.id);
      const remaining = offer.quantity_total == null
        ? null
        : Math.max(0, Number(offer.quantity_total) - Number(offer.quantity_reserved || 0) - Number(offer.quantity_redeemed || 0));
      inventory.push({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        imageUrl: offer.image_url,
        ownerType: offer.owner_type,
        remaining,
        claimedByYourPeople: claimedByOffer[offer.id] || 0,
        rewardType: offer.reward_type,
        kind: offer.reward_type === 'keys' ? 'promokey' : offer.reward_type === 'points' ? 'points' : offer.owner_type === 'merchant' ? 'merchant' : 'custom',
        source: offer.owner_user_id === userId ? 'yours' : 'available',
      });
    }
    return inventory;
  }

  async function getOpportunities(userId, sceneId) {
    const offers = await maybe(
      db.from('offers').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(30),
    );
    const campaigns = await maybe(
      db.from('campaigns').select('id, name, title, description, status, budget, metadata, brand_id').in('status', ['active', 'live', 'published']).limit(20),
    );
    const missions = await maybe(
      db.from('content_missions').select('id, title, description, reward_type, reward_points, moment_id, owner_id').limit(20),
    );

    const items = [];
    for (const offer of offers.data || []) {
      if (offer.owner_user_id === userId) continue;
      const remaining = offer.quantity_total == null
        ? null
        : Math.max(0, Number(offer.quantity_total) - Number(offer.quantity_reserved || 0) - Number(offer.quantity_redeemed || 0));
      items.push({
        id: `offer:${offer.id}`,
        sourceKind: 'offer',
        sourceId: offer.id,
        title: offer.title,
        description: offer.description,
        imageUrl: offer.image_url,
        peopleGet: offer.metadata?.people_get || offer.description || offer.title,
        youEarn: offer.metadata?.you_earn || offer.metadata?.contributor_earn || (offer.value_amount
          ? 'Earn when people use this'
          : 'Earn from verified use'),
        remaining,
        sceneId: sceneId || null,
      });
    }
    for (const campaign of campaigns.data || []) {
      items.push({
        id: `campaign:${campaign.id}`,
        sourceKind: 'campaign',
        sourceId: campaign.id,
        title: campaign.title || campaign.name,
        description: campaign.description,
        peopleGet: campaign.metadata?.people_get || 'A perk for your people',
        youEarn: campaign.metadata?.you_earn || 'Earn from verified activity',
        sceneId: sceneId || null,
      });
    }
    for (const mission of missions.data || []) {
      items.push({
        id: `mission:${mission.id}`,
        sourceKind: 'mission',
        sourceId: mission.id,
        title: mission.title,
        description: mission.description,
        peopleGet: mission.reward_points ? `${mission.reward_points} PromoPoints` : 'A reward for completing it',
        youEarn: 'Credit for the people who finish it',
        sceneId: sceneId || null,
      });
    }
    return items;
  }

  async function getParticipatingOffers() {
    const linked = await maybe(
      db.from('community_drops')
        .select('id, offer_id, creator_id, title, slug, scene_id, remaining, status, perk_kind')
        .eq('status', 'active')
        .not('offer_id', 'is', null)
        .limit(24),
    );
    const dropByOffer = new Map();
    for (const drop of linked.data || []) {
      if (drop.offer_id && !dropByOffer.has(drop.offer_id)) dropByOffer.set(drop.offer_id, drop);
    }
    const inventory = await maybe(
      db.from('offers')
        .select('*')
        .eq('status', 'active')
        .in('fulfillment_type', ['merchant_validation', 'code', 'qr'])
        .order('created_at', { ascending: false })
        .limit(24),
    );
    const seen = new Set();
    const rows = [];
    for (const offer of inventory.data || []) {
      if (seen.has(offer.id)) continue;
      seen.add(offer.id);
      rows.push({ offer, drop: dropByOffer.get(offer.id) || null });
    }
    return rows;
  }

  async function getNearbyBenefits() {
    const participating = await getParticipatingOffers();
    const issuerIds = new Set();
    for (const item of participating) {
      if (item.offer.owner_user_id) issuerIds.add(item.offer.owner_user_id);
      if (item.drop?.creator_id) issuerIds.add(item.drop.creator_id);
    }
    const profiles = new Map();
    await Promise.all([...issuerIds].map(async (id) => {
      profiles.set(id, displayName(await profileFor(id)));
    }));
    return participating
      .filter(({ offer }) => remainingQuantity(offer.quantity_total, offer.quantity_reserved, offer.quantity_redeemed) !== 0)
      .map(({ offer, drop }) => toPromoCardBenefit({
        id: offer.id,
        offer,
        drop: drop || {},
        issuerName: profiles.get(offer.owner_user_id) || null,
        sharedBy: drop?.creator_id
          ? { id: drop.creator_id, name: profiles.get(drop.creator_id) || 'Ambassador' }
          : null,
      }));
  }

  async function getRepeatUseRows() {
    const linked = await maybe(
      db.from('community_drops').select('offer_id').not('offer_id', 'is', null).limit(80),
    );
    const offerIds = [...new Set((linked.data || []).map((row) => row.offer_id).filter(Boolean))];
    if (!offerIds.length) return [];
    const redeemed = await maybe(
      db.from('offer_issuances')
        .select('id, user_id, offer_id, redeemed_at, metadata, offers(owner_user_id, owner_type, value_amount)')
        .eq('status', 'redeemed')
        .in('offer_id', offerIds)
        .order('redeemed_at', { ascending: false })
        .limit(200),
    );
    const rewards = await maybe(
      db.from('verified_actions')
        .select('user_id, amount, action_metadata')
        .eq('action_type', 'CONTRIBUTOR_REWARD')
        .limit(200),
    );
    const rewardByIssuance = new Map();
    for (const row of rewards.data || []) {
      const issuanceId = row.action_metadata?.issuance_id;
      if (issuanceId) rewardByIssuance.set(issuanceId, Number(row.amount || 0));
    }
    return (redeemed.data || []).map((row) => ({
      userId: row.user_id,
      referrerId: row.metadata?.referrer_id || row.metadata?.contributor_id || null,
      merchantId: row.offers?.owner_user_id || null,
      contributorId: row.metadata?.contributor_id || row.metadata?.referrer_id || null,
      contributorPoints: rewardByIssuance.get(row.id) || 0,
    }));
  }

  async function awardContributorOnRedemption({ issuance, offer }) {
    const contributorId = issuance?.metadata?.contributor_id || issuance?.metadata?.referrer_id || null;
    if (!contributorId || contributorId === issuance.user_id) return null;
    const amount = contributorRewardAmount(offer);
    try {
      const economy = require('./economyService');
      await economy.addCurrency(
        contributorId,
        'points',
        amount,
        'promocard_redemption',
        issuance.id,
        `Verified customer used ${offer?.title || 'a PromoCard benefit'}`,
      );
    } catch (error) {
      console.warn('[people-experience] contributor reward skipped:', error.message);
    }
    await recordVerifiedAction({
      userId: contributorId,
      actionType: 'CONTRIBUTOR_REWARD',
      merchantId: offer?.owner_user_id || null,
      sceneId: issuance.metadata?.scene_id || null,
      contributorId,
      referrerId: issuance.metadata?.referrer_id || contributorId,
      dropId: issuance.metadata?.drop_id || null,
      amount,
      verificationMethod: 'redemption',
      metadata: {
        issuance_id: issuance.id,
        offer_id: offer?.id || null,
        referred_user_id: issuance.user_id,
      },
    });
    const referral = await maybe(
      db.from('user_referrals')
        .select('id, reward_points')
        .eq('referrer_id', contributorId)
        .eq('referred_id', issuance.user_id)
        .maybeSingle(),
    );
    if (referral.data) {
      await maybe(db.from('user_referrals').update({
        reward_points: Number(referral.data.reward_points || 0) + amount,
        status: 'rewarded',
      }).eq('id', referral.data.id));
    }
    return { contributorId, amount };
  }

  async function getCard(userId, identity = {}) {
    const [wallet, card, issuances, redeemedIssuances, memberships, participating, dropClaims, repeatRows, discoverUnlocks] = await Promise.all([
      getWallet(userId),
      maybe(db.from('user_promo_cards').select('*').eq('user_id', userId).maybeSingle()),
      maybe(db.from('offer_issuances').select('*, offers(*)').eq('user_id', userId).in('status', ['issued', 'claimed', 'fulfillment_pending']).order('issued_at', { ascending: false }).limit(20)),
      maybe(db.from('offer_issuances').select('*, offers(*)').eq('user_id', userId).eq('status', 'redeemed').order('redeemed_at', { ascending: false }).limit(20)),
      membershipsFor(userId),
      getParticipatingOffers(),
      maybe(db.from('community_drop_claims').select('*, community_drops(*)').eq('user_id', userId).in('status', ['claimed', 'redeemed']).order('claimed_at', { ascending: false }).limit(20)),
      getRepeatUseRows(),
      maybe(db.from('discovery_card_unlocks').select('*').eq('user_id', userId).eq('status', 'claimed').order('created_at', { ascending: false }).limit(12)),
    ]);
    const requireLedger = (result) => {
      if (result?.error) {
        throw result.error instanceof Error ? result.error : new Error(result.error.message || 'Ledger unavailable');
      }
      return result;
    };
    requireLedger(card);
    requireLedger(issuances);
    requireLedger(redeemedIssuances);
    requireLedger(dropClaims);

    const person = await profileFor(userId, identity);
    const issuanceIds = new Set([
      ...(issuances.data || []).map((row) => row.id),
      ...(redeemedIssuances.data || []).map((row) => row.id),
    ]);
    const claimedOfferIds = new Set([
      ...(issuances.data || []).map((row) => row.offer_id),
      ...(redeemedIssuances.data || []).map((row) => row.offer_id),
    ].filter(Boolean));

    const issuerIds = new Set();
    for (const row of [...(issuances.data || []), ...(redeemedIssuances.data || [])]) {
      if (row.offers?.owner_user_id) issuerIds.add(row.offers.owner_user_id);
      if (row.metadata?.contributor_id) issuerIds.add(row.metadata.contributor_id);
      if (row.metadata?.referrer_id) issuerIds.add(row.metadata.referrer_id);
    }
    for (const row of dropClaims.data || []) {
      if (row.community_drops?.creator_id) issuerIds.add(row.community_drops.creator_id);
    }
    for (const item of participating) {
      if (item.offer.owner_user_id) issuerIds.add(item.offer.owner_user_id);
      if (item.drop?.creator_id) issuerIds.add(item.drop.creator_id);
    }
    const profiles = new Map();
    await Promise.all([...issuerIds].map(async (id) => {
      profiles.set(id, displayName(await profileFor(id)));
    }));

    const benefits = [
      ...(issuances.data || []).map((row) => toPromoCardBenefit({
        id: row.id,
        offer: row.offers || {},
        issuance: row,
        issuerName: profiles.get(row.offers?.owner_user_id) || null,
        sharedBy: row.metadata?.contributor_id || row.metadata?.referrer_id
          ? { id: row.metadata.contributor_id || row.metadata.referrer_id, name: profiles.get(row.metadata.contributor_id || row.metadata.referrer_id) || 'Ambassador' }
          : null,
      })),
      ...(dropClaims.data || [])
        .filter((row) => !row.offer_issuance_id || !issuanceIds.has(row.offer_issuance_id))
        .map((row) => toPromoCardBenefit({
          id: row.id,
          drop: row.community_drops || {},
          issuance: { status: row.status, metadata: { drop_id: row.drop_id } },
          issuerName: profiles.get(row.community_drops?.creator_id) || null,
          sharedBy: row.referrer_id
            ? { id: row.referrer_id, name: profiles.get(row.referrer_id) || 'Ambassador' }
            : null,
        })),
      ...(discoverUnlocks?.data || []).filter((row) => row.redemption_code).map((row) => ({
        ...toPromoCardBenefit({
          id: row.id,
          offer: {
            title: row.perk_title || 'City perk',
            description: row.poll_question || '',
            fulfillment_type: 'code',
            owner_type: 'discover',
          },
          issuance: {
            id: row.id,
            status: 'claimed',
            redemption_code: row.redemption_code,
          },
          issuerName: 'Discover',
        }),
        fromDiscover: true,
      })),
    ];
    const used = (redeemedIssuances.data || []).map((row) => toPromoCardBenefit({
      id: row.id,
      offer: row.offers || {},
      issuance: row,
      issuerName: profiles.get(row.offers?.owner_user_id) || null,
      sharedBy: row.metadata?.contributor_id || row.metadata?.referrer_id
        ? { id: row.metadata.contributor_id || row.metadata.referrer_id, name: profiles.get(row.metadata.contributor_id || row.metadata.referrer_id) || 'Ambassador' }
        : null,
    }));

    const nearby = participating
      .filter(({ offer }) => remainingQuantity(offer.quantity_total, offer.quantity_reserved, offer.quantity_redeemed) !== 0)
      .filter(({ offer }) => !claimedOfferIds.has(offer.id))
      .slice(0, 6)
      .map(({ offer, drop }) => toPromoCardBenefit({
        id: offer.id,
        offer,
        drop: drop || {},
        issuerName: profiles.get(offer.owner_user_id) || null,
        sharedBy: drop?.creator_id
          ? { id: drop.creator_id, name: profiles.get(drop.creator_id) || 'Ambassador' }
          : null,
      }));

    const useThis = selectUseThis(benefits);
    const lastUsed = used[0] || null;
    const nextBenefit = selectNextBenefit(nearby, lastUsed || useThis);
    const repeatUse = summarizeRepeatUse(repeatRows);
    const attributed = used.some((row) => row.sharedBy?.id) || Number(repeatUse.contributorRewards.pointsAwarded) > 0;
    const loop = loopProgress({
      supplied: participating.length > 0 || benefits.length > 0,
      shared: benefits.some((row) => row.sharedBy?.id) || nearby.some((row) => row.sharedBy?.id),
      claimed: benefits.length > 0,
      validated: used.length > 0,
      attributed,
      returnReason: Boolean(nextBenefit),
    });

    const perks = benefits.map((benefit) => ({
      id: benefit.id,
      title: benefit.title,
      detail: benefit.detail,
      kind: benefit.issuer.type,
      status: benefit.fulfillmentState,
      redemptionCode: benefit.redemption.code,
      expiresAt: benefit.expiresAt,
      fulfillmentType: benefit.fulfillmentType,
      fulfillmentData: benefit.fulfillmentData,
      issuer: benefit.issuer,
      eligibility: benefit.eligibility,
      availableQuantity: benefit.availableQuantity,
      budget: benefit.budget,
      fulfillmentState: benefit.fulfillmentState,
      redemption: benefit.redemption,
      sharedBy: benefit.sharedBy,
      issuance: benefit.issuance,
      fromDiscover: Boolean(benefit.fromDiscover),
    }));

    return {
      name: displayName(person, 'there'),
      givenName: givenName(person),
      points: Number(wallet.points || 0),
      keys: Number(wallet.promokeys || 0),
      gems: Number(wallet.gems || 0),
      card: card.data || null,
      perks,
      benefits,
      used,
      useThis,
      nearby,
      nextBenefit,
      primaryAction: useThis ? 'use_this' : nextBenefit ? 'get_next_benefit' : nearby.length ? 'available_nearby' : 'get_next_benefit',
      loop,
      repeatUse,
      memberships: (memberships || []).map((row) => ({
        id: row.scene_id || row.scenes?.id,
        title: row.scenes?.title || 'Community',
        slug: row.scenes?.slug,
        role: row.role || 'member',
      })).filter((row) => row.id),
    };
  }

  async function getHome(userId, identity = {}) {
    const [roles, memberships, network, happened, perks, opportunities, wallet, card] = await Promise.all([
      platformRoles(userId),
      membershipsFor(userId),
      getNetwork(userId),
      getHappened(userId),
      getGiveablePerks(userId),
      getOpportunities(userId),
      getWallet(userId),
      getCard(userId),
    ]);

    const operatesHubs = (memberships || []).filter((row) => OPERATOR_ROLES.has(row.role) || row.scenes?.steward_id === userId).length;
    const contributorHubs = (memberships || []).filter((row) => CONTRIBUTOR_ROLES.has(row.role) || row.scenes?.steward_id === userId).length;
    const experienceRole = classifyExperienceRole({ operatesHubs, contributorHubs, platformRoles: roles });
    const person = await profileFor(userId, identity);
    const communities = (memberships || []).map((row) => ({
      id: row.scenes?.id || row.scene_id,
      slug: row.scenes?.slug,
      title: row.scenes?.title,
      imageUrl: row.scenes?.image_url,
      role: row.scenes?.steward_id === userId ? 'operator' : (row.role || 'member'),
      city: row.scenes?.city,
    })).filter((row) => row.id);

    const givenDrops = await maybe(db.from('community_drops').select('id').eq('creator_id', userId));
    const givenClaims = await maybe(db.from('community_drop_claims').select('id, status').eq('referrer_id', userId));
    const perksGiven = (givenDrops.data || []).length;
    const perksClaimed = (givenClaims.data || []).length;
    const perksUsed = (givenClaims.data || []).filter((row) => row.status === 'redeemed').length
      + Number(happened.buckets?.used || 0);
    const outcomes = accountStakeholderOutcomes({
      role: experienceRole,
      platformRoles: roles,
      people: network.people,
      peopleThisMonth: network.thisMonth,
      activePeople: network.topContributors.reduce((sum, row) => sum + Number(row.active || 0), 0),
      happening: happened.participated,
      earned: happened.earned,
      buckets: happened.buckets,
      perksGiven,
      perksClaimed,
      perksUsed,
      perksAvailable: perks.length,
      opportunities: opportunities.length,
      memberships: communities.length,
      cardPerks: (card.perks || []).length,
    });

    return {
      role: experienceRole,
      name: displayName(person, 'there'),
      givenName: givenName(person),
      communities,
      people: network.people,
      peopleThisMonth: network.thisMonth,
      earned: happened.earned,
      happening: happened.participated,
      perksAvailable: perks.length,
      opportunities: opportunities.length,
      wallet,
      card,
      perks: perks.slice(0, 6),
      opportunityItems: opportunities.slice(0, 4),
      happened,
      network,
      outcomes,
    };
  }

  async function createDrop(userId, payload) {
    if (!userId) throw new Error('Sign in to drop something');
    if (!payload?.title && !payload?.offerId && !payload?.kind) throw new Error('Choose what you want to give');

    let offerId = payload.offerId || null;
    if (!offerId && payload.kind && payload.title) {
      const rewardType = PERK_KIND_TO_REWARD[payload.kind] || 'other';
      const offer = await offerService.createOffer(userId, {
        title: payload.title,
        description: payload.description,
        image_url: payload.imageUrl,
        reward_type: rewardType,
        owner_type: payload.kind === 'merchant' ? 'merchant' : 'creator',
        quantity_total: payload.audienceLimit || payload.quantity || null,
        status: 'active',
        metadata: { presentation: 'drop', audience: payload.audience || 'everyone' },
        distributions: [{
          channel: 'direct',
          trigger_event: 'drop_claim',
          source_label: payload.title,
          allocation_limit: payload.audienceLimit || payload.quantity || null,
          qualification_rules: {},
        }],
      });
      offerId = offer.id;
      await maybe(db.from('offer_distributions').update({ presentation_mode: 'drop' }).eq('offer_id', offerId));
    }

    const remaining = payload.audienceLimit || payload.quantity || null;
    const slug = uniqueSlug(payload.title || payload.kind || 'drop');
    const inserted = await db.from('community_drops').insert({
      slug,
      creator_id: userId,
      scene_id: payload.sceneId || null,
      offer_id: offerId,
      perk_kind: payload.kind || 'custom',
      title: payload.title || 'A drop for your people',
      description: payload.description || null,
      image_url: payload.imageUrl || null,
      audience: payload.audience || 'everyone',
      audience_limit: remaining,
      remaining,
      status: 'active',
      claim_message: payload.claimMessage || null,
      attribution: {
        creator_id: userId,
        scene_id: payload.sceneId || null,
        moment_id: payload.momentId || payload.moment_id || null,
        source_opportunity_id: payload.sourceOpportunityId || null,
        source_kind: payload.sourceKind || null,
        source_id: payload.sourceId || null,
      },
    }).select().single();
    if (inserted.error) throw inserted.error;

    await recordVerifiedAction({
      userId,
      actionType: 'CUSTOM',
      sceneId: payload.sceneId || null,
      contributorId: userId,
      dropId: inserted.data.id,
      metadata: { kind: 'drop_created', title: inserted.data.title },
    });

    return inserted.data;
  }

  async function getDrop(slug) {
    const drop = await db.from('community_drops').select('*, scenes(title, slug)').eq('slug', slug).maybeSingle();
    if (drop.error) throw drop.error;
    if (!drop.data) return null;
    const creator = await profileFor(drop.data.creator_id);
    const claims = await maybe(db.from('community_drop_claims').select('id').eq('drop_id', drop.data.id));
    return {
      ...drop.data,
      creatorName: displayName(creator),
      claimedCount: (claims.data || []).length,
      remaining: drop.data.remaining,
    };
  }

  async function claimDrop(userId, slug) {
    if (!userId) throw new Error('Join to claim this');
    const claimed = await db.rpc('claim_community_drop_atomic', { p_user_id: userId, p_slug: slug });
    if (claimed.error) throw claimed.error;
    const result = claimed.data;
    const drop = result.drop;
    const claim = result.claim;
    const issuance = result.issuance || null;
    if (result.already_claimed) return { alreadyClaimed: true, drop, claim, issuance };

    if (drop.scene_id) {
      await joinScene({ userId, sceneId: drop.scene_id, invitedBy: drop.creator_id });
      await ensureHubAttribution({
        sceneId: drop.scene_id,
        memberUserId: userId,
        attributedByUserId: drop.creator_id,
        source: 'drop',
        sourceEntityType: 'community_drop',
        sourceEntityId: drop.id,
      });
    }

    const referralExisting = await maybe(
      db.from('user_referrals').select('id').eq('referrer_id', drop.creator_id).eq('referred_id', userId).maybeSingle(),
    );
    if (!referralExisting.data && drop.creator_id !== userId) {
      await maybe(db.from('user_referrals').insert({
        referrer_id: drop.creator_id,
        referred_id: userId,
        status: 'active',
      }));
    }

    await recordVerifiedAction({
      userId,
      actionType: 'PERK_CLAIM',
      sceneId: drop.scene_id,
      contributorId: drop.creator_id,
      referrerId: drop.creator_id,
      dropId: drop.id,
      verificationMethod: 'claim',
      metadata: { slug: drop.slug, title: drop.title },
    });

    return { drop, claim, issuance };
  }

  async function takeOpportunity(userId, opportunityId, sceneId) {
    if (!opportunityId) throw new Error('Choose an opportunity');
    const [kind, sourceId] = String(opportunityId).split(':');
    const opportunities = await getOpportunities(userId, sceneId);
    const match = opportunities.find((item) => item.id === opportunityId);
    if (!match) throw new Error('That opportunity is no longer available');

    const drop = await createDrop(userId, {
      offerId: kind === 'offer' ? sourceId : null,
      kind: kind === 'offer' ? 'merchant' : 'custom',
      title: match.title,
      description: match.description,
      audience: 'everyone',
      sceneId: sceneId || match.sceneId,
      claimMessage: `${match.title} is waiting on your PromoCard.`,
      sourceOpportunityId: opportunityId,
      sourceKind: kind,
      sourceId,
    });
    return { opportunity: match, drop };
  }

  async function provideInventory(userId, payload) {
    if (!userId) throw new Error('Sign in to put something up');
    const title = String(payload?.title || '').trim();
    if (!title) throw new Error('What do people get?');
    const rawQuantity = payload.quantity;
    const quantity = rawQuantity == null || rawQuantity === ''
      ? null
      : Math.max(1, Number(rawQuantity) || 0);
    const kind = payload.kind || 'merchant';
    const peopleGet = String(payload.peopleGet || title).trim();
    const youEarn = String(payload.youEarn || 'Earn when people claim or use this').trim();
    const rewardType = PERK_KIND_TO_REWARD[kind] || 'product';
    const metadata = {
      presentation: 'opportunity',
      people_get: peopleGet,
      you_earn: youEarn,
      contributor_earn: youEarn,
    };

    const offer = await offerService.createOffer(userId, {
      title,
      description: payload.description || peopleGet,
      reward_type: rewardType,
      owner_type: 'merchant',
      quantity_total: quantity,
      status: 'active',
      fulfillment_type: 'merchant_validation',
      metadata,
      distributions: [{
        channel: 'direct',
        trigger_event: 'opportunity_take',
        source_label: title,
        allocation_limit: quantity,
        qualification_rules: {},
      }],
    });

    await recordVerifiedAction({
      userId,
      actionType: 'CUSTOM',
      merchantId: userId,
      sceneId: payload.sceneId || null,
      contributorId: userId,
      metadata: { kind: 'inventory_opened', title, quantity },
    });

    return {
      offer,
      opportunity: {
        id: `offer:${offer.id}`,
        sourceKind: 'offer',
        sourceId: offer.id,
        title: offer.title,
        peopleGet,
        youEarn,
        remaining: quantity,
      },
    };
  }

  async function getHub(slug, userId) {
    const scene = await db.from('scenes').select('*').eq('slug', slug).maybeSingle();
    if (scene.error) throw scene.error;
    if (!scene.data) return null;

    const members = await maybe(db.from('scene_memberships').select('*').eq('scene_id', scene.data.id).eq('membership_state', 'active'));
    const memberships = members.data || [];

    const week = weekStart();
    const weekActions = await maybe(
      db.from('verified_actions').select('id, user_id').eq('scene_id', scene.data.id).gte('verified_at', week),
    );
    const drops = await maybe(
      db.from('community_drops').select('*').eq('scene_id', scene.data.id).eq('status', 'active').order('created_at', { ascending: false }).limit(8),
    );
    const opportunities = await getOpportunities(userId, scene.data.id);
    const moments = await maybe(
      db.from('moment_scene_links').select('relationship, moments(*)').eq('scene_id', scene.data.id).limit(8),
    );

    let membership = null;
    if (userId) {
      membership = memberships.find((row) => row.user_id === userId) || null;
    }

    const operator = scene.data.steward_id ? await profileFor(scene.data.steward_id) : null;
    const contributors = memberships
      .filter((row) => CONTRIBUTOR_ROLES.has(row.role || ''))
      .slice(0, 12);

    return {
      scene: scene.data,
      people: memberships.length || scene.data.activated_members_count || 0,
      activeThisWeek: new Set((weekActions.data || []).map((row) => row.user_id)).size,
      operator: operator ? { id: operator.id, name: displayName(operator) } : null,
      membership,
      role: membership
        ? (scene.data.steward_id === userId ? 'operator' : (CONTRIBUTOR_ROLES.has(membership.role) ? 'contributor' : 'member'))
        : null,
      perks: drops.data || [],
      opportunities: opportunities.slice(0, 6),
      moments: (moments.data || []).map((link) => link.moments).filter(Boolean),
      contributors,
    };
  }

  async function contributeToHub(userId, slug, kind = 'contributor') {
    const hub = await getHub(slug, userId);
    if (!hub) throw new Error('Community not found');
    const role = kind === 'operator' ? 'contributor' : (kind || 'contributor');
    await joinScene({ userId, sceneId: hub.scene.id, role: role === 'member' ? 'member' : 'contributor' });
    await recordVerifiedAction({
      userId,
      actionType: 'CUSTOM',
      sceneId: hub.scene.id,
      contributorId: userId,
      metadata: { kind: 'hub_contribute' },
    });
    return getHub(slug, userId);
  }

  async function inviteToHub(userId, slug) {
    const hub = await getHub(slug, userId);
    if (!hub) throw new Error('Community not found');
    const user = await maybe(db.from('users').select('primary_referral_code').eq('id', userId).maybeSingle());
    let code = user.data?.primary_referral_code;
    if (!code) {
      code = `PR-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      await maybe(db.from('users').update({ primary_referral_code: code }).eq('id', userId));
    }
    const appUrl = process.env.APP_URL || 'https://promorang.co';
    return {
      code,
      shareUrl: `${appUrl}/scenes/${hub.scene.slug}?ref=${encodeURIComponent(code)}`,
      scene: hub.scene,
    };
  }

  async function startCommunity(userId, payload) {
    if (!userId) throw new Error('Sign in to start a community');
    if (!payload?.name) throw new Error('What should we call it?');
    const slug = uniqueSlug(payload.name);
    const inserted = await db.from('scenes').insert({
      slug,
      title: payload.name,
      description: payload.description || `${payload.name} — a community on PROMORANG.`,
      city: payload.city || payload.location || null,
      country: payload.country || 'Jamaica',
      visibility: 'public',
      status: 'active',
      steward_id: userId,
      metadata: {
        theme: payload.theme || 'other',
        reach: payload.reach || [],
        welcome: `Welcome to ${payload.name}.`,
      },
    }).select().single();
    if (inserted.error) throw inserted.error;

    await joinScene({ userId, sceneId: inserted.data.id, role: 'operator' });
    await recordVerifiedAction({
      userId,
      actionType: 'CUSTOM',
      sceneId: inserted.data.id,
      contributorId: userId,
      metadata: { kind: 'community_started', theme: payload.theme },
    });

    const [perks, opportunities, invite] = await Promise.all([
      getGiveablePerks(userId),
      getOpportunities(userId, inserted.data.id),
      inviteToHub(userId, slug),
    ]);

    return {
      scene: inserted.data,
      firstValue: {
        perk: perks[0] || null,
        opportunity: opportunities[0] || null,
        invite,
      },
    };
  }

  async function unlockDiscover(userId, payload) {
    if (!payload?.pollId || !payload?.question) throw new Error('Answer a live question first.');
    const perkTitle = String(payload.perkTitle || payload.targetUnlockPerk || 'City perk').replace(/^[^\w]+/, '').trim() || 'City perk';
    const existing = await maybe(
      db.from('discovery_card_unlocks').select('*').eq('user_id', userId).eq('poll_id', payload.pollId).maybeSingle(),
    );
    if (existing.data) {
      return {
        id: existing.data.id,
        redemptionCode: existing.data.redemption_code,
        perkTitle: existing.data.perk_title,
        alreadyOnCard: true,
      };
    }
    const code = `PR-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const inserted = await maybe(db.from('discovery_card_unlocks').insert({
      city: payload.city || 'Kingston & St. Andrew',
      poll_id: payload.pollId,
      poll_question: payload.question,
      perk_title: perkTitle,
      query_raw: payload.query || null,
      user_id: userId,
      redemption_code: code,
      status: 'claimed',
    }).select().maybeSingle());
    if (inserted.error && !String(inserted.error.message || '').includes('duplicate')) throw inserted.error;
    const saved = inserted.data || (await maybe(
      db.from('discovery_card_unlocks').select('*').eq('user_id', userId).eq('poll_id', payload.pollId).maybeSingle(),
    )).data;
    if (!saved) throw new Error('Could not put that on the card yet.');
    await recordVerifiedAction({
      userId,
      actionType: 'DISCOVERY_RESPONSE',
      metadata: { kind: 'discover_answer', poll_id: payload.pollId, question: payload.question },
    });
    await recordVerifiedAction({
      userId,
      actionType: 'PERK_CLAIM',
      metadata: { kind: 'discover_card_unlock', poll_id: payload.pollId, perk_title: perkTitle },
    });
    return {
      id: saved.id,
      redemptionCode: saved.redemption_code,
      perkTitle: saved.perk_title,
      alreadyOnCard: Boolean(existing.data),
    };
  }

  function foundWordsKey(value) {
    return String(value || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !['and', 'for', 'the', 'with'].includes(word))
      .sort()
      .join(' ');
  }

  function mapFoundListing(row, userId) {
    if (!row) return null;
    return {
      id: row.id,
      city: row.city,
      kind: row.kind,
      title: row.title,
      words: row.words,
      whereHint: row.where_hint,
      perkToFinder: row.perk_to_finder,
      namedCount: row.named_count,
      status: row.status,
      claimedAt: row.claimed_at,
      createdAt: row.created_at,
      youFound: Boolean(userId && row.finder_user_id === userId),
    };
  }

  async function putUpFound(userId, payload) {
    const title = String(payload?.title || '').trim();
    if (title.length < 3) throw new Error('What did you find?');
    const kind = payload?.kind === 'place' ? 'place' : 'moment';
    const words = String(payload?.words || title).trim();
    const city = String(payload?.city || 'Kingston & St. Andrew').trim() || 'Kingston & St. Andrew';
    const perkTitle = String(payload?.perkToFinder || '').trim()
      || (kind === 'place' ? 'First table when the house claims this' : 'A door pass when a host claims this');
    const key = foundWordsKey(words);
    if (!key) throw new Error('Name the place or the night.');

    const existing = await maybe(
      db.from('found_listings').select('*').eq('city', city).eq('words_key', key).eq('status', 'unclaimed').maybeSingle(),
    );
    if (existing.data) {
      const updated = await maybe(
        db.from('found_listings').update({ named_count: Number(existing.data.named_count || 1) + 1 }).eq('id', existing.data.id).select().maybeSingle(),
      );
      return mapFoundListing(updated.data || existing.data, userId);
    }

    const inserted = await maybe(db.from('found_listings').insert({
      city,
      kind,
      title,
      words,
      words_key: key,
      where_hint: payload?.whereHint || null,
      perk_to_finder: perkTitle,
      finder_user_id: userId,
      named_count: 1,
      status: 'unclaimed',
    }).select().maybeSingle());
    if (inserted.error && !String(inserted.error.message || '').includes('duplicate')) throw inserted.error;
    const saved = inserted.data || (await maybe(
      db.from('found_listings').select('*').eq('city', city).eq('words_key', key).eq('status', 'unclaimed').maybeSingle(),
    )).data;
    if (!saved) throw new Error('Could not put that up yet.');
    await recordVerifiedAction({
      userId,
      actionType: 'CUSTOM',
      metadata: { kind: 'found_listing', title, words },
    });
    return mapFoundListing(saved, userId);
  }

  async function listFound(userId, city) {
    const hub = String(city || 'Kingston & St. Andrew').trim() || 'Kingston & St. Andrew';
    const rows = await maybe(
      db.from('found_listings').select('*').eq('city', hub).order('named_count', { ascending: false }).limit(40),
    );
    return (rows.data || []).map((row) => mapFoundListing(row, userId)).filter(Boolean);
  }

  async function claimFound(userId, listingId) {
    if (!listingId) throw new Error('Which place or night is yours?');
    const existing = await maybe(db.from('found_listings').select('*').eq('id', listingId).maybeSingle());
    if (!existing.data) throw new Error('That find is not on the table.');
    if (existing.data.status === 'claimed') {
      return { ...mapFoundListing(existing.data, userId), keep: 'workspace', alreadyClaimed: true };
    }

    const updated = await maybe(db.from('found_listings').update({
      status: 'claimed',
      claimant_user_id: userId,
      claimed_at: new Date().toISOString(),
    }).eq('id', listingId).eq('status', 'unclaimed').select().maybeSingle());
    const saved = updated.data || existing.data;
    const finderId = saved.finder_user_id;
    const prospect = finderId && finderId === userId;
    if (!prospect && (finderId || saved.finder_anon_id)) {
      const code = `PR-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      await maybe(db.from('discovery_card_unlocks').insert({
        city: saved.city,
        poll_id: String(saved.id).startsWith('found:') ? saved.id : `found:${saved.id}`,
        poll_question: saved.title,
        perk_title: saved.perk_to_finder,
        query_raw: saved.words,
        user_id: finderId || null,
        anonymous_id: finderId ? null : saved.finder_anon_id,
        redemption_code: code,
        status: 'claimed',
      }));
      await recordVerifiedAction({
        userId,
        actionType: 'PERK_CLAIM',
        metadata: { kind: 'finder_slip', listing_id: saved.id, perk_title: saved.perk_to_finder },
      });
    }
    await recordVerifiedAction({
      userId,
      actionType: 'CUSTOM',
      metadata: { kind: 'found_claimed', listing_id: saved.id, title: saved.title },
    });
    return {
      ...mapFoundListing(saved, userId),
      keep: prospect ? 'workspace' : 'slip',
      alreadyClaimed: false,
    };
  }

  async function createAsk(userId, payload) {
    if (!payload?.question) throw new Error('What do you want to ask?');
    const inserted = await maybe(db.from('discovery_questions').insert({
      scene_id: payload.sceneId || null,
      question: payload.question,
      category: payload.category || payload.theme || 'community',
      author_name: payload.authorName || 'Community',
      threshold_for_moment: payload.threshold || 25,
    }).select().maybeSingle());
    if (inserted.error) throw inserted.error;
    await recordVerifiedAction({
      userId,
      actionType: 'CUSTOM',
      sceneId: payload.sceneId || null,
      contributorId: userId,
      metadata: { kind: 'ask_created', question: payload.question },
    });
    return inserted.data;
  }

  return {
    classifyExperienceRole,
    contributorValueScore,
    happenedBuckets,
    getHome,
    getNetwork,
    getGiveablePerks,
    getOpportunities,
    getHappened,
    getCard,
    getNearbyBenefits,
    createDrop,
    getDrop,
    claimDrop,
    takeOpportunity,
    provideInventory,
    getHub,
    contributeToHub,
    inviteToHub,
    startCommunity,
    createAsk,
    unlockDiscover,
    putUpFound,
    listFound,
    claimFound,
    joinScene,
    recordVerifiedAction,
    ensureHubAttribution,
    bumpContributorStats,
    awardContributorOnRedemption,
    accountStakeholderOutcomes,
  };
}

module.exports = createPeopleExperienceService();
module.exports.createPeopleExperienceService = createPeopleExperienceService;
module.exports.classifyExperienceRole = classifyExperienceRole;
module.exports.contributorValueScore = contributorValueScore;
module.exports.happenedBuckets = happenedBuckets;
module.exports.classifyHappenedBucket = classifyHappenedBucket;
module.exports.attributionFromMetadata = attributionFromMetadata;
module.exports.accountStakeholderOutcomes = accountStakeholderOutcomes;
module.exports.displayName = displayName;
module.exports.givenName = givenName;
module.exports.toPromoCardBenefit = toPromoCardBenefit;
module.exports.canUseBenefit = canUseBenefit;
module.exports.selectUseThis = selectUseThis;
module.exports.selectNextBenefit = selectNextBenefit;
module.exports.summarizeRepeatUse = summarizeRepeatUse;
module.exports.contributorRewardAmount = contributorRewardAmount;
module.exports.loopProgress = loopProgress;
module.exports.remainingQuantity = remainingQuantity;
module.exports.fulfillmentFromStatus = fulfillmentFromStatus;
