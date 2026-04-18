# CLAUDE.md — Accessorise It

## What this project is
Accessorise It is a motorcycle accessory planning platform. Riders select their exact bike, then browse, plan, and shop accessories with guaranteed fit. Revenue comes from affiliate commissions on outbound purchase links.

---

## What to preserve — never modify these

- `/supabase` — schema and SQL migrations
- `/lib` — Supabase client and auth helpers
- `/types` — TypeScript type definitions
- `.env.local` — environment variables
- `next.config.ts`, `tsconfig.json`, `package.json` — configuration
- Authentication flow and session management
- Vercel deployment configuration

## What is being rebuilt
All UI components and page layouts. The data layer stays intact. The presentation layer is being rebuilt to a new design system. Keep the routing structure (`/app` directory), replace the UI content.

---

## Tech stack

- Framework: Next.js with App Router
- Database: Supabase (PostgreSQL)
- Deployment: Vercel
- Styling: Tailwind CSS utility classes only — no custom CSS files
- Language: TypeScript throughout
- Vehicle terminology: always use `vehicle` in code and data. Only use `bike` as a display label for the motorcycle category

---

## Design system

### Colour palette

| Token | Value | Use |
|---|---|---|
| Page background | `#0D0D0D` | Root background |
| Card background | `#141414` | All standard cards |
| Card elevated | `#1A1814` | Photo areas, elevated surfaces |
| Hero section | `#110F0A` | Hero/banner backgrounds |
| Archived card | `#111008` | Moved-on / historical items |
| Tab bar | `#0A0A08` | Bottom tab bar (if used) |
| Primary amber | `#E8841A` | Primary CTA, active states, accents |
| Amber muted | `#C4741A` | Discovery links, secondary amber |
| Amber ghost bg | `rgba(232,132,26,0.1)` | Ghost button backgrounds |
| Amber border | `rgba(232,132,26,0.22)` | Active borders, highlights |
| Text primary | `#F5F3EE` | Headings, primary body text |
| Text secondary | `#6A6860` | Secondary labels, metadata |
| Text muted | `#44423E` | Placeholder, captions |
| Text disabled | `#3A3830` | Inactive icons, very muted |
| Card border | `rgba(255,255,255,0.06)` | All standard card borders |
| Section divider | `rgba(255,255,255,0.06)` | Horizontal rules between sections |

### State colours (accessory build states)

| State | Colour | Dot style |
|---|---|---|
| Fitted | `#1D9E75` | Solid green circle |
| Wish list | `#888780` | Outline circle, no fill |
| Moved on / history | `#5DCAA5` | Solid lighter teal circle |

State stat card left borders:
- Fitted: `border-left: 3px solid #1D9E75`
- Wish list: `border-left: 3px solid #888780`
- History: `border-left: 3px solid #5DCAA5`

### Category accent colours

| Category | Colour |
|---|---|
| Luggage | `#E8841A` (amber) |
| Protection | `#7F77DD` (purple) |
| Navigation | `#1D9E75` (green) |
| Tyres | `#BA7517` (dark amber) |
| Lighting | `#639922` (green) |
| Comfort | `#C4741A` (muted amber) |

### Typography

**Display / headlines**
- Font: `'Helvetica Neue', 'Arial Black', Arial, sans-serif`
- Weight: 900
- Transform: `uppercase`
- Letter spacing: `0.03–0.05em`
- Use for: screen titles, hero text, CTA labels, large numbers

**Body**
- Font: `system-ui, -apple-system, sans-serif`
- Weights: 400 (body), 500 (medium), 600 (semi-bold), 700 (bold)
- Use for: all body copy, labels, form fields, metadata

**Font size scale**

| Use | Size | Weight | Font |
|---|---|---|---|
| Hero headline | 44–52px | 900 | Display |
| Screen title (nav) | 12–13px | 900 | Display, uppercase |
| Section heading | 12px | 900 | Display, uppercase |
| Card title | 12–13px | 600 | Body |
| Body copy | 11–12px | 400 | Body |
| Label / badge | 9–10px | 500 | Body |
| Caption / muted | 10px | 400 | Body, color #44423E |

### Spacing and shape

| Token | Value |
|---|---|
| Screen horizontal padding | 20px |
| Card padding | 13–14px |
| Card gap (grids) | 8–9px |
| Section gap | 16–20px |
| Card border radius | 11–12px |
| Pill / badge radius | 20px |
| Button radius | 8px |
| Small element radius | 6–8px |

