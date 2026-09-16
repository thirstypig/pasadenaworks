/**
 * The figures behind the city pages, fetched from their public sources.
 *
 *   node scripts/city-data.mjs > "$TMPDIR/city-data.json"
 *
 * Re-run it when the pages are refreshed; the sources file in
 * docs/superpowers/specs/ records what it returned and when. Three sources,
 * all keyless:
 *
 * - CMS NPI Registry API v2.1. Two traps, both found by querying: the city
 *   filter also matches MAILING addresses unless address_purpose=LOCATION, and
 *   the taxonomy filter is a substring match against EVERY taxonomy a provider
 *   lists, so results are re-filtered here by primary taxonomy.
 * - California HCAI licensed facility list (ArcGIS). General acute care,
 *   active, not closed.
 * - ACS 5-year table C16001 through Census Reporter, because the Census
 *   Bureau's own API now requires a key.
 */
import { isMain } from './is-main.mjs';

export const CITIES = [
  // hcai[0] is the city itself; the rest are adjoining cities, whose hospitals
  // the page may call "nearby" and never "in" the city.
  { name: 'Pasadena', npi: 'PASADENA', hcai: ['Pasadena'], census: '16000US0656000' },
  { name: 'Altadena', npi: 'ALTADENA', hcai: ['Altadena', 'Pasadena'], census: '16000US0601290' },
  { name: 'South Pasadena', npi: 'SOUTH PASADENA', hcai: ['South Pasadena', 'Pasadena', 'Alhambra'], census: '16000US0673220' },
  { name: 'Glendale', npi: 'GLENDALE', hcai: ['Glendale'], census: '16000US0630000' },
  { name: 'Alhambra', npi: 'ALHAMBRA', hcai: ['Alhambra', 'San Gabriel', 'Monterey Park'], census: '16000US0600884' },
  { name: 'Arcadia', npi: 'ARCADIA', hcai: ['Arcadia', 'Monrovia'], census: '16000US0602462' },
  { name: 'Monrovia', npi: 'MONROVIA', hcai: ['Monrovia', 'Arcadia'], census: '16000US0648648' },
  { name: 'San Marino', npi: 'SAN MARINO', hcai: ['San Marino', 'Pasadena', 'San Gabriel'], census: '16000US0668224' },
  { name: 'Monterey Park', npi: 'MONTEREY PARK', hcai: ['Monterey Park', 'Alhambra'], census: '16000US0648914' },
  { name: 'San Gabriel', npi: 'SAN GABRIEL', hcai: ['San Gabriel', 'Alhambra'], census: '16000US0667042' },
];

export const GROUPS = {
  dentists: { queries: ['Dentist'], matches: (t) => t.desc.startsWith('Dentist') },
  optometrists: { queries: ['Optometrist'], matches: (t) => t.desc.startsWith('Optometrist') },
  // Generalist codes only: a cardiologist is filed under Internal Medicine too.
  primaryCare: {
    queries: ['Family Medicine', 'Internal Medicine'],
    matches: (t) => t.code === '207Q00000X' || t.code === '207R00000X',
  },
};

export const primaryTaxonomy = (p) => p.taxonomies.find((t) => t.primary) ?? null;

export const practisesIn = (p, npiCity) =>
  p.addresses.some((a) => a.address_purpose === 'LOCATION' && a.state === 'CA' && a.city === npiCity);

export function countGroup(providers, group, npiCity) {
  const seen = new Set();
  for (const p of providers) {
    const t = primaryTaxonomy(p);
    if (t && group.matches(t) && practisesIn(p, npiCity)) seen.add(p.number);
  }
  return seen.size;
}

export const placeMatches = (censusName, city) => censusName.split(',')[0].replace(/ CDP$/, '') === city;

// Spec §4 requires the ACS 5-YEAR release specifically (small-place data
// needs the larger sample; the 1-year release exists for big places only
// and gives different, less reliable numbers). Pin it by name rather than
// asking Census Reporter for "latest" and trusting what comes back.
export const ACS_RELEASE = 'acs2024_5yr';
export const isFiveYearRelease = (releaseId) => /_5yr$/.test(releaseId ?? '');

export const pct = (part, whole) => ((part / whole) * 100).toFixed(1);

const PAGE = 200;

/** Every provider for one query. The API refuses skip > 1000, so 1,200 is a
 *  ceiling: a full last page means the true count may be higher. */
