# PENDIENTES — bitácora de trabajo y lo que falta

Leer esto al empezar una sesión. Actualizarlo al terminarla: lo hecho pasa a
"Hecho" con su commit, lo que surge va a "Pendiente". No se publica (`*.md`
está en `.vercelignore`).

Rama de trabajo: `mejoras-diseno` (sin mergear a `main`).

---

## Pendiente

### Buscador y «Más leídos» del blog (25/11, rama `blog-buscador`)
- [ ] **Apps Script del portal** (el de `AKfycbwYHX…`, el mismo de `preguntas_publicas`):
  pegar este código y, al principio de `doGet`, la línea
  `var _v = vistasGet_(e); if (_v) return _v;`. Después: Implementar → Administrar
  implementaciones → editar → Nueva versión (misma URL). Hasta entonces el
  índice muestra la lista fija «Para empezar».
  ```js
  function vistasGet_(e) {
    var a = e && e.parameter && e.parameter.action;
    if (a !== 'blog_vista' && a !== 'blog_mas_leidos') return null;
    var props = PropertiesService.getScriptProperties();
    if (a === 'blog_vista') {
      var slug = String(e.parameter.slug || '').toLowerCase();
      if (!/^[a-z0-9-]{3,90}$/.test(slug)) return jsonResponse({ ok: false });
      var lock = LockService.getScriptLock();
      lock.tryLock(3000);
      var v = JSON.parse(props.getProperty('blog_vistas') || '{}');
      v[slug] = (v[slug] || 0) + 1;
      props.setProperty('blog_vistas', JSON.stringify(v));
      lock.releaseLock();
      return jsonResponse({ ok: true });
    }
    var cache = CacheService.getScriptCache(), c = cache.get('blog_top');
    if (c) return jsonResponse(JSON.parse(c));
    var w = JSON.parse(props.getProperty('blog_vistas') || '{}');
    var top = Object.keys(w).map(function (k) { return { slug: k, vistas: w[k] }; })
      .sort(function (x, y) { return y.vistas - x.vistas; }).slice(0, 10);
    var r = { ok: true, top: top };
    cache.put('blog_top', JSON.stringify(r), 1800);
    return jsonResponse(r);
  }
  ```
- [ ] **Plantilla del CMS**: si al publicar un artículo el Apps Script del blog
  regenera `blog/index.html`, va a pisar el buscador. Llevar a la plantilla:
  el `<form id="blogBuscar">`, el bloque de filtros/estado/vacío, la tarjeta
  `#masLeidos`, los `<h3>` de las tarjetas y `<script src="/js/blog-buscador.js" defer>`.
- [ ] Artículos (cambio masivo, mostrar plan): «Seguí leyendo» es igual en
  los 83 (mismos 3 de Seguridad) → relacionados por categoría; «6 min de
  lectura de lectura» duplicado; fecha del artículo (2025) distinta de la
  del JSON (2026); buscador chico en la barra lateral; «¿Te sirvió?».
- [ ] Duplicados: `windows-10-sin-soporte` y
  `tu-pc-con-windows-10-ya-no-recibe-actualizaciones-que-hacer-ahora` (mismo
  tema, los dos en el sitemap); `articulo-prueba.html` publicado.
- [ ] Orden de hojas de `blog/index.html`: `main.css` y `blog-index.css` antes
  de `nav.css` (regla 3).

### Acordado para la próxima sesión (puntos 3, 4 y 5 de la auditoría del 25/11)
- [ ] **3. Colores fijos en JS → clases en `css/`.** `main.js` arma el aviso
  de cookies con `style.cssText` y el botón «Aceptar» en `#2563eb` (azul
  viejo); los mensajes del formulario usan `#fee2e2`, `#991b1b`, etc.
  `agenda.js` también pone estilos. `Code.gs` tiene 36 colores (5 `#2563eb`)
  en los mails: se edita aparte en el editor de Google.
- [ ] **4. Unificar paletas privadas con `tokens.css`.** `admin.css`,
  `admin-blog.css`, `admin-portal.css`, `cliente.css`, `cliente_panel.css` y
  `herramientas/base.css` tienen su propio `:root`:
  - `--amber` vale `#d97706` (admin-blog, admin-portal, cliente_panel, base)
    o `#f59e0b` (admin, cliente) contra `#b45309` en tokens.
  - `cliente.css`: `--transition: all .25s` (§7/§10), `--radius: 14px`.
  - `admin.css`: `--accent` azul (en tokens es cyan), sombras y verde
    propios, tipografías DM Sans y JetBrains Mono.
  - Alias cortos (`--dark`, `--g50`…`--g900`, `--green`, `--red`) que
    duplican tokens con hex.
- [ ] **5. Separar `css/base.css` de `tokens.css`** (héroes de segmento, foco,
  estados, área táctil, movimiento reducido, base de títulos) y **mover §13–§15
  de DESIGN.md** (skills, MCP, Motion, demos) a CLAUDE.md o `docs/`.
  Es mover archivos y contenido: mostrar el plan antes.

