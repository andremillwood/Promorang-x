const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

router.get('/public/leaderboard', async (req, res) => {
  try {
    if (!supabase) return res.json({ season: demoDashboard.season, entries: [] });
    const type = String(req.query.type || 'host');
    const allowed = ['member','creator','host','venue','referrer','community_builder'];
    if (!allowed.includes(type)) return res.status(400).json({ error: 'Invalid contributor type' });
    const { data: season, error: seasonError } = await supabase.from('pioneer_seasons')
      .select('id,name,slug,status,ends_at,snapshot_at,reward_pool_amount,reward_pool_currency')
      .in('status',['active','frozen','reviewing','completed']).order('starts_at',{ ascending:false }).limit(1).maybeSingle();
    if (seasonError) throw seasonError;
    if (!season) return res.json({ season: null, entries: [] });
    const { data, error } = await supabase.from('pioneer_scoreboard').select('*')
      .eq('season_id',season.id).eq('contributor_type',type)
      .order('verified_points',{ ascending:false }).limit(Math.min(Number(req.query.limit)||20,50));
    if (error) throw error;
    const userIds=(data||[]).filter(x=>x.beneficiary_type==='user').map(x=>x.beneficiary_id);
    const venueIds=(data||[]).filter(x=>x.beneficiary_type==='venue').map(x=>x.beneficiary_id);
    const [{data:users},{data:venues}]=await Promise.all([
      userIds.length?supabase.from('users').select('id,display_name,username,avatar_url').in('id',userIds):{data:[]},
      venueIds.length?supabase.from('venues').select('id,name,image_url,address').in('id',venueIds):{data:[]},
    ]);
    const identities=new Map([...(users||[]).map(x=>[x.id,{name:x.display_name||x.username,avatar_url:x.avatar_url}]),...(venues||[]).map(x=>[x.id,{name:x.name,avatar_url:x.image_url,location:x.address}])]);
    res.json({ season, entries:(data||[]).map((row,index)=>({...row,rank:index+1,identity:identities.get(row.beneficiary_id)||{name:'Pioneer'}})) });
  } catch(error) { res.status(500).json({ error:'Unable to load Pioneer leaderboard' }); }
});

router.get('/public/status/:beneficiaryType/:beneficiaryId', async (req,res) => {
  try {
    const beneficiaryType=req.params.beneficiaryType;
    if(!['user','venue'].includes(beneficiaryType)) return res.status(400).json({error:'Invalid beneficiary type'});
    const {data:season}=await supabase.from('pioneer_seasons').select('id,name,slug').in('status',['active','frozen','reviewing','completed']).order('starts_at',{ascending:false}).limit(1).maybeSingle();
    if(!season) return res.json({season:null,verified_points:0,roles:[]});
    const {data,error}=await supabase.from('pioneer_scoreboard').select('contributor_type,verified_points')
      .eq('season_id',season.id).eq('beneficiary_type',beneficiaryType).eq('beneficiary_id',req.params.beneficiaryId);
    if(error) throw error;
    res.json({season,verified_points:(data||[]).reduce((sum,row)=>sum+Number(row.verified_points||0),0),roles:data||[]});
  } catch(error){res.status(500).json({error:'Unable to load Pioneer status'});}
});

router.post('/public/analytics', async (req,res) => {
  try {
    if (!supabase) return res.status(202).json({ accepted:true });
    const allowed=['landing_view','role_selected','signup_started','signup_completed','first_receipt','first_verified'];
    if (!allowed.includes(req.body?.event_name)) return res.status(400).json({ error:'Invalid event' });
    const { error }=await supabase.from('pioneer_marketing_events').insert({
      anonymous_id:String(req.body.anonymous_id||'').slice(0,100)||null,
      event_name:req.body.event_name,role_path:req.body.role_path||null,source:req.body.source||null,
      metadata:req.body.metadata||{},
    });
    if(error) throw error;
    res.status(202).json({ accepted:true });
  } catch(error){ res.status(500).json({ error:'Unable to record event' }); }
});

router.use(requireAuth);

const demoDashboard = {
  season: { name: 'Genesis Season', slug: 'genesis-2026', status: 'active', ends_at: '2026-12-31T23:59:59Z', reward_pool_amount: null },
  totals: { verified_points: 1280, pending_points: 175, verified_actions: 24, percentile: 8 },
  roles: [
    { contributor_type: 'host', verified_points: 800, pending_points: 100 },
    { contributor_type: 'referrer', verified_points: 350, pending_points: 50 },
    { contributor_type: 'member', verified_points: 130, pending_points: 25 },
  ],
  recent: [],
};

