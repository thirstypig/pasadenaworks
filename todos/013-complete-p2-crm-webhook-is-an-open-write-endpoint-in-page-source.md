---
status: pending
priority: p2
issue_id: 013
tags: [code-review, security, crm, contact-form, static-hosting, needs-owner-action]
dependencies: []
---

# The n8n CRM webhook is an unauthenticated write endpoint published in every page's HTML

## Problem Statement

`src/data/site.ts` holds the n8n webhook URL and `src/components/ContactForm.astro`
renders it into the page as `data-crm-webhook-url`. Verified in the built output:

```
$ grep -o 'data-crm-webhook-url="[^"]*"' dist/index.html
data-crm-webhook-url="https://n8n-production-94d1d.up.railway.app/webhook/15ada5a1-…"
```

Anyone who views source can POST arbitrary JSON there, at any volume, with no
token, no origin check and no rate limit — writing forged records into Twenty CRM
and bypassing Formspree's spam filtering entirely. `mode: 'no-cors'` makes the
response opaque, so the site cannot detect any of it.

**This is inherent to the architecture, not a mistake in it.** A static site has
no server (hard rule 4), so any endpoint the browser calls is public by
construction. A query-string secret does not help: it ships in the same HTML.

## Findings

**The honeypot that would have blunted this was inert — now fixed.**
`ContactForm.astro` rendered a `company` field with a comment saying bots fill
it, but the handler never read it and the name was not `_gotcha`, so Formspree
ignored it too. Renamed and enforced on both paths (2026-09-03). That stops
naive form-fillers; it does not stop anyone POSTing the endpoint directly.

**A second, quieter bug in the same call.** `mode: 'no-cors'` restricts
`Content-Type` to three safelisted values, so the `application/json` header is
silently stripped and n8n receives the body as `text/plain`. Worth confirming the
workflow still parses it — it may be working by accident.

**Host discrepancy worth resolving.** `memory/project_contact_form_architecture.md`
records the n8n instance as `n8n-production-80f3d.up.railway.app`; `site.ts`
points at `n8n-production-94d1d`. One of the two is stale.

## Proposed Solutions

### ~~Option A — Formspree forwards to n8n server-side~~ RULED OUT

Struck 2026-09-03. `src/data/site.ts:23-24` already records why: *"Formspree's
free plan can't forward submissions anywhere on its own, and Zapier/Make both
paywall webhooks on their free tiers too."* The architecture memory adds that
paid tiers were declined. This option was recommended in the first draft of this
todo **without checking the decision already recorded in the repo** — the note
was two lines above the value being audited.

It becomes available only by paying for Formspree (or an equivalent), which is a
budget decision, not an engineering one.

### Option B — A shared secret in the request

- **Does not work.** Anything the browser sends is in the HTML. It would buy only
  the appearance of a fix, and mislead the next reader.

### Option C — Harden the n8n workflow

Validate and constrain server-side, where the code is not public: require the
expected fields, reject anything with the honeypot filled, drop submissions
whose shape does not match, and rate-limit per IP.

- **Pros:** The only option available without spending money. Caps the damage,
  keeps the lead path untouched, and the logic lives somewhere not readable from
  the page. Composes with the honeypot fix already landed.
- **Cons:** The endpoint stays writable by anyone — this is damage control, not
  closure. Must be done in the n8n UI (owner's login; not reachable from tool
  calls). Rate limiting in n8n is more work than the validation.
- **Effort:** Medium · **Risk:** Low

### Option D — Accept it, and monitor

Leave as is; watch Twenty for junk and clean up if it appears.

- **Pros:** Zero work. The endpoint is unadvertised, and small-site webhooks are
  rarely found by anything but a broad scanner.
- **Cons:** Security by obscurity. The URL is in the HTML of every page of a
  site whose whole strategy is to be found in search.
- **Effort:** None · **Risk:** Medium

## Recommended Action

**Option C**, done in n8n. Paste-ready node config below, per the owner's
preferred way of working with n8n (see `memory/reference_n8n_edit_workflows_via_node_json.md`).

Paste **two** nodes between the Webhook trigger and the HTTP Request node, and
route only the IF node's `true` branch onward. Two, not one, because the guard
cannot safely assume the payload's shape — see the 2026-09-05 work-log entry.

