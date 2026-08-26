/**
 * Discovery Acquisition Loop service
 * Visitor → vote → capture → results → next action → share/referral
 */

const crypto = require('crypto');
const { supabase } = require('../lib/supabase');
const economyService = require('./economyService');

const clean = (value, max = 500) => {
  const text = String(value ?? '').trim();
  return text ? text.slice(0, max) : null;
};

const normalEmail = (value) => {
  const email = String(value || '').trim().toLowerCase().slice(0, 320);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
};

const normalPhone = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.replace(/\D/g, '').length < 7) return null;
  return digits.slice(0, 40);
};

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

function parseReferralRewards(raw) {
  const defaults = {
    share_link: 0,
    referred_visit: 0,
    referred_vote: 5,
    referred_capture: 10,
    referred_promokey: 25,
    referred_verified_action: 100,
  };
  return { ...defaults, ...(raw && typeof raw === 'object' ? raw : {}) };
}

async function trackEvent({
  discoveryId,
  eventName,
  anonymousId,
  userId,
  sessionId,
  source,
  referrerUrl,
  sceneId,
  momentId,
  properties = {},
}) {
  if (!supabase) return;
  try {
    await supabase.from('acquisition_discovery_events').insert({
      discovery_id: discoveryId || null,
      event_name: eventName,
      anonymous_id: clean(anonymousId, 160),
      user_id: userId || null,
      session_id: sessionId || null,
      source: clean(source, 160),
      referrer_url: clean(referrerUrl, 1000),
      scene_id: sceneId || null,
      moment_id: momentId || null,
      properties,
    });
  } catch (error) {
    console.warn('[DiscoveryAcquisition] event skipped:', error.message);
  }
}

async function writeSignals(signals) {
  if (!supabase || !signals?.length) return;
  const rows = signals.filter(Boolean).map((signal) => ({
    user_id: signal.userId || null,
    anonymous_id: clean(signal.anonymousId, 160),
    signal_type: signal.signalType,
    signal_key: signal.signalKey,
    signal_value: clean(signal.signalValue, 500),
    weight: signal.weight ?? 1,
    scene_id: signal.sceneId || null,
    discovery_id: signal.discoveryId || null,
    moment_id: signal.momentId || null,
    choice_id: signal.choiceId || null,
    source: clean(signal.source, 160),
    metadata: signal.metadata || {},
  }));
  if (!rows.length) return;
  const { error } = await supabase.from('user_signals').insert(rows);
  if (error) console.warn('[DiscoveryAcquisition] signals skipped:', error.message);
}

async function getDiscoveryBySlug(slug, { includeDraft = false } = {}) {
  if (!supabase) throw Object.assign(new Error('Database unavailable'), { status: 503 });
  let query = supabase
    .from('acquisition_discoveries')
    .select('*')
    .eq('slug', clean(slug, 120));
  if (!includeDraft) query = query.in('status', ['live', 'closed']);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) throw Object.assign(new Error('Discovery not found'), { status: 404 });
  return data;
}

