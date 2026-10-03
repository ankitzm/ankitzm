#!/usr/bin/env node
// Renders the README images in /assets as light + dark SVG pairs.
// Static on purpose: edit the JSON files or the copy below, then run
//   node scripts/build.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', f), 'utf8'));
const ICONS = read('icons.json');
const STACK = read('stack.json');
const CAPS = read('capabilities.json');

// ─────────────────────────────── copy

const PROFILE = {
  name: 'Ankit Singh',
  role: 'Full-stack engineer · AI infrastructure, backend systems and product',
  pitch: 'I own features end to end, from UI and APIs to backend services and data, and I measure what I ship.',
  status: 'open to roles · remote / India',
  stats: [
    ['−50%', 'AI ingestion cost', 'Bytebell'],
    ['−60%', 'retrieval latency', 'Bytebell'],
    ['5×', 'faster new-chain integration', 'Router Protocol'],
    ['~1,200', 'daily users on my backend', 'Router Protocol'],
  ],
};

// ─────────────────────────────── tokens

const THEMES = {
  light: { fg: '#1f2328', muted: '#59636e', subtle: '#818b98', border: '#d1d9e0', surface: '#f6f8fa', bg: '#ffffff', accent: '#1a7f37' },
  dark: { fg: '#f0f6fc', muted: '#9198a1', subtle: '#656c76', border: '#3d444d', surface: '#151b23', bg: '#0d1117', accent: '#3fb950' },
};
const SANS = `-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif`;
const MONO = `ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// rough text width, generous on purpose because system fonts differ
const textW = (s, size, mono = false) => [...String(s)].reduce((w, c) => {
  if (mono) return w + size * 0.61;
  if (/[il.,:;'|!·]/.test(c)) return w + size * 0.28;
  if (/[mwMW@]/.test(c)) return w + size * 0.85;
  if (/[A-Z0-9]/.test(c)) return w + size * 0.66;
  if (c === ' ') return w + size * 0.3;
  return w + size * 0.55;
}, 0);
const wrap = (s, maxW, size) => {
  const out = []; let line = '';
  for (const word of s.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (textW(next, size) > maxW && line) { out.push(line); line = word; } else line = next;
  }
  if (line) out.push(line);
  return out;
};

const svg = ({ w, h, label, body, t }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<style>.sans{font-family:${SANS}}.mono{font-family:${MONO}}</style>
${body}
</svg>`;

function icon(key, label, x, y, size, t) {
  if (!key) {
    const m = label.replace(/[^A-Za-z0-9]/g, '').slice(0, 2);
    return `<rect x="${x + .5}" y="${y + .5}" width="${size - 1}" height="${size - 1}" rx="3.5" stroke="${t.fg}" stroke-opacity=".7"/>
<text x="${x + size / 2}" y="${y + size / 2 + 2.8}" text-anchor="middle" class="mono" fill="${t.fg}" font-size="${(size * .5).toFixed(1)}" font-weight="700">${esc(m)}</text>`;
  }
  const ic = ICONS[key];
  const [, , vw, vh] = ic.vb.split(' ').map(Number);
  return `<g transform="translate(${x} ${y}) scale(${(size / Math.max(vw, vh)).toFixed(4)})" fill="${t.fg}">${ic.body}</g>`;
}

function chip(label, key, x, y, t, { h = 28, size = 12.5, ic = 14 } = {}) {
  const w = Math.round(ic + 20 + textW(label, size) + 10);
  return {
    w,
    svg: `<rect x="${x + .5}" y="${y + .5}" width="${w}" height="${h}" rx="7" fill="${t.bg}" stroke="${t.border}"/>
${icon(key, label, x + 10, y + (h - ic) / 2, ic, t)}
<text x="${x + ic + 17}" y="${y + h / 2 + size * .36}" class="sans" fill="${t.fg}" font-size="${size}">${esc(label)}</text>`,
  };
}

// ─────────────────────────────── hero

function hero(t) {
  const W = 880, P = PROFILE;
  let b = '';
  b += `<text x="1" y="16" class="mono" fill="${t.subtle}" font-size="12">~/ankitzm</text>`;
  b += `<text x="0" y="62" class="sans" fill="${t.fg}" font-size="40" font-weight="700" letter-spacing="-.8">${esc(P.name)}</text>`;
  b += `<text x="1" y="94" class="sans" fill="${t.fg}" font-size="17" font-weight="500">${esc(P.role)}</text>`;
  b += `<text x="1" y="120" class="sans" fill="${t.muted}" font-size="14.5">${esc(P.pitch)}</text>`;

  const pw = Math.round(textW(P.status, 11.5, true) + 38);
  b += `<rect x="${W - pw - .5}" y="2.5" width="${pw}" height="26" rx="13" fill="${t.bg}" stroke="${t.border}"/>
<circle cx="${W - pw + 14}" cy="15.5" r="3.5" fill="${t.accent}"/>
<text x="${W - pw + 25}" y="19.5" class="mono" fill="${t.muted}" font-size="11.5">${esc(P.status)}</text>`;

  const gap = 12, sw = (W - gap * 3) / 4, sy = 146, sh = 98;
  P.stats.forEach(([num, what, where], i) => {
    const x = i * (sw + gap);
    b += `<rect x="${x + .5}" y="${sy + .5}" width="${sw - 1}" height="${sh - 1}" rx="12" fill="${t.surface}" stroke="${t.border}"/>
<text x="${x + 18}" y="${sy + 44}" class="sans" fill="${t.fg}" font-size="30" font-weight="700" letter-spacing="-.6">${esc(num)}</text>
<text x="${x + 18}" y="${sy + 68}" class="sans" fill="${t.muted}" font-size="13">${esc(what)}</text>
<text x="${x + 18}" y="${sy + 85}" class="mono" fill="${t.subtle}" font-size="10.5">${esc(where)}</text>`;
  });
  const H = sy + sh + 2;
  return svg({ w: W, h: H, t, body: b, label: `${P.name}. ${P.role}. ${P.pitch} ${P.stats.map((s) => `${s[0]} ${s[1]} (${s[2]})`).join('; ')}.` });
}

