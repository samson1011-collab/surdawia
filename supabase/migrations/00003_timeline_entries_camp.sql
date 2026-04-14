-- ─────────────────────────────────────────────────────────────────────────────
-- Add camp and tag columns to timeline_entries so entries are CMS-manageable
-- per camp. Frontend falls back to hardcoded data when table is empty.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.timeline_entries
  ADD COLUMN IF NOT EXISTS camp public.media_camp NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS tag  TEXT;
