# ClubRate design language

## Purpose and personality

ClubRate should feel friendly, campus-focused, and quietly confident. It makes a large set of clubs easy to browse without looking corporate or overly playful. The visual voice is clean and welcoming: soft neutral ground, Cal Poly–inspired green, and selective gold emphasis.

## Color

- **Canvas:** `#f5f6f2`, a pale green-gray used for page backgrounds.
- **Surface:** `#ffffff`, for cards and inputs.
- **Primary ink:** `#16221b`; muted supporting copy is `#637067`.
- **Primary action:** `#154734` with white foreground. Use it for key actions and familiar green iconography.
- **Accent:** `#c69214` on `#fff5d6`; reserve this gold pairing for rankings, ratings, and positive emphasis.
- **Borders:** `#d9e1da`; light, calm, and always visible enough to define a surface.

The experience is light-only. Do not introduce a dark theme or rely on system color-scheme changes.

## Typography

- Use the existing Inter/system sans-serif stack.
- Page titles are bold, compact, and slightly tight (`letter-spacing: -0.055em`).
- Use strong type for card names and section headings; use 12–15px muted type for explanation and metadata.
- Keep copy direct, campus-friendly, and succinct.

## Layout and surfaces

- Center content in a wide, responsive container (`min(1120px, calc(100% - 48px))`).
- Use generous white space: 16px grid gaps, 24px card padding, and 28–52px section spacing.
- Cards are white with a 1px neutral border and generous roundness (roughly 20–26px).
- Preserve a clear hierarchy: title and summary first, then primary interaction, then supporting information.

## Components and interaction

- Buttons are rounded (12px on primary actions; pill-like only for compact filters/tags) and have a restrained hover lift or shadow.
- Use green for primary actions, gold for ratings/featured states, and neutral borders for secondary actions.
- Tags are compact, outlined or softly tinted pills.
- Icons are simple line icons and should clarify an action or datum, not decorate every label.
- Inputs should have a white surface, a visible neutral border, and green focus treatment.
- Keep controls keyboard-accessible and pair visual controls with labels.

## Responsive behavior

- Shift multi-column layouts to one column around tablet widths.
- Retain comfortable gutters (16px minimum) and avoid crowding rating controls or contact links.
- Do not depend on hover for essential information or actions.
