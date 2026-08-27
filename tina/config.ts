import { defineConfig } from 'tinacms';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  TINA CMS — browser-based admin for blog content.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Runs in LOCAL mode: `npm run admin` starts the Astro dev server wrapped
 *  by Tina's local backend. Visit http://localhost:4321/admin/index.html
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
 *  To let people edit from a browser without your laptop running (e.g.
 *  from a phone, or a non-technical teammate), Tina Cloud is the next
 *  step: sign up at tina.io, connect this GitHub repo, and set
 *  clientId/token below. Not required for local editing.
 */
export default defineConfig({
  branch: 'main',

  // Uncomment and fill in after connecting this repo at app.tina.io, if
  // you want browser-based editing without running the site locally.
  // clientId: process.env.TINA_CLIENT_ID,
  // token: process.env.TINA_TOKEN,

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
            slugify: (values) => {
              const locale = values?.locale || 'en';
              const base = (values?.title || 'untitled')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
              return `${locale}/${base}`;
            },
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
            description: '1–3 tags shown as pills on the post.',
          },
          {
            type: 'string',
            name: 'heroImage',
            label: 'Hero image URL',
            description:
              'A direct image URL (e.g. an images.unsplash.com/photo-... link) — a real, relevant photo, not generic stock. See README for guidance.',
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
    ],
  },
});