async function getChoices(discoveryId) {
  const { data, error } = await supabase
    .from('acquisition_discovery_choices')
    .select('*')
    .eq('discovery_id', discoveryId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

function publicDiscoveryPayload(discovery, choices, { includeResults = false, selectedChoiceIds = [] } = {}) {
  const totalVotes = Number(discovery.total_votes || 0);
  const ranked = [...choices]
    .sort((a, b) => Number(b.votes_count || 0) - Number(a.votes_count || 0) || a.sort_order - b.sort_order)
    .map((choice, index) => {
      const votes = Number(choice.votes_count || 0);
      const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 1000) / 10 : 0;
      return {
        id: choice.id,
        label: choice.label,
        description: choice.description,
        imageUrl: choice.image_url,
        icon: choice.icon,
        sortOrder: choice.sort_order,
        momentId: choice.moment_id,
        destinationUrl: choice.destination_url,
        metadata: choice.metadata || {},
        ...(includeResults
          ? { votesCount: votes, votePct: pct, rank: index + 1 }
          : {}),
      };
    });

  const selected = ranked.filter((c) => selectedChoiceIds.includes(c.id));
  const leader = includeResults ? ranked[0] : null;

  return {
    id: discovery.id,
    slug: discovery.slug,
    title: discovery.title,
    eyebrow: discovery.eyebrow,
    description: discovery.description,
    coverImageUrl: discovery.cover_image_url,
    discoveryType: discovery.discovery_type,
    maxSelections: discovery.max_selections,
    sceneId: discovery.scene_id,
    relatedMomentId: discovery.related_moment_id,
    status: discovery.status,
    captureRequired: discovery.capture_required,
    resultsVisibility: discovery.results_visibility,
    allowRepeatVotes: discovery.allow_repeat_votes,
    indexable: discovery.indexable,
    primaryNextAction: discovery.primary_next_action,
    nextActionLabel: discovery.next_action_label,
    nextActionDestination: discovery.next_action_destination,
    nextActionConfig: discovery.next_action_config || {},
    rewardPoints: discovery.reward_points,
    partnerAttribution: discovery.partner_attribution || {},
    shareCopyTemplate: discovery.share_copy_template,
    seoTitle: discovery.seo_title || discovery.title,
    seoDescription: discovery.seo_description || discovery.description,
    ogImageUrl: discovery.og_image_url || discovery.cover_image_url,
    totalVotes: includeResults ? totalVotes : undefined,
    totalCaptures: includeResults ? discovery.total_captures : undefined,
    choices: ranked.map((choice) =>
      includeResults
        ? choice
        : {
            id: choice.id,
            label: choice.label,
            description: choice.description,
            imageUrl: choice.imageUrl,
            icon: choice.icon,
            sortOrder: choice.sortOrder,
            momentId: choice.momentId,
            destinationUrl: choice.destinationUrl,
            metadata: choice.metadata,
          }
    ),
    results: includeResults
      ? {
          totalVotes,
          leader: leader
            ? { id: leader.id, label: leader.label, votePct: leader.votePct, rank: 1 }
            : null,
          selected: selected.map((c) => ({
            id: c.id,
            label: c.label,
            votePct: c.votePct,
            rank: c.rank,
            votesCount: c.votesCount,
          })),
          headline: leader
            ? `Kingston is leaning toward ${leader.label}.`
            : 'Be the first to shape this.',
        }
      : null,
  };
}

async function ensureSession({
  discovery,
  anonymousId,
  userId,
  source,
  campaign,
  referrerUrl,
  referringUserId,
  referringAnonymousId,
  utm = {},
  browserFingerprint,
}) {
  const anon = clean(anonymousId, 160);
  if (!anon) throw Object.assign(new Error('anonymous_id is required'), { status: 422 });

  const now = new Date().toISOString();
  const { data: existing, error: existingError } = await supabase
    .from('acquisition_discovery_sessions')
    .select('*')
    .eq('discovery_id', discovery.id)
    .eq('anonymous_id', anon)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing) {
    const patch = {
      last_seen_at: now,
      user_id: userId || existing.user_id,
      source: clean(source, 160) || existing.source,
      campaign: clean(campaign, 200) || existing.campaign,
      referrer_url: clean(referrerUrl, 1000) || existing.referrer_url,
      referring_user_id: referringUserId || existing.referring_user_id,
      browser_fingerprint: clean(browserFingerprint, 200) || existing.browser_fingerprint,
      utm: Object.keys(utm || {}).length ? { ...(existing.utm || {}), ...utm } : existing.utm,
    };
    const { data, error } = await supabase
      .from('acquisition_discovery_sessions')
      .update(patch)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return { session: data, isNew: false };
  }

  const { data, error } = await supabase
    .from('acquisition_discovery_sessions')
    .insert({
      discovery_id: discovery.id,
      anonymous_id: anon,
      user_id: userId || null,
      source: clean(source, 160),
      campaign: clean(campaign, 200),
      referrer_url: clean(referrerUrl, 1000),
      referring_user_id: referringUserId || null,
      browser_fingerprint: clean(browserFingerprint, 200),
      utm: utm || {},
      first_seen_at: now,
      last_seen_at: now,
      metadata: referringAnonymousId ? { referring_anonymous_id: referringAnonymousId } : {},
    })
    .select()
    .single();
  if (error) throw error;

  await supabase.from('acquisition_discovery_attribution').upsert(
    {
      discovery_id: discovery.id,
      session_id: data.id,
      anonymous_id: anon,
      user_id: userId || null,
      source: clean(source, 160),
      campaign: clean(campaign, 200),
      referrer_url: clean(referrerUrl, 1000),
      referring_user_id: referringUserId || null,
      utm_source: clean(utm.utm_source, 160),
      utm_medium: clean(utm.utm_medium, 160),
      utm_campaign: clean(utm.utm_campaign, 200),
      utm_content: clean(utm.utm_content, 200),
      utm_term: clean(utm.utm_term, 200),
      first_touch: { source, campaign, referrerUrl, utm, at: now },
      last_touch: { source, campaign, referrerUrl, utm, at: now },
    },
    { onConflict: 'session_id' }
  );

  await supabase
    .from('acquisition_discoveries')
    .update({ total_visitors: Number(discovery.total_visitors || 0) + 1, updated_at: now })
    .eq('id', discovery.id);

  return { session: data, isNew: true };
}

