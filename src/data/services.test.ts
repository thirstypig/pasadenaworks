import { describe, it, expect } from 'vitest';
import { services, serviceBySlug, serviceForPillar, PILLAR_SERVICE } from './services';
import { PILLARS } from './pillars';
import { glossary } from './glossary';
import { LOCALES } from '../i18n/ui';
import { TRANSLATED_LOCALES } from '../i18n/locales.mjs';

describe('serviceBySlug', () => {
  it('finds a service by its locale-specific slug', () => {
    expect(serviceBySlug('en', 'websites')?.id).toBe('websites');
    expect(serviceBySlug('es', 'sitios-web')?.id).toBe('websites');
    expect(serviceBySlug('zh-hant', 'wangzhan-jianzhi')?.id).toBe('websites');
  });

  it('does not cross-match a slug against the wrong locale', () => {
    // "sitios-web" is the Spanish slug for the "websites" service — it must
    // not resolve under English, since /services/sitios-web/ is never a
    // real English URL.
    expect(serviceBySlug('en', 'sitios-web')).toBeUndefined();
  });

  // Every service URL, and so every slug, is pinned by PUBLISHED_SERVICE_URLS
  // in retired-services.test.ts; this file does not restate them.

  it('lists the services in the display order the owner chose (2026-09-14)', () => {
    expect(services.map((s) => s.id)).toEqual(['consulting', 'digitize', 'websites']);
  });

  it('returns undefined for a slug that does not exist in any service', () => {
    expect(serviceBySlug('en', 'not-a-real-service')).toBeUndefined();
  });

  it('every service defines a slug for all four locales (no missing translation)', () => {
    for (const service of services) {
      for (const locale of LOCALES) {
        expect(service.slugs[locale]).toBeTruthy();
        expect(service.t[locale]).toBeDefined();
      }
    }
  });
});

describe('serviceForPillar', () => {
  it('resolves every blog pillar to a service without throwing', () => {
    for (const pillar of PILLARS) {
      expect(serviceForPillar(pillar).id).toBe(PILLAR_SERVICE[pillar]);
    }
  });

  it('sends the retired pillars to Get more patients, and consulting to the Checkup', () => {
    expect(serviceForPillar('search').id).toBe('websites');
    expect(serviceForPillar('ads').id).toBe('websites');
    expect(serviceForPillar('websites').id).toBe('websites');
    expect(serviceForPillar('consulting').id).toBe('consulting');
  });
});

describe('glossary links in service copy', () => {
  it('links English copy only to glossary entries that exist', () => {
    const ids = new Set(glossary.map((g) => g.id));
    const text = JSON.stringify(services.map((s) => s.t.en));
    const anchors = [...text.matchAll(/\/glossary\/#([a-z0-9-]+)/g)].map((m) => m[1]);
    expect(anchors, 'positive control: English copy should link the glossary').toContain('ehr');
    expect(anchors.filter((a) => !ids.has(a))).toEqual([]);
  });

  it('keeps glossary links out of non-English copy, because the glossary is English-only', () => {
    for (const service of services) {
      for (const locale of TRANSLATED_LOCALES) {
        expect(JSON.stringify(service.t[locale]), `${service.id}/${locale}`).not.toContain('/glossary/');
      }
    }
  });
});

describe('copy rules', () => {
  // Google cuts a description near 160 characters. Spanish runs longer than
  // English for the same meaning, so it gets the same ceiling with a lower
  // floor; Chinese characters are wider, and a count means something else.
  const META_BAND = { en: [150, 158], es: [130, 160] } as const;

  it.each(Object.entries(META_BAND))('keeps every %s meta description inside its band', (locale, [min, max]) => {
    for (const service of services) {
      const n = [...service.t[locale as keyof typeof META_BAND].meta].length;
      expect(n, `${service.id}/${locale} meta is ${n} characters`).toBeGreaterThanOrEqual(min);
      expect(n, `${service.id}/${locale} meta is ${n} characters`).toBeLessThanOrEqual(max);
    }
  });

  it('uses none of the banned marketing words', () => {
    const text = JSON.stringify(services.map((s) => s.t.en)).toLowerCase();
    for (const word of ['leverage', 'solutions', 'empower', 'transformation']) {
      expect(text).not.toContain(word);
    }
  });
});

describe('translation parity', () => {
  const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

  it('gives every locale the same structure as English: body blocks, list items, outcomes, source links', () => {
    for (const service of services) {
      const en = service.t.en;
      for (const locale of TRANSLATED_LOCALES) {
        const tr = service.t[locale];
        const where = `${service.id}/${locale}`;
        expect(tr.body.length, `${where} body blocks`).toBe(en.body.length);
        expect(tr.outcomes.length, `${where} outcomes`).toBe(en.outcomes.length);
        expect(count(tr.body.join(''), /<li>/g), `${where} list items`).toBe(count(en.body.join(''), /<li>/g));
        expect(count(tr.body.join(''), /href="https?:/g), `${where} source links`).toBe(
          count(en.body.join(''), /href="https?:/g),
        );
      }
    }
  });
});
