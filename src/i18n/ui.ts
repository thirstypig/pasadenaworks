/**
 * ─────────────────────────────────────────────────────────────────────────
 *  LOCALE REGISTRY + UI STRINGS
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  English is the default/root locale — it does not appear in URLs.
 *  Spanish and both Chinese variants live on prefixed paths (/es/, /zh-hans/,
 *  /zh-hant/).
 *
 *  Adding a language: add it to LOCALES, add a strings block below, then add
 *  its copy to services.ts and home.ts. TypeScript will point at every spot
 *  you missed.
 */

// The list itself lives in locales.mjs — plain ESM, because two build-step-free
// scripts and Tina's separate esbuild pass all need to read it too. Re-exported
// here so `import { LOCALES } from '@/i18n/ui'` keeps working everywhere.
export { LOCALES, TRANSLATED_LOCALES } from './locales.mjs';
import { LOCALES, DEFAULT_LOCALE as SHARED_DEFAULT_LOCALE } from './locales.mjs';

export type Locale = (typeof LOCALES)[number];

// Re-annotated rather than re-declared: the value comes from locales.mjs, and
// the `: Locale` here is what fails the typecheck if that file's default ever
// stops being one of its own locales.
export const DEFAULT_LOCALE: Locale = SHARED_DEFAULT_LOCALE;

/** BCP-47 tag used in <html lang> and hreflang attributes. */
export const HTML_LANG: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  'zh-hans': 'zh-Hans',
  'zh-hant': 'zh-Hant',
};

/** Human-readable name of each language, in its own language. Used as the
 *  accessible name (aria-label) on the language switcher's links — the
 *  visible text there is the shorter LOCALE_ABBR instead. */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  'zh-hans': '简体中文',
  'zh-hant': '繁體中文',
};

/** Compact abbreviation for the language switcher, so it doesn't crowd the
 *  header. EN/ES are the obvious two-letter codes; the Chinese variants use
 *  their own native shorthand (简/繁, "simplified"/"traditional") rather
 *  than a Latin code — that's the actual convention Chinese-reading users
 *  recognize, and a Latin reader doesn't need to parse it anyway since it's
 *  not their language. */
export const LOCALE_ABBR: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  'zh-hans': '简',
  'zh-hant': '繁',
};

export interface UIStrings {
  nav: {
    home: string;
    services: string;
    blog: string;
    contact: string;
    bookCall: string;
  };
  buttons: {
    getInTouch: string;
    send: string;
    viewService: string;
    backToServices: string;
    backToBlog: string;
    backToCities: string;
  };
  endCta: {
    heading: string;
    cta: string;
  };
  form: {
    name: string;
    email: string;
    message: string;
    /** Shown under the message box. The form posts to Formspree, n8n and the
     *  CRM, none of which is covered by a business associate agreement, so
     *  patient details must not be typed into it. */
    messageHint: string;
    send: string;
    sending: string;
    success: string;
    error: string;
  };
  footer: {
    rights: string;
    serviceAreaBlurb: string;
    explore: string;
    citiesWeServe: string;
  };
  hub: {
    servicesDescription: string;
    servicesIntro: string;
    citiesTitle: string;
    citiesDescription: string;
    citiesIntro: string;
    blogDescription: string;
    /** Heading above a service's deliverables list. NOT a button label —
     *  the localized pages used `buttons.viewService` here by mistake. */
    whatYouGet: string;
    /** Heading above a city page's list of sources. */
    citySources: string;
    /** Data-strip heading. `{city}` is replaced with the city name. */
    cityStripHeading: string;
    /** Row labels on the data strip. Clinicians registered in the city. */
    cityStripPrimaryCare: string;
    cityStripDentists: string;
    cityStripOptometrists: string;
    cityStripAcupuncturists: string;
    cityStripPhysicalTherapists: string;
    /** Label above the two language shares. */
    cityStripAtHome: string;
    cityStripSpanish: string;
    cityStripChinese: string;
    /** Hospital rows. `{n}` is a count; the list of names follows. */
    cityStripHospitals: string;
    cityStripNearbyHospitals: string;
    cityStripNoHospital: string;
    /** Caption label on the city hero photo: `<label>: <name> - <license>`. */
    cityPhotoLabel: string;
    /** Appended for share-alike licenses, which require saying it was changed. */
    cityPhotoResized: string;
  };
  misc: {
    mainNav: string;
    skipToContent: string;
    switchToLightMode: string;
    switchToDarkMode: string;
    cookieNotice: string;
    cookieAccept: string;
    cookieDecline: string;
    cookieSettings: string;
    /** Hero-image photo credit, in two slots because the photographer's name
     *  and "Unsplash" are both LINKS: `<by> <name> <between> <Unsplash>`.
     *  Rendered with `{' '}` around each link, which is also the space Chinese
     *  requires on either side of inline Latin. */
    photoCreditBy: string;
    photoCreditBetween: string;
    /** The pre-API form, for the 80 images covered by the plain Unsplash
     *  license, which requires no link. Carries its own separator: Chinese
     *  takes a full-width colon and no following space, Latin a space. */
    photoCreditPlain: string;
  };
}

