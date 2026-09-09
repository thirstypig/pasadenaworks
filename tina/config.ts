import { defineConfig } from 'tinacms';
import {
  slugifyBlogFilename,
  DOCS_ROOT_INCLUDE,
  DOCS_SOLUTIONS_INCLUDE,
} from './utils';
// Shared with src/i18n/ui.ts and the two build-step-free scripts. Tina compiles
// this file with its own esbuild pass, so plain ESM is what all three can read.
// See src/i18n/locales.mjs — this `options` list used to be a fourth hand-kept
// copy of the same four strings.
import { LOCALES } from '../src/i18n/locales.mjs';
// Same reasoning as LOCALES above, one file over: this `options` list was a
// fourth hand-kept copy of the four pillar names. See src/data/pillars.ts.
import { PILLARS } from '../src/data/pillars';
// Same reasoning again, one file over. `heroImage`'s rule lives in one place so
// this validator and the Astro schema cannot disagree — which they did, in
// opposite directions, from 2026-09-06 until 2026-09-07. See the field below.
import {
  isValidHeroImagePath,
  isProtocolRelative,
  hasTraversalSegment,
} from '../src/data/hero-image';
// And once more, for the credit link. Same reason: the Astro schema and this
// validator must not be able to disagree about what an Unsplash profile URL is.
import { isUnsplashProfileUrl, hasCreditNameWhenLinked } from '../src/data/hero-credit';
// And once more, for `slug`. Same class of drift as heroImage/heroCredit
// above: `slugifyBlogFilename` (below) derives the FILENAME from this value,
// but the frontmatter FIELD itself was saved verbatim with no validation — an
// editor typing "Website Costs" got a file at en/website-costs.md while the
// slug field held "Website Costs", which the Astro build's regex then rejects
// after Tina had already committed it straight to main.
import { isValidPostSlug } from '../src/data/post-slug.mjs';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  TINA CMS — browser-based admin for blog content.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Runs in LOCAL mode: `npm run admin` starts the Astro dev server wrapped
 *  by Tina's local backend. Visit http://localhost:3180/admin/index.html
 *  to edit posts in a real WYSIWYG UI — it writes straight to the .md
 *  files in src/content/blog/, same as editing them by hand. No account,
 *  no signup, no external service. Commit and push the changed files same
 *  as any other edit.
 *
 *  This schema is a mirror of src/content.config.ts. If you add or change
 *  a field there, update it here too — Tina and Astro's content
 *  collections don't share a schema automatically.
 *
 *  Posts live one directory per locale — src/content/blog/<locale>/<slug>.md
 *  (en / es / zh-hans / zh-hant) — not flat under src/content/blog/. The
 *  `filename.slugify` below reads the post's `locale` field and places new
 *  posts in the matching subfolder automatically.
 *
 *  Tina Cloud is connected (2026-08-27) — project "pasadenaworks" at
 *  app.tina.io, so people can also edit from a browser without your
 *  laptop running (e.g. from a phone, or a non-technical teammate), once
 *  the site is deployed with TINA_CLIENT_ID/TINA_TOKEN set. Not required
 *  for local editing — npm run admin still works with neither set.
 *
 *  Two more collections (2026-08-27) make the project's own markdown docs
 *  browsable/editable from the same admin, since there was nowhere else to
 *  read them short of opening the repo: "Project Docs" for the five root
 *  files (README, CLAUDE.md, CONTENT-PLAN.md, MASTER-PORTS.md, PORTS.md)
 *  and "Debugging Notes" for docs/solutions/. Both are read/edit only —
 *  create and delete are disabled so the CMS can't be used to add or
 *  remove a load-bearing file like CLAUDE.md by accident. This has nothing
 *  to do with ops.pasadenaworks.com, which is a separate Node service
 *  deployed on its own (deliberately not part of this public repo) — a
 *  docs viewer there would be a change to that other codebase, not this
 *  one.
 */
