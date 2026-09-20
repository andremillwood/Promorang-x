# Business Outcome & Programme Convergence — Handoff

**Branch:** `andre/business-outcome-programme-v1`  
**Parent intent:** `andre/participation-market-v1` / PR #132 participation-market work  
**Deployment posture:** no Vercel deployment intentionally triggered

## Product decision

PROMORANG now supports three commercial entry modes:

1. **Outcome-led** — “Help me reach an outcome.”
2. **Intent-led** — “I know what I want to run.”
3. **Market-led** — “Show me what people want.”

All three converge on the existing PromoPilot / DemandPlan / canonical response and evidence systems.

No second campaign engine and no new canonical market family were introduced.

## Zero → Hero journey

```
BUSINESS NEED
→ OUTCOME
→ SUCCESS ACTION
→ CONTEXT
→ RECOMMENDED PROGRAMME
→ AUTH / WORKSPACE SETUP IF NEEDED
→ PROMOPILOT CONFIGURATION
→ SAVED CAMPAIGN / RESPONSE
→ DISTRIBUTION
→ PARTICIPANT ACTION
→ EVIDENCE
→ NEXT DECISION
→ RETURN
```

Signup and dashboard entry are not treated as the commercial success state.

## Outcome vocabulary v1

- Bring people in
- Get people to try it
- Launch something
- Move this
- Fill a quiet period
- Bring them back
- Find out what people want
- Build word of mouth

## Programme recipes v1

- First 50
- Fill the Room
- Try This
- Move This
- Quiet Hours
- Bring Them Back
- What Do They Want?
- Tell Somebody

A programme is a configurable commercial recipe, not a promise that the target will be reached.

## Main implementation

### New route

`/business/start`

Public, marketing-shell route containing the reusable Business Outcome Navigator.

### New shared product layer

- `apps/web/src/lib/business-outcomes.ts`
- `apps/web/src/components/business/BusinessOutcomeNavigator.tsx`
- `apps/web/src/components/business/BusinessOutcomeEntry.tsx`
- `apps/web/src/pages/BusinessStart.tsx`

### Marketing convergence

Updated:
- homepage business bridge
- `/solutions`
- `/for-brands`
- `/for-merchants`
- `/join`
- `/pricing`

The participant homepage remains PromoCard-first. The business journey branches from it rather than replacing it.

### Auth + onboarding continuity

A cold visitor may complete the outcome brief and see a recommendation before signup.

```
OUTCOME BRIEF
→ RECOMMENDATION
→ SAVE AND CONTINUE
→ AUTH
→ REQUIRED WORKSPACE SETUP
→ SAME OUTCOME BRIEF
```

The pre-auth brief uses versioned browser storage only as continuity state. It does not become market truth.

### PromoPilot handoff

`/create/campaign?from=business-outcome`

loads the saved structured brief, converts it into the existing planner input, and lets the operator edit the resulting PromoPilot.

When the campaign is explicitly saved, the originating business outcome brief is retained inside `compiler_metadata.business_outcome_brief`.

### Authenticated goal layer

Brand and Merchant workspaces now expose an outcome layer above the existing operating tools.

Power users still retain direct access to:
- campaigns
- Wants / market pulse
- offers / products
- validation
- orders
- places
- evidence / results

## Parent PromoCard reconciliation

While this branch was being built, `andre/participation-market-v1` advanced with **“feat: establish PromoCard as the participant product.”**

The new PromoCard direction was reconciled into this branch:
- latest PromoCard participant homepage retained,
- latest shared role/PromoCard marketing surfaces carried forward,
- outcome-led business bridge layered on top,
- Brand / Merchant / Join remain outcome-led while keeping PromoCard in the commercial story.

## Truth boundaries preserved

- programme ≠ guaranteed outcome
- target ≠ forecast
- Want ≠ supply
- response ≠ outcome
- claim ≠ use / visit / purchase
- RSVP ≠ attendance
- proof submission ≠ verification
- verified action ≠ ROI without supporting records
- browser draft ≠ canonical market truth

## Validation completed in this session

Source-level integration audit confirmed:
- `/business/start` is routed and uses the public marketing shell,
- outcome navigator exposes guided, direct-intent and market-led paths,
- cold market-led CTAs do not route to the protected operator inbox,
- Brand and Merchant active workspaces render the outcome layer,
- auth continuity persists the commercial return job,
- campaign planner receives the saved outcome brief,
- campaign metadata retains the brief on explicit save,
- homepage business bridge preserves the PromoCard-first participant positioning,
- accidental literal newline insertion in `App.tsx` was repaired.

No Vercel deployment was intentionally triggered.

### Validation limitation

This session could not clone the repository into a runnable local filesystem because outbound GitHub resolution was unavailable from the execution environment. Therefore a fresh `npm run build` / browser traversal was **not** independently executed here.

Run the local verification below before treating the slice as build-verified.

