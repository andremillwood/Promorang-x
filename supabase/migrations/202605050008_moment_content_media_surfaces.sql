-- First-class media surfaces for moments and content missions.
-- Separates card thumbnails, wide banners, and supporting gallery imagery.

ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS banner_image_url text,
  ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS media_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.moments
SET
  gallery_images = COALESCE(gallery_images, '[]'::jsonb),
  media_metadata = COALESCE(media_metadata, '{}'::jsonb)
WHERE gallery_images IS NULL
   OR media_metadata IS NULL;

ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS banner_image_url text,
  ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS media_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.content_items
SET
  thumbnail_url = COALESCE(thumbnail_url, media_url),
  gallery_images = COALESCE(gallery_images, '[]'::jsonb),
  media_metadata = COALESCE(media_metadata, '{}'::jsonb)
WHERE thumbnail_url IS NULL
   OR gallery_images IS NULL
   OR media_metadata IS NULL;

COMMENT ON COLUMN public.moments.image_url IS 'Primary card/display image for moment cards and compact previews.';
COMMENT ON COLUMN public.moments.banner_image_url IS 'Wide hero/banner image for moment detail pages and featured placements.';
COMMENT ON COLUMN public.moments.gallery_images IS 'Ordered supporting imagery for App Store-style event galleries. Expected item shape: {url, alt, caption, media_type}.';
COMMENT ON COLUMN public.content_items.thumbnail_url IS 'Primary content card thumbnail.';
COMMENT ON COLUMN public.content_items.banner_image_url IS 'Wide hero/banner image for content mission detail and featured placements.';
COMMENT ON COLUMN public.content_items.gallery_images IS 'Ordered supporting content screenshots/stills. Expected item shape: {url, alt, caption, media_type}.';

NOTIFY pgrst, 'reload schema';
