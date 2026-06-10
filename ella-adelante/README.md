# Ella Adelante

> Historias, herramientas y voz para la mujer que avanza.
> Stories, tools, and voice for the woman moving forward.

A production-ready **bilingual** (Spanish / English) women's empowerment
publication based in the Dominican Republic. Built with **Astro**, edited
through **Decap CMS**, and deployed on **Netlify**.

This is a platform brand, built to grow into a publication with multiple
contributors — not a personal blog.

---

## Tech at a glance

| Piece            | Choice                                            |
| ---------------- | ------------------------------------------------- |
| Framework        | [Astro](https://astro.build) (static output)      |
| Content          | Markdown via Astro **content collections**        |
| CMS              | [Decap CMS](https://decapcms.org) at `/admin`     |
| Hosting          | [Netlify](https://netlify.com) + Git Gateway      |
| Fonts            | Fraunces (display) + Inter (body), self-hosted    |
| Images           | Astro `<Image>` (responsive WebP, lazy below fold)|
| Newsletter       | Buttondown / ConvertKit (swappable, one component)|
| Analytics        | Plausible-ready, **commented out by default**     |

---

## Project structure

```
ella-adelante/
├── public/
│   ├── admin/            # Decap CMS (config.yml + index.html)
│   ├── images/           # OG image, static assets
│   ├── favicon.svg
│   └── robots.txt
├── scripts/
│   └── gen-heroes.mjs    # generates placeholder hero images (sharp)
├── src/
│   ├── assets/heroes/    # optimized hero images (CMS uploads land here too)
│   ├── components/       # Header, Footer, PostCard, LanguageRibbon, …
│   ├── content/posts/    # the 6 seeded sample posts (markdown)
│   ├── content.config.ts # post schema + pillars/languages
│   ├── i18n/ui.ts        # ALL site chrome copy, ES + EN
│   ├── layouts/          # Base, Home, Pillar, Post, About, Contact
│   ├── lib/posts.ts      # queries, reading time, related posts
│   ├── pages/            # routes (ES at root, EN under /en)
│   └── styles/global.css # the design system
├── docs/PUBLISHING.md    # one-page guide for the (non-technical) editor
├── astro.config.mjs
└── netlify.toml
```

### Routes

| Route                | Page                                            |
| -------------------- | ----------------------------------------------- |
| `/`                  | Home — featured hero + latest by pillar         |
| `/historias`         | Stories — profiles of Dominican/Latina women    |
| `/dinero`            | Money & Work — financial literacy, business     |
| `/voz`               | Voice — essays on culture, machismo, ambition   |
| `/herramientas`      | Tools — guides, templates, resources            |
| `/sobre-nosotras`    | About the platform (mission-first)              |
| `/contacto`          | Contact + contributor pitch form                |
| `/articulo/[slug]`   | A single article (lives in its native language) |
| `/en/*`              | English mirror of the index routes              |
| `/rss.xml`           | RSS feed                                         |
| `/admin`             | Decap CMS                                        |

Posts are tagged `es`, `en`, or `bilingual`. Nothing is force-translated —
each post lives in its own language, and the nav language toggle filters the
views accordingly (`bilingual` posts appear in both).

---

## Local development

Requires **Node 20+**.

```bash
cd ella-adelante
npm install
npm run dev           # http://localhost:4321
```

> The placeholder hero images are committed (`src/assets/heroes/`), so a fresh
> clone builds with no extra steps. To regenerate or tweak them, run
> `npm run seed:images` (uses `sharp`, already installed).

### Useful scripts

| Command               | What it does                              |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Start the dev server                      |
| `npm run build`       | Production build to `dist/`               |
| `npm run preview`     | Preview the production build locally      |
| `npm run seed:images` | Regenerate placeholder hero images        |

### Editing content locally with the CMS

`config.yml` has `local_backend: true`, so you can run the CMS against your
local files without Netlify:

```bash
npx decap-server      # in one terminal
npm run dev           # in another, then open http://localhost:4321/admin
```

---

## Deploy to Netlify

1. **Push this repo to GitHub** (already a git repo).
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Set the build settings (Netlify reads `netlify.toml`, but confirm):
   - **Base directory:** `ella-adelante`
   - **Build command:** `npm run build`
   - **Publish directory:** `ella-adelante/dist`
   - **Node version:** 20 (already in `netlify.toml`)
4. Deploy. The site is live.

### Turn on the CMS (one-time)

So the founder can publish without touching code:

1. **Enable Netlify Identity:** site → **Identity → Enable Identity**.
2. **Enable Git Gateway:** Identity → **Services → Git Gateway → Enable**.
3. **Registration:** set Identity → Registration to **Invite only**.
4. **Invite the editor:** Identity → **Invite users** → enter her email.
5. She clicks the email link, sets a password, and lands in `/admin`.

Full step-by-step (in plain Spanish and English) lives in
[`docs/PUBLISHING.md`](docs/PUBLISHING.md).

### Contact form

The contact form uses **Netlify Forms** (`data-netlify="true"`). Submissions
appear in the Netlify dashboard under **Forms** — no backend needed. Add a
notification email there to get pitches in your inbox.

---

## Customization cheatsheet

| Want to change…           | Edit…                                                  |
| ------------------------- | ------------------------------------------------------ |
| Colors / fonts            | `src/styles/global.css` (`:root` tokens)               |
| Any UI text (ES & EN)     | `src/i18n/ui.ts`                                        |
| Social links / email      | `SOCIAL` in `src/i18n/ui.ts`                            |
| Pillar names / missions   | `PILLARS` in `src/i18n/ui.ts`                           |
| Newsletter provider       | `PROVIDER` in `src/components/Newsletter.astro`         |
| Production domain         | `SITE` in `astro.config.mjs` (+ `robots.txt`, sitemap) |
| Turn on analytics         | Uncomment Plausible in `src/components/BaseHead.astro`  |

---

## Accessibility & performance

- Single-column on mobile, magazine grid on desktop; responsive down to 360px.
- Visible keyboard focus, skip link, semantic landmarks, `aria-current` nav.
- `prefers-reduced-motion` respected.
- Responsive WebP via Astro `<Image>`; hero eager, everything else lazy.
- Per-post `lang`, Open Graph + Twitter cards, and `hreflang` where an ES/EN
  pair is linked via `translationOf`.

Built to clear **Lighthouse 95+** on mobile for performance, accessibility,
and SEO.