async function recordReferralVisit({
  discovery,
  session,
  referringUserId,
  referringAnonymousId,
  referredAnonymousId,
}) {
  if (!referringAnonymousId && !referringUserId) return null;
  const self =
    (referringAnonymousId && referringAnonymousId === referredAnonymousId) ||
    (referringUserId && session.user_id && referringUserId === session.user_id);
  if (self) return null;

  const now = new Date().toISOString();
  const rewards = parseReferralRewards(discovery.referral_rewards);

  const { data: existing } = await supabase
    .from('acquisition_discovery_referrals')
    .select('*')
    .eq('discovery_id', discovery.id)
    .eq('referrer_anonymous_id', referringAnonymousId || 'none')
    .eq('referred_anonymous_id', referredAnonymousId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('acquisition_discovery_referrals')
    .insert({
      discovery_id: discovery.id,
      referrer_user_id: referringUserId || null,
      referrer_anonymous_id: referringAnonymousId || null,
      referred_session_id: session.id,
      referred_anonymous_id: referredAnonymousId,
      referred_user_id: session.user_id || null,
      visit_at: now,
      is_self_referral: false,
      points_awarded: 0,
      award_breakdown: { visit: rewards.referred_visit || 0 },
    })
    .select()
    .single();
  if (error && error.code !== '23505') throw error;
  return data || null;
}

async function awardReferralPoints(referral, discovery, stage, amount) {
  if (!referral || !amount || amount <= 0) return referral;
  if (!referral.referrer_user_id) {
    const breakdown = { ...(referral.award_breakdown || {}), [stage]: amount, pending: true };
    const { data } = await supabase
      .from('acquisition_discovery_referrals')
      .update({ award_breakdown: breakdown, updated_at: new Date().toISOString() })
      .eq('id', referral.id)
      .select()
      .single();
    return data || referral;
  }

  const already = referral.award_breakdown?.[stage];
  if (already && already > 0 && !referral.award_breakdown?.pending) return referral;

  try {
    await economyService.addCurrency(
      referral.referrer_user_id,
      'points',
      amount,
      `discovery_referral_${stage}`,
      referral.id,
      `Discovery referral: ${stage}`
    );
  } catch (error) {
    console.warn('[DiscoveryAcquisition] referral award failed:', error.message);
    return referral;
  }

  const breakdown = { ...(referral.award_breakdown || {}), [stage]: amount };
  delete breakdown.pending;
  const { data } = await supabase
    .from('acquisition_discovery_referrals')
    .update({
      points_awarded: Number(referral.points_awarded || 0) + amount,
      award_breakdown: breakdown,
      updated_at: new Date().toISOString(),
    })
    .eq('id', referral.id)
    .select()
    .single();
  return data || referral;
}

async function findReferralForSession(discoveryId, session) {
  const referringAnon = session.metadata?.referring_anonymous_id;
  let query = supabase
    .from('acquisition_discovery_referrals')
    .select('*')
    .eq('discovery_id', discoveryId)
    .eq('referred_anonymous_id', session.anonymous_id);
  const { data } = await query.maybeSingle();
  if (data) return data;
  if (!referringAnon) return null;
  const { data: byRef } = await supabase
    .from('acquisition_discovery_referrals')
    .select('*')
    .eq('discovery_id', discoveryId)
    .eq('referrer_anonymous_id', referringAnon)
    .eq('referred_anonymous_id', session.anonymous_id)
    .maybeSingle();
  return byRef || null;
}

async function viewDiscovery(input) {
  const discovery = await getDiscoveryBySlug(input.slug);
  const choices = await getChoices(discovery.id);
  const referringUserId = isUuid(input.ref) ? input.ref : null;
  const referringAnonymousId = !referringUserId ? clean(input.ref, 160) : clean(input.refAnon, 160);

  const { session, isNew } = await ensureSession({
    discovery,
    anonymousId: input.anonymousId,
    userId: input.userId,
    source: input.source || discovery.source_attribution_default,
    campaign: input.campaign,
    referrerUrl: input.referrerUrl,
    referringUserId,
    referringAnonymousId,
    utm: input.utm || {},
    browserFingerprint: input.browserFingerprint,
  });

  if (isNew || referringUserId || referringAnonymousId) {
    await recordReferralVisit({
      discovery,
      session,
      referringUserId,
      referringAnonymousId,
      referredAnonymousId: session.anonymous_id,
    });
  }

  await trackEvent({
    discoveryId: discovery.id,
    eventName: isNew ? 'discovery_viewed' : 'discovery_viewed',
    anonymousId: session.anonymous_id,
    userId: session.user_id || input.userId,
    sessionId: session.id,
    source: session.source,
    referrerUrl: session.referrer_url,
    sceneId: discovery.scene_id,
    momentId: discovery.related_moment_id,
    properties: { is_new_session: isNew, src: session.source },
  });

  if (referringUserId || referringAnonymousId) {
    await trackEvent({
      discoveryId: discovery.id,
      eventName: 'referral_visit',
      anonymousId: session.anonymous_id,
      userId: session.user_id,
      sessionId: session.id,
      source: session.source,
      properties: { referring_user_id: referringUserId, referring_anonymous_id: referringAnonymousId },
    });
  }

  const existingResponse = await getExistingResponse(discovery, session, input.userId);
  const alreadyVoted = Boolean(existingResponse);
  const canSeeResults =
    discovery.results_visibility === 'public' ||
    (discovery.results_visibility === 'after_vote' && alreadyVoted) ||
    (discovery.results_visibility === 'after_capture' && existingResponse?.is_captured) ||
    (alreadyVoted && !discovery.capture_required);

  return {
    discovery: publicDiscoveryPayload(discovery, choices, {
      includeResults: canSeeResults,
      selectedChoiceIds: existingResponse?.choice_ids || [],
    }),
    session: {
      id: session.id,
      anonymousId: session.anonymous_id,
      voted: alreadyVoted,
      captured: Boolean(existingResponse?.is_captured || session.captured_at),
      userId: session.user_id || null,
    },
    response: existingResponse
      ? {
          id: existingResponse.id,
          choiceIds: existingResponse.choice_ids,
          isCaptured: existingResponse.is_captured,
          pointsAwarded: existingResponse.points_awarded,
        }
      : null,
  };
}

async function getExistingResponse(discovery, session, userId) {
  if (userId) {
    const { data } = await supabase
      .from('acquisition_discovery_responses')
      .select('*')
      .eq('discovery_id', discovery.id)
      .eq('user_id', userId)
      .maybeSingle();
    if (data) return data;
  }
  const { data } = await supabase
    .from('acquisition_discovery_responses')
    .select('*')
    .eq('discovery_id', discovery.id)
    .eq('session_id', session.id)
    .maybeSingle();
  return data || null;
}

async function castVote(input) {
  const discovery = await getDiscoveryBySlug(input.slug);
  if (discovery.status !== 'live') {
    throw Object.assign(new Error('This Discovery is closed'), { status: 409 });
  }
  if (discovery.closes_at && new Date(discovery.closes_at) < new Date()) {
    throw Object.assign(new Error('Voting has closed'), { status: 409 });
  }

  const choices = await getChoices(discovery.id);
  const choiceIds = Array.isArray(input.choiceIds) ? input.choiceIds.filter(isUuid) : [];
  if (!choiceIds.length) throw Object.assign(new Error('Select at least one choice'), { status: 422 });

  const max = discovery.discovery_type === 'multi_select' ? discovery.max_selections : 1;
  if (choiceIds.length > max) {
    throw Object.assign(new Error(`Pick up to ${max}`), { status: 422 });
  }

  const validIds = new Set(choices.map((c) => c.id));
  if (choiceIds.some((id) => !validIds.has(id))) {
    throw Object.assign(new Error('Invalid choice'), { status: 422 });
  }

  const { session } = await ensureSession({
    discovery,
    anonymousId: input.anonymousId,
    userId: input.userId,
    source: input.source,
    campaign: input.campaign,
    referrerUrl: input.referrerUrl,
    referringUserId: isUuid(input.ref) ? input.ref : null,
    referringAnonymousId: clean(input.refAnon, 160),
    utm: input.utm || {},
    browserFingerprint: input.browserFingerprint,
  });

  const existing = await getExistingResponse(discovery, session, input.userId);
  if (existing && !discovery.allow_repeat_votes) {
    return {
      alreadyVoted: true,
      needsCapture: discovery.capture_required && !existing.is_captured && !input.userId,
      response: existing,
      discovery: publicDiscoveryPayload(discovery, choices, {
        includeResults: false,
        selectedChoiceIds: existing.choice_ids,
      }),
      session: { id: session.id, anonymousId: session.anonymous_id },
    };
  }

  const now = new Date().toISOString();
  const authenticatedSkipCapture = Boolean(input.userId);
  const { data: response, error } = await supabase
    .from('acquisition_discovery_responses')
    .insert({
      discovery_id: discovery.id,
      session_id: session.id,
      anonymous_id: session.anonymous_id,
      user_id: input.userId || null,
      choice_ids: choiceIds,
      ranking: input.ranking || null,
      nomination_text: clean(input.nominationText, 300),
      is_captured: authenticatedSkipCapture,
      captured_at: authenticatedSkipCapture ? now : null,
      source: session.source,
      referring_user_id: session.referring_user_id,
    })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') {
      const again = await getExistingResponse(discovery, session, input.userId);
      return {
        alreadyVoted: true,
        needsCapture: discovery.capture_required && !again?.is_captured && !input.userId,
        response: again,
        discovery: publicDiscoveryPayload(discovery, choices, {
          includeResults: false,
          selectedChoiceIds: again?.choice_ids || [],
        }),
        session: { id: session.id, anonymousId: session.anonymous_id },
      };
    }
    throw error;
  }

  for (const choiceId of choiceIds) {
    const choice = choices.find((c) => c.id === choiceId);
    if (choice) {
      await supabase
        .from('acquisition_discovery_choices')
        .update({ votes_count: Number(choice.votes_count || 0) + 1, updated_at: now })
        .eq('id', choiceId);
    }
  }

  await supabase
    .from('acquisition_discoveries')
    .update({
      total_votes: Number(discovery.total_votes || 0) + 1,
      updated_at: now,
    })
    .eq('id', discovery.id);

  await supabase
    .from('acquisition_discovery_sessions')
    .update({ voted_at: now, user_id: input.userId || session.user_id, last_seen_at: now })
    .eq('id', session.id);

  const referral = await findReferralForSession(discovery.id, session);
  if (referral) {
    const rewards = parseReferralRewards(discovery.referral_rewards);
    await supabase
      .from('acquisition_discovery_referrals')
      .update({ vote_at: now, updated_at: now })
      .eq('id', referral.id);
    await awardReferralPoints(referral, discovery, 'vote', rewards.referred_vote);
    await trackEvent({
      discoveryId: discovery.id,
      eventName: 'referral_vote',
      anonymousId: session.anonymous_id,
      sessionId: session.id,
      properties: { referral_id: referral.id },
    });
  }

  const selectedChoices = choices.filter((c) => choiceIds.includes(c.id));
  await writeSignals(
    selectedChoices.map((choice) => ({
      userId: input.userId,
      anonymousId: session.anonymous_id,
      signalType: 'discovery_choice',
      signalKey: choice.label,
      signalValue: choice.id,
      sceneId: discovery.scene_id,
      discoveryId: discovery.id,
      momentId: choice.moment_id || discovery.related_moment_id,
      choiceId: choice.id,
      source: session.source,
      metadata: { discovery_type: discovery.discovery_type },
    }))
  );

  if (discovery.scene_id) {
    await writeSignals([
      {
        userId: input.userId,
        anonymousId: session.anonymous_id,
        signalType: 'scene_interest',
        signalKey: discovery.scene_id,
        signalValue: discovery.slug,
        sceneId: discovery.scene_id,
        discoveryId: discovery.id,
        source: session.source,
      },
    ]);
  }

  await trackEvent({
    discoveryId: discovery.id,
    eventName: 'discovery_voted',
    anonymousId: session.anonymous_id,
    userId: input.userId,
    sessionId: session.id,
    source: session.source,
    sceneId: discovery.scene_id,
    momentId: discovery.related_moment_id,
    properties: { choice_ids: choiceIds },
  });

  const needsCapture = discovery.capture_required && !authenticatedSkipCapture;
  if (needsCapture) {
    await trackEvent({
      discoveryId: discovery.id,
      eventName: 'discovery_capture_shown',
      anonymousId: session.anonymous_id,
      sessionId: session.id,
      source: session.source,
    });
  }

  let pointsAwarded = 0;
  let founding = null;
  if (authenticatedSkipCapture) {
    const award = await completeCaptureSideEffects({
      discovery,
      session,
      response,
      userId: input.userId,
      phone: null,
      email: null,
      displayName: null,
    });
    pointsAwarded = award.pointsAwarded;
    founding = award.founding;
  }

  const refreshed = await getDiscoveryBySlug(discovery.slug, { includeDraft: true });
  const refreshedChoices = await getChoices(discovery.id);

  return {
    alreadyVoted: false,
    needsCapture,
    pointsAwarded,
    founding,
    response,
    session: { id: session.id, anonymousId: session.anonymous_id },
    discovery: publicDiscoveryPayload(refreshed, refreshedChoices, {
      includeResults: !needsCapture,
      selectedChoiceIds: choiceIds,
    }),
  };
}

