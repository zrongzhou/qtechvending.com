import type { FaqItem as StructuredFaq, I18nString } from '@/types';
import { localized } from '@/lib/localize';

export interface FlatFaqItem {
  q: string;
  a: string;
}

export function toFlatFaq(
  items: StructuredFaq[] | null | undefined,
  locale: 'zh' | 'ar' | 'en'
): FlatFaqItem[] {
  if (!items || items.length === 0) return [];
  return items
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((it) => ({
      q: localized(it.q ?? ({} as I18nString), locale),
      a: localized(it.a ?? ({} as I18nString), locale),
    }))
    .filter((it) => it.q.trim() !== '' || it.a.trim() !== '');
}