// ─────────────────────────────── what I can build

function capabilities(t) {
  const W = 880, gap = 12, tw = (W - gap) / 2, pad = 22, LH = 19, PLH = 16;
  const wrapMono = (str, maxW, size) => {
    const out = []; let line = '';
    for (const part of str.split(' · ')) {
      const next = line ? `${line} · ${part}` : part;
      if (textW(next, size, true) > maxW && line) { out.push(line); line = part; } else line = next;
    }
    if (line) out.push(line);
    return out;
  };
  const tiles = CAPS.map((c) => ({
    c,
    desc: wrap(c.desc, tw - pad * 2, 13.5),
    proof: wrapMono(c.proof, tw - pad * 2 - textW('shipped  ', 11, true), 11),
  }));
  let b = '', y = 0;
  for (let r = 0; r < tiles.length; r += 2) {
    const row = tiles.slice(r, r + 2);
    const nDesc = Math.max(...row.map((T) => T.desc.length));
    const nProof = Math.max(...row.map((T) => T.proof.length));
    const proofY = 74 + nDesc * LH + 8;
    const chipsY = proofY + (nProof - 1) * PLH + 22;
    row.forEach((T) => {
      let x = pad, cy = chipsY; T.chips = [];
      T.c.tools.forEach(([label, key]) => {
        const w = Math.round(14 + 20 + textW(label, 12) + 10);
        if (x + w > tw - pad) { x = pad; cy += 26 + 7; }
        T.chips.push([label, key, x, cy]); x += w + 7;
      });
      T.h = cy + 26 + pad;
    });
    const rowH = Math.max(...row.map((T) => T.h));
    row.forEach((T, col) => {
      const ox = col * (tw + gap), oy = y, n = String(r + col + 1).padStart(2, '0');
      b += `<rect x="${ox + .5}" y="${oy + .5}" width="${tw - 1}" height="${rowH - 1}" rx="14" fill="${t.surface}" stroke="${t.border}"/>`;
      b += `<text x="${ox + pad}" y="${oy + 44}" class="mono" fill="${t.subtle}" font-size="12">${n}</text>`;
      b += `<text x="${ox + pad + 28}" y="${oy + 45}" class="sans" fill="${t.fg}" font-size="18" font-weight="700" letter-spacing="-.2">${esc(T.c.title)}</text>`;
      T.desc.forEach((ln, i) => (b += `<text x="${ox + pad}" y="${oy + 74 + i * LH}" class="sans" fill="${t.muted}" font-size="13.5">${esc(ln)}</text>`));
      const px = ox + pad + textW('shipped  ', 11, true);
      b += `<text x="${ox + pad}" y="${oy + proofY}" class="mono" fill="${t.accent}" font-size="11">shipped</text>`;
      T.proof.forEach((ln, i) => (b += `<text x="${px}" y="${oy + proofY + i * PLH}" class="mono" fill="${t.subtle}" font-size="11">${esc(ln)}</text>`));
      T.chips.forEach(([label, key, cx, cy]) => (b += chip(label, key, ox + cx, oy + cy, t, { h: 26, size: 12, ic: 14 }).svg));
    });
    y += rowH + gap;
  }
  const H = y - gap;
  return svg({ w: W, h: H, t, body: b, label: `What I can build. ${CAPS.map((c, i) => `${i + 1}. ${c.title}: ${c.desc} Shipped: ${c.proof}. Tools: ${c.tools.map((x) => x[0]).join(', ')}.`).join(' ')}` });
}

// ─────────────────────────────── full stack

function stack(t) {
  const W = 880, LX = 132, CH = 30, GAP = 8, RG = 9, GG = 16;
  let y = 4, b = '';
  STACK.forEach((g, gi) => {
    let x = LX;
    if (gi > 0) b += `<line x1="0" x2="${W}" y1="${y - GG / 2 - 1}" y2="${y - GG / 2 - 1}" stroke="${t.border}" stroke-opacity=".6"/>`;
    b += `<text x="1" y="${y + 19}" class="mono" fill="${t.subtle}" font-size="10.5" letter-spacing="1">${esc(g.group.toUpperCase())}</text>`;
    g.items.forEach((it) => {
      const w = Math.round(14 + 20 + textW(it.label, 12.5) + 10);
      if (x + w > W) { x = LX; y += CH + RG; }
      b += chip(it.label, it.icon, x, y, t, { h: CH, size: 12.5, ic: 15 }).svg;
      x += w + GAP;
    });
    y += CH + GG + 2;
  });
  return svg({ w: W, h: y - GG, t, body: b, label: `Full stack. ${STACK.map((g) => `${g.group}: ${g.items.map((i) => i.label).join(', ')}`).join('. ')}.` });
}

// ─────────────────────────────── build

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.svg')) fs.unlinkSync(path.join(OUT, f));
for (const [name, t] of Object.entries(THEMES)) {
  fs.writeFileSync(path.join(OUT, `hero-${name}.svg`), hero(t));
  fs.writeFileSync(path.join(OUT, `capabilities-${name}.svg`), capabilities(t));
  fs.writeFileSync(path.join(OUT, `stack-${name}.svg`), stack(t));
}
console.log('6 files → assets/');
