const express = require('express');
const router = express.Router();
const { supabase, admin } = require('../lib/supabase');
const { requireAuth, requireAdmin, requireMasterAdmin } = require('../middleware/auth');
const { getUserProfile } = require('./mockStore');
const { sendSupportTicketResponseEmail } = require('../services/resendService');
const simpleKYCService = require('../services/simpleKYCService');
const experienceAutomationService = require('../services/experienceAutomationService');

router.use(requireAuth);
router.use(requireAdmin);

router.get('/audit', requireMasterAdmin, async (req, res) => {
    try {
        const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
        const { data, error } = await supabase
            .from('admin_audit_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        res.json({ events: data || [] });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to load admin audit history' });
    }
});

/**
 * GET /api/admin/pioneer-events
 * Review queue and audit history for Pioneer contribution receipts.
 */
router.get('/pioneer-events', async (req, res) => {
    try {
        if (!supabase) return res.json({ events: [], total: 0 });
        const status = String(req.query.status || 'pending');
        const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
        let query = supabase
            .from('pioneer_point_events')
            .select('*', { count: 'exact' })
            .order('occurred_at', { ascending: false })
            .limit(limit);
        if (status !== 'all') query = query.eq('status', status);
        if (req.query.contributor_type) query = query.eq('contributor_type', req.query.contributor_type);
        const { data, error, count } = await query;
        if (error) throw error;

        const venueIds = [...new Set((data || []).filter((event) => event.beneficiary_type === 'venue').map((event) => event.beneficiary_id))];
        let venueMap = {};
        if (venueIds.length) {
            const { data: venues, error: venueError } = await supabase
                .from('venues').select('id,name,address,owner_id,image_url').in('id', venueIds);
            if (venueError) throw venueError;
            venueMap = Object.fromEntries((venues || []).map((venue) => [venue.id, venue]));
        }
        res.json({
            events: (data || []).map((event) => ({ ...event, venue: venueMap[event.beneficiary_id] || null })),
            total: count || 0,
        });
    } catch (error) {
        console.error('Admin Pioneer Queue Error:', error);
        res.status(500).json({ error: error.message || 'Failed to load Pioneer review queue' });
    }
});

/**
 * PATCH /api/admin/pioneer-events/:id/review
 * Verify, reject, or reverse a Pioneer receipt through the audited database function.
 */
router.patch('/pioneer-events/:id/review', async (req, res) => {
    try {
        const { decision, reason = null } = req.body || {};
        if (!['verified', 'rejected', 'reversed'].includes(decision)) {
            return res.status(400).json({ error: 'decision must be verified, rejected, or reversed' });
        }
        if (['rejected', 'reversed'].includes(decision) && !String(reason || '').trim()) {
            return res.status(400).json({ error: 'A reason is required for rejection or reversal' });
        }
        if (!supabase) return res.json({ success: true, event: { id: req.params.id, status: decision, reason } });
        const { data, error } = await supabase.rpc('review_pioneer_event', {
            p_event_id: req.params.id,
            p_decision: decision,
            p_reviewer_id: req.user.id,
            p_reason: reason,
        });
        if (error) throw error;
        res.json({ success: true, event: data });
    } catch (error) {
        console.error('Admin Pioneer Review Error:', error);
        res.status(400).json({ error: error.message || 'Failed to review Pioneer receipt' });
    }
});

router.post('/pioneer-events/bulk-review', async (req,res) => {
    try {
        const ids=Array.isArray(req.body?.ids)?req.body.ids.slice(0,100):[];
        const decision=req.body?.decision;
        const reason=req.body?.reason||null;
        if(!ids.length || !['verified','rejected'].includes(decision)) return res.status(400).json({error:'ids and valid decision required'});
        if(decision==='rejected' && !String(reason||'').trim()) return res.status(400).json({error:'Reason required'});
        const results=[];
        for(const id of ids){
            const {data,error}=await supabase.rpc('review_pioneer_event',{p_event_id:id,p_decision:decision,p_reviewer_id:req.user.id,p_reason:reason});
            results.push({id,success:!error,event:data,error:error?.message});
        }
        res.json({results});
    } catch(error){ res.status(400).json({error:error.message||'Bulk review failed'}); }
});

router.post('/pioneer-seasons/:id/freeze', async (req,res) => {
    try {
        const {data,error}=await supabase.rpc('freeze_pioneer_season',{p_season_id:req.params.id});
        if(error) throw error; res.json({season:data});
    } catch(error){ res.status(400).json({error:error.message||'Freeze failed'}); }
});

router.post('/pioneer-seasons/:id/allocate', requireMasterAdmin, async (req,res) => {
    try {
        const {data,error}=await supabase.rpc('allocate_pioneer_season',{p_season_id:req.params.id});
        if(error) throw error; res.json({allocations:data});
    } catch(error){ res.status(400).json({error:error.message||'Allocation failed'}); }
});

router.get('/pioneer-fraud-flags', async (req,res) => {
    try {
        let query=supabase.from('pioneer_fraud_flags').select('*,pioneer_point_events(*)').order('created_at',{ascending:false}).limit(100);
        if(req.query.status && req.query.status!=='all') query=query.eq('status',req.query.status);
        const {data,error}=await query; if(error) throw error; res.json({flags:data||[]});
    } catch(error){res.status(500).json({error:'Unable to load fraud flags'});}
});

/**
 * GET /api/admin/stats
 * Get high-level platform statistics
 */
router.get('/stats', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({
                total_users: 15420,
                pending_kyc: 3,
                total_withdrawals: 125000,
                active_campaigns: 45
            });
        }

        const [
            { count: totalUsers },
            { count: pendingKyc }
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('kyc_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ]);

        res.json({
            total_users: totalUsers || 0,
            pending_kyc: pendingKyc || 0,
            total_withdrawals: 0,
            active_campaigns: 0
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const ACCESS_OBJECT_TYPES = ['moment', 'drop', 'reward', 'campaign', 'promoshare_pool', 'event', 'content', 'offer'];
const ACCESS_TYPES = ['view', 'join', 'apply', 'redeem', 'boost', 'reserve', 'check_in', 'claim'];
const TIER_KEYS = ['free', 'plus', 'pro', 'elite'];

function normalizeAccessRulePayload(body = {}, existing = {}) {
    const objectType = body.object_type ?? existing.object_type;
    const objectId = body.object_id ?? existing.object_id;
    const accessType = body.access_type ?? existing.access_type;
    const minTierKey = body.min_tier_key === '' ? null : body.min_tier_key ?? existing.min_tier_key ?? null;
    const pricingConfig = body.pricing_config ?? existing.pricing_config ?? {};
    const metadata = body.metadata ?? existing.metadata ?? {};

    if (objectType && !ACCESS_OBJECT_TYPES.includes(objectType)) {
        throw new Error('Invalid object_type');
    }

    if (accessType && !ACCESS_TYPES.includes(accessType)) {
        throw new Error('Invalid access_type');
    }

    if (minTierKey && !TIER_KEYS.includes(minTierKey)) {
        throw new Error('Invalid min_tier_key');
    }

    if (!objectId || String(objectId).trim().length === 0) {
        throw new Error('object_id is required');
    }

    return {
        object_type: objectType,
        object_id: String(objectId).trim(),
        access_type: accessType,
        base_key_cost: Math.max(0, Number.parseInt(body.base_key_cost ?? existing.base_key_cost ?? 0, 10) || 0),
        min_tier_key: minTierKey,
        requires_cash_gem_eligible: Boolean(body.requires_cash_gem_eligible ?? existing.requires_cash_gem_eligible ?? false),
        capacity_limit: body.capacity_limit === '' || body.capacity_limit === null || body.capacity_limit === undefined
            ? null
            : Math.max(0, Number.parseInt(body.capacity_limit, 10) || 0),
        sponsor_subsidy_keys: Math.max(0, Number.parseInt(body.sponsor_subsidy_keys ?? existing.sponsor_subsidy_keys ?? 0, 10) || 0),
        pricing_config: typeof pricingConfig === 'object' && !Array.isArray(pricingConfig) ? pricingConfig : {},
        starts_at: body.starts_at === '' ? null : body.starts_at ?? existing.starts_at ?? null,
        ends_at: body.ends_at === '' ? null : body.ends_at ?? existing.ends_at ?? null,
        is_active: Boolean(body.is_active ?? existing.is_active ?? true),
        metadata: typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {},
        updated_at: new Date().toISOString(),
    };
}

/**
 * GET /api/admin/access-rules
 * List live access rules and baseline presets.
 */
router.get('/access-rules', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({ rules: [], presets: [] });
        }

        const { object_type, access_type, include_inactive = 'true' } = req.query;
        let query = supabase
            .from('access_rules')
            .select('*')
            .order('created_at', { ascending: false });

        if (object_type) query = query.eq('object_type', object_type);
        if (access_type) query = query.eq('access_type', access_type);
        if (include_inactive !== 'true') query = query.eq('is_active', true);

        const [{ data: rules, error: rulesError }, { data: presets, error: presetsError }] = await Promise.all([
            query,
            supabase.from('access_rule_presets').select('*').eq('is_active', true).order('object_type').order('base_key_cost'),
        ]);

        if (rulesError) throw rulesError;
        if (presetsError) throw presetsError;

        res.json({ rules: rules || [], presets: presets || [] });
    } catch (error) {
        console.error('Admin Access Rules List Error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch access rules' });
    }
});

