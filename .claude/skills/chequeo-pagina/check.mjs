#!/usr/bin/env node
// chequeo-pagina — la parte objetiva del checklist de DESIGN.md §11,
// medida en un navegador real (Playwright + Chromium) contra el repo local.
//
//   node .claude/skills/chequeo-pagina/check.mjs index.html soporte.html
//   node .claude/skills/chequeo-pagina/check.mjs blog/backup-pymes/
//   node .claude/skills/chequeo-pagina/check.mjs --raiz          (todas las públicas de nivel raíz)
//   opciones: --json  --offline (corta todo pedido externo)
//
// Sale con código 1 si alguna página tiene un ✖. Los ⚠ informan, no fallan.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const JSON_OUT = flag('--json');
const OFFLINE = flag('--offline');
const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };

// ------------------------------------------------------------ qué revisar
const PRIVADAS = /^(admin.*|cliente.*|login|404|googlebd53b05077bd0f90|pronto)\.html$/;
let paginas = args.filter((a) => !a.startsWith('--'));
if (flag('--raiz')) {
  paginas.push(...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !PRIVADAS.test(f)));
}
paginas = [...new Set(paginas.map(normalizar))];
if (!paginas.length) {
  console.error('Uso: check.mjs <ruta.html | carpeta/> [...] [--raiz] [--json] [--offline]');
  process.exit(2);
}

function normalizar(p) {
  let r = p.replace(/\\/g, '/').replace(/^\.?\//, '');
  if (path.isAbsolute(p)) r = path.relative(ROOT, p).split(path.sep).join('/');
  const abs = path.join(ROOT, r);
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) r = r.replace(/\/?$/, '/index.html');
  return r;
}

// ------------------------------------------------------- servidor estático
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.xml': 'application/xml', '.txt': 'text/plain',
  '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4',
};
function resolver(urlPath) {
  const limpio = decodeURIComponent(urlPath.split('?')[0]);
  const abs = path.join(ROOT, limpio);
  if (!abs.startsWith(ROOT)) return null;
  const candidatos = [abs, path.join(abs, 'index.html'), abs + '.html'];
  return candidatos.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}
