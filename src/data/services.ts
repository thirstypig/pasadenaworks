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
        title: 'Revisión integral del consultorio',
        tagline: 'Descubra con precisión qué le está costando pacientes a su consultorio antes de pagarle a alguien para corregirlo.',
        summary:
          'Una revisión de precio fijo de todo el consultorio —los teléfonos y los formularios de admisión, los expedientes y el EHR, el sitio web y su Perfil de Negocio de Google— que concluye con un plan breve por escrito que ordena qué corregir primero. Si continúa con nosotros, el costo de la revisión se abona al trabajo posterior.',
        body: [
          '<p>La mayoría de los consultorios que se comunican con nosotros creen tener un problema de marketing, y aunque algunos efectivamente lo tienen, con igual frecuencia los pacientes potenciales ya están llamando mientras el consultorio los pierde en algún punto entre un mensaje de voz que nadie devuelve y un portapapeles con formularios de admisión que tarda veinte minutos en completarse. La publicidad no puede reparar ninguna de esas fallas, y precisamente por eso examinamos el consultorio completo antes de recomendar cualquier cosa.</p>',
          '<h2>Cómo funciona</h2><ul><li>Una conversación con usted y con su personal de recepción, porque quienes contestan los teléfonos suelen entender mejor que nadie en qué momento se complica el día</li><li>Un recorrido por la experiencia completa de un paciente, desde la primera búsqueda o llamada telefónica, pasando por el registro y la cita en sí, hasta el recordatorio de su próxima visita</li><li>Una revisión de cómo está configurado realmente su sistema de registros médicos electrónicos (EHR), de cómo están organizados los expedientes de sus pacientes y de cómo su Perfil de Negocio de Google, sus reseñas y su sitio web presentan el consultorio ante alguien que está decidiendo si llamar</li><li>Un plan conciso por escrito que ordena cada recomendación según la rapidez con la que se pagará sola, con un precio fijo para cualquier trabajo posterior acordado por escrito antes de empezar</li></ul>',
          '<p>En ocasiones el plan concluye que el consultorio se encuentra en condiciones considerablemente mejores de lo que usted temía, y que el siguiente paso más valioso cuesta muy poco; cuando eso sucede, lo documentaremos con la misma franqueza con que documentaríamos una recomendación costosa.</p>',
        ],
        outcomes: [
          'Un mapa documentado del recorrido de un paciente por su consultorio, que identifica cada punto en el que los pacientes potenciales se dan por vencidos hoy',
          'Una evaluación franca de qué tan bien sirven al consultorio sus expedientes, la configuración de su EHR y el flujo de trabajo de la recepción',
          'Un análisis de cómo se presenta el consultorio ante un paciente potencial que lo busca, ya sea en Google, en las reseñas, en su sitio web o en los directorios de salud',
          'Un plan por escrito ordenado por prioridad, en lugar de una presentación que nadie vuelve a abrir',
          'El costo de la revisión, abonado a cualquier trabajo posterior que decida realizar con nosotros',
        ],
        meta: 'Revisión de precio fijo para consultorios médicos, dentales y de optometría del sur de California: expedientes, EHR, recepción y presencia en línea.',
      },
      'zh-hans': {
        title: '诊所全面体检',
        tagline: '在花钱请任何人修正之前，先准确找出究竟是什么让您的诊所流失患者。',
        summary:
          '针对整间诊所进行一次固定价格的检视——电话与初诊表格、病历与电子病历系统、网站与 Google 商家资料——最后提出一份简短的书面计划，依轻重缓急排列应当优先处理的事项。若您后续继续与我们合作，这笔费用将抵扣后续工作的费用。',
        body: [
          '<p>多数联系我们的诊所都认为自己面临的是营销问题；尽管其中确实有些诊所如此，但同样常见的情况是，潜在患者早已打来电话，诊所却在一则无人回复的语音留言与一叠需要二十分钟才填得完的初诊表格之间，把他们流失掉。广告无法弥补上述任何一项缺失，因此我们在提出任何建议之前，都会先检视整间诊所。</p>',
          '<h2>怎么做</h2><ul><li>与您以及前台人员面谈，因为负责接听电话的人往往比任何人都清楚，一天的工作究竟在哪个环节出了问题</li><li>完整走一遍一位患者的就诊经历：从最初的搜索或来电，经过挂号与看诊本身，一直到下次复诊的提醒</li><li>检视您的电子病历系统实际如何配置、患者病历如何整理，以及您的 Google 商家资料、评价与网站，在一位正考虑是否来电的人眼中呈现出怎样的诊所</li><li>一份简明的书面计划，依每项建议回本的快慢排列优先顺序，后续任何工作的固定价格都会在开工前以书面方式约定</li></ul>',
          '<p>有时候，计划的结论是诊所的状况比您担心的好得多，而最有价值的下一步花费甚少；遇到这种情况，我们会像记录一项昂贵建议那样，同样照实写下来。</p>',
        ],
        outcomes: [
          '一份书面记录的患者就诊路径图，标出目前潜在患者会在哪些环节放弃',
          '一份坦率的评估，说明您的病历、电子病历系统配置与前台作业流程，实际上为诊所发挥了多少作用',
          '一份评估，说明潜在患者搜索您的诊所时——无论是在 Google、评价、网站还是医疗名录上——看到的是怎样的诊所',
          '一份按优先顺序排列的书面计划，而非一份没有人会再打开第二次的简报',
          '体检费用可抵扣您日后选择与我们合作的任何后续工作',
        ],
        meta: '为南加州独立医疗、牙科与眼科诊所提供固定价格的全面体检：检视病历、电子病历系统、前台流程与线上曝光，并排出优先顺序。',
      },
      'zh-hant': {
        title: '診所全面健檢',
        tagline: '在花錢請任何人修正之前，先準確找出究竟是什麼讓您的診所流失病患。',
        summary:
          '針對整間診所進行一次固定價格的檢視——電話與初診表單、病歷與電子病歷系統、網站與 Google 商家檔案——最後提出一份簡短的書面計畫，依輕重緩急排列應當優先處理的事項。若您後續繼續與我們合作，這筆費用將抵扣後續工作的費用。',
        body: [
          '<p>多數聯絡我們的診所都認為自己面臨的是行銷問題；儘管其中確實有些診所如此，但同樣常見的情況是，潛在病患早已打來電話，診所卻在一則無人回覆的語音留言與一疊需要二十分鐘才填得完的初診表單之間，把他們流失掉。廣告無法彌補上述任何一項缺失，因此我們在提出任何建議之前，都會先檢視整間診所。</p>',
          '<h2>怎麼做</h2><ul><li>與您以及櫃檯人員面談，因為負責接聽電話的人往往比任何人都清楚，一天的工作究竟在哪個環節出了問題</li><li>完整走一遍一位病患的就診經驗：從最初的搜尋或來電，經過掛號與看診本身，一直到下次回診的提醒</li><li>檢視您的電子病歷系統實際如何設定、病患病歷如何整理，以及您的 Google 商家檔案、評論與網站，在一位正考慮是否來電的人眼中呈現出怎樣的診所</li><li>一份簡明的書面計畫，依每項建議回本的快慢排列優先順序，後續任何工作的固定價格都會在開工前以書面方式約定</li></ul>',
          '<p>有時候，計畫的結論是診所的狀況比您擔心的好得多，而最有價值的下一步花費甚少；遇到這種情況，我們會像記錄一項昂貴建議那樣，同樣照實寫下來。</p>',
        ],
        outcomes: [
          '一份書面記錄的病患就診路徑圖，標出目前潛在病患會在哪些環節放棄',
          '一份坦率的評估，說明您的病歷、電子病歷系統設定與櫃檯作業流程，實際上為診所發揮了多少作用',
          '一份評估，說明潛在病患搜尋您的診所時——無論是在 Google、評論、網站還是醫療名錄網站上——看到的是怎樣的診所',
          '一份按優先順序排列的書面計畫，而非一份沒有人會再打開第二次的簡報',
          '健檢費用可抵扣您日後選擇與我們合作的任何後續工作',
        ],
        meta: '為南加州獨立醫療、牙科與眼科診所提供固定價格的全面健檢：檢視病歷、電子病歷系統、櫃檯流程與線上曝光，並排出優先順序。',
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
        title: 'Conseguir más pacientes',
        tagline: 'Más de los pacientes que usted busca, con evidencia de la procedencia exacta de cada uno.',
        summary:
          'Antes de llamar, la mayoría de los pacientes revisan su Perfil de Negocio de Google, sus reseñas y su sitio web, así que primero ponemos todo eso en orden. Después recuperamos a los pacientes con visitas atrasadas y anunciamos solo los tratamientos que vale la pena anunciar, rastreando el origen de cada paciente nuevo.',
        body: [
          '<p>Antes de llamar, un paciente potencial suele querer saber cinco cosas: si usted acepta su seguro, si está recibiendo pacientes nuevos, qué idiomas se hablan en el consultorio, dónde estacionarse y si puede reservar una cita en línea. Un consultorio que responde esas preguntas de inmediato frecuentemente recibe la llamada en lugar de un competidor de la misma calle que no lo hace, y por eso ninguna cantidad de publicidad ayuda mientras esos fundamentos no estén en orden.</p>',
          `<h2>Primero, lo básico</h2><ul><li>Su Perfil de Negocio de Google completo y verificado, <a href="${google(SOURCES.googlePractitionerListings, 'es')}">con un perfil separado para cada profesional de la salud</a>, ya que los pacientes potenciales con frecuencia buscan a un profesional por su nombre</li><li>Un flujo constante y predecible de reseñas: un mensaje de texto automático después de cada cita que se las pide a todos los pacientes, <a href="${google(SOURCES.googleReviewPolicy, 'es')}">nunca solo a los satisfechos y nunca a cambio de algo</a></li><li>Respuestas a las reseñas redactadas de modo que nunca confirmen que quien escribe es paciente, <a href="${SOURCES.hhsReviewResponseSettlement}">una infracción de HIPAA por la que las autoridades federales multaron a un consultorio dental con 50,000 dólares</a></li><li>Healthgrades, Zocdoc, WebMD y los directorios de proveedores de sus aseguradoras, corregidos para que todos coincidan con su Perfil de Negocio de Google</li><li>Un sitio web rápido que cumple con el estándar de accesibilidad WCAG 2.1 AA, disponible en español o en chino dondequiera que sus pacientes hablen esos idiomas</li></ul>`,
          `<p><a href="${SOURCES.medicarePartBCoverage}">Los consultorios que aceptan la Parte B de Medicare</a> actualmente están obligados por una regulación federal a que sus sitios web cumplan dicho estándar de accesibilidad, <a href="${SOURCES.section504Extension}">a más tardar en mayo de 2027 si tienen quince empleados o más y en mayo de 2028 si son más pequeños</a>.</p>`,
          `<h2>Después, el crecimiento</h2><p>La cita más económica que la mayoría de los consultorios llegará a agendar proviene de un paciente que ya está atrasado: el examen anual de la vista, la limpieza dental de cada seis meses, la consulta de seguimiento que nunca se programó. La mayoría de los consultorios les recuerda a esos pacientes de forma irregular o sencillamente no lo hace, por lo que el crecimiento comienza precisamente ahí, antes de destinar un solo dólar a la publicidad.</p><ul><li>Un sistema de seguimiento que registra de dónde vino originalmente cada paciente nuevo, para que el informe mensual pueda responder con honestidad si la inversión se pagó sola</li><li>Mensajes de recordatorio y reactivación para pacientes con visitas atrasadas, <a href="${SOURCES.hipaaMarketing}">redactados dentro de las reglas de HIPAA sobre el marketing dirigido a pacientes</a></li><li>Una página dedicada a cada tratamiento de alto valor que usted ofrece, escrita según la forma específica en que los pacientes potenciales realmente lo buscan</li><li>Publicidad en la búsqueda de Google solo para tratamientos en los que un paciente nuevo realmente justifica el costo, con un tope de presupuesto que no se le puede escapar sin que usted lo note</li></ul>`,
          `<p>Hay cosas que no haremos: dirigir publicidad a personas según una condición de salud, colocar código de rastreo publicitario en páginas de citas o de admisión <a href="${SOURCES.ocrTrackingTech}">donde puede transmitir información de pacientes a una plataforma de publicidad</a>, ni pagarle a nadie por referencias, algo que prohíben las leyes <a href="${SOURCES.calBusProf650}">estatales</a> y <a href="${SOURCES.federalAks}">federales</a> contra los sobornos. Usted conserva la propiedad del sitio web, del dominio y del contenido, porque retener como rehén el sitio web de un cliente constituye un modelo de negocio deficiente y una manera todavía peor de tratar a las personas.</p>`,
        ],
        outcomes: [
          'Perfiles de Negocio de Google completos y verificados para el consultorio y para cada profesional de la salud',
          'Una solicitud de reseña que llega a cada paciente después de cada cita, y respuestas que nunca confirman que alguien es paciente',
          'Fichas en directorios de salud y de aseguradoras que coinciden con su Perfil de Negocio de Google',
          'Un sitio web que carga rápidamente en el teléfono, responde en primer lugar las preguntas que formulan los pacientes y cumple con WCAG 2.1 AA, en español o en chino si sus pacientes lo necesitan',
          'Mensajes de recordatorio que reincorporan sistemáticamente a los pacientes atrasados a la agenda de citas',
          'Publicidad en buscadores con un tope de presupuesto firme, usada solo donde los números realmente cuadran',
          'Una nota mensual que explica cuánto invirtió, qué rendimiento obtuvo y de dónde provino cada paciente nuevo',
        ],
        meta: 'Sitios web, Perfil de Negocio de Google, reseñas, recordatorios a pacientes y anuncios en Google para consultorios independientes del sur de California, con resultados medidos.',
      },
      'zh-hans': {
        title: '获取更多患者',
        tagline: '更多您想要的患者，并清楚掌握每一位究竟从何而来。',
        summary:
          '多数患者在来电之前，都会先查看您的 Google 商家资料、评价与网站，因此我们会先把这些做好。接着，我们会召回逾期未复诊的患者，并只为值得投放的治疗项目做广告，每一位新患者的来源都有迹可循。',
        body: [
          '<p>潜在患者在来电之前，通常想知道五件事：您是否接受他们的保险、是否仍在接收新患者、诊所使用哪些语言、在哪里停车，以及能否在线预约。能立即回答这些问题的诊所，往往能接到这通电话，而非让它落入同一条街上做不到这点的竞争对手手中；因此，在这些基本功做好之前，再多的广告也无济于事。</p>',
          `<h2>第一步：打好基础</h2><ul><li>完整填写并验证您的 Google 商家资料；潜在患者经常直接搜索医生的名字，因此<a href="${google(SOURCES.googlePractitionerListings, 'zh-hans')}">应为每一位医生分别建立商家资料</a></li><li>稳定而可预期的评价来源：每次看诊后自动发送短信邀请每一位患者留下评价，<a href="${google(SOURCES.googleReviewPolicy, 'zh-hans')}">绝不只邀请满意的患者，也绝不以任何回报作为交换</a></li><li>回复评价时绝不证实评价者是患者；<a href="${SOURCES.hhsReviewResponseSettlement}">美国联邦监管机构曾因这类违反 HIPAA 的行为，对一家牙科诊所处以 50,000 美元罚款</a></li><li>Healthgrades、Zocdoc、WebMD 以及各保险公司的医疗服务提供者名录，全部更正至与您的 Google 商家资料一致</li><li>符合 WCAG 2.1 AA 无障碍标准的快速网站，并视患者使用的语言提供西班牙文或中文版本</li></ul>`,
          `<p><a href="${SOURCES.medicarePartBCoverage}">接受联邦医疗保险（Medicare）B 部分的诊所</a>，如今依联邦法规必须让网站符合上述无障碍标准，<a href="${SOURCES.section504Extension}">员工十五人以上的诊所须在 2027 年 5 月前完成，规模较小的诊所则须在 2028 年 5 月前完成</a>。</p>`,
          `<h2>第二步：带动增长</h2><p>多数诊所所能获得的成本最低的一次预约，来自一位早已逾期的患者：每年一次的眼科检查、每半年一次的洗牙、始终没有排上的复诊。多数诊所对这些患者的提醒时有时无，甚至完全没有，因此增长从这里开始，在花任何一分钱做广告之前。</p><ul><li>记录每一位新患者最初从何而来的追踪机制，让每月报告能如实回答这笔支出是否已经回本</li><li>针对逾期未复诊患者的召回与重新联系信息，<a href="${SOURCES.hipaaMarketing}">内容符合 HIPAA 关于向患者进行营销的规定</a></li><li>为您提供的每一项高价值治疗建立专属页面，按照潜在患者实际的搜索方式撰写</li><li>只为新患者确实值得这笔成本的治疗项目投放 Google 搜索广告，并设定不会在不知不觉中超支的预算上限</li></ul>`,
          `<p>有些事情我们不会做：根据健康状况定向投放广告；在预约或初诊页面放置广告追踪代码，<a href="${SOURCES.ocrTrackingTech}">这类代码可能将患者信息传给广告平台</a>；或者为转介向任何人付费，<a href="${SOURCES.calBusProf650}">加州</a>与<a href="${SOURCES.federalAks}">联邦</a>的反回扣法律均禁止此类行为。网站、域名与内容的所有权始终归您，因为把客户的网站扣作筹码，既是拙劣的商业模式，更是糟糕的待人之道。</p>`,
        ],
        outcomes: [
          '为诊所及每一位个体从业者完成并验证 Google 商家资料',
          '每次看诊后都会送达每一位患者的评价邀请，以及绝不证实任何人是患者的评价回复',
          '与您的 Google 商家资料一致的医疗名录与保险公司信息',
          '在手机上加载迅速、优先回答患者最先询问的问题，并符合 WCAG 2.1 AA 的网站，如有需要可提供西班牙文或中文版本',
          '有系统地将逾期患者带回预约排程的召回信息',
          '设有严格预算上限、只在数字确实划算时才投放的搜索广告',
          '每月一份说明：花了多少、带来多少回报，以及每一位新患者来自何处',
        ],
        meta: '为南加州独立医疗、牙科与眼科诊所提供网站、Google 商家资料、评价管理、患者召回与搜索广告，并追踪每一位新患者的来源。',
      },
      'zh-hant': {
        title: '吸引更多病患',
        tagline: '更多您想要的病患，並清楚掌握每一位究竟從何而來。',
        summary:
          '多數病患在來電之前，都會先查看您的 Google 商家檔案、評論與網站，因此我們會先把這些做好。接著，我們會召回逾期未回診的病患，並只為值得投放的治療項目刊登廣告，每一位新病患的來源都有跡可循。',
        body: [
          '<p>潛在病患在來電之前，通常想知道五件事：您是否接受他們的保險、是否仍在接受新病患、診所使用哪些語言、在哪裡停車，以及能否線上預約。能立即回答這些問題的診所，往往能接到這通電話，而非讓它落入同一條街上做不到這點的競爭對手手中；因此，在這些基本功做好之前，再多的廣告也無濟於事。</p>',
          `<h2>第一步：打好基礎</h2><ul><li>完整填寫並驗證您的 Google 商家檔案；潛在病患經常直接搜尋醫師的名字，因此<a href="${google(SOURCES.googlePractitionerListings, 'zh-hant')}">應為每一位醫師分別建立商家檔案</a></li><li>穩定而可預期的評論來源：每次看診後自動傳送簡訊邀請每一位病患留下評論，<a href="${google(SOURCES.googleReviewPolicy, 'zh-hant')}">絕不只邀請滿意的病患，也絕不以任何回饋作為交換</a></li><li>回覆評論時絕不證實評論者是病患；<a href="${SOURCES.hhsReviewResponseSettlement}">美國聯邦主管機關曾因這類違反 HIPAA 的行為，對一家牙醫診所處以 50,000 美元罰款</a></li><li>Healthgrades、Zocdoc、WebMD 以及各保險公司的醫療服務提供者名錄，全部更正至與您的 Google 商家檔案一致</li><li>符合 WCAG 2.1 AA 無障礙標準的快速網站，並視病患使用的語言提供西班牙文或中文版本</li></ul>`,
          `<p><a href="${SOURCES.medicarePartBCoverage}">接受聯邦醫療保險（Medicare）B 部分的診所</a>，如今依聯邦法規必須讓網站符合上述無障礙標準，<a href="${SOURCES.section504Extension}">員工十五人以上的診所須在 2027 年 5 月前完成，規模較小的診所則須在 2028 年 5 月前完成</a>。</p>`,
          `<h2>第二步：帶動成長</h2><p>多數診所所能獲得的成本最低的一次預約，來自一位早已逾期的病患：每年一次的眼科檢查、每半年一次的洗牙、始終沒有排上的回診。多數診所對這些病患的提醒時有時無，甚至完全沒有，因此成長從這裡開始，在花任何一塊錢刊登廣告之前。</p><ul><li>記錄每一位新病患最初從何而來的追蹤機制，讓每月報告能如實回答這筆支出是否已經回本</li><li>針對逾期未回診病患的召回與重新聯繫訊息，<a href="${SOURCES.hipaaMarketing}">內容符合 HIPAA 關於向病患進行行銷的規定</a></li><li>為您提供的每一項高價值治療建立專屬頁面，依照潛在病患實際的搜尋方式撰寫</li><li>只為新病患確實值得這筆成本的治療項目刊登 Google 搜尋廣告，並設定不會在不知不覺中超支的預算上限</li></ul>`,
          `<p>有些事情我們不會做：依健康狀況鎖定投放廣告；在預約或初診頁面放置廣告追蹤程式碼，<a href="${SOURCES.ocrTrackingTech}">這類程式碼可能將病患資訊傳給廣告平台</a>；或是為轉介向任何人付費，<a href="${SOURCES.calBusProf650}">加州</a>與<a href="${SOURCES.federalAks}">聯邦</a>的反回扣法律皆禁止此類行為。網站、網域與內容的所有權始終歸您，因為把客戶的網站扣作籌碼，既是拙劣的商業模式，更是糟糕的待人之道。</p>`,
        ],
        outcomes: [
          '為診所及每一位個人專業執業人員完成並驗證 Google 商家檔案',
          '每次看診後都會送達每一位病患的評論邀請，以及絕不證實任何人是病患的評論回覆',
          '與您的 Google 商家檔案一致的醫療名錄與保險公司資訊',
          '在手機上載入迅速、優先回答病患最先詢問的問題，並符合 WCAG 2.1 AA 的網站，如有需要可提供西班牙文或中文版本',
          '有系統地將逾期病患帶回預約排程的召回訊息',
          '設有嚴格預算上限、只在數字確實划算時才刊登的搜尋廣告',
          '每月一份說明：花了多少、帶來多少回報，以及每一位新病患來自何處',
        ],
        meta: '為南加州獨立醫療、牙科與眼科診所提供網站、Google 商家檔案、評論管理、病患召回與搜尋廣告，並追蹤每一位新病患的來源。',
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
