import type { CitySlug } from './cities';
import type { Locale } from '../i18n/ui';

/**
 * The city's name in the reader's own language.
 *
 * `cityDisplayName()` in `cities.ts` is locale-blind — it title-cases the slug
 * — which is right for a URL or an English page and wrong inside Chinese prose.
 * Before this, the Chinese data strips read `在 Alhambra 登記執業` while every
 * other string on the same page wrote `阿罕布拉（Alhambra）`, and the English-only
 * form also landed in the panel's `aria-label`, so a screen reader got it too.
 *
 * THE CHINESE FORMS ARE NOT INVENTED HERE. Each is lifted from the title
 * already shipping in `city-copy/zh-hans.ts` and `city-copy/zh-hant.ts`, which
 * write `為帕薩迪納（Pasadena）…`. Taking them from the published copy rather
 * than transliterating afresh is what stops a page carrying two different
 * Chinese names for the same city; `city-names.test.ts` asserts that each one
 * still appears in that locale's own title.
 *
 * Spanish keeps the English name: these are California places and Spanish
 * copy on this site already writes them that way ("consultorios … en
 * South Pasadena").
 */
export const CITY_NAMES: Record<Locale, Record<CitySlug, string>> = {
  en: {
    pasadena: 'Pasadena',
    altadena: 'Altadena',
    'south-pasadena': 'South Pasadena',
    glendale: 'Glendale',
    alhambra: 'Alhambra',
    arcadia: 'Arcadia',
    monrovia: 'Monrovia',
    'san-marino': 'San Marino',
    'monterey-park': 'Monterey Park',
    'san-gabriel': 'San Gabriel',
  },
  es: {
    pasadena: 'Pasadena',
    altadena: 'Altadena',
    'south-pasadena': 'South Pasadena',
    glendale: 'Glendale',
    alhambra: 'Alhambra',
    arcadia: 'Arcadia',
    monrovia: 'Monrovia',
    'san-marino': 'San Marino',
    'monterey-park': 'Monterey Park',
    'san-gabriel': 'San Gabriel',
  },
  'zh-hans': {
    pasadena: '帕萨迪纳',
    altadena: '艾塔迪那',
    'south-pasadena': '南帕萨迪纳',
    glendale: '格兰岱',
    alhambra: '阿罕布拉',
    arcadia: '亚凯迪亚',
    monrovia: '蒙罗维亚',
    'san-marino': '圣玛利诺',
    'monterey-park': '蒙特利公园',
    'san-gabriel': '圣盖博',
  },
  'zh-hant': {
    pasadena: '帕薩迪納',
    altadena: '艾塔迪那',
    'south-pasadena': '南帕薩迪納',
    glendale: '格蘭岱',
    alhambra: '阿罕布拉',
    arcadia: '亞凱迪亞',
    monrovia: '蒙羅維亞',
    'san-marino': '聖瑪利諾',
    'monterey-park': '蒙特利公園',
    'san-gabriel': '聖蓋博',
  },
};

export function cityName(slug: CitySlug, locale: Locale): string {
  return CITY_NAMES[locale][slug];
}
