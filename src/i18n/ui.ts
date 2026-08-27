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

/** Locales that are NOT the default — the ones that get a URL prefix. */
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE) as Exclude<
  Locale,
  'en'
>[];

/** BCP-47 tag used in <html lang> and hreflang attributes. */
export const HTML_LANG: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  'zh-hans': 'zh-Hans',
  'zh-hant': 'zh-Hant',
};

/** Human-readable name of each language, in its own language. */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  'zh-hans': '简体中文',
  'zh-hant': '繁體中文',
};

export interface UIStrings {
  nav: {
    home: string;
    services: string;
    blog: string;
    contact: string;
  };
  buttons: {
    getInTouch: string;
    send: string;
    readMore: string;
    viewService: string;
    backToServices: string;
    viewCity: string;
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
    serviceArea: string;
    explore: string;
    citiesWeServe: string;
  };
  misc: {
    skipToContent: string;
    languages: string;
    placeholderNotice: string;
  };
}

export const ui: Record<Locale, UIStrings> = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      blog: 'Blog',
      contact: 'Contact',
    },
    buttons: {
      getInTouch: 'Get in touch',
      send: 'Send',
      readMore: 'Read more',
      viewService: 'View service',
      backToServices: 'Back to services',
      viewCity: 'View',
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
      serviceArea: 'Serving',
      explore: 'Explore',
      citiesWeServe: 'Cities we serve',
    },
    misc: {
      skipToContent: 'Skip to content',
      languages: 'Language',
      placeholderNotice: 'This page is a placeholder and is being filled in.',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      services: 'Servicios',
      blog: 'Blog',
      contact: 'Contacto',
    },
    buttons: {
      getInTouch: 'Contáctenos',
      send: 'Enviar',
      readMore: 'Leer más',
      viewService: 'Ver servicio',
      backToServices: 'Volver a servicios',
      viewCity: 'Ver',
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
      serviceArea: 'Atendemos',
      explore: 'Explorar',
      citiesWeServe: 'Ciudades que atendemos',
    },
    misc: {
      skipToContent: 'Saltar al contenido',
      languages: 'Idioma',
      placeholderNotice: 'Esta página es un borrador y todavía se está completando.',
    },
  },
  'zh-hans': {
    nav: {
      home: '首页',
      services: '服务',
      blog: '博客',
      contact: '联系我们',
    },
    buttons: {
      getInTouch: '联系我们',
      send: '发送',
      readMore: '阅读更多',
      viewService: '查看服务',
      backToServices: '返回服务列表',
      viewCity: '查看',
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
      serviceArea: '服务区域',
      explore: '探索',
      citiesWeServe: '服务城市',
    },
    misc: {
      skipToContent: '跳到正文',
      languages: '语言',
      placeholderNotice: '这个页面还在完善中，内容是占位文字。',
    },
  },
  'zh-hant': {
    nav: {
      home: '首頁',
      services: '服務',
      blog: '部落格',
      contact: '聯絡我們',
    },
    buttons: {
      getInTouch: '聯絡我們',
      send: '傳送',
      readMore: '閱讀更多',
      viewService: '查看服務',
      backToServices: '返回服務列表',
      viewCity: '查看',
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
      serviceArea: '服務區域',
      explore: '探索',
      citiesWeServe: '服務城市',
    },
    misc: {
      skipToContent: '跳到主要內容',
      languages: '語言',
      placeholderNotice: '這個頁面還在完善中，內容是佔位文字。',
    },
  },
};
