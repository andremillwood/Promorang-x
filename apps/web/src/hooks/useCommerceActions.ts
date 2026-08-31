import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/i18n/I18nContext';

export function useCommerceActions(){
  const {toast}=useToast();
  const {t}=useI18n();
  const [busy,setBusy]=useState<string|null>(null);
  const auth=async()=>{const token=(await supabase.auth.getSession()).data.session?.access_token;if(!token)throw new Error(t("commerce.signIn"));return {Authorization:`Bearer ${token}`,'Content-Type':'application/json'}};
  const purchase=async(productId:string,price:number,method:'cash'|'points'|'reservation'='reservation')=>{setBusy('purchase');try{const r=await fetch(`${API_BASE_URL}/merchant/sales`,{method:'POST',headers:await auth(),body:JSON.stringify({product_id:productId,sale_type:method,amount_paid:method==='cash'?price:0,points_paid:0,metadata:{source:'commerce_detail'}})});const d=await r.json();if(!r.ok)throw new Error(d.error||t("commerce.purchaseFail"));toast({title:t("commerce.receiptReady"),description:t("commerce.receiptCode",{code:d.redemption_code})});return d}catch(e:any){toast({title:t("commerce.couldNotComplete"),description:e.message,variant:'destructive'});throw e}finally{setBusy(null)}};
  const claim=async(couponId:string)=>{setBusy('claim');try{const r=await fetch(`${API_BASE_URL}/coupons/${couponId}/redeem`,{method:'POST',headers:await auth()});const d=await r.json();if(!r.ok)throw new Error(d.message||t("commerce.claimFailed"));toast({title:t("commerce.offerSaved"),description:d.data?.redemption?.redemption_code?t("commerce.receiptCode",{code:d.data.redemption.redemption_code}):t("commerce.readyRedeem")});return d}finally{setBusy(null)}};
  const toggleSave=async(object:{type:string;id:string;title:string;subtitle?:string;image?:string})=>{setBusy('save');try{const user=(await supabase.auth.getUser()).data.user;if(!user)throw new Error(t("commerce.signInSave"));const existing=await supabase.from('saved_objects').select('id').eq('user_id',user.id).eq('object_type',object.type).eq('object_id',object.id).maybeSingle();if(existing.data){await supabase.from('saved_objects').delete().eq('id',existing.data.id);toast({title:t("commerce.removed")});return false}const {error}=await supabase.from('saved_objects').insert({user_id:user.id,object_type:object.type,object_id:object.id,title:object.title,subtitle:object.subtitle||null,image_url:object.image||null,metadata:{}});if(error)throw error;toast({title:t("commerce.savedLater")});return true}finally{setBusy(null)}};
  return {purchase,claim,toggleSave,busy};
}
