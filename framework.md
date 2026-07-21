# Recipe Platform Design Framework v2.0
### Professional · Modern · Interactive · Fully Responsive

This redefines the original framework with a production-grade design system, a token-based architecture, richer interaction design, and a responsiveness strategy built on modern CSS (container queries, fluid type) instead of fixed breakpoints alone.

---

## 🎨 Phase 1 — Design System & Visual Identity

### 1.1 Typography (Fluid, Token-Based)

Move from fixed font sizes to a **fluid type scale** using `clamp()` so text scales smoothly across every viewport instead of jumping at breakpoints.

| Role | Typeface | Notes |
|---|---|---|
| Display / Headings | **Fraunces** (variable font) | Use its optical-size axis — softer at small sizes, sharper at large display sizes. Editorial, cookbook warmth. |
| Body / Interface | **Plus Jakarta Sans** | Geometric, legible at small sizes on flour-dusted screens. |
| Numeric / Data (timers, quantities, ratings) | **Inter (tabular nums)** | Prevents layout shift when ingredient amounts scale. |

```css
--text-display: clamp(2rem, 1.4rem + 3vw, 4.5rem);
--text-h2: clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem);
--text-body: clamp(0.95rem, 0.9rem + 0.2vw, 1.05rem);
```

### 1.2 Color System (Token-Based, with Dark Mode)

Keep the warm, appetite-driven palette as the **light/default theme**, but ship it as design tokens so a genuine dark mode (increasingly expected, and better for late-night cooking/reading) is a first-class citizen, not an afterthought.

**Light (default) — "Kitchen Morning"**
| Token | Value | Use |
|---|---|---|
| `--accent-primary` | `#D65A31` Terracotta | Primary actions, appetite cue |
| `--bg-base` | `#FAFAF7` Oatmeal | Base background |
| `--fg-primary` | `#2C302E` Olive Charcoal | Text, icons |
| `--state-success` | `#607E65` Sage | Confirmations |
| `--state-warning` | `#E0A458` Amber | Non-blocking alerts |
| `--state-danger` | `#B23A2E` Deep Paprika | Destructive actions |

**Dark — "Kitchen Night"**
| Token | Value | Use |
|---|---|---|
| `--accent-primary` | `#F0805A` Warm Coral | Stays appetizing on dark surfaces |
| `--bg-base` | `#1B1A17` Espresso Charcoal | Base background |
| `--surface-1` | `#242220` | Cards, elevated surfaces with subtle glass blur |
| `--fg-primary` | `#F3EFE9` Warm Off-White | Text |

Dark surfaces use a light **glass/blur treatment** (`backdrop-filter: blur(16px)` over translucent `--surface-1`) on modals, the cooking-mode overlay, and sticky nav — giving depth without losing the warm food photography underneath.

### 1.3 Elevation & Motion Tokens

Standardize instead of ad hoc shadows/animations:

```css
--shadow-sm: 0 1px 2px rgba(44,48,46,0.06);
--shadow-md: 0 4px 16px rgba(44,48,46,0.10);
--shadow-lg: 0 12px 32px rgba(44,48,46,0.14);

--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast: 120ms;
--duration-base: 240ms;
--duration-slow: 400ms;
```

All micro-interactions reference these tokens — no one-off timing values scattered through the codebase.

---

## 🧱 Phase 2 — Global Components & Micro-Interactions

### 2.1 Hero Section (Container-Query Driven)

Rather than hard desktop/mobile breakpoints, the hero is a **container-query component**: it reflows based on the space it's given (useful once it's reused inside admin previews, embeds, or a future tablet split-view app).

- **Wide container:** Split layout — typographic hook + smart search (left), looping HD food media or featured creator dish (right).
- **Narrow container:** Vertical stack — search bar pinned over a dimmed hero image.
- Smart search supports natural-language parsing ("something with chicken and leftover rice") via debounced async suggestions, not just keyword match.

### 2.2 Shimmer Loading States

Kept from the original — still the right call — refined:
- Skeletons use the same aspect-ratio tokens as real cards, so **zero cumulative layout shift (CLS)**.
- Shimmer gradient respects `prefers-reduced-motion`: falls back to a static soft-pulse opacity fade instead of a moving gradient.

### 2.3 Feedback Mechanics

- **Save to Collection:** icon scale (110%) + fill transition using `--duration-fast` / `--ease-standard`; confetti burst capped at 12 particles and skipped entirely under `prefers-reduced-motion`.
- **Toast system:** built on a single reusable `<Toast />` primitive (not bespoke per-action), queued so multiple actions don't stack chaotically — bottom-center on mobile, top-right on desktop, auto-dismiss with a pause-on-hover/tap timer bar.

### 2.4 New: Command Palette (⌘K)

For power users (creators and admins especially): a global command palette for jump-to-recipe, jump-to-draft, and quick actions — standard in modern professional tools and cheap to add given the search infrastructure already exists.

