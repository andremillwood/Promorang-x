import { describe,expect,it } from "vitest"; import { resolveGuestRsvpJourney } from "../src";
describe("guest RSVP journey",()=>{it("keeps a confirmed pass shareable",()=>expect(resolveGuestRsvpJourney("confirmed")).toMatchObject({canInvite:true,passActive:true}));it("stops a cancelled pass",()=>expect(resolveGuestRsvpJourney("cancelled").passActive).toBe(false));});
