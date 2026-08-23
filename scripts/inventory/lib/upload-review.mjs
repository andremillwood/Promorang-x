export async function uploadReviewBatch(reviewFile, credentials = {}) {
  const url = credentials.url || process.env.SUPABASE_URL;
  const key = credentials.key || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('Uploading requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const { createClient } = await import('@supabase/supabase-js');
  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: source, error: sourceError } = await db
    .from('inventory_sources')
    .select('id')
    .eq('source_key', reviewFile.source.key)
    .single();
  if (sourceError) throw sourceError;

  const { data: batch, error: batchError } = await db
    .from('inventory_import_batches')
    .insert({
      source_id: source.id,
      region: reviewFile.batch.region,
      status: 'collecting',
      query: {
        collection_mode: reviewFile.batch.collection_mode,
        country_code: reviewFile.batch.country_code || null,
        country_slug: reviewFile.batch.country_slug || null,
        city_slug: reviewFile.batch.city_slug || null,
      },
      stats: reviewFile.stats,
      started_at: reviewFile.batch.collected_at,
    })
    .select('id')
    .single();
  if (batchError) throw batchError;

  const rows = reviewFile.candidates.map((candidate) => {
    const { duplicate_source_record_id: _duplicateHint, ...persistedCandidate } = candidate;
    return {
      ...persistedCandidate,
      batch_id: batch.id,
      source_id: source.id,
    };
  });
  const chunkSize = 250;
  try {
    for (let index = 0; index < rows.length; index += chunkSize) {
      const chunk = rows.slice(index, index + chunkSize);
      const { error } = await db
        .from('inventory_candidates')
        .upsert(chunk, { onConflict: 'source_id,entity_type,source_record_id' });
      if (error) throw error;
    }

    const { error: completeError } = await db
      .from('inventory_import_batches')
      .update({ status: 'ready_for_review', completed_at: new Date().toISOString() })
      .eq('id', batch.id);
    if (completeError) throw completeError;
  } catch (error) {
    await db
      .from('inventory_import_batches')
      .update({ status: 'failed', error_message: error.message, completed_at: new Date().toISOString() })
      .eq('id', batch.id);
    throw error;
  }

  return { batchId: batch.id, candidateCount: rows.length };
}

export async function uploadCityLaunchMetadata(reviewFile, credentials = {}) {
  const url = credentials.url || process.env.SUPABASE_URL;
  const key = credentials.key || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Uploading requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  if (!reviewFile.city) throw new Error('The review file has no city launch metadata.');
  const { createClient } = await import('@supabase/supabase-js');
  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const city = reviewFile.city;
  const targets = reviewFile.rules?.targets || { venues: 30, discoveries: 20, moments: 10, polls: 4, scenes: 3 };
  const { data: target, error: targetError } = await db.from('city_inventory_targets').upsert({
    country_code: city.country_code, country_slug: city.country_slug, country_name: city.country,
    city_slug: city.city_slug, city_name: city.city, region_name: city.region, currency: city.currency,
    timezone: city.timezone, launch_stage: city.launch_stage, target_venues: targets.venues,
    target_discoveries: targets.discoveries, target_moments: targets.moments, target_polls: targets.polls,
    target_scenes: targets.scenes,
  }, { onConflict: 'country_code,city_slug' }).select('id').single();
  if (targetError) throw targetError;
  const templates = (reviewFile.poll_templates || []).map((poll) => ({
    city_inventory_target_id: target.id, template_key: poll.key, question: poll.question,
    category: poll.category, threshold_for_moment: poll.threshold_for_moment,
    suggested_options: ['Back this idea', 'Suggest another local option', 'A Steward should research this', 'Not yet'], status: 'draft',
  }));
  if (templates.length) {
    const { error } = await db.from('city_discovery_poll_templates').upsert(templates, { onConflict: 'template_key' });
    if (error) throw error;
  }
  return { targetId: target.id, pollTemplateCount: templates.length };
}
