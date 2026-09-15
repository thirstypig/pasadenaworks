---
status: complete
priority: p2
issue_id: "032"
tags: [code-review, hipaa, privacy, contact-form, i18n]
dependencies: []
---

# The contact form now invites practices to describe their situation, with nothing warning them off patient details

## Problem Statement

The repositioned homepage asks practice owners to "Tell us what is happening at
your practice". A doctor describing a problem naturally mentions a patient. The
form posts to Formspree, a self-hosted n8n workflow and Twenty CRM; none of that
chain is covered by a BAA. Patient information typed into it would sit in three
systems Pasadena Works cannot use for protected health information, on the site of
a consultancy that tells practices to guard exactly that.

## Findings

- Invitation copy: `src/pages/index.astro:78`, `src/data/home.ts:52/74/96`.
- Form markup: `src/components/ContactForm.astro:59–60` (message label + textarea),
  labels from `strings.form` in `src/i18n/ui.ts`.
- Data path documented in memory/`docs/RESOLVED.md`: Formspree → n8n → Twenty.

## Proposed Solutions

### Option A: A one-line hint under the message field, all four locales
"Please don't include patient names or health details." Wired with
`aria-describedby` so screen readers announce it with the field.
- **Pros:** at the point of typing; UI string, so outside readability scoring.
- **Cons:** one new UI string per locale.
- **Effort:** Small · **Risk:** Low

### Option B: Put the warning in the homepage contact paragraph instead
- **Pros:** no component change.
- **Cons:** far from the field; the contact form appears on other pages too.
- **Effort:** Small · **Risk:** Low

## Recommended Action

Option A.

## Technical Details

- `src/components/ContactForm.astro`, `src/i18n/ui.ts` (form strings)

## Acceptance Criteria

- [x] Hint renders under the message field on the English and a translated homepage
- [x] `aria-describedby` links the textarea to the hint
- [x] Hint present in all four locales (typecheck enforces the key)
- [x] Verified in a browser at 400px and 1280px

## Work Log

### 2026-09-14 — Found in PR #75 review
Copy-claims reviewer (finding 6).

### 2026-09-14 — Fixed on the PR #75 branch
Option A. New `form.messageHint` string in all four locales ("Please don’t include patient names or health details." and translations), rendered under the textarea in `ContactForm.astro` with `aria-describedby="message-hint"`, styled with the existing `--color-ink-soft` token (an invented `--color-ink-muted` was caught before build — it does not exist). Typecheck enforces the key per locale. Verified in a browser on /zh-hant/ at 400px: renders under the box, no horizontal overflow, aria link present.

Verified: `npm run typecheck` 0 errors (88 files); `npm run build` no warnings; `npm run test` 349 passed, 1 skipped (350, up from 346); `npm run readability -- --dist` exit 0 with every service page and homepage in band.

**todos/032 is closed.**

## Resources

- PR #75
