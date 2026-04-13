# Frontend Design Skill — Surdawia Website

> AI-assisted UI/UX guide for the Surdawia non-profit relief organization website.
> Use this file as context whenever building or modifying any page or component.

---

## Project Context

```
PROJECT NAME:        Surdawia
PURPOSE:             Non-profit relief org website — donations, media gallery, 
                     timeline, gratitude wall, store. 100% proceeds to relief work.
AUDIENCE:            Donors, supporters, and the general public who want to 
                     contribute to or follow Palestinian relief efforts
TONE:                Bold/editorial — serious, dignified, urgent, human
PRIMARY COLOR:       #0a0a0a (Ink / Black)
ACCENT COLOR:        #ce1126 (Rouge / Palestinian Red)
SUPPORT COLOR:       #007a3d (Forest / Palestinian Green)
BACKGROUND:          #f7f7f7 (Chalk / Off-white) for public site
                     #0a0a0a (Ink) for admin portal
DISPLAY FONT:        Playfair Display — headings, hero titles
BODY FONT:           DM Sans — UI, labels, body text
SERIF/ACCENT FONT:   Cormorant Garamond — quotes, subheadings, decorative
SPECIAL FONT:        Scheherazade New — Arabic text if needed
UNFORGETTABLE THING: The Palestinian flag color system — black, white, red, green — 
                     woven into every layout as a quiet, dignified visual identity
```

---

## Design Tokens (Tailwind + CSS Variables)

### Tailwind color aliases (tailwind.config.ts)
```js
ink:    { DEFAULT: '#0a0a0a', mid: '#1a1a1a', light: '#2e2e2e' }
rouge:  { DEFAULT: '#ce1126', light: '#e63347', pale: '#fde8ea' }
forest: { DEFAULT: '#007a3d', light: '#009e50', pale: '#d4f0e0' }
chalk:  { DEFAULT: '#ffffff', off: '#f7f7f7', warm: '#f2f2f0' }
```

### CSS variables (src/index.css)
```css
:root {
  --ink:         #0a0a0a;
  --ink-mid:     #1a1a1a;
  --ink-light:   #2e2e2e;
  --rouge:       #ce1126;
  --rouge-light: #e63347;
  --rouge-pale:  #fde8ea;
  --forest:      #007a3d;
  --forest-light:#009e50;
  --forest-pale: #d4f0e0;
  --chalk:       #ffffff;
  --cream:       #f7f7f7;
}
```

### shadcn/ui CSS vars
```css
--primary:            351 86% 43%;   /* rouge */
--accent:             152 100% 24%;  /* forest */
--background:         0 0% 97%;      /* chalk */
--foreground:         0 0% 6%;       /* ink */
--border:             0 0% 88%;
--ring:               351 86% 43%;   /* rouge */
```

---

## Font Stack

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Scheherazade+New:wght@400;700&display=swap');

font-family: 'Playfair Display', serif;   /* h1, h2, h3 — headings */
font-family: 'DM Sans', sans-serif;       /* body, UI, labels, buttons */
font-family: 'Cormorant Garamond', serif; /* subheadings, quotes, decorative */
font-family: 'Scheherazade New', serif;   /* Arabic text */
```

### Tailwind font classes
```
font-display  → Playfair Display
font-sans     → DM Sans
font-serif    → Cormorant Garamond
font-arabic   → Scheherazade New
```

---

## Flag Stripe Pattern

The Palestinian flag (black / white / green horizontal stripes + red triangle) is the
core visual motif. Use it consistently across components:

```html
<!-- Full-width decorative stripe — use at top of dark sections or nav -->
<div class="h-0.5 flex">
  <div class="flex-1 bg-rouge" />
  <div class="flex-1 bg-chalk" />
  <div class="flex-1 bg-forest" />
</div>

<!-- Triangle logo mark (SVG) -->
<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
  <polygon points="0,14 14,0 14,28" fill="#ce1126" />
  <polygon points="14,0 28,0 28,14" fill="#ffffff" opacity="0.4" />
  <polygon points="14,28 28,28 28,14" fill="#007a3d" />
</svg>

<!-- Section divider — centered -->
<div class="inline-flex h-0.5 w-12 mx-auto">
  <div class="flex-1 bg-rouge" />
  <div class="flex-1 bg-chalk/40" />
  <div class="flex-1 bg-forest" />
</div>

<!-- Left accent bar on headings -->
<div class="flex items-center gap-3">
  <div class="h-6 w-1 rounded-full bg-rouge" />
  <h2 class="font-display text-3xl text-ink">Section Title</h2>
