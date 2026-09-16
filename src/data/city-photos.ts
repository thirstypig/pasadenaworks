import type { CitySlug } from './cities';
import type { Locale } from '../i18n/ui';

/**
 * The hero photograph for each city page, and what using it obliges us to print.
 *
 * WHY THIS IS NOT `hero-credit.ts`. That module exists for blog posts and is
 * shaped entirely around Unsplash's API guidelines — it validates that a credit
 * URL's host is `unsplash.com` and appends Unsplash referral parameters. These
 * photographs come from Wikimedia Commons under Creative Commons and public
 * domain terms, which oblige different things, so the two cannot share a type
 * without one of them lying about the other.
 *
 * ALL TEN FILES ARE SELF-HOSTED under `public/cities/`. `hero-image.ts` rejects
 * external and protocol-relative URLs by design and the same rule applies here:
 * do not hotlink Wikimedia, whose originals run 1.6-19 MB.
 *
 * The credit renders inside a `<figcaption>`, never a bare `<p>`. `mainProse()`
 * in `scripts/readability.mjs` already drops figcaptions, so a caption is
 * excluded from the reading-level sample for free; a bare paragraph would drop
 * a six-word sentence into a ten-sentence sample, which is exactly the defect
 * that back-links and bulleted lists caused twice before.
 */
export interface CityPhoto {
  /** Path under `public/`. Self-hosted, never an external URL. */
  src: string;
  /** Rendered width x height of the file on disk. */
  width: number;
  height: number;
  /** Photographer, exactly as Wikimedia records them. */
  author: string;
  /** License name as published, e.g. "CC BY-SA 4.0". Reproduced verbatim. */
  license: string;
  /** Canonical license deed. `null` for public domain and CC0, which need none. */
  licenseUrl: string | null;
  /** The Commons file page, so a reader can check the license themselves. */
  sourceUrl: string;
  /**
   * True for share-alike licenses. The page must then also state that the
   * image was modified — every file here was cropped to 3:2 and resized — and
   * our resized copy stays under the same license.
   */
  shareAlike: boolean;
  /** No credit line at all: public domain or CC0. */
  public: boolean;
  /** Alt text per locale. Required for all four; a city page ships in four. */
  alt: Record<Locale, string>;
}

