# Transition Planning Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Transition Planning as a fourth service in all four languages, describing preparation only, with every legal statement drawn from the sources file's Verified table.

**Architecture:** A service is one record in `src/data/services.ts`. The services index, the four homepages, the localized hub, the detail routes, and the `LocalBusiness` offer catalog all map over that array, so adding a record builds the page, adds the card and updates the structured data in one move. Two new tests make the launch constraints hard to regress: the copy must not mention brokers until todos/046 (e) is answered, and its outbound legal links must be ones the sources file marks Verified.

**Tech Stack:** Astro 7, TypeScript, vitest.

**Spec:** `docs/superpowers/specs/2026-09-21-positioning-about-transition-design.md` §4, with its sources twin `docs/superpowers/specs/2026-09-21-positioning-about-transition-sources.md` (the **Verified** table is the only legal material copy may state as law).

## Global Constraints

- **No brokers.** No locale may mention brokers, broker lists, referrals to brokers, or introductions to anyone who sells practices, until todos/046 (e) is answered. Saying what we do NOT do ("we do not value practices, find or negotiate with buyers") is allowed.
- **Law only from the Verified table.** B&P §2266 (physician records, at least seven years after the last date of service) and B&P §3007 (optometry records, seven years after treatment ends; minors until 19) are the two cited here. Nothing from the "Reported" list may be stated as a requirement. No 30/60/90-day notice periods; no claim that HIPAA requires patient notice.
- We never value a practice, broker, take a broker's or vendor's fee, or give legal or tax advice.
- The owner speaks English only — do not imply a bilingual consultant.
- No family or client names; this repo is public.
- Slugs (hard rule 3): `transition-planning`, `transicion-del-consultorio`, `chuancheng-guihua` (zh-hans, 传承规划), `jieban-guihua` (zh-hant, 接班規劃). Service id: `transition`.
- Display order: appended fourth, after `websites`.
- Voice: plain-spoken; the banned words "leverage", "solutions", "empower", "transformation" are enforced by `services.test.ts`. American English.
- Meta description bands (enforced): en 150–158 characters, es 130–160.
- Translation parity (enforced): every locale has the same number of body blocks, `<li>` items, outcomes and outbound `href="http…"` links as English.
- Readability on the built pages, met by hand: en FK 13–15, es Fernández Huerta 40–55, zh register 0.55–0.85.
- Stage explicit paths only; read `git show --stat HEAD` after each commit. Commit messages end with a blank line and `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

---

### Task 1: The Transition Planning service record and its guards

**Files:**
- Modify: `src/data/services.ts` (two `SOURCES` entries; a fourth record appended to `defineServices([...])`)
- Modify: `src/data/services.test.ts` (display order; two new guard tests)
- Modify: `src/data/retired-services.test.ts` (append four URLs to `PUBLISHED_SERVICE_URLS`)

**Interfaces:**
- Consumes: `ServiceCopy`, `defineServices`, `SOURCES` in `services.ts`.
- Produces: a service with `id: 'transition'` and the four slugs above; `SOURCES.calBusProf2266`, `SOURCES.calBusProf3007`.

- [ ] **Step 0: Branch** — `git switch main && git pull && git switch -c feat/transition-planning`

- [ ] **Step 1: Write the failing tests**

In `src/data/services.test.ts`, change the order assertion:

```ts
  it('lists the services in the display order the owner chose (2026-09-14; Transition Planning appended 2026-09-22)', () => {
    expect(services.map((s) => s.id)).toEqual(['consulting', 'digitize', 'websites', 'transition']);
  });
