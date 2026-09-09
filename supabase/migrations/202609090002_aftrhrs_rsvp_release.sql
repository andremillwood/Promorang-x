-- Raise AftrHrs digital RSVP allocation to 30 without publishing the raw count.
-- Public surfaces show a remaining percentage, not the allocation.

ALTER TABLE public.event_editions
  ALTER COLUMN digital_allocation SET DEFAULT 30;

UPDATE public.event_editions
SET
  digital_allocation = 30,
  faqs = '[
    {"question":"How many Digital Free Passes are available?","answer":"This edition has a limited digital release. Remaining access is shown as a percentage. Inventory is enforced on the server, not the page reading."},
    {"question":"What time must I arrive to get in free?","answer":"RSVP and Digital Free Pass holders must arrive before 11:30 PM to get in free."},
    {"question":"What happens when the Digital Free Passes are claimed?","answer":"The claim button is replaced with the ambassador pathway. The night stays open: physical invitations and paid entry remain available."},
    {"question":"How do I obtain a physical invitation?","answer":"Connect with an approved AftrHrs Ambassador. They distribute the remaining free invitations in person."},
    {"question":"Does a physical invitation guarantee entry?","answer":"A valid invitation or RSVP covers admission, subject to Sea Deck capacity, entry policies, and successful verification at the door."},
    {"question":"What is the cost without an invitation or RSVP?","answer":"Entry without an invitation or RSVP is JMD $2,000."},
    {"question":"What does the paid admission include?","answer":"Paid patrons receive complimentary drink and wings."},
    {"question":"Where is Sea Deck?","answer":"Orchid Village, 20 Barbican Road, Kingston."},
    {"question":"How will my Digital Free Pass be verified?","answer":"Present the unique QR code from your Promorang pass at Sea Deck. Staff scan it once. A redeemed pass cannot be scanned again."},
    {"question":"Can I transfer my pass?","answer":"Digital Free Passes are issued one per authenticated person. Transfers require an administrator and are not available from the public page."},
    {"question":"What happens if the venue reaches capacity?","answer":"Admission remains subject to venue capacity and Sea Deck entry policies even with a valid pass or invitation."}
  ]'::jsonb,
  updated_at = now()
WHERE slug = 'aftrhrs'
  AND digital_allocation < 30;