```json
{
  "nodes": [
    {
      "parameters": {
        "mode": "runOnceForAllItems",
        "language": "javaScript",
        "jsCode": "// The contact form posts with mode:'no-cors', which forces the request's\n// Content-Type to text/plain no matter what header the page sets. Depending\n// on how n8n parses that, `body` arrives either as a real object or as a raw\n// JSON string. Normalise both to an object so everything downstream can rely\n// on $json.body.<field> — including the HTTP Request node that already exists.\nreturn $input.all().map((item) => {\n  let body = item.json.body;\n  if (typeof body === 'string') {\n    try {\n      body = JSON.parse(body);\n    } catch (e) {\n      body = {};\n    }\n  }\n  if (body === null || typeof body !== 'object' || Array.isArray(body)) {\n    body = {};\n  }\n  return { json: { ...item.json, body } };\n});"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [0, 0],
      "id": "a1f3c0de-0001-4a10-9f01-c0ffee000001",
      "name": "Normalise payload"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "loose",
            "version": 2
          },
          "conditions": [
            {
              "id": "c0000001-0000-4000-8000-000000000001",
              "leftValue": "={{ $json.body._gotcha || '' }}",
              "rightValue": "",
              "operator": { "type": "string", "operation": "empty", "singleValue": true }
            },
            {
              "id": "c0000001-0000-4000-8000-000000000002",
              "leftValue": "={{ $json.body.email || '' }}",
              "rightValue": "",
              "operator": { "type": "string", "operation": "notEmpty", "singleValue": true }
            },
            {
              "id": "c0000001-0000-4000-8000-000000000003",
              "leftValue": "={{ $json.body.email || '' }}",
              "rightValue": "@",
              "operator": { "type": "string", "operation": "contains" }
            },
            {
              "id": "c0000001-0000-4000-8000-000000000004",
              "leftValue": "={{ $json.body.message || '' }}",
              "rightValue": "",
              "operator": { "type": "string", "operation": "notEmpty", "singleValue": true }
            },
            {
              "id": "c0000001-0000-4000-8000-000000000005",
              "leftValue": "={{ ($json.body.message || '').length }}",
              "rightValue": 5000,
              "operator": { "type": "number", "operation": "lt" }
            }
          ],
          "combinator": "and"
        },
        "looseTypeValidation": true,
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [220, 0],
      "id": "a1f3c0de-0002-4a10-9f01-c0ffee000002",
      "name": "Valid submission?"
    }
  ],
  "connections": {
    "Normalise payload": {
      "main": [[{ "node": "Valid submission?", "type": "main", "index": 0 }]]
    }
  },
  "pinData": {}
}
```

**Why a Code node first.** The form posts with `mode: 'no-cors'`, which forces
the request to `text/plain`, so `body` may arrive as a raw JSON *string* rather
than an object. An IF node reading `$json.body.email` against a string fails
every condition and routes **everything** to the false branch — silently killing
the CRM leg, which is worse than the exposure being fixed. `Normalise payload`
collapses both shapes to an object and preserves the rest of the item, so the
existing HTTP Request node's `$json.body.…` expressions keep working unchanged.

**How to paste it** (per `memory/reference_n8n_edit_workflows_via_node_json.md`):

1. `! cat <file> | pbcopy`
2. Click empty canvas in the workflow, ⌘V — both nodes arrive already wired to
   each other.
3. Drag two connectors: **Webhook → Normalise payload**, and
   **Valid submission? (true) → the existing HTTP Request node**.
4. Click **Publish**. An unpublished workflow rejects the production webhook
   silently — see `memory/reference_n8n_production_webhook_needs_publish.md`.

Leave the `false` branch unconnected: a rejected submission should do nothing.
Formspree still receives every submission independently, so nothing is lost.

`typeVersion: 2` on both nodes is deliberate — the lowest version that loads.
A higher-than-supported version shows "node version not supported"; a lower one
always loads.

Rate limiting is a second step and can wait; the validation removes the cheap
abuse.

## Technical Details

- `src/data/site.ts` — `crmWebhookUrl`, and the comment recording why Formspree forwarding is unavailable
- `src/components/ContactForm.astro` — `data-crm-webhook-url`, the `no-cors` fetch, the now-enforced honeypot
- n8n workflow — owner's UI only

## Acceptance Criteria

- [ ] n8n rejects a submission with `_gotcha` filled
- [ ] n8n rejects a submission missing `email` or `message`
- [ ] A real test submission still creates a Twenty CRM record
- [ ] Confirm what content type n8n actually receives
- [ ] Reconcile the `80f3d` / `94d1d` host discrepancy

## Work Log

### 2026-09-03 — Found during full-repo review
Security review confirmed the exposure in built HTML and that the honeypot was
never read. Also confirmed clean, so it is not re-audited: no secret has ever
been committed, `TINA_TOKEN` is absent from the deployed admin bundle, all nine
`set:html` sites trace to author-committed data, and fork PRs cannot reach secrets.

