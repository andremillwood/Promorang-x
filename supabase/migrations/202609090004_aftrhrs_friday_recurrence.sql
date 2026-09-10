-- AftrHrs is a weekly Friday series at Sea Deck. Keep claims open across nights.

UPDATE public.moments
SET
  recurrence_enabled = true,
  recurrence_frequency = 'weekly',
  recurrence_interval = 1,
  recurrence_by_weekday = ARRAY[5]::smallint[],
  recurrence_timezone = 'America/Jamaica',
  recurrence_until = NULL,
  recurrence_count = NULL,
  starts_at = COALESCE(starts_at, '2026-09-11 22:00:00-05'),
  updated_at = now()
WHERE id = '00000000-0000-0000-0002-000000000080'
   OR slug = 'aftrhrs';

UPDATE public.event_editions
SET
  claim_closes_at = NULL,
  claims_open = true,
  faqs = '[
    {"question":"When is AftrHrs?","answer":"Every Friday from 10:00 PM at Sea Deck."},
    {"question":"Are Digital Free Passes still available?","answer":"Digital Free Passes are limited and go quickly. Claim yours while they last."},
    {"question":"What time must I arrive to get in free?","answer":"RSVP and Digital Free Pass holders must arrive before 11:30 PM to get in free."},
    {"question":"What happens when the Digital Free Passes are claimed?","answer":"Find an AftrHrs Ambassador for a physical invitation. Paid entry stays open."},
    {"question":"How do I obtain a physical invitation?","answer":"Connect with an approved AftrHrs Ambassador. They distribute the remaining free invitations in person."},
    {"question":"Does a physical invitation guarantee entry?","answer":"A valid invitation or RSVP covers admission, subject to Sea Deck capacity, entry policies, and successful verification at the door."},
    {"question":"What is the cost without an invitation or RSVP?","answer":"Entry without an invitation or RSVP is JMD $2,000."},
    {"question":"What does the paid admission include?","answer":"Paid patrons receive complimentary drink and wings."},
    {"question":"Where is Sea Deck?","answer":"Orchid Village, 20 Barbican Road, Kingston."},
    {"question":"How will my Digital Free Pass be verified?","answer":"Present the unique QR code from your Promorang pass at Sea Deck. Staff scan it once. A redeemed pass cannot be scanned again."},
    {"question":"Can I transfer my pass?","answer":"Each Digital Free Pass is for one person and cannot be transferred."},
    {"question":"What happens if the venue reaches capacity?","answer":"Admission remains subject to venue capacity and Sea Deck entry policies even with a valid pass or invitation."}
  ]'::jsonb,
  updated_at = now()
WHERE slug = 'aftrhrs';
