import type { Locale } from '../i18n/ui';
import type { Pillar } from './pillars';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  EDIT YOUR SERVICE COPY HERE. This is the only file you need to touch.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Each service has:
 *    id      — internal key, never shown, never change it (URLs depend on it)
 *    slugs   — the URL word per language. Translated on purpose: Spanish
 *              searchers type "sitios web", not "websites". Real SEO value.
 *    t       — the copy, per language.
 *
 *  Order of this array = display order on the site: Practice Checkup, then
 *  Digitize the office, then Get more patients (2026-09-14).
 *
 *  `id` and `slugs` are what indexed URLs are built from. Changing a slug moves
 *  a page; retiring a service needs a redirect for every locale in
 *  src/data/retired-services.mjs, as `search` and `ads` got on 2026-09-14.
 *  `websites` can never be retired or renamed: routes.ts builds the city-hub
 *  URL segment from its slugs.
 *
 *  `body` and `outcomes` strings render as raw HTML (`set:html` in
 *  [service].astro), not plain text — so `<a href="/glossary/#...">term</a>`
 *  works for linking a technical term to its glossary entry. The glossary
 *  (src/data/glossary.ts) is English-only on purpose, so only link to it
 *  from English copy — a Spanish/Chinese reader clicking through to an
 *  English definition page would be a worse experience than no link.
 */

/** Every outside source the service copy links to, verified in
 *  docs/superpowers/specs/2026-09-14-practice-services-sources.md. A claim a
 *  reader could check carries one of these, or it is not on the site.
 *  Values go straight into `href`s rendered through `set:html`, so any `&` is
 *  written `&amp;`. */
const SOURCES = {
  section504Extension:
    'https://www.federalregister.gov/documents/2026/05/11/2026-09266/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web',
  medicarePartBCoverage:
    'https://www.alston.com/en/insights/publications/2026/03/compliance-section-504-rehabilitation-act',
  googlePractitionerListings: 'https://support.google.com/business/answer/3038177',
  googleReviewPolicy: 'https://support.google.com/contributionpolicy/answer/7400114',
  hhsReviewResponseSettlement:
    'https://www.hhs.gov/about/news/2022/03/28/four-hipaa-enforcement-actions-hold-healthcare-providers-accountable-with-compliance.html',
  hipaaMarketing: 'https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/marketing/index.html',
  ocrTrackingTech:
    'https://www.hklaw.com/en/insights/publications/2024/06/american-hospital-assn-v-becerra-are-tracking-tools-ok-again',
  calBusProf650:
    'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&amp;sectionNum=650',
  federalAks:
    'https://uscode.house.gov/view.xhtml?req=granuleid%3AUSC-prelim-title42-section1320a-7b&amp;num=0&amp;edition=prelim',
  hipaaRiskAnalysis:
    'https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html',
  hipaaCoveredEntities:
    'https://www.cms.gov/priorities/key-initiatives/burden-reduction/administrative-simplification/hipaa/covered-entities',
  remindersNoShows: 'https://doi.org/10.1002/14651858.CD007458.pub3',
} as const;

const GOOGLE_HL: Record<Locale, string> = { en: 'en', es: 'es-419', 'zh-hans': 'zh-CN', 'zh-hant': 'zh-TW' };

/** Google's help pages exist in each reader's language; the federal and state
 *  sources do not, so only Google links get a per-locale `hl`. */
function google(url: string, locale: Locale): string {
  const u = new URL(url);
  u.searchParams.set('hl', GOOGLE_HL[locale]);
  return u.toString();
}

export interface ServiceCopy {
  title: string;
  tagline: string;
  /** Shown on the services index card. One sentence — keep it short; the
   *  detail page (title/tagline/body/outcomes below) is where the fuller
   *  explanation and technical detail belongs. */
  summary: string;
  /** Body paragraphs on the detail page. Renders as HTML — see note above. */
  body: string[];
  /** Concrete deliverables, shown under the "What you get" heading on the
   *  detail page. Renders as HTML — see note above. Keep these things a
   *  client can point at. */
  outcomes: string[];
  /** Meta description for search results. Aim for 150–158 characters. */
  meta: string;
}

