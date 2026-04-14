import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Users, Droplets, Package, Heart, Home, TrendingUp, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { MediaItem, MediaCamp } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface MissionEntry {
  id:          number
  date:        string
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
  { label: 'Families Served',     value: '1,580+', icon: Users    },
  { label: 'Meals Distributed',   value: '22,800+', icon: Package  },
  { label: 'Water Delivered',     value: '80,000 L', icon: Droplets },
  { label: 'Active Volunteers',   value: '14',      icon: Heart    },
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
  { label: 'Families Served',     value: '960+',    icon: Users    },
  { label: 'Hygiene Kits',        value: '1,400+',  icon: Package  },
  { label: 'Patients Supported',  value: '400+',    icon: Heart    },
  { label: 'Active Volunteers',   value: '9',       icon: TrendingUp },
]

// ── Refugees data ─────────────────────────────────────────────────────────────

const REFUGEE_ENTRIES: MissionEntry[] = [
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

const REFUGEE_STATS: StatItem[] = [
  { label: 'Families Supported',  value: '55+',  icon: Users   },
  { label: 'Medical Cases',       value: '5',    icon: Heart   },
  { label: 'Housing Provided',    value: '7',    icon: Home    },
  { label: 'Supply Kits',         value: '45+',  icon: Package },
]

// ── Tab config ────────────────────────────────────────────────────────────────

type TabKey = 'south' | 'north' | 'refugees'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'south',    label: 'South Gaza Camp'  },
  { key: 'north',    label: 'North Gaza Camp'  },
  { key: 'refugees', label: 'Gazan Refugees'   },
]

// ── Media strip helpers ───────────────────────────────────────────────────────

function thumb(item: MediaItem): string {
  if (item.type === 'video' && item.youtube_video_id)
    return `https://img.youtube.com/vi/${item.youtube_video_id}/hqdefault.jpg`
  return item.thumbnail_url ?? item.url
}

// ── Lightbox (shared with timeline) ──────────────────────────────────────────

