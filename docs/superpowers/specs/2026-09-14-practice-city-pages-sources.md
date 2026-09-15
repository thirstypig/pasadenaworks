# Sources for the practice city pages

Every figure below was produced by `node scripts/city-data.mjs`, queried
**2026-09-15**, and is the only source the city-page copy may cite. Re-run the
script and update this file before reusing any number here past its query
date.

## Methods

- **Clinicians.** CMS NPI Registry API v2.1, one query per taxonomy in
  {Dentist, Optometrist, Family Medicine, Internal Medicine}, `state=CA`,
  `enumeration_type=NPI-1`, `address_purpose=LOCATION`, paginated
  `limit=200` with `skip` until a page returns fewer than 200 results (a
  full page at `skip=1000` — 1,200 results — is reported as "more than
  1,200," never a guessed number; none of the ten cities hit this).
  Two traps found by querying, both handled in `scripts/city-data.mjs`:
  - The registry's own city filter matches **mailing** addresses too, not
    just practice locations — each provider is re-checked for a `LOCATION`
    address in the target city before being counted.
  - The taxonomy filter is a substring match against **every** taxonomy a
    provider lists, not just their primary one — a query for "Dentist"
    returned a training-program student whose *secondary* taxonomy was
    Dentist. Every provider is re-filtered by primary taxonomy: dentists and
    optometrists by taxonomy description prefix, primary care restricted to
    the two generalist codes (`207Q00000X` Family Medicine, `207R00000X`
    Internal Medicine) so cardiologists and other Internal Medicine
    subspecialists, filed under the same top-level taxonomy, are excluded.
  - Providers are de-duplicated by NPI number across the two primary-care
    queries.
- **Hospitals.** California HCAI licensed facility list (ArcGIS
  `facilitylist` feature service), `LicenseType='General Acute Care' AND
  FacilityStatus='A'`, `City` in the city or an adjoining one from
  `CITIES[].hcai` in the script. A hospital in an adjoining city is
  described as **nearby**, never as in the city. Judgment call, found by
  reading the results: HCAI licenses some buildings on a hospital's own
  campus as separate facility records. `FacilityNbr 33832`, "HH-CSHS
  TERRI  JERRY KOHL MEDICAL PAVIL," is a licensed building on Huntington
  Hospital's own Pasadena campus (`FacilityNbr 11733`) — pages name it once,
  as Huntington Hospital, and do not list it as a second, separate hospital.
  No other city's result set showed this pattern; every other facility
  returned is a genuinely distinct hospital.
- **Language at home.** ACS 5-year estimates, table C16001, via Census
  Reporter (`api.censusreporter.org`) — the Census Bureau's own API now
  requires a key. The release is pinned explicitly in the query
  (`/1.0/data/show/acs2024_5yr?table_ids=C16001&geo_ids=...`), not requested
  as "latest": asking for "latest" silently resolved to the 1-year release on
  2026-09-15 for this exact table and geography set — Pasadena's Spanish
  share came back 20.9%/Chinese 4.5% under "latest" against 24.2%/5.5% under
  the pinned 5-year release. The script also checks the response's
  `release.id` actually is a 5-year release (`isFiveYearRelease()`) and
  throws rather than use the data otherwise, the same guard pattern as
  `placeMatches()` below. Spanish = `C16001003 / C16001001`; Chinese (incl.
  Mandarin, Cantonese) = `C16001021 / C16001001`; rounded to one decimal
  place. Each Census place ID is checked to resolve to the expected city
  name before its figures are used — an earlier attempt at Monterey Park's
  ID (`16000US0648816`) returned Montebello; the correct ID is
  `16000US0648914`. All ten IDs used here resolved correctly.
  Census Reporter returns HTTP 403 to Node's default `fetch` (no
  `User-Agent`); a browser-shaped header set (`User-Agent`, `Accept`,
  `Accept-Language`) is sufficient — no proxy or fallback source was needed.

## Pasadena

