# Game Tools Site — Requirements

**Status:** Ready for planning
**Date:** 2026-05-08
**Scope:** Lightweight (single-author static site, no novel architecture)

## Problem & Goal

A personal hub for game notes — saved builds, reference material, screenshots, links to source guides. One author (me), public read, IDE-only authoring via MDX in git.

The site succeeds when adding a new entry is "create file, drop screenshot, push" and finding an old entry is "type into search box."

## Audience & Author

- **Author:** single editor, edits MDX in IDE, commits to git.
- **Readers:** public, no accounts, no interaction beyond reading.

## Tech Stack (decided)

| Concern | Choice |
|---|---|
| Framework | Fumadocs (Next.js + MDX) |
| Content | MDX in `content/docs/`, one folder per game |
| Search | Fumadocs Orama static search (client-side, build-time index) |
| Build | `output: 'export'` — fully static HTML/JS/CSS |
| Hosting | **Cloudflare Workers Static Assets** via `wrangler deploy` from a GitHub Action on push to `main` |
| Repo | Public on GitHub |
| Theme | Dark default, light/dark toggle available |
| Domain | TBD (resolve before launch) |

### Hosting note (resolved)

Original spec was inconsistent (table said Workers, deploy steps described Pages). Decided: **Workers Static Assets**. This means:
- `wrangler.toml` lives in repo root, points `assets.directory = "./out"`.
- Deploy is a GitHub Action: `npm ci && next build && npx wrangler deploy` with a `CLOUDFLARE_API_TOKEN` repo secret.
- No Pages dashboard build config to manage.
- Future-proof: if a redirect, header tweak, or tiny edge logic is ever wanted, the Worker is already there.

## Content Model

Each entry is one MDX file with frontmatter:

```yaml
---
title: "Saryn Spore Build (Steel Path)"
description: "Spore-focused build for endless Steel Path missions"
tags: ["build", "steel-path", "endgame"]
source: "https://youtube.com/watch?v=..."
date: 2026-05-08
---
```

Body is freeform MDX — text, inline screenshots via relative paths, outbound links.

## Folder Structure

```
content/docs/
  index.mdx                       # site landing
  warframe/
    meta.json                     # sidebar order
    index.mdx                     # game landing
    saryn-spore-build.mdx
    saryn-spore-build/
      mod-loadout.png
      arcanes.png
  division/
    meta.json
    index.mdx
    striker-pvp.mdx
```

One folder per game. Entries with assets get a sibling folder of the same name holding their screenshots.

## Information Architecture

- `/` — list of games
- `/<game>` — game landing (auto-generated index initially)
- `/<game>/<entry>` — entry page
- Sidebar — auto-generated from folders, ordered via `meta.json`
- Search — top-right, indexes everything

## V1 — Launch-blocking

- Folder-based sidebar nav
- MDX rendering: prose, inline screenshots, outbound links
- Site-wide Orama search
- Syntax-highlighted code blocks
- Light/dark theme toggle, dark default
- Static export building cleanly to `out/`
- GitHub Action deploying to Cloudflare Workers on push to `main`

## V2 — Deferred

- Cross-game tag pages (`/tags/<tag>`) via build-time frontmatter walker
- Custom card-grid landing pages per game (defer until content density justifies it)
- "Recently updated" feed on home page
- Image lightbox

## Non-goals

- Auth, accounts, comments, social features
- Interactive game tools (build calculators, simulators)
- Browser/mobile authoring — IDE-only
- Any backend, database, or server-rendered logic

## Success Criteria

- Adding a new entry is: create `.mdx`, save screenshots in sibling folder, `git push`. No other steps.
- Search returns the right entry within a few keystrokes from any page.
- First contentful paint feels instant on a typical connection (static HTML; CF edge).
- A push-to-deploy cycle takes minutes, not hours of fiddling.

## Open Items (non-blocking)

- [ ] Pick a domain
- [ ] Decide when content density justifies custom card-grid landing pages per game
- [ ] Confirm Orama static-search variant works smoothly with `output: 'export'` (the docs say yes; verify during build)

## Risks & Watch-outs

- **Orama + static export edge cases.** Fumadocs default search uses a server route; the static variant must be wired explicitly. If skipped, build will fail or search will 404 in production.
- **Wrangler config drift.** `wrangler.toml` and the GitHub Action token need to agree on account/project name. One-time setup pain.
- **Image weight.** Game screenshots can be large. Not blocking for V1, but if pages get heavy, revisit with `next/image` alternatives compatible with static export, or pre-compress on commit.
