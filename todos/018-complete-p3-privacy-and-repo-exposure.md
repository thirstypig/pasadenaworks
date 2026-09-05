---
status: complete
priority: p3
issue_id: 018
tags: [code-review, security, privacy, gdpr]
dependencies: []
---

# Five privacy and exposure items, one of which reopens a fix already recorded as done

## Problem Statement

The security review found no exploitable vulnerability: no secret has ever been
committed, `TINA_TOKEN` is absent from the deployed admin bundle, every
`set:html` site traces to author-committed data, and fork PRs cannot reach
secrets. These five are the remainder — mostly privacy posture, plus one item
where a previous fix did not achieve its stated goal.

## Findings

**1. `MASTER-PORTS.md` and `PORTS.md` still list ~20 other local projects in this
public repo.** `docs/RESOLVED.md:98-104` records deleting the `registry/` folder
on 2026-08-28 *because* "it exposed other local projects' names, stacks, and
ports in this public repo for no reason this repo needed" — and explicitly set
these two root files aside as "unrelated". They carry the same table. No
credentials (verified), and localhost ports are not remotely reachable, so this
is reconnaissance value only. But the stated goal of that fix was not met, and
this repo only needs its own 3180–3189 line.

**2. Unconsented Unsplash hotlinking.** All 80 posts set `heroImage` to
`images.unsplash.com`, rendered at `Post.astro:104`; 20 pages are live. Every
reader's IP, user-agent and referrer reach Unsplash before any consent
interaction, on an `loading="eager"` LCP image. Deliberately **not** called a
false privacy policy: `privacy.astro:26-28`'s "Nothing loads unless you say yes"
sits in a paragraph explicitly about the cookie banner and GA4, so in context it
scopes to trackers. Unsplash is simply undisclosed. Self-hosting is permitted by
the licence and would help LCP too.

**3. A Tina content editor can rewrite `CLAUDE.md`.** `tina/config.ts:188-212`
with `DOCS_ROOT_INCLUDE = '*'` matches every `.md` at the repo root.
`allowedActions: { create: false, delete: false }` leaves **update** allowed. The
comment at `:196-201` says the restriction protects "a load-bearing file like
CLAUDE.md" — but what makes it load-bearing is its *content*, which update
reaches. An editor scoped to blog content can rewrite the instructions Claude
Code follows and commit to main unreviewed. Needs an already-authorized editor
plus someone running an agent afterwards, hence P3.

**4. `CookieConsent.astro:57` calls `localStorage.getItem` bare** while
`Base.astro:82-89` correctly wraps the same call in try/catch. It fails *closed*
(GA never loads), so it is an availability bug, not a leak.

**5. No consent-withdrawal path** (`CookieConsent.astro:65-72`). Adequate for
CCPA, weak for GDPR.

Also noted and deliberately not pursued: no CSP (GitHub Pages cannot set headers
and a `<meta>` CSP would need hashes for two inline scripts — low value here),
one `http://` outbound anchor to `laalmanac.com` in four locale files, and no
`dependabot.yml`.

## Proposed Solutions

### Option A — Fix 1, 3 and 4; decide on 2 and 5
Trim the port files to this project's own block; set `allowedActions.update: false`
on the docs-root collection (or narrow the glob away from CLAUDE.md); wrap the
`localStorage` call. Then decide separately whether to self-host hero images and
whether GDPR withdrawal matters for this audience.

- **Pros:** Three are mechanical. #1 completes a fix the repo already claims.
  #3 closes an agent-instruction-injection path that is cheap to close.
- **Cons:** #3 removes the owner's ability to edit docs through Tina, which may
  be wanted — CONTENT-STATUS.md is deliberately surfaced there.
- **Effort:** Small · **Risk:** Low

### Option B — #1 only
Trim the port files; leave the rest.

- **Pros:** Addresses the one where a documented goal was missed.
- **Cons:** Leaves the CLAUDE.md write path open.
- **Effort:** Small · **Risk:** Low

