import { useState } from 'react'
import { Play, X, MapPin, Search } from 'lucide-react'

const VIDEOS = [
  {
    id: 1,
    donor:    'Ahmad Al-Rashid',
    location: 'Gaza, Palestine',
    message:  'Because of your kindness, my children ate warm food for the first time in weeks. We pray for you every night and will never forget what you have done for our family.',
    seed:     'gratitude-ahmad',
  },
  {
    id: 2,
    donor:    'Sarah Thompson',
    location: 'Khan Younis, Gaza',
    message:  'The blankets you sent kept us warm through the coldest nights. My family thanks you from the bottom of our hearts — you are our angels from afar.',
    seed:     'gratitude-sarah',
  },
  {
    id: 3,
    donor:    'Yusuf Mansour',
    location: 'Rafah, Palestine',
    message:  'The medicine arrived just in time for my mother. We did not think we would make it through that week. Your donation quite literally saved her life.',
    seed:     'gratitude-yusuf',
  },
  {
    id: 4,
    donor:    'Layla Hassan',
    location: 'Nuseirat, Gaza',
    message:  'I wanted to show you the smile on my daughter\'s face when she received her school supplies. She carried that bag everywhere. This is because of you.',
    seed:     'gratitude-layla',
  },
  {
    id: 5,
    donor:    'Omar Khalil',
    location: 'Jabalia, Gaza',
    message:  'Clean water — such a simple thing, yet it felt like a miracle. Thank you for making it possible for our entire neighbourhood to drink safely again.',
    seed:     'gratitude-omar',
  },
  {
    id: 6,
    donor:    'Fatima Al-Zahra',
    location: 'Gaza City',
    message:  'We set up the community kitchen with your support and fed 200 families today. Every meal is a prayer sent back to you and everyone who gave.',
    seed:     'gratitude-fatima',
  },
  {
    id: 7,
    donor:    'Khalid Rahman',
    location: 'Deir al-Balah, Gaza',
    message:  'My children will grow up knowing the world cared about them. When they ask me how we survived, I will tell them about the strangers who became family.',
    seed:     'gratitude-khalid',
  },
  {
    id: 8,
    donor:    'Nour Saleh',
    location: 'Khan Younis, Gaza',
    message:  'The hygiene kits you sent restored a small sense of dignity in the most difficult time of our lives. Something so simple meant everything to us.',
    seed:     'gratitude-nour',
  },
  {
    id: 9,
    donor:    'Ibrahim Abusneineh',
    location: 'Rafah, Gaza',
    message:  'We received the food package just as our last supplies ran out. I cried with gratitude when I opened it. Your generosity is a light in our darkness.',
    seed:     'gratitude-ibrahim',
  },
]

type Video = typeof VIDEOS[0]

export default function GratitudeWall() {
  const [search, setSearch] = useState('')
  const [modal, setModal]   = useState<Video | null>(null)

  const filtered = VIDEOS.filter(v =>
    v.donor.toLowerCase().includes(search.toLowerCase()) ||
    v.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-chalk-off">

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="bg-ink text-chalk py-16 px-4 relative overflow-hidden">
        <div className="h-0.5 flex absolute top-0 inset-x-0">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/40" />
          <div className="flex-1 bg-forest" />
        </div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-rouge/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-3">Gratitude</p>
          <h1 className="font-display text-5xl text-chalk mb-4">Messages of Gratitude</h1>
          <p className="font-serif text-lg text-chalk/50 max-w-2xl leading-relaxed">
            Families and our team on the ground send personal thank-you videos to donors by name. These are their words — unscripted, unedited, and deeply human.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Search */}
        <div className="relative max-w-sm mb-8">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by donor name or location…"
            className="w-full bg-white border border-black/15 rounded-xl pl-10 pr-4 py-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-rouge/30 min-h-[44px]"
          />
        </div>

        {/* Empty search state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-ink/30 mb-2">No messages found</p>
            <p className="font-sans text-sm text-ink/40">Try searching for a different name or location.</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(video => (
            <div
              key={video.id}
              onClick={() => setModal(video)}
              className="group cursor-pointer bg-white rounded-2xl border border-black/8 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative h-44 bg-ink overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${video.seed}/600/400`}
                  alt=""
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-chalk/15 group-hover:bg-rouge/80 rounded-full flex items-center justify-center border border-chalk/20 transition-colors">
                    <Play size={20} className="text-chalk ml-0.5" fill="white" />
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <p className="font-sans text-xs text-rouge/70 mb-0.5">
                  To: <span className="font-medium text-rouge">{video.donor}</span>
                </p>
                <p className="flex items-center gap-1 font-sans text-xs text-ink/40 mb-2.5">
                  <MapPin size={10} /> {video.location}
                </p>
                <p className="font-serif text-sm text-ink/60 italic leading-relaxed line-clamp-3">
                  "{video.message}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/85" onClick={() => setModal(null)} />
          <div className="relative bg-ink rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-chalk/60 hover:text-chalk transition-colors"
            >
              <X size={16} />
            </button>
            {/* Video placeholder */}
            <div className="relative h-56 bg-black/60 overflow-hidden">
              <img
                src={`https://picsum.photos/seed/${modal.seed}/800/450`}
                alt=""
                className="w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-rouge/80 rounded-full flex items-center justify-center">
                  <Play size={28} className="text-chalk ml-1" fill="white" />
                </div>
                <p className="font-sans text-xs text-chalk/40">Video playback coming soon</p>
              </div>
            </div>
            {/* Message */}
            <div className="p-6">
              <p className="font-sans text-xs text-rouge/70 mb-0.5">
                To: <span className="font-medium text-rouge">{modal.donor}</span>
              </p>
              <p className="flex items-center gap-1.5 font-sans text-xs text-chalk/40 mb-5">
                <MapPin size={11} /> {modal.location}
              </p>
              <p className="font-serif text-base text-chalk/80 italic leading-relaxed">
                "{modal.message}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
