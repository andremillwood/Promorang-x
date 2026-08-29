/**
 * People-first Moments: create, join, invite, claim, perks, Plans, activity.
 * Reuses moments, moment_participants, content_missions, moment_media, economy, PromoShare.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const economyService = require('./economyService');
const promoShareService = require('./promoShareService');

const supabase = global.supabase || serviceSupabase || null;

const REWARD_POINTS = {
  'moment.created': 15,
  'moment.joined': 5,
  'invite.sent': 5,
  'invite.accepted': 10,
  'content.submitted': 10,
  'mission.completed': 15,
  'perk.claimed': 5,
};

function db() {
  if (!supabase) throw new Error('Database not available');
  return supabase;
}

async function recordEvent(payload) {
  const { data, error } = await db()
    .from('activity_events')
    .insert({
      event_name: payload.event_name,
      actor_user_id: payload.actor_user_id || null,
      moment_id: payload.moment_id || null,
      plan_id: payload.plan_id || null,
      mission_id: payload.mission_id || null,
      perk_id: payload.perk_id || null,
      invite_id: payload.invite_id || null,
      stakeholder_id: payload.stakeholder_id || null,
      invited_by_user_id: payload.invited_by_user_id || null,
      referral_code: payload.referral_code || null,
      source: payload.source || null,
      campaign: payload.campaign || null,
      metadata: payload.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.warn('[peopleMoments] activity_events insert failed', error.message);
    return null;
  }
  return data;
}

async function maybeReward(userId, eventName, referenceId, description) {
  const points = REWARD_POINTS[eventName];
  if (!userId || !points || !referenceId) return null;

  try {
    await economyService.addCurrency(
      userId,
      'points',
      points,
      eventName,
      referenceId,
      description || eventName
    );
  } catch (error) {
    console.warn('[peopleMoments] reward skipped', eventName, error.message);
  }

  try {
    if (eventName === 'moment.joined' || eventName === 'mission.completed' || eventName === 'invite.accepted') {
      await promoShareService.awardTicket(userId, eventName, referenceId, 1.0);
    }
  } catch (error) {
    console.warn('[peopleMoments] PromoShare ticket skipped', eventName, error.message);
  }

  return points;
}

function resolveStatus({ hereNow, startsAt, endsAt }) {
  const now = Date.now();
  const start = startsAt ? new Date(startsAt).getTime() : now;
  const end = endsAt ? new Date(endsAt).getTime() : null;
  if (hereNow && !(end && end < now)) return { status: 'active', pulse_state: 'live', is_active: true };
  if (end && end < now) return { status: 'closed', pulse_state: 'cooling', is_active: false };
  if (start <= now) return { status: 'active', pulse_state: 'live', is_active: true };
  const hours = (start - now) / 36e5;
  if (hours <= 48) return { status: 'joinable', pulse_state: 'forming', is_active: true };
  return { status: 'scheduled', pulse_state: 'forming', is_active: true };
}

function privacyToVisibility(privacy) {
  if (privacy === 'invite_only') return 'invite';
  if (privacy === 'unlisted') return 'private';
  return 'open';
}

function originFromPrivacy(privacy, officialHost) {
  if (officialHost) return 'hosted';
  if (privacy === 'invite_only') return 'crew';
  return 'community';
}

async function createMoment(userId, input = {}) {
  const title = String(input.title || '').trim();
  const location = String(input.location || input.location_name || '').trim();
  if (!title) {
    const error = new Error('What are you doing?');
    error.statusCode = 400;
    throw error;
  }
  if (!location) {
    const error = new Error('Where?');
    error.statusCode = 400;
    throw error;
  }

  const hereNow = Boolean(input.here_now || input.hereNow);
  const privacy = input.privacy || 'public';
  const originType = input.origin_type || input.originType || originFromPrivacy(privacy, Boolean(input.official_host || input.officialHost));
  const startsAt = hereNow ? new Date().toISOString() : input.starts_at || input.startsAt;
  if (!startsAt) {
    const error = new Error('When?');
    error.statusCode = 400;
    throw error;
  }

  const resolved = resolveStatus({ hereNow, startsAt, endsAt: input.ends_at || input.endsAt });
  const row = {
    title,
    description: input.description || null,
    location,
    venue_name: input.venue_name || input.venueName || location,
    image_url: input.image_url || input.imageUrl || null,
    starts_at: startsAt,
    ends_at: input.ends_at || input.endsAt || null,
    host_id: userId,
    creator_user_id: userId,
    creative_owner_id: userId,
    origin_type: originType,
    here_now: hereNow,
    visibility: privacyToVisibility(privacy),
    claim_status: 'unclaimed',
    claimed_by_stakeholder_id: null,
    plan_id: input.plan_id || input.planId || null,
    status: resolved.status,
    is_active: resolved.is_active,
    pulse_state: resolved.pulse_state,
    category: input.category || 'Community Gathering',
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
  };

  const { data: moment, error } = await db().from('moments').insert(row).select().single();
  if (error) throw error;

  await db().from('moment_participants').insert({
    moment_id: moment.id,
    user_id: userId,
    status: 'joined',
    source: input.source || 'create',
    campaign: input.campaign || null,
    plan_id: row.plan_id,
  });

  if (input.scene_id || input.sceneId) {
    await db().from('moment_scene_links').insert({
      moment_id: moment.id,
      scene_id: input.scene_id || input.sceneId,
      relationship: 'origin',
    });
  }

  try {
    await db().rpc('seed_people_moment_prompts', {
      p_moment_id: moment.id,
      p_owner_id: userId,
    });
  } catch (seedError) {
    console.warn('[peopleMoments] prompt seed skipped', seedError.message);
  }

  const event = await recordEvent({
    event_name: 'moment.created',
    actor_user_id: userId,
    moment_id: moment.id,
    plan_id: row.plan_id,
    source: input.source || 'create',
    campaign: input.campaign || null,
    metadata: { origin_type: originType, here_now: hereNow, privacy },
  });
  await maybeReward(userId, 'moment.created', event?.id || moment.id, `Created moment: ${title}`);

  return moment;
}

async function joinMoment(userId, momentId, attribution = {}) {
  const { data: moment, error: momentError } = await db().from('moments').select('*').eq('id', momentId).maybeSingle();
  if (momentError) throw momentError;
  if (!moment) {
    const error = new Error('Moment not found');
    error.statusCode = 404;
    throw error;
  }

  const { data: existing } = await db()
    .from('moment_participants')
    .select('*')
    .eq('moment_id', momentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing && existing.status !== 'cancelled') {
    return { moment, participation: existing, already_joined: true };
  }

  const participationRow = {
    moment_id: momentId,
    user_id: userId,
    status: 'joined',
    invited_by_user_id: attribution.invited_by_user_id || attribution.invitedBy || null,
    referral_code: attribution.referral_code || attribution.referralCode || null,
    source: attribution.source || null,
    campaign: attribution.campaign || null,
    plan_id: attribution.plan_id || attribution.planId || moment.plan_id || null,
  };

  let participation;
  if (existing) {
    const { data, error } = await db()
      .from('moment_participants')
      .update({ status: 'joined', ...participationRow })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    participation = data;
  } else {
    const { data, error } = await db()
      .from('moment_participants')
      .insert(participationRow)
      .select()
      .single();
    if (error) throw error;
    participation = data;
  }

  if (attribution.invite_id || attribution.inviteId) {
    await db()
      .from('moment_invites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString(), invited_user_id: userId })
      .eq('id', attribution.invite_id || attribution.inviteId);
  } else if (attribution.invite_token || attribution.inviteToken) {
    await db()
      .from('moment_invites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString(), invited_user_id: userId })
      .eq('token', attribution.invite_token || attribution.inviteToken);
  }

  const event = await recordEvent({
    event_name: 'moment.joined',
    actor_user_id: userId,
    moment_id: momentId,
    plan_id: participationRow.plan_id,
    invited_by_user_id: participationRow.invited_by_user_id,
    referral_code: participationRow.referral_code,
    source: participationRow.source,
    campaign: participationRow.campaign,
    metadata: { already_joined: false },
  });
  await maybeReward(userId, 'moment.joined', event?.id || participation.id, `Joined moment: ${moment.title}`);

  if (participationRow.invited_by_user_id && participationRow.invited_by_user_id !== userId) {
    const accepted = await recordEvent({
      event_name: 'invite.accepted',
      actor_user_id: userId,
      moment_id: momentId,
      invited_by_user_id: participationRow.invited_by_user_id,
      referral_code: participationRow.referral_code,
      source: participationRow.source,
      campaign: participationRow.campaign,
    });
    await maybeReward(
      participationRow.invited_by_user_id,
      'invite.accepted',
      accepted?.id || participation.id,
      'Friend joined your Moment'
    );
  }

  return { moment, participation, already_joined: false };
}

async function listParticipants(momentId) {
  const { data: rows, error } = await db()
    .from('moment_participants')
    .select('id, user_id, status, invited_by_user_id, source, joined_at, created_at')
    .eq('moment_id', momentId)
    .neq('status', 'cancelled')
    .order('joined_at', { ascending: true });
  if (error) throw error;

  const userIds = [...new Set((rows || []).map((row) => row.user_id).filter(Boolean))];
  let profiles = [];
  if (userIds.length) {
    const { data } = await db()
      .from('profiles')
      .select('id, user_id, display_name, username, avatar_url')
      .or(`id.in.(${userIds.join(',')}),user_id.in.(${userIds.join(',')})`);
    profiles = data || [];
  }

  return (rows || []).map((row) => {
    const profile = profiles.find((item) => item.id === row.user_id || item.user_id === row.user_id);
    return {
      ...row,
      display_name: profile?.display_name || profile?.username || 'Someone',
      avatar_url: profile?.avatar_url || null,
    };
  });
}

async function invite({ userId, targetType, momentId, planId, missionId, invitedUserId, inviteeContact, referralCode, source, campaign }) {
  const { data: invite, error } = await db()
    .from('moment_invites')
    .insert({
      target_type: targetType || (planId ? 'plan' : missionId ? 'mission' : 'moment'),
      moment_id: momentId || null,
      plan_id: planId || null,
      mission_id: missionId || null,
      invited_by_user_id: userId,
      invited_user_id: invitedUserId || null,
      invitee_contact: inviteeContact || null,
      referral_code: referralCode || null,
      source: source || 'share',
      campaign: campaign || null,
    })
    .select()
    .single();
  if (error) throw error;

  await recordEvent({
    event_name: 'invite.sent',
    actor_user_id: userId,
    moment_id: momentId || null,
    plan_id: planId || null,
    mission_id: missionId || null,
    invite_id: invite.id,
    invited_by_user_id: userId,
    referral_code: referralCode || null,
    source: source || 'share',
    campaign: campaign || null,
  });
  await maybeReward(userId, 'invite.sent', invite.id, 'Invited someone');

  return invite;
}

async function markInviteOpened(token) {
  const { data, error } = await db()
    .from('moment_invites')
    .update({ status: 'opened', opened_at: new Date().toISOString() })
    .eq('token', token)
    .eq('status', 'sent')
    .select()
    .maybeSingle();
  if (error) throw error;
  if (data) {
    await recordEvent({
      event_name: 'invite.opened',
      actor_user_id: data.invited_user_id,
      moment_id: data.moment_id,
      plan_id: data.plan_id,
      invite_id: data.id,
      invited_by_user_id: data.invited_by_user_id,
      referral_code: data.referral_code,
      source: data.source,
      campaign: data.campaign,
    });
  }
  return data;
}

async function submitContent(userId, momentId, input = {}) {
  const { data: media, error } = await db()
    .from('moment_media')
    .insert({
      moment_id: momentId,
      user_id: userId,
      media_type: input.media_type || input.mediaType || 'image',
      media_url: input.media_url || input.mediaUrl,
      caption: input.caption || null,
      moderation_status: 'approved',
    })
    .select()
    .single();
  if (error) throw error;

  const event = await recordEvent({
    event_name: 'content.submitted',
    actor_user_id: userId,
    moment_id: momentId,
    mission_id: input.mission_id || input.missionId || null,
    source: input.source || 'moment_story',
    metadata: { caption: input.caption || null },
  });
  await maybeReward(userId, 'content.submitted', event?.id || media.id, 'Shared a Moment story');
  return media;
}

async function requestClaim(userId, momentId, input = {}) {
  const { data: claim, error } = await db()
    .from('moment_claims')
    .insert({
      moment_id: momentId,
      requested_by_user_id: userId,
      stakeholder_id: input.stakeholder_id || input.stakeholderId || null,
      note: input.note || null,
      status: 'claim_requested',
    })
    .select()
    .single();
  if (error) throw error;

  await db()
    .from('moments')
    .update({
      claim_status: 'claim_requested',
      claimed_by_stakeholder_id: input.stakeholder_id || input.stakeholderId || null,
    })
    .eq('id', momentId);

  await recordEvent({
    event_name: 'moment.claim_requested',
    actor_user_id: userId,
    moment_id: momentId,
    stakeholder_id: input.stakeholder_id || input.stakeholderId || null,
    metadata: { note: input.note || null },
  });
  return claim;
}

async function verifyClaim(userId, claimId) {
  const { data: claim, error } = await db().from('moment_claims').select('*').eq('id', claimId).maybeSingle();
  if (error) throw error;
  if (!claim) {
    const notFound = new Error('Claim not found');
    notFound.statusCode = 404;
    throw notFound;
  }

  const { data: updated, error: updateError } = await db()
    .from('moment_claims')
    .update({
      status: 'verified',
      reviewed_by_user_id: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', claimId)
    .select()
    .single();
  if (updateError) throw updateError;

  await db()
    .from('moments')
    .update({
      claim_status: 'verified',
      claimed_by_stakeholder_id: claim.stakeholder_id,
    })
    .eq('id', claim.moment_id);

  await recordEvent({
    event_name: 'moment.claimed',
    actor_user_id: userId,
    moment_id: claim.moment_id,
    stakeholder_id: claim.stakeholder_id,
    metadata: { claim_id: claimId },
  });
  return updated;
}

async function attachPerk(userId, momentId, input = {}) {
  const { data: moment, error: momentError } = await db().from('moments').select('*').eq('id', momentId).maybeSingle();
  if (momentError) throw momentError;
  if (!moment) {
    const error = new Error('Moment not found');
    error.statusCode = 404;
    throw error;
  }

  const isHost = moment.host_id === userId || moment.creator_user_id === userId;
  const claimed = moment.claim_status === 'verified';
  if (!isHost && !claimed) {
    const error = new Error('Claim this Moment before adding a perk');
    error.statusCode = 403;
    throw error;
  }

  const { data: perk, error } = await db()
    .from('moment_perks')
    .insert({
      moment_id: momentId,
      created_by_user_id: userId,
      stakeholder_id: input.stakeholder_id || moment.claimed_by_stakeholder_id || null,
      title: String(input.title || '').trim(),
      description: input.description || null,
      perk_kind: input.perk_kind || input.perkKind || 'offer',
      value_label: input.value_label || input.valueLabel || null,
      quantity_limit: input.quantity_limit || input.quantityLimit || null,
      status: 'live',
    })
    .select()
    .single();
  if (error) throw error;
  return perk;
}

async function claimPerk(userId, perkId) {
  const { data: perk, error: perkError } = await db().from('moment_perks').select('*').eq('id', perkId).maybeSingle();
  if (perkError) throw perkError;
  if (!perk || perk.status !== 'live') {
    const error = new Error('Perk is not available');
    error.statusCode = 404;
    throw error;
  }

  const code = `PRK-${Date.now().toString(36).toUpperCase()}`;
  const { data: claim, error } = await db()
    .from('moment_perk_claims')
    .insert({
      perk_id: perkId,
      moment_id: perk.moment_id,
      user_id: userId,
      status: 'claimed',
      redemption_code: code,
    })
    .select()
    .single();
  if (error) throw error;

  await db()
    .from('moment_perks')
    .update({ claimed_count: Number(perk.claimed_count || 0) + 1 })
    .eq('id', perkId);

  const event = await recordEvent({
    event_name: 'perk.claimed',
    actor_user_id: userId,
    moment_id: perk.moment_id,
    perk_id: perkId,
    stakeholder_id: perk.stakeholder_id,
  });
  await maybeReward(userId, 'perk.claimed', event?.id || claim.id, `Claimed perk: ${perk.title}`);
  return { perk, claim };
}

async function createPlan(userId, input = {}) {
  const title = String(input.title || '').trim() || 'What are we doing?';
  const { data: plan, error } = await db()
    .from('social_plans')
    .insert({
      creator_user_id: userId,
      scene_id: input.scene_id || input.sceneId || null,
      title,
      description: input.description || null,
      window_starts_at: input.window_starts_at || input.windowStartsAt || null,
      window_ends_at: input.window_ends_at || input.windowEndsAt || null,
      location_hint: input.location_hint || input.locationHint || null,
      privacy: input.privacy || 'invite_only',
      status: 'open',
    })
    .select()
    .single();
  if (error) throw error;

  await db().from('social_plan_members').insert({
    plan_id: plan.id,
    user_id: userId,
    invited_by_user_id: userId,
    role: 'creator',
    status: 'joined',
    source: input.source || 'create',
  });

  const starterOptions = Array.isArray(input.options) ? input.options : [];
  if (starterOptions.length) {
    await db().from('social_plan_options').insert(
      starterOptions.map((option, index) => ({
        plan_id: plan.id,
        suggested_by_user_id: userId,
        title: typeof option === 'string' ? option : option.title,
        note: typeof option === 'string' ? null : option.note || null,
        related_moment_id: typeof option === 'string' ? null : option.related_moment_id || null,
        sort_order: index,
      }))
    );
  }

  await recordEvent({
    event_name: 'plan.created',
    actor_user_id: userId,
    plan_id: plan.id,
    source: input.source || 'create',
    metadata: { title },
  });
  return getPlan(plan.id, userId);
}

async function getPlan(planId) {
  const { data: plan, error } = await db().from('social_plans').select('*').eq('id', planId).maybeSingle();
  if (error) throw error;
  if (!plan) return null;
  const [{ data: members }, { data: options }, { data: votes }] = await Promise.all([
    db().from('social_plan_members').select('*').eq('plan_id', planId),
    db().from('social_plan_options').select('*').eq('plan_id', planId).order('sort_order'),
    db().from('social_plan_votes').select('*').eq('plan_id', planId),
  ]);
  return { ...plan, members: members || [], options: options || [], votes: votes || [] };
}

async function addPlanOption(userId, planId, input = {}) {
  const { data: option, error } = await db()
    .from('social_plan_options')
    .insert({
      plan_id: planId,
      suggested_by_user_id: userId,
      title: String(input.title || '').trim(),
      note: input.note || null,
      related_moment_id: input.related_moment_id || input.relatedMomentId || null,
    })
    .select()
    .single();
  if (error) throw error;
  await db().from('social_plans').update({ status: 'voting' }).eq('id', planId).eq('status', 'open');
  await recordEvent({
    event_name: 'plan.option_added',
    actor_user_id: userId,
    plan_id: planId,
    metadata: { option_id: option.id, title: option.title },
  });
  return option;
}

async function votePlanOption(userId, planId, optionId) {
  const { data, error } = await db()
    .from('social_plan_votes')
    .upsert({ plan_id: planId, option_id: optionId, user_id: userId }, { onConflict: 'plan_id,user_id' })
    .select()
    .single();
  if (error) throw error;
  await recordEvent({
    event_name: 'plan.vote_cast',
    actor_user_id: userId,
    plan_id: planId,
    metadata: { option_id: optionId },
  });
  return data;
}

async function convertPlanToMoment(userId, planId, input = {}) {
  const plan = await getPlan(planId);
  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    throw error;
  }
  if (plan.creator_user_id !== userId) {
    const error = new Error('Only the person who started this Plan can turn it into a Moment');
    error.statusCode = 403;
    throw error;
  }

  const counts = new Map();
  for (const vote of plan.votes) {
    counts.set(vote.option_id, (counts.get(vote.option_id) || 0) + 1);
  }
  let winner = plan.options[0] || null;
  let best = -1;
  for (const option of plan.options) {
    const count = counts.get(option.id) || 0;
    if (count > best) {
      winner = option;
      best = count;
    }
  }

  const title = input.title || winner?.title || plan.title;
  const location = input.location || plan.location_hint || 'TBD';
  const moment = await createMoment(userId, {
    title,
    location,
    here_now: Boolean(input.here_now || input.hereNow),
    starts_at: input.starts_at || input.startsAt || plan.window_starts_at,
    privacy: plan.privacy === 'public' ? 'public' : 'invite_only',
    description: plan.description,
    scene_id: plan.scene_id,
    plan_id: plan.id,
    source: 'plan',
  });

  await db()
    .from('social_plans')
    .update({
      status: 'converted',
      decided_option_id: winner?.id || null,
      converted_moment_id: moment.id,
    })
    .eq('id', planId);

  await recordEvent({
    event_name: 'plan.converted_to_moment',
    actor_user_id: userId,
    plan_id: planId,
    moment_id: moment.id,
    metadata: { option_id: winner?.id || null },
  });

  return { plan: await getPlan(planId), moment };
}

async function getDemandSnapshot(momentId) {
  const { data, error } = await db()
    .from('view_moment_demand_snapshot')
    .select('*')
    .eq('moment_id', momentId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listHappeningNow({ limit = 12 } = {}) {
  const { data, error } = await db()
    .from('moments')
    .select('id, title, location, venue_name, image_url, starts_at, here_now, origin_type, visibility, claim_status, status, pulse_state')
    .eq('is_active', true)
    .in('visibility', ['open'])
    .or('here_now.eq.true,status.eq.active,pulse_state.eq.live')
    .order('starts_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

async function listMyPlans(userId) {
  const { data: memberships, error } = await db()
    .from('social_plan_members')
    .select('plan_id, status')
    .eq('user_id', userId)
    .in('status', ['invited', 'joined']);
  if (error) throw error;
  const ids = [...new Set((memberships || []).map((row) => row.plan_id))];
  if (!ids.length) return [];
  const { data: plans } = await db()
    .from('social_plans')
    .select('*')
    .in('id', ids)
    .in('status', ['open', 'voting', 'decided'])
    .order('updated_at', { ascending: false });
  return plans || [];
}

module.exports = {
  recordEvent,
  createMoment,
  joinMoment,
  listParticipants,
  invite,
  markInviteOpened,
  submitContent,
  requestClaim,
  verifyClaim,
  attachPerk,
  claimPerk,
  createPlan,
  getPlan,
  addPlanOption,
  votePlanOption,
  convertPlanToMoment,
  getDemandSnapshot,
  listHappeningNow,
  listMyPlans,
};
