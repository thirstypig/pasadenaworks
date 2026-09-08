import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

/**
 * The contact form's CRM leg is a contract with a system this repo cannot see.
 *
 * THE BUG THIS EXISTS FOR. From 2026-08-26 to 2026-09-05 every contact-form
 * enquiry created a COMPLETELY BLANK person in Twenty CRM, and nothing anywhere
 * reported a problem.
 *
 * The submit handler posts to an n8n webhook with `mode: 'no-cors'`, which is
 * required because that webhook returns no CORS headers. Under `no-cors` the
 * Fetch spec permits only three CORS-safelisted Content-Type values
 * (application/x-www-form-urlencoded, multipart/form-data, text/plain) and
 * silently drops any other. The handler asked for `application/json`; the
 * browser discarded it and sent `text/plain;charset=UTF-8`.
 *
 * n8n hands a text/plain body to the workflow as a raw STRING. The HTTP Request
 * node read `{{ $json.body.name }}` — and `.name` on a string is `undefined`,
 * not an error. n8n rendered that into the template as an empty string, Twenty
 * accepted the write and returned 200, and the record was created with every
 * field blank.
 *
 * WHY NOTHING CAUGHT IT, which is the part worth keeping:
 *   - The site showed the success message: the fetch is fire-and-forget with
 *     `.catch(() => {})`, so it cannot observe the outcome by design.
 *   - n8n logged "Succeeded in 169ms". In n8n, Succeeded means the workflow ran
 *     without throwing, not that anything useful happened.
 *   - Twenty returned 200 and really did create a row.
 *   - The n8n dashboard read "0% failure rate".
 *   - Every end-to-end test of this path was run with curl or n8n's own test
 *     button, which send `application/json`. Under that Content-Type n8n parses
 *     the body into an object and the whole chain works. The only client that
 *     triggers the bug is a real browser — the one case nobody replayed.
 *
 * These tests cannot reach n8n or Twenty. What they CAN do is pin the two
 * halves of the contract that live in this file, so a future edit that breaks
 * the far end fails here instead of silently discarding leads.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(HERE, 'ContactForm.astro'), 'utf8');

/**
 * Field names the n8n workflow's `Valid submission?` node reads by name.
 * Renaming one here rejects EVERY submission at the guard, with no error
 * anywhere: the site still says thanks and n8n still logs Succeeded.
 */
const FIELDS_THE_WORKFLOW_DEPENDS_ON = ['_gotcha', 'email', 'message', 'name', '_locale'];