/**
 * POST /api/admin/access-rules
 * Create or upsert an item-specific access rule.
 */
router.post('/access-rules', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({ success: true, rule: { id: 'mock-access-rule', ...req.body } });
        }

        const payload = normalizeAccessRulePayload(req.body);
        if (!payload.object_type || !payload.access_type) {
            return res.status(400).json({ error: 'object_type and access_type are required' });
        }

        const { data, error } = await supabase
            .from('access_rules')
            .upsert(payload, { onConflict: 'object_type,object_id,access_type' })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, rule: data });
    } catch (error) {
        console.error('Admin Access Rules Create Error:', error);
        res.status(400).json({ error: error.message || 'Failed to create access rule' });
    }
});

/**
 * PATCH /api/admin/access-rules/:id
 * Update an existing access rule.
 */
router.patch('/access-rules/:id', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({ success: true, rule: { id: req.params.id, ...req.body } });
        }

        const { data: existing, error: existingError } = await supabase
            .from('access_rules')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (existingError) throw existingError;

        const payload = normalizeAccessRulePayload(req.body, existing);
        const { data, error } = await supabase
            .from('access_rules')
            .update(payload)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, rule: data });
    } catch (error) {
        console.error('Admin Access Rules Update Error:', error);
        res.status(400).json({ error: error.message || 'Failed to update access rule' });
    }
});

router.post('/access-rules/:id/deactivate', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({ success: true });
        }

        const { data, error } = await supabase
            .from('access_rules')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, rule: data });
    } catch (error) {
        console.error('Admin Access Rules Deactivate Error:', error);
        res.status(400).json({ error: error.message || 'Failed to deactivate access rule' });
    }
});

/**
 * GET /api/admin/kyc/pending
 * Get list of pending KYC verifications
 */
