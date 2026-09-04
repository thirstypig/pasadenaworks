# Resolved

Problems this project has already solved, with the reasoning that got there.
Moved out of `CLAUDE.md` on 2026-08-31 so it stops loading into every session;
`CLAUDE.md` keeps one-line headlines and points here for the detail.

Read this before re-investigating anything that sounds already-handled.


- **Cal.com bookings now reach Twenty CRM, repeat customers included**
  (n8n workflow "Cal.com booking - Twenty CRM"). A Cal.com "Booking Created"
  webhook → n8n → Twenty. Built 2026-08-29; the repeat-customer duplicate bug
  was fixed and verified end-to-end 2026-08-31. Shape is now:
  `Webhook → Edit Fields → Find person by email (GET) → Already in CRM? (IF)
  → Create person in Twenty (POST) | Update existing person (PATCH)`.
  The lookup filter is `emails.primaryEmail[eq]:"<email>"` against
  `GET /rest/people`, and the IF branches on `totalCount == 0`.
  Three things that had to be right, each of which silently no-ops otherwise:
  the workflow must be **Published** (n8n only registers the production
  webhook path once Active — "Listen for test event" covers only the test
  URL); every node must actually be **connected on the canvas** (a run that
  stops early looks exactly like a run that succeeded, since neither creates
  a duplicate); and the email is **lowercased** in every expression
  (`.toLowerCase().trim()`) because Twenty's `[eq]` comparator is
  case-sensitive — `Foo@Gmail.com` would miss the lookup and hit the
  duplicate error anyway. Verified by rebooking a known email: person count
  held at 7, `createdAt` unchanged, `updatedAt` and `firstName` both updated.
  API details and the filter-syntax reference live in the
  `reference-twenty-crm-railway` memory.
- Blog i18n mechanism is built (2026-08-26/27) — content collection has
  `locale`/`translationKey`/`slug` fields, `/[locale]/[section]/` and
  `/[locale]/[section]/[service]` reuse the existing service/city routing
  (folded in as a third `kind`, not a separate `[locale]/blog/` — that
  would collide with the dynamic `[section]` segment at the same depth).
  Files live under `src/content/blog/<locale>/`. `SEGMENTS.blog` gives
  the translated `/blog/` segment itself (`boke` for both Chinese
  variants, matching the `fuwu` pattern). All three existing English
  posts now have Spanish, Simplified Chinese, and Traditional Chinese
  versions (2026-08-27) — real researched keywords per language, not
  literal translations; zh-hant follows Taiwan Mandarin lexis/register.
  See the `slug`-collision gotcha above if adding more.
- `site.formEndpoint` now points at a real Formspree endpoint, and the
  contact form dual-submits into a self-hosted n8n workflow (Railway) that
  forwards leads into Twenty CRM via its REST API (2026-08-25/26). Zapier
  and Make.com were evaluated first but both paywall webhooks on their free
  tiers.
- Astro upgraded 5 → 7.2.7, resolving the high-severity XSS advisories
  (2026-08-26). No application code changes were needed for the migration.
- `site.phone` is a real Google Voice number, (434) 373-0080 (2026-08-26).
- The homepage's "Where we work" city grid was removed and replaced with a
  three-column footer (Explore nav links + locale-aware city links) that
  appears sitewide instead of only on the English homepage (2026-08-26).
- All nine city pages that previously had generic body copy now carry real,
  sourced facts via web research: six on 2026-08-26 (Pasadena, Altadena,
  South Pasadena, Glendale, Monrovia, San Marino), and the last three —
  Alhambra, Arcadia, Monterey Park — on 2026-08-27. See the `RESEARCHED`
  marker in `src/data/cities.ts`; no `TODO` markers remain. Not firsthand
  knowledge, though: still worth the owner's eye to sharpen with anything
  from actually working these cities.
- Fonts (originally Bevan, now Anton; Source Serif 4) are self-hosted via
  `@fontsource` instead of loading from the Google Fonts CDN (2026-08-26).
  The display face changed from Bevan → Anton → briefly reverted to Bevan
  → back to Anton, "final call," all on 2026-08-27 — see the Design system
  section above for why Anton won.
