import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import {afterEach,describe,expect,it,vi} from "vitest";
import {ParticipantShare} from "./ParticipantShare";
afterEach(()=>vi.restoreAllMocks());
describe("participant sharing",()=>{
 it("copies the exact content destination when native sharing is unavailable",async()=>{
  const writeText=vi.fn().mockResolvedValue(undefined);Object.defineProperty(navigator,"share",{configurable:true,value:undefined});Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText}});
  render(<ParticipantShare title="Music night" href="/moments/music"/>);fireEvent.click(screen.getByRole("button",{name:"Share Music night"}));await waitFor(()=>expect(writeText).toHaveBeenCalledWith(new URL("/moments/music",window.location.origin).href));expect(await screen.findByRole("status")).toHaveTextContent("Link copied");
 });
 it("exposes a selectable link if clipboard access fails",async()=>{
  Object.defineProperty(navigator,"share",{configurable:true,value:undefined});Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:vi.fn().mockRejectedValue(new Error("denied"))}});
  render(<ParticipantShare title="Music night" href="/moments/music"/>);fireEvent.click(screen.getByRole("button",{name:"Share Music night"}));expect(await screen.findByRole("textbox",{name:"Link to Music night"})).toHaveValue(new URL("/moments/music",window.location.origin).href);expect(screen.queryByRole("status")).not.toBeInTheDocument();
 });
});
