import { describe, it, expect } from 'vitest';
import { toFlatFaq } from '@/lib/faq';
import type { FaqItem } from '@/types';

const mk = (q: Record<string, string>, a: Record<string, string>, order?: number): FaqItem => ({
  q,
  a,
  ...(order === undefined ? {} : { order }),
});

describe('toFlatFaq — blog FAQ flatten/localize logic', () => {
  it('returns [] for null/undefined/empty so caller falls back to Markdown FAQ', () => {
    expect(toFlatFaq(null, 'en')).toEqual([]);
    expect(toFlatFaq(undefined, 'en')).toEqual([]);
    expect(toFlatFaq([], 'en')).toEqual([]);
  });

  it('localizes q/a per active locale (three-language switch)', () => {
    const items = [mk({ en: 'Q en', zh: '问中文', ar: 'س س' }, { en: 'A en', zh: '答中文', ar: 'ج ج' })];
    expect(toFlatFaq(items, 'en')[0]).toEqual({ q: 'Q en', a: 'A en' });
    expect(toFlatFaq(items, 'zh')[0]).toEqual({ q: '问中文', a: '答中文' });
    expect(toFlatFaq(items, 'ar')[0]).toEqual({ q: 'س س', a: 'ج ج' });
  });

  it('sorts by order ascending, treating missing order as 0', () => {
    const items = [
      mk({ en: 'second' }, { en: 'a2' }, 2),
      mk({ en: 'first' }, { en: 'a1' }, 1),
      mk({ en: 'zero' }, { en: 'a0' }), // no order → treated as 0
    ];
    const qs = toFlatFaq(items, 'en').map((f) => f.q);
    expect(qs).toEqual(['zero', 'first', 'second']);
  });

  it('drops items whose localized q AND a are both empty', () => {
    const items = [
      mk({ en: 'real question' }, { en: 'real answer' }, 1),
      mk({ en: '' }, { en: '' }, 2), // nothing in current locale
    ];
    const res = toFlatFaq(items, 'en');
    expect(res).toHaveLength(1);
    expect(res[0].q).toBe('real question');
  });

  it('keeps an item when at least one of q/a is non-empty', () => {
    const items = [mk({ en: 'only-question' }, { en: '' }, 1)];
    const res = toFlatFaq(items, 'en');
    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({ q: 'only-question', a: '' });
  });
});
