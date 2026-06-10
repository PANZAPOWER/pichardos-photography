# START-HERE.md — Pichardo's Photography

## REQUIRED INPUTS (fill these in before go-live)

| Item | Status | Notes |
|------|--------|-------|
| Phone number | ❌ MISSING | Add to `src/_data/site.json` → `phone` + `phoneDisplay` |
| Full mailing address | ❌ MISSING | Add to `src/_data/site.json` → `address.zip` |
| Business email | ⚠️ Placeholder | Confirm: `pichardosphotography@gmail.com` |
| Domain name | ❌ NOT REGISTERED | Buy via Cloudflare Registrar (recommended: pichardosphotography.com) |
| Cloudflare account | ❌ NEEDED | Create free at cloudflare.com — needed for deploy |
| GitHub repo | ❌ NEEDED | Push code to GitHub → connect to Cloudflare Pages |
| Supabase project | ❌ OPTIONAL | For storing contact form leads in a database |

## DEPLOY STEPS (once Cloudflare account is ready)

```powershell
cd C:\Users\panza\Projects\pichardos-photography

# 1. Install Wrangler login
npm install -D wrangler
npx wrangler login

# 2. Deploy to Cloudflare Pages
npx wrangler pages deploy _site --project-name=pichardos-photography --branch=main --commit-dirty=true

# 3. Site will be live at: pichardos-photography.pages.dev
```

## ADMIN CMS — HOW MIGUEL ADDS PHOTOS & BLOGS

The website has a built-in admin panel at: **https://yourdomain.com/admin/**

To use it:
1. Set up Netlify Identity OR GitHub authentication in Cloudflare Pages
2. Log in at /admin/
3. From there Miguel can:
   - **Add blog posts** — write title, upload photo, write content → Publish
   - **Upload gallery photos** — drag and drop into gallery categories
   - **Update reviews** — add new 5-star reviews from clients
   - **Change business info** — phone, email, address

## ADDING PHOTOS MANUALLY (alternative)

Simply drop JPEG/PNG files into any folder under:
`src/assets/img/gallery/[category]/`

Then run `npm run build` to rebuild the site. The gallery auto-discovers all images.

## LOCAL DEVELOPMENT

```powershell
cd C:\Users\panza\Projects\pichardos-photography
npm run build    # rebuild site
npm run serve    # preview at http://localhost:8080
```

## FILE LOCATIONS

| Thing | Where |
|-------|-------|
| All photos | `src/assets/img/gallery/` |
| Logo | `src/assets/img/logo/logo-main.png` |
| Business info | `src/_data/site.json` |
| Services | `src/_data/services.json` |
| Reviews | `src/_data/reviews.json` |
| FAQs | `src/_data/faqs.json` |
| Service areas | `src/_data/areas.json` |
| Blog posts | `src/blog/posts/` (add .md files) |
| CSS styles | `src/assets/css/main.css` |
| Contact form backend | `functions/api/lead.js` |
