import type { Locale } from '../i18n/ui';

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
 *  Order of this array = display order on the site. Reordered 2026-08-27:
 *  websites → search → online marketing (id stays 'ads' internally, see
 *  below) → consulting last.
 *
 *  `body` and `outcomes` strings render as raw HTML (`set:html` in
 *  [service].astro), not plain text — so `<a href="/glossary/#...">term</a>`
 *  works for linking a technical term to its glossary entry. The glossary
 *  (src/data/glossary.ts) is English-only on purpose, so only link to it
 *  from English copy — a Spanish/Chinese reader clicking through to an
 *  English definition page would be a worse experience than no link.
 */

export interface ServiceCopy {
  title: string;
  tagline: string;
  /** Shown on the services index card. One sentence — keep it short; the
   *  detail page (title/tagline/body/outcomes below) is where the fuller
   *  explanation and technical detail belongs. */
  summary: string;
  /** Body paragraphs on the detail page. Renders as HTML — see note above. */
  body: string[];
  /** Concrete deliverables, shown under the "View service" heading on the
   *  detail page. Renders as HTML — see note above. Keep these things a
   *  client can point at. */
  outcomes: string[];
  /** Meta description for search results. Aim for 150–158 characters. */
  meta: string;
}

export interface Service {
  id: string;
  slugs: Record<Locale, string>;
  t: Record<Locale, ServiceCopy>;
}

