import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Droplets, Package, Trash2, DollarSign, CheckCircle } from 'lucide-react'

// ── Key differentiator cards ──────────────────────────────────────────────────

const DIFFERENTIATORS = [
  {
    label:   '501(c)3 Registered',
    detail:  'Good standing in the state of Ohio. Your donations are tax-deductible.',
    color:   'border-rouge/30 bg-white/4',
    accent:  'text-rouge',
  },
  {
    label:   '100% Volunteer',
    detail:  'No one at Surdawia keeps a penny. Every team member volunteers for the sake of Allah and our community.',
    color:   'border-forest/30 bg-white/4',
    accent:  'text-forest',
  },
  {
    label:   'Family Run',
    detail:  'Not a corporation. A family with a mission — and a deep responsibility to the people we serve.',
    color:   'border-white/15 bg-white/4',
    accent:  'text-chalk',
  },
  {
    label:   'Zero Overhead',
    detail:  'No 6-figure salaries. No extravagant trips. No marketing budgets. Just aid.',
    color:   'border-white/15 bg-white/4',
    accent:  'text-chalk/80',
  },
]

// ── What donations fund ───────────────────────────────────────────────────────

const FUND_ITEMS = [
  { icon: Package,    label: 'Food & Nutrition',              desc: 'Hot meals, dry goods, and food packages for families.' },
  { icon: Droplets,   label: 'Clean Water & Wells',           desc: 'Drinkable water access and well infrastructure.' },
  { icon: Package,    label: 'Essential Supplies',            desc: 'Blankets, clothing, hygiene kits, and basic necessities.' },
  { icon: Trash2,     label: 'Sanitation Infrastructure',     desc: 'Safe sanitation systems for communities in need.' },
  { icon: DollarSign, label: 'Direct Financial Aid',          desc: 'Cash transfers directly to families facing crisis.' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function About() {
  return (
    <div className="bg-chalk-off">

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative bg-ink overflow-hidden">
        {/* Flag stripe top */}
        <div className="h-0.5 flex">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/30" />
          <div className="flex-1 bg-forest" />
        </div>

        {/* Background shapes */}
        <div
          className="absolute top-0 left-0 w-1/3 h-full bg-rouge/7 pointer-events-none"
          style={{ clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0 100%)' }}
        />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-forest/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-5 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-rouge animate-pulse" />
            <span className="font-sans text-xs text-white/55 tracking-wide">501(c)3 Non-Profit · Ohio · 100% Volunteer</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl text-chalk leading-tight mb-6">
            Not Corporate.<br />
            <span className="text-rouge">Just Care.</span>
          </h1>

          <p className="font-serif text-xl text-white/55 leading-relaxed max-w-2xl mx-auto mb-10">
            We are a family-run 501(c)3 relief organization based in Ohio — built on the belief
            that aid should reach people, not line pockets.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
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
      </section>

      {/* ── Mission — A Simple Formula ───────────────────────────────── */}
      <section className="py-20 bg-chalk">
        <div className="max-w-4xl mx-auto px-5 text-center">
          {/* Flag divider */}
          <div className="inline-flex h-0.5 w-12 mx-auto mb-8">
            <div className="flex-1 bg-rouge" />
            <div className="flex-1 bg-chalk/40" />
            <div className="flex-1 bg-forest" />
          </div>

          <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-3">Our Mission</p>
          <h2 className="font-display text-4xl text-ink mb-5">A Simple Formula</h2>
          <p className="font-serif text-lg text-ink/60 leading-relaxed max-w-2xl mx-auto mb-16">
            No complexity. No middleman taking a cut. No questions about where your money went.
          </p>

          {/* Flow diagram */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-rouge/10 border border-rouge/20 flex items-center justify-center mb-3">
                <Heart size={32} className="text-rouge" />
              </div>
              <p className="font-display text-lg text-ink font-semibold">You Donate</p>
              <p className="font-sans text-sm text-ink/50 mt-1 max-w-[120px]">Any amount</p>
            </div>

            {/* Arrow */}
            <div className="flex sm:flex-col items-center justify-center px-6 sm:px-8">
              <div className="hidden sm:block w-0.5 h-0 sm:h-8 bg-ink/15" />
              <ArrowRight size={20} className="text-ink/30 sm:rotate-0 rotate-90" />
              <div className="hidden sm:block w-0.5 h-0 sm:h-8 bg-ink/15" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-ink/6 border border-ink/12 flex items-center justify-center mb-3">
                {/* Surdawia emblem */}
                <svg width="36" height="36" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <defs>
                    <clipPath id="about-ring">
                      <path clipRule="evenodd" d="M16 1C7.716 1 1 7.716 1 16s6.716 15 15 15 15-6.716 15-15S24.284 1 16 1zm0 8c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7z"/>
                    </clipPath>
                  </defs>
                  <rect x="0" y="0" width="32" height="10.7" fill="#CE1126" clipPath="url(#about-ring)"/>
                  <rect x="0" y="10.7" width="32" height="10.6" fill="rgba(0,0,0,0.15)" clipPath="url(#about-ring)"/>
                  <rect x="0" y="21.3" width="32" height="10.7" fill="#007A3D" clipPath="url(#about-ring)"/>
                  <circle cx="16" cy="16" r="7" fill="#0a0a0a"/>
                </svg>
              </div>
              <p className="font-display text-lg text-ink font-semibold">Surdawia Volunteers</p>
              <p className="font-sans text-sm text-ink/50 mt-1 max-w-[130px]">100% volunteer team</p>
            </div>

            {/* Arrow */}
            <div className="flex sm:flex-col items-center justify-center px-6 sm:px-8">
              <ArrowRight size={20} className="text-ink/30 sm:rotate-0 rotate-90" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-forest/10 border border-forest/20 flex items-center justify-center mb-3">
                <CheckCircle size={32} className="text-forest" />
              </div>
              <p className="font-display text-lg text-ink font-semibold">Families in Need</p>
              <p className="font-sans text-sm text-ink/50 mt-1 max-w-[120px]">Aid delivered. Period.</p>
            </div>
          </div>

          <p className="font-serif text-lg text-ink/55 italic mt-14 max-w-xl mx-auto leading-relaxed">
            "No middleman taking a cut. What you give is what reaches them."
          </p>
        </div>
      </section>

      {/* ── Why We Started ───────────────────────────────────────────── */}
      <section className="py-20 bg-chalk-off">
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-6 w-1 rounded-full bg-rouge" />
            <h2 className="font-display text-3xl text-ink">Why We Started</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <p className="font-serif text-xl text-ink/75 leading-relaxed mb-6">
                We watched large organizations promise relief — then spend donation money on
                six-figure executive salaries, extravagant fundraiser trips to five-star hotels,
                millions in marketing budgets, and $50,000 speaking fees.
              </p>
              <p className="font-serif text-xl text-ink/75 leading-relaxed">
                Aid was reaching the press releases. Not the people.
              </p>
            </div>

            <div>
              <p className="font-sans text-base text-ink/65 leading-relaxed mb-5">
                We built Surdawia because the solution is simple: send the money directly.
                No executive board. No marketing agency. No gala dinners.
                A family, a mission, and a direct line to the people who need help most.
              </p>
              <div className="border-l-2 border-rouge pl-5 py-1">
                <p className="font-serif text-lg text-ink italic leading-relaxed">
                  "Aid should reach people, not line pockets. That belief is why we exist."
                </p>
              </div>
            </div>
          </div>

          {/* Contrast callouts */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-rouge/6 border border-rouge/15 rounded-2xl p-6">
              <p className="font-sans text-xs text-rouge/70 uppercase tracking-widest mb-3">What We Saw</p>
              <ul className="space-y-2">
                {[
                  '6-figure executive salaries',
                  'Extravagant "fundraiser" trips abroad',
                  'Millions spent on marketing',
                  '$50,000 speaking fees',
                  'Aid reaching press releases, not people',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 font-sans text-sm text-ink/65">
                    <span className="mt-1 w-1 h-1 rounded-full bg-rouge shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-forest/6 border border-forest/15 rounded-2xl p-6">
              <p className="font-sans text-xs text-forest/70 uppercase tracking-widest mb-3">What We Built</p>
              <ul className="space-y-2">
                {[
                  'Zero paid staff — everyone volunteers',
                  'No travel budgets or luxury events',
                  'Word of mouth, not ad spend',
                  'Every dollar verified to relief work',
                  'Aid reaching families directly',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 font-sans text-sm text-ink/65">
                    <span className="mt-1 w-1 h-1 rounded-full bg-forest shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Differentiators ──────────────────────────────────────── */}
      <section className="py-20 bg-ink overflow-hidden">
        {/* Flag stripe */}
        <div className="h-0.5 flex mb-16">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/15" />
          <div className="flex-1 bg-forest" />
        </div>

        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-3">Who We Are</p>
            <h2 className="font-display text-4xl text-chalk mb-4">Built Different. On Purpose.</h2>
            <p className="font-serif text-lg text-chalk/45 max-w-xl mx-auto">
              Every choice we've made — from our legal structure to our team model — is deliberate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DIFFERENTIATORS.map(({ label, detail, color, accent }) => (
              <div key={label} className={`border ${color} rounded-2xl p-6`}>
                <div className="inline-flex h-0.5 w-8 mb-5">
                  <div className="flex-1 bg-rouge" />
                  <div className="flex-1 bg-chalk/20" />
                  <div className="flex-1 bg-forest" />
                </div>
                <h3 className={`font-display text-xl mb-3 ${accent}`}>{label}</h3>
                <p className="font-sans text-sm text-white/50 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What Your Donation Funds ─────────────────────────────────── */}
      <section className="py-20 bg-chalk">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-14">
            {/* Flag divider */}
            <div className="inline-flex h-0.5 w-12 mx-auto mb-8">
              <div className="flex-1 bg-rouge" />
              <div className="flex-1 bg-chalk/40" />
              <div className="flex-1 bg-forest" />
            </div>
            <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-3">Where It Goes</p>
            <h2 className="font-display text-4xl text-ink mb-4">What Your Donation Funds</h2>
            <p className="font-serif text-lg text-ink/55 max-w-xl mx-auto">
              Every contribution is directed to one or more of these essential areas — nothing else.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FUND_ITEMS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-chalk-off rounded-2xl border border-black/8 p-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-rouge/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={18} className="text-rouge" />
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-ink mb-1">{label}</p>
                  <p className="font-sans text-sm text-ink/50 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            {/* Filler card — store */}
            <div className="bg-forest/6 border border-forest/15 rounded-2xl p-6 flex gap-4 items-start sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-forest/15 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle size={18} className="text-forest" />
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-ink mb-1">100% of Store Proceeds</p>
                <p className="font-sans text-sm text-ink/55 leading-relaxed">
                  Every product sold in our store goes directly to relief — not overhead.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <section className="relative bg-ink overflow-hidden">
        {/* Flag stripe top */}
        <div className="h-0.5 flex">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/30" />
          <div className="flex-1 bg-forest" />
        </div>

        {/* Background accent */}
        <div
          className="absolute top-0 right-0 w-1/3 h-full bg-rouge/6 pointer-events-none"
          style={{ clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 0 100%)' }}
        />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-forest/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-5 py-24 text-center">
          <div className="inline-flex h-0.5 w-12 mx-auto mb-10">
            <div className="flex-1 bg-rouge" />
            <div className="flex-1 bg-chalk/30" />
            <div className="flex-1 bg-forest" />
          </div>

          <h2 className="font-display text-5xl text-chalk leading-tight mb-5">
            Join Our Mission
          </h2>
          <p className="font-serif text-xl text-white/50 leading-relaxed mb-10 max-w-xl mx-auto">
            Your generosity — no matter the size — travels directly to a family in need.
            No detour. No delay. Just impact.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-rouge hover:bg-rouge-light text-chalk font-sans font-semibold rounded-xl transition-colors min-h-[52px] text-base"
            >
              <Heart size={18} /> Donate Now
            </Link>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/15 hover:border-white/30 text-white/65 hover:text-white font-sans rounded-xl transition min-h-[52px] text-base"
            >
              Visit the Store <ArrowRight size={16} />
            </Link>
          </div>

          <p className="mt-8 font-sans text-xs text-white/30 tracking-wide">
            501(c)3 registered · All donations tax-deductible · Ohio non-profit in good standing
          </p>
        </div>
      </section>
    </div>
  )
}
