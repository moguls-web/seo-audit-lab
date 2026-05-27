# 🔍 SEO Audit Lab

AI-powered SEO audit tool built with Claude. Drop in any URL and get a comprehensive score across 7 categories in seconds.

## Features

- **7-category scoring** — Technical SEO, Content Quality, On-Page, Schema & Structure, Performance, AI Readiness, Images
- **Animated score gauge** — smooth count-up to the final health score
- **Radar chart** — spider view of all categories via Recharts
- **Category explorer** — click any category for issues + recommendations
- **Action plan** — prioritised table with Impact / Effort / Timeline
- **Powered by Claude Sonnet** via the Anthropic API

## Getting Started

```bash
npm install
npm run dev
```

> The app calls the Anthropic API directly from the browser.  
> In production, proxy requests through a backend to keep your API key secure.

## Production Roadmap

- [ ] Backend proxy for Anthropic API (Express / Next.js API route)
- [ ] Real HTTP crawling via Playwright or Puppeteer
- [ ] PDF export of audit reports
- [ ] Google Search Console integration (live CWV + indexation data)
- [ ] Audit history with drift detection
- [ ] Multi-URL batch auditing
- [ ] White-label / client-facing report mode

## Tech Stack

- React 18 + Vite
- Recharts (radar chart)
- Anthropic Claude Sonnet API
- Google Fonts — Outfit + JetBrains Mono

## Structure

```
src/
  App.jsx      — full single-file application (3 screens: input → loading → results)
  main.jsx     — React root
  index.css    — global animations + scrollbar
index.html     — entry point + font preloads
```

## Deploying

**Vercel** (recommended):
```bash
npm i -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# drag-drop dist/ to netlify.com/drop
```
