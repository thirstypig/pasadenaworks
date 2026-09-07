---
title: "`mode: 'no-cors'` silently rewrote the Content-Type to text/plain, so n8n received the body as a string and every contact-form enquiry created a blank person in Twenty CRM"
date: 2026-09-06
category: integration-issues
component: "src/components/ContactForm.astro (the CRM leg of the submit handler) → n8n webhook → Twenty CRM `POST /rest/people`"
symptom: "Every contact-form submission created a Person record in Twenty CRM with `firstName`, `lastName` and `primaryEmail` all empty, for ten days (2026-08-26 → 2026-09-05). Nothing reported a failure at any layer: the site displayed its success message, n8n logged \"Succeeded in 169ms\", Twenty returned HTTP 200 and really did create the row, and the n8n dashboard read \"0% failure rate\". The workflow looked correct in the editor, the credential was valid, and the HTTP Request node's `{{ $json.body.name }}` expression was spelled correctly."
tags: [n8n, twenty-crm, fetch, cors, no-cors, content-type, webhook, silent-failure, data-loss, test-coverage, astro]
status: solved
---

## Summary

A static site cannot call an authenticated CRM API directly, so the contact form
posts to an n8n webhook which forwards to Twenty. That webhook returns no CORS
headers, so the browser request uses `mode: 'no-cors'`.

Under `no-cors` the browser permits only three `Content-Type` values and
**silently discards** any other. The handler asked for `application/json`; the
browser dropped it and — because the body is a string — substituted
`text/plain;charset=UTF-8`. n8n hands a `text/plain` body to the workflow as a
raw **string**, so `{{ $json.body.name }}` was a property lookup on a string:
`undefined`, not an error. n8n rendered `undefined` into the request template as
an empty value, and Twenty accepted the write.

The chain was not broken anywhere. Each link did exactly what it was told, and
the result was ten days of empty records with four independent success signals.

## How it surfaced

Not from an alarm. It surfaced while adding a validation node to close an
unrelated finding — the webhook URL is public in every page's HTML, so the task
was to reject bot submissions before the CRM call. Opening n8n to do that meant
reading a real execution for the first time since the workflow was built.

Execution ID#5 of 2026-08-26, labelled at the time as the "final end-to-end
check", is preserved in n8n and contains the whole diagnosis:

| where | what it shows |
|---|---|
| Webhook headers | `content-type: text/plain;charset=UTF-8`, `sec-fetch-mode: no-cors` |
| Webhook `body` in the node schema | typed `T` — a **string**, beside `params` and `query` which carry the object icon |
| HTTP Request body template | `"firstName": "{{ $json.body.name }}"` |
| Twenty's response | `createPerson` with `firstName: empty`, `lastName: empty`, `primaryEmail: empty` |

The `T` on `body` is the entire bug, visible as one character in a UI nobody had
reason to open.

## Why it survived for ten days

Because there was no failure to notice. Four layers reported success, and each
was telling the truth about its own contract:

- **The site** showed its success message. The CRM call is fire-and-forget —
  `fetch(...).catch(() => {})` — and under `no-cors` the response is an *opaque
  filtered response*: status `0`, empty header list, null body. The page cannot
  distinguish a 200 from a 500, by design. It was never able to report on this.
- **n8n** logged `Succeeded in 169ms`. In n8n, *Succeeded* means the workflow
  ran without throwing. It does not mean anything useful happened.
- **Twenty** returned HTTP 200 and genuinely created a row. A person with no
  name is a valid person as far as the API is concerned.
- **The n8n dashboard** read `0% failure rate`, which followed from the above.

A missing value is not an exception. `undefined` propagated through a template
that was designed to interpolate strings, and an empty string is a legitimate
string.

## Why every previous test passed

This is the part worth carrying to other integrations.

The workflow had been tested — repeatedly, and end to end. Every one of those
tests used **curl, Postman, or n8n's own "Listen for test event" button**. All
three send `application/json`. Under that Content-Type n8n parses the body into
an object, `$json.body.name` resolves, and the entire chain works perfectly.

The only client that triggers the bug is a real browser, because only a browser
enforces the `no-cors` header restriction. The test that "confirmed" this
integration on 2026-08-26 was exercising the one code path production never
takes.

**When a verification harness cannot use the production client, the green result
covers a path production never runs.** Say so at the time, rather than recording
the test as end-to-end.

