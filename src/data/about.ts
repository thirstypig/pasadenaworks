import type { Locale } from '../i18n/ui';

/*
 * The About page, all four locales. Claims are limited to what the owner
 * stated on 2026-09-21 and recorded in
 * docs/superpowers/specs/2026-09-21-positioning-about-transition-sources.md:
 * first name James, eight years in product, rebuilt practice websites, EHR
 * workflow consulting. Add a claim there before adding it here. Never add a
 * surname, a family member or a client name — this repo is public.
 */

export interface AboutCopy {
  /** <title>. */
  title: string;
  /** Meta description, 155 characters at most. Not scored for readability. */
  meta: string;
  /** The page's <h1>. */
  heading: string;
  /** Exactly three: who, what we have done, how we are paid. */
  sections: { heading: string; body: string[] }[];
}

export const about: Record<Locale, AboutCopy> = {
  en: {
    title: 'About Pasadena Works — Paid by the Practice and Nobody Else',
    meta: 'Pasadena Works is run by James, who has spent eight years in product management. We are paid by the practice and nobody else.',
    heading: 'Paid by the practice, and nobody else',
    sections: [
      {
        heading: 'Who you would be working with',
        body: [
          'Pasadena Works is run by James, who has spent eight years in product management, which is the work of deciding what a piece of software should do, for whom, and why, before anyone builds it. That habit is the whole method here. Before we recommend a tool, we watch how your front desk actually handles a new patient, a refill request, or a rescheduled appointment, because a system that fits the way your staff already works will be used, whereas one chosen from a vendor’s demonstration usually ends up running alongside the paper it was bought to replace.',
        ],
      },
      {
        heading: 'What we have done inside practices',
        body: [
          'The work so far has been of two kinds. We have rebuilt practice websites so that a patient can find the hours, the accepted insurance, and the way to book an appointment without having to call, and we have consulted on EHR workflows, which means mapping who enters what, and at which step, before the practice commits to configuring a system around it. We describe that work in general terms because we do not name a client without its written permission.',
        ],
      },
      {
        heading: 'How we are paid',
        body: [
          'We are paid by the practice and by nobody else. Because we take no commission from software vendors, we have no reason to recommend one EHR over another except that it suits your office; because we take no fee from practice brokers, our advice to a doctor who is considering a sale does not depend on whether the sale happens. When something you are considering is not worth the money, we will say so, even when the thing in question is our own work.',
        ],
      },
    ],
  },

  es: {
    title: 'Sobre Pasadena Works — Nos paga el consultorio y nadie más',
    meta: 'Pasadena Works está dirigida por James, con ocho años de experiencia en gestión de producto. Nos paga el consultorio y nadie más.',
    heading: 'Nos paga el consultorio, y nadie más',
    sections: [
      {
        heading: 'Con quién trabajaría',
        body: [
          'Pasadena Works está dirigida por James, quien ha pasado ocho años en la gestión de producto, es decir, el trabajo de decidir qué debe hacer un programa, para quién y por qué, antes de que alguien lo construya. Ese hábito es todo el método que seguimos aquí. Antes de recomendar una herramienta, observamos cómo su recepción atiende de verdad a un paciente nuevo, una solicitud de resurtido de receta o una cita reprogramada, porque un sistema que se ajusta a la forma en que ya trabaja su personal se llega a usar, mientras que uno elegido a partir de una demostración del proveedor suele terminar funcionando junto al papel que se compró para reemplazar.',
        ],
      },
      {
        heading: 'Lo que hemos hecho dentro de los consultorios',
        body: [
          'El trabajo hasta ahora ha sido de dos tipos. Hemos reconstruido sitios web de consultorios para que un paciente encuentre el horario, los seguros que se aceptan y la manera de pedir una cita sin tener que llamar, y hemos asesorado sobre los flujos de trabajo del expediente clínico electrónico (EHR), lo cual significa establecer quién ingresa cada dato y en qué paso, antes de que el consultorio se comprometa a configurar un sistema alrededor de eso. Describimos ese trabajo en términos generales porque no nombramos a un cliente sin su permiso por escrito.',
        ],
      },
      {
        heading: 'Cómo nos pagan',
        body: [
          'Nos paga el consultorio y nadie más. Como no aceptamos comisiones de los proveedores de software, no tenemos ningún motivo para recomendar un EHR sobre otro salvo que le convenga a su consultorio; como no aceptamos honorarios de los intermediarios que venden consultorios, el consejo que le damos a un médico que considera una venta no depende de que esa venta se realice. Cuando algo que usted está considerando no vale lo que cuesta, se lo diremos, incluso cuando lo que está en juego sea nuestro propio trabajo.',
        ],
      },
    ],
  },

  'zh-hans': {
    title: '关于 Pasadena Works——报酬只来自诊所，别无他人',
    meta: 'Pasadena Works 由 James 主理，拥有八年产品管理经验。我们只收取诊所的报酬，不收任何其他方的钱。',
    heading: '报酬只来自诊所，别无他人',
    sections: [
      {
        heading: '您将与谁合作',
        body: [
          'Pasadena Works 由 James 主理，他有八年产品管理经验——所谓产品管理，就是在动手开发之前，先确定一款软件应该做什么、面向谁、为何而做。这种习惯正是我们工作方法的核心。在推荐任何工具之前，我们会先观察前台如何实际处理新患者、续药请求或改期预约，因为一套贴合员工现有工作方式的系统才会被真正使用，而仅凭供应商演示选定的系统，往往最终只是与本该被取代的纸质流程并存。',
        ],
      },
      {
        heading: '我们在诊所内做过的工作',
        body: [
          '目前的工作大致分为两类。我们重建过诊所网站，使患者无需致电即可查到营业时间、接受的保险以及预约方式；我们也就电子病历系统（EHR）的工作流程提供过咨询，也就是在诊所决定围绕某套系统进行配置之前，先厘清由谁在哪一步录入哪些信息。我们只以概括的方式描述这些工作，因为未经书面许可，我们不会说出任何客户的名字。',
        ],
      },
      {
        heading: '我们的报酬从何而来',
        body: [
          '我们的报酬只来自诊所，不来自任何其他人。由于我们不从软件供应商那里抽取佣金，因此除了是否适合您的诊所之外，我们没有理由偏向推荐某一款电子病历系统；由于我们不从诊所买卖中介那里收取费用，我们给正在考虑出售诊所的医生的建议，并不取决于这笔交易是否成交。如果您正在考虑的方案并不值这笔钱，我们会直说，即使所涉及的正是我们自己的工作。',
        ],
      },
    ],
  },

  'zh-hant': {
    title: '關於 Pasadena Works——報酬只來自診所，別無他人',
    meta: 'Pasadena Works 由 James 主理，擁有八年產品管理經驗。我們只收取診所的報酬，不收任何其他方的錢。',
    heading: '報酬只來自診所，別無他人',
    sections: [
      {
        heading: '您將與誰合作',
        body: [
          'Pasadena Works 由 James 主理，他有八年產品管理經驗——所謂產品管理，就是在動手開發之前，先確定一款軟體應該做什麼、面向誰、為何而做。這種習慣正是我們工作方法的核心。在推薦任何工具之前，我們會先觀察櫃檯如何實際處理新病患、續藥請求或改期預約，因為一套貼合員工現有工作方式的系統才會被真正使用，而僅憑廠商展示選定的系統，往往最終只是與本該被取代的紙本流程並存。',
        ],
      },
      {
        heading: '我們在診所內做過的工作',
        body: [
          '目前的工作大致分為兩類。我們重建過診所網站，使病患無需致電即可查到營業時間、接受的保險以及預約方式；我們也就電子病歷系統（EHR）的工作流程提供過諮詢，也就是在診所決定圍繞某套系統進行設定之前，先釐清由誰在哪一步輸入哪些資料。我們只以概括的方式描述這些工作，因為未經書面許可，我們不會說出任何客戶的名字。',
        ],
      },
      {
        heading: '我們的報酬從何而來',
        body: [
          '我們的報酬只來自診所，不來自任何其他人。由於我們不從軟體廠商那裡抽取佣金，因此除了是否適合您的診所之外，我們沒有理由偏向推薦某一款電子病歷系統；由於我們不從診所買賣仲介那裡收取費用，我們給正在考慮出售診所的醫師的建議，並不取決於這筆交易是否成交。如果您正在考慮的方案並不值這筆錢，我們會直說，即使所涉及的正是我們自己的工作。',
        ],
      },
    ],
  },
};
