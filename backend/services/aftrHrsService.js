const { supabase } = require('../lib/supabase');
const {
  AFTRHRS_CLAIM_ERRORS,
  AFTRHRS_MOMENT_ID,
  AFTRHRS_MOMENT_SLUG,
  AFTRHRS_PATHS,
  AFTRHRS_RECURRENCE,
  AFTRHRS_START_ISO,
  SEA_DECK_VENUE_ID,
  SEA_DECK_VENUE_SLUG,
  decodeAftrHrsPassPayload,
  remainingDigitalPasses,
  publicRemainingPercent,
  AFTRHRS_DIGITAL_PASS_LIMIT,
  DEFAULT_AFTRHRS_FAQS,
  hasAftrHrsFridayRecurrence,
  isAftrHrsFirstNightClaimClose,
} = require('../lib/aftrHrsRules');

const AFTRHRS_MOMENT_SELECT = 'id, slug, title, description, starts_at, ends_at, venue_id, venue_name, image_url, is_active, visibility, recurrence_enabled, recurrence_frequency, recurrence_interval, recurrence_by_weekday, recurrence_timezone, recurrence_until, recurrence_count';
const AFTRHRS_EDITION_SELECT = `*, moments:moment_id(${AFTRHRS_MOMENT_SELECT}), venue_profiles:venue_id(id, slug, name, description, address, city, country, featured_image_url, images, verification_status, latitude, longitude, social_links, contact, opening_information)`;

const ADMIN_ROLES = ['admin', 'administrator', 'master_admin', 'moderator'];

const RPC_ERRORS = {
  UNAUTHENTICATED: { status: 401, code: 'unauthenticated', message: AFTRHRS_CLAIM_ERRORS.unauthenticated },
  TERMS_REQUIRED: { status: 422, code: 'terms', message: AFTRHRS_CLAIM_ERRORS.terms },
  EVENT_NOT_FOUND: { status: 404, code: 'not_found', message: 'AftrHrs edition was not found.' },
  UNPUBLISHED: { status: 409, code: 'unpublished', message: AFTRHRS_CLAIM_ERRORS.unpublished },
  CLAIMS_CLOSED: { status: 409, code: 'closed', message: AFTRHRS_CLAIM_ERRORS.closed },
  DEADLINE: { status: 409, code: 'deadline', message: AFTRHRS_CLAIM_ERRORS.deadline },
  SOLD_OUT: { status: 409, code: 'sold_out', message: AFTRHRS_CLAIM_ERRORS.sold_out },
  ALREADY_CLAIMED: { status: 409, code: 'already_claimed', message: AFTRHRS_CLAIM_ERRORS.already_claimed },
  IDENTITY_CLAIMED: { status: 409, code: 'identity_claimed', message: AFTRHRS_CLAIM_ERRORS.identity_claimed },
  NOT_FOUND: { status: 404, code: 'not_found', message: AFTRHRS_CLAIM_ERRORS.not_found },
  ALREADY_REDEEMED: { status: 409, code: 'already_redeemed', message: AFTRHRS_CLAIM_ERRORS.already_redeemed },
  NOT_REDEEMABLE: { status: 409, code: 'not_redeemable', message: AFTRHRS_CLAIM_ERRORS.not_redeemable },
  AMBASSADOR_NOT_FOUND: { status: 404, code: 'not_found', message: 'Ambassador not found.' },
  ALLOCATION_EXHAUSTED: { status: 409, code: 'allocation', message: AFTRHRS_CLAIM_ERRORS.allocation },
};

function rpcError(error) {
  const raw = String(error?.message || error || '');
  const key = Object.keys(RPC_ERRORS).find((code) => raw.includes(code));
  if (key) {
    const mapped = RPC_ERRORS[key];
    const err = new Error(mapped.message);
    err.status = mapped.status;
    err.code = mapped.code;
    return err;
  }
  const err = new Error(raw || 'AftrHrs request failed');
  err.status = 400;
  err.code = 'error';
  return err;
}

function isAdmin(user = {}) {
  const roles = user.roles || [];
  return roles.some((role) => ADMIN_ROLES.includes(role)) || ADMIN_ROLES.includes(user.role);
}

