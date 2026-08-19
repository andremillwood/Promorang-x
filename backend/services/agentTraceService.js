/**
 * AGENT TRACE SERVICE
 * Handles logging, persistence, and audit retrieval for AI agent tool executions and decisions.
 */

const { supabase } = require('../lib/supabase');

// In-memory fallback trace log buffer (retains last 200 execution traces)
const memoryTraces = [];
const MAX_MEMORY_TRACES = 200;

/**
 * Record an agent execution trace
 */
async function recordTrace(traceData = {}) {
  const trace = {
    id: `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    agent_name: traceData.agentName || 'promorang-campaign-operator',
    user_id: traceData.userId || null,
    organization_id: traceData.organizationId || null,
    objective_input: traceData.objectiveInput || {},
    tool_calls: traceData.toolCalls || [],
    resulting_draft_id: traceData.resultingDraftId || null,
    status: traceData.status || 'success',
    duration_ms: traceData.durationMs || 0,
    error: traceData.error || null,
    created_at: new Date().toISOString()
  };

  // 1. Add to in-memory buffer
  memoryTraces.unshift(trace);
  if (memoryTraces.length > MAX_MEMORY_TRACES) {
    memoryTraces.pop();
  }

  // 2. Attempt DB write if Supabase is available and table exists
  if (supabase) {
    try {
      const { error } = await supabase
        .from('agent_traces')
        .insert([trace]);
      
      if (error && error.code !== '42P01') { // Ignore relation does not exist error
        console.warn('[AgentTrace] DB log warning:', error.message);
      }
    } catch (err) {
      // Non-blocking catch to ensure trace logging never crashes requests
      console.warn('[AgentTrace] Failed to persist trace to DB:', err.message);
    }
  }

  return trace;
}

/**
 * Get recent execution traces (filtered by user/org if provided)
 */
async function getTraces(filters = {}) {
  const { userId, organizationId, limit = 50 } = filters;

  // Try DB query first if available
  if (supabase) {
    try {
      let query = supabase
        .from('agent_traces')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) query = query.eq('user_id', userId);
      if (organizationId) query = query.eq('organization_id', organizationId);

      const { data, error } = await query;
      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback to memory
    }
  }

  // Filter in-memory buffer
  let filtered = memoryTraces;
  if (userId) {
    filtered = filtered.filter(t => t.user_id === userId);
  }
  if (organizationId) {
    filtered = filtered.filter(t => t.organization_id === organizationId);
  }

  return filtered.slice(0, limit);
}

module.exports = {
  recordTrace,
  getTraces
};
