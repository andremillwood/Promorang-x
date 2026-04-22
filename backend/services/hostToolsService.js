/**
 * Host Tools Service
 * 
 * Promorang-as-Host functionality for operators to:
 * - Bulk create merchant profiles
 * - Fast-track venue onboarding
 * - Manage co-branded partnerships
 * - Import venues in bulk
 */

const { supabase } = require('../lib/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Bulk create merchant profiles (for B2B onboarding)
 */
async function bulkCreateMerchantProfiles(operatorId, venues) {
  const results = {
    created: [],
    existing: [],
    failed: []
  };

  if (!supabase) {
    return { 
      success: false, 
      error: 'Database not available',
      results: results 
    };
  }

  // Log the operation
  const operationId = await logHostOperation(
    operatorId,
    'bulk_merchant_create',
    null,
    { venueCount: venues.length }
  );

  for (const venue of venues) {
    try {
      // Check if merchant already exists by email
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', venue.email)
        .maybeSingle();

      if (existing) {
        results.existing.push({
          email: venue.email,
          userId: existing.id,
          venueName: venue.name
        });
        continue;
      }

      // Create user
      const userId = uuidv4();
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: venue.email,
          username: venue.username || venue.email.split('@')[0],
          display_name: venue.name,
          user_type: 'advertiser',
          created_at: new Date().toISOString()
        });

      if (userError) throw userError;

      // Create advertiser profile
      const { error: profileError } = await supabase
        .from('advertiser_profiles')
        .insert({
          user_id: userId,
          company_name: venue.name,
          company_website: venue.website,
          company_address: venue.address,
          company_phone: venue.phone,
          merchant_state: 'NEW',
          created_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      results.created.push({
        email: venue.email,
        userId: userId,
        venueName: venue.name
      });

    } catch (err) {
      console.error('[HostTools] Error creating merchant:', err);
      results.failed.push({
        email: venue.email,
        venueName: venue.name,
        error: err.message
      });
    }
  }

  // Update operation result
  await completeHostOperation(operationId, {
    created: results.created.length,
    existing: results.existing.length,
    failed: results.failed.length
  });

  return {
    success: true,
    operationId,
    results
  };
}

/**
 * Fast-track a venue (skip sampling limits)
 */
async function fastTrackVenue(operatorId, merchantId, fastTrackConfig) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Check if already fast-tracked
    const { data: existing } = await supabase
      .from('fast_track_venues')
      .select('*')
      .eq('merchant_id', merchantId)
      .maybeSingle();

    if (existing) {
      return { 
        success: false, 
        error: 'Venue already fast-tracked',
        existingFastTrack: existing 
      };
    }

    // Create fast-track record
    const { data: fastTrack, error } = await supabase
      .from('fast_track_venues')
      .insert({
        merchant_id: merchantId,
        fast_track_type: fastTrackConfig.type || 'partnership',
        bypass_sampling_limit: fastTrackConfig.bypassSamplingLimit || false,
        bypass_duration_limit: fastTrackConfig.bypassDurationLimit || false,
        bypass_value_limit: fastTrackConfig.bypassValueLimit || false,
        bonus_monthly_activations: fastTrackConfig.bonusActivations || 0,
        bonus_duration_days: fastTrackConfig.bonusDurationDays || 0,
        bonus_value_pool: fastTrackConfig.bonusValuePool || 0,
        approved_by: operatorId,
        approved_at: new Date().toISOString(),
        expires_at: fastTrackConfig.expiresAt || null,
        partnership_notes: fastTrackConfig.notes
      })
      .select()
      .single();

    if (error) throw error;

    // Log the operation
    await logHostOperation(
      operatorId,
      'fast_track_sampling',
      merchantId,
      { fastTrackId: fastTrack.id, config: fastTrackConfig }
    );

    return {
      success: true,
      fastTrack
    };

  } catch (err) {
    console.error('[HostTools] Error fast-tracking venue:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Create co-branded activation (Promorang + Venue partnership)
 */
async function createCoBrandedActivation(operatorId, merchantId, partnershipConfig) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Create the co-branded record
    const { data: coBrand, error } = await supabase
      .from('co_branded_activations')
      .insert({
        merchant_id: merchantId,
        host_id: operatorId,
        merchant_value_contribution: partnershipConfig.merchantValue,
        host_value_contribution: partnershipConfig.hostValue,
        merchant_revenue_share_pct: partnershipConfig.merchantShare || 70,
        host_revenue_share_pct: partnershipConfig.hostShare || 30,
        partnership_type: partnershipConfig.type || 'standard',
        co_branded_assets: partnershipConfig.assets || {}
      })
      .select()
      .single();

    if (error) throw error;

    // If there's an activation ID, link it
    if (partnershipConfig.activationId) {
      await supabase
        .from('co_branded_activations')
        .update({ sampling_activation_id: partnershipConfig.activationId })
        .eq('id', coBrand.id);
    }

    // Log the operation
    await logHostOperation(
      operatorId,
      'co_branded_activation',
      merchantId,
      { coBrandId: coBrand.id, config: partnershipConfig }
    );

    return {
      success: true,
      coBrandedActivation: coBrand
    };

  } catch (err) {
    console.error('[HostTools] Error creating co-branded activation:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Import venues from external source
 */
async function importVenues(operatorId, importConfig) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Create import batch record
    const { data: batch, error: batchError } = await supabase
      .from('venue_import_batches')
      .insert({
        operator_id: operatorId,
        import_source: importConfig.source,
        source_file_name: importConfig.fileName || null,
        total_records: importConfig.records.length,
        import_config: importConfig.options || {}
      })
      .select()
      .single();

    if (batchError) throw batchError;

    // Process each record
    const processedRecords = [];
    for (const record of importConfig.records) {
      try {
        const { data: importRecord } = await supabase
          .from('venue_import_records')
          .insert({
            batch_id: batch.id,
            source_data: record,
            venue_name: record.name,
            venue_address: record.address,
            venue_phone: record.phone,
            venue_website: record.website,
            venue_category: record.category
          })
          .select()
          .single();

        processedRecords.push(importRecord);
      } catch (err) {
        console.error('[HostTools] Error importing record:', err);
      }
    }

    // Update batch stats
    await supabase
      .from('venue_import_batches')
      .update({
        processed_count: processedRecords.length,
        status: 'processing'
      })
      .eq('id', batch.id);

    return {
      success: true,
      batchId: batch.id,
      totalRecords: importConfig.records.length,
      processedRecords: processedRecords.length
    };

  } catch (err) {
    console.error('[HostTools] Error importing venues:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Process a single import record (create actual merchant)
 */
async function processImportRecord(operatorId, importRecordId, options = {}) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get import record
    const { data: record, error: fetchError } = await supabase
      .from('venue_import_records')
      .select('*')
      .eq('id', importRecordId)
      .single();

    if (fetchError) throw fetchError;

    // Update status to processing
    await supabase
      .from('venue_import_records')
      .update({
        status: 'creating_user',
        processing_log: { step: 'creating_user', started: new Date().toISOString() }
      })
      .eq('id', importRecordId);

    // Generate email if not provided
    const email = record.source_data.email || `venue-${uuidv4().slice(0, 8)}@imported.promorang`;
    const username = record.venue_name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Create user
    const userId = uuidv4();
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        username: username,
        display_name: record.venue_name,
        user_type: 'advertiser',
        created_at: new Date().toISOString()
      });

    if (userError) {
      if (userError.code === '23505') { // Unique violation
        // Try to find existing user
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();
        
        if (existing) {
          await supabase
            .from('venue_import_records')
            .update({
              status: 'skipped_duplicate',
              user_id: existing.id,
              validation_errors: { error: 'User already exists' }
            })
            .eq('id', importRecordId);
          
          return { success: false, error: 'User already exists', existingUserId: existing.id };
        }
      }
      throw userError;
    }

    // Update record
    await supabase
      .from('venue_import_records')
      .update({
        status: 'creating_profile',
        user_id: userId,
        processing_log: { step: 'creating_profile', userCreated: true }
      })
      .eq('id', importRecordId);

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('advertiser_profiles')
      .insert({
        user_id: userId,
        company_name: record.venue_name,
        company_address: record.venue_address,
        company_phone: record.venue_phone,
        company_website: record.venue_website,
        merchant_state: 'NEW'
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Fast-track if requested
    if (options.fastTrack) {
      await supabase
        .from('venue_import_records')
        .update({ status: 'fast_tracking' })
        .eq('id', importRecordId);

      await fastTrackVenue(operatorId, userId, {
        type: options.fastTrackType || 'bulk_import',
        bypassSamplingLimit: options.bypassSamplingLimit || false,
        bonusActivations: options.bonusActivations || 0,
        notes: `Imported and fast-tracked via batch processing`
      });
    }

    // Complete
    await supabase
      .from('venue_import_records')
      .update({
        status: 'completed',
        profile_id: profile.id,
        processed_at: new Date().toISOString(),
        processing_log: { step: 'completed', profileCreated: true, fastTracked: options.fastTrack || false }
      })
      .eq('id', importRecordId);

    // Update batch stats
    await supabase.rpc('increment_batch_success', { batch_id: record.batch_id });

    return {
      success: true,
      userId,
      profileId: profile.id,
      fastTracked: options.fastTrack || false
    };

  } catch (err) {
    console.error('[HostTools] Error processing import record:', err);
    
    await supabase
      .from('venue_import_records')
      .update({
        status: 'failed',
        validation_errors: { error: err.message, code: err.code }
      })
      .eq('id', importRecordId);

    return { success: false, error: err.message };
  }
}

/**
 * Pre-populate venue data (before merchant claims)
 */
async function prePopulateVenue(venueData, operatorId) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Generate claim token
    const claimToken = uuidv4();

    const { data: venue, error } = await supabase
      .from('pre_populated_venues')
      .insert({
        venue_name: venueData.name,
        venue_slug: venueData.slug || venueData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        address: venueData.address,
        city: venueData.city,
        state: venueData.state,
        zip_code: venueData.zip,
        latitude: venueData.lat,
        longitude: venueData.lng,
        phone: venueData.phone,
        website: venueData.website,
        email: venueData.email,
        social_profiles: venueData.social || {},
        categories: venueData.categories || [],
        tags: venueData.tags || [],
        photos: venueData.photos || [],
        logo_url: venueData.logo,
        data_source: venueData.source || 'manual',
        enrichment_status: 'pending',
        claim_token: claimToken
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      venue,
      claimToken,
      claimUrl: `${process.env.FRONTEND_URL}/claim-venue?token=${claimToken}`
    };

  } catch (err) {
    console.error('[HostTools] Error pre-populating venue:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Claim a pre-populated venue
 */
async function claimPrePopulatedVenue(claimToken, userId) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get pre-populated venue
    const { data: venue, error: fetchError } = await supabase
      .from('pre_populated_venues')
      .select('*')
      .eq('claim_token', claimToken)
      .is('claimed_by', null)
      .single();

    if (fetchError || !venue) {
      return { success: false, error: 'Invalid or already claimed venue token' };
    }

    // Update user profile with pre-populated data
    const { error: updateError } = await supabase
      .from('advertiser_profiles')
      .update({
        company_name: venue.venue_name,
        company_address: venue.address,
        company_phone: venue.phone,
        company_website: venue.website,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Mark venue as claimed
    await supabase
      .from('pre_populated_venues')
      .update({
        claimed_by: userId,
        claimed_at: new Date().toISOString()
      })
      .eq('id', venue.id);

    return {
      success: true,
      venueData: venue
    };

  } catch (err) {
    console.error('[HostTools] Error claiming venue:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get import batch status
 */
async function getImportBatchStatus(batchId) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    const { data: batch, error } = await supabase
      .from('venue_import_batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (error) throw error;

    const { data: records, error: recordsError } = await supabase
      .from('venue_import_records')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: true });

    if (recordsError) throw recordsError;

    return {
      success: true,
      batch,
      records: records || []
    };

  } catch (err) {
    console.error('[HostTools] Error getting batch status:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get all pre-populated venues (for operator dashboard)
 */
async function getPrePopulatedVenues(filters = {}) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    let query = supabase
      .from('pre_populated_venues')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.unclaimedOnly) {
      query = query.is('claimed_by', null);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.category) {
      query = query.contains('categories', [filters.category]);
    }

    const { data: venues, error } = await query;

    if (error) throw error;

    return {
      success: true,
      venues: venues || []
    };

  } catch (err) {
    console.error('[HostTools] Error getting pre-populated venues:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Log host operation
 */
async function logHostOperation(operatorId, operationType, targetMerchantId, operationData) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('host_operations')
      .insert({
        operator_id: operatorId,
        operation_type: operationType,
        target_merchant_id: targetMerchantId,
        operation_data: operationData,
        status: 'completed'
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    console.error('[HostTools] Error logging operation:', err);
    return null;
  }
}

/**
 * Complete host operation
 */
async function completeHostOperation(operationId, resultSummary) {
  if (!supabase) return;

  try {
    await supabase
      .from('host_operations')
      .update({
        result_summary: resultSummary,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', operationId);
  } catch (err) {
    console.error('[HostTools] Error completing operation:', err);
  }
}

module.exports = {
  bulkCreateMerchantProfiles,
  fastTrackVenue,
  createCoBrandedActivation,
  importVenues,
  processImportRecord,
  prePopulateVenue,
  claimPrePopulatedVenue,
  getImportBatchStatus,
  getPrePopulatedVenues,
  logHostOperation,
  completeHostOperation
};