export const ui: Record<Locale, UIStrings> = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      blog: 'Blog',
      contact: 'Contact',
      bookCall: 'Book a call',
    },
    buttons: {
      getInTouch: 'Get in touch',
      send: 'Send',
      viewService: 'View service',
      backToServices: 'Back to services',
      backToBlog: 'Back to blog',
      backToCities: 'All cities',
    },
    endCta: {
      heading: 'Ready to fix this?',
      cta: 'See how it works',
    },
    form: {
      name: 'Name',
      email: 'Email',
      message: 'Message',
      messageHint: 'Please don’t include patient names or health details.',
      send: 'Send',
      sending: 'Sending…',
      success: 'Thanks — your message is on its way. We’ll get back to you soon.',
      error: 'Something went wrong. Please try again or email us directly.',
    },
    footer: {
      rights: 'All rights reserved.',
      serviceAreaBlurb: 'New patients and a smoother front office for independent health practices, based in the San Gabriel Valley.',
      explore: 'Explore',
      citiesWeServe: 'Cities we serve',
    },
    hub: {
      whatYouGet: 'What you get',
      citySources: 'Sources',
      cityStripHeading: 'Registered in {city}',
      cityStripPrimaryCare: 'Primary care',
      cityStripDentists: 'Dentists',
      cityStripOptometrists: 'Optometrists',
      cityStripAcupuncturists: 'Acupuncturists',
      cityStripPhysicalTherapists: 'Physical therapists',
      cityStripAtHome: 'Spoken at home',
      cityStripSpanish: 'Spanish',
      cityStripChinese: 'Chinese',
      cityStripHospitals: 'General acute care hospitals',
      cityStripNearbyHospitals: 'Nearby',
      cityStripNoHospital: 'No general acute care hospital in the city',
      cityPhotoLabel: 'Photo',
      cityPhotoResized: 'resized',
      servicesDescription:
        'A practice checkup, office digitization, and more new patients, for independent medical, dental, and eye care practices throughout Southern California.',
      servicesIntro: 'Start with the checkup; what it finds decides what comes next.',
      citiesTitle: 'Cities we work in',
      // 150–158 characters, the same band the city pages' own metas are held
      // to, and it leads with what the pages offer rather than with
      // "Consulting" — the vague noun the site was repositioned away from.
      // A couple of cities plus the valley, not all ten: the list was what
      // pushed the old English hub description to 184 characters, where Google
      // truncated the tail of it.
      citiesDescription:
        'New patients and a smoother front office for independent medical, dental, and eye care practices in Pasadena, Alhambra, Arcadia and the San Gabriel Valley.',
      citiesIntro:
        'We work with independent practices across the San Gabriel Valley, and each city page starts from that city’s own clinician registry and Census figures rather than from a template.',
      // Practices are named alongside the other local businesses, not instead
      // of them: the 68 posts are general small-business topics and nine are
      // retail-specific, so a description promising practice-specific articles
      // would advertise a corpus that does not exist.
      blogDescription:
        'Plain-spoken articles on websites, local search, business decisions, and paid ads for practices and other small businesses in the San Gabriel Valley.',
    },
    misc: {
      mainNav: 'Main navigation',
      skipToContent: 'Skip to content',
      switchToLightMode: 'Switch to light mode',
      switchToDarkMode: 'Switch to dark mode',
      cookieNotice:
        'We use analytics cookies to see how people use this site. No ad tracking, no selling your data.',
      cookieAccept: 'OK',
      cookieDecline: 'Decline',
      cookieSettings: 'Cookie settings',
      photoCreditBy: 'Photo by',
      photoCreditBetween: 'on',
      photoCreditPlain: 'Photo: ',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      services: 'Servicios',
      blog: 'Blog',
      contact: 'Contacto',
      bookCall: 'Agenda una llamada',
    },
    buttons: {
      getInTouch: 'Contáctenos',
      send: 'Enviar',
      viewService: 'Ver servicio',
      backToServices: 'Volver a servicios',
      backToBlog: 'Volver al blog',
      backToCities: 'Todas las ciudades',
    },
    endCta: {
      heading: '¿Listo para arreglar esto?',
      cta: 'Vea cómo funciona',
    },
    form: {
      name: 'Nombre',
      email: 'Correo electrónico',
      message: 'Mensaje',
      messageHint: 'Por favor, no incluya nombres de pacientes ni datos de salud.',
      send: 'Enviar',
      sending: 'Enviando…',
      success: 'Gracias — tu mensaje va en camino. Te responderemos pronto.',
      error: 'Algo salió mal. Inténtalo de nuevo o escríbenos directamente.',
    },
    footer: {
      rights: 'Todos los derechos reservados.',
      serviceAreaBlurb: 'Pacientes nuevos y una recepción más fluida para consultorios de salud independientes, con base en el Valle de San Gabriel.',
      explore: 'Explorar',
      citiesWeServe: 'Ciudades que atendemos',
    },
    hub: {
      whatYouGet: 'Lo que incluye',
      citySources: 'Fuentes',
      cityStripHeading: 'Registrados en {city}',
      cityStripPrimaryCare: 'Medicina general',
      cityStripDentists: 'Dentistas',
      cityStripOptometrists: 'Optometristas',
      cityStripAcupuncturists: 'Acupunturistas',
      cityStripPhysicalTherapists: 'Fisioterapeutas',
      cityStripAtHome: 'Se habla en casa',
      cityStripSpanish: 'Español',
      cityStripChinese: 'Chino',
      cityStripHospitals: 'Hospitales de cuidados agudos generales',
      cityStripNearbyHospitals: 'Cerca',
      cityStripNoHospital: 'Sin hospital de cuidados agudos generales en la ciudad',
      cityPhotoLabel: 'Foto',
      cityPhotoResized: 'redimensionada',
      servicesDescription:
        'Revisión integral, digitalización del consultorio y más pacientes nuevos para consultorios médicos, dentales y de optometría del sur de California.',
      servicesIntro: 'Empiece por la revisión; lo que encuentre decidirá qué sigue.',
      citiesTitle: 'Ciudades donde trabajamos',
      // Names two cities rather than three: asserting LESS than the English is
      // allowed, asserting more is not, and dropping "independientes" to fit
      // all three would have widened the audience claim instead of narrowing it.
      citiesDescription:
        'Pacientes nuevos y una recepción más fluida para consultorios médicos, dentales y de optometría independientes en Pasadena, Arcadia y el Valle de San Gabriel.',
      citiesIntro:
        'Trabajamos con consultorios independientes en todo el Valle de San Gabriel, y cada página de ciudad parte del registro de profesionales y de las cifras del Censo de esa ciudad, no de una plantilla.',
      blogDescription:
        'Artículos claros y directos sobre sitios web, búsqueda local, decisiones de negocio y publicidad paga para consultorios y otros negocios pequeños en el Valle de San Gabriel.',
    },
    misc: {
      mainNav: 'Navegación principal',
      skipToContent: 'Saltar al contenido',
      switchToLightMode: 'Cambiar a modo claro',
      switchToDarkMode: 'Cambiar a modo oscuro',
      cookieNotice:
        'Usamos cookies analíticas para ver cómo se usa este sitio. Sin rastreo publicitario, sin vender tus datos.',
      cookieAccept: 'Aceptar',
      cookieDecline: 'Rechazar',
      cookieSettings: 'Preferencias de cookies',
      photoCreditBy: 'Foto de',
      photoCreditBetween: 'en',
      photoCreditPlain: 'Foto: ',
    },
  },
  'zh-hans': {
    nav: {
      home: '首页',
      services: '服务',
      blog: '博客',
      contact: '联系我们',
      bookCall: '预约通话',
    },
    buttons: {
      getInTouch: '联系我们',
      send: '发送',
      viewService: '查看服务',
      backToServices: '返回服务列表',
      backToBlog: '返回博客',
      backToCities: '所有城市',
    },
    endCta: {
      heading: '准备好解决这个问题了吗？',
      cta: '看看怎么做',
    },
    form: {
      name: '姓名',
      email: '电子邮箱',
      message: '留言',
      messageHint: '请勿填写患者姓名或健康信息。',
      send: '发送',
      sending: '发送中…',
      success: '谢谢，您的留言已送出，我们会尽快回复。',
      error: '发生错误，请重试，或直接发邮件联系我们。',
    },
    footer: {
      rights: '版权所有。',
      serviceAreaBlurb: '以圣盖博谷为基地，为独立诊所带来新患者与更顺畅的前台运作。',
      explore: '探索',
      citiesWeServe: '服务城市',
    },
    hub: {
      whatYouGet: '服务内容',
      citySources: '资料来源',
      cityStripHeading: '在 {city} 登记执业',
      cityStripPrimaryCare: '基层医疗',
      cityStripDentists: '牙医',
      cityStripOptometrists: '验光师',
      cityStripAcupuncturists: '针灸师',
      cityStripPhysicalTherapists: '物理治疗师',
      cityStripAtHome: '在家使用的语言',
      cityStripSpanish: '西班牙语',
      cityStripChinese: '中文',
      cityStripHospitals: '综合急症医院',
      cityStripNearbyHospitals: '邻近',
      cityStripNoHospital: '市内没有综合急症医院',
      cityPhotoLabel: '照片',
      cityPhotoResized: '已调整尺寸',
      servicesDescription: '为南加州各地的独立医疗、牙科与眼科诊所提供经营诊断、诊所数字化与新患者开发服务。',
      servicesIntro: '先从经营诊断开始，诊断的结果将决定下一步。',
      citiesTitle: '我们服务的城市',
      citiesDescription: '为帕萨迪纳、阿罕布拉、亚凯迪亚等圣盖博谷城市的独立医疗、牙科与眼科诊所带来新患者与更顺畅的前台运作。',
      citiesIntro: '我们为圣盖博谷各地的独立诊所提供服务，每个城市页面都以该市自己的 CMS NPI 登记与人口普查数据为起点，而不是套用同一个模板。',
      blogDescription: '写给圣盖博谷诊所和其他小生意老板看的文章，说大白话，聊网站、本地搜索、经营决策和付费广告。',
    },
    misc: {
      mainNav: '主导航',
      skipToContent: '跳到正文',
      switchToLightMode: '切换到浅色模式',
      switchToDarkMode: '切换到深色模式',
      cookieNotice: '我们使用分析类 Cookie，以了解本网站的使用情况。不做广告追踪，也不会出售您的信息。',
      cookieAccept: '同意',
      cookieDecline: '拒绝',
      cookieSettings: 'Cookie 设置',
      photoCreditBy: '照片由',
      photoCreditBetween: '拍摄，来自',
      photoCreditPlain: '照片：',
    },
  },
  'zh-hant': {
    nav: {
      home: '首頁',
      services: '服務',
      blog: '部落格',
      contact: '聯絡我們',
      bookCall: '預約通話',
    },
    buttons: {
      getInTouch: '聯絡我們',
      send: '傳送',
      viewService: '查看服務',
      backToServices: '返回服務列表',
      backToBlog: '返回部落格',
      backToCities: '所有城市',
    },
    endCta: {
      heading: '準備好解決這個問題了嗎？',
      cta: '看看怎麼做',
    },
    form: {
      name: '姓名',
      email: '電子郵件',
      message: '留言',
      messageHint: '請勿填寫病患姓名或健康資訊。',
      send: '傳送',
      sending: '傳送中…',
      success: '謝謝，您的留言已送出，我們將盡快回覆。',
      error: '發生錯誤，請重試，或直接以電子郵件與我們聯絡。',
    },
    footer: {
      rights: '版權所有。',
      serviceAreaBlurb: '以聖蓋博谷為據點，為獨立診所帶來新病患與更順暢的櫃檯運作。',
      explore: '探索',
      citiesWeServe: '服務城市',
    },
    hub: {
      whatYouGet: '服務內容',
      citySources: '資料來源',
      cityStripHeading: '在 {city} 登記執業',
      cityStripPrimaryCare: '基層醫療',
      cityStripDentists: '牙醫',
      cityStripOptometrists: '驗光師',
      cityStripAcupuncturists: '針灸師',
      cityStripPhysicalTherapists: '物理治療師',
      cityStripAtHome: '在家使用的語言',
      cityStripSpanish: '西班牙文',
      cityStripChinese: '中文',
      cityStripHospitals: '綜合急症醫院',
      cityStripNearbyHospitals: '鄰近',
      cityStripNoHospital: '市內沒有綜合急症醫院',
      cityPhotoLabel: '照片',
      cityPhotoResized: '已調整尺寸',
      servicesDescription: '為南加州各地的獨立醫療、牙科與眼科診所提供經營診斷、診所數位化與新病患開發服務。',
      servicesIntro: '先從經營診斷開始，診斷的結果將決定下一步。',
      citiesTitle: '我們服務的城市',
      citiesDescription: '為帕薩迪納、阿罕布拉、亞凱迪亞等聖蓋博谷城市的獨立醫療、牙科與眼科診所帶來新病患與更順暢的櫃檯運作。',
      citiesIntro: '我們為聖蓋博谷各地的獨立診所提供服務，每個城市頁面都以該市自己的 CMS NPI 登錄與人口普查資料為起點，而不是套用同一套模板。',
      blogDescription: '寫給聖蓋博谷診所與其他小生意老闆看的文章，說白話，聊網站、在地搜尋、經營決策與付費廣告。',
    },
    misc: {
      mainNav: '主導覽',
      skipToContent: '跳到主要內容',
      switchToLightMode: '切換到淺色模式',
      switchToDarkMode: '切換到深色模式',
      cookieNotice: '我們使用分析用的 Cookie，藉此瞭解本網站的使用情況，不做廣告追蹤，也不會出售您的資訊。',
      cookieAccept: '接受',
      cookieDecline: '拒絕',
      cookieSettings: 'Cookie 設定',
      photoCreditBy: '照片由',
      photoCreditBetween: '拍攝，來自',
      photoCreditPlain: '照片：',
    },
  },
};
