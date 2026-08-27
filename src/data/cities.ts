import type { Locale } from '../i18n/ui';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CITY LANDING PAGE COPY — READ THIS BEFORE ADDING A CITY.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Near-identical pages with the city name swapped out are the classic
 *  "doorway page" pattern. Google indexes them and ranks none of them.
 *
 *  Every city here should name something real and specific about that
 *  city's commercial districts — not a generic paragraph with find/replace.
 *  If you don't actually know a city's streets and business districts,
 *  DON'T add it. Six honest pages beat twenty thin ones.
 *
 *  The body copy below was written by an AI assistant scaffolding this
 *  project without first-hand knowledge of each city's specific streets,
 *  storefronts, or commercial districts. It sticks to a small number of
 *  widely-documented, easily-verified landmarks (Old Pasadena, the
 *  Americana at Brand, etc.) and otherwise stays generic on purpose,
 *  rather than inventing specifics and presenting them as fact.
 *
 *  Two markers show up in the body arrays below:
 *  - `TODO`: still generic — no verified specifics have been researched
 *    or supplied yet. Don't delete until genuinely rewritten.
 *  - `RESEARCHED`: strengthened with real, sourced facts found via web
 *    search (not firsthand knowledge of the city). A reasonable first
 *    draft, but the owner — who actually works these cities — should
 *    still review and sharpen with anything that comes from experience,
 *    not a search result.
 *
 *  `cityLocales()` is what the routing and hreflang code call to find out
 *  which languages a given city page exists in. It reads directly from
 *  each city's `t` object, so a city that only defines `en` copy can only
 *  ever generate an English page — there is no way to accidentally claim
 *  a translation that doesn't exist.
 */

export interface CityCopy {
  /** Page <title> tag text. */
  title: string;
  /** One-line description shown on the city hub / used as meta description. */
  summary: string;
  /** Body paragraphs. A string starting with "<!--" is rendered as a raw
   *  HTML comment (invisible on the page, visible in "View Source") rather
   *  than as a visible paragraph — see CityBody.astro. */
  body: string[];
  meta: string;
}

export interface City {
  /** URL slug. Not translated — city names read the same across languages
   *  in the URL, only the surrounding path segments translate. */
  slug: string;
  /** Copy per locale. Only include a locale here if it is genuinely how
   *  customers in that city search — do not fill in all four "for
   *  consistency." */
  t: Partial<Record<Locale, CityCopy>>;
}

const TODO =
  '<!-- TODO(owner): replace with specific streets/landmarks you know from working this city -->';

/** Body copy strengthened with real, sourced facts (web research, not
 *  firsthand knowledge) on 2026-08-26. Still worth the owner's eye — swap
 *  in anything from actually working these cities that sharpens it. */
const RESEARCHED =
  '<!-- Researched via web search, not firsthand knowledge — verify against what you actually see day-to-day and refine. -->';

