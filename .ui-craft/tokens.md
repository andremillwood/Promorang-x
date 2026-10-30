# Existing design tokens

Source: apps/web/src/index.css and apps/web/tailwind.config.ts. This records the current system; it does not replace it.

## Colors
Semantic HSL variables: --background 40 33% 98%, --foreground 0 0% 8%, --primary 24 100% 50%, --secondary 35 25% 93%, --muted-foreground 30 10% 36%, --accent 45 100% 55%. Dark values are defined under .dark. The public homepage intentionally uses dark green/charcoal surfaces and orange highlights.

## Typography
DM Sans body; Fraunces and Anton are existing display options. Promorang Space covers the space glyph for WebKit. Preserve the current font system.

## Spacing
Tailwind 4px scale. Homepage rail gap 12px; controls at least 44px tall.

## Radius
Root --radius: .125rem (2px). Shared panels and actions use restrained 2px corners; navigation uses flat selection rules. Tangible PromoCards, avatars and intentional brand elements retain their own shapes. Generic content panels have no default border or shadow. Critical header gradient borders remain unchanged.

## Shadows
Existing --shadow-soft, --shadow-card, --shadow-elevated and --shadow-glow in index.css. Do not add decorative elevation to content rails.

## Gaps
Homepage uses local raw colors alongside global semantic tokens. Consolidation needs a separate theme review to preserve intentional dark surfaces.

## Consumer surface roles — 2026-10-29
Consumer photographic heroes: existing brand imagery at full opacity with local text scrims. Display: existing Anton for the hero, DM Sans for actions/copy, Fraunces for editorial section titles. Warm board: #f4eee2; inset paper: #e9dfcc; participant canvas: #151512; primary orange: #ff7c32. These are scoped consumer surface tokens, not global operator changes. Tangible PromoCard keeps its physical radius; content uses open composition, controls 3px corners.
