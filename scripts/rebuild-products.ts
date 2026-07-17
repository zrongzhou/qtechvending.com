/**
 * scripts/rebuild-products.ts
 * ----------------------------------------------------------------------------
 * Rebuilds the Qtech product catalog from the confirmed 20-product slug→model
 * mapping (V30). Idempotent: safe to run repeatedly during deployment.
 *
 * What it does:
 *   1. Upserts the 10 canonical categories (fresh-flower, pizza, cotton-candy,
 *      fruit-vegetable-egg, sugar-cane-juice, ice-maker, coffee, ice-cream,
 *      pet-washing, food). There is no "view all" alias category — the product
 *      list shows every product by default.
 *   2. Upserts the 20 canonical products, connecting each to its single
 *      category and deriving the `images` array from the actual WebP files on
 *      disk (so DB paths always match the generated assets).
 *   3. Deletes any product whose slug is NOT in the canonical 20 — this removes
 *      `helmet-washing` and the stale old pet slug, keeping the catalog clean.
 *
 * Product names are the English titles from `docx_all.txt`; Chinese is
 * translated, Arabic mirrors English (placeholder pending human review), per the
 * V30 rollout decision. SKUs use the model numbers from the confirmed mapping;
 * the two SKU-less products (pet / hot-food) get QT-VD-PET / QT-VD-FOOD.
 *
 * Run with:  npx tsx scripts/rebuild-products.ts
 * NOTE: written to be executed by the deploy step (DB write). Do NOT run
 * locally against the empty dev database.
 * ----------------------------------------------------------------------------
 */
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();

type I18n = { en: string; zh: string; ar: string };
const i18n = (en: string, zh: string, ar?: string): I18n => ({ en, zh, ar: ar ?? en });

interface ProductSeed {
  model: string;
  slug: string;
  categorySlug: string;
  order: number;
  featured: boolean;
  name: I18n;
  shortDescription: I18n;
  description: I18n;
  features: { en: string[]; zh: string[]; ar: string[] };
  specs: { param: string; value: string }[];
}

// ── Categories (10 canonical) ──────────────────────────────────────────────
const CATEGORIES: { slug: string; name: I18n; description: I18n; order: number; icon: string }[] = [
  { slug: 'fresh-flower-vending-machine', name: i18n('Fresh Flower Vending Machine', '鲜花售货机'), description: i18n('Unattended fresh-flower vending for retail, transit and gifting.', '面向零售、交通与礼赠场景的无人鲜花售货。'), order: 1, icon: 'Flower2' },
  { slug: 'pizza-vending-machine', name: i18n('Pizza Vending Machine', '披萨售货机'), description: i18n('Hot-food pizza vending with frozen storage and on-demand heating.', '冷冻存储、按需加热的热食披萨售货机。'), order: 2, icon: 'Pizza' },
  { slug: 'cotton-candy-machine', name: i18n('Cotton Candy Vending Machine', '棉花糖售货机'), description: i18n('Automatic cotton-candy vending with eye-catching patterns.', '自动棉花糖售货机，花型吸睛。'), order: 3, icon: 'Candy' },
  { slug: 'fruit-vegetable-egg-vending-machine', name: i18n('Fruit, Vegetable & Egg Vending Machine', '果蔬蛋售货机'), description: i18n('Weighing-sensor fresh-food vending for fruit, veg, eggs and drinks.', '称重传感生鲜售货，售卖果蔬蛋与冷饮。'), order: 4, icon: 'Egg' },
  { slug: 'sugar-cane-juice-vending-machine', name: i18n('Sugarcane & Orange Juice Vending Machine', '甘蔗橙汁售货机'), description: i18n('24/7 fresh sugarcane and orange juice on demand.', '24 小时鲜榨甘蔗与橙汁。'), order: 5, icon: 'CupSoda' },
  { slug: 'ice-maker-vending-machine', name: i18n('Ice Maker Vending Machine', '制冰售货机'), description: i18n('On-demand edible ice cubes with card payment.', '按需制售食用冰块，支持刷卡。'), order: 6, icon: 'Snowflake' },
  { slug: 'coffee-vending-machine', name: i18n('Coffee Vending Machine', '咖啡售货机'), description: i18n('Energy-saving instant hot-coffee vending.', '节能速热咖啡售货机。'), order: 7, icon: 'Coffee' },
  { slug: 'ice-cream-vending-machine', name: i18n('Ice Cream Vending Machine', '冰淇淋售货机'), description: i18n('Robot-service multi-flavor ice-cream vending.', '机器人服务多口味冰淇淋售货机。'), order: 8, icon: 'IceCream' },
  { slug: 'pet-washing-machine', name: i18n('Pet Washing Machine', '宠物洗护机'), description: i18n('Self-service pet wash & grooming vending.', '自助宠物洗护售货机。'), order: 9, icon: 'PawPrint' },
  { slug: 'food-vending-machine', name: i18n('Hot Food Vending Machine', '热食售货机'), description: i18n('Automated hot-food vending for fries & fried chicken.', '炸薯条炸鸡自动化热食售货机。'), order: 10, icon: 'UtensilsCrossed' },
];

