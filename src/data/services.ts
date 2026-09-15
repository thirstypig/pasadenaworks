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
export type ServiceId = 'consulting' | 'digitize' | 'websites';

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

  /* ── 2. Digitize the office (added 2026-09-14) ──────────────────────────
   *
   *  Terminology, verified before writing rather than translated:
   *   - EHR: es "registros médicos electrónicos" (HHS's own Spanish privacy
   *     guide, hhs.gov …/privacy-security-20130205-spn.pdf); zh-hant 電子病歷
   *     (Taiwan MOHW, 醫療機構電子病歷製作及管理辦法); zh-hans 电子病历
   *     (National Health Commission, 电子病历应用管理规范).
   *   - Business associate agreement: es "contrato de socio comercial";
   *     zh-hant 業務夥伴合約 and zh-hans 业务伙伴协议 (Microsoft Learn's HIPAA
   *     compliance page in each locale).
   *   - HIPAA stays "HIPAA" in every locale.
   *  Two modals were checked against the English: "so that people use it"
   *  and "so that the practice runs the same way" are 讓/让, not 確保/确保,
   *  which would promise an outcome the English does not. */
  {
    id: 'digitize',
    slugs: {
      en: 'practice-digitization',
      es: 'digitalizacion-del-consultorio',
      'zh-hans': 'zhensuo-shuzihua',
      'zh-hant': 'zhensuo-shuweihua',
    },
    t: {
      en: {
        title: 'Digitize the office',
        tagline: 'Less paperwork, fewer interrupting telephone calls, and a reception desk that is no longer overwhelmed.',
        summary:
          'We move patient records, scheduling, intake forms, and reminders onto systems that work together, starting from how patients actually move through your office rather than from whatever software someone wants to sell you. We take no commissions from software vendors.',
        body: [
          '<p>Many independent practices run on an <a href="/glossary/#ehr">EHR</a> that was only ever half configured, a telephone line the front desk is perpetually behind on, and paper forms that someone retypes after every appointment. Each of those deficiencies consumes staff time every single day, and several of them quietly cost the practice prospective patients who abandoned the call before anyone answered.</p>',
          `<h2>How it works</h2><ul><li>We follow one patient from the initial telephone call to the follow-up reminder, then repair the specific steps where time and money consistently leak out</li><li>Online scheduling, intake and consent forms that patients complete on their own phones before arriving, and <a href="${SOURCES.remindersNoShows}">automated reminders that reduce no-shows</a></li><li>Paper charts scanned and organized, and your EHR configured around how your clinicians and staff actually work, so that people genuinely use it</li><li>A <a href="/glossary/#hipaa">HIPAA</a> security risk analysis, <a href="${SOURCES.hipaaRiskAnalysis}">which HIPAA requires</a> of <a href="${SOURCES.hipaaCoveredEntities}">practices that bill insurance electronically</a>, together with a signed <a href="/glossary/#business-associate-agreement">business associate agreement</a> with every vendor that handles patient information, including us</li><li>Written office procedures, so that the practice operates identically on the days you are absent and on the days you are present</li></ul>`,
          '<p>We recommend software strictly on its merits and accept no commissions or referral fees from any vendor, which is the only way that advice about which system to purchase can be worth anything. We also deliberately stay out of computer repairs and medical billing, and we will gladly refer you to specialists who handle those responsibilities well.</p>',
        ],
        outcomes: [
          'Patients who book appointments, complete their paperwork, and receive reminders without ever needing to telephone the front desk',
          'Paper charts digitized, and an EHR configured around the way your practice actually operates from day to day',
          'A completed HIPAA security risk analysis, together with the corrective steps it identifies',
          'A business associate agreement signed with every vendor that touches patient information',
          'Written procedures for the front desk and the back office that a newly hired employee can actually follow',
          'Advice from someone who is compensated by you and by nobody else',
        ],
        meta: 'EHR setup, digital intake, online scheduling, and HIPAA risk analysis for independent practices in Southern California. No commissions from software vendors.',
      },
      es: {
        title: 'Digitalizar el consultorio',
        tagline: 'Menos papel, menos llamadas telefónicas y una recepción que ya no está desbordada.',
        summary:
          'Trasladamos los expedientes de los pacientes, la programación de citas, los formularios de admisión y los recordatorios a sistemas que funcionan en conjunto, partiendo de cómo se mueven realmente los pacientes por su consultorio y no del software que alguien quiera venderle. No aceptamos comisiones de los proveedores de software.',
        body: [
          '<p>Muchos consultorios independientes funcionan con un sistema de registros médicos electrónicos (EHR) que nunca llegó a configurarse del todo, una línea telefónica que la recepción no alcanza a atender y formularios en papel que alguien vuelve a transcribir después de cada cita. Cada uno de estos problemas consume tiempo del personal todos los días, y varios de ellos le cuestan al consultorio, sin que nadie lo note, pacientes que se rindieron antes de que alguien contestara.</p>',
          `<h2>Cómo funciona</h2><ul><li>Seguimos a un paciente desde la primera llamada telefónica hasta el recordatorio de seguimiento, y luego reparamos los pasos concretos por los que se pierden tiempo y dinero de manera constante</li><li>Programación de citas en línea, formularios de admisión y de consentimiento que los pacientes completan en su propio teléfono antes de llegar, y <a href="${SOURCES.remindersNoShows}">recordatorios automáticos que reducen las inasistencias a las citas</a></li><li>Expedientes en papel escaneados y organizados, y un sistema EHR configurado según la forma en que realmente trabajan su equipo clínico y su personal, para que de verdad lo utilicen</li><li>Un análisis de riesgos de seguridad conforme a HIPAA, <a href="${SOURCES.hipaaRiskAnalysis}">que HIPAA exige</a> a los <a href="${SOURCES.hipaaCoveredEntities}">consultorios que facturan a las aseguradoras de forma electrónica</a>, junto con un contrato de socio comercial firmado con cada proveedor que maneja información de pacientes, incluidos nosotros</li><li>Procedimientos escritos para el consultorio, de modo que funcione igual los días en que usted no está que los días en que sí está</li></ul>`,
          '<p>Recomendamos software exclusivamente por sus méritos y no aceptamos comisiones ni pagos por recomendación de ningún proveedor, porque solo así un consejo sobre qué sistema comprar puede valer algo. Tampoco nos dedicamos a reparar computadoras ni a la facturación, y con gusto le recomendaremos a personas que hacen bien ese trabajo.</p>',
        ],
        outcomes: [
          'Pacientes que reservan citas, completan sus formularios y reciben recordatorios sin necesidad de llamar a la recepción',
          'Expedientes en papel digitalizados y un sistema EHR configurado según la manera en que su consultorio realmente opera',
          'Un análisis de riesgos de seguridad conforme a HIPAA ya terminado, junto con las medidas correctivas que identifique',
          'Un contrato de socio comercial firmado con cada proveedor que maneja información de pacientes',
          'Procedimientos escritos para la recepción y la administración que un empleado nuevo realmente pueda seguir',
          'Asesoría de alguien a quien le paga usted y nadie más',
        ],
        meta: 'Configuración de EHR, formularios de admisión digitales, citas en línea y análisis de riesgos HIPAA para consultorios independientes del sur de California, sin comisiones.',
      },
      'zh-hans': {
        title: '诊所数字化',
        tagline: '更少的纸质文件、更少的电话，前台也不再应接不暇。',
        summary:
          '我们将病历、预约、初诊表格与提醒迁移到彼此协同运作的系统，出发点是患者在您诊所中的实际就诊流程，而非某人想卖给您的软件。我们不收取任何软件供应商的佣金。',
        body: [
          '<p>许多独立诊所的日常运作，依赖的是一套从未完整配置的电子病历（EHR）系统、一条前台始终接听不及的电话线路，以及每次看诊后都得有人重新录入的纸质表格。上述每一项都日复一日地消耗员工的时间；此外，其中数项更在无人察觉的情况下，使尚未等到有人接听便已放弃的患者就此流失。</p>',
          `<h2>怎么做</h2><ul><li>追踪一位患者从第一通电话到复诊提醒的完整流程，进而修补时间与金钱持续流失的具体环节</li><li>在线预约、患者到诊前即可在自己手机上填写的初诊表与知情同意书，以及<a href="${SOURCES.remindersNoShows}">能减少患者爽约的自动提醒</a></li><li>纸质病历经扫描后妥善整理，电子病历系统亦按照医护人员与员工的实际工作方式配置，从而让大家真正用起来</li><li>一份 HIPAA 安全风险分析（<a href="${SOURCES.hipaaCoveredEntities}">以电子方式申报保险理赔的诊所</a>均须<a href="${SOURCES.hipaaRiskAnalysis}">依 HIPAA 规定完成此项分析</a>），并与每一家经手患者信息的供应商签署业务伙伴协议，我们也不例外</li><li>书面化的诊所作业流程，让诊所在您不在场的日子，也能与您在场时一样运作</li></ul>`,
          '<p>我们只依软件本身的优劣提出建议，也不收取任何供应商的佣金或转介费，因为只有这样，关于该买哪一套系统的建议才有价值。电脑维修与医疗账务则并非我们的业务，我们会把您转介给在这些方面做得出色的专业人士。</p>',
        ],
        outcomes: [
          '患者无须致电前台，便能自行预约、填写表格并收到提醒',
          '纸质病历完成数字化，电子病历系统也按照诊所实际的运作方式配置妥当',
          '一份已完成的 HIPAA 安全风险分析，以及分析所找出的改进措施',
          '与每一家经手患者信息的供应商签署的业务伙伴协议',
          '前台与后勤的书面作业流程，新入职员工也能照着执行',
          '只由您付费、不受任何其他人支付报酬的专业建议',
        ],
        meta: '为南加州独立诊所提供电子病历配置、在线预约、数字化初诊表与 HIPAA 安全风险分析，且不收取任何软件供应商的佣金。',
      },
      'zh-hant': {
        title: '診所數位化',
        tagline: '更少的紙本、更少的電話，櫃檯也不再應接不暇。',
        summary:
          '我們將病歷、預約、初診表單與提醒移轉到彼此協同運作的系統，出發點是病患在您診所中的實際動線，而非某人想賣給您的軟體。我們不收取任何軟體廠商的佣金。',
        body: [
          '<p>許多獨立診所的日常運作，仰賴的是一套從未完整設定的電子病歷（EHR）系統、一條櫃檯始終接聽不及的電話線路，以及每次看診後都得有人重新輸入的紙本表單。上述每一項都日復一日地消耗員工的時間；此外，其中數項更在無人察覺的情況下，使尚未等到有人接聽便已放棄的病患就此流失。</p>',
          `<h2>怎麼做</h2><ul><li>追蹤一位病患從第一通電話到回診提醒的完整流程，進而修補時間與金錢持續流失的具體環節</li><li>線上預約、病患到診前即可在自己手機上填寫的初診資料表與同意書，以及<a href="${SOURCES.remindersNoShows}">能減少病患爽約的自動提醒</a></li><li>紙本病歷經掃描後妥善整理，電子病歷系統亦依照醫護人員與員工的實際工作方式設定，從而讓大家真正用起來</li><li>一份 HIPAA 資安風險分析（<a href="${SOURCES.hipaaCoveredEntities}">以電子方式申報保險理賠的診所</a>皆須<a href="${SOURCES.hipaaRiskAnalysis}">依 HIPAA 規定完成此項分析</a>），並與每一家經手病患資訊的廠商簽署業務夥伴合約，我們也不例外</li><li>書面化的診所作業流程，讓診所在您不在場的日子，也能與您在場時一樣運作</li></ul>`,
          '<p>我們只依軟體本身的優劣提出建議，也不收取任何廠商的佣金或轉介費，因為只有這樣，關於該買哪一套系統的建議才有價值。電腦維修與醫療帳務則並非我們的業務，我們會把您轉介給在這些方面做得出色的專業人士。</p>',
        ],
        outcomes: [
          '病患無須致電櫃檯，便能自行預約、填寫表單並收到提醒',
          '紙本病歷完成數位化，電子病歷系統也依照診所實際的運作方式設定妥當',
          '一份已完成的 HIPAA 資安風險分析，以及分析所找出的改善措施',
          '與每一家經手病患資訊的廠商簽署的業務夥伴合約',
          '櫃檯與後勤的書面作業流程，新進員工也能照著執行',
          '只由您付費、不受任何其他人支付報酬的專業建議',
        ],
        meta: '為南加州獨立診所提供電子病歷設定、線上預約、數位初診表與 HIPAA 資安風險分析，且不收取任何軟體廠商的佣金。',
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
