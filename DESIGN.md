---
version: "alpha"
name: VaiComigo Interior Mobility
description: Design system for a pragmatic, safe, profitable local mobility app operating first in Padre Paraiso - MG.
colors:
  primary: "#0F5F4A"
  primary-dark: "#083A2D"
  neutral-950: "#0B0B0B"
  neutral-900: "#141414"
  neutral-800: "#1F1F1F"
  neutral-100: "#ECECEC"
  neutral-300: "#C9C9C9"
  danger: "#8B2E2E"
  danger-soft: "#FFB4AB"
  warning: "#B87900"
  success: "#0F5F4A"
typography:
  h1:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: 0
  h2:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 1.25rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
  body:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  label:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
rounded:
  sm: 4px
  md: 8px
  lg: 12px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-100}"
    rounded: "{rounded.md}"
    padding: 16px
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.neutral-100}"
    rounded: "{rounded.md}"
    padding: 16px
  surface-card:
    backgroundColor: "{colors.neutral-900}"
    textColor: "{colors.neutral-100}"
    rounded: "{rounded.md}"
    padding: 16px
---

## Overview

VaiComigo is a local mobility product, not a decorative tech demo. The interface must communicate trust, route certainty, transparent pricing, and driver profitability. The first market is Padre Paraiso - MG, where the product must feel local, direct, and operational.

## Colors

Use deep black as the main shell, petrol green for primary economic actions, and off-white for readable text. Red is reserved for safety, fraud, blocking, cancellation, and emergency states. Avoid decorative gradients, oversized hero sections, and generic startup palettes.

## Typography

Use system sans-serif typography with strong hierarchy and no negative letter spacing. Mobile controls must remain readable in sunlight and on low-cost Android devices.

## Layout

Mobile first. The ride request screen prioritizes map, origin, destination, price, payment, and call-to-action. During an active ride, map, driver identity, plate, share, support, and emergency actions must remain visible or one tap away.

## Elevation & Depth

Use restrained surfaces with clear borders. Avoid nested cards. Use elevation only for menus, modals, autocomplete lists, and bottom action sheets.

## Shapes

Default radius is 8px. Larger radius is acceptable only for bottom sheets and map containers. Buttons need stable height and comfortable tap targets.

## Components

Primary buttons are for money-moving or ride-moving actions. Danger buttons are for emergency, cancellation, blocking, or fraud review. Inputs always need labels or screen-reader labels and visible error states.

## Do's and Don'ts

Do show fixed price before ride acceptance. Do show route and distance source. Do warn when using fallback maps. Do protect driver wallet information. Do not hide fees. Do not allow a ride without validated coordinates. Do not rely on frontend values for final pricing or wallet debit.
