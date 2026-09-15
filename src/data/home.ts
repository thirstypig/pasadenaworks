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
    title: 'Pasadena Works — Más pacientes para consultorios médicos y dentales',
    metaDescription:
      'Ayudamos a consultorios médicos, dentales y de optometría del sur de California a digitalizar la oficina, aparecer en línea y atraer pacientes nuevos.',
    heroEyebrow: 'Valle de San Gabriel y sur de California',
    heroHeading: 'Más pacientes nuevos y una recepción que funciona sin usted.',
    heroSubhead:
      'Ayudamos a consultorios médicos, dentales y de optometría de todo el sur de California a digitalizar la recepción, a transmitir confianza al paciente que los busca y a atraer pacientes nuevos cuyo origen pueden rastrear, y nunca recibimos pago de las empresas de software cuyos productos recomendamos.',
    heroCta: 'Contáctenos',
    servicesHeading: 'En qué le podemos ayudar',
    servicesIntro:
      'Trabajamos como lo hace un buen equipo de producto: observamos dónde se atascan los pacientes y el personal, resolvemos primero el problema más costoso y comprobamos si funcionó. Todo trabajo comienza con una revisión, porque un consultorio que cree necesitar publicidad con frecuencia necesita primero corregir sus formularios de admisión, y no existe una manera honesta de saber cuál de las dos cosas hace falta hasta que alguien lo haya examinado.',
    serviceAreaHeading: 'Dónde trabajamos',
    serviceAreaIntro:
      'Tenemos nuestra base en el Valle de San Gabriel y trabajamos con consultorios de todo el sur de California, incluidas estas ciudades.',
    closingHeading: '¿Listo para hablar?',
    closingBody:
      'Cuéntenos qué está sucediendo en su consultorio —los teléfonos, el papeleo, su Perfil de Negocio de Google o lo que más le esté costando en este momento—. Le responderemos con algo específico para su consultorio, en lugar de una propuesta preparada de antemano.',
    closingCta: 'Escríbanos',
  },
  'zh-hans': {
    title: 'Pasadena Works — 为医疗与牙科诊所带来更多患者',
    metaDescription:
      '我们协助南加州的独立医疗、牙科与眼科诊所实现诊所数字化、提升线上曝光，并带来更多新患者。',
    heroEyebrow: '圣盖博谷与南加州',
    heroHeading: '更多新患者，外加一个无需您亲自坐镇也能顺畅运作的前台。',
    heroSubhead:
      '我们协助南加州各地的医疗、牙科与眼科诊所将前台作业数字化，让搜索诊所的患者看到值得信赖的形象，并带来来源可追踪的新患者；此外，我们从不收取所推荐软件厂商的任何报酬。',
    heroCta: '联系我们',
    servicesHeading: '我们能帮您做什么',
    servicesIntro:
      '我们的工作方式如同优秀的产品团队：先观察患者与员工在哪些环节受阻，优先解决代价最高的问题，再检验成效。每一次合作都从经营诊断开始，因为自认为需要广告的诊所，往往首先需要修正的是初诊表格；在有人实际审视之前，并没有诚实的办法判断究竟需要哪一项。',
    serviceAreaHeading: '我们的服务区域',
    serviceAreaIntro: '我们以圣盖博谷为基地，服务南加州各地的诊所，包括以下城市。',
    closingHeading: '准备好聊聊了吗？',
    closingBody:
      '请告诉我们您的诊所目前的状况——电话、文书作业、Google 商家资料，或当下让您损失最大的任何问题。我们会针对您的诊所给出具体的答复，而非一份事先拟好的方案书。',
    closingCta: '给我们留言',
  },
  'zh-hant': {
    title: 'Pasadena Works — 為醫療與牙科診所帶來更多病患',
    metaDescription:
      '我們協助南加州的獨立醫療、牙科與眼科診所推動診所數位化、提升線上曝光，並帶來更多新病患。',
    heroEyebrow: '聖蓋博谷與南加州',
    heroHeading: '更多新病患，再加上一個不必您親自坐鎮也能順暢運作的櫃檯。',
    heroSubhead:
      '我們協助南加州各地的醫療、牙科與眼科診所將櫃檯作業數位化，讓搜尋診所的病患看到值得信賴的形象，並帶來來源可追蹤的新病患；此外，我們從不收取所推薦軟體廠商的任何報酬。',
    heroCta: '聯絡我們',
    servicesHeading: '我們能幫您做什麼',
    servicesIntro:
      '我們的做法如同優秀的產品團隊：先觀察病患與員工在哪些環節受阻，優先解決代價最高的問題，再檢驗成效。每一次合作都從經營診斷開始，因為自認為需要廣告的診所，往往首先需要修正的是初診表單；在有人實際檢視之前，並沒有誠實的辦法判斷究竟需要哪一項。',
    serviceAreaHeading: '我們的服務區域',
    serviceAreaIntro: '我們以聖蓋博谷為據點，服務南加州各地的診所，包括以下城市。',
    closingHeading: '準備好聊聊了嗎？',
    closingBody:
      '請告訴我們您的診所目前的狀況——電話、文書作業、Google 商家檔案，或當下讓您損失最大的任何問題。我們會針對您的診所給出具體的回覆，而非一份事先擬好的方案書。',
    closingCta: '給我們留言',
  },
};

/**
 * The homepage's hreflang map, DERIVED from what this file actually contains.
 *
 * Both homepages used to hardcode all four paths while `[locale]/index.astro`
 * derived its `getStaticPaths` from `Object.keys(home)` — and `home` is
 * `Partial` on purpose. So commenting out a locale here stopped generating that
 * page while the English homepage kept advertising it, and `LangSwitch` kept
 * rendering the link: an hreflang alternate pointing at a 404, which is exactly
 * what hard rule #1 exists to prevent. TypeScript was satisfied, because
 * `Partial` is the correct type, and the build passed.
 *
 * The homepage was the ONLY page type asserting this rather than deriving it —
 * cityLocales(), getTranslationsFor() and the services' total Record all get it
 * right. `en` is added explicitly because the English homepage's copy lives in
 * src/pages/index.astro, not here.
 */
export function homeTranslations(): Partial<Record<Locale, string>> {
  const entries: [Locale, string][] = [['en', '/']];
  for (const locale of Object.keys(home) as Locale[]) {
    entries.push([locale, `/${locale}/`]);
  }
  return Object.fromEntries(entries);
}
