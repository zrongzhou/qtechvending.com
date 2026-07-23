'use client';

export const revalidate = 300;

import '@/styles/animations-deferred.css';

/**
 * QA HARNESS — DO NOT SHIP.
 * Renders the REAL Products-page background theme (V42 brighter ocean gradient)
 * together with REAL <ProductCard ocean /> components fed mock products, so the
 * "Products page brightened one step" (slate-800 / cyan-900 / teal-900 bg +
 * white/14→white/20 cards) can be measured as medianLum without a database.
 * (The live /en/products route degrades to an empty grid without a DB, so it
 * alone cannot exercise the brighter product cards.)
 */

import ProductCard from '@/components/products/ProductCard';
import OceanBubbles from '@/components/ui/OceanBubbles';
import type { Product, Category } from '@/types';

const QA_CATEGORY: Category = {
  id: 'cat-qa',
  slug: 'flower-vending',
  name: { en: 'Flower Vending', zh: '鲜花售货', ar: 'Flower Vending' },
  icon: null,
  description: null,
  order: 0,
  status: 'active',
  type: 'product',
};

function makeProduct(i: number): Product {
  return {
    id: `qa-p-${i}`,
    slug: `qa-product-${i}`,
    sku: `QA-${i}`,
    name: { en: `QA Product ${i}`, zh: `QA 产品 ${i}`, ar: `QA Product ${i}` },
    description: null,
    shortDescription: { en: `QA short description ${i}`, zh: `QA 简短描述 ${i}`, ar: `QA short ${i}` },
    images: [],
    features: null,
    specs: [{ param: 'Model', value: `QA-${i}` }],
    status: 'active',
    featured: i === 0,
    order: i,
    relatedProducts: [],
    categories: [QA_CATEGORY],
  };
}

const PRODUCTS: Product[] = Array.from({ length: 9 }, (_, i) => makeProduct(i));

export default function QaProductsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-800 via-cyan-900/90 to-teal-900/80">
      <div
        className="absolute inset-0 -z-20 bg-gradient-to-b from-cyan-900/70 via-teal-800/60 to-slate-800/70"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-cyan-300/15 via-cyan-400/5 to-transparent"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="god-ray god-ray--1" />
        <div className="god-ray god-ray--2" />
        <div className="god-ray god-ray--3" />
        <div className="god-ray god-ray--4" />
      </div>
      <OceanBubbles className="-z-10" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 overflow-hidden"
        aria-hidden="true"
      >
        <div className="ocean-wave ocean-wave--1" />
        <div className="ocean-wave ocean-wave--2" />
        <div className="ocean-wave ocean-wave--3" />
      </div>

      <div className="container-qtech relative z-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} ocean />
          ))}
        </div>
      </div>
    </div>
  );
}
