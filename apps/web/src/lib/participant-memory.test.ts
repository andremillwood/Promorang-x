import {describe,expect,it} from "vitest";
import {memoryArtwork,memoryProvenance} from "./participant-memory";
describe("retained participation facts",()=>{
 it("uses only the matching Moment or supplied memory artwork",()=>{
  const memory={id:"piece",moment_id:"one"};
  expect(memoryArtwork(memory,[{id:"two",image_url:"https://example.invalid/other.jpg"}])).toBeNull();
  expect(memoryArtwork(memory,[{id:"one",image_url:"https://example.invalid/actual.jpg"}])).toBe("https://example.invalid/actual.jpg");
  expect(memoryArtwork({...memory,metadata:{image_url:"javascript:alert(1)"}})).toBeNull();
  expect(memoryArtwork({...memory,metadata:{image_url:"//untrusted.invalid/image"}})).toBeNull();
 });
 it("does not infer attendance, verification or chronology from issuance",()=>{
  expect(memoryProvenance({id:"piece",issued_at:"2026-10-25"})).toEqual([{label:"Piece added to your Vault",at:"2026-10-25"}]);
  expect(memoryProvenance({id:"piece",issued_at:"bad-date",mission_attribution:{joined_at:"2026-10-15",verified_at:null}})).toEqual([{label:"You joined",at:"2026-10-15"}]);
 });
 it("preserves recorded source dates for each participation step",()=>{
  expect(memoryProvenance({id:"piece",issued_at:"2026-10-25",mission_attribution:{first_engaged_at:"2026-10-01",joined_at:"2026-10-15",verified_at:"2026-10-24"}}).map(x=>x.label)).toEqual(["You moved it","You joined","Participation verified","Piece added to your Vault"]);
 });
});
