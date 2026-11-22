---
name: add-store-product
description: "Adds a new Payhip digital product to federico-d.web.app/store, updates all 7 count and compatibility touchpoints across store.html, index.html, script.js, and sitemap.xml, deploys live to Firebase Hosting, and verifies live in the browser. Use whenever adding or updating products on the website storefront."
---

# Add Store Product Workflow

Follow the step-by-step procedures in `docs/ADD_NEW_PRODUCT_CHECKLIST.md`.

## Required Inputs
- Payhip URL: `https://payhip.com/b/[CODE]`
- Local Product Folder (for extracting deliverables and "What's Included" bullets)
- Target Category: `excel`, `business`, `software`, or `life`
- SKU Code: `XL-XX`, `BIZ-XX`, `APP-XX`, `EDU-XX`, `LIFE-XX`

## Safety Constraint
Never copy paid product archives (`.zip`, `.xlsx`, `.pdf`) into the public website repository root. Paid deliverables stay on Payhip.

## Execution Steps
1. Verify live Payhip product title, price, and active checkout button using browser subagent.
2. Read local product metadata and draft the product `<article>` card.
3. Update all 7 touchpoints:
   - `store.html`: Add `<article>` card in target category grid.
   - `store.html`: Increment `.filter-btn .filter-count` and `#store-total-count`.
   - `store.html`: Update `.category-head .badge` and section comment.
   - `store.html`: Update `Before You Buy — Compatibility` notice if applicable.
   - `store.html`: Update `og:description` and `twitter:description` counts.
   - `index.html`: Update `#track-record` counter under Verified Digital Toolkits.
   - `sitemap.xml`: Update `<lastmod>` to today's date.
4. Deploy live:
   - `firebase deploy --only hosting`
   - Git commit & push to `origin/main`
5. Verify live at `https://federico-d.web.app/store` using browser subagent.
