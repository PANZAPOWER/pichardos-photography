# MASTER RECOVERY MEMORY — Pichardo's Photography Website

## 1. QUICK START
```powershell
cd C:\Users\panza\Projects\pichardos-photography
npm run build     # rebuild _site/
npm run serve     # preview at http://localhost:8080
npm run deploy    # build + deploy to Cloudflare Pages
```

## 2. IDENTITY
- **Business:** Pichardo's Photography
- **Owner:** Miguel Pichardo
- **Brand:** Dark luxury gold, "Capturing Moments • Creating Memories"
- **Instagram:** @Pichardos_photography
- **Facebook:** Miguel Pichardo (miguel.pichardo.14)
- **Service Area:** All of Texas (HQ: Dallas)

## 3. FILE MAP
```
pichardos-photography/
├── src/
│   ├── _data/           ← site.json, services.json, reviews.json, areas.json, faqs.json
│   ├── _includes/
│   │   ├── layouts/base.njk
│   │   └── components/  ← header.njk, footer.njk, chatbot.njk
│   ├── assets/
│   │   ├── css/main.css         ← ALL styles (dark luxury design system)
│   │   ├── js/main.js           ← nav, lightbox, scroll, counter
│   │   └── img/
│   │       ├── logo/logo-main.png
│   │       └── gallery/         ← 179 photos in 10 categories
│   ├── admin/           ← Decap CMS (index.html + config.yml)
│   ├── index.njk        ← Home page
│   ├── services.njk     ← Services hub
│   ├── services/service-page.njk  ← 8 service pages (paginated)
│   ├── gallery.njk      ← Gallery with filter
│   ├── about.njk        ← About Miguel
│   ├── reviews.njk      ← Reviews
│   ├── contact.njk      ← Contact/Book form
│   ├── thank-you.njk    ← Thank you after form submit
│   ├── faq.njk          ← FAQ
│   ├── blog.njk         ← Blog hub
│   ├── service-areas.njk ← Areas hub
│   ├── service-areas/area-page.njk  ← 9 city pages (paginated)
│   ├── sitemap.njk      ← /sitemap.xml
│   ├── robots.txt       ← AI bots allowed
│   └── llms.txt         ← AI site map
├── functions/api/lead.js ← Contact form backend (Cloudflare Pages)
├── scripts/serve.js      ← Local static server
├── scripts/validate-jsonld.js ← JSON-LD validator
├── .eleventy.js          ← 11ty config
├── package.json
├── wrangler.toml
└── START-HERE.md         ← REQUIRED INPUTS + deploy guide
```

## 4. ACCOUNTS NEEDED
| Service | Status | URL |
|---------|--------|-----|
| Cloudflare (hosting) | ❌ Needed | cloudflare.com |
| GitHub (code repo) | ❌ Needed | github.com |
| Supabase (leads DB) | ❌ Optional | supabase.com |
| Domain (pichardosphotography.com) | ❌ Needed | via Cloudflare Registrar |

## 5. SESSION LOG
- **2026-06-09:** Full site built. 11ty v3 + Nunjucks. 28 pages, 54 JSON-LD blocks validated, 179 photos copied. Dark luxury design. Chatbot, lightbox, Decap CMS admin, contact form. Build passes clean.

## 6. CURRENT STATE
- ✅ Build passes clean
- ✅ 54 JSON-LD blocks valid
- ✅ 179 photos deployed
- ✅ 28 pages generated
- ✅ Chatbot functional (FAQ answers inline)
- ✅ Contact form (fail-soft, Supabase-ready)
- ✅ Decap CMS admin at /admin/
- ❌ Not yet deployed (Cloudflare account needed)
- ❌ Phone number missing from site.json
- ❌ Domain not registered

## 7. PUNCH LIST (before go-live)
- [ ] Add phone number to `src/_data/site.json`
- [ ] Register domain (pichardosphotography.com recommended)
- [ ] Create Cloudflare account + deploy
- [ ] Set up GitHub repo + connect to Cloudflare Pages for auto-deploy
- [ ] (Optional) Set up Supabase leads table + add env vars
- [ ] Set up Netlify Identity or GitHub auth for /admin/ CMS
- [ ] Test contact form submission end-to-end

## 8. TRIGGERS / KEYWORDS
- "resume pichardos" → this project
- "photography website" → this project
- "Miguel photography" → this project

## 9. GOTCHAS
- Photos were renamed with folder prefix (e.g. `xv-1.jpeg`, `prom-1.jpeg`) for consistency
- Gallery auto-discovery via `.eleventy.js` `addGlobalData("galleryImages")` 
- The hero carousel reads image list from `data-images` attribute on the img tag
- Admin CMS (Decap) requires either Netlify Identity or GitHub OAuth backend — must configure on Cloudflare Pages

## 10. COMMAND CHEAT SHEET
```powershell
# Build
Set-Location "C:\Users\panza\Projects\pichardos-photography"
npm run build

# Preview
node scripts/serve.js   # http://localhost:8080

# Validate
node scripts/validate-jsonld.js

# Deploy (after wrangler login)
npm run deploy
```