async function getEdition() {
  const { data, error } = await supabase
    .from('event_editions')
    .select(AFTRHRS_EDITION_SELECT)
    .eq('slug', AFTRHRS_MOMENT_SLUG)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const err = new Error('AftrHrs edition was not found.');
    err.status = 404;
    err.code = 'not_found';
    throw err;
  }
  return ensureCurrentRelease(data);
}

function needsAftrHrsFridayFaqs(faqs) {
  return faqs.some((faq) => /percentage|shown as|page reading|claim button|page counter|exactly \d+/i.test(`${faq?.question || ''} ${faq?.answer || ''}`))
    || faqs.some((faq) => /\b(20|30) Digital Free Passes\b/i.test(`${faq?.question || ''} ${faq?.answer || ''}`))
    || !faqs.some((faq) => String(faq?.answer || '').includes('11:30 PM'))
    || !faqs.some((faq) => /every friday/i.test(`${faq?.question || ''} ${faq?.answer || ''}`))
    || !faqs.some((faq) => /signed up for Promorang/i.test(`${faq?.question || ''} ${faq?.answer || ''}`))
    || !faqs.some((faq) => /kingston after dark/i.test(`${faq?.question || ''} ${faq?.answer || ''}`));
}

async function ensureAftrHrsMomentSchedule(edition) {
  const moment = edition.moments || {};
  if (hasAftrHrsFridayRecurrence(moment)) return edition;

  const patch = {
    ...AFTRHRS_RECURRENCE,
    starts_at: moment.starts_at || AFTRHRS_START_ISO,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('moments')
    .update(patch)
    .eq('id', AFTRHRS_MOMENT_ID)
    .select(AFTRHRS_MOMENT_SELECT)
    .single();
  if (error) {
    console.warn('[AftrHrs] Friday recurrence skipped:', error.message);
    return { ...edition, moments: { ...moment, ...patch } };
  }
  return { ...edition, moments: data };
}

async function ensureCurrentRelease(edition) {
  const needsAllocation = Number(edition.digital_allocation || 0) < AFTRHRS_DIGITAL_PASS_LIMIT;
  const faqs = Array.isArray(edition.faqs) ? edition.faqs : [];
  const needsConsumerFaqs = needsAftrHrsFridayFaqs(faqs);
  const needsOpenClaimWindow = isAftrHrsFirstNightClaimClose(edition.claim_closes_at);
  let next = edition;

  if (needsAllocation || needsConsumerFaqs || needsOpenClaimWindow) {
    const patch = { updated_at: new Date().toISOString() };
    if (needsAllocation) patch.digital_allocation = AFTRHRS_DIGITAL_PASS_LIMIT;
    if (needsConsumerFaqs) patch.faqs = DEFAULT_AFTRHRS_FAQS;
    if (needsOpenClaimWindow) {
      patch.claim_closes_at = null;
      patch.claims_open = true;
    }

    const { data, error } = await supabase
      .from('event_editions')
      .update(patch)
      .eq('id', edition.id)
      .select(AFTRHRS_EDITION_SELECT)
      .single();
    if (error) {
      console.warn('[AftrHrs] release bump skipped:', error.message);
      next = {
        ...edition,
        digital_allocation: needsAllocation ? AFTRHRS_DIGITAL_PASS_LIMIT : edition.digital_allocation,
        faqs: needsConsumerFaqs ? DEFAULT_AFTRHRS_FAQS : edition.faqs,
        claim_closes_at: needsOpenClaimWindow ? null : edition.claim_closes_at,
        claims_open: needsOpenClaimWindow ? true : edition.claims_open,
      };
    } else {
      next = data;
    }
  }

  return ensureAftrHrsMomentSchedule(next);
}

async function publicSnapshot(userId) {
  const edition = await getEdition();
  const remaining = remainingDigitalPasses({
    digitalAllocation: edition.digital_allocation,
    digitalClaimed: edition.digital_claimed,
  });

  const { data: ambassadors } = await supabase
    .from('event_ambassador_allocations')
    .select('ambassador_user_id, name, profile_image_url, allocation, distributed, tracking_code, contact_preference, public_contact_handle, contact_consent, distribution_locations, approved, active')
    .eq('event_id', edition.moment_id)
    .eq('approved', true)
    .eq('active', true);

  let pass = null;
  let participation = null;
  let followingVenue = false;
  if (userId) {
    const [{ data: passes }, { data: part }, { data: follow }] = await Promise.all([
      supabase.from('event_passes').select('*').eq('event_id', edition.moment_id).eq('user_id', userId).in('status', ['active', 'redeemed']).order('claimed_at', { ascending: false }).limit(1),
      supabase.from('event_moment_participations').select('*').eq('event_id', edition.moment_id).eq('user_id', userId).maybeSingle(),
      supabase.from('venue_follows').select('id').eq('venue_id', edition.venue_id).eq('user_id', userId).maybeSingle(),
    ]);
    pass = passes?.[0] || null;
    participation = part || null;
    followingVenue = Boolean(follow?.id);
  }

  const { count: communityCount } = await supabase
    .from('event_moment_participations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', edition.moment_id);

  const publicEdition = { ...edition };
  const allocation = Number(edition.digital_allocation || 0);
  delete publicEdition.digital_allocation;
  delete publicEdition.digital_claimed;
  delete publicEdition.metadata;
  if (publicEdition.venue_policies && typeof publicEdition.venue_policies === 'object') {
    const policies = { ...publicEdition.venue_policies };
    delete policies.notes;
    publicEdition.venue_policies = policies;
  }

  return {
    edition: {
      ...publicEdition,
      remainingPercent: publicRemainingPercent(remaining, allocation),
      soldOut: remaining <= 0,
      paths: AFTRHRS_PATHS,
      venueSlug: SEA_DECK_VENUE_SLUG,
      venueId: edition.venue_id || SEA_DECK_VENUE_ID,
    },
    ambassadors: (ambassadors || []).map((row) => ({
      id: row.ambassador_user_id,
      name: row.name,
      profileImage: row.profile_image_url,
      profilePath: `/u/${row.ambassador_user_id}`,
      approved: row.approved,
      publicContactHandle: row.contact_consent ? row.public_contact_handle : null,
      distributionLocations: row.distribution_locations || [],
    })),
    pass,
    participation,
    followingVenue,
    communityCount: communityCount || 0,
  };
}

async function track(name, payload = {}) {
  try {
    await supabase.from('event_analytics_events').insert({
      event_id: payload.eventId || AFTRHRS_MOMENT_ID,
      user_id: payload.userId || null,
      session_id: payload.sessionId || null,
      name,
      source: payload.source || null,
      campaign: payload.campaign || null,
      referrer: payload.referrer || null,
      properties: payload.properties || {},
    });
  } catch (error) {
    console.warn('[AftrHrs] analytics insert skipped:', error.message);
  }
}

async function claimDigitalPass(user, body = {}) {
  if (!user?.id) {
    const err = new Error(AFTRHRS_CLAIM_ERRORS.unauthenticated);
    err.status = 401;
    err.code = 'unauthenticated';
    throw err;
  }

  console.info('[AftrHrs] claim start', { userId: user.id, source: body.source || 'landing' });
  await track('digital_pass_claim_start', {
    userId: user.id,
    source: body.source,
    campaign: body.campaign,
    referrer: body.referrer,
    properties: { intent: true },
  });

  const { data, error } = await supabase.rpc('claim_aftrhrs_digital_pass', {
    p_user_id: user.id,
    p_event_id: AFTRHRS_MOMENT_ID,
    p_terms_accepted: Boolean(body.termsAccepted),
    p_email: body.email || user.email || null,
    p_phone: body.phone || user.phone || null,
    p_source: body.source || 'landing',
    p_campaign: body.campaign || null,
    p_referrer: body.referrer || null,
    p_metadata: {
      session_id: body.sessionId || null,
      utm_source: body.utmSource || null,
    },
  });

  if (error) {
    const mapped = rpcError(error);
    console.warn('[AftrHrs] claim rejected', { userId: user.id, code: mapped.code, message: mapped.message });
    await track('digital_pass_claim_failed', {
      userId: user.id,
      source: body.source,
      campaign: body.campaign,
      referrer: body.referrer,
      properties: { reason: mapped.code },
    });
    throw mapped;
  }

  console.info('[AftrHrs] claim issued', { userId: user.id, passId: data?.pass?.id, remaining: data?.remaining });
  await track('digital_pass_claimed', {
    userId: user.id,
    source: body.source,
    campaign: body.campaign,
    referrer: body.referrer,
    properties: { pass_id: data?.pass?.id, remaining: data?.remaining },
  });

  await sendAftrHrsGuestEmail(user, {
    kind: 'pass',
    activationCode: data?.pass?.unique_code,
    locale: body.locale,
  });

  return data;
}

async function joinMoment(user, body = {}) {
  if (!user?.id) {
    const err = new Error(AFTRHRS_CLAIM_ERRORS.unauthenticated);
    err.status = 401;
    err.code = 'unauthenticated';
    throw err;
  }
  const { data, error } = await supabase
    .from('event_moment_participations')
    .upsert({
      user_id: user.id,
      event_id: AFTRHRS_MOMENT_ID,
      state: 'interested',
      source: body.source || 'landing',
      referrer: body.referrer || null,
      reminder_opt_in: body.reminderOptIn !== false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,event_id' })
    .select()
    .single();
  if (error) throw error;
  await track('moment_join', { userId: user.id, source: body.source, referrer: body.referrer });
  const { data: existingPass } = await supabase
    .from('event_passes')
    .select('id')
    .eq('event_id', AFTRHRS_MOMENT_ID)
    .eq('user_id', user.id)
    .in('status', ['active', 'redeemed'])
    .limit(1);
  if (!existingPass?.length) {
    await sendAftrHrsGuestEmail(user, { kind: 'rsvp', locale: body.locale });
  }
  return data;
}

async function sendAftrHrsGuestEmail(user, payload) {
  if (!user?.email) return;
  try {
    const { sendAftrHrsRsvpEmail } = require('./resendService');
    await sendAftrHrsRsvpEmail(user.email, user.display_name || user.username || 'there', payload);
  } catch (emailError) {
    console.warn('[AftrHrs] confirmation email skipped:', emailError.message);
  }
}

async function requestAmbassador(user, body = {}) {
  const { data, error } = await supabase
    .from('event_ambassador_requests')
    .insert({
      event_id: AFTRHRS_MOMENT_ID,
      user_id: user?.id || null,
      ambassador_id: body.ambassadorId || null,
      status: body.ambassadorId ? 'assigned' : 'open',
      note: body.note || null,
      waitlist: Boolean(body.waitlist),
    })
    .select()
    .single();
  if (error) throw error;
  if (user?.id) {
    await supabase.from('event_moment_participations').upsert({
      user_id: user.id,
      event_id: AFTRHRS_MOMENT_ID,
      state: body.waitlist ? 'pass_requested' : 'ambassador_request_submitted',
      source: 'ambassador',
      referrer: body.ambassadorId || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,event_id' });
  }
  await track(body.waitlist ? 'waitlist_join' : 'ambassador_request', {
    userId: user?.id,
    referrer: body.ambassadorId,
    properties: { waitlist: Boolean(body.waitlist) },
  });
  return data;
}

async function followVenue(user, follow = true) {
  if (!user?.id) {
    const err = new Error(AFTRHRS_CLAIM_ERRORS.unauthenticated);
    err.status = 401;
    err.code = 'unauthenticated';
    throw err;
  }
  if (follow) {
    const { error } = await supabase.from('venue_follows').upsert({
      venue_id: SEA_DECK_VENUE_ID,
      user_id: user.id,
    }, { onConflict: 'venue_id,user_id' });
    if (error) throw error;
    await track('venue_follow', { userId: user.id, source: 'sea-deck' });
    return { following: true };
  }
  await supabase.from('venue_follows').delete().eq('venue_id', SEA_DECK_VENUE_ID).eq('user_id', user.id);
  return { following: false };
}

async function redeemPass(user, body = {}) {
  if (!user?.id) {
    const err = new Error(AFTRHRS_CLAIM_ERRORS.unauthenticated);
    err.status = 401;
    err.code = 'unauthenticated';
    throw err;
  }
  const code = decodeAftrHrsPassPayload(body.code);
  console.info('[AftrHrs] redeem start', { actor: user.id, code });
  const { data, error } = await supabase.rpc('redeem_aftrhrs_pass', {
    p_actor_user_id: user.id,
    p_code: code,
    p_notes: body.notes || null,
    p_device: body.device || {},
  });
  if (error) {
    const mapped = rpcError(error);
    console.warn('[AftrHrs] redeem rejected', { actor: user.id, code, reason: mapped.code });
    throw mapped;
  }
  console.info('[AftrHrs] redeem complete', { actor: user.id, passId: data?.id });
  await track('check_in', { userId: data?.user_id, properties: { pass_id: data?.id, actor: user.id } });
  return data;
}

async function ambassadorDashboard(user) {
  const { data: allocation, error } = await supabase
    .from('event_ambassador_allocations')
    .select('*')
    .eq('event_id', AFTRHRS_MOMENT_ID)
    .eq('ambassador_user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  if (!allocation || !allocation.approved) {
    const err = new Error(AFTRHRS_CLAIM_ERRORS.forbidden);
    err.status = 403;
    err.code = 'forbidden';
    throw err;
  }
  const [{ data: requests }, { data: passes }] = await Promise.all([
    supabase.from('event_ambassador_requests').select('*').eq('event_id', AFTRHRS_MOMENT_ID).or(`ambassador_id.eq.${user.id},status.eq.open`).order('created_at', { ascending: false }),
    supabase.from('event_passes').select('id, pass_type, status, unique_code, claimed_at, redeemed_at, user_id, campaign').eq('event_id', AFTRHRS_MOMENT_ID).eq('ambassador_id', user.id),
  ]);
  return {
    allocation: {
      ...allocation,
      remaining: Math.max(0, allocation.allocation - allocation.distributed),
      sharePath: `${AFTRHRS_PATHS.moment}?ref=${allocation.tracking_code}`,
    },
    requests: requests || [],
    passes: passes || [],
  };
}

async function fulfillInvitation(user, body = {}) {
  const { data, error } = await supabase.rpc('fulfill_aftrhrs_invitation', {
    p_ambassador_id: user.id,
    p_event_id: AFTRHRS_MOMENT_ID,
    p_user_id: body.userId || null,
    p_phone: body.phone || null,
    p_request_id: body.requestId || null,
    p_unique_code: body.uniqueCode || null,
  });
  if (error) throw rpcError(error);
  await track('physical_invitation_fulfilled', {
    userId: body.userId || user.id,
    referrer: user.id,
    properties: { pass_id: data?.pass?.id },
  });
  return data;
}

function assertAdmin(user) {
  if (!isAdmin(user)) {
    const err = new Error(AFTRHRS_CLAIM_ERRORS.forbidden);
    err.status = 403;
    err.code = 'forbidden';
    throw err;
  }
}

async function adminOverview(user) {
  assertAdmin(user);
  const edition = await getEdition();
  const [{ data: passes }, { data: ambassadors }, { data: requests }, { data: events }] = await Promise.all([
    supabase.from('event_passes').select('*').eq('event_id', edition.moment_id).order('claimed_at', { ascending: false }),
    supabase.from('event_ambassador_allocations').select('*').eq('event_id', edition.moment_id),
    supabase.from('event_ambassador_requests').select('*').eq('event_id', edition.moment_id).order('created_at', { ascending: false }),
    supabase.from('event_analytics_events').select('name').eq('event_id', edition.moment_id),
  ]);
  const counts = (events || []).reduce((acc, row) => {
    acc[row.name] = (acc[row.name] || 0) + 1;
    return acc;
  }, {});
  return {
    edition,
    remaining: remainingDigitalPasses({ digitalAllocation: edition.digital_allocation, digitalClaimed: edition.digital_claimed }),
    passes: passes || [],
    ambassadors: ambassadors || [],
    requests: requests || [],
    funnel: {
      landing_view: counts.landing_view || 0,
      moment_join: counts.moment_join || 0,
      pass_secured: (passes || []).filter((pass) => pass.status !== 'cancelled').length,
      reminder_reached: counts.reminder_reached || 0,
      checked_in: (passes || []).filter((pass) => pass.status === 'redeemed').length,
      attended: counts.attended || 0,
      retained: counts.future_edition_interest || 0,
      failed_claims: counts.digital_pass_claim_failed || 0,
    },
  };
}

async function adminUpdate(user, body = {}) {
  assertAdmin(user);
  const allowed = {
    published: body.published,
    claims_open: body.claimsOpen,
    digital_allocation: body.digitalAllocation,
    claim_opens_at: body.claimOpensAt,
    claim_closes_at: body.claimClosesAt,
    page_mode: body.pageMode,
    faqs: body.faqs,
    venue_policies: body.venuePolicies,
    capacity_information: body.capacityInformation,
    paid_admission_jmd: body.paidAdmissionJmd,
    paid_patron_benefit: body.paidPatronBenefit,
    supporting_copy: body.supportingCopy,
    tagline: body.tagline,
    updated_at: new Date().toISOString(),
  };
  const patch = Object.fromEntries(Object.entries(allowed).filter(([, value]) => value !== undefined));
  const { data, error } = await supabase.from('event_editions').update(patch).eq('slug', AFTRHRS_MOMENT_SLUG).select().single();
  if (error) throw error;
  if (body.venue) {
    await supabase.from('venue_profiles').update({
      description: body.venue.description,
      social_links: body.venue.socialLinks,
      contact: body.venue.contact,
      opening_information: body.venue.openingInformation,
      updated_at: new Date().toISOString(),
    }).eq('id', SEA_DECK_VENUE_ID);
  }
  return data;
}

async function adminUpdatePass(user, passId, body = {}) {
  assertAdmin(user);
  const { data: current, error: currentError } = await supabase
    .from('event_passes')
    .select('pass_type, status, event_id')
    .eq('id', passId)
    .single();
  if (currentError || !current) throw currentError || new Error('Pass not found');

  const patch = { updated_at: new Date().toISOString() };
  if (body.status) patch.status = body.status;
  const { data, error } = await supabase.from('event_passes').update(patch).eq('id', passId).select().single();
  if (error) throw error;

  if (current.pass_type === 'digital-free') {
    if (body.status === 'cancelled' && current.status !== 'cancelled') {
      const { data: edition } = await supabase.from('event_editions').select('digital_claimed').eq('moment_id', current.event_id).single();
      if (edition) {
        await supabase.from('event_editions').update({
          digital_claimed: Math.max(0, Number(edition.digital_claimed || 1) - 1),
          updated_at: new Date().toISOString(),
        }).eq('moment_id', current.event_id);
      }
    }
    if (body.status === 'active' && current.status === 'cancelled') {
      const { data: edition } = await supabase.from('event_editions').select('digital_claimed').eq('moment_id', current.event_id).single();
      if (edition) {
        await supabase.from('event_editions').update({
          digital_claimed: Number(edition.digital_claimed || 0) + 1,
          updated_at: new Date().toISOString(),
        }).eq('moment_id', current.event_id);
      }
    }
  }

  console.info('[AftrHrs] admin pass update', { actor: user.id, passId, status: body.status });
  return data;
}

async function adminSaveAmbassador(user, body = {}) {
  assertAdmin(user);
  const row = {
    ambassador_user_id: body.ambassadorUserId,
    event_id: AFTRHRS_MOMENT_ID,
    name: body.name,
    profile_image_url: body.profileImageUrl || null,
    allocation: Number(body.allocation || 0),
    tracking_code: body.trackingCode,
    contact_preference: body.contactPreference || 'promorang',
    public_contact_handle: body.publicContactHandle || null,
    contact_consent: Boolean(body.contactConsent),
    distribution_locations: body.distributionLocations || [],
    approved: body.approved !== false,
    active: body.active !== false,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('event_ambassador_allocations')
    .upsert(row, { onConflict: 'ambassador_user_id,event_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function guestListCsv(user) {
  assertAdmin(user);
  const { data, error } = await supabase
    .from('event_passes')
    .select('unique_code, pass_type, status, user_id, ambassador_id, claim_source, campaign, claimed_at, redeemed_at')
    .eq('event_id', AFTRHRS_MOMENT_ID)
    .order('claimed_at', { ascending: true });
  if (error) throw error;
  const header = 'unique_code,pass_type,status,user_id,ambassador_id,claim_source,campaign,claimed_at,redeemed_at';
  const lines = (data || []).map((row) => [
    row.unique_code, row.pass_type, row.status, row.user_id, row.ambassador_id,
    row.claim_source, row.campaign, row.claimed_at, row.redeemed_at,
  ].map((value) => JSON.stringify(value ?? '')).join(','));
  return [header, ...lines].join('\n');
}

module.exports = {
  AFTRHRS_MOMENT_ID,
  publicSnapshot,
  track,
  claimDigitalPass,
  joinMoment,
  requestAmbassador,
  followVenue,
  redeemPass,
  ambassadorDashboard,
  fulfillInvitation,
  adminOverview,
  adminUpdate,
  adminUpdatePass,
  adminSaveAmbassador,
  guestListCsv,
  isAdmin,
  assertAdmin,
  rpcError,
};
