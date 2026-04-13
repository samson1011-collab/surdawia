import { Link } from 'react-router-dom'
import { Heart, Play, ArrowRight, MapPin } from 'lucide-react'

// ── Placeholder data ───────────────────────────────────────────────────────────

const LATEST_MEDIA = [
  { title: 'Food distribution in Rafah',   location: 'Rafah, Gaza',       date: 'Mar 2025', seed: 'rafah-food',    category: 'Relief Work' },
  { title: 'MEND Medical Clinic opens',    location: 'Khan Younis, Gaza', date: 'Jan 2025', seed: 'medical-clinic', category: 'Timeline'    },
  { title: 'Winter blanket distribution',  location: 'Deir al-Balah',     date: 'Jan 2025', seed: 'winter-blnkt',  category: 'Relief Work' },
]

const TIMELINE_PREVIEW = [
  {
    date:    'March 2025',
    title:   'Emergency Food Crisis Response',
    desc:    'A 10-day emergency campaign delivering hot meals and food packages to over 400 families in northern Gaza.',
    impact:  'Fed 400 families',
    seed:    'mission-march25',
  },
  {
    date:    'January 2025',
    title:   'MEND Medical Clinic Opens',
    desc:    'Partnering with local physicians to run a free medical screening camp providing consultations and medications.',
    impact:  '1,200 patients treated',
    seed:    'mission-jan25',
  },
]

const GRATITUDE_PREVIEW = [
  { donor: 'Ahmad Al-Rashid', location: 'Gaza, Palestine',  seed: 'gratitude-ahmad',  excerpt: 'Because of your kindness, my children ate warm food for the first time in weeks.' },
  { donor: 'Sarah Thompson',  location: 'Khan Younis, Gaza', seed: 'gratitude-sarah',  excerpt: 'The blankets you sent kept us warm through the coldest nights. You are our angels.' },
  { donor: 'Yusuf Mansour',   location: 'Rafah, Palestine',  seed: 'gratitude-yusuf',  excerpt: 'The medicine arrived just in time for my mother. Your donation saved her life.' },
]

