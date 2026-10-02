# eLL gAllo — Practical Activities Monitor

A premium, editorial-style campaign website for **Mohamed Amine ARSSALANE (eLL gAllo)**,
candidate for **Practical Activities Monitor** (实践委员) at the School of International Education.

> The central question the site answers: **"Why am I the right choice?"** — answered with
> evidence, never empty claims.

**English · 中文** (toggle in the nav) · **Dark & light themes** (moon/sun button, follows your system preference on first visit, remembers your choice).

---

## Quick start

The site loads its content with `fetch()`, so it must be served over HTTP
(opening `index.html` directly from disk will block the JSON in most browsers).

```bash
# from the eLL-gAllo folder — pick any one:
python -m http.server 8000
npx serve .
php -S localhost:8000
```

Then open `http://localhost:8000`.

## File structure

```
eLL-gAllo/
├── index.html          # semantic skeleton; sections mount content from JSON
├── css/style.css       # design system (dark editorial theme, responsive)
├── js/script.js        # JSON rendering + nav, reveals, lightboxes, CV viewer
├── data/data.json      # ← SINGLE SOURCE OF TRUTH for all personal content
├── cv/index.html       # print-perfect A4 CV (EN/中文) — "View CV" opens this
├── assets/
│   ├── images/         # optional local photos
│   ├── certificates/   # optional local certificate scans
│   └── cv/             # optional local CV file
└── README.md
```

## Replacing images & content

**You should never need to edit `index.html` or `js/script.js` to change personal content.**
Everything lives in [data/data.json](data/data.json):

| Key | What it controls |
|---|---|
| `settings` | Default language (`en` / `zh`) and default theme (`dark` / `light`) |
| `personal` | Shared facts; `nationality`, `major`, `school`, `position` are per-language objects |
| `media` | **All image/CV URLs in one place** — profile, hero, experience[], certificates[], gallery[], cv |
| `media.cv` | Currently `"cv/"` (the built-in CV page). Can be a PDF/image URL instead — PDFs & images open in the site's built-in viewer |
| `content.en` / `content.zh` | All prose per language (hero, about, experience, why, activities, sports, certificates, gallery, final, footer) |
| `ui.en` / `ui.zh` | Nav labels, section titles, labels, ID-card facts, counters per language |
| `social[]` | Optional footer links |

### Switching to Chinese / English

The **EN / 中文** toggle in the nav switches instantly and remembers the choice.
To change the default language for all visitors, set `"defaultLanguage": "zh"` in `settings`.
Chinese typography automatically switches to Noto Sans SC with adjusted sizes.

### Themes

The moon/sun button toggles **dark ↔ light**. First-time visitors get their OS preference
(`prefers-color-scheme`); the choice is stored in `localStorage` (`ga-theme`).
To force a theme for everyone, set `"defaultTheme": "light"` in `settings`.

### Placeholder system

Any image URL still set to a `REPLACE_WITH_*` value (or an `example.com` URL) renders a
neutral "IMAGE PENDING" placeholder instead of a broken image. Just paste a real URL into
`data.json` and refresh — no code changes needed.

Layout spans for gallery images: `"span": "big" | "wide" | "tall"` (or omit for standard).
Certificate cards accept `"wide": true` for double-width tiles.

## Notes

- No frameworks, no build step, no dependencies — HTML + CSS + vanilla JS + JSON.
- Keyboard accessible lightboxes (Esc / ← / →), `prefers-reduced-motion` respected.
- CV viewer supports three kinds of targets: a folder/HTML page (opens as a page — that's the default `cv/`), a PDF (inline viewer), or an image (inline viewer). Print the CV page with the "Print / Save as PDF" button to get an A4 PDF, upload it anywhere, and point `media.cv` at it if you prefer.
- The CV page (`cv/index.html`) is bilingual (EN/中文) with its own toggle and remembers your choice; it can also be edited as a standalone file.
- The only mention of the role anywhere is **Practical Activities Monitor / 实践委员** — never anything else.