const server = http.createServer((req, res) => {
  const file = resolver(req.url);
  if (!file) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}`;

// ------------------------------------------------------------ chequeos
// El Chromium de Playwright (`npx playwright install chromium`) si está; si no,
// el Chrome o el Edge del sistema. Evita bajar 150 MB para un chequeo.
async function lanzar() {
  const errores = [];
  for (const opts of [{}, { channel: 'chrome' }, { channel: 'msedge' }]) {
    try { return await chromium.launch(opts); } catch (e) { errores.push(e.message.split('\n')[0]); }
  }
  console.error('No hay navegador para Playwright. Correr: npx playwright install chromium\n' + errores.join('\n'));
  process.exit(2);
}
const browser = await lanzar();
const resultados = [];
for (const pagina of paginas) resultados.push(await revisar(pagina));
await browser.close();
server.close();

async function revisar(pagina) {
  const r = { pagina, fallas: [], avisos: [], ok: [] };
  const abs = path.join(ROOT, pagina);
  if (!fs.existsSync(abs)) { r.fallas.push('el archivo no existe'); return r; }
  const fuente = fs.readFileSync(abs, 'utf8');

  // Regla 1: <style> en el HTML fuente (no el que inyecta un script)
  const styles = (fuente.match(/<style[\s>]/gi) || []).length;
  (styles ? r.fallas : r.ok).push(styles ? `${styles} bloque(s) <style> en el HTML (CLAUDE.md regla 1)` : 'sin <style>');

  const ctx = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const consola = [];
  const rotosLocales = new Set();
  const rotosExternos = new Set();
  page.on('console', (m) => { if (m.type() === 'error') consola.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => consola.push(`excepción: ${String(e.message).slice(0, 200)}`));
  page.on('response', (res) => {
    if (res.status() < 400) return;
    (res.url().startsWith(BASE) ? rotosLocales : rotosExternos).add(`${res.status()} ${res.url().replace(BASE, '')}`);
  });
  page.on('requestfailed', (req) => {
    if (OFFLINE && !req.url().startsWith(BASE)) return;
    (req.url().startsWith(BASE) ? rotosLocales : rotosExternos).add(`falló ${req.url().replace(BASE, '')}`);
  });
  if (OFFLINE) await page.route((u) => !u.href.startsWith(BASE), (route) => route.abort());

  try {
    await page.goto(`${BASE}/${pagina}`, { waitUntil: 'load', timeout: 30000 });
  } catch (e) {
    r.fallas.push(`no cargó: ${e.message.split('\n')[0]}`);
    await ctx.close();
    return r;
  }
  await page.waitForTimeout(1500); // scripts diferidos, chat, reveals

  const d = await page.evaluate(analizarDom);

  // Metadatos (§11)
  const faltan = [];
  if (!d.meta.title) faltan.push('<title>');
  if (!d.meta.description) faltan.push('meta description');
  if (!d.meta.icon) faltan.push('favicon');
  if (!d.meta.lang) faltan.push('<html lang>');
  if (!d.meta.noindex) {
    for (const k of ['og:title', 'og:description', 'og:image']) if (!d.meta[k]) faltan.push(k);
    if (!d.meta.canonical) r.avisos.push('sin <link rel="canonical">');
  }
  (faltan.length ? r.fallas : r.ok).push(faltan.length ? `falta: ${faltan.join(', ')}` : `metadatos completos${d.meta.noindex ? ' (noindex: og no exigido)' : ''}`);

  // Títulos (CLAUDE.md regla 4)
  const h1 = d.headings.filter((h) => h.level === 1).length;
  if (h1 !== 1) r.fallas.push(`${h1} <h1> (debe haber exactamente 1)`);
  const saltos = [];
  let previo = 0;
  for (const h of d.headings) {
    if (previo && h.level > previo + 1) saltos.push(`h${previo}→h${h.level} «${h.text}»`);
    previo = h.level;
  }
  if (saltos.length) r.fallas.push(`saltos de jerarquía: ${saltos.slice(0, 5).join('; ')}${saltos.length > 5 ? ` (+${saltos.length - 5})` : ''}`);
  if (h1 === 1 && !saltos.length) r.ok.push(`un <h1>, jerarquía sin saltos (${d.headings.length} títulos)`);

  // Imágenes (§11)
  const imgMal = d.imgs.filter((i) => !i.hasAlt || !i.width || !i.height);
  if (imgMal.length) {
    r.fallas.push(`${imgMal.length} <img> sin alt/width/height: ` +
      imgMal.slice(0, 5).map((i) => `${i.src} [${[!i.hasAlt && 'alt', !i.width && 'width', !i.height && 'height'].filter(Boolean).join(',')}]`).join('; '));
  } else if (d.imgs.length) r.ok.push(`${d.imgs.length} <img> con alt, width y height`);
  const sinLazy = d.imgs.filter((i) => !i.enPrimeraPantalla && i.loading !== 'lazy');
  if (sinLazy.length) r.avisos.push(`${sinLazy.length} <img> fuera de la primera pantalla sin loading="lazy": ${sinLazy.slice(0, 3).map((i) => i.src).join('; ')}`);
  const lazyArriba = d.imgs.filter((i) => i.enPrimeraPantalla && i.loading === 'lazy');
  if (lazyArriba.length) r.avisos.push(`${lazyArriba.length} <img> en la primera pantalla con loading="lazy" (retrasa el LCP): ${lazyArriba.map((i) => i.src).join('; ')}`);

  // Desborde horizontal (§9, §10 #14) a 390 y a 1280
  if (d.overflowOculto.length) r.fallas.push(`overflow-x: hidden/clip en ${d.overflowOculto.join(' y ')}: oculta el desborde en vez de arreglarlo (§9)`);
  const desborde390 = await page.evaluate(medirDesborde);
  await page.setViewportSize(DESKTOP);
  await page.waitForTimeout(300);
  const desborde1280 = await page.evaluate(medirDesborde);
  for (const [ancho, info] of [[390, desborde390], [1280, desborde1280]]) {
    if (info.scroll || info.culpables.length) {
      r.fallas.push(`desborde horizontal a ${ancho}px${info.scroll ? ` (scrollWidth ${info.scrollWidth})` : ' (tapado por overflow oculto)'}: ` +
        (info.culpables.slice(0, 5).join('; ') || 'culpable no identificado'));
    } else r.ok.push(`sin scroll horizontal a ${ancho}px`);
  }

  // Emoji como icono (§6). El chatbot es excepción documentada.
  if (d.emojiIconos.length) r.fallas.push(`${d.emojiIconos.length} emoji usado(s) como icono (§6): ${d.emojiIconos.slice(0, 5).join('; ')}`);
  else r.ok.push('sin emoji como icono');

  // Área táctil (§9): aviso, porque los enlaces dentro de texto corrido no aplican
  if (d.tactiles.length) r.avisos.push(`${d.tactiles.length} control(es) con área táctil < 44×44 a 390px: ${d.tactiles.slice(0, 6).join('; ')}`);

  // Consola y recursos
  if (consola.length) r.fallas.push(`${consola.length} error(es) de consola: ${[...new Set(consola)].slice(0, 4).join(' | ')}`);
  else r.ok.push('consola sin errores');
  if (rotosLocales.size) r.fallas.push(`recursos locales rotos: ${[...rotosLocales].slice(0, 6).join('; ')}`);
  if (rotosExternos.size) r.avisos.push(`recursos externos que fallaron: ${[...rotosExternos].slice(0, 4).join('; ')}`);

  await ctx.close();
  return r;
}

// ---------------------------------------------- código que corre en la página
function medirDesborde() {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  const recorta = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox !== 'visible') return true;
    }
    return false;
  };
  const describir = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += `#${el.id}`;
    const cls = [...el.classList].slice(0, 2);
    if (cls.length) s += `.${cls.join('.')}`;
    return `${s} (hasta ${Math.round(el.getBoundingClientRect().right)}px)`;
  };
  const culpables = [];
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.right <= vw + 1) continue;
    if (recorta(el)) continue;
    // el más externo: si el padre también desborda, se reporta el padre
    const padre = el.parentElement;
    if (padre && padre !== document.body && padre.getBoundingClientRect().right > vw + 1 && !recorta(padre)) continue;
    culpables.push(describir(el));
  }
  return { scroll: sw > vw + 1, scrollWidth: sw, culpables };
}

