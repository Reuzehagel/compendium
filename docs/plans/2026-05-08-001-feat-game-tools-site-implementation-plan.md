---
title: "feat: Game Tools Site V1 — content, theme, hosting"
type: feat
status: active
date: 2026-05-08
origin: docs/brainstorms/game-tools-site-requirements.md
---

# feat: Game Tools Site V1 — content, theme, hosting

## Overview

Take the freshly scaffolded Fumadocs Static project (at `compendium/`) from the default "Hello World" state to a deployable V1: branded shell, dark default theme, real first-game content folder, and an automated GitHub-Actions deploy to Cloudflare Workers Static Assets.

The scaffold already handles the heavy lifting (static export, Orama static search, MDX pipeline). This plan covers only what's left: replacing template chrome, picking the URL shape, and wiring deployment.

---

## Problem Frame

Spec is in [docs/brainstorms/game-tools-site-requirements.md](../brainstorms/game-tools-site-requirements.md). Single-author, public-read, IDE-only authoring. Goal is "create `.mdx`, drop screenshots, push" → live site, with site-wide search.

Three TODO items in the requirements doc — `output: 'export'`, swap search to Orama static, search-route swap — turned out to be already handled by the Fumadocs Static template (verified in `compendium/next.config.mjs`, `compendium/src/app/api/search/route.ts`, `compendium/src/components/search.tsx`). Plan reflects actual remaining work.

---

## Requirements Trace

- R1. Adding an entry is `create .mdx → drop screenshots → git push` (origin: success criteria)
- R2. Site-wide search across all games (origin: V1 features)
- R3. Folder-based sidebar nav per game, ordered via `meta.json` (origin: V1 features)
- R4. Dark default theme with light/dark toggle (origin: tech stack decisions)
- R5. Static export deployable to Cloudflare Workers Static Assets via GitHub Action on push to `main` (origin: tech stack decisions)
- R6. Public GitHub repo (origin: tech stack decisions)
- R7. Syntax-highlighted code blocks (origin: V1 features) — already covered by Fumadocs default
- R8. Image rendering for inline screenshots (origin: V1 features)

---

## Scope Boundaries

- No cross-game tag pages (V2)
- No custom card-grid game landings (V2)
- No "recently updated" feed (V2)
- No image lightbox (V2)
- No comments, accounts, interactive game tools, browser authoring
- No real game content beyond one seed folder — adding actual notes is ongoing authoring, not V1

### Deferred to Follow-Up Work

- Domain purchase and DNS setup: separate one-off action; site can ship at the `*.workers.dev` URL until then
- Migrating existing scattered notes into the new structure: separate authoring work after deploy

---

## Context & Research

### Relevant Code and Patterns

- `compendium/next.config.mjs` — `output: 'export'` already set
- `compendium/source.config.ts` — Fumadocs MDX collection rooted at `content/docs`
- `compendium/src/lib/shared.ts` — single source of truth for `appName`, `docsRoute`, `gitConfig` placeholders. **Currently has fumadocs template defaults** (`'My App'`, `fuma-nama/fumadocs`)
- `compendium/src/app/api/search/route.ts` — already uses `createFromSource` `staticGET` (Orama static)
- `compendium/src/components/search.tsx` — already uses `useDocsSearch` with `type: 'static'`
- `compendium/src/components/provider.tsx` — `RootProvider` wrapper; theme defaults configured here
- `compendium/src/app/(home)/page.tsx` — landing page; currently template "Hello World"
- `compendium/src/app/docs/layout.tsx` and `compendium/src/app/docs/[[...slug]]/page.tsx` — docs route segment
- `compendium/content/docs/{index.mdx,test.mdx}` — sample content to replace

### URL Shape Decision

Origin doc IA says `/<game>/<entry>` (e.g., `/warframe/saryn-spore-build`). Scaffold serves docs at `/docs/<...>`. Two viable resolutions:

