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
          "If your site loads slowly, appears outdated, or fails to state clearly what you do, visitors leave and go elsewhere. We build fast, straightforward sites that you genuinely own the moment we have finished, with no hidden fees and no arrangement that locks you into anything afterward.",
        body: [
          '<p>Most small business websites were constructed once, years ago, by somebody who has since stopped answering emails. The maintenance nobody scheduled simply never happened. Meanwhile the customer has already given up and telephoned the shop down the street.</p>',
          '<h3>How it works</h3><ul><li>Fast on a phone, correct information, a phone number or form that\'s impossible to miss</li><li>Built so Google can actually read it — most sites quietly fail here</li><li>Optional: <a href="/glossary/#integrations">integrations</a> with your CRM or calendar, so new leads land where you already work</li></ul>',
          '<p>You retain ownership of everything involved: the site, the domain, and the content. Holding a client\'s website hostage is a poor business model and a worse way to treat people.</p>',
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
          'Si su sitio carga lentamente, parece anticuado, o no logra declarar con claridad qué hace usted, los visitantes se marchan a otro lado. Construimos sitios rápidos y directos que usted posee genuinamente una vez que hemos terminado — sin cargos ocultos, y sin ningún arreglo que le deje atrapado.',
        body: [
          '<p>La mayoría de los sitios web de negocios pequeños se construyeron una sola vez, hace años, por alguien que desde entonces dejó de contestar los correos, y el mantenimiento que nadie programó sencillamente nunca ocurrió. Mientras tanto, el cliente ya desistió y telefoneó al negocio de la otra cuadra.</p>',
          '<h3>Cómo funciona</h3><ul><li>Rápido en el teléfono, con información correcta, un número o formulario imposible de pasar por alto</li><li>Hecho para que Google realmente pueda leerlo — la mayoría de los sitios fallan aquí sin que nadie se dé cuenta</li><li>Opcional: integraciones con su CRM o calendario, para que los clientes nuevos lleguen a donde usted ya trabaja</li></ul>',
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
          '<h3>怎么做</h3><ul><li>手机上打开快、信息准确、电话和留言表单一眼就能看到</li><li>做到让谷歌真的能读懂——大多数网站正是在这一步悄悄地失败了</li><li>可选：接入您的 CRM 或日历，让新客人直接进到您已经在用的工具里</li></ul>',
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
          '<h3>怎麼做</h3><ul><li>手機上開啟快、資訊正確、電話和留言表單一眼就看得到</li><li>做到讓 Google 真的能讀懂——大多數網站正是在這一步悄悄地失敗了</li><li>可選：接入您的 CRM 或行事曆，讓新客人直接進到您已經在用的工具裡</li></ul>',
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
          'When somebody nearby searches for what you sell, you want to be the result they actually see — on Google, on Yelp, and now on AI tools such as ChatGPT. It takes several months to begin working, and then continues working long after you have stopped paying for it.',
        body: [
          '<p>Somebody within three miles of you is typing your service into their phone at this moment, and the only genuine question is whose name appears when they do.</p>',
          '<h3>How it works</h3><ul><li>Your <a href="/glossary/#google-business-profile">Google Business Profile</a> and <a href="/glossary/#reviews">reviews</a>, fully handled</li><li>Your name, address, and phone number made consistent everywhere online</li><li>How you actually look on Yelp, Quora, and Reddit — not just Google</li><li>Pages and articles that answer the exact questions your customers are typing</li></ul>',
          '<p>This is slow work — three to six months before it compounds, and that now includes the <a href="/glossary/#geo">GEO</a> side too. Anyone promising page one by next Tuesday is selling you something else.</p>',
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
          'Cuando alguien cercano busca aquello que usted vende, conviene ser el resultado que efectivamente aparece — en Google, en Yelp, y ahora en herramientas de inteligencia artificial como ChatGPT. Nosotros nos encargamos del trabajo técnico detrás. Tarda unos meses, pero una vez que funciona, sigue funcionando aunque deje de pagarnos.',
        body: [
          '<p>En este momento hay alguien a menos de cinco kilómetros escribiendo su servicio en el teléfono, y la única pregunta genuina es qué nombre aparece cuando lo hace.</p>',
          '<h3>Cómo funciona</h3><ul><li>Su perfil de Google Business y sus reseñas, completamente manejados</li><li>Su nombre, dirección y teléfono, consistentes en todos lados</li><li>Cómo se ve usted en Yelp, Quora y Reddit — no solo en Google</li><li>Páginas y artículos que responden exactamente lo que sus clientes escriben</li></ul>',
          '<p>Este trabajo resulta inherentemente lento — de tres a seis meses antes de que comience a acumularse, y eso ahora incorpora igualmente la vertiente GEO. Quien le prometa la primera página para el martes le está vendiendo otra cosa.</p>',
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
          '<p>此时此刻，距离您数公里之内便有人正在手机上搜索您所从事的这个行业；然而唯一真正的问题在于：跳出来的究竟是谁的名字。此外，答案并非取决于运气。</p>',
          '<h3>怎么做</h3><ul><li>谷歌商家资料和客户评价，全部帮您处理好</li><li>店名、地址、电话，在网上各处保持一致</li><li>您在 Yelp、Quora、Reddit 上到底是什么样子——不只是谷歌</li><li>页面和文章回答客人真正会搜的那些问题</li></ul>',
          '<p>这件事很慢——三到六个月才会开始见效并逐步累积，现在也包括 GEO 这一块。任何人跟您保证「下周就上第一页」，那他卖给您的是别的东西。</p>',
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
          '<p>此時此刻，距離您數公里之內便有人正在手機上搜尋您所從事的這個行業；然而唯一真正的問題在於：跳出來的究竟是誰的名字。此外，答案並非取決於運氣。</p>',
          '<h3>怎麼做</h3><ul><li>Google 商家檔案和客戶評價，全部幫您處理好</li><li>店名、地址、電話，在網路上各處保持一致</li><li>您在 Yelp、Quora、Reddit 上到底是什麼樣子——不只是 Google</li><li>頁面和文章回答客人真正會搜尋的那些問題</li></ul>',
          '<p>這件事很慢——三到六個月才會開始見效並逐步累積，現在也包括 GEO 這一塊。任何人跟您保證「下週就上第一頁」，那他賣給您的是別的東西。</p>',
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
        title: 'Paid and organic marketing',
        tagline: "So you don't waste money on marketing that never made sense.",
        summary:
          "Paid advertising can bring in customers quickly, and organic content continues working long after you stop paying for it — but both waste money unless they are built around what a customer is genuinely worth to you. We will say so honestly if paid advertising does not yet make sense for your situation.",
        body: [
          '<p>Paid advertising is the fastest route to getting in front of people, and equally the fastest method of burning money. Most businesses require some combination of paid and organic. The genuine question concerns which combination.</p>',
          '<h3>How it works</h3><ul><li>We work out what a customer is actually worth to you, first</li><li>If paid ads don\'t make sense yet, we say so and point you toward <a href="/glossary/#seo">SEO</a>, <a href="/glossary/#geo">GEO</a>, or your existing customer list instead</li><li>When ads do make sense: a small number of campaigns, a real budget cap, tracked calls and forms</li></ul>',
          '<p>Either way you receive a plain monthly account of what you spent and what it actually returned.</p>',
        ],
        outcomes: [
          'An honest answer on whether paid ads suit your business right now',
          'Campaigns built around what a customer is actually worth, not a guess',
          'A budget cap that cannot quietly run away from you',
          'Call and form tracking, so you know what came from where',
          'Ongoing <a href="/glossary/#seo">SEO</a> and <a href="/glossary/#geo">GEO</a> content running alongside any paid campaigns, not instead of them',
          'A monthly note: spent this, got that',
        ],
        meta: 'Paid and organic marketing for Southern California small businesses. We start by checking what actually makes sense for you.',
      },
      es: {
        title: 'Marketing pagado y orgánico',
        tagline: 'Para que no desperdicie dinero en marketing que nunca tuvo sentido.',
        summary:
          'Los anuncios pagados pueden traer clientes rápido, y el contenido orgánico sigue funcionando después de dejar de pagar — pero ambos desperdician dinero si no se basan en lo que un cliente vale para usted. Le decimos con honestidad si lo pagado todavía no tiene sentido.',
        body: [
          '<p>La publicidad pagada constituye simultáneamente la vía más rápida para llegar a la gente y el método disponible más rápido para quemar dinero. La mayoría de los negocios requiere alguna combinación de pagado y orgánico, y la pregunta genuina concierne a cuál combinación.</p>',
          '<h3>Cómo funciona</h3><ul><li>Primero calculamos cuánto vale un cliente para usted de verdad</li><li>Si los anuncios pagados todavía no tienen sentido, se lo decimos y le señalamos SEO, GEO, o su propia lista de clientes en su lugar</li><li>Cuando sí tiene sentido pagar: pocas campañas, un tope de presupuesto real, llamadas y formularios rastreados</li></ul>',
          '<p>De cualquier forma usted recibe un informe mensual claro de cuánto gastó y cuánto regresó efectivamente.</p>',
        ],
        outcomes: [
          'Una respuesta honesta sobre si los anuncios pagados le convienen ahora mismo',
          'Campañas armadas según lo que vale un cliente de verdad, no una suposición',
          'Un tope de presupuesto que no se le puede escapar',
          'Seguimiento de llamadas y formularios, para saber qué vino de dónde',
          'Contenido de SEO y GEO funcionando junto con cualquier campaña pagada, no en su lugar',
          'Una nota mensual: gastó esto, entró aquello',
        ],
        meta: 'Marketing pagado y orgánico para negocios pequeños del sur de California. Primero revisamos qué de verdad le conviene.',
      },
      'zh-hans': {
        title: '付费与自然营销',
        tagline: '别把钱浪费在从一开始就没道理的营销上。',
        summary:
          '付费广告能很快带来客人，自然内容则会在您停止付费之后继续管用——但如果不是围绕一位客人的真实价值来做，两者都会浪费时间和金钱。我们会把两者放在一起看，如果付费广告现在还没道理，我们会照实说。',
        body: [
          '<p>付费广告既是让人看见您最快的途径，同时也是烧钱最快的方式。多数生意所需要的是付费与自然流量的某种组合；然而真正的问题在于究竟是哪一种组合。此外，这并非一劳永逸的判断。</p>',
          '<h3>怎么做</h3><ul><li>先算清楚一位客人对您来说到底值多少钱</li><li>如果付费广告现在还没道理，我们会直说，改为指向 SEO、GEO，或者您手上已有的老客户名单</li><li>如果确实该投广告：广告系列数量少、设定真正管用的预算上限、来电和留言都有追踪</li></ul>',
          '<p>无论属于哪一种情况，您每月皆会收到一份平实的说明：花掉了多少，以及实际带回来了多少。此外，其中并不会有任何模糊的措辞。</p>',
        ],
        outcomes: [
          '关于「您现在到底适不适合投广告」的实话',
          '按一位客人的真实价值来设计广告投放，不是瞎猜',
          '不会悄悄超支的预算上限',
          '来电和留言追踪，弄清楚客人从哪儿来的',
          '持续的 SEO 和 GEO 内容跟付费广告一起进行，而不是取而代之',
          '每月一份简单说明：花了这些，收回这些',
        ],
        meta: '为南加州小型企业提供付费和自然营销服务。我们会先帮您算清楚，什么对您才是真正划算的。',
      },
      'zh-hant': {
        title: '付費與自然行銷',
        tagline: '別把錢浪費在從一開始就沒道理的行銷上。',
        summary:
          '付費廣告能很快帶來客人，自然內容則會在您停止付費之後繼續管用——但如果不是圍繞一位客人的真實價值來做，兩者都會浪費時間和金錢。我們會把兩者放在一起看，如果付費廣告現在還沒道理，我們會照實說。',
        body: [
          '<p>付費廣告既是讓人看見您最快的途徑，同時也是燒錢最快的方式。多數生意所需要的是付費與自然流量的某種組合；然而真正的問題在於究竟是哪一種組合。此外，這並非一勞永逸的判斷。</p>',
          '<h3>怎麼做</h3><ul><li>先算清楚一位客人對您來說到底值多少錢</li><li>如果付費廣告現在還沒道理，我們會直說，改為指向 SEO、GEO，或者您手上已有的老客戶名單</li><li>如果確實該投廣告：廣告系列數量少、設定真正管用的預算上限、來電和留言都有追蹤</li></ul>',
          '<p>無論屬於哪一種情況，您每月皆會收到一份平實的說明：花掉了多少，以及實際帶回來了多少。此外，其中並不會有任何模糊的措辭。</p>',
        ],
        outcomes: [
          '關於「您現在到底適不適合投廣告」的實話',
          '按一位客人的真實價值來設計廣告投放，不是瞎猜',
          '不會悄悄超支的預算上限',
          '來電和留言追蹤，弄清楚客人從哪裡來的',
          '持續的 SEO 和 GEO 內容跟付費廣告一起進行，而不是取而代之',
          '每月一份簡單說明：花了這些，收回這些',
        ],
        meta: '為南加州小型企業提供付費和自然行銷服務。我們會先幫您算清楚，什麼對您才是真正划算的。',
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
          "Uncertain whether to invest next in a new website, greater visibility on Google, or paid advertising? We examine your existing online efforts together and tell you honestly what is genuinely worth doing, and equally what is worth skipping entirely.",
        body: [
          "<p>Call it a consultancy session, a strategy check-in, or just a second opinion — the label doesn't matter. This isn't general business consulting; it's specifically about your online presence — your website, your visibility, your marketing — and how to sequence and implement it well.</p>",
          '<h3>How it works</h3><ul><li>A working session, not a lecture — we look at what\'s actually happening across your website, search visibility, and ads together</li><li>Help deciding what to invest in online next, and what to leave alone</li><li>A short written summary you can act on, not a slide deck</li></ul>',
          "<p>Sometimes the honest answer is that your online presence already works perfectly well. We will tell you that just as readily.</p>",
        ],
        outcomes: [
          'A working session on what to fix first, online',
          "A plain look at which of your online efforts are actually paying off",
          'A short written summary you keep, not a slide deck',
          "A simple plan for what to implement next quarter, not a five-year strategy nobody will read",
          'A follow-up check-in to see if it worked',
        ],
        meta: 'Online strategy consulting for small business owners in Southern California — deciding what to invest in for your website, visibility, and marketing, and what to skip.',
      },
      es: {
        title: 'Consultoría en línea',
        tagline: 'Una respuesta honesta, de alguien que no gana nada de cualquier forma.',
        summary:
          '¿No sabe si invertir en un sitio nuevo, más visibilidad en Google, o publicidad paga? Vemos sus esfuerzos en línea juntos y le decimos con honestidad qué de verdad vale la pena — y qué no.',
        body: [
          '<p>Llámelo sesión de consultoría, revisión de estrategia, o simplemente una segunda opinión — el nombre no importa. Esto no es asesoría de negocios en general; es específicamente sobre su presencia en línea — su sitio web, su visibilidad, su marketing — y cómo ordenarlo e implementarlo bien.</p>',
          '<h3>Cómo funciona</h3><ul><li>Una sesión de trabajo, no una conferencia: vemos juntos qué está pasando de verdad con su sitio, su visibilidad y sus anuncios</li><li>Le ayudamos a decidir en qué invertir en línea y qué dejar en paz</li><li>Un resumen corto por escrito que usted puede usar, no una presentación</li></ul>',
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
          '<h3>怎么做</h3><ul><li>一次会谈而非授课——我们将一同检视您的网站、搜索曝光与广告目前究竟处于何种状况</li><li>协助您判断接下来应当于线上投入何处，至于何者则可以暂且搁置</li><li>一份能直接用的简短书面总结，不是一堆幻灯片</li></ul>',
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
          '<h3>怎麼做</h3><ul><li>一次會談而非授課——我們將一同檢視您的網站、搜尋曝光與廣告目前究竟處於何種狀況</li><li>協助您判斷接下來應當於線上投入何處，至於何者則可以暫且擱置</li><li>一份能直接用的簡短書面總結，不是一堆簡報</li></ul>',
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
];

/** Look up a service by its localized slug. */
export function serviceBySlug(locale: Locale, slug: string): Service | undefined {
  return services.find((s) => s.slugs[locale] === slug);
}
