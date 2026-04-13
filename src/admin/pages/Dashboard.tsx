import { Heart, Image, Video, ShoppingBag, TrendingUp, Users } from 'lucide-react'

const stats = [
  { label: 'Total Donated',    value: '$0',  sub: 'all time',      icon: Heart,       accent: 'bg-red/10 text-red'         },
  { label: 'Media Items',      value: '0',   sub: 'published',     icon: Image,       accent: 'bg-ink/10 text-ink-light'   },
  { label: 'Gratitude Videos', value: '0',   sub: 'published',     icon: Video,       accent: 'bg-green/10 text-green'     },
  { label: 'Store Orders',     value: '0',   sub: 'this month',    icon: ShoppingBag, accent: 'bg-red/10 text-red'         },
  { label: 'Monthly Recurring','value': '$0',sub: 'active donors', icon: TrendingUp,  accent: 'bg-green/10 text-green'     },
  { label: 'Unique Donors',    value: '0',   sub: 'all time',      icon: Users,       accent: 'bg-ink/10 text-ink-light'   },
]

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink">Dashboard</h1>
        <p className="font-sans text-sm text-ink-faint mt-1">Overview of your relief organization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className="bg-chalk rounded-xl border border-chalk-muted p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <p className="font-sans text-xs text-ink-faint uppercase tracking-widest">{label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
                <Icon size={15} />
              </div>
            </div>
            <p className="font-display text-3xl text-ink">{value}</p>
            <p className="font-sans text-xs text-ink-faint/60 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Flag-accented getting started card */}
      <div className="bg-chalk rounded-xl border border-chalk-muted overflow-hidden shadow-sm">
        <div className="h-1 flex">
          <div className="flex-1 bg-red" />
          <div className="flex-1 bg-ink" />
          <div className="flex-1 bg-chalk-muted" />
          <div className="flex-1 bg-green" />
        </div>
        <div className="p-6">
          <h2 className="font-serif text-lg text-ink mb-1">Getting Started</h2>
          <p className="font-sans text-sm text-ink-faint">
            Connect your Supabase project and Stripe account to start accepting donations and managing content.
          </p>
        </div>
      </div>
    </div>
  )
}
