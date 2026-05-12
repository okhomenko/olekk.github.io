import { promises as fs } from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://olekk.com';
const SITE_TITLE = 'Oleksandr Khomenko';
const SITE_DESCRIPTION = 'Essays on software engineering, AI-enabled development, product architecture, systems thinking, and endurance running.';
const OUTPUT_DIR = path.resolve(process.cwd(), process.argv[2] || '_site');
const TODAY = new Date().toISOString().slice(0, 10);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

function toUrl(filePath) {
  const relative = path.relative(OUTPUT_DIR, filePath).replaceAll(path.sep, '/');
  if (relative === 'index.html') return `${SITE_URL}/`;
  if (relative.endsWith('/index.html')) {
    throw new Error(`Directory-style HTML page found: ${relative}`);
  }
  return `${SITE_URL}/${relative}`;
}

function titleFromUrl(url) {
  const pathName = new URL(url).pathname;
  if (pathName === '/') return SITE_TITLE;
  const segment = (pathName.split('/').filter(Boolean).at(-1) || SITE_TITLE).replace(/\.html$/, '');
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function attrValue(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}=["']([^"']+)["']`, 'i'));
  return match?.[1]?.trim() || '';
}

function extractMetaContent(html, attributeName, attributeValue) {
  const tags = html.match(/<meta\s+[^>]*>/gi) || [];
  for (const tag of tags) {
    if (attrValue(tag, attributeName).toLowerCase() === attributeValue.toLowerCase()) {
      return attrValue(tag, 'content');
    }
  }
  return '';
}

function extractLinkHref(html, relValue) {
  const tags = html.match(/<link\s+[^>]*>/gi) || [];
  for (const tag of tags) {
    const rels = attrValue(tag, 'rel').toLowerCase().split(/\s+/);
    if (rels.includes(relValue.toLowerCase())) {
      return attrValue(tag, 'href');
    }
  }
  return '';
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function extractTitle(html, fallbackUrl) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = match?.[1]?.trim();
  if (title && title.length >= 3) {
    return title.endsWith(` | ${SITE_TITLE}`)
      ? title.slice(0, -` | ${SITE_TITLE}`.length)
      : title;
  }
  return titleFromUrl(fallbackUrl);
}

function extractDescription(html) {
  return extractMetaContent(html, 'name', 'description') || SITE_DESCRIPTION;
}

function normalizeDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function extractPublishedDate(html) {
  return normalizeDate(extractMetaContent(html, 'property', 'article:published_time'));
}

function extractLastmod(html) {
  return normalizeDate(extractMetaContent(html, 'property', 'article:modified_time'))
    || extractPublishedDate(html)
    || TODAY;
}

function isArticle(html) {
  return extractMetaContent(html, 'property', 'og:type').toLowerCase() === 'article'
    || /"@type"\s*:\s*"BlogPosting"/.test(html);
}

function isNoindex(html) {
  return extractMetaContent(html, 'name', 'robots').toLowerCase().split(/\s*,\s*/).includes('noindex');
}

async function buildPages() {
  const htmlFiles = await walk(OUTPUT_DIR);
  const pages = [];

  for (const filePath of htmlFiles) {
    const html = await fs.readFile(filePath, 'utf8');
    const url = toUrl(filePath);
    if (isNoindex(html)) continue;

    pages.push({
      url,
      title: extractTitle(html, url),
      description: extractDescription(html),
      canonical: extractLinkHref(html, 'canonical'),
      isArticle: isArticle(html),
      published: extractPublishedDate(html),
      lastmod: extractLastmod(html),
    });
  }

  return pages.sort((a, b) => a.url.localeCompare(b.url));
}

function buildSitemap(pages) {
  const urls = pages.map(page => `  <url>\n    <loc>${escapeXml(page.url)}</loc>\n    <lastmod>${page.lastmod}</lastmod>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildFeed(pages) {
  const articles = pages
    .filter(page => page.isArticle)
    .sort((a, b) => b.lastmod.localeCompare(a.lastmod) || a.title.localeCompare(b.title));
  const updated = `${articles[0]?.lastmod || TODAY}T00:00:00Z`;
  const entries = articles.map(page => `  <entry>\n    <title>${escapeXml(page.title)}</title>\n    <link href="${escapeXml(page.url)}"/>\n    <id>${escapeXml(page.url)}</id>\n    <published>${page.published || page.lastmod}T00:00:00Z</published>\n    <updated>${page.lastmod}T00:00:00Z</updated>\n    <summary>${escapeXml(page.description)}</summary>\n  </entry>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>${escapeXml(SITE_TITLE)}</title>\n  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>\n  <link href="${SITE_URL}/feed.xml" rel="self"/>\n  <link href="${SITE_URL}/"/>\n  <id>${SITE_URL}/</id>\n  <updated>${updated}</updated>\n${entries}\n</feed>\n`;
}

function buildLlms(pages) {
  const links = pages.map(page => `- [${page.title}](${page.url}): ${page.description}`).join('\n');
  return `# ${SITE_TITLE}\n\n${SITE_DESCRIPTION}\n\n## Pages\n\n${links}\n`;
}

function validatePages(pages) {
  if (pages.length === 0) {
    throw new Error(`No HTML pages found in ${OUTPUT_DIR}. Run Eleventy before generating SEO artifacts.`);
  }

  const urls = new Set();
  const titles = new Set();
  for (const page of pages) {
    if (urls.has(page.url)) throw new Error(`Duplicate URL: ${page.url}`);
    urls.add(page.url);
    if (titles.has(page.title)) throw new Error(`Duplicate title: ${page.title}`);
    titles.add(page.title);
    const pathName = new URL(page.url).pathname;
    if (pathName !== '/' && !pathName.endsWith('.html')) {
      throw new Error(`Non-.html page URL: ${page.url}`);
    }
    if (pathName !== '/' && pathName.endsWith('/')) {
      throw new Error(`Directory-style page URL: ${page.url}`);
    }
    if (!page.canonical) throw new Error(`Missing canonical URL: ${page.url}`);
    if (page.canonical !== page.url) throw new Error(`Canonical URL mismatch for ${page.url}: ${page.canonical}`);
    if (!page.title || page.title.length < 2) throw new Error(`Missing or weak title: ${page.url}`);
    if (!page.description || page.description.length < 20) throw new Error(`Missing or weak description: ${page.url}`);
    if (page.isArticle && !page.published) throw new Error(`Article missing publication date: ${page.url}`);
  }
}

await fs.access(OUTPUT_DIR);
const pages = await buildPages();
validatePages(pages);

await fs.writeFile(path.join(OUTPUT_DIR, 'sitemap.xml'), buildSitemap(pages));
await fs.writeFile(path.join(OUTPUT_DIR, 'feed.xml'), buildFeed(pages));
await fs.writeFile(path.join(OUTPUT_DIR, 'llms.txt'), buildLlms(pages));

console.log(`Generated SEO files in ${OUTPUT_DIR} for ${pages.length} pages.`);