- `tina/config.ts`'s schema now matches `src/content.config.ts` — added the
  `locale`/`translationKey`/`slug` fields the blog i18n work introduced, and
  the `filename.slugify` function now reads the post's `locale` field to
  place new posts in the right `src/content/blog/<locale>/` subfolder
  automatically (2026-08-27). Verified by loading `npm run admin` and
  confirming Tina indexes all four existing posts (including the Spanish
  one) with no schema errors.
- A "Book a call" link (`site.bookingUrl`, `strings.nav.bookCall`) was added
  to the footer, footer-only per the owner's call (2026-08-26) — it points
  at the real Cal.com public booking page for the free 30-min consultation
  (`schedule.pasadenaworks.com/pasadenaworks/consultation`, self-hosted on
  Railway, Cal Video, demo events hidden). Confirmed via `Accept-Language`
  header tests that the page genuinely translates into Spanish and Chinese
  based on the visitor's browser language — no explicit switcher needed.
  Cal.com's account password has since been changed (2026-08-29, see below)
  — the owner should still turn on 2FA if it isn't already on, but the weak
  password itself is no longer an open item.
- A private, real-password-protected ops dashboard exists at
  `ops.pasadenaworks.com` — links to every backend service (CRM,
  scheduling, n8n, Railway, GitHub, DNS). It is a separate tiny Node
  service deployed directly to Railway (project `pasadenaworks`, service
  `ops-panel`) and is deliberately NOT part of this repo — its source
  living in a public repo would defeat the password gate. Auth is a real
  server-side Basic Auth check (`server.js`, `crypto.timingSafeEqual`),
  not client-side JS. Credentials are the `OPS_USERNAME`/`OPS_PASSWORD`
  variables on that Railway service — change them there, not here.
- `public/og.png` (1200×630) exists, originally as a Craftsman-styled share
  image matching the pre-rebrand hero. Regenerated 2026-08-28 to match the
  2026-08-27 rebrand: rose background, a label-frame card holding
  `logo-lockup.png`, and the site's real tagline — rendered the same way,
  a one-off HTML template screenshotted via headless Chrome rather than a
  design tool. The `<meta property="og:image">` tag in `Base.astro` needed
  no change either time; it just points at whatever file is there.
- The `registry/` folder (a mirror of the owner's cross-project
  `MASTER-PORTS.md`/`PORTS.md`/`README.md`) was removed 2026-08-28 — it
  exposed other local projects' names, stacks, and ports in this public
  repo for no reason this repo needed. The real port reservation for this
  repo (3180–3189/4180–4189) still lives in the root-level
  `MASTER-PORTS.md`/`PORTS.md`, which are unrelated tracked files, not part
  of what got removed.
- The ops dashboard's "Blog editor (Tina)" card now links to the real
  `pasadenaworks.com/admin/index.html` (2026-08-28) instead of describing
  it as local-only — it's backed by Tina Cloud (see the blog-i18n entry
  above), so it works from any browser once the site is deployed, not
  just from the owner's laptop running `npm run admin`.
- Cal.com's Google Calendar sync is confirmed working end-to-end
  (2026-08-28) — booking a slot that overlaps an existing Google Calendar
  event made that slot disappear from availability, not just theoretically
  wired up.
- The `itemProps` config previously added to the blog collection's `ui`
  in Tina (to show `pubDate` next to the title in the post list) turned out
  to not be a real Tina API at the collection level — it's only read off
  object-field/block-template configs, so it silently did nothing since it
  shipped. Removed 2026-08-28, and `filename.slugify` was extracted into
  `tina/utils.ts` with unit tests along the way (`npx tsc --noEmit` now
  passes clean on `tina/config.ts` for the first time — the dead
  `itemProps` was a real type error that no prior build step had caught,
  since `npx tinacms build` only validates the schema, not every `ui`
  callback).
- **Cal.com's password-reset emails were never sending, blocking login to
  the owner's own account (2026-08-29).** Two stacked causes: Railway
  blocks outbound SMTP entirely below its Pro plan (surfaces as an
  `ETIMEDOUT` connection timeout, not an auth error — no SMTP config change
  fixes it, only a plan upgrade), and a Gmail app password had been
  generated under the wrong Google account (a *different* error, `535
  BadCredentials`/`EAUTH`, only visible once the plan was upgraded). Fixed
  by upgrading Railway to Pro and regenerating the app password under the
  correct account (`jc.pasadenaworks@gmail.com`). Full writeup:
  `docs/solutions/integration-issues/calcom-railway-smtp-password-reset-emails-fail.md`.

