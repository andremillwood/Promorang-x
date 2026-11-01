import {describe,expect,it} from "vitest";
import {BRAND_IMAGE_CATEGORIES,brandImageVariants,brandImageIndex,brandPlaceholder,pickBrandImageCategory,usableArtwork} from "./brand-imagery";
describe("Promorang illustrative artwork",()=>{
 it.each([
  ["Workshops & Learning","Photography workshop","creator"],["Sports & Fitness","Training session","wellness"],["Music & Parties","Sunrise yoga","nightlife"],["Wellness","An evening party","wellness"],
  [undefined,"Late-night Korean food","dining"],[undefined,"Coffee with friends","coffee"],
  [undefined,"GTRs in Cedar Valley","automotive"],[undefined,"Weekend hiking trips","outdoors"],
  [undefined,"Pottery workshop","arts"],[undefined,"Local boutique offers","shopping"],
  [undefined,"Podcast recording session","creator"],[undefined,"Kingston After Dark","nightlife"],
  [undefined,"Bring more outdoor house music to Kingston","nightlife"],
  [undefined,"Night hiking in the Blue Mountains","outdoors"],
 ])("selects relevant artwork for %s / %s",(category,title,expected)=>expect(pickBrandImageCategory({category,title})).toBe(expected));
 it("does not confuse a Card with a car",()=>expect(pickBrandImageCategory({title:"Your PromoCard"})).toBe("community"));
 it("uses conservative object-type defaults when the category is unknown",()=>{
  expect(pickBrandImageCategory({kind:"offer",title:"Member benefit"})).toBe("shopping");
  expect(pickBrandImageCategory({kind:"drop"})).toBe("creator");
  expect(pickBrandImageCategory({kind:"moment"})).toBe("community");
 });
 it("ships distinct, local, responsive assets for every supported category",()=>{
  const images=BRAND_IMAGE_CATEGORIES.map(category=>brandPlaceholder({category}));
  expect(new Set(images.map(image=>image.src)).size).toBe(10);
  for(const image of images){expect(image.src).toMatch(/\.webp/);expect(image.srcSet).toContain("512w");expect(image.srcSet).toContain("1024w");}
 });
 it("provides at least ten unique responsive scenes in every category",()=>{
  for(const category of BRAND_IMAGE_CATEGORIES){
   const variants=brandImageVariants(category);
   expect(variants).toHaveLength(10);
   expect(new Set(variants.map(image=>image.src)).size).toBe(10);
   for(const image of variants){expect(image.src).toBeTruthy();expect(image.srcSet).not.toContain("undefined");}
  }
 });
 it("distributes new record IDs across every variation while remaining stable across placements",()=>{
  const variants=new Set<number>();
  for(let i=0;i<500;i++){
   const selectionKey=`future-event-${i}`;
   const card=brandPlaceholder({category:"nightlife",selectionKey,title:"Card title"});
   const detail=brandPlaceholder({category:"nightlife",selectionKey,title:"Changed detail title",kind:"moment"});
   expect(detail.src).toBe(card.src);variants.add(card.variation);
  }
  expect(variants.size).toBe(10);
  expect(brandImageIndex("same-record")).toBe(brandImageIndex("same-record"));
 });
 it("keeps valid uploaded sources and rejects non-image protocols and missing-value strings",()=>{
  expect(usableArtwork("https://example.invalid/photo.jpg")).toBe("https://example.invalid/photo.jpg");
  expect(usableArtwork("/uploads/actual.webp")).toBe("/uploads/actual.webp");
  expect(usableArtwork("javascript:alert(1)")).toBeNull();expect(usableArtwork("undefined")).toBeNull();expect(usableArtwork(" ")).toBeNull();
 });
});
