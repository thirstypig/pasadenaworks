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

The "Traditional, as printed" column records what a source actually prints; it
is **not** a character-by-character conversion of the Simplified column. Local
Traditional-script usage differs from Simplified usage for several cities
(World Journal writes 巴沙迪那 for Pasadena, where Simplified sources write
帕萨迪纳).

The "Decided `zh-hant`" column is the **one** name each city carries in
Traditional Chinese across the site — city pages, UI strings and blog —
decided 2026-09-15 for `src/data/city-copy/zh-hant.ts`, pinned in
`cities.test.ts`, and chosen in this order (controller ruling R14): the form
the site's existing `zh-hant` strings already use (`src/i18n/ui.ts`,
`src/data/home.ts`, `src/data/services.ts`, `src/content/blog/zh-hant/`); then
the San Gabriel Valley's Traditional-script press, above all World Journal
(世界日報); then Taiwan usage. Occurrences in the site were counted with
`LC_ALL=C /usr/bin/grep` and long-form flags. World Journal pages were fetched
by script on 2026-09-15 and the name counted in the returned HTML; its search
results page (`/search/word/8877/<name>`) was used only to find articles, since
it matches loosely.

| City | Simplified (`zh-hans`) | Simplified source | Traditional, as printed | Traditional source | Decided `zh-hant` |
|---|---|---|---|---|---|
| Pasadena | 帕萨迪纳 | VOA Chinese, <https://www.voachinese.com/a/california-wildfires-could-be-leaving-deeper-inequality-in-their-wake-20250112/7934221.html> | 巴沙迪那 (World Journal); 帕沙第納 (zh.wikipedia zh-tw) | <https://www.worldjournal.com/wj/story/121362/9729757> | **帕薩迪納.** The site already writes it: `ui.ts` (`citiesDescription`) and 20 times across eight `zh-hant` posts, with no other spelling anywhere. World Journal's news desk writes 巴沙迪那 (22 times in the article cited), but its own literary supplement prints 帕薩迪納 (5 times, <https://www.worldjournal.com/wj/story/121250/9569656>), so readers recognize both; 帕薩迪納 is also the same name as the Simplified pages' 帕萨迪纳. No reason found strong enough to change the site's existing form. |
| Altadena | 艾塔迪那 (was 阿尔塔迪纳 until 2026-09-15, see "One name per city") | World Journal, <https://www.worldjournal.com/wj/story/121359/9688465> — VOA Chinese wrote 阿尔塔迪纳 (11 occurrences in the article cited for Pasadena) and was overruled as a national outlet | 阿爾塔迪納 (zh.wikipedia zh-tw); 艾塔迪那 (World Journal) | zh.wikipedia zh-tw, <https://zh.wikipedia.org/zh-tw/阿爾塔迪納_(加利福尼亞州)>; World Journal, <https://www.worldjournal.com/wj/story/121359/9688465> (6 occurrences, a 2026 rebuilding story) and <https://www.worldjournal.com/wj/story/121359/9671593> (伊頓大火 headline) | **艾塔迪那.** The site had no Traditional name for it. World Journal's news desk writes 艾塔迪那 throughout its fire and rebuilding coverage; 阿爾塔迪納 and 阿塔迪納 appear there only in advertiser-supplied items. The Simplified pages wrote 阿尔塔迪纳 until 2026-09-15 and now write 艾塔迪那, which is the same four characters in both scripts. |
| South Pasadena | 南帕萨迪纳 | zh.wikipedia zh-cn, <https://zh.wikipedia.org/zh-cn/南帕萨迪纳_(加利福尼亚州)> — follows Pasadena, so the two related names are searched together | 南帕薩迪那 (CCYP directory); 南巴沙迪那 (World Journal) | <https://www.ccyp.com/subjects/91143>; <https://www.worldjournal.com/wj/story/121362/9572085> (21 occurrences) | **南帕薩迪納.** Follows the site's Pasadena. World Journal's 南巴沙迪那 follows its own 巴沙迪那; putting 南巴沙迪那 beside the site's 帕薩迪納 would make two related names look unrelated. Same name as the Simplified pages' 南帕萨迪纳. |
| Glendale | 格兰岱 (was 格伦代尔 until 2026-09-15, see "One name per city") | CCYP, which publishes 格兰岱市政府 and 格蘭岱市政府 for the same page — zh.wikipedia zh-cn's 格倫代爾, <https://zh.wikipedia.org/zh-cn/格倫代爾_(加利福尼亞州)>, is the form World Journal reserves for Glendale, Arizona | 格倫代爾 (zh.wikipedia zh-tw); 格蘭岱 (CCYP; World Journal) | <https://zh.wikipedia.org/zh-tw/格倫代爾_(加利福尼亞州)>, <https://www.ccyp.com/subjects/91114>; World Journal, <https://www.worldjournal.com/wj/story/121362/9585126> (格蘭岱市 10 times, the Glendale–LA river bridge) | **格蘭岱.** The site had no Traditional name for it. World Journal and the CCYP directory agree on 格蘭岱 for California's Glendale; World Journal keeps 格倫代爾 for Glendale, Arizona. The Simplified pages wrote 格伦代尔 until 2026-09-15 and now write 格兰岱. |
| Alhambra | 阿罕布拉 | CCYP directory (Simplified edition), <https://cn.ccyp.com/subjects/91081> | 阿罕布拉 | City of Alhambra, water-rate assistance guidelines, <https://www.alhambraca.gov/DocumentCenter/View/6724/CITY-OF-ALHAMBRA-LIWRAP-Final-Guildelines-TCH> | **阿罕布拉.** The site's `zh-hant` blog (11 occurrences, six posts), the city itself and World Journal all agree. |
| Arcadia | 亚凯迪亚 | 美洲华联社 (LA, Simplified), <https://huarenone.com/2026/02/04/%E7%8E%8B%E7%88%B1%E6%9E%97%E5%B0%B1%E4%BB%BB%E4%BA%9A%E5%87%AF%E8%BF%AA%E4%BA%9A%E5%B8%82%E5%B8%82%E9%95%BF-%E9%83%91%E5%8D%9A%E4%BB%81%E5%BE%8B%E5%B8%88%E6%8B%85%E4%BB%BB%E5%89%AF%E5%B8%82%E9%95%BF/>; CCYP, <https://cn.ccyp.com/subjects/91083> | 亞凱迪亞 | World Journal tag page, <https://www.worldjournal.com/search/tagging/8877/亞凱迪亞> | **亞凱迪亞.** The site's majority form (9 occurrences in three posts, plus comments in `[locale]/[section]/index.astro` and `homepage-parity.test.ts`), World Journal's tag, and the Simplified pages' 亚凯迪亚. Two posts write 阿卡迪亞 — see below. |
| Monrovia | 蒙罗维亚 | CCYP, <https://cn.ccyp.com/subjects/91124> | 蒙羅維亞 | CCYP, <https://www.ccyp.com/subjects/91124> | **蒙羅維亞.** The site's blog (three posts), World Journal (9 times in <https://www.worldjournal.com/wj/story/121359/9450717>), CCYP, and the Simplified pages' 蒙罗维亚. |
| San Marino | 圣玛利诺 (was 圣马力诺 until 2026-09-15, see "One name per city") | zh.wikipedia's own article is titled 圣玛利诺_(加利福尼亚州), <https://zh.wikipedia.org/zh-cn/圣玛利诺_(加利福尼亚州)>, although its zh-cn variant renders the body as 圣马力诺; the China Press (侨报) also wrote 圣马力诺市, but its 2014 article URL now returns 404 | 聖瑪利諾 | World Journal tag page, <https://www.worldjournal.com/search/tagging/8877/聖瑪利諾> | **聖瑪利諾.** The site's blog (four occurrences, three posts) and World Journal's tag agree. |
| Monterey Park | 蒙特利公园 | CCYP, <https://cn.ccyp.com/subjects/91126> | 蒙特利公園 | City of Monterey Park news release, <https://www.montereypark.ca.gov/DocumentCenter/View/8703> | **蒙特利公園.** The site's blog (ten occurrences, three posts), the city and World Journal agree. |
| San Gabriel | 圣盖博 | CCYP, <https://cn.ccyp.com/subjects/91136> | 聖蓋博 | City of San Gabriel housing relief guidelines (Chinese), <https://sangabrieled.com/DocumentCenter/View/494/CHINESE--Housing-Relief-Guidlines>; World Journal tag page, <https://www.worldjournal.com/search/tagging/8877/聖蓋博> | **聖蓋博.** Already in `ui.ts` and `home.ts` (聖蓋博谷) and throughout the blog; the city and World Journal agree. |

