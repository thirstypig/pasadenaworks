# Port registry — pasadenaworks's own block

> 📍 **Canonical registry: `~/Projects/MASTER-PORTS.md`** (outside this repo).
> 🗓️ This copy trimmed 2026-09-04.

## Why this file is not the full mirror

Every other project keeps a byte-identical copy of the canonical registry at its
root. **This repo does not, on purpose: it is public.** The full registry names
~22 projects along with their stacks, hosting, and third-party services
(Stripe / Supabase / Retell / Railway hosts) — none of which this repo needs and
none of which belongs in a public repository.

That is the same reasoning that removed the `registry/` folder on 2026-08-28
(`docs/RESOLVED.md`). That change set the two root-level copies aside as
"unrelated", but they carried the same table, so the exposure survived the fix
that was meant to end it. The registry's own changelog had already flagged the
concern on 2026-08-27 and left it as the owner's call; the `registry/` deletion
was that call. This completes it.

**Keep the canonical file complete.** Nothing here replaces it — update
`~/Projects/MASTER-PORTS.md` first, as always, then mirror to the other projects'
roots. Only this repo's mirror is reduced.

## This project's reserved block

| Product / Service                   | Frontend | API  | WebSocket | PostgreSQL | Redis | Notes |
|-------------------------------------|----------|------|-----------|------------|-------|-------|
| **pasadenaworks**                   | 3180     | —    | —         | —          | —     | Astro marketing site, static, GitHub Pages at pasadenaworks.com. `npm run dev` / `npm run preview` are pinned to `-p 3180`. |
| **ops-panel** (ops.pasadenaworks.com) | 3181   | —    | —         | —          | —     | Password-gated internal dashboard, `~/Projects/ops-panel`. Assigned 2026-08-31 from this block rather than opening a new one. |

**Reserved range: 3180–3189 / 4180–4189, PG 5456, Redis 6395.**

## Rules that still apply

- Do **not** let `dev` / `preview` fall back to Astro's default **4321** — that
  port is reserved by another project in the canonical registry, and running both
  at once collides.
- Need another port here? Take it from 3180–3189 / 4180–4189, then update this
  file **and** `~/Projects/MASTER-PORTS.md`.
- Never pick a free-looking port without checking the canonical registry.