1. **Keep `/docs` prefix.** URLs become `/docs/warframe/saryn-spore-build`. Zero structural changes — only `appName`, `gitConfig`, and home copy need editing.
2. **Lift docs to root.** Change `docsRoute = '/'` in `shared.ts`, delete the `(home)` route group, move docs route from `src/app/docs/[[...slug]]/page.tsx` to `src/app/[[...slug]]/page.tsx` and `src/app/docs/layout.tsx` to `src/app/layout.tsx`-adjacent. The auto-generated index at `/` then comes from `content/docs/index.mdx`.

Plan picks **option 2** — origin IA specifies it, and on a single-purpose docs site the `/docs` prefix is just dead namespace. Reflected in U2.

### External References

- Cloudflare Workers Static Assets: https://developers.cloudflare.com/workers/static-assets/
- Wrangler `assets` binding config: https://developers.cloudflare.com/workers/static-assets/binding/
- Fumadocs static export: https://fumadocs.dev/docs/deploying/static
- Fumadocs theming (RootProvider `theme` prop / next-themes): https://fumadocs.dev/docs/ui/theme

### Institutional Learnings

- None applicable (no `docs/solutions/` in this repo)

---

## Key Technical Decisions

- **Workers Static Assets, not Pages.** Confirmed in brainstorm. Deploy via GitHub Action running `wrangler deploy`, not via Pages dashboard auto-build. Trades dashboard convenience for explicit `wrangler.toml` in repo and a future-ready Worker.
- **Lift docs to site root** rather than living under `/docs`. Matches origin IA. One-time structural change; everything afterward stays simple.
- **Dark default via `RootProvider` `theme` prop**, not a custom theme provider. Smallest possible change, uses Fumadocs' bundled `next-themes` integration. Toggle remains in the navbar.
- **Repo layout: nested `compendium/compendium/`.** The Fumadocs scaffold landed inside the workspace as a sibling of `docs/`. Two reasonable shapes — flatten so the scaffold root *is* the workspace root, or keep the nested layout and treat `compendium/` as the deployable subproject. Plan picks **flatten** (U1) so `wrangler.toml`, `.github/workflows/`, and `package.json` sit at the repo root, which is what Cloudflare Workers GitHub integrations and most CI setups expect by default.
- **One real seed game** (Warframe), not a placeholder. Forces the folder-and-screenshot pattern through the build before deploy, exposes any export edge cases on real content.
- **No `sharp` / no image optimization beyond `next/image` defaults under static export.** Static export disables runtime image optimization; screenshots are served as-is. Acceptable for V1 — origin doc flagged image weight as a watch-out, not a blocker.

---

## Open Questions

### Resolved During Planning

- **Search swap needed?** No — scaffold already shipped Orama static search.
- **`output: 'export'` already set?** Yes.
- **URL prefix `/docs` vs root?** Lift to root (see Key Decisions).
- **Where does `wrangler.toml` live?** Repo root after the flatten in U1.
- **Repo layout flatten vs nest?** Flatten.

### Deferred to Implementation

- **Exact `wrangler.toml` `name`** — depends on the Cloudflare account's existing Worker namespace; pick at deploy time.
- **GitHub Action node version pin** — match whatever the local `bun` toolchain compiles cleanly with; finalize in U5.
- **Whether to keep `serve out` script** — fine for now; reconsider only if it becomes confusing.

---

## Output Structure

After U1 flatten, repo root layout (relevant pieces only):

```
compendium/                          # repo root = scaffold root
├── .github/
│   └── workflows/
│       └── deploy.yml               # NEW (U5)
├── content/
│   └── docs/
│       ├── index.mdx                # rewritten (U3)
│       └── warframe/
│           ├── meta.json            # NEW (U4)
│           ├── index.mdx            # NEW (U4)
│           ├── saryn-spore-build.mdx # NEW (U4)
│           └── saryn-spore-build/
│               └── placeholder.png  # NEW (U4)
├── docs/                            # planning artifacts (this file lives here)
│   ├── brainstorms/
│   └── plans/
├── src/
│   ├── app/
│   │   ├── [[...slug]]/page.tsx     # MOVED from src/app/docs/[[...slug]]/page.tsx (U2)
│   │   ├── layout.tsx               # docs layout merged in (U2)
│   │   └── ...                      # og, llms routes unchanged
│   ├── components/
│   │   └── provider.tsx             # MODIFIED — dark default (U3)
│   └── lib/
│       └── shared.ts                # MODIFIED — appName, gitConfig, docsRoute='/' (U2, U3)
├── next.config.mjs
├── package.json
├── source.config.ts
└── wrangler.toml                    # NEW (U5)
```

