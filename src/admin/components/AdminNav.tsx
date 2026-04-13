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
          <div className="w-8 h-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="10" stroke="#CE1126" strokeWidth="1.5" opacity="0.7"/>
              <path d="M14 8v12M9 11l5 3 5-3" stroke="#007A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="font-display text-sm text-chalk leading-tight">Relief Org</p>
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