### 2026-09-03 — Recommendation corrected
First draft recommended Formspree server-side forwarding. That was wrong: the
repo already documents that the free plan cannot do it and that paid tiers were
declined — in a comment directly above the value being audited. Lesson worth
keeping: **when a finding concerns a configured value, read the comment attached
to it before proposing an alternative.** Rewritten around Option C, which is the
only one available at this budget, with the n8n node config ready to paste.

### 2026-09-05 — Two of the five criteria closed without touching n8n

**The `80f3d` / `94d1d` "discrepancy" is not one.** Both hostnames are live and
serve the *same* n8n service: `GET /rest/settings` returns a byte-identical
497-byte payload on both (sha256 `fde62406fb2a1982…`). This matches what
`memory/reference_railway_cli_session_quirks.md` already recorded — the `94d1d`
domain was auto-generated by the template at deploy time, `80f3d` was added
later via a manual `serviceDomainCreate` call and turned out to be redundant.

`site.ts` is correct as written, and not by luck: n8n's `WEBHOOK_URL` env var was
baked in at the auto-generated domain, so `94d1d` is the host whose URLs n8n
itself displays and honours. The architecture memory's framing — *"One of the two
is stale"* — was the wrong shape for the question. Neither is stale; they are
aliases, and only one of them is the one n8n believes in. Memory corrected.

**The content type is `text/plain`, and that follows from the code alone.**
`ContactForm.astro:95-100` sends `mode: 'no-cors'` with
`'Content-Type': 'application/json'`. Under `no-cors` the Fetch spec permits only
the three CORS-safelisted values (`application/x-www-form-urlencoded`,
`multipart/form-data`, `text/plain`), so the JSON header is dropped and the body
arrives as `text/plain;charset=UTF-8`. The body is still valid JSON text — which
is why this has been working, and working *by accident*: n8n's Webhook node
parses a JSON body regardless of the declared type.

Worth knowing before adding the IF node: the node reads `$json.body.…`, and that
path depends on how n8n parsed the request. Confirm it against one real execution
in n8n's log before trusting the field paths.

**Not done here, deliberately:** end-to-end confirmation needs either a live POST
(which writes a record into Twenty CRM) or a read of n8n's execution log behind
the owner's login. Neither is something to do unasked.

Criteria now met: the host reconciliation, and the content-type question as far as
it can be answered from this side. The three remaining all require the n8n UI.

### 2026-09-05 — The one-node config would have killed the lead path

The IF node recommended above on 2026-09-03 read `$json.body._gotcha`,
`$json.body.email` and `$json.body.message` directly, with a note to "confirm
against one real submission before trusting the paths." That note was the whole
defect: it deferred the risk to the person least able to catch it, and the
failure mode is silent.

`mode: 'no-cors'` forces the request's Content-Type to `text/plain` regardless of
the header the page sets (only three CORS-safelisted values are permitted). So
n8n may deliver `body` as a raw JSON **string**. An IF node reading
`$json.body.email` against a string gets `undefined` on every condition, the
`and` combinator fails, and every submission — genuine ones included — routes to
the false branch. The CRM leg dies, nothing errors, and the site keeps reporting
success because the fetch is fire-and-forget with `.catch(() => {})`.

That is a worse outcome than the open endpoint this todo exists to close.

**Fixed by not needing the answer.** A `Normalise payload` Code node now runs
first and collapses both shapes to an object, so the guard is correct either way.
It spreads the rest of the item through unchanged, which means the existing HTTP
Request node's `$json.body.…` expressions keep working — inserting a node does
not rewrite what `$json` means downstream.

**Both nodes were executed before being handed over, not just read.** The Code
node's logic was extracted from the JSON and run against six payload shapes
(object, JSON string, non-JSON string, missing, null, array) — all six normalise
to an object. The five IF conditions were then evaluated against eleven payloads:

| Case | Passes guard |
|---|---|
| Genuine submission, body as object | ✅ |
| Genuine submission, body as JSON string | ✅ |
| Honeypot `_gotcha` filled | ❌ |
| Missing email / email without `@` / missing message | ❌ |
| 5000-character flood | ❌ |
| 4999 characters | ✅ |
| Empty POST from a scanner | ❌ |
| Garbage body | ❌ |
| CJK message | ✅ |

The CJK row is not decoration. This site publishes in four languages, and the
Tina slugify bug shipped precisely because a seven-case ASCII-only corpus looked
complete. A guard that silently dropped Chinese enquiries would have reproduced
that failure in a place with no test suite watching.