- **Twenty CRM's MCP server is reachable** (2026-08-31). It advertised `http://`
  URLs in its OAuth discovery metadata behind Railway's TLS-terminating proxy, so
  MCP clients refused it (`Protected resource http://… does not match expected
  https://…`). `SERVER_URL` was a red herring — already correct, and never read by
  that code path, which derives URLs from the request via Express's
  `request.protocol`. Fixed with `TRUST_PROXY=1` on the Railway `server` service.
  Full trace, the varying-host diagnostic, and a regression check in
  [`docs/solutions/integration-issues/twenty-crm-mcp-advertises-http-behind-railway-proxy.md`](solutions/integration-issues/twenty-crm-mcp-advertises-http-behind-railway-proxy.md).

- **All 20 blog posts now exist in all four languages** (2026-09-01). The
  15-post translation backlog is closed, so nothing on the schedule through
  2027-01-11 will publish English-only. Vendor names came from each vendor's own
  localized help rather than from translating the English ones, keyword phrasing
  and slugs were researched per locale, and every figure is the English post's.
  `CONTENT-STATUS.md` is the live picture — prefer it over any count written by
  hand.

- **The test suite now gates both workflows** (2026-09-01). Nothing ran the
  tests automatically before this; they were enforced by a person remembering.
  That mattered more than it sounds because the invariants they protect fail
  silently — a duplicate `slug` across locales builds green with exit code 0 and
  a warning nobody reads, while Astro's glob loader drops one of the colliding
  posts. Confirmed by injecting a real collision: build exit 0, tests red.
  `.github/workflows/ci.yml` covers pull requests and branch pushes;
  `deploy.yml` runs the suite before building, so the daily scheduled publish is
  gated too, and greps the build log to promote that warning to a failure.

- **Links inside blog posts are underlined at rest** (2026-09-01). They were
  distinguished by colour alone, with the underline appearing only on hover. The
  accent measures 2.96:1 against body text in light mode and 2.53:1 in dark,
  both under WCAG 1.4.1's 3:1 floor — so a reader who does not separate those
  hues could not find links in an article at all, and hover is no remedy on
  touch. `:focus-visible` was missing alongside `:hover` and was added. Note the
  rule is `a:not(.btn)`: a bare descendant selector beats `.btn` and paints a
  border along the End CTA button, which is the same collision `global.css`
  already guards against for `.section--dark a`.

- **Tina no longer destroys CJK filenames** (2026-09-01). `slugifyBlogFilename`
  derived a new post's filename from its *title* through `[^a-z0-9]`, which
  treats every non-ASCII writing system as punctuation: a Chinese title
  collapsed to an empty basename, the file landed at `<locale>/.md`, and the
  second Chinese post silently overwrote the first. It now derives from the
  `slug` field, which is required, already ASCII, and already unique across
  locales. Full write-up, including why seven passing tests missed it, in
  [`docs/solutions/integration-issues/tina-slugify-strips-cjk-and-collides-filenames.md`](solutions/integration-issues/tina-slugify-strips-cjk-and-collides-filenames.md).

- **JSON-LD is escaped before injection** (2026-09-01). Both layouts embed
  structured data with `set:html`, and `JSON.stringify` does not escape `<`, so
  a value containing `</script>` closed the block early and the remainder
  rendered as page HTML — silently, since the build succeeded and the page
  looked right. `src/utils/json-ld.ts` now owns serialization for both sinks. No
  live exposure existed: both schemas are fed from `src/data/site.ts` and post
  frontmatter, which take a commit or the local Tina admin to change.