// ── Component ──────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="bg-chalk-off">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-ink overflow-hidden min-h-[92vh] flex items-center">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-rouge/8 pointer-events-none"
          style={{ clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0 100%)' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-forest/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-5 py-24 grid md:grid-cols-2 gap-16 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
              <span className="font-sans text-xs text-white/55 tracking-wide">Active Relief Operations</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-chalk leading-tight mb-6">
              Bringing Hope<br />
              <span className="text-rouge">to Those</span><br />
              Who Need It Most
            </h1>
            <p className="font-serif text-xl text-white/55 leading-relaxed mb-10 max-w-md">
              Every donation goes directly to families on the ground. No overhead. No delay. Just impact.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-rouge hover:bg-rouge-light text-chalk font-sans font-medium rounded-xl transition-colors min-h-[44px]"
              >
                <Heart size={16} /> Donate Now
              </Link>
              <Link
                to="/timeline"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/15 hover:border-white/30 text-white/65 hover:text-white font-sans rounded-xl transition min-h-[44px]"
              >
                See Our Work <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Stats panel */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '2,400+', label: 'Families Served',   color: 'border-rouge/30'  },
              { value: '$180K',  label: 'Aid Delivered',      color: 'border-forest/30' },
              { value: '47',     label: 'Relief Missions',    color: 'border-white/15'  },
              { value: '100%',   label: 'Store Proceeds',     color: 'border-white/15'  },
            ].map(({ value, label, color }) => (
              <div key={label} className={`bg-white/4 border ${color} rounded-2xl p-6 text-center`}>
                <p className="font-display text-4xl text-chalk mb-2">{value}</p>
                <p className="font-sans text-xs text-white/40 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission strip ─────────────────────────────────────────────── */}
      <section className="bg-chalk py-16">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="inline-flex h-0.5 w-12 mx-auto mb-8">
            <div className="flex-1 bg-rouge" />
            <div className="flex-1 bg-chalk/40" />
            <div className="flex-1 bg-forest" />
          </div>
          <h2 className="font-display text-3xl text-ink mb-5">Relief work powered by community</h2>
          <p className="font-serif text-lg text-ink/60 leading-relaxed">
            We document every meal delivered, every family supported, every moment of dignity restored —
            and we share it all with you. Our donors are our partners.
          </p>
        </div>
      </section>

      {/* ── What you can do ───────────────────────────────────────────── */}
      <section className="py-16 bg-chalk-off">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="font-display text-3xl text-ink text-center mb-12">Make a difference today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { to: '/donate',    title: 'Donate',         desc: 'One-time or monthly. Every dollar counts.',           bg: 'bg-rouge',   text: 'text-chalk'  },
              { to: '/gallery',   title: 'See the Work',   desc: 'Photos and videos from the ground.',                  bg: 'bg-ink',     text: 'text-chalk'  },
              { to: '/gratitude', title: 'Gratitude Wall', desc: 'Families thanking donors by name.',                   bg: 'bg-forest',  text: 'text-chalk'  },
              { to: '/store',     title: 'Shop & Give',    desc: '100% of store proceeds go to relief operations.',     bg: 'bg-white border border-black/8', text: 'text-ink' },
            ].map(({ to, title, desc, bg, text }) => (
              <Link
                key={to} to={to}
                className={`${bg} ${text} rounded-2xl p-7 flex flex-col justify-between min-h-[180px] group transition hover:opacity-90`}
              >
                <div>
                  <h3 className="font-display text-xl mb-2">{title}</h3>
                  <p className="font-sans text-sm opacity-70 leading-relaxed">{desc}</p>
                </div>
                <ArrowRight size={18} className="mt-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest from the Ground ────────────────────────────────────── */}
      <section className="py-16 bg-chalk">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-rouge" />
              <h2 className="font-display text-3xl text-ink">Latest from the Ground</h2>
            </div>
            <Link to="/gallery" className="hidden sm:flex items-center gap-1.5 font-sans text-sm text-ink/40 hover:text-rouge transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {LATEST_MEDIA.map(item => (
              <Link
                key={item.title} to="/gallery"
                className="group bg-white rounded-2xl border border-black/8 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 overflow-hidden bg-black/5">
                  <img
                    src={`https://picsum.photos/seed/${item.seed}/600/400`}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 left-3 font-sans text-xs px-2.5 py-1 rounded-full ${
                    item.category === 'Relief Work' ? 'bg-rouge/90 text-chalk' : 'bg-ink/70 text-chalk'
                  }`}>
                    {item.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-sans text-sm font-medium text-ink mb-1.5 leading-snug">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-sans text-xs text-ink/40">
                      <MapPin size={10} /> {item.location}
                    </span>
                    <span className="font-sans text-xs text-ink/40">{item.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6 sm:hidden">
            <Link to="/gallery" className="font-sans text-sm text-rouge">View all media →</Link>
          </div>
        </div>
      </section>

      {/* ── Timeline preview ──────────────────────────────────────────── */}
      <section className="py-16 bg-chalk-off">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-rouge" />
              <h2 className="font-display text-3xl text-ink">Recent Missions</h2>
            </div>
            <Link to="/timeline" className="hidden sm:flex items-center gap-1.5 font-sans text-sm text-ink/40 hover:text-rouge transition-colors">
              Full timeline <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TIMELINE_PREVIEW.map(entry => (
              <Link
                key={entry.title} to="/timeline"
                className="group bg-white rounded-2xl border border-black/8 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-40 bg-black/5 overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/${entry.seed}/600/300`}
                    alt={entry.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-ink/70 text-chalk font-sans text-xs px-2.5 py-1 rounded-full">
                    {entry.date}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-ink mb-2">{entry.title}</h3>
                  <p className="font-sans text-sm text-ink/55 leading-relaxed mb-3">{entry.desc}</p>
                  <span className="inline-flex items-center gap-1.5 font-sans text-xs text-forest font-medium bg-forest/10 px-2.5 py-1 rounded-full">
                    {entry.impact}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gratitude wall preview ────────────────────────────────────── */}
      <section className="py-16 bg-ink">
        <div className="h-0.5 flex mb-12">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/20" />
          <div className="flex-1 bg-forest" />
        </div>
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-3">Gratitude</p>
            <h2 className="font-display text-3xl text-chalk mb-3">Hear from the Families You've Helped</h2>
            <p className="font-serif text-lg text-chalk/50 max-w-xl mx-auto">
              Personal video messages from families and our team on the ground — sent directly to donors by name.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {GRATITUDE_PREVIEW.map(video => (
              <Link
                key={video.donor} to="/gratitude"
                className="group bg-white/5 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-colors"
              >
                <div className="relative h-40 bg-black/40 overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/${video.seed}/600/400`}
                    alt=""
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-55 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 bg-chalk/15 group-hover:bg-rouge/70 rounded-full flex items-center justify-center border border-chalk/20 transition-colors">
                      <Play size={18} className="text-chalk ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-sans text-xs text-rouge/70 mb-0.5">
                    To: <span className="font-medium text-rouge">{video.donor}</span>
                  </p>
                  <p className="flex items-center gap-1 font-sans text-xs text-chalk/35 mb-2">
                    <MapPin size={10} /> {video.location}
                  </p>
                  <p className="font-serif text-sm text-chalk/55 italic leading-relaxed line-clamp-2">
                    "{video.excerpt}"
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/gratitude"
              className="inline-flex items-center gap-2 font-sans text-sm text-chalk/60 hover:text-chalk border border-white/15 hover:border-white/30 px-6 py-3 rounded-xl transition-colors min-h-[44px]"
            >
              See all messages <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Impact CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-rouge">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="font-display text-4xl text-chalk mb-4">Your generosity saves lives</h2>
          <p className="font-serif text-lg text-chalk/70 mb-8 leading-relaxed">
            Every dollar you give goes directly to relief work — no overhead, no delays.
            Join 2,400 families who have felt your impact.
          </p>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 bg-chalk text-rouge hover:bg-chalk-off font-sans font-semibold px-8 py-4 rounded-xl transition-colors min-h-[52px] text-base"
          >
            <Heart size={18} /> Donate Now
          </Link>
        </div>
      </section>
    </div>
  )
}
