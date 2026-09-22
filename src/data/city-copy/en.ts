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
/** data.census.gov, pinned to the ACS 2024 5-year detailed tables (ACSDT5Y2024) and one
 *  place. Verified in a browser on 2026-09-15: all ten places render the cited
 *  Spanish and Chinese counts and total. `fips` is the state + place code. */
const census = (fips: string) => `https://data.census.gov/table/ACSDT5Y2024.C16001?g=160XX00US${fips}`;

const npi = { label: 'CMS NPI Registry, individual clinicians by practice-location address and primary specialty, queried September 2026', url: NPI };
const hcai = { label: 'California HCAI, licensed healthcare facility list, queried September 2026', url: HCAI };
const acs = (fips: string) => ({
  label: 'U.S. Census Bureau, American Community Survey 2024 five-year estimates, table C16001',
  url: census(fips),
});

export const copy: Partial<Record<CitySlug, CityCopy>> = {
  pasadena: {
    title: 'More patients for medical and dental practices in Pasadena',
    summary:
      'Pasadena is the only city we cover whose registry is led by primary-care physicians rather than dentists, and it lists more optometrists than any of the other nine.',
    body: [
      'If you run a family or internal medicine practice in Pasadena, your nearest neighbors are mostly practices exactly like yours. This is the only city we cover where registered primary-care physicians outnumber dentists: as of September 2026 the federal NPI Registry lists 227 of them against 213 dentists and 93 optometrists, counting individual clinicians rather than offices. Together those 533 put Pasadena second only to Glendale in the three fields combined. When the practices around you are the same kind as yours, the differences that remain are the ones you control — whether your listings are accurate, whether your paperwork is in the language the patient reads, and whether the telephone gets answered.',
      'California’s licensing records, kept by the state agency HCAI, show one general acute care hospital inside the city, Huntington Hospital. In the Census Bureau’s 2024 five-year American Community Survey, 24.2% of Pasadena residents aged five and over speak Spanish at home, and 5.5% speak Chinese. Nearly one resident in four is too large a share to serve with a single bilingual receptionist and an English-only website, so the intake forms, the appointment reminders, and the page explaining which insurance the practice accepts should all exist in Spanish. The Chinese share is genuine but considerably smaller. Because the table records the language spoken at home rather than how comfortably someone reads English, your own patient records, rather than the citywide figure, should decide whether a Chinese translation earns its cost.',
      'The first job here is usually not advertising but a front office that works in two languages. Digitize the office puts intake and consent forms on patients’ own phones in Spanish and English before they arrive, so that the translation is done once instead of at the reception desk every morning. If you run one of the city’s 213 dental or 93 optometry practices instead, or if the larger problem turns out to be that nothing online tells your practice apart from its neighbors, Get more patients takes that on, and the Practice Checkup will establish which of the two costs you more before you pay for either. An agency billing monthly for advertising has little reason to report back that the problem was a form at the front desk, which is the main argument for having someone look who is not selling the advertising.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Pasadena, with intake forms, reminders, and insurance pages in Spanish and English.',
    sources: [npi, hcai, acs('0656000')],
  },

  altadena: {
    title: 'More patients for medical and dental practices in Altadena',
    summary:
      'Altadena is still rebuilding from the Eaton Fire of January 2025, so this page reads its registry and Census figures with that caution, and what it points to is repair rather than growth.',
    body: [
      'If you run a dental practice in Altadena, your patients, your records, and your address may all have moved. The Eaton Fire, which began in January 2025, destroyed 9,419 structures and killed 19 civilians, according to CAL FIRE’s incident page as last updated in August 2026. The registry counts here, although queried in September 2026, may still carry practice addresses recorded before the fire; with that caution, the NPI Registry lists 14 dentists, 1 optometrist, and 1 primary-care physician with a practice location in Altadena.',
      'California’s HCAI lists no general acute care hospital in Altadena itself; the hospital nearby is Huntington Hospital, in neighboring Pasadena. The Census Bureau’s 2024 five-year American Community Survey, whose responses were gathered before the fire, found that 21.3% of Altadena residents aged five and over spoke Spanish at home and 1.7% spoke Chinese. By December 2025, according to Catalyst California’s rebuilding tracker, only 23 of nearly 6,000 significantly damaged residential properties had finished rebuilding, and only 43% had applied for or received a building permit. Those language shares may no longer describe the people living there today. One conclusion survives the uncertainty: Spanish belongs on the intake forms and the website, whereas a Chinese translation would be difficult to justify from these figures.',
      'The help that applies here is narrow, and some of it is not ours to sell. A practice whose paper charts were lost faces the slow work of reconstructing its records; Digitize the office scans and organizes whatever paper survives and configures an EHR around how the clinicians and staff actually work, so that the rebuilt records live in one system rather than in folders. A Google listing, a website, or an insurer’s directory that still shows an address where the office no longer stands directs patients to the wrong place, and correcting every one of them to match a temporary location is part of Get more patients. Some of this a practice can do on its own in an afternoon, and when that is the case, we will say so rather than charge for it.',
    ],
    meta: 'Help for independent medical, dental, and eye care practices in Altadena: patient records, Google listings with the right address, and Spanish intake forms.',
    sources: [
      npi,
      hcai,
      acs('0601290'),
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
      'South Pasadena has no hospital of its own and a registry weighted heavily toward dentistry, so a practice here grows mostly by keeping the patients it already has.',
    body: [
      'If you run a dental practice in South Pasadena, you are one of the 45 dentists the NPI Registry listed here in September 2026, alongside 12 optometrists and 11 primary-care physicians — roughly four dentists for every generalist physician in the city. A market weighted that far toward one field rewards the practice that holds on to what it has, because the office two blocks away is competing for the same routine appointments rather than for a different kind of visit.',
      'California’s HCAI lists no general acute care hospital within the city. The two hospitals nearby are both in adjoining cities: Alhambra Hospital Medical Center in Alhambra, and Huntington Hospital in Pasadena. According to the 2024 five-year American Community Survey, 14.7% of South Pasadena residents aged five and over speak Chinese at home and 11.6% speak Spanish. Neither share is large enough to settle the question by itself, and a practice that translates everything into both languages may spend money on pages that few of its own patients read. The more defensible sequence is to state on the Google Business Profile and the website which languages the staff actually speak, and then to translate the intake forms into whichever language the front desk hears requested most often.',
      'Dentists account for 45 of the 68 clinicians this page counts, so what follows is written mainly for them: the cheapest chair to fill belongs to someone already on your books who is overdue. Get more patients therefore begins with recall messages to the patients who have fallen behind, before any money is spent on advertising. Recall is close to the least profitable thing anyone can sell a dental practice, which is roughly why it tends to be recommended last; it is where we start. If you cannot tell whether the real problem is recall, the telephones, or the listing, the Practice Checkup ranks those against one another in writing first.',
    ],
    meta: 'More patients for independent dental, medical, and eye care practices in South Pasadena: patient recall, bilingual intake forms, and accurate Google listings.',
    sources: [npi, hcai, acs('0673220')],
  },

  glendale: {
    title: 'More patients for medical and dental practices in Glendale',
    summary:
      'Glendale carries more registered dentists and primary-care physicians than any other city we cover, along with three general acute care hospitals, so the hard part of practicing here is standing out.',
    body: [
      'If you run a dental practice in Glendale, a patient searching for a dentist here is choosing among 305 of them, the largest count of the ten cities on this site; the NPI Registry adds 237 primary-care physicians and 66 optometrists practicing in the city as of September 2026. Density like that rarely announces itself as a single bad month. It shows up as a competitor opening a few blocks away, as a Tuesday morning that used to be full, and as a practice that is easy to overlook because nothing in its listing distinguishes it from the others.',
      'Glendale also holds three general acute care hospitals inside the city — Adventist Health Glendale, USC Verdugo Hills Hospital, and Glendale Memorial Hospital and Health Center — more than any other city we cover. In the Census Bureau’s 2024 five-year American Community Survey, 13.7% of residents aged five and over speak Spanish at home and 0.9% speak Chinese. Spanish on the intake forms, the reminders, and the page explaining which insurance you accept earns its keep at that share; translating the site into Chinese on the strength of the second figure would be difficult to defend, and we would tell you so.',
      'In a city with three hospitals and more than 600 registered dentists, optometrists, and primary-care physicians, the least expensive appointment to fill belongs to a patient who is already yours and overdue, so Get more patients begins with recall before any money goes to advertising. Only then does it work on the listing, the reviews, and the insurance page. If the calls are already arriving and the front desk is losing them, Digitize the office is the first job instead. The Practice Checkup settles which of the two it is, in writing, before you pay for either. In the most crowded market on this site the easy advice is to spend more than the practice down the street, and we would rather find what you are already paying for and failing to collect.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Glendale: recall first, then the listing, the reviews, and Spanish where it counts.',
    sources: [npi, hcai, acs('0630000')],
  },

  alhambra: {
    title: 'More patients for medical and dental practices in Alhambra',
    summary:
      'Alhambra is the one city we cover where more than a fifth of residents speak Spanish at home and roughly a third speak Chinese. That puts three languages on every shift at the front desk.',
    body: [
      'If you run a dental practice in Alhambra, the hardest hour of the week probably happens at the front desk rather than in the operatory: one patient’s paperwork arrives in Chinese, the next patient’s in Spanish, and one person has to get both into the same chart. The NPI Registry lists 91 dentists, 68 primary-care physicians, and 16 optometrists with a practice location in Alhambra as of September 2026, and eye care is the thin part of that count, at more than five dentists for every optometrist. Monterey Park next door has fewer dentists but lists 27 optometrists, so an optometry practice in Alhambra has fewer registered competitors inside its own city than one in Monterey Park.',
      'One general acute care hospital, Alhambra Hospital Medical Center, is licensed inside the city by California’s HCAI. Three more stand nearby in adjoining cities: San Gabriel Valley Medical Center in San Gabriel, and both Garfield Medical Center and Monterey Park Hospital in Monterey Park. In the 2024 five-year American Community Survey, 33.0% of Alhambra residents aged five and over speak Chinese at home and 23.0% speak Spanish. Together those two groups amount to more than half of the city’s residents aged five and over, so a practice operating only in English addresses a minority of its neighbors in the language they use at home. The argument for intake forms in three languages, a website in three languages, and a Google Business Profile naming every language the staff speak is as strong here as anywhere we work — though the forms patients have to complete come before the pages they merely browse.',
      'Three languages multiply the work at the desk, and hiring a third receptionist is not the only way to absorb it. Digitize the office sets up intake and consent forms that patients complete on their own phones, in English, Spanish, or Chinese, before they arrive, which moves the translation out of the waiting room and eliminates much of the retyping. The Practice Checkup is the better first step for a practice that cannot yet tell whether its language problem lives at the reception desk or on its website, and it answers that question in writing. Saving a practice the cost of a third salary is worth more to it than anything we could bill against that salary, and we would rather be the ones who said so.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Alhambra, where intake forms, websites, and Google listings need three languages.',
    sources: [npi, hcai, acs('0600884')],
  },

  arcadia: {
    title: 'More patients for medical and dental practices in Arcadia',
    summary:
      'Arcadia pairs a large Chinese-speaking population with one of the smallest Spanish-speaking shares we report, so the question for a practice is not whether to translate but which language to do properly.',
    body: [
      'If you run a dental practice in Arcadia, the decision that costs the most to get wrong is which language your practice actually works in. The NPI Registry, queried in September 2026, lists 144 dentists, 100 primary-care physicians, and 35 optometrists with a practice location in the city, so a resident here can compare well over a hundred dentists without crossing a city line. Half-translating a practice into Chinese — a landing page here, a form there — costs real money and leaves everything else in English. The language is worth deciding once, and then carrying through every page, every form, and every reminder.',
      'California’s HCAI licenses one general acute care hospital there, USC Arcadia Hospital, and another, Monrovia Memorial Hospital, lies next door in Monrovia. The 2024 five-year American Community Survey reports that 37.6% of Arcadia residents aged five and over speak Chinese at home, compared with 9.3% who speak Spanish. That imbalance points a practice toward Chinese before Spanish, but the Census table stops short of the decision that matters most for a website. It records spoken language, and says nothing about whether a reader prefers Traditional or Simplified characters. A practice should settle that question by asking its own patients rather than by guessing, since a page in the unfamiliar script looks careless to precisely the readers it was written for.',
      'One language done properly is worth more than two done badly, and among the 279 dentists, optometrists, and primary-care physicians registered in the city, a half-finished translation is exactly the kind of detail that shows. Get more patients builds the website in English and in whichever Chinese script your patients actually use, and completes the Google Business Profile so that it states plainly which languages the front desk can handle. We would rather build one language properly than invoice for two, and the decision about which one belongs to your patients rather than to us. Before any of that, the Practice Checkup examines whether those patients are already calling and abandoning the attempt somewhere between the voicemail and the intake paperwork.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Arcadia: websites in the Chinese script your patients read, and Google listings.',
    sources: [npi, hcai, acs('0602462')],
  },

  monrovia: {
    title: 'More patients for medical and dental practices in Monrovia',
    summary:
      'Monrovia has the largest Spanish-speaking share of the ten cities we cover and small registered counts of clinicians, so a practice here competes on how well it answers rather than on size.',
    body: [
      'If you run a dental practice in Monrovia, you are running a small practice beside a much larger market. The NPI Registry lists 25 dentists, 15 optometrists, and 13 primary-care physicians with a practice location in Monrovia as of September 2026, while Arcadia, next door, lists 144 dentists and 100 primary-care physicians under the same query. A practice this size cannot outspend its neighbor and does not need to, because the advantage available here is not scale but being the office that answers properly in Spanish, which more residents speak at home in Monrovia than in any other city we cover.',
      'California’s HCAI licenses one general acute care hospital in the city, Monrovia Memorial Hospital, while USC Arcadia Hospital stands nearby in Arcadia. According to the 2024 five-year American Community Survey, 30.1% of Monrovia residents aged five and over speak Spanish at home, the highest share among the cities we cover, and 6.7% speak Chinese. At nearly one resident in three, Spanish is not an accommodation a practice here can leave to whichever employee happens to be bilingual. It belongs in the website’s navigation, on every intake and consent form, and in the description on the Google Business Profile. The Chinese share justifies a line stating whether anyone on staff speaks it, although it is much harder to justify translating an entire website on that basis.',
      'Get more patients therefore begins with a Google listing and a website that tell a Spanish-speaking caller, in Spanish, whether the practice accepts their insurance and whether it is taking new patients, since those are the two things a practice can answer before the telephone ever rings. Recall messages in Spanish come next, because a small roster of patients is easier to keep than to replace. If you suspect those callers are already reaching the office and leaving no message, the Practice Checkup is the sensible place to begin, and it listens to the front desk before anyone buys advertising. A practice this size is usually sold an advertising budget it has no realistic way of earning back, and both of the steps above cost less than one month of one.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Monrovia, where Spanish belongs on the website, intake forms, and Google listing.',
    sources: [npi, hcai, acs('0648648')],
  },

  'san-marino': {
    title: 'More patients for medical and dental practices in San Marino',
    summary:
      'San Marino has the largest Chinese-speaking share and the smallest Spanish-speaking share of the ten cities we cover, no hospital within its limits, and very few clinicians inside them either.',
    body: [
      'If you run a dental practice in San Marino, much of what your patients need is somewhere else. As of September 2026, the NPI Registry lists 18 dentists, 17 primary-care physicians, and only 2 optometrists with a practice location in San Marino, against 93 optometrists in neighboring Pasadena, so a resident who needs an eye examination has far more choice across the city line than within it. A practice in a city this small is rarely fighting the office down the road for patients; the work is staying the practice those patients come back to when the rest of their care has to happen out of town.',
      'California’s HCAI lists no general acute care hospital in the city; the hospitals nearby are San Gabriel Valley Medical Center in San Gabriel and Huntington Hospital in Pasadena. The 2024 five-year American Community Survey finds that 43.8% of San Marino residents aged five and over speak Chinese at home, the highest share of any city we cover, while only 3.2% speak Spanish. On those figures a Chinese version of the website and the intake forms is less a courtesy than a second working language for the practice, whereas a Spanish translation would be difficult to justify on the strength of residents alone. A practice’s patients do not all live within the city limits, however, so its own records should decide whether Spanish is dropped entirely.',
      'With only 37 dentists, optometrists, and primary-care physicians registered in the entire city, there is no large pool of local competitors to take patients from, so growth has to come from the patients you already have and from the cities around you. Get more patients addresses both. It sends recall messages to patients who are overdue for a visit. It also writes the Google Business Profile and the website in English and Chinese, so that a patient weighing a San Marino practice against one in Pasadena or San Gabriel finds the same details in either language. There is no competitive campaign worth running against a field this small, and a consultancy that tried to sell you one would be describing a different city.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in San Marino: patient recall, and websites and Google listings in English and Chinese.',
    sources: [npi, hcai, acs('0668224')],
  },

  'monterey-park': {
    title: 'More patients for medical and dental practices in Monterey Park',
    summary:
      'Monterey Park holds two general acute care hospitals within its limits and more than four in ten of its residents speak Chinese at home, so a practice here works in a well-supplied market and in more than one spoken language.',
    body: [
      'If you run a dental practice in Monterey Park, your nearest competition is unusually evenly matched. The NPI Registry lists 69 dentists, 62 primary-care physicians, and 27 optometrists with a practice location in the city, as queried in September 2026 — a mix in which physicians nearly match dentists, which is unusual among the cities on this site. California’s HCAI licenses both Garfield Medical Center and Monterey Park Hospital inside the city, and a third, Alhambra Hospital Medical Center, lies nearby in Alhambra; among the cities we cover, only Glendale has more within its own limits. In a city this well supplied with clinicians, what a practice controls is how quickly it answers and in which language.',
      'According to the 2024 five-year American Community Survey, 42.1% of Monterey Park residents aged five and over speak Chinese at home and 16.4% speak Spanish, the largest combined share of the ten cities on this site. The Census table counts Mandarin and Cantonese speakers together, and that distinction matters more on the telephone than on paper. A written form in Chinese can serve speakers of either, but a patient who calls needs someone who speaks the language they actually use. A practice here should therefore state on its Google Business Profile and its website exactly which spoken languages its staff offer, rather than a general claim to speak Chinese that promises more than the front desk can deliver.',
      'The Practice Checkup begins with a conversation with the reception staff. In Monterey Park, that conversation should establish which spoken languages each person at the desk can handle, and during which hours, because a practice that is bilingual only until lunch loses calls it never hears about. Once that is clear, Get more patients makes the Google listing and the website describe the arrangement accurately, and Digitize the office can send appointment reminders and intake forms to patients in the written language each one prefers. We work in English, and we are not going to pretend that the person advising you needs to speak anything else. What must be exact is the claim your own listing makes. A qualified line about Mandarin on weekday mornings brings you patients you can actually serve, whereas an unqualified promise of Chinese produces a call that ends badly.',
    ],
    meta: 'More patients for independent medical, dental, and eye care practices in Monterey Park: front desks that speak patients’ languages, and listings that say so.',
    sources: [npi, hcai, acs('0648914')],
  },

  'san-gabriel': {
    title: 'More patients for medical and dental practices in San Gabriel',
    summary:
      'San Gabriel’s residents speak Chinese and Spanish at home in nearly the same shares as Monterey Park’s, but with far more registered dentists and fewer primary-care physicians, so dentistry is the crowded field here.',
    body: [
      'If you run a dental practice in San Gabriel, you face more registered competition inside the city than a physician down the street does. As of September 2026, the NPI Registry lists 106 dentists, 47 primary-care physicians, and 31 optometrists with a practice location in San Gabriel, against 69 dentists and 62 primary-care physicians in Monterey Park. That is more than twice as many competing dental practices as competing primary-care practices, whereas in Monterey Park the two fields are close to even. What separates one dental office from the next therefore counts for more here than it does a city away.',
      'California’s HCAI licenses one general acute care hospital in the city, San Gabriel Valley Medical Center, and Alhambra Hospital Medical Center sits nearby in Alhambra. The 2024 five-year American Community Survey reports that 40.1% of San Gabriel residents aged five and over speak Chinese at home and 15.1% speak Spanish. Chinese at that level belongs at the center of a practice’s communication with patients rather than on a single translated page, which means the explanation of accepted insurance, the new-patient forms, and the replies to reviews should all work in Chinese. Spanish, spoken at home by more than one resident in seven, warrants at least a translated intake form and a clear statement on the Google Business Profile of whether anyone at the desk speaks it.',
      'Among 106 registered dentists, a steady record of recent reviews, in Chinese as well as English, is slow to build and hard to fake, which is what makes it worth building. Get more patients sets up a review request that reaches every patient after every appointment, never only the satisfied ones, and drafts replies that reveal nothing about whether the reviewer is a patient. Reviews are the slowest thing we do and the simplest to counterfeit, which is precisely why practices that buy them are eventually caught doing it; the slow version is the only one worth having. If the reviews are already strong and the appointment book still is not full, the Practice Checkup will look for the leak elsewhere.',
    ],
    meta: 'More patients for independent dental, medical, and eye care practices in San Gabriel: review requests and replies in Chinese and English, and Google listings.',
    sources: [npi, hcai, acs('0667042')],
  },
};
