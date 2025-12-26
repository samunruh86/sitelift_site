const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'docs');
const partialsDir = path.join(docsDir, 'partials');
const distDir = path.join(docsDir, 'dist');

function indentLines(content, indent) {
  return content
    .split('\n')
    .map((line) => (line.length ? `${indent}${line}` : line))
    .join('\n');
}

function addActiveNav(html, navKey) {
  const navRegex = new RegExp(`<([a-zA-Z][\\w:-]*)([^>]*\\sdata-nav="${navKey}"[^>]*)>`, 'i');
  return html.replace(navRegex, (match, tag, attrs) => {
    let updatedAttrs = attrs;
    const classMatch = attrs.match(/\sclass=("[^"]*"|'[^']*')/);
    if (classMatch) {
      const quote = classMatch[1][0];
      const classValue = classMatch[1].slice(1, -1);
      const classList = classValue.split(/\s+/).filter(Boolean);
      if (!classList.includes('is-active')) {
        classList.push('is-active');
        updatedAttrs = updatedAttrs.replace(
          classMatch[0],
          ` class=${quote}${classList.join(' ')}${quote}`
        );
      }
    } else {
      updatedAttrs += ' class="is-active"';
    }

    if (!/\saria-current=/.test(updatedAttrs)) {
      updatedAttrs += ' aria-current="page"';
    }

    return `<${tag}${updatedAttrs}>`;
  });
}

function navKeyForPage(pageKey) {
  if (pageKey === 'service_detail') {
    return 'services';
  }
  if (pageKey === 'blog_post') {
    return 'blog';
  }
  return pageKey;
}

function prefixAssetPaths(html, prefix) {
  if (!prefix) {
    return html;
  }

  const assetAttrPattern = /(href|src)=("|\')((?:css|js|media|images|fonts)\/[^"\']*)/g;
  let updatedHtml = html.replace(assetAttrPattern, (match, attr, quote, assetPath) => {
    return `${attr}=${quote}${prefix}${assetPath}`;
  });

  updatedHtml = updatedHtml.replace(/srcset=("|\')([^"\']*)\1/g, (match, quote, value) => {
    const updated = value
      .split(',')
      .map((part) => {
        const trimmed = part.trim();
        const [url, descriptor] = trimmed.split(/\s+/, 2);
        if (/^(css|js|media|images|fonts)\//.test(url)) {
          return `${prefix}${url}${descriptor ? ` ${descriptor}` : ''}`;
        }
        return trimmed;
      })
      .join(', ');
    return `srcset=${quote}${updated}${quote}`;
  });

  return updatedHtml;
}

function prefixRelativeLinks(html, prefix) {
  if (!prefix) {
    return html;
  }

  return html.replace(/href=("|\')([^"\']+)\1/g, (match, quote, href) => {
    if (/^(?:[a-z]+:|#|\/|\.{1,2}\/)/i.test(href)) {
      return match;
    }
    if (/^(?:css|js|media|images|fonts)\//.test(href)) {
      return match;
    }
    return `href=${quote}${prefix}${href}${quote}`;
  });
}

function loadPartial(name) {
  const filePath = path.join(partialsDir, name);
  return fs.readFileSync(filePath, 'utf8').trim();
}

const headerPartial = loadPartial('header.html');
const footerPartial = loadPartial('footer.html');

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

function collectHtmlFiles(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  let files = [];

  entries.forEach((entry) => {
    const fullPath = path.join(currentDir, entry.name);
    const relativePath = path.relative(docsDir, fullPath);
    if (entry.isDirectory()) {
      if (
        relativePath === 'partials' ||
        relativePath.startsWith(`partials${path.sep}`) ||
        relativePath === 'dist' ||
        relativePath.startsWith(`dist${path.sep}`)
      ) {
        return;
      }
      files = files.concat(collectHtmlFiles(fullPath));
      return;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  });

  return files;
}

const htmlFiles = collectHtmlFiles(docsDir);

htmlFiles.forEach((inputPath) => {
  const relativePath = path.relative(docsDir, inputPath);
  const depth = relativePath.split(path.sep).length - 1;
  const prefix = depth > 0 ? '../'.repeat(depth) : '';
  let html = fs.readFileSync(inputPath, 'utf8');

  const headerMatch = html.match(/^(\s*)<!--\s*SLPARTIAL:header\s*-->$/m);
  const footerMatch = html.match(/^(\s*)<!--\s*SLPARTIAL:footer\s*-->$/m);

  if (headerMatch) {
    const indent = headerMatch[1];
    html = html.replace(headerMatch[0], indentLines(headerPartial, indent));
  } else {
    console.warn(`Missing header placeholder in ${relativePath}`);
  }

  if (footerMatch) {
    const indent = footerMatch[1];
    html = html.replace(footerMatch[0], indentLines(footerPartial, indent));
  } else {
    console.warn(`Missing footer placeholder in ${relativePath}`);
  }

  const bodyMatch = html.match(/<body[^>]*data-page="([^"]+)"[^>]*>/i);
  if (bodyMatch) {
    const navKey = navKeyForPage(bodyMatch[1]);
    html = addActiveNav(html, navKey);
  } else {
    console.warn(`Missing data-page attribute in ${relativePath}`);
  }

  html = prefixAssetPaths(html, prefix);
  html = prefixRelativeLinks(html, prefix);

  const outputPath = path.join(distDir, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');
});

function copyDirIfExists(dirName) {
  const sourcePath = path.join(docsDir, dirName);
  if (!fs.existsSync(sourcePath)) {
    return;
  }
  const destinationPath = path.join(distDir, dirName);
  fs.cpSync(sourcePath, destinationPath, { recursive: true });
}

['css', 'js', 'media', 'images', 'fonts'].forEach(copyDirIfExists);

console.log(`Built ${htmlFiles.length} page(s) to ${distDir}`);
