import { useI18n } from "@/i18n/I18nContext";
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
  const { t } = useI18n();
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
  const purchase=async(productId:string,price:number,method:'cash'|'points'|'reservation'='reservation')=>{setBusy('purchase');try{const r=await fetch(`${API_BASE_URL}/merchant/sales`,{method:'POST',headers:await auth({kind:'commerce_purchase',targetId:productId}),body:JSON.stringify({product_id:productId,sale_type:method,amount_paid:method==='cash'?price:0,points_paid:0,metadata:{source:'commerce_detail'}})});const d=await r.json();if(!r.ok)throw new Error(d.error||t("web.purchaseFailed"));clearResumableIntent({kind:'commerce_purchase',targetId:productId});toast({title:t("web.receiptReady"),description:t("web.redemptionCode", { code: d.redemption_code })});return d}catch(e:any){if(e?.message===AUTH_REDIRECT)return undefined;toast({title:t("web.couldNotComplete"),description:t("web.tryAgain"),variant:'destructive'});throw e}finally{setBusy(null)}};
  const claim=async(offerId:string, system:'coupon'|'unified'='coupon')=>{setBusy('claim');try{const endpoint=system==='unified'?`${API_BASE_URL}/offers/${offerId}/claim`:`${API_BASE_URL}/coupons/${offerId}/redeem`;const r=await fetch(endpoint,{method:'POST',headers:await auth({kind:'offer_claim',targetId:offerId})});const d=await r.json();if(!r.ok)throw new Error(d.message||d.error||t("web.claimFailed"));clearResumableIntent({kind:'offer_claim',targetId:offerId});const redemptionCode=d.data?.redemption?.redemption_code||d.data?.redemption_code;toast({title:t("web.offerSavedCard"),description:redemptionCode?t("web.redemptionCode", { code: redemptionCode }):t("web.readyWhenTermsMet")});return d}catch(e:any){if(e?.message===AUTH_REDIRECT)return undefined;throw e}finally{setBusy(null)}};
  const toggleSave=async(object:{type:string;id:string;title:string;subtitle?:string;image?:string})=>{setBusy('save');try{const user=(await supabase.auth.getUser()).data.user;if(!user){const returnTo=currentReturnPath();rememberResumableIntent({kind:'commerce_save',returnPath:returnTo,targetId:object.id});if(typeof window!=='undefined')window.location.assign(authPathForReturn(returnTo,{mode:'login',role:'participant'}));throw new Error(AUTH_REDIRECT);}const existing=await supabase.from('saved_objects').select('id').eq('user_id',user.id).eq('object_type',object.type).eq('object_id',object.id).maybeSingle();if(existing.data){await supabase.from('saved_objects').delete().eq('id',existing.data.id);clearResumableIntent({kind:'commerce_save',targetId:object.id});toast({title:t("web.removedSaved")});return false}const {error}=await supabase.from('saved_objects').insert({user_id:user.id,object_type:object.type,object_id:object.id,title:object.title,subtitle:object.subtitle||null,image_url:object.image||null,metadata:{}});if(error)throw error;clearResumableIntent({kind:'commerce_save',targetId:object.id});toast({title:t("web.savedLater")});return true}catch(e:any){if(e?.message===AUTH_REDIRECT)return undefined;throw e}finally{setBusy(null)}};
  return {purchase,claim,toggleSave,busy};
}
