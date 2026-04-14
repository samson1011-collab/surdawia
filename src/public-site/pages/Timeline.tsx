import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  MapPin, Users, Droplets, Package, Heart, Home, TrendingUp,
  Play, X, ChevronLeft, ChevronRight, LayoutList, Grid3X3,
  Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { MediaItem, MediaCamp, MediaCategory } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type CampFilter     = 'all' | MediaCamp
type CategoryFilter = 'all' | MediaCategory
type ViewMode       = 'timeline' | 'grid'

interface MissionEntry {
  id:          number
  date:        string   // "April 2025"
  title:       string
  description: string
  impact:      string
  location:    string
  tag:         string
}

interface StatItem {
  label: string
  value: string
  icon:  React.ElementType
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CAMP_OPTIONS: { value: CampFilter; label: string }[] = [
  { value: 'all',        label: 'All'            },
  { value: 'south_gaza', label: 'South Gaza'     },
  { value: 'north_gaza', label: 'North Gaza'     },
  { value: 'refugees',   label: 'Gazan Refugees' },
]

const CATEGORY_OPTIONS: { slug: string; label: string; dbValue: CategoryFilter }[] = [
  { slug: 'all',            label: 'All',              dbValue: 'all'          },
  { slug: 'food',           label: 'Food',             dbValue: 'food'         },
  { slug: 'water_wells',    label: 'Water & Wells',    dbValue: 'water_wells'  },
  { slug: 'medical',        label: 'Medical & Health', dbValue: 'medical'      },
  { slug: 'shelter',        label: 'Shelter',          dbValue: 'shelter'      },
  { slug: 'education',      label: 'Education',        dbValue: 'education'    },
  { slug: 'general_relief', label: 'General Relief',   dbValue: 'general_relief'},
  { slug: 'relief_work',    label: 'Relief Work',      dbValue: 'relief_work'  },
  { slug: 'general',        label: 'General',          dbValue: 'general'      },
]

const CAMP_BADGE: Record<MediaCamp, string> = {
  south_gaza: 'bg-rouge/10 text-rouge',
  north_gaza: 'bg-sky-500/10 text-sky-600',
  refugees:   'bg-forest/10 text-forest',
  general:    'bg-ink/8 text-ink/50',
}

const CAMP_LABELS: Record<MediaCamp, string> = {
  south_gaza: 'South Gaza',
  north_gaza: 'North Gaza',
  refugees:   'Gazan Refugees',
  general:    'General',
}

const PAGE_SIZE = 12

const MONTH_MAP: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
}

// ── South Gaza data ───────────────────────────────────────────────────────────

const SOUTH_ENTRIES: MissionEntry[] = [
  {
    id:          1,
    date:        'April 2025',
    title:       'Spring Food Distribution Drive',
    description: 'Large-scale food distribution across 6 shelters in Khan Younis and Rafah. Packages included rice, lentils, canned goods, oil, and flour — enough for a family of five for two weeks.',
    impact:      '480 families reached',
    location:    'Khan Younis',
    tag:         'South Gaza',
  },
  {
    id:          2,
    date:        'February 2025',
    title:       'Water Trucking & Filtration Run',
    description: 'Coordinated with local water engineers to deliver 80,000 litres of clean drinking water to communities cut off from municipal supply. Portable filtration units installed at two shelter sites.',
    impact:      '80,000 L delivered',
    location:    'Rafah',
    tag:         'South Gaza',
  },
  {
    id:          3,
    date:        'December 2024',
    title:       'Winter Warmth Campaign',
    description: 'As winter arrived, we distributed 2,200 insulated blankets, thermal clothing sets, and heating fuel canisters to displaced families sheltering in damaged structures and tent camps.',
    impact:      '2,200 kits distributed',
    location:    'Deir al-Balah',
    tag:         'South Gaza',
  },
  {
    id:          4,
    date:        'November 2024',
    title:       'Daily Hot Meals — Community Kitchen',
    description: 'Established a field kitchen operating 7 days a week, serving 600 hot meals per day to residents with no access to cooking fuel or food supplies. Ran for 38 consecutive days.',
    impact:      '22,800 meals served',
    location:    'Nuseirat',
    tag:         'South Gaza',
  },
  {
    id:          5,
    date:        'October 2024',
    title:       'First South Gaza Relief Convoy',
    description: 'Our inaugural operations in South Gaza — a convoy delivering food staples, medicine, and hygiene supplies to 300 families. Established ground contacts and volunteer coordination network.',
    impact:      '300 families reached',
    location:    'Khan Younis',
    tag:         'South Gaza',
  },
]

