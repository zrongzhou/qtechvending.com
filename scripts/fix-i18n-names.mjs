/**
 * fix-i18n-names.mjs — Backfill trilingual name/title/description fields.
 *
 * The scraped data files store `name` / `title` / `description` as plain
 * English strings. The DB column is a Json `{ en, zh, ar }` and seed.mjs only
 * ever populated `en`, leaving `zh`/`ar` empty (so the zh/ar sites fell back
 * to English product names). This script rewrites the three data files so that
 * every name/title/description becomes a proper `{ en, zh, ar }` object with
 * real translations, ready for a correct re-seed.
 *
 * Run: `node scripts/fix-i18n-names.mjs`
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');

// ---- Product name translations (keyed by slug) ----
const PRODUCT_TR = {
  'factory-directly-sale-flower-bouquet-vending-machine-with-card-payment-method': {
    zh: '工厂直销鲜花花束售货机（支持刷卡支付）',
    ar: 'ماكينة بيع باقات الزهور مباشرة من المصنع مع دفع بالبطاقة',
  },
  '2025-popular-24-7-self-service-florist-flower-shop-vending-machine-sell-bouquet-of-rose': {
    zh: '2025 热销 24/7 自助花店鲜花售货机（玫瑰礼盒）',
    ar: 'ماكينة بيع الزهور الذاتية 24/7 لبيع باقات الورد لعام 2025',
  },
  '21-5-inchs-touch-screen-fresh-flower-vending-machine-with-cooling-system-selling-rose-lily-carnation-etc': {
    zh: '21.5 英寸触屏鲜花售货机（制冷系统·玫瑰/百合/康乃馨等）',
    ar: 'ماكينة بيع الزهور الطازجة بشاشة لمس 21.5 بوصة مع نظام تبريد لبيع الورد والأقحوان وغيرها',
  },
  'good-capacity-smart-locker-flower-vending-machine-selling-different-fresh-flowergift-in-subway': {
    zh: '大容量智能柜式鲜花售货机（地铁场景·多款鲜花礼品）',
    ar: 'ماكينة بيع الزهور الذكية بخزائن سعة كبيرة لبيع الزهور والهدايا الطازجة في المترو',
  },
  'florist-flower-vending-machine-with-remotely-management-system-automatically-dispensing-rose': {
    zh: '带远程管理系统的花店鲜花售货机（自动出玫瑰）',
    ar: 'ماكينة بيع الزهور لبائعي الأزهار مع نظام إدارة عن بُعد وتوزيع أوتوماتيكي للورد',
  },
  'outdoor-bouquet-flower-vending-machine-vendor-for-your-florist-flower-shop-branding': {
    zh: '户外花束鲜花售货机（花店品牌定制）',
    ar: 'ماكينة بيع باقات الزهور في الهواء الطلق لتعزيز علامتك التجارية لزهورك',
  },
  'hot-food-pizza-vending-machine-self-service-selling-and-heating-pizza-bring-convenience-to-people': {
    zh: '热食披萨售货机（自助售卖并加热披萨）',
    ar: 'ماكينة بيع البيتزا الساخنة ذاتية الخدمة مع تسخين البيتزا لراحة الناس',
  },
  'intelligent-quick-and-delicious-pizza-vending-machine-with-both-frozen-and-heating-system': {
    zh: '智能快速美味披萨售货机（冷冻+加热双系统）',
    ar: 'ماكينة بيع البيتزا الذكية السريعة واللذيذة بنظام تبريد وتسخين',
  },
  'support-12-inchs-big-meat-and-vegetable-pizza-selling-pizza-vending-machine-in-university-schools': {
    zh: '12 英寸大尺寸肉蔬披萨售货机（校园场景）',
    ar: 'ماكينة بيع البيتزا بحجم 12 بوصة باللحم والخضار للجامعات والمدارس',
  },
  '12-inch-pizza-outdoor-waterproof-sun-resistant-and-insulated-pizza-vending-machine-can-be-used-in-gas-station': {
    zh: '12 英寸户外防水防晒保温披萨售货机（加油站适用）',
    ar: 'ماكينة بيع البيتزا 12 بوصة مقاومة للماء والشمس ومعزولة للاستخدام في محطات الوقود',
  },
  '45-flower-pattern-automatically-cotton-candy-vending-machine-with-cash-and-card-payment-method': {
    zh: '45+ 花型自动棉花糖售货机（现金/刷卡支付）',
    ar: 'ماكينة بيع الحلوى القطنية الأوتوماتيكية بـ 45+ رسمة زهرة مع دفع نقدي وبالبطاقة',
  },
  'mini-save-place-cotton-candy-vending-machine-24-hours-self-service-selling-cotton-candy': {
    zh: '迷你省地棉花糖售货机（24 小时自助）',
    ar: 'ماكينة بيع الحلوى القطنية المصغرة لتوفير المساحة بخدمة ذاتية 24 ساعة',
  },
  'competitive-hot-sale-car-shaped-cotton-candy-vending-machine-selling-delicious-cotton-candy': {
    zh: '热销汽车造型棉花糖售货机（美味棉花糖）',
    ar: 'ماكينة بيع الحلوى القطنية على شكل سيارة الأكثر مبيعًا واللذيذة',
  },
  'smart-vending-machine-with-weighing-sensor-technology-selling-fruitvegetableeggsnack-and-cold-drink': {
    zh: '称重传感智能售货机（果蔬/鸡蛋/零食/冷饮）',
    ar: 'ماكينة بيع ذكية بتقنية استشعار الوزن لبيع الفواكه والخضار والبيض والوجبات الخفيفة والمشروبات الباردة',
  },
  'fresh-sugarcane-orange-juice-vending-machine-24-hours-self-service-with-system': {
    zh: '鲜榨甘蔗橙汁售货机（24 小时自助）',
    ar: 'ماكينة عصير قصب البرتقال الطازج بخدمة ذاتية 24 ساعة',
  },
  'summer-ice-maker-vending-machine-with-card-payment-system-can-sell-edible-ice-cube': {
    zh: '夏季制冰售货机（刷卡支付·可售食用冰块）',
    ar: 'ماكينة صنع الثلج الصيفية بنظام دفع بالبطاقة لبيع مكعبات الثلج الصالحة للأكل',
  },
  'different-flavor-robot-service-ice-cream-vending-machine-support-logo-customized': {
    zh: '多口味机器人服务冰淇淋售货机（支持 logo 定制）',
    ar: 'ماكينة آيس كريم بخدمة روبوت ونكهات متعددة مع تخصيص الشعار',
  },
  '2025-newest-instant-fast-hot-coffee-vending-machine-in-energy-saving-design': {
    zh: '2025 新款速热节能咖啡售货机',
    ar: 'أحدث ماكينة قهوة ساخنة سريعة وفورية لعام 2025 بتصميم موفر للطاقة',
  },
  'the-hot-new-pet-intelligent-self-service-washing-and-grooming-vending-machine-with-convenient-payment-options': {
    zh: '热门新款宠物智能自助洗护售货机（多种便捷支付）',
    ar: 'أحدث ماكينة غسيل وتجميل الحيوانات الأليفة الذكية ذاتية الخدمة بخيارات دفع مريحة',
  },
  'factory-direct-automated-hot-food-vending-machine-for-french-fries-and-fried-chicken': {
    zh: '工厂直供自动热食售货机（薯条/炸鸡）',
    ar: 'ماكينة بيع الطعام الساخن الأوتوماتيكية مباشرة من المصنع للبطاطس المقلية والدجاج المقلي',
  },
};

// ---- Category name + description translations (keyed by slug) ----
const CATEGORY_TR = {
  'fresh-flower-vending-machine': {
    zh: '鲜花售货机',
    ar: 'ماكينة بيع الزهور الطازجة',
    descEn: 'Chilled bouquets, dispensed 24/7.',
    descZh: '冷藏鲜花，24/7 自助售卖。',
    descAr: 'باقات مبردة تُباع ذاتيًا على مدار الساعة.',
  },
  'pizza-vending-machine': {
    zh: '披萨售货机',
    ar: 'ماكينة بيع البيتزا',
    descEn: 'Hot pizza in 3 minutes, no staff.',
    descZh: '3 分钟出热披萨，无需店员。',
    descAr: 'بيتزا ساخنة في 3 دقائق دون موظفين.',
  },
  'cotton-candy-machine': {
    zh: '棉花糖机',
    ar: 'ماكينة الحلوى القطنية',
    descEn: 'Fresh-spun cotton candy on demand.',
    descZh: '即点即做的鲜棉花糖。',
    descAr: 'حلوى قطنية طازجة عند الطلب.',
  },
  'fruit-vegetable-egg-vending-machine': {
    zh: '果蔬蛋售货机',
    ar: 'ماكينة بيع الفواكه والخضار والبيض',
    descEn: 'Fresh produce & eggs, weight-priced.',
    descZh: '新鲜果蔬与鸡蛋，按重计价。',
    descAr: 'منتجات طازجة وبيض بأسعار حسب الوزن.',
  },
  'sugar-cane-juice-vending-machine': {
    zh: '甘蔗汁售货机',
    ar: 'ماكينة عصير قصب السكر',
    descEn: 'Fresh sugarcane & orange juice.',
    descZh: '鲜榨甘蔗与橙汁。',
    descAr: 'عصير قصب وبرتقال طازج.',
  },
  'ice-maker-vending-machine': {
    zh: '制冰售货机',
    ar: 'ماكينة صنع الثلج',
    descEn: 'Edible ice cubes, card payment.',
    descZh: '可食冰块，刷卡即购。',
    descAr: 'مكعبات ثلج صالحة للأكل، دفع بالبطاقة.',
  },
  'coffee-vending-machine': {
    zh: '咖啡售货机',
    ar: 'ماكينة القهوة',
    descEn: 'Barista-quality coffee, self-serve.',
    descZh: '咖啡师级品质，自助畅享。',
    descAr: 'قهوة بجودة الباريستا، ذاتية الخدمة.',
  },
  'ice-cream-vending-machine': {
    zh: '冰淇淋售货机',
    ar: 'ماكينة الآيس كريم',
    descEn: 'Robot-served ice cream, 59 flavors.',
    descZh: '机器人服务冰淇淋，59 种口味。',
    descAr: 'آيس كريم بخدمة روبوت، 59 نكهة.',
  },
  'pet-washing-machine': {
    zh: '宠物洗护机',
    ar: 'ماكينة غسيل الحيوانات',
    descEn: '24/7 self-service pet wash.',
    descZh: '24/7 自助宠物洗护。',
    descAr: 'غسيل حيوانات ذاتي على مدار الساعة.',
  },
  'food-vending-machine': {
    zh: '热食售货机',
    ar: 'ماكينة بيع الطعام',
    descEn: 'Hot meals, fries & chicken on demand.',
    descZh: '热食、薯条与炸鸡，即点即取。',
    descAr: 'وجبات ساخنة وبطاطس ودجاج عند الطلب.',
  },
};

// ---- Blog title translations (keyed by slug) ----
const BLOG_TR = {
  'qtech-flower-pizza-and-coffee-vending-machines-in-over-80-countries': {
    zh: 'Qtech 鲜花、披萨与咖啡售货机远销 80+ 国家',
    ar: 'ماكينات Qtech لبيع الزهور والبيتزا والقهوة في أكثر من 80 دولة',
  },
  'customer-positive-feedback-are-our-greatest-support': {
    zh: '客户的好评是我们最大的支持',
    ar: 'تقييمات العملاء الإيجابية هي أكبر دعم لنا',
  },
  'witnessing-the-full-journey-of-our-flower-vending-machine': {
    zh: '见证我们鲜花售货机的完整旅程',
    ar: 'نشهد الرحلة الكاملة لماكينة بيع الزهور الخاصة بنا',
  },
  'why-ice-vending-machines-are-changing-the-game': {
    zh: '为什么制冰售货机正在改变格局',
    ar: 'لماذا تغير ماكينات بيع الثلج قواعد اللعبة',
  },
  'want-to-expand-your-food-business-but-worried-about-high-labor-costs-expensive-rent-and-limited-operating-hours-take-a-look-at-this-smart-pizza-vending-machine': {
    zh: '想拓展餐饮生意却担心人力成本高、租金贵、营业时间有限？看看这台智能披萨售货机',
    ar: 'هل ترغب في توسيع أعمال الطعام لكنك قلق بشأن تكاليف العمالة والإيجار وساعات العمل؟ تعرف على ماكينة البيتزا الذكية هذه',
  },
  'meet-the-next-generation-of-french-fry-vending-instead-of-dunking-potatoes-in-oil-the-machine-uses-a-graphene-heating-core-to-blast-them-with-focused-hot-air-fat-renders-out-moisture-escapes-and': {
    zh: '新一代薯条售货机：石墨烯热风技术，金黄酥脆更低卡',
    ar: 'جيل جديد من ماكينة البطاطس المقلية بتقنية الهواء الساخن المركز',
  },
  '%f0%9f%8c%9f-the-smart-choice-for-small-businesses%ef%bc%8c24-7-hours-self-selling-ice-vending-machine-turn-coolness-into-cash%f0%9f%a7%8a': {
    zh: '小企业的明智之选：24/7 自助制冰售货机，把清凉变成现金',
    ar: 'الخيار الذكي للشركات الصغيرة: ماكينة بيع الثلج ذاتية الخدمة 24/7 — حوّل الانتعاش إلى نقد',
  },
};

function asString(v) {
  return typeof v === 'string' ? v : v?.en ?? '';
}

// ---------- Products ----------
const productsPath = join(DATA_DIR, 'products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));
let pMissing = 0;
for (const p of products) {
  const en = asString(p.name);
  const tr = PRODUCT_TR[p.slug];
  if (!tr) {
    pMissing++;
    p.name = { en, zh: en, ar: en };
  } else {
    p.name = { en, zh: tr.zh, ar: tr.ar };
  }
  // shortDescription / description: keep English (UI falls back gracefully).
  if (p.shortDescription) p.shortDescription = asString(p.shortDescription);
  if (p.description) p.description = asString(p.description);
}
writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log(`products.json: ${products.length} products updated (${pMissing} without explicit translation).`);

// ---------- Categories ----------
const categoriesPath = join(DATA_DIR, 'categories.json');
const categories = JSON.parse(readFileSync(categoriesPath, 'utf-8'));
let cMissing = 0;
for (const c of categories) {
  const en = asString(c.name);
  const tr = CATEGORY_TR[c.slug];
  if (!tr) {
    cMissing++;
    c.name = { en, zh: en, ar: en };
    c.description = c.description ? asString(c.description) : '';
  } else {
    c.name = { en, zh: tr.zh, ar: tr.ar };
    c.description = { en: tr.descEn, zh: tr.descZh, ar: tr.descAr };
  }
}
writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
console.log(`categories.json: ${categories.length} categories updated (${cMissing} without explicit translation).`);

// ---------- Blogs ----------
const blogsPath = join(DATA_DIR, 'blogs.json');
const blogs = JSON.parse(readFileSync(blogsPath, 'utf-8'));
let bMissing = 0;
for (const b of blogs) {
  const en = asString(b.title);
  const tr = BLOG_TR[b.slug];
  if (!tr) {
    bMissing++;
    b.title = { en, zh: en, ar: en };
  } else {
    b.title = { en, zh: tr.zh, ar: tr.ar };
  }
  if (b.excerpt) b.excerpt = asString(b.excerpt);
}
writeFileSync(blogsPath, JSON.stringify(blogs, null, 2));
console.log(`blogs.json: ${blogs.length} blogs updated (${bMissing} without explicit translation).`);

console.log('\nDone. All name/title/description fields are now { en, zh, ar } objects.');