// ── Products (20 canonical) ─────────────────────────────────────────────────
const CANONICAL: ProductSeed[] = [
  {
    model: 'QT-VD201',
    slug: 'factory-directly-sale-flower-bouquet-vending-machine-with-card-payment-method',
    categorySlug: 'fresh-flower-vending-machine',
    order: 1,
    featured: false,
    name: i18n('Factory directly sale flower bouquet vending machine with card payment method', '工厂直销鲜花花束售货机（支持刷卡支付）'),
    shortDescription: i18n('Unattended fresh-flower bouquet vending with card & cashless payment.', '无人值守鲜花花束自动售货，支持刷卡与非接触支付。'),
    description: i18n(
      'A compact fresh-flower vending machine built for retail entrances and flower shops. It keeps bouquets at a constant cool temperature, supports card payment, and dispenses ready-to-gift flower bouquets around the clock.',
      '专为零售入口与花店设计的紧凑型鲜花售货机，恒定低温保鲜，支持刷卡支付，7×24 小时自动售卖即拿即走的鲜花花束。',
    ),
    features: { en: ['Card & cashless payment', 'Constant-temperature cooling', 'Ready-to-gift bouquet display', 'Remote management system'], zh: ['刷卡与非接触支付', '恒定低温保鲜', '即拿即走花束展示', '远程管理系统'], ar: [] },
    specs: [
      { param: 'Machine size', value: '1200*750*2200mm' },
      { param: 'Color', value: 'Black/White' },
      { param: 'Material', value: 'Titanium / galvanized sprayed plate' },
      { param: 'Cooling', value: 'Air cooling, intelligent temp control' },
      { param: 'Lighting', value: 'LED freezer lighting' },
    ],
  },
  {
    model: 'QT-VD202',
    slug: '2025-popular-24-7-self-service-florist-flower-shop-vending-machine-sell-bouquet-of-rose',
    categorySlug: 'fresh-flower-vending-machine',
    order: 2,
    featured: true,
    name: i18n('2025 popular 24/7 self-service florist flower shop vending machine sell bouquet of rose', '2025 热门 24 小时自助花店鲜花售货机'),
    shortDescription: i18n('Best-selling 24/7 self-service florist kiosk for rose bouquets.', '畅销的 24 小时自助花店，玫瑰鲜花束自助售卖。'),
    description: i18n(
      'Our most popular flower vending model for 2025 — a 24/7 self-service florist that showcases rose bouquets behind glass with smart cooling and one-tap card payment, ideal for shops, malls and transit hubs.',
      '2025 年最热门的鲜花售货机型——24 小时自助花店，玻璃展示玫瑰鲜花束，智能控温，一键刷卡支付，适合花店、商场与交通枢纽。',
    ),
    features: { en: ['10 bouquet capacity', 'Smart constant-temperature cooling', 'One-tap card payment', 'Glass display for gifting'], zh: ['可容纳 10 束花', '智能恒定控温', '一键刷卡支付', '玻璃礼品展示'], ar: [] },
    specs: [
      { param: 'Machine size', value: '1500*750*2200mm' },
      { param: 'Capacity', value: '10 pcs' },
      { param: 'Color', value: 'Black/White' },
      { param: 'Cooling', value: 'Air cooling' },
    ],
  },
  {
    model: 'QT-VD203',
    slug: '21-5-inchs-touch-screen-fresh-flower-vending-machine-with-cooling-system-selling-rose-lily-carnation-etc',
    categorySlug: 'fresh-flower-vending-machine',
    order: 3,
    featured: false,
    name: i18n('21.5 inchs touch screen fresh flower vending machine with cooling system selling rose, lily, carnation etc', '21.5 英寸触屏鲜花售货机（制冷系统）'),
    shortDescription: i18n('21.5" touch-screen flower vending with cooling for rose, lily & carnation.', '21.5 英寸触屏鲜花售货机，玫瑰百合康乃馨低温保鲜。'),
    description: i18n(
      'A large 21.5-inch touch-screen flower vending machine with an integrated cooling system that keeps roses, lilies and carnations fresh. Capacity of 9 bouquets with card and remote management.',
      '配备 21.5 英寸大触屏与制冷系统，保持玫瑰、百合、康乃馨新鲜；可容纳 9 束花，支持刷卡与远程管理。',
    ),
    features: { en: ['21.5" touch screen', 'Integrated cooling system', '9 bouquet capacity', 'Remote management'], zh: ['21.5 英寸触屏', '一体化制冷系统', '9 束容量', '远程管理'], ar: [] },
    specs: [
      { param: 'Machine size', value: '1800*750*2200mm' },
      { param: 'Capacity', value: '9 pcs' },
      { param: 'Cooling', value: 'Air cooling' },
    ],
  },
  {
    model: 'QT-VD204',
    slug: 'good-capacity-smart-locker-flower-vending-machine-selling-different-fresh-flowergift-in-subway',
    categorySlug: 'fresh-flower-vending-machine',
    order: 4,
    featured: false,
    name: i18n('Good capacity smart locker flower vending machine selling different fresh flower,gift in subway', '大容量智能柜式鲜花售货机（地铁场景）'),
    shortDescription: i18n('High-capacity smart-locker flower vending for subway & public spaces.', '大容量智能柜式鲜花售货机，地铁与公共场所适用。'),
    description: i18n(
      'A high-capacity smart-locker flower vending machine designed for metro stations and busy public areas. It stores up to 15 fresh-flower gifts in individual lockers with card payment and remote monitoring.',
      '面向地铁站与繁忙公共场所的大容量智能柜式鲜花售货机，单个柜格存放 15 份鲜花生日礼，支持刷卡支付与远程监控。',
    ),
    features: { en: ['15-unit smart lockers', 'Subway & transit ready', 'Card payment', 'Remote monitoring'], zh: ['15 格智能柜', '地铁交通适用', '刷卡支付', '远程监控'], ar: [] },
    specs: [
      { param: 'Machine size', value: '1800*750*2200mm' },
      { param: 'Capacity', value: '15 pcs' },
    ],
  },
  {
    model: 'QT-VD205',
    slug: 'florist-flower-vending-machine-with-remotely-management-system-automatically-dispensing-rose',
    categorySlug: 'fresh-flower-vending-machine',
    order: 5,
    featured: false,
    name: i18n('Elegant designed florist flower vending machine with remotely management system automatically dispensing flower gift in shop', '带远程管理系统的花店鲜花自动售货机'),
    shortDescription: i18n('Florist flower vending with remote management & auto dispensing.', '花店鲜花自动售货，远程管理自动发放。'),
    description: i18n(
      'An elegant florist flower vending machine with a remotely managed system that automatically dispenses rose gifts in-shop. Multiple color options and 11-bouquet capacity for branded flower retail.',
      '优雅的花店鲜花自动售货机，配备远程管理系统，可在店内自动发放玫瑰礼品；多色可选，11 束容量，适合品牌花艺零售。',
    ),
    features: { en: ['Remote management system', 'Auto dispensing', '11 bouquet capacity', 'Multiple color options'], zh: ['远程管理系统', '自动发放', '11 束容量', '多色可选'], ar: [] },
    specs: [
      { param: 'Machine size', value: '1560*870*2200mm' },
      { param: 'Capacity', value: '11 pcs' },
      { param: 'Color', value: 'Black/White/Green/Pink' },
    ],
  },
  {
    model: 'QT-VD206',
    slug: 'outdoor-bouquet-flower-vending-machine-vendor-for-your-florist-flower-shop-branding',
    categorySlug: 'fresh-flower-vending-machine',
    order: 6,
    featured: false,
    name: i18n('Outdoor bouquet flower vending machine vendor for your florist flower shop branding', '户外花束售货机（支持花店品牌定制）'),
    shortDescription: i18n('Outdoor bouquet vending machine for florist shop branding.', '户外花束售货机，支持花店品牌定制。'),
    description: i18n(
      'An outdoor bouquet flower vending machine purpose-built for florist branding. Weather-resistant enclosure with 8-bouquet capacity, letting flower shops extend their brand to streets and venues.',
      '专为花店品牌打造的户外花束售货机，机身耐候，可容纳 8 束花，助花店将品牌延伸至街头与各类场景。',
    ),
    features: { en: ['Outdoor / weather-resistant', 'Florist branding ready', '8 bouquet capacity', '24/7 self-service'], zh: ['户外耐候', '花店品牌定制', '8 束容量', '24 小时自助'], ar: [] },
    specs: [
      { param: 'Machine size', value: '1800*750*2150mm' },
      { param: 'Capacity', value: '8 pcs' },
    ],
  },
  {
    model: 'QT-VD-FOOD',
    slug: 'factory-direct-automated-hot-food-vending-machine-for-french-fries-and-fried-chicken',
    categorySlug: 'food-vending-machine',
    order: 7,
    featured: true,
    name: i18n('Factory Direct Automated Hot Food Vending Machine for French Fries and Fried Chicken', '工厂直销自动化热食售货机（炸薯条与炸鸡）'),
    shortDescription: i18n('Automated hot-food vending for French fries & fried chicken.', '炸薯条与炸鸡自动化热食售货机。'),
    description: i18n(
      'A factory-direct automated hot-food vending machine for French fries and fried chicken. Compressor cooling, 120-piece capacity, coin exchange and multiple payment methods with remote monitoring — serving hot food 24/7.',
      '工厂直销的自动化热食售货机，主营炸薯条与炸鸡；压缩机制冷，容量 120 份，支持硬币找零与多种支付方式及远程监控，24 小时供应热食。',
    ),
    features: { en: ['Hot food 24/7', 'Coin exchange & multi-payment', 'Remote monitoring', '120-piece capacity'], zh: ['24 小时热食', '硬币找零与多种支付', '远程监控', '120 份容量'], ar: [] },
    specs: [
      { param: 'Cooling System', value: 'Compressor' },
      { param: 'Capacity', value: '120 pieces' },
      { param: 'Dimensions', value: 'L1790*W971*H2275 mm' },
      { param: 'Power', value: '10000W' },
      { param: 'Voltage', value: 'AC 220V / 110V' },
      { param: 'Heating', value: '180°C' },
      { param: 'Payment', value: 'Coin exchange + multi-method' },
      { param: 'Monitoring', value: 'Remote' },
    ],
  },
  {
    model: 'QT-VD207',
    slug: 'hot-food-pizza-vending-machine-self-service-selling-and-heating-pizza-bring-convenience-to-people',
    categorySlug: 'pizza-vending-machine',
    order: 8,
    featured: true,
    name: i18n('Hot food pizza vending machine self-service selling and heating pizza bring convenience to people', '热食披萨售货机（自助售卖与加热）'),
    shortDescription: i18n('Self-service pizza vending with on-demand heating.', '自助售卖并即时加热披萨的热食售货机。'),
    description: i18n(
      'A hot-food pizza vending machine that sells and heats pizza on demand, bringing convenience to people anywhere. Holds 57 pizzas across 3 types, supports 100+ languages on screen and frozen-to-hot heating at 200–300°C.',
      '自助售卖并即时加热披萨的热食售货机，随时随地为人们带来便利；可存放 3 种共 57 个披萨，屏幕支持 100+ 语言，200–300°C 由冷冻加热至热食。',
    ),
    features: { en: ['On-demand heating', '57 pizza capacity', '3 pizza types', '100+ language UI'], zh: ['按需加热', '57 个披萨容量', '3 种类型', '100+ 语言界面'], ar: [] },
    specs: [
      { param: 'Pizza size', value: '6-10 inch' },
      { param: 'Capacity', value: '57 pcs' },
      { param: 'Types', value: '3 different' },
      { param: 'Freezing', value: '-18~5°C' },
      { param: 'Heating', value: '200-300°C' },
    ],
  },
  {
    model: 'QT-VD208',
    slug: 'intelligent-quick-and-delicious-pizza-vending-machine-with-both-frozen-and-heating-system',
    categorySlug: 'pizza-vending-machine',
    order: 9,
    featured: false,
    name: i18n('Intelligent quick and delicious pizza vending machine with both frozen and heating system', '智能快捷美味披萨售货机（冷冻+加热双系统）'),
    shortDescription: i18n('Intelligent pizza vending with frozen + heating systems.', '智能披萨售货机，冷冻与加热双系统。'),
    description: i18n(
      'An intelligent, quick and delicious pizza vending machine combining a frozen storage system and a heating system, so a fresh hot pizza is ready in minutes at any hour.',
      '智能、快捷、美味的披萨售货机，冷冻存储与加热系统一体，随时几分钟即可出品热腾腾的披萨。',
    ),
    features: { en: ['Frozen + heating system', 'Quick serve', 'Intelligent control', '24/7 operation'], zh: ['冷冻+加热双系统', '快速出品', '智能控制', '24 小时运营'], ar: [] },
    specs: [
      { param: 'System', value: 'Frozen + heating' },
      { param: 'Serve', value: 'Hot in minutes' },
    ],
  },
  {
    model: 'QT-VD209',
    slug: 'support-12-inchs-big-meat-and-vegetable-pizza-selling-pizza-vending-machine-in-university-schools',
    categorySlug: 'pizza-vending-machine',
    order: 10,
    featured: false,
    name: i18n('Support 12 inchs big meat and vegetable pizza selling pizza vending machine in university schools', '12 英寸大尺寸肉蔬披萨售货机（校园场景）'),
    shortDescription: i18n('12-inch meat & veggie pizza vending for campuses.', '12 英寸肉蔬披萨售货机，校园适用。'),
    description: i18n(
      'A pizza vending machine built for university campuses and schools, supporting big 12-inch meat and vegetable pizzas with fast heating and card payment for students.',
      '面向大学校园与学校的披萨售货机，支持 12 英寸大尺寸肉蔬披萨，快速加热，学生可刷卡购买。',
    ),
    features: { en: ['12-inch pizzas', 'Meat & veggie options', 'Campus ready', 'Card payment'], zh: ['12 英寸披萨', '肉蔬可选', '校园适用', '刷卡支付'], ar: [] },
    specs: [
      { param: 'Pizza size', value: '12 inch' },
      { param: 'Use case', value: 'University / school' },
    ],
  },
  {
    model: 'QT-VD300',
    slug: '12-inch-pizza-outdoor-waterproof-sun-resistant-and-insulated-pizza-vending-machine-can-be-used-in-gas-station',
    categorySlug: 'pizza-vending-machine',
    order: 11,
    featured: false,
    name: i18n('12 inch pizza Outdoor waterproof sun-resistant and insulated pizza vending machine can be used in gas station', '12 英寸户外防水防晒保温披萨售货机（加油站适用）'),
    shortDescription: i18n('Outdoor waterproof 12-inch pizza vending for gas stations.', '户外防水 12 英寸披萨售货机，加油站适用。'),
    description: i18n(
      'A 12-inch pizza vending machine engineered for outdoor use — waterproof, sun-resistant and insulated — making it ideal for gas stations, forecourts and other exposed locations.',
      '专为户外设计的 12 英寸披萨售货机，防水、防晒、保温，非常适合加油站、前庭及其他露天场所。',
    ),
    features: { en: ['Outdoor waterproof', 'Sun-resistant', 'Insulated body', 'Gas-station ready'], zh: ['户外防水', '防晒', '保温机身', '加油站适用'], ar: [] },
    specs: [
      { param: 'Pizza size', value: '12 inch' },
      { param: 'Enclosure', value: 'Waterproof / sun-resistant' },
    ],
  },
  {
    model: 'QT-VD301',
    slug: '45-flower-pattern-automatically-cotton-candy-vending-machine-with-cash-and-card-payment-method',
    categorySlug: 'cotton-candy-machine',
    order: 12,
    featured: true,
    name: i18n('45+ flower pattern automatically cotton candy vending machine with cash and card payment method', '45+ 花型自动棉花糖售货机（现金+刷卡）'),
    shortDescription: i18n('Auto cotton-candy vending with 45+ flower patterns.', '自动棉花糖售货机，45+ 种花型。'),
    description: i18n(
      'An automatic cotton-candy vending machine that spins 45+ flower patterns, with both cash and card payment. A high-attraction unit for malls, parks and family venues.',
      '自动棉花糖售货机，可制作 45+ 种花型，支持现金与刷卡支付，是商场、公园与亲子场所的吸睛设备。',
    ),
    features: { en: ['45+ flower patterns', 'Cash + card payment', 'Automatic spinning', 'High-attraction ROI'], zh: ['45+ 种花型', '现金+刷卡支付', '自动旋转', '高吸睛回报'], ar: [] },
    specs: [
      { param: 'Patterns', value: '45+ flower' },
      { param: 'Payment', value: 'Cash & card' },
    ],
  },
  {
    model: 'QT-VD302',
    slug: 'mini-save-place-cotton-candy-vending-machine-24-hours-self-service-selling-cotton-candy',
    categorySlug: 'cotton-candy-machine',
    order: 13,
    featured: false,
    name: i18n('MINI save place cotton candy vending machine 24 hours self-service selling cotton candy', '迷你省空间棉花糖售货机（24 小时自助）'),
    shortDescription: i18n('Mini space-saving cotton-candy vending, 24/7.', '迷你省空间棉花糖售货机，24 小时自助。'),
    description: i18n(
      'A mini, space-saving cotton-candy vending machine for 24-hour self-service selling. Compact footprint fits convenience stores, cinemas and small venues.',
      '迷你省空间的棉花糖售货机，支持 24 小时自助售卖；小巧占地，适合便利店、影院与小型场所。',
    ),
    features: { en: ['Mini footprint', '24/7 self-service', 'Space-saving', 'Easy operation'], zh: ['迷你占地', '24 小时自助', '省空间', '操作简单'], ar: [] },
    specs: [{ param: 'Type', value: 'Mini' }],
  },
  {
    model: 'QT-VD303',
    slug: 'competitive-hot-sale-car-shaped-cotton-candy-vending-machine-selling-delicious-cotton-candy',
    categorySlug: 'cotton-candy-machine',
    order: 14,
    featured: true,
    name: i18n('Competitive hot sale car-shaped cotton candy vending machine selling delicious cotton candy', '热销车型棉花糖售货机'),
    shortDescription: i18n('Car-shaped cotton-candy vending, hot seller.', '车型棉花糖售货机，热销款。'),
    description: i18n(
      'A competitive, hot-selling car-shaped cotton-candy vending machine that draws crowds with its eye-catching design while serving delicious cotton candy automatically.',
      '热销的车型棉花糖售货机，凭借吸睛造型聚集人气，同时自动售卖美味棉花糖。',
    ),
    features: { en: ['Car-shaped design', 'Crowd attraction', 'Hot seller', 'Automatic serve'], zh: ['车型设计', '聚集人气', '热销款', '自动出品'], ar: [] },
    specs: [{ param: 'Shape', value: 'Car' }],
  },
  {
    model: 'QT-VD304',
    slug: 'smart-vending-machine-with-weighing-sensor-technology-selling-fruitvegetableeggsnack-and-cold-drink',
    categorySlug: 'fruit-vegetable-egg-vending-machine',
    order: 15,
    featured: true,
    name: i18n('Smart vending machine with weighing sensor technology suitable for selling fruit,vegetable,egg,snack and cold drink items in different package', '智能称重传感售货机（果蔬蛋零食冷饮）'),
    shortDescription: i18n('Weighing-sensor smart vending for fruit, veg, eggs & drinks.', '称重传感智能售货，果蔬蛋零食冷饮。'),
    description: i18n(
      'A smart vending machine using weighing-sensor technology to sell fruit, vegetables, eggs, snacks and cold drinks by weight — perfect for fresh-food retail and convenience stores.',
      '采用称重传感技术的智能售货机，按重量售卖水果、蔬菜、鸡蛋、零食与冷饮，适合生鲜零售与便利店。',
    ),
    features: { en: ['Weighing-sensor tech', 'Fruit / veg / egg / snack', 'Cold drinks', 'By-weight pricing'], zh: ['称重传感技术', '果蔬蛋零食', '冷饮', '按重计价'], ar: [] },
    specs: [
      { param: 'Tech', value: 'Weighing sensor' },
      { param: 'Items', value: 'Fruit, veg, egg, snack, cold drink' },
    ],
  },
  {
    model: 'QT-VD305',
    slug: 'fresh-sugarcane-orange-juice-vending-machine-24-hours-self-service-with-system',
    categorySlug: 'sugar-cane-juice-vending-machine',
    order: 16,
    featured: false,
    name: i18n('Fresh sugarcane orange juice vending machine 24 hours self-service with system', '鲜榨甘蔗橙汁售货机（24 小时自助）'),
    shortDescription: i18n('24/7 fresh sugarcane & orange juice vending.', '24 小时鲜榨甘蔗橙汁售货机。'),
    description: i18n(
      'A 24-hour self-service vending machine that presses fresh sugarcane and orange juice on demand with an integrated management system — healthy beverages anywhere.',
      '24 小时自助的鲜榨甘蔗橙汁售货机，按需现榨，配备管理系统，随时提供健康饮品。',
    ),
    features: { en: ['Fresh sugarcane + orange', 'On-demand juicing', '24/7 self-service', 'Management system'], zh: ['鲜榨甘蔗+橙汁', '按需现榨', '24 小时自助', '管理系统'], ar: [] },
    specs: [
      { param: 'Drinks', value: 'Sugarcane / orange juice' },
      { param: 'System', value: 'Integrated management' },
    ],
  },
  {
    model: 'QT-VD306',
    slug: 'summer-ice-maker-vending-machine-with-card-payment-system-can-sell-edible-ice-cube',
    categorySlug: 'ice-maker-vending-machine',
    order: 17,
    featured: false,
    name: i18n('Summer ice-maker vending machine with card payment system can sell edible ice cube', '夏季制冰售货机（刷卡，食用冰块）'),
    shortDescription: i18n('Summer ice-maker vending with card payment.', '夏季制冰售货机，支持刷卡支付。'),
    description: i18n(
      'A summer ice-maker vending machine with a card payment system that sells edible ice cubes on demand — a refreshing add-on for convenience stores and outdoor venues.',
      '夏季制冰售货机，配备刷卡支付系统，按需售卖食用冰块，是便利店与户外场所的清爽加分项。',
    ),
    features: { en: ['Edible ice cubes', 'Card payment', 'Summer ready', 'On-demand making'], zh: ['食用冰块', '刷卡支付', '夏季适用', '按需制冰'], ar: [] },
    specs: [
      { param: 'Output', value: 'Edible ice cube' },
      { param: 'Payment', value: 'Card' },
    ],
  },
  {
    model: 'QT-VD307',
    slug: 'different-flavor-robot-service-ice-cream-vending-machine-support-logo-customized',
    categorySlug: 'ice-cream-vending-machine',
    order: 18,
    featured: false,
    name: i18n('Different flavor robot service ice cream vending machine support logo customized', '多口味机器人服务冰淇淋售货机（支持 logo 定制）'),
    shortDescription: i18n('Robot-service ice-cream vending, multi-flavor, logo custom.', '机器人服务冰淇淋售货机，多口味可定制 logo。'),
    description: i18n(
      'A robot-service ice-cream vending machine offering different flavors with a fun automated serving experience, and supports logo customization for branded deployments.',
      '多口味机器人服务冰淇淋售货机，自动化出品的趣味体验，并支持 logo 定制，适合品牌化部署。',
    ),
    features: { en: ['Multiple flavors', 'Robot service', 'Logo customization', 'Branded ready'], zh: ['多口味', '机器人服务', 'logo 定制', '品牌化就绪'], ar: [] },
    specs: [
      { param: 'Service', value: 'Robot' },
      { param: 'Custom', value: 'Logo' },
    ],
  },
  {
    model: 'QT-VD308',
    slug: '2025-newest-instant-fast-hot-coffee-vending-machine-in-energy-saving-design',
    categorySlug: 'coffee-vending-machine',
    order: 19,
    featured: true,
    name: i18n('2025 Newest instant fast hot coffee vending machine in Energy-saving design', '2025 最新节能速热咖啡售货机'),
    shortDescription: i18n('2025 newest energy-saving instant hot-coffee vending.', '2025 最新款节能速热咖啡售货机。'),
    description: i18n(
      'The 2025 newest instant hot-coffee vending machine in an energy-saving design — fast brew, low power draw and consistent taste for offices, lobbies and convenience stores.',
      '2025 最新款节能速热咖啡售货机，快速冲泡、低功耗、口感稳定，适合办公室、大堂与便利店。',
    ),
    features: { en: ['Energy-saving design', 'Instant hot brew', 'Fast serve', 'Consistent taste'], zh: ['节能设计', '速热冲泡', '快速出品', '口感稳定'], ar: [] },
    specs: [
      { param: 'Type', value: 'Instant coffee' },
      { param: 'Design', value: 'Energy-saving' },
    ],
  },
  {
    model: 'QT-VD-PET',
    slug: 'the-hot-new-pet-intelligent-self-service-washing-and-grooming-vending-machine-with-convenient-payment-options',
    categorySlug: 'pet-washing-machine',
    order: 20,
    featured: true,
    name: i18n('The hot new pet intelligent self-service washing and grooming vending machine with convenient payment options', '热门新型宠物智能自助洗护售货机'),
    shortDescription: i18n('Self-service pet wash & grooming vending, smart payment.', '自助宠物洗护售货机，智能支付。'),
    description: i18n(
      'The hot new pet intelligent self-service washing and grooming vending machine with convenient payment options — a turnkey pet-spa station for streets, communities and pet stores.',
      '热门新型宠物智能自助洗护售货机，支持便捷支付，是街头、社区与宠物店的即开即用宠物洗护站。',
    ),
    features: { en: ['Self-service wash & groom', 'Intelligent control', 'Convenient payment', 'Turnkey pet spa'], zh: ['自助洗护', '智能控制', '便捷支付', '即开即用宠物站'], ar: [] },
    specs: [
      { param: 'Type', value: 'Pet wash & grooming' },
      { param: 'Payment', value: 'Convenient options' },
    ],
  },
];