router.get('/dashboard', async (req, res) => {
  try {
    if (!supabase) return res.json(demoDashboard);
    const { data: season, error: seasonError } = await supabase
      .from('pioneer_seasons').select('*').eq('status', 'active').maybeSingle();
    if (seasonError) throw seasonError;
    if (!season) return res.json({ season: null, totals: null, roles: [], recent: [] });

    const [{ data: roles, error: rolesError }, { data: recent, error: recentError }, { data: ownedVenues, error: venuesError }] = await Promise.all([
      supabase.from('pioneer_scoreboard').select('*')
        .eq('season_id', season.id).eq('beneficiary_type', 'user').eq('beneficiary_id', req.user.id),
      supabase.from('pioneer_point_events')
        .select('id,event_type,contributor_type,points,status,occurred_at,reason')
        .eq('season_id', season.id).eq('beneficiary_type', 'user').eq('beneficiary_id', req.user.id)
        .order('occurred_at', { ascending: false }).limit(20),
      supabase.from('venues').select('id,name,address,image_url').eq('owner_id', req.user.id),
    ]);
    if (rolesError) throw rolesError;
    if (recentError) throw recentError;
    if (venuesError) throw venuesError;

    const venueIds = (ownedVenues || []).map((venue) => venue.id);
    let venueEvents = [];
    if (venueIds.length) {
      const { data, error } = await supabase.from('pioneer_point_events')
        .select('id,beneficiary_id,event_type,points,status,occurred_at,reason')
        .eq('season_id', season.id).eq('beneficiary_type', 'venue').in('beneficiary_id', venueIds)
        .order('occurred_at', { ascending: false });
      if (error) throw error;
      venueEvents = data || [];
    }
    const venueMap = Object.fromEntries((ownedVenues || []).map((venue) => [venue.id, { ...venue, events: [] }]));
    for (const event of venueEvents) venueMap[event.beneficiary_id]?.events.push(event);

    const totals = (roles || []).reduce((sum, row) => ({
      verified_points: sum.verified_points + Number(row.verified_points || 0),
      pending_points: sum.pending_points + Number(row.pending_points || 0),
      verified_actions: sum.verified_actions + Number(row.verified_actions || 0),
    }), { verified_points: 0, pending_points: 0, verified_actions: 0 });

    const { data: allScores } = await supabase.from('pioneer_scoreboard')
      .select('beneficiary_id,verified_points').eq('season_id', season.id);
    const consolidated = new Map();
    for (const row of allScores || []) consolidated.set(row.beneficiary_id, (consolidated.get(row.beneficiary_id) || 0) + Number(row.verified_points || 0));
    const scores = [...consolidated.values()].sort((a,b) => b-a);
    const rank = Math.max(1, scores.findIndex(value => value <= totals.verified_points) + 1);

    const { data: notifications } = await supabase.from('pioneer_notifications').select('*')
      .eq('user_id',req.user.id).order('created_at',{ascending:false}).limit(10);
    res.json({
      season,
      totals: { ...totals, rank, participant_count: scores.length },
      roles: roles || [],
      recent: recent || [],
      venues: Object.values(venueMap),
      notifications: notifications || [],
    });
  } catch (error) {
    console.error('[Pioneer Points] dashboard:', error);
    res.status(500).json({ error: 'Unable to load Pioneer Points dashboard' });
  }
});

router.get('/notifications', async (req,res) => {
  try {
    const { data,error }=await supabase.from('pioneer_notifications').select('*')
      .eq('user_id',req.user.id).order('created_at',{ascending:false}).limit(50);
    if(error) throw error;
    res.json({ notifications:data||[] });
  } catch(error){ res.status(500).json({ error:'Unable to load Pioneer notifications' }); }
});

router.patch('/notifications/:id/read', async (req,res) => {
  try {
    const { data,error }=await supabase.from('pioneer_notifications').update({read_at:new Date().toISOString()})
      .eq('id',req.params.id).eq('user_id',req.user.id).select().single();
    if(error) throw error;
    res.json({ notification:data });
  } catch(error){ res.status(400).json({ error:'Unable to update notification' }); }
});

router.get('/leaderboard', async (req, res) => {
  try {
    if (!supabase) return res.json({ entries: [], season: demoDashboard.season });
    const { data: season } = await supabase.from('pioneer_seasons').select('*').eq('status', 'active').maybeSingle();
    if (!season) return res.json({ entries: [], season: null });
    const { data, error } = await supabase.from('pioneer_scoreboard').select('*')
      .eq('season_id', season.id).eq('contributor_type', req.query.type || 'member')
      .order('verified_points', { ascending: false }).limit(Math.min(Number(req.query.limit) || 25, 100));
    if (error) throw error;
    res.json({ season, entries: data || [] });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load Pioneer leaderboard' });
  }
});

module.exports = router;