async function resolveOrCreateUser({ phone, email, displayName, anonymousId }) {
  if (email) {
    const { data: byEmail } = await supabase
      .from('users')
      .select('id,email')
      .eq('email', email)
      .maybeSingle();
    if (byEmail?.id) return { userId: byEmail.id, created: false };
  }

  if (phone) {
    // Phone lives on session / auth metadata; users table may not have phone column.
  }

  if (!email && !phone) return { userId: null, created: false };

  const softEmail =
    email ||
    `discovery+${crypto.createHash('sha256').update(phone || anonymousId).digest('hex').slice(0, 16)}@users.promorang.co`;

  try {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: softEmail,
      email_confirm: true,
      phone: phone || undefined,
      user_metadata: {
        full_name: displayName || 'Promorang participant',
        display_name: displayName || 'Promorang participant',
        phone: phone || null,
        anonymous_id: anonymousId,
        acquisition_source: 'discovery',
        soft_account: !email,
      },
      app_metadata: { role: 'participant' },
    });
    if (error) {
      console.warn('[DiscoveryAcquisition] createUser:', error.message);
      return { userId: null, created: false, softEmail };
    }
    const userId = created?.user?.id;
    if (userId) {
      await supabase.from('users').upsert(
        {
          id: userId,
          email: softEmail,
          display_name: displayName || 'Promorang participant',
          user_type: 'participant',
        },
        { onConflict: 'id' }
      );
      try {
        await supabase.from('growth_identity_links').insert({
          anonymous_id: anonymousId,
          user_id: userId,
          linked_at: new Date().toISOString(),
          first_touch: { source: 'discovery_capture' },
          last_touch: { source: 'discovery_capture' },
        });
      } catch {
        /* optional table / unique conflict */
      }
    }
    return { userId, created: Boolean(userId), softEmail };
  } catch (error) {
    console.warn('[DiscoveryAcquisition] soft user failed:', error.message);
    return { userId: null, created: false };
  }
}

