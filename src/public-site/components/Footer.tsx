import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-white/8">
      {/* Flag stripe */}
      <div className="h-[3px] flex">
        <div className="flex-1 bg-red" />
        <div className="flex-1 bg-chalk/60" />
        <div className="flex-1 bg-green" />
        <div className="flex-1 bg-ink-mid" />
      </div>

      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <svg width="13" height="17" viewBox="0 0 13 17" fill="none" aria-hidden="true" className="shrink-0">
                <polygon points="0,0 13,8.5 0,17" fill="#ce1126"/>
              </svg>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-base font-bold text-chalk uppercase tracking-wide leading-none">SURDAWIA</span>
                  <span className="font-sans text-[11px] text-chalk/55 font-normal">MEND Initiative</span>
                </div>
                <p className="font-serif text-[10px] text-chalk/30 italic leading-tight mt-0.5">Mending Hearts Through Simple Acts</p>
              </div>
            </div>
            <p className="font-sans text-sm text-white/40 leading-relaxed">
              Every dollar goes directly to families in need. 100% of store proceeds fund relief work on the ground.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-sans text-xs text-white/30 uppercase tracking-widest mb-4">Navigate</h4>
            <ul className="space-y-2">
              {[
                { to: '/donate',    label: 'Donate'         },
                { to: '/gallery',   label: 'Gallery'        },
                { to: '/timeline',  label: 'Our Work'       },
                { to: '/gratitude', label: 'Gratitude Wall' },
                { to: '/store',     label: 'Store'          },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="font-sans text-sm text-white/45 hover:text-white/75 transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="font-sans text-xs text-white/30 uppercase tracking-widest mb-4">Make an Impact</h4>
            <p className="font-sans text-sm text-white/40 mb-4 leading-relaxed">
              Your generosity restores dignity and saves lives.
            </p>
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red hover:bg-red-light text-chalk font-sans text-sm font-medium rounded-lg transition-colors"
            >
              <Heart size={14} />
              Donate Now
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-white/25">
            © {new Date().getFullYear()} Surdawia — MEND Initiative. All proceeds support humanitarian relief.
          </p>
          <p className="font-sans text-xs text-white/20">
            Built with care for those who need it most.
          </p>
        </div>
      </div>
    </footer>
  )
}
