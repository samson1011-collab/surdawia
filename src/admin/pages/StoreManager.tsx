import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Package, ChevronUp, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product, ProductVariant } from '@/types'

function useProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order')
      if (error) throw error
      return data as Product[]
    },
  })
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

const STATUS_COLORS: Record<string, string> = {
  active:   'bg-forest/10 text-forest',
  draft:    'bg-ink/10 text-ink/50',
  sold_out: 'bg-rouge/10 text-rouge',
  archived: 'bg-ink/5 text-ink/30',
}

const emptyForm = {
  name: '', description: '', price_cents: 0, category: '',
  images: [] as string[], stock_quantity: null as number | null,
  status: 'draft' as Product['status'], sort_order: 0,
  variants: [] as ProductVariant[],
}

const emptyVariantDraft = { type: '', value: '', stock: '' }

export default function StoreManager() {
  const qc = useQueryClient()
  const { data: products, isLoading } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageInput, setImageInput] = useState('')
  const [variantDraft, setVariantDraft] = useState(emptyVariantDraft)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setImageInput('')
    setVariantDraft(emptyVariantDraft)
    setError(null)
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name, description: p.description,
      price_cents: p.price_cents, category: p.category ?? '',
      images: p.images, stock_quantity: p.stock_quantity,
      status: p.status, sort_order: p.sort_order,
      variants: p.variants ?? [],
    })
    setImageInput('')
    setVariantDraft(emptyVariantDraft)
    setError(null)
    setShowForm(true)
  }

  function addImage() {
    const url = imageInput.trim()
    if (!url) return
    setForm(f => ({ ...f, images: [...f.images, url] }))
    setImageInput('')
  }

  function removeImage(i: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
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
      .from('product-images')
      .upload(path, file, { contentType: file.type })
    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setForm(f => ({ ...f, images: [...f.images, data.publicUrl] }))
    setUploading(false)
  }

  function addVariant() {
    if (!variantDraft.type.trim() || !variantDraft.value.trim()) return
    const stock = variantDraft.stock === '' ? null : parseInt(variantDraft.stock)
    setForm(f => ({
      ...f,
      variants: [...f.variants, {
        type: variantDraft.type.trim(),
        value: variantDraft.value.trim(),
        stock_quantity: isNaN(stock as number) ? null : stock,
      }],
    }))
    setVariantDraft(emptyVariantDraft)
  }

  function removeVariant(i: number) {
    setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.price_cents || form.price_cents <= 0) { setError('Price must be greater than 0.'); return }
    setSaving(true)
    setError(null)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price_cents: form.price_cents,
      category: form.category.trim() || null,
      images: form.images,
      stock_quantity: form.variants.length > 0 ? null : form.stock_quantity,
      variants: form.variants,
      status: form.status,
      sort_order: form.sort_order,
    }
    const { error } = editing
      ? await supabase.from('products').update(payload).eq('id', editing.id)
      : await supabase.from('products').insert(payload)
    setSaving(false)
    if (error) { setError(error.message); return }
    qc.invalidateQueries({ queryKey: ['admin-products'] })
    qc.invalidateQueries({ queryKey: ['products'] })
    setShowForm(false)
  }

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

  return (
    <div className="p-8">
      {/* Header */}
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

      {/* Table */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-black/8 h-16 animate-pulse" />
          ))}
        </div>
      )}

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

      {!isLoading && products && products.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/8 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/8">
                <th className="text-left font-sans text-xs text-ink/40 uppercase tracking-widest px-5 py-3">Product</th>
                <th className="text-left font-sans text-xs text-ink/40 uppercase tracking-widest px-5 py-3">Price</th>
                <th className="text-left font-sans text-xs text-ink/40 uppercase tracking-widest px-5 py-3">Stock</th>
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
                          ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
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
                      ? <span className="font-sans text-xs text-ink/40">{p.variants.length} variants</span>
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

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-chalk rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 sticky top-0 bg-chalk z-10">
              <h2 className="font-display text-lg text-ink">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-ink/40 hover:text-ink transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <p className="font-sans text-sm text-rouge bg-rouge/10 border border-rouge/20 rounded-lg px-4 py-2">{error}</p>
              )}

              <div>
                <label className="block font-sans text-xs text-ink/50 uppercase tracking-widest mb-1.5">Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40"
                  placeholder="Product name"
                />
              </div>

              <div>
                <label className="block font-sans text-xs text-ink/50 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40 resize-none"
                  placeholder="Describe the product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs text-ink/50 uppercase tracking-widest mb-1.5">Price (USD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price_cents ? form.price_cents / 100 : ''}
                    onChange={e => setForm(f => ({ ...f, price_cents: Math.round(parseFloat(e.target.value) * 100) || 0 }))}
                    className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs text-ink/50 uppercase tracking-widest mb-1.5">
                    Stock{form.variants.length > 0 ? ' — overridden by variants' : ' (blank = unlimited)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock_quantity ?? ''}
                    disabled={form.variants.length > 0}
                    onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value === '' ? null : parseInt(e.target.value) }))}
                    className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40 disabled:opacity-40 disabled:cursor-not-allowed"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs text-ink/50 uppercase tracking-widest mb-1.5">Category</label>
                  <input
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40"
                    placeholder="e.g. Apparel"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs text-ink/50 uppercase tracking-widest mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Product['status'] }))}
                    className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40 bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="sold_out">Sold Out</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Variants */}
              <div>
                <label className="block font-sans text-xs text-ink/50 uppercase tracking-widest mb-1.5">
                  Variants <span className="normal-case font-normal text-ink/30">— sizes, colors, etc. (optional)</span>
                </label>

                {form.variants.length > 0 && (
                  <div className="border border-black/10 rounded-lg overflow-hidden mb-2">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-black/[0.02] border-b border-black/8">
                          <th className="text-left font-sans text-xs text-ink/40 px-3 py-2">Type</th>
                          <th className="text-left font-sans text-xs text-ink/40 px-3 py-2">Value</th>
                          <th className="text-left font-sans text-xs text-ink/40 px-3 py-2">Stock</th>
                          <th className="w-8 px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {form.variants.map((v, i) => (
                          <tr key={i} className="border-b border-black/5 last:border-0">
                            <td className="px-3 py-2 font-sans text-sm text-ink">{v.type}</td>
                            <td className="px-3 py-2 font-sans text-sm text-ink">{v.value}</td>
                            <td className="px-3 py-2 font-sans text-sm text-ink/50">
                              {v.stock_quantity === null ? '∞' : v.stock_quantity}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => removeVariant(i)}
                                className="text-ink/30 hover:text-rouge transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    value={variantDraft.type}
                    onChange={e => setVariantDraft(d => ({ ...d, type: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addVariant()}
                    className="flex-1 border border-black/15 rounded-lg px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40"
                    placeholder="Type (e.g. Size)"
                  />
                  <input
                    value={variantDraft.value}
                    onChange={e => setVariantDraft(d => ({ ...d, value: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addVariant()}
                    className="flex-1 border border-black/15 rounded-lg px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40"
                    placeholder="Value (e.g. M)"
                  />
                  <input
                    type="number"
                    min="0"
                    value={variantDraft.stock}
                    onChange={e => setVariantDraft(d => ({ ...d, stock: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addVariant()}
                    className="w-20 border border-black/15 rounded-lg px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40"
                    placeholder="Stock"
                  />
                  <button
                    onClick={addVariant}
                    className="bg-ink text-chalk font-sans text-sm px-3 py-2 rounded-lg hover:bg-ink-mid transition-colors shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block font-sans text-xs text-ink/50 uppercase tracking-widest mb-1.5">Images</label>

                {/* File upload */}
                <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg px-4 py-4 mb-2 cursor-pointer transition-colors ${uploading ? 'border-black/10 bg-black/[0.02]' : 'border-black/15 hover:border-rouge/40 hover:bg-rouge/[0.02]'}`}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <span className="font-sans text-sm text-ink/40">Uploading…</span>
                  ) : (
                    <span className="font-sans text-sm text-ink/50">
                      <span className="text-rouge font-medium">Choose a file</span> or drag here — PNG or JPEG
                    </span>
                  )}
                </label>

                {/* URL fallback */}
                <div className="flex gap-2 mb-2">
                  <input
                    value={imageInput}
                    onChange={e => setImageInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addImage()}
                    className="flex-1 border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-rouge/40"
                    placeholder="Or paste image URL…"
                  />
                  <button onClick={addImage} className="bg-ink text-chalk font-sans text-sm px-3 py-2 rounded-lg hover:bg-ink-mid transition-colors">
                    Add
                  </button>
                </div>

                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-black/10" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rouge text-chalk rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-black/8 flex justify-end gap-3 sticky bottom-0 bg-chalk">
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
      )}
    </div>
  )
}