---

## Navigation

**Pattern: top tabs, persistent throughout app**

```
[ Logo ]                              [ Avatar / Log in ]

[ Home ] [ Browse ] [ Expert ] [ Garage ] [ Shop ]
           _______ active tab: 3px amber underline
```

Tab specs:
- Height: 42px total (13px top padding + 12px text + 10px bottom + 3px border)
- Active: `color: #E8841A`, `border-bottom: 3px solid #E8841A`, `background: rgba(232,132,26,0.06)`
- Inactive: `color: #5A5852`, `border-bottom: 3px solid transparent`
- Font: system-ui, 12px, 500 (active: 600)
- All tabs white-space nowrap, same horizontal padding

---

## Components

### Buttons

```
PRIMARY (amber filled)
  bg: #E8841A | color: #0D0D0D
  font: display 900, uppercase, 13px, letter-spacing 0.06em
  padding: 13–14px 20px | border-radius: 8px

GHOST (amber outline, pill shape)
  bg: transparent | border: 1px solid rgba(232,132,26,0.35) | color: #E8841A
  font: body 500, 12px | padding: 6px 14px | border-radius: 20px

NEUTRAL OUTLINE
  border: 1px solid rgba(255,255,255,0.1) | color: #F5F3EE
  font: body 500, 12px | padding: 13px 20px | border-radius: 8px

ADD / DASHED
  border: 1.5px dashed rgba(232,132,26,0.25) | color: rgba(232,132,26,0.5)
  font: body 500, 12px | padding: 13px 14px | border-radius: 10px
```

### Cards

```
STANDARD CARD
  bg: #141414 | border: 1px solid rgba(255,255,255,0.06) | border-radius: 12px | padding: 13–14px

FEATURED / HIGHLIGHTED (e.g. best price, selected item)
  bg: #141414 | border: 1px solid rgba(232,132,26,0.22) | border-radius: 12px

BEST PRICE SUPPLIER CARD
  bg: #141414 | border: 1px solid rgba(99,153,34,0.32) | border-radius: 12px

ARCHIVED / HISTORY CARD
  bg: #111008 | border: 1px solid rgba(255,255,255,0.04) | border-radius: 11px | opacity: 0.72–0.78

CONTEXTUAL NOTIFICATION CARD
  bg: rgba(232,132,26,0.06) | border: 1px solid rgba(232,132,26,0.24) | border-radius: 12px
```

### Badges and pills

```
FIT BADGE (guaranteed fit confirmation)
  bg: rgba(29,158,117,0.08) | border-radius: 20px | padding: 2px 6–8px
  font: body 500, 9px | color: #1D9E75
  Always includes a small green checkmark SVG (9×9px) before the text

CATEGORY FILTER PILL — active
  bg: rgba(232,132,26,0.1) | border: 1px solid rgba(232,132,26,0.22)
  color: #E8841A | border-radius: 20px | padding: 6px 13–14px | font: body 500, 11px

CATEGORY FILTER PILL — inactive
  bg: #141414 | border: 1px solid rgba(255,255,255,0.07)
  color: #5A5852 | border-radius: 20px | padding: 6px 13–14px

VERIFIED BADGE
  bg: rgba(232,132,26,0.1) | border: 1px solid rgba(232,132,26,0.2)
  color: #E8841A | border-radius: 20px | padding: 2px 8px | font: body 500, 9px

BEST PRICE BADGE
  bg: rgba(99,153,34,0.12) | border: 1px solid rgba(99,153,34,0.28)
  color: #639922 | border-radius: 20px | padding: 2px 7px | font: body 500, 9px

CATEGORY TAG (on expert builds, accessory cards)
  bg: rgba(232,132,26,0.08) | border: 1px solid rgba(232,132,26,0.16)
  color: #E8841A | border-radius: 20px | padding: 3px 9–10px | font: body 500, 9px
```

### Section headers

```
Standard section header pattern:
  3px amber vertical bar (border-radius: 2px, height: 14px)
  + section name (display 900, uppercase, 12px, #F5F3EE, letter-spacing 0.05em)
  + item count (body 400, 11px, #44423E)

Used on: Garage accessory sections, Expert Build accessory sections
Collapsed sections also show state dot summary (small dots indicating items inside)
```

### Timeline (Build history)