- **A translation set can no longer half-publish through `draft`**
  (2026-09-01). `src/utils/blog.ts` gates on `draft` and `pubDate` together, and
  the integrity suite asserted that every post sharing a `translationKey` has an
  identical `pubDate` — but said nothing about `draft`, which was not even parsed
  into the test. Either direction was a silent failure: English drafted with a
  translation live builds a translated page whose English parent does not exist,
  emitting an `hreflang` alternate at an unbuilt URL (hard rule #1); English live
  with its translations drafted publishes English-only, which is the exact
  outcome all 60 translations were written to prevent. Realistic because the
  owner flips drafts in Tina, which edits one file at a time. Now one more
  assertion beside the `pubDate` one, sharing its `translationKey` grouping.
  Verified by mutating real posts in both directions, not by inspection.

- **The LinkedIn profile is emitted as schema.org `sameAs`** (2026-09-01).
  `site.social` had sat with two empty strings since launch and **nothing read
  it** — setting a URL would have rendered nowhere. It now feeds the homepage's
  LocalBusiness JSON-LD, which is how Google ties this site to the same business
  elsewhere. Empty entries are filtered rather than emitted, so Instagram stays
  absent until there is a real account: a `sameAs` pointing at a dead profile is
  worse than none.

- **The site has a measured reading level, and the measurement is designed
  against the ways a measurement corrupts writing** (2026-09-03). The owner set
  a college-level target across all four languages. The first Chinese metric
  was characters-per-sentence and reported 19/20 posts already in band before a
  word had changed — Chinese raises register lexically (所以→因此, 但是→然而),
  not by sentence length, so measuring length measured nothing. Replaced with a
  書面語 register index; Spanish uses Fernández Huerta rather than
  Flesch-Kincaid, which inflates on Spanish and is meaningless on Chinese.
  Every band carries an upper bound, which earned its place twice: one draft
  passed a 13+ floor at grade 15.9 with 29.8-word sentences, harder to read
  than the 6.7 version it replaced. Verified by scoring the corpus both from
  markdown and from the built pages and requiring the two to agree within half
  a grade — a cross-check that found two real bugs and, in its first version,
  failed its own positive control. Full write-up in
  [`docs/solutions/process-errors/a-writing-metric-corrupts-the-prose-it-governs.md`](solutions/process-errors/a-writing-metric-corrupts-the-prose-it-governs.md).

- **The repo typechecks, and a gate keeps it that way** (2026-09-03).
  `npx tsc --noEmit` had failed on `tina/config.test.ts` since 2026-08-31 with
  a single error: `picomatch` had no type declarations. The real defect was
  larger than the error text suggested — the repo was *using* three packages it
  did not *declare*. `tina/config.test.ts` imports `picomatch` directly, and
  `tsc` itself only existed in `node_modules/.bin` because `@tinacms/cli`
  depends on `typescript`. Both were resolving through npm's hoisting of
  Tina's dependency tree, which is the kind of thing that survives for months
  and then breaks on an unrelated upgrade, with an error pointing at our file
  instead of at the cause. Fixed by declaring `typescript`, `picomatch` and
  `@types/picomatch` as devDependencies; the production five are untouched.
  Picked `picomatch@^4` because 4.0.7 is what was already hoisted and what the
  test already resolved — pinning `^2` would have changed the test's behavior
  while claiming to fix it. (Two majors coexist here: Tina's `@tinacms/graphql`
  reaches 2.3.2 through `micromatch`. Immaterial for globs this simple, but
  worth knowing the test and Tina's runtime do not match exactly.)

  Why it survived so long is the more useful half: **nothing in this repo ran
  `tsc`.** `npm run test` is vitest and does not typecheck, and `npm run build`
  passes because Astro never compiles `tina/`. So there is now an
  `npm run typecheck` script, wired into `ci.yml` — the same
  make-a-command-fail move as the duplicate-slug grep and the post-build
  readability step, both of which exist for the same reason.

  It gates pull requests and deliberately **not** `deploy.yml`. The argument
  for gating deploy on the tests does not transfer: a missing post is worse
  than a delayed deploy, but a type error in `tina/` cannot reach the built
  site at all, while `deploy.yml`'s cron is the only thing that makes a
  date-gated post publish. Blocking the daily publish over one would stop real
  content shipping to fix nothing. Verified the gate rather than assuming it:
  a deliberate `const x: number = "s"` in `tina/utils.ts` exits 2, and the file
  was restored and re-verified clean.
