-- ─────────────────────────────────────────────────────────────────────────────
-- Relief Org — Initial Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Roles ────────────────────────────────────────────────────────────────────
CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin');

-- ── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        public.app_role NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$func$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Donations ─────────────────────────────────────────────────────────────────
CREATE TYPE public.donation_status    AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.donation_frequency AS ENUM ('one_time', 'monthly', 'quarterly', 'annually');

CREATE TABLE public.donations (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name                TEXT NOT NULL,
  donor_email               TEXT NOT NULL,
  amount_cents              INTEGER NOT NULL,
  currency                  TEXT NOT NULL DEFAULT 'usd',
  frequency                 public.donation_frequency NOT NULL DEFAULT 'one_time',
  status                    public.donation_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id  TEXT,
  message                   TEXT,
  is_anonymous              BOOLEAN NOT NULL DEFAULT false,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Media ─────────────────────────────────────────────────────────────────────
CREATE TYPE public.media_type     AS ENUM ('image', 'video');
CREATE TYPE public.media_category AS ENUM ('relief_work', 'timeline', 'gratitude', 'general');

CREATE TABLE public.media_items (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   TEXT NOT NULL,
  description             TEXT,
  type                    public.media_type NOT NULL,
  category                public.media_category NOT NULL DEFAULT 'general',
  url                     TEXT NOT NULL,
  thumbnail_url           TEXT,
  dedicated_to_donor_id   UUID REFERENCES public.donations(id) ON DELETE SET NULL,
  dedicated_to_name       TEXT,
  location                TEXT,
  captured_at             TIMESTAMPTZ,
  is_published            BOOLEAN NOT NULL DEFAULT false,
  sort_order              INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Timeline ──────────────────────────────────────────────────────────────────
CREATE TABLE public.timeline_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  date            DATE NOT NULL,
  location        TEXT,
  media_ids       UUID[] NOT NULL DEFAULT '{}',
  impact_metric   TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Gratitude Videos ──────────────────────────────────────────────────────────
CREATE TABLE public.gratitude_videos (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url               TEXT NOT NULL,
  thumbnail_url           TEXT,
  title                   TEXT NOT NULL,
  message                 TEXT,
  from_location           TEXT,
  dedicated_to_donor_id   UUID REFERENCES public.donations(id) ON DELETE SET NULL,
  dedicated_to_name       TEXT,
  is_published            BOOLEAN NOT NULL DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Store ─────────────────────────────────────────────────────────────────────
CREATE TYPE public.product_status AS ENUM ('active', 'draft', 'sold_out', 'archived');

CREATE TABLE public.products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT NOT NULL,
  price_cents       INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'usd',
  images            TEXT[] NOT NULL DEFAULT '{}',
  category          TEXT,
  stock_quantity    INTEGER,
  stripe_product_id TEXT,
  stripe_price_id   TEXT,
  status            public.product_status NOT NULL DEFAULT 'draft',
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name                TEXT NOT NULL,
  donor_email               TEXT NOT NULL,
  items                     JSONB NOT NULL DEFAULT '[]',
  total_cents               INTEGER NOT NULL,
  status                    public.donation_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id  TEXT,
  shipping_address          JSONB,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CMS Content ───────────────────────────────────────────────────────────────
CREATE TYPE public.content_type AS ENUM ('text', 'html', 'markdown');

CREATE TABLE public.site_content (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key                 TEXT NOT NULL UNIQUE,
  value               TEXT NOT NULL DEFAULT '',
  content_type        public.content_type NOT NULL DEFAULT 'text',
  last_updated_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed CMS with default keys
INSERT INTO public.site_content (key, value, content_type) VALUES
  ('hero_headline',      'Bringing Hope to Those Who Need It Most', 'text'),
  ('hero_subheadline',   'Every donation goes directly to families on the ground.',  'text'),
  ('about_body',         'We are a relief organization committed to transparency and impact.', 'text'),
  ('mission_statement',  'No overhead. No delay. Just impact.',  'text');

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS Policies
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_videos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content      ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own, admins see all
CREATE POLICY "profiles_own"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_admin" ON public.profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));

-- Public reads for published content
CREATE POLICY "media_public_read"     ON public.media_items      FOR SELECT USING (is_published = true);
CREATE POLICY "timeline_public_read"  ON public.timeline_entries FOR SELECT USING (is_published = true);
CREATE POLICY "gratitude_public_read" ON public.gratitude_videos FOR SELECT USING (is_published = true);
CREATE POLICY "products_public_read"  ON public.products         FOR SELECT USING (status = 'active');
CREATE POLICY "site_content_public"   ON public.site_content     FOR SELECT USING (true);

-- Donations: anyone can insert (donors), admins can read all
CREATE POLICY "donations_insert" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_insert"    ON public.orders    FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "admin_all_media"     ON public.media_items      FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));
CREATE POLICY "admin_all_timeline"  ON public.timeline_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));
CREATE POLICY "admin_all_gratitude" ON public.gratitude_videos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));
CREATE POLICY "admin_all_products"  ON public.products         FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));
CREATE POLICY "admin_all_orders"    ON public.orders           FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));
CREATE POLICY "admin_all_donations" ON public.donations        FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));
CREATE POLICY "admin_cms"           ON public.site_content     FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));