export const CITY_PHOTOS: Record<CitySlug, CityPhoto> = {
  pasadena: {
    src: '/cities/pasadena.jpg',
    width: 1216,
    height: 810,
    author: 'Xurble',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Rose_Bowl_Stadium_in_Pasadena_from_Flickr_182952103.jpg',
    shareAlike: false,
    public: false,
    alt: {
      en: "The Rose Bowl's south facade, its green script wordmark and red rose above Gate A.",
      es: 'La fachada sur del Rose Bowl, con su rótulo en letra cursiva verde y una rosa roja sobre la Puerta A.',
      'zh-hans': '帕萨迪纳玫瑰碗体育场南立面，A 号门上方是绿色手写体字标和一朵红玫瑰。',
      'zh-hant': '帕薩迪納玫瑰碗體育場南側立面，A 號門上方為綠色手寫體字標與一朵紅玫瑰。',
    },
  },
  altadena: {
    src: '/cities/altadena.jpg',
    width: 1216,
    height: 810,
    author: 'Geographer',
    license: 'CC BY 2.5',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.5/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Christmas_Tree_Lane.jpg',
    shareAlike: false,
    public: false,
    alt: {
      en: 'Christmas Tree Lane in Altadena, a row of mature deodar cedars along Santa Rosa Avenue.',
      es: 'Christmas Tree Lane en Altadena, una hilera de cedros deodar maduros a lo largo de Santa Rosa Avenue.',
      'zh-hans': '艾塔迪那的圣诞树大道，圣罗莎大道两旁排列着成年雪松。',
      'zh-hant': '艾塔迪那的聖誕樹大道，聖羅莎大道兩側排列著成年雪松。',
    },
  },
  'south-pasadena': {
    src: '/cities/south-pasadena.jpg',
    width: 1216,
    height: 810,
    author: 'South Pasadena Photographer SALAAM ALLAH',
    license: 'Public domain',
    licenseUrl: null,
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:LACMTA_Metro_Gold_Line_at_South_Pasadena.jpg',
    shareAlike: false,
    public: true,
    alt: {
      en: 'A Metro light-rail train arriving at the South Pasadena station at dusk.',
      es: 'Un tren ligero del Metro llegando al anochecer a la estación de South Pasadena.',
      'zh-hans': '黄昏时分，一列地铁轻轨列车驶入南帕萨迪纳车站。',
      'zh-hant': '黃昏時分，一列地鐵輕軌列車駛入南帕薩迪納車站。',
    },
  },
  glendale: {
    src: '/cities/glendale.jpg',
    width: 1216,
    height: 810,
    author: 'Alexis Doine',
    license: 'CC0',
    licenseUrl: null,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Bloomingdale's,_Glendale,_California.JPG",
    shareAlike: false,
    public: true,
    alt: {
      en: "The Bloomingdale's building at the Americana at Brand in Glendale.",
      es: "El edificio de Bloomingdale's en el centro comercial Americana at Brand, en Glendale.",
      'zh-hans': "格兰岱 Americana at Brand 购物中心内的 Bloomingdale's 大楼。",
      'zh-hant': "格蘭岱 Americana at Brand 購物中心的 Bloomingdale's 大樓。",
    },
  },
  alhambra: {
    src: '/cities/alhambra.jpg',
    // The one file below the site's 1216px corpus width. Its Commons original
    // is 605x605 and the upload history confirms that is the photographer's
    // own maximum, so there is nothing larger to fetch. Kept at native size
    // rather than upscaled, which would only look soft. Replace it if a
    // larger photograph of the arch is ever taken.
    width: 605,
    height: 403,
    author: 'Jengod',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Alhambra_Los_Angeles_California_United_States_Moorish-style_arch.jpg',
    shareAlike: true,
    public: false,
    alt: {
      en: 'The Moorish gateway arch on West Valley Boulevard in Alhambra, lettered ALHAMBRA across the top.',
      es: 'El arco de entrada de estilo morisco en West Valley Boulevard, en Alhambra, con la palabra ALHAMBRA en la parte superior.',
      'zh-hans': '阿罕布拉西谷大道上的摩尔式门拱，上方刻有 ALHAMBRA 字样。',
      'zh-hant': '阿罕布拉西谷大道上的摩爾式門拱，上方刻有 ALHAMBRA 字樣。',
    },
  },
  arcadia: {
    src: '/cities/arcadia.jpg',
    width: 1216,
    height: 810,
    author: 'Lisa Andres',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:2009_Breeders_Cup_venue_(4086915683).jpg',
    shareAlike: false,
    public: false,
    alt: {
      en: 'The grandstand at Santa Anita Park in Arcadia.',
      es: 'La tribuna del hipódromo Santa Anita Park, en Arcadia.',
      'zh-hans': '亚凯迪亚圣塔安妮塔赛马场的看台。',
      'zh-hant': '亞凱迪亞聖塔安妮塔賽馬場的看台。',
    },
  },
  monrovia: {
    src: '/cities/monrovia.jpg',
    width: 1216,
    height: 810,
    author: 'City of Monrovia',
    license: 'CC0',
    licenseUrl: null,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Old_Town_Monrovia.jpg',
    shareAlike: false,
    public: true,
    alt: {
      en: "An aerial view over Old Town Monrovia's historic commercial district.",
      es: 'Vista aérea del distrito comercial histórico de Old Town Monrovia.',
      'zh-hans': '蒙罗维亚老城历史商业区的航拍视图。',
      'zh-hant': '蒙羅維亞老城歷史商業區的空拍畫面。',
    },
  },
  'san-marino': {
    src: '/cities/san-marino.jpg',
    width: 1216,
    height: 810,
    author: 'Daderot',
    license: 'CC0',
    licenseUrl: null,
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Chinese_garden_-_Huntington_Botanical_Gardens_-_San_Marino,_CA_-.jpg',
    shareAlike: false,
    public: true,
    alt: {
      en: 'The Chinese Garden at the Huntington in San Marino, with its stone bridge over the lake.',
      es: 'El Jardín Chino de la Huntington, en San Marino, con su puente de piedra sobre el lago.',
      'zh-hans': '圣玛利诺亨廷顿图书馆的中国园林，石桥横跨湖面。',
      'zh-hant': '聖瑪利諾杭亭頓圖書館的中國園林，石橋橫跨湖面。',
    },
  },
  'monterey-park': {
    src: '/cities/monterey-park.jpg',
    width: 1216,
    height: 810,
    author: 'Nandaro',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:20140629-0023_Atlantic_Times_Square.JPG',
    shareAlike: true,
    public: false,
    alt: {
      en: 'The Atlantic Times Square development on Atlantic Boulevard in Monterey Park.',
      es: 'El complejo Atlantic Times Square en Atlantic Boulevard, Monterey Park.',
      'zh-hans': '蒙特利公园大西洋大道上的 Atlantic Times Square 综合体。',
      'zh-hant': '蒙特利公園大西洋大道上的 Atlantic Times Square 綜合體。',
    },
  },
  'san-gabriel': {
    src: '/cities/san-gabriel.jpg',
    width: 1216,
    height: 810,
    author: 'Robert A. Estremo',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Mission_San_Gabriel_4-15-05_6611.JPG',
    shareAlike: true,
    public: false,
    alt: {
      en: 'The south wall and bell campanario of Mission San Gabriel Arcángel.',
      es: 'El muro sur y el campanario de la Misión San Gabriel Arcángel.',
      'zh-hans': '圣盖博天使长传教站的南墙与钟墙。',
      'zh-hant': '聖蓋博天使長傳教站的南牆與鐘牆。',
    },
  },
};
