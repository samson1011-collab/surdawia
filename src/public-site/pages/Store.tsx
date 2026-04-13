import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, X, Plus, Minus, ArrowRight, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product, ProductImage, ProductVariant } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CartItem {
  product: Product
  quantity: number
  selectedVariants: Record<string, string>
  effectivePriceCents: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeImages(raw: unknown[]): ProductImage[] {
  return (raw ?? []).map(img =>
    typeof img === 'string' ? { url: img, label: null } : (img as ProductImage)
  )
}

function cartKey(productId: string, variants: Record<string, string>) {
  return `${productId}:${Object.entries(variants).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join(',')}`
}

function groupVariants(variants: ProductVariant[]): Record<string, ProductVariant[]> {
  return variants.reduce((acc, v) => {
    if (!acc[v.type]) acc[v.type] = []
    acc[v.type].push(v)
    return acc
  }, {} as Record<string, ProductVariant[]>)
}

function getEffectivePrice(product: Product, variants: Record<string, string>): number {
  let price = product.price_cents
  for (const [type, value] of Object.entries(variants)) {
    const v = product.variants?.find(pv => pv.type === type && pv.value === value)
    if (v?.price_override_cents) price += v.price_override_cents
  }
  return price
}

function getPriceRange(product: Product): { min: number; max: number } {
  if (!product.variants?.length) return { min: product.price_cents, max: product.price_cents }
  const overrides = product.variants.map(v => v.price_override_cents ?? 0)
  if (overrides.every(o => o === 0)) return { min: product.price_cents, max: product.price_cents }
  return {
    min: product.price_cents + Math.min(0, ...overrides),
    max: product.price_cents + Math.max(0, ...overrides),
  }
}

/** Returns minimum non-null stock across all selected variant options. */
function getVariantStock(product: Product, variants: Record<string, string>): number | null {
  if (!Object.keys(variants).length) return null
  let min: number | null = null
  for (const [type, value] of Object.entries(variants)) {
    const v = product.variants?.find(pv => pv.type === type && pv.value === value)
    if (!v) continue
    if (v.stock_quantity === 0) return 0
    if (v.stock_quantity !== null) {
      min = min === null ? v.stock_quantity : Math.min(min, v.stock_quantity)
    }
  }
  return min
}

// Maps common color names to CSS color values for swatch display.
const COLOR_MAP: Record<string, string> = {
  red: '#ce1126', rouge: '#ce1126', crimson: '#dc143c', scarlet: '#ff2400',
  green: '#007a3d', forest: '#007a3d', olive: '#6b7c35', sage: '#87a878', mint: '#6ee7b7',
  black: '#0a0a0a', ink: '#0a0a0a', charcoal: '#374151',
  white: '#ffffff', chalk: '#ffffff', ivory: '#fffff0', cream: '#f5f0e8',
  navy: '#1e3a5f', blue: '#1d4ed8', sky: '#0ea5e9', cobalt: '#0047ab',
  yellow: '#f59e0b', gold: '#d97706', mustard: '#ca8a04',
  pink: '#f472b6', rose: '#f43f5e', blush: '#fda4af',
  purple: '#7c3aed', violet: '#8b5cf6', lavender: '#a78bfa', plum: '#6b21a8',
  brown: '#78350f', tan: '#d2b48c', caramel: '#c08040', rust: '#b45309',
  gray: '#6b7280', grey: '#6b7280', silver: '#c0c0c0',
  orange: '#ea580c', coral: '#ff6b6b', peach: '#ffcba4',
  teal: '#0d9488', turquoise: '#40e0d0',
  beige: '#f5f0dc', taupe: '#b8a99a',
}

function colorToCss(name: string): string {
  return COLOR_MAP[name.toLowerCase().trim()] ?? '#9ca3af'
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

// ── Query ─────────────────────────────────────────────────────────────────────

function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('sort_order')
      if (error) throw error
      return (data as Product[]).map(p => ({
        ...p,
        images: normalizeImages(p.images as unknown[]),
        short_description: p.short_description ?? '',
        weight_note: p.weight_note ?? null,
        variants: (p.variants ?? []).map(v => ({
          ...v,
          price_override_cents: v.price_override_cents ?? null,
          sku: v.sku ?? null,
        })),
      })) as Product[]
    },
  })
}

