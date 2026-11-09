# PostPilot Design System

**Source of Truth:** Stitch MCP — Project "PostPilot"  
**Architecture:** Premium Floating Glassmorphic SaaS on Pure Black Canvas with High-Velocity Lime (`#C5F52A`) Accent.

---

## 1. Visual Foundation & Philosophy

PostPilot is a high-velocity AI publishing and automation hub for founders and creators. The aesthetic balances deep black structural stability with airy, floating frosted-glass surfaces and high-energy neon lime accents.

- **Background Canvas**: Absolute `#000000` (Pure Black). Zero mud or washed-out grays.
- **Glassmorphic Paneling**: Structural containers float 12px apart on top of the black canvas with 24px backdrop blur, subtle 1px translucent borders (`rgba(255, 255, 255, 0.08)`), and soft multi-layer ambient drop shadows.
- **Accent Philosophy**: The signature lime green (`#C5F52A`) is applied with strict intent: active navigation icons, high-conversion CTA buttons, unread/live notification pips, and AI synthesis callouts.

---

## 2. Color Palette & Tokens

### Core Brand Tokens
| Token | Hex / Value | Description |
| :--- | :--- | :--- |
| `brand-lime` | `#C5F52A` | Signature high-energy brand accent & primary CTAs |
| `brand-limeHover` | `#B1DE22` | Hover state for primary lime buttons |
| `brand-dark` | `#000000` | Foundational page canvas background |
| `brand-surface` | `#050505` | Base layer for panels |
| `brand-panel` | `#0A0A0A` | Secondary surface layer |
| `brand-card` | `#111111` | Card container background fallback |
| `brand-rail` | `#050505` | Icon navigation rail surface fallback |
| `brand-border` | `#1F1F1F` | Subtle dividing hairline borders |
| `brand-borderLight` | `#262626` | Interactive hover borders |
| `brand-muted` | `#737373` | Secondary text, helper labels |

### Glassmorphic Surfaces & Overlays
| Element | Background | Blur | Border | Shadow |
| :--- | :--- | :--- | :--- | :--- |
| **TopHeader** | `rgba(14, 18, 19, 0.75)` | `24px` | `1px solid rgba(255, 255, 255, 0.08)` | `0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)` |
| **Icon Rail** | `rgba(14, 18, 19, 0.75)` | `24px` | `1px solid rgba(255, 255, 255, 0.08)` | `0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)` |
| **Workspace Panel** | `rgba(14, 18, 19, 0.75)` | `24px` | `1px solid rgba(255, 255, 255, 0.08)` | `0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)` |
| **Feed Card (Default)** | `rgba(255, 255, 255, 0.08)` | `16px` | `1px solid rgba(255, 255, 255, 0.14)` | `0 8px 24px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.1)` |
| **Feed Card (AI Synthesis)** | `rgba(255, 255, 255, 0.08)` | `16px` | `1px solid rgba(197, 245, 42, 0.35)` | `0 8px 24px rgba(0,0,0,0.35), inset 0 1px 1px rgba(197,245,42,0.15)` |
| **Active Workspace Pill** | `rgba(255, 255, 255, 0.12)` | `16px` | `1px solid rgba(255, 255, 255, 0.2)` | `inset 0 1px 1px rgba(255,255,255,0.15)` |
| **Inactive Workspace Pill**| `rgba(255, 255, 255, 0.06)` | `12px` | `1px solid rgba(255, 255, 255, 0.12)` | None |
| **Glass Input / Search** | `rgba(255, 255, 255, 0.06)` | `16px` | `1px solid rgba(255, 255, 255, 0.14)` | `inset 0 1px 1px rgba(255,255,255,0.08)` |
| **Secondary Glass Button**| `rgba(255, 255, 255, 0.08)` | `8px` | `1px solid rgba(255, 255, 255, 0.15)` | `inset 0 1px 1px rgba(255,255,255,0.08)` |

### Domain & Platform Tag Colors
- **WEB / RESEARCH**: Text `#C5F52A`, bg `rgba(255, 255, 255, 0.08)`
- **X / POST**: Text `#C084FC` (Purple 400), bg `rgba(255, 255, 255, 0.08)`
- **REDDIT**: Text `#FBBF24` (Amber 400), bg `rgba(255, 255, 255, 0.08)`
- **FINTECH / LEGAL**: Text `#34D399` (Emerald 400), bg `rgba(255, 255, 255, 0.08)`
- **SECURITY**: Text `#22D3EE` (Cyan 400), bg `rgba(255, 255, 255, 0.08)`
- **NEWSLETTER**: Text `#F472B6` (Pink 400), bg `rgba(255, 255, 255, 0.08)`
- **AI SYNTHESIS**: Text `#000000`, bg `#C5F52A` (Bold Lime tag)

