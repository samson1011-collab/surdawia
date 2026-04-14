-- ─────────────────────────────────────────────────────────────────────────────
-- Add camp and youtube_video_id columns to media_items
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE public.media_camp AS ENUM ('south_gaza', 'north_gaza', 'refugees', 'general');

ALTER TABLE public.media_items
  ADD COLUMN IF NOT EXISTS camp             public.media_camp NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
