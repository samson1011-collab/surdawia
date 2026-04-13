// ─── Auth ────────────────────────────────────────────────────────────────────

export type AppRole = 'admin' | 'super_admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: AppRole
  created_at: string
}

// ─── Donations ───────────────────────────────────────────────────────────────

export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type DonationFrequency = 'one_time' | 'monthly' | 'quarterly' | 'annually'

export interface Donation {
  id: string
  donor_name: string
  donor_email: string
  amount_cents: number
  currency: string
  frequency: DonationFrequency
  status: DonationStatus
  stripe_payment_intent_id: string | null
  message: string | null
  is_anonymous: boolean
  created_at: string
}

// ─── Media ───────────────────────────────────────────────────────────────────

export type MediaType = 'image' | 'video'
export type MediaCategory = 'relief_work' | 'timeline' | 'gratitude' | 'general'

export interface MediaItem {
  id: string
  title: string
  description: string | null
  type: MediaType
  category: MediaCategory
  url: string
  thumbnail_url: string | null
  // For gratitude videos — links to a specific donor
  dedicated_to_donor_id: string | null
  dedicated_to_name: string | null
  location: string | null
  captured_at: string | null
  is_published: boolean
  sort_order: number
  created_at: string
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export interface TimelineEntry {
  id: string
  title: string
  description: string
  date: string
  location: string | null
  media_ids: string[]  // references MediaItem ids
  impact_metric: string | null  // e.g. "Fed 200 families"
  is_published: boolean
  created_at: string
}

// ─── Store ───────────────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'draft' | 'sold_out' | 'archived'

export interface ProductVariant {
  type: string           // e.g. "Size", "Color"
  value: string          // e.g. "M", "Red"
  stock_quantity: number | null
}

export interface Product {
  id: string
  name: string
  description: string
  price_cents: number
  currency: string
  images: string[]
  category: string | null
  stock_quantity: number | null   // used only for products with no variants
  variants: ProductVariant[]
  stripe_product_id: string | null
  stripe_price_id: string | null
  status: ProductStatus
  sort_order: number
  created_at: string
}

export interface Order {
  id: string
  donor_name: string
  donor_email: string
  items: OrderItem[]
  total_cents: number
  status: DonationStatus
  stripe_payment_intent_id: string | null
  shipping_address: ShippingAddress | null
  created_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price_cents: number
}

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

// ─── CMS / Website Content ───────────────────────────────────────────────────

export interface SiteContent {
  id: string
  key: string            // e.g. 'hero_headline', 'about_body', 'mission_statement'
  value: string
  content_type: 'text' | 'html' | 'markdown'
  last_updated_by: string | null
  updated_at: string
}

// ─── Gratitude ───────────────────────────────────────────────────────────────

export interface GratitudeVideo {
  id: string
  video_url: string
  thumbnail_url: string | null
  title: string
  message: string | null
  from_location: string | null
  dedicated_to_donor_id: string | null
  dedicated_to_name: string | null    // shown publicly
  is_published: boolean
  created_at: string
}
