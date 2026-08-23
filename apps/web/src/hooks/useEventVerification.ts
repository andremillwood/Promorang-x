import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EventVerificationMission = { id:string; mission_type:string; title:string; instructions:string; proof_requirements:string[]; reward_points:number; status:string; event_title:string; proposed_start:string|null; proposed_venue:string|null; city:string|null; source_url:string|null };

export function useEventVerificationMissions() {
  return useQuery({ queryKey:["event-verification-missions"], queryFn:async()=>{const {data,error}=await (supabase as any).from("view_public_event_verification_missions").select("*").order("reward_points",{ascending:false});if(error)throw error;return(data||[]) as EventVerificationMission[];} });
}
export function useClaimEventVerification() {
  const client=useQueryClient();
  return useMutation({mutationFn:async(id:string)=>{const {data,error}=await (supabase as any).rpc("claim_event_verification",{p_mission_id:id});if(error)throw error;return data as string;},onSuccess:()=>client.invalidateQueries({queryKey:["event-verification-missions"]})});
}