function MediaLightbox({
  item,
  onClose,
}: {
  item: MediaItem
  onClose: () => void
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/92" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-2xl overflow-hidden bg-ink shadow-2xl">
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
          <img src={item.url} alt={item.title} className="w-full max-h-[65vh] object-contain bg-black" />
        )}
        <div className="p-5">
          <h3 className="font-display text-xl text-chalk mb-1">{item.title}</h3>
          {item.description && (
            <p className="font-sans text-sm text-chalk/50 leading-relaxed">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Media Strip ───────────────────────────────────────────────────────────────

function MediaStrip({ camp, campSlug }: { camp: MediaCamp; campSlug: string }) {
  const [items,     setItems]    = useState<MediaItem[]>([])
  const [lightbox,  setLightbox] = useState<MediaItem | null>(null)

  useEffect(() => {
    supabase
      .from('media_items')
      .select('*')
      .eq('is_published', true)
      .eq('camp', camp)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setItems((data as MediaItem[]) ?? []))
  }, [camp])

  if (items.length === 0) return null

  return (
    <div className="mt-10 mb-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-0.5 rounded-full bg-rouge" />
          <h3 className="font-display text-lg text-ink">Photos &amp; Videos</h3>
        </div>
        <Link
          to={`/gallery?camp=${campSlug}`}
          className="font-sans text-xs text-rouge hover:text-rouge-light transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setLightbox(item)}
            className="shrink-0 relative w-36 h-28 rounded-xl overflow-hidden bg-black/8 group"
          >
            <img
              src={thumb(item)}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
                <div className="w-8 h-8 bg-ink/60 group-hover:bg-rouge/80 rounded-full flex items-center justify-center transition-colors">
                  <Play size={13} className="text-chalk ml-0.5" fill="white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {lightbox && <MediaLightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TimelineEntry({ entry, last = false }: { entry: MissionEntry; last?: boolean }) {
  return (
    <div className="relative flex gap-5 pb-10">
      {/* Vertical line */}
      {!last && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-black/10" />
      )}

      {/* Dot */}
      <div className="relative z-10 mt-1 shrink-0 w-6 h-6 rounded-full bg-rouge border-4 border-chalk-off shadow-sm" />

      {/* Card */}
      <div className="flex-1 bg-white rounded-2xl border border-black/8 shadow-sm p-5 -mt-0.5">
        {/* Header */}
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
      </div>
    </div>
  )
}

function StatsBar({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-white rounded-2xl border border-black/8 shadow-sm p-5 text-center">
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

// ── Refugee tab ───────────────────────────────────────────────────────────────

function RefugeeTab() {
  const medical   = REFUGEE_ENTRIES.filter(e => e.tag === 'Medical Refugees')
  const displaced = REFUGEE_ENTRIES.filter(e => e.tag === 'Displaced Refugees')

  return (
    <>
      <SectionIntro
        tag="Gazan Refugees"
        title="Supporting Palestinians Beyond Borders"
        body="Many Palestinians have been forced to leave Gaza — for urgent medical treatment, or as refugees escaping the conflict entirely. We support these families wherever they are."
      />

      <StatsBar stats={REFUGEE_STATS} />

      {/* Medical sub-section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-rouge/10 flex items-center justify-center shrink-0">
            <Heart size={15} className="text-rouge" />
          </div>
          <div>
            <h3 className="font-display text-xl text-ink">Medical Refugees</h3>
            <p className="font-sans text-xs text-ink/45 mt-0.5">Palestinians who left Gaza for medical care and need support during treatment abroad</p>
          </div>
        </div>
        <div className="relative">
          {medical.map((entry, i) => (
            <TimelineEntry key={entry.id} entry={entry} last={i === medical.length - 1} />
          ))}
        </div>
      </div>

      {/* Displaced sub-section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-forest/10 flex items-center justify-center shrink-0">
            <Home size={15} className="text-forest" />
          </div>
          <div>
            <h3 className="font-display text-xl text-ink">Displaced Refugees</h3>
            <p className="font-sans text-xs text-ink/45 mt-0.5">Families who fled and are rebuilding lives outside Gaza — we help them stabilise</p>
          </div>
        </div>
        <div className="relative">
          {displaced.map((entry, i) => (
            <TimelineEntry key={entry.id} entry={entry} last={i === displaced.length - 1} />
          ))}
        </div>
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Timeline() {
  const [activeTab, setActiveTab] = useState<TabKey>('south')

  return (
    <div className="bg-chalk-off min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-ink overflow-hidden">
        {/* Flag stripe */}
        <div className="h-0.5 flex">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/30" />
          <div className="flex-1 bg-forest" />
        </div>

        {/* Background shapes */}
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

          {/* Stat badges */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: '2 Active Camps',           color: 'bg-rouge/15 border-rouge/25 text-rouge/90' },
              { label: 'North & South Gaza',        color: 'bg-white/6 border-white/12 text-white/60'  },
              { label: 'Refugees Supported',        color: 'bg-forest/15 border-forest/25 text-forest/90' },
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

      {/* ── Sticky tab switcher ────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-chalk/95 backdrop-blur border-b border-black/8 shadow-sm">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`shrink-0 px-5 py-3 rounded-lg font-sans text-sm font-medium transition-colors min-h-[44px] ${
                  activeTab === key
                    ? 'bg-rouge text-chalk'
                    : 'text-ink/50 hover:text-ink hover:bg-black/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 py-14">

        {/* South Gaza */}
        {activeTab === 'south' && (
          <>
            <SectionIntro
              tag="South Gaza Camp"
              title="Operations in South Gaza"
              body="Our South Gaza camp has been active since October 2024 — providing food, clean water, and essential supplies to displaced families in Khan Younis, Rafah, and the surrounding areas."
            />
            <StatsBar stats={SOUTH_STATS} />
            <div className="relative max-w-2xl">
              {SOUTH_ENTRIES.map((entry, i) => (
                <TimelineEntry key={entry.id} entry={entry} last={i === SOUTH_ENTRIES.length - 1} />
              ))}
            </div>
            <div className="max-w-2xl">
              <MediaStrip camp="south_gaza" campSlug="south_gaza" />
            </div>
          </>
        )}

        {/* North Gaza */}
        {activeTab === 'north' && (
          <>
            <SectionIntro
              tag="North Gaza Camp"
              title="Operations in North Gaza"
              body="Northern Gaza faces the most severe access restrictions. Our North Gaza network operates through trusted local contacts to reach Jabalia, Beit Lahiya, and Gaza City with food, medicine, and supplies."
            />
            <StatsBar stats={NORTH_STATS} />
            <div className="relative max-w-2xl">
              {NORTH_ENTRIES.map((entry, i) => (
                <TimelineEntry key={entry.id} entry={entry} last={i === NORTH_ENTRIES.length - 1} />
              ))}
            </div>
            <div className="max-w-2xl">
              <MediaStrip camp="north_gaza" campSlug="north_gaza" />
            </div>
          </>
        )}

        {/* Refugees */}
        {activeTab === 'refugees' && (
          <div className="max-w-2xl">
            <RefugeeTab />
            <MediaStrip camp="refugees" campSlug="refugees" />
          </div>
        )}
      </div>
    </div>
  )
}
