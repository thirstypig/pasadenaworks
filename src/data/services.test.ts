import { describe, it, expect } from 'vitest';
import { services, serviceBySlug, serviceForPillar, PILLAR_SERVICE } from './services';
import { PILLARS } from './pillars';

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

  it('returns undefined for a slug that does not exist in any service', () => {
    expect(serviceBySlug('en', 'not-a-real-service')).toBeUndefined();
  });

  it('every service defines a slug for all four locales (no missing translation)', () => {
    const locales = ['en', 'es', 'zh-hans', 'zh-hant'] as const;
    for (const service of services) {
      for (const locale of locales) {
        expect(service.slugs[locale]).toBeTruthy();
        expect(service.t[locale]).toBeDefined();
      }
    }
  });
});

describe('retired services', () => {
  it('no longer resolves a retired slug in any locale', () => {
    expect(serviceBySlug('en', 'get-found-on-google')).toBeUndefined();
    expect(serviceBySlug('en', 'paid-advertising')).toBeUndefined();
    expect(serviceBySlug('es', 'aparecer-en-google')).toBeUndefined();
    expect(serviceBySlug('es', 'publicidad-pagada')).toBeUndefined();
    expect(serviceBySlug('zh-hans', 'guge-tuiguang')).toBeUndefined();
    expect(serviceBySlug('zh-hant', 'fufei-guanggao')).toBeUndefined();
  });
});

describe('serviceForPillar', () => {
  it('gives every blog pillar a live service', () => {
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