---

## 3. Typography

- **Primary Font**: `Inter`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Code / Time / Telemetry Font**: `monospace`, JetBrains Mono

| Style | Size | Weight | Tracking / Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `badge-xs` | `9px` | Bold (700) | Uppercase, tracking-wider | Category tags (WEB, REDDIT, X) |
| `meta-mono` | `10px` | Regular (400) | `font-mono`, leading-tight | Timestamps, read duration, domain |
| `badge-sm` | `10px` | Bold (700) | `rounded-full` | Story count badge ("204") |
| `body-sm` | `11px` | Medium / Regular | Leading-relaxed (`1.6`) | Card summaries, button labels, filter pills |
| `card-title` | `12px` | Semibold (600) | Leading-snug (`1.35`), 2-line clamp | Feed headline titles |
| `nav-item` | `12px` | Medium (500) | Snug | Toolbar buttons, search input, tabs |
| `header-brand` | `20px` | ExtraBold (800)| Tight | Brand logo glyph |

---

## 4. Spacing, Borders & Radius

- **Canvas Padding**: `12px` outer boundary gap around the screen (`p-3`).
- **Inter-Panel Gap**: `12px` between header, sidebar rail, and main workspace.
- **Component Radii**:
  - `rounded-[20px]` (20px): Main workspace container, Icon rail, Story cards.
  - `rounded-[16px]` (16px): Top header, Card media thumbnails.
  - `rounded-xl` (12px): Action buttons, Search inputs, Icon navigation buttons, Modals.
  - `rounded-full` (9999px): Workspace pills, Category filter pills, Circular utility buttons, Avatars.

---

## 5. Shared Shell Architecture

```
+-----------------------------------------------------------------------------------------+
| TopHeader (h-14, 56px, rounded-2xl glass)                                               |
| [Logo] [Halcyon & Co (x)] [Kestrel Brands] [Rivet & Wren] [+]    [?] [Bell] [Avatar v]  |
+-----------------------------------------------------------------------------------------+
| [Rail w-14]  | Main Workspace (rounded-[20px] glass panel)                              |
| - Pipeline   | +---------------------------------------------------------------------+  |
| - Feed (Lime)| | Toolbar: [All Stories (204)] [Saved]  [Search... ⌘K]  [+ Add] [Cur] |  |
| - Style      | | Filter Pills: [All Feeds] [Tech & AI] [Semiconductors] [Founders]...|  |
| - Result     | +---------------------------------------------------------------------+  |
| - Caption    | | Grid (1-5 cols responsive):                                         |  |
| - Calendar   | | [Card 1] [Card 2] [Card 3] [Card 4] [Card 5] ...                    |  |
| ...          | |                                                                     |  |
| - Team       | |                                                                     |  |
| - Billing    | |                                                                     |  |
| - Settings   | +---------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 6. Base Component Specifications

1. **Button (Primary Lime)**: `bg-[#C5F52A] text-black font-bold hover:bg-[#b1de22] rounded-xl text-[11px] py-1.5 transition-all shadow-sm`
2. **Button (Glass Secondary)**: `bg-white/[0.08] hover:bg-white/10 text-white/90 border border-white/15 rounded-xl text-[11px] py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]`
3. **Button (Icon Button)**: `w-9 h-9 rounded-full bg-white/[0.08] border border-white/15 hover:bg-white/10 text-white/80`
4. **Input (Search Bar)**: `bg-white/[0.06] border border-white/14 rounded-xl pl-8 pr-8 py-1.5 text-xs text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-[#C5F52A]/50`
5. **Tabs (Workspace)**: Rounded-full glassmorphic pills with company favicon / avatar, title, and optional close button.
6. **Card (Feed Story)**: 20px radius glassmorphic card with top metadata row, 155px thumbnail image/concept preview, headline, 2-line summary, and action button bar (Read, Draft, Carousel).
7. **Modal (Add Source Modal)**: Centered 16px frosted dialog with backdrop blur, title, URL / RSS / Platform input, category selector, and Lime submit action.
8. **Toast**: Slide-in lime-accented status alert for user actions.
9. **Skeleton**: Shimmering `rgba(255, 255, 255, 0.05)` placeholder cards with pulsing animation for async data loading.

