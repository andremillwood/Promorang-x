import {describe,expect,it,vi} from "vitest";
import {createClient} from "@supabase/supabase-js";
import {cityHubSearchPattern} from "./city-hubs";
describe("composite market read filters",()=>{
 it("matches records under the primary city while keeping compound place names",()=>{
  expect(cityHubSearchPattern("Kingston & St. Andrew")).toBe("%Kingston%");
  expect(cityHubSearchPattern("Port Antonio & Boston")).toBe("%Port Antonio%");
  expect(cityHubSearchPattern("Montego Bay")).toBe("%Montego Bay%");
  expect(cityHubSearchPattern("100%_City")).toBe("%100\\%\\_City%");
 });
 it("executes the SDK query with the composite city filter and returns source rows",async()=>{
  const transport=vi.fn().mockResolvedValue(new Response(JSON.stringify([{id:"source",city:"Kingston"}]),{headers:{"Content-Type":"application/json"}}));
  const db=createClient("https://fixture.example.invalid","public-fixture-only",{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:transport}});
  const {data,error}=await db.from("view_public_find_or_ask_discoveries").select("*").ilike("city",cityHubSearchPattern("Kingston & St. Andrew"));
  expect(error).toBeNull();expect(data).toEqual([{id:"source",city:"Kingston"}]);expect(new URL(String(transport.mock.calls[0][0])).searchParams.get("city")).toBe("ilike.%Kingston%");
 });
});
