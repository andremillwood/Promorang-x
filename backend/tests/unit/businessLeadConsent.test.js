const request=require('supertest');const express=require('express');
jest.mock('../../middleware/auth',()=>({optionalAuth:(req,res,next)=>next(),requireAuth:(req,res,next)=>next(),requireAdmin:(req,res,next)=>next()}));
jest.mock('../../lib/supabase',()=>({supabase:{from:jest.fn()}}));
jest.mock('../../services/resendService',()=>({sendEmail:jest.fn()}));
const {supabase}=require('../../lib/supabase');const {sendEmail}=require('../../services/resendService');
const app=express();app.use(express.json());app.use(require('../../api/leads'));
beforeEach(()=>jest.clearAllMocks());
test('does not capture an anonymous business brief without explicit contact consent',async()=>{
 const result=await request(app).post('/capture').send({email:'test@example.test',funnelKey:'business',answers:{outcomeId:'visits'},result:{}});
 expect(result.status).toBe(400);expect(supabase.from).not.toHaveBeenCalled();expect(sendEmail).not.toHaveBeenCalled();
});
test('captures only selected qualification context and does not subscribe or email the contact',async()=>{
 let captured;const activities=[];
 const builder={select:jest.fn().mockReturnThis(),eq:jest.fn().mockReturnThis(),maybeSingle:jest.fn().mockResolvedValue({data:null}),
 insert:jest.fn(payload=>{captured=payload;return {select:()=>({single:async()=>({data:{id:'lead',...payload}})})};})};
 supabase.from.mockImplementation(table=>table==='crm_leads'?builder:{insert:async payload=>{activities.push(payload);return {error:null};}});
 const result=await request(app).post('/capture').send({email:'test@example.test',funnelKey:'business',contactConsent:true,marketingConsent:true,answers:{outcomeId:'visits',businessType:'place',successAction:'visits',programmeId:'route',audience:'private free text'},result:{score:100}});
 expect(result.status).toBe(201);expect(captured.lifecycle_stage).toBe('qualified');expect(captured.answers).not.toHaveProperty('audience');expect(captured.marketing_consent).toBe(false);expect(sendEmail).not.toHaveBeenCalled();expect(activities.map(a=>a.activity_type)).toEqual(['captured','note']);
});
