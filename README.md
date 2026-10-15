# HealthyStartChildCare.com

[![Deploy to Cloudflare Pages](https://github.com/MrMatt57/HealthyStartChildCare.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/MrMatt57/HealthyStartChildCare.com/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/MrMatt57/HealthyStartChildCare.com/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/MrMatt57/HealthyStartChildCare.com/actions/workflows/github-code-scanning/codeql)

Family child care website for Healthy Start Child Care in Westminster, MD.

## Tech Stack

- Static HTML, CSS, vanilla JavaScript (no frameworks or build step)
- Hosted on [Cloudflare Pages](https://pages.cloudflare.com/) (free tier)
- Auto-deploys from `main` branch via GitHub Actions

## Development

No build step required. Open `index.html` locally or use any static file server:

```bash
npx serve .
```

To create the upload-ready staging ZIP and the exact directory used by Cloudflare Pages:

```bash
python scripts/package-site.py
```

Upload `artifacts/Healthy-Start-staging.zip` to staging, or serve `dist/` locally. The ZIP has `index.html` at its root and contains only public site files. Each deployment workflow also saves the ZIP as the `Healthy-Start-staging` artifact. Merge an approved PR into `main` to deploy to production.

The contact section preserves the existing EngageBay embed. If the provider cannot load the form, an email fallback appears after eight seconds. The provider currently returns HTTP 401 on the live site; a valid public form URL or updated embed is needed to restore form submissions. No test inquiries are submitted by the website checks.

## Deployment

Cloudflare Pages automatically deploys on push to `main`:
- **Production**: `main` branch → healthystartchildcare.com
- **Preview**: Every pull request gets a preview deployment URL

### Setup (one-time)

1. Create a Cloudflare Pages project linked to this GitHub repo
2. Build output directory: `/` (no build command needed)
3. Configure custom domain `healthystartchildcare.com` in Pages dashboard

## Project Structure

```
├── index.html          # Main single-page site
├── 404.html            # Custom 404 page
├── thankyou.html       # Form submission thank you page
├── css/
│   ├── base.css        # Grid system and reset
│   ├── font-awesome.min.css
│   └── style.css       # Site styles
├── js/
│   └── main.js         # Vanilla JS (menu, scroll, carousel, lightbox, pricing)
├── data/
│   └── pricing.json    # Openings/pricing data
├── images/             # Site images
├── sample-report/      # Sample activity log
├── robots.txt          # SEO crawl rules
└── sitemap.xml         # Sitemap for search engines
```
