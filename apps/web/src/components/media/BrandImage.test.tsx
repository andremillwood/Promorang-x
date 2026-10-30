import {fireEvent,render,screen} from "@testing-library/react";
import {describe,expect,it} from "vitest";
import {BrandImage} from "./BrandImage";
describe("BrandImage fallbacks",()=>{
 it("preserves uploaded artwork without a placeholder label",()=>{
  render(<div><BrandImage src="/actual.jpg" title="Yoga" alt="Actual event" /></div>);
  const img=screen.getByRole("img",{name:"Actual event"});expect(img).toHaveAttribute("src","/actual.jpg");expect(img).not.toHaveAttribute("srcset");expect(screen.queryByText("Illustrative image")).toBeNull();
 });
 it("uses the matching category when artwork is missing",()=>{
  const {container}=render(<div><BrandImage title="Coffee meetup" /></div>);
  expect(container.querySelector("img")).toHaveAttribute("data-image-category","coffee");expect(container.querySelector("img")).toHaveAttribute("data-image-source","illustrative");expect(screen.getByText("Illustrative image")).toBeInTheDocument();
 });
 it("recovers a broken uploaded image and clears the disclosure for a new working upload",()=>{
  const view=render(<div><BrandImage src="/broken.jpg" category="wellness" /></div>);
  fireEvent.error(view.container.querySelector("img")!);expect(view.container.querySelector("img")).toHaveAttribute("data-image-source","illustrative");expect(screen.getByText("Illustrative image")).toBeInTheDocument();
  view.rerender(<div><BrandImage src="/new-working.jpg" category="wellness" /></div>);expect(view.container.querySelector("img")).toHaveAttribute("src","/new-working.jpg");expect(screen.queryByText("Illustrative image")).toBeNull();
 });
 it("stops retrying and avoids a broken image icon if the local fallback also cannot load",()=>{
  const {container}=render(<div><BrandImage title="Coffee meetup" /></div>);fireEvent.error(container.querySelector("img")!);expect(container.querySelector("img")).toBeNull();expect(screen.getByText("Image unavailable")).toBeInTheDocument();
 });
});
