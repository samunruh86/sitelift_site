const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const baseDir = path.join(root, 'docs', 'base');
const htmlFiles = [
  'index.html',
  'about.html',
  'services.html',
  'detail_services.html',
  'blog.html',
  'detail_post.html',
  'contact.html',
].map((name) => path.join(baseDir, name));

const errors = [];

const findMatches = (regex, text) => {
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match);
  }
  return matches;
};

const validateHtml = (filePath) => {
  const text = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(root, filePath);

  const cssLinks = findMatches(/href="(css\/[^\"]+)"/g, text).map((m) => m[1]);
  const jsLinks = findMatches(/<script[^>]*src="(js\/[^\"]+)"/g, text).map((m) => m[1]);

  if (cssLinks.length !== 1 || cssLinks[0] !== 'css/styles.css') {
    errors.push(`${rel}: expected 1 CSS link to css/styles.css, found ${cssLinks.length} (${cssLinks.join(', ') || 'none'})`);
  }

  if (jsLinks.length !== 1 || jsLinks[0] !== 'js/main.js') {
    errors.push(`${rel}: expected 1 JS link to js/main.js, found ${jsLinks.length} (${jsLinks.join(', ') || 'none'})`);
  }

  if (/\/unused\//.test(text)) {
    errors.push(`${rel}: contains /unused/ link`);
  }

  if (/data-w-id=/.test(text)) {
    errors.push(`${rel}: contains data-w-id attributes`);
  }

  if (/html\.w-mod-js:not\(\.w-mod-ix\)/.test(text)) {
    errors.push(`${rel}: contains ix2 style block`);
  }
};

const sumDir = (dirPath) => {
  let total = 0;
  if (!fs.existsSync(dirPath)) {
    return total;
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += sumDir(fullPath);
    } else if (entry.isFile()) {
      total += fs.statSync(fullPath).size;
    }
  }
  return total;
};

const formatBytes = (bytes) => {
  const kb = bytes / 1024;
  const mb = kb / 1024;
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }
  if (kb >= 1) {
    return `${kb.toFixed(2)} KB`;
  }
  return `${bytes} B`;
};

htmlFiles.forEach((file) => validateHtml(file));

const before = {
  css: sumDir(path.join(root, 'docs', 'css')),
  js: sumDir(path.join(root, 'docs', 'js')),
  images: sumDir(path.join(root, 'docs', 'images')),
  fonts: sumDir(path.join(root, 'docs', 'fonts')),
};

const after = {
  css: sumDir(path.join(baseDir, 'css')),
  js: sumDir(path.join(baseDir, 'js')),
  images: sumDir(path.join(baseDir, 'images')),
  fonts: sumDir(path.join(baseDir, 'fonts')),
};

console.log('Validation results');
if (errors.length) {
  console.log(`- Errors: ${errors.length}`);
  errors.forEach((err) => console.log(`  - ${err}`));
} else {
  console.log('- No validation errors');
}

const printTotals = (label, totals) => {
  console.log(`${label}`);
  console.log(`- CSS: ${totals.css} bytes (${formatBytes(totals.css)})`);
  console.log(`- JS: ${totals.js} bytes (${formatBytes(totals.js)})`);
  console.log(`- Images: ${totals.images} bytes (${formatBytes(totals.images)})`);
  console.log(`- Fonts: ${totals.fonts} bytes (${formatBytes(totals.fonts)})`);
};

printTotals('Before (docs/)', before);
printTotals('After (docs/base/)', after);

const percent = (beforeBytes, afterBytes) => {
  if (!beforeBytes) return '0%';
  const reduction = ((beforeBytes - afterBytes) / beforeBytes) * 100;
  return `${reduction.toFixed(2)}%`;
};

console.log('Reduction');
console.log(`- CSS: ${percent(before.css, after.css)}`);
console.log(`- JS: ${percent(before.js, after.js)}`);
console.log(`- Images: ${percent(before.images, after.images)}`);
console.log(`- Fonts: ${percent(before.fonts, after.fonts)}`);

if (errors.length) {
  process.exit(1);
}
