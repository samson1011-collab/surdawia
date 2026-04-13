import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import {
  LayoutDashboard, Image, Heart, Video, ShoppingBag,
  Globe, Settings, LogOut, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard',        exact: true },
  { to: '/admin/donations', icon: Heart,           label: 'Donations'                     },
  { to: '/admin/media',     icon: Image,           label: 'Media'                         },
  { to: '/admin/gratitude', icon: Video,           label: 'Gratitude Videos'              },
  { to: '/admin/store',     icon: ShoppingBag,     label: 'Store'                         },
  { to: '/admin/website',   icon: Globe,           label: 'Website CMS'                   },
  { to: '/admin/settings',  icon: Settings,        label: 'Settings'                      },
]

export default function AdminNav() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <aside className="w-60 shrink-0 bg-ink min-h-screen flex flex-col border-r border-white/8">
      {/* Top flag stripe */}
      <div className="h-0.5 flex">
        <div className="flex-1 bg-red" />
        <div className="flex-1 bg-chalk/80" />
        <div className="flex-1 bg-green" />
      </div>

      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
            <defs>
              <clipPath id="logo-ring-admin">
                <path clipRule="evenodd" d="M16 1C7.716 1 1 7.716 1 16s6.716 15 15 15 15-6.716 15-15S24.284 1 16 1zm0 8c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7z"/>
              </clipPath>
            </defs>
            <rect x="0" y="0" width="32" height="10.7" fill="#ce1126" clipPath="url(#logo-ring-admin)"/>
            <rect x="0" y="10.7" width="32" height="10.6" fill="rgba(255,255,255,0.8)" clipPath="url(#logo-ring-admin)"/>
            <rect x="0" y="21.3" width="32" height="10.7" fill="#007a3d" clipPath="url(#logo-ring-admin)"/>
            <circle cx="16" cy="16" r="7" fill="#0a0a0a"/>
          </svg>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-display text-base font-bold text-chalk uppercase tracking-wide leading-tight">SURDAWIA</p>
            </div>
            <p className="font-sans text-xs text-white/35">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all group ${
                isActive
                  ? 'bg-red/15 text-red-light border-l-2 border-red pl-[10px]'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/5 border-l-2 border-transparent pl-[10px]'
              }`
            }
          >
            <Icon size={15} className="shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight size={11} className="opacity-0 group-hover:opacity-30 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/8">
        <div className="px-3 py-2 mb-1">
          <p className="font-sans text-xs text-white/55 truncate">{profile?.full_name ?? 'Admin'}</p>
          <p className="font-sans text-xs text-white/25 truncate">{profile?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans text-white/35 hover:text-red-light hover:bg-red/10 transition-all"
        >
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
