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
 *  Order of this array = display order on the site. It currently follows
 *  revenue priority: websites → search → consulting → ads.
 */

export interface ServiceCopy {
  title: string;
  tagline: string;
  /** Shown on the services index card. One sentence. */
  summary: string;
  /** Body paragraphs on the detail page. */
  body: string[];
  /** Concrete deliverables. Keep these things a client can point at. */
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
        tagline: 'Built to be found, easy to read, quick to load.',
        summary:
          "Your website is often the first thing a customer sees. If it loads slowly, looks old, or doesn't say clearly what you do, people leave and go somewhere else. We build simple, fast websites that work great on a phone and make it easy for customers to reach you. You own it when we're done — no hidden fees, no getting locked in.",
        body: [
          "Most small business websites were built once, years ago, by someone who has since stopped answering emails. They load slowly on a phone, the hours are wrong, and there's no obvious way to get in touch. Meanwhile the customer already left and called the shop down the street.",
          "We build sites that fix the basics first: fast on a phone, correct information, and a phone number or form that is impossible to miss. Then we make sure Google can actually read the thing — which is where most sites quietly fail.",
          'You own everything. The site, the domain, the content. If you ever want to move on, you take it with you. No hostage situations.',
        ],
        outcomes: [
          'A site that loads in under two seconds on a phone',
          'Your services, hours, and location written in plain language',
          'A contact form that reaches your inbox, not a black hole',
          'Google Business Profile connected and verified',
          'Optional: the whole site in Spanish or Chinese',
        ],
        meta: 'Small business website design for Pasadena and the San Gabriel Valley. Fast, clear sites that load on a phone and are easy for customers to find.',
      },
      es: {
        title: 'Sitios web que traen clientes',
        tagline: 'Fáciles de encontrar, fáciles de leer, rápidos de cargar.',
        summary:
          'Un sitio claro y rápido que explica lo que usted hace y facilita que lo contacten.',
        body: [
          'La mayoría de los sitios web de negocios pequeños se hicieron una sola vez, hace años, por alguien que ya no contesta los correos. Cargan lento en el teléfono, el horario está equivocado y no hay forma obvia de comunicarse. Mientras tanto, el cliente ya se fue y llamó al negocio de la otra cuadra.',
          'Nosotros construimos sitios que arreglan lo básico primero: rápidos en el teléfono, con información correcta, y un número o formulario imposible de pasar por alto. Después nos aseguramos de que Google realmente pueda leer el sitio, que es donde la mayoría falla sin que nadie se dé cuenta.',
          'Todo es suyo. El sitio, el dominio, el contenido. Si algún día quiere irse, se lo lleva. Aquí nadie retiene nada.',
        ],
        outcomes: [
          'Un sitio que carga en menos de dos segundos en el teléfono',
          'Sus servicios, horarios y ubicación en lenguaje sencillo',
          'Un formulario de contacto que llega a su correo, no al vacío',
          'Perfil de Google Business conectado y verificado',
          'Opcional: el sitio completo en inglés o chino',
        ],
        meta: 'Diseño de sitios web para negocios pequeños en Pasadena y el Valle de San Gabriel. Sitios rápidos y claros que sus clientes sí encuentran.',
      },
      'zh-hans': {
        title: '能带来生意的网站',
        tagline: '容易被找到，容易看懂，打开速度快。',
        summary: '一个清晰、快速的网站，说清楚您做什么，并且让客人方便联系您。',
        body: [
          '大部分小生意的网站都是很多年前做的，做网站的人早就联系不上了。手机上打开很慢，营业时间是错的，也找不到联系方式。等客人找了半天，早就转头打给隔壁那家了。',
          '我们先把最基本的事情做好：手机上打开快、信息准确、电话和留言表单放在一眼就能看到的位置。然后我们会确保谷歌真的能读懂您的网站——大多数网站正是在这一步悄悄地失败了。',
          '所有东西都归您：网站、域名、内容。哪天您想换人做，全部都可以带走。我们不扣任何东西。',
        ],
        outcomes: [
          '手机上两秒之内打开的网站',
          '用大白话写清楚您的服务、营业时间和地址',
          '客人留言直接进您的邮箱，不会石沉大海',
          '连接并验证谷歌商家资料（Google Business Profile）',
          '可选：整个网站也做英文版或西班牙文版',
        ],
        meta: '为帕萨迪纳和圣盖博谷的小型企业提供网站设计。速度快、内容清楚、客人在手机上真的找得到您。',
      },
      'zh-hant': {
        title: '能帶來生意的網站',
        tagline: '容易被找到，容易看懂，開啟速度快。',
        summary: '一個清楚、快速的網站，說明您做什麼，並且讓客人方便聯絡您。',
        body: [
          '大部分小生意的網站都是很多年前做的，做網站的人早就聯絡不上了。手機上開啟很慢，營業時間是錯的，也找不到聯絡方式。等客人找了半天，早就轉頭打給隔壁那家了。',
          '我們先把最基本的事情做好：手機上開啟快、資訊正確、電話和留言表單放在一眼就看得到的位置。接著我們會確保 Google 真的能讀懂您的網站——大多數網站正是在這一步悄悄地失敗了。',
          '所有東西都歸您：網站、網域、內容。哪天您想換人做，全部都可以帶走。我們不扣任何東西。',
        ],
        outcomes: [
          '手機上兩秒之內開啟的網站',
          '用白話寫清楚您的服務、營業時間和地址',
          '客人留言直接進您的信箱，不會石沉大海',
          '連接並驗證 Google 商家檔案（Google Business Profile）',
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
        title: 'Getting found on Google',
        tagline: 'The customers are already searching. Be the result they see.',
        summary:
          'When someone nearby searches for what you sell, you want your business to show up first — on Google, on Google Maps, and now even when people ask AI tools like ChatGPT for recommendations. We handle the technical work behind the scenes: your Google Business Profile, your reviews, and a website that actually answers the questions people are asking. It takes a few months to work. But once it does, it keeps working long after you stop paying for it.',
        body: [
          'Somebody within three miles of you is typing your service into their phone right now. The only question is whose name comes up. That position is not luck and it is not magic — it is a set of specific, boring, fixable things.',
          'We start with the free stuff that moves the needle most for local businesses: your Google Business Profile, your reviews, and whether your name, address, and phone number match everywhere they appear online. Then we build pages and articles that answer the exact questions your customers are typing.',
          'This is slow work. Expect three to six months before it compounds. Anyone promising page one by next Tuesday is selling you something else.',
          "This work has two parts now, not one. There's still SEO — showing up in a Google search. But there's also GEO — showing up when someone asks an AI tool like ChatGPT or Google's AI answers \"who's a good electrician near me.\" Both come from the same honest groundwork: an accurate Google Business Profile, real reviews, and a website that plainly answers the question someone actually asked. New to these terms? See our plain-English glossary below.",
        ],
        outcomes: [
          'Google Business Profile fully filled out and verified',
          'A keyword list built from what your customers actually type',
          'Pages for each service and each neighborhood you serve',
          'A monthly article schedule you can sustain',
          'Content written to be quoted correctly by AI tools, not just ranked by Google',
          'A one-page report each month in words, not charts',
        ],
        meta: 'Local SEO and AI search (GEO) for small businesses in Pasadena and greater LA. Get found on Google, Google Maps, and AI answers.',
      },
      es: {
        title: 'Aparecer en Google',
        tagline: 'Los clientes ya están buscando. Sea el resultado que ven.',
        summary:
          'Aparezca cuando alguien cerca busque lo que usted vende, sin pagar por cada clic.',
        body: [
          'En este momento hay alguien a menos de cinco kilómetros escribiendo su servicio en el teléfono. La única pregunta es qué nombre aparece. Ese lugar no es suerte ni magia: es una lista de cosas concretas, aburridas y arreglables.',
          'Empezamos con lo gratuito que más funciona para negocios locales: su perfil de Google Business, sus reseñas, y si su nombre, dirección y teléfono coinciden en todos lados donde aparecen. Después creamos páginas y artículos que responden exactamente lo que sus clientes escriben.',
          'Este trabajo es lento. Cuente con tres a seis meses antes de que empiece a acumularse. Quien le prometa la primera página para el martes le está vendiendo otra cosa.',
        ],
        outcomes: [
          'Perfil de Google Business completo y verificado',
          'Una lista de palabras clave basada en lo que sus clientes escriben',
          'Páginas para cada servicio y cada zona que atiende',
          'Un calendario de artículos que sí puede mantener',
          'Un reporte mensual de una página, en palabras y no en gráficas',
        ],
        meta: 'SEO local para negocios pequeños en Pasadena y Los Ángeles. Aparezca en Google Maps y en las búsquedas sin pagar por cada clic.',
      },
      'zh-hans': {
        title: '让客人在谷歌上找到您',
        tagline: '客人已经在搜索了，问题是他们看到的是谁。',
        summary: '当附近的人搜索您卖的东西时出现在结果里，而且不必为每次点击付费。',
        body: [
          '此时此刻，离您几公里之内就有人正在手机上搜索您做的这个行业。唯一的问题是：跳出来的是谁的名字。那个位置不靠运气，也不是什么玄学，而是一堆具体、枯燥、但可以一件件解决的事情。',
          '我们先做对本地生意最有效的免费部分：谷歌商家资料、客户评价，以及您的店名、地址、电话在网上各处是否一致。然后我们再制作页面和文章，回答客人真正会搜的那些问题。',
          '这件事很慢。通常需要三到六个月才会开始见效并逐步累积。任何人跟您保证「下周就上第一页」，那他卖给您的是别的东西。',
        ],
        outcomes: [
          '完整填写并通过验证的谷歌商家资料',
          '一份根据客人实际搜索词整理的关键词清单',
          '为每项服务和每个服务区域制作专门页面',
          '一份您能长期坚持下去的每月文章计划',
          '每月一页纸的报告，用大白话写，不是一堆图表',
        ],
        meta: '为帕萨迪纳和大洛杉矶地区小型企业提供本地谷歌推广服务。不用为每次点击付费，也能让客人找到您。',
      },
      'zh-hant': {
        title: '讓客人在 Google 上找到您',
        tagline: '客人已經在搜尋了，問題是他們看到的是誰。',
        summary: '當附近的人搜尋您賣的東西時出現在結果裡，而且不必為每次點擊付費。',
        body: [
          '此時此刻，離您幾公里之內就有人正在手機上搜尋您做的這個行業。唯一的問題是：跳出來的是誰的名字。那個位置不靠運氣，也不是什麼玄學，而是一堆具體、枯燥、但可以一件件解決的事情。',
          '我們先做對本地生意最有效的免費部分：Google 商家檔案、客戶評價，以及您的店名、地址、電話在網路上各處是否一致。接著我們再製作頁面和文章，回答客人真正會搜尋的那些問題。',
          '這件事很慢。通常需要三到六個月才會開始見效並逐步累積。任何人跟您保證「下週就上第一頁」，那他賣給您的是別的東西。',
        ],
        outcomes: [
          '完整填寫並通過驗證的 Google 商家檔案',
          '一份根據客人實際搜尋字詞整理的關鍵字清單',
          '為每項服務和每個服務區域製作專門頁面',
          '一份您能長期堅持下去的每月文章計畫',
          '每月一頁的報告，用白話寫，不是一堆圖表',
        ],
        meta: '為帕薩迪納和大洛杉磯地區小型企業提供在地 Google 推廣服務。不用為每次點擊付費，也能讓客人找到您。',
      },
    },
  },

  /* ── 3. Business consulting ─────────────────────────────────────────── */
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
        title: 'A second opinion on your business',
        tagline: 'Someone to think it through with, who has no stake in the answer.',
        summary:
          "Running a small business means making a lot of decisions alone — should you raise your prices, hire someone, or drop a service that isn't worth your time? We sit down with you, look at your numbers, and help you figure out what to do next. You get a short, clear plan you can actually use, not a stack of confusing reports. Sometimes the honest answer is that your business is already doing fine, and we'll tell you that too.",
        body: [
          "Running a small business means every decision lands on one desk. Should you raise prices. Should you hire. Should you drop the service that eats half your week and brings in a tenth of your revenue. There's rarely anyone to talk it through with who isn't also your spouse or your employee.",
          "We do that. It's a working session, not a lecture — we look at your numbers together, name the two or three things that actually matter this quarter, and leave you with a short written summary you can act on.",
          "Sometimes the honest answer is that your business is fine and you don't need us. We'll tell you that too.",
        ],
        outcomes: [
          'A working session on what to fix first',
          'A plain look at where your revenue and time really come from',
          'A short written summary you keep, not a slide deck',
          'A follow-up check-in to see if it worked',
        ],
        meta: 'Practical business consulting for small business owners in Southern California. Pricing, offers, and priorities — no jargon, no slide decks.',
      },
      es: {
        title: 'Una segunda opinión sobre su negocio',
        tagline: 'Alguien con quien pensarlo, que no tiene nada que ganar.',
        summary:
          'Sesiones de trabajo sobre precios, ofertas y a dónde se le va el tiempo.',
        body: [
          'Tener un negocio pequeño significa que todas las decisiones caen en un solo escritorio. Si subir los precios. Si contratar a alguien. Si dejar ese servicio que se come la mitad de la semana y trae la décima parte del ingreso. Y casi nunca hay con quién platicarlo que no sea su pareja o su empleado.',
          'Eso es lo que hacemos. Es una sesión de trabajo, no una conferencia: revisamos sus números juntos, identificamos las dos o tres cosas que de verdad importan este trimestre, y usted se queda con un resumen corto por escrito.',
          'A veces la respuesta honesta es que su negocio está bien y no nos necesita. También se lo vamos a decir.',
        ],
        outcomes: [
          'Una sesión de trabajo sobre qué arreglar primero',
          'Una mirada clara a de dónde vienen su ingreso y su tiempo',
          'Un resumen corto por escrito que usted conserva',
          'Una llamada de seguimiento para ver si funcionó',
        ],
        meta: 'Asesoría práctica para dueños de negocios pequeños en el sur de California. Precios, servicios y prioridades, sin palabras complicadas.',
      },
      'zh-hans': {
        title: '给您的生意一个第二意见',
        tagline: '找个人一起把事情想清楚，而且他跟结果没有利害关系。',
        summary: '围绕定价、产品和您的时间到底花在哪里，一起坐下来把问题过一遍。',
        body: [
          '做小生意意味着所有决定都压在同一张桌子上。要不要涨价。要不要招人。那项占了您一半时间、却只带来十分之一收入的服务，要不要砍掉。而能商量的人，往往不是您的家人就是您的员工。',
          '我们做的就是这件事。这是一次一起干活的会谈，不是听课：我们一起看您的数字，挑出这个季度真正要紧的两三件事，最后给您一份可以直接照着做的简短书面总结。',
          '有时候诚实的答案是：您的生意挺好的，不需要我们。这话我们也会照直说。',
        ],
        outcomes: [
          '一次会谈，弄清楚先解决哪件事',
          '看清楚您的收入和时间到底来自哪里',
          '一份留给您的简短书面总结，不是一堆幻灯片',
          '一次回访，看看办法有没有奏效',
        ],
        meta: '为南加州小型企业主提供务实的经营咨询：定价、服务组合和优先级，不讲行话，不做花架子。',
      },
      'zh-hant': {
        title: '給您的生意一個第二意見',
        tagline: '找個人一起把事情想清楚，而且他跟結果沒有利害關係。',
        summary: '圍繞定價、產品和您的時間到底花在哪裡，一起坐下來把問題過一遍。',
        body: [
          '做小生意意味著所有決定都壓在同一張桌子上。要不要漲價。要不要請人。那項佔了您一半時間、卻只帶來十分之一收入的服務，要不要砍掉。而能商量的人，往往不是您的家人就是您的員工。',
          '我們做的就是這件事。這是一次一起做事的會談，不是聽課：我們一起看您的數字，挑出這個季度真正要緊的兩三件事，最後給您一份可以直接照著做的簡短書面總結。',
          '有時候誠實的答案是：您的生意挺好的，不需要我們。這話我們也會照直說。',
        ],
        outcomes: [
          '一次會談，釐清先解決哪件事',
          '看清楚您的收入和時間到底來自哪裡',
          '一份留給您的簡短書面總結，不是一堆簡報',
          '一次回訪，看看方法有沒有奏效',
        ],
        meta: '為南加州小型企業主提供務實的經營諮詢：定價、服務組合和優先順序，不講行話，不做花架子。',
      },
    },
  },

  /* ── 4. Paid ads ────────────────────────────────────────────────────── */
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
        title: 'Paid ads, when they make sense',
        tagline: "We'll tell you honestly whether you should be running them.",
        summary:
          "Paid ads on Google and Facebook can bring in customers fast, but they can also waste your money if they're not set up right. Before we recommend running ads, we check whether they actually make sense for your business. If they do, we keep your budget under control and show you exactly what you're getting each month. If they don't, we'll say so and suggest something that works better.",
        body: [
          "Paid advertising is the fastest way to get in front of people and the fastest way to burn money. Whether it's worth it depends on one number: what a customer is worth to you over their lifetime. If that number is small, ads will lose you money no matter how well they're run.",
          "So we start by working that out together. If the math doesn't hold up, we say so and point you toward something that will work better — usually search or your existing customer list.",
          'When it does make sense, we keep it tight: a small number of campaigns, a real budget cap, and a plain monthly note about what you spent and what it brought back.',
        ],
        outcomes: [
          'An honest answer on whether ads suit your business',
          'Campaigns built around what a customer is actually worth',
          'A budget cap that cannot quietly run away from you',
          'Call and form tracking, so you know what came from where',
          'A monthly note: spent this, got that',
        ],
        meta: 'Google and Meta ads management for Southern California small businesses. We start by checking whether ads are even the right move for you.',
      },
      es: {
        title: 'Publicidad pagada, cuando tiene sentido',
        tagline: 'Le decimos con honestidad si debería estar pagando anuncios.',
        summary:
          'Anuncios en Google y Meta para negocios donde las cuentas sí salen.',
        body: [
          'La publicidad pagada es la forma más rápida de llegar a la gente y también la más rápida de quemar dinero. Que valga la pena depende de un solo número: cuánto vale un cliente para usted a lo largo del tiempo. Si ese número es chico, los anuncios le van a costar dinero por bien que se manejen.',
          'Por eso empezamos por sacar esa cuenta juntos. Si no cuadra, se lo decimos y le señalamos algo que sí va a funcionar mejor, casi siempre las búsquedas o su propia lista de clientes.',
          'Cuando sí tiene sentido, lo mantenemos simple: pocas campañas, un tope de presupuesto real, y una nota mensual clara de cuánto gastó y cuánto regresó.',
        ],
        outcomes: [
          'Una respuesta honesta sobre si los anuncios le convienen',
          'Campañas armadas según lo que vale un cliente de verdad',
          'Un tope de presupuesto que no se le puede escapar',
          'Seguimiento de llamadas y formularios, para saber qué vino de dónde',
          'Una nota mensual: gastó esto, entró aquello',
        ],
        meta: 'Manejo de anuncios en Google y Meta para negocios pequeños del sur de California. Primero revisamos si los anuncios le convienen.',
      },
      'zh-hans': {
        title: '该投广告的时候才投',
        tagline: '我们会实话告诉您，到底该不该花这个钱。',
        summary: '为算得过账的生意投放谷歌和 Meta 广告。',
        body: [
          '付费广告是最快让人看到您的办法，也是最快烧钱的办法。值不值得，取决于一个数字：一位客人在往后的时间里总共能给您带来多少钱。如果这个数字不大，广告投得再好也是亏。',
          '所以我们先跟您一起把这笔账算清楚。如果算不过来，我们就直说，并且告诉您什么办法更划算——通常是自然搜索，或者您手上已有的老客户名单。',
          '如果确实该投，我们会做得很克制：广告系列数量少、设定真正管用的预算上限，每月给您一份大白话的说明：花了多少，带回来多少。',
        ],
        outcomes: [
          '关于「您到底适不适合投广告」的实话',
          '按一位客人的真实价值来设计广告投放',
          '不会悄悄超支的预算上限',
          '来电和留言追踪，弄清楚客人从哪儿来的',
          '每月一份简单说明：花了这些，收回这些',
        ],
        meta: '为南加州小型企业管理谷歌和 Meta 广告投放。我们会先帮您算清楚，投广告到底划不划算。',
      },
      'zh-hant': {
        title: '該投廣告的時候才投',
        tagline: '我們會實話告訴您，到底該不該花這個錢。',
        summary: '為算得過帳的生意投放 Google 和 Meta 廣告。',
        body: [
          '付費廣告是最快讓人看到您的辦法，也是最快燒錢的辦法。值不值得，取決於一個數字：一位客人在往後的時間裡總共能為您帶來多少錢。如果這個數字不大，廣告投得再好也是虧。',
          '所以我們先跟您一起把這筆帳算清楚。如果算不過來，我們就直說，並且告訴您什麼辦法更划算——通常是自然搜尋，或者您手上已有的老客戶名單。',
          '如果確實該投，我們會做得很節制：廣告系列數量少、設定真正管用的預算上限，每月給您一份白話的說明：花了多少，帶回來多少。',
        ],
        outcomes: [
          '關於「您到底適不適合投廣告」的實話',
          '按一位客人的真實價值來設計廣告投放',
          '不會悄悄超支的預算上限',
          '來電和留言追蹤，弄清楚客人從哪裡來的',
          '每月一份簡單說明：花了這些，收回這些',
        ],
        meta: '為南加州小型企業管理 Google 和 Meta 廣告投放。我們會先幫您算清楚，投廣告到底划不划算。',
      },
    },
  },
];

/** Look up a service by its localized slug. */
export function serviceBySlug(locale: Locale, slug: string): Service | undefined {
  return services.find((s) => s.slugs[locale] === slug);
}