**Still requires the n8n UI**, and the three remaining acceptance criteria can
only be ticked there. Rate limiting remains a deliberate second step.

### 2026-09-05 — Closed. The P2 was sitting on top of a live P1.

Driving the n8n UI directly (browser automation, owner signed in) turned this
from a security hardening task into a data-loss repair.

**The contact form's CRM leg had never worked.** Execution ID#5 of 2026-08-26,
the "final end-to-end check", is preserved in n8n and shows it exactly:

| | |
|---|---|
| Webhook received | `content-type: text/plain;charset=UTF-8`, `sec-fetch-mode: no-cors` |
| `body` in the schema | typed `T` — a raw **string**, not an object |
| HTTP Request sent | `"firstName": "{{ $json.body.name }}"` |
| Twenty created | `firstName: empty`, `lastName: empty`, `primaryEmail: empty` |

`.name` on a string is `undefined`, which n8n renders into the template as an
empty string. So Twenty accepted the write, returned 200, and stored a blank
person. Ten days, every enquiry.

**Four independent layers each reported success**, which is why it survived: the
site showed its success message (the fetch is fire-and-forget with
`.catch(() => {})` and cannot observe the outcome by design), n8n logged
"Succeeded in 169ms" (Succeeded means "did not throw", not "did something"),
Twenty returned 200 and really did create a row, and the dashboard read 0%
failure rate. Nothing was red anywhere.

**Why every previous test passed.** curl, Postman and n8n's own test button all
send `application/json`, and under that Content-Type n8n parses the body into an
object and the chain works perfectly. The bug needs a real browser, because only
`no-cors` forces text/plain. The end-to-end test that "confirmed" this on
2026-08-26 exercised the one path production never takes.

**No leads were lost** — all five prior executions carry
`origin: http://localhost:4322`, the owner's own dev server. Nothing had come
through since. The next real enquiry would have vanished.

**The fix was already written, for a different reason.** `Normalise payload` was
built to make the guard independent of the body's shape; it turns out to be the
repair. The workflow is now four nodes:

    Webhook → Normalise payload → Valid submission? → (true) → HTTP Request

published as version "Parse the body, then validate". The false branch is
deliberately unconnected. The original two-node workflow is preserved at
`crm-workflow-BACKUP-20260905-154402.json` with its credential reference.

**Verified against the live system, not in simulation:**

- Execution ID#14 — honeypot filled: Webhook, Normalise and IF all green,
  **HTTP Request grey and never run**. Nothing reached Twenty. Same for missing
  email, email without `@`, and an empty `{}` POST.
- Execution ID#15 — a valid submission: all four nodes green, and Twenty
  returned `firstName: "Guard test — DELETE ME"`,
  `primaryEmail: guard-test-delete-me@example.com`. Populated, at last.
- The `body` field in the node schema is now an **object** with children where
  it was a bare `T` string. That single icon is the whole before/after.

Rejected payloads complete in 16–22ms against 114ms for one that reaches the
CRM, so the cheap abuse this todo was opened about now costs a fraction of a
request.

**Repo-side changes, so the far end cannot drift silently again:**

- `ContactForm.astro` now declares `Content-Type: text/plain;charset=UTF-8` —
  what is actually sent — instead of the `application/json` the browser had been
  discarding. Behaviour is identical; the difference is that the code no longer
  reads as though the receiver gets parsed JSON.
- `src/components/contact-form.test.ts`, 11 tests, the first coverage this
  component has ever had. It pins the Content-Type, `mode: 'no-cors'`, the
  `JSON.stringify` body, `Object.fromEntries` forwarding, Formspree as the path
  of record, and **every field name the n8n guard reads** — `_gotcha`, `email`,
  `message`, `name`, `_locale`. Renaming one of those rejects every submission
  at the guard with nothing reporting an error, so it is a cross-system contract
  with no other guard on it.
- Each test was falsified against a deliberately broken component before being
  kept, per todo 019. Six mutations, six failures; reverting the header to
  `application/json` — the original bug — fails the suite. The component was
  restored from a copy and confirmed byte-identical by sha256.

**All five acceptance criteria met.** Rate limiting remains a deliberate second
step: validation removes the cheap abuse, and the endpoint stays writable by
anyone, which is inherent to a static site (hard rule 4) rather than a defect.

