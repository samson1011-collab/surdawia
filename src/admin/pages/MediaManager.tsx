import { useState, useRef, useCallback } from 'react'
import {
  Upload, Search, Grid3X3, Trash2, Edit2, Eye, EyeOff,
  Play, X, Plus, Check, ChevronDown, Image as ImageIcon,
  Youtube, Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { MediaItem, MediaType, MediaCamp, MediaCategory } from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const CAMPS: { value: MediaCamp | 'all'; label: string }[] = [
  { value: 'all',        label: 'All Camps'        },
  { value: 'south_gaza', label: 'South Gaza'       },
  { value: 'north_gaza', label: 'North Gaza'       },
  { value: 'refugees',   label: 'Gazan Refugees'   },
  { value: 'general',    label: 'General / Other'  },
]

const CATEGORIES: { value: MediaCategory; label: string }[] = [
  { value: 'food',          label: 'Food'           },
  { value: 'water_wells',   label: 'Water & Wells'  },
  { value: 'medical',       label: 'Medical & Health'},
  { value: 'shelter',       label: 'Shelter'        },
  { value: 'education',     label: 'Education'      },
  { value: 'general_relief',label: 'General Relief' },
  { value: 'relief_work',   label: 'Relief Work'    },
  { value: 'general',       label: 'General'        },
]

const CAMP_LABELS: Record<MediaCamp, string> = {
  south_gaza: 'South Gaza',
  north_gaza: 'North Gaza',
  refugees:   'Refugees',
  general:    'General',
}

const CAMP_COLORS: Record<MediaCamp, string> = {
  south_gaza: 'bg-rouge/10 text-rouge',
  north_gaza: 'bg-ink/10 text-ink/70',
  refugees:   'bg-forest/10 text-forest',
  general:    'bg-black/10 text-black/50',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&\s]+)/,
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
    /youtube\.com\/shorts\/([^?&\s]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

// ── Empty form state ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title:       '',
  description: '',
  camp:        'south_gaza' as MediaCamp,
  category:    'food' as MediaCategory,
  location:    '',
  captured_at: '',
  youtubeUrl:  '',
  youtubeId:   '',
}

type FormState = typeof EMPTY_FORM

// ── Upload Modal ──────────────────────────────────────────────────────────────

