-- 1. Table for Event Task Submissions
CREATE TABLE IF NOT EXISTS public.event_task_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.event_tasks(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    submission_url TEXT, -- Link to proof (image/story/post)
    proof_text TEXT,     -- Alternative text proof
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    feedback TEXT,       -- Optional feedback from organizer
    points_awarded INT DEFAULT 0,
    gems_awarded INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table for Event Media (UGC Gallery)
CREATE TABLE IF NOT EXISTS public.event_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image', -- image, video
    caption TEXT,
    is_approved BOOLEAN DEFAULT true, -- For potential moderation
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table for Event Updates (Organizer Announcements)
CREATE TABLE IF NOT EXISTS public.event_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Update event_rsvps for Check-ins
ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS check_in_code TEXT UNIQUE, -- Unique code for QR
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES public.users(id);

-- 5. Add Indices for performance
CREATE INDEX IF NOT EXISTS idx_event_task_submissions_task_id ON public.event_task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_event_task_submissions_user_id ON public.event_task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_event_media_event_id ON public.event_media(event_id);
CREATE INDEX IF NOT EXISTS idx_event_updates_event_id ON public.event_updates(event_id);