export const cities: City[] = [
  {
    slug: 'pasadena',
    t: {
      en: {
        title: 'Web design and local SEO for Pasadena businesses',
        summary:
          'Website and Google visibility work for shops, restaurants, and service businesses in Pasadena.',
        body: [
          RESEARCHED,
          'Pasadena has a dense, walkable downtown around Old Pasadena and Colorado Boulevard, alongside neighborhood commercial strips further out. A business here is often competing with a national chain a block away and a search result from three cities over — both of which a fast, clear website and a properly filled-out Google Business Profile help with directly.',
          "We work with Pasadena business owners on exactly that: a website that loads quickly on a phone, and a Google presence that actually reflects what you sell and where you are. If you're a Pasadena business owner, get in touch and tell us what you're seeing (or not seeing) in search results.",
        ],
        meta: 'Website design and local SEO for small businesses in Pasadena, CA. Fast, clear sites and Google visibility that brings in customers.',
      },
    },
  },
  {
    slug: 'altadena',
    t: {
      en: {
        title: 'Web design and local SEO for Altadena businesses',
        summary:
          'Website and Google visibility work for the independent businesses that make up Altadena.',
        body: [
          RESEARCHED,
          "Altadena's commercial heart has centered on Lake Avenue and Mariposa Street for over a century — a pharmacy on Lake Avenue has been open since 1926, making it the city's oldest continuously operating retail business. Altadena is unincorporated, though, so it doesn't have one dense downtown the way its neighbors do; its businesses are spread across a foothill community, which makes local search doubly important, since a customer can't just drive down one main street and see what's there.",
          "For an Altadena business, showing up correctly when someone searches nearby matters more than it would somewhere with a dense downtown. We build sites and Google presences that make sure you're the result people find.",
        ],
        meta: 'Website design and local SEO for small businesses in Altadena, CA. Get found by the customers already searching nearby.',
      },
    },
  },
  {
    slug: 'south-pasadena',
    t: {
      en: {
        title: 'Web design and local SEO for South Pasadena businesses',
        summary: 'Website and Google visibility work for South Pasadena small businesses.',
        body: [
          RESEARCHED,
          "South Pasadena's small downtown centers on Mission Street, a walkable strip of long-standing family businesses and newer arrivals near the Gold Line's Mission station. It's a small, largely residential city without the volume of passersby a bigger commercial strip gets, so local businesses depend heavily on being known and found by people who already live nearby rather than on regional foot traffic.",
          "If you run a business in South Pasadena, we can help make sure the basics — hours, location, what you actually do — are right everywhere a customer might look for them.",
        ],
        meta: 'Website design and local SEO for small businesses in South Pasadena, CA. Clear, accurate, easy for neighbors to find.',
      },
    },
  },
  {
    slug: 'glendale',
    t: {
      en: {
        title: 'Web design and local SEO for Glendale businesses',
        summary: 'Website and Google visibility work for Glendale small businesses.',
        body: [
          RESEARCHED,
          "Glendale has serious retail gravity — the Americana at Brand and the Glendale Galleria draw shoppers from well outside the city — which means an independent Glendale business is often competing for attention against much bigger, much better-funded storefronts a few minutes away. A clear website and strong local search presence are how a smaller business competes on being found, rather than on square footage.",
          "We work with Glendale business owners on exactly that: making sure your business shows up correctly and quickly when someone nearby is searching for what you do.",
        ],
        meta: 'Website design and local SEO for small businesses in Glendale, CA. Compete on being found, not on square footage.',
      },
    },
  },
  {
    slug: 'alhambra',
    t: {
      en: {
        title: 'Web design and local SEO for Alhambra businesses',
        summary: 'Website and Google visibility work for Alhambra small businesses, in English, Spanish, or Chinese.',
        body: [
          TODO,
          "Alhambra's Main Street and Valley Boulevard corridors carry a genuinely mixed customer base — English, Spanish, and Chinese speakers all searching for the same kinds of businesses, often in different languages. A website that only exists in English is quietly invisible to a meaningful share of the customers actually looking.",
          'We build Alhambra business sites in whichever languages your customers actually search in, with a matching Google Business Profile, so you show up for all of them — not just the ones searching in English.',
        ],
        meta: 'Website design and local SEO for small businesses in Alhambra, CA — in English, Spanish, and Chinese.',
      },
      es: {
        title: 'Diseño web y SEO local para negocios en Alhambra',
        summary:
          'Sitios web y visibilidad en Google para negocios pequeños en Alhambra, en inglés, español o chino.',
        body: [
          TODO,
          'Los corredores de Main Street y Valley Boulevard en Alhambra tienen clientes que buscan en inglés, español y chino, muchas veces para el mismo tipo de negocio. Un sitio que solo existe en inglés es prácticamente invisible para una buena parte de esos clientes.',
          'Construimos sitios para negocios de Alhambra en los idiomas que sus clientes realmente usan para buscar, junto con un perfil de Google Business que coincide, para que aparezca ante todos ellos y no solo ante quienes buscan en inglés.',
        ],
        meta: 'Diseño web y SEO local para negocios pequeños en Alhambra, CA — en inglés, español y chino.',
      },
      'zh-hans': {
        title: '阿罕布拉市（Alhambra）商家网站设计与本地推广',
        summary: '为阿罕布拉市的小型企业提供英文、西班牙文、中文的网站和谷歌推广服务。',
        body: [
          TODO,
          '阿罕布拉市的 Main Street 和 Valley Boulevard 一带，客人用英文、西班牙文、中文搜索的都有，而且经常是在找同一类生意。如果网站只有英文版，很大一部分客人根本看不到您。',
          '我们会根据您客人真正使用的语言来做网站，并配合相应语言的谷歌商家资料，让您不只是被讲英文的客人找到。',
        ],
        meta: '为阿罕布拉市（Alhambra）小型企业提供英文、西班牙文、中文网站设计与本地谷歌推广服务。',
      },
      'zh-hant': {
        title: '阿罕布拉市（Alhambra）商家網站設計與在地推廣',
        summary: '為阿罕布拉市的小型企業提供英文、西班牙文、中文的網站和 Google 推廣服務。',
        body: [
          TODO,
          '阿罕布拉市的 Main Street 和 Valley Boulevard 一帶，客人用英文、西班牙文、中文搜尋的都有，而且經常是在找同一類生意。如果網站只有英文版，很大一部分客人根本看不到您。',
          '我們會根據您客人真正使用的語言來做網站，並搭配相應語言的 Google 商家檔案，讓您不只是被講英文的客人找到。',
        ],
        meta: '為阿罕布拉市（Alhambra）小型企業提供英文、西班牙文、中文網站設計與在地 Google 推廣服務。',
      },
    },
  },
  {
    slug: 'arcadia',
    t: {
      en: {
        title: 'Web design and local SEO for Arcadia businesses',
        summary:
          'Website and Google visibility work for Arcadia small businesses, in English or Traditional Chinese.',
        body: [
          TODO,
          "Arcadia is home to Santa Anita Park and the Westfield Santa Anita shopping center, which pull in visitors from across the region — and it also has a large Chinese-speaking business community, much of it Traditional-Chinese-reading rather than Simplified. Getting that distinction right, rather than defaulting to Simplified Chinese or skipping Chinese entirely, is a small thing that a lot of websites get wrong.",
          "We build Arcadia business sites in English and Traditional Chinese, matched to how your actual customers read, plus the Google Business Profile work that makes sure you show up locally in both languages.",
        ],
        meta: 'Website design and local SEO for small businesses in Arcadia, CA — in English and Traditional Chinese.',
      },
      'zh-hant': {
        title: '亞凱迪亞（Arcadia）商家網站設計與在地推廣',
        summary: '為亞凱迪亞的小型企業提供英文和繁體中文的網站與 Google 推廣服務。',
        body: [
          TODO,
          '亞凱迪亞有聖塔安妮塔賽馬場（Santa Anita Park）和 Westfield Santa Anita 購物中心，吸引不少外地訪客；當地也有不少講中文的商家客群，而且多半習慣閱讀繁體中文而非簡體中文。網站语言選對繁體還是簡體，是很多網站容易忽略、卻很重要的小細節。',
          '我們為亞凱迪亞的商家製作英文和繁體中文網站，配合您客人真正習慣閱讀的文字，並處理 Google 商家檔案，讓您在兩種語言的在地搜尋中都能被看到。',
        ],
        meta: '為亞凱迪亞（Arcadia）小型企業提供英文與繁體中文網站設計與在地 Google 推廣服務。',
      },
    },
  },
  {
    slug: 'monrovia',
    t: {
      en: {
        title: 'Web design and local SEO for Monrovia businesses',
        summary: 'Website and Google visibility work for Monrovia small businesses.',
        body: [
          RESEARCHED,
          "Monrovia's Old Town district along Myrtle Avenue is a genuine draw — a walkable strip of independent shops and restaurants that pulls people in from outside the city, especially for the weekly Friday Night street fair. That kind of foot traffic makes an accurate Google Business Profile (hours, photos, whether you're actually open right now) worth more here than in a city without a comparable destination strip.",
          "We help Monrovia business owners make sure their website and Google presence match what's actually true on Myrtle Avenue and beyond — right hours, right menu or services, easy to reach.",
        ],
        meta: 'Website design and local SEO for small businesses in Monrovia, CA. Built for a city where foot traffic and Google visibility both matter.',
      },
    },
  },
  {
    slug: 'san-marino',
    t: {
      en: {
        title: 'Web design and local SEO for San Marino businesses',
        summary: 'Website and Google visibility work for the small, mostly-professional business community in San Marino.',
        body: [
          RESEARCHED,
          "San Marino's one real commercial corridor is Huntington Drive, and there isn't much more retail than that — the city is small, largely residential, and doesn't have a downtown the way its neighbors do. Most San Marino business owners are professionals (medical, dental, legal, financial, and similar practices) rather than retail. For that kind of business, a clear, trustworthy website and an accurate Google listing matter more than foot traffic ever will, since almost every new client finds you by searching first.",
          "We build sites and Google presences for San Marino businesses that are built to be found by name and by service, not by walking past a storefront.",
        ],
        meta: 'Website design and local SEO for small businesses and practices in San Marino, CA. Built to be found by search, not foot traffic.',
      },
    },
  },
  {
    slug: 'monterey-park',
    t: {
      en: {
        title: 'Web design and local SEO for Monterey Park businesses',
        summary:
          'Website and Google visibility work for Monterey Park small businesses, in English or Chinese.',
        body: [
          TODO,
          "Monterey Park has one of the oldest and most established Chinese-American business communities in the San Gabriel Valley, and a meaningful share of customers here search in Chinese, not English. A business whose website and Google Business Profile only exist in English is invisible to a real part of its own customer base.",
          'We build Monterey Park business sites with real Chinese-language pages — not a Google Translate widget bolted onto an English site — plus the Google Business Profile work to match, so you show up for the customers actually searching for you.',
        ],
        meta: 'Website design and local SEO for small businesses in Monterey Park, CA — in English and Chinese.',
      },
      'zh-hans': {
        title: '蒙特利公园（Monterey Park）商家网站设计与本地推广',
        summary: '为蒙特利公园的小型企业提供英文和中文的网站与谷歌推广服务。',
        body: [
          TODO,
          '蒙特利公园是圣盖博谷历史最悠久的华人商业社区之一，很多客人直接用中文搜索，而不是英文。如果网站和谷歌商家资料只有英文版，相当一部分客人根本看不到您。',
          '我们为蒙特利公园的商家制作真正的中文网站——不是在英文网站上加一个谷歌翻译插件——并配合谷歌商家资料，让真正在搜索您的客人找得到您。',
        ],
        meta: '为蒙特利公园（Monterey Park）小型企业提供英文和中文网站设计与本地谷歌推广服务。',
      },
    },
  },
];

/** The locales a given city has real, published copy for. This is the only
 *  source of truth routing/hreflang code should use — never assume a city
 *  has all four locales. */
export function cityLocales(city: City): Locale[] {
  return (Object.keys(city.t) as Locale[]).filter((locale) => Boolean(city.t[locale]));
}

export function cityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
