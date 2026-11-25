// Pruebas del guardián. Correr: node --test .claude/hooks/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { evaluate } from './guardian.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const edit = (file_path, old_string, new_string) =>
  evaluate({ tool_name: 'Edit', tool_input: { file_path, old_string, new_string } }, ROOT);
const write = (file_path, content) =>
  evaluate({ tool_name: 'Write', tool_input: { file_path, content } }, ROOT);
const decision = (v) => (v ? v[0] : 'allow');

// --- archivos protegidos
test('js/vendor está bloqueado', () => {
  assert.equal(decision(edit('js/vendor/motion-mini.js', 'a', 'b')), 'deny');
});
test('package-lock.json está bloqueado', () => {
  assert.equal(decision(write(path.join(ROOT, 'package-lock.json'), '{}')), 'deny');
});
test('.gs pide confirmación', () => {
  assert.equal(decision(edit('Code.gs', 'a', 'b')), 'ask');
});

// --- CSS gobernado
test('hex nuevo en css/ se rechaza', () => {
  const v = edit('css/main.css', '.a{color:var(--text)}', '.a{color:#2563eb}');
  assert.equal(decision(v), 'deny');
  assert.match(v[1], /#hex/);
});
test('padding en px y font-size literal se rechazan', () => {
  const v = edit('css/nav.css', '.a{}', '.a{padding:14px;font-size:.87rem}');
  assert.equal(decision(v), 'deny');
  assert.match(v[1], /px\/rem/);
  assert.match(v[1], /font-size/);
});
test('fragmento sin llaves (Edit de una línea) también se revisa', () => {
  assert.equal(decision(edit('css/main.css', '  gap: var(--s-4);', '  gap: 14px;')), 'deny');
  assert.equal(decision(edit('css/main.css', '  color: var(--text);', '  color: #333;')), 'deny');
});
test('rgba en sombra se rechaza', () => {
  assert.equal(decision(edit('css/main.css', '.a{}', '.a{box-shadow:0 2px 8px rgba(0,0,0,.1)}')), 'deny');
});
test('tokens permitidos pasan', () => {
  assert.equal(decision(edit('css/main.css', '.a{}',
    '.a{padding:var(--s-4);font-size:var(--t-body);border:1px solid var(--border);outline-offset:2px;margin:0}')), 'allow');
});
test('breakpoint en @media no cuenta como literal', () => {
  assert.equal(decision(edit('css/main.css', '', '@media (max-width: 768px){.a{gap:var(--s-4)}}')), 'allow');
});
test('selector #id no es un color', () => {
  assert.equal(decision(edit('css/nav.css', '', '#abc .x{color:var(--text)}')), 'allow');
});
test('comentarios no cuentan', () => {
  assert.equal(decision(edit('css/main.css', '', '/* antes era #2563eb y 14px */.a{color:var(--blue)}')), 'allow');
});
test('em (tracking) está permitido', () => {
  assert.equal(decision(edit('css/main.css', '', '.a{letter-spacing:-.02em}')), 'allow');
});
test('mover una línea heredada no suma violaciones', () => {
  assert.equal(decision(edit('herramientas/base.css', '.a{padding:14px}\n.b{}', '.b{}\n.a{padding:14px}')), 'allow');
});
test('arreglar deuda (restar) se permite', () => {
  assert.equal(decision(edit('herramientas/base.css', '.a{padding:14px}', '.a{padding:var(--s-3)}')), 'allow');
});
test('tokens.css puede tener literales', () => {
  assert.equal(decision(edit('css/tokens.css', '', '--nuevo: #123456;')), 'allow');
});
test('.claude/ (fixtures de prueba) queda fuera', () => {
  assert.equal(decision(write('.claude/skills/chequeo-pagina/fixtures/x.html', '<style>.a{width:1600px}</style>')), 'allow');
});
test('demos/ queda fuera', () => {
  assert.equal(decision(edit('demos/barberia/style.css', '', '.a{color:#ff0000;padding:13px}')), 'allow');
});

// --- §10
test('transition: all se rechaza', () => {
  assert.equal(decision(edit('css/main.css', '', '.a{transition: all var(--dur)}')), 'deny');
});
test('background-clip: text se rechaza', () => {
  assert.equal(decision(edit('css/main.css', '', '.a{-webkit-background-clip:text}')), 'deny');
});
test('linear-gradient(135deg se rechaza', () => {
  assert.equal(decision(edit('css/main.css', '', '.a{background:linear-gradient(135deg,var(--blue),var(--navy))}')), 'deny');
});
test('overflow-x: hidden en body se rechaza, en otro elemento no', () => {
  assert.equal(decision(edit('css/main.css', '', 'body{overflow-x:hidden}')), 'deny');
  assert.equal(decision(edit('css/main.css', '', '.carrusel{overflow-x:hidden}')), 'allow');
});

// --- HTML
test('<style> nuevo en HTML se rechaza', () => {
  assert.equal(decision(edit('index.html', '</head>', '<style>.a{}</style></head>')), 'deny');
});
test('style="" con literal se rechaza; con token pasa', () => {
  assert.equal(decision(edit('index.html', '<p>', '<p style="color:#fff">')), 'deny');
  assert.equal(decision(edit('index.html', '<p>', '<p style="margin-top:var(--s-4)">')), 'allow');
});
test('HTML sin estilo pasa', () => {
  assert.equal(decision(edit('index.html', '<p>hola</p>', '<p>chau #1 a 14px</p>')), 'allow');
});
test('Write sobre HTML existente compara contra el disco', () => {
  // soporte.html ya existe: reescribirlo igual no suma nada
  const fs = require_fs();
  const actual = fs.readFileSync(path.join(ROOT, 'soporte.html'), 'utf8');
  assert.equal(decision(write('soporte.html', actual)), 'allow');
  assert.equal(decision(write('soporte.html', actual + '<style>x{}</style>')), 'deny');
});
test('otros archivos y rutas fuera del repo pasan', () => {
  assert.equal(decision(edit('js/chat.js', 'a', 'color:#fff')), 'allow');
  assert.equal(decision(edit('DESIGN.md', 'a', '#2563eb 14px')), 'allow');
  assert.equal(decision(edit(path.join(ROOT, '..', 'otro', 'x.css'), '', '.a{color:#fff}')), 'allow');
});

// --- de punta a punta, como lo llama Claude Code
test('proceso: deny emite JSON de PreToolUse; allow no emite nada', () => {
  const run = (payload) => spawnSync(process.execPath, [path.join(ROOT, '.claude/hooks/guardian.mjs')], {
    input: JSON.stringify(payload), env: { ...process.env, CLAUDE_PROJECT_DIR: ROOT }, encoding: 'utf8',
  });
  const bad = run({ tool_name: 'Edit', tool_input: { file_path: path.join(ROOT, 'css/main.css'), old_string: '', new_string: '.a{color:#fff}' } });
  assert.equal(bad.status, 0);
  assert.equal(JSON.parse(bad.stdout).hookSpecificOutput.permissionDecision, 'deny');
  const ok = run({ tool_name: 'Edit', tool_input: { file_path: path.join(ROOT, 'css/main.css'), old_string: '', new_string: '.a{color:var(--text)}' } });
  assert.equal(ok.status, 0);
  assert.equal(ok.stdout, '');
  const garbage = spawnSync(process.execPath, [path.join(ROOT, '.claude/hooks/guardian.mjs')], { input: 'no es json', encoding: 'utf8' });
  assert.equal(garbage.status, 0);
});

import * as fsMod from 'node:fs';
function require_fs() { return fsMod; }
