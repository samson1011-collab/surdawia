import { useState } from 'react'
import { Heart, Shield, CheckCircle, Award, Users, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const PRESET_AMOUNTS = [10, 25, 50, 100, 250]

const RECENT_DONORS = [
  { name: 'Ahmad K.',  amount: '$100', time: '2 hours ago' },
  { name: 'Sarah M.',  amount: '$50',  time: '4 hours ago' },
  { name: 'Yusuf A.', amount: '$250', time: '5 hours ago' },
  { name: 'Layla H.', amount: '$25',  time: '6 hours ago' },
]

const IMPACT_STATS = [
  { value: '2,400+', label: 'Families served'  },
  { value: '$180K',  label: 'Aid delivered'     },
  { value: '47',     label: 'Relief missions'   },
]

const IMPACT_BY_AMOUNT: Record<number, string> = {
  10:  'Provides clean drinking water for a family of 5 for one week.',
  25:  'Supplies one full emergency hygiene kit — soap, toothpaste, sanitary items.',
  50:  'Feeds a family of 5 for two weeks with essential food packages.',
  100: 'Covers emergency medical supplies for an entire family for a month.',
  250: 'Helps run a community kitchen serving hot meals for 3 days.',
}

export default function Donate() {
  const [frequency, setFrequency] = useState<'one_time' | 'monthly'>('one_time')
  const [selected, setSelected]   = useState<number | null>(50)
  const [custom, setCustom]       = useState('')
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [message, setMessage]     = useState('')

  const amount    = custom ? parseFloat(custom) || null : selected
  const impactMsg = selected && !custom ? IMPACT_BY_AMOUNT[selected] : null
  const inputCls  = 'w-full border border-black/15 rounded-xl px-4 py-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-rouge/30 bg-white transition-colors'

  return (
    <div className="min-h-screen bg-chalk-off">

      {/* ── Hero ───────────────────────────────────────────── */}
      <div className="bg-ink text-chalk py-20 px-4 relative overflow-hidden">
        <div className="h-0.5 flex absolute top-0 inset-x-0">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/40" />
          <div className="flex-1 bg-forest" />
        </div>
        <div
          className="absolute top-0 left-0 w-1/3 h-full bg-rouge/6 pointer-events-none"
          style={{ clipPath: 'polygon(0 0, 80% 0, 40% 100%, 0 100%)' }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-4">Give today</p>
          <h1 className="font-display text-5xl md:text-6xl text-chalk leading-tight mb-5">
            Every Dollar<br />Saves a Life
          </h1>
          <p className="font-serif text-xl text-chalk/55 max-w-xl mx-auto leading-relaxed">
            100% of your donation goes directly to families on the ground. No overhead. No administrative cut. Just pure relief.
          </p>
        </div>
      </div>

      {/* ── Form + sidebar ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10 items-start">

          {/* Donation form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 sm:p-8">

              {/* Frequency */}
              <div className="flex gap-1 bg-black/5 rounded-xl p-1 mb-8 w-fit">
                {(['one_time', 'monthly'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`px-6 py-2.5 rounded-lg font-sans text-sm font-medium transition-colors min-h-[44px] ${
                      frequency === f ? 'bg-white text-ink shadow-sm' : 'text-ink/50 hover:text-ink'
                    }`}
                  >
                    {f === 'one_time' ? 'One-time' : 'Monthly'}
                  </button>
                ))}
              </div>

              {/* Amount presets */}
              <p className="font-sans text-xs text-ink/40 uppercase tracking-widest mb-3">Select amount</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-3">
                {PRESET_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => { setSelected(amt); setCustom('') }}
                    className={`py-3 rounded-xl font-sans font-medium text-sm border transition-all min-h-[52px] ${
                      selected === amt && !custom
                        ? 'bg-rouge text-chalk border-rouge shadow-sm'
                        : 'bg-white text-ink border-black/15 hover:border-rouge/50 hover:text-rouge'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Custom */}
              <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-ink/40 text-sm pointer-events-none">$</span>
                <input
                  type="number" min="1"
                  value={custom}
                  onChange={e => { setCustom(e.target.value); setSelected(null) }}
                  placeholder="Or enter custom amount"
                  className={`${inputCls} pl-8 ${custom ? 'border-rouge' : ''}`}
                />
              </div>

              {/* Impact hint */}
              <div className="mb-6 min-h-[44px] flex items-center">
                {impactMsg && (
                  <div className="w-full flex items-start gap-2 bg-forest/8 border border-forest/15 rounded-lg px-4 py-3">
                    <Users size={14} className="text-forest mt-0.5 shrink-0" />
                    <p className="font-sans text-xs text-forest leading-relaxed">{impactMsg}</p>
                  </div>
                )}
              </div>

              {/* Donor details */}
              <div className="space-y-4 mb-7">
                <p className="font-sans text-xs text-ink/40 uppercase tracking-widest">Your details</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans text-xs text-ink/50 mb-1.5">Full name</label>
                    <input value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your name" className={inputCls} />
                  </div>
                  <div>
                    <label className="block font-sans text-xs text-ink/50 mb-1.5">Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-xs text-ink/50 mb-1.5">
                    Message <span className="font-normal text-ink/25">(optional)</span>
                  </label>
                  <textarea
                    value={message} onChange={e => setMessage(e.target.value)}
                    rows={3} placeholder="Leave a message of support for the families..."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={() => alert('Stripe integration coming soon — thank you for your generosity!')}
                className="w-full bg-rouge hover:bg-rouge-light text-chalk font-sans font-semibold text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-colors min-h-[56px]"
              >
                <Heart size={18} />
                {amount
                  ? `Donate $${amount}${frequency === 'monthly' ? '/month' : ''}`
                  : 'Donate Now'
                }
              </button>

              {/* Trust row */}
              <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t border-black/8">
                {[
                  { icon: CheckCircle, label: '100% to relief' },
                  { icon: Shield,      label: 'Secure payment' },
                  { icon: Award,       label: 'Tax deductible' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon size={14} className="text-forest" />
                    <span className="font-sans text-xs text-ink/50">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            <div className="bg-ink rounded-2xl p-6">
              <p className="font-sans text-xs text-rouge/80 uppercase tracking-widest mb-4">Impact so far</p>
              {IMPACT_STATS.map(({ value, label }) => (
                <div key={label} className="py-3.5 border-b border-white/8 last:border-0">
                  <p className="font-display text-3xl text-chalk leading-none mb-0.5">{value}</p>
                  <p className="font-sans text-xs text-chalk/40">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-forest/10 border border-forest/20 rounded-2xl p-5">
              <p className="font-sans text-xs text-forest font-medium uppercase tracking-wide mb-2">What $50 does</p>
              <p className="font-sans text-sm text-ink/70 leading-relaxed">
                Feeds a family of 5 for two weeks with essential food packages, clean water, and hygiene supplies.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-black/8 p-5">
              <p className="font-sans text-xs text-ink/40 uppercase tracking-widest mb-3">Recent donors</p>
              {RECENT_DONORS.map(({ name, amount, time }) => (
                <div key={name} className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
                  <div>
                    <p className="font-sans text-sm text-ink font-medium">{name}</p>
                    <p className="font-sans text-xs text-ink/35">{time}</p>
                  </div>
                  <span className="font-display text-lg text-rouge">{amount}</span>
                </div>
              ))}
            </div>

            <Link
              to="/timeline"
              className="flex items-center justify-between bg-white rounded-2xl border border-black/8 p-5 group hover:border-rouge/30 transition-colors"
            >
              <div>
                <p className="font-sans text-sm text-ink font-medium mb-0.5">See where it goes</p>
                <p className="font-sans text-xs text-ink/40">Every mission documented</p>
              </div>
              <ArrowRight size={16} className="text-ink/30 group-hover:text-rouge transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