const SOUTH_STATS: StatItem[] = [
  { label: 'Families Served',   value: '1,580+',   icon: Users    },
  { label: 'Meals Distributed', value: '22,800+',  icon: Package  },
  { label: 'Water Delivered',   value: '80,000 L', icon: Droplets },
  { label: 'Active Volunteers', value: '14',        icon: Heart    },
]

// ── North Gaza data ───────────────────────────────────────────────────────────

const NORTH_ENTRIES: MissionEntry[] = [
  {
    id:          1,
    date:        'March 2025',
    title:       'Emergency Food Airdrop Supplement',
    description: 'With roads to northern Gaza severely restricted, we coordinated supply runs through verified local networks to reach families in Jabalia and Beit Lahiya who had been cut off for weeks.',
    impact:      'Fed 340 families',
    location:    'Jabalia',
    tag:         'North Gaza',
  },
  {
    id:          2,
    date:        'January 2025',
    title:       'Medical Supply Delivery',
    description: 'Critical medical supplies — wound dressings, antibiotics, and insulin — delivered through partner contacts to a field clinic serving hundreds of patients with no other access to healthcare.',
    impact:      '400+ patients supported',
    location:    'Beit Lahiya',
    tag:         'North Gaza',
  },
  {
    id:          3,
    date:        'November 2024',
    title:       'Sanitation & Hygiene Kits',
    description: 'Distributed 1,400 hygiene kits — soap, toothbrushes, sanitiser, and feminine hygiene products — to families in overcrowded shelters facing rapidly deteriorating sanitation conditions.',
    impact:      '1,400 kits distributed',
    location:    'Gaza City',
    tag:         'North Gaza',
  },
  {
    id:          4,
    date:        'October 2024',
    title:       'First North Gaza Network Established',
    description: 'Built a trusted volunteer coordination network inside northern Gaza. Completed first direct food transfer — 5 tonnes of staple foods reaching families who had not received outside aid in over two weeks.',
    impact:      '220 families reached',
    location:    'Jabalia',
    tag:         'North Gaza',
  },
]

const NORTH_STATS: StatItem[] = [
  { label: 'Families Served',    value: '960+',   icon: Users      },
  { label: 'Hygiene Kits',       value: '1,400+', icon: Package    },
  { label: 'Patients Supported', value: '400+',   icon: Heart      },
  { label: 'Active Volunteers',  value: '9',       icon: TrendingUp },
]

// ── Refugees data ─────────────────────────────────────────────────────────────

const REFUGEE_MEDICAL: MissionEntry[] = [
  {
    id:          1,
    date:        'April 2025',
    title:       'Medical Cost Coverage — Cancer Patients',
    description: 'Covered treatment costs for three Palestinian patients receiving cancer care abroad after being evacuated from Gaza. Funds covered chemotherapy sessions, medications, and travel for a caregiver.',
    impact:      '3 families supported',
    location:    'Egypt / Turkey',
    tag:         'Medical Refugees',
  },
  {
    id:          4,
    date:        'November 2024',
    title:       'Dialysis Patient Support',
    description: 'Coordinated ongoing financial support for two Gazan patients requiring dialysis treatment outside Gaza. Covered medical bills, transport, and living expenses for accompanying family members.',
    impact:      '2 patients sustained',
    location:    'Jordan',
    tag:         'Medical Refugees',
  },
]

const REFUGEE_DISPLACED: MissionEntry[] = [
  {
    id:          2,
    date:        'March 2025',
    title:       'Housing Assistance — Displaced Families',
    description: 'Provided rental assistance to seven families who fled Gaza and are rebuilding lives in Egypt. Covered three months of housing costs while families stabilised and sought longer-term solutions.',
    impact:      '7 families housed',
    location:    'Cairo, Egypt',
    tag:         'Displaced Refugees',
  },
  {
    id:          3,
    date:        'January 2025',
    title:       'Essential Supplies — New Arrivals',
    description: 'Distributed essential supply packages — clothing, bedding, kitchen items, and hygiene goods — to newly displaced Palestinian families arriving in Egypt with almost nothing.',
    impact:      '45 families equipped',
    location:    'Alexandria, Egypt',
    tag:         'Displaced Refugees',
  },
]