async function enrollFoundingCampaign({ userId, anonymousId, discoveryId }) {
  if (!userId) return null;
  const { data: campaign } = await supabase
    .from('early_user_campaigns')
    .select('*')
    .eq('key', 'founding-100')
    .eq('status', 'active')
    .maybeSingle();
  if (!campaign) return null;
  if (campaign.enrolled_count >= campaign.capacity) return null;

  const { data: existing } = await supabase
    .from('early_user_campaign_members')
    .select('*')
    .eq('campaign_id', campaign.id)
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) {
    return {
      badge: existing.badge_label,
      memberNumber: existing.member_number,
      alreadyEnrolled: true,
    };
  }

  const memberNumber = Number(campaign.enrolled_count || 0) + 1;
  if (memberNumber > campaign.capacity) return null;

  const { data: member, error } = await supabase
    .from('early_user_campaign_members')
    .insert({
      campaign_id: campaign.id,
      user_id: userId,
      anonymous_id: anonymousId,
      discovery_id: discoveryId,
      member_number: memberNumber,
      badge_label: campaign.badge_label,
      points_awarded: campaign.starting_points || 0,
    })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') return null;
    console.warn('[DiscoveryAcquisition] founding enroll:', error.message);
    return null;
  }

  await supabase
    .from('early_user_campaigns')
    .update({ enrolled_count: memberNumber, updated_at: new Date().toISOString() })
    .eq('id', campaign.id);

  if (campaign.starting_points > 0) {
    try {
      await economyService.addCurrency(
        userId,
        'points',
        campaign.starting_points,
        'founding_campaign',
        member.id,
        'Founding 100 starting PromoPoints'
      );
    } catch (err) {
      console.warn('[DiscoveryAcquisition] founding points:', err.message);
    }
  }

  // Also mirror into founding_members if table exists
  try {
    await supabase.from('founding_members').upsert(
      {
        user_id: userId,
        member_type: 'early_adopter',
        wave: 1,
        status: 'active',
        metadata: { campaign: 'founding-100', member_number: memberNumber },
      },
      { onConflict: 'user_id' }
    );
  } catch {
    /* optional */
  }

  return {
    badge: campaign.badge_label,
    memberNumber,
    pointsAwarded: campaign.starting_points,
    alreadyEnrolled: false,
  };
}

async function completeCaptureSideEffects({
  discovery,
  session,
  response,
  userId,
  phone,
  email,
  displayName,
}) {
  const now = new Date().toISOString();
  let pointsAwarded = 0;

  if (userId && Number(discovery.reward_points || 0) > 0 && Number(response.points_awarded || 0) === 0) {
    try {
      await economyService.addCurrency(
        userId,
        'points',
        discovery.reward_points,
        'discovery_capture',
        response.id,
        `Discovery participation: ${discovery.slug}`
      );
      pointsAwarded = discovery.reward_points;
      await supabase
        .from('acquisition_discovery_responses')
        .update({ points_awarded: pointsAwarded, updated_at: now })
        .eq('id', response.id);
    } catch (error) {
      console.warn('[DiscoveryAcquisition] points award:', error.message);
    }
  }

  const founding = await enrollFoundingCampaign({
    userId,
    anonymousId: session.anonymous_id,
    discoveryId: discovery.id,
  });

  const referral = await findReferralForSession(discovery.id, session);
  if (referral) {
    const rewards = parseReferralRewards(discovery.referral_rewards);
    await supabase
      .from('acquisition_discovery_referrals')
      .update({
        capture_at: now,
        referred_user_id: userId || referral.referred_user_id,
        is_verified: Boolean(userId || phone || email),
        updated_at: now,
      })
      .eq('id', referral.id);
    await awardReferralPoints(
      { ...referral, referrer_user_id: referral.referrer_user_id },
      discovery,
      'capture',
      rewards.referred_capture
    );
    await trackEvent({
      discoveryId: discovery.id,
      eventName: 'referral_capture',
      anonymousId: session.anonymous_id,
      userId,
      sessionId: session.id,
      properties: { referral_id: referral.id },
    });
  }

  await writeSignals([
    {
      userId,
      anonymousId: session.anonymous_id,
      signalType: 'identity_captured',
      signalKey: phone ? 'phone' : 'email',
      signalValue: phone || email,
      discoveryId: discovery.id,
      sceneId: discovery.scene_id,
      source: session.source,
      metadata: { display_name: displayName },
    },
  ]);

  return { pointsAwarded, founding };
}