</div>
```

---

## Site Structure

### Public Site (`/`)
| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Hero, impact stats, feature cards, gallery preview |
| `/donate` | Donate | Donation form with Stripe (one-time + recurring) |
| `/gallery` | Gallery | Media grid — images and videos from relief work |
| `/timeline` | Timeline | Chronological relief mission history |
| `/gratitude` | Gratitude Wall | Videos thanking donors by name |
| `/store` | Store | Products — 100% proceeds to relief |

### Admin Portal (`/admin/*`)
| Route | Page |
|-------|------|
| `/admin` | Dashboard |
| `/admin/donations` | Donation Manager |
| `/admin/media` | Media Manager |
| `/admin/gratitude` | Gratitude Videos |
| `/admin/store` | Store Manager |
| `/admin/website` | Website CMS |
| `/admin/settings` | Settings |
| `/admin/login` | Login |

---

## Public Site Design Rules

- **Background:** `bg-chalk` (`#f7f7f7`) — light, clean base
- **Dark sections:** `bg-ink` for hero, CTA blocks, footer
- **Rouge** is the primary action color — buttons, links, highlights, accents
- **Forest** is the secondary positive color — impact stats, success states, "100% to relief" callouts
- **Hero** always uses `bg-ink` with the flag triangle SVG on the left edge
- **Cards** are `bg-chalk` (white) with `border border-black/8` on light backgrounds
- **Navbar** is `bg-ink/95` sticky with flag stripe at top
- **Footer** is `bg-ink` with flag stripe at bottom

---

## Admin Portal Design Rules

- **Background:** `bg-ink` sidebar, `bg-[#f4f1ec]` main content area
- **Sidebar nav:** active item gets `bg-rouge/15 text-rouge border-l-2 border-rouge`
- **Cards/tables:** `bg-chalk` with `border border-black/8`
- **Primary action buttons:** `bg-rouge hover:bg-rouge-light text-chalk`
- **Destructive actions:** `hover:text-rouge hover:bg-rouge/10`
- **Success/published states:** `text-forest bg-forest/10`
- **Flag stripe** at very top of sidebar (3-color, `h-0.5`)

---

## Component Quick Reference

### Primary Button
```tsx
<button className="bg-rouge hover:bg-rouge-light text-chalk font-sans font-medium text-sm px-5 py-2.5 rounded-lg transition-colors">
  Label
</button>
```

### Secondary Button
```tsx
<button className="border border-chalk/20 hover:border-chalk/40 text-chalk/70 hover:text-chalk font-sans text-sm px-5 py-2.5 rounded-lg transition-colors">
  Label
</button>
```

### Section heading with red bar
```tsx
<div className="flex items-center gap-3 mb-6">
  <div className="h-6 w-1 rounded-full bg-rouge" />
  <h2 className="font-display text-3xl text-ink">Title</h2>
</div>
```

### Stat card (public)
```tsx
<div className="bg-chalk rounded-2xl border border-black/8 p-6 shadow-sm">
  <p className="font-sans text-sm text-ink/50 mb-2">Label</p>
  <p className="font-display text-4xl text-ink">Value</p>
</div>
```

### Admin table row
```tsx
<tr className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
  <td className="px-5 py-4 font-sans text-sm text-ink">...</td>
</tr>
```

### Status badge
```tsx
// Active / published
<span className="font-sans text-xs px-2.5 py-1 rounded-full bg-forest/10 text-forest">Active</span>
// Draft
<span className="font-sans text-xs px-2.5 py-1 rounded-full bg-ink/10 text-ink/50">Draft</span>
// Error / sold out
<span className="font-sans text-xs px-2.5 py-1 rounded-full bg-rouge/10 text-rouge">Sold Out</span>
```

---

## Tech Stack Reference

| Layer | Tool |
|-------|------|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Routing | React Router v6 |
| Data fetching | TanStack React Query v5 |
| Database + Auth | Supabase (PostgreSQL + RLS) |
| Payments | Stripe |
| Email | Resend via Supabase Edge Function |
| Hosting | Vercel (auto-deploy on push to `main`) |
| Source control | GitHub (`samson1011-collab/surdawia`) |
| Dev environment | GitHub Codespaces |
| AI dev tool | Claude Code (`claude --model claude-sonnet-4-6`) |

---

## Claude Code Quick-Start Prompt

Paste this into Claude Code when building any new page or component:

```
Read surdawia-frontend-design-skill.md for full design context.

Build [PAGE/COMPONENT NAME] for the Surdawia relief org website.

- Tone: bold/editorial, dignified, urgent
- Public site: chalk (#f7f7f7) background, ink (#0a0a0a) text, rouge (#ce1126) accent, forest (#007a3d) support
- Admin portal: ink (#0a0a0a) sidebar, light content area, rouge accents
- Fonts: Playfair Display headings, DM Sans body, Cormorant Garamond serif accents
- Flag stripe motif on dark sections and nav
- Mobile-first, 375px base, 44px touch targets
- Tailwind CSS only — no inline styles, no hardcoded hex values
- Use existing color aliases: ink, rouge, rouge-light, forest, chalk
- shadcn/ui components where appropriate
[Additional requirements]
```

---

## Supabase Project

- **URL:** `https://hyptmivecygrjfzklbkx.supabase.co`
- **Admin email:** `samson8406@gmail.com`
- **Live URL:** `https://surdawia.vercel.app`

---

*Version 1.0 — Surdawia project, April 2026*