The `(home)` route group is removed in U2.

---

## Implementation Units

- U1. **Flatten repo layout**

**Goal:** Move the Fumadocs scaffold up one level so the workspace root and the project root are the same directory. Avoids two `package.json` levels and lets `wrangler.toml` and `.github/workflows/` sit where CI tools expect.

**Requirements:** R5

**Dependencies:** None

**Files:**
- Move all contents of `compendium/compendium/*` into `compendium/` (sibling-merge with existing `docs/`)
- Verify `compendium/.git` ends up at the new root (it currently lives in `compendium/compendium/.git`)
- Delete the now-empty `compendium/compendium/` directory

**Approach:**
- Outer workspace currently has `docs/` (brainstorm + this plan); inner has the scaffold and a fresh `.git`. After flattening, `docs/` is sibling to `src/`, `content/`, `package.json`, etc.
- Either keep the inner `.git` (commit history starts from scaffold) or `git init` at the outer root after merging — whichever the user prefers. Either works; default to keeping the inner `.git` since `bunx create-fumadocs-app` already initialized it.
- After move, run `bun install` once to confirm `node_modules` resolves (it should, since `bun.lock` moves with `package.json`).

**Test scenarios:**
- Test expectation: none — pure file relocation, verified by U2's `bun run dev` succeeding.

**Verification:**
- `bun run dev` from the new repo root serves the site at `localhost:3000`.
- `git status` runs without "not a git repo" error.
- `docs/brainstorms/game-tools-site-requirements.md` and `docs/plans/2026-05-08-001-...-plan.md` are intact at the new root.

---

- U2. **Lift docs to site root**

**Goal:** Serve content at `/<game>/<entry>` instead of `/docs/<game>/<entry>`, matching origin IA.

**Requirements:** R3

**Dependencies:** U1

