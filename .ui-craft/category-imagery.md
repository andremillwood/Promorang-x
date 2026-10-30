# Branded category imagery

Generated with the built-in image generation tool. Ten original category photographs, with responsive 1024px and 512px WebP delivery variants, approximately 1.3 MB combined. Assets: `apps/web/src/assets/placeholders/{category}.webp` and `{category}-small.webp`.

## Art direction and prompt set

Shared direction: Create ONE standalone premium editorial photographic category background for Promorang, a Jamaican and Caribbean city discovery platform. Landscape 3:2, no text, logos, watermarks or collage. Authentic contemporary Caribbean atmosphere, tactile realism, natural skin and materials, beautiful candid composition, warm amber/burnt-orange practical highlights balanced with rich charcoal shadows and natural colors, subtle film grain. Emotion: belonging, curiosity and a reason to go out. Main subject in upper-middle/right, bottom quarter naturally quieter and darker for white UI copy; center crop must remain meaningful on portrait cards. Generic illustrative category art, no identifiable named venue, no brand claims, no exaggerated stock-photo posing.

Category scene directions used with the shared art direction:

| Category / filename | Scene |
| --- | --- |
| nightlife | Caribbean DJ at a warm open-air evening gathering, palms and deep blue night, candid adult crowd. |
| dining | Jerk chicken, plantain and slaw, richly textured food still life with warm practical light. |
| coffee | Ceramic coffee cups in a welcoming Caribbean courtyard café. |
| wellness | Woman doing seated yoga beside a tranquil tropical river at sunrise. |
| outdoors | Three hikers on a lush mountain ridge, expansive natural landscape. |
| automotive | Unbranded dark coupe at sunset, atmospheric Caribbean road setting. |
| arts | Artist working clay in a tactile pottery studio, hands and ceramics. |
| shopping | Contemporary boutique still life with bags, jewelry and a candle. |
| community | Friends gathering on a Caribbean rooftop, warmth and belonging. |
| creator | Contemporary podcast/interview studio, intimate creative atmosphere. |

## Selection and honesty

Explicit category wins; title and description supply a contextual fallback, then content kind provides a conservative default. Music takes precedence over incidental outdoor wording. A retained Piece uses its source Moment category where available. Actual uploaded photos always win; failed uploads recover to category art. Illustrations are labelled “Illustrative image”, with empty image alt text so they do not claim to depict an actual event. Failed fallback files stop retrying and show “Image unavailable”. No generated avatars, altered inventory, fabricated participation or reward entitlements.

Shared component: `apps/web/src/components/media/BrandImage.tsx`. Selection rules: `apps/web/src/lib/brand-imagery.ts`. The parent supplies the reserved media frame; intrinsic image dimensions and responsive sources prevent unnecessary layout shifts and oversized downloads.

## Verification

54 tests passed across 10 affected suites. Browser fixture checks cover gallery widths 360/390/768/1440 and mobile/desktop home, discovery, Wants, Vault, public market, Moment, scene, Piece, offer and benefit-drop detail. Verified real-upload priority, broken-upload recovery, category matching, readable labels, no broken images, no page overflow and no browser errors. Authenticated surfaces were tested with local fixtures, without making real claims or reservations. Final production build passed. Changed-file lint comparison found no introduced findings (46 existing findings).

## Original generated sources

- nightlife: `/Users/bumblebeecreative/.codex/generated_images/01a13fc2-dbbf-7102-bbbd-1000872b8cd7/exec-c55602aa-a6c1-446d-9a9e-c0d8d8ad54a3.png`
- dining: `/Users/bumblebeecreative/.codex/generated_images/01a13fc2-dbbf-7102-bbbd-1000872b8cd7/exec-cd69c143-3c60-4ee8-8547-fc1b21d9bf21.png`
- coffee: `/Users/bumblebeecreative/.codex/generated_images/01a13fc2-dbbf-7102-bbbd-1000872b8cd7/exec-fea7ddb3-c495-47db-9e54-379465a4686a.png`
- wellness: `/Users/bumblebeecreative/.codex/generated_images/01a13fc2-dbbf-7102-bbbd-1000872b8cd7/exec-efaad3de-6ffb-4265-b5a8-be6783b42bcd.png`
- outdoors: `/Users/bumblebeecreative/.codex/generated_images/01a13fc2-dbbf-7102-bbbd-1000872b8cd7/exec-bb3b3a10-31ea-488f-ae74-d1f5188a0470.png`
- automotive: `/Users/bumblebeecreative/.codex/generated_images/01a13fc2-dbbf-7102-bbbd-1000872b8cd7/exec-8c6e2e76-efe6-41d9-a192-e21acb0bed15.png`
- arts: `/Users/bumblebeecreative/.codex/generated_images/01a13fc2-dbbf-7102-bbbd-1000872b8cd7/exec-17fbe441-440c-4443-8f76-e1f1ece11cf1.png`
- shopping: `/Users/bumblebeecreative/.codex/generated_images/01a13fc2-dbbf-7102-bbbd-1000872b8cd7/exec-6dfe6724-f7aa-47e8-90a5-ec156e7b6143.png`
- community: `/Users/bumblebeecreative/.codex/generated_images/01a13fc2-dbbf-7102-bbbd-1000872b8cd7/exec-e3cf4944-419d-4f52-8168-8e7485b4eccd.png`
- creator: `/Users/bumblebeecreative/.codex/generated_images/01a13fc2-dbbf-7102-bbbd-1000872b8cd7/exec-334ffba5-a413-41d8-8b72-1173614fcc24.png`