function UploadModal({
  onClose,
  onSaved,
  editing,
}: {
  onClose: () => void
  onSaved: () => void
  editing: MediaItem | null
}) {
  const [tab, setTab]           = useState<'image' | 'video'>(editing?.type ?? 'image')
  const [form, setForm]         = useState<FormState>({
    ...EMPTY_FORM,
    title:       editing?.title       ?? '',
    description: editing?.description ?? '',
    camp:        editing?.camp        ?? 'south_gaza',
    category:    editing?.category    ?? 'food',
    location:    editing?.location    ?? '',
    captured_at: editing?.captured_at?.slice(0, 10) ?? '',
    youtubeUrl:  editing?.youtube_video_id ? `https://youtube.com/watch?v=${editing.youtube_video_id}` : '',
    youtubeId:   editing?.youtube_video_id ?? '',
  })
  const [file,      setFile]    = useState<File | null>(null)
  const [preview,   setPreview] = useState<string | null>(editing?.url ?? null)
  const [dragging,  setDragging]= useState(false)
  const [saving,    setSaving]  = useState(false)
  const [error,     setError]   = useState<string | null>(null)
  const fileRef                 = useRef<HTMLInputElement>(null)

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Only image files allowed'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleYouTubeUrl = (url: string) => {
    set('youtubeUrl', url)
    const id = extractYouTubeId(url)
    set('youtubeId', id ?? '')
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError(null)

    try {
      let url           = editing?.url            ?? ''
      let thumbnail_url = editing?.thumbnail_url  ?? null
      let youtube_video_id: string | null = null

      if (tab === 'image') {
        if (file) {
          const ext  = file.name.split('.').pop()
          const path = `media/${Date.now()}.${ext}`
          const { error: upErr } = await supabase.storage
            .from('media')
            .upload(path, file, { upsert: true })
          if (upErr) throw upErr
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
          url           = urlData.publicUrl
          thumbnail_url = url
        } else if (!editing) {
          setError('Please select an image'); setSaving(false); return
        }
      } else {
        if (!form.youtubeId) { setError('Invalid YouTube URL'); setSaving(false); return }
        youtube_video_id = form.youtubeId
        url              = `https://www.youtube.com/watch?v=${form.youtubeId}`
        thumbnail_url    = `https://img.youtube.com/vi/${form.youtubeId}/hqdefault.jpg`
      }

      const payload = {
        title:            form.title.trim(),
        description:      form.description.trim() || null,
        type:             tab as MediaType,
        category:         form.category,
        camp:             form.camp,
        location:         form.location.trim() || null,
        captured_at:      form.captured_at || null,
        url,
        thumbnail_url,
        youtube_video_id,
        is_published:     editing?.is_published ?? true,
        sort_order:       editing?.sort_order    ?? 0,
      }

      if (editing) {
        const { error: e } = await supabase.from('media_items').update(payload).eq('id', editing.id)
        if (e) throw e
      } else {
        const { error: e } = await supabase.from('media_items').insert(payload)
        if (e) throw e
      }

      onSaved()
    } catch (e: unknown) {
      const msg = e instanceof Error
        ? e.message
        : (e as { message?: string })?.message ?? 'Save failed'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-chalk rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <h2 className="font-display text-xl text-ink">
            {editing ? 'Edit Media' : 'Upload Media'}
          </h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        {!editing && (
          <div className="flex border-b border-black/8">
            {(['image', 'video'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null) }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-sans text-sm font-medium transition-colors ${
                  tab === t ? 'text-rouge border-b-2 border-rouge' : 'text-ink/40 hover:text-ink'
                }`}
              >
                {t === 'image' ? <ImageIcon size={15} /> : <Youtube size={15} />}
                {t === 'image' ? 'Upload Image' : 'YouTube Video'}
              </button>
            ))}
          </div>
        )}

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Image tab */}
          {tab === 'image' && (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragging ? 'border-rouge bg-rouge/5' : 'border-black/15 hover:border-black/30'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {preview ? (
                <img src={preview} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  <Upload size={24} className="text-ink/30 mb-2" />
                  <p className="font-sans text-sm text-ink/40">Drop image or click to browse</p>
                </>
              )}
            </div>
          )}

          {/* YouTube tab */}
          {tab === 'video' && (
            <div className="space-y-3">
              <div>
                <label className="font-sans text-xs text-ink/50 mb-1 block">YouTube URL</label>
                <input
                  type="text"
                  value={form.youtubeUrl}
                  onChange={e => handleYouTubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-rouge/50"
                />
              </div>
              {form.youtubeId && (
                <div className="relative rounded-xl overflow-hidden h-36 bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${form.youtubeId}/hqdefault.jpg`}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-rouge/80 rounded-full flex items-center justify-center">
                      <Play size={20} className="text-chalk ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Common fields */}
          <div>
            <label className="font-sans text-xs text-ink/50 mb-1 block">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Descriptive title"
              className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-rouge/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-sans text-xs text-ink/50 mb-1 block">Camp</label>
              <select
                value={form.camp}
                onChange={e => set('camp', e.target.value)}
                className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-rouge/50 bg-white"
              >
                {CAMPS.filter(c => c.value !== 'all').map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-sans text-xs text-ink/50 mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-rouge/50 bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-sans text-xs text-ink/50 mb-1 block">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="e.g. Khan Younis"
                className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-rouge/50"
              />
            </div>
            <div>
              <label className="font-sans text-xs text-ink/50 mb-1 block">Capture Date</label>
              <input
                type="date"
                value={form.captured_at}
                onChange={e => set('captured_at', e.target.value)}
                className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-rouge/50"
              />
            </div>
          </div>

          <div>
            <label className="font-sans text-xs text-ink/50 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full border border-black/15 rounded-lg px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-rouge/50 resize-none"
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-rouge bg-rouge/5 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/8">
          <button
            onClick={onClose}
            className="font-sans text-sm text-ink/50 hover:text-ink px-4 py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-rouge hover:bg-rouge-light text-chalk font-sans font-medium text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Media Card ────────────────────────────────────────────────────────────────

function MediaCard({
  item,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  item: MediaItem
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onTogglePublish: () => void
}) {
  const thumb = item.type === 'video' && item.youtube_video_id
    ? `https://img.youtube.com/vi/${item.youtube_video_id}/hqdefault.jpg`
    : (item.thumbnail_url ?? item.url)

  return (
    <div className={`group relative bg-chalk rounded-xl border overflow-hidden transition-all ${
      selected ? 'border-rouge shadow-md' : 'border-black/8 shadow-sm hover:shadow-md'
    }`}>
      {/* Thumbnail */}
      <div className="relative h-44 bg-black/5 overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={32} className="text-ink/20" />
          </div>
        )}
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
            <div className="w-10 h-10 bg-ink/60 rounded-full flex items-center justify-center">
              <Play size={16} className="text-chalk ml-0.5" fill="white" />
            </div>
          </div>
        )}
        {/* Select checkbox */}
        <button
          onClick={onSelect}
          className={`absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            selected ? 'bg-rouge border-rouge' : 'bg-chalk/80 border-black/20 opacity-0 group-hover:opacity-100'
          }`}
        >
          {selected && <Check size={12} className="text-chalk" />}
        </button>
        {/* Published badge */}
        <span className={`absolute top-2 right-2 font-sans text-[10px] px-2 py-0.5 rounded-full ${
          item.is_published ? 'bg-forest/90 text-chalk' : 'bg-ink/60 text-chalk/70'
        }`}>
          {item.is_published ? 'Live' : 'Draft'}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-sans text-sm font-medium text-ink leading-snug mb-2 line-clamp-2">{item.title}</h3>
        <div className="flex flex-wrap gap-1 mb-3">
          <span className={`font-sans text-[10px] px-2 py-0.5 rounded-full ${CAMP_COLORS[item.camp]}`}>
            {CAMP_LABELS[item.camp]}
          </span>
          <span className="font-sans text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-ink/50">
            {item.category}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePublish}
            title={item.is_published ? 'Unpublish' : 'Publish'}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-sans text-xs border border-black/10 hover:border-black/25 text-ink/50 hover:text-ink transition-colors"
          >
            {item.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
            {item.is_published ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg border border-black/10 hover:border-black/25 text-ink/50 hover:text-ink transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg border border-black/10 hover:border-rouge/30 text-ink/50 hover:text-rouge transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MediaManager() {
  const [items,        setItems]        = useState<MediaItem[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [typeFilter,   setTypeFilter]   = useState<'all' | MediaType>('all')
  const [campFilter,   setCampFilter]   = useState<MediaCamp | 'all'>('all')
  const [catFilter,    setCatFilter]    = useState<MediaCategory | 'all'>('all')
  const [sortBy,       setSortBy]       = useState<'newest' | 'oldest' | 'camp'>('newest')
  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const [showUpload,   setShowUpload]   = useState(false)
  const [editingItem,  setEditingItem]  = useState<MediaItem | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('media_items')
      .select('*')
      .order('created_at', { ascending: false })
    setItems((data as MediaItem[]) ?? [])
    setLoading(false)
  }, [])

  useState(() => { load() })

  const toggleSelect = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const togglePublish = async (item: MediaItem) => {
    await supabase.from('media_items').update({ is_published: !item.is_published }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_published: !i.is_published } : i))
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this media item?')) return
    await supabase.from('media_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} items?`)) return
    await supabase.from('media_items').delete().in('id', [...selected])
    setItems(prev => prev.filter(i => !selected.has(i.id)))
    setSelected(new Set())
  }

  const filtered = items
    .filter(i => {
      if (typeFilter !== 'all' && i.type !== typeFilter) return false
      if (campFilter !== 'all' && i.camp !== campFilter) return false
      if (catFilter  !== 'all' && i.category !== catFilter) return false
      if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'camp')   return a.camp.localeCompare(b.camp)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-6 w-1 rounded-full bg-rouge" />
            <h1 className="font-display text-3xl text-ink">Media Library</h1>
          </div>
          <p className="font-sans text-sm text-ink/40 ml-4">{items.length} items · images & videos</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setShowUpload(true) }}
          className="flex items-center gap-2 bg-rouge hover:bg-rouge-light text-chalk font-sans font-medium text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Media
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search media…"
            className="w-full pl-9 pr-4 py-2.5 border border-black/12 rounded-lg font-sans text-sm text-ink focus:outline-none focus:border-rouge/40 bg-white"
          />
        </div>

        {/* Type filter */}
        <div className="flex rounded-lg border border-black/12 overflow-hidden bg-white">
          {(['all', 'image', 'video'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-2 font-sans text-xs font-medium capitalize transition-colors ${
                typeFilter === t ? 'bg-ink text-chalk' : 'text-ink/50 hover:text-ink'
              }`}
            >
              {t === 'all' ? 'All' : t === 'image' ? 'Images' : 'Videos'}
            </button>
          ))}
        </div>

        {/* Camp filter */}
        <select
          value={campFilter}
          onChange={e => setCampFilter(e.target.value as MediaCamp | 'all')}
          className="border border-black/12 rounded-lg px-3 py-2.5 font-sans text-xs text-ink bg-white focus:outline-none focus:border-rouge/40"
        >
          {CAMPS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        {/* Category filter */}
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value as MediaCategory | 'all')}
          className="border border-black/12 rounded-lg px-3 py-2.5 font-sans text-xs text-ink bg-white focus:outline-none focus:border-rouge/40"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none border border-black/12 rounded-lg pl-3 pr-8 py-2.5 font-sans text-xs text-ink bg-white focus:outline-none focus:border-rouge/40"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="camp">By camp</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
        </div>

        {/* Bulk delete */}
        {selected.size > 0 && (
          <button
            onClick={bulkDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rouge/10 text-rouge hover:bg-rouge/20 font-sans text-xs font-medium transition-colors"
          >
            <Trash2 size={14} />
            Delete {selected.size}
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-ink/30" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Grid3X3 size={40} className="text-ink/15 mb-4" />
          <p className="font-display text-xl text-ink/30 mb-2">No media found</p>
          <p className="font-sans text-sm text-ink/25">Upload images or add YouTube videos to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(item => (
            <MediaCard
              key={item.id}
              item={item}
              selected={selected.has(item.id)}
              onSelect={() => toggleSelect(item.id)}
              onEdit={() => { setEditingItem(item); setShowUpload(true) }}
              onDelete={() => deleteItem(item.id)}
              onTogglePublish={() => togglePublish(item)}
            />
          ))}
        </div>
      )}

      {/* Upload/Edit modal */}
      {showUpload && (
        <UploadModal
          editing={editingItem}
          onClose={() => { setShowUpload(false); setEditingItem(null) }}
          onSaved={() => { setShowUpload(false); setEditingItem(null); load() }}
        />
      )}
    </div>
  )
}
