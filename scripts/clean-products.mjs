import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, 'data', 'products.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// Marketing copy templates per category: [en, zh, ar]
const COPY = {
  'fresh-flower-vending-machine': {
    en: 'Smart fresh-flower vending machine with refrigerated glass display, touch screen and 24/7 remote management — keeps roses, lilies and carnations fresh on site.',
    zh: '智能鲜花售货机，配备制冷玻璃展柜与触屏，支持 24/7 远程管理，现场保鲜玫瑰、百合与康乃馨。',
    ar: 'ماكينة بيع زهور ذكية بشاشة زجاجية مبردة وشاشة لمس وإدارة عن بُعد 24/7 — تحافظ على الورد والزنبق والقرنفل طازجًا.',
  },
  'pizza-vending-machine': {
    en: 'Fully automatic pizza vending machine that stores frozen pizzas, bakes in 3 minutes and serves hot — ideal for campuses, stations and late-night retail.',
    zh: '全自动披萨售货机，冷冻储存、3 分钟现烤出炉，适合校园、车站与夜间零售场景。',
    ar: 'ماكينة بيع بيتزا أوتوماتيكية بالكامل تخزن البيتزا المجمدة وتخبزها في 3 دقائق — مثالية للحرم الجامعي والمحطات.',
  },
  'cotton-candy-machine': {
    en: 'Automatic cotton-candy vending machine that spins fresh floss in 60 seconds with card, coin and QR payment — a proven crowd-puller for malls and parks.',
    zh: '自动棉花糖售货机，60 秒现做蓬松棉花糖，支持刷卡、投币与扫码支付，商场公园引流利器。',
    ar: 'ماكينة حلوى القطن الآلية التي تلف الحلوى الطازجة في 60 ثانية مع دفع بالبطاقة والعملة والرمز QR.',
  },
  'fruit-vegetable-egg-vending-machine': {
    en: 'Weighing-sensor smart vending machine for fresh fruit, vegetables, eggs and snacks with cooled storage and cashless checkout.',
    zh: '称重感应智能售货机，售卖鲜果、蔬菜、禽蛋与零食，配备冷藏存储与无现金结算。',
    ar: 'ماكينة بيع ذكية باستشعار الوزن للفواكه والخضروات والبيض والوجبات الخفيفة مع تبريد ودفع بدون نقد.',
  },
  'sugar-cane-juice-vending-machine': {
    en: '24/7 self-service sugarcane & orange juice vending machine with built-in pressing, cooling and contactless payment.',
    zh: '24/7 自助甘蔗橙汁售货机，内置压榨、制冷与无接触支付，鲜榨即饮。',
    ar: 'ماكينة عصير قصب وبرتقال ذاتية الخدمة 24/7 مع عصر وتبريد ودفع بدون تلامس.',
  },
  'ice-maker-vending-machine': {
    en: 'Commercial ice-maker vending machine producing edible cube ice on demand with card payment — perfect for hotels, gyms and coastal venues.',
    zh: '商用制冰售货机，按需现制可食用方块冰，支持刷卡支付，适合酒店、健身房与海滨场所。',
    ar: 'ماكينة صنع ثلج تجارية تنتج مكعبات ثلج صالبة للأكل عند الطلب مع دفع بالبطاقة.',
  },
  'ice-cream-vending-machine': {
    en: 'Robotic ice-cream vending machine with multiple flavors, logo branding and 24/7 self-service operation for retail chains.',
    zh: '机器人冰淇淋售货机，多口味可选、支持品牌 LOGO 定制，适合零售连锁 24/7 自助运营。',
    ar: 'ماكينة آيس كريم روبوتية بنكهات متعددة وتخصيص الشعار وتشغيل ذاتي 24/7 للسلاسل التجارية.',
  },
  'coffee-vending-machine': {
    en: 'Energy-saving instant hot coffee vending machine with fresh-ground beans, multiple recipes and cashless payment for offices and lobbies.',
    zh: '节能速热咖啡售货机，鲜磨咖啡豆、多款配方、无现金支付，适合办公室与企业大堂。',
    ar: 'ماكينة قهوة ساخنة فورية موفرة للطاقة بحبوب طازجة ووصفات متعددة ودفع بدون نقد.',
  },
  'pet-washing-machine': {
    en: '24/7 self-service pet washing & grooming vending machine with warm water, dryer and multiple payment options for residential districts.',
    zh: '24/7 自助宠物洗护售货机，配备温水、烘干与多种支付方式，适合社区场景。',
    ar: 'ماكينة غسيل وتجميل حيوانات ذاتية الخدمة 24/7 بمياه دافئة ومجفف وخيارات دفع متعددة.',
  },
  'food-vending-machine': {
    en: 'Automated hot-food vending machine for French fries, fried chicken and prepared meals with heating, refrigeration and 24/7 service.',
    zh: '自动化热食售货机，供应薯条、炸鸡与预制餐，配备加热、冷藏与 24/7 服务。',
    ar: 'ماكينة طعام ساخن آلية للبطاطس المقلية والدجاج المقلي والوجبات المجهزة مع تسخين وتبريد وخدمة 24/7.',
  },
};

function cleanSpec(specText) {
  // Strip leading "Description " and tidy
  return specText.replace(/^Description\s+/i, '').trim();
}

data.forEach((p) => {
  const cat = p.categories[0];
  const tpl = cat ? COPY[cat] : null;

  // Strip "Description " from raw spec, keep as technical description
  const rawSpec = cleanSpec(p.shortDescription || '');

  // shortDescription → clean marketing copy (3 langs)
  p.shortDescription = tpl;

  // description → marketing copy + preserved spec block
  p.description = {
    en: tpl.en + '\n\nSpecifications:\n' + rawSpec,
    zh: tpl.zh + '\n\n技术参数：\n' + rawSpec,
    ar: tpl.ar + '\n\nالمواصفات:\n' + rawSpec,
  };

  // Clean descriptionHtml if it just wraps the old "Description" block
  if (p.descriptionHtml && p.descriptionHtml.includes('Description')) {
    p.descriptionHtml = '';
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('✅ products.json cleaned:', data.length, 'products');
console.log('Categories covered:', [...new Set(data.map((p) => p.categories[0]))].join(', '));
