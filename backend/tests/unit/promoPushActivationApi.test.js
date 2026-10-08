const express = require('express');
const request = require('supertest');
jest.mock('../../lib/supabase', () => ({ supabase: { rpc: jest.fn(), from: jest.fn() } }));
jest.mock('../../services/roleService', () => ({}));
jest.mock('../../middleware/auth', () => ({
 requireAuth: (req,res,next) => { if(!req.headers.authorization) return res.sendStatus(401); req.user={id:'owner',roles:req.headers['x-test-admin']?['admin']:['merchant']}; next(); },
 requirePlatformAdmin: (req,res,next) => req.user.roles.includes('admin') ? next() : res.sendStatus(403),
}));
const {supabase}=require('../../lib/supabase');
const app=express();app.use(express.json());app.use(require('../../api/promopush'));
beforeEach(()=>{jest.clearAllMocks();supabase.rpc.mockResolvedValue({data:{status:'active'},error:null});});
test('requires authentication and passes only verified actor to launch',async()=>{
 expect((await request(app).post('/campaigns/id/launch')).status).toBe(401);
 expect((await request(app).post('/campaigns/id/launch').set('Authorization','test')).status).toBe(200);
 expect(supabase.rpc).toHaveBeenCalledWith('launch_promopush_campaign',{p_campaign_id:'id',p_actor_user_id:'owner'});
});
test.each([{proposal_id:'stolen'},{pricing:{total_gems:1}},{p_actor_user_id:'another'}])('rejects launch overrides %j',async body=>{
 expect((await request(app).post('/campaigns/id/launch').set('Authorization','test').send(body)).status).toBe(400);
 expect(supabase.rpc).not.toHaveBeenCalled();
});
test('quote issuance rejects merchant privileges',async()=>{
 expect((await request(app).post('/admin/campaigns/id/quote').set('Authorization','test').send({total_gems:1})).status).toBe(403);
 expect(supabase.rpc).not.toHaveBeenCalled();
});
test('returns server funding rejection without claiming success',async()=>{
 supabase.rpc.mockResolvedValue({error:{message:'PromoPush funding is not secured'}});
 const result=await request(app).post('/campaigns/id/launch').set('Authorization','test');
 expect(result.status).toBe(409);expect(result.body.error).toMatch(/not secured/);
});