export const services: Service[] = [
  /* ── 1. Website development ─────────────────────────────────────────── */
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
        title: 'Websites that bring in work',
        tagline: "So a slow, outdated site doesn't send customers to someone else.",
        summary:
          "If your site loads slowly or doesn't say clearly what you do, people leave. We build fast, simple sites you actually own when we're done.",
        body: [
          "Most small business websites were built once, years ago, by someone who has since stopped answering emails. They load slowly on a phone, the hours are wrong, and there's no obvious way to get in touch. Meanwhile the customer already left and called the shop down the street.",
          "We build sites that fix the basics first: fast on a phone, correct information, and a phone number or form that is impossible to miss. Then we make sure Google can actually read the thing — which is where most sites quietly fail.",
          'You own everything. The site, the domain, the content. If you ever want to move on, you take it with you. No hostage situations.',
          'If you already use other tools — a CRM, a booking calendar, an email list — we can wire up <a href="/glossary/#integrations">integrations</a> so a new lead or booking lands there automatically instead of you copying it over by hand. That kind of <a href="/glossary/#workflow-automation">workflow automation</a> is optional — plenty of businesses are better served keeping things simple, and we\'ll tell you honestly which one you are.',
        ],
        outcomes: [
          'A site that loads in under two seconds on a phone',
          'Clean, real HTML so Google — and AI tools — can actually read your content, not just display it',
          'A contact form that reaches your inbox, not a black hole',
          '<a href="/glossary/#google-business-profile">Google Business Profile</a> connected and verified',
          'Optional: CRM or calendar <a href="/glossary/#integrations">integrations</a>, so new leads land where you already work',
          'Optional: the whole site in Spanish or Chinese',
        ],
        meta: 'Small business website design for Pasadena and the San Gabriel Valley. Fast, clear sites that load on a phone and are easy for customers to find.',
      },
      es: {
        title: 'Sitios web que traen clientes',
        tagline: 'Para que un sitio lento y anticuado no le mande sus clientes a otro.',
        summary:
          'Si su sitio carga lento o no dice con claridad qué hace, la gente se va. Construimos sitios rápidos y simples que usted sí es dueño cuando terminamos.',
        body: [
          'La mayoría de los sitios web de negocios pequeños se hicieron una sola vez, hace años, por alguien que ya no contesta los correos. Cargan lento en el teléfono, el horario está equivocado y no hay forma obvia de comunicarse. Mientras tanto, el cliente ya se fue y llamó al negocio de la otra cuadra.',
          'Nosotros construimos sitios que arreglan lo básico primero: rápidos en el teléfono, con información correcta, y un número o formulario imposible de pasar por alto. Después nos aseguramos de que Google realmente pueda leer el sitio, que es donde la mayoría falla sin que nadie se dé cuenta.',
          'Todo es suyo. El sitio, el dominio, el contenido. Si algún día quiere irse, se lo lleva. Aquí nadie retiene nada.',
          'Si ya usa otras herramientas — un CRM, un calendario de citas, una lista de correo — podemos conectar su sitio con integraciones, para que un cliente nuevo o una cita aparezca ahí automáticamente en vez de que usted lo copie a mano. Eso es opcional: muchos negocios están mejor manteniendo las cosas simples, y se lo diremos con honestidad si ese es su caso.',
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
          '如果网站打开慢，或说不清楚您是做什么的，客人转身就走。我们做又快又简单的网站，做完之后完全归您。',
        body: [
          '大部分小生意的网站都是很多年前做的，做网站的人早就联系不上了。手机上打开很慢，营业时间是错的，也找不到联系方式。等客人找了半天，早就转头打给隔壁那家了。',
          '我们先把最基本的事情做好：手机上打开快、信息准确、电话和留言表单放在一眼就能看到的位置。然后我们会确保谷歌真的能读懂您的网站——大多数网站正是在这一步悄悄地失败了。',
          '所有东西都归您：网站、域名、内容。哪天您想换人做，全部都可以带走。我们不扣任何东西。',
          '如果您已经在用别的工具——CRM、预约日历、邮件名单——我们可以帮您接入集成功能，让新客人或预约自动进到那些工具里，不用您手动复制。这属于工作流自动化，是可选的——很多生意其实更适合保持简单，我们会照实告诉您属于哪一种。',
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
          '如果網站開啟慢，或說不清楚您是做什麼的，客人轉身就走。我們做又快又簡單的網站，做完之後完全歸您。',
        body: [
          '大部分小生意的網站都是很多年前做的，做網站的人早就聯絡不上了。手機上開啟很慢，營業時間是錯的，也找不到聯絡方式。等客人找了半天，早就轉頭打給隔壁那家了。',
          '我們先把最基本的事情做好：手機上開啟快、資訊正確、電話和留言表單放在一眼就看得到的位置。接著我們會確保 Google 真的能讀懂您的網站——大多數網站正是在這一步悄悄地失敗了。',
          '所有東西都歸您：網站、網域、內容。哪天您想換人做，全部都可以帶走。我們不扣任何東西。',
          '如果您已經在用其他工具——CRM、預約行事曆、電子郵件名單——我們可以幫您接入整合功能，讓新客人或預約自動進到那些工具裡，不必您手動輸入。這屬於工作流程自動化，是可選的——很多生意其實更適合保持簡單，我們會照實告訴您屬於哪一種。',
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

  /* ── 2. Organic / SEO ───────────────────────────────────────────────── */
  {
    id: 'search',
    slugs: {
      en: 'get-found-on-google',
      es: 'aparecer-en-google',
      'zh-hans': 'guge-tuiguang',
      'zh-hant': 'google-tuiguang',
    },
    t: {
      en: {
        title: 'Getting found online',
        tagline: 'The customers are already searching. Be the result they see.',
        summary:
          'When someone nearby searches for what you sell, you want to be the result they see — on Google, on Yelp, and now on AI tools like ChatGPT. We handle the technical work behind the scenes. It takes a few months, but once it works, it keeps working long after you stop paying for it.',
        body: [
          'Somebody within three miles of you is typing your service into their phone right now. The only question is whose name comes up. That position is not luck and it is not magic — it is a set of specific, boring, fixable things.',
          'We start with the free stuff that moves the needle most: your <a href="/glossary/#google-business-profile">Google Business Profile</a>, your <a href="/glossary/#reviews">reviews</a>, whether your name, address, and phone number match everywhere online — and how you actually look on Yelp, Quora, and Reddit, not just Google. Then we build pages and articles that answer the exact questions your customers are typing.',
          'This is slow work — expect three to six months before it compounds, and that now includes the <a href="/glossary/#geo">GEO</a> side of it too, showing up when someone asks an AI tool instead of typing into Google. Anyone promising page one by next Tuesday is selling you something else.',
        ],
        outcomes: [
          '<a href="/glossary/#google-business-profile">Google Business Profile</a> fully filled out and verified',
          'A <a href="/glossary/#keyword">keyword</a> list built from what your customers actually type',
          'Pages for each service and each neighborhood you serve',
          'A look at what\'s actually showing up for you on Yelp, Quora, and Reddit — not just Google',
          'Content written to be quoted correctly by AI tools, not just ranked by Google',
          'A one-page report each month in words, not charts',
        ],
        meta: 'Local SEO and AI search (GEO) for small businesses in Pasadena and greater LA. Get found on Google, Google Maps, and AI answers.',
      },
      es: {
        title: 'Aparecer en línea',
        tagline: 'Los clientes ya están buscando. Sea el resultado que ven.',
        summary:
          'Cuando alguien cerca busca lo que usted vende, quiere ser el resultado que ve — en Google, en Yelp, y ahora en herramientas de IA como ChatGPT. Nosotros nos encargamos del trabajo técnico detrás. Tarda unos meses, pero una vez que funciona, sigue funcionando aunque deje de pagarnos.',
        body: [
          'En este momento hay alguien a menos de cinco kilómetros escribiendo su servicio en el teléfono. La única pregunta es qué nombre aparece. Ese lugar no es suerte ni magia: es una lista de cosas concretas, aburridas y arreglables.',
          'Empezamos con lo gratuito que más funciona: su perfil de Google Business, sus reseñas, si su nombre, dirección y teléfono coinciden en todos lados — y cómo se ve usted en Yelp, Quora y Reddit, no solo en Google. Después creamos páginas y artículos que responden exactamente lo que sus clientes escriben.',
          'Este trabajo es lento — cuente con tres a seis meses antes de que empiece a acumularse, y eso ahora incluye el lado GEO también, apareciendo cuando alguien le pregunta a una herramienta de IA en vez de buscar en Google. Quien le prometa la primera página para el martes le está vendiendo otra cosa.',
        ],
        outcomes: [
          'Perfil de Google Business completo y verificado',
          'Una lista de palabras clave basada en lo que sus clientes escriben',
          'Páginas para cada servicio y cada zona que atiende',
          'Una revisión de lo que aparece de usted en Yelp, Quora y Reddit — no solo en Google',
          'Contenido escrito para que las herramientas de IA lo citen correctamente, no solo para el ranking de Google',
          'Un reporte mensual de una página, en palabras y no en gráficas',
        ],
        meta: 'SEO local para negocios pequeños en Pasadena y Los Ángeles. Aparezca en Google Maps y en las búsquedas sin pagar por cada clic.',
      },
      'zh-hans': {
        title: '网上曝光',
        tagline: '客人已经在搜索了，问题是他们看到的是谁。',
        summary:
          '附近的人搜索您卖的东西时，您希望被看到的是您——在谷歌上、在 Yelp 上，现在甚至是在 ChatGPT 这样的 AI 工具上。我们负责背后的技术活儿。这事儿要几个月才见效，但一旦见效，哪怕您不再付钱，它也会继续管用。',
        body: [
          '此时此刻，离您几公里之内就有人正在手机上搜索您做的这个行业。唯一的问题是：跳出来的是谁的名字。那个位置不靠运气，也不是什么玄学，而是一堆具体、枯燥、但可以一件件解决的事情。',
          '我们先做最有效的免费部分：谷歌商家资料、客户评价、您的店名地址电话在网上各处是否一致——还有您在 Yelp、Quora、Reddit 上到底是什么样子，不只是谷歌。然后我们再制作页面和文章，回答客人真正会搜的那些问题。',
          '这件事很慢——通常需要三到六个月才会开始见效并逐步累积，现在也包括 GEO 这一块，也就是别人问 AI 工具而不是搜谷歌时能不能被找到。任何人跟您保证「下周就上第一页」，那他卖给您的是别的东西。',
        ],
        outcomes: [
          '完整填写并通过验证的谷歌商家资料',
          '一份根据客人实际搜索词整理的关键词清单',
          '为每项服务和每个服务区域制作专门页面',
          '看看您在 Yelp、Quora、Reddit 上到底是什么样子——不只是谷歌',
          '内容写得能被 AI 工具正确引用，不只是被谷歌排名',
          '每月一页纸的报告，用大白话写，不是一堆图表',
        ],
        meta: '为帕萨迪纳和大洛杉矶地区小型企业提供本地谷歌推广服务。不用为每次点击付费，也能让客人找到您。',
      },
      'zh-hant': {
        title: '網路曝光',
        tagline: '客人已經在搜尋了，問題是他們看到的是誰。',
        summary:
          '附近的人搜尋您賣的東西時，您希望被看到的是您——在 Google 上、在 Yelp 上，現在甚至是在 ChatGPT 這樣的 AI 工具上。我們負責背後的技術活兒。這件事要幾個月才見效，但一旦見效，就算您不再付費，它也會繼續管用。',
        body: [
          '此時此刻，離您幾公里之內就有人正在手機上搜尋您做的這個行業。唯一的問題是：跳出來的是誰的名字。那個位置不靠運氣，也不是什麼玄學，而是一堆具體、枯燥、但可以一件件解決的事情。',
          '我們先做最有效的免費部分：Google 商家檔案、客戶評價、您的店名地址電話在網路上各處是否一致——還有您在 Yelp、Quora、Reddit 上到底是什麼樣子，不只是 Google。接著我們再製作頁面和文章，回答客人真正會搜尋的那些問題。',
          '這件事很慢——通常需要三到六個月才會開始見效並逐步累積，現在也包括 GEO 這一塊，也就是別人問 AI 工具而不是搜 Google 時能不能被找到。任何人跟您保證「下週就上第一頁」，那他賣給您的是別的東西。',
        ],
        outcomes: [
          '完整填寫並通過驗證的 Google 商家檔案',
          '一份根據客人實際搜尋字詞整理的關鍵字清單',
          '為每項服務和每個服務區域製作專門頁面',
          '看看您在 Yelp、Quora、Reddit 上到底是什麼樣子——不只是 Google',
          '內容寫得能被 AI 工具正確引用，不只是被 Google 排名',
          '每月一頁的報告，用白話寫，不是一堆圖表',
        ],
        meta: '為帕薩迪納和大洛杉磯地區小型企業提供在地 Google 推廣服務。不用為每次點擊付費，也能讓客人找到您。',
      },
    },
  },

  /* ── 3. Online marketing (id/slug stay 'ads'/'paid-advertising' — never
   *      change per the rule above; already indexed/live URLs — but the
   *      customer-facing title/copy was reframed 2026-08-27 from
   *      "just paid ads" to organic + paid, per the owner's direction:
   *      not just how customers find you (that's the search service
   *      above), but the ongoing campaigns — content/SEO/GEO and paid —
   *      that keep bringing them. ───────────────────────────────────── */
  {
    id: 'ads',
    slugs: {
      en: 'paid-advertising',
      es: 'publicidad-pagada',
      'zh-hans': 'fufei-guanggao',
      'zh-hant': 'fufei-guanggao',
    },
    t: {
      en: {
        title: 'Online marketing',
        tagline: "So you don't waste money on marketing that never made sense.",
        summary:
          "Paid ads can bring in customers fast, and organic content keeps working long after you stop paying — but both waste time and money if they're not built around what a customer is actually worth to you. We look at both together, and say so honestly if paid doesn't make sense yet.",
        body: [
          "Paid advertising is the fastest way to get in front of people, and the fastest way to burn money. Ongoing content and search work is slower, but keeps paying you back long after a campaign ends. Most businesses need some mix of both — the real question is which mix, and that comes down to one number: what a customer is worth to you over their lifetime.",
          'So we start by working that out together. If paid ads don\'t make sense yet, we say so and point you toward the organic and content work that will — usually <a href="/glossary/#seo">SEO</a>, <a href="/glossary/#geo">GEO</a>, or your existing customer list.',
          'When ads do make sense, we keep it tight: a small number of campaigns, a real budget cap, and a plain monthly note about what you spent and what it brought back — running alongside whatever organic and content work is already in motion, not instead of it.',
        ],
        outcomes: [
          'An honest answer on whether paid ads suit your business right now',
          'Campaigns built around what a customer is actually worth, not a guess',
          'A budget cap that cannot quietly run away from you',
          'Call and form tracking, so you know what came from where',
          'Ongoing <a href="/glossary/#seo">SEO</a> and <a href="/glossary/#geo">GEO</a> content running alongside any paid campaigns, not instead of them',
          'A monthly note: spent this, got that',
        ],
        meta: 'Online marketing — organic and paid — for Southern California small businesses. We start by checking what actually makes sense for you.',
      },
      es: {
        title: 'Marketing en línea',
        tagline: 'Para que no desperdicie dinero en marketing que nunca tuvo sentido.',
        summary:
          'Los anuncios pagados pueden traer clientes rápido, y el contenido orgánico sigue funcionando mucho después de dejar de pagar — pero ambos desperdician tiempo y dinero si no se basan en lo que un cliente realmente vale para usted. Vemos los dos juntos, y le decimos con honestidad si lo pagado todavía no tiene sentido.',
        body: [
          'La publicidad pagada es la forma más rápida de llegar a la gente, y también la más rápida de quemar dinero. El contenido y las búsquedas orgánicas son más lentas, pero le siguen dando resultado mucho después de que termina una campaña. La mayoría de los negocios necesitan una mezcla de los dos — la pregunta real es cuál mezcla, y eso depende de un número: cuánto vale un cliente para usted a lo largo del tiempo.',
          'Por eso empezamos por sacar esa cuenta juntos. Si los anuncios pagados todavía no tienen sentido, se lo decimos y le señalamos el trabajo orgánico y de contenido que sí va a funcionar — normalmente SEO, GEO, o su propia lista de clientes.',
          'Cuando sí tiene sentido pagar, lo mantenemos simple: pocas campañas, un tope de presupuesto real, y una nota mensual clara de cuánto gastó y cuánto regresó — funcionando junto con el trabajo orgánico y de contenido que ya está en marcha, no en su lugar.',
        ],
        outcomes: [
          'Una respuesta honesta sobre si los anuncios pagados le convienen ahora mismo',
          'Campañas armadas según lo que vale un cliente de verdad, no una suposición',
          'Un tope de presupuesto que no se le puede escapar',
          'Seguimiento de llamadas y formularios, para saber qué vino de dónde',
          'Contenido de SEO y GEO funcionando junto con cualquier campaña pagada, no en su lugar',
          'Una nota mensual: gastó esto, entró aquello',
        ],
        meta: 'Marketing en línea — orgánico y pagado — para negocios pequeños del sur de California. Primero revisamos qué de verdad le conviene.',
      },
      'zh-hans': {
        title: '线上营销',
        tagline: '别把钱浪费在从一开始就没道理的营销上。',
        summary:
          '付费广告能很快带来客人，自然内容则会在您停止付费之后继续管用——但如果不是围绕一位客人的真实价值来做，两者都会浪费时间和金钱。我们会把两者放在一起看，如果付费广告现在还没道理，我们会照实说。',
        body: [
          '付费广告是最快让人看到您的办法，也是最快烧钱的办法。持续的内容和搜索工作见效慢，但活动结束很久之后还会继续给您带来回报。大多数生意需要两者的某种组合——真正的问题是哪种组合，这取决于一个数字：一位客人长期下来到底值多少钱。',
          '所以我们先跟您一起把这笔账算清楚。如果付费广告现在还没道理，我们会直说，并给您指出更管用的自然流量和内容方向——通常是 SEO、GEO，或者您手上已有的老客户名单。',
          '如果确实该投广告，我们会做得很克制：广告系列数量少、设定真正管用的预算上限，每月给您一份大白话的说明：花了多少，带回来多少——而且这些会跟已经在做的自然流量和内容工作一起进行，不是取代它们。',
        ],
        outcomes: [
          '关于「您现在到底适不适合投广告」的实话',
          '按一位客人的真实价值来设计广告投放，不是瞎猜',
          '不会悄悄超支的预算上限',
          '来电和留言追踪，弄清楚客人从哪儿来的',
          '持续的 SEO 和 GEO 内容跟付费广告一起进行，而不是取而代之',
          '每月一份简单说明：花了这些，收回这些',
        ],
        meta: '为南加州小型企业提供线上营销服务——自然流量和付费广告。我们会先帮您算清楚，什么对您才是真正划算的。',
      },
      'zh-hant': {
        title: '線上行銷',
        tagline: '別把錢浪費在從一開始就沒道理的行銷上。',
        summary:
          '付費廣告能很快帶來客人，自然內容則會在您停止付費之後繼續管用——但如果不是圍繞一位客人的真實價值來做，兩者都會浪費時間和金錢。我們會把兩者放在一起看，如果付費廣告現在還沒道理，我們會照實說。',
        body: [
          '付費廣告是最快讓人看到您的辦法，也是最快燒錢的辦法。持續的內容和搜尋工作見效慢，但活動結束很久之後還會繼續帶來回報。大多數生意需要兩者的某種組合——真正的問題是哪種組合，這取決於一個數字：一位客人長期下來到底值多少錢。',
          '所以我們先跟您一起把這筆帳算清楚。如果付費廣告現在還沒道理，我們會直說，並給您指出更管用的自然流量與內容方向——通常是 SEO、GEO，或者您手上已有的老客戶名單。',
          '如果確實該投廣告，我們會做得很節制：廣告系列數量少、設定真正管用的預算上限，每月給您一份白話的說明：花了多少，帶回來多少——而且這些會跟已經在做的自然流量與內容工作一起進行，不是取代它們。',
        ],
        outcomes: [
          '關於「您現在到底適不適合投廣告」的實話',
          '按一位客人的真實價值來設計廣告投放，不是瞎猜',
          '不會悄悄超支的預算上限',
          '來電和留言追蹤，弄清楚客人從哪裡來的',
          '持續的 SEO 和 GEO 內容跟付費廣告一起進行，而不是取而代之',
          '每月一份簡單說明：花了這些，收回這些',
        ],
        meta: '為南加州小型企業提供線上行銷服務——自然流量與付費廣告。我們會先幫您算清楚，什麼對您才是真正划算的。',
      },
    },
  },

  /* ── 4. Business consulting (moved last, 2026-08-27, per the owner's
   *      call) ────────────────────────────────────────────────────────── */
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
        title: 'Online consulting',
        tagline: 'An honest answer, from someone with nothing to gain either way.',
        summary:
          "Running a small business means making decisions alone — pricing, what to offer, what to drop. We sit down, look at your numbers, and hand you a short plan you can actually use. Sometimes the honest answer is you're already fine.",
        body: [
          "Call it a consultancy session, a strategy check-in, or just a second opinion — the label doesn't matter. It's an hour with someone whose only job is helping you see your own business clearly, not selling you the next thing.",
          "Running a small business means every decision lands on one desk. Should you raise prices. Should you drop the service that eats half your week and brings in a tenth of your revenue. Should you keep the client who's more trouble than they're worth. There's rarely anyone to talk it through with who isn't also your spouse or your employee.",
          "We do that. It's a working session, not a lecture — we look at your numbers together, name the two or three things that actually matter this quarter, and leave you with a short written summary you can act on.",
          "Sometimes the honest answer is that your business is fine and you don't need us. We'll tell you that too.",
        ],
        outcomes: [
          'A working session on what to fix first',
          'A plain look at where your revenue and time really come from',
          'A short written summary you keep, not a slide deck',
          "A simple strategy for the next quarter, not a five-year plan nobody will read",
          'A follow-up check-in to see if it worked',
        ],
        meta: 'Practical business consultancy and strategy sessions for small business owners in Southern California. Pricing, offers, and priorities — no jargon, no slide decks.',
      },
      es: {
        title: 'Consultoría en línea',
        tagline: 'Una respuesta honesta, de alguien que no gana nada de cualquier forma.',
        summary:
          'Tener un negocio pequeño significa tomar decisiones solo — precios, qué ofrecer, qué dejar. Nos sentamos, revisamos sus números, y le damos un plan corto que sí puede usar. A veces la respuesta honesta es que ya está bien.',
        body: [
          'Llámelo sesión de consultoría, revisión de estrategia, o simplemente una segunda opinión — el nombre no importa. Es una hora con alguien cuyo único trabajo es ayudarle a ver su propio negocio con claridad, no venderle lo siguiente.',
          'Tener un negocio pequeño significa que todas las decisiones caen en un solo escritorio. Si subir los precios. Si dejar ese servicio que se come la mitad de la semana y trae la décima parte del ingreso. Si quedarse con ese cliente que da más problemas de lo que vale. Y casi nunca hay con quién platicarlo que no sea su pareja o su empleado.',
          'Eso es lo que hacemos. Es una sesión de trabajo, no una conferencia: revisamos sus números juntos, identificamos las dos o tres cosas que de verdad importan este trimestre, y usted se queda con un resumen corto por escrito.',
          'A veces la respuesta honesta es que su negocio está bien y no nos necesita. También se lo vamos a decir.',
        ],
        outcomes: [
          'Una sesión de trabajo sobre qué arreglar primero',
          'Una mirada clara a de dónde vienen su ingreso y su tiempo',
          'Un resumen corto por escrito que usted conserva',
          'Una estrategia sencilla para el próximo trimestre, no un plan a cinco años que nadie va a leer',
          'Una llamada de seguimiento para ver si funcionó',
        ],
        meta: 'Asesoría y estrategia de negocios prácticas para dueños de negocios pequeños en el sur de California. Precios, servicios y prioridades, sin palabras complicadas.',
      },
      'zh-hans': {
        title: '线上经营咨询',
        tagline: '一个诚实的答案，来自一个怎么说都没有利害关系的人。',
        summary:
          '做小生意意味着自己做决定——定价、做什么不做什么、砍掉什么服务。我们坐下来，看您的数字，给您一份能直接用的简短计划。有时候诚实的答案是您已经挺好了。',
        body: [
          '叫它经营咨询也好，战略会谈也好，还是就叫第二意见，名字不重要。就是花一个小时，找一个唯一的工作就是帮您看清自己生意的人，而不是想卖您下一样东西的人。',
          '做小生意意味着所有决定都压在同一张桌子上。要不要涨价。那项占了您一半时间、却只带来十分之一收入的服务，要不要砍掉。那位麻烦比价值还多的客人，要不要继续留着。而能商量的人，往往不是您的家人就是您的员工。',
          '我们做的就是这件事。这是一次一起干活的会谈，不是听课：我们一起看您的数字，挑出这个季度真正要紧的两三件事，最后给您一份可以直接照着做的简短书面总结。',
          '有时候诚实的答案是：您的生意挺好的，不需要我们。这话我们也会照直说。',
        ],
        outcomes: [
          '一次会谈，弄清楚先解决哪件事',
          '看清楚您的收入和时间到底来自哪里',
          '一份留给您的简短书面总结，不是一堆幻灯片',
          '一个给下个季度用的简单策略，不是没人会看的五年计划',
          '一次回访，看看办法有没有奏效',
        ],
        meta: '为南加州小型企业主提供务实的经营咨询与战略服务：定价、服务组合和优先级，不讲行话，不做花架子。',
      },
      'zh-hant': {
        title: '線上經營諮詢',
        tagline: '一個誠實的答案，來自一個怎麼說都沒有利害關係的人。',
        summary:
          '做小生意意味著自己做決定——定價、做什麼不做什麼、砍掉什麼服務。我們坐下來，看您的數字，給您一份能直接用的簡短計畫。有時候誠實的答案是您已經挺好了。',
        body: [
          '叫它經營諮詢也好，策略會談也好，還是就叫第二意見，名字不重要。就是花一個小時，找一個唯一的工作就是幫您看清自己生意的人，而不是想賣您下一樣東西的人。',
          '做小生意意味著所有決定都壓在同一張桌子上。要不要漲價。那項佔了您一半時間、卻只帶來十分之一收入的服務，要不要砍掉。那位麻煩比價值還多的客人，要不要繼續留著。而能商量的人，往往不是您的家人就是您的員工。',
          '我們做的就是這件事。這是一次一起做事的會談，不是聽課：我們一起看您的數字，挑出這個季度真正要緊的兩三件事，最後給您一份可以直接照著做的簡短書面總結。',
          '有時候誠實的答案是：您的生意挺好的，不需要我們。這話我們也會照直說。',
        ],
        outcomes: [
          '一次會談，釐清先解決哪件事',
          '看清楚您的收入和時間到底來自哪裡',
          '一份留給您的簡短書面總結，不是一堆簡報',
          '一個給下一季用的簡單策略，不是沒人會看的五年計畫',
          '一次回訪，看看方法有沒有奏效',
        ],
        meta: '為南加州小型企業主提供務實的經營諮詢與策略服務：定價、服務組合和優先順序，不講行話，不做花架子。',
      },
    },
  },
];

/** Look up a service by its localized slug. */
export function serviceBySlug(locale: Locale, slug: string): Service | undefined {
  return services.find((s) => s.slugs[locale] === slug);
}