---

## 🖥️ Phase 3 — The Three Interfaces

| Interface | Design Focus | Key Upgrade from v1 |
|---|---|---|
| **User (Discovery)** | Immersive, distraction-free "digital cookbook" | Adds a **swipeable recipe carousel with momentum scrolling**, and step-by-step Cooking Mode (below) |
| **Creator (Production)** | "Kitchen Workbench" split-view builder | Adds **autosave with visible save-state indicator**, versioned drafts, and inline AI-assisted step writing (creator opts in) |
| **Admin (Curatorial)** | "Command Deck" — data-dense, high-efficiency | Adds **bulk actions, keyboard-navigable data grid, and audit log** on every moderation action |

---

## ⚡ Phase 4 — Modern System Additions

1. **Hands-Free Cooking Mode**
   - Full-screen, one-step-at-a-time presentation.
   - `Screen Wake Lock API` keeps the display on.
   - Voice navigation ("next step", "repeat") via the Web Speech API as a progressive enhancement — falls back gracefully to swipe/tap.
   - Elements scale ~30% on mobile for counter-distance readability.

2. **Smart Ingredient Scaling Engine**
   - Smooth animated fraction transitions (½ tsp → 1 tsp) using `FLIP`-style number transitions, no page reload.
   - Unit-system toggle (metric/imperial) persists to the user's profile.

3. **Dynamic Structured Grid Builder (Creator Side)**
   - Drag-and-drop step reordering with keyboard-accessible fallback (arrow-key reorder) — drag-only interactions are an accessibility gap in most builders; this closes it.
   - Media attaches per-step inline.

4. **New: Offline & PWA Support**
   - Saved recipes and Cooking Mode work offline (service worker cache) — genuinely useful mid-recipe if wifi drops in a kitchen.
   - Installable as a home-screen PWA.

5. **New: Accessibility as a system requirement, not a pass**
   - WCAG 2.2 AA color contrast enforced by the token system itself (terracotta-on-cream and coral-on-espresso are both contrast-checked).
   - All motion respects `prefers-reduced-motion`.
   - Full keyboard navigation across all three interfaces, not just the public site.

---

## 💾 Phase 5 — Content Schema & Infrastructure Architecture

```
[ User Auth (JWT / Firebase or Supabase Auth) ]
            │
            ├──► User Profile (Collections, Saved Recipes, Activity, Unit Preference)
            │
            ├──► Creator Studio ──► Content Modeling Schema (Structured JSON)
            │                              │
            │                              ▼
            │                    [ Ingredients Array ]  ──► (Name, Amount, Unit, Substitutions[])
            │                    [ Preparation Steps ]   ──► (Step#, Text, MediaURL, TimerSeconds)
            │                    [ Metadata Details ]    ──► (Prep Time, Cook Time, Serving Base, Difficulty, Diet Tags[])
            │
            ▼
[ Aggregation Pipeline ] ──► Real-Time Rating Averages, Category Sorting, "Trending This Week"
            │
            ▼
[ Admin Moderation Panel ] ──► Flagged Content Queue, Featured Curation Carousel, Audit Log
```

**Key upgrade:** `Substitutions[]` and `Diet Tags[]` are new first-class schema fields — they unlock filtering ("dairy-free versions of this") and the AI-assisted substitution suggestions in Cooking Mode, without a schema migration later.

---

## 📐 Responsiveness Strategy — Container Queries First

The original breakpoint table is still useful as a *reference*, but the actual implementation should lead with **container queries** on individual components (cards, the hero, the builder panels) so components behave correctly regardless of where they're placed — sidebar, modal, embed, future tablet app.

| Range | Layout |
|---|---|
| Mobile (< 768px) | Single-column feed, bottom-locked thumb-reachable nav, swipe gestures for Cooking Mode steps |
| Tablet (768–1023px) | 2-column grid, slide-out filters, persistent bottom-sheet scaling tool |
| Desktop (1024–1439px) | 3–4 column fluid grid, open filter sidebar |
| Wide (1440px+) | 4-column grid with max-width content rail (prevents line-length sprawl on ultra-wide monitors) + sticky recipe nav |

Fluid type and spacing tokens (`clamp()`-based) mean most components need **no breakpoint overrides at all** — only structural layout (columns, sidebars) switches at the table above.

---

### Summary of what changed from v1 → v2
- Fixed values → **design tokens** (type, color, motion, elevation)
- Warm-only palette → **light + dark theme**, same emotional register
- Breakpoint-only responsiveness → **container queries + fluid type**
- Micro-interactions → **respect `prefers-reduced-motion`**, reusable primitives instead of bespoke code
- Added: command palette, offline/PWA support, voice-assisted Cooking Mode, accessibility as a system-level requirement, expanded schema for substitutions/diet tags