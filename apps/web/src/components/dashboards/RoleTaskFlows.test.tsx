import { fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MissionRail } from "@/components/missions/MissionRail";
import { QuickAddClient } from "@/components/agency/QuickAddClient";
import { OfferFulfillmentQueue } from "@/components/offers/OfferFulfillmentQueue";
const state=vi.hoisted(()=>({submit:vi.fn(),join:vi.fn(),connect:vi.fn(),refresh:vi.fn(),fulfill:vi.fn(),retry:vi.fn(),progressError:false,accountsError:false,shipping:[] as any[]}));
vi.mock("@/hooks/useContentMissions",()=>({useContentMissions:()=>({missions:{data:[{id:'mission',title:'Create a community story',action_text:'Publish a story',reward_value:'10 points',proof_type:'link',qualification_text:'Public original work',publish_destination:'Public post',archetype:'side_quest',due_at:null}]},progress:{data:[{mission_id:'mission',status:'joined'}],isError:state.progressError,refetch:state.retry},join:{mutateAsync:state.join},submit:{mutateAsync:state.submit,isPending:false}})}));
vi.mock("@/hooks/useAgencyClients",()=>({useAgencyRelationships:()=>({data:{availableClients:[]},isError:state.accountsError,refetch:state.retry}),useCreateAgencyRelationship:()=>({mutateAsync:state.connect,isPending:false})}));
vi.mock("@/contexts/AuthContext",()=>({useAuth:()=>({activeOrgId:'agency',refreshWorkspaceContext:state.refresh})}));
vi.mock("@/hooks/useOffers",()=>({usePendingFulfillments:()=>({data:state.shipping}),useFulfillOffer:()=>({mutateAsync:state.fulfill,isPending:false})}));
vi.mock("@/components/promorang/SignatureObjects",()=>({PaperReceipt:({heading}:{heading:string})=><h4>{heading}</h4>}));
vi.mock("@/hooks/use-toast",()=>({useToast:()=>({toast:vi.fn()})}));
vi.mock("sonner",()=>({toast:{success:vi.fn(),error:vi.fn()}}));
vi.mock("@/i18n/I18nContext",()=>({useI18n:()=>({t:(key:string)=>key})}));
function wrap(ui:React.ReactNode){return render(<MemoryRouter>{ui}</MemoryRouter>)}
beforeEach(()=>{vi.clearAllMocks();state.progressError=false;state.accountsError=false;state.shipping=[];state.refresh.mockResolvedValue(undefined);});
describe('role task recovery',()=>{
 it('keeps contribution fields after failure and confirms only after success',async()=>{
  state.submit.mockRejectedValueOnce(new Error('Proof could not be sent')).mockResolvedValue({});
  wrap(<MissionRail momentId="event" signedIn onSignIn={()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:'Submit contribution'}));
  const dialog=screen.getByRole('dialog'),input=within(dialog).getByLabelText('Public post link');
  fireEvent.change(input,{target:{value:'javascript:alert(1)'}});
  expect(within(dialog).getByRole('button',{name:'Send contribution for review'})).toBeDisabled();
  fireEvent.change(input,{target:{value:'https://example.com/story'}});
  fireEvent.change(within(dialog).getByLabelText(/Short note/),{target:{value:'My original work'}});
  fireEvent.click(within(dialog).getByRole('button',{name:'Send contribution for review'}));
  await screen.findByRole('alert');expect(input).toHaveValue('https://example.com/story');
  expect(within(dialog).getByLabelText(/Short note/)).toHaveValue('My original work');
  fireEvent.click(within(dialog).getByRole('button',{name:'Send contribution for review'}));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('status')).toHaveTextContent('awaiting review');
 });
 it('offers recovery for failed progress instead of joining blindly',()=>{
  state.progressError=true;wrap(<MissionRail momentId="event" signedIn onSignIn={()=>{}}/>);
  expect(screen.getByRole('alert')).toHaveTextContent('progress could not be loaded');
  fireEvent.click(screen.getByRole('button',{name:'Try again'}));expect(state.retry).toHaveBeenCalledOnce();
 });
 it('distinguishes failed account options from an empty search',()=>{
  state.accountsError=true;wrap(<QuickAddClient/>);fireEvent.click(screen.getByRole('button',{name:'Add client'}));
  expect(screen.getByRole('alert')).toHaveTextContent('Accounts could not be loaded');expect(screen.queryByText('No matches yet')).not.toBeInTheDocument();
 });
 it('preserves a client draft after failed save',async()=>{
  state.connect.mockRejectedValue(new Error('Connection not saved'));wrap(<QuickAddClient/>);
  fireEvent.click(screen.getByRole('button',{name:'Add client'}));fireEvent.click(screen.getByRole('button',{name:'Create managed account'}));
  fireEvent.change(screen.getByLabelText('Workspace name'),{target:{value:'Kingston studio'}});
  fireEvent.click(screen.getByRole('button',{name:'Save client connection'}));await screen.findByRole('alert');
  expect(screen.getByLabelText('Workspace name')).toHaveValue('Kingston studio');expect(screen.queryByLabelText('Why this connection matters')).not.toBeInTheDocument();
 });
 it('does not create twice when refreshing a saved relationship fails',async()=>{
  state.connect.mockResolvedValue({relationship:{id:'saved',status:'pending'}});state.refresh.mockRejectedValue(new Error('Refresh failed'));wrap(<QuickAddClient/>);
  fireEvent.click(screen.getByRole('button',{name:'Add client'}));fireEvent.click(screen.getByRole('button',{name:'Create managed account'}));
  fireEvent.change(screen.getByLabelText('Workspace name'),{target:{value:'Kingston studio'}});fireEvent.click(screen.getByRole('button',{name:'Save client connection'}));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());expect(state.connect).toHaveBeenCalledOnce();
 });
 it('retains tracking on failure and permits delivery after recording shipment',async()=>{
  state.shipping=[{id:'shipment',status:'fulfillment_pending',redemption_code:'PR-TEST',offers:{title:'Workshop pack',fulfillment_type:'shipping'},fulfillment_data:{shipping_stage:'ready_to_ship'}}];
  state.fulfill.mockRejectedValueOnce(new Error('Carrier unavailable')).mockResolvedValue({});wrap(<OfferFulfillmentQueue/>);
  fireEvent.change(screen.getByLabelText('Carrier'),{target:{value:'Jamaica Post'}});fireEvent.change(screen.getByLabelText('Tracking number (optional)'),{target:{value:'TRACK123'}});
  fireEvent.click(screen.getByRole('button',{name:'Mark shipped'}));await screen.findByRole('alert');expect(screen.getByLabelText('Tracking number (optional)')).toHaveValue('TRACK123');
  fireEvent.click(screen.getByRole('button',{name:'Mark shipped'}));await screen.findByRole('button',{name:'Mark delivered'});
  fireEvent.click(screen.getByRole('button',{name:'Mark delivered'}));await waitFor(()=>expect(screen.queryByRole('button',{name:'Mark delivered'})).not.toBeInTheDocument());
  expect(state.fulfill).toHaveBeenLastCalledWith({id:'shipment',action:'deliver',carrier:'Jamaica Post',tracking_number:'TRACK123'});
 });
});
