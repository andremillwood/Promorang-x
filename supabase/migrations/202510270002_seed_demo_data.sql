-- Auto-heal missing foreign key dependencies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    INSERT INTO public.users (id, email, username, display_name, user_type)
    VALUES ('00000000-0000-0000-0000-000000000001', 'demo@promorang.com', 'demouser', 'Demo User', 'creator');
  END IF;
END $$;

-- 1️⃣ Demo User
insert into public.users (id, email, username, display_name, user_type)
values (
  '00000000-0000-0000-0000-000000000001',
  'demo@promorang.com',
  'demouser',
  'Demo User',
  'creator'
)
on conflict (id) do nothing;

-- 2️⃣ Demo Content
insert into public.content_items (
  id, creator_id, title, description, media_url, platform, status, posted_at,
  impressions, clicks, engagements, shares, conversions, engagement_rate
) values (
  '50000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Morning Productivity Stack',
  'Breaking down the tools that fuel my morning routine.',
  'https://cdn.promorang.com/content/morning-stack.mp4',
  'youtube', 'published', now() - interval '2 days',
  18250, 1240, 8600, 520, 180, 0.0472
),
(
  '50000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '30-Day Wellness Challenge Recap',
  'Highlights from the wellness challenge participants.',
  'https://cdn.promorang.com/content/wellness-recap.mp4',
  'tiktok', 'published', now() - interval '5 days',
  9800, 740, 5200, 315, 140, 0.0531
)
on conflict (id) do nothing;

do $$
begin
  if to_regclass('public.applications') is not null then
    insert into public.applications (id, creator_id, content_id, status)
    values (
      '60000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000001',
      '50000000-0000-0000-0000-000000000001',
      'approved'
    )
    on conflict (id) do nothing;
  end if;
end $$;

-- Legacy compatibility for older drop_applications table
do $$
begin
  if to_regclass('public.drop_applications') is not null then
    insert into public.drop_applications (
      id,
      drop_id,
      creator_id,
      status,
      submitted_at,
      approved_at
    )
    values (
      '60000000-0000-0000-0000-000000000001',
      null,
      '00000000-0000-0000-0000-000000000001',
      'approved',
      timezone('utc', now()),
      timezone('utc', now())
    )
    on conflict (id) do nothing;
  end if;
end $$;

-- 4️⃣ Demo Review
insert into public.content_reviews (id, application_id, reviewer_id, rating, feedback)
values (
  '70000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  5,
  'Excellent quality content with strong conversions.'
)
on conflict (id) do nothing;
