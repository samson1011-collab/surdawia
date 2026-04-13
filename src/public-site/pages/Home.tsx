import { Link } from 'react-router-dom'
import { Heart, Play, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-ink overflow-hidden min-h-[92vh] flex items-center">
        {/* Background radial */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-1/3 h-full bg-red/8" style={{ clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0 100%)' }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-green/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 py-24 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              <span className="font-sans text-xs text-white/55 tracking-wide">Active Relief Operations</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl text-chalk leading-tight mb-6">
              Bringing Hope<br />
              <span className="text-red">to Those</span><br />
              Who Need It Most
            </h1>

            <p className="font-serif text-xl text-white/55 leading-relaxed mb-10 max-w-md">
              Every donation goes directly to families on the ground. No overhead. No delay. Just impact.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-red hover:bg-red-light text-chalk font-sans font-medium rounded-xl transition-colors min-h-[44px]"
              >
                <Heart size={16} />
                Donate Now
              </Link>
              <Link
                to="/timeline"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/15 hover:border-white/30 text-white/65 hover:text-white font-sans rounded-xl transition min-h-[44px]"
              >
                See Our Work
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Stats panel */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '100%', label: 'Goes to relief',      color: 'border-red/30'   },
              { value: '0%',   label: 'Administrative cut',  color: 'border-green/30' },
              { value: '∞',    label: 'Families reached',    color: 'border-white/15' },
              { value: '♡',    label: 'With every dollar',   color: 'border-white/15' },
            ].map(({ value, label, color }) => (
              <div key={label} className={`bg-white/4 border ${color} rounded-2xl p-6 text-center`}>
                <p className="font-display text-4xl text-chalk mb-2">{value}</p>
                <p className="font-sans text-xs text-white/40 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission strip ─────────────────────────────────────────── */}
      <section className="bg-chalk-off py-16">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="w-12 h-0.5 bg-red mx-auto mb-8" />
          <h2 className="font-display text-3xl text-ink mb-5">
            Relief work powered by community
          </h2>
          <p className="font-serif text-lg text-ink-faint leading-relaxed">
            We document every meal delivered, every family supported, every moment of dignity restored —
            and we share it all with you. Our donors are our partners.
          </p>
        </div>
      </section>

      {/* ── What you can do ───────────────────────────────────────── */}
      <section className="py-16 bg-chalk">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="font-display text-3xl text-ink text-center mb-12">Make a difference today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { to: '/donate',    icon: Heart,  title: 'Donate',         desc: 'One-time or monthly. Every dollar counts.',        bg: 'bg-red',   text: 'text-chalk'  },
              { to: '/gallery',   icon: null,   title: 'See the Work',   desc: 'Photos and videos from the ground.',               bg: 'bg-ink',   text: 'text-chalk'  },
              { to: '/gratitude', icon: Play,   title: 'Gratitude Wall', desc: 'Families thanking donors by name.',                bg: 'bg-green', text: 'text-chalk'  },
              { to: '/store',     icon: null,   title: 'Shop & Give',    desc: '100% of proceeds go to relief operations.',       bg: 'bg-chalk-warm border border-chalk-muted',  text: 'text-ink' },
            ].map(({ to, title, desc, bg, text }) => (
              <Link key={to} to={to} className={`${bg} ${text} rounded-2xl p-7 flex flex-col justify-between min-h-[180px] group transition hover:opacity-90`}>
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
    </div>
  )
}
