import type { CityCopy, CitySlug } from '../cities';

/*
 * Every figure below comes from
 * docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md (queried
 * 2026-09-15, ACS 2024 5-year). Change a number there first, then here, then
 * in every translation — cities.test.ts fails when a translation's figures
 * stop matching these.
 */

const NPI = 'https://npiregistry.cms.hhs.gov/search';
const HCAI = 'https://data.chhs.ca.gov/dataset/healthcare-facility-locations';
const census = (geoId: string) => `https://censusreporter.org/tables/C16001/?geo_ids=${geoId}`;

const npi = { label: 'CMS NPI Registry, queried September 2026', url: NPI };
const hcai = { label: 'California HCAI, licensed healthcare facility list, queried September 2026', url: HCAI };
const acs = (geoId: string) => ({
  label: 'U.S. Census Bureau, American Community Survey 2024 five-year estimates, table C16001 (via Census Reporter)',
  url: census(geoId),
});

export const copy: Partial<Record<CitySlug, CityCopy>> = {
  pasadena: {
    title: 'More patients for medical and dental practices in Pasadena',
    summary:
      'Pasadena is the only city we cover where registered primary-care physicians outnumber dentists, and it has more optometrists than any of the other nine.',
    body: [
      'As of September 2026, the federal NPI Registry lists 227 primary-care physicians in family or internal medicine, 213 dentists, and 93 optometrists with a practice location in Pasadena, counting individual clinicians rather than offices. Together those 533 clinicians make Pasadena the largest combined market on this site after Glendale. California’s licensing records, kept by the state agency HCAI, show one general acute care hospital inside the city, Huntington Hospital.',
      'In the Census Bureau’s 2024 five-year American Community Survey, 24.2% of Pasadena residents aged five and over speak Spanish at home, and 5.5% speak Chinese. Nearly one resident in four is too large a share to serve with a single bilingual receptionist and an English-only website, so the intake forms, the appointment reminders, and the page explaining which insurance the practice accepts should all exist in Spanish. The Chinese share is genuine but considerably smaller. Because the table records the language spoken at home rather than how comfortably someone reads English, a practice here should let its own patient records, rather than the citywide figure, decide whether a Chinese translation earns its cost.',
      'For many Pasadena practices, then, the most useful first step is not advertising but a front office that works in two languages. Digitize the office puts intake and consent forms on patients’ own phones in Spanish and English before they arrive, so that the translation is done once instead of at the reception desk every morning. If the harder problem turns out to be standing out among 213 dentists or 93 optometrists, Get more patients addresses that, and the Practice Checkup will establish which of the two problems is larger before you pay for either.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Pasadena, from Spanish-language intake forms to Google listings and patient recall.',
    sources: [npi, hcai, acs('16000US0656000')],
  },

  altadena: {
    title: 'More patients for medical and dental practices in Altadena',
    summary:
      'Altadena’s rebuilding after the Eaton Fire of January 2025 still had far to go at the end of that year, and this page reads its registry and Census figures with that in mind.',
    body: [
      'The Eaton Fire, which began in January 2025, destroyed 9,419 structures and killed 19 civilians, according to CAL FIRE’s incident page as last updated in August 2026. The Census figures on this page were collected before the fire, and the registry counts, although queried in September 2026, may still carry practice addresses recorded before it. With that caution, the NPI Registry lists 14 dentists, 1 optometrist, and 1 primary-care physician with a practice location in Altadena. California’s HCAI lists no general acute care hospital in Altadena itself; the hospital nearby is Huntington Hospital, in neighboring Pasadena.',
      'The Census Bureau’s 2024 five-year American Community Survey, whose responses were gathered before the fire, found that 21.3% of Altadena residents aged five and over spoke Spanish at home and 1.7% spoke Chinese. By December 2025, according to Catalyst California’s rebuilding tracker, only 23 of nearly 6,000 significantly damaged residential properties had finished rebuilding, and only 43% had applied for or received a building permit, so those language shares may no longer describe the people living there today. The conclusion for a practice nevertheless survives that uncertainty: Spanish belongs on the intake forms and the website, whereas a Chinese translation would be difficult to justify from these figures.',
      'The help that applies here is narrow and practical. A practice whose paper charts were lost faces the slow work of reconstructing its records, and Digitize the office sets up records that no longer depend on a single building surviving. A Google listing, a website, or an insurer’s directory that still shows an address where the office no longer stands directs patients to the wrong place, and correcting every one of them to match a temporary location is part of Get more patients. Some of this a practice can do on its own in an afternoon, and when that is the case, we will say so rather than charge for it.',
    ],
    meta: 'Help for independent medical, dental, and eye care practices in Altadena: patient records, Google listings with the right address, and Spanish intake forms.',
    sources: [
      npi,
      hcai,
      acs('16000US0601290'),
      { label: 'CAL FIRE, Eaton Fire incident page, last updated August 2026', url: 'https://www.fire.ca.gov/incidents/2025/1/7/eaton-fire' },
      {
        label: 'Catalyst California, Red Tape to Recovery: Tracking Altadena Rebuilding After the Eaton Fire (figures as of December 2025)',
        url: 'https://www.catalystcalifornia.org/campaign-tools/publications/red-tape-to-recovery-tracking-altadena-rebuilding',
      },
    ],
  },

  'south-pasadena': {
    title: 'More patients for medical and dental practices in South Pasadena',
    summary:
      'South Pasadena has no hospital of its own, and its residents speak Chinese and Spanish at home in shares close enough that a practice cannot choose one language from the numbers alone.',
    body: [
      'The NPI Registry, queried in September 2026, lists 45 dentists, 12 optometrists, and 11 primary-care physicians with a practice location in South Pasadena, so dentists outnumber generalist physicians here by roughly four to one. California’s HCAI lists no general acute care hospital within the city. The two hospitals nearby are both in adjoining cities: Alhambra Hospital Medical Center in Alhambra, and Huntington Hospital in Pasadena.',
      'According to the 2024 five-year American Community Survey, 14.7% of South Pasadena residents aged five and over speak Chinese at home and 11.6% speak Spanish. Neither share is large enough to settle the question by itself, and a practice that translates everything into both languages may spend money on pages that few of its own patients read. The more defensible sequence is to state on the Google Business Profile and the website which languages the staff actually speak, and then to translate the intake forms into whichever language the front desk hears requested most often.',
      'In a city where registered dentists outnumber primary-care physicians roughly four to one, most of the local clinicians are dentists, and the least expensive appointment a dental practice ever books is the overdue cleaning. Get more patients therefore begins with recall messages to patients who have fallen behind, before any money is spent on advertising. If you cannot tell whether the real problem is recall, the telephones, or the listing, the Practice Checkup ranks those against one another in writing first.',
    ],
    meta: 'More patients for independent dental, medical, and eye care practices in South Pasadena: patient recall, bilingual intake forms, and accurate Google listings.',
    sources: [npi, hcai, acs('16000US0673220')],
  },

  glendale: {
    title: 'More patients for medical and dental practices in Glendale',
    summary:
      'Glendale has more registered dentists and primary-care physicians than any other city we cover, three general acute care hospitals, and the smallest Chinese-speaking share of the ten.',
    body: [
      'As of September 2026, the NPI Registry lists 305 dentists, 237 primary-care physicians, and 66 optometrists with a practice location in Glendale, the largest dentist and physician counts among the cities on this site. California’s HCAI licenses three distinct general acute care hospitals inside the city: Adventist Health Glendale, USC Verdugo Hills Hospital, and Glendale Memorial Hospital and Health Center. A market that dense gives a patient more choice than any other city we cover, which also means that a practice with an incomplete listing is easy to overlook.',
      'The 2024 five-year American Community Survey finds that 13.7% of Glendale residents aged five and over speak Spanish at home and 0.9% speak Chinese. Translating a website into Chinese on the strength of that second figure would be difficult to defend, and we would tell you so. Spanish is a different matter, since it reaches more than one resident in eight. Spanish and Chinese are nonetheless the only languages this page reports, so the two shares do not describe every household in the city, and a practice’s own intake records are a better guide to which other languages its front desk hears in a typical week.',
      'In a city with three hospitals and more than 600 registered clinicians, a patient deciding where to go has several practices to compare, and the listing that answers the obvious questions first is often the one that gets the call. Get more patients starts with that listing: a verified Google Business Profile, a separate profile for each doctor where several share an office, and Healthgrades, Zocdoc, and insurer directories corrected so that they agree with it. A practice that already appears prominently but still has empty appointment slots should begin with the Practice Checkup instead, because no amount of visibility repairs a telephone that nobody answers.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Glendale: Google listings, corrected directories, and Spanish where it counts.',
    sources: [npi, hcai, acs('16000US0630000')],
  },

  alhambra: {
    title: 'More patients for medical and dental practices in Alhambra',
    summary:
      'Alhambra is the one city we cover where more than a fifth of residents speak Spanish at home and roughly a third speak Chinese, which makes it a three-language market for any practice.',
    body: [
      'The NPI Registry lists 91 dentists, 68 primary-care physicians, and 16 optometrists with a practice location in Alhambra as of September 2026. One general acute care hospital, Alhambra Hospital Medical Center, is licensed inside the city by California’s HCAI, and three more stand nearby in adjoining cities: San Gabriel Valley Medical Center in San Gabriel, and both Garfield Medical Center and Monterey Park Hospital in Monterey Park.',
      'In the 2024 five-year American Community Survey, 33.0% of Alhambra residents aged five and over speak Chinese at home and 23.0% speak Spanish. Together those two groups amount to more than half of the city’s residents aged five and over, so a practice operating only in English addresses a minority of its neighbors in the language they use at home. The argument for intake forms in three languages, a website in three languages, and a Google Business Profile naming every language the staff speak is as strong here as anywhere we work. Even so, a practice should translate the forms patients must complete before it translates the pages they merely browse.',
      'Three languages multiply the work at the front desk, where one patient’s paperwork may arrive in Chinese and the next patient’s in Spanish, and someone has to transfer both into the same chart. Digitize the office sets up intake and consent forms that patients complete on their own phones, in English, Spanish, or Chinese, before they arrive, which moves the translation out of the waiting room and eliminates much of the retyping. The Practice Checkup is the better first step for a practice that cannot yet tell whether its language problem lives at the reception desk or on its website.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Alhambra, where intake forms, websites, and Google listings need three languages.',
    sources: [npi, hcai, acs('16000US0600884')],
  },

  arcadia: {
    title: 'More patients for medical and dental practices in Arcadia',
    summary:
      'Arcadia pairs a large Chinese-speaking population with one of the smallest Spanish-speaking shares we report, and it has a general acute care hospital of its own.',
    body: [
      'Arcadia has 144 dentists, 100 primary-care physicians, and 35 optometrists with a practice location in the city, according to the NPI Registry as queried in September 2026. California’s HCAI licenses one general acute care hospital there, USC Arcadia Hospital, and another, Monrovia Memorial Hospital, lies next door in Monrovia. A patient in Arcadia looking for a dentist can therefore compare well over a hundred without leaving the city.',
      'The 2024 five-year American Community Survey reports that 37.6% of Arcadia residents aged five and over speak Chinese at home, compared with 9.3% who speak Spanish. That imbalance points a practice toward Chinese before Spanish, but the Census table stops short of the decision that matters most for a website, because it records spoken language and says nothing about whether a reader prefers Traditional or Simplified characters. A practice should settle that question by asking its own patients rather than by guessing, since a page in the unfamiliar script looks careless to precisely the readers it was written for.',
      'With 279 registered clinicians in the city, an Arcadia practice is seldom the only one a Chinese-speaking patient can find, and a practice whose listing and forms answer in that patient’s script has an advantage over those that do not. Get more patients builds the website in English and in whichever Chinese script your patients actually use, and completes the Google Business Profile so that it states plainly which languages the front desk can handle. Before any of that, the Practice Checkup examines whether those patients are already calling and abandoning the attempt somewhere between the voicemail and the intake paperwork.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Arcadia: websites in the Chinese script your patients read, and Google listings.',
    sources: [npi, hcai, acs('16000US0602462')],
  },

  monrovia: {
    title: 'More patients for medical and dental practices in Monrovia',
    summary:
      'Monrovia has the largest Spanish-speaking share of the ten cities we cover, a small registered clinical community, and its own general acute care hospital.',
    body: [
      'The NPI Registry lists 25 dentists, 15 optometrists, and 13 primary-care physicians with a practice location in Monrovia as of September 2026. The registry is a live database, and a count this small can move between one query and the next; an earlier query on the same day found one more dentist, so a difference of that size is noise rather than a trend. California’s HCAI licenses one general acute care hospital in the city, Monrovia Memorial Hospital, while USC Arcadia Hospital stands nearby in Arcadia.',
      'According to the 2024 five-year American Community Survey, 30.1% of Monrovia residents aged five and over speak Spanish at home, the highest share among the cities we cover, and 6.7% speak Chinese. At nearly one resident in three, Spanish is not an accommodation a practice here can leave to whichever employee happens to be bilingual; it belongs in the website’s navigation, on every intake and consent form, and in the description on the Google Business Profile. The Chinese share justifies a line stating whether anyone on staff speaks it, although it is much harder to justify translating an entire website on that basis.',
      'With only 13 primary-care physicians and 15 optometrists registered in the city, a Monrovia patient in either field has few local alternatives when one office fails to answer, and a practice that answers well in Spanish can stand out among them. The fundamentals are therefore inexpensive and worthwhile: Get more patients begins with a Google listing and a website that tell a Spanish-speaking caller, in Spanish, whether the practice accepts their insurance and whether it is taking new patients. If you suspect those callers are already reaching the office and leaving no message, the Practice Checkup is the sensible place to begin.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Monrovia, where Spanish belongs on the website, intake forms, and Google listing.',
    sources: [npi, hcai, acs('16000US0648648')],
  },

  'san-marino': {
    title: 'More patients for medical and dental practices in San Marino',
    summary:
      'San Marino has the largest Chinese-speaking share and the smallest Spanish-speaking share of the ten cities we cover, and no hospital within its limits.',
    body: [
      'As of September 2026, the NPI Registry lists 18 dentists, 17 primary-care physicians, and only 2 optometrists with a practice location in San Marino, against 93 optometrists in neighboring Pasadena. California’s HCAI lists no general acute care hospital in the city; the hospitals nearby are San Gabriel Valley Medical Center in San Gabriel and Huntington Hospital in Pasadena. A resident who needs an eye examination, in other words, has far more choices across the city line than within it.',
      'The 2024 five-year American Community Survey finds that 43.8% of San Marino residents aged five and over speak Chinese at home, the highest share of any city we cover, while only 3.2% speak Spanish. On those figures a Chinese version of the website and the intake forms is less a courtesy than a second working language for the practice, whereas a Spanish translation would be difficult to justify on the strength of residents alone. A practice’s patients do not all live within the city limits, however, so its own records should decide whether Spanish is dropped entirely.',
      'With only 37 registered clinicians in the entire city, a San Marino practice has few local competitors to win patients from, so its growth lies with the patients it already has and with patients who find it from the surrounding cities. Get more patients addresses both. It sends recall messages to patients who are overdue for a visit, and it writes the Google Business Profile and the website in English and Chinese, so that a patient comparing San Marino practices with those in Pasadena or San Gabriel finds the same details in either language.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in San Marino: patient recall, and websites and Google listings in English and Chinese.',
    sources: [npi, hcai, acs('16000US0668224')],
  },

  'monterey-park': {
    title: 'More patients for medical and dental practices in Monterey Park',
    summary:
      'Monterey Park holds two general acute care hospitals within its limits, and more than four in ten of its residents speak Chinese at home.',
    body: [
      'The NPI Registry lists 69 dentists, 62 primary-care physicians, and 27 optometrists with a practice location in Monterey Park, as queried in September 2026, a mix in which physicians nearly match dentists. California’s HCAI licenses two distinct general acute care hospitals inside the city, Garfield Medical Center and Monterey Park Hospital, and a third, Alhambra Hospital Medical Center, lies nearby in Alhambra. Among the cities we cover, only Glendale has more hospitals within its own limits.',
      'According to the 2024 five-year American Community Survey, 42.1% of Monterey Park residents aged five and over speak Chinese at home and 16.4% speak Spanish, the largest combined share of the ten cities on this site. The Census table counts Mandarin and Cantonese speakers together, and that distinction matters more on the telephone than on paper: a written form in Chinese can serve speakers of either, but a patient who calls needs someone who speaks the language they actually use. A practice here should therefore state on its Google Business Profile and its website exactly which spoken languages its staff offer, rather than a general claim to speak Chinese that promises more than the front desk can deliver.',
      'The Practice Checkup begins with a conversation with the reception staff. In Monterey Park, that conversation should establish which spoken languages each person at the desk can handle, and during which hours, because a practice that is bilingual only until lunch loses calls it never hears about. Once that is clear, Get more patients makes the Google listing and the website describe the arrangement accurately, and Digitize the office can send appointment reminders and intake forms to patients in the written language each one prefers.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Monterey Park: front desks that speak patients’ languages, and listings that say so.',
    sources: [npi, hcai, acs('16000US0648914')],
  },

  'san-gabriel': {
    title: 'More patients for medical and dental practices in San Gabriel',
    summary:
      'San Gabriel has more than twice as many registered dentists as primary-care physicians, and its general acute care hospital carries the name of the whole valley.',
    body: [
      'As of September 2026, the NPI Registry lists 106 dentists, 47 primary-care physicians, and 31 optometrists with a practice location in San Gabriel. California’s HCAI licenses one general acute care hospital in the city, San Gabriel Valley Medical Center, and Alhambra Hospital Medical Center sits nearby in Alhambra. Dentistry is the largest field here by a wide margin, which makes it the one in which a practice is most likely to share a page of search results with many other local practices.',
      'The 2024 five-year American Community Survey reports that 40.1% of San Gabriel residents aged five and over speak Chinese at home and 15.1% speak Spanish. Chinese at that level belongs at the center of a practice’s communication with patients rather than on a single translated page, which means the explanation of accepted insurance, the new-patient forms, and the replies to reviews should all work in Chinese. Spanish, spoken at home by more than one resident in seven, warrants at least a translated intake form and a clear statement on the Google Business Profile of whether anyone at the desk speaks it.',
      'With 106 dentists registered in the city, a San Gabriel dental practice is rarely the only one a prospective patient finds, and a steady record of recent reviews, in Chinese as well as English, gives that patient a reason to call this practice rather than another. Get more patients sets up a review request that reaches every patient after every appointment, never only the satisfied ones, and drafts replies that reveal nothing about whether the reviewer is a patient. If the reviews are already strong and the appointment book still is not full, the Practice Checkup will look for the leak elsewhere.',
    ],
    meta: 'More patients for independent dental, medical, and eye care practices in San Gabriel: review requests and replies in Chinese and English, and Google listings.',
    sources: [npi, hcai, acs('16000US0667042')],
  },
};