export default defineConfig({
  branch: 'main',

  // Set as GitHub Actions repo secrets for the live build, and in a local
  // .env (gitignored) if you want to test `npx tinacms build` yourself.
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  schema: {
    collections: [
      {
        name: 'blog',
        label: 'Blog Posts',
        path: 'src/content/blog',
        format: 'md',
        ui: {
          // Filename is the URL (src/content/blog/<slug>.md -> /blog/<slug>/)
          // — see the "write a keyword, not post-14" rule in README.md.
          filename: {
            readonly: false,
            slugify: slugifyBlogFilename,
          },
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
            description: 'SEO-targeted, ideally under 60 characters.',
          },
          {
            type: 'string',
            name: 'description',
            label: 'Meta description',
            required: true,
            ui: { component: 'textarea' },
            description: 'Shown in Google search results. Aim for 150–158 characters.',
          },
          {
            type: 'datetime',
            name: 'pubDate',
            label: 'Publish date',
            required: true,
          },
          {
            type: 'datetime',
            name: 'updatedDate',
            label: 'Updated date',
            description: 'Only set this when meaningfully revising an already-published post.',
          },
          {
            type: 'string',
            name: 'pillar',
            label: 'Pillar (which service this links to)',
            required: true,
            options: [...PILLARS],
          },
          {
            type: 'string',
            name: 'targetKeyword',
            label: 'Target keyword',
            required: true,
            description:
              'One search phrase this post targets. Not shown on the page — a note to yourself so you don’t write two posts competing for the same phrase.',
          },
          {
            type: 'string',
            name: 'author',
            label: 'Author',
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
            required: true,
            description: '1–3 tags shown as pills on the post.',
            /* The "1–3" above is DOCUMENTATION, not validation. Astro enforces
               z.array(z.string()).min(1).max(3), so saving with none or four
               passed Tina and failed the BUILD — and Tina commits straight to
               main, so that landed in CI rather than in the editor.

               `required` changes the GraphQL type ([String] -> [String!]!) and
               `validate` changes the Tina schema hash (the function is dropped
               by JSON.stringify but leaves `ui: {}` behind, a new key). BOTH
               therefore require tina/tina-lock.json to be regenerated and
               committed with this file — the lock IS the schema Tina Cloud
               serves. Omitting that broke every deploy on 2026-09-04. See
               docs/solutions/integration-issues/
               tina-lock-json-is-the-remote-schema-and-must-be-committed.md */
            ui: {
              validate: (value?: string[]) => {
                if (!value || value.length < 1) return 'Add at least one tag.';
                if (value.length > 3) return 'Three tags maximum.';
                return undefined;
              },
            },
          },
          {
            type: 'string',
            name: 'heroImage',
            label: 'Hero image path',
            description:
              'A path to an image in public/blog/, e.g. /blog/my-photo.jpg. Upload the file to the repo first. External URLs are rejected — see README.',
            // THIS VALIDATOR WAS ONCE THE EXACT INVERSE OF THE BUILD'S RULE.
            // It called `new URL(value)` and demanded a full https:// URL,
            // which was right while Astro enforced z.string().url(). PR #30
            // self-hosted the hero images on 2026-09-06 and flipped the Astro
            // rule to root-relative paths — and this side was not flipped with
            // it. For a day, Tina rejected every legal value and accepted the
            // one value that fails the build, while the description above told
            // editors to paste an images.unsplash.com link.
            //
            // That combination is worse than either half. Tina commits straight
            // to `main` with no PR gate, and `deploy.yml`'s cron is the only
            // thing that publishes a date-gated post — so an editor following
            // this field's own instructions turned the daily publish red.
            //
            // It now imports the rule instead of restating it, so the two ends
            // cannot drift again. The three checks are reported separately
            // because whoever pastes a bad value is not whoever wrote the
            // pattern; see src/data/hero-image.ts.
            ui: {
              validate: (value?: string) => {
                if (!value) return undefined; // optional in the Astro schema too
                if (isProtocolRelative(value)) {
                  return 'A path starting with // is an external image — use /blog/your-photo.jpg.';
                }
                if (hasTraversalSegment(value)) {
                  return 'No ".." segments — the path must point inside public/.';
                }
                if (!isValidHeroImagePath(value)) {
                  return 'Must be a path like /blog/your-photo.jpg (.jpg, .jpeg, .png, .webp or .avif). External URLs are not allowed.';
                }
                return undefined;
              },
            },
          },
          {
            type: 'string',
            name: 'heroAlt',
            label: 'Hero image alt text',
            description: 'Required if a hero image is set — describe what’s in the photo.',
            // The description above said "Required" for months and nothing
            // enforced it here, so a hero photo could be saved with no alt and
            // fail the build — the same prose-only constraint that
            // src/content.config.ts calls out at its `.refine()`. Not
            // `required: true`, which would demand alt text on posts that have
            // no hero image at all; this mirrors the Astro rule exactly, which
            // is conditional on heroImage.
            ui: {
              validate: (value: string | undefined, allValues?: { heroImage?: string }) => {
                if (!allValues?.heroImage) return undefined;
                if (!value?.trim()) {
                  return 'Required when a hero image is set — describe the photo for screen readers.';
                }
                return undefined;
              },
            },
          },
          {
            type: 'string',
            name: 'heroCredit',
            label: 'Hero image credit',
            description:
              'Photographer name/attribution. Required if a credit link is set — a link with no name renders no attribution at all.',
            // Mirrors the Astro schema's refine, through the same predicate,
            // for the reason the heroAlt field above gives: a constraint that
            // exists only as prose is not a constraint. Without this, Tina
            // saves the link-with-no-name state happily and the build fails
            // afterwards, which is a worse place to find out.
            ui: {
              validate: (value: string | undefined, allValues?: { heroCreditUrl?: string }) =>
                hasCreditNameWhenLinked(value, allValues?.heroCreditUrl)
                  ? undefined
                  : 'Required when a credit link is set — name the photographer, or clear the link.',
            },
          },
          {
            type: 'string',
            name: 'heroCreditUrl',
            label: 'Hero image credit link',
            description:
              'The photographer’s Unsplash profile, e.g. https://unsplash.com/@name. Required for images sourced through the Unsplash API; leave blank for older images. `npm run unsplash` prints this for you.',
            // Optional here exactly as in the Astro schema: the twenty images
            // that predate the API are covered by the plain Unsplash licence,
            // where attribution is appreciated but not required. Requiring it
            // would block editing any of those posts in Tina.
            //
            // The host check is strict because this value becomes an outbound
            // link on every rendering of the post, and it is typed here by
            // someone who is not reading this file. A lookalike such as
            // https://unsplash.com.evil.example/@x contains the literal string
            // "unsplash.com" and passes any `includes` check.
            ui: {
              validate: (value?: string) => {
                if (!value) return undefined;
                if (!isUnsplashProfileUrl(value)) {
                  return 'Must be an https link to an Unsplash profile, e.g. https://unsplash.com/@name.';
                }
                return undefined;
              },
            },
          },
          {
            type: 'boolean',
            name: 'draft',
            label: 'Draft (hidden from the live site)',
          },
          {
            type: 'string',
            name: 'locale',
            label: 'Language',
            required: true,
            options: [...LOCALES],
            description:
              'Which of the site\'s four languages this file is written in. Each translation of a post is its own file — set this before saving so the file lands in the right folder.',
          },
          {
            type: 'string',
            name: 'translationKey',
            label: 'Translation key',
            required: true,
            description:
              'Shared across every language\'s version of "the same" post, so the site can link between translations. Use a short stable id (e.g. "website-basics") — it never appears in a URL. Use the same value on every language version of this post.',
          },
          {
            type: 'string',
            name: 'slug',
            label: 'URL slug',
            required: true,
            description:
              'The real URL slug for this post, in this language — not a literal translation of the English slug, the keyword-appropriate one for this language. Lowercase letters, digits, and single hyphens only.',
            // Mirrors src/content.config.ts's POST_SLUG_PATTERN, for the same
            // reason as heroImage/heroCredit above — see the import comment.
            ui: {
              validate: (value?: string) => {
                if (!value) return undefined; // `required: true` already covers empty
                if (!isValidPostSlug(value)) {
                  return 'Lowercase letters, digits, and single hyphens only — no spaces, no capital letters, no punctuation.';
                }
                return undefined;
              },
            },
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
      },
      {
        name: 'docsRoot',
        label: 'Project Docs',
        path: '',
        format: 'md',
        // Non-recursive glob (no `**`) — only the docs actually at the repo
        // root, not every .md file in src/content/blog or node_modules.
        // NOTE: no `.md` here — Tina appends the format itself. See utils.ts.
        match: { include: DOCS_ROOT_INCLUDE },
        ui: {
          // Read/edit only — these are known, load-bearing files (CLAUDE.md
          // drives how Claude Code works in this repo; the others are the
          // README, the content calendar, and the port registry). Creating
          // or deleting root docs from here would be easy to do by
          // accident and hard to notice.
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: 'rich-text',
            name: 'body',
            label: 'Content',
            isBody: true,
          },
        ],
      },
      {
        name: 'docsSolutions',
        label: 'Debugging Notes (docs/solutions)',
        path: 'docs/solutions',
        format: 'md',
        match: { include: DOCS_SOLUTIONS_INCLUDE },
        ui: {
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: 'rich-text',
            name: 'body',
            label: 'Content',
            isBody: true,
          },
        ],
      },
    ],
  },
});
