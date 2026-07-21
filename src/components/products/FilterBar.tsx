'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, ChevronDown, Check, type LucideIcon } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
import type { Category } from '@/types';

interface FilterBarProps {
  categories: Category[];
  selected: string[];
  onToggleCategory: (slug: string) => void;
  search: string;
  onSearch: (value: string) => void;
  onClear: () => void;
  total: number;
  loading: boolean;
}

export default function FilterBar({
  categories,
  selected,
  onToggleCategory,
  search,
  onSearch,
  onClear,
  total,
  loading,
}: FilterBarProps) {
  const { t, locale } = useLocale();
  const hasFilters = selected.length > 0 || search.trim().length > 0;

  // Custom category dropdown (replaces the native <select> so the list items
  // can be styled: comfortable line-height, hover tint, selected marker, a
  // rounded panel with scroll for long lists).
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Live viewport coords for the portal panel (fixed positioning).
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  // V49.12: render the dropdown in a portal on <body> with `position: fixed`
  // computed from the button's live rect. This escapes EVERY ancestor stacking
  // context — previously the product column's `.glass-surface` (backdrop-filter
  // creates its own stacking context) painted ON TOP of the dropdown and hid
  // the category list. The portal can never be occluded by an ancestor, so the
  // fix is definitive regardless of z-index gymnastics. We recompute on scroll
  // (capture phase, since the sidebar is sticky) and resize so it tracks.
  const updateCoords = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    setCoords({ top: r.bottom + 8, left: r.left, width: r.width });
  };

  useEffect(() => {
    if (!catOpen) {
      setCoords(null);
      return;
    }
    updateCoords();
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [catOpen]);

  useEffect(() => {
    if (!catOpen) return;
    const onPointer = (e: MouseEvent) => {
      const tgt = e.target as Node;
      // The panel now lives on <body> (outside catRef), so check BOTH the
      // trigger and the portal panel before closing.
      if ((catRef.current && catRef.current.contains(tgt)) || (panelRef.current && panelRef.current.contains(tgt))) return;
      setCatOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCatOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [catOpen]);

  const currentSlug = selected[0] ?? '';
  const allLabel = locale === 'zh' ? '全部品类' : locale === 'ar' ? 'كل الفئات' : 'All Categories';
  const currentLabel = currentSlug
    ? (() => {
        const cat = categories.find((c) => c.slug === currentSlug);
        return cat ? localized(cat.name, locale) : currentSlug;
      })()
    : allLabel;

  // Single-select: replace the current selection (or clear it when re-clicking).
  const selectCat = (slug: string) => {
    if (slug === '') {
      if (selected.length) selected.forEach((s) => onToggleCategory(s));
    } else if (slug === currentSlug) {
      onToggleCategory(slug); // toggle off the active one
    } else {
      if (currentSlug) onToggleCategory(currentSlug); // drop the old pick
      onToggleCategory(slug); // add the new one
    }
    setCatOpen(false);
  };

  // Portal panel — only mounted after we have coords (client-side, post-open).
  const panel =
    catOpen && coords
      ? createPortal(
          <div
            ref={panelRef}
            role="listbox"
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 9999 }}
            className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lift"
          >
            <button
              type="button"
              role="option"
              aria-selected={currentSlug === ''}
              onClick={() => selectCat('')}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm leading-relaxed transition-colors ${
                currentSlug === '' ? 'bg-cyan-50 font-medium text-cyan-700' : 'text-ink-700 hover:bg-cyan-50'
              }`}
            >
              <span>{allLabel}</span>
              {currentSlug === '' && <Check className="h-4 w-4 shrink-0 text-cyan-600" />}
            </button>
            {categories.map((cat) => {
              const active = cat.slug === currentSlug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => selectCat(cat.slug)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm leading-relaxed transition-colors ${
                    active ? 'bg-cyan-50 font-medium text-cyan-700' : 'text-ink-700 hover:bg-cyan-50'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />}
                    {localized(cat.name, locale)}
                  </span>
                  {active && <Check className="h-4 w-4 shrink-0 text-cyan-600" />}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <OceanGlassCard ripple surface="glass" depth="lg" hoverLift={false} className="relative z-50 overflow-visible p-5">
      {/* Ocean top accent bar — aligns with the ocean design system.
          NOTE: overflow-visible (not overflow-hidden) so the absolute category
          dropdown trigger never clips. The dropdown panel itself is now a
          portal on <body>, so it can never be clipped by this card either. */}
      <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-brand-600" aria-hidden="true" />
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="w-full rounded-lg border border-slate-300 bg-white/70 py-2.5 ps-10 pe-4 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>

        {/* Category dropdown */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-500">
            {t('products.filterTitle')}
          </label>
          <div className="relative" ref={catRef}>
            <button
              ref={btnRef}
              type="button"
              onClick={() => setCatOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={catOpen}
              className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white/70 py-2.5 ps-3 pe-10 text-sm font-medium text-ink-800 outline-none transition hover:border-cyan-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
            >
              <span className="truncate">{currentLabel}</span>
              <ChevronDown
                className={`pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {panel}
          </div>

          {/* Active filter chip */}
          {selected.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.map((slug) => {
                const cat = categories.find((c) => c.slug === slug);
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700"
                  >
                    {cat ? localized(cat.name, locale) : slug}
                    <button
                      type="button"
                      onClick={() => onToggleCategory(slug)}
                      className="rounded-full p-0.5 hover:bg-cyan-100"
                      aria-label="remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Result count + clear */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-sm text-ink-600">
            {loading ? t('products.loading') : `${total} ${t('products.results')}`}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50"
            >
              <X className="h-3.5 w-3.5" />
              {t('products.clear')}
            </button>
          )}
        </div>
      </div>
    </OceanGlassCard>
  );
}