### One name per city, 2026-09-15

Task 5c closed the last gap: until then the site could name the same city two
ways, because the Simplified and Traditional tables above were settled from
different sources, and the blog predated both. Three `zh-hans` names changed,
in every place they appear, so that a reader switching scripts never sees a
different city. The Traditional form won each time, on evidence re-fetched
during the Task 5 review:

| City | `zh-hans` was | `zh-hans` is | Why the Traditional form won |
|---|---|---|---|
| Altadena | 阿尔塔迪纳 | **艾塔迪那** | World Journal writes 艾塔迪那 6 times across its Eaton Fire and rebuilding coverage and none of the alternatives; all four characters are identical in both scripts, so the two locales now carry a byte-identical name. 阿尔塔迪纳 rested on VOA, a national outlet, against the rule at the head of this section that local San Gabriel Valley press wins. |
| Glendale | 格伦代尔 | **格兰岱** | World Journal writes 格蘭岱 38 times and 格倫代爾 0 times for California's Glendale, and CCYP publishes 格蘭岱市政府 and 格兰岱市政府 for the same page — so the directory itself treats 格兰岱 as the Simplified twin of 格蘭岱. |
| San Marino | 圣马力诺 | **圣玛利诺** | World Journal's tag page carries 聖瑪利諾 133 times and 0 for either 馬力 or 馬利, and 聖瑪利諾 was already the site's Traditional form. 圣马力诺 is also the standard Chinese name of the **Republic of San Marino**, so the page was competing with a country for its own keyword — a search argument the Traditional form does not have to fight. |

