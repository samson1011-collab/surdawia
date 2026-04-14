import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { X, Play, MapPin, Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { MediaItem, MediaCamp } from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_FILTERS = ['All', 'Images', 'Videos'] as const
const CAMP_FILTERS: { value: MediaCamp | 'all'; label: string }[] = [
  { value: 'all',        label: 'All Camps'      },
  { value: 'south_gaza', label: 'South Gaza'     },
  { value: 'north_gaza', label: 'North Gaza'     },
  { value: 'refugees',   label: 'Gazan Refugees' },
]

const CAMP_BADGE: Record<MediaCamp, string> = {
  south_gaza: 'bg-rouge/85 text-chalk',
  north_gaza: 'bg-ink/70 text-chalk',
  refugees:   'bg-forest/85 text-chalk',
  general:    'bg-ink/50 text-chalk',
}

const CAMP_LABEL: Record<MediaCamp, string> = {
  south_gaza: 'South Gaza',
  north_gaza: 'North Gaza',
  refugees:   'Refugees',
  general:    'General',
}

const PAGE_SIZE = 12

// ── Helpers ───────────────────────────────────────────────────────────────────

function thumb(item: MediaItem): string {
  if (item.type === 'video' && item.youtube_video_id)
    return `https://img.youtube.com/vi/${item.youtube_video_id}/hqdefault.jpg`
  return item.thumbnail_url ?? item.url
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  item,
  items,
  onClose,
  onNav,
}: {
  item: MediaItem
  items: MediaItem[]
  onClose: () => void
  onNav: (dir: -1 | 1) => void
}) {
  const idx = items.findIndex(i => i.id === item.id)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')  onNav(-1)
      if (e.key === 'ArrowRight') onNav(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onNav])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/92 backdrop-blur-sm" onClick={onClose} />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-chalk transition-colors"
      >
        <X size={20} />
      </button>

      {/* Prev */}
      {idx > 0 && (
        <button
          onClick={() => onNav(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-chalk transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Next */}
      {idx < items.length - 1 && (
        <button
          onClick={() => onNav(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-chalk transition-colors"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl rounded-2xl overflow-hidden bg-ink shadow-2xl">
        {item.type === 'video' && item.youtube_video_id ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${item.youtube_video_id}?autoplay=1`}
              title={item.title}
              allow="autoplay; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.title}
            className="w-full max-h-[65vh] object-contain bg-black"
          />
        )}

        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`font-sans text-xs px-2.5 py-1 rounded-full ${CAMP_BADGE[item.camp]}`}>
              {CAMP_LABEL[item.camp]}
            </span>
            <span className="font-sans text-xs px-2.5 py-1 rounded-full bg-white/8 text-chalk/60">
              {item.category}
            </span>
          </div>
          <h3 className="font-display text-xl text-chalk mb-2">{item.title}</h3>
          {item.description && (
            <p className="font-sans text-sm text-chalk/50 leading-relaxed mb-3">{item.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-5">
            {item.location && (
              <span className="flex items-center gap-1.5 font-sans text-xs text-chalk/40">
                <MapPin size={12} /> {item.location}
              </span>
            )}
            {item.captured_at && (
              <span className="flex items-center gap-1.5 font-sans text-xs text-chalk/40">
                <Calendar size={12} /> {formatDate(item.captured_at)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

function MediaCard({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl border border-black/8 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-52 overflow-hidden bg-black/8">
        <img
          src={thumb(item)}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
            <div className="w-12 h-12 bg-ink/60 group-hover:bg-rouge/80 rounded-full flex items-center justify-center transition-colors">
              <Play size={20} className="text-chalk ml-0.5" fill="white" />
            </div>
          </div>
        )}
        <span className={`absolute top-3 left-3 font-sans text-xs px-2.5 py-1 rounded-full ${CAMP_BADGE[item.camp]}`}>
          {CAMP_LABEL[item.camp]}
        </span>
      </div>
      <div className="p-4">
        <span className="font-sans text-[11px] text-ink/40 uppercase tracking-wider">{item.category}</span>
        <h3 className="font-sans text-sm font-medium text-ink mt-0.5 mb-2 leading-snug line-clamp-2">{item.title}</h3>
        <div className="flex items-center justify-between gap-2">
          {item.location && (
            <span className="flex items-center gap-1 font-sans text-xs text-ink/40 truncate">
              <MapPin size={11} /> {item.location}
            </span>
          )}
          {item.captured_at && (
            <span className="flex items-center gap-1 font-sans text-xs text-ink/40 shrink-0">
              <Calendar size={11} /> {formatDate(item.captured_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items,     setItems]     = useState<MediaItem[]>([])
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [lightbox,  setLightbox]  = useState<MediaItem | null>(null)

  const typeFilter = (searchParams.get('type') ?? 'All') as typeof TYPE_FILTERS[number]
  const campFilter = (searchParams.get('camp') ?? 'all') as MediaCamp | 'all'

  const setTypeFilter = (v: string) => setSearchParams(p => { p.set('type', v); return p }, { replace: true })
  const setCampFilter = (v: string) => setSearchParams(p => { p.set('camp', v); return p }, { replace: true })

  useEffect(() => { setPage(1) }, [typeFilter, campFilter])

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('media_items')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    setItems((data as MediaItem[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = items.filter(i => {
    if (typeFilter === 'Images' && i.type !== 'image') return false
    if (typeFilter === 'Videos' && i.type !== 'video') return false
    if (campFilter !== 'all' && i.camp !== campFilter) return false
    return true
  })

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  const navLightbox = useCallback((dir: -1 | 1) => {
    if (!lightbox) return
    const idx = filtered.findIndex(i => i.id === lightbox.id)
    const next = filtered[idx + dir]
    if (next) setLightbox(next)
  }, [lightbox, filtered])

  return (
    <div className="min-h-screen bg-chalk-off">

      {/* Hero */}
      <div className="relative bg-ink text-chalk py-16 px-4 overflow-hidden">
        <div className="h-0.5 flex absolute top-0 inset-x-0">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/40" />
          <div className="flex-1 bg-forest" />
        </div>
        <div
          className="absolute top-0 left-0 w-1/3 h-full bg-rouge/6 pointer-events-none"
          style={{ clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0 100%)' }}
        />
        <div className="relative max-w-6xl mx-auto">
          <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-3">Media Gallery</p>
          <h1 className="font-display text-5xl text-chalk mb-3">From the Ground</h1>
          <p className="font-serif text-lg text-chalk/50 max-w-xl">
            Real photos and videos from our relief operations — every image tells a story of resilience and hope.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TYPE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`shrink-0 font-sans text-sm px-4 py-2 rounded-full border transition-colors min-h-[44px] ${
                typeFilter === f
                  ? 'bg-rouge text-chalk border-rouge'
                  : 'bg-white text-ink/60 border-black/15 hover:border-ink/30 hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
          <div className="w-px h-6 self-center bg-black/10 mx-1" />
          {CAMP_FILTERS.map(c => (
            <button
              key={c.value}
              onClick={() => setCampFilter(c.value)}
              className={`shrink-0 font-sans text-sm px-4 py-2 rounded-full border transition-colors min-h-[44px] ${
                campFilter === c.value
                  ? 'bg-ink text-chalk border-ink'
                  : 'bg-white text-ink/60 border-black/15 hover:border-ink/30 hover:text-ink'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="font-sans text-xs text-ink/35 mb-6">
          {loading ? 'Loading…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-ink/25" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-display text-2xl text-ink/25 mb-2">Nothing here yet</p>
            <p className="font-sans text-sm text-ink/20">
              {campFilter !== 'all' || typeFilter !== 'All'
                ? 'Try a different filter'
                : 'Media will appear here once uploaded.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map(item => (
                <MediaCard key={item.id} item={item} onClick={() => setLightbox(item)} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="font-sans text-sm font-medium text-ink/60 hover:text-ink border border-black/15 hover:border-ink/30 px-8 py-3 rounded-full transition-colors"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          item={lightbox}
          items={filtered}
          onClose={() => setLightbox(null)}
          onNav={navLightbox}
        />
      )}
    </div>
  )
}