// ── Stock indicator ───────────────────────────────────────────────────────────

function StockIndicator({ stock }: { stock: number | null }) {
  if (stock === 0) return <span className="font-sans text-xs font-medium text-rouge">Sold out</span>
  if (stock !== null && stock < 5) return <span className="font-sans text-xs font-medium text-rouge">Only {stock} left</span>
  return <span className="font-sans text-xs font-medium text-forest">In stock</span>
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Store() {
  const { data: products, isLoading } = useProducts()

  // Cart state
  const [cart, setCart]           = useState<CartItem[]>([])
  const [cartOpen, setCartOpen]   = useState(false)

  // Product detail modal state
  const [detailProduct, setDetailProduct]   = useState<Product | null>(null)
  const [detailVariants, setDetailVariants] = useState<Record<string, string>>({})
  const [detailQty, setDetailQty]           = useState(1)
  const [detailImageIdx, setDetailImageIdx] = useState(0)

  // ── Detail modal helpers ────────────────────────────────────────────────

  function openDetail(product: Product) {
    setDetailProduct(product)
    setDetailVariants({})
    setDetailQty(1)
    setDetailImageIdx(0)
  }

  function selectDetailVariant(type: string, value: string) {
    setDetailVariants(prev => ({ ...prev, [type]: value }))
    setDetailQty(1)
  }

  const detailVariantGroups   = detailProduct ? groupVariants(detailProduct.variants ?? []) : {}
  const allDetailTypesSelected = Object.keys(detailVariantGroups).every(t => !!detailVariants[t])
  const detailStock            = detailProduct ? getVariantStock(detailProduct, detailVariants) : null
  const detailEffectivePrice   = detailProduct ? getEffectivePrice(detailProduct, detailVariants) : 0
  const maxQty                 = detailStock === null ? 10 : Math.min(detailStock, 10)
  const isDetailSoldOut        = detailStock === 0 || detailProduct?.status === 'sold_out'
  const hasDetailVariants      = Object.keys(detailVariantGroups).length > 0
  const showStockIndicator     = !hasDetailVariants || allDetailTypesSelected
  const canAddToCart           = !isDetailSoldOut &&
    (!hasDetailVariants || allDetailTypesSelected) &&
    detailQty >= 1

  // ── Cart helpers ────────────────────────────────────────────────────────

  function addDetailToCart() {
    if (!detailProduct || !canAddToCart) return
    const effectivePriceCents = getEffectivePrice(detailProduct, detailVariants)
    const key = cartKey(detailProduct.id, detailVariants)
    setCart(prev => {
      const existing = prev.find(i => cartKey(i.product.id, i.selectedVariants) === key)
      if (existing) {
        return prev.map(i =>
          cartKey(i.product.id, i.selectedVariants) === key
            ? { ...i, quantity: i.quantity + detailQty }
            : i
        )
      }
      return [...prev, {
        product: detailProduct,
        quantity: detailQty,
        selectedVariants: { ...detailVariants },
        effectivePriceCents,
      }]
    })
    setDetailProduct(null)
    setCartOpen(true)
  }

  function updateQty(key: string, delta: number) {
    setCart(prev =>
      prev
        .map(i => cartKey(i.product.id, i.selectedVariants) === key ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    )
  }

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0)
  const totalCents = cart.reduce((sum, i) => sum + i.effectivePriceCents * i.quantity, 0)

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-chalk">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-ink text-chalk py-16 px-4 relative overflow-hidden">
        <div className="h-0.5 flex absolute top-0 inset-x-0">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/40" />
          <div className="flex-1 bg-forest" />
        </div>
        <div className="max-w-6xl mx-auto">
          <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-3">Shop</p>
          <h1 className="font-display text-5xl text-chalk mb-3">The Surdawia Store</h1>
          <p className="font-serif text-lg text-chalk/50 max-w-xl">
            100% of every purchase goes directly to relief work. No overhead. No cut. Just impact.
          </p>
        </div>
      </div>

      {/* ── Products grid ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-black/8 overflow-hidden animate-pulse">
                <div className="bg-black/5 h-56" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-black/5 rounded w-3/4" />
                  <div className="h-3 bg-black/5 rounded w-1/2" />
                  <div className="h-3 bg-black/5 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty / coming soon state */}
        {!isLoading && (!products || products.length === 0) && (
          <div className="text-center py-24">
            <Package size={40} className="mx-auto text-ink/20 mb-4" />
            <h2 className="font-display text-2xl text-ink mb-2">Store Coming Soon</h2>
            <p className="font-sans text-sm text-ink/40">Products will appear here once they're added by the team.</p>
          </div>
        )}

        {/* Product grid */}
        {!isLoading && products && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => {
              const priceRange    = getPriceRange(product)
              const hasVariants   = (product.variants?.length ?? 0) > 0
              const colorVariants = product.variants?.filter(v => v.type.toLowerCase() === 'color') ?? []
              const isSoldOut     = product.status === 'sold_out' || (!hasVariants && product.stock_quantity === 0)

              return (
                <div
                  key={product.id}
                  onClick={() => openDetail(product)}
                  className="bg-white rounded-2xl border border-black/8 overflow-hidden shadow-sm group flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                >
                  {/* Product image */}
                  <div className="relative bg-black/5 h-56 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={40} className="text-ink/20" />
                      </div>
                    )}

                    {/* Sold-out overlay */}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
                        <span className="font-sans text-sm text-chalk font-medium bg-ink px-3 py-1 rounded-full">Sold Out</span>
                      </div>
                    )}

                    {/* Color swatches on image */}
                    {colorVariants.length > 0 && (
                      <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
                        {colorVariants.slice(0, 6).map(v => (
                          <div
                            key={v.value}
                            title={v.value}
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: colorToCss(v.value) }}
                          />
                        ))}
                        {colorVariants.length > 6 && (
                          <span className="font-sans text-[10px] text-chalk bg-ink/50 rounded-full px-1.5 leading-4">+{colorVariants.length - 6}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card info */}
                  <div className="p-5 flex flex-col flex-1">
                    {product.category && (
                      <p className="font-sans text-xs text-rouge/70 uppercase tracking-widest mb-1">{product.category}</p>
                    )}
                    <h3 className="font-display text-lg text-ink mb-1">{product.name}</h3>
                    <p className="font-sans text-sm text-ink/50 leading-relaxed line-clamp-2 flex-1 mb-4">
                      {product.short_description || product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="font-display text-xl text-ink">
                        {priceRange.min === priceRange.max
                          ? formatPrice(priceRange.min)
                          : `From ${formatPrice(priceRange.min)}`
                        }
                      </p>
                      <span className="font-sans text-xs text-ink/30 group-hover:text-rouge transition-colors">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Product detail modal ─────────────────────────────────────────── */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDetailProduct(null)} />
          <div className="relative bg-chalk rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">

            {/* Close button */}
            <button
              onClick={() => setDetailProduct(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-chalk/90 hover:bg-chalk rounded-full flex items-center justify-center text-ink/50 hover:text-ink transition-colors shadow-sm"
            >
              <X size={15} />
            </button>

            {/* ── Image gallery (left) ── */}
            <div className="md:w-2/5 bg-black/5 flex flex-col shrink-0">
              {/* Main image */}
              <div className="relative flex-1 min-h-[260px] md:min-h-0">
                {detailProduct.images?.[detailImageIdx] ? (
                  <img
                    src={detailProduct.images[detailImageIdx].url}
                    alt={detailProduct.images[detailImageIdx].label ?? detailProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={48} className="text-ink/20" />
                  </div>
                )}

                {/* Prev/next arrows if multiple images */}
                {detailProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); setDetailImageIdx(i => Math.max(0, i - 1)) }}
                      disabled={detailImageIdx === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-chalk/80 hover:bg-chalk rounded-full flex items-center justify-center text-ink disabled:opacity-30 transition-colors shadow-sm"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setDetailImageIdx(i => Math.min(detailProduct.images.length - 1, i + 1)) }}
                      disabled={detailImageIdx === detailProduct.images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-chalk/80 hover:bg-chalk rounded-full flex items-center justify-center text-ink disabled:opacity-30 transition-colors shadow-sm"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </>
                )}

                {/* Image label overlay */}
                {detailProduct.images[detailImageIdx]?.label && (
                  <div className="absolute bottom-2 left-2 bg-ink/60 text-chalk font-sans text-xs px-2 py-0.5 rounded">
                    {detailProduct.images[detailImageIdx].label}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {detailProduct.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto border-t border-black/8">
                  {detailProduct.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={e => { e.stopPropagation(); setDetailImageIdx(i) }}
                      className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === detailImageIdx ? 'border-rouge' : 'border-transparent hover:border-black/20'}`}
                    >
                      <img src={img.url} alt={img.label ?? ''} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product info (right) ── */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="p-6 md:p-8 flex flex-col flex-1">

                {/* Category */}
                {detailProduct.category && (
                  <p className="font-sans text-xs text-rouge/70 uppercase tracking-widest mb-2">{detailProduct.category}</p>
                )}

                {/* Name */}
                <h2 className="font-display text-2xl md:text-3xl text-ink mb-2">{detailProduct.name}</h2>

                {/* Short description */}
                {detailProduct.short_description && (
                  <p className="font-serif text-base text-ink/60 italic mb-3">{detailProduct.short_description}</p>
                )}

                {/* Long description */}
                {detailProduct.description && (
                  <p className="font-sans text-sm text-ink/50 leading-relaxed mb-5">{detailProduct.description}</p>
                )}

                {/* Variant selectors */}
                {Object.entries(detailVariantGroups).length > 0 && (
                  <div className="space-y-4 mb-5">
                    {Object.entries(detailVariantGroups).map(([type, options]) => (
                      <div key={type}>
                        <p className="font-sans text-xs text-ink/40 uppercase tracking-widest mb-2">{type}</p>
                        <div className="flex flex-wrap gap-2">
                          {options.map(v => {
                            const outOfStock = v.stock_quantity === 0
                            const isSelected = detailVariants[type] === v.value
                            const priceLabel = v.price_override_cents
                              ? ` (${v.price_override_cents > 0 ? '+' : ''}${formatPrice(v.price_override_cents)})`
                              : ''
                            const isColor = type.toLowerCase() === 'color'

                            return (
                              <button
                                key={v.value}
                                disabled={outOfStock}
                                onClick={e => { e.stopPropagation(); selectDetailVariant(type, v.value) }}
                                title={isColor ? v.value : undefined}
                                className={`font-sans text-sm transition-colors ${
                                  isColor
                                    ? `w-8 h-8 rounded-full border-4 ${isSelected ? 'border-ink' : outOfStock ? 'border-transparent opacity-30 cursor-not-allowed' : 'border-transparent hover:border-black/30'}`
                                    : `px-3.5 py-1.5 rounded-lg border ${
                                        isSelected
                                          ? 'bg-ink text-chalk border-ink'
                                          : outOfStock
                                          ? 'border-black/8 text-ink/20 cursor-not-allowed line-through'
                                          : 'border-black/15 text-ink hover:border-ink'
                                      }`
                                }`}
                                style={isColor ? { backgroundColor: colorToCss(v.value) } : undefined}
                              >
                                {!isColor && (v.value + priceLabel)}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stock indicator */}
                {showStockIndicator && (
                  <div className="mb-4">
                    <StockIndicator stock={detailProduct.status === 'sold_out' ? 0 : detailStock} />
                  </div>
                )}

                {/* Price */}
                <p className="font-display text-2xl text-ink mb-6">
                  {hasDetailVariants && allDetailTypesSelected
                    ? formatPrice(detailEffectivePrice)
                    : (() => {
                        const r = getPriceRange(detailProduct)
                        return r.min === r.max ? formatPrice(r.min) : `From ${formatPrice(r.min)}`
                      })()
                  }
                </p>

                {/* Qty selector + Add to Cart */}
                <div className="flex items-center gap-3 mt-auto">
                  {/* Quantity */}
                  <div className="flex items-center border border-black/15 rounded-lg overflow-hidden shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); setDetailQty(q => Math.max(1, q - 1)) }}
                      disabled={detailQty <= 1}
                      className="px-3 py-2.5 text-ink/50 hover:text-ink disabled:opacity-20 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 font-sans text-sm text-ink font-medium min-w-[2.5rem] text-center">{detailQty}</span>
                    <button
                      onClick={e => { e.stopPropagation(); setDetailQty(q => Math.min(maxQty, q + 1)) }}
                      disabled={detailQty >= maxQty || isDetailSoldOut}
                      className="px-3 py-2.5 text-ink/50 hover:text-ink disabled:opacity-20 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={e => { e.stopPropagation(); addDetailToCart() }}
                    disabled={!canAddToCart}
                    className="flex-1 bg-rouge hover:bg-rouge-light disabled:opacity-40 disabled:cursor-not-allowed text-chalk font-sans font-medium text-sm py-2.5 rounded-lg transition-colors"
                  >
                    {isDetailSoldOut
                      ? 'Sold Out'
                      : hasDetailVariants && !allDetailTypesSelected
                      ? 'Select Options'
                      : 'Add to Cart'
                    }
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Floating cart button ─────────────────────────────────────────── */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 bg-rouge text-chalk rounded-full px-5 py-3 shadow-lg flex items-center gap-2 font-sans font-medium text-sm hover:bg-rouge-light transition-colors z-40"
        >
          <ShoppingCart size={18} />
          {totalItems} item{totalItems !== 1 ? 's' : ''} · {formatPrice(totalCents)}
        </button>
      )}

      {/* ── Cart drawer ──────────────────────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setCartOpen(false)} />
          <div className="relative bg-chalk w-full max-w-sm shadow-2xl flex flex-col h-full">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/8 shrink-0">
              <h2 className="font-display text-lg text-ink">Your Cart</h2>
              <button onClick={() => setCartOpen(false)} className="p-1 text-ink/40 hover:text-ink transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.length === 0 && (
                <p className="font-sans text-sm text-ink/40 text-center py-8">Your cart is empty.</p>
              )}
              {cart.map(item => {
                const key = cartKey(item.product.id, item.selectedVariants)
                const variantLabel = Object.entries(item.selectedVariants)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' · ')
                return (
                  <div key={key} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-black/5 overflow-hidden shrink-0">
                      {item.product.images?.[0]
                        ? <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-ink/20" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-ink font-medium truncate">{item.product.name}</p>
                      {variantLabel && (
                        <p className="font-sans text-xs text-ink/40 truncate">{variantLabel}</p>
                      )}
                      <p className="font-sans text-sm text-ink/50">{formatPrice(item.effectivePriceCents)}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={() => updateQty(key, -1)} className="w-6 h-6 rounded-full border border-black/15 flex items-center justify-center hover:border-rouge hover:text-rouge transition-colors">
                          <Minus size={10} />
                        </button>
                        <span className="font-sans text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(key, 1)} className="w-6 h-6 rounded-full border border-black/15 flex items-center justify-center hover:border-rouge hover:text-rouge transition-colors">
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                    <p className="font-sans text-sm text-ink font-medium shrink-0">
                      {formatPrice(item.effectivePriceCents * item.quantity)}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Cart footer */}
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-black/8 shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-sans text-sm text-ink/50">Subtotal</p>
                  <p className="font-sans text-sm text-ink font-medium">{formatPrice(totalCents)}</p>
                </div>
                <p className="font-sans text-xs text-forest mb-4">100% goes directly to relief work</p>
                <button
                  className="w-full bg-rouge hover:bg-rouge-light text-chalk font-sans font-medium text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  onClick={() => alert('Checkout coming soon — Stripe integration in progress.')}
                >
                  Checkout <ArrowRight size={15} />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