```

and append a new `describe` block at the end of the file:

```ts
describe('Transition Planning launch guards', () => {
  const transition = services.find((s) => s.id === 'transition');

  it('exists', () => {
    expect(transition).toBeDefined();
  });

  it('says nothing about brokers until todos/046 (e) is answered', () => {
    // The owner's launch decision, 2026-09-21: preparation only. B&P §10131
    // makes a broker anyone who, for any compensation, solicits buyers or
    // sellers of a business — our planning fee could count. Remove a word from
    // this list only when the attorney has answered (e) in todos/046.
    const BROKER_WORDS: Record<string, RegExp> = {
      en: /\bbrokers?\b|\bbrokerage\b/i,
      es: /corredor|intermediari|agente de venta/i,
      'zh-hans': /中介|经纪/,
      'zh-hant': /仲介|經紀/,
    };
    for (const [locale, re] of Object.entries(BROKER_WORDS)) {
      const text = JSON.stringify((transition!.t as Record<string, unknown>)[locale]);
      expect(text, `${locale} mentions a broker`).not.toMatch(re);
    }
  });

  it('cites only statutes the sources file marks Verified', () => {
    // Everything else the 2026-09-21 research found is "Reported" — true as
    // far as it went, but not compared word for word, so not quotable as law.
    const VERIFIED = [
      'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&amp;sectionNum=2266',
      'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&amp;sectionNum=3007',
    ];
    for (const locale of LOCALES) {
      const html = transition!.t[locale].body.join('');
      const links = [...html.matchAll(/href="(https?:[^"]+)"/g)].map((m) => m[1]);
      expect(links.length, `${locale} cites no statute`).toBeGreaterThan(0);
      for (const url of links) expect(VERIFIED, `${locale}: ${url}`).toContain(url);
    }
  });
});
```

In `src/data/retired-services.test.ts`, append to `PUBLISHED_SERVICE_URLS` after the `digitize` group:

```ts
  // transition — added 2026-09-22
  '/services/transition-planning/',
  '/es/servicios/transicion-del-consultorio/',
  '/zh-hans/fuwu/chuancheng-guihua/',
  '/zh-hant/fuwu/jieban-guihua/',
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx vitest run src/data/services.test.ts src/data/retired-services.test.ts`
Expected: FAIL — the order assertion lacks `'transition'`, `exists` fails, and the published-URL check lists the four new URLs as unreachable (that last one needs `dist/`; if it skips, note it and continue).

- [ ] **Step 3: Add the two statute sources** — in `SOURCES` in `src/data/services.ts`, after `calBusProf650`, following its exact `&amp;` form:

```ts
  calBusProf2266:
    'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&amp;sectionNum=2266',
  calBusProf3007:
    'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&amp;sectionNum=3007',
```

- [ ] **Step 4: Append the record with its English copy** — as the last element of `defineServices([...])`, with a header comment in the file's existing style:

```ts
  /* ── 4. Transition Planning (added 2026-09-22) ──────────────────────────
   *  Preparation only. It must not mention brokers or introductions until
   *  todos/046 (e) is answered (owner, 2026-09-21), and it may state as law
   *  only what docs/superpowers/specs/2026-09-21-positioning-about-
   *  transition-sources.md marks Verified. services.test.ts enforces both. */
  {
    id: 'transition',
    slugs: {
      en: 'transition-planning',
      es: 'transicion-del-consultorio',
      'zh-hans': 'chuancheng-guihua',
      'zh-hant': 'jieban-guihua',
    },
    t: {
      en: {
        title: 'Transition Planning',
        seoTitle: 'Medical & Dental Practice Transition Planning',
        tagline: 'A written plan for the day you step back, made years before that day arrives.',
        summary:
          'A written plan for how you will step back from the practice, whether you sell it, hand it to a successor, or close it, followed by the preparation that makes that ending go well, begun years rather than months ahead.',
        body: [
          '<p>Most doctors begin planning their departure a few months before they intend to leave, which is roughly when it becomes too late to change anything that matters. A practice that still runs on paper charts, on procedures that exist only in the office manager’s memory, and on a front desk that only one person fully understands is harder to sell, harder to hand to a successor, and harder to close without leaving patients stranded, and because each of those problems takes months to repair, the plan is worth the most when it is made early.</p>',
          `<h2>Three endings, and you choose</h2><ul><li><strong>Selling the practice.</strong> We prepare it for a sale: records digitized and organized, written procedures, accurate patient data, and a front office that runs on an ordinary day without you. The sale itself belongs to the licensed professionals you engage.</li><li><strong>Handing it on to an associate or successor.</strong> We plan the handover so that the systems, the procedures, and the patients’ trust stay with the practice rather than leaving with you.</li><li><strong>Closing it properly.</strong> We plan the patient letters, the transfer of records, and the listings that must come down, and we check the rules for your profession; California, for example, requires a physician to keep patient records <a href="${SOURCES.calBusProf2266}">for at least seven years after the last visit</a>, and an optometrist <a href="${SOURCES.calBusProf3007}">for seven years after treatment ends, and for a minor until age nineteen</a>.</li></ul>`,
          '<p>We do not value practices, find or negotiate with buyers, or give legal or tax advice, because those decisions belong to your attorney, your accountant, and the licensed professionals you engage. What we contribute is the operational preparation that makes each of their jobs easier, and since we are paid by the practice and by nobody else, our advice does not depend on which ending you choose.</p>',
        ],
        outcomes: [
          'A written transition plan that names the ending you have chosen, the steps it requires, and the order in which to take them',
          'Patient records digitized, organized, and ready to move to a buyer, a successor, or a records custodian',
          'Written procedures that allow the front office to run on an ordinary day without you',
          'A timeline for patient letters, listing changes, and record transfers, checked against the rules for your profession',
          'A clear account of which decisions belong to your attorney and your accountant, so that nothing falls between them',
          'Advice from someone who is paid by the practice and not by the outcome',
        ],
        meta: 'Transition planning for independent medical, dental, and eye care practices in Southern California: sell, hand it on, or close it, with years to prepare.',
      },
      // es, zh-hans, zh-hant: Step 5.
    },
  },
