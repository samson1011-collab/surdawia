import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Pencil, Trash2, X, Package,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product, ProductVariant, ProductImage } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normalise legacy string[] images from the DB into ProductImage objects. */
function normalizeImages(raw: unknown[]): ProductImage[] {
  return (raw ?? []).map(img =>
    typeof img === 'string' ? { url: img, label: null } : (img as ProductImage)
  )
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function formatPriceOverride(cents: number | null): string {
  if (!cents) return '—'
  const sign = cents > 0 ? '+' : ''
  return sign + formatPrice(cents)
}

const STATUS_COLORS: Record<string, string> = {
  active:   'bg-forest/10 text-forest',
  draft:    'bg-ink/10 text-ink/50',
  sold_out: 'bg-rouge/10 text-rouge',
  archived: 'bg-ink/5 text-ink/30',
}

// ── Query ────────────────────────────────────────────────────────────────────

function useProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
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

// ── Form defaults ─────────────────────────────────────────────────────────────

const emptyForm = {
  name:              '',
  short_description: '',
  description:       '',
  price_cents:       0,
  category:          '',
  images:            [] as ProductImage[],
  stock_quantity:    null as number | null,
  status:            'draft' as Product['status'],
  sort_order:        0,
  variants:          [] as ProductVariant[],
  weight_note:       '',
}

const emptyVariantDraft = { type: '', value: '', stock: '', priceOverride: '', sku: '' }

// ── Component ─────────────────────────────────────────────────────────────────

export default function StoreManager() {
  const qc = useQueryClient()
  const { data: products, isLoading } = useProducts()

  const [showForm, setShowForm]         = useState(false)
  const [editing, setEditing]           = useState<Product | null>(null)
  const [form, setForm]                 = useState(emptyForm)
  const [imageInput, setImageInput]     = useState('')
  const [variantDraft, setVariantDraft] = useState(emptyVariantDraft)
  const [saving, setSaving]             = useState(false)
  const [uploading, setUploading]       = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [warning, setWarning]           = useState<string | null>(null)

  // ── Form open/close ──────────────────────────────────────────────────────

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm })
    setImageInput('')
    setVariantDraft(emptyVariantDraft)
    setError(null)
    setWarning(null)
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name:              p.name,
      short_description: p.short_description ?? '',
      description:       p.description,
      price_cents:       p.price_cents,
      category:          p.category ?? '',
      images:            normalizeImages(p.images as unknown[]),
      stock_quantity:    p.stock_quantity,
      status:            p.status,
      sort_order:        p.sort_order,
      variants:          (p.variants ?? []).map(v => ({
        ...v,
        price_override_cents: v.price_override_cents ?? null,
        sku:                  v.sku ?? null,
      })),
      weight_note:       p.weight_note ?? '',
    })
    setImageInput('')
    setVariantDraft(emptyVariantDraft)
    setError(null)
    setWarning(null)
    setShowForm(true)
  }

  // ── Image management ─────────────────────────────────────────────────────

  function addImage() {
    const url = imageInput.trim()
    if (!url) return
    setForm(f => ({ ...f, images: [...f.images, { url, label: null }] }))
    setImageInput('')
  }

  function removeImage(i: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  }

  function moveImage(i: number, delta: number) {
    const imgs = [...form.images]
    const j = i + delta
    if (j < 0 || j >= imgs.length) return
    ;[imgs[i], imgs[j]] = [imgs[j], imgs[i]]
    setForm(f => ({ ...f, images: imgs }))
  }

  function updateImageLabel(i: number, label: string) {
    setForm(f => ({
      ...f,
      images: f.images.map((img, idx) =>
        idx === i ? { ...img, label: label || null } : img
      ),
    }))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    setError(null)
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(path, file, { contentType: file.type })
    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('products').getPublicUrl(path)
    setForm(f => ({ ...f, images: [...f.images, { url: data.publicUrl, label: null }] }))
    setUploading(false)
  }

  // ── Variant management ───────────────────────────────────────────────────

  function addVariant() {
    if (!variantDraft.type.trim() || !variantDraft.value.trim()) return
    const stock = variantDraft.stock === ''
      ? null
      : parseInt(variantDraft.stock)
    const priceOverride = variantDraft.priceOverride === ''
      ? null
      : Math.round(parseFloat(variantDraft.priceOverride) * 100)
    setForm(f => ({
      ...f,
      variants: [...f.variants, {
        type:                 variantDraft.type.trim(),
        value:                variantDraft.value.trim(),
        stock_quantity:       isNaN(stock as number) ? null : stock,
        price_override_cents: isNaN(priceOverride as number) ? null : priceOverride,
        sku:                  variantDraft.sku.trim() || null,
      }],
    }))
    setVariantDraft(emptyVariantDraft)
  }

  function removeVariant(i: number) {
    setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.price_cents || form.price_cents <= 0) { setError('Price must be greater than 0.'); return }
    setWarning(form.images.length === 0 ? 'No images added — product will show a placeholder.' : null)
    setSaving(true)
    setError(null)
    const payload = {
      name:              form.name.trim(),
      short_description: form.short_description.trim(),
      description:       form.description.trim(),
      price_cents:       form.price_cents,
      category:          form.category.trim() || null,
      images:            form.images,
      stock_quantity:    form.variants.length > 0 ? null : form.stock_quantity,
      variants:          form.variants,
      status:            form.status,
      sort_order:        form.sort_order,
      weight_note:       form.weight_note.trim() || null,
    }
    const { error: saveError } = editing
      ? await supabase.from('products').update(payload).eq('id', editing.id)
      : await supabase.from('products').insert(payload)
    setSaving(false)
    if (saveError) { setError(saveError.message); return }
    qc.invalidateQueries({ queryKey: ['admin-products'] })
    qc.invalidateQueries({ queryKey: ['products'] })
    setShowForm(false)
  }

  // ── Delete / reorder ─────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    qc.invalidateQueries({ queryKey: ['admin-products'] })
    qc.invalidateQueries({ queryKey: ['products'] })
  }

  async function moveOrder(id: string, direction: 'up' | 'down') {
    if (!products) return
    const idx = products.findIndex(p => p.id === id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= products.length) return
    const a = products[idx], b = products[swapIdx]
    await supabase.from('products').update({ sort_order: b.sort_order }).eq('id', a.id)
    await supabase.from('products').update({ sort_order: a.sort_order }).eq('id', b.id)
    qc.invalidateQueries({ queryKey: ['admin-products'] })
  }

  // ── Shared input className ────────────────────────────────────────────────

  const inputCls = 'w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40 bg-white'
  const smallInputCls = 'w-full border border-black/15 rounded-lg px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40 bg-white'
  const labelCls = 'block font-sans text-xs text-ink/50 uppercase tracking-widest mb-1.5'

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Store</h1>
          <p className="font-sans text-sm text-ink/40 mt-1">{products?.length ?? 0} products</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-rouge hover:bg-rouge-light text-chalk font-sans text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-black/8 h-16 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && (!products || products.length === 0) && (
        <div className="text-center py-24 bg-white rounded-2xl border border-black/8">
          <Package size={36} className="mx-auto text-ink/20 mb-3" />
          <p className="font-display text-xl text-ink mb-1">No products yet</p>
          <p className="font-sans text-sm text-ink/40 mb-4">Add your first product to get started.</p>
          <button onClick={openCreate} className="bg-rouge text-chalk font-sans text-sm px-4 py-2 rounded-lg">
            Add Product
          </button>
        </div>
      )}

      {/* ── Product table ── */}
      {!isLoading && products && products.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/8 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/8">
                <th className="text-left font-sans text-xs text-ink/40 uppercase tracking-widest px-5 py-3">Product</th>
                <th className="text-left font-sans text-xs text-ink/40 uppercase tracking-widest px-5 py-3">Price</th>
                <th className="text-left font-sans text-xs text-ink/40 uppercase tracking-widest px-5 py-3">Variants / Stock</th>
                <th className="text-left font-sans text-xs text-ink/40 uppercase tracking-widest px-5 py-3">Status</th>
                <th className="text-left font-sans text-xs text-ink/40 uppercase tracking-widest px-5 py-3">Order</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black/5 overflow-hidden shrink-0">
                        {p.images?.[0]
                          ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-ink/20" /></div>
                        }
                      </div>
                      <div>
                        <p className="font-sans text-sm text-ink font-medium">{p.name}</p>
                        {p.category && <p className="font-sans text-xs text-ink/40">{p.category}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-sans text-sm text-ink">{formatPrice(p.price_cents)}</td>
                  <td className="px-5 py-4 font-sans text-sm text-ink/60">
                    {p.variants?.length > 0
                      ? <span className="font-sans text-xs text-ink/50">{p.variants.length} variant{p.variants.length !== 1 ? 's' : ''}</span>
                      : p.stock_quantity === null ? '∞' : p.stock_quantity
                    }
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-sans text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[p.status]}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveOrder(p.id, 'up')} disabled={idx === 0} className="text-ink/30 hover:text-ink disabled:opacity-20 transition-colors">
                        <ChevronUp size={14} />
                      </button>
                      <button onClick={() => moveOrder(p.id, 'down')} disabled={idx === products.length - 1} className="text-ink/30 hover:text-ink disabled:opacity-20 transition-colors">
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-ink/40 hover:text-ink transition-colors rounded">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-ink/40 hover:text-rouge transition-colors rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Product form modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-chalk rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 shrink-0">
              <h2 className="font-display text-lg text-ink">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-ink/40 hover:text-ink transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

              {/* Error / warning banners */}
              {error && (
                <div className="flex items-center gap-2 font-sans text-sm text-rouge bg-rouge/10 border border-rouge/20 rounded-lg px-4 py-2.5">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}
              {warning && !error && (
                <div className="flex items-center gap-2 font-sans text-sm text-ink/60 bg-ink/5 border border-black/10 rounded-lg px-4 py-2.5">
                  <AlertCircle size={14} className="shrink-0" />
                  {warning}
                </div>
              )}

              {/* ── Basic info ── */}
              <div className="space-y-4">
                <p className="font-sans text-xs text-ink/30 uppercase tracking-widest">Basic Info</p>

                <div>
                  <label className={labelCls}>Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                    placeholder="Product name"
                  />
                </div>

                <div>
                  <label className={labelCls}>Short description <span className="normal-case font-normal text-ink/30">— shown on card (1–2 sentences)</span></label>
                  <input
                    value={form.short_description}
                    onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                    className={inputCls}
                    placeholder="A brief line about this product"
                  />
                </div>

                <div>
                  <label className={labelCls}>Full description <span className="normal-case font-normal text-ink/30">— shown in product detail</span></label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    className={`${inputCls} resize-none`}
                    placeholder="Full product details, materials, sizing notes..."
                  />
                </div>
              </div>

              {/* ── Pricing & details ── */}
              <div className="space-y-4">
                <p className="font-sans text-xs text-ink/30 uppercase tracking-widest">Pricing & Details</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Base price (USD) *</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.price_cents ? form.price_cents / 100 : ''}
                      onChange={e => setForm(f => ({ ...f, price_cents: Math.round(parseFloat(e.target.value) * 100) || 0 }))}
                      className={inputCls}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <input
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className={inputCls}
                      placeholder="e.g. Apparel"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as Product['status'] }))}
                      className={inputCls}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="sold_out">Sold Out</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>
                      {form.variants.length > 0 ? 'Stock — set per variant' : 'Stock (blank = unlimited)'}
                    </label>
                    <input
                      type="number" min="0"
                      value={form.stock_quantity ?? ''}
                      disabled={form.variants.length > 0}
                      onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value === '' ? null : parseInt(e.target.value) }))}
                      className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Weight / shipping notes <span className="normal-case font-normal text-ink/30">— admin only</span></label>
                  <input
                    value={form.weight_note}
                    onChange={e => setForm(f => ({ ...f, weight_note: e.target.value }))}
                    className={inputCls}
                    placeholder="e.g. 200g, ships flat, fragile"
                  />
                </div>
              </div>

              {/* ── Variants ── */}
              <div className="space-y-3">
                <p className="font-sans text-xs text-ink/30 uppercase tracking-widest">
                  Variants <span className="normal-case font-normal text-ink/40">— sizes, colors, materials, etc.</span>
                </p>

                {form.variants.length > 0 && (
                  <div className="border border-black/10 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-black/[0.02] border-b border-black/8">
                          <th className="font-sans text-xs text-ink/40 px-3 py-2">Type</th>
                          <th className="font-sans text-xs text-ink/40 px-3 py-2">Value</th>
                          <th className="font-sans text-xs text-ink/40 px-3 py-2">Stock</th>
                          <th className="font-sans text-xs text-ink/40 px-3 py-2">±Price</th>
                          <th className="font-sans text-xs text-ink/40 px-3 py-2">SKU</th>
                          <th className="w-8 px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {form.variants.map((v, i) => (
                          <tr key={i} className="border-b border-black/5 last:border-0">
                            <td className="px-3 py-2 font-sans text-sm text-ink">{v.type}</td>
                            <td className="px-3 py-2 font-sans text-sm text-ink">{v.value}</td>
                            <td className="px-3 py-2 font-sans text-sm text-ink/50">{v.stock_quantity === null ? '∞' : v.stock_quantity}</td>
                            <td className="px-3 py-2 font-sans text-sm text-ink/50">{formatPriceOverride(v.price_override_cents)}</td>
                            <td className="px-3 py-2 font-sans text-xs text-ink/40">{v.sku ?? '—'}</td>
                            <td className="px-3 py-2">
                              <button onClick={() => removeVariant(i)} className="text-ink/30 hover:text-rouge transition-colors">
                                <X size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add variant form */}
                <div className="space-y-2 p-3 bg-black/[0.02] rounded-lg border border-black/8">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={variantDraft.type}
                      onChange={e => setVariantDraft(d => ({ ...d, type: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addVariant()}
                      className={smallInputCls}
                      placeholder="Type (e.g. Size)"
                    />
                    <input
                      value={variantDraft.value}
                      onChange={e => setVariantDraft(d => ({ ...d, value: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addVariant()}
                      className={smallInputCls}
                      placeholder="Value (e.g. M)"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number" min="0"
                      value={variantDraft.stock}
                      onChange={e => setVariantDraft(d => ({ ...d, stock: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addVariant()}
                      className={smallInputCls}
                      placeholder="Stock"
                    />
                    <input
                      type="number" step="0.01"
                      value={variantDraft.priceOverride}
                      onChange={e => setVariantDraft(d => ({ ...d, priceOverride: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addVariant()}
                      className={smallInputCls}
                      placeholder="±Price (e.g. 2)"
                    />
                    <input
                      value={variantDraft.sku}
                      onChange={e => setVariantDraft(d => ({ ...d, sku: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addVariant()}
                      className={smallInputCls}
                      placeholder="SKU"
                    />
                  </div>
                  <button
                    onClick={addVariant}
                    className="w-full bg-ink text-chalk font-sans text-sm py-2 rounded-lg hover:bg-ink-mid transition-colors"
                  >
                    Add Variant
                  </button>
                </div>
              </div>

              {/* ── Images ── */}
              <div className="space-y-3">
                <p className="font-sans text-xs text-ink/30 uppercase tracking-widest">Images</p>

                {/* File upload */}
                <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg px-4 py-4 cursor-pointer transition-colors ${uploading ? 'border-black/10 bg-black/[0.02]' : 'border-black/15 hover:border-rouge/40 hover:bg-rouge/[0.02]'}`}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading
                    ? <span className="font-sans text-sm text-ink/40">Uploading…</span>
                    : <span className="font-sans text-sm text-ink/50">
                        <span className="text-rouge font-medium">Choose file</span> or drag — PNG or JPEG
                      </span>
                  }
                </label>

                {/* URL input */}
                <div className="flex gap-2">
                  <input
                    value={imageInput}
                    onChange={e => setImageInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addImage()}
                    className={`flex-1 ${smallInputCls}`}
                    placeholder="Or paste image URL…"
                  />
                  <button onClick={addImage} className="bg-ink text-chalk font-sans text-sm px-3 py-2 rounded-lg hover:bg-ink-mid transition-colors shrink-0">
                    Add
                  </button>
                </div>

                {/* Image grid with labels and reorder */}
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-black/10 bg-black/5">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-rouge text-chalk rounded-full flex items-center justify-center hover:bg-rouge-light transition-colors"
                          >
                            <X size={9} />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-ink/60 text-chalk font-sans text-[9px] text-center py-0.5">Primary</span>
                          )}
                        </div>
                        <input
                          value={img.label ?? ''}
                          onChange={e => updateImageLabel(i, e.target.value)}
                          className="w-20 border border-black/10 rounded px-1.5 py-0.5 font-sans text-xs text-ink text-center bg-white focus:outline-none focus:ring-1 focus:ring-rouge/30"
                          placeholder="Label"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveImage(i, -1)}
                            disabled={i === 0}
                            className="p-0.5 text-ink/30 hover:text-ink disabled:opacity-20 transition-colors"
                            title="Move left"
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <button
                            onClick={() => moveImage(i, 1)}
                            disabled={i === form.images.length - 1}
                            className="p-0.5 text-ink/30 hover:text-ink disabled:opacity-20 transition-colors"
                            title="Move right"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>{/* end modal body */}

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-black/8 flex items-center justify-between shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => { setForm(f => ({ ...f, status: 'draft' })); }}
                  className={`font-sans text-xs px-3 py-1.5 rounded-lg border transition-colors ${form.status === 'draft' ? 'bg-ink/10 border-ink/20 text-ink' : 'border-black/10 text-ink/40 hover:text-ink hover:border-black/20'}`}
                >
                  Draft
                </button>
                <button
                  onClick={() => { setForm(f => ({ ...f, status: 'active' })); }}
                  className={`font-sans text-xs px-3 py-1.5 rounded-lg border transition-colors ${form.status === 'active' ? 'bg-forest/10 border-forest/20 text-forest' : 'border-black/10 text-ink/40 hover:text-ink hover:border-black/20'}`}
                >
                  Published
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="font-sans text-sm text-ink/50 hover:text-ink px-4 py-2 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-rouge hover:bg-rouge-light disabled:opacity-50 text-chalk font-sans text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                >
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