const REFUGEE_STATS: StatItem[] = [
  { label: 'Families Supported', value: '55+', icon: Users   },
  { label: 'Medical Cases',      value: '5',   icon: Heart   },
  { label: 'Housing Provided',   value: '7',   icon: Home    },
  { label: 'Supply Kits',        value: '45+', icon: Package },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function thumb(item: MediaItem): string {
  if (item.type === 'video' && item.youtube_video_id)
    return `https://img.youtube.com/vi/${item.youtube_video_id}/hqdefault.jpg`
  return item.thumbnail_url ?? item.url
}

function parseEntryMonth(dateStr: string): { year: number; month: number } | null {
  const parts = dateStr.trim().split(' ')
  if (parts.length !== 2) return null
  const month = MONTH_MAP[parts[0].toLowerCase()]
  const year  = parseInt(parts[1], 10)
  if (month === undefined || isNaN(year)) return null
  return { year, month }
}

function getEntryMedia(
  allMedia:     MediaItem[],
  entry:        MissionEntry,
  camp:         MediaCamp,
  isMostRecent: boolean,
  limit = 3,
): MediaItem[] {
  const em = parseEntryMonth(entry.date)
  if (!em) return []

  const entryCenter = new Date(em.year, em.month, 15)
  const WINDOW_MS   = 45 * 24 * 60 * 60 * 1000 // 45 days

  return allMedia
    .filter(item => {
      if (item.camp !== camp) return false
      if (!item.captured_at) return isMostRecent // null dates → most recent entry only
      const d = new Date(item.captured_at)
      return Math.abs(d.getTime() - entryCenter.getTime()) <= WINDOW_MS
    })
    .slice(0, limit)
}

function slugToCategory(slug: string): CategoryFilter {
  return CATEGORY_OPTIONS.find(o => o.slug === slug)?.dbValue ?? 'all'
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ── MediaLightbox ─────────────────────────────────────────────────────────────

function MediaLightbox({
  initialItem,
  items,
  onClose,
}: {
  initialItem: MediaItem
  items:       MediaItem[]
  onClose:     () => void
}) {
  const [idx, setIdx] = useState(() => Math.max(0, items.findIndex(i => i.id === initialItem.id)))
  const current  = items[idx] ?? initialItem
  const hasPrev  = idx > 0
  const hasNext  = idx < items.length - 1

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape')                  onClose()
      if (e.key === 'ArrowLeft'  && hasPrev)   setIdx(i => i - 1)
      if (e.key === 'ArrowRight' && hasNext)   setIdx(i => i + 1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, hasPrev, hasNext])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/92" onClick={onClose} />

      {hasPrev && (
        <button
          onClick={() => setIdx(i => i - 1)}
          className="absolute left-3 md:left-6 z-20 w-10 h-10 rounded-full bg-chalk/10 hover:bg-chalk/20 flex items-center justify-center text-chalk transition-colors cursor-pointer"
          aria-label="Previous"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {hasNext && (
        <button
          onClick={() => setIdx(i => i + 1)}
          className="absolute right-3 md:right-6 z-20 w-10 h-10 rounded-full bg-chalk/10 hover:bg-chalk/20 flex items-center justify-center text-chalk transition-colors cursor-pointer"
          aria-label="Next"
        >
          <ChevronRight size={20} />
        </button>
      )}

      <div className="relative z-10 w-full max-w-3xl rounded-2xl overflow-hidden bg-ink shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-chalk hover:bg-black/70 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {current.type === 'video' && current.youtube_video_id ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${current.youtube_video_id}?autoplay=1`}
              title={current.title}
              allow="autoplay; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : current.type === 'video' ? (
          <div className="flex items-center justify-center py-16 bg-black/30">
            <div className="text-center">
              <Play size={32} className="text-chalk/20 mx-auto mb-3" />
              <p className="font-sans text-sm text-chalk/40">Video unavailable — YouTube ID missing</p>
            </div>
          </div>
        ) : (
          <img
            src={current.url}
            alt={current.title}
            className="w-full max-h-[65vh] object-contain bg-black"
          />
        )}

        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl text-chalk mb-1">{current.title}</h3>
            {current.description && (
              <p className="font-sans text-sm text-chalk/50 leading-relaxed">{current.description}</p>
            )}
          </div>
          {items.length > 1 && (
            <span className="font-sans text-xs text-chalk/30 shrink-0 mt-1">
              {idx + 1} / {items.length}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── InlineMediaStrip ──────────────────────────────────────────────────────────

function InlineMediaStrip({
  media,
  onOpen,
  onViewAll,
}: {
  media:     MediaItem[]
  onOpen:    (item: MediaItem) => void
  onViewAll: () => void
}) {
  if (media.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-black/6">
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-sans text-[11px] text-ink/35 uppercase tracking-widest">Photos &amp; Videos</span>
        <button
          onClick={onViewAll}
          className="font-sans text-xs text-rouge hover:text-rouge-light transition-colors cursor-pointer"
        >
          View all media →
        </button>
      </div>
      <div className="flex gap-2">
        {media.map(item => (
          <button
            key={item.id}
            onClick={() => onOpen(item)}
            className="shrink-0 relative w-24 h-20 rounded-xl overflow-hidden bg-black/8 group cursor-pointer"
          >
            <img
              src={thumb(item)}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/25">
                <div className="w-7 h-7 bg-ink/60 group-hover:bg-rouge/80 rounded-full flex items-center justify-center transition-colors">
                  <Play size={10} className="text-chalk ml-0.5" fill="white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── StatsBar ──────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-chalk rounded-2xl border border-black/8 shadow-sm p-5 text-center">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-forest/10 mb-3">
            <Icon size={16} className="text-forest" />
          </div>
          <p className="font-display text-3xl text-ink leading-none mb-1">{value}</p>
          <p className="font-sans text-xs text-ink/45 leading-snug">{label}</p>
        </div>
      ))}
    </div>
  )
}

// ── SectionIntro ──────────────────────────────────────────────────────────────

function SectionIntro({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <div className="mb-10">
      <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-2">{tag}</p>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-6 w-1 rounded-full bg-rouge shrink-0" />
        <h2 className="font-display text-3xl text-ink">{title}</h2>
      </div>
      <p className="font-serif text-lg text-ink/60 leading-relaxed max-w-2xl">{body}</p>
    </div>
  )
}

// ── TimelineEntryCard ─────────────────────────────────────────────────────────

function TimelineEntryCard({
  entry,
  last,
  entryMedia,
  onOpenMedia,
  onViewAll,
}: {
  entry:      MissionEntry
  last:       boolean
  entryMedia: MediaItem[]
  onOpenMedia: (item: MediaItem) => void
  onViewAll:  () => void
}) {
  return (
    <div className="relative flex gap-5 pb-10">
      {!last && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-black/10" />
      )}
      <div className="relative z-10 mt-1 shrink-0 w-6 h-6 rounded-full bg-rouge border-4 border-chalk-off shadow-sm" />
      <div className="flex-1 bg-chalk rounded-2xl border border-black/8 shadow-sm p-5 -mt-0.5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <span className="font-sans text-xs text-ink/40">{entry.date}</span>
            <h3 className="font-display text-lg text-ink leading-snug mt-0.5">{entry.title}</h3>
          </div>
          <span className="font-sans text-xs px-2.5 py-1 rounded-full bg-rouge/8 text-rouge border border-rouge/15 shrink-0">
            {entry.tag}
          </span>
        </div>
        <p className="font-sans text-sm text-ink/55 leading-relaxed mb-4">{entry.description}</p>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-1 font-sans text-xs text-ink/40">
            <MapPin size={11} /> {entry.location}
          </span>
          <span className="flex items-center gap-1.5 font-sans text-xs font-medium text-forest bg-forest/10 px-2.5 py-1 rounded-full">
            <Users size={10} /> {entry.impact}
          </span>
        </div>
        <InlineMediaStrip
          media={entryMedia}
          onOpen={onOpenMedia}
          onViewAll={onViewAll}
        />
      </div>
    </div>
  )
}

// ── CampSection ───────────────────────────────────────────────────────────────

function CampSection({
  campValue,
  intro,
  stats,
  entries,
  subSections,
  timelineMedia,
  onOpenMedia,
  onViewAll,
  showDivider,
}: {
  campValue:     MediaCamp
  intro:         { tag: string; title: string; body: string }
  stats:         StatItem[]
  entries?:      MissionEntry[]
  subSections?:  { icon: React.ElementType; iconColor: string; bgColor: string; title: string; subtitle: string; entries: MissionEntry[] }[]
  timelineMedia: MediaItem[]
  onOpenMedia:   (item: MediaItem, items: MediaItem[]) => void
  onViewAll:     () => void
  showDivider:   boolean
}) {
  return (
    <div>
      {showDivider && <div className="border-t border-black/8 mb-14" />}
      <SectionIntro {...intro} />
      <StatsBar stats={stats} />

      {/* Standard entries */}
      {entries && (
        <div className="relative max-w-2xl">
          {entries.map((entry, i) => {
            const em = getEntryMedia(timelineMedia, entry, campValue, i === 0)
            return (
              <TimelineEntryCard
                key={entry.id}
                entry={entry}
                last={i === entries.length - 1}
                entryMedia={em}
                onOpenMedia={item => onOpenMedia(item, em)}
                onViewAll={onViewAll}
              />
            )
          })}
        </div>
      )}

      {/* Sub-section entries (refugees layout) */}
      {subSections && subSections.map(sub => {
        const SubIcon = sub.icon
        return (
          <div key={sub.title} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-8 rounded-xl ${sub.bgColor} flex items-center justify-center shrink-0`}>
                <SubIcon size={15} className={sub.iconColor} />
              </div>
              <div>
                <h3 className="font-display text-xl text-ink">{sub.title}</h3>
                <p className="font-sans text-xs text-ink/45 mt-0.5">{sub.subtitle}</p>
              </div>
            </div>
            <div className="relative max-w-2xl">
              {sub.entries.map((entry, i) => {
                const em = getEntryMedia(timelineMedia, entry, campValue, i === 0)
                return (
                  <TimelineEntryCard
                    key={entry.id}
                    entry={entry}
                    last={i === sub.entries.length - 1}
                    entryMedia={em}
                    onOpenMedia={item => onOpenMedia(item, em)}
                    onViewAll={onViewAll}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── GridCard ──────────────────────────────────────────────────────────────────

function GridCard({
  item,
  onClick,
}: {
  item:    MediaItem
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-chalk rounded-2xl border border-black/8 overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left w-full cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden bg-black/5">
        <img
          src={thumb(item)}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/20 group-hover:bg-ink/30 transition-colors">
            <div className="w-12 h-12 bg-ink/60 group-hover:bg-rouge/80 rounded-full flex items-center justify-center transition-colors">
              <Play size={18} className="text-chalk ml-1" fill="white" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`font-sans text-[10px] px-2 py-0.5 rounded-full font-medium ${CAMP_BADGE[item.camp]}`}>
            {CAMP_LABELS[item.camp]}
          </span>
          <span className="font-sans text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-ink/50">
            {item.category}
          </span>
        </div>
        <h4 className="font-display text-base text-ink leading-snug mb-1 line-clamp-2">{item.title}</h4>
        {item.captured_at && (
          <p className="font-sans text-xs text-ink/40">{formatDate(item.captured_at)}</p>
        )}
      </div>
    </button>
  )
}

// ── GridView ──────────────────────────────────────────────────────────────────

function GridView({
  items,
  page,
  totalPages,
  loading,
  onPage,
  onOpenMedia,
}: {
  items:       MediaItem[]
  page:        number
  totalPages:  number
  loading:     boolean
  onPage:      (p: number) => void
  onOpenMedia: (item: MediaItem, items: MediaItem[]) => void
}) {
  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center mb-4">
          <Grid3X3 size={24} className="text-ink/20" />
        </div>
        <p className="font-display text-xl text-ink/40 mb-1">No media yet</p>
        <p className="font-sans text-sm text-ink/30">Media will appear here once published.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Overlay spinner during filter changes (items already loaded) */}
      {loading && items.length > 0 && (
        <div className="absolute inset-0 z-10 bg-chalk/70 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
          <Loader2 size={24} className="animate-spin text-ink/40" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && items.length === 0
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="bg-chalk rounded-2xl border border-black/8 overflow-hidden animate-pulse">
                <div className="aspect-video bg-black/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-black/5 rounded w-1/3" />
                  <div className="h-4 bg-black/5 rounded w-3/4" />
                  <div className="h-3 bg-black/5 rounded w-1/2" />
                </div>
              </div>
            ))
          : items.map(item => (
              <GridCard
                key={item.id}
                item={item}
                onClick={() => onOpenMedia(item, items)}
              />
            ))
        }
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-1">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 0}
            className="p-2 rounded-lg border border-black/12 text-ink/50 hover:text-ink hover:border-black/25 hover:bg-black/3 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onPage(i)}
              className={`min-w-[36px] h-9 px-2 rounded-lg border font-sans text-sm transition-all cursor-pointer ${
                i === page
                  ? 'border-ink bg-ink text-chalk'
                  : 'border-black/12 text-ink/50 hover:text-ink hover:border-black/25 hover:bg-black/3'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages - 1}
            className="p-2 rounded-lg border border-black/12 text-ink/50 hover:text-ink hover:border-black/25 hover:bg-black/3 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

// ── FilterSidebar ─────────────────────────────────────────────────────────────

function FilterSidebar({
  camp,
  categorySlug,
  onCampChange,
  onCategoryChange,
}: {
  camp:             CampFilter
  categorySlug:     string
  onCampChange:     (v: CampFilter) => void
  onCategoryChange: (slug: string) => void
}) {
  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-24 space-y-7">

        {/* CAMPS */}
        <div>
          <p className="font-sans text-[10px] text-ink/35 uppercase tracking-widest mb-3">Camps</p>
          <div className="space-y-0.5">
            {CAMP_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onCampChange(value)}
                className={`w-full text-left px-3 py-2 rounded-lg font-sans text-sm transition-colors cursor-pointer ${
                  camp === value
                    ? 'bg-rouge/10 text-rouge font-medium'
                    : 'text-ink/60 hover:text-ink hover:bg-black/4'
                }`}
              >
                {camp === value && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rouge mr-2 mb-0.5" />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* CATEGORIES */}
        <div>
          <p className="font-sans text-[10px] text-ink/35 uppercase tracking-widest mb-3">Categories</p>
          <div className="space-y-0.5">
            {CATEGORY_OPTIONS.map(({ slug, label }) => (
              <button
                key={slug}
                onClick={() => onCategoryChange(slug)}
                className={`w-full text-left px-3 py-2 rounded-lg font-sans text-sm transition-colors cursor-pointer ${
                  categorySlug === slug
                    ? 'bg-rouge/10 text-rouge font-medium'
                    : 'text-ink/60 hover:text-ink hover:bg-black/4'
                }`}
              >
                {categorySlug === slug && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rouge mr-2 mb-0.5" />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

// ── MobileFilters ─────────────────────────────────────────────────────────────

function MobileFilters({
  camp,
  categorySlug,
  onCampChange,
  onCategoryChange,
}: {
  camp:             CampFilter
  categorySlug:     string
  onCampChange:     (v: CampFilter) => void
  onCategoryChange: (slug: string) => void
}) {
  return (
    <div className="lg:hidden border-b border-black/8 bg-chalk/95 backdrop-blur">
      {/* Camp pills */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-none">
        {CAMP_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onCampChange(value)}
            className={`shrink-0 px-4 py-1.5 rounded-full font-sans text-sm transition-colors cursor-pointer ${
              camp === value
                ? 'bg-rouge text-chalk'
                : 'bg-black/6 text-ink/60 hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto px-5 py-2.5 pb-3 scrollbar-none border-t border-black/5">
        {CATEGORY_OPTIONS.map(({ slug, label }) => (
          <button
            key={slug}
            onClick={() => onCategoryChange(slug)}
            className={`shrink-0 px-3.5 py-1 rounded-full font-sans text-xs transition-colors cursor-pointer ${
              categorySlug === slug
                ? 'bg-rouge/10 text-rouge border border-rouge/20 font-medium'
                : 'bg-black/4 text-ink/55 hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Timeline() {
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Atomic filter state — initialized from URL once on mount ─────────────────
  const [filters, setFiltersState] = useState(() => ({
    camp:         (searchParams.get('camp')     ?? 'all') as CampFilter,
    categorySlug: searchParams.get('category') ?? 'all',
    view:         (searchParams.get('view')     ?? 'grid') as ViewMode,
  }))

  const category    = slugToCategory(filters.categorySlug) as CategoryFilter
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Media for inline timeline strips ────────────────────────────────────────
  const [timelineMedia, setTimelineMedia] = useState<MediaItem[]>([])

  // ── Grid state ───────────────────────────────────────────────────────────────
  const [gridItems,      setGridItems]      = useState<MediaItem[]>([])
  const [gridPage,       setGridPage]       = useState(0)
  const [gridTotalCount, setGridTotalCount] = useState(0)
  const [gridLoading,    setGridLoading]    = useState(false)
  const gridTotalPages = Math.max(1, Math.ceil(gridTotalCount / PAGE_SIZE))

  // ── DB timeline entries — fallback to hardcoded if table is empty ────────────
  const [dbEntriesByCamp, setDbEntriesByCamp] = useState<Partial<Record<MediaCamp, MissionEntry[]>>>({})

  // ── Lightbox ─────────────────────────────────────────────────────────────────
  const [lightbox, setLightbox] = useState<{ item: MediaItem; items: MediaItem[] } | null>(null)

  // ── Atomic filter update with 150ms debounce ─────────────────────────────────
  const setFilter = (key: keyof typeof filters, value: string) => {
    const isContentFilter = key === 'camp' || key === 'categorySlug'
    if (isContentFilter && filters.view === 'grid') setGridLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      // React 18 batches all state updates inside setTimeout automatically
      setFiltersState(prev => ({ ...prev, [key]: value }))
      if (isContentFilter) setGridPage(0)
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.set(key === 'categorySlug' ? 'category' : key, value)
        return next
      }, { replace: true })
    }, 150)
  }

  // ── Open grid view for a camp (direct nav action — no debounce) ──────────────
  const openGrid = (campValue?: CampFilter) => {
    const campUpdate = campValue && campValue !== 'all' ? { camp: campValue } : {}
    setFiltersState(prev => ({ ...prev, view: 'grid' as ViewMode, ...campUpdate }))
    setGridPage(0)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('view', 'grid')
      if (campValue && campValue !== 'all') next.set('camp', campValue)
      return next
    }, { replace: true })
  }

  // ── Fetch: DB timeline entries with hardcoded fallback ───────────────────────
  useEffect(() => {
    const MONTH_NAMES = ['January','February','March','April','May','June',
                         'July','August','September','October','November','December']
    supabase
      .from('timeline_entries')
      .select('*')
      .eq('is_published', true)
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (!data || data.length === 0) return // empty → keep hardcoded fallback
        const grouped: Partial<Record<MediaCamp, MissionEntry[]>> = {}
        ;(data as Record<string, unknown>[]).forEach(row => {
          const c = ((row.camp as string) ?? 'general') as MediaCamp
          if (!grouped[c]) grouped[c] = []
          const d = new Date(row.date as string)
          grouped[c]!.push({
            id:          row.id as number,
            date:        `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
            title:       row.title as string,
            description: row.description as string,
            impact:      (row.impact_metric as string) ?? '',
            location:    (row.location as string) ?? '',
            tag:         (row.tag as string) ?? CAMP_LABELS[c] ?? c,
          })
        })
        setDbEntriesByCamp(grouped)
      })
  }, [])

  // ── Fetch: timeline strip media (camp-filtered server-side) ──────────────────
  useEffect(() => {
    if (filters.view !== 'timeline') return
    let q = supabase
      .from('media_items')
      .select('*')
      .eq('is_published', true)
      .order('captured_at', { ascending: false })
      .limit(200)
    if (filters.camp !== 'all') q = q.eq('camp', filters.camp)
    if (category      !== 'all') q = q.eq('category', category)
    q.then(({ data, error }) => {
      if (error) { console.error('[Timeline] media fetch error:', error.message); return }
      setTimelineMedia((data as MediaItem[]) ?? [])
    })
  }, [filters.camp, filters.categorySlug, filters.view])

  // ── Fetch: grid media (single effect — no race condition) ────────────────────
  useEffect(() => {
    if (filters.view !== 'grid') return
    setGridLoading(true)
    let q = supabase
      .from('media_items')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('captured_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(gridPage * PAGE_SIZE, gridPage * PAGE_SIZE + PAGE_SIZE - 1)
    if (filters.camp !== 'all') q = q.eq('camp', filters.camp)
    if (category      !== 'all') q = q.eq('category', category)
    q.then(({ data, error, count }) => {
      if (error) { console.error('[Grid] fetch error:', error.message) }
      else {
        setGridItems((data ?? []) as MediaItem[])
        setGridTotalCount(count ?? 0)
      }
      setGridLoading(false)
    })
  }, [filters.camp, filters.categorySlug, filters.view, gridPage])

  const goToGridPage = (p: number) => {
    setGridPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Sections config ─────────────────────────────────────────────────────────

  const allSections = [
    {
      campValue: 'south_gaza' as MediaCamp,
      intro: {
        tag:   'South Gaza Camp',
        title: 'Operations in South Gaza',
        body:  'Our South Gaza camp has been active since October 2024 — providing food, clean water, and essential supplies to displaced families in Khan Younis, Rafah, and the surrounding areas.',
      },
      stats:   SOUTH_STATS,
      entries: dbEntriesByCamp['south_gaza'] ?? SOUTH_ENTRIES,
    },
    {
      campValue: 'north_gaza' as MediaCamp,
      intro: {
        tag:   'North Gaza Camp',
        title: 'Operations in North Gaza',
        body:  'Northern Gaza faces the most severe access restrictions. Our North Gaza network operates through trusted local contacts to reach Jabalia, Beit Lahiya, and Gaza City with food, medicine, and supplies.',
      },
      stats:   NORTH_STATS,
      entries: dbEntriesByCamp['north_gaza'] ?? NORTH_ENTRIES,
    },
    {
      campValue: 'refugees' as MediaCamp,
      intro: {
        tag:   'Gazan Refugees',
        title: 'Supporting Palestinians Beyond Borders',
        body:  'Many Palestinians have been forced to leave Gaza — for urgent medical treatment, or as refugees escaping the conflict entirely. We support these families wherever they are.',
      },
      stats:      REFUGEE_STATS,
      entries:    undefined,
      subSections: [
        {
          icon:      Heart,
          iconColor: 'text-rouge',
          bgColor:   'bg-rouge/10',
          title:     'Medical Refugees',
          subtitle:  'Palestinians who left Gaza for medical care and need support during treatment abroad',
          entries:   REFUGEE_MEDICAL,
        },
        {
          icon:      Home,
          iconColor: 'text-forest',
          bgColor:   'bg-forest/10',
          title:     'Displaced Refugees',
          subtitle:  'Families who fled and are rebuilding lives outside Gaza — we help them stabilise',
          entries:   REFUGEE_DISPLACED,
        },
      ],
    },
  ]

  const visibleSections = filters.camp === 'all'
    ? allSections
    : allSections.filter(s => s.campValue === filters.camp)

  return (
    <div className="bg-chalk-off min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-ink overflow-hidden">
        <div className="h-0.5 flex">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/30" />
          <div className="flex-1 bg-forest" />
        </div>
        <div
          className="absolute top-0 left-0 w-1/3 h-full bg-rouge/7 pointer-events-none"
          style={{ clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0 100%)' }}
        />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-forest/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 py-20">
          <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-3">Active Operations</p>
          <h1 className="font-display text-5xl md:text-6xl text-chalk leading-tight mb-4">
            Our Work on<br />
            <span className="text-rouge">the Ground</span>
          </h1>
          <p className="font-serif text-xl text-chalk/50 leading-relaxed mb-10 max-w-xl">
            Active operations across Gaza and with displaced Palestinian refugees —
            documented mission by mission.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: '2 Active Camps',      color: 'bg-rouge/15 border-rouge/25 text-rouge/90'   },
              { label: 'North & South Gaza',  color: 'bg-white/6 border-white/12 text-white/60'    },
              { label: 'Refugees Supported',  color: 'bg-forest/15 border-forest/25 text-forest/90' },
            ].map(({ label, color }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-sans text-sm ${color}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile filters ─────────────────────────────────────────────── */}
      <MobileFilters
        camp={filters.camp}
        categorySlug={filters.categorySlug}
        onCampChange={v => setFilter('camp', v)}
        onCategoryChange={slug => setFilter('categorySlug', slug)}
      />

      {/* ── Main layout ────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 py-10 flex gap-10">

        {/* Desktop sidebar */}
        <FilterSidebar
          camp={filters.camp}
          categorySlug={filters.categorySlug}
          onCampChange={v => setFilter('camp', v)}
          onCategoryChange={slug => setFilter('categorySlug', slug)}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* ── Top bar ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">

            {/* Camp tabs (desktop) */}
            <div className="hidden lg:flex items-center gap-1">
              {CAMP_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter('camp', value)}
                  className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors cursor-pointer ${
                    filters.camp === value
                      ? 'bg-rouge text-chalk'
                      : 'text-ink/50 hover:text-ink hover:bg-black/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-black/5 rounded-lg p-1 ml-auto relative">
              {/* sliding active indicator */}
              <div
                className="absolute top-1 bottom-1 rounded-md bg-chalk shadow-sm transition-all duration-300 ease-in-out"
                style={{
                  left:  filters.view === 'timeline' ? '4px'  : '50%',
                  right: filters.view === 'timeline' ? '50%'  : '4px',
                }}
              />
              <button
                onClick={() => setFilter('view', 'timeline')}
                className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-sm transition-colors duration-200 cursor-pointer ${
                  filters.view === 'timeline' ? 'text-ink' : 'text-ink/50 hover:text-ink'
                }`}
              >
                <LayoutList size={14} />
                Timeline
              </button>
              <button
                onClick={() => setFilter('view', 'grid')}
                className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-sm transition-colors duration-200 cursor-pointer ${
                  filters.view === 'grid' ? 'text-ink' : 'text-ink/50 hover:text-ink'
                }`}
              >
                <Grid3X3 size={14} />
                Grid
              </button>
            </div>
          </div>

          {/* ── Timeline view ────────────────────────────────────────── */}
          {filters.view === 'timeline' && (
            <div>
              {visibleSections.map((section, si) => (
                <CampSection
                  key={section.campValue}
                  campValue={section.campValue}
                  intro={section.intro}
                  stats={section.stats}
                  entries={section.entries}
                  subSections={section.subSections}
                  timelineMedia={timelineMedia}
                  onOpenMedia={(item, items) => setLightbox({ item, items })}
                  onViewAll={() => openGrid(section.campValue)}
                  showDivider={si > 0}
                />
              ))}
            </div>
          )}

          {/* ── Grid view ────────────────────────────────────────────── */}
          {filters.view === 'grid' && (
            <GridView
              items={gridItems}
              page={gridPage}
              totalPages={gridTotalPages}
              loading={gridLoading}
              onPage={goToGridPage}
              onOpenMedia={(item, items) => setLightbox({ item, items })}
            />
          )}
        </div>
      </div>

      {/* ── Lightbox ───────────────────────────────────────────────────── */}
      {lightbox && (
        <MediaLightbox
          initialItem={lightbox.item}
          items={lightbox.items}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
