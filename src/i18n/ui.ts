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

export const LOCALES = ['en', 'es', 'zh-hans', 'zh-hant'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

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
  };
  misc: {
    mainNav: string;
    skipToContent: string;
    switchToLightMode: string;
    switchToDarkMode: string;
    cookieNotice: string;
    cookieAccept: string;
    cookieDecline: string;
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
      send: 'Send',
      sending: 'Sending…',
      success: 'Thanks — your message is on its way. We’ll get back to you soon.',
      error: 'Something went wrong. Please try again or email us directly.',
    },
    footer: {
      rights: 'All rights reserved.',
      serviceAreaBlurb: 'Serving small businesses in Pasadena and the San Gabriel Valley.',
      explore: 'Explore',
      citiesWeServe: 'Cities we serve',
    },
    hub: {
      whatYouGet: 'What you get',
      servicesDescription:
        'Websites, local SEO, business consulting, and paid ads for small businesses in Pasadena and the San Gabriel Valley.',
      servicesIntro: 'Four services, ordered by what matters most first.',
      citiesTitle: 'Cities we work in',
      citiesDescription:
        'Website and local SEO work for small businesses across Pasadena and the San Gabriel Valley.',
      citiesIntro:
        'We work with small businesses across the San Gabriel Valley. Pick your city for what matters there specifically.',
      blogDescription:
        'Plain-spoken articles on websites, local search, business decisions, and paid ads for small business owners in the San Gabriel Valley.',
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
      send: 'Enviar',
      sending: 'Enviando…',
      success: 'Gracias — tu mensaje va en camino. Te responderemos pronto.',
      error: 'Algo salió mal. Inténtalo de nuevo o escríbenos directamente.',
    },
    footer: {
      rights: 'Todos los derechos reservados.',
      serviceAreaBlurb: 'Atendemos a negocios pequeños en Pasadena y el Valle de San Gabriel.',
      explore: 'Explorar',
      citiesWeServe: 'Ciudades que atendemos',
    },
    hub: {
      whatYouGet: 'Lo que incluye',
      servicesDescription:
        'Sitios web, SEO local, asesoría de negocios y publicidad paga para negocios pequeños en Pasadena y el Valle de San Gabriel.',
      servicesIntro: 'Cuatro servicios, ordenados por lo que más importa primero.',
      citiesTitle: 'Ciudades donde trabajamos',
      citiesDescription:
        'Sitios web y SEO local para negocios pequeños en Pasadena y el Valle de San Gabriel.',
      citiesIntro:
        'Trabajamos con negocios pequeños en todo el Valle de San Gabriel. Elige tu ciudad para ver lo que importa ahí específicamente.',
      blogDescription:
        'Artículos claros y directos sobre sitios web, búsqueda local, decisiones de negocio y publicidad paga para dueños de negocios pequeños en el Valle de San Gabriel.',
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
      send: '发送',
      sending: '发送中…',
      success: '谢谢，您的留言已送出，我们会尽快回复。',
      error: '发生错误，请重试，或直接发邮件联系我们。',
    },
    footer: {
      rights: '版权所有。',
      serviceAreaBlurb: '为帕萨迪纳和圣盖博谷的小型企业提供服务。',
      explore: '探索',
      citiesWeServe: '服务城市',
    },
    hub: {
      whatYouGet: '服务内容',
      servicesDescription: '为帕萨迪纳和圣盖博谷的小型企业提供网站建设、本地谷歌推广、经营咨询和付费广告服务。',
      servicesIntro: '四项服务，按最重要的排在前面。',
      citiesTitle: '我们服务的城市',
      citiesDescription: '为帕萨迪纳和圣盖博谷的小型企业提供网站建设与本地谷歌推广服务。',
      citiesIntro: '我们为整个圣盖博谷的小型企业提供服务。选择您所在的城市，看看当地最重要的事。',
      blogDescription: '写给圣盖博谷小生意老板看的文章，说大白话，聊网站、本地搜索、经营决策和付费广告。',
    },
    misc: {
      mainNav: '主导航',
      skipToContent: '跳到正文',
      switchToLightMode: '切换到浅色模式',
      switchToDarkMode: '切换到深色模式',
      cookieNotice: '我们使用分析类 Cookie，以了解本网站的使用情况。不做广告追踪，也不会出售您的信息。',
      cookieAccept: '同意',
      cookieDecline: '拒绝',
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
      send: '傳送',
      sending: '傳送中…',
      success: '謝謝，您的留言已送出，我們將盡快回覆。',
      error: '發生錯誤，請重試，或直接以電子郵件與我們聯絡。',
    },
    footer: {
      rights: '版權所有。',
      serviceAreaBlurb: '為帕薩迪納和聖蓋博谷的小型企業提供服務。',
      explore: '探索',
      citiesWeServe: '服務城市',
    },
    hub: {
      whatYouGet: '服務內容',
      servicesDescription: '為帕薩迪納和聖蓋博谷的小型企業提供網站建置、在地 Google 推廣、經營諮詢與付費廣告服務。',
      servicesIntro: '四項服務，依最重要的排在前面。',
      citiesTitle: '我們服務的城市',
      citiesDescription: '為帕薩迪納和聖蓋博谷的小型企業提供網站建置與在地 Google 推廣服務。',
      citiesIntro: '我們為整個聖蓋博谷的小型企業提供服務。選擇您所在的城市，看看當地最重要的事。',
      blogDescription: '寫給聖蓋博谷小生意老闆看的文章，說白話，聊網站、在地搜尋、經營決策與付費廣告。',
    },
    misc: {
      mainNav: '主導覽',
      skipToContent: '跳到主要內容',
      switchToLightMode: '切換到淺色模式',
      switchToDarkMode: '切換到深色模式',
      cookieNotice: '我們使用分析用的 Cookie，藉此瞭解本網站的使用情況，不做廣告追蹤，也不會出售您的資訊。',
      cookieAccept: '接受',
      cookieDecline: '拒絕',
    },
  },
};