function analizarDom() {
  const q = (s) => document.querySelector(s);
  const metaC = (sel) => q(sel)?.getAttribute('content')?.trim() || '';
  const robots = metaC('meta[name="robots"]').toLowerCase();
  const meta = {
    title: document.title.trim(),
    description: metaC('meta[name="description"]'),
    'og:title': metaC('meta[property="og:title"]'),
    'og:description': metaC('meta[property="og:description"]'),
    'og:image': metaC('meta[property="og:image"]'),
    icon: !!q('link[rel~="icon"]'),
    canonical: !!q('link[rel="canonical"]'),
    lang: document.documentElement.lang,
    noindex: robots.includes('noindex'),
  };

  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
    level: +h.tagName[1], text: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 50),
  }));

  const vh = window.innerHeight;
  const imgs = [...document.querySelectorAll('img')].map((i) => ({
    src: (i.getAttribute('src') || i.currentSrc || '').split('/').pop().slice(0, 60) || '(sin src)',
    hasAlt: i.hasAttribute('alt'),
    width: i.getAttribute('width'),
    height: i.getAttribute('height'),
    loading: i.getAttribute('loading'),
    enPrimeraPantalla: i.getBoundingClientRect().top < vh,
  }));

  const overflowOculto = ['html', 'body'].filter((t) => {
    const ox = getComputedStyle(document.querySelector(t)).overflowX;
    return ox === 'hidden' || ox === 'clip';
  });

  // Emoji como icono: texto propio de un elemento de icono/chip/badge, o un
  // elemento cuyo único contenido es emoji. Se excluye el chatbot (§6).
  const EMOJI = /\p{Extended_Pictographic}/u;
  const SOLO_EMOJI = /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|‍|️|\s)+$/u;
  const CHAT = '.chatbot-container, [class*="chatbot"], [id*="chatbot"], #cyclops-chat, .woot-widget-holder, .woot--bubble-holder';
  const textoPropio = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const emojiIconos = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (el.closest(CHAT)) continue;
    const t = textoPropio(el);
    if (!t || !EMOJI.test(t)) continue;
    const esIcono = /icon|chip|badge|pill|tag|feature/i.test(el.className?.toString?.() || '') || el.tagName === 'I';
    if (esIcono || (SOLO_EMOJI.test(t) && el.children.length === 0)) {
      emojiIconos.push(`${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''} «${t.slice(0, 12)}»`);
    }
  }

  const tactiles = [];
  for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role="button"]')) {
    if (el.closest(CHAT)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'inline' || cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (r.width < 44 || r.height < 44) {
      const nombre = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('href') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 24);
      tactiles.push(`«${nombre}» ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
  }

  return { meta, headings, imgs, overflowOculto, emojiIconos, tactiles };
}

// ------------------------------------------------------------- informe
if (JSON_OUT) {
  console.log(JSON.stringify(resultados, null, 2));
} else {
  for (const r of resultados) {
    console.log(`\n━━ ${r.pagina}  ${r.fallas.length ? `✖ ${r.fallas.length} falla(s)` : '✔ pasa'}${r.avisos.length ? ` · ⚠ ${r.avisos.length} aviso(s)` : ''}`);
    for (const f of r.fallas) console.log(`  ✖ ${f}`);
    for (const a of r.avisos) console.log(`  ⚠ ${a}`);
    for (const o of r.ok) console.log(`  ✔ ${o}`);
  }
  const malas = resultados.filter((r) => r.fallas.length).length;
  console.log(`\n${resultados.length} página(s): ${resultados.length - malas} pasan, ${malas} con fallas.`);
  console.log('Queda manual: navegación sólo con teclado, texto al 200 %, recorrido de contacto/WhatsApp/login.');
}
process.exit(resultados.some((r) => r.fallas.length) ? 1 : 0);
