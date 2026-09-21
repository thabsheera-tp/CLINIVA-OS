---
name: Cliniva OS
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3e4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#a60419'
  on-tertiary: '#ffffff'
  tertiary-container: '#ca282d'
  on-tertiary-container: '#ffe5e2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
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
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 24px
  margin: 32px
  space-xs: 4px
  space-sm: 8px
  space-md: 16px
  space-lg: 24px
  space-xl: 32px
---

## Brand & Style

This design system is crafted for a modern medical operating system, engineered to instill absolute trust, clarity, and calm during high-stakes clinical workflows. The target audience includes doctors, nurses, and hospital administrators who require immediate legibility, zero cognitive friction, and rapid access to critical patient data. 

The aesthetic is rooted in a **Corporate / Modern** framework, prioritizing functional minimalism, crisp data presentation, and high-contrast typography. Visual hierarchy relies on structured surfaces and soft slate foundations to reduce eye fatigue during long shifts, while intentional pops of deep teal and alert red direct user attention precisely where it is needed most.

## Colors

The color architecture is built on a foundation of clinical cleanliness and high-contrast readability. The primary deep teal (`#0F766E`) commands authority and focus, deployed on primary actions, active navigation states, and key data points. A vibrant secondary teal (`#14B8A6`) supports interactive hover states and secondary highlights. 

Neutrals range from pristine white to soft slate grays (`#F8FAFC`, `#F1F5F9`) to establish subtle surface layering without overwhelming the interface. Critical medical alerts, urgent warnings, and error states utilize a distinct soft red (`#EF4444`) to instantly capture clinician attention without causing alarm fatigue.

## Typography

Typography is optimized for rapid scanning and absolute clarity during fast-paced clinical hours. Utilizing Inter, the type scale relies on strict geometric neutrality and robust legibility at small sizes. Font weights are carefully constrained to regular (400), medium (500), and semi-bold (600) to maintain a clean, uncluttered interface.

Ensure that patient vital signs and critical numerical data utilize tabular figures to prevent layout shifts when values update in real-time. Headlines must remain concise and high-contrast against slate background surfaces.

## Layout & Spacing

The layout philosophy implements a **Fluid grid** system designed to maximize screen real estate for complex electronic health records (EHR) and monitoring dashboards. A structured 12-column grid utilizes 24px gutters and 32px outer canvas margins on desktop viewports, scaling down proportionally for mobile clinical tablets.

Spacing adheres strictly to an 8px base rhythm (`space-sm` through `space-xl`), ensuring consistent, predictable vertical and horizontal rhythm across dense data tables, patient charts, and navigation sidebars.

## Elevation & Depth

Visual hierarchy is conveyed primarily through tonal layering and minimal elevation. The interface avoids heavy drop shadows in favor of clean surface stacking—using pure white cards (`#FFFFFF`) against soft slate background planes (`#F8FAFC`). 

Where separation is required, subtle ambient shadows (`shadow-sm`) and low-contrast ghost borders (`#E2E8F0`) provide tactile boundaries for interactive elements like modal dialogs, floating action panels, and active card states without introducing visual noise.

## Shapes

The shape language employs a consistent roundedness level of `2` (rounded), translating to a default 0.5rem radius for standard containers, inputs, and buttons, scaling up to 1rem (`rounded-lg`) for major cards and structural panels. 

This approachable geometric softness tempers the clinical environment, reducing the subconscious anxiety often associated with sharp-edged medical hardware while maintaining clean alignment across data grids and patient queues.

## Components

### Buttons
Primary buttons utilize the deep teal (`#0F766E`) fill with high-contrast white text, featuring rounded-md corners and a subtle hover state transition. Secondary actions use ghost or outlined variants with slate borders. Critical actions (e.g., "Code Blue", "Discharge Patient") must use the soft red (`#EF4444`) to signify high-impact workflows.

### Input Fields
Inputs feature crisp white backgrounds framed by soft slate borders (`#CBD5E1`), transitioning to primary teal rings upon focus. Error states trigger an immediate red border and inline validation message.

### Cards
Patient summary cards and metric modules are anchored on pure white surfaces with soft shadows (`shadow-sm`) and rounded-xl corners, containing clearly demarcated header zones for vital statistics.

### Chips & Badges
Pill-shaped status indicators use soft, low-opacity background tints paired with solid text colors to denote triage status, room occupancy, or lab result states (e.g., green for stable, yellow for caution, red for critical).

### Lists & Tables
Data tables feature alternating row backgrounds (`#F8FAFC` and `#FFFFFF`) with generous padding to prevent misreads during high-stress chart reviews. Sticky headers ensure context is maintained during long scrolls.

### Checkboxes & Radios
Custom-styled inputs featuring clean borders that adopt the primary teal fill upon selection, ensuring clear visual confirmation for medication administration checklists.