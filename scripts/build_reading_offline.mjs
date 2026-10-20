// scripts/build_reading_offline.mjs
//
// 生成「无门禁 · 断网可用」的阅读课讲课副本（单个 HTML，图片内嵌 base64）。
//
// 为什么需要：教室网络不稳时，线上站要过 Supabase 登录门禁 + 外网 CDN，
// 任何一环抽风都会在上课前卡住。这个副本双击即开，不联网、不登录、不依赖任何 CDN。
//
// 用法：node scripts/build_reading_offline.mjs [单元key]
// 产物：private/课堂副本/阅读课-<key>.html （private/ 已被 gitignore，不进入公开仓库）

import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const readingDir = path.join(root, 'docs/reading');
const key = process.argv[2] || '必修一|U3|RT';

let html = fs.readFileSync(path.join(readingDir, 'index.html'), 'utf8');

// 1) 摘掉门禁三件套（config / supabase CDN / cloud / gate）
html = html
  .replace(/<script src="\.\.\/config\.js"><\/script>\s*/g, '')
  .replace(/<script src="https:\/\/cdn\.jsdelivr\.net[^"]*"><\/script>\s*/g, '')
  .replace(/<script src="\.\.[^"]*shared\/cloud\.js"><\/script>\s*/g, '')
  .replace(/<script src="\.\.[^"]*shared\/gate\.js"><\/script>\s*/g, '');

// 2) 本地脚本全部内联（按原顺序，保证依赖关系不变）
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
  if (/^https?:/.test(src)) return m;
  const p = path.resolve(readingDir, src);
  if (!fs.existsSync(p)) return m;
  const code = fs.readFileSync(p, 'utf8').replace(/<\/script>/gi, '<\\/script>');
  return '<script>\n/* ' + path.basename(p) + ' */\n' + code + '\n</script>';
});

// 2.5) 本地样式表内联（dock.css 等），断网时不再外链
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, href) => {
  if (/^https?:/.test(href)) return m;
  const p = path.resolve(readingDir, href);
  if (!fs.existsSync(p)) return m;
  return '<style>\n/* ' + path.basename(p) + ' */\n' + fs.readFileSync(p, 'utf8') + '\n</style>';
});

// 2.6) 去掉 Google Fonts @import：离线副本无网可依，字体回落到系统字体栈
html = html.replace(/^\s*@import url\('https:\/\/fonts\.googleapis\.com[^']*'\);\s*$/gm, '');

// 3) 图片内嵌：把 ../assets/textbook/bx1/xxx.webp 换成 data URI
html = html.replace(/\.\.\/assets\/textbook\/bx1\/([A-Za-z0-9._-]+\.(?:webp|png|jpg|jpeg))/g, (m, name) => {
  const p = path.join(root, 'docs/assets/textbook/bx1', name);
  if (!fs.existsSync(p)) return m;
  const mime = name.endsWith('.png') ? 'image/png' : (name.endsWith('.jpg') || name.endsWith('.jpeg')) ? 'image/jpeg' : 'image/webp';
  return 'data:' + mime + ';base64,' + fs.readFileSync(p).toString('base64');
});

// 4) 带上默认篇目，双击打开就是这篇
const outDir = path.join(root, 'private/课堂副本');
fs.mkdirSync(outDir, { recursive: true });
const safeName = key.replace(/\|/g, '-');
const out = path.join(outDir, '阅读课-' + safeName + '.html');
fs.writeFileSync(out, html, 'utf8');

console.log('已生成：' + out);
console.log('体积：' + (fs.statSync(out).size / 1024 / 1024).toFixed(2) + ' MB（图片已内嵌，断网可用）');
