import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'src', 'posts');
const OUTPUT_DIR = path.join(ROOT, 'src', 'og', 'posts');
const PROFILE_PHOTO = path.join(ROOT, 'src', 'profile-photo.png');

const WIDTH = 1200;
const HEIGHT = 630;

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function parseScalar(raw) {
  const value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseFrontmatter(markdown, filePath) {
  const lines = markdown.split(/\r?\n/);
  if (lines[0] !== '---') {
    throw new Error(`Missing frontmatter: ${filePath}`);
  }

  const data = {};
  let key = '';

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === '---') return data;

    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && key) {
      data[key] = Array.isArray(data[key]) ? data[key] : [];
      data[key].push(parseScalar(listItem[1]));
      continue;
    }

    const scalar = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s+(.*))?$/);
    if (!scalar) continue;

    key = scalar[1];
    data[key] = scalar[2] === undefined ? [] : parseScalar(scalar[2]);
  }

  throw new Error(`Unclosed frontmatter: ${filePath}`);
}

function fileSlug(filePath) {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function sectionLabel(data) {
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const section = tags.find((tag) => tag !== 'posts');
  if (section) return section.toUpperCase();

  return String(data.tagsText || 'POST')
    .split(',')
    .at(0)
    .trim()
    .toUpperCase();
}

function readableDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function wrapText(text, maxCharacters, maxLines) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharacters) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length === maxLines) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (lines.length > maxLines) {
    lines.length = maxLines;
  }

  if (words.join(' ').length > lines.join(' ').length && lines.length > 0) {
    const last = lines.length - 1;
    lines[last] = `${lines[last].replace(/[.,;:!?]?$/, '')}...`;
  }

  return lines;
}

function textBlock(lines, x, firstBaseline, fontSize, lineHeight, color, family, weight = 400) {
  const tspans = lines.map((line, index) => {
    const y = firstBaseline + index * lineHeight;
    return `<tspan x="${x}" y="${y}">${escapeXml(line)}</tspan>`;
  });

  return `<text font-family="${family}" font-size="${fontSize}" font-weight="${weight}" fill="${color}">${tspans.join('')}</text>`;
}

function cardSvg(data, slug, profilePhotoBase64) {
  const title = data.ogTitle || data.title;
  const deck = data.ogDeck || data.description;
  const titleLength = String(title || '').length;
  const titleFont = titleLength > 72 ? 52 : titleLength > 48 ? 58 : 68;
  const titleLineHeight = titleFont + 10;
  const titleMaxCharacters = titleFont >= 68 ? 27 : titleFont >= 58 ? 32 : 36;
  const titleLines = wrapText(title, titleMaxCharacters, 3);
  const deckLines = wrapText(deck, 58, 2);
  const deckY = 292 + titleLines.length * titleLineHeight + 34;
  const date = readableDate(data.date);
  const label = [sectionLabel(data), date].filter(Boolean).join(' / ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <clipPath id="avatarClip">
      <circle cx="1036" cy="150" r="72" />
    </clipPath>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#fbfbfa" />
  <rect x="40" y="40" width="1120" height="550" fill="#fbfbfa" stroke="#d8d8d4" stroke-width="2" />

  <text x="88" y="118" font-family="Georgia, DejaVu Serif, serif" font-size="52" font-weight="700">
    <tspan fill="#d21d24">O</tspan><tspan fill="#18191b">K</tspan>
  </text>
  <text x="190" y="112" fill="#555555" font-size="26" font-family="Arial, DejaVu Sans, sans-serif">
    olekk.com
  </text>
  <image href="data:image/png;base64,${profilePhotoBase64}" x="964" y="78" width="144" height="144" clip-path="url(#avatarClip)" />
  <circle cx="1036" cy="150" r="73" fill="none" stroke="#d8d8d4" stroke-width="2" />

  <line x1="80" y1="168" x2="850" y2="168" stroke="#111111" stroke-width="3" />
  <text x="80" y="220" fill="#555555" font-size="24" font-family="Arial, DejaVu Sans, sans-serif">
    ${escapeXml(label)}
  </text>

  ${textBlock(titleLines, 80, 292, titleFont, titleLineHeight, '#111111', 'Georgia, DejaVu Serif, serif', 700)}
  ${textBlock(deckLines, 80, deckY, 29, 39, '#333333', 'Arial, DejaVu Sans, sans-serif')}

  <text x="80" y="560" fill="#666666" font-size="21" font-family="Arial, DejaVu Sans, sans-serif">
    Oleksandr Khomenko / olekk.com / ${escapeXml(slug)}
  </text>
</svg>`;
}

async function writeIfChanged(filePath, contents) {
  const previous = await fs.readFile(filePath).catch(() => null);
  if (previous && Buffer.compare(previous, contents) === 0) return false;
  await fs.writeFile(filePath, contents);
  return true;
}

await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
await fs.mkdir(OUTPUT_DIR, { recursive: true });

const profilePhotoBase64 = await fs.readFile(PROFILE_PHOTO, 'base64');
const files = (await fs.readdir(POSTS_DIR))
  .filter((file) => file.endsWith('.md'))
  .sort();

let generated = 0;

for (const file of files) {
  const filePath = path.join(POSTS_DIR, file);
  const markdown = await fs.readFile(filePath, 'utf8');
  const data = parseFrontmatter(markdown, filePath);
  const slug = fileSlug(filePath);
  const svg = cardSvg(data, slug, profilePhotoBase64);
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: WIDTH,
    },
  });
  const png = resvg.render().asPng();
  const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);

  await writeIfChanged(outputPath, png);
  generated += 1;
}

console.log(`Generated ${generated} Open Graph images in ${path.relative(ROOT, OUTPUT_DIR)}.`);