## Local verification checklist

1. `npm run build`
2. `npm run dev`
3. Open `http://localhost:8080/business/start`
4. Complete outcome → business type → success action → context → recommendation.
5. Check the three entry modes:
   - guided outcome route,
   - public Wants route,
   - direct campaign planner.
6. Logged out: choose **Save and continue**, sign up, complete required onboarding, and confirm return to the same recommendation.
7. Logged in: choose **Customize this programme** and confirm the business brief preloads the campaign planner.
8. Save an inactive plan and verify no publication, funding or reward is implied.
9. Check Brand and Merchant dashboards for the outcome layer above the existing operating tools.
10. Check mobile widths on `/solutions`, `/for-brands`, `/for-merchants`, `/join`, `/pricing`, and `/business/start`.

# Commerce convergence update

The original outcome/programme slice has now been extended so **Programme ≠ Campaign**.

## New execution layer

The guided flow is now:

```
Outcome
→ Business context
→ Success action
→ Context
→ Execution rail
→ Programme recommendation
→ Programme workspace
→ Authoritative supply / access / Moment / demand test
→ Distribution
→ Participant action
→ Transaction / validation / attendance
→ Fulfillment where applicable
→ Evidence
→ PromoCard
→ Return
```

Execution rails:
- Commerce
- Offer / access
- Moment / attendance
- Demand test
- Distribution / word of mouth
- Mixed

## Commerce authority

Merchant responsibility explicitly owns:
- price;
- stock / capacity;
- availability;
- accepted payment methods;
- confirmation of direct merchant payments;
- pickup / delivery / service fulfillment;
- refund / cancellation operations supported by commerce;
- customer commerce cases.

Brand, Creator, Host, Community and Agency can move or contextualize commerce without silently inheriting these seller duties.

## New product surfaces / components

- `apps/web/src/pages/BusinessProgramme.tsx`
- `apps/web/src/components/business/CommerceResponsibilityMap.tsx`
- `docs/design/business-outcome-commerce-convergence-v1.md`

## Real commerce handoffs

For a Merchant-owned commerce programme:
- Programme routes into the existing Merchant product creation flow.
- The real `merchant_products` ID is written back to the saved Business Outcome Brief.
- The user returns to `/business/programme?resume=1`.
- The programme then recognizes that authoritative supply is linked.

For an existing external merchant:
- the programme reads real active/public sellers from `view_public_commerce_directory`;
- the user must select a real commerce-ready Merchant;
- the user must then select an actual public product/service record;
- the linked source ID is retained in the outcome brief and supplied to the existing planner;
- the programme cannot proceed on a fabricated merchant or unnamed supply object.

If the user says their own organization is the seller, the product now requires the Merchant workspace before merchant supply writes. Brand mode alone is not treated as merchant authority.

## PromoCard commerce continuity

Commerce saving now writes a real `saved_objects` relationship using the public listing identity and canonical `/shop/:listingId` href.

PromoCard already reads saved product/offer relationships through `PromoCardWatchShelf`.

Copy was corrected from stale **Open now** language to:
- Saved product
- Saved offer

A saved product is not represented as currently available merely because the participant saved it.

## Stakeholder convergence

Commerce responsibility is now surfaced in:
- Brand workspace
- Merchant workspace
- Creator workspace
- Host workspace
- Agency workspace
- Business Solutions marketing
- Brand marketing
- Merchant marketing

Creator commerce is deliberately limited to attributable distribution unless an authoritative payout/settlement contract exists. No generic purchase commission was invented.

## Additional truth laws

- reserved ≠ paid
- paid ≠ fulfilled
- referral ≠ attributed purchase
- attributed purchase ≠ creator paid
- hosting commerce ≠ becoming seller
- Brand-funded demand ≠ merchant payment
- community relevance ≠ inventory
- agency coordination ≠ seller responsibility

## Local QA additions

In addition to the original checklist:

1. Open `/business/start`.
2. Choose **Move this** → **Recorded purchases**.
3. Confirm Commerce is suggested as the execution rail.
4. Choose **Product / SKU**.
5. Test each seller path:
   - existing PROMORANG merchant;
   - merchant to onboard;
   - my organization already operates as Merchant;
   - undecided.
6. For existing merchant:
   - choose a real merchant from live public commerce;
   - choose a real public product/service;
   - confirm the programme is blocked before both selections are made.
7. For Merchant workspace:
   - create a product from the programme;
   - confirm it returns to `/business/programme?resume=1`;
   - confirm **Supply record** becomes linked.
8. Open a real `/shop/:listingId`:
   - Save to PromoCard;
   - open `/card`;
   - confirm it appears under Watching with the correct public commerce route.
9. Check Brand, Merchant, Creator, Host and Agency workspaces for the commerce responsibility strip.
10. Confirm no stakeholder other than Merchant is implied to own price, inventory, payment or fulfillment merely by participating in the programme.
