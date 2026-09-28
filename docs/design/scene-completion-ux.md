# Scene completion UX

Wants now keep a visible saved receipt with the submitted question and a direct link to that Want in its Scene. The Scene fetches the linked record if it is outside the eight most-supported Wants, constrained to the same Scene and demand kind. It focuses and scrolls to the contribution after loading.

Offers replace the publish form with a completion receipt and a direct link to the published Offer. Missing clipboard access no longer turns a successful publication into an error. Both receipts receive keyboard focus.

Scene demand, response, people, place, and Offer headings use the English, Latin American Spanish, and Brazilian Portuguese catalogs. Option counts no longer claim a majority, and zero-vote options do not show a leading preference. “Add your Want” preserves Scene context. Active followers can open Today from the bottom of the page.

## Validation

- Targeted component, query, and locale tests cover save success, save failure, exact contribution links, repeat-submit removal, missing clipboard access, scoped fetching, and no extra fetch on ordinary visits.
- Production web build passes. Dynamic SEO snapshots are skipped when the build environment cannot fetch the remote source; static snapshots are generated.
- Mobile Chrome checks exercise mocked save responses and return journeys at 320px and 390px in all three locales. No test content is published. The linked Want receives focus and enters the viewport; both journeys fit without horizontal overflow.
- A real read-only Scene request succeeds. No backend, schema, currency, or economic behavior changes.
