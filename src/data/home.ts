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
      'Sitios web, presencia en Google y publicidad pagada para negocios pequeños en todo Pasadena y el Valle de San Gabriel — vendidos con honestidad, explicados sin jerga innecesaria, y jamás retenidos posteriormente como rehenes contra su propio dominio.',
    heroCta: 'Contáctenos',
    servicesHeading: 'En qué le podemos ayudar',
    servicesIntro:
      'Existen cuatro servicios y ninguno resulta especialmente complicado, de modo que empiece por aquel que genuinamente le está costando clientes en este momento, antes que por el que casualmente suene más impresionante.',
    serviceAreaHeading: 'Dónde trabajamos',
    serviceAreaIntro:
      'Atendemos negocios pequeños situados en las siguientes ciudades y en sus alrededores inmediatos.',
    closingHeading: '¿Listo para hablar?',
    closingBody:
      'Cuéntenos qué está sucediendo actualmente con su sitio o con su presencia en Google, con el detalle que tenga disponible. Le responderemos con algo específico a su situación, antes que con una propuesta genérica.',
    closingCta: 'Escríbanos',
  },
  'zh-hans': {
    title: 'Pasadena Works — 小型企业网站与推广服务',
    metaDescription:
      '为帕萨迪纳和圣盖博谷的小型企业提供网站、本地谷歌推广和广告服务。说大白话，不卖多余的东西。',
    heroEyebrow: '帕萨迪纳与圣盖博谷',
    heroHeading: '为小生意做的线上工作，让更多客人找到您。',
    heroSubhead: '为帕萨迪纳与圣盖博谷一带的小型企业提供网站、谷歌曝光与付费广告服务——说到做到，并且绝不会在事后扣着您的网站不放。',
    heroCta: '联系我们',
    servicesHeading: '我们能帮您做什么',
    servicesIntro: '一共四项服务，没有一项特别复杂。请先从当下真正让您流失客人的那一项着手，而非从听起来最气派的那一项开始。',
    serviceAreaHeading: '我们的服务区域',
    serviceAreaIntro: '我们为下列城市及其邻近区域的小型企业提供服务。',
    closingHeading: '准备好聊聊了吗？',
    closingBody: '请告诉我们您的网站或谷歌曝光目前遇到了什么状况，有多少细节就说多少。我们会针对您的实际情形给出具体的答复，而非一份通用的方案书。',
    closingCta: '给我们留言',
  },
  'zh-hant': {
    title: 'Pasadena Works — 小型企業網站與推廣服務',
    metaDescription:
      '為帕薩迪納和聖蓋博谷的小型企業提供網站、在地 Google 推廣和廣告服務。說白話，不賣多餘的東西。',
    heroEyebrow: '帕薩迪納與聖蓋博谷',
    heroHeading: '為小生意做的線上工作，讓更多客人找到您。',
    heroSubhead: '為帕薩迪納與聖蓋博谷一帶的小型企業提供網站、Google 曝光與付費廣告服務——說到做到，並且絕不會在事後扣著您的網站不放。',
    heroCta: '聯絡我們',
    servicesHeading: '我們能幫您做什麼',
    servicesIntro: '一共四項服務，沒有一項特別複雜。請先從當下真正讓您流失客人的那一項著手，而非從聽起來最氣派的那一項開始。',
    serviceAreaHeading: '我們的服務區域',
    serviceAreaIntro: '我們為下列城市及其鄰近區域的小型企業提供服務。',
    closingHeading: '準備好聊聊了嗎？',
    closingBody: '請告訴我們您的網站或 Google 曝光目前遇到了什麼狀況，有多少細節就說多少。我們會針對您的實際情形給出具體的回覆，而非一份通用的方案書。',
    closingCta: '給我們留言',
  },
};
