import { MapPin, Users } from 'lucide-react'

const ENTRIES = [
  {
    id: 1,
    date:        'March 2025',
    title:       'Emergency Food Crisis Response',
    description: 'In response to critical food shortages, we launched a 10-day emergency distribution campaign delivering hot meals and dry food packages to over 400 families in northern Gaza.',
    location:    'Jabalia, Gaza',
    impact:      'Fed 400 families for 10 days',
    seed:        'mission-march25',
  },
  {
    id: 2,
    date:        'January 2025',
    title:       'MEND Medical Clinic Opens',
    description: 'Partnering with local physicians, we opened a temporary medical screening camp providing free consultations, wound care, and prescription medications to displaced residents.',
    location:    'Khan Younis, Gaza',
    impact:      '1,200 patients treated',
    seed:        'mission-jan25',
  },
  {
    id: 3,
    date:        'November 2024',
    title:       'Winter Resilience Campaign',
    description: 'As temperatures dropped, we distributed 1,800 winter blankets, warm clothing, and heating fuel to families sheltering in schools and damaged homes across the region.',
    location:    'Rafah, Gaza',
    impact:      '1,800 kits distributed',
    seed:        'mission-nov24',
  },
  {
    id: 4,
    date:        'September 2024',
    title:       'Clean Water Initiative',
    description: 'Working alongside local engineers, we restored access to clean drinking water for three neighbourhoods, installing portable filtration units and delivering 50,000 litres of safe water.',
    location:    'Deir al-Balah, Gaza',
    impact:      '50,000 L water delivered',
    seed:        'mission-sep24',
  },
  {
    id: 5,
    date:        'June 2024',
    title:       'Community Kitchen Launch',
    description: 'We established a community kitchen serving 800 hot meals per day, staffed by local volunteers and funded entirely by MEND donors. The kitchen ran for 45 consecutive days.',
    location:    'Nuseirat, Gaza',
    impact:      '36,000 meals served',
    seed:        'mission-jun24',
  },
  {
    id: 6,
    date:        'March 2024',
    title:       'First MEND Relief Convoy',
    description: 'The founding mission — our very first convoy delivered food, medicine, and hygiene supplies to 200 families. This mission defined our commitment: 100% of every dollar to direct relief.',
    location:    'Gaza City',
    impact:      '200 families reached',
    seed:        'mission-mar24',
  },
]

export default function Timeline() {
  return (
    <div className="min-h-screen bg-chalk-off">

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="bg-ink text-chalk py-16 px-4 relative overflow-hidden">
        <div className="h-0.5 flex absolute top-0 inset-x-0">
          <div className="flex-1 bg-rouge" />
          <div className="flex-1 bg-chalk/40" />
          <div className="flex-1 bg-forest" />
        </div>
        <div className="max-w-6xl mx-auto">
          <p className="font-sans text-xs text-rouge/80 uppercase tracking-[0.2em] mb-3">Our story</p>
          <h1 className="font-display text-5xl text-chalk mb-3">Our Journey</h1>
          <p className="font-serif text-lg text-chalk/50 max-w-xl">
            Every mission documented. Every family reached. A living record of hope in motion.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative">

          {/* Vertical line — mobile (left) */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-black/10 md:hidden" />
          {/* Vertical line — desktop (center) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-black/10 -translate-x-px" />

          <div className="space-y-10">
            {ENTRIES.map((entry, idx) => {
              const isLeft = idx % 2 === 0
              return (
                <div key={entry.id} className="relative pb-2">

                  {/* Mobile dot */}
                  <div className="absolute left-[5px] top-7 w-4 h-4 rounded-full bg-rouge border-4 border-chalk-off z-10 md:hidden" />
                  {/* Desktop dot */}
                  <div className="hidden md:block absolute left-1/2 top-7 -translate-x-1/2 w-4 h-4 rounded-full bg-rouge border-4 border-chalk-off z-10" />

                  {/* Mobile card */}
                  <div className="md:hidden pl-9">
                    <EntryCard entry={entry} />
                  </div>

                  {/* Desktop card — alternates left/right */}
                  <div className={`hidden md:block md:w-[calc(50%-2rem)] ${
                    isLeft ? 'md:pr-4' : 'md:ml-auto md:pl-4'
                  }`}>
                    <EntryCard entry={entry} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function EntryCard({ entry }: { entry: typeof ENTRIES[0] }) {
  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
      <div className="relative h-40 bg-black/5 overflow-hidden">
        <img
          src={`https://picsum.photos/seed/${entry.seed}/600/300`}
          alt={entry.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-ink/70 text-chalk font-sans text-xs px-2.5 py-1 rounded-full">
          {entry.date}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg text-ink mb-2 leading-snug">{entry.title}</h3>
        <p className="font-sans text-sm text-ink/55 leading-relaxed mb-3">{entry.description}</p>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-1.5 font-sans text-xs text-ink/40">
            <MapPin size={11} /> {entry.location}
          </span>
          <span className="flex items-center gap-1.5 font-sans text-xs text-forest font-medium bg-forest/10 px-2.5 py-1 rounded-full">
            <Users size={10} /> {entry.impact}
          </span>
        </div>
      </div>
    </div>
  )
}
