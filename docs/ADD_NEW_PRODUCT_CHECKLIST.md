# Reusable Runbook: Adding a New Payhip Product to `federico-d.web.app`

Use this checklist and prompt template whenever a new digital product is published on Payhip (`FDigitalFlow`) and needs to be added to `https://federico-d.web.app/store`.

---

## 1. Ready-to-Use Copy-Paste Prompt for Future Products

Copy and paste the prompt below into Antigravity whenever you have a new product ready:

```text
Follow docs/ADD_NEW_PRODUCT_CHECKLIST.md to add my new Payhip product to https://federico-d.web.app/store and deploy it live:
- Payhip URL: https://payhip.com/b/[YOUR_CODE]
- Local Product Folder: [FULL_FOLDER_PATH]
- Target Store Category: [excel | business | software | life]
- SKU Code: [e.g. XL-07 / BIZ-05 / APP-03 / EDU-02 / LIFE-02]

Verify the live Payhip page price and title first, update all 7 count/compatibility touchpoints across store.html, index.html, script.js, and sitemap.xml, keep paid deliverable files out of the public website repo, and verify the live deployment when done.
```

---

## 2. Security & Hosting Boundary Rule (Critical)

- **Never copy paid deliverable files (`.zip`, `.xlsx`, `.pdf`, `.exe`, `.py`, `SKILL.md`) into `c:\Users\freda\AI Projects\mywebsite_f`.**
- Firebase Hosting deploys the root workspace publicly. Any file placed in the public web root (unless excluded in `firebase.json`) can be downloaded directly without paying.
- Only read the local product folder to extract accurate metadata (title, subtitle, price, compatibility, and "What's Included" bullets) for the storefront card in `store.html`.

---

## 3. Store Categories & SKU Naming Convention

| Store Category (`data-category`) | Filter Button Label | SKU Prefix | Pill Color Convention |
|---|---|---|---|
| `excel` | Excel, Power Query & Finance | `XL-01`, `XL-02`, ... | `pill-emerald` (Win/Mac Excel `.xlsx` / PDF) or `pill-ochre` (Windows Power Query `.m`) |
| `business` | HR, Ops & Consulting AI | `BIZ-01`, `BIZ-02`, ... | `pill-emerald` (Cross-Platform AI Skill / Offline Browser HTML) |
| `software` | Software & Web Utilities | `APP-01`, `APP-02`, ... | `pill-ochre` (Windows `.exe`) or `pill-emerald` (Cross-Platform Offline HTML / AI) |
| `life` | Education & Wellness AI | `EDU-01`, `LIFE-01`, ... | `pill-emerald` (Cross-Platform AI Skill / Offline Browser HTML) |

---

## 4. Standard HTML Card Template (`store.html`)

Insert the new `<article>` card at the end of the matching `<section class="store-category-group" data-category="...">` grid (`.store-grid`):

```html
            <!-- [SKU_CODE] -->
            <article class="card sku-card" data-sku-card data-sku="[SKU_CODE]" data-category="[excel|business|software|life]" id="[kebab-case-slug]">
              <div class="sku-meta">
                <span class="sku-code">[SKU_CODE]</span>
                <span class="pill [pill-emerald|pill-ochre]">[Format Summary Pill]</span>
                <span class="badge badge-slate">Instant Download</span>
              </div>
              <h3 class="sku-title">[Product Name] — [1-Line Value Subtitle]</h3>
              <p class="sku-desc">
                [1–2 sentence practical summary of what the toolkit does and the problem it solves.]
              </p>
              <p class="sku-compat">[OS / Excel / AI / Browser compatibility note.]</p>

              <div class="sku-price-row">
                <span class="sku-price">$[XX.00] USD</span>
                <span class="sku-price-note">[Delivery & license note, e.g. Instant ZIP download · Unlocked formulas]</span>
              </div>

              <div class="sku-actions">
                <a href="https://payhip.com/b/[PAYHIP_ID]" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                  Buy on Payhip
                  <svg class="icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 17L17 7"></path>
                    <path d="M8 7h9v9"></path>
                  </svg>
                </a>
                <button type="button" class="spec-toggle" data-spec-toggle aria-expanded="false" aria-controls="specs-[kebab-case-slug]">
                  What's Included
                  <svg class="icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </button>
              </div>

              <div class="sku-specs" id="specs-[kebab-case-slug]" hidden>
                <h4>What's Included</h4>
                <ul>
                  <li>[Deliverable 1 with file extension in <code>.ext</code>]</li>
                  <li>[Deliverable 2 with file extension in <code>.ext</code>]</li>
                  <li>[Deliverable 3 with file extension in <code>.ext</code>]</li>
                  <li>[Deliverable 4 with file extension in <code>.ext</code>]</li>
                </ul>
              </div>
            </article>
```

