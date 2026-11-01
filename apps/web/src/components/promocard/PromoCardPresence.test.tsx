import {render,screen,fireEvent} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {describe,it,expect,vi,beforeEach} from "vitest";
import {PromoCardActivity,PromoCardNavCount,PromoCardBenefitSignal} from "./PromoCardPresence";
const {auth,query}=vi.hoisted(()=>({auth:{user:{id:"u"} as {id:string}|null},query:{data:undefined as Record<string,unknown>|undefined,isLoading:false,isError:false,refetch:vi.fn()}}));
vi.mock("@/contexts/AuthContext",()=>({useAuth:()=>auth}));
vi.mock("@/hooks/usePeopleExperience",()=>({useMyPromoCard:()=>query}));
const ready={id:"b",title:"Next coffee",fulfillmentState:"claimed",fulfillmentType:"code",redemptionCode:"PRIVATE-CODE"};
const wrap=(node:React.ReactNode)=>render(<MemoryRouter>{node}</MemoryRouter>);
beforeEach(()=>{auth.user={id:"u"};query.data=undefined;query.isLoading=false;query.isError=false;query.refetch.mockClear()});
describe("PromoCard presence",()=>{
 it("shows real access with a direct route and no exposed credential",()=>{query.data={perks:[ready],benefits:[ready]};wrap(<><PromoCardActivity/><PromoCardNavCount/></>);expect(screen.getByText("1 benefit ready to use")).toBeInTheDocument();expect(screen.getByRole("link",{name:"Open my access"})).toHaveAttribute("href","/card#use-this");expect(screen.getByLabelText("1 PromoCard benefit ready to use")).toBeInTheDocument();expect(screen.queryByText("PRIVATE-CODE")).toBeNull();});
 it("gives first-time members an honest next step",()=>{query.data={perks:[]};wrap(<PromoCardActivity/>);expect(screen.getByRole("link",{name:"Find an offer"})).toHaveAttribute("href","/discover?tab=perks");expect(screen.queryByText(/ready to use/)).toBeNull();});
 it("does not show private presence to guests",()=>{auth.user=null;const {container}=wrap(<><PromoCardActivity/><PromoCardNavCount/></>);expect(container.textContent).toBe("");});
 it("offers recovery instead of inventing empty access after a failure",()=>{query.isError=true;wrap(<PromoCardActivity/>);fireEvent.click(screen.getByRole("button",{name:"Try again"}));expect(query.refetch).toHaveBeenCalledOnce();expect(screen.queryByRole("link",{name:"Find an offer"})).toBeNull();});
 it("marks stale access and suppresses stale navigation counts",()=>{query.data={perks:[ready]};query.isError=true;wrap(<><PromoCardActivity/><PromoCardNavCount/></>);expect(screen.getByRole("status")).toHaveTextContent("Last loaded details");expect(screen.queryByLabelText("1 PromoCard benefit ready to use")).toBeNull();});
 it("makes used benefits visibly different from claimable inventory",()=>{wrap(<PromoCardBenefitSignal perk={{...ready,redemption:{recorded:true}}}/>);expect(screen.getByText("Used with PromoCard")).toHaveAttribute("data-access-state","used");});
});
