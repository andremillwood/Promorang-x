import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AwardPointsRequest {
  user_id: string;
  brand_id: string;
  action: 'checkin' | 'referral' | 'review' | 'media_upload' | 'bonus';
  reference_type?: string;
  reference_id?: string;
  description?: string;
  custom_points?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: AwardPointsRequest = await req.json();
    const { user_id, brand_id, action, reference_type, reference_id, description, custom_points } = body;

    console.log(`Awarding points: user=${user_id}, brand=${brand_id}, action=${action}`);

    // Get the brand's point program to determine points per action
    const { data: program } = await supabase
      .from('brand_point_programs')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('is_active', true)
      .maybeSingle();

    // Default points if no program exists
    const defaultPoints = {
      checkin: 10,
      referral: 50,
      review: 25,
      media_upload: 15,
      bonus: 0,
    };

    // Calculate points to award
    let points = custom_points;
    if (!points) {
      if (program) {
        switch (action) {
          case 'checkin':
            points = program.points_per_checkin || defaultPoints.checkin;
            break;
          case 'referral':
            points = program.points_per_referral || defaultPoints.referral;
            break;
          case 'review':
            points = program.points_per_review || defaultPoints.review;
            break;
          case 'media_upload':
            points = program.points_per_media || defaultPoints.media_upload;
            break;
          case 'bonus':
            points = 0;
            break;
        }
      } else {
        points = defaultPoints[action] || 0;
      }
    }

    if (!points || points <= 0) {
      return new Response(
        JSON.stringify({ success: true, points_awarded: 0, message: 'No points to award' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expiration if program has expiry
    let expiresAt = null;
    if (program?.point_expiry_days) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + program.point_expiry_days);
      expiresAt = expiryDate.toISOString();
    }

    // Create point transaction
    const { error: txError } = await supabase
      .from('point_transactions')
      .insert({
        user_id,
        brand_id,
        action,
        points,
        description: description || `Points for ${action}`,
        reference_type: reference_type || null,
        reference_id: reference_id || null,
        expires_at: expiresAt,
      });

    if (txError) {
      console.error('Error creating transaction:', txError);
      throw txError;
    }

    // Update or create user_brand_points
    const { data: existingPoints } = await supabase
      .from('user_brand_points')
      .select('id, current_points, lifetime_points, current_tier')
      .eq('user_id', user_id)
      .eq('brand_id', brand_id)
      .maybeSingle();

    const newCurrentPoints = (existingPoints?.current_points || 0) + points;
    const newLifetimePoints = (existingPoints?.lifetime_points || 0) + points;

    // Check tier upgrade
    let newTier = existingPoints?.current_tier || 'bronze';
    const { data: tiers } = await supabase
      .from('brand_loyalty_tiers')
      .select('tier, min_points')
      .eq('brand_id', brand_id)
      .order('min_points', { ascending: false });

    if (tiers && tiers.length > 0) {
      for (const tier of tiers) {
        if (newLifetimePoints >= tier.min_points) {
          newTier = tier.tier;
          break;
        }
      }
    }

    if (existingPoints) {
      const { error: updateError } = await supabase
        .from('user_brand_points')
        .update({
          current_points: newCurrentPoints,
          lifetime_points: newLifetimePoints,
          current_tier: newTier,
          tier_updated_at: newTier !== existingPoints.current_tier ? new Date().toISOString() : undefined,
        })
        .eq('id', existingPoints.id);

      if (updateError) {
        console.error('Error updating points:', updateError);
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase
        .from('user_brand_points')
        .insert({
          user_id,
          brand_id,
          current_points: newCurrentPoints,
          lifetime_points: newLifetimePoints,
          current_tier: newTier,
        });

      if (insertError) {
        console.error('Error inserting points:', insertError);
        throw insertError;
      }
    }

    console.log(`Successfully awarded ${points} points to user ${user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        points_awarded: points,
        new_balance: newCurrentPoints,
        new_tier: newTier,
        tier_upgraded: existingPoints && newTier !== existingPoints.current_tier,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in award-points function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
