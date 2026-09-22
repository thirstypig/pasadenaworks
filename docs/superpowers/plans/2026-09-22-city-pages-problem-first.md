# City Pages, Problem First — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite all ten city pages in four languages so each opens with the problem a practice in that city faces, uses that city's own figures as the proof, and ends with the services that fit — keeping every URL, figure, source and photo.

**Architecture:** Only the prose changes. `src/data/city-copy/{en,es,zh-hans,zh-hant}.ts` hold `title`, `summary`, `body` (exactly three paragraphs, which rule 2b's photo/strip interleaving depends on), `meta` and `sources`. Nothing in the routes, components or data strip changes. English is rewritten first; each translation then follows the rewritten English, and the existing parity tests compare figures digit for digit across locales.

**Tech Stack:** Astro 7, TypeScript, vitest.

**Spec:** `docs/superpowers/specs/2026-09-21-positioning-about-transition-design.md` §5, with figures and sources fixed by `docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md`.

## Global Constraints

- **Say only what the page's own figures show** (owner's decision, 2026-09-22). A 2026-09-22 search found no citable source for what patients check first, for call abandonment, or for local-search click depth — only vendor surveys with no stated method. So no claim about patient behavior, no "most patients…", no percentages that are not from this page's own sources. Naming what *we* do is not a claim about patients.
- **Every figure stays exactly as it is today**: clinician counts, hospital names, Census percentages, and the `sources` array. `cities.test.ts` compares every translation's digits against the English and fails on a changed or dropped number. Change prose around a figure, never the figure.
- **Exactly three body paragraphs per city per locale.** The photo sits after paragraph 1 and the data strip after paragraph 2 (rule 2b, pinned by `city-pages.test.ts`).
- **No two cities may share a sentence** once city names and numbers are masked — the doorway-page guard in `cities.test.ts`. Ten pages built from one template with the numbers swapped is exactly what it looks for.
- **Paragraph 3 names only services that fit that city**, from: Practice Checkup, Digitize the office, Get more patients, Transition Planning. Do not name Transition Planning on a city page unless a figure on that page supports it; none does today, so it stays off all ten unless the owner says otherwise.
- **Each page addresses the largest clinician group in that city by name** (owner, 2026-09-22) — dentists where dentists lead, primary-care physicians in Pasadena, and so on, read from that page's own registry counts. It reads specific, follows the page's data, and keeps the ten openings from converging.
- **Transition Planning is named on no city page** (owner, 2026-09-22): no city page carries a figure about owners' ages or retirements, so naming it there would be an unsupported leap.
- Hard rule 1: `cityLocales()` decides which locales a city has; do not add or remove a locale.
- Reading bands, met by hand on the built pages: en FK 13–15, es Fernández Huerta 40–55, zh register 0.55–0.85, Chinese sentences under the 220-character ceiling. Never a regex over prose; never stiffer synonyms to move a score (CLAUDE.md, "the second, quieter form").
- Voice: plain-spoken, blunt, no marketing vocabulary; American English. Banned words: leverage, solutions, empower, transformation.
- Every negation re-read against the English twin before shipping a translation.
- Stage explicit paths only; `git show --stat HEAD` after each commit; commit messages end with a blank line and `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

## The shape every page takes

1. **Paragraph 1 — the problem, proved by this city's own number.** Address the owner directly ("If you run a dental practice in Glendale…"), name the figure that makes this city's situation what it is, and say what that means for a practice here. No claim about patient behavior.
2. **Paragraph 2 — what it means for the front office and for patients.** The hospital situation and the Census language shares, with the same honest conclusions the current pages draw (including where a translation is hard to justify).
3. **Paragraph 3 — what we would do, in order.** The service that fits first, what it starts with, and which alternative applies if the first diagnosis is wrong. Keep the existing habit of naming when something is cheap enough to do without us.

### The worked example (owner-approved shape, 2026-09-22) — Glendale, English

```
If you run a dental practice in Glendale, a patient searching for a dentist here is
choosing among 305 of them, which is the largest count of the ten cities on this site;
237 primary-care physicians and 66 optometrists practice here as well. Density like that
rarely announces itself as a single bad month. It shows up as a competitor opening a few
blocks away, a Tuesday morning that used to be full, and a practice that is easy to
overlook because nothing about its listing distinguishes it from the others.

Glendale also holds three general acute care hospitals inside the city — Adventist Health
Glendale, USC Verdugo Hills Hospital, and Glendale Memorial Hospital and Health Center —
more than any other city we cover. In the Census Bureau's 2024 five-year American
Community Survey, 13.7% of residents speak Spanish at home and 0.9% speak Chinese.
Spanish on the intake forms, the reminders and the page explaining which insurance you
accept earns its keep at that share; translating the site into Chinese on the strength of
the second figure would be difficult to defend, and we would tell you so.

