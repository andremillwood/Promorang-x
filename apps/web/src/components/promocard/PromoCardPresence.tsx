import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { cardAccessState, summarizeCardAccess, type CardAccess } from "@/lib/promocard-presence";
import "./PromoCardPresence.css";

/** An open doorway with a spark: access in motion, without a card silhouette. */
export function PromoCardAccessMark({className=""}:{className?:string}) {
 return <svg viewBox="0 0 24 24" fill="none" className={`promocard-access-mark ${className}`} aria-hidden="true"><path d="M13 3H5v18h8M10 12h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="m18 2 .8 2.2L21 5l-2.2.8L18 8l-.8-2.2L15 5l2.2-.8L18 2Z" fill="currentColor"/></svg>;
}
const labels={ready:"Ready on PromoCard",saved:"On your PromoCard",pending:"PromoCard · awaiting fulfillment",used:"Used with PromoCard",expired:"PromoCard access expired",unavailable:"PromoCard access unavailable",available:"Claim to PromoCard"};
export function PromoCardBenefitSignal({perk}:{perk:CardAccess}) {
 const state=cardAccessState(perk);
 return <span className="promocard-benefit-signal" data-access-state={state}><PromoCardAccessMark/>{labels[state]}</span>;
}
export function PromoCardActivity({history=false}:{history?:boolean}) {
 const {user}=useAuth();
 const card=useMyPromoCard();
 if(!user)return null;
 const summary=summarizeCardAccess([...(card.data?.useThis ? [card.data.useThis] : []),...(card.data?.perks || []),...(card.data?.benefits || []),...(card.data?.used || [])]);
 if(card.isLoading && !card.data)return <div className="promocard-activity" role="status"><PromoCardAccessMark/><span>Checking your PromoCard access…</span></div>;
 if(card.isError && !card.data)return <div className="promocard-activity"><PromoCardAccessMark/><span>Your PromoCard access couldn’t load.</span><button type="button" onClick={()=>void card.refetch()}>Try again</button></div>;
 const next=summary.ready[0] || summary.saved[0];
 return <section className="promocard-activity" aria-label="PromoCard access" data-card-presence="activity">
  <PromoCardAccessMark/>
  <div className="promocard-activity-copy"><p>PromoCard · your access in motion</p><h2>{summary.ready.length ? `${summary.ready.length} ${summary.ready.length===1 ? "benefit" : "benefits"} ready to use` : summary.saved.length ? "Your access is on its way" : "Make your next outing go further"}</h2><p>{next ? next.title : "Claim an available offer. Keep it here for the moment you need it."}</p>{card.isError ? <p role="status">Last loaded details. Open your Card to refresh before using access.</p> : null}
  {history ? <ul className="promocard-access-ledger"><li><strong>{summary.ready.length}</strong>Ready to use</li><li><strong>{summary.saved.length}</strong>Saved / pending</li><li><strong>{summary.used.length}</strong>Used</li><li><strong>{summary.expired.length}</strong>Expired</li></ul> : summary.used.length ? <p className="promocard-use-history"><Check size={13} aria-hidden="true"/>{summary.used.length} {summary.used.length===1 ? "use" : "uses"} recorded</p> : null}
  </div>
  <Link to={next ? "/card#use-this" : "/discover?tab=perks"}>{next ? "Open my access" : "Find an offer"}<ArrowRight size={16} aria-hidden="true"/></Link>
 </section>;
}
export function PromoCardNavCount() {
 const {user}=useAuth(); const card=useMyPromoCard();
 if(!user || !card.data || card.isError)return null;
 const {ready}=summarizeCardAccess([...(card.data.useThis ? [card.data.useThis] : []),...(card.data.perks || []),...(card.data.benefits || [])]);
 return ready.length ? <span className="promocard-nav-count" aria-label={`${ready.length} PromoCard ${ready.length===1 ? "benefit" : "benefits"} ready to use`}>{ready.length}</span> : null;
}
export function PromoCardParticipationLink(){return <Link to="/card#use-this" className="promocard-participation-link"><PromoCardAccessMark/><span><strong>Participation recorded</strong><span>Check your PromoCard for issued access and its terms.</span></span><ArrowRight size={16} aria-hidden="true"/></Link>}