### Encontrado y sin agendar
- [ ] **Iconos oscuros en las tarjetas de `herramientas/index.html`**: mismo
  problema que tenían las del blog (heredan color oscuro sobre fondo oscuro).
  Ver `docs/capturas/blue-autoref/herramientas-despues-1280.png`.
- [ ] **Space Grotesk 800 no existe** (la familia llega a 700). El CSS pide 800
  87 veces y se ve como 700. Decidir: bajar esas reglas a 700, o cambiar de
  fuente. Además, ninguna regla pide hoy Space Grotesk 600 (el H3 de §3).
- [ ] **Degradés de las tarjetas de artículos** (`main.css` ~1838–1843): cinco
  `linear-gradient(135deg…)` → color sólido, como `.redes`. Mismo patrón en
  las tarjetas de `herramientas/`.
- [ ] Deuda en las reglas tocadas esta sesión (ver auditorías): `.wa-btn`
  (pill, sombra en reposo, `-2px` en hover), `.social-links a`, `.blog-card`
  (hover `-6px`, borde azul viejo), `margin-bottom: 9px` en `.blog-card-body h3`.
- [ ] **152 usos del azul viejo** `#2563eb` / `rgba(37,99,235,…)`: main.css 35,
  cliente.css 11, admin.css 9, presencia-web 7, soporte.css 6, Code.gs 5…
- [ ] **`/chequeo-pagina` en herramientas/**: dos `<h1>` en 3 calculadoras, salto
  h1→h3 en el índice, logo sin `width`/`height`. En `cliente.html`: error
  "Elementos del chatbot no encontrados" en consola.
- [ ] Avisos de área táctil que quedan: los dos enlaces dentro del texto del
  hero de index (probablemente aceptables) y la nav de `herramientas/`
  (34 px de alto).
- [ ] `soporte.css` copia ~20 reglas de la barra que ya están en `nav.css`
  (pierden siempre por especificidad): peso muerto.
- [ ] **CLAUDE.md desactualizado**: dice 337 artículos (hay 85) y 364 bloques
  `<style>` (queda 1, la vista previa de `admin-blog.html`).
- [ ] 757 atributos `style=""` en 194 HTML (admin.html 118, presencia-web 63,
  index 51).

---

## Hecho

### 25/11/2026 — buscador del blog (rama `blog-buscador`)
| Commit | Qué |
|---|---|
| (este) | `blog/index.html`: buscador por problema (texto completo de `data/blog-articles.json`, sinónimos, sin tildes, `?q=` y `?cat=` en la URL, tecla `/`), filtros por tema, estado con `aria-live`, vacío con Iris y WhatsApp con la búsqueda escrita, «Más leídos» con lista fija de respaldo; tarjetas `h4`→`h3` bajo un `h2`. `js/nav.js`: cuenta una vista por sesión en cada artículo |

### 25/11/2026
| Commit | Qué |
|---|---|
| 2590934, c7b01a1, 0b5529c | Guardián de reglas duras, skill `/chequeo-pagina`, agente `auditor-tokens` |
| 4ca7d78 | Jerarquía de títulos en index y soporte; fuera `outline:none` del input |
| b025509 | `main.css`: 4 comillas escapadas `\'` → `'` (títulos del blog en Space Grotesk) |
| c19b297 | `soporte.css`: fuera la sección muerta del input del chat |
| fd5f07f | Token `--tap: 44px` y área táctil de 44 en menú, redes, checkbox, breadcrumb, WhatsApp |
| 4ba4955 | `soporte.html`: `nav.css` antes que `soporte.css` (0 píxeles de diferencia) |
| 02d3406 | Fuera la trama de puntos de las tarjetas de artículos |
| 08b90b3 | Iconos de las tarjetas de artículos en `--white` |
| 8609061 | Contraste de `--blue-dark` (11.64:1); capturas en `docs/capturas/` (fuera del deploy) |
| 12f3b10 | Fuera `--blue: var(--blue)` en 5 hojas: `--blue` estaba vacía en herramientas/ y cliente.html (botón «Contacto» invisible, enlaces negros) |
| 0e2aed3 | Google Fonts: Space Grotesk 600 agregado en 195 HTML y la plantilla `.njk` |
| b547901 | DESIGN.md: estados al 25/11 y contrastes de `--blue-light`, `--navy`, `--blue-ui`; este archivo |
| (último) | `.gitattributes` con `* text=auto eol=lf` y `git add --renormalize .`: 89 archivos que el repo guardaba con CRLF o mezclado (`blog-test/`, `data/*.json`, `forms/google-sheets.js`) pasan a LF. Sin cambios de contenido. |

Nota: la copia de trabajo puede seguir teniendo archivos en CRLF hasta que
se vuelvan a escribir o se haga checkout; Git ya no los marca como
cambiados y siempre los guarda en LF.

Herramientas de verificación usadas (scratchpad, no versionadas): capturas
y diferencia de píxeles con la librería Playwright del repo; el MCP de
Playwright no conectó en esta sesión.
