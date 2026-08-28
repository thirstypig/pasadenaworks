/**
 * ─────────────────────────────────────────────────────────────────────────
 *  GLOSSARY — plain-English definitions of the jargon this site uses.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  English only, on purpose: it exists so a small business owner reading
 *  the (English) service pages isn't left guessing what a term means.
 *  Keep every definition to 2-3 short sentences, no jargon inside the
 *  jargon explanation. If you can't explain it simply, the term probably
 *  doesn't belong on the site's own pages either.
 */

export interface GlossaryTerm {
  /** URL anchor, e.g. /glossary/#seo */
  id: string;
  term: string;
  definition: string;
}

export const glossary: GlossaryTerm[] = [
  {
    id: 'seo',
    term: 'SEO (Search Engine Optimization)',
    definition:
      "The work of getting your business to show up higher in Google's regular search results, without paying for ads. It covers things like your website's speed, your Google Business Profile, and whether your business's name, address, and phone number match everywhere online.",
  },
  {
    id: 'geo',
    term: 'GEO (Generative Engine Optimization)',
    definition:
      "The same idea as SEO, but for AI tools like ChatGPT, Google's AI answers, and Perplexity — the ones people now ask instead of typing into a search box. It's newer, and it relies on a lot of the same honest groundwork as SEO: accurate information, real reviews, and clear answers on your website.",
  },
  {
    id: 'google-business-profile',
    term: 'Google Business Profile',
    definition:
      "The free listing that shows up on the right side of Google search results and on Google Maps when someone looks up your business — hours, photos, reviews, directions. It's separate from your website, and it's often the very first thing a customer sees.",
  },
  {
    id: 'local-pack',
    term: 'Local Pack / Google Maps results',
    definition:
      'The group of three businesses with a little map that Google shows at the top when someone searches for something nearby, like "plumber near me." Landing in there sends a lot more customers your way than being further down the page.',
  },
  {
    id: 'organic-vs-paid',
    term: 'Organic search vs. paid ads',
    definition:
      "Organic results are the ones nobody paid for — they show up because Google (or an AI tool) decided they're the best answer. Paid ads are the ones marked \"Sponsored,\" where a business pays for every click. Organic takes longer to build but keeps working without an ongoing bill.",
  },
  {
    id: 'keyword',
    term: 'Keyword',
    definition:
      'The actual words someone types (or says) when they\'re searching — like "emergency plumber Pasadena." Building a page or writing an article around a real keyword means it can actually be found by the person asking that exact question.',
  },
  {
    id: 'reviews',
    term: 'Google reviews',
    definition:
      "The star ratings and comments customers leave on your Google Business Profile. They're one of the biggest factors in whether Google — and now AI tools — recommend you over a competitor, and they're free to earn, just not free to ignore.",
  },
  {
    id: 'integrations',
    term: 'Integrations (SaaS integrations)',
    definition:
      'Connecting your website or booking form to the other software you already use — your CRM, your calendar, your email list, your payment processor — so a lead or booking shows up there automatically instead of you copying it over by hand. "SaaS" just means software you pay for monthly and use in a browser, like most of these tools are.',
  },
  {
    id: 'workflow-automation',
    term: 'Workflow automation',
    definition:
      "A set-it-once rule that moves information between your tools without you doing it manually — e.g., a new contact-form submission automatically creates a lead in your CRM and sends you a text. It's not \"AI\" in any complicated sense, just plumbing that saves you the copy-paste.",
  },
];
