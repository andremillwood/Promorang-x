jest.mock('../../lib/supabase',()=>({supabase:{from:jest.fn()}}));
const growth=require('../../services/growthOperatingService');
const {supabase}=require('../../lib/supabase');
const names=['started','progress','completed','auth_started','auth_resumed','continued','lead_captured'];
beforeEach(()=>jest.clearAllMocks());
test.each(names)('navigator %s uses the accepted anonymous event vocabulary',async event=>{
 const upsert=jest.fn(()=>({select:()=>({maybeSingle:async()=>({data:{id:'event'},error:null})})}));
 supabase.from.mockReturnValue({upsert});
 const input={eventName:['started','progress','auth_resumed'].includes(event)?'page_view':'cta_clicked',journey:'commercial',stage:event==='continued'?'activated':'captured',anonymousId:'anon-fixture',entityType:'business_navigator',entityId:'attempt',properties:{step:'recommendation',navigator_event:event},idempotencyKey:`business:attempt:${event}:recommendation`};
 await expect(growth.recordEvent(input,{publicRequest:true})).resolves.toMatchObject({id:'event'});
 expect(upsert).toHaveBeenCalledWith(expect.objectContaining({event_name:input.eventName,properties:input.properties,idempotency_key:input.idempotencyKey}),{onConflict:'idempotency_key',ignoreDuplicates:true});
});
