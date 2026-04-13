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
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
                <defs>
                  <clipPath id="logo-ring-footer">
                    <path clipRule="evenodd" d="M16 1C7.716 1 1 7.716 1 16s6.716 15 15 15 15-6.716 15-15S24.284 1 16 1zm0 8c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7z"/>
                  </clipPath>
                </defs>
                <rect x="0" y="0" width="32" height="10.7" fill="#ce1126" clipPath="url(#logo-ring-footer)"/>
                <rect x="0" y="10.7" width="32" height="10.6" fill="rgba(255,255,255,0.85)" clipPath="url(#logo-ring-footer)"/>
                <rect x="0" y="21.3" width="32" height="10.7" fill="#007a3d" clipPath="url(#logo-ring-footer)"/>
                <circle cx="16" cy="16" r="7" fill="#0a0a0a"/>
              </svg>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-bold text-chalk uppercase tracking-wide leading-none">SURDAWIA</span>
                </div>
                <p className="font-serif text-xs text-chalk/40 italic leading-tight mt-0.5">Healing Hearts Through Simple Acts</p>
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
            © {new Date().getFullYear()} Surdawia. All proceeds support humanitarian relief.
          </p>
          <p className="font-sans text-xs text-white/20">
            Built with care for those who need it most.
          </p>
        </div>
      </div>
    </footer>
  )
}