async function captureIdentity(input) {
  const discovery = await getDiscoveryBySlug(input.slug);
  const phone = normalPhone(input.phone);
  const email = normalEmail(input.email);
  const displayName = clean(input.displayName, 120);

  if (!phone && !email && !input.userId) {
    throw Object.assign(new Error('Phone or email is required to see results'), { status: 422 });
  }

  const { session } = await ensureSession({
    discovery,
    anonymousId: input.anonymousId,
    userId: input.userId,
    source: input.source,
    campaign: input.campaign,
    referrerUrl: input.referrerUrl,
    utm: input.utm || {},
  });

  const response = await getExistingResponse(discovery, session, input.userId);
  if (!response) throw Object.assign(new Error('Vote first, then unlock results'), { status: 409 });
  if (response.is_captured && response.user_id) {
    const choices = await getChoices(discovery.id);
    return {
      alreadyCaptured: true,
      discovery: publicDiscoveryPayload(discovery, choices, {
        includeResults: true,
        selectedChoiceIds: response.choice_ids,
      }),
      pointsAwarded: response.points_awarded,
      session: { id: session.id, anonymousId: session.anonymous_id, userId: response.user_id },
    };
  }

  let userId = input.userId || session.user_id || response.user_id || null;
  let softCreated = false;
  if (!userId) {
    const resolved = await resolveOrCreateUser({
      phone,
      email,
      displayName,
      anonymousId: session.anonymous_id,
    });
    userId = resolved.userId;
    softCreated = resolved.created;
  }

  const now = new Date().toISOString();
  await supabase
    .from('acquisition_discovery_sessions')
    .update({
      phone,
      email,
      display_name: displayName,
      capture_method: phone ? 'phone' : 'email',
      captured_at: now,
      user_id: userId || session.user_id,
      last_seen_at: now,
    })
    .eq('id', session.id);

  await supabase
    .from('acquisition_discovery_attribution')
    .update({ user_id: userId || null, updated_at: now })
    .eq('session_id', session.id);

  await supabase
    .from('acquisition_discovery_responses')
    .update({
      is_captured: true,
      captured_at: now,
      user_id: userId || response.user_id,
      updated_at: now,
    })
    .eq('id', response.id);

  // Merge any other anonymous sessions for this anon id
  if (userId) {
    await supabase
      .from('acquisition_discovery_sessions')
      .update({ user_id: userId })
      .eq('anonymous_id', session.anonymous_id)
      .is('user_id', null);
    await supabase
      .from('acquisition_discovery_responses')
      .update({ user_id: userId })
      .eq('anonymous_id', session.anonymous_id)
      .is('user_id', null);
    await supabase
      .from('user_signals')
      .update({ user_id: userId })
      .eq('anonymous_id', session.anonymous_id)
      .is('user_id', null);
  }

  if (!response.is_captured) {
    await supabase
      .from('acquisition_discoveries')
      .update({
        total_captures: Number(discovery.total_captures || 0) + 1,
        updated_at: now,
      })
      .eq('id', discovery.id);
  }

  const refreshedResponse = {
    ...response,
    is_captured: true,
    user_id: userId,
    points_awarded: response.points_awarded,
  };

  const { pointsAwarded, founding } = await completeCaptureSideEffects({
    discovery,
    session,
    response: refreshedResponse,
    userId,
    phone,
    email,
    displayName,
  });

  await trackEvent({
    discoveryId: discovery.id,
    eventName: 'discovery_capture_completed',
    anonymousId: session.anonymous_id,
    userId,
    sessionId: session.id,
    source: session.source,
    sceneId: discovery.scene_id,
    properties: { soft_created: softCreated, method: phone ? 'phone' : 'email' },
  });

  const choices = await getChoices(discovery.id);
  const live = await getDiscoveryBySlug(discovery.slug, { includeDraft: true });

  await trackEvent({
    discoveryId: discovery.id,
    eventName: 'discovery_results_viewed',
    anonymousId: session.anonymous_id,
    userId,
    sessionId: session.id,
    source: session.source,
  });

  return {
    alreadyCaptured: false,
    softCreated,
    userId,
    pointsAwarded,
    founding,
    discovery: publicDiscoveryPayload(live, choices, {
      includeResults: true,
      selectedChoiceIds: response.choice_ids,
    }),
    session: { id: session.id, anonymousId: session.anonymous_id, userId },
    share: buildSharePayload(live, choices, response.choice_ids, userId || session.anonymous_id),
  };
}