The blog was aligned in the same change. In `zh-hans` that meant 阿凯迪亚 (8) and
阿卡迪亚 (2) → 亚凯迪亚, 门罗维亚 (3) → 蒙罗维亚, and 圣马力诺 (4) → 圣玛利诺; in
`zh-hant`, 阿卡迪亞 (2) → 亞凱迪亞. No `zh-hant` post names Altadena, South
Pasadena or Glendale, and no post's `title`, `description`, `targetKeyword` or
`tags` carried a superseded spelling.

`cities.test.ts` now pins both scripts' names in one `ZH_NAME` map, asserts each
city page writes its own pinned name in the summary, body and meta (not only the
title) with no leak from the other script, and carries a `SUPERSEDED` tripwire
that walks `src/` and fails on any spelling this table overruled — including the
ones nobody local writes (巴沙迪那, 蒙特雷帕克, 圣加布里埃尔). This file is
deliberately outside that walk, because recording what each source actually
prints is its job.

Two judgment calls:

- **Arcadia is 亚凯迪亚, not 阿凯迪亚.** The plan's example was 阿凯迪亚, and
  national outlets vary (VOA 阿卡迪亚, RFA 阿凯迪亚). The local press agrees on
  亚凯迪亚 in both scripts — 美洲华联社 in Simplified, World Journal's 亞凱迪亞
  tag in Traditional — and so does the CCYP directory, so the local form wins.