router.get('/kyc/pending', async (req, res) => {
    try {
        if (!supabase) {
            return res.json([
                {
                    id: 'mock-verif-1',
                    user_id: 'mock-user-1',
                    document_type: 'passport',
                    document_url: 'https://via.placeholder.com/400x300?text=Passport',
                    created_at: new Date().toISOString(),
                    user: {
                        display_name: 'John Doe',
                        email: 'john@example.com',
                        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
                    }
                }
            ]);
        }

        const { data, error } = await supabase
            .from('kyc_verifications')
            .select(`
                *,
                user:users (
                    id,
                    display_name,
                    email,
                    avatar_url
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Admin KYC List Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/admin/kyc/action
 * Approve or Reject a KYC verification
 */
router.post('/kyc/action', async (req, res) => {
    try {
        const { verificationId, action, reason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        if (!supabase) {
            return res.json({ success: true, message: `Mock ${action} successful` });
        }

        const { data: verification } = await supabase
            .from('kyc_verifications')
            .select('user_id')
            .eq('id', verificationId)
            .single();

        if (!verification) {
            return res.status(404).json({ error: 'Verification not found' });
        }

        const newStatus = action === 'approve' ? 'verified' : 'rejected';

        const { error: updateVerifError } = await supabase
            .from('kyc_verifications')
            .update({
                status: newStatus,
                rejection_reason: reason || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', verificationId);

        if (updateVerifError) throw updateVerifError;

        const { error: updateUserError } = await supabase
            .from('users')
            .update({ kyc_status: newStatus })
            .eq('id', verification.user_id);

        if (updateUserError) throw updateUserError;

        res.json({ success: true, message: `KYC ${action} successful` });
    } catch (error) {
        console.error('Admin KYC Action Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/admin/support
 * List support tickets for admins
 */
router.get('/support', async (req, res) => {
    try {
        if (!supabase) {
            return res.json([]);
        }

        const { data: tickets, error } = await supabase
            .from('support_tickets')
            .select('*, user:users(display_name, email), assignee:users!support_tickets_assigned_to_fkey(display_name, email), events:support_ticket_events(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(tickets);
    } catch (error) {
        console.error('Admin Support Error:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

/**
 * POST /api/admin/support/:id/reply
 * Reply/Status update
 */
router.post('/support/:id/reply', async (req, res) => {
    try {
        const { id } = req.params;
        const { status = 'in_progress', admin_notes, assigned_to } = req.body;
        const allowedStatuses = ['open', 'in_progress', 'resolved', 'closed'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid support ticket status' });
        }

        if (!admin_notes || !admin_notes.trim()) {
            return res.status(400).json({ error: 'Response notes are required' });
        }

        if (!supabase) {
            return res.json({ success: true });
        }

        const { data: before, error: beforeError } = await supabase
            .from('support_tickets')
            .select('status,assigned_to,first_response_at')
            .eq('id', id)
            .maybeSingle();

        if (beforeError) throw beforeError;

        const now = new Date().toISOString();
        const assigneeId = assigned_to === null ? null : assigned_to || before?.assigned_to || req.user.id;
        const { error } = await supabase
            .from('support_tickets')
            .update({
                status,
                assigned_to: assigneeId,
                admin_notes: admin_notes.trim(),
                first_response_at: before?.first_response_at || now,
                last_admin_reply_at: now,
                resolved_at: status === 'resolved' || status === 'closed' ? now : null,
                updated_at: now
            })
            .eq('id', id);

        if (error) throw error;

        await supabase.from('support_ticket_events').insert({
            ticket_id: id,
            actor_id: req.user.id,
            actor_type: 'admin',
            event_type: before?.status !== status ? 'status_changed' : 'admin_reply',
            previous_status: before?.status || null,
            new_status: status,
            message: admin_notes.trim(),
            metadata: { assigned_to: assigneeId },
        });

        const { data: updatedTicket, error: fetchError } = await supabase
            .from('support_tickets')
            .select('*, user:users(email, display_name, username), assignee:users!support_tickets_assigned_to_fkey(display_name, email), events:support_ticket_events(*)')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        if (updatedTicket?.user?.email) {
            sendSupportTicketResponseEmail(
                updatedTicket.user.email,
                updatedTicket.user.display_name || updatedTicket.user.username,
                {
                    ticketId: updatedTicket.id,
                    subject: updatedTicket.subject,
                    responsePreview: admin_notes.trim().slice(0, 240),
                }
            ).catch((emailError) => {
                console.error('Failed to send support response email:', emailError);
            });
        }

        res.json({ success: true, ticket: updatedTicket });
    } catch (error) {
        console.error('Admin Reply Error:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

/**
 * GET /api/admin/users
 * List users and roles
 */
router.get('/users', async (req, res) => {
    try {
        if (!supabase) return res.json([]);

        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, display_name, role, user_type')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * GET /api/admin/users/roster
 * Enriched admin roster with moderation and activity context
 */
router.get('/users/roster', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({ success: true, users: [] });
        }

        const [{ data: baseUsers, error: usersError }, authListResult] = await Promise.all([
            supabase
                .from('users')
                .select('id, email, display_name, role, user_type, kyc_status, created_at')
                .order('created_at', { ascending: false })
                .limit(200),
            admin?.listUsers ? admin.listUsers({ page: 1, perPage: 200 }) : Promise.resolve({ data: { users: [] }, error: null }),
        ]);

        if (usersError) throw usersError;

        const userIds = (baseUsers || []).map((user) => user.id).filter(Boolean);
        if (userIds.length === 0) {
            return res.json({ success: true, users: [] });
        }

        const authUsersById = new Map(
            ((authListResult?.data?.users || []).map((user) => [user.id, user])) || []
        );

        const [
            { data: profiles = [], error: profilesError },
            { data: roles = [], error: rolesError },
            { data: moments = [], error: momentsError },
            { data: participations = [], error: participationsError },
            { data: media = [], error: mediaError },
            { data: reviews = [], error: reviewsError },
            { data: supportTickets = [], error: supportError },
            { data: qualificationRows = [], error: qualificationError },
            { data: qualificationEvents = [], error: qualificationEventsError },
        ] = await Promise.all([
            supabase.from('profiles').select('*').in('user_id', userIds),
            supabase.from('user_roles').select('user_id, role').in('user_id', userIds),
            supabase.from('moments').select('id, host_id, status, created_at').in('host_id', userIds),
            supabase.from('moment_participants').select('user_id, joined_at').in('user_id', userIds),
            supabase.from('moment_media').select('id, user_id, moderation_status, created_at').in('user_id', userIds),
            supabase.from('moment_reviews').select('id, user_id, moderation_status, created_at').in('user_id', userIds),
            supabase.from('support_tickets').select('id, user_id, status, priority, created_at').in('user_id', userIds),
            supabase.from('user_money_qualification').select('*').in('user_id', userIds),
            supabase.from('qualification_events').select('user_id, event_type, reason, created_at').in('user_id', userIds).order('created_at', { ascending: false }),
        ]);

        if (profilesError) throw profilesError;
        if (rolesError) throw rolesError;
        if (momentsError) throw momentsError;
        if (participationsError) throw participationsError;
        if (mediaError) throw mediaError;
        if (reviewsError) throw reviewsError;
        if (supportError) throw supportError;
        if (qualificationError) throw qualificationError;
        if (qualificationEventsError) throw qualificationEventsError;

        const profilesByUserId = new Map(
            profiles
                .filter((profile) => profile?.user_id)
                .map((profile) => [profile.user_id, profile])
        );

        const rolesByUserId = new Map();
        for (const roleRow of roles || []) {
            if (!roleRow?.user_id || !roleRow?.role) continue;
            if (!rolesByUserId.has(roleRow.user_id)) rolesByUserId.set(roleRow.user_id, new Set());
            rolesByUserId.get(roleRow.user_id).add(roleRow.role);
        }

        const momentStatsByHost = new Map();
        for (const moment of moments || []) {
            if (!moment?.host_id) continue;
            const current = momentStatsByHost.get(moment.host_id) || {
                hosted_count: 0,
                active_hosted_count: 0,
                joinable_hosted_count: 0,
                latest_hosted_at: null,
            };
            current.hosted_count += 1;
            if (moment.status === 'active') current.active_hosted_count += 1;
            if (moment.status === 'joinable') current.joinable_hosted_count += 1;
            if (!current.latest_hosted_at || new Date(moment.created_at) > new Date(current.latest_hosted_at)) {
                current.latest_hosted_at = moment.created_at;
            }
            momentStatsByHost.set(moment.host_id, current);
        }

        const participationStatsByUser = new Map();
        for (const participation of participations || []) {
            if (!participation?.user_id) continue;
            const current = participationStatsByUser.get(participation.user_id) || {
                joined_count: 0,
                latest_joined_at: null,
            };
            current.joined_count += 1;
            if (!current.latest_joined_at || new Date(participation.joined_at) > new Date(current.latest_joined_at)) {
                current.latest_joined_at = participation.joined_at;
            }
            participationStatsByUser.set(participation.user_id, current);
        }

        const contentStatsByUser = new Map();
        for (const item of [...(media || []), ...(reviews || [])]) {
            if (!item?.user_id) continue;
            const current = contentStatsByUser.get(item.user_id) || {
                total_content: 0,
                pending_content: 0,
                rejected_content: 0,
                approved_content: 0,
                latest_content_at: null,
            };
            current.total_content += 1;
            if (item.moderation_status === 'pending') current.pending_content += 1;
            if (item.moderation_status === 'rejected' || item.moderation_status === 'flagged') current.rejected_content += 1;
            if (item.moderation_status === 'approved') current.approved_content += 1;
            if (!current.latest_content_at || new Date(item.created_at) > new Date(current.latest_content_at)) {
                current.latest_content_at = item.created_at;
            }
            contentStatsByUser.set(item.user_id, current);
        }

        const supportStatsByUser = new Map();
        for (const ticket of supportTickets || []) {
            if (!ticket?.user_id) continue;
            const current = supportStatsByUser.get(ticket.user_id) || {
                open_support_tickets: 0,
                total_support_tickets: 0,
                latest_support_at: null,
                escalated_tickets: 0,
            };
            current.total_support_tickets += 1;
            if (ticket.status === 'open' || ticket.status === 'in_progress') current.open_support_tickets += 1;
            if (ticket.priority === 'high') current.escalated_tickets += 1;
            if (!current.latest_support_at || new Date(ticket.created_at) > new Date(current.latest_support_at)) {
                current.latest_support_at = ticket.created_at;
            }
            supportStatsByUser.set(ticket.user_id, current);
        }

        const qualificationByUserId = new Map(
            (qualificationRows || []).map((row) => [row.user_id, row])
        );

        const latestQualificationEventByUser = new Map();
        for (const event of qualificationEvents || []) {
            if (!event?.user_id || latestQualificationEventByUser.has(event.user_id)) continue;
            latestQualificationEventByUser.set(event.user_id, event);
        }

        const roster = (baseUsers || []).map((user) => {
            const profile = profilesByUserId.get(user.id) || null;
            const authUser = authUsersById.get(user.id);
            const roleSet = new Set([
                ...(rolesByUserId.get(user.id) ? Array.from(rolesByUserId.get(user.id)) : []),
                user.role,
                user.user_type,
            ].filter(Boolean));
            const qualification = qualificationByUserId.get(user.id) || null;
            const latestQualificationEvent = latestQualificationEventByUser.get(user.id) || null;
            const momentStats = momentStatsByHost.get(user.id) || {};
            const participationStats = participationStatsByUser.get(user.id) || {};
            const contentStats = contentStatsByUser.get(user.id) || {};
            const supportStats = supportStatsByUser.get(user.id) || {};

            const moderationFlags = [
                profile?.suspended ? 'suspended' : null,
                qualification?.has_no_violations === false ? 'violations' : null,
                (contentStats.pending_content || 0) > 0 ? 'pending_content' : null,
                (contentStats.rejected_content || 0) > 0 ? 'rejected_content' : null,
                (supportStats.escalated_tickets || 0) > 0 ? 'support_escalation' : null,
            ].filter(Boolean);

            return {
                id: user.id,
                email: user.email || profile?.email || authUser?.email || null,
                created_at: user.created_at || profile?.created_at || null,
                kyc_status: user.kyc_status || null,
                profile: {
                    full_name: profile?.full_name || profile?.display_name || user.display_name || authUser?.user_metadata?.full_name || null,
                    avatar_url: profile?.avatar_url || authUser?.user_metadata?.avatar_url || null,
                    bio: profile?.bio || null,
                    location: profile?.location || null,
                    display_name: profile?.display_name || user.display_name || null,
                    username: profile?.username || authUser?.user_metadata?.username || null,
                    suspended: Boolean(profile?.suspended),
                    suspension_reason: profile?.suspension_reason || null,
                },
                roles: Array.from(roleSet),
                qualification: qualification
                    ? {
                        is_qualified_for_money: Boolean(qualification.is_qualified_for_money),
                        has_no_violations: qualification.has_no_violations,
                        disqualification_reason: qualification.disqualification_reason || null,
                        disqualified_at: qualification.disqualified_at || null,
                    }
                    : null,
                latest_qualification_event: latestQualificationEvent
                    ? {
                        event_type: latestQualificationEvent.event_type,
                        reason: latestQualificationEvent.reason || null,
                        created_at: latestQualificationEvent.created_at,
                    }
                    : null,
                activity: {
                    hosted_count: momentStats.hosted_count || 0,
                    active_hosted_count: momentStats.active_hosted_count || 0,
                    joinable_hosted_count: momentStats.joinable_hosted_count || 0,
                    joined_count: participationStats.joined_count || 0,
                    total_content: contentStats.total_content || 0,
                    pending_content: contentStats.pending_content || 0,
                    rejected_content: contentStats.rejected_content || 0,
                    approved_content: contentStats.approved_content || 0,
                    open_support_tickets: supportStats.open_support_tickets || 0,
                    total_support_tickets: supportStats.total_support_tickets || 0,
                    escalated_tickets: supportStats.escalated_tickets || 0,
                    latest_activity_at: [
                        momentStats.latest_hosted_at,
                        participationStats.latest_joined_at,
                        contentStats.latest_content_at,
                        supportStats.latest_support_at,
                    ].filter(Boolean).sort().reverse()[0] || null,
                },
                moderation_flags: moderationFlags,
            };
        });

        res.json({ success: true, users: roster });
    } catch (error) {
        console.error('Admin User Roster Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch admin user roster' });
    }
});

/**
 * POST /api/admin/users/role
 * Update user role (Protected: Master Admin only)
 */
router.post('/users/role', requireMasterAdmin, async (req, res) => {
    try {
        const { userId, newRole } = req.body;

        if (!supabase) return res.json({ success: true, message: 'Mock role updated' });

        const { data: targetUser } = await supabase
            .from('users')
            .select('role, email')
            .eq('id', userId)
            .single();

        if (targetUser?.email === 'andremillwood@gmail.com') {
            return res.status(403).json({ error: 'Cannot modify Master Admin' });
        }

        const { error } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Role Update Error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

/**
 * GET /api/admin/proofs/pending
 * Get list of pending mission proof submissions
 */
router.get('/proofs/pending', async (req, res) => {
    try {
        if (!supabase) {
            return res.json([
                {
                    id: 'mock-proof-1',
                    drop_id: '1',
                    user_id: 'mock-user-1',
                    status: 'pending',
                    proof_url: 'https://via.placeholder.com/400x600?text=Receipt+Sample',
                    submission_text: 'Order #12345',
                    applied_at: new Date().toISOString(),
                    user: {
                        display_name: 'John Doe',
                        email: 'john@example.com'
                    },
                    drop: {
                        title: 'Summer Fashion Drop',
                        gem_reward_base: 50
                    }
                }
            ]);
        }

        const { data, error } = await supabase
            .from('drop_applications')
            .select(`
                *,
                user:users (
                    id,
                    display_name,
                    email,
                    avatar_url
                ),
                drop:drops (
                    id,
                    title,
                    gem_reward_base,
                    drop_role
                )
            `)
            .eq('status', 'pending')
            .not('proof_url', 'is', null) // Only interested in proofs
            .order('applied_at', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Admin Proof List Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/admin/proofs/:id/review
 * Approve or Reject a mission proof
 */
router.post('/proofs/:id/review', async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        if (!supabase) {
            return res.json({ success: true, message: `Mock ${action} successful` });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        const { data: application, error: fetchError } = await supabase
            .from('drop_applications')
            .select('*, drop:drops(*)')
            .eq('id', id)
            .single();

        if (fetchError || !application) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const { error: updateError } = await supabase
            .from('drop_applications')
            .update({
                status: newStatus,
                submission_notes: reason || application.submission_notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // If approved, you might want to trigger additional rewards or maturity checks here
        if (action === 'approve') {
            // Check if maturityService or campaignService needs to be notified
            try {
                const campaignService = require('../services/campaignService');
                if (application.drop.campaign_id) {
                    await campaignService.checkMaturityTransition(application.drop.campaign_id);
                }
            } catch (serviceErr) {
                console.warn('Maturity transition check failed (service might be missing):', serviceErr.message);
            }
        }

        res.json({ success: true, message: `Proof ${action} successful` });
    } catch (error) {
        console.error('Admin Proof Action Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/admin/moderation/overview
 * Unified moments and content moderation visibility
 */
router.get('/moderation/overview', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({
                success: true,
                summary: {},
                moments: [],
                content: [],
            });
        }

        const [
            { data: moments = [], error: momentsError },
            { data: checkIns = [], error: checkInsError },
            { data: momentParticipants = [], error: participantsError },
            { data: momentMedia = [], error: mediaError },
            { data: momentReviews = [], error: reviewsError },
            { data: proofSubmissions = [], error: proofsError },
        ] = await Promise.all([
            supabase
                .from('moments')
                .select('id, title, status, visibility, location, starts_at, created_at, host_id')
                .order('created_at', { ascending: false })
                .limit(30),
            supabase
                .from('check_ins')
                .select('id, moment_id, created_at')
                .order('created_at', { ascending: false })
                .limit(400),
            supabase
                .from('moment_participants')
                .select('moment_id, user_id, joined_at')
                .order('joined_at', { ascending: false })
                .limit(500),
            supabase
                .from('moment_media')
                .select('id, moment_id, user_id, media_url, caption, moderation_status, created_at')
                .order('created_at', { ascending: false })
                .limit(200),
            supabase
                .from('moment_reviews')
                .select('id, moment_id, user_id, rating, title, content, is_verified_participant, moderation_status, created_at')
                .order('created_at', { ascending: false })
                .limit(200),
            supabase
                .from('proof_submissions')
                .select('id, moment_id, submission_state, created_at')
                .order('created_at', { ascending: false })
                .limit(200),
        ]);

        if (momentsError) throw momentsError;
        if (checkInsError) throw checkInsError;
        if (participantsError) throw participantsError;
        if (mediaError) throw mediaError;
        if (reviewsError) throw reviewsError;
        if (proofsError) throw proofsError;

        const momentIds = moments.map((moment) => moment.id);
        const userIds = Array.from(new Set([
            ...moments.map((moment) => moment.host_id),
            ...momentMedia.map((item) => item.user_id),
            ...momentReviews.map((item) => item.user_id),
        ].filter(Boolean)));

        const [{ data: profiles = [], error: profilesError }] = await Promise.all([
            supabase.from('profiles').select('*').in('user_id', userIds),
        ]);

        if (profilesError) throw profilesError;

        const profilesByUserId = new Map(
            profiles
                .filter((profile) => profile?.user_id)
                .map((profile) => [profile.user_id, profile])
        );

        const participantCounts = new Map();
        for (const row of momentParticipants || []) {
            if (!row?.moment_id) continue;
            participantCounts.set(row.moment_id, (participantCounts.get(row.moment_id) || 0) + 1);
        }

        const checkInCounts = new Map();
        for (const row of checkIns || []) {
            if (!row?.moment_id) continue;
            checkInCounts.set(row.moment_id, (checkInCounts.get(row.moment_id) || 0) + 1);
        }

        const proofCounts = new Map();
        for (const row of proofSubmissions || []) {
            if (!row?.moment_id) continue;
            const current = proofCounts.get(row.moment_id) || { pending: 0, verified: 0, rejected: 0 };
            if (row.submission_state === 'pending') current.pending += 1;
            if (row.submission_state === 'verified') current.verified += 1;
            if (row.submission_state === 'rejected') current.rejected += 1;
            proofCounts.set(row.moment_id, current);
        }

        const mediaCounts = new Map();
        for (const row of momentMedia || []) {
            if (!row?.moment_id) continue;
            const current = mediaCounts.get(row.moment_id) || { approved: 0, pending: 0, rejected: 0 };
            if (row.moderation_status === 'approved') current.approved += 1;
            if (row.moderation_status === 'pending') current.pending += 1;
            if (row.moderation_status === 'rejected' || row.moderation_status === 'flagged') current.rejected += 1;
            mediaCounts.set(row.moment_id, current);
        }

        const reviewCounts = new Map();
        for (const row of momentReviews || []) {
            if (!row?.moment_id) continue;
            const current = reviewCounts.get(row.moment_id) || { approved: 0, pending: 0, rejected: 0 };
            if (row.moderation_status === 'approved') current.approved += 1;
            if (row.moderation_status === 'pending') current.pending += 1;
            if (row.moderation_status === 'rejected' || row.moderation_status === 'flagged') current.rejected += 1;
            reviewCounts.set(row.moment_id, current);
        }

        const momentsWithMetrics = moments.map((moment) => {
            const hostProfile = profilesByUserId.get(moment.host_id);
            const mediaStats = mediaCounts.get(moment.id) || { approved: 0, pending: 0, rejected: 0 };
            const reviewStats = reviewCounts.get(moment.id) || { approved: 0, pending: 0, rejected: 0 };
            const proofStats = proofCounts.get(moment.id) || { pending: 0, verified: 0, rejected: 0 };

            return {
                ...moment,
                host: {
                    id: moment.host_id,
                    name: hostProfile?.full_name || hostProfile?.display_name || hostProfile?.username || 'Unknown host',
                    avatar_url: hostProfile?.avatar_url || null,
                },
                metrics: {
                    participants: participantCounts.get(moment.id) || 0,
                    check_ins: checkInCounts.get(moment.id) || 0,
                    proofs_pending: proofStats.pending,
                    proofs_verified: proofStats.verified,
                    proofs_rejected: proofStats.rejected,
                    content_approved: mediaStats.approved + reviewStats.approved,
                    content_pending: mediaStats.pending + reviewStats.pending,
                    content_rejected: mediaStats.rejected + reviewStats.rejected,
                },
            };
        });

        const contentItems = [
            ...momentMedia.map((item) => ({
                id: item.id,
                type: 'media',
                moment_id: item.moment_id,
                user_id: item.user_id,
                moderation_status: item.moderation_status || 'pending',
                created_at: item.created_at,
                media_url: item.media_url,
                preview: item.caption || 'Moment media upload',
            })),
            ...momentReviews.map((item) => ({
                id: item.id,
                type: 'review',
                moment_id: item.moment_id,
                user_id: item.user_id,
                moderation_status: item.moderation_status || 'pending',
                created_at: item.created_at,
                rating: item.rating,
                preview: item.title || item.content || 'Moment review',
                is_verified_participant: item.is_verified_participant || false,
            })),
        ]
            .filter((item) => ['pending', 'rejected', 'flagged'].includes(item.moderation_status))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 40)
            .map((item) => {
                const profile = profilesByUserId.get(item.user_id);
                const moment = moments.find((entry) => entry.id === item.moment_id);
                return {
                    ...item,
                    moment_title: moment?.title || 'Unknown moment',
                    user: {
                        id: item.user_id,
                        name: profile?.full_name || profile?.display_name || profile?.username || 'Unknown user',
                        avatar_url: profile?.avatar_url || null,
                    },
                };
            });

        const summary = {
            total_moments: moments.length,
            active_moments: moments.filter((moment) => moment.status === 'active').length,
            joinable_moments: moments.filter((moment) => moment.status === 'joinable').length,
            total_participants: momentParticipants.length,
            total_check_ins: checkIns.length,
            pending_proofs: proofSubmissions.filter((item) => item.submission_state === 'pending').length,
            pending_content: contentItems.filter((item) => item.moderation_status === 'pending').length,
            rejected_content: contentItems.filter((item) => item.moderation_status === 'rejected' || item.moderation_status === 'flagged').length,
        };

        res.json({
            success: true,
            summary,
            moments: momentsWithMetrics,
            content: contentItems,
        });
    } catch (error) {
        console.error('Admin Moderation Overview Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch moderation overview' });
    }
});

/**
 * PATCH /api/admin/moderation/content/:type/:id
 * Moderate user-generated moment media and reviews.
 */
router.patch('/moderation/content/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { status, reason = null } = req.body || {};

        if (!['media', 'review'].includes(type)) {
            return res.status(400).json({ success: false, error: 'type must be media or review' });
        }

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: 'status must be pending, approved, or rejected' });
        }

        if (status === 'rejected' && !String(reason || '').trim()) {
            return res.status(400).json({ success: false, error: 'A reason is required when rejecting content' });
        }

        if (!supabase) {
            return res.json({ success: true, item: { id, type, moderation_status: status } });
        }

        const table = type === 'media' ? 'moment_media' : 'moment_reviews';
        const patch = {
            moderation_status: status,
        };

        if (type === 'media') {
            patch.is_approved = status === 'approved';
            patch.moderation_notes = reason || null;
        }

        const { data, error } = await supabase
            .from(table)
            .update(patch)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            item: {
                ...data,
                type,
            },
        });
    } catch (error) {
        console.error('Admin Content Moderation Error:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to moderate content' });
    }
});

const CATALOG_CONFIG = {
    venues: {
        table: 'venues',
        allowedUpdates: ['name', 'description', 'address', 'category', 'phone', 'website', 'image_url', 'is_active', 'owner_id'],
        orderBy: 'created_at',
        searchColumns: ['name', 'address', 'category'],
    },
    products: {
        table: 'merchant_products',
        allowedUpdates: ['name', 'description', 'category', 'price', 'currency', 'inventory_quantity', 'inventory_count', 'is_active', 'is_redeemable_with_points', 'points_cost', 'venue_id', 'merchant_id'],
        orderBy: 'created_at',
        searchColumns: ['name', 'category', 'sku'],
    },
    offers: {
        table: 'offers',
        allowedUpdates: ['title', 'description', 'terms', 'image_url', 'reward_type', 'fulfillment_type', 'value_amount', 'value_currency', 'venue_id', 'quantity_total', 'per_user_limit', 'starts_at', 'ends_at', 'status'],
        orderBy: 'created_at',
        searchColumns: ['title', 'description', 'reward_type', 'status'],
    },
    campaigns: {
        table: 'campaigns',
        allowedUpdates: ['title', 'description', 'brand_id', 'budget', 'reward_type', 'reward_value', 'start_date', 'end_date', 'is_active', 'featured', 'featured_until'],
        orderBy: 'created_at',
        searchColumns: ['title', 'description', 'reward_type'],
    },
};

function normalizeCatalogUpdates(type, body = {}) {
    const config = CATALOG_CONFIG[type];
    const patch = {};

    for (const field of config.allowedUpdates) {
        if (body[field] !== undefined) patch[field] = body[field];
    }

    if (type === 'products') {
        if (patch.inventory_quantity !== undefined && patch.inventory_count === undefined) {
            patch.inventory_count = patch.inventory_quantity;
        }
        if (patch.inventory_count !== undefined && patch.inventory_quantity === undefined) {
            patch.inventory_quantity = patch.inventory_count;
        }
    }

    patch.updated_at = new Date().toISOString();
    return patch;
}

async function recordAdminAudit({ actorId, action, targetType, targetId, reason, metadata = {} }) {
    if (!supabase) return;

    try {
        const { error } = await supabase.from('admin_audit_log').insert({
            actor_id: actorId,
            action,
            target_type: targetType,
            target_id: targetId,
            reason: reason || null,
            metadata,
        });

        if (error) throw error;
    } catch (error) {
        console.warn('Admin audit log skipped:', error.message);
    }
}

/**
 * GET /api/admin/catalog/:type
 * Admin list view for public/business catalog objects.
 */
router.get('/catalog/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const config = CATALOG_CONFIG[type];
        if (!config) return res.status(400).json({ success: false, error: 'Unknown catalog type' });

        if (!supabase) return res.json({ success: true, items: [] });

        const limit = Math.min(Math.max(Number(req.query.limit) || 80, 1), 200);
        let query = supabase
            .from(config.table)
            .select('*')
            .order(config.orderBy, { ascending: false })
            .limit(limit);

        if (req.query.active === 'true') query = query.eq('is_active', true);
        if (req.query.active === 'false') query = query.eq('is_active', false);
        if (req.query.status && type === 'offers') query = query.eq('status', req.query.status);

        const { data, error } = await query;
        if (error) throw error;

        const search = String(req.query.search || '').trim().toLowerCase();
        const rows = search
            ? (data || []).filter((item) => config.searchColumns.some((column) => String(item[column] || '').toLowerCase().includes(search)))
            : (data || []);

        res.json({ success: true, items: rows });
    } catch (error) {
        console.error('Admin Catalog List Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to load catalog' });
    }
});

/**
 * PATCH /api/admin/catalog/:type/:id
 * Admin update for venues, merchant products, and offers.
 */
router.patch('/catalog/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const config = CATALOG_CONFIG[type];
        if (!config) return res.status(400).json({ success: false, error: 'Unknown catalog type' });

        const { reason = null, ...body } = req.body || {};
        const patch = normalizeCatalogUpdates(type, body);
        if (Object.keys(patch).length <= 1) {
            return res.status(400).json({ success: false, error: 'No editable fields provided' });
        }

        if (!supabase) return res.json({ success: true, item: { id, ...patch } });

        const { data, error } = await supabase
            .from(config.table)
            .update(patch)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await recordAdminAudit({
            actorId: req.user.id,
            action: 'catalog.update',
            targetType: type,
            targetId: id,
            reason,
            metadata: { patch },
        });

        res.json({ success: true, item: data });
    } catch (error) {
        console.error('Admin Catalog Update Error:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to update catalog item' });
    }
});

/**
 * GET /api/admin/commerce/overview
 * Admin commerce operations overview across receipts and merchant listings.
 */
router.get('/commerce/overview', async (req, res) => {
    try {
        if (!supabase) return res.json({ success: true, receipts: [], products: [], summary: {} });

        const limit = Math.min(Math.max(Number(req.query.limit) || 80, 1), 200);
        const [
            { data: receipts = [], error: receiptsError },
            { data: products = [], error: productsError },
            automationResult,
        ] = await Promise.all([
            supabase
                .from('commerce_receipts')
                .select('*, merchant_products:listing_id(name, image_url, category, fulfillment_mode, merchant_id)')
                .order('occurred_at', { ascending: false })
                .limit(limit),
            supabase
                .from('merchant_products')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('experience_automation_runs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit)
                .then(({ data, error }) => ({ data: data || [], error }))
                .catch(() => ({ data: [], error: null })),
        ]);

        if (receiptsError) throw receiptsError;
        if (productsError) throw productsError;
        const automations = automationResult.data || [];

        const summary = {
            total_receipts: receipts.length,
            issued_or_pending: receipts.filter((receipt) => ['issued', 'pending'].includes(receipt.status)).length,
            fulfilled: receipts.filter((receipt) => receipt.status === 'fulfilled').length,
            cancelled_or_refunded: receipts.filter((receipt) => ['cancelled', 'refunded'].includes(receipt.status)).length,
            paid_revenue: receipts
                .filter((receipt) => receipt.receipt_type === 'purchase' && receipt.status === 'fulfilled')
                .reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0),
            active_products: products.filter((product) => product.is_active !== false).length,
            hidden_products: products.filter((product) => product.is_active === false || product.visibility === 'hidden').length,
            public_products: products.filter((product) => product.visibility !== 'hidden' && product.is_active !== false).length,
            automation_failures: automations.filter((run) => run.status === 'failed').length,
            automated_unlocks: automations.filter((run) => run.status === 'completed').length,
        };

        res.json({ success: true, receipts, products, automations, summary });
    } catch (error) {
        console.error('Admin Commerce Overview Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to load commerce overview' });
    }
});

/**
 * POST /api/admin/commerce/automations/:id/retry
 * Safely retry a failed proof-triggered unlock using its idempotency key.
 */
router.post('/commerce/automations/:id/retry', async (req, res) => {
    try {
        const outcomes = await experienceAutomationService.retryAutomationRun(req.params.id);
        await recordAdminAudit({
            actorId: req.user.id,
            action: 'commerce.automation_retry',
            targetType: 'experience_automation_run',
            targetId: req.params.id,
            reason: req.body?.reason || 'Admin retry',
            metadata: { outcome_count: outcomes.length },
        });
        res.json({ success: true, outcomes });
    } catch (error) {
        console.error('Admin Commerce Automation Retry Error:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to retry automation' });
    }
});

/**
 * POST /api/admin/commerce/automations/reconcile
 * Backfill linked rewards for proofs verified before automation was enabled.
 */
router.post('/commerce/automations/reconcile', async (req, res) => {
    try {
        const summary = await experienceAutomationService.reconcileVerifiedProofs({ limit: req.body?.limit || 100 });
        await recordAdminAudit({
            actorId: req.user.id,
            action: 'commerce.automation_reconcile',
            targetType: 'verified_proofs',
            targetId: req.user.id,
            reason: req.body?.reason || 'Admin reconciliation',
            metadata: summary,
        });
        res.json({ success: true, summary });
    } catch (error) {
        console.error('Admin Commerce Automation Reconcile Error:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to reconcile verified proofs' });
    }
});

/**
 * PATCH /api/admin/commerce/receipts/:id/status
 * Admin receipt intervention for commerce support and trust operations.
 */
router.patch('/commerce/receipts/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason = null } = req.body || {};
        if (!['issued', 'pending', 'fulfilled', 'cancelled', 'refunded'].includes(status)) {
            return res.status(422).json({ success: false, error: 'Invalid receipt status' });
        }
        if (['cancelled', 'refunded'].includes(status) && !String(reason || '').trim()) {
            return res.status(400).json({ success: false, error: 'Reason is required for cancelled/refunded receipts' });
        }

        if (!supabase) return res.json({ success: true, receipt: { id, status } });

        const { data: existing, error: fetchError } = await supabase
            .from('commerce_receipts')
            .select('id, sale_id, attribution, status, amount, currency')
            .eq('id', id)
            .single();
        if (fetchError || !existing) return res.status(404).json({ success: false, error: 'Receipt not found' });

        let data = null;
        let stripeRefund = null;
        if (status === 'refunded') {
            const marketplaceService = require('../services/marketplaceService');
            const refundResult = await marketplaceService.refundCommerceReceipt({
                receiptId: id,
                actorId: req.user.id,
                reason,
            });
            stripeRefund = refundResult.stripe_refund || null;
            const refreshed = await supabase
                .from('commerce_receipts')
                .select('*, merchant_products:listing_id(name, image_url, category, fulfillment_mode, merchant_id)')
                .eq('id', id)
                .single();
            if (refreshed.error) throw refreshed.error;
            data = refreshed.data;
        } else {
            const updateResult = await supabase
                .from('commerce_receipts')
                .update({
                    status,
                    attribution: {
                        ...(existing.attribution || {}),
                        admin_status_action: status,
                        admin_status_reason: reason,
                        admin_status_at: new Date().toISOString(),
                        admin_status_by: req.user.id,
                        previous_status: existing.status,
                    },
                })
                .eq('id', id)
                .select('*, merchant_products:listing_id(name, image_url, category, fulfillment_mode, merchant_id)')
                .single();
            if (updateResult.error) throw updateResult.error;
            data = updateResult.data;
        }

        if (existing.sale_id) {
            const saleStatus = status === 'fulfilled' ? 'validated' : status === 'cancelled' ? 'cancelled' : null;
            if (saleStatus) {
                await supabase.from('product_sales').update({ status: saleStatus }).eq('id', existing.sale_id);
            }
        }

        await recordAdminAudit({
            actorId: req.user.id,
            action: 'commerce.receipt.status',
            targetType: 'commerce_receipt',
            targetId: id,
            reason,
            metadata: { status, previous_status: existing.status, stripe_refund_id: stripeRefund?.id || null },
        });

        res.json({ success: true, receipt: data, stripe_refund: stripeRefund });
    } catch (error) {
        console.error('Admin Commerce Receipt Status Error:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to update commerce receipt' });
    }
});

/**
 * PATCH /api/admin/commerce/products/:id/moderate
 * Admin visibility/activation action for merchant commerce listings.
 */
router.patch('/commerce/products/:id/moderate', async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason = null } = req.body || {};
        if (!['approve', 'pause', 'hide', 'archive'].includes(action)) {
            return res.status(422).json({ success: false, error: 'Invalid product moderation action' });
        }
        if (['hide', 'archive', 'pause'].includes(action) && !String(reason || '').trim()) {
            return res.status(400).json({ success: false, error: 'Reason is required for this moderation action' });
        }

        const patch = action === 'approve'
            ? { is_active: true, visibility: 'public' }
            : action === 'pause'
                ? { is_active: false }
                : action === 'hide'
                    ? { visibility: 'hidden', is_active: false }
                    : { visibility: 'hidden', is_active: false };

        if (!supabase) return res.json({ success: true, product: { id, ...patch } });

        const { data, error } = await supabase
            .from('merchant_products')
            .update(patch)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;

        await recordAdminAudit({
            actorId: req.user.id,
            action: `commerce.product.${action}`,
            targetType: 'merchant_product',
            targetId: id,
            reason,
            metadata: { patch },
        });

        res.json({ success: true, product: data });
    } catch (error) {
        console.error('Admin Commerce Product Moderate Error:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to moderate product' });
    }
});

/**
 * GET /api/admin/withdrawals/pending
 * Get list of pending withdrawal requests
 */
router.get('/withdrawals/pending', async (req, res) => {
    try {
        if (!supabase) {
            return res.json([
                {
                    id: 'mock-withdrawal-1',
                    user_id: 'mock-user-1',
                    gems_amount: 5000,
                    usd_value: 50.00,
                    payment_method: 'paypal',
                    payment_details: { email: 'john@example.com' },
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    user: {
                        display_name: 'John Doe',
                        email: 'john@example.com'
                    }
                }
            ]);
        }

        const { data, error } = await supabase
            .from('withdrawal_requests')
            .select(`
                *,
                user:users (
                    id,
                    display_name,
                    email,
                    avatar_url
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Admin Withdrawal List Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/admin/withdrawals/:id/review
 * Approve or Reject a withdrawal request
 */
router.post('/withdrawals/:id/review', async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        if (!supabase) {
            return res.json({ success: true, message: `Mock withdrawal ${action} successful` });
        }

        const newStatus = action === 'approve' ? 'completed' : 'rejected';

        const { error } = await supabase
            .from('withdrawal_requests')
            .update({
                status: newStatus,
                notes: notes || null,
                processed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: `Withdrawal ${action === 'approve' ? 'completed' : 'rejected'} successfully` });
    } catch (error) {
        console.error('Admin Withdrawal Action Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// ECONOMY & TREASURY ADMIN ROUTES
// ==========================================

/**
 * GET /api/admin/operations/overview
 * Unified operational visibility across rewards, Gems, KYC, demo usage, and support.
 */
router.get('/operations/overview', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({
                rewards_24h: { issued_count: 0, unique_users: 0 },
                gems: {
                    held_balance: 0,
                    locked_bonus_balance: 0,
                    unlock_ready_count: 0,
                    recent_activity: [],
                },
                redemptions: {
                    pending_requests: 0,
                    completed_7d: 0,
                    rejected_7d: 0,
                    recent_attempts: [],
                },
                kyc: await simpleKYCService.getKYCStats(),
                usage: {
                    demo_accounts: 0,
                    live_accounts: 0,
                    demo_participants_7d: 0,
                    live_participants_7d: 0,
                },
                support: {
                    open_escalations: 0,
                    high_priority_open: 0,
                    oldest_open_hours: 0,
                    recent_escalations: [],
                },
            });
        }

        const since24h = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString();
        const since7d = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString();

        const [
            rewardsResult,
            recentRewardsResult,
            gemsActivityResult,
            withdrawalStatsResult,
            recentWithdrawalsResult,
            usersResult,
            participants7dResult,
            supportResult,
            kycStats,
        ] = await Promise.all([
            supabase
                .from('rewards')
                .select('user_id, created_at')
                .gte('created_at', since24h),
            supabase
                .from('rewards')
                .select('id, user_id, created_at')
                .order('created_at', { ascending: false })
                .limit(20),
            supabase
                .from('gems_transactions')
                .select(`
                    id,
                    user_id,
                    amount,
                    transaction_type,
                    redemption_status,
                    objective_status,
                    objective_code,
                    redeemable_after,
                    created_at,
                    user:users!gems_transactions_user_id_fkey (
                        email,
                        demo_email_recipient
                    )
                `)
                .in('redemption_status', ['pending_30_day_hold', 'locked_objective', 'redeemable'])
                .order('created_at', { ascending: false })
                .limit(40),
            supabase
                .from('withdrawal_requests')
                .select('status, created_at'),
            supabase
                .from('withdrawal_requests')
                .select(`
                    id,
                    user_id,
                    amount,
                    status,
                    withdrawal_method,
                    created_at,
                    user:users (
                        email,
                        demo_email_recipient
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(20),
            supabase
                .from('users')
                .select('id, email, demo_email_recipient'),
            supabase
                .from('moment_participants')
                .select('user_id, joined_at')
                .gte('joined_at', since7d),
            supabase
                .from('support_tickets')
                .select(`
                    id,
                    user_id,
                    subject,
                    category,
                    priority,
                    status,
                    created_at,
                    user:users (
                        email,
                        demo_email_recipient
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(30),
            simpleKYCService.getKYCStats(),
        ]);

        const rewards = rewardsResult.data || [];
        const rewardsUniqueUsers = new Set(rewards.map((row) => row.user_id).filter(Boolean)).size;

        const gemsActivity = gemsActivityResult.data || [];
        const heldBalance = gemsActivity
            .filter((row) => row.redemption_status === 'pending_30_day_hold' && Number(row.amount) > 0)
            .reduce((sum, row) => sum + Number(row.amount || 0), 0);
        const lockedBonusBalance = gemsActivity
            .filter((row) => row.redemption_status === 'locked_objective' && Number(row.amount) > 0)
            .reduce((sum, row) => sum + Number(row.amount || 0), 0);
        const unlockReadyCount = gemsActivity.filter((row) =>
            row.redemption_status === 'locked_objective' &&
            (row.objective_status === 'completed' || row.objective_status === 'waived')
        ).length;

        const withdrawals = withdrawalStatsResult.data || [];
        const recentWithdrawals = recentWithdrawalsResult.data || [];
        const pendingWithdrawalCount = withdrawals.filter((row) => row.status === 'pending').length;
        const completedWithdrawals7d = withdrawals.filter((row) =>
            row.status === 'completed' && row.created_at >= since7d
        ).length;
        const rejectedWithdrawals7d = withdrawals.filter((row) =>
            row.status === 'rejected' && row.created_at >= since7d
        ).length;

        const users = usersResult.data || [];
        const demoUserIds = new Set(
            users
                .filter((row) => {
                    const email = String(row.email || '').toLowerCase();
                    return email.startsWith('demo.')
                        || email.includes('@demo.')
                        || email.includes('_demo@')
                        || !!row.demo_email_recipient;
                })
                .map((row) => row.id)
        );
        const liveAccounts = users.length - demoUserIds.size;

        const participantRows = participants7dResult.data || [];
        const uniqueParticipantIds = [...new Set(participantRows.map((row) => row.user_id).filter(Boolean))];
        const demoParticipants7d = uniqueParticipantIds.filter((id) => demoUserIds.has(id)).length;
        const liveParticipants7d = uniqueParticipantIds.filter((id) => !demoUserIds.has(id)).length;

        const supportTickets = supportResult.data || [];
        const openSupportTickets = supportTickets.filter((ticket) => ['open', 'in_progress'].includes(ticket.status));
        const highPriorityOpen = openSupportTickets.filter((ticket) => ticket.priority === 'high').length;
        const oldestOpenHours = openSupportTickets.length > 0
            ? Math.max(
                ...openSupportTickets.map((ticket) =>
                    Math.round((Date.now() - new Date(ticket.created_at).getTime()) / (60 * 60 * 1000))
                )
            )
            : 0;

        res.json({
            rewards_24h: {
                issued_count: rewards.length,
                unique_users: rewardsUniqueUsers,
                recent_activity: (recentRewardsResult.data || []).slice(0, 6),
            },
            gems: {
                held_balance: heldBalance,
                locked_bonus_balance: lockedBonusBalance,
                unlock_ready_count: unlockReadyCount,
                recent_activity: gemsActivity.slice(0, 8).map((row) => ({
                    id: row.id,
                    user_id: row.user_id,
                    email: row.user?.email || null,
                    is_demo: !!row.user?.demo_email_recipient,
                    amount: Number(row.amount || 0),
                    transaction_type: row.transaction_type,
                    redemption_status: row.redemption_status,
                    objective_status: row.objective_status,
                    objective_code: row.objective_code,
                    redeemable_after: row.redeemable_after,
                    created_at: row.created_at,
                })),
            },
            redemptions: {
                pending_requests: pendingWithdrawalCount,
                completed_7d: completedWithdrawals7d,
                rejected_7d: rejectedWithdrawals7d,
                recent_attempts: recentWithdrawals.slice(0, 8).map((row) => ({
                    id: row.id,
                    user_id: row.user_id,
                    email: row.user?.email || null,
                    is_demo: !!row.user?.demo_email_recipient,
                    amount: Number(row.amount || 0),
                    status: row.status,
                    withdrawal_method: row.withdrawal_method || null,
                    created_at: row.created_at,
                })),
            },
            kyc: kycStats,
            usage: {
                demo_accounts: demoUserIds.size,
                live_accounts: liveAccounts,
                demo_participants_7d: demoParticipants7d,
                live_participants_7d: liveParticipants7d,
            },
            support: {
                open_escalations: openSupportTickets.length,
                high_priority_open: highPriorityOpen,
                oldest_open_hours: oldestOpenHours,
                recent_escalations: openSupportTickets.slice(0, 8).map((ticket) => ({
                    id: ticket.id,
                    subject: ticket.subject,
                    category: ticket.category,
                    priority: ticket.priority,
                    status: ticket.status,
                    created_at: ticket.created_at,
                    email: ticket.user?.email || null,
                    is_demo: !!ticket.user?.demo_email_recipient,
                })),
            },
        });
    } catch (error) {
        console.error('Admin Operations Overview Error:', error);
        res.status(500).json({ error: 'Failed to load operations overview' });
    }
});

/**
 * GET /api/admin/economy/stats
 * Platform-wide economy aggregates
 */
router.get('/economy/stats', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({
                total_points: 0, total_gems: 0, total_promokeys: 0, total_gold: 0,
                total_liability_usd: 0, gem_usd_rate: 0.01,
                total_users_with_balance: 0, transactions_24h: 0
            });
        }

        // Aggregate all user balances
        const { data: balances } = await supabase
            .from('economy_wallets')
            .select('points, gems, promokeys, gold, usd');

        let total_points = 0, total_gems = 0, total_promokeys = 0, total_gold = 0;
        (balances || []).forEach(b => {
            total_points += Number(b.points) || 0;
            total_gems += Number(b.gems) || 0;
            total_promokeys += Number(b.promokeys) || 0;
            total_gold += Number(b.gold) || 0;
        });

        // Get gem USD rate
        let gem_usd_rate = 0.01;
        try {
            const { data: setting } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'GEM_USD_RATE')
                .single();
            if (setting?.value?.rate) gem_usd_rate = setting.value.rate;
        } catch (e) { /* use default */ }

        // 24h transaction count
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: transactions_24h } = await supabase
            .from('economy_transactions')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', since24h);

        // Pending withdrawals total
        const { data: pendingWithdrawals } = await supabase
            .from('withdrawal_requests')
            .select('amount')
            .eq('status', 'pending');

        const pending_withdrawal_usd = (pendingWithdrawals || []).reduce((sum, w) => sum + Number(w.amount || 0), 0);

        res.json({
            total_points,
            total_gems,
            total_promokeys,
            total_gold,
            total_liability_usd: (total_gems * gem_usd_rate).toFixed(2),
            gem_usd_rate,
            total_users_with_balance: (balances || []).length,
            transactions_24h: transactions_24h || 0,
            pending_withdrawal_usd
        });
    } catch (error) {
        console.error('Admin Economy Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch economy stats' });
    }
});

