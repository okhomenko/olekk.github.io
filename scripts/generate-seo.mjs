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
    } else if (entry.isFile() && entry.name === 'index.html') {
      files.push(fullPath);
    }
  }

  return files;
}

function toUrl(filePath) {
  const relative = path.relative(OUTPUT_DIR, filePath).replaceAll(path.sep, '/');
  const dir = path.dirname(relative);
  const route = dir === '.' ? '/' : `/${dir}/`;
  return `${SITE_URL}${route}`;
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
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (match?.[1]) return match[1].trim();
  return fallbackUrl.replace(SITE_URL, '') || '/';
}

function extractDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  return match?.[1]?.trim() || SITE_DESCRIPTION;
}

async function buildPages() {
  const htmlFiles = await walk(OUTPUT_DIR);
  const pages = [];

  for (const filePath of htmlFiles) {
    const html = await fs.readFile(filePath, 'utf8');
    const url = toUrl(filePath);

    pages.push({
      url,
      title: extractTitle(html, url),
      description: extractDescription(html),
      lastmod: TODAY,
    });
  }

  return pages.sort((a, b) => a.url.localeCompare(b.url));
}

function buildSitemap(pages) {
  const urls = pages.map(page => `  <url>\n    <loc>${escapeXml(page.url)}</loc>\n    <lastmod>${page.lastmod}</lastmod>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildFeed(pages) {
  const updated = `${TODAY}T00:00:00Z`;
  const entries = pages.map(page => `  <entry>\n    <title>${escapeXml(page.title)}</title>\n    <link href="${escapeXml(page.url)}"/>\n    <id>${escapeXml(page.url)}</id>\n    <updated>${page.lastmod}T00:00:00Z</updated>\n    <summary>${escapeXml(page.description)}</summary>\n  </entry>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>${escapeXml(SITE_TITLE)}</title>\n  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>\n  <link href="${SITE_URL}/feed.xml" rel="self"/>\n  <link href="${SITE_URL}/"/>\n  <id>${SITE_URL}/</id>\n  <updated>${updated}</updated>\n${entries}\n</feed>\n`;
}

function buildLlms(pages) {
  const links = pages.map(page => `- [${page.title}](${page.url}): ${page.description}`).join('\n');
  return `# ${SITE_TITLE}\n\n${SITE_DESCRIPTION}\n\n## Pages\n\n${links}\n`;
}

function validatePages(pages) {
  if (pages.length === 0) {
    throw new Error(`No index.html pages found in ${OUTPUT_DIR}. Run Eleventy before generating SEO artifacts.`);
  }

  const urls = new Set();
  for (const page of pages) {
    if (urls.has(page.url)) throw new Error(`Duplicate URL: ${page.url}`);
    urls.add(page.url);
    if (!page.title || page.title.length < 3) throw new Error(`Missing or weak title: ${page.url}`);
    if (!page.description || page.description.length < 20) throw new Error(`Missing or weak description: ${page.url}`);
  }
}

await fs.access(OUTPUT_DIR);
const pages = await buildPages();
validatePages(pages);

await fs.writeFile(path.join(OUTPUT_DIR, 'sitemap.xml'), buildSitemap(pages));
await fs.writeFile(path.join(OUTPUT_DIR, 'feed.xml'), buildFeed(pages));
await fs.writeFile(path.join(OUTPUT_DIR, 'llms.txt'), buildLlms(pages));

console.log(`Generated SEO files in ${OUTPUT_DIR} for ${pages.length} pages.`);
