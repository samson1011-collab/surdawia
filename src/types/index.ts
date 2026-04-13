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
  media_ids: string[]
  impact_metric: string | null
  is_published: boolean
  created_at: string
}

// ─── Store ───────────────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'draft' | 'sold_out' | 'archived'

export interface ProductImage {
  url: string
  label: string | null   // e.g. "Red colorway", "Front view"
}

export interface ProductVariant {
  type: string                        // e.g. "Size", "Color", "Material"
  value: string                       // e.g. "M", "Red", "Cotton"
  stock_quantity: number | null       // null = unlimited
  price_override_cents: number | null // e.g. +200 = base + $2; negative allowed
  sku: string | null
}

export interface Product {
  id: string
  name: string
  short_description: string           // 1-2 sentences shown on product card
  description: string                 // full description shown in product detail
  price_cents: number
  currency: string
  images: ProductImage[]
  category: string | null
  stock_quantity: number | null       // used only when variants is empty
  variants: ProductVariant[]
  weight_note: string | null          // admin-only shipping/weight notes
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
  variant_label: string | null
  quantity: number
  price_cents: number  // effective price at time of order
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
  key: string
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
  dedicated_to_name: string | null
  is_published: boolean
  created_at: string
}
