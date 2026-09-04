import { defineConfig } from 'tinacms';
import {
  slugifyBlogFilename,
  DOCS_ROOT_INCLUDE,
  DOCS_SOLUTIONS_INCLUDE,
} from './utils';

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
 *  read them short of opening the repo: "Project Docs" for every `.md` at the
 *  repo root, and "Debugging Notes" for docs/solutions/. (Deliberately not
 *  enumerated — the list said "five" and there are six: CONTENT-STATUS.md is
 *  matched by the same glob, and its visibility here is the whole reason
 *  scripts/content-status.mjs writes it to the root.) Both are read/edit only —
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
            options: ['websites', 'search', 'consulting', 'ads'],
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
            // NO `required: true` HERE, and it is not an oversight.
            //
            // Adding it on 2026-09-04 changed the generated GraphQL type from
            // `[String]` to `[String!]!`, and `npx tinacms build` in deploy.yml
            // then refused to run:
            //
            //   [NON_BREAKING - FIELD_TYPE_CHANGED] Field 'Blog.tags' changed
            //   type from '[String]' to '[String!]!'
            //   Error: The local GraphQL schema doesn't match the remote
            //   GraphQL schema. (ERR_CLOUD_CHECK_FAILED)
            //
            // Tina Cloud holds the remote schema and did not pick the change up
            // on its own — three deploy runs failed, with "Last indexed at"
            // frozen. That blocks EVERY deploy, including the daily cron that
            // makes date-gated posts publish, so it is not a cost worth paying
            // for edit-time validation.
            //
            // The `ui.validate` below is kept: it gives the same editor-time
            // feedback and does NOT touch the GraphQL type. Astro's
            // z.array(...).min(1).max(3) remains the real enforcement.
            //
            // To restore `required: true`: update the schema in Tina Cloud
            // first (dashboard, owner's login), confirm the remote type is
            // `[String!]!`, then re-add it. See todos/020.
            description: '1–3 tags shown as pills on the post.',
            // The "1–3" above is a DESCRIPTION, which is documentation, not
            // validation. src/content.config.ts enforces
            // z.array(z.string()).min(1).max(3), so saving a post here with
            // none or four passed Tina and then failed the Astro BUILD — and
            // Tina commits straight to main, so that failure lands in CI (and
            // can block the scheduled publish) rather than in the editor.
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
            label: 'Hero image URL',
            description:
              'A direct image URL (e.g. an images.unsplash.com/photo-... link) — a real, relevant photo, not generic stock. See README for guidance.',
            // Astro enforces z.string().url(); "photo.jpg" saved fine here and
            // then failed the build. Same class as `tags` above.
            ui: {
              validate: (value?: string) => {
                if (!value) return undefined; // optional in the Astro schema too
                try {
                  new URL(value);
                  return undefined;
                } catch {
                  return 'Must be a full URL, starting with https://';
                }
              },
            },
          },
          {
            type: 'string',
            name: 'heroAlt',
            label: 'Hero image alt text',
            description: 'Required if a hero image is set — describe what’s in the photo.',
          },
          {
            type: 'string',
            name: 'heroCredit',
            label: 'Hero image credit',
            description: 'Photographer name/attribution.',
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
            options: ['en', 'es', 'zh-hans', 'zh-hant'],
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
              'The real URL slug for this post, in this language — not a literal translation of the English slug, the keyword-appropriate one for this language.',
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