> **Note:** If the product requires Windows-only Power Query (`.m`) or a Windows executable (`.exe`), also add the adaptation helper link right above `<div class="sku-specs" ...>`:
> ```html
> <a href="/?topic=power-query&amp;item=[SKU_CODE]#contact" class="sku-helper-link">Need Google Sheets or Mac adaptation? Request custom build</a>
> ```

---

## 5. The 7 Mandatory Count & Metadata Touchpoints

Whenever a product is added (or removed), update all 7 places below so static HTML, SEO meta tags, and JavaScript stay 100% synchronized:

1. **`store.html` — Open Graph & Twitter Meta Descriptions (Lines ~19 & ~26):**
   - Update `<meta property="og:description" content="[TOTAL] verified Excel workbooks...">`
   - Update `<meta name="twitter:description" content="[TOTAL] verified Excel workbooks...">`
2. **`store.html` — `Before You Buy — Compatibility` Disclosure Box (Line ~176):**
   - Add the new `SKU_CODE` to the matching compatibility group:
     - Win/Mac standard Excel workbooks (`XL-01, XL-02 & XL-06`)
     - Windows-only Power Query tools (`XL-03, XL-04, XL-05`)
     - Windows desktop executables (`APP-01`)
3. **`store.html` — Filter Toolbar Button Counts (`.filter-btn .filter-count`, Lines ~191–206):**
   - Increment `All Toolkits` `<span class="filter-count">[TOTAL]</span>`
   - Increment the target category's `<span class="filter-count">[CAT_COUNT]</span>`
4. **`store.html` — Live Filter Status Text (`#store-total-count`, Line ~207):**
   - Update `<p id="store-total-count" class="store-count-status" aria-live="polite">Showing [TOTAL] toolkits</p>`
5. **`store.html` — Category Group Section Comment & Header Badge (`.category-head .badge`):**
   - Increment `<!-- Group X: ... ([CAT_COUNT] SKUs) -->` and `<span class="badge badge-slate">[CAT_COUNT] Toolkits</span>`
   - *(Note: `script.js` also auto-syncs `.filter-count`, `#store-total-count`, and `.category-head .badge` at runtime from the `[data-sku-card]` DOM count.)*
6. **`index.html` — Homepage Track Record Counter (`#track-record`, Line ~586):**
   - Update `<strong class="track-val">[TOTAL] Kits</strong>` under `Verified Digital Toolkits`.
7. **`sitemap.xml` — `<lastmod>` Dates:**
   - Update `<lastmod>YYYY-MM-DD</lastmod>` for both `https://federico-d.web.app/` and `https://federico-d.web.app/store` to the current deployment date.

---

## 6. Post-Deployment Live Verification Checklist

1. **Deploy & Push:**
   - Run `firebase deploy --only hosting` (or commit and push to `origin/main` so GitHub Actions deploys to Firebase Hosting).
2. **Verify Live Store (`https://federico-d.web.app/store`):**
   - Confirm `All Toolkits` button and `Showing [TOTAL] toolkits` reflect the new total.
   - Click each category filter button (`All Toolkits`, `Excel, Power Query & Finance`, `HR, Ops & Consulting AI`, `Software & Web Utilities`, `Education & Wellness AI`) and confirm the filtered count and cards update accurately.
   - Click `What's Included` on the new product card to confirm `#specs-[slug]` expands and collapses cleanly.
   - Test deep-linking via `https://federico-d.web.app/store#[kebab-case-slug]` to confirm it auto-scrolls to the card and opens its `What's Included` drawer.
   - Click `Buy on Payhip` on the new card to confirm it opens the live Payhip listing in a new tab.
3. **Verify Live Homepage (`https://federico-d.web.app/`):**
   - Confirm the `#track-record` stat reads `[TOTAL] Kits`.
