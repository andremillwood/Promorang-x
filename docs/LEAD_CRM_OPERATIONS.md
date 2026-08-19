# Lead CRM operations

Promorang's lead CRM preserves the strategic context collected by the five public diagnostics and connects it to follow-up, proposals, revenue, and eventual platform outcomes.

## Where it lives

Admins open `/admin?tab=leads` or choose **Leads & CRM** in the Admin Dashboard.

## Capture lifecycle

`diagnostic completed → report requested → lead captured → qualified → contacted → discovery → proposal → won/lost → measured outcome`

- The public browser posts to `POST /api/leads/capture`.
- Email plus funnel is the deduplication key. A repeat assessment updates the lead and adds timeline activity.
- The report email is operational and may be delivered without marketing consent because the visitor explicitly requested it.
- Ongoing promotional communication requires `marketing_consent = true`.
- Answers and personal data are available only through authenticated admin endpoints. The tables have RLS enabled and no client policies.

## Qualification

The initial qualification score combines the diagnostic score with stakeholder purchase intent, organization/phone completeness, campaign attribution, and marketing consent. It is a prioritization aid, not a claim about a person's worth or eligibility.

Business-facing funnels receive stronger commercial-intent weight than the participant Scene quiz. Admins should still read the diagnostic result before contacting a lead.

## Admin workflow

1. Start with overdue follow-ups and qualified leads.
2. Open a lead card to read the result, answers, attribution, and consent.
3. Set the next lifecycle stage, follow-up time, and estimated value.
4. Add context as notes and create an explicit next-action task.
5. Record realized revenue only after an authoritative payment or signed commercial outcome.
6. Mark leads `nurture` when timing is wrong but permission and fit remain; use `lost` when the opportunity is closed.

## Production deployment

1. Apply `supabase/migrations/202608130001_lead_crm.sql` to the intended Supabase environment.
2. Deploy the backend so `/api/leads` is mounted.
3. Deploy the web application.
4. Confirm `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `FRONTEND_URL`, and Resend email configuration in the backend environment.
5. Submit one test for each funnel and confirm capture, report email, admin visibility, consent, notes, tasks, and stage updates.

## External CRM integration

Promorang remains authoritative for diagnostic answers, stakeholder matching, consent, and platform outcomes. If HubSpot or another external CRM is connected later, synchronize contact/deal identifiers into Promorang and treat the external system as a sales-communication consumer rather than discarding the first-party assessment record.