```

- [ ] **Step 5: Write the three translations** in the same record, following the house method (CLAUDE.md "Register"; memory `project_blog_translation_method`):
  - Titles: es `Planificación de la transición`; zh-hans `诊所传承规划`; zh-hant `診所接班規劃`. `seoTitle` in each locale names medical and dental practices and the transition.
  - Vocabulary from the rest of `services.ts`: es **consultorio** (never "práctica"), **paciente**, **expediente clínico**; zh-hans 诊所 / 患者; zh-hant 診所 / 病患, Taiwan vocabulary. Latin American Spanish: *retiro*, not *jubilación*.
  - Same structure as English: three body blocks, three `<li>`, the two statute links with the same `${SOURCES…}` values, six outcomes.
  - **No broker words** in any locale (the guard's patterns: es corredor/intermediari/agente de venta; zh 中介/经纪/仲介/經紀). "Licensed professionals you engage" → es *los profesionales con licencia que usted contrate*; zh *您所委任的持照专业人士 / 您所委任的持照專業人士*.
  - Re-read every negation against the English: "do not value", "find or negotiate with buyers", "does not depend", "not by the outcome".
  - Chinese register: 書面語 markers, no 吧/呢/啊/嘛, sentences under 220 characters.
  - es meta 130–160 characters.

- [ ] **Step 6: Run the tests, typecheck and build**

Run: `npx vitest run src/data/services.test.ts && npm run typecheck && npm run build && npx vitest run src/data/retired-services.test.ts`
Expected: PASS (the published-URL check now runs against `dist/`); build log free of `[glob-loader]` and `'global' is not recognized`.

- [ ] **Step 7: Prove the broker guard bites** — add the word " broker" to the end of the English `tagline` by hand, run `npx vitest run src/data/services.test.ts`, confirm the guard FAILS naming `en`, then remove the word by hand and re-run to confirm PASS. Record both outputs in the report.

- [ ] **Step 8: Commit**

```bash
git add src/data/services.ts src/data/services.test.ts src/data/retired-services.test.ts
git commit -m "Add Transition Planning as a fourth service, preparation only"
git show --stat HEAD
```

---

### Task 2: Reading level, the four-card layout, docs, PR

**Files:**
- Modify: `src/data/services.ts` (only if a locale is out of band), `CLAUDE.md`, `docs/RESOLVED.md`

- [ ] **Step 1: Score the four new pages**

Run: `npm run build && npm run readability -- --dist 2>&1 | grep -E "in band|transition-planning|transicion-del-consultorio|chuancheng-guihua|jieban-guihua"`
Expected: none of the four listed as out of band. If one is, fix that locale by hand — real subordination or more precise words — re-measure after each edit, keep every claim and negation, and never splice sentences mechanically. If English is out of band by the owner-facing copy, report the score rather than rewriting meaning.

- [ ] **Step 2: Confirm hreflang and the offer catalog**

Run: `grep -o 'hreflang="[^"]*" href="[^"]*"' dist/services/transition-planning/index.html` — expect four locales plus x-default.
Run: `grep -o '"name":"Transition Planning"' dist/index.html` — expect one match (the `LocalBusiness` offer catalog).

- [ ] **Step 3: Look at the four-card grid** — `npm run preview:status` (stop a stale one with `npm run preview:stop`), `npm run preview`, then at 1280px and 375px view `/`, `/services/`, `/es/` and `/zh-hant/fuwu/`. `.service-grid` is `repeat(auto-fit, minmax(min(16rem, 100%), 1fr))`, so four cards may land 3 + 1 at some widths. Record what each width shows. If a lone fourth card looks broken, stop and report it rather than restyling in this task. Check `scrollWidth <= innerWidth`. Stop the preview afterwards.

- [ ] **Step 4: Docs** — CLAUDE.md: in "What this is", the service lineup now names four services including Transition Planning (preparation only, pending todos/046 (e)); update the `npm run test` count to what `npm run test` reports after a build; add a Resolved bullet "Transition Planning is a fourth service in four languages, preparation only until the attorney answers todos/046 (e) (2026-09-22)" and a matching `docs/RESOLVED.md` entry in that file's format.

- [ ] **Step 5: Full checks and commit**

Run: `npm run build && npm run test && npm run typecheck`
```bash
git add CLAUDE.md docs/RESOLVED.md src/data/services.ts
git commit -m "Record Transition Planning in the project docs"
git show --stat HEAD
```

Push and PR are the controller's, after the final review. Merging is the owner's.
