const { supabase } = require('../lib/supabase');
const {
  AFTRHRS_CLAIM_ERRORS,
  AFTRHRS_GUEST_ERRORS,
  AFTRHRS_MOMENT_ID,
  AFTRHRS_MOMENT_SLUG,
  AFTRHRS_SCENE_SLUG,
  AFTRHRS_PATHS,
  AFTRHRS_RECURRENCE,
  AFTRHRS_START_ISO,
  SEA_DECK_VENUE_ID,
  SEA_DECK_VENUE_SLUG,
  decodeAftrHrsPassPayload,
  remainingDigitalPasses,
  remainingGuestSlots,
  publicRemainingPercent,
  AFTRHRS_DIGITAL_PASS_LIMIT,
  AFTRHRS_RSVP_LIMIT,
  AFTRHRS_DIGITAL_PASS_BATCH,
  AFTRHRS_FIRST_FRIDAY,
  DEFAULT_AFTRHRS_FAQS,
  aftrHrsClaimFriday,
  aftrHrsEditionSlug,
  aftrHrsMonthKey,
  aftrHrsTicketPath,
  normalizeAftrHrsIdentity,
  normalizeAftrHrsName,
  normalizeAftrHrsPhone,
  isValidAftrHrsEmail,
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
  const edition = await ensureAftrHrsWeeklyEdition();
  await Promise.resolve(supabase.rpc('aftrhrs_expire_stale_guest_entries')).catch(() => undefined);
  return ensureCurrentRelease(edition);
}

async function fetchEditionByFriday(friday) {
  const { data, error } = await supabase
    .from('event_editions')
    .select(AFTRHRS_EDITION_SELECT)
    .eq('moment_id', AFTRHRS_MOMENT_ID)
    .eq('week_friday', friday)
    .maybeSingle();
  if (error && !/week_friday|column/i.test(error.message || '')) throw error;
  if (error) return null;
  return data || null;
}

async function expireUnusedPriorPasses(friday) {
  const { data: prior, error } = await supabase
    .from('event_editions')
    .select('id')
    .eq('moment_id', AFTRHRS_MOMENT_ID)
    .lt('week_friday', friday);
  if (error || !prior?.length) return;
  await supabase
    .from('event_passes')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('status', 'active')
    .in('edition_id', prior.map((row) => row.id));
}