router.get('/economy/health', async (req, res) => {
    try {
        if (!supabase) return res.json({ status: 'unknown', checks: {}, journey: {} });
        const since24h = new Date(Date.now() - 86400000).toISOString();
        const since7d = new Date(Date.now() - 7 * 86400000).toISOString();
        const [
            receipts, notifications, unread, transactions, journeyEvents,
            referralFailures, pendingPioneer
        ] = await Promise.all([
            supabase.from('reward_receipts').select('*', { count: 'exact', head: true }).gte('created_at', since24h),
            supabase.from('value_notifications').select('*', { count: 'exact', head: true }).gte('created_at', since24h),
            supabase.from('value_notifications').select('*', { count: 'exact', head: true }).is('read_at', null).gte('created_at', since7d),
            supabase.from('economy_transactions').select('*', { count: 'exact', head: true }).gte('created_at', since24h),
            supabase.from('value_journey_events').select('journey_stage').gte('created_at', since7d),
            supabase.from('referral_earning_events').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', since7d),
            supabase.from('pioneer_point_events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);
        const queryErrors = [receipts, notifications, unread, transactions, journeyEvents, referralFailures, pendingPioneer]
            .map((result) => result.error?.message).filter(Boolean);
        const journey = (journeyEvents.data || []).reduce((totals, event) => {
            totals[event.journey_stage] = (totals[event.journey_stage] || 0) + 1;
            return totals;
        }, {});
        const checks = {
            transactions_24h: transactions.count || 0,
            receipts_24h: receipts.count || 0,
            notifications_24h: notifications.count || 0,
            unread_notifications_7d: unread.count || 0,
            failed_referrals_7d: referralFailures.count || 0,
            pending_pioneer_reviews: pendingPioneer.count || 0,
        };
        res.json({
            status: queryErrors.length || checks.failed_referrals_7d > 0 ? 'attention' : 'healthy',
            checks, journey, query_errors: queryErrors,
            receipt_coverage: checks.transactions_24h
                ? Math.min(1, checks.receipts_24h / checks.transactions_24h)
                : 1,
        });
    } catch (error) {
        console.error('Admin Economy Health Error:', error);
        res.status(500).json({ error: 'Failed to fetch economy health' });
    }
});

/**
 * GET /api/admin/economy/transactions
 * Master ledger with pagination
 */
router.get('/economy/transactions', async (req, res) => {
    try {
        if (!supabase) return res.json({ transactions: [], total: 0 });

        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = parseInt(req.query.offset) || 0;
        const currency = req.query.currency;
        const userId = req.query.user_id;

        let query = supabase
            .from('economy_transactions')
            .select('*, profiles:user_id(full_name, email)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (currency) query = query.eq('currency', currency);
        if (userId) query = query.eq('user_id', userId);

        const { data, count, error } = await query;
        if (error) throw error;

        res.json({ transactions: data || [], total: count || 0 });
    } catch (error) {
        console.error('Admin Transactions Error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

/**
 * POST /api/admin/economy/adjust-balance
 * Manual balance adjustment (grant/deduct)
 */
router.post('/economy/adjust-balance', async (req, res) => {
    try {
        const { user_id, currency, amount, reason } = req.body;

        if (!user_id || !currency || amount === undefined || !reason) {
            return res.status(400).json({ error: 'user_id, currency, amount, and reason are required' });
        }

        const validCurrencies = ['points', 'promokeys', 'gems', 'gold', 'usd'];
        if (!validCurrencies.includes(currency)) {
            return res.status(400).json({ error: `Invalid currency. Must be one of: ${validCurrencies.join(', ')}` });
        }

        if (!supabase) return res.json({ success: true, message: 'Mock adjustment' });

        const { data: transaction, error: adjustmentError } = await supabase.rpc('post_economy_transaction', {
            p_user_id: user_id,
            p_currency: currency,
            p_amount: Number(amount),
            p_transaction_type: 'admin_adjustment',
            p_source: 'admin_manual',
            p_idempotency_key: `admin:${req.user.id}:${user_id}:${currency}:${Date.now()}`,
            p_reference_id: null,
            p_reference_table: null,
            p_description: `[Admin: ${req.user.email || req.user.id}] ${reason}`,
            p_metadata: { reason, admin_user_id: req.user.id }
        });
        if (adjustmentError) throw adjustmentError;

        res.json({ success: true, new_balance: transaction.balance_after, transaction });
    } catch (error) {
        console.error('Admin Adjust Balance Error:', error);
        res.status(500).json({ error: 'Failed to adjust balance' });
    }
});

/**
 * GET /api/admin/economy/config
 * Get system configuration settings
 */
router.get('/economy/config', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({
                payout_threshold_usd: 250,
                gem_usd_rate: 0.01,
                point_multiplier: 1,
                maintenance_mode: false,
                maintenance_message: ''
            });
        }

        const keys = ['PAYOUT_THRESHOLD_USD', 'GEM_USD_RATE', 'POINT_MULTIPLIER', 'MAINTENANCE_MODE', 'MAINTENANCE_MESSAGE'];
        const { data: settings } = await supabase
            .from('system_settings')
            .select('key, value')
            .in('key', keys);

        const config = {};
        (settings || []).forEach(s => { config[s.key] = s.value; });

        res.json({
            payout_threshold_usd: config.PAYOUT_THRESHOLD_USD?.amount || 250,
            gem_usd_rate: config.GEM_USD_RATE?.rate || 0.01,
            point_multiplier: config.POINT_MULTIPLIER?.multiplier || 1,
            maintenance_mode: config.MAINTENANCE_MODE?.enabled || false,
            maintenance_message: config.MAINTENANCE_MESSAGE?.message || ''
        });
    } catch (error) {
        console.error('Admin Config Error:', error);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

/**
 * POST /api/admin/economy/config
 * Update system configuration
 */
router.post('/economy/config', async (req, res) => {
    try {
        const updates = req.body;
        if (!supabase) return res.json({ success: true });

        const mapping = {
            payout_threshold_usd: { key: 'PAYOUT_THRESHOLD_USD', transform: v => ({ amount: v }) },
            gem_usd_rate: { key: 'GEM_USD_RATE', transform: v => ({ rate: v }) },
            point_multiplier: { key: 'POINT_MULTIPLIER', transform: v => ({ multiplier: v }) },
            maintenance_mode: { key: 'MAINTENANCE_MODE', transform: v => ({ enabled: v }) },
            maintenance_message: { key: 'MAINTENANCE_MESSAGE', transform: v => ({ message: v }) },
        };

        for (const [field, value] of Object.entries(updates)) {
            if (mapping[field]) {
                const { key, transform } = mapping[field];
                await supabase
                    .from('system_settings')
                    .upsert({ key, value: transform(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });
            }
        }

        res.json({ success: true, message: 'Configuration updated' });
    } catch (error) {
        console.error('Admin Config Update Error:', error);
        res.status(500).json({ error: 'Failed to update config' });
    }
});

/**
 * POST /api/admin/users/:id/suspend
 * Suspend/unsuspend a user
 */
router.post('/users/:id/suspend', async (req, res) => {
    try {
        const { id } = req.params;
        const { suspended, reason } = req.body;

        if (!supabase) return res.json({ success: true });

        const { error } = await supabase
            .from('profiles')
            .update({
                suspended: !!suspended,
                suspension_reason: reason || null,
                updated_at: new Date().toISOString()
            })
            .or(`id.eq.${id},user_id.eq.${id}`);

        if (error) throw error;

        res.json({ success: true, message: suspended ? 'User suspended' : 'User unsuspended' });
    } catch (error) {
        console.error('Admin Suspend Error:', error);
        res.status(500).json({ error: 'Failed to update suspension status' });
    }
});

/**
 * POST /api/admin/campaigns/compiler-launch
 * Launch a campaign compiled by the deterministic rule engine
 */
router.post('/campaigns/compiler-launch', async (req, res) => {
    try {
        const compilerService = require('../services/campaignCompilerService');
        const { goal, businessName, context } = req.body;

        // Use service to compile
        const compiled = compilerService.compile(goal, businessName, context);
        const { moment, proof, compiler_metadata } = compiled;

        if (!supabase) {
            return res.json({ success: true, message: 'Mock launch successful (No DB)', compiled });
        }

        const adminId = req.user.id;

        // 2. Create the Campaign Record
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .insert({
                advertiser_id: adminId,
                name: moment.name,
                description: moment.description,
                reward_value: `${compiled.reward.baseGems} Gems`,
                campaign_type: 'activation',
                status: 'active',
                compiler_metadata: compiler_metadata,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (campaignError) throw campaignError;

        // 3. Create the Moment Record
        const proofMapping = {
            'Link': 'API',
            'OCR': 'Photo',
            'Upload': 'Photo'
        };

        const { data: newMoment, error: momentError } = await supabase
            .from('moments')
            .insert({
                organizer_id: adminId,
                title: moment.name,
                description: moment.description,
                type: 'digital_drop',
                status: 'live',
                sku_type: moment.tier || 'A3',
                proof_type: proofMapping[proof] || 'Photo',
                expected_action_unit: 'Submission',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (momentError) throw momentError;

        // 4. Link Campaign to Moment
        try {
            await supabase.from('campaign_sponsorships').insert({
                campaign_id: campaign.id,
                moment_id: newMoment.id,
                status: 'active',
                sponsorship_amount: 0
            });
        } catch (e) {
            console.warn('Optional sponsorship link failed:', e.message);
        }

        res.json({
            success: true,
            campaign_id: campaign.id,
            moment_id: newMoment.id,
            message: 'Campaign compiled and launched successfully.',
            compiled
        });

    } catch (error) {
        console.error('Compiler Launch Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