function buildSharePayload(discovery, choices, choiceIds, refId) {
  const selected = choices.filter((c) => (choiceIds || []).includes(c.id));
  const choiceLabel = selected.map((c) => c.label).join(', ') || 'my pick';
  const template =
    discovery.share_copy_template ||
    'I chose {{choice}} 😂 What are you picking?';
  const text = template.replace(/\{\{choice\}\}/g, choiceLabel).replace(/\{\{title\}\}/g, discovery.title);
  const origin = process.env.PUBLIC_WEB_URL || process.env.VITE_SITE_URL || 'https://promorang.co';
  const link = `${origin.replace(/\/$/, '')}/d/${discovery.slug}?ref=${encodeURIComponent(refId)}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${text}\n${link}`)}`;
  return { text, link, whatsapp, choiceLabel };
}

async function recordShare(input) {
  const discovery = await getDiscoveryBySlug(input.slug);
  const { session } = await ensureSession({
    discovery,
    anonymousId: input.anonymousId,
    userId: input.userId,
    source: input.source,
  });

  await trackEvent({
    discoveryId: discovery.id,
    eventName: 'discovery_shared',
    anonymousId: session.anonymous_id,
    userId: input.userId,
    sessionId: session.id,
    source: session.source,
    properties: { channel: input.channel || 'whatsapp' },
  });

  await supabase.from('acquisition_discovery_actions').insert({
    discovery_id: discovery.id,
    session_id: session.id,
    anonymous_id: session.anonymous_id,
    user_id: input.userId || session.user_id,
    action_type: 'share',
    action_value: input.channel || 'whatsapp',
  });

  const choices = await getChoices(discovery.id);
  const response = await getExistingResponse(discovery, session, input.userId);
  return buildSharePayload(
    discovery,
    choices,
    response?.choice_ids || [],
    input.userId || session.anonymous_id
  );
}

async function recordNextAction(input) {
  const discovery = await getDiscoveryBySlug(input.slug);
  const { session } = await ensureSession({
    discovery,
    anonymousId: input.anonymousId,
    userId: input.userId,
    source: input.source,
  });
  const response = await getExistingResponse(discovery, session, input.userId);
  const actionType = clean(input.actionType, 80) || discovery.primary_next_action;
  const actionValue = clean(input.actionValue, 200);
  const momentId = input.momentId || discovery.related_moment_id;

  const { data: action, error } = await supabase
    .from('acquisition_discovery_actions')
    .insert({
      discovery_id: discovery.id,
      response_id: response?.id || null,
      session_id: session.id,
      anonymous_id: session.anonymous_id,
      user_id: input.userId || session.user_id,
      action_type: actionType,
      action_value: actionValue,
      destination: clean(input.destination, 500) || discovery.next_action_destination,
      moment_id: momentId || null,
      metadata: input.metadata || {},
    })
    .select()
    .single();
  if (error) throw error;

  await trackEvent({
    discoveryId: discovery.id,
    eventName: 'discovery_next_action_clicked',
    anonymousId: session.anonymous_id,
    userId: input.userId,
    sessionId: session.id,
    source: session.source,
    momentId,
    properties: { action_type: actionType, action_value: actionValue },
  });

  if (['express_interest', 'interested', 'going', 'maybe'].includes(actionValue || actionType)) {
    await trackEvent({
      discoveryId: discovery.id,
      eventName: 'moment_interest',
      anonymousId: session.anonymous_id,
      userId: input.userId,
      sessionId: session.id,
      momentId,
      properties: { action_value: actionValue || actionType },
    });
    await writeSignals([
      {
        userId: input.userId || session.user_id,
        anonymousId: session.anonymous_id,
        signalType: 'moment_interest',
        signalKey: actionValue || actionType,
        signalValue: momentId || discovery.next_action_destination,
        discoveryId: discovery.id,
        momentId,
        sceneId: discovery.scene_id,
        source: session.source,
      },
    ]);
  }

  if (actionType === 'view_moment' || actionValue === 'going') {
    await trackEvent({
      discoveryId: discovery.id,
      eventName: 'moment_viewed_from_discovery',
      anonymousId: session.anonymous_id,
      userId: input.userId,
      momentId,
    });
  }

  if (actionType === 'claim_promokey') {
    await trackEvent({
      discoveryId: discovery.id,
      eventName: 'promokey_claimed_from_discovery',
      anonymousId: session.anonymous_id,
      userId: input.userId,
      momentId,
    });
    const referral = await findReferralForSession(discovery.id, session);
    if (referral) {
      const rewards = parseReferralRewards(discovery.referral_rewards);
      await awardReferralPoints(referral, discovery, 'promokey', rewards.referred_promokey);
    }
  }

  const referral = await findReferralForSession(discovery.id, session);
  if (referral) {
    await supabase
      .from('acquisition_discovery_referrals')
      .update({
        downstream_action: actionType,
        downstream_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', referral.id);
  }

  let destination = discovery.next_action_destination;
  if ((actionValue === 'going' || actionType === 'view_moment') && momentId) {
    destination = `/moments/${momentId}`;
  } else if (input.destination) {
    destination = input.destination;
  }

  return { action, destination };
}

async function getResults(slug, { anonymousId, userId } = {}) {
  const discovery = await getDiscoveryBySlug(slug);
  const choices = await getChoices(discovery.id);
  let selectedChoiceIds = [];
  let allowed = discovery.results_visibility === 'public';

  if (anonymousId || userId) {
    const { session } = await ensureSession({
      discovery,
      anonymousId: anonymousId || `results-${userId}`,
      userId,
    });
    const response = await getExistingResponse(discovery, session, userId);
    selectedChoiceIds = response?.choice_ids || [];
    if (discovery.results_visibility === 'after_vote' && response) allowed = true;
    if (discovery.results_visibility === 'after_capture' && response?.is_captured) allowed = true;
    if (userId && response) allowed = true;
  }

  if (!allowed) {
    throw Object.assign(new Error('Results unlock after you identify yourself'), { status: 403 });
  }

  return publicDiscoveryPayload(discovery, choices, {
    includeResults: true,
    selectedChoiceIds,
  });
}

/* -------------------- Admin -------------------- */

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

async function listDiscoveriesAdmin() {
  const { data, error } = await supabase
    .from('acquisition_discoveries')
    .select('*, acquisition_discovery_choices(count)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function upsertDiscoveryAdmin(payload, userId) {
  const slug = clean(payload.slug, 120) || slugify(payload.title);
  if (!payload.title) throw Object.assign(new Error('Title is required'), { status: 422 });
  if (!slug) throw Object.assign(new Error('Slug is required'), { status: 422 });

  const row = {
    slug,
    title: clean(payload.title, 280),
    eyebrow: clean(payload.eyebrow, 120),
    description: clean(payload.description, 2000),
    cover_image_url: clean(payload.coverImageUrl, 1000),
    discovery_type: payload.discoveryType || 'single_choice',
    max_selections: Math.min(20, Math.max(1, Number(payload.maxSelections) || 1)),
    scene_id: payload.sceneId || null,
    related_moment_id: payload.relatedMomentId || null,
    starts_at: payload.startsAt || null,
    closes_at: payload.closesAt || null,
    status: payload.status || 'draft',
    capture_required: payload.captureRequired !== false,
    results_visibility: payload.resultsVisibility || 'after_capture',
    allow_repeat_votes: Boolean(payload.allowRepeatVotes),
    indexable: payload.indexable !== false,
    primary_next_action: payload.primaryNextAction || 'express_interest',
    next_action_label: clean(payload.nextActionLabel, 200),
    next_action_destination: clean(payload.nextActionDestination, 500),
    next_action_config: payload.nextActionConfig || {},
    reward_points: Math.max(0, Number(payload.rewardPoints) || 0),
    referral_rewards: payload.referralRewards || undefined,
    partner_attribution: payload.partnerAttribution || {},
    source_attribution_default: clean(payload.sourceAttributionDefault, 160),
    share_copy_template: clean(payload.shareCopyTemplate, 500),
    seo_title: clean(payload.seoTitle, 200),
    seo_description: clean(payload.seoDescription, 500),
    og_image_url: clean(payload.ogImageUrl, 1000),
    published_at: payload.status === 'live' ? new Date().toISOString() : payload.publishedAt || null,
    created_by: userId || null,
    updated_at: new Date().toISOString(),
    metadata: payload.metadata || {},
  };

  let discovery;
  if (payload.id) {
    const { data, error } = await supabase
      .from('acquisition_discoveries')
      .update(row)
      .eq('id', payload.id)
      .select()
      .single();
    if (error) throw error;
    discovery = data;
  } else {
    const { data, error } = await supabase
      .from('acquisition_discoveries')
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    discovery = data;
  }

  if (Array.isArray(payload.choices)) {
    const existing = await getChoices(discovery.id);
    const keepIds = payload.choices.filter((c) => c.id).map((c) => c.id);
    const toDelete = existing.filter((c) => !keepIds.includes(c.id)).map((c) => c.id);
    if (toDelete.length) {
      await supabase.from('acquisition_discovery_choices').delete().in('id', toDelete);
    }
    for (const [index, choice] of payload.choices.entries()) {
      const choiceRow = {
        discovery_id: discovery.id,
        label: clean(choice.label, 200),
        description: clean(choice.description, 500),
        image_url: clean(choice.imageUrl, 1000),
        icon: clean(choice.icon, 80),
        sort_order: Number(choice.sortOrder ?? index),
        moment_id: choice.momentId || null,
        destination_url: clean(choice.destinationUrl, 500),
        metadata: choice.metadata || {},
        updated_at: new Date().toISOString(),
      };
      if (!choiceRow.label) continue;
      if (choice.id) {
        await supabase.from('acquisition_discovery_choices').update(choiceRow).eq('id', choice.id);
      } else {
        await supabase.from('acquisition_discovery_choices').insert(choiceRow);
      }
    }
  }

  const choices = await getChoices(discovery.id);
  return { discovery, choices };
}

async function getAnalytics(discoveryIdOrSlug) {
  let discovery;
  if (isUuid(discoveryIdOrSlug)) {
    const { data, error } = await supabase
      .from('acquisition_discoveries')
      .select('*')
      .eq('id', discoveryIdOrSlug)
      .maybeSingle();
    if (error) throw error;
    discovery = data;
  } else {
    discovery = await getDiscoveryBySlug(discoveryIdOrSlug, { includeDraft: true });
  }
  if (!discovery) throw Object.assign(new Error('Discovery not found'), { status: 404 });

  const [
    { data: sessions },
    { data: responses },
    { data: referrals },
    { data: actions },
    { data: events },
  ] = await Promise.all([
    supabase.from('acquisition_discovery_sessions').select('id,source,anonymous_id,voted_at,captured_at,referring_user_id').eq('discovery_id', discovery.id),
    supabase.from('acquisition_discovery_responses').select('id,is_captured,created_at,source').eq('discovery_id', discovery.id),
    supabase.from('acquisition_discovery_referrals').select('*').eq('discovery_id', discovery.id),
    supabase.from('acquisition_discovery_actions').select('action_type,action_value,source').eq('discovery_id', discovery.id),
    supabase.from('acquisition_discovery_events').select('event_name,source').eq('discovery_id', discovery.id),
  ]);

  const visitors = (sessions || []).length;
  const votes = (responses || []).length;
  const captures = (responses || []).filter((r) => r.is_captured).length;
  const shareClicks = (events || []).filter((e) => e.event_name === 'discovery_shared').length;
  const referredVisits = (referrals || []).filter((r) => r.visit_at).length;
  const referredVotes = (referrals || []).filter((r) => r.vote_at).length;
  const referredCaptures = (referrals || []).filter((r) => r.capture_at).length;

  const intentTypes = ['express_interest', 'interested', 'going', 'maybe', 'save_moment', 'claim_promokey', 'view_moment', 'rsvp'];
  const intentActions = (actions || []).filter((a) => intentTypes.includes(a.action_type) || intentTypes.includes(a.action_value));

  const bySource = {};
  for (const session of sessions || []) {
    const key = session.source || 'direct';
    bySource[key] ||= { source: key, visitors: 0, votes: 0, captures: 0, referrals: 0, intentActions: 0 };
    bySource[key].visitors += 1;
    if (session.voted_at) bySource[key].votes += 1;
    if (session.captured_at) bySource[key].captures += 1;
  }
  for (const referral of referrals || []) {
    const key = 'referral';
    bySource[key] ||= { source: key, visitors: 0, votes: 0, captures: 0, referrals: 0, intentActions: 0 };
    bySource[key].referrals += 1;
  }
  for (const action of intentActions) {
    const key = action.source || 'direct';
    bySource[key] ||= { source: key, visitors: 0, votes: 0, captures: 0, referrals: 0, intentActions: 0 };
    bySource[key].intentActions += 1;
  }

  const sourceTable = Object.values(bySource).map((row) => ({
    ...row,
    captureRate: row.visitors ? Math.round((row.captures / row.visitors) * 1000) / 10 : 0,
  }));

  return {
    discovery: { id: discovery.id, slug: discovery.slug, title: discovery.title, status: discovery.status },
    reach: { uniqueVisitors: visitors },
    participation: {
      totalVotes: votes,
      visitorToVoteRate: visitors ? Math.round((votes / visitors) * 1000) / 10 : 0,
    },
    capture: {
      capturedParticipants: captures,
      voteToCaptureRate: votes ? Math.round((captures / votes) * 1000) / 10 : 0,
      visitorToCaptureRate: visitors ? Math.round((captures / visitors) * 1000) / 10 : 0,
    },
    sharing: {
      shareButtonClicks: shareClicks,
      referredVisits,
      referredVotes,
      referredCaptures,
    },
    intent: {
      interested: intentActions.filter((a) => ['interested', 'express_interest', 'maybe'].includes(a.action_value || a.action_type)).length,
      saved: intentActions.filter((a) => a.action_type === 'save_moment').length,
      promokeyClaimed: intentActions.filter((a) => a.action_type === 'claim_promokey').length,
      momentViewed: intentActions.filter((a) => a.action_type === 'view_moment').length,
      rsvp: intentActions.filter((a) => a.action_type === 'rsvp' || a.action_value === 'going').length,
      other: intentActions.length,
    },
    sourcePerformance: sourceTable.sort((a, b) => b.captures - a.captures || b.visitors - a.visitors),
  };
}

module.exports = {
  viewDiscovery,
  castVote,
  captureIdentity,
  recordShare,
  recordNextAction,
  getResults,
  listDiscoveriesAdmin,
  upsertDiscoveryAdmin,
  getAnalytics,
  getDiscoveryBySlug,
  getChoices,
  publicDiscoveryPayload,
  buildSharePayload,
  trackEvent,
};
