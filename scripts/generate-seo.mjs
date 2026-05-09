import { promises as fs } from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://olekk.com';
const SITE_TITLE = 'Oleksandr Khomenko';
const SITE_DESCRIPTION = 'Essays on software engineering, AI-enabled development, product architecture, systems thinking, and endurance running.';
const ROOT = process.cwd();

const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'scripts']);

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;

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
  const relative = path.relative(ROOT, filePath).replaceAll(path.sep, '/');
  const dir = path.dirname(relative);
  const route = dir === '.' ? '/' : `/${dir}/`;
  return `${SITE_URL}${route}`;
}

function escapeXml(value) {
  return value
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
  const htmlFiles = await walk(ROOT);
  const pages = [];

  for (const filePath of htmlFiles) {
    const html = await fs.readFile(filePath, 'utf8');
    const stat = await fs.stat(filePath);
    const url = toUrl(filePath);

    pages.push({
      url,
      title: extractTitle(html, url),
      description: extractDescription(html),
      lastmod: stat.mtime.toISOString().slice(0, 10),
    });
  }

  return pages.sort((a, b) => a.url.localeCompare(b.url));
}

function buildSitemap(pages) {
  const urls = pages.map(page => `  <url>\n    <loc>${escapeXml(page.url)}</loc>\n    <lastmod>${page.lastmod}</lastmod>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildFeed(pages) {
  const updated = new Date().toISOString();
  const entries = pages.map(page => `  <entry>\n    <title>${escapeXml(page.title)}</title>\n    <link href="${escapeXml(page.url)}"/>\n    <id>${escapeXml(page.url)}</id>\n    <updated>${page.lastmod}T00:00:00Z</updated>\n    <summary>${escapeXml(page.description)}</summary>\n  </entry>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>${escapeXml(SITE_TITLE)}</title>\n  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>\n  <link href="${SITE_URL}/feed.xml" rel="self"/>\n  <link href="${SITE_URL}/"/>\n  <id>${SITE_URL}/</id>\n  <updated>${updated}</updated>\n${entries}\n</feed>\n`;
}

function buildLlms(pages) {
  const links = pages.map(page => `- [${page.title}](${page.url}): ${page.description}`).join('\n');
  return `# ${SITE_TITLE}\n\n${SITE_DESCRIPTION}\n\n## Pages\n\n${links}\n`;
}

const pages = await buildPages();

if (pages.length === 0) {
  console.warn('No index.html pages found. SEO files were generated with no page entries.');
}

await fs.writeFile(path.join(ROOT, 'sitemap.xml'), buildSitemap(pages));
await fs.writeFile(path.join(ROOT, 'feed.xml'), buildFeed(pages));
await fs.writeFile(path.join(ROOT, 'llms.txt'), buildLlms(pages));

console.log(`Generated SEO files for ${pages.length} pages.`);
