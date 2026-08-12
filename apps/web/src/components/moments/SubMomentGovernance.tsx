import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Plus, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";

type SubMoment = { id:string; title:string; description?:string|null; starts_at?:string|null; submoment_status?:string|null; venue_approval_required?:boolean; venue_approval_status?:string|null; submoment_review_note?:string|null };
async function request(path:string, init?:RequestInit) { const session=await supabase.auth.getSession(); const response=await fetch(`${API_BASE_URL}${path}`,{...init,headers:{"Content-Type":"application/json",...(session.data.session?.access_token?{Authorization:`Bearer ${session.data.session.access_token}`}:{})}}); const payload=await response.json(); if(!response.ok) throw new Error(payload.error||"Request failed"); return payload; }

export function SubMomentGovernance({ momentId, momentTitle, location }: { momentId:string; momentTitle:string; location?:string|null }) {
  const cache=useQueryClient();
  const query=useQuery({queryKey:["submoments",momentId],queryFn:()=>request(`/moment-economy/moments/${momentId}/submoments`)});
  const review=useMutation({mutationFn:({id,decision}:{id:string;decision:"approve"|"reject"})=>request(`/moment-economy/moments/${momentId}/submoments/${id}/review`,{method:"POST",body:JSON.stringify({decision})}),onSuccess:()=>cache.invalidateQueries({queryKey:["submoments",momentId]})});
  const items=(query.data?.data||[]) as SubMoment[];
  return <section className="rounded-[2rem] border border-border bg-card p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">Activity inside this Moment</p><h3 className="mt-2 text-2xl font-black">Sub-moments</h3><GuidanceDisclosure id="sub-moments:governance" eyebrow="Activity guide" title="How activity inside a Moment works" summary="Birthdays, workshops, and creative activities can keep their own owner and approval trail." className="mt-3 max-w-xl" tone="light"><p className="text-sm text-muted-foreground">Birthdays, workshops and creative activities retain their own owner and approval trail.</p></GuidanceDisclosure></div><Button asChild><Link to={`/create/moment?parentMomentId=${momentId}`}><Plus className="mr-2 h-4 w-4"/>Propose activity</Link></Button></div>
    {items.length?<div className="mt-5 divide-y divide-border rounded-2xl border border-border">{items.map(item=><div key={item.id} className="flex flex-wrap items-center gap-3 p-4"><Link to={`/moments/${item.id}`} className="min-w-0 flex-1"><p className="font-bold">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.submoment_status?.replace("_"," ")||"proposed"}{item.venue_approval_required?` · venue ${item.venue_approval_status||"pending"}`:""}</p></Link>{query.data?.permissions?.can_review&&item.submoment_status==="proposed"?<div className="flex gap-2"><Button size="sm" variant="outline" disabled={review.isPending} onClick={()=>review.mutate({id:item.id,decision:"reject"})}><X className="h-4 w-4"/></Button><Button size="sm" disabled={review.isPending} onClick={()=>review.mutate({id:item.id,decision:"approve"})}><Check className="mr-1 h-4 w-4"/>Approve</Button></div>:<ChevronRight className="h-4 w-4 text-muted-foreground"/>}</div>)}</div>:<p className="mt-5 text-sm text-muted-foreground">No activities have been proposed inside {momentTitle} yet.</p>}
  </section>;
}