**Left open, needing a decision, not a fix:** the HTTP Request body maps only
`name` and `email`. The `message` — the enquiry itself — is not sent to Twenty
at all, so a captured lead arrives with no indication of what was asked. Twenty's
`/rest/people` has no field for it; it wants a Note attached to the person, which
is a second API call and a second node. Raised with the owner 2026-09-05.

### 2026-09-06 — The `message` gap: researched, NOT yet shipped

Twenty's note model was read from the live workspace rather than guessed:

- A note is `POST /rest/notes` with `{ title, bodyV2: { markdown } }`. The body
  field is **`bodyV2.markdown`**, not `body` — a plain `body` is the older shape
  and is what produces `Error: Body must be a string`.
- Attaching it to a person is a **second** record: `POST /rest/noteTargets`
  linking a `noteId` to a person. Creating a note does not attach it.

So the workflow needs two more nodes after the existing `HTTP Request`:

    … → HTTP Request (create person) → Create enquiry note → Attach note to person

Draft config is at `n8n-enquiry-note.json`, carrying the same
`Header Auth account 2` credential (`o8lXCHb5oV98kD0v`) and `typeVersion: 4.5`.

**Two things in it are inferred, and it is NOT being handed over until they are
checked.** This todo already records one recommendation that shipped with "confirm
the paths before trusting them" attached, and that note was the defect: it moved
the risk onto the person least able to catch it, and the failure was silent.
Repeating it would be worse the second time.

| unknown | why it is not settled |
|---|---|
| the FK field name on `noteTargets` — `personId` or `targetPersonId` | the MCP tool exposes `targetPersonId`, but that may be tool sugar over the REST FK column |
| the response envelope of `POST /rest/notes` — `data.createNote.id` | inferred from `data.createPerson.id`, which *is* verified; consistent, but not observed |

Neither is readable without a token: `GET /open-api/core` is unauthenticated but
returns only the 5 KB prose description, and the full schema at
`/rest/open-api/core` is 403. `find_many_note_targets` returns **0 records**, so
there is no existing row to read the field names off either.

**Settling it costs one throwaway write** — create a note against the
`Guard test — DELETE ME` person (already marked for deletion), read it back with
`select: ['*']` to see the real field names, then delete it. Not done unasked,
consistent with the position taken on the earlier CRM write.

Until then the enquiry text still does not reach Twenty: a captured lead has a
name and an email and no indication of what was asked.

### 2026-09-06 — The `message` gap is closed, and the guess was wrong

The probe settled both unknowns, and it is worth recording that **the inferred
field name was incorrect**. A throwaway note was created against the
`Guard test — DELETE ME` person, read back with `select: ['*']`, and deleted. The
stored record's real fields:

    noteId · targetPersonId · targetCompanyId · targetOpportunityId · position

It is **`targetPersonId`**, not `personId`. The MCP's naming was not tool sugar
over a shorter REST column, which is what the draft config had assumed. Shipping
that guess would have failed the link on every enquiry — and the failure would
have been quiet, because the person record is created by an earlier node that
would have gone on succeeding.

The note shape was confirmed at the same time: `title` plus
`bodyV2: { markdown }`. Twenty generates the `blocknote` representation itself
from the markdown, so sending markdown alone is correct.

**The workflow is now six nodes**, published as "Attach the enquiry message as a
Note":

    Webhook → Normalise payload → Valid submission? →(true)→ HTTP Request
            → Create enquiry note → Attach note to person

**Verified against the live system.** One test submission produced, in Twenty:

| record | content |
|---|---|
| person | `Note test — DELETE ME`, `note-test-delete-me@example.com` |
| note | title `Website enquiry — Note test — DELETE ME`; body carries the full message **with its newlines and paragraph break intact**, then a footer with the sender's email and `Language: es` from `_locale` |
| noteTarget | links that note to that person |

That last row also settles the final inference in this todo: the link resolved a
real person id, so `POST /rest/notes` does return `data.createNote.id`, matching
`data.createPerson.id`. Confirmed by observation rather than by consistency
argument.

**A process note.** Pasting the six-node workflow went wrong twice and both
failures were mine, not n8n's. The first paste *had* worked; the screenshot was
taken before it rendered, so a second paste produced a duplicate of every node.
Then a verification script crashed midway through printing the connection map —
n8n drops an empty `false` branch, so `main[1]` does not exist — and the partial
output looked exactly like a workflow missing its last two connections. Both were
resolved by reading state back rather than trusting a screenshot or a truncated
loop. **In a browser-driven edit, confirm by round-tripping the JSON, not by
looking at the canvas.**

All five acceptance criteria remain met, and the enquiry text now reaches the
CRM. Rate limiting is still a deliberate second step.
