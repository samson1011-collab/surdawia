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
          <div className="w-8 h-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center transition group-hover:border-red/40">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="10" stroke="#CE1126" strokeWidth="1.5" opacity="0.8"/>
              <path d="M14 8v12M9 11l5 3 5-3" stroke="#007A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display text-base text-chalk tracking-tight">Relief Org</span>
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
