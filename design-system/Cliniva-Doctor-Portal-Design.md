---
name: Cliniva Soft Clinical
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#b90538'
  on-tertiary: '#ffffff'
  tertiary-container: '#dc2c4f'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  telemetry-num:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  gutter-desktop: 1.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system establishes a high-trust, calming clinical environment engineered specifically for physicians, triage nurses, and medical directors navigating complex, time-sensitive patient data. The aesthetic balances clinical precision with an empathetic human touch through an evolved soft-tactile interface: crisp white structural planes floating over muted slate-tinted canvas backdrops, balanced by organic, pill-soft contours and restrained clinical teals.

The emotional objective is cognitive decompression under pressure. Dense medical records, telemetry stats, and diagnostic feeds are rendered with pristine optical balance—avoiding stark surgical sterility without lapsing into toy-like softness. The visual style marries modern functional minimalism with subtle tactile depth: pristine white card surfaces, soft diffused ambient glows, whisper-thin inner borders, and high-visibility status indicators that ensure instantaneous patient acuity triage.

## Colors

The palette leverages restorative teal tones that naturally reduce eye fatigue during extended clinical shifts while maintaining strict WCAG AAA readability standards for data-dense metrics.

- **Primary Teal (`#0D9488`)**: The bedrock of active clinical intent, primary operations, focused navigation, and confirmed vital signatures. Deepened to `#0F766E` for interactive press states and critical accessible text.
- **Secondary Cyan-Teal (`#14B8A6`)**: Used for supportive indicators, subtle selection highlights, visual accents in charts, and active step progressions.
- **Tertiary Coral Alert (`#F43F5E`)**: Reserved strictly for high-acuity triage, urgent drug-interaction warnings, abnormal vitals alerts, and destructive confirmations. An ambient amber (`#F59E0B`) serves as a mid-tier caution indicator.
- **Neutrals**: Built on a slate scale to keep the canvas cool and glare-free. The base app canvas sits on `#F8FAFC`, transitioning to neutral secondary tiers `#F1F5F9` and borders `#E2E8F0`, with deep slate `#0F172A` providing crisp contrast for patient typography.

## Typography

The typographic hierarchy pairs the soft, geometric approachability of Plus Jakarta Sans for section titles, patient banner names, and dashboard stats with the clinical legibility and numeric stability of Inter for medical histories, laboratory values, and drug dosages.

- **Numerics and Vitals**: Tabular figures (`tnum`) must be enforced across all laboratory, dosage, and telemetry metrics to guarantee columnar alignment across patient charts and telemetry grids.
- **Optical Hierarchy**: Headings emphasize warm authority with tight letter-spacing, while body and label tokens maintain open spacing for rapid scanning under intense ward lighting or tablet use.

## Layout & Spacing

The portal employs a fluid 12-column responsive layout system that adjusts to doctor workstation dual monitors, clinical tablets, and mobile triage devices.

- **Desktop (1200px+)**: 12 columns, 1.5rem gutters, and 2rem outer margins. Supports tripartite dashboard views: collateral patient list (col-3), active patient record & charts (col-6), and diagnostic alert/order tray (col-3).
- **Tablet (768px - 1199px)**: 8 columns, 1.25rem gutters, and 1.5rem margins. Collapses order trays into an off-canvas slide-out sheet; prioritizes chart and vitals comparison split.
- **Mobile (<768px)**: 4 columns, 0.75rem gutters, and 1rem margins. Single-stream triage flow with sticky bottom action trays and accordion-based chart navigation.
- **Component Rhythms**: Strict 8pt structural baseline, utilizing `space-xs` (4px) and `space-sm` (8px) for tightly coupled vital tags and metadata; `space-md` (16px) for interior card padding; and `space-lg` (24px) for distinct module demarcations.

## Elevation & Depth

Visual hierarchy uses a refined "Soft Layered" philosophy combining high-key white planes, tinted ambient drop shadows, and microscopic boundary lines to create palpable physical depth without heavy, dark boundaries.

