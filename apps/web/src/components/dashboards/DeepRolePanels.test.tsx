import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreatorEarningsTab } from "./host/CreatorEarningsTab";
import HostImpactYieldConsole from "@/components/host/HostImpactYieldConsole";
import BrandIntelligenceConsole from "@/components/brand/BrandIntelligenceConsole";
import CreatorReputationDeck from "@/components/creator/CreatorReputationDeck";
import { HostSponsorshipRequests } from "@/components/host/SponsorshipRequests";
const state = vi.hoisted(() => ({ error:false, data:undefined as any, retry:vi.fn(), mutate:vi.fn() }));
const query = () => ({data:state.data,isLoading:false,isFetching:false,isError:state.error,error:state.error?new Error('unavailable'):null,refetch:state.retry});
vi.mock("@/hooks/useCreatorEconomics",()=>({useCreatorEconomicProfile:()=>query(),useCreatorEarningsSummary:()=>query(),useEarningsBySource:()=>query(),useRecentEarnings:()=>query()}));
vi.mock("@/hooks/useMoments",()=>({useHostedMoments:()=>query()}));
vi.mock("@/hooks/useRoleSuccessProgress",()=>({useRoleSuccessProgress:()=>query()}));
vi.mock("@/hooks/useCampaigns",()=>({useBrandCampaigns:()=>query()}));
vi.mock("@/hooks/useSponsorships",()=>({useHostSponsorshipRequests:()=>query(),useRespondToSponsorship:()=>({mutate:state.mutate})}));
vi.mock("@/i18n/I18nContext",()=>({useI18n:()=>({t:(key:string)=>key})}));
beforeEach(()=>{state.error=false;state.data=undefined;state.retry.mockClear();state.mutate.mockClear();});
describe('deeper role recovery',()=>{
 for(const [label,Component] of [['earnings',CreatorEarningsTab],['standing',CreatorReputationDeck],['sponsorships',HostSponsorshipRequests]] as const){
  it(`${label} distinguishes a failed request from an empty account and can retry`,()=>{
   state.error=true;render(<MemoryRouter><Component /></MemoryRouter>);
   const alert=screen.getByRole('alert');
   expect(alert).toHaveTextContent(/could not be loaded/i);
   expect(screen.queryByText(/No.*yet/)).not.toBeInTheDocument();
   fireEvent.click(within(alert).getByRole('button',{name:'Try again'}));
   expect(state.retry).toHaveBeenCalled();
  });
 }
 it('does not assign a starter tier when no economic profile exists',()=>{
  render(<CreatorEarningsTab />);
  expect(screen.queryByText(/configured share/)).not.toBeInTheDocument();
  expect(screen.getByText('No creator value events yet.')).toBeInTheDocument();
 });
 for(const [label,Component] of [['host',HostImpactYieldConsole],['brand',BrandIntelligenceConsole]] as const){
  it(`${label} results show unavailable values instead of zeros after a failure`,()=>{
   state.error=true;render(<Component />);
   expect(screen.getAllByRole('definition')).toHaveLength(3);
   for(const value of screen.getAllByRole('definition'))expect(value).toHaveTextContent('—');
   fireEvent.click(screen.getByRole('button',{name:'Try again'}));
   expect(state.retry).toHaveBeenCalled();
  });
 }
 it('shows brand redemption totals from campaign records',()=>{
  state.data=[{is_active:true,redemptions:7},{is_active:false,redemptions:3}];render(<BrandIntelligenceConsole />);
  expect(screen.getAllByRole('definition').map(e=>e.textContent)).toEqual(['2','1','10']);
 });
 it('labels acceptance honestly and retains the message until saving succeeds',()=>{
  state.data=[{id:'request',brand_id:'brand-12345678',moment_id:'moment-12345678',bid_amount:1000,status:'pending',created_at:'2026-10-20T12:00:00Z'}];
  render(<HostSponsorshipRequests />);
  expect(screen.queryByRole('button',{name:'Negotiate'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Accept with message'}));
  const dialog=screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByRole('textbox',{name:'Message to sponsor'}),{target:{value:'Thanks for supporting the event.'}});
  fireEvent.click(within(dialog).getByRole('button',{name:'Accept with message'}));
  expect(state.mutate).toHaveBeenCalledWith({requestId:'request',status:'accepted',response:'Thanks for supporting the event.'},expect.objectContaining({onSuccess:expect.any(Function)}));
  expect(within(dialog).getByRole('textbox')).toHaveValue('Thanks for supporting the event.');
 });

});
