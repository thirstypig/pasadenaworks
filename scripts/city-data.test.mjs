import { describe, it, expect } from 'vitest';
import { primaryTaxonomy, practisesIn, countGroup, GROUPS, placeMatches, pct, isFiveYearRelease } from './city-data.mjs';

const provider = (number, taxonomies, addresses) => ({ number, taxonomies, addresses });
const loc = (city) => ({ address_purpose: 'LOCATION', city, state: 'CA' });
const mail = (city) => ({ address_purpose: 'MAILING', city, state: 'CA' });

describe('city-data counting rules', () => {
  it('counts a provider by PRIMARY taxonomy only', () => {
    // The registry's taxonomy filter is a substring match on ANY taxonomy, so a
    // query for "Dentist" returned a training-program student whose secondary
    // taxonomy was Dentist (Monrovia, 2026-09-15).
    const student = provider(1, [
      { desc: 'Student in an Organized Health Care Education/Training Program', code: '390200000X', primary: true },
      { desc: 'Dentist', code: '122300000X', primary: false },
    ], [loc('MONROVIA')]);
    expect(primaryTaxonomy(student).desc).toMatch(/^Student/);
    expect(countGroup([student], GROUPS.dentists, 'MONROVIA')).toBe(0);
  });

  it('counts a practice LOCATION, never a mailing address', () => {
    const mailOnly = provider(2, [{ desc: 'Dentist', code: '122300000X', primary: true }], [mail('MONROVIA'), loc('ARCADIA')]);
    expect(practisesIn(mailOnly, 'MONROVIA')).toBe(false);
    expect(practisesIn(mailOnly, 'ARCADIA')).toBe(true);
  });

  it('includes dental and optometry specialties but only generalist primary care', () => {
    const ortho = provider(3, [{ desc: 'Dentist, Orthodontics and Dentofacial Orthopedics', code: '1223X0400X', primary: true }], [loc('ARCADIA')]);
    const hygienist = provider(4, [{ desc: 'Dental Hygienist', code: '124Q00000X', primary: true }], [loc('ARCADIA')]);
    const cardio = provider(5, [{ desc: 'Internal Medicine, Cardiovascular Disease', code: '207RC0000X', primary: true }], [loc('ARCADIA')]);
    const fm = provider(6, [{ desc: 'Family Medicine', code: '207Q00000X', primary: true }], [loc('ARCADIA')]);
    expect(countGroup([ortho, hygienist], GROUPS.dentists, 'ARCADIA')).toBe(1);
    expect(countGroup([cardio, fm], GROUPS.primaryCare, 'ARCADIA')).toBe(1);
  });

  it('de-duplicates a provider returned by two queries', () => {
    const im = provider(7, [{ desc: 'Internal Medicine', code: '207R00000X', primary: true }], [loc('ALHAMBRA')]);
    expect(countGroup([im, im], GROUPS.primaryCare, 'ALHAMBRA')).toBe(1);
  });

  it('rejects a Census place ID that resolves to a different city', () => {
    // 16000US0648816 was first tried for Monterey Park and returned Montebello.
    expect(placeMatches('Montebello, CA', 'Monterey Park')).toBe(false);
    expect(placeMatches('Monterey Park, CA', 'Monterey Park')).toBe(true);
    expect(placeMatches('Altadena CDP, CA', 'Altadena')).toBe(true);
    expect(placeMatches('South Pasadena, CA', 'Pasadena')).toBe(false);
  });

  it('rounds a share to one decimal place', () => {
    expect(pct(4011, 10000)).toBe('40.1');
    expect(pct(1, 3)).toBe('33.3');
  });

  it('rejects a Census release that is not the 5-year estimate', () => {
    // "latest" silently resolved to the 1-year release on 2026-09-15 for a
    // request that asked for table C16001 with no release pinned; the
    // 5-year table is what the spec requires and what the sources file cites.
    expect(isFiveYearRelease('acs2024_1yr')).toBe(false);
    expect(isFiveYearRelease('acs2024_5yr')).toBe(true);
    expect(isFiveYearRelease(undefined)).toBe(false);
  });
});