Where 305 dentists compete, the least expensive appointment to fill belongs to a patient
who is already yours and overdue, so Get more patients begins with recall before any money
goes to advertising, and only then works on the listing, the reviews and the insurance
page. If the calls are already arriving and the front desk is losing them, Digitize the
office is the first job instead. The Practice Checkup settles which of the two it is, in
writing, before you pay for either.
```

### Per-city problem framing (Task 1 writes the prose; these fix what each page is *about*)

Each city's distinguishing fact is already in its current `summary`; keep that fact and lead with what it means for a practice there.

| City | The fact that makes the page | Paragraph 1 is about |
|---|---|---|
| Pasadena | The only city where primary-care physicians outnumber dentists; the most optometrists of the ten | Competing in the one city whose registry is physician-led, and among 93 optometrists |
| Altadena | Rebuilding after the Eaton Fire; tiny registry counts; pre-fire Census figures | A practice whose patients, records and address may all have moved — no sales push |
| South Pasadena | No hospital; dentists outnumber physicians roughly four to one | A dental market where recall matters more than advertising |
| Glendale | The largest dentist and physician counts; three hospitals; smallest Chinese share | Being one of 305 — see the worked example above |
| Alhambra | Over a fifth speak Spanish and roughly a third Chinese | Running a three-language front office without three receptionists |
| Arcadia | Large Chinese-speaking population, one of the smallest Spanish shares, its own hospital | Choosing one translation and doing it properly |
| Monrovia | The largest Spanish-speaking share of the ten; small registry counts; its own hospital | A small market where Spanish is not optional |
| San Marino | The largest Chinese share and smallest Spanish share; no hospital | Serving a Chinese-speaking population while referrals leave the city |
| Monterey Park | Two hospitals inside the city; more than four in ten speak Chinese at home | Competing beside two hospitals in a Chinese-speaking market |
| San Gabriel | Language shares close to Monterey Park's, but far more dentists and fewer physicians | A dense dental market in a two-language city |

---

### Task 1: The ten English pages

**Files:**
- Modify: `src/data/city-copy/en.ts`
- Test: `src/data/cities.test.ts`, `src/data/city-pages.test.ts` (run; change only if a test's own text names old copy)

**Interfaces:**
- Consumes: `CityCopy` from `src/data/cities.ts`; the figures and `sources` already in `en.ts`.
- Produces: rewritten `title`, `summary`, `body[3]`, `meta` for all ten cities. Titles keep the existing pattern "More patients for medical and dental practices in {City}" unless a city's page is no longer about that, in which case report it rather than inventing a second pattern.

- [ ] **Step 0: Branch** — `git switch main && git pull && git switch -c feat/city-pages-problem-first`

- [ ] **Step 1: Record the figures before touching anything**

Run and keep the output in the report:
```bash
grep -o '[0-9][0-9.,]*%\?' src/data/city-copy/en.ts | sort -u > /tmp/city-figures-before.txt
wc -l /tmp/city-figures-before.txt
```
The SET of distinct figures, not their counts — a rewrite may legitimately
mention 305 twice. Every figure in this list must still appear afterwards; a
figure that disappears is a defect, not an edit.

- [ ] **Step 2: Rewrite Glendale first, exactly as the worked example above**, then run the guards on it alone:

Run: `npx vitest run src/data/cities.test.ts`
Expected: PASS. If the doorway guard fails, two cities now share a masked sentence — rewrite the newer one rather than reverting.

- [ ] **Step 3: Rewrite the other nine**, one at a time, following the framing table. After each city, run `npx vitest run src/data/cities.test.ts` so a duplicated sentence is caught at the city that introduced it, not nine cities later.

- [ ] **Step 4: Check every figure survived**

```bash
grep -o '[0-9][0-9.,]*%\?' src/data/city-copy/en.ts | sort -u > /tmp/city-figures-after.txt
diff /tmp/city-figures-before.txt /tmp/city-figures-after.txt && echo "FIGURES UNCHANGED"
```
Expected: `FIGURES UNCHANGED`. Any difference means a number was dropped,
added or rounded. Fix the prose; never change a figure to satisfy this check.

- [ ] **Step 5: Build and run the full suite**

Run: `npm run build && npm run test && npm run typecheck`
Expected: all pass. The translations still hold the OLD English's figures, which is fine — the parity test compares figures, and Step 1's check proves they did not move.

- [ ] **Step 6: Commit**

```bash
git add src/data/city-copy/en.ts
git commit -m "Lead every English city page with the practice's problem"
git show --stat HEAD
```

---

### Task 2: The ten Spanish pages

**Files:**
- Modify: `src/data/city-copy/es.ts`

**Interfaces:**
- Consumes: the rewritten English from Task 1 — each Spanish page says what its English twin says.

- [ ] **Step 1: Read the rewritten English** for all ten cities in `src/data/city-copy/en.ts`, and the current Spanish for the vocabulary this site uses: **consultorio** (never "práctica"), **paciente**, **expediente clínico**, **recepción**, Latin American usage (**retiro**, not "jubilación").

- [ ] **Step 2: Rewrite the ten Spanish pages**, one at a time, keeping: the same three-paragraph shape; every figure digit for digit; the `sources` array untouched; the same claims and the same negations ("no se puede justificar", "se lo diríamos"). Run `npx vitest run src/data/cities.test.ts` after each city.

- [ ] **Step 3: Confirm the figures match the English**

Run: `npx vitest run src/data/cities.test.ts src/data/city-pages.test.ts`
Expected: PASS — the parity test compares every translation's digits against the English.

- [ ] **Step 4: Re-read every negation** against the English twin and list each one in the report (the polarity tripwire exists because these ship reversed).

- [ ] **Step 5: Build, test, commit**

```bash
npm run build && npm run test && npm run typecheck
git add src/data/city-copy/es.ts
git commit -m "Lead every Spanish city page with the practice's problem"
git show --stat HEAD
```

---

### Task 3: The twenty Chinese pages

**Files:**
- Modify: `src/data/city-copy/zh-hans.ts`, `src/data/city-copy/zh-hant.ts`

**Interfaces:**
- Consumes: the rewritten English from Task 1.

- [ ] **Step 1: Read the rewritten English and the current Chinese**, noting the site's vocabulary: zh-hans 诊所 / 患者 / 前台 / 电子病历系统; zh-hant 診所 / 病患 / 櫃檯 / 電子病歷系統, Taiwan usage throughout. City names come from `src/data/city-names.ts` — use those, never a new romanization.

- [ ] **Step 2: Rewrite the ten zh-hans pages**, then the ten zh-hant pages, one city at a time. Keep every figure; keep the three-paragraph shape; 書面語 register (因此, 然而, 並非/并非), no 吧/呢/啊/嘛; every sentence under 220 characters. The two scripts are separate translations, not a conversion: where Taiwan and mainland usage differ, use each one's own words.

- [ ] **Step 3: After each locale**, run `npx vitest run src/data/cities.test.ts` and fix any duplicate-sentence or figure-parity failure at the city that caused it.

- [ ] **Step 4: Re-read every negation** against the English twin; list them in the report.

- [ ] **Step 5: Build, test, commit**

```bash
npm run build && npm run test && npm run typecheck
git add src/data/city-copy/zh-hans.ts src/data/city-copy/zh-hant.ts
git commit -m "Lead every Chinese city page with the practice's problem"
git show --stat HEAD
```

---

### Task 4: Reading level, the rendered pages, docs

**Files:**
- Modify: any `src/data/city-copy/*.ts` whose page is out of band; `CLAUDE.md`; `docs/RESOLVED.md`

- [ ] **Step 1: Score all forty pages**

Run: `npm run build && npm run readability -- --dist`
Expected: no city page in the out-of-band list, and the command exits 0 (a non-zero exit means a runaway Chinese sentence). Fix any out-of-band page by hand — real subordination, more precise words, splitting anything that overshoots — re-measuring after each edit. Report each locale's final numbers.

- [ ] **Step 2: Check the furniture still sits between the paragraphs**

Run: `npx vitest run src/data/city-pages.test.ts`
Expected: PASS, including the ORDER check (photo after paragraph 1, strip after paragraph 2).

- [ ] **Step 3: Look at four rendered pages** — `npm run preview:status` (stop a stale one with `npm run preview:stop`), then `npm run preview`, and view `/websites/glendale/`, `/es/sitios-web/monrovia/`, `/zh-hans/wangzhan-jianshe/monterey-park/` and `/zh-hant/wangzhan-jianzhi/arcadia/` at 1280px and 375px. Confirm the photo and the data strip still fall between paragraphs, that no page scrolls sideways, and that the opening sentence reads as the page's lead rather than a caption. Stop the preview afterwards.

- [ ] **Step 4: Confirm every figure and source survived the whole branch**

```bash
for f in src/data/city-copy/{en,es,zh-hans,zh-hant}.ts; do
  echo "$f: $(grep -o '[0-9][0-9.,]*%\?' $f | sort -u | wc -l) distinct figures"
done
npx vitest run src/data/cities.test.ts src/data/city-pages.test.ts
```
Expected: the parity tests pass; spot-check three cities' clinician counts against `docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md` by eye and record them in the report.

- [ ] **Step 5: Docs** — add a Resolved bullet to CLAUDE.md ("The city pages lead with the practice's problem and use their own figures as proof; no claim about patient behavior survived sourcing (2026-09-22)") and a matching `docs/RESOLVED.md` entry; update the `npm run test` count line if it moved, saying it was measured locally.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md docs/RESOLVED.md src/data/city-copy
git commit -m "Record the city-page rewrite in the project docs"
git show --stat HEAD
```

Push and PR are the controller's, after the final review. Merging is the owner's.