**Files:**
- Modify: `src/lib/shared.ts` — set `docsRoute = '/'`
- Move: `src/app/docs/[[...slug]]/page.tsx` → `src/app/[[...slug]]/page.tsx`
- Merge: contents of `src/app/docs/layout.tsx` into a new top-level docs layout. Concretely: replace the `(home)` route group with a single `DocsLayout`-wrapped layout at `src/app/layout.tsx`'s level, or convert `src/app/(home)/layout.tsx` to render `DocsLayout` instead of `HomeLayout`
- Delete: `src/app/(home)/page.tsx` (its job is taken over by `content/docs/index.mdx` rendered through the `[[...slug]]` route)
- Delete: `src/app/docs/` (now empty)
- Verify: `src/app/og/docs/[...slug]/route.tsx` and `src/app/llms.mdx/docs/[[...slug]]/route.ts` still work — these route paths are independent of `docsRoute` and should be left alone (they're URLs for OG/LLM generation, not user-facing docs URLs)

**Approach:**
- The `[[...slug]]` catch-all at the app root will match `/`, `/warframe`, `/warframe/saryn-spore-build`, etc.
- `source.ts` reads `docsRoute` from `shared.ts` to compute page URLs in the sidebar tree, so changing it in one place propagates.
- Sidebar nav comes from `source.getPageTree()` — it'll show the game folders directly under the root after `docsRoute` changes.

**Patterns to follow:**
- Use the existing `DocsLayout` invocation in `src/app/docs/layout.tsx` as the template.

**Test scenarios:**
- Happy path: navigating to `/` renders `content/docs/index.mdx`. Navigating to `/warframe` (after U4) renders `content/docs/warframe/index.mdx`. Navigating to `/warframe/saryn-spore-build` (after U4) renders that entry.
- Edge case: 404 page is reachable for `/does-not-exist` (Fumadocs default).
- Integration: search dialog (Cmd/Ctrl-K) opens and returns hits for indexed pages. Confirms `docsRoute` change didn't break the search index path.

**Verification:**
- `bun run dev` and confirm the three URL shapes above resolve.
- `bun run build` produces `out/index.html`, `out/warframe/index.html`, `out/warframe/saryn-spore-build/index.html` (after U4 content lands).

---

- U3. **Brand the site shell and set dark default**

**Goal:** Replace template chrome (app name, GitHub link, home copy) with real values, and set dark theme as default.

**Requirements:** R4

**Dependencies:** U1

**Files:**
- Modify: `src/lib/shared.ts` — set `appName` to a real value (e.g., `'Compendium'` or whatever the user picks; default to `'Compendium'`); update `gitConfig.user`/`gitConfig.repo` to the real GitHub coordinates once the public repo is created
- Modify: `src/components/provider.tsx` — pass `theme={{ defaultTheme: 'dark', enableSystem: true }}` (or similar; consult Fumadocs `RootProvider` API) to `RootProvider`
- Modify: `content/docs/index.mdx` — rewrite as the real landing page (short intro + auto-generated game list, or just intro for now)
- Delete: `content/docs/test.mdx` — sample file from scaffold

**Approach:**
- `RootProvider` from `fumadocs-ui/provider/next` accepts a `theme` prop forwarded to `next-themes`. Setting `defaultTheme: 'dark'` plus `enableSystem: false` makes dark the unconditional default; `enableSystem: true` lets the user's OS preference win on first load. Origin chose **dark default**, so go with `defaultTheme: 'dark'` and `enableSystem: false` to honor the explicit choice, with the toggle still available.
- Final `appName` is a one-line edit; treat it as the user's call but ship a sensible default.

**Test scenarios:**
- Happy path: first page load (no `localStorage.theme` set) renders dark UI. Toggling to light persists across reloads via `next-themes`.
- Happy path: navbar shows the new `appName`, not "My App".
- Edge case: `prefers-color-scheme: light` system setting still produces dark on first load (because `enableSystem: false`). If a system-respecting default is preferred later, flip the flag.

**Verification:**
- `bun run dev` shows dark by default; toggle in navbar still works both ways.
- View source on `/` shows the real `appName` in `<title>` and navbar.

---

- U4. **Seed first game folder (Warframe)**

**Goal:** Produce one realistic game folder so the build, search index, and screenshot resolution all exercise the actual production pattern before deploy.

**Requirements:** R1, R2, R3, R8

**Dependencies:** U2 (URL shape), U3 (so content/docs/index.mdx isn't fighting the rewrite)

**Files:**
- Create: `content/docs/warframe/meta.json` — sets sidebar order (e.g., `{ "title": "Warframe", "pages": ["index", "saryn-spore-build"] }`)
- Create: `content/docs/warframe/index.mdx` — Warframe landing page; brief intro plus `<Cards>` or auto-list of entries
- Create: `content/docs/warframe/saryn-spore-build.mdx` — first real entry with the frontmatter schema from origin (title, description, tags, source, date), body referencing one screenshot
- Create: `content/docs/warframe/saryn-spore-build/mod-loadout.png` — placeholder screenshot (any small PNG is fine; will be replaced with real content during authoring)

**Approach:**
- Use the frontmatter shape exactly as defined in [docs/brainstorms/game-tools-site-requirements.md](../brainstorms/game-tools-site-requirements.md) so the schema is forced through the real build path now, surfacing any zod mismatch.
- Reference the screenshot via relative path `./saryn-spore-build/mod-loadout.png` from inside `saryn-spore-build.mdx` to confirm Fumadocs MDX resolves sibling-folder assets under static export.
- If the default `pageSchema` rejects the extra fields (`tags`, `source`, `date`), extend the schema in `source.config.ts` — note this as a hand-off to U6.

**Patterns to follow:**
- Origin doc's frontmatter sample
- Fumadocs `meta.json` schema (`pages` array controls sidebar order)

**Test scenarios:**
- Happy path: `/warframe` renders the landing with a link to `saryn-spore-build`. `/warframe/saryn-spore-build` renders prose plus the inline screenshot.
- Happy path: sidebar shows `Warframe` with `Saryn Spore Build` underneath, in the order from `meta.json`.
- Integration: search index includes "saryn", "spore", "steel path" tokens (search dialog returns the entry when typing any of those).
- Edge case: `bun run build` succeeds with the screenshot present and produces it under `out/warframe/saryn-spore-build/mod-loadout.png` (or wherever the static-export pipeline emits it).

**Verification:**
- All three URLs resolve in `bun run dev` and `bun run build` && `bun run start` (serving `out/`).
- Search dialog returns the new entry by title and tag tokens.

---

- U5. **Cloudflare Workers Static Assets deploy via GitHub Action**

**Goal:** Push to `main` ⇒ live deploy. No dashboard build config; everything in repo.

**Requirements:** R5, R6

**Dependencies:** U1 (so config files sit at repo root); U4 (so first build includes real content, exposes any export-time errors before automating)

**Files:**
- Create: `wrangler.toml` at repo root with:
  - `name = "compendium"` (or whatever the user picks at deploy time)
  - `compatibility_date` set to a recent date (use today: `2026-05-08`)
  - `[assets] directory = "./out"` and `binding = "ASSETS"` (the binding can be omitted if no Worker code exists; assets-only deploys work fine without it)
  - No `main = ...` Worker entry — assets-only deploy
- Create: `.github/workflows/deploy.yml` running on `push: branches: [main]`:
  - Checkout, setup Bun, `bun install --frozen-lockfile`, `bun run build`, then `npx wrangler deploy` with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from repo secrets
  - Use `cloudflare/wrangler-action@v3` (current at time of writing) or invoke `wrangler` directly via npx — either is acceptable; the action is slightly less brittle
- Modify: `package.json` — add a `deploy` script (`wrangler deploy`) for local manual deploys when needed
- Modify: `.gitignore` if needed to exclude `.wrangler/` and `out/` (likely already covered)

**Approach:**
- Two repo secrets needed in GitHub: `CLOUDFLARE_API_TOKEN` (with "Edit Cloudflare Workers" permission) and `CLOUDFLARE_ACCOUNT_ID`. User configures these manually in repo settings — out of scope for the action itself.
- First deploy can be done locally (`npx wrangler deploy`) to confirm config before relying on CI. Action then replicates that command on push.
- Dropping `output: 'export'` would silently break the deploy — flag this in the workflow comment so future-me doesn't toggle it off.

**Patterns to follow:**
- Cloudflare's docs example for "static assets only" Worker deploy.

**Test scenarios:**
- Happy path: local `bun run build && npx wrangler deploy` (with creds set) publishes the site to a `*.workers.dev` URL that serves all routes from U2/U4.
- Happy path: pushing a no-op commit to `main` triggers the action and produces a successful deploy run in the Actions tab.
- Edge case: pushing to a non-main branch does **not** trigger deploy.
- Error path: a build error (e.g., bad MDX) fails the action with a clear log, no half-deploy.
- Integration: after deploy, search dialog works on the live URL (confirms the static search JSON shipped to the assets bucket).

**Verification:**
- `*.workers.dev` URL renders `/`, `/warframe`, `/warframe/saryn-spore-build`.
- Actions log shows green run for the latest `main` commit.
- Browser network tab on the live site shows `/api/search/index.json` (or wherever Fumadocs emits the static index) returning 200.

---

- U6. **Extend frontmatter schema for tags / source / date**

**Goal:** Make the requirements-doc frontmatter shape (`tags`, `source`, `date`) actually validated rather than silently accepted or rejected.

**Requirements:** R1, R2

**Dependencies:** U4 (driven by what the seed entry actually uses)

**Files:**
- Modify: `source.config.ts` — extend `pageSchema` via `frontmatterSchema` to accept `tags: string[]`, `source: string` (URL), `date: string | Date`. All optional.

**Approach:**
- Fumadocs MDX accepts a custom Zod schema in `defineDocs({ docs: { schema } })`. Compose a schema that extends `pageSchema` rather than replacing it (keeps `title`, `description` validation intact).
- These fields are not consumed by the UI in V1 — they're metadata for V2 cross-game tag pages. Schema validates them so future-me can rely on the shape; rendering is V2.

**Patterns to follow:**
- Fumadocs MDX docs on custom schemas: https://fumadocs.dev/docs/mdx/collections

**Test scenarios:**
- Happy path: `bun run build` succeeds with the seed entry's full frontmatter (tags array, ISO date, https URL).
- Error path: an MDX file with `tags: "string-not-array"` fails the build with a schema error rather than silently passing.
- Edge case: an entry with no `tags` / `source` / `date` still builds (fields are optional).

**Verification:**
- `bun run types:check` passes.
- `bun run build` passes with the seed entry.
- A deliberate bad-shape entry (temp) reproduces a clear schema error, then is removed.

---

## System-Wide Impact

- **Interaction graph:** `source.ts` reads `docsRoute` from `shared.ts`; sidebar tree, search route, OG route, and llms route all chain off `source`. Changing `docsRoute` in one place is the right knob — confirmed in U2.
- **Error propagation:** Build failures (bad frontmatter, missing image, schema mismatch) surface at `next build` time, fail the GitHub Action, and prevent deploy. This is the desired posture — no silent partial deploys.
- **Unchanged invariants:** Fumadocs' search wiring, MDX pipeline, and OG/llms routes are not modified by this plan. They were correct out of the box for static export.
- **API surface parity:** None — single-surface site.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Lifting `docsRoute = '/'` may collide with `(home)` route group at `/` | U2 deletes the `(home)` group entirely; the `[[...slug]]` catch-all owns `/`. Verified during local dev before push. |
| Cloudflare Workers Static Assets has request count limits on the free tier | Personal site, low traffic; non-issue. Documented for future awareness. |
| `bunx create-fumadocs-app` initialized git inside `compendium/compendium/`, U1 flatten could lose commits | Default behavior in U1 is "keep the inner `.git` and move it up." If the user wants a fresh init, they can do that explicitly — flagged in U1's approach. |
| `next/image` under static export ships large screenshots unoptimized | Accepted for V1 per origin doc. Revisit if pages get heavy. |
| Custom domain not picked yet | Site ships at `*.workers.dev`; domain swap is a DNS-and-`wrangler.toml`-routes follow-up. |
| Fumadocs / Next / Tailwind v4 versions in scaffold are recent (Next 16, Tailwind 4) — possible undocumented edges | Build-and-run on real content (U4) before deploy automation (U5) catches these locally. |

---

## Documentation / Operational Notes

- After U5 is green: add a one-line `## Deploy` section to the project README pointing at "push to main; CF token in repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`."
- No monitoring/alerting in V1. Cloudflare's dashboard is sufficient for a personal site.

---

## Sources & References

- **Origin document:** [docs/brainstorms/game-tools-site-requirements.md](../brainstorms/game-tools-site-requirements.md)
- Scaffold root: `compendium/` (post-U1) — generated by `bunx create-fumadocs-app` with Next.js Static template, /src dir, Oxlint, Default search (= Orama static for this template), next/og
- Fumadocs static deploy: https://fumadocs.dev/docs/deploying/static
- Cloudflare Workers Static Assets: https://developers.cloudflare.com/workers/static-assets/
- `cloudflare/wrangler-action`: https://github.com/cloudflare/wrangler-action
