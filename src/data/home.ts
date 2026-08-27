import type { Locale } from '../i18n/ui';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  HOMEPAGE COPY — es / zh-hans / zh-hant only.
 * ─────────────────────────────────────────────────────────────────────────
 *  The English homepage copy lives directly in src/pages/index.astro.
 */

export interface HomeCopy {
  title: string;
  metaDescription: string;
  heroEyebrow: string;
  heroHeading: string;
  heroSubhead: string;
  heroCta: string;
  servicesHeading: string;
  servicesIntro: string;
  serviceAreaHeading: string;
  serviceAreaIntro: string;
  closingHeading: string;
  closingBody: string;
  closingCta: string;
}

export const home: Partial<Record<Locale, HomeCopy>> = {
  es: {
    title: 'Pasadena Works — Sitios web y mercadeo para negocios pequeños',
    metaDescription:
      'Sitios web, SEO local y publicidad para negocios pequeños en Pasadena y el Valle de San Gabriel. Trabajo claro, sin letra pequeña.',
    heroEyebrow: 'Pasadena y el Valle de San Gabriel',
    heroHeading: 'Trabajo digital para negocios pequeños — para que más clientes lo encuentren.',
    heroSubhead:
      'Sitios web, presencia en Google y publicidad paga para negocios pequeños en Pasadena y el Valle de San Gabriel — con honestidad, y sin retenerle nada.',
    heroCta: 'Contáctenos',
    servicesHeading: 'En qué le podemos ayudar',
    servicesIntro:
      'Cuatro servicios, ninguno complicado. Empiece por el que de verdad le está costando clientes ahora mismo.',
    serviceAreaHeading: 'Dónde trabajamos',
    serviceAreaIntro:
      'Atendemos negocios pequeños en estas ciudades y sus alrededores.',
    closingHeading: '¿Listo para hablar?',
    closingBody:
      'Cuéntenos qué está pasando con su sitio o su presencia en Google. Le respondemos con algo concreto, no con una propuesta genérica.',
    closingCta: 'Escríbanos',
  },
  'zh-hans': {
    title: 'Pasadena Works — 小型企业网站与推广服务',
    metaDescription:
      '为帕萨迪纳和圣盖博谷的小型企业提供网站、本地谷歌推广和广告服务。说大白话，不卖多余的东西。',
    heroEyebrow: '帕萨迪纳与圣盖博谷',
    heroHeading: '为小生意做的线上工作，让更多客人找到您。',
    heroSubhead: '为帕萨迪纳和圣盖博谷的小型企业提供网站、谷歌曝光和付费广告服务——说到做到，绝不扣着您的网站不放。',
    heroCta: '联系我们',
    servicesHeading: '我们能帮您做什么',
    servicesIntro: '一共四项服务，都不复杂。先从真正让您流失客人的那项开始。',
    serviceAreaHeading: '我们的服务区域',
    serviceAreaIntro: '我们为以下城市及周边的小型企业提供服务。',
    closingHeading: '准备好聊聊了吗？',
    closingBody: '告诉我们您的网站或谷歌曝光遇到了什么问题。我们会给您具体的回答，不是一份通用的方案书。',
    closingCta: '给我们留言',
  },
  'zh-hant': {
    title: 'Pasadena Works — 小型企業網站與推廣服務',
    metaDescription:
      '為帕薩迪納和聖蓋博谷的小型企業提供網站、在地 Google 推廣和廣告服務。說白話，不賣多餘的東西。',
    heroEyebrow: '帕薩迪納與聖蓋博谷',
    heroHeading: '為小生意做的線上工作，讓更多客人找到您。',
    heroSubhead: '為帕薩迪納和聖蓋博谷的小型企業提供網站、Google 曝光和付費廣告服務——說到做到，絕不扣著您的網站不放。',
    heroCta: '聯絡我們',
    servicesHeading: '我們能幫您做什麼',
    servicesIntro: '一共四項服務，都不複雜。先從真正讓您流失客人的那項開始。',
    serviceAreaHeading: '我們的服務區域',
    serviceAreaIntro: '我們為以下城市及周邊的小型企業提供服務。',
    closingHeading: '準備好聊聊了嗎？',
    closingBody: '告訴我們您的網站或 Google 曝光遇到了什麼問題。我們會給您具體的回覆，不是一份通用的方案書。',
    closingCta: '給我們留言',
  },
};