async function npiAll(npiCity, taxonomy) {
  const providers = [];
  for (let skip = 0; skip <= 1000; skip += PAGE) {
    const url = new URL('https://npiregistry.cms.hhs.gov/api/');
    const params = {
      version: '2.1', state: 'CA', city: npiCity, enumeration_type: 'NPI-1',
      address_purpose: 'LOCATION', taxonomy_description: taxonomy, limit: String(PAGE), skip: String(skip),
    };
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NPI ${res.status}: ${url}`);
    const body = await res.json();
    if (body.Errors) throw new Error(`NPI ${JSON.stringify(body.Errors)}: ${url}`);
    const page = body.results ?? [];
    providers.push(...page);
    if (page.length < PAGE) return { providers, capped: false };
  }
  return { providers, capped: true };
}

async function hospitals(cityNames) {
  const url = new URL('https://services5.arcgis.com/fMBfBrOnc6OOzh7V/arcgis/rest/services/facilitylist/FeatureServer/0/query');
  const list = cityNames.map((c) => `'${c.replace(/'/g, "''")}'`).join(',');
  // FacilityStatus='A' already means active/not-closed. Date_Closed is NOT
  // null on an open facility — it carries a 1800-01-01 sentinel — so filtering
  // on it (as an earlier version of this script did) silently dropped every
  // result, Huntington Hospital included. FacilityStatus is the correct and
  // sufficient signal; Date_Closed is only meaningful on a closed record.
  url.searchParams.set('where', `LicenseType='General Acute Care' AND FacilityStatus='A' AND City IN (${list})`);
  url.searchParams.set('outFields', 'FacilityNbr,FacilityName,City');
  url.searchParams.set('returnGeometry', 'false');
  url.searchParams.set('f', 'json');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HCAI ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`HCAI ${JSON.stringify(body.error)}`);
  return body.features
    .map((f) => f.attributes)
    .map((a) => ({ name: a.FacilityName, number: a.FacilityNbr, city: a.City }));
}

// Census Reporter 403s Node's default fetch (no User-Agent); a browser-shaped
// header set is enough, no proxy or fallback source needed. Confirmed
// 2026-09-15: identical request, 403 with no headers, 200 with these.
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json,text/plain,*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function languages(ids) {
  // Requesting "latest" (rather than ACS_RELEASE by name) silently returned
  // the 1-year release on 2026-09-15 — Pasadena's Spanish share came back
  // 20.9% instead of the 5-year figure's 24.2%. Pin the release in the URL
  // AND verify the response actually carries it; Census Reporter could
  // change what a given release name serves without a schema change to
  // catch it, same reasoning as the placeMatches() guard below.
  const res = await fetch(`https://api.censusreporter.org/1.0/data/show/${ACS_RELEASE}?table_ids=C16001&geo_ids=${ids.join(',')}`, {
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) throw new Error(`Census Reporter ${res.status}`);
  const body = await res.json();
  if (!isFiveYearRelease(body.release?.id)) throw new Error(`Census Reporter returned release ${body.release?.id}, not a 5-year release`);
  return body;
}

if (isMain(import.meta.url)) {
  const queried = new Date().toISOString().slice(0, 10);
  const census = await languages(CITIES.map((c) => c.census));
  const out = { queried, acsRelease: census.release.name, cities: [] };
  for (const city of CITIES) {
    const geo = census.geography[city.census];
    if (!placeMatches(geo.name, city.name)) throw new Error(`${city.census} is ${geo.name}, not ${city.name}`);
    const e = census.data[city.census].C16001.estimate;
    const counts = {};
    for (const [key, group] of Object.entries(GROUPS)) {
      const all = [];
      let capped = false;
      for (const q of group.queries) {
        const r = await npiAll(city.npi, q);
        all.push(...r.providers);
        capped ||= r.capped;
      }
      counts[key] = { count: countGroup(all, group, city.npi), capped };
    }
    const hs = await hospitals(city.hcai);
    out.cities.push({
      name: city.name,
      clinicians: counts,
      hospitalsInCity: hs.filter((h) => h.city === city.hcai[0]),
      hospitalsNearby: hs.filter((h) => h.city !== city.hcai[0]),
      spanish: pct(e.C16001003, e.C16001001),
      chinese: pct(e.C16001021, e.C16001001),
      censusPlace: `${city.census} (${geo.name})`,
    });
  }
  console.log(JSON.stringify(out, null, 2));
}