- **Level 0 (Canvas Base)**: Pristine slate-white `#F8FAFC`, flat.
- **Level 1 (Clinical Cards & Panels)**: Pure white `#FFFFFF` surface with an ambient composite shadow: `0px 2px 4px rgba(15, 23, 42, 0.03), 0px 8px 16px -4px rgba(13, 148, 136, 0.04)`, framed by a crisp border `1px solid #E2E8F0`.
- **Level 2 (Active Cards & Hovered Records)**: Pure white surface lifted via `0px 6px 12px -2px rgba(15, 23, 42, 0.05), 0px 16px 24px -4px rgba(13, 148, 136, 0.06)`. Border sharpens to `#CBD5E1`.
- **Level 3 (Modals, Overlays, and Alert Drawers)**: `0px 20px 32px -8px rgba(15, 23, 42, 0.08), 0px 32px 48px -12px rgba(15, 23, 42, 0.06)`.
- **Inner Tactile Glow**: Active input elements and selected pills receive an inner micro-highlight: `inset 0px 1px 1px rgba(255, 255, 255, 0.8)` for a clean, sculpted feel.

## Shapes

The interface embraces organic, softened geometry that reduces clinical severity while maintaining high structural density.

- **Base Radius (`0.5rem` / 8px)**: Standard inputs, dropdown triggers, and interactive table rows.
- **Large Radius (`1rem` / 16px, `rounded-xl`)**: Inner sub-cards, laboratory grouping containers, diagnostic panels, and toast alerts.
- **Extra Large Radius (`1.5rem` / 24px, `rounded-2xl`)**: Main patient summary banners, primary dashboard modules, and triage drawer surfaces.
- **Full Pill (`9999px`)**: Interactive action buttons, triage status badges, acuity chips, and filter toggles.

## Components

### Buttons
- **Primary**: Pill-shaped (`rounded-full`), `#0D9488` teal background, pure white label, `0px 2px 4px rgba(13, 148, 136, 0.2)` shadow. Hover deepens to `#0F766E` with elevated ambient glow.
- **Secondary / Soft**: Muted teal-tinted background (`#F0FDFA`), teal text (`#0F766E`), border `1px solid #CCFBF1`.
- **Urgent / Destructive**: Soft coral background (`#FFF1F2`), high-contrast crimson text (`#E11D48`), border `1px solid #FFE4E6`.

### Badges & Acuity Chips
- Pill-shaped (`rounded-full`), padding `0.25rem 0.75rem`, `label-sm` typography with uppercase optical tracking.
- **Routine / Normal**: Background `#F0FDF4`, border `#BBF7D0`, text `#15803D`.
- **Observation / Medium**: Background `#FFFBEB`, border `#FDE68A`, text `#B45309`.
- **Critical Alert / Triage Red**: Background `#FFF1F2`, border `#FECDD3`, text `#BE123C`, accompanied by a solid `#F43F5E` 6px pulsating status dot.

### Clinical Data Cards
- Pure white background (`#FFFFFF`), `rounded-2xl` corners, 1px perimeter outline `#E2E8F0`.
- Card headers feature clear separation with subtle hairline dividers (`#F1F5F9`), integrating contextual action buttons or time-since-last-vitals metadata.

### Input Fields & Selectors
- Background `#FFFFFF`, border `1px solid #E2E8F0`, rounded `0.5rem` (`rounded-md`).
- Active focus state: border `#0D9488`, accompanied by an exterior ring `0 0 0 3px rgba(20, 184, 166, 0.15)`. Floating labels utilize `label-md` in slate-500.

### Checkboxes & Segmented Controls
- Checkboxes: `rounded-md` (4px), checked state `#0D9488` with crisp white SVG checkmarks.
- Segmented Pill Controls: Contained in `#F1F5F9` troughs with `rounded-full` enclosures; active pill translates on a pure white card surface with level 1 elevation.

### Domain-Specific Components
- **Patient Banner Bar**: Full-width `rounded-2xl` card featuring patient photo, demographic badges, real-time allergy alerts in coral, and vital sign mini-sparklines.
- **Telemetry Metric Tile**: Micro-card displaying vital name (`label-sm`), high-impact value (`telemetry-num`), and normal range limits with directional trend chevrons.