/** The live service ids. Retired ids (`search`, `ads`) redirect — see
 *  src/data/retired-services.mjs. Blog pillars reach a service through
 *  PILLAR_SERVICE below, never by matching this id. */
export type ServiceId = 'consulting' | 'websites';

export interface Service {
  id: ServiceId;
  slugs: Record<Locale, string>;
  t: Record<Locale, ServiceCopy>;
}

export const services: Service[] = [
  /* ── 1. Practice Checkup (id stays 'consulting'; URL unchanged) ─────── */
  {
    id: 'consulting',
    slugs: {
      en: 'business-advice',
      es: 'asesoria-de-negocios',
      'zh-hans': 'jingying-zixun',
      'zh-hant': 'jingying-zixun',
    },
    t: {
      en: {
        title: 'Practice Checkup',
        tagline: 'Find out precisely what is costing your practice patients before you pay anyone to fix it.',
        summary:
          'One fixed-price review of the whole practice — the phones and intake forms, the records and the EHR, the website and the Google listing — ending in a short written plan that ranks what to fix first. If you continue with us, the fee is credited toward that work.',
        body: [
          '<p>Most practices that contact us believe they have a marketing problem, and although some genuinely do, just as often the prospective patients are already calling while the practice loses them somewhere between an unreturned voicemail and a clipboard of intake paperwork that takes twenty minutes to complete. Advertising cannot repair either of those failures, which is precisely why we examine the entire practice before recommending anything.</p>',
          '<h2>How it works</h2><ul><li>A conversation with you and your reception staff, because the people answering the telephones generally understand better than anyone where the day goes wrong</li><li>A walk through one patient\'s complete experience, from the initial search or telephone call through registration, the appointment itself, and the reminder for their next visit</li><li>A review of how your <a href="/glossary/#ehr">EHR</a> is actually configured, how your patient records are organized, and how your <a href="/glossary/#google-business-profile">Google Business Profile</a>, reviews, and website present the practice to someone deciding whether to call</li><li>A concise written plan that ranks every recommendation by how quickly it will pay for itself, with a fixed price for any subsequent work agreed in writing before we begin</li></ul>',
          '<p>Occasionally the plan concludes that the practice is in considerably better condition than you feared, and that the most valuable next step costs very little; when that happens, we will document it just as plainly as we would an expensive recommendation.</p>',
        ],
        outcomes: [
          'A documented map of one patient\'s path through your practice, identifying every point at which prospective patients currently give up',
          'A candid assessment of how effectively your records, your EHR configuration, and your front-desk workflow actually serve the practice',
          'An evaluation of how the practice appears to a prospective patient who searches for it, whether on Google, in reviews, on your website, or in health directories',
          'A written plan ranked by priority, rather than a presentation deck that nobody opens a second time',
          'The checkup fee, credited toward any subsequent work you choose to do with us',
        ],
        meta: 'A fixed-price checkup for independent medical, dental, and eye care practices in Southern California: records, EHR, front desk, and online presence, ranked.',
      },
      es: {
        title: 'Consultoría en línea',
        tagline: 'Una respuesta honesta, de alguien que no gana nada de cualquier forma.',
        summary:
          '¿No sabe si invertir en un sitio nuevo, más visibilidad en Google, o publicidad paga? Vemos sus esfuerzos en línea juntos y le decimos con honestidad qué de verdad vale la pena — y qué no.',
        body: [
          '<p>Llámelo sesión de consultoría, revisión de estrategia, o simplemente una segunda opinión — el nombre no importa. Esto no es asesoría de negocios en general; es específicamente sobre su presencia en línea — su sitio web, su visibilidad, su marketing — y cómo ordenarlo e implementarlo bien.</p>',
          '<h2>Cómo funciona</h2><ul><li>Una sesión de trabajo, no una conferencia: vemos juntos qué está pasando de verdad con su sitio, su visibilidad y sus anuncios</li><li>Le ayudamos a decidir en qué invertir en línea y qué dejar en paz</li><li>Un resumen corto por escrito que usted puede usar, no una presentación</li></ul>',
          '<p>A veces la respuesta honesta es que su presencia en línea ya funciona perfectamente bien, y se lo diremos con la misma prontitud que cualquier otra cosa.</p>',
        ],
        outcomes: [
          'Una sesión de trabajo sobre qué arreglar primero, en línea',
          'Una mirada clara a cuáles de sus esfuerzos en línea de verdad están funcionando',
          'Un resumen corto por escrito que usted conserva',
          'Un plan sencillo de qué implementar el próximo trimestre, no una estrategia a cinco años que nadie va a leer',
          'Una llamada de seguimiento para ver si funcionó',
        ],
        meta: 'Consultoría de estrategia en línea para dueños de negocios pequeños en el sur de California — qué invertir en su sitio, visibilidad y marketing, y qué dejar de lado.',
      },
      'zh-hans': {
        title: '线上咨询',
        tagline: '一个诚实的答案，来自一个怎么说都没有利害关系的人。',
        summary:
          '不确定究竟应当投资新网站、提升谷歌曝光，还是投放付费广告？我们会与您一同检视现有的线上工作，并且诚实告知何者真正值得投入，至于何者则可以暂且搁置。',
        body: [
          '<p>无论称之为经营咨询、战略会谈，抑或单纯就是第二意见，名称本身并不重要。此外，这并非一般性的经营咨询，而是专门针对您的线上呈现——您的网站、您的曝光度、您的营销——以及这些事项究竟应当依何种顺序推进、又该如何落地。</p>',
          '<h2>怎么做</h2><ul><li>一次会谈而非授课——我们将一同检视您的网站、搜索曝光与广告目前究竟处于何种状况</li><li>协助您判断接下来应当于线上投入何处，至于何者则可以暂且搁置</li><li>一份能直接用的简短书面总结，不是一堆幻灯片</li></ul>',
          '<p>有时候诚实的答案是：您的线上呈现已经运作得相当良好，因此并不需要我们。此外，这句话我们同样会照实说出来，与其他任何结论并无二致。</p>',
        ],
        outcomes: [
          '一次会谈，藉此厘清线上应当优先处理何事',
          '厘清您既有的线上投入之中，何者真正产生回报',
          '一份留予您的简短书面总结，而非一叠无人翻阅的幻灯片',
          '一份供下个季度使用的简明执行计划，而非无人阅读的五年战略',
          '一次后续回访，藉以确认前述方法是否确实奏效',
        ],
        meta: '为南加州小型企业主提供线上策略咨询——网站、曝光度、营销该投资什么，什么可以先放一放，不讲行话。',
      },
      'zh-hant': {
        title: '線上諮詢',
        tagline: '一個誠實的答案，來自一個怎麼說都沒有利害關係的人。',
        summary:
          '不確定究竟應當投資新網站、提升 Google 曝光，還是投放付費廣告？我們會與您一同檢視現有的線上工作，並且誠實告知何者真正值得投入，至於何者則可以暫且擱置。',
        body: [
          '<p>無論稱之為經營諮詢、策略會談，抑或單純就是第二意見，名稱本身並不重要。此外，這並非一般性的經營諮詢，而是專門針對您的線上呈現——您的網站、您的曝光度、您的行銷——以及這些事項究竟應當依何種順序推進、又該如何落地。</p>',
          '<h2>怎麼做</h2><ul><li>一次會談而非授課——我們將一同檢視您的網站、搜尋曝光與廣告目前究竟處於何種狀況</li><li>協助您判斷接下來應當於線上投入何處，至於何者則可以暫且擱置</li><li>一份能直接用的簡短書面總結，不是一堆簡報</li></ul>',
          '<p>有時候誠實的答案是：您的線上呈現已經運作得相當良好，因此並不需要我們。此外，這句話我們同樣會照實說出來，與其他任何結論並無二致。</p>',
        ],
        outcomes: [
          '一次會談，藉此釐清線上應當優先處理何事',
          '釐清您既有的線上投入之中，何者真正產生回報',
          '一份留予您的簡短書面總結，而非一疊無人翻閱的簡報',
          '一份供下一季使用的簡明執行計畫，而非無人閱讀的五年戰略',
          '一次後續回訪，藉以確認前述方法是否確實奏效',
        ],
        meta: '為南加州小型企業主提供線上策略諮詢——網站、曝光度、行銷該投資什麼，什麼可以先放一放，不講行話。',
      },
    },
  },

  /* ── 3. Get more patients (id stays 'websites'; URL unchanged) ──────── */
  {
    id: 'websites',
    slugs: {
      en: 'websites',
      es: 'sitios-web',
      'zh-hans': 'wangzhan-jianshe',
      'zh-hant': 'wangzhan-jianzhi',
    },
    t: {
      en: {
        title: 'Get more patients',
        tagline: 'More of the patients you want, with evidence of exactly where each one came from.',
        summary:
          'Before most patients call, they check your Google listing, your reviews, and your website, so we get those right first. Then we bring back the patients who are overdue and advertise only the treatments worth advertising, with every new patient traced to its source.',
        body: [
          '<p>A prospective patient usually wants to know five things before calling: whether you accept their insurance, whether you are accepting new patients, which languages you speak, where to park, and whether they can book an appointment online. A practice that answers those questions immediately often receives the call instead of a competitor down the street that does not, which is why no amount of advertising helps until those fundamentals are right.</p>',
          `<h2>First, the basics</h2><ul><li>Your <a href="/glossary/#google-business-profile">Google Business Profile</a> completed and verified, <a href="${google(SOURCES.googlePractitionerListings, 'en')}">with a separate listing for each doctor</a>, since prospective patients frequently search for a practitioner by name</li><li>A steady, predictable flow of <a href="/glossary/#reviews">reviews</a>: an automatic text after each appointment asking every patient, <a href="${google(SOURCES.googleReviewPolicy, 'en')}">never only the satisfied ones, and never with anything offered in return</a></li><li>Replies to reviews written so they never confirm that the reviewer is a patient, <a href="${SOURCES.hhsReviewResponseSettlement}">a HIPAA violation for which federal regulators fined one dental practice $50,000</a></li><li>Healthgrades, Zocdoc, WebMD, and your insurers' provider directories corrected so that every one of them agrees with your Google listing</li><li>A fast website that meets the <a href="/glossary/#wcag">WCAG 2.1 AA</a> accessibility standard, available in Spanish or Chinese wherever your patients speak those languages</li></ul>`,
          `<p><a href="${SOURCES.medicarePartBCoverage}">Practices that accept Medicare Part B</a> are now required by federal regulation to make their websites meet that accessibility standard, <a href="${SOURCES.section504Extension}">by May 2027 for practices with fifteen or more employees and by May 2028 for smaller ones</a>.</p>`,
          `<h2>Then, growth</h2><p>The least expensive appointment most practices will ever book comes from a patient who is already overdue: the annual eye examination, the six-month cleaning, the follow-up visit that never got scheduled. Most practices remind those patients inconsistently or not at all, so growth begins there, before a single dollar goes to advertising.</p><ul><li>Tracking that records where every new patient originally came from, so that the monthly report can answer honestly whether the spending paid for itself</li><li>Recall and reactivation messages for patients who are overdue for a visit, <a href="${SOURCES.hipaaMarketing}">written within HIPAA's rules on marketing to patients</a></li><li>A dedicated page for each high-value treatment you offer, written around the specific way prospective patients actually search for it</li><li>Google search advertising only for treatments where a new patient is genuinely worth the cost, with a budget cap that cannot quietly run away from you</li></ul>`,
          `<p>Some things we will not do: target advertising at people based on a health condition, place advertising-tracking code on appointment or intake pages <a href="${SOURCES.ocrTrackingTech}">where it can pass patient information to an advertising platform</a>, or pay anyone for referrals, which <a href="${SOURCES.calBusProf650}">state</a> and <a href="${SOURCES.federalAks}">federal</a> anti-kickback laws prohibit. You retain ownership of the website, the domain, and the content, because holding a client's website hostage is a poor business model and a worse way to treat people.</p>`,
        ],
        outcomes: [
          'Google Business Profile listings for the practice and for each individual practitioner, completed and verified',
          'A review request that reaches every patient after every appointment, and replies that never confirm anyone is a patient',
          'Health directory and insurance company listings that agree with your Google listing',
          'A website that loads quickly on a phone, answers the questions patients ask first, and meets WCAG 2.1 AA, in Spanish or Chinese if your patients need it',
          'Recall messages that systematically bring overdue patients back into the appointment schedule',
          'Search advertising with a hard budget cap, used only where the numbers genuinely work',
          'A monthly note explaining what you spent, what it returned, and where each new patient came from',
        ],
        meta: 'Websites, Google profiles, reviews, patient recall, and search ads for independent medical, dental, and eye care practices in Southern California, tracked.',
      },
      es: {
        title: 'Sitios web que traen clientes',
        tagline: 'Para que un sitio lento y anticuado no le mande sus clientes a otro.',
        summary:
          'Si su sitio carga lentamente, parece anticuado, o no logra declarar con claridad qué hace usted, los visitantes se marchan a otro lado. Construimos sitios rápidos y directos que usted posee genuinamente una vez que hemos terminado — sin cargos ocultos, y sin ningún arreglo que le deje atrapado.',
        body: [
          '<p>La mayoría de los sitios web de negocios pequeños se construyeron una sola vez, hace años, por alguien que desde entonces dejó de contestar los correos, y el mantenimiento que nadie programó sencillamente nunca ocurrió. Mientras tanto, el cliente ya desistió y telefoneó al negocio de la otra cuadra.</p>',
          '<h2>Cómo funciona</h2><ul><li>Rápido en el teléfono, con información correcta, un número o formulario imposible de pasar por alto</li><li>Hecho para que Google realmente pueda leerlo — la mayoría de los sitios fallan aquí sin que nadie se dé cuenta</li><li>Opcional: integraciones con su CRM o calendario, para que los clientes nuevos lleguen a donde usted ya trabaja</li></ul>',
          '<p>Usted conserva la propiedad de todo lo involucrado — el sitio, el dominio y el contenido — porque retener como rehén la página web de un cliente constituye un modelo de negocio deficiente y una manera considerablemente peor de tratar a la gente.</p>',
        ],
        outcomes: [
          'Un sitio que carga en menos de dos segundos en el teléfono',
          'HTML limpio y real para que Google — y las herramientas de IA — puedan leer su contenido de verdad',
          'Un formulario de contacto que llega a su correo, no al vacío',
          'Perfil de Google Business conectado y verificado',
          'Opcional: integraciones con su CRM o calendario, para que los clientes nuevos lleguen a donde usted ya trabaja',
          'Opcional: el sitio completo en inglés o chino',
        ],
        meta: 'Diseño de sitios web para negocios pequeños en Pasadena y el Valle de San Gabriel. Sitios rápidos y claros que sus clientes sí encuentran.',
      },
      'zh-hans': {
        title: '能带来生意的网站',
        tagline: '别让又慢又旧的网站，把客人送去了别家。',
        summary:
          '倘若网站加载缓慢、外观过时，或者未能清楚说明您所从事的是什么，访客便会转身离开，前往别家。这样的流失通常不会留下任何痕迹。我们建设快速而直接的网站，完工之后其所有权确实归您——没有隐藏费用，也没有任何将您绑住的安排。',
        body: [
          '<p>多数小生意的网站都是许多年前建成的，然而当初经手的人早已联系不上；至于没有人排定的后续维护，则从来不曾发生。此外，在这段期间之内，客人早已放弃，转头打给了隔壁那一家。</p>',
          '<h2>怎么做</h2><ul><li>手机上打开快、信息准确、电话和留言表单一眼就能看到</li><li>做到让谷歌真的能读懂——大多数网站正是在这一步悄悄地失败了</li><li>可选：接入您的 CRM 或日历，让新客人直接进到您已经在用的工具里</li></ul>',
          '<p>其中的一切所有权皆归您所有——网站、域名与内容并无例外——因为把客户的网站扣在手上当作筹码，既是一种拙劣的商业模式，也是一种更加糟糕的待人方式。</p>',
        ],
        outcomes: [
          '手机上两秒之内打开的网站',
          '干净、真正的 HTML，让谷歌和 AI 工具都能真正读懂您的内容',
          '客人留言直接进您的邮箱，不会石沉大海',
          '连接并验证谷歌商家资料（Google Business Profile）',
          '可选：接入您的 CRM 或日历，让新客人直接进到您已经在用的工具里',
          '可选：整个网站也做英文版或西班牙文版',
        ],
        meta: '为帕萨迪纳和圣盖博谷的小型企业提供网站设计。速度快、内容清楚、客人在手机上真的找得到您。',
      },
      'zh-hant': {
        title: '能帶來生意的網站',
        tagline: '別讓又慢又舊的網站，把客人送去了別家。',
        summary:
          '倘若網站載入緩慢、外觀過時，或者未能清楚說明您所從事的是什麼，訪客便會轉身離開，前往別家。這樣的流失通常不會留下任何痕跡。我們建置快速而直接的網站，完工之後其所有權確實歸您——沒有隱藏費用，也沒有任何將您綁住的安排。',
        body: [
          '<p>多數小生意的網站都是許多年前建成的，然而當初經手的人早已聯絡不上；至於沒有人排定的後續維護，則從來不曾發生。此外，在這段期間之內，客人早已放棄，轉頭打給了隔壁那一家。</p>',
          '<h2>怎麼做</h2><ul><li>手機上開啟快、資訊正確、電話和留言表單一眼就看得到</li><li>做到讓 Google 真的能讀懂——大多數網站正是在這一步悄悄地失敗了</li><li>可選：接入您的 CRM 或行事曆，讓新客人直接進到您已經在用的工具裡</li></ul>',
          '<p>其中的一切所有權皆歸您所有——網站、網域與內容並無例外——因為把客戶的網站扣在手上當作籌碼，既是一種拙劣的商業模式，也是一種更加糟糕的待人方式。</p>',
        ],
        outcomes: [
          '手機上兩秒之內開啟的網站',
          '乾淨、真正的 HTML，讓 Google 和 AI 工具都能真正讀懂您的內容',
          '客人留言直接進您的信箱，不會石沉大海',
          '連接並驗證 Google 商家檔案（Google Business Profile）',
          '可選：接入您的 CRM 或行事曆，讓新客人直接進到您已經在用的工具裡',
          '可選：整個網站也做英文版或西班牙文版',
        ],
        meta: '為帕薩迪納和聖蓋博谷的小型企業提供網站建置。速度快、內容清楚、客人在手機上真的找得到您。',
      },
    },
  },
];

/** Look up a service by its localized slug. */
export function serviceBySlug(locale: Locale, slug: string): Service | undefined {
  return services.find((s) => s.slugs[locale] === slug);
}

/**
 * Which service each blog pillar's end-of-post call to action points at.
 * The pillars are a blog taxonomy and outlived two services, so this is an
 * explicit map rather than `services.find((s) => s.id === pillar)` — that
 * lookup crashed the build the moment a pillar's service was retired. A pillar
 * missing here is a compile error; a mapped id missing from `services` throws.
 */
export const PILLAR_SERVICE: Record<Pillar, ServiceId> = {
  websites: 'websites',
  search: 'websites',
  ads: 'websites',
  consulting: 'consulting',
};

export function serviceForPillar(pillar: Pillar): Service {
  const id = PILLAR_SERVICE[pillar];
  const service = services.find((s) => s.id === id);
  if (!service) {
    throw new Error(`services.ts: pillar "${pillar}" maps to "${id}", which is not in services[]`);
  }
  return service;
}
