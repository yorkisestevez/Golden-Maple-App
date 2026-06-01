# Estevez Intelligence — marketing site

A single-page marketing site for the AI-services arm. **Self-contained, zero build step, zero backend.**

## Run it

Just open the file — there's nothing to install or build:

```
estevez-intelligence/index.html
```

Open it directly in a browser, or serve the folder statically (e.g. `npx serve estevez-intelligence`). Fonts load from Google Fonts, so an internet connection is needed for the intended typography (it degrades to system serif/sans offline).

## What's inside

Everything lives in `index.html` — HTML, CSS, and a small vanilla-JS block, all inline and commented.

- **Type:** Cormorant Garamond (display) + Hanken Grotesk (body).
- **Palette** (CSS variables at the top of the `<style>`): burgundy `#6B1E2E`, gold `#D4AF63`, bone `#F2EEE7`, ink `#2B2622`.
- **Sections:** Hero · The Real Pitch · Services Menu · How We Work · Proof · Philosophy · Contact · Footer (alternating light/dark bands).
- **Motion:** one orchestrated hero reveal (staggered `animation-delay`) + IntersectionObserver scroll reveals. All animation is disabled under `prefers-reduced-motion`.
- **Contact:** the composer builds a `mailto:` link in JS — no form submission, no backend, no browser storage. The email/phone links work on their own as a fallback.

## Extending it

- All colours and spacing are CSS custom properties under `:root` — change them in one place.
- Service items are plain `.menu-row` blocks; copy one to add a service.
- The maple-leaf motif is a single inline `<symbol id="maple">` reused via `<use>`.

## Notes / flags

- **Email:** currently reuses `yorkis@goldenmaplelandscaping.ca`. A dedicated AI-arm address (e.g. `yorkis@estevezintelligence.ca`) would read cleaner once the brand stands on its own — swap it in the three contact spots and the JS `mailto:`.
- **Engagement pricing** is intentionally omitted (quoted per client).
