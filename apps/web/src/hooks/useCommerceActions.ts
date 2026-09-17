import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { authPathForReturn } from '@/lib/post-auth-next';
import { clearResumableIntent, rememberResumableIntent, type ResumableIntentKind } from '@/lib/resumable-intent';

const AUTH_REDIRECT = 'PROMORANG_AUTH_REDIRECT';

function currentReturnPath(){
  if(typeof window==='undefined') return '/shop';
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function useCommerceActions(){
  const {toast}=useToast(); const [busy,setBusy]=useState<string|null>(null);
  const auth=async(intent:{kind:ResumableIntentKind;targetId:string})=>{
    const token=(await supabase.auth.getSession()).data.session?.access_token;
    if(!token){
      const returnTo=currentReturnPath();
      rememberResumableIntent({kind:intent.kind,returnPath:returnTo,targetId:intent.targetId});
      if(typeof window!=='undefined') window.location.assign(authPathForReturn(returnTo,{mode:'login',role:'participant'}));
      throw new Error(AUTH_REDIRECT);
    }
    return {Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
  };
  const purchase=async(productId:string,price:number,method:'cash'|'points'|'reservation'='reservation')=>{setBusy('purchase');try{const r=await fetch(`${API_BASE_URL}/merchant/sales`,{method:'POST',headers:await auth({kind:'commerce_purchase',targetId:productId}),body:JSON.stringify({product_id:productId,sale_type:method,amount_paid:method==='cash'?price:0,points_paid:0,metadata:{source:'commerce_detail'}})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Purchase failed');clearResumableIntent({kind:'commerce_purchase',targetId:productId});toast({title:'Your receipt is ready',description:`Code ${d.redemption_code}`});return d}catch(e:any){if(e?.message!==AUTH_REDIRECT)toast({title:'Could not complete',description:e.message,variant:'destructive'});throw e}finally{setBusy(null)}};
  const claim=async(couponId:string)=>{setBusy('claim');try{const r=await fetch(`${API_BASE_URL}/coupons/${couponId}/redeem`,{method:'POST',headers:await auth({kind:'offer_claim',targetId:couponId})});const d=await r.json();if(!r.ok)throw new Error(d.message||'Claim failed');clearResumableIntent({kind:'offer_claim',targetId:couponId});toast({title:'Offer saved to your wallet',description:d.data?.redemption?.redemption_code?`Code ${d.data.redemption.redemption_code}`:'Ready to redeem'});return d}finally{setBusy(null)}};
  const toggleSave=async(object:{type:string;id:string;title:string;subtitle?:string;image?:string})=>{setBusy('save');try{const user=(await supabase.auth.getUser()).data.user;if(!user){const returnTo=currentReturnPath();rememberResumableIntent({kind:'commerce_save',returnPath:returnTo,targetId:object.id});if(typeof window!=='undefined')window.location.assign(authPathForReturn(returnTo,{mode:'login',role:'participant'}));throw new Error(AUTH_REDIRECT);}const existing=await supabase.from('saved_objects').select('id').eq('user_id',user.id).eq('object_type',object.type).eq('object_id',object.id).maybeSingle();if(existing.data){await supabase.from('saved_objects').delete().eq('id',existing.data.id);clearResumableIntent({kind:'commerce_save',targetId:object.id});toast({title:'Removed from saved'});return false}const {error}=await supabase.from('saved_objects').insert({user_id:user.id,object_type:object.type,object_id:object.id,title:object.title,subtitle:object.subtitle||null,image_url:object.image||null,metadata:{}});if(error)throw error;clearResumableIntent({kind:'commerce_save',targetId:object.id});toast({title:'Saved for later'});return true}finally{setBusy(null)}};
  return {purchase,claim,toggleSave,busy};
}