- Dentists: **213** practising in Pasadena (NPI, LOCATION, primary taxonomy, queried 2026-09-15)
- Optometrists: **93** (same query, 2026-09-15)
- Primary-care physicians (family + internal medicine, generalist codes): **227** (2026-09-15)
- Hospitals in the city: **Huntington Hospital** (HCAI facility #11733, General Acute Care, active). A second HCAI record, "HH-CSHS Terri Jerry Kohl Medical Pavilion" (#33832), is a separately licensed building on Huntington's own campus, not a second hospital.
- Spanish at home (5+): **24.2%**; Chinese: **5.5%** (ACS 2024 5-year, table C16001, place `16000US0656000` → "Pasadena, CA", queried 2026-09-15)

## Altadena

- Dentists: **14**; optometrists: **1**; primary-care physicians: **1** (NPI, 2026-09-15)
- No general acute care hospital in Altadena. Nearby: **Huntington Hospital**, Pasadena (HCAI #11733; its campus building #33832 is the same hospital, not counted separately)
- Spanish at home (5+): **21.3%**; Chinese: **1.7%** (ACS 2024 5-year, place `16000US0601290` → "Altadena CDP, CA", queried 2026-09-15)
- See the Eaton Fire section below — this is the one page where fire recovery is addressed.

## South Pasadena

- Dentists: **45**; optometrists: **12**; primary-care physicians: **11** (NPI, 2026-09-15)
- No general acute care hospital in South Pasadena. Nearby: **Alhambra Hospital Medical Center**, Alhambra (HCAI #11386); **Huntington Hospital**, Pasadena (HCAI #11733)
- Spanish at home (5+): **11.6%**; Chinese: **14.7%** (ACS 2024 5-year, place `16000US0673220` → "South Pasadena, CA", queried 2026-09-15)

## Glendale

- Dentists: **305**; optometrists: **66**; primary-care physicians: **237** (NPI, 2026-09-15)
- Hospitals in the city: **Adventist Health Glendale** (HCAI #11668), **USC Verdugo Hills Hospital** (HCAI #12551), **Glendale Memorial Hospital and Health Center** (HCAI #11844) — three distinct, active general acute care hospitals
- Spanish at home (5+): **13.7%**; Chinese: **0.9%** (ACS 2024 5-year, place `16000US0630000` → "Glendale, CA", queried 2026-09-15)

## Alhambra

- Dentists: **91**; optometrists: **16**; primary-care physicians: **68** (NPI, 2026-09-15)
- Hospitals in the city: **Alhambra Hospital Medical Center** (HCAI #11386)
- Nearby: **San Gabriel Valley Medical Center**, San Gabriel (HCAI #11548); **Garfield Medical Center**, Monterey Park (HCAI #11658); **Monterey Park Hospital**, Monterey Park (HCAI #12878)
- Spanish at home (5+): **23.0%**; Chinese: **33.0%** (ACS 2024 5-year, place `16000US0600884` → "Alhambra, CA", queried 2026-09-15)

## Arcadia

- Dentists: **144**; optometrists: **35**; primary-care physicians: **100** (NPI, 2026-09-15)
- Hospitals in the city: **USC Arcadia Hospital** (HCAI #11858)
- Nearby: **Monrovia Memorial Hospital**, Monrovia (HCAI #11874)
- Spanish at home (5+): **9.3%**; Chinese: **37.6%** (ACS 2024 5-year, place `16000US0602462` → "Arcadia, CA", queried 2026-09-15)

## Monrovia

- Dentists: **25**; optometrists: **15**; primary-care physicians: **13** (NPI, 2026-09-15). An earlier same-day probe (recorded in the task brief) found 26 dentists with the LOCATION filter; the registry is a live database and the count moved by one between that probe and this query — 25 is what this run's query returned and is the number to use.
- Hospitals in the city: **Monrovia Memorial Hospital** (HCAI #11874)
- Nearby: **USC Arcadia Hospital**, Arcadia (HCAI #11858)
- Spanish at home (5+): **30.1%**; Chinese: **6.7%** (ACS 2024 5-year, place `16000US0648648` → "Monrovia, CA", queried 2026-09-15)

## San Marino

- Dentists: **18**; optometrists: **2**; primary-care physicians: **17** (NPI, 2026-09-15)
- No general acute care hospital in San Marino. Nearby: **San Gabriel Valley Medical Center**, San Gabriel (HCAI #11548); **Huntington Hospital**, Pasadena (HCAI #11733)
- Spanish at home (5+): **3.2%**; Chinese: **43.8%** (ACS 2024 5-year, place `16000US0668224` → "San Marino, CA", queried 2026-09-15)

## Monterey Park

- Dentists: **69**; optometrists: **27**; primary-care physicians: **62** (NPI, 2026-09-15)
- Hospitals in the city: **Garfield Medical Center** (HCAI #11658), **Monterey Park Hospital** (HCAI #12878) — two distinct, active general acute care hospitals
- Nearby: **Alhambra Hospital Medical Center**, Alhambra (HCAI #11386)
- Spanish at home (5+): **16.4%**; Chinese: **42.1%** (ACS 2024 5-year, place `16000US0648914` → "Monterey Park, CA", queried 2026-09-15). This is the place ID from the design spec's re-derived table; an earlier attempt at `16000US0648816` returned Montebello and was rejected.

## San Gabriel

- Dentists: **106**; optometrists: **31**; primary-care physicians: **47** (NPI, 2026-09-15)
- Hospitals in the city: **San Gabriel Valley Medical Center** (HCAI #11548)
- Nearby: **Alhambra Hospital Medical Center**, Alhambra (HCAI #11386)
- Spanish at home (5+): **15.1%**; Chinese: **40.1%** (ACS 2024 5-year, place `16000US0667042` → "San Gabriel, CA", queried 2026-09-15)

## Eaton Fire (Altadena page only)

- **9,419 structures destroyed**, **19 confirmed civilian fatalities** — CAL
  FIRE incident page, read directly (not blocked), page marked "Last
  Updated: 08/06/2026 10:47 AM".
  Source: <https://www.fire.ca.gov/incidents/2025/1/7/eaton-fire>
  (The design spec's draft table carried 9,418; the live page now reads
  9,419 — CAL FIRE's own count moved by one since that draft. Use 9,419,
  the number on the page actually read.)
- **Rebuilding pace, as of December 2025:** of nearly 6,000 Altadena
  residential properties that suffered significant damage, only **23** had
  completed all rebuilding and repairs, and only **43%** had at least
  applied for or received a permit to begin construction.
  Source: Catalyst California, "Red Tape to Recovery: Tracking Altadena
  Rebuilding After the Eaton Fire" —
  <https://www.catalystcalifornia.org/campaign-tools/publications/red-tape-to-recovery-tracking-altadena-rebuilding>
  (the tracker the design spec names). CAL FIRE's own incident page carries
  destruction/fatality figures only, not a rebuilding pace, so the tracker
  is the source for that half.

## Reader-facing source links

Each confirmed to respond 200 on 2026-09-15 before being listed:

- NPI Registry search: <https://npiregistry.cms.hhs.gov/search>
- HCAI healthcare facility locations dataset: <https://data.chhs.ca.gov/dataset/healthcare-facility-locations>
- U.S. Census Bureau, data.census.gov, table C16001 pinned to the ACS 2024 5-year detailed tables and one place (replace the seven-digit state + place code, e.g. `0656000` for Pasadena): <https://data.census.gov/table/ACSDT5Y2024.C16001?g=160XX00US0656000>
  Verified 2026-09-15 by rendering all ten places in a real browser and recomputing each share from the page's own Total, Spanish and Chinese (incl. Mandarin, Cantonese) estimates: every Spanish and Chinese share above matched to one decimal place (Pasadena 31,629 and 7,222 of 130,511, giving 24.2% and 5.5%, the 5-year values, not the 1-year 20.9%/4.5%).
  The Census Reporter link recorded here earlier (`censusreporter.org/tables/C16001/?geo_ids=…`) was replaced the same day: that page is a generic table description that ignores `geo_ids` until a reader picks a place, so it showed none of the cited figures.

## Spanish phrasing (`es` city pages)

Chosen 2026-09-15 for `src/data/city-copy/es.ts`. Figures are the English
figures with a period as the decimal mark (`24.2%`) and a comma for thousands
(`9,419`, `6,000`), the US Spanish convention the service pages already use
(`50,000 dólares`) and what the figure-parity test compares. The Census
Bureau's own Spanish releases write `78,3 %`; that form was not adopted,
because this site's Spanish follows US practice and parity is digit-exact.

- **Title and headline noun: `consultorio`.** The owner's title pattern is
  `Más pacientes para consultorios médicos y dentales en {City}`, and
  `services.ts` uses `consultorio` throughout. `clínica dental` is also common
  in US Spanish marketing (Aspen Dental's Spanish site brands itself `Clínica
  Dental`, <https://www.aspendental.com/espanol/>), but a second noun would
  split the keyword. `asesoría` / `consultoría` are not used as the headline
  noun (owner decision). Eye care in metas is `de optometría`, as in the
  service metas; `independientes` is left out of the metas to fit 130–160
  characters, as the Spanish homepage meta in `ui.ts` already does.
- **Google Business Profile: `Perfil de Negocio de Google`**, from Google's
  es-419 help center title, "Ayuda de Perfil de Negocio de Google":
  <https://support.google.com/business/answer/9798848?hl=es-419>. A Google
  listing in general is `ficha de Google`, as `services.ts` has "Fichas en
  directorios".
- **Census Bureau and ACS: `Oficina del Censo`, `Encuesta sobre la Comunidad
  Estadounidense`, `estimaciones de cinco años`, `de cinco años o más`,
  `hablan español en casa`**, from the Bureau's Spanish release on language
  at home:
  <https://www.census.gov/newsroom/press-releases/2023/language-at-home-acs-5-year/language-at-home-acs-5-year-spanish.html>
  ("Encuesta sobre la Comunidad Estadounidense (ACS)", "estimaciones de 5
  años", "población de 5 años o más"). The release writes the digit 5; the
  pages write `cinco` because the English writes "five", and the parity test
  compares digits.
- **HCAI: `Departamento de Información y Acceso a la Atención Sanitaria de
  California`**, the department's own Spanish name on
  <https://hcai.ca.gov/acerca-de-nuestra-organizacion/programas/>. It is used
  in the source label, and the body writes `el HCAI de California`.
- **General acute care hospital: `hospital general de cuidados agudos`.** The
  CDC's Spanish NHSN FAQ writes "hospitales de cuidados agudos"
  (<https://www.cdc.gov/nhsn/pdfs/espanol/AUR-FAQs-for-web-es.pdf>). `general`
  is kept because it is part of California's license category name. Hospital
  names stay in English, as the hospitals name themselves.
- **NPI Registry: `Registro NPI`; source label `Registro NPI de los CMS`.**
  CMS publishes no Spanish name for the registry. `CMS` is left unexpanded,
  as CMS's own Spanish resource page does
  (<https://www.cms.gov/priorities/health-equity/minority-health/resource-center/language/spanish-espanol>).
  Insurers' Spanish pages write "Identificador de Proveedor Nacional"
  (<https://es.deltadentalins.com/about/legal/understanding-npi.html>), which
  the page does not need, since it names only the registry.
- **Clinicians: `médicos de atención primaria`, `medicina familiar o medicina
  interna`, `dentistas`, `optometristas`**, the terms California insurers
  and Covered California use in Spanish
  (<https://www.coveredca.com/espanol/members/primary-care-physician/>, which
  also uses "médico de cuidado primario";
  <https://es-www.humana.com/vision-insurance/vision-resources/optometrist-vs-ophthalmologist>).
  "Practice location" is `lugar de consulta`.
- **Eaton Fire: `incendio Eaton`**, as Telemundo 52 writes it
  (<https://www.telemundo52.com/noticias/local/linea-tiempo-incendios-eaton-palisades-los-angeles/2730189/>).
  `CAL FIRE` stays as the agency's own acronym. Catalyst California's report
  title stays in English because it is a proper title.
- **Front-office terms** come from the Spanish `services.ts` copy:
  `formularios de admisión`, `formularios de consentimiento`, `recordatorios
  de citas`, `mensajes de recordatorio`, `recepción`, `expedientes`,
  `sistema EHR`, `reseñas`. The three service names appear verbatim:
  `Revisión integral del consultorio`, `Digitalizar el consultorio` and
  `Conseguir más pacientes`. The two infinitive names are introduced as `el
  servicio …` in running text, so they do not read as ordinary verbs.

## Chinese city names

Settled 2026-09-15 for the `zh-hans` titles (`为{城市名}（{City}）医疗与牙科诊所带来更多患者`),
and pinned in `cities.test.ts`. The rule: the name the San Gabriel Valley's own
Chinese-language press, directories and city governments write, because that
is what a reader searches for. Chinese Wikipedia was used only where no local
source was found, and was **overruled** where it disagrees with local use
(Monterey Park is 蒙特雷帕克 on zh.wikipedia's zh-cn variant and San Gabriel
圣加布里埃尔; nobody local writes either). Every URL below was fetched on
2026-09-15 and the name counted in the returned page, except where noted.

The Traditional column records what a source actually prints, for the
`zh-hant` task to weigh; it is **not** a character-by-character conversion of
the Simplified column. Local Traditional-script usage differs from Simplified
usage for several cities (World Journal writes 巴沙迪那 for Pasadena, where
Simplified sources write 帕萨迪纳), and `zh-hant` should make its own call.

| City | Simplified (`zh-hans`) | Simplified source | Traditional, as printed | Traditional source |
|---|---|---|---|---|
| Pasadena | 帕萨迪纳 | VOA Chinese, <https://www.voachinese.com/a/california-wildfires-could-be-leaving-deeper-inequality-in-their-wake-20250112/7934221.html> | 巴沙迪那 (World Journal); 帕沙第納 (zh.wikipedia zh-tw) | <https://www.worldjournal.com/wj/story/121362/9729757> |
| Altadena | 阿尔塔迪纳 | VOA Chinese, same article (11 occurrences) | 阿爾塔迪納 | zh.wikipedia zh-tw, <https://zh.wikipedia.org/zh-tw/阿爾塔迪納_(加利福尼亞州)>; World Journal headlines write 艾塔迪那 (seen in search results, page not fetchable by script) |
| South Pasadena | 南帕萨迪纳 | zh.wikipedia zh-cn, <https://zh.wikipedia.org/zh-cn/南帕萨迪纳_(加利福尼亚州)> — follows Pasadena, so the two related names are searched together | 南帕薩迪那 (CCYP directory) | <https://www.ccyp.com/subjects/91143> |
| Glendale | 格伦代尔 | zh.wikipedia zh-cn, <https://zh.wikipedia.org/zh-cn/格倫代爾_(加利福尼亞州)> | 格倫代爾 (zh.wikipedia zh-tw); 格蘭岱 (CCYP) | <https://zh.wikipedia.org/zh-tw/格倫代爾_(加利福尼亞州)>, <https://www.ccyp.com/subjects/91114> |
| Alhambra | 阿罕布拉 | CCYP directory (Simplified edition), <https://cn.ccyp.com/subjects/91081> | 阿罕布拉 | City of Alhambra, water-rate assistance guidelines, <https://www.alhambraca.gov/DocumentCenter/View/6724/CITY-OF-ALHAMBRA-LIWRAP-Final-Guildelines-TCH> |
| Arcadia | 亚凯迪亚 | 美洲华联社 (LA, Simplified), <https://huarenone.com/2026/02/04/%E7%8E%8B%E7%88%B1%E6%9E%97%E5%B0%B1%E4%BB%BB%E4%BA%9A%E5%87%AF%E8%BF%AA%E4%BA%9A%E5%B8%82%E5%B8%82%E9%95%BF-%E9%83%91%E5%8D%9A%E4%BB%81%E5%BE%8B%E5%B8%88%E6%8B%85%E4%BB%BB%E5%89%AF%E5%B8%82%E9%95%BF/>; CCYP, <https://cn.ccyp.com/subjects/91083> | 亞凱迪亞 | World Journal tag page, <https://www.worldjournal.com/search/tagging/8877/亞凱迪亞> |
| Monrovia | 蒙罗维亚 | CCYP, <https://cn.ccyp.com/subjects/91124> | 蒙羅維亞 | CCYP, <https://www.ccyp.com/subjects/91124> |
| San Marino | 圣马力诺 | zh.wikipedia zh-cn, <https://zh.wikipedia.org/zh-cn/圣玛利诺_(加利福尼亚州)> (renders 圣马力诺); the China Press (侨报) also wrote 圣马力诺市, but its 2014 article URL now returns 404 | 聖瑪利諾 | World Journal tag page, <https://www.worldjournal.com/search/tagging/8877/聖瑪利諾> |
| Monterey Park | 蒙特利公园 | CCYP, <https://cn.ccyp.com/subjects/91126> | 蒙特利公園 | City of Monterey Park news release, <https://www.montereypark.ca.gov/DocumentCenter/View/8703> |
| San Gabriel | 圣盖博 | CCYP, <https://cn.ccyp.com/subjects/91136> | 聖蓋博 | City of San Gabriel housing relief guidelines (Chinese), <https://sangabrieled.com/DocumentCenter/View/494/CHINESE--Housing-Relief-Guidlines>; World Journal tag page, <https://www.worldjournal.com/search/tagging/8877/聖蓋博> |

Two judgment calls:

- **Arcadia is 亚凯迪亚, not 阿凯迪亚.** The plan's example was 阿凯迪亚, and
  national outlets vary (VOA 阿卡迪亚, RFA 阿凯迪亚). The local press agrees on
  亚凯迪亚 in both scripts — 美洲华联社 in Simplified, World Journal's 亞凱迪亞
  tag in Traditional — and so does the CCYP directory, so the local form wins.
- **Hospital names stay in English** (Huntington Hospital, Garfield Medical
  Center, …). No hospital's own Chinese-language material was checked, so no
  Chinese rendering is asserted. A neighboring city's hospital is always
  written with 附近 / 相邻城市 / 邻近 and that city's name plus 市.

## Simplified Chinese phrasing (`zh-hans` city pages)

Chosen 2026-09-15 for `src/data/city-copy/zh-hans.ts`, translated from the
English, not from the Spanish.

- **Figures** are the English figures in Arabic digits with a period decimal
  (`24.2%`) and a comma for thousands (`9,419`, `6,000`), as `services.ts`
  already writes `50,000 美元`. Dates are `2026 年 9 月`, which the parity test
  reduces to the year. Quantities the English writes as words stay Chinese
  numerals — `五岁及以上`, `四比一`, `三分之一`, `超过八分之一`, `每十位居民中就有四位以上`
  — because writing `5 岁` would add a digit the English does not have. One
  space separates Latin text and digits from Han characters.
- **Title and headline noun: `诊所`**, in the owner's pattern
  `为{城市名}（{City}）医疗与牙科诊所带来更多患者`. Eye care in the metas is
  `眼科诊所`, as in the service metas. `顾问` is not used (owner decision), and
  nothing mentions selling a practice.
- **Service names verbatim from `services.ts`:** `诊所经营诊断`, `诊所数字化`,
  `获取更多患者`, in “” quotation marks. The last two are followed by `服务` in
  running text, because both read as ordinary phrases otherwise — the same
  reason the Spanish writes `el servicio …`.
- **Google Business Profile: `Google 商家资料`**, the title of Google's zh-CN
  help center, "Google 商家资料帮助":
  <https://support.google.com/business/answer/9798848?hl=zh-CN>.
- **Census Bureau and ACS: `美国人口普查局`, `美国社区问卷调查（ACS）`, `五年估算`**,
  from the Bureau's own Simplified Chinese fact sheet, "2015–2019 年美国社区问卷调查
  (American Community Survey) (ACS), 5 年估算":
  <https://www.census.gov/content/dam/Census/library/factsheets/2020/dec/upcoming-us-population-releases-chinese-simplified.pdf>.
  The sheet writes the digit 5; the pages write `五` because the English writes
  "five".
- **NPI Registry: `NPI 登记系统`; source label `CMS NPI 登记系统`.** No official
  Chinese name for the registry or for CMS was found, so `CMS` stays
  unexpanded, as in the Spanish label.
- **HCAI: `加州 HCAI`**, with the English department name in the source label.
  HCAI publishes Spanish pages but no Chinese one was found, so no Chinese
  department name is invented.
- **General acute care hospital: `综合急症护理医院`.** California's license
  category has no official Chinese name; `综合医院` is the ordinary Chinese for a
  general hospital and `急症护理` for acute care, and both halves are kept
  because both are part of the category name.
- **Clinicians:** `初级保健医生` (the term California's Medi-Cal enrollment site
  uses throughout its Simplified Chinese edition,
  <https://www.healthcareoptions.dhcs.ca.gov/zh-Hans/>), with `家庭医学或内科` for
  "family or internal medicine"; `牙医`; `验光师` for optometrist (Cambridge
  Chinese–English dictionary,
  <https://dictionary.cambridge.org/us/dictionary/chinese-simplified-english/验光师>).
  "Practice location" is `执业地点`; individual clinicians are `个人执业者`.
- **Eaton Fire: `伊顿大火`**, as VOA Chinese writes it in the article cited for
  Altadena above. `CAL FIRE` and the Catalyst California report title stay in
  English.
- **Front-office terms** come from the Simplified `services.ts` copy:
  `初诊表格`, `知情同意书`, `预约提醒`, `召回信息`, `前台`, `电子病历系统`, `评价`.
- **Register.** The band is 0.55–0.85 on the 书面语 index, raised through word
  choice (因此, 然而, 并非, 至于, 由于) rather than sentence length, and every page
  keeps a few ordinary connectives (所以, 因为, 而不是) so none reads as a legal
  document. No sentence exceeds 85 Han characters.
