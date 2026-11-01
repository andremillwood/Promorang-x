import {render,screen,fireEvent} from "@testing-library/react";
import {MemoryRouter,Routes,Route} from "react-router-dom";
import {describe,it,expect,vi,beforeEach} from "vitest";
import OfferDetail from "./OfferDetail";
const {state,claim}=vi.hoisted(()=>({state:{owned:true,used:false,expired:false},claim:vi.fn()}));
vi.mock("@/i18n/I18nContext",()=>({useI18n:()=>({t:(key:string)=>key,locale:"en"})}));
vi.mock("@tanstack/react-query",()=>({useQuery:({queryKey}:{queryKey:string[]})=>queryKey[0]==="offer"?{data:{id:"offer-1",title:"Coffee",description:"Real offer terms",system:"unified",status:"active",quantity_total:20,end_date:state.expired?"2020-01-01":null},isLoading:false,isError:false}:{data:null}}));
vi.mock("@/hooks/usePeopleExperience",()=>({useMyPromoCard:()=>({data:{perks:state.owned?[{id:"claim-1",offerId:"offer-1",title:"Coffee",fulfillmentState:state.used?"redeemed":"claimed",fulfillmentType:"code",redemptionCode:"PRIVATE",redemption:{recorded:state.used}}]:[]}})}));
vi.mock("@/hooks/useCommerceActions",()=>({useCommerceActions:()=>({busy:false,claim})}));
vi.mock("@/components/SEO",()=>({default:()=>null}));
vi.mock("@/components/marketing/MarketingPhysics",()=>({CurrentArc:()=>null}));
vi.mock("@/components/media/BrandImage",()=>({BrandImage:()=>null}));
function view(){return render(<MemoryRouter initialEntries={["/offers/offer-1"]}><Routes><Route path="/offers/:id" element={<OfferDetail/>}/></Routes></MemoryRouter>)}
beforeEach(()=>{state.owned=true;state.used=false;state.expired=false;claim.mockClear()});
describe("offer PromoCard continuity",()=>{
 it("routes owned access to Card and removes every duplicate claim CTA",()=>{view();expect(screen.getByRole("link",{name:"Open my access"})).toHaveAttribute("href","/card#use-this");expect(screen.queryAllByRole("button",{name:/claim/i})).toHaveLength(0);expect(screen.getByText("Already part of your world.")).toBeInTheDocument();expect(screen.queryByText("PRIVATE")).toBeNull();});
 it("keeps recorded use out of the claim flow",()=>{state.used=true;view();expect(screen.getByText("Used with PromoCard")).toBeInTheDocument();expect(screen.queryAllByRole("button",{name:/claim/i})).toHaveLength(0);});
 it("preserves the claim action for unowned available offers",()=>{state.owned=false;view();fireEvent.click(screen.getByRole("button",{name:"Claim to PromoCard"}));expect(claim).toHaveBeenCalledWith("offer-1","unified");});
 it("does not enable expired inventory",()=>{state.owned=false;state.expired=true;view();expect(screen.getByRole("button",{name:"Ended"})).toBeDisabled();expect(screen.queryByRole("button",{name:"Claim Offer"})).toBeNull();});
});