```
Two-column layout per entry:
  Left column (14px wide): dot + vertical connecting line
  Right column (flex: 1): content card

Dots:
  Current / Fitted: 10px solid #1D9E75
  Previous / Moved on: 9px solid #5DCAA5
  Older entries: 9px solid rgba(93,202,165,0.5)
  Add new (dashed): 9px outline, border: 1.5px dashed rgba(232,132,26,0.35)

Connecting line: 1px width, rgba(255,255,255,0.1), no line below last entry
Last entry in section: no connecting line below dot
```

### Stock status indicators (supplier screen)

```
In stock:  6px solid circle #1D9E75 + label color #1D9E75
Low stock: 6px solid circle #BA7517 + label color #BA7517
```

---

## Screen specifications

### Home screen (unauthenticated)

Structure:
1. Logo (left) + "Log in" ghost pill (right)
2. Top tabs
3. Hero section (bg: #110F0A):
   - "Motorcycles" amber pill
   - Headline: "FIND GEAR / THAT FITS." — "FITS." in #E8841A
   - Subtext: body 12px, #6A6860
   - Primary CTA: "Browse Accessories" (amber filled)
   - Secondary CTA: "Create free account" (neutral outline)
4. Feature grid: 2×2 dark cards, each with coloured 3px top bar
   - Expert Builds: #7F77DD
   - Browse Parts: #1D9E75
   - Plan Build: #E8841A
   - Shop Suppliers: #639922
5. Value props: 3 items with amber icon container + headline + descriptor

### Browse screen

Structure:
1. Standard nav + tabs (Browse active)
2. Bike context banner: compact card, selected bike name + "Guaranteed fit · N accessories" + "Change" amber link
3. Search bar: "Search accessories for your [bike]..."
4. Category tile row: horizontal scroll, 60×60px tiles, category-coloured icon on dark background
5. Results header: "N accessories · all guaranteed fit" + "Sort & filter" amber link
6. Product grid: 2 columns
   - Each card: 90px photo area (relative positioned, with category badge top-left and bookmark top-right) + content (name, brand, price, fit badge)

### Expert Builds screen

Structure:
1. Standard nav + tabs (Expert active)
2. Search: "Search builds, bikes or accessories..."
3. Filter pills: All builds · Touring · Adventure · Enduro · By accessory (search icon on last pill)
4. "Featured build" label + large card (photo area 136px + rider info + stats + tags + "View full build" amber outline)
5. "More builds" label + list of compact horizontal cards

Key behaviour:
- All content visible without login
- "By accessory" pill switches to accessory-first discovery view
- Tapping an accessory shows all expert builds that include it

### Expert Build detail screen

Structure:
1. Back navigation (amber arrow + parent screen name) | abbreviated title | share icon
2. Photo area: 158px, with "N photos" badge and "Owner photos · real bike" badge
3. Rider info: avatar initials + name + Verified badge + bike + build type (one row)
4. Stats: 3-column (accessories count | categories | build type)
5. Save button (amber outline, bookmark icon) + Share button (neutral icon)
6. Accessory sections:
   - Section header: amber vertical bar + category + count
   - Each accessory card: 52px photo + name + state dot + price + "↗ Used in N expert builds" discovery link + "+" add button
   - "↗ Used in N builds" is separately tappable from the row — use colour #C4741A
7. "See all N accessories" expand link
8. "Shop all accessories" amber filled CTA

### Garage screen

Auth required. Redirect to login if not authenticated.

Structure:
1. Standard nav, avatar replaces login button
2. Tabs (Garage active)
3. Bike header card: 62×62px dashed photo area (camera icon + "Add photo" label) + bike name + reg + build name (editable) + "Switch bike" link
4. Build stats: 3 cards side by side with coloured left borders
5. Filter pills with state dots: All · Fitted (green dot) · Wish list (outline dot) · History (teal dot)
6. Accessory sections with section headers
7. Per accessory card: 52px photo + name + state dot + state label + price/detail + three-dot menu
8. Wish list cards include "Shop now →" amber ghost button
9. History cards: archived styling (reduced opacity, darker bg)
10. "Add accessory" dashed CTA at bottom

### Add Accessory flow (3 steps)

Step 1 — Search:
- Mini header: "Add to [bike name]"
- Search bar pre-filtered to bike
- Category pills
- Results list with fit badge on each item
- Selected/top item has amber border to indicate "tap to select"

Step 2 — Add details:
- Accessory summary card (amber border + fit confirmation)
- "Adding as" heading
- Two state option cards side by side:
  - Wish list: shows outline dot, activates on tap, gray border when active
  - Fitted: shows solid dot, activates on tap, green border when active
- Fitted state: expands purchase details card (Bought at, Price paid, Date — all optional)
- Wish list state: shows info note card instead
- CTA label changes: "Add to wish list" or "Mark as fitted"

Step 3 — Confirmation:
- Green checkmark circle (64px, rgba(29,158,117,0.12) bg with green border)
- "ADDED TO YOUR GARAGE" display headline
- Item preview card with state badge
- "View my build" amber CTA
- "Add another accessory" neutral outline

### Return prompt (after visiting retailer site)

Shown as a contextual notification card in the Garage, between nav/tabs and the bike header:

- Amber-tinted card (rgba(232,132,26,0.06) bg, amber border)
- Pulsing dot + "You just visited [Retailer]" small label
- "Did you buy the [Product]?" headline
- Price + "was on your wish list" subtext
- "Yes, I bought it" amber CTA + "Not yet" neutral outline side by side
- "Remove from wish list" very muted text link below

### Supplier selection screen

Structure:
1. Back navigation with accessory name + "Shop suppliers" title
2. Accessory summary card: fit confirmation + price range + supplier count
3. Sort pills: Best price (active) · In stock first · Fastest delivery
4. Supplier cards in price order:
   - Best price card: green border + "Best price" green badge + "↓ £N cheaper" + amber filled Buy now
   - Other cards: neutral border + neutral outline Buy now
   - All cards: logo placeholder (34×34px) + name + stock status + delivery + price (large, display font)
   - All Buy now buttons include "opens retailer site ↗" subtext (10px, #44423E)
5. Affiliate disclosure: 10px, #3A3830, centred, very muted — always present

### Build history screen

Structure:
1. ← Garage | "Build history" title
2. Top stats: 3 cards (items total | total spent | years on record)
3. Category sections (e.g. Tyres, Luggage):
   - Section header: coloured vertical bar + category name + type descriptor (consumable / upgrade trail) + total badge
   - Timeline entries (see Timeline component above)
   - Current entry: full opacity, standard card, date
   - Historical entries: archived card, duration calculated and displayed
   - "Record new [item]..." dashed dot entry at bottom
4. Each category section separated by border-top

---

## UX rules — always follow

1. **Guaranteed fit context** — any screen showing accessories always displays the bike context and "Guaranteed fit" confirmation
2. **No login required for Browse and Expert Builds** — these are fully public
3. **Never pressure casual users** — no signup prompts on browse screens
4. **State colours are consistent everywhere** — green = fitted, gray = wish list, teal = moved on. Never deviate
5. **All outbound buy links** must include "opens retailer site ↗" text — never a bare "Buy" with no context
6. **Affiliate disclosure** always present on supplier screens — keep it at 10px, very muted (#3A3830)
7. **History is permanent** — moved-on items are archived, never deleted
8. **Vehicle in code, bike in display** — data model uses `vehicle_id`, display says "bike" for motorcycles
9. **"By accessory" discovery** — Expert Builds must support tapping an accessory to see all builds that include it
10. **Multiple suppliers** — Shop screens always show all available suppliers, never default to one

---

## Supabase schema notes — preserve these relationships

- `users` → `vehicles` (one to many — one user can have multiple bikes)
- `vehicles` → `builds` (one to many — each vehicle can have multiple saved builds)
- `builds` → `build_items` (one to many)
- `build_items.state` field: `'wishlist' | 'bought' | 'fitted' | 'moved_on'`
- `build_items` has: `supplier_name`, `price_paid`, `date_fitted`, `date_removed`, `notes`, `replaced_by_item_id`
- `products` → `fitment` (many to many via `vehicle_id` + `product_id`)
- `expert_builds` → `expert_build_items` → `products` (for reverse discovery)
- `products` → `suppliers` (one to many — multiple retailers per product)
- Expert builds have: `vehicle_make`, `vehicle_model`, `vehicle_year`, `rider_handle`, `is_verified`, `build_type`

---

## Operating rules for Claude Code

- Always use TypeScript — no plain JavaScript files
- Tailwind utility classes only — no custom CSS files or style tags
- Maintain Next.js App Router conventions — pages in `/app`, components in `/components`
- Never modify auth — test sign-in and sign-out after any layout change
- Never change Supabase schema without explicit instruction
- Build mobile-first — design at 390px viewport, then scale up
- One screen at a time — complete and test before starting the next
- Commit to GitHub after each working screen
- The CLAUDE.md file must not be modified unless explicitly asked to update it
