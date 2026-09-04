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
 *  One marker shows up in the body arrays below:
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
          "We work with Pasadena business owners on precisely that combination: a website that loads quickly on a phone, alongside a Google presence genuinely reflecting what you sell and where you are situated. If you own a Pasadena business, get in touch and describe what you are seeing, or failing to see, in your search results.",
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
          "For an Altadena business, appearing correctly when somebody searches nearby matters considerably more than it would in a community with a dense downtown, precisely because there is no main street to walk. We construct sites and Google presences designed to ensure you are the result those people actually find.",
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
          RESEARCHED,
          "Alhambra's two commercial corridors have different personalities. Main Street near Garfield Avenue has been a center of commerce since 1895 and today mixes dining, retail, and the multiplex at Renaissance Plaza; Valley Boulevard — once part of old U.S. Route 60 before the freeways were built — is where car dealerships, Asian-owned banks, markets, and restaurants concentrate, serving a customer base that's as likely to search in Chinese or Spanish as in English.",
          'We construct Alhambra business sites in whichever languages your customers genuinely search in, accompanied by a correspondingly translated Google Business Profile, so that you appear for all of them rather than exclusively for those searching in English.',
        ],
        meta: 'Website design and local SEO for small businesses in Alhambra, CA — in English, Spanish, and Chinese.',
      },
      es: {
        title: 'Diseño web y SEO local para negocios en Alhambra',
        summary:
          'Sitios web y visibilidad en Google para negocios pequeños en Alhambra, en inglés, español o chino.',
        body: [
          RESEARCHED,
          'Los dos corredores comerciales de Alhambra tienen personalidades distintas. Main Street, cerca de Garfield Avenue, es un centro comercial desde 1895 y hoy combina restaurantes, tiendas y el cine de Renaissance Plaza; Valley Boulevard — antes parte de la antigua Ruta 60 de EE. UU., antes de que se construyeran las autopistas — es donde se concentran concesionarios de autos, bancos, mercados y restaurantes de propietarios asiáticos, con una clientela que busca tanto en chino o español como en inglés.',
          'Construimos sitios para negocios de Alhambra en los idiomas que sus clientes genuinamente emplean al buscar, acompañados de un Perfil de Negocio de Google correspondientemente traducido, de manera que usted aparezca ante todos ellos antes que exclusivamente ante quienes buscan en inglés.',
        ],
        meta: 'Diseño web y SEO local para negocios pequeños en Alhambra, CA — en inglés, español y chino.',
      },
      'zh-hans': {
        title: '阿罕布拉市（Alhambra）商家网站设计与本地推广',
        summary: '为阿罕布拉市的小型企业提供英文、西班牙文、中文的网站和谷歌推广服务。',
        body: [
          RESEARCHED,
          '阿罕布拉市的两条主要商业街风格不同。Main Street 靠近 Garfield Avenue 一带，从 1895 年就是商业中心，现在有餐厅、零售店，还有 Renaissance Plaza 的电影院；Valley Boulevard 以前是美国 60 号公路的一段，如今聚集了不少车行、亚裔银行、市场和餐厅，客人用中文或西班牙文搜索的和用英文搜索的一样多。',
          '我们会依据您的客人真正使用的语言来建设网站，并且搭配相应语言的谷歌商家资料；如此一来，能够找到您的便不仅限于讲英文的客人。',
        ],
        meta: '为阿罕布拉市（Alhambra）小型企业提供英文、西班牙文、中文网站设计与本地谷歌推广服务。',
      },
      'zh-hant': {
        title: '阿罕布拉市（Alhambra）商家網站設計與在地推廣',
        summary: '為阿罕布拉市的小型企業提供英文、西班牙文、中文的網站和 Google 推廣服務。',
        body: [
          RESEARCHED,
          '阿罕布拉市的兩條主要商業街風格不同。Main Street 靠近 Garfield Avenue 一帶，從 1895 年就是商業中心，現在有餐廳、零售店，還有 Renaissance Plaza 的電影院；Valley Boulevard 以前是美國 60 號公路的一段，如今聚集了不少車行、亞裔銀行、市場和餐廳，客人用中文或西班牙文搜尋的和用英文搜尋的一樣多。',
          '我們會依據您的客人真正使用的語言來建置網站，並且搭配相應語言的 Google 商家檔案；如此一來，能夠找到您的便不僅限於講英文的客人。',
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
          RESEARCHED,
          "Arcadia's downtown got its start in 1887 around 1st Avenue and Huntington Drive — a handful of buildings from the 1920s and '30s still stand near that original corner, and Huntington Drive itself later became part of old Route 66. Baldwin Avenue grew into a second commercial strip west of downtown starting in the 1920s. The city is also home to Santa Anita Park and the Westfield Santa Anita shopping center, which pull in visitors from across the region — and to a large Chinese-speaking business community, much of it Traditional-Chinese-reading rather than Simplified. Getting that distinction right, rather than defaulting to Simplified Chinese or skipping Chinese entirely, is a small thing that a lot of websites get wrong.",
          "We build Arcadia business sites in English and Traditional Chinese, matched to how your actual customers read, plus the Google Business Profile work that makes sure you show up locally in both languages.",
        ],
        meta: 'Website design and local SEO for small businesses in Arcadia, CA — in English and Traditional Chinese.',
      },
      'zh-hant': {
        title: '亞凱迪亞（Arcadia）商家網站設計與在地推廣',
        summary: '為亞凱迪亞的小型企業提供英文和繁體中文的網站與 Google 推廣服務。',
        body: [
          RESEARCHED,
          '亞凱迪亞市中心始於 1887 年，最早的商業區在 1st Avenue 與 Huntington Drive 交叉口一帶，附近至今還留有幾棟 1920、30 年代的老建築；Huntington Drive 後來也成為舊 66 號公路的一段。至於西邊的 Baldwin Avenue，則自 1920 年代起發展成另一條商業街。此外，亞凱迪亞還有聖塔安妮塔賽馬場（Santa Anita Park）與 Westfield Santa Anita 購物中心，吸引不少外地訪客；當地也有不少講中文的商家客群，而且多半習慣閱讀繁體中文而非簡體中文。就此而言，網站語言究竟選用繁體或簡體，是許多網站容易忽略、然而相當重要的一項細節。',
          '我們為亞凱迪亞的商家建置英文與正體中文網站，依循您的客人真正習慣閱讀的字體。此外，我們並一併處理 Google 商家檔案；如此一來，您在兩種語言的在地搜尋之中皆能被看見，而非僅限於其中一種。',
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
          "We construct sites and Google presences for San Marino businesses deliberately built to be discovered by name and by service, rather than by somebody happening to walk past a storefront.",
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
          RESEARCHED,
          "Monterey Park's Garvey Avenue and Atlantic Boulevard corridor has been commercial ground for a century, and Laura Scudder invented the sealed bag of potato chips near that intersection in 1926. Today it is best known as the heart of one of the oldest and most established Chinese-American business communities in the San Gabriel Valley, with close to 400 storefronts and an annual Lunar New Year festival along Garvey. A meaningful share of customers here search in Chinese rather than in English, which means a business whose website and Google Business Profile exist only in English is invisible to a genuine portion of its own customer base.",
          'We build Monterey Park business sites with genuine Chinese-language pages rather than a Google Translate widget bolted onto an English site, accompanied by the Google Business Profile work to match, so that you appear for the customers who are actually searching for you.',
        ],
        meta: 'Website design and local SEO for small businesses in Monterey Park, CA — in English and Chinese.',
      },
      'zh-hans': {
        title: '蒙特利公园（Monterey Park）商家网站设计与本地推广',
        summary: '为蒙特利公园的小型企业提供英文和中文的网站与谷歌推广服务。',
        body: [
          RESEARCHED,
          '蒙特利公园的 Garvey Avenue 和 Atlantic Boulevard 一带早在上世纪就是商业地带——1926 年，Laura Scudder 就是在这个路口附近发明了密封袋装薯片——但如今这里更为人熟知的身份，是圣盖博谷历史最悠久、最成熟的华人商业社区之一，Garvey 沿线聚集了近 400 家商户，每年还会举办华人新年庆典。很多客人直接用中文搜索，而不是英文，如果网站和谷歌商家资料只有英文版，相当一部分客人根本看不到您。',
          '我们为蒙特利公园的商家建设真正的中文页面，而非在英文网站上外挂一个谷歌翻译插件；此外，我们同时处理相应的谷歌商家资料，如此真正在搜索您的客人方能找到您。',
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
