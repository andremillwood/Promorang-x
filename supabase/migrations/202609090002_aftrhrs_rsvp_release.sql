-- Raise AftrHrs digital RSVP allocation to 30 without publishing the raw count.

ALTER TABLE public.event_editions
  ALTER COLUMN digital_allocation SET DEFAULT 30;

UPDATE public.event_editions
SET
  digital_allocation = 30,
  faqs = '[
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
WHERE slug = 'aftrhrs'
  AND digital_allocation < 30;