## Recommended Action

**Option A**, with #3 narrowed rather than disabled: keep docs editable but
exclude `CLAUDE.md` specifically, so the ops-panel workflow that surfaces
`CONTENT-STATUS.md` in Tina keeps working.

Self-hosting hero images (#2) is worth doing for LCP regardless of privacy, but
it is 20+ images and belongs in its own change.

## Acceptance Criteria

- [ ] The public repo no longer lists other projects' ports
- [ ] A Tina editor cannot modify CLAUDE.md
- [ ] `CONTENT-STATUS.md` is still visible and editable in Tina
- [ ] Every `localStorage` access is inside try/catch

## Work Log

### 2026-09-03 — Found during full-repo review
#1 is the notable one: it is not a new finding so much as an old fix that stopped
half-way, recorded in RESOLVED.md as complete.

### 2026-09-04 — Three fixed, two left as decisions

**#1 — the port files are trimmed.** 193 lines to 60, and zero references to any
other project. The registry's own changelog had flagged this on 2026-08-27 and
explicitly left it as *"the owner's own call on whether to remove it"*; deleting
`registry/` on 2026-08-28 was that call, and these two root copies were simply
missed. So this completes a decision already made rather than making a new one.

Note the tension it resolves: MASTER-PORTS.md instructs that every project's copy
"must stay byte-identical to the root copy". That instruction is correct for
private repos and wrong for this one. Both files now say so at the top, and
CLAUDE.md records it — the canonical registry stays complete at
`~/Projects/MASTER-PORTS.md`; only this mirror is reduced.

**#3 — Tina can no longer edit CLAUDE.md.** `DOCS_ROOT_INCLUDE` went from `*` to
the extglob `!(CLAUDE)`, so the composed glob is `!(CLAUDE).md`. Verified with
picomatch directly: CLAUDE.md is excluded while README, CONTENT-PLAN,
CONTENT-STATUS, PORTS and MASTER-PORTS stay editable — CONTENT-STATUS.md in
particular, since its visibility in Tina is the whole reason the generator writes
it to the root. Two tests pin both halves.

Narrowing beat disabling: `allowedActions.update: false` would have made the
docs collection read-only and broken the workflow the collection exists for.

**#4 — both `localStorage` calls in CookieConsent are wrapped.** It throws rather
than returning null in a private window, and an uncaught throw there killed the
rest of the script — so the banner would render with no working buttons. Reads
now fail to "no choice recorded"; writes fail without preventing the choice being
honoured for that page view.

**Left as decisions, not defects:**
- **#2 Unsplash hotlinking.** Every reader's IP and referrer reach Unsplash
  before any consent interaction, on 20 live pages. Self-hosting is permitted by
  the licence and would help LCP, but it is 20+ images and a deliberate change of
  approach — worth its own task.
- **#5 no consent-withdrawal path.** Fine for CCPA, weak for GDPR. Whether that
  matters depends on the audience, which is a business call.

### 2026-09-05 — the "sync Tina Cloud in the dashboard" remedy does not exist

Verified from `@tinacms/cli` source and by hitting Tina Cloud's own endpoints:
the remote schema **is** the committed `tina/tina-lock.json`. Tina Cloud indexes
it from `main` on every push; the cloud's `/schemaSha` returns exactly the
SHA-256 of that file's `schema` member. It had not been regenerated since
2026-08-31, which is why four re-indexes all served the same stale schema and
why "the remote moved" was a misdiagnosis — it never moved.

**The reverted changes here can be restored** without any dashboard: re-apply
them, run `npx tinacms dev --no-server --noWatch`, commit the regenerated lock
alongside. `ci.yml` and `tina/lock.test.ts` now catch a missing regeneration
before merge.

Also corrected: `ui.validate` is not schema-neutral (it leaves `ui: {}` behind,
a new key in the hash) and `description` is not safe either. Only comments and
function bodies are.
