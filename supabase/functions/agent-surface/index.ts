// Agent Surface API - External Agent Integration Layer
// Machine-readable endpoints for AI agents and third-party integrations

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AgentRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  body: any;
  headers: Record<string, string>;
}

interface AgentResponse {
  status: number;
  body: any;
  headers: Record<string, string>;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Agent-Id, X-Agent-Version",
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// JWT validation
async function validateAgentToken(token: string): Promise<{ valid: boolean; userId?: string; agentId?: string }> {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return { valid: false };
    
    // Check if user has agent access
    const { data: agentAccess } = await supabase
      .from("agent_access_keys")
      .select("*")
      .eq("user_id", data.user.id)
      .eq("is_active", true)
      .single();
    
    return { 
      valid: !!agentAccess, 
      userId: data.user.id,
      agentId: agentAccess?.agent_id 
    };
  } catch {
    return { valid: false };
  }
}

// Route handlers
const routes: Record<string, (req: AgentRequest, auth: any) => Promise<AgentResponse>> = {
  // Health check
  "GET /health": async () => ({
    status: 200,
    body: { 
      status: "operational", 
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      capabilities: [
        "moments.discover",
        "moments.query",
        "economy.query",
        "users.profile",
        "content.search",
        "attributions.track",
        "checkin.submit",
        "rewards.claim"
      ]
    },
    headers: { "Content-Type": "application/json" }
  }),

  // List moments with filtering
  "GET /moments": async (req, auth) => {
    const { 
      lat, lon, radius = "10000", 
      status = "active",
      mode,
      tags,
      limit = "50",
      offset = "0"
    } = req.query;
    
    let query = supabase
      .from("moments")
      .select(`
        id,
        title,
        description,
        moment_mode,
        pulse_state,
        starts_at,
        ends_at,
        gathering_threshold,
        venue:venues(name, lat, lon, address),
        host:users!moments_host_id_fkey(id, display_name),
        joined_count:applications(count)
      `, { count: "exact" })
      .eq("status", status)
      .order("starts_at", { ascending: true })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (mode) query = query.eq("moment_mode", mode);
    if (tags) query = query.contains("tags", tags.split(","));
    
    if (lat && lon) {
      query = query
        .select(`
          id,
          title,
          description,
          moment_mode,
          pulse_state,
          starts_at,
          ends_at,
          gathering_threshold,
          venue:venues!inner(name, lat, lon, address),
          host:users!moments_host_id_fkey(id, display_name),
          joined_count:applications(count)
        `)
        .eq("venues.lat", lat)
        .eq("venues.lon", lon);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      return { status: 500, body: { error: error.message }, headers: { "Content-Type": "application/json" } };
    }
    
    return {
      status: 200,
      body: {
        data: data?.map(m => ({
          ...m,
          joined_count: m.joined_count?.[0]?.count ?? 0,
          url: `${Deno.env.get("APP_URL")}/moments/${m.id}`,
          check_in_url: `${Deno.env.get("APP_URL")}/checkin/${m.id}`
        })) ?? [],
        meta: {
          total: count ?? 0,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      },
      headers: { "Content-Type": "application/json" }
    };
  },

  // Get specific moment details
  "GET /moments/:id": async (req, auth) => {
    const id = req.path.split("/")[2];
    
    const { data, error } = await supabase
      .from("moments")
      .select(`
        id,
        title,
        description,
        moment_mode,
        pulse_state,
        starts_at,
        ends_at,
        gathering_threshold,
        proof_requirements,
        venue:venues(id, name, lat, lon, address),
        host:users!moments_host_id_fkey(id, display_name, user_type),
        sponsor:brands(id, name, logo_url),
        pulse:moment_pulse_snapshots(*),
        content:content_items(*)
      `)
      .eq("id", id)
      .single();
    
    if (error) {
      return { status: 404, body: { error: "Moment not found" }, headers: { "Content-Type": "application/json" } };
    }
    
    return {
      status: 200,
      body: {
        data: {
          ...data,
          action_urls: {
            join: `${Deno.env.get("APP_URL")}/moments/${id}/join`,
            check_in: `${Deno.env.get("APP_URL")}/checkin/${id}`,
            share: `${Deno.env.get("APP_URL")}/moments/${id}/share`
          }
        }
      },
      headers: { "Content-Type": "application/json" }
    };
  },

  // Query economy state for a user
  "GET /economy/:userId": async (req, auth) => {
    const userId = req.path.split("/")[2];
    
    // Check if agent can access this user's data
    if (auth.userId !== userId && !auth.isAdmin) {
      return { status: 403, body: { error: "Access denied" }, headers: { "Content-Type": "application/json" } };
    }
    
    const [
      { data: user },
      { data: creatorProfile },
      { data: catalystStatus },
      { data: earningsSummary }
    ] = await Promise.all([
      supabase.from("users").select("id, points_balance, keys_balance, gems_balance, user_tier").eq("id", userId).single(),
      supabase.from("creator_economic_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_catalyst_status").select("*").eq("user_id", userId).maybeSingle(),
      supabase.rpc("get_creator_earnings_summary", { p_user_id: userId }).maybeSingle()
    ]);
    
    return {
      status: 200,
      body: {
        user_id: userId,
        balances: {
          points: user?.points_balance ?? 0,
          keys: user?.keys_balance ?? 0,
          gems: user?.gems_balance ?? 0
        },
        tiers: {
          user: user?.user_tier,
          creator: creatorProfile?.tier,
          catalyst: catalystStatus?.current_tier_level
        },
        creator_economics: creatorProfile ? {
          lifetime_momentum_value: creatorProfile.lifetime_momentum_value,
          lifetime_verified_unlocks: creatorProfile.lifetime_verified_unlocks,
          default_revshare_percent: creatorProfile.default_revshare_percent,
          pending_payout: earningsSummary?.approved_amount ?? 0
        } : null,
        catalyst_status: catalystStatus ? {
          direct_conversions: catalystStatus.lifetime_direct_conversions,
          network_conversions: catalystStatus.lifetime_network_conversions,
          viral_rewards_earned: catalystStatus.lifetime_viral_rewards_earned,
          passive_yield_earned: catalystStatus.lifetime_passive_yield_earned
        } : null
      },
      headers: { "Content-Type": "application/json" }
    };
  },

  // Search content items
  "GET /content": async (req, auth) => {
    const { q, creator, type, tags, limit = "20", offset = "0" } = req.query;
    
    let query = supabase
      .from("content_items")
      .select(`
        id,
        title,
        description,
        content_type,
        creator:users!content_items_creator_id_fkey(id, display_name),
        engagement_stats,
        created_at
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (creator) query = query.eq("creator_id", creator);
    if (type) query = query.eq("content_type", type);
    if (tags) query = query.contains("tags", tags.split(","));
    
    const { data, error, count } = await query;
    
    if (error) {
      return { status: 500, body: { error: error.message }, headers: { "Content-Type": "application/json" } };
    }
    
    return {
      status: 200,
      body: {
        data: data ?? [],
        meta: {
          total: count ?? 0,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      },
      headers: { "Content-Type": "application/json" }
    };
  },

  // Track mission attribution
  "POST /attributions": async (req, auth) => {
    const { content_item_id, moment_id, user_id, event_type } = req.body;
    
    if (!content_item_id || !moment_id || !user_id || !event_type) {
      return { status: 400, body: { error: "Missing required fields" }, headers: { "Content-Type": "application/json" } };
    }
    
    const { data, error } = await supabase
      .from("mission_attributions")
      .upsert({
        content_item_id,
        moment_id,
        user_id,
        [event_type === "join" ? "joined_at" : event_type === "verify" ? "verified_at" : "first_engaged_at"]: new Date().toISOString(),
        status: event_type === "verify" ? "verified" : "engaged",
        [event_type === "join" ? "join_events_count" : event_type === "verify" ? "verification_events_count" : "engagement_events_count"]: 1
      }, {
        onConflict: "user_id, content_item_id, moment_id"
      })
      .select()
      .single();
    
    if (error) {
      return { status: 500, body: { error: error.message }, headers: { "Content-Type": "application/json" } };
    }
    
    return {
      status: 201,
      body: { data, message: "Attribution recorded" },
      headers: { "Content-Type": "application/json" }
    };
  },

  // Submit check-in
  "POST /checkins": async (req, auth) => {
    const { moment_id, user_id, latitude, longitude, accuracy, proof_bundle } = req.body;
    
    if (!moment_id || !user_id) {
      return { status: 400, body: { error: "Missing required fields" }, headers: { "Content-Type": "application/json" } };
    }
    
    // Get venue location for geo check
    const { data: moment } = await supabase
      .from("moments")
      .select("venue:venues(lat, lon)")
      .eq("id", moment_id)
      .single();
    
    // Record proof attempt with fraud scoring
    const { data: attempt } = await supabase.rpc("record_proof_attempt", {
      p_moment_id: moment_id,
      p_user_id: user_id,
      p_venue_id: moment?.venue?.id,
      p_fingerprint_hash: req.headers["x-device-fingerprint"] ?? "unknown",
      p_ip_address: null, // Edge function handles this
      p_claimed_lat: latitude,
      p_claimed_lon: longitude,
      p_claimed_accuracy: accuracy,
      p_claimed_country: null,
      p_claimed_city: null,
      p_venue_lat: moment?.venue?.lat,
      p_venue_lon: moment?.venue?.lon,
      p_proof_bundle: proof_bundle ?? {}
    });
    
    // Create proof submission
    const { data: submission, error } = await supabase
      .from("proof_submissions")
      .insert({
        moment_id,
        user_id,
        proof_bundle: {
          ...proof_bundle,
          agent_submitted: true,
          fraud_check: attempt?.risk_level
        }
      })
      .select()
      .single();
    
    if (error) {
      return { status: 500, body: { error: error.message }, headers: { "Content-Type": "application/json" } };
    }
    
    return {
      status: 201,
      body: {
        data: submission,
        fraud_check: {
          risk_level: attempt?.risk_level,
          risk_score: attempt?.risk_score,
          requires_review: attempt?.risk_level === "high" || attempt?.risk_level === "critical"
        }
      },
      headers: { "Content-Type": "application/json" }
    };
  },

  // Claim rewards
  "POST /rewards/claim": async (req, auth) => {
    const { user_id, moment_id, claim_type } = req.body;
    
    if (!user_id || !moment_id || !claim_type) {
      return { status: 400, body: { error: "Missing required fields" }, headers: { "Content-Type": "application/json" } };
    }
    
    switch (claim_type) {
      case "early_mover":
        const { data: bonus } = await supabase.rpc("award_early_mover_bonus", {
          p_moment_id: moment_id,
          p_user_id: user_id,
          p_join_position: 1, // Will be calculated in function
          p_total_slots: 50
        });
        return { status: 200, body: { data: bonus }, headers: { "Content-Type": "application/json" } };
        
      case "passive_yield":
        const { data: yield } = await supabase.rpc("claim_passive_yield", {
          p_user_id: user_id,
          p_moment_id: moment_id,
          p_claim_method: "agent"
        });
        return { status: 200, body: { data: yield }, headers: { "Content-Type": "application/json" } };
        
      default:
        return { status: 400, body: { error: "Unknown claim type" }, headers: { "Content-Type": "application/json" } };
    }
  },

  // Get user profile
  "GET /users/:id": async (req, auth) => {
    const id = req.path.split("/")[2];
    
    const { data, error } = await supabase
      .from("users")
      .select("id, display_name, username, user_tier, avatar_url, created_at")
      .eq("id", id)
      .single();
    
    if (error) {
      return { status: 404, body: { error: "User not found" }, headers: { "Content-Type": "application/json" } };
    }
    
    return { status: 200, body: { data }, headers: { "Content-Type": "application/json" } };
  }
};

// Main request handler
async function handleRequest(request: Request): Promise<Response> {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  // Parse URL
  const url = new URL(request.url);
  const path = url.pathname.replace("/agent-surface", "");
  const method = request.method;
  
  // Extract auth token
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  // Validate agent access
  let auth = { valid: false, userId: null, agentId: null, isAdmin: false };
  if (token) {
    const validation = await validateAgentToken(token);
    auth = { ...validation, isAdmin: false }; // Could check admin role here
  }
  
  // Build request object
  const agentRequest: AgentRequest = {
    method,
    path,
    query: Object.fromEntries(url.searchParams),
    body: method !== "GET" ? await request.json().catch(() => ({})) : null,
    headers: Object.fromEntries(request.headers.entries())
  };
  
  // Find route handler
  let handler = routes[`${method} ${path}`];
  
  // Try pattern matching for dynamic routes
  if (!handler) {
    for (const [route, routeHandler] of Object.entries(routes)) {
      const routeParts = route.split(" ");
      const routeMethod = routeParts[0];
      const routePath = routeParts[1];
      
      if (routeMethod !== method) continue;
      
      // Check if pattern matches (e.g., /moments/:id)
      const pathRegex = new RegExp("^" + routePath.replace(/:\w+/g, "\\w+") + "$");
      if (pathRegex.test(path)) {
        handler = routeHandler;
        break;
      }
    }
  }
  
  if (!handler) {
    return new Response(
      JSON.stringify({ error: "Not found", path, method }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Check auth for protected routes
  const publicRoutes = ["GET /health", "GET /moments", "GET /moments/:id", "GET /content"];
  const isPublic = publicRoutes.some(r => {
    if (r === `${method} ${path}`) return true;
    // Check pattern
    const parts = r.split(" ");
    const regex = new RegExp("^" + parts[1].replace(/:\w+/g, "\\w+") + "$");
    return parts[0] === method && regex.test(path);
  });
  
  if (!isPublic && !auth.valid) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Execute handler
  try {
    const response = await handler(agentRequest, auth);
    return new Response(
      JSON.stringify(response.body),
      { 
        status: response.status, 
        headers: { ...corsHeaders, ...response.headers } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Start server
serve(handleRequest);
