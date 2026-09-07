import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { ui } from '../i18n/ui';
import { LOCALES } from '../i18n/ui';

/**
 * The consent banner offers a way to take consent back.
 *
 * WHY IT EXISTS. The site asks for analytics consent, and until 2026-09-06 gave
 * no way to revoke it. That is incoherent on its own terms whatever the
 * jurisdiction — you cannot meaningfully ask permission you will not let anyone
 * withdraw. `todos/018` had it parked as a GDPR question; the argument that
 * settled it is simpler than GDPR.
 *
 * THE BUG THESE TESTS EXIST FOR, which reading the code would not have caught.
 * The first version bound the control with
 *
 *     document.querySelectorAll('[data-consent-reopen]').forEach(...)
 *
 * and it did nothing at all. `define:vars` forces that script to be `is:inline`
 * (Astro warns `astro(4000)` about exactly this), so it executes at its own
 * position in the document — and `CookieConsent` renders in `<body>` ABOVE the
 * `Footer` that carries the control: char ~9,000 vs ~24,500 in the built HTML.
 * The element did not exist yet, `querySelectorAll` matched nothing, and the
 * failure was completely silent: the link rendered, took clicks, and did
 * nothing. Caught only by driving a real browser through the accept → withdraw
 * → re-accept cycle.
 *
 * Delegating from `document` is independent of DOM order, which is why the fix
 * is delegation rather than "move the component".
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const consent = readFileSync(join(HERE, 'CookieConsent.astro'), 'utf8');
const footer = readFileSync(join(HERE, 'Footer.astro'), 'utf8');

describe('consent can be withdrawn', () => {
  it('binds the reopen control by delegation, not by querySelectorAll', () => {
    // The whole bug in one assertion. A direct bind runs before the footer
    // exists and silently matches nothing.
    expect(
      consent,
      'the script is is:inline (define:vars) and runs above the footer — bind on document',
    ).toMatch(/document\.addEventListener\(\s*'click'/);
    expect(
      consent.includes("querySelectorAll('[data-consent-reopen]')"),
      'a direct bind cannot see the footer control; use event delegation',
    ).toBe(false);
  });

  it('matches the click against the control, so unrelated clicks are ignored', () => {
    expect(consent).toMatch(/closest\(\s*'\[data-consent-reopen\]'\s*\)/);
  });

  it('stops analytics immediately on withdrawal, not just on the next page load', () => {
    // Reopening returns the visitor to "no choice recorded", so hits must stop
    // now. GA4 reads window['ga-disable-<ID>'] on every hit; the tag itself
    // cannot be unloaded.
    expect(consent).toMatch(/window\['ga-disable-' \+ measurementId\] = true/);
  });

  it('clears the opt-out when consent is given again', () => {
    // Without this, accepting after a withdrawal hides the banner and looks
    // like it worked while GA4 drops every hit on the floor.
    expect(consent).toMatch(/window\['ga-disable-' \+ measurementId\] = false/);
  });

  it('forgets the stored choice on withdrawal', () => {
    expect(consent).toMatch(/localStorage\.removeItem\(KEY\)/);
  });

  it('wraps that removal in try/catch, like every other storage access here', () => {
    // localStorage THROWS rather than returning null in a private window, and
    // an uncaught throw kills the rest of an inline script.
    const withdrawal = consent.slice(consent.indexOf("document.addEventListener('click'"));
    const removal = withdrawal.indexOf('localStorage.removeItem');
    const guard = withdrawal.lastIndexOf('try {', removal);
    expect(guard, 'the removal must sit inside a try block').toBeGreaterThan(-1);
  });

  it('loads gtag.js at most once per page view', () => {
    // accept → withdraw → accept again reaches loadGA() a second time. Without
    // a guard that appends a SECOND gtag.js and fires a second `config`, which
    // GA4 counts as another page_view for the same page — so the visitors who
    // engage most with the consent control are the ones who inflate the
    // numbers. Clearing `ga-disable` is what resumes collection; re-loading the
    // tag never was.
    expect(consent).toMatch(/__pwGaLoaded/);
    expect(
      /if \(window\.__pwGaLoaded\) return;/.test(consent),
      'loadGA must return early when the tag is already on the page',
    ).toBe(true);
  });

  it('renders the control only when analytics is actually configured', () => {
    // A "change your mind" control on a site that never asked for consent is
    // worse than none. Same condition that governs the banner itself.
    expect(footer).toMatch(/site\.gaMeasurementId && \(/);
    expect(footer).toContain('data-consent-reopen');
  });

  it('labels the control in every locale, like the banner buttons', () => {
    // Deliberately localised, unlike the English-only legal links beside it:
    // this is a consent control, and cookieAccept/cookieDecline are localised.
    for (const locale of LOCALES) {
      const label = ui[locale].misc.cookieSettings;
      expect(label, `${locale} is missing cookieSettings`).toBeTruthy();
      expect(label.trim(), `${locale} cookieSettings is blank`).not.toBe('');
    }
    // Traditional Chinese must use Taiwan lexis: 設定, not the mainland 设置.
    expect(ui['zh-hant'].misc.cookieSettings).toContain('設定');
    expect(ui['zh-hans'].misc.cookieSettings).toContain('设置');
  });
});
