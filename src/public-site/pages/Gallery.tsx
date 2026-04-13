import { useState } from 'react'
import { X, Play, MapPin, Calendar } from 'lucide-react'

const FILTERS = ['All', 'Images', 'Videos', 'Relief Work', 'Timeline']

const ITEMS = [
  { id: 1, type: 'image', category: 'Relief Work', title: 'Food distribution in Rafah',    location: 'Rafah, Gaza',       date: 'Mar 2025', seed: 'rafah-food'    },
  { id: 2, type: 'video', category: 'Timeline',    title: 'Opening of new relief centre',  location: 'Khan Younis, Gaza', date: 'Feb 2025', seed: 'relief-centre' },
  { id: 3, type: 'image', category: 'Relief Work', title: 'Medical supply handover',       location: 'Gaza City',         date: 'Feb 2025', seed: 'medical-sup'  },
  { id: 4, type: 'image', category: 'Timeline',    title: 'Community kitchen launch',      location: 'Nuseirat, Gaza',    date: 'Jan 2025', seed: 'kitchen-nsr'  },
  { id: 5, type: 'video', category: 'Relief Work', title: 'Winter blanket distribution',   location: 'Deir al-Balah',     date: 'Jan 2025', seed: 'winter-blnkt' },
  { id: 6, type: 'image', category: 'Relief Work', title: 'Clean water delivery',          location: 'Jabalia, Gaza',     date: 'Dec 2024', seed: 'clean-water'  },
  { id: 7, type: 'image', category: 'Timeline',    title: 'First MEND relief convoy',      location: 'Rafah, Gaza',       date: 'Nov 2024', seed: 'mend-convoy'  },
  { id: 8, type: 'video', category: 'Relief Work', title: 'Hygiene kit distribution',      location: 'Gaza City',         date: 'Nov 2024', seed: 'hygiene-kit'  },
  { id: 9, type: 'image', category: 'Timeline',    title: 'Medical screening camp',        location: 'Khan Younis, Gaza', date: 'Oct 2024', seed: 'med-screen'   },
]

type Item = typeof ITEMS[0]

export default function Gallery() {
  const [filter, setFilter]     = useState('All')
  const [lightbox, setLightbox] = useState<Item | null>(null)

  const filtered =
    filter === 'All'     ? ITEMS :
    filter === 'Images'  ? ITEMS.filter(i => i.type === 'image') :
    filter === 'Videos'  ? ITEMS.filter(i => i.type === 'video') :
    ITEMS.filter(i => i.category === filter)

  return (
    <div className="min-h-screen bg-chalk-off">

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="bg-ink text-chalk py-16 px-4 relative overflow-hidden">
        <div className="h-0.5 flex absolute top-0 inset-x-0">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/40" />
          <div className="flex-1 bg-forest" />
        </div>
        <div className="max-w-6xl mx-auto">
          <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-3">Media</p>
          <h1 className="font-display text-5xl text-chalk mb-3">From the Ground</h1>
          <p className="font-serif text-lg text-chalk/50 max-w-xl">
            Real photos and videos from our relief operations — every image tells a story of resilience and hope.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-1 px-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 font-sans text-sm px-4 py-2 rounded-full border transition-colors min-h-[44px] ${
                filter === f
                  ? 'bg-rouge text-chalk border-rouge'
                  : 'bg-white text-ink/60 border-black/15 hover:border-ink/30 hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setLightbox(item)}
              className="group cursor-pointer bg-white rounded-2xl border border-black/8 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-52 overflow-hidden bg-black/10">
                <img
                  src={`https://picsum.photos/seed/${item.seed}/600/400`}
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
                <span className={`absolute top-3 left-3 font-sans text-xs px-2.5 py-1 rounded-full ${
                  item.category === 'Relief Work' ? 'bg-rouge/90 text-chalk' : 'bg-ink/70 text-chalk'
                }`}>
                  {item.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-sans text-sm font-medium text-ink mb-2 leading-snug">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 font-sans text-xs text-ink/40">
                    <MapPin size={11} /> {item.location}
                  </span>
                  <span className="flex items-center gap-1 font-sans text-xs text-ink/40">
                    <Calendar size={11} /> {item.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lightbox ───────────────────────────────────── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/90" onClick={() => setLightbox(null)} />
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-chalk/60 hover:text-chalk transition-colors min-w-[44px] min-h-[44px] flex items-center justify-end"
            >
              <X size={22} />
            </button>
            <div className="rounded-2xl overflow-hidden bg-ink">
              {lightbox.type === 'video' ? (
                <div className="w-full h-[50vh] bg-black/60 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-rouge/80 rounded-full flex items-center justify-center">
                    <Play size={28} className="text-chalk ml-1" fill="white" />
                  </div>
                  <p className="font-sans text-chalk/40 text-sm">Video playback coming soon</p>
                </div>
              ) : (
                <img
                  src={`https://picsum.photos/seed/${lightbox.seed}/1200/700`}
                  alt={lightbox.title}
                  className="w-full max-h-[60vh] object-cover"
                />
              )}
              <div className="p-5">
                <span className="font-sans text-xs text-rouge/80 uppercase tracking-widest">{lightbox.category}</span>
                <h3 className="font-display text-xl text-chalk mt-1 mb-2">{lightbox.title}</h3>
                <div className="flex items-center gap-5">
                  <span className="flex items-center gap-1.5 font-sans text-sm text-chalk/40">
                    <MapPin size={13} /> {lightbox.location}
                  </span>
                  <span className="flex items-center gap-1.5 font-sans text-sm text-chalk/40">
                    <Calendar size={13} /> {lightbox.date}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