async function ensureAftrHrsWeeklyEdition(now = new Date()) {
  const friday = aftrHrsClaimFriday(now);
  const rpcResult = await Promise.resolve(supabase.rpc('ensure_aftrhrs_weekly_edition', {
    p_now: now instanceof Date ? now.toISOString() : new Date(now).toISOString(),
  })).catch((error) => ({ data: null, error }));
  const rpcEdition = rpcResult?.data;
  const rpcError = rpcResult?.error;
  if (!rpcError && rpcEdition) {
    const { data } = await supabase
      .from('event_editions')
      .select(AFTRHRS_EDITION_SELECT)
      .eq('id', rpcEdition.id || rpcEdition)
      .maybeSingle();
    if (data) return data;
  }

  await expireUnusedPriorPasses(friday).catch(() => undefined);
  const current = await fetchEditionByFriday(friday);
  if (current) return current;

  const { data: latest } = await supabase
    .from('event_editions')
    .select(AFTRHRS_EDITION_SELECT)
    .eq('moment_id', AFTRHRS_MOMENT_ID)
    .order('week_friday', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (latest && !latest.week_friday && latest.slug === AFTRHRS_MOMENT_SLUG) {
    await supabase
      .from('event_editions')
      .update({ week_friday: AFTRHRS_FIRST_FRIDAY, updated_at: new Date().toISOString() })
      .eq('id', latest.id);
    if (friday === AFTRHRS_FIRST_FRIDAY) {
      return { ...latest, week_friday: AFTRHRS_FIRST_FRIDAY };
    }
  }

  if (latest && String(latest.week_friday || '').slice(0, 10) === friday) return latest;

  const insert = {
    moment_id: AFTRHRS_MOMENT_ID,
    venue_id: latest?.venue_id || SEA_DECK_VENUE_ID,
    slug: aftrHrsEditionSlug(friday),
    title: latest?.title || 'AftrHrs',
    tagline: latest?.tagline || null,
    supporting_copy: latest?.supporting_copy || '',
    powered_by: latest?.powered_by || 'Origin — Alric & Boyd',
    music_categories: latest?.music_categories || ['Afro House', 'Classic House', 'House Fusion'],
    published: true,
    page_mode: 'live',
    claims_open: true,
    digital_allocation: AFTRHRS_DIGITAL_PASS_LIMIT,
    digital_claimed: 0,
    rsvp_allocation: AFTRHRS_RSVP_LIMIT,
    rsvp_claimed: 0,
    claim_opens_at: null,
    claim_closes_at: null,
    paid_admission_jmd: latest?.paid_admission_jmd || 2000,
    paid_patron_benefit: latest?.paid_patron_benefit || 'Complimentary drink and wings',
    venue_policies: latest?.venue_policies || {},
    faqs: latest?.faqs || DEFAULT_AFTRHRS_FAQS,
    artwork: latest?.artwork || {},
    metadata: latest?.metadata || {},
    week_friday: friday,
    updated_at: new Date().toISOString(),
  };

  const { data: created, error } = await supabase
    .from('event_editions')
    .insert(insert)
    .select(AFTRHRS_EDITION_SELECT)
    .single();
  if (error) {
    const again = await fetchEditionByFriday(friday);
    if (again) return again;
    if (latest) return latest;
    throw error;
  }
  return created;
}

function needsAftrHrsFridayFaqs(faqs) {
  return faqs.some((faq) => /percentage|shown as|page reading|claim button|page counter|exactly \d+/i.test(`${faq?.question || ''} ${faq?.answer || ''}`))
    || faqs.some((faq) => /\b(20|30) Digital Free Passes\b/i.test(`${faq?.question || ''} ${faq?.answer || ''}`))
    || !faqs.some((faq) => String(faq?.answer || '').includes('11:30 PM'))
    || !faqs.some((faq) => /every friday/i.test(`${faq?.question || ''} ${faq?.answer || ''}`))
    || !faqs.some((faq) => /signed up for Promorang/i.test(`${faq?.question || ''} ${faq?.answer || ''}`))
    || !faqs.some((faq) => /good every Friday|expire after the night|claim again next week|open again next week/i.test(`${faq?.question || ''} ${faq?.answer || ''}`))
    || faqs.some((faq) => /not the Friday door|not tonight's door|not the event/i.test(`${faq?.question || ''} ${faq?.answer || ''}`))
    || !faqs.some((faq) => /inside that scene/i.test(`${faq?.question || ''} ${faq?.answer || ''}`));
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

  await ensureAftrHrsSceneLink().catch((error) => {
    console.warn('[AftrHrs] scene link skipped:', error.message);
  });
  return ensureAftrHrsMomentSchedule(next);
}

async function ensureAftrHrsSceneLink() {
  const { data: scene, error: sceneError } = await supabase
    .from('scenes')
    .select('id')
    .eq('slug', AFTRHRS_SCENE_SLUG)
    .maybeSingle();
  if (sceneError) throw sceneError;
  if (!scene?.id) return;
  const { data: link, error: linkError } = await supabase
    .from('moment_scene_links')
    .select('id')
    .eq('moment_id', AFTRHRS_MOMENT_ID)
    .eq('scene_id', scene.id)
    .maybeSingle();
  if (linkError) throw linkError;
  if (link) return;
  const { error } = await supabase.from('moment_scene_links').insert({
    moment_id: AFTRHRS_MOMENT_ID,
    scene_id: scene.id,
    relationship: 'featured',
  });
  if (error && !/duplicate|unique/i.test(error.message || '')) throw error;
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
      supabase.from('event_passes').select('*').eq('edition_id', edition.id).eq('user_id', userId).in('status', ['active', 'redeemed']).order('claimed_at', { ascending: false }).limit(1),
      supabase.from('event_moment_participations').select('*').eq('event_id', edition.moment_id).eq('user_id', userId).maybeSingle(),
      supabase.from('venue_follows').select('id').eq('venue_id', edition.venue_id).eq('user_id', userId).maybeSingle(),
    ]);
    pass = passes?.[0] || null;
    participation = part || null;
    followingVenue = Boolean(follow?.id);
  }

  const communityCount = await countMomentGoing(edition.moment_id);

  const publicEdition = { ...edition };
  const allocation = Number(edition.digital_allocation || 0);
  delete publicEdition.digital_allocation;
  delete publicEdition.digital_claimed;
  delete publicEdition.rsvp_allocation;
  delete publicEdition.rsvp_claimed;
  delete publicEdition.metadata;
  if (publicEdition.venue_policies && typeof publicEdition.venue_policies === 'object') {
    const policies = { ...publicEdition.venue_policies };
    delete policies.notes;
    publicEdition.venue_policies = policies;
  }

  const guest = await guestLaneSnapshot(edition);

  return {
    edition: {
      ...publicEdition,
      remainingPercent: publicRemainingPercent(remaining, allocation),
      soldOut: remaining <= 0,
      paths: AFTRHRS_PATHS,
      venueSlug: SEA_DECK_VENUE_SLUG,
      venueId: edition.venue_id || SEA_DECK_VENUE_ID,
    },
    guest,
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

function guestFail(code, message, status = 422) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

async function readOpenDigitalRelease() {
  const { data, error } = await supabase
    .from('aftrhrs_digital_releases')
    .select('*')
    .eq('claims_open', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && /aftrhrs_digital_releases|does not exist|column/i.test(error.message || '')) return null;
  if (error) return null;
  return data || null;
}

async function readLatestDigitalRelease() {
  const open = await readOpenDigitalRelease();
  if (open) return open;
  const { data, error } = await supabase
    .from('aftrhrs_digital_releases')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data || null;
}

async function guestLaneSnapshot(edition) {
  const rsvpAllocation = Number(edition?.rsvp_allocation ?? AFTRHRS_RSVP_LIMIT);
  const rsvpClaimed = Number(edition?.rsvp_claimed ?? 0);
  const rsvpRemaining = remainingGuestSlots(rsvpAllocation, rsvpClaimed);
  const release = await readLatestDigitalRelease();
  const digitalAllocation = Number(release?.allocation ?? AFTRHRS_DIGITAL_PASS_BATCH);
  const digitalClaimed = Number(release?.claimed ?? 0);
  const digitalRemaining = remainingGuestSlots(digitalAllocation, digitalClaimed);
  const digitalOpen = release ? Boolean(release.claims_open) && digitalRemaining > 0 : true;
  return {
    rsvp: {
      remainingPercent: publicRemainingPercent(rsvpRemaining, rsvpAllocation),
      soldOut: rsvpRemaining <= 0,
      open: Boolean(edition?.published !== false) && rsvpRemaining > 0,
    },
    digitalPass: {
      remainingPercent: digitalOpen ? publicRemainingPercent(digitalRemaining, digitalAllocation) : 0,
      soldOut: !digitalOpen,
      open: Boolean(edition?.published !== false) && digitalOpen,
    },
  };
}

async function guestRsvp(body = {}) {
  if (String(body.website || body.honeypot || '').trim()) {
    return { ok: true, silent: true };
  }
  const kind = body.kind === 'digital-pass' ? 'digital-pass' : 'rsvp';
  const name = normalizeAftrHrsName(body.name || body.fullName);
  const email = normalizeAftrHrsIdentity(body.email);
  const phone = normalizeAftrHrsPhone(body.phone || body.telephone);
  if (!name) throw guestFail('terms', AFTRHRS_GUEST_ERRORS.name);
  if (!isValidAftrHrsEmail(email)) throw guestFail('terms', AFTRHRS_GUEST_ERRORS.email);
  if (!phone) throw guestFail('terms', AFTRHRS_GUEST_ERRORS.phone);
  if (!body.termsAccepted) throw guestFail('terms', AFTRHRS_GUEST_ERRORS.terms);

  const rpc = await Promise.resolve(supabase.rpc('aftrhrs_guest_rsvp', {
    p_kind: kind,
    p_name: name,
    p_email: email,
    p_phone: body.phone || body.telephone || phone,
    p_terms_accepted: true,
    p_source: body.source || 'landing',
    p_campaign: body.campaign || null,
    p_referrer: body.referrer || null,
  })).catch((error) => ({ data: null, error }));

  if (!rpc.error && rpc.data) {
    const code = rpc.data.entry?.unique_code || rpc.data.entry?.uniqueCode;
    await attachGuestToMoment({ name, email, phone: body.phone || phone, code, kind });
    await sendGuestLandingEmail({
      name,
      email,
      kind,
      code,
      locale: body.locale,
    });
    await track(kind === 'digital-pass' ? 'guest_digital_pass' : 'guest_rsvp', {
      properties: { entry_id: rpc.data.entry?.id, kind },
    });
    return publicGuestResult(rpc.data.entry || rpc.data, kind);
  }
  if (rpc.error && !/function|does not exist|schema cache/i.test(String(rpc.error.message || ''))) {
    const mapped = rpcError(rpc.error);
    if (mapped.code === 'already_claimed') {
      mapped.message = kind === 'digital-pass' ? AFTRHRS_GUEST_ERRORS.already_pass : AFTRHRS_GUEST_ERRORS.already_rsvp;
    }
    if (mapped.code === 'sold_out') mapped.message = AFTRHRS_GUEST_ERRORS.rsvp_full;
    if (mapped.code === 'closed') mapped.message = AFTRHRS_GUEST_ERRORS.pass_closed;
    throw mapped;
  }

  return guestRsvpFallback({ kind, name, email, phone: body.phone || phone, locale: body.locale, source: body.source, campaign: body.campaign, referrer: body.referrer });
}

function publicGuestResult(entry, kind) {
  const code = entry?.unique_code || entry?.uniqueCode || null;
  return {
    ok: true,
    kind,
    name: entry?.full_name || entry?.name || null,
    ticketPath: kind === 'digital-pass' && code ? aftrHrsTicketPath(code) : null,
    code: kind === 'digital-pass' ? code : null,
  };
}

async function guestRsvpFallback({ kind, name, email, phone, locale, source, campaign, referrer }) {
  const edition = await getEdition();
  if (edition.published === false) throw guestFail('unpublished', AFTRHRS_GUEST_ERRORS.unpublished, 409);

  if (kind === 'rsvp') {
    const remaining = remainingGuestSlots(edition.rsvp_allocation ?? AFTRHRS_RSVP_LIMIT, edition.rsvp_claimed ?? 0);
    if (remaining <= 0) throw guestFail('sold_out', AFTRHRS_GUEST_ERRORS.rsvp_full, 409);
    const { data: existing } = await supabase
      .from('aftrhrs_guest_entries')
      .select('id')
      .eq('kind', 'rsvp')
      .eq('week_friday', edition.week_friday)
      .in('status', ['active', 'redeemed'])
      .or(`email_normalized.eq.${email},phone_normalized.eq.${normalizeAftrHrsPhone(phone)}`)
      .limit(1);
    if (existing?.length) throw guestFail('already_claimed', AFTRHRS_GUEST_ERRORS.already_rsvp, 409);
  } else {
    let release = await readLatestDigitalRelease();
    if (!release) {
      const created = await supabase.from('aftrhrs_digital_releases').insert({
        month_key: aftrHrsMonthKey(),
        batch_index: 1,
        allocation: AFTRHRS_DIGITAL_PASS_BATCH,
        claimed: 0,
        claims_open: true,
      }).select().single();
      release = created.data;
    }
    const remaining = remainingGuestSlots(release?.allocation ?? AFTRHRS_DIGITAL_PASS_BATCH, release?.claimed ?? 0);
    if (!release || !release.claims_open || remaining <= 0) {
      throw guestFail('closed', AFTRHRS_GUEST_ERRORS.pass_closed, 409);
    }
    const { data: existing } = await supabase
      .from('aftrhrs_guest_entries')
      .select('id')
      .eq('kind', 'digital-pass')
      .eq('month_key', release.month_key)
      .in('status', ['active', 'redeemed'])
      .or(`email_normalized.eq.${email},phone_normalized.eq.${normalizeAftrHrsPhone(phone)}`)
      .limit(1);
    if (existing?.length) throw guestFail('already_claimed', AFTRHRS_GUEST_ERRORS.already_pass, 409);
  }

  const uniqueCode = `AH-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const release = kind === 'digital-pass' ? await readOpenDigitalRelease() : null;
  const insert = {
    kind,
    full_name: name,
    email,
    email_normalized: email,
    phone: String(phone),
    phone_normalized: normalizeAftrHrsPhone(phone),
    unique_code: uniqueCode,
    qr_payload: `promorang://aftrhrs/redeem/${uniqueCode}`,
    status: 'active',
    edition_id: kind === 'rsvp' ? edition.id : null,
    week_friday: kind === 'rsvp' ? edition.week_friday : null,
    release_id: release?.id || null,
    month_key: kind === 'digital-pass' ? (release?.month_key || aftrHrsMonthKey()) : null,
    terms_accepted_at: new Date().toISOString(),
    source: source || 'landing',
    campaign: campaign || null,
    referrer: referrer || null,
  };
  const { data, error } = await supabase.from('aftrhrs_guest_entries').insert(insert).select().single();
  if (error) {
    if (error.code === '23505') {
      throw guestFail('already_claimed', kind === 'digital-pass' ? AFTRHRS_GUEST_ERRORS.already_pass : AFTRHRS_GUEST_ERRORS.already_rsvp, 409);
    }
    throw error;
  }
  if (kind === 'rsvp') {
    await supabase.from('event_editions').update({
      rsvp_claimed: Number(edition.rsvp_claimed || 0) + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', edition.id);
  } else if (release) {
    const nextClaimed = Number(release.claimed || 0) + 1;
    await supabase.from('aftrhrs_digital_releases').update({
      claimed: nextClaimed,
      claims_open: nextClaimed < Number(release.allocation || AFTRHRS_DIGITAL_PASS_BATCH),
      updated_at: new Date().toISOString(),
    }).eq('id', release.id);
  }
  await attachGuestToMoment({ name, email, phone, code: uniqueCode, kind });
  await sendGuestLandingEmail({ name, email, kind, code: uniqueCode, locale });
  await track(kind === 'digital-pass' ? 'guest_digital_pass' : 'guest_rsvp', {
    properties: { entry_id: data.id, kind },
  });
  return publicGuestResult(data, kind);
}

async function countMomentGoing(momentId = AFTRHRS_MOMENT_ID) {
  const going = await Promise.resolve(supabase.rpc('moment_going_count', {
    p_moment_id: momentId || AFTRHRS_MOMENT_ID,
  })).catch((error) => ({ data: null, error }));
  const counted = Number(going.data);
  if (!going.error && Number.isFinite(counted)) return counted;

  const [{ count: accountCount }, { count: guestCount }] = await Promise.all([
    supabase
      .from('event_moment_participations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', momentId || AFTRHRS_MOMENT_ID),
    supabase
      .from('guest_moment_rsvps')
      .select('id', { count: 'exact', head: true })
      .eq('moment_id', momentId || AFTRHRS_MOMENT_ID)
      .in('status', ['confirmed', 'checked_in']),
  ]);
  return (accountCount || 0) + (guestCount || 0);
}

async function attachGuestToMoment({ name, email, phone, code, kind }) {
  if (!code || !name) return null;
  const payload = {
    p_name: name,
    p_email: email || null,
    p_phone: String(phone || ''),
    p_code: String(code).toUpperCase(),
    p_kind: kind || 'rsvp',
    p_moment_id: AFTRHRS_MOMENT_ID,
  };
  const rpc = await Promise.resolve(supabase.rpc('aftrhrs_attach_guest_to_moment', payload))
    .catch((error) => ({ data: null, error }));
  if (!rpc.error) return rpc.data || true;
  if (!/function|does not exist|schema cache/i.test(String(rpc.error.message || ''))) {
    if (!/duplicate|unique|23505/i.test(String(rpc.error.message || ''))) {
      console.warn('[AftrHrs] moment attach skipped:', rpc.error.message);
    }
    return null;
  }

  const { error } = await supabase.from('guest_moment_rsvps').insert({
    moment_id: AFTRHRS_MOMENT_ID,
    full_name: name,
    mobile: String(phone || '').replace(/\D/g, '').slice(0, 40) || '0000000',
    email: email || null,
    guest_count: 1,
    status: 'confirmed',
    pass_code: String(code).toUpperCase(),
    consent_email: true,
    schedule_snapshot: { source: 'aftrhrs_guest', kind: kind || 'rsvp' },
  });
  if (error && error.code !== '23505' && !/duplicate|unique/i.test(error.message || '')) {
    console.warn('[AftrHrs] moment attach skipped:', error.message);
    return null;
  }
  return true;
}

async function sendGuestLandingEmail({ name, email, kind, code, locale }) {
  if (!email) return;
  try {
    const { sendAftrHrsRsvpEmail } = require('./resendService');
    await sendAftrHrsRsvpEmail(email, name || 'there', {
      kind: kind === 'digital-pass' ? 'guest-pass' : 'rsvp',
      activationCode: code,
      ticketPath: kind === 'digital-pass' ? aftrHrsTicketPath(code) : null,
      locale,
    });
  } catch (emailError) {
    console.warn('[AftrHrs] guest email skipped:', emailError.message);
  }
}

async function publicTicket(code) {
  const unique = decodeAftrHrsPassPayload(code);
  if (!unique) throw guestFail('not_found', AFTRHRS_GUEST_ERRORS.not_found, 404);
  const { data, error } = await supabase
    .from('aftrhrs_guest_entries')
    .select('full_name, kind, unique_code, qr_payload, status, week_friday, month_key, claimed_at, redeemed_at')
    .eq('unique_code', unique)
    .maybeSingle();
  if (error || !data) throw guestFail('not_found', AFTRHRS_GUEST_ERRORS.not_found, 404);
  return {
    name: data.full_name,
    kind: data.kind,
    code: data.unique_code,
    qrPayload: data.qr_payload,
    status: data.status,
    weekFriday: data.week_friday,
    monthKey: data.month_key,
    claimedAt: data.claimed_at,
    redeemedAt: data.redeemed_at,
  };
}

async function adminDigitalRelease(user, body = {}) {
  assertAdmin(user);
  const action = String(body.action || '').toLowerCase();
  if (action === 'close') {
    const rpc = await Promise.resolve(supabase.rpc('aftrhrs_close_digital_release')).catch((error) => ({ data: null, error }));
    if (!rpc.error && rpc.data) return rpc.data;
    const current = await readOpenDigitalRelease();
    if (!current) throw guestFail('closed', AFTRHRS_GUEST_ERRORS.pass_closed, 409);
    const { data, error } = await supabase.from('aftrhrs_digital_releases').update({
      claims_open: false,
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', current.id).select().single();
    if (error) throw error;
    return data;
  }
  if (action === 'open') {
    const rpc = await Promise.resolve(supabase.rpc('aftrhrs_open_digital_release')).catch((error) => ({ data: null, error }));
    if (!rpc.error && rpc.data) return rpc.data;
    const open = await readOpenDigitalRelease();
    if (open) {
      await supabase.from('aftrhrs_digital_releases').update({
        claims_open: false,
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', open.id);
    }
    const { data, error } = await supabase.from('aftrhrs_digital_releases').insert({
      month_key: aftrHrsMonthKey(),
      batch_index: 1,
      allocation: AFTRHRS_DIGITAL_PASS_BATCH,
      claimed: 0,
      claims_open: true,
    }).select().single();
    if (error) throw error;
    return data;
  }
  throw guestFail('terms', 'Use close or open for the digital drop.');
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
  if (!error && data) {
    console.info('[AftrHrs] redeem complete', { actor: user.id, passId: data?.id });
    await track('check_in', { userId: data?.user_id, properties: { pass_id: data?.id, actor: user.id } });
    return data;
  }
  const guest = await redeemGuestEntry(user, code, body);
  if (guest) return guest;
  const mapped = rpcError(error || new Error('NOT_FOUND'));
  console.warn('[AftrHrs] redeem rejected', { actor: user.id, code, reason: mapped.code });
  throw mapped;
}

async function redeemGuestEntry(user, code, body = {}) {
  const rpc = await Promise.resolve(supabase.rpc('redeem_aftrhrs_guest_entry', {
    p_actor_user_id: user.id,
    p_code: code,
    p_notes: body.notes || null,
    p_device: body.device || {},
  })).catch((error) => ({ data: null, error }));
  if (!rpc.error && rpc.data) {
    await track('guest_check_in', { properties: { entry_id: rpc.data.id, kind: rpc.data.kind, actor: user.id } });
    return rpc.data;
  }
  if (rpc.error && /ALREADY_REDEEMED|NOT_REDEEMABLE/.test(String(rpc.error.message || ''))) {
    throw rpcError(rpc.error);
  }

  const { data, error } = await supabase
    .from('aftrhrs_guest_entries')
    .select('*')
    .eq('unique_code', code)
    .maybeSingle();
  if (error || !data) return null;
  if (data.status === 'redeemed') {
    const err = new Error(AFTRHRS_CLAIM_ERRORS.already_redeemed);
    err.status = 409;
    err.code = 'already_redeemed';
    throw err;
  }
  if (data.status !== 'active') {
    const err = new Error(AFTRHRS_CLAIM_ERRORS.not_redeemable);
    err.status = 409;
    err.code = 'not_redeemable';
    throw err;
  }
  const { data: redeemed, error: updateError } = await supabase
    .from('aftrhrs_guest_entries')
    .update({
      status: 'redeemed',
      redeemed_at: new Date().toISOString(),
      redeemed_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id)
    .eq('status', 'active')
    .select()
    .single();
  if (updateError || !redeemed) return null;
  await track('guest_check_in', { properties: { entry_id: redeemed.id, kind: redeemed.kind, actor: user.id } });
  return redeemed;
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
  const [{ data: passes }, { data: ambassadors }, { data: requests }, { data: events }, { data: guests }, digitalRelease] = await Promise.all([
    supabase.from('event_passes').select('*').eq('edition_id', edition.id).order('claimed_at', { ascending: false }),
    supabase.from('event_ambassador_allocations').select('*').eq('event_id', edition.moment_id),
    supabase.from('event_ambassador_requests').select('*').eq('event_id', edition.moment_id).order('created_at', { ascending: false }),
    supabase.from('event_analytics_events').select('name').eq('event_id', edition.moment_id),
    supabase.from('aftrhrs_guest_entries').select('*').order('claimed_at', { ascending: false }).limit(500),
    readLatestDigitalRelease(),
  ]);
  const counts = (events || []).reduce((acc, row) => {
    acc[row.name] = (acc[row.name] || 0) + 1;
    return acc;
  }, {});
  return {
    edition,
    remaining: remainingDigitalPasses({ digitalAllocation: edition.digital_allocation, digitalClaimed: edition.digital_claimed }),
    rsvpRemaining: remainingGuestSlots(edition.rsvp_allocation ?? AFTRHRS_RSVP_LIMIT, edition.rsvp_claimed ?? 0),
    digitalRelease,
    guests: guests || [],
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
  const edition = await getEdition();
  const { data, error } = await supabase.from('event_editions').update(patch).eq('id', edition.id).select().single();
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
    .select('pass_type, status, event_id, edition_id')
    .eq('id', passId)
    .single();
  if (currentError || !current) throw currentError || new Error('Pass not found');

  const patch = { updated_at: new Date().toISOString() };
  if (body.status) patch.status = body.status;
  const { data, error } = await supabase.from('event_passes').update(patch).eq('id', passId).select().single();
  if (error) throw error;

  const editionFilter = current.edition_id
    ? { column: 'id', value: current.edition_id }
    : { column: 'moment_id', value: current.event_id };

  if (current.pass_type === 'digital-free') {
    if (body.status === 'cancelled' && current.status !== 'cancelled') {
      const { data: edition } = await supabase.from('event_editions').select('digital_claimed').eq(editionFilter.column, editionFilter.value).single();
      if (edition) {
        await supabase.from('event_editions').update({
          digital_claimed: Math.max(0, Number(edition.digital_claimed || 1) - 1),
          updated_at: new Date().toISOString(),
        }).eq(editionFilter.column, editionFilter.value);
      }
    }
    if (body.status === 'active' && current.status === 'cancelled') {
      const { data: edition } = await supabase.from('event_editions').select('digital_claimed').eq(editionFilter.column, editionFilter.value).single();
      if (edition) {
        await supabase.from('event_editions').update({
          digital_claimed: Number(edition.digital_claimed || 0) + 1,
          updated_at: new Date().toISOString(),
        }).eq(editionFilter.column, editionFilter.value);
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
  const [{ data, error }, { data: guests }] = await Promise.all([
    supabase
      .from('event_passes')
      .select('unique_code, pass_type, status, user_id, ambassador_id, claim_source, campaign, claimed_at, redeemed_at')
      .eq('event_id', AFTRHRS_MOMENT_ID)
      .order('claimed_at', { ascending: true }),
    supabase
      .from('aftrhrs_guest_entries')
      .select('unique_code, kind, status, full_name, email, phone, week_friday, month_key, claimed_at, redeemed_at')
      .order('claimed_at', { ascending: true }),
  ]);
  if (error) throw error;
  const header = 'source,unique_code,pass_type,status,name,email,phone,week_friday,month_key,claimed_at,redeemed_at';
  const accountLines = (data || []).map((row) => [
    'account', row.unique_code, row.pass_type, row.status, '', '', '', '', '',
    row.claimed_at, row.redeemed_at,
  ].map((value) => JSON.stringify(value ?? '')).join(','));
  const guestLines = (guests || []).map((row) => [
    'guest', row.unique_code, row.kind, row.status, row.full_name, row.email, row.phone,
    row.week_friday, row.month_key, row.claimed_at, row.redeemed_at,
  ].map((value) => JSON.stringify(value ?? '')).join(','));
  return [header, ...accountLines, ...guestLines].join('\n');
}

module.exports = {
  AFTRHRS_MOMENT_ID,
  publicSnapshot,
  guestRsvp,
  attachGuestToMoment,
  countMomentGoing,
  publicTicket,
  adminDigitalRelease,
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
