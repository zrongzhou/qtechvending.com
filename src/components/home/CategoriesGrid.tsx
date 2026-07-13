'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import type { Category } from '@/types';

export default function CategoriesGrid({ categories }: { categories: Category[] }) {
  const { t, locale } = useLocale();
  if (!categories.length) return null;

  return (
    <section className="container-qtech py-16 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-ink-900">{t('home.categories.title')}</h2>
        <p className="mt-2 text-ink-500">{t('home.categories.subtitle')}</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const name = localized(cat.name, locale);
          return (
            <Link
              key={cat.id}
              href={`/${locale}/category/${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-card"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-2xl">
                {cat.icon || '🏷️'}
              </span>
              <span className="text-sm font-semibold text-ink-800 group-hover:text-brand-700">
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
