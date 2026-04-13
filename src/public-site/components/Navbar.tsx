import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const links = [
  { to: '/donate',    label: 'Donate'          },
  { to: '/gallery',   label: 'Gallery'         },
  { to: '/timeline',  label: 'Our Work'        },
  { to: '/gratitude', label: 'Gratitude Wall'  },
  { to: '/store',     label: 'Store'           },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur border-b border-white/8">
      {/* Flag stripe — 4px */}
      <div className="h-[3px] flex">
        <div className="flex-1 bg-ink" />
        <div className="flex-1 bg-chalk/70" />
        <div className="flex-1 bg-green" />
        <div className="w-[3px] bg-red" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <svg width="13" height="17" viewBox="0 0 13 17" fill="none" aria-hidden="true" className="shrink-0 transition-transform group-hover:scale-110">
            <polygon points="0,0 13,8.5 0,17" fill="#ce1126"/>
          </svg>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-base font-bold text-chalk uppercase tracking-wide leading-none">SURDAWIA</span>
              <span className="font-sans text-[11px] text-chalk/55 font-normal">MEND Initiative</span>
            </div>
            <p className="font-serif text-[10px] text-chalk/30 italic leading-tight mt-0.5">Mending Hearts Through Simple Acts</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-sans text-sm transition ${
                  isActive ? 'text-red-light' : 'text-white/50 hover:text-white/80'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/donate"
            className="ml-3 px-5 py-2 bg-red hover:bg-red-light text-chalk font-sans text-sm font-medium rounded-lg transition-colors"
          >
            Give Now
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden text-white/60 hover:text-white transition p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-ink-mid border-t border-white/8 px-5 pb-5">
          <nav className="flex flex-col gap-1 pt-3">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg font-sans text-sm min-h-[44px] flex items-center transition ${
                    isActive ? 'text-red-light bg-red/10' : 'text-white/55 hover:text-white/80 hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/donate"
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-3 bg-red hover:bg-red-light text-chalk font-sans text-sm font-medium rounded-lg transition-colors text-center min-h-[44px] flex items-center justify-center"
            >
              Give Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
