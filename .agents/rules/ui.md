---
trigger: glob
globs: "*.html, **/*.html, *.css, **/*.css, *.js, **/*.js"
description: "Enforce zero-CDN vanilla CSS architecture, Light Editorial design tokens, and Firebase Hosting constraints in mywebsite_f."
---

# Portfolio & Storefront Web Rules (`mywebsite_f`)

- **No CDN CSS Frameworks:** Keep zero external CSS frameworks (do not add Tailwind CDN or Bootstrap). Style all UI using the existing custom CSS variables in `/styles.css` (`--paper: #ffffff`, `--paper-2: #f8fafc`, `--slate: #111827`, `--red: #ed1c24`, `--font-sans`, `--font-mono`).
- **Accessibility & Mobile-First:** Maintain Light Mode only, WCAG AA contrast, and `>= 16px` body/input font sizing on mobile.
- **Static Hosting Constraints:** Files are served from the repo root (`.`) via Firebase Hosting (`cleanUrls: true`, `trailingSlash: false`). Keep internal links clean (e.g., `/store`, not `/store.html`) and preserve `"**/.*"` and `"**/*.md"` in `firebase.json` `hosting.ignore`.
- **Brand Copy Consistency:** Use **Federico Dumagpi** (omit "Jr.") on new or updated visible public copy; do not alter existing canonical URLs, email addresses, or structured-data `@id` URIs unless explicitly requested.
