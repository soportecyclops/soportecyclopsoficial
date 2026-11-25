#!/usr/bin/env node
// Guardián de reglas duras — hook PreToolUse (Edit | Write | MultiEdit).
//
// Hace cumplir las reglas 1, 2 y 6 de CLAUDE.md y la lista §10 de DESIGN.md
// en el momento de escribir, en vez de confiar en que el modelo las recuerde.
//
// Criterio: compara ANTES contra DESPUÉS y bloquea sólo si el cambio SUMA
// violaciones. Hay mucha deuda heredada (364 bloques <style>, literales en
// herramientas/base.css): editar un archivo viejo sin empeorarlo se permite.
//
// Salida: JSON de PreToolUse con permissionDecision "deny" o "ask". El motivo
// le llega a Claude, que corrige y reintenta. Cualquier error interno deja
// pasar la edición (exit 0 sin salida): un guardián roto no puede trabar el repo.

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------- archivos
const DENY_FILES = [
  [/^js\/vendor\//, 'js/vendor/ es generado con esbuild desde node_modules/motion: se regenera, no se edita (DESIGN.md §13).'],
  [/(^|\/)package-lock\.json$/, 'package-lock.json lo escribe npm: usar `npm install`, no editarlo a mano.'],
];
const ASK_FILES = [
  [/\.gs$/, 'Los .gs (Apps Script) se mantienen en el editor de Google. Editar la copia del repo no actualiza nada en producción: confirmá que es lo que querés.'],
];

// CSS donde rige "nada de valores literales". demos/ queda afuera: cada demo
// tiene su propio sistema de tokens (DESIGN.md §14).
const isTokenFile = (rel) => rel === 'css/tokens.css';
const isGovernedCss = (rel) =>
  /\.css$/.test(rel) && !isTokenFile(rel) && /^(css|herramientas)\//.test(rel);
const isSiteHtml = (rel) => /\.html?$/.test(rel) && !/^demos\//.test(rel);

// ------------------------------------------------------------------ reglas
// Cada regla devuelve la cantidad de ocurrencias en un texto.
const count = (re) => (s) => (s.match(re) || []).length;

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Sólo declaraciones: se borra todo preludio hasta '{' (selectores y @media),
// así un `#navMenu` no cuenta como color y un fragmento de Edit sin llaves
// (`padding: 14px;`) sí se revisa.
const declarations = (css) => stripComments(css).replace(/[^{};]*\{/g, '{');

// Atributos style="…" de un HTML.
const inlineStyles = (html) =>
  [...html.matchAll(/\sstyle\s*=\s*("([^"]*)"|'([^']*)')/gi)]
    .map((m) => m[2] ?? m[3] ?? '')
    .join(';\n');

const HEX = /(?<![\w-])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})(?![\w-])/gi;
const COLOR_FN = /\b(?:rgba?|hsla?)\s*\(/gi;
// px/rem salvo 0, 1px y 2px (borde, outline, translateY de hover: DESIGN.md §5, §7, §8)
const LENGTH = /(?<![\w.-])(?!(?:0|1|2)px\b)(?!0(?:\.0+)?rem\b)\d*\.?\d+(?:px|rem)\b/gi;
const FONT_SIZE = /font-size\s*:\s*(?!var\(|inherit|initial|unset|revert|100%)[^;}"']+/gi;

const literalRules = [
  ['color literal (#hex)', 'usar un token de color de css/tokens.css (DESIGN.md §2)', count(HEX)],
  ['color literal (rgb/hsl)', 'usar un token de color o de sombra (DESIGN.md §2, §5)', count(COLOR_FN)],
  ['medida literal (px/rem)', 'usar --s-*, --radius*, --t-* o --icon-* (DESIGN.md §3, §4, §5)', count(LENGTH)],
  ['font-size sin token', 'usar var(--t-label|small|body|lead|h3|h2|h1) (DESIGN.md §3)', count(FONT_SIZE)],
];

const bannedRules = [
  ['transition: all', 'listar propiedades: transform, opacity, background-color, border-color, box-shadow, color (DESIGN.md §7)', count(/transition\s*:\s*all\b/gi)],
  ['background-clip: text', 'degradé en texto prohibido (DESIGN.md §10 #9)', count(/(?:-webkit-)?background-clip\s*:\s*text/gi)],
  ['linear-gradient(135deg', 'un solo degradé por página, sólo en el hero vía --grad-* (DESIGN.md §2, §10 #3)', count(/linear-gradient\(\s*135deg/gi)],
  ['overflow-x: hidden en body/html', 'arreglar el elemento que desborda, no ocultarlo (DESIGN.md §9, §10 #14)', count(/(?:^|[\s,}])(?:html|body)\s*\{[^}]*overflow-x\s*:\s*hidden/gi)],
];

const styleBlockRule = ['bloque <style>', 'el CSS va en css/ (CLAUDE.md regla 1)', count(/<style[\s>]/gi)];

function rulesFor(rel) {
  if (isTokenFile(rel)) return [];
  if (isGovernedCss(rel)) {
    return [
      ...literalRules.map(([n, h, f]) => [n, h, (s) => f(declarations(s))]),
      ...bannedRules.map(([n, h, f]) => [n, h, (s) => f(stripComments(s))]),
    ];
  }
  if (isSiteHtml(rel)) {
    return [
      styleBlockRule,
      ...literalRules.map(([n, h, f]) => [`${n} en style=""`, h, (s) => f(inlineStyles(s))]),
      ...bannedRules.map(([n, h, f]) => [n, h, (s) => f(inlineStyles(s))]),
    ];
  }
  return [];
}

// ------------------------------------------------------- antes / después
function beforeAfter(tool, input, abs) {
  const disk = existsSync(abs) ? readFileSync(abs, 'utf8') : '';
  if (tool === 'Write') return [[disk, input.content ?? '']];
  if (tool === 'Edit') return [[input.old_string ?? '', input.new_string ?? '']];
  if (tool === 'MultiEdit') return (input.edits || []).map((e) => [e.old_string ?? '', e.new_string ?? '']);
  return [];
}

// ------------------------------------------------------------------ salida
function decide(decision, reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decision,
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}

export function evaluate(payload, projectDir) {
  const tool = payload.tool_name;
  const input = payload.tool_input || {};
  if (!['Edit', 'Write', 'MultiEdit'].includes(tool) || !input.file_path) return null;

  const abs = path.resolve(projectDir, input.file_path);
  const rel = path.relative(projectDir, abs).split(path.sep).join('/');
  if (rel.startsWith('..')) return null; // fuera del repo

  for (const [re, why] of DENY_FILES) if (re.test(rel)) return ['deny', `Guardián: ${rel} está protegido. ${why}`];
  for (const [re, why] of ASK_FILES) if (re.test(rel)) return ['ask', `Guardián: ${why}`];

  const rules = rulesFor(rel);
  if (!rules.length) return null;

  const pairs = beforeAfter(tool, input, abs);
  const problems = [];
  for (const [name, hint, fn] of rules) {
    let added = 0;
    for (const [before, after] of pairs) added += fn(after) - fn(before);
    if (added > 0) problems.push(`- ${name}: +${added} → ${hint}`);
  }
  if (!problems.length) return null;

  return ['deny',
    `Guardián de reglas duras: el cambio en ${rel} agrega violaciones.\n${problems.join('\n')}\n` +
    'Si el token no existe, agregarlo primero a css/tokens.css y documentarlo en DESIGN.md. ' +
    'Si es una excepción real, se discute con el usuario antes (DESIGN.md §12.6).'];
}

// ------------------------------------------------------------------- main
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const raw = readFileSync(0, 'utf8');
    const payload = JSON.parse(raw || '{}');
    const projectDir = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
    const verdict = evaluate(payload, projectDir);
    if (verdict) decide(...verdict);
  } catch {
    // Nunca trabar una edición por un error del propio guardián.
  }
  process.exit(0);
}
