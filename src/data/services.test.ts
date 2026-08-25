import { describe, it, expect } from 'vitest';
import { services, serviceBySlug } from './services';

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
