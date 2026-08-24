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
  phone: '+1-626-555-0142',
  phoneDisplay: '(626) 555-0142',

  /* Where the contact form posts to.
     GitHub Pages is static — it cannot receive form submissions itself.
     Sign up at https://formspree.io (free tier is fine), create a form,
     and paste the endpoint here. Web3Forms and Tally work the same way. */
  formEndpoint: 'https://formspree.io/f/REPLACE_ME',

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
} as const;
