import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, X, Plus, Minus, ArrowRight, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product, ProductVariant } from '@/types'

interface CartItem {
  product: Product
  quantity: number
  selectedVariants: Record<string, string>  // { Size: 'M', Color: 'Red' }
}

function cartKey(productId: string, variants: Record<string, string>) {
  const sorted = Object.entries(variants).sort(([a], [b]) => a.localeCompare(b))
  return `${productId}:${sorted.map(([k, v]) => `${k}=${v}`).join(',')}`
}

function groupVariants(variants: ProductVariant[]) {
  return variants.reduce((acc, v) => {
    if (!acc[v.type]) acc[v.type] = []
    acc[v.type].push(v)
    return acc
  }, {} as Record<string, ProductVariant[]>)
}

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
      return data as Product[]
    },
  })
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default function Store() {
  const { data: products, isLoading } = useProducts()
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  // selectedVariants[productId][variantType] = variantValue
  const [selectedVariants, setSelectedVariants] = useState<Record<string, Record<string, string>>>({})

  function selectVariant(productId: string, type: string, value: string) {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [type]: value },
    }))
  }

  function addToCart(product: Product, variants: Record<string, string>) {
    const key = cartKey(product.id, variants)
    setCart(prev => {
      const existing = prev.find(i => cartKey(i.product.id, i.selectedVariants) === key)
      if (existing) {
        return prev.map(i =>
          cartKey(i.product.id, i.selectedVariants) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, quantity: 1, selectedVariants: variants }]
    })
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
  const totalCents = cart.reduce((sum, i) => sum + i.product.price_cents * i.quantity, 0)

  return (
    <div className="min-h-screen bg-chalk">

      {/* ── Header ─────────────────────────────────────────────────── */}
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

      {/* ── Products grid ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-black/8 overflow-hidden animate-pulse">
                <div className="bg-black/5 h-56" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-black/5 rounded w-3/4" />
                  <div className="h-3 bg-black/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!products || products.length === 0) && (
          <div className="text-center py-24">
            <Package size={40} className="mx-auto text-ink/20 mb-4" />
            <h2 className="font-display text-2xl text-ink mb-2">Store Coming Soon</h2>
            <p className="font-sans text-sm text-ink/40">Products will appear here once added by the team.</p>
          </div>
        )}

        {!isLoading && products && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => {
              const hasVariants = product.variants && product.variants.length > 0
              const variantGroups = hasVariants ? groupVariants(product.variants) : {}
              const sel = selectedVariants[product.id] ?? {}
              const allTypesSelected = !hasVariants || Object.keys(variantGroups).every(type => !!sel[type])
              const isSoldOut = !hasVariants && product.stock_quantity === 0

              return (
                <div key={product.id} className="bg-white rounded-2xl border border-black/8 overflow-hidden shadow-sm group flex flex-col">
                  {/* Image */}
                  <div className="relative bg-black/5 h-56 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={40} className="text-ink/20" />
                      </div>
                    )}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
                        <span className="font-sans text-sm text-chalk font-medium bg-ink px-3 py-1 rounded-full">Sold Out</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    {product.category && (
                      <p className="font-sans text-xs text-rouge/70 uppercase tracking-widest mb-1">{product.category}</p>
                    )}
                    <h3 className="font-display text-lg text-ink mb-1">{product.name}</h3>
                    <p className="font-sans text-sm text-ink/50 leading-relaxed mb-4 line-clamp-2">{product.description}</p>

                    {/* Variant selectors */}
                    {hasVariants && (
                      <div className="space-y-3 mb-4">
                        {Object.entries(variantGroups).map(([type, options]) => (
                          <div key={type}>
                            <p className="font-sans text-xs text-ink/40 uppercase tracking-widest mb-1.5">{type}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {options.map(v => {
                                const outOfStock = v.stock_quantity === 0
                                const isSelected = sel[type] === v.value
                                return (
                                  <button
                                    key={v.value}
                                    disabled={outOfStock}
                                    onClick={() => selectVariant(product.id, type, v.value)}
                                    className={`font-sans text-xs px-3 py-1.5 rounded-md border transition-colors ${
                                      isSelected
                                        ? 'bg-ink text-chalk border-ink'
                                        : outOfStock
                                        ? 'border-black/8 text-ink/20 cursor-not-allowed line-through'
                                        : 'border-black/15 text-ink hover:border-ink'
                                    }`}
                                  >
                                    {v.value}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <p className="font-display text-xl text-ink">{formatPrice(product.price_cents)}</p>
                      <button
                        onClick={() => addToCart(product, sel)}
                        disabled={isSoldOut || !allTypesSelected}
                        className="bg-rouge hover:bg-rouge-light disabled:opacity-40 disabled:cursor-not-allowed text-chalk font-sans text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        {hasVariants && !allTypesSelected ? 'Select options' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Cart button ─────────────────────────────────────────────── */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 bg-rouge text-chalk rounded-full px-5 py-3 shadow-lg flex items-center gap-2 font-sans font-medium text-sm hover:bg-rouge-light transition-colors z-40"
        >
          <ShoppingCart size={18} />
          {totalItems} item{totalItems !== 1 ? 's' : ''} · {formatPrice(totalCents)}
        </button>
      )}

      {/* ── Cart drawer ─────────────────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setCartOpen(false)} />
          <div className="relative bg-chalk w-full max-w-sm shadow-2xl flex flex-col h-full">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/8">
              <h2 className="font-display text-lg text-ink">Your Cart</h2>
              <button onClick={() => setCartOpen(false)} className="p-1 text-ink/40 hover:text-ink transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
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
                        ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-ink/20" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-ink font-medium truncate">{item.product.name}</p>
                      {variantLabel && (
                        <p className="font-sans text-xs text-ink/40 truncate">{variantLabel}</p>
                      )}
                      <p className="font-sans text-sm text-ink/50">{formatPrice(item.product.price_cents)}</p>
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
                    <p className="font-sans text-sm text-ink font-medium shrink-0">{formatPrice(item.product.price_cents * item.quantity)}</p>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-black/8">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-sans text-sm text-ink/50">Subtotal</p>
                  <p className="font-sans text-sm text-ink font-medium">{formatPrice(totalCents)}</p>
                </div>
                <p className="font-sans text-xs text-forest mb-4">100% goes to relief work</p>
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