describe('contact form → n8n → Twenty CRM contract', () => {
  it('never declares a Content-Type that no-cors will silently discard', () => {
    // The whole bug in one assertion. `application/json` on a no-cors request
    // is not an error and not a warning — it is a value the browser throws
    // away, leaving code that reads as though the receiver gets parsed JSON.
    const crmCall = source.slice(source.indexOf('fetch(crmWebhookUrl'));
    const header = crmCall.match(/'Content-Type':\s*'([^']+)'/)?.[1];

    expect(header, 'the CRM fetch should declare a Content-Type').toBeDefined();
    expect(
      header,
      'no-cors permits only urlencoded/form-data/text-plain; anything else is dropped',
    ).toMatch(/^text\/plain/);
  });

  it('still sends the body as JSON text, because the workflow parses it', () => {
    // Normalise payload does JSON.parse on this string. If the body ever stops
    // being JSON text, that node yields {} and the guard rejects everything.
    //
    // This used to assert the literal `body: JSON.stringify(payload)`, which
    // broke when the value was hoisted into `serialised` to dedupe retries —
    // a rename, not a regression. Follow the binding instead of the spelling:
    // whatever `body` is given must be JSON.stringify of the payload.
    const crmCall = source.slice(source.indexOf('fetch(crmWebhookUrl'));
    const bodyExpr = crmCall.match(/body:\s*([A-Za-z0-9_.()]+)/)?.[1] ?? '';
    expect(bodyExpr, 'the CRM fetch must pass a body').not.toBe('');
    if (bodyExpr.startsWith('JSON.stringify')) return;
    expect(
      source.includes(`const ${bodyExpr} = JSON.stringify(payload)`),
      `body is \`${bodyExpr}\`, which must be assigned JSON.stringify(payload)`,
    ).toBe(true);
  });

  it('keeps mode: no-cors — the webhook sends no CORS headers', () => {
    const crmCall = source.slice(source.indexOf('fetch(crmWebhookUrl'));
    expect(crmCall).toMatch(/mode:\s*'no-cors'/);
  });

  it.each(FIELDS_THE_WORKFLOW_DEPENDS_ON)(
    'still renders a field named "%s", which the n8n guard reads by name',
    (field) => {
      expect(
        source.includes(`name="${field}"`),
        `renaming ${field} makes the n8n guard reject every submission silently`,
      ).toBe(true);
    },
  );

  it('names the honeypot _gotcha AND actually reads it', () => {
    // It was called `company` and read by nobody: present in the markup,
    // enforced nowhere, so both Formspree and the handler ignored it.
    // Formspree drops on the literal name `_gotcha`, and the n8n guard now
    // checks the same field, so the two ends agree only if this holds.
    expect(source).toContain('name="_gotcha"');
    // The second half of this used to be
    //   source.includes("get('_gotcha')") || source.includes('_gotcha')
    // whose right-hand side is already guaranteed by the line above, so the
    // whole assertion was a tautology: deleting the handler's honeypot check
    // outright still passed. That is exactly the "rendered but read by nobody"
    // state this test was written to prevent. Falsified by deleting the
    // `data.get('_gotcha')` branch — now red.
    expect(
      source.includes("data.get('_gotcha')"),
      'the handler must read the honeypot, not merely render it',
    ).toBe(true);
  });

  it('does not label the honeypot with a field name autofill recognises', () => {
    // Chrome's address autofill matches on the LABEL and ignores
    // autocomplete="off" for address forms. The label said "Company", so a
    // visitor with a saved address profile could have the trap filled for them
    // — and the handler discards that enquiry while showing the success
    // message. Silent loss of a real lead on the only conversion path.
    const AUTOFILL_PROFILE_LABELS = ['Company', 'Organization', 'Address', 'Name', 'Email'];
    const honeypotLabel = source.match(/<label for="_gotcha">([^<]*)<\/label>/)?.[1] ?? '';
    expect(honeypotLabel, 'the honeypot needs a label element to check').not.toBe('');
    for (const word of AUTOFILL_PROFILE_LABELS) {
      expect(
        honeypotLabel.toLowerCase().includes(word.toLowerCase()),
        `honeypot label "${honeypotLabel}" names an autofill profile field (${word})`,
      ).toBe(false);
    }
  });

  it('does not re-send an identical payload to the CRM on a retry', () => {
    // The CRM call fires before the awaited Formspree submit, deliberately, so
    // a Formspree outage still lands the lead somewhere. Without a guard, the
    // visitor sees msgError, presses Send again, and Twenty gets a second
    // person AND a second note for one enquiry.
    expect(source).toMatch(/lastCrmPayload/);
    expect(
      source.includes('serialised !== lastCrmPayload'),
      'the CRM call must be skipped when the payload matches the one already sent',
    ).toBe(true);
  });

  it('sends every form field to the CRM, not a hand-picked subset', () => {
    // Object.fromEntries(data.entries()) forwards whatever the form contains.
    // A hand-built object would drift from the markup the moment a field is
    // added, and the drift would be invisible until a lead arrived incomplete.
    expect(source).toMatch(/Object\.fromEntries\(data\.entries\(\)\)/);
  });

  it('leaves Formspree as the delivery path of record', () => {
    // The CRM call is best-effort and unobservable. Formspree is awaited and
    // drives the success/error message, so a CRM outage never costs a lead.
    const formspreeCall = source.slice(source.indexOf('await fetch(form.action'));
    expect(formspreeCall).toMatch(/response\.ok/);
  });
});