## The mechanism, precisely

Three separate specified behaviours compose into the failure. None is a bug in
any component.

**1. The browser drops the header, and then replaces it.** Per the
[WHATWG Fetch Standard](https://fetch.spec.whatwg.org/), constructing a request
with `mode: "no-cors"` sets the headers object's guard to `"request-no-cors"`.
The [append algorithm](https://fetch.spec.whatwg.org/#concept-headers-append)
then reads:

> If headers's guard is `"request-no-cors"`: … If (name, temporaryValue) is not
> a **no-CORS-safelisted request-header**, then **return**.

That is a bare `return`, not a throw. The header never enters the list. The
safelisted `Content-Type` essences are exactly three —
`application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`.

The second-order effect is the one that actually bites. Later in the same
constructor:

> If type is non-null and this's headers's header list does not contain
> `Content-Type`, then append (`Content-Type`, type) to this's headers.

For a string body, `type` is `` text/plain;charset=UTF-8 ``. So the request does
not arrive with *no* Content-Type — it arrives with a **different** one that the
code never mentions.

Note the asymmetry, which is why this is silent rather than loud: an unsupported
**method** under `no-cors` throws `TypeError: Failed to construct 'Request':
'PUT' is unsupported in no-cors mode.` An unsupported **header** does not.

**2. n8n parses `text/plain` as a string.** n8n does not use `express.json()`;
it has its own parser (`packages/cli/src/middlewares/body-parser.ts`) which
branches on a parameter-stripped, lowercased Content-Type:

```js
if (contentType === 'application/json') {
  req.body = jsonParse(stripBom(rawBody.toString(encoding)));
} else if (contentType === 'text/plain') {
  req.body = rawBody.toString(encoding);   // ← a STRING, not parsed
}
```

`text/plain;charset=UTF-8` normalises to `text/plain` and takes the second
branch. The JSON arrives perfectly intact — it is simply never parsed.

**3. A property lookup on a string is `undefined`, not an error.**
`"{...}".name` is `undefined`; n8n interpolates that into the template as an
empty value; Twenty stores it.

## The fix

A `Normalise payload` Code node, inserted before anything reads the body, that
collapses both shapes to an object:

```js
return $input.all().map((item) => {
  let body = item.json.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) body = {};
  return { json: { ...item.json, body } };
});
```

It spreads the rest of the item through unchanged, so the existing HTTP Request
node's `$json.body.…` expressions keep working — inserting a node does not
rewrite what `$json` means downstream.

**Normalising rather than fixing the Content-Type is deliberate.** The header
cannot be fixed from the page: `no-cors` is required because the webhook sends
no CORS headers, and any Content-Type worth sending is outside the safelist. The
receiver is the only end that can be made correct, and a receiver that accepts
both shapes is correct under either.

On the repo side `ContactForm.astro` now declares what is actually sent:

```js
headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
```

Behaviour is identical — the browser was already sending this. The difference is
that the code no longer reads as though the receiver gets parsed JSON. The
`application/json` that sat there for ten days was not merely inert; it was
actively misleading every reader, which is why the bug survived review.

The workflow gained a `Valid submission?` IF node at the same time, so the
public endpoint drops bot and junk POSTs before the CRM call:

```
Webhook → Normalise payload → Valid submission? →(true)→ create person
```

## Verifying

Against the live system, not in simulation:

| execution | payload | result |
|---|---|---|
| ID#14 | honeypot filled | Webhook, Normalise and IF green; **HTTP Request grey, never ran**. Nothing reached Twenty |
| ID#14 (×3 more) | missing email, email without `@`, empty `{}` | same |
| ID#15 | a valid submission | all nodes green; Twenty returned `firstName: "Guard test — DELETE ME"` and the real email |

The `body` field in the node schema changed from a bare `T` to an **object with
children**. That single icon is the whole before-and-after.

Rejected payloads complete in 16–22 ms against 114 ms for one that reaches the
CRM, so validating before the outbound call is also the cheaper order.

**No leads were lost.** Every execution prior to the fix carried
`origin: http://localhost:4322` — the owner's own dev server. The form had not
yet been used in anger. The next real enquiry would have vanished.

## Prevention

### The assertion that would have caught it

The dropped header is **undetectable from the response** and **trivially
detectable from the request**. `Headers.get()` has no guard check, so the
substitution is observable client-side before anything is sent:

```js
const req = new Request(url, {
  mode: 'no-cors',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
req.headers.get('content-type');  // "text/plain;charset=UTF-8" — not what was asked for
```

Any integration that sets a header under `no-cors` can assert this in one line.

### Regression check

`src/components/contact-form.test.ts` pins the contract that spans the two
systems:

- the CRM fetch must not declare a Content-Type `no-cors` will discard
- the body stays `JSON.stringify`-ed, because the receiving node parses it
- **every field name the n8n guard reads by name** — `_gotcha`, `email`,
  `message`, `name`, `_locale`. Renaming one in the form rejects every
  submission at the guard, with nothing reporting an error on either side. That
  is a cross-system contract with no other guard on it.

Each was falsified against a deliberately broken component before being kept;
restoring the `application/json` header fails the suite.

### What would not have caught it

- **A schema or type check.** Every value was a valid string.
- **An integration test with curl or Postman.** Those send
  `application/json` and the chain works.
- **Reading the code.** The handler says `application/json` and means it. The
  workflow says `$json.body.name` and is spelled correctly. Nothing on either
  side is wrong in isolation; the defect is in the seam.
- **Monitoring failure rate.** It was 0%, accurately.

The only signals available were the *content* of a created record and the type
of `body` in an execution log — both of which require someone to look at a
successful run and ask whether it did anything.

### The generalisable rule

**Read one successful execution, not just the status.** A green status says a
system did not crash. It says nothing about whether the payload arrived. For any
integration that writes records, the acceptance test is *read one back and check
its fields are populated* — not *confirm a 200*.

## Related

- [`twenty-crm-mcp-advertises-http-behind-railway-proxy.md`](twenty-crm-mcp-advertises-http-behind-railway-proxy.md)
  — the structural twin, same Twenty instance: an HTTP-layer detail the
  application silently accepted as correct, where the obvious config-level
  suspect was already right and irrelevant. Its diagnostic method — call the
  same endpoint two different ways and compare — is the same move as
  "reproduce with a browser, not curl."
- [`tina-match-include-appends-the-format-and-matches-nothing.md`](tina-match-include-appends-the-format-and-matches-nothing.md)
  — this repo's canonical *a check that cannot fail looks exactly like a check
  that passes*. A blank person record is to a real one what an empty collection
  is to an empty folder: indistinguishable from the correct outcome.
- [`calcom-railway-smtp-password-reset-emails-fail.md`](calcom-railway-smtp-password-reset-emails-fail.md)
  — same pipeline, and the inversion of its lesson. That one says *diagnose by
  error type, not by re-checking config*. Here there was no error type at all,
  which is the harder case.
- [`tina-slugify-strips-cjk-and-collides-filenames.md`](tina-slugify-strips-cjk-and-collides-filenames.md)
  — the same failure in another dimension: *a test corpus must contain a sample
  from every locale the product ships in.* Here the corpus contained every
  client except the one that ships.
- [`astro-global-selector-is-inert-outside-a-scoped-style-block.md`](../ui-bugs/astro-global-selector-is-inert-outside-a-scoped-style-block.md)
  — success reported by something that was never running; its rule, *make the
  assertion executable*, is what the regression check above implements.
- [`twenty-crm-railway-migration-never-completes.md`](../database-issues/twenty-crm-railway-migration-never-completes.md)
  — for its prevention point only: verify first-boot success by hitting an
  endpoint that depends on real data, never by deployment status.

## Postscript

The repair was not written as a repair. `Normalise payload` was added because a
validation node could not safely assume the payload's shape, and the shape was
unknown at the time. Building the guard to work under either answer removed the
need for the answer — and incidentally fixed a bug nobody had detected.

That is worth generalising past this incident. When a step depends on a fact you
do not have, the cheapest move is often not to go and get the fact, but to make
the step correct under every value the fact could take. Here it turned a blocked
task into a fix.

The inverse also showed up in the same work, and is the sharper lesson. The
original one-node design shipped with a note attached: *"confirm the field paths
against one real submission before trusting them."* That note was the defect. It
moved a known unknown onto whoever pasted the config — the person least equipped
to catch it — and the failure mode it guarded against was silent. **A caveat in
a handover is not a control.** If a step cannot be verified by the person
receiving it, it has to be made unnecessary before handing it over.
