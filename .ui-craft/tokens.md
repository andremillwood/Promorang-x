# Existing design tokens

Source: apps/web/src/index.css and apps/web/tailwind.config.ts. This records the current system; it does not replace it.

## Colors
Semantic HSL variables: --background 40 33% 98%, --foreground 0 0% 8%, --primary 24 100% 50%, --secondary 35 25% 93%, --muted-foreground 30 10% 36%, --accent 45 100% 55%. Dark values are defined under .dark. The public homepage intentionally uses dark green/charcoal surfaces and orange highlights.

## Typography
DM Sans body; Fraunces and Anton are existing display options. Promorang Space covers the space glyph for WebKit. Preserve the current font system.

## Spacing
Tailwind 4px scale. Homepage rail gap 12px; controls at least 44px tall.

## Radius
Root --radius: .75rem. Homepage cards use existing 1.2–1.35rem radii; action pills use fully rounded corners.

## Shadows
Existing --shadow-soft, --shadow-card, --shadow-elevated and --shadow-glow in index.css. Do not add decorative elevation to content rails.

## Gaps
Homepage uses local raw colors alongside global semantic tokens. Consolidation needs a separate theme review to preserve intentional dark surfaces.