- **A hospital gets a Chinese name only where its own material uses one**, and
  the English name follows in parentheses on first use on each page; every
  other hospital stays in English. A neighboring city's hospital is always
  written with 附近 / 相邻城市 and that city's name plus 市. Checked once per
  hospital on 2026-09-15 (fetched by script unless noted):

  | Hospital (HCAI name) | Chinese name on the hospital's own material | As printed (script) | Simplified used on the pages | Where |
  |---|---|---|---|---|
  | Garfield Medical Center (AHMC) | found | 嘉惠爾醫院 (Traditional) | 嘉惠尔医院（Garfield Medical Center） | Garfield's own Chinese visitor guidelines, <https://www.ahmchealth.com/gmc/docs/Visitor-Restriction-Guidelines-Chinese-new.pdf> (3 occurrences); also the San Gabriel Valley Medical Center notice that refers patients to "我們仁愛醫療集團旗下的嘉惠爾醫院", <https://www.ahmchealth.com/sgvmc/getpage.php?name=%E5%85%AC%E5%91%8A_20231025155451>. CCYP and 美新社 write 嘉惠尔医院 in Simplified (reported by review; not re-fetched). |
  | San Gabriel Valley Medical Center (AHMC) | found | 聖蓋博醫院 (Traditional) | 圣盖博医院（San Gabriel Valley Medical Center） | The hospital's own Chinese page, titled "聖蓋博醫院60多年專業與關懷同行｜親人般的照護！" on its site at 438 West Las Tunas Dr. (9 occurrences), <https://www.ahmchealth.com/sgvmc/getpage.php?name=%E8%81%96%E8%93%8B%E5%8D%9A%E9%86%AB%E9%99%A260%E5%A4%9A%E5%B9%B4%E5%B0%88%E6%A5%AD%E8%88%87%E9%97%9C%E6%87%B7%E5%90%8C%E8%A1%8C%EF%BD%9C%E8%A6%AA%E4%BA%BA%E8%88%AC%E7%9A%84%E7%85%A7%E8%AD%B7%EF%BC%81>; the notice above signs off "聖蓋博醫院關懷您！". No Simplified form on its own site; 圣盖博医院 is the character conversion. |
  | Alhambra Hospital Medical Center (AHMC) | not found | — | English | <https://www.alhambrahospital.com/>, its visitor and financial-assistance pages: no Chinese text. Directories call it 仁爱医院 / 仁愛醫院 (<https://cn.ccyp.com/subjects/4265>), and AHMC's group name is 仁愛醫療集團, but no page of the hospital's own was found using 仁愛醫院, so it is not used. |
  | Monterey Park Hospital (AHMC) | not found | — | English | <https://www.ahmchealth.com/mph/> and its About Us, Patient Information and Financial Resources pages: no Chinese text. Third-party birth-tourism sites write 蒙特利公园医院; not the hospital's own. |
  | Huntington Hospital | not checked by script | — | English | <https://www.huntingtonhealth.org/patients/language-services/> returns 403 to scripts and to WebFetch; search results show no Chinese name. |
  | USC Arcadia Hospital | not found | — | English | <https://www.keckmedicine.org/usc-arcadia-hospital/patients-visitors/> carries Chinese text only for the state hospital-bill complaint notice, not a hospital name. |
  | Monrovia Memorial Hospital | not found | — | English | <https://monroviamemorial.com/>: no Chinese text. |
  | Adventist Health Glendale | not found | — | English | <https://www.adventisthealth.org/glendale/>: no Chinese text. |
  | USC Verdugo Hills Hospital | not found | — | English | <https://www.keckmedicine.org/usc-verdugo-hills-hospital/>: no Chinese text. |
  | Glendale Memorial Hospital and Health Center | not found | — | English | <https://www.dignityhealth.org/socal/locations/glendalememorial>: no Chinese text. |

  The `zh-hant` pages use the Traditional forms above exactly as printed —
  嘉惠爾醫院（Garfield Medical Center） and 聖蓋博醫院（San Gabriel Valley Medical
  Center） on first use on each page — and keep the other eight in English.

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

## Traditional Chinese phrasing (`zh-hant` city pages)

Chosen 2026-09-15 for `src/data/city-copy/zh-hant.ts`, translated from the
English, not converted from the Simplified pages, in Taiwan Mandarin (臺灣華語):
正體字, formal written register, Taiwan lexis and punctuation. City names are
the "Decided `zh-hant`" column above.

- **Figures** follow the Simplified rules exactly: the English figures in Arabic
  digits with a period decimal (`23.0%`) and a comma for thousands (`9,419`,
  `6,000`), dates as `2026 年 9 月`, and quantities the English writes as words
  in Chinese — `五歲以上`, `四比一`, `三分之一`, `超過八分之一`, `每十位居民中就有超過四位`.
- **Title and headline noun: `診所`**, in the owner's pattern
  `為{城市名}（{City}）醫療與牙科診所帶來更多病患`. Patients are `病患`, as in
  every `zh-hant` string in `services.ts` and `home.ts`. `顧問` is not used, and
  nothing mentions selling a practice (owner decisions).