const PUBLIC_DIR = path.join(process.cwd(), 'public');

/** Build the images array from the actual WebP files on disk (1.webp, 2.webp…). */
async function getProductImages(slug: string): Promise<string[]> {
  const dir = path.join(PUBLIC_DIR, 'images', 'products', slug);
  try {
    const entries = await fs.readdir(dir);
    return entries
      .filter((f) => f.toLowerCase().endsWith('.webp'))
      .sort((a, b) => {
        const na = parseInt((a.match(/\d+/) || ['0'])[0], 10);
        const nb = parseInt((b.match(/\d+/) || ['0'])[0], 10);
        return na - nb;
      })
      .map((f) => `/images/products/${slug}/${f}`);
  } catch {
    return [];
  }
}

async function main() {
  console.log('[rebuild-products] upserting categories…');
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, order: c.order, icon: c.icon, status: 'active', type: 'product' },
      create: { slug: c.slug, name: c.name, description: c.description, order: c.order, icon: c.icon, status: 'active', type: 'product' },
    });
  }
  console.log(`[rebuild-products] ${CATEGORIES.length} categories ensured`);

  const canonicalSlugs = CANONICAL.map((p) => p.slug);

  for (const p of CANONICAL) {
    const images = await getProductImages(p.slug);
    const seoTitle = { en: p.name.en, zh: p.name.zh, ar: p.name.ar };
    const seoDescription = { en: p.shortDescription.en, zh: p.shortDescription.zh, ar: p.shortDescription.ar };
    const seoKeywords = {
      en: [p.name.en, p.categorySlug.replace(/-/g, ' '), 'Qtech vending'],
      zh: [p.name.zh, 'Qtech 售货机'],
      ar: [p.name.ar, 'Qtech'],
    };

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        sku: p.model,
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription,
        images,
        features: p.features,
        specs: p.specs,
        status: 'active',
        featured: p.featured,
        order: p.order,
        seoTitle,
        seoDescription,
        seoKeywords,
        categories: { set: [{ slug: p.categorySlug }] },
      },
      create: {
        slug: p.slug,
        sku: p.model,
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription,
        images,
        features: p.features,
        specs: p.specs,
        status: 'active',
        featured: p.featured,
        order: p.order,
        seoTitle,
        seoDescription,
        seoKeywords,
        categories: { connect: [{ slug: p.categorySlug }] },
      },
    });
    console.log(`[rebuild-products] upserted product: ${p.slug} (${images.length} image(s))`);
  }

  const removed = await prisma.product.deleteMany({
    where: { slug: { notIn: canonicalSlugs } },
  });
  console.log(`[rebuild-products] deleted ${removed.count} stale product(s) (e.g. helmet-washing, old pet slug)`);

  console.log('[rebuild-products] done ✓');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
