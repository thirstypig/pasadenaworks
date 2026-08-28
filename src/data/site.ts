/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SITE SETTINGS — change these before you launch.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const site = {
  name: 'Pasadena Works',
  domain: 'pasadenaworks.com',
  url: 'https://pasadenaworks.com',

  /* Shown on the contact page and in the schema markup. */
  email: 'hello@pasadenaworks.com',
  phone: '+1-434-373-0080',
  phoneDisplay: '(434) 373-0080',

  /* Where the contact form posts to.
     GitHub Pages is static — it cannot receive form submissions itself.
     Sign up at https://formspree.io (free tier is fine), create a form,
     and paste the endpoint here. Web3Forms and Tally work the same way. */
  formEndpoint: 'https://formspree.io/f/xppavjne',

  /* Optional second destination for contact-form submissions, fired
     alongside formEndpoint. Formspree's free plan can't forward
     submissions anywhere on its own, and Zapier/Make both paywall
     webhooks on their free tiers too — so this points at a self-hosted
     n8n workflow (Railway) instead: a Webhook trigger node forwards
     each submission into Twenty CRM via its REST API. Leave blank to
     skip — the form still works and still emails you via Formspree
     either way. */
  crmWebhookUrl:
    'https://n8n-production-94d1d.up.railway.app/webhook/15ada5a1-922a-4702-aa88-35a8911f0332',

  /* Public Cal.com booking page for the free 30-min consultation.
     Self-hosted on Railway — see the ops panel for the admin URL.
     Cal.com auto-translates this page based on the visitor's browser
     language, so one URL works across all four site locales. */
  bookingUrl: 'https://schedule.pasadenaworks.com/pasadenaworks/consultation',

  /* Cities you serve. These drive the local landing pages and the schema
     markup that helps you show up in "near me" searches. */
  serviceArea: [
    'Pasadena',
    'Altadena',
    'South Pasadena',
    'Glendale',
    'Alhambra',
    'Arcadia',
    'Monrovia',
    'San Marino',
    'Monterey Park',
    'Los Angeles',
  ],

  social: {
    linkedin: '',
    instagram: '',
  },

  /* GA4 Measurement ID (format "G-XXXXXXXXXX"). Leave blank to keep
     analytics off entirely — CookieConsent.astro and Base.astro both
     check this and render nothing at all when it's empty, so there's no
     half-wired banner asking for consent to a script that isn't there.
     To get one: analytics.google.com → Admin → Create Property → name it
     "Pasadena Works" → add a Web data stream for https://pasadenaworks.com
     → it gives you the Measurement ID. Recommended: under Admin > Data
     Settings > Data Collection, turn OFF Google Signals — keeps this to
     plain traffic analytics instead of ad-personalization data sharing,
     which matters for the CCPA "sale/sharing" disclosure threshold. */
  gaMeasurementId: 'G-RQ3WJ09KXS',
} as const;