- **Service names verbatim from `services.ts`:** `診所經營診斷`, `診所數位化`,
  `吸引更多病患`, in Taiwan's 「」 quotation marks. The last two are followed by
  `服務` in running text, as on the Simplified pages.
- **Google Business Profile: `Google 商家檔案`**, the name `services.ts` already
  uses and Google's zh-TW help center title, "Google 商家檔案說明" (fetched
  2026-09-15): <https://support.google.com/business/answer/9798848?hl=zh-TW>.
- **Census Bureau and ACS: `美國人口普查局`, `美國社區問卷調查（ACS）`, `五年估算`**,
  from the Bureau's own Traditional Chinese fact sheet, "2015–2019 年美國社區問卷調查
  (American Community Survey) (ACS), 5 年估算" (fetched 2026-09-15):
  <https://www.census.gov/content/dam/Census/library/factsheets/2020/dec/upcoming-us-population-releases-chinese-traditional.pdf>.
  The sheet writes the digit 5; the pages write `五` because the English writes
  "five". "Aged five and over" is `五歲以上`, which in Taiwan usage includes five.
- **NPI Registry: `NPI 登錄系統`; source label `CMS NPI 登錄系統`.** No official
  Chinese name was found, so `CMS` stays unexpanded, as in the Simplified label.
  Individual clinicians are `個別醫事人員`, Taiwan's term for licensed health
  professionals; "practice location" is `執業地點`.
- **HCAI: `加州 HCAI`**, with the English department name in the source label,
  as on the Simplified pages.
- **General acute care hospital: `一般急性照護醫院`.** California's license
  category has no official Chinese name. The rendering follows Taiwan's own
  hospital vocabulary: the 醫療機構設置標準 classifies beds as `急性一般病床`
  (<https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0020025>), and Taiwan
  writes `照護` for care where the mainland writes `护理`.
- **Clinicians:** `初級照護醫師`, after Medi-Cal's Traditional Chinese enrollment
  site, which writes `初級照護提供者（PCP）` throughout (30 occurrences,
  <https://www.healthcareoptions.dhcs.ca.gov/zh-Hant/>), with `醫師` for
  physician as Taiwan writes it; `家庭醫學科或內科` for "family or internal
  medicine"; `牙醫`; `驗光師`, a licensed profession under that name in Taiwan.
- **Hospitals:** 嘉惠爾醫院 and 聖蓋博醫院 as printed on their own material, with
  the English in parentheses on first use; the other eight stay in English. A
  hospital in an adjoining city is `位於……的` or `則位於附近的……市`, never stacked
  before the hospital's name.
- **Eaton Fire: `伊頓大火`**, World Journal's usual form (headline of
  <https://www.worldjournal.com/wj/story/121359/9671593>, five occurrences;
  `伊頓山火` also appears there, less often). `CAL FIRE` and the Catalyst
  California report title stay in English.
- **Mandarin: `華語`**, the neutral Taiwan term, beside `粵語` for Cantonese.
- **Script: `正體或簡體`**, the pair the site's own `zh-hant` post on the
  subject uses (`zhengti-haishi-jianti-guanwang.md`, 正體 15 times across the
  blog); `字體` (typeface) is never used for script.
- **Front-office terms** come from the Traditional `services.ts` copy:
  `初診表單`, `同意書`, `預約提醒`, `召回訊息`, `回診`, `櫃檯`, `電子病歷系統`,
  `評論` (not `評價`), `保險公司名錄`. Taiwan lexis elsewhere: `資訊`, `網站`,
  `建置`, `資料夾`, `導覽列`, `語音信箱`, `蒐集`, `紀錄` for a record (noun).
- **Register.** The band is 0.55–0.85 on the 書面語 index, raised through word
  choice (因此, 然而, 並非, 至於, 對於……而言) and kept below the ceiling with
  ordinary connectives (所以, 因為, 這樣). Every page measured 0.64–0.75 after
  hand edits; the longest sentence on any page is 75 Han characters.
- **Script purity** was checked with `blog-content.test.ts`'s `PAIRS` table
  (66 pairs, every string and the whole file: 0 Simplified characters) and by
  encoding each of the file's distinct Han characters in Big5, which lacks
  Simplified-only forms (none failed; 为, 这, 医, 诊 fail as controls).
