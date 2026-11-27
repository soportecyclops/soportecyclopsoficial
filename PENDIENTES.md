# PENDIENTES — bitácora de trabajo y lo que falta

Leer esto al empezar una sesión. Actualizarlo al terminarla: lo hecho pasa a
"Hecho" con su commit, lo que surge va a "Pendiente". No se publica (`*.md`
está en `.vercelignore`).

Sin ramas abiertas: sólo `main`. `mejoras-diseno` (abf51ed), `blog-buscador`
(dcd993e) y `seo-limpieza` (3e4f9c3) se mergearon y se borraron, en local y
en GitHub.

---

## Pendiente

### Seguridad de Code.gs / admin.html (27/11, rama `iris-primero`)
- [x] Código: `Code.gs` verifica el ID token de Google (tokeninfo: aud, iss, exp, email verificado, email en ADMIN_EMAILS) en todas las acciones admin de lectura y escritura; `admin.html` manda `credential` en `apiGet`/`apiPost` y vuelve al login si la sesión vence.
- [x] (URL nueva aplicada 27/11) **Pegar `Code.gs` en Apps Script y crear una implementación nueva** (la URL vieja pudo leerse sin login); cambiar `CONFIG.APPS_SCRIPT_URL` en `admin.html`, `appsScriptUrl` en `chatbot.js` y `APPS_SCRIPT_URL` en `cliente.html`. Tiene que existir `portalGet_`/`portalPost_` en otro archivo del proyecto.
- [x] `cliente.html:287`: typo `hhttps://` corregido con la URL nueva. `diags_por_email` y `verificar_acceso` siguen públicos. Sin tocar: `admin.html` h1, meta description, img width/height.

### Contacto: Iris primero (27/11, rama `iris-primero`)
- [x] WhatsApp de Iris (+54 9 11 5175-8025) antes que el teléfono (+54 9 11 6680-4450) en 15 pies/bloques, 3 herramientas, `soporte.html` e `index.html`; `contactPoint` en el JSON-LD de `index.html`; `admin.html:392` corregido.
- [ ] Sin tocar, a decidir: `chatbot.js:28/1995`, `cliente.html:705`, `Code.gs:620/685/724` y `admin.html:539/1582` siguen con +54 9 11 6680-4450 (config/PDF/mails).
- [ ] Revisión de `admin.html` (carga, consola, enlaces, seguridad, /chequeo-pagina): pendiente de informe.

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

### Buscador y SEO (después del merge)
- [x] **Vista previa de `seo-limpieza` verificada** con `vercel curl` (25/11):
  `/`, `/blog/`, `/blog`, `/herramientas/`, `/demos/`, una demo y artículos
  (`.html` y carpeta) → 200; `/no-existe`, `/blog/no-existe`, `/servicios`,
  `/x/y/z` → 404 con 404.html y sus 5 recursos en 200; las 6 redirecciones
  → 301 al destino correcto; sitemap publicado con 98 URLs, 0 lastmod, sin
  demos ni duplicado; demo con `noindex` y sin JSON-LD.
  `/servicios` y las otras 12 públicas de la raíz sin `.html` ahora dan 301
  a su `.html` (8cd75c8).
- [x] Mergeadas a `main`: `blog-buscador` (dcd993e) y después `seo-limpieza`
  (3e4f9c3). Verificado en producción (ver "Hecho").
- [x] **Relevancia del buscador** (665e7c2): título primero, sinónimos a
  mitad de peso, corte al 50 %. «wifi» ya no trae el del disco duro.
- [ ] Relevancia, lo que queda: «me hackearon el mail» pone primero «Estafas
  por WhatsApp y mail» y segundo «Me hackearon el correo» (empatan en
  título: palabra literal + sinónimo cada uno). «no me anda la impresora»
  pone «Cómo elegir impresora» antes que «La impresora no imprime»: el
  buscador no entiende que «no me anda» pide un problema. Posible mejora:
  premiar frases o palabras de falla («no anda», «no imprime», «se corta»).
  «la compu anda lenta» todavía incluye «Monitor y puesto de trabajo» (6.º).
- [ ] Buscador, deuda menor del auditor: chips «Frecuentes» con radio pill;
  `<h4>` nuevo en la barra lateral del blog (mismo patrón heredado).
- [x] HTML del duplicado de Windows 10 y su fuente en `blog-test/` borrados
  (1fee14e); las 301 quedan.
- [x] `404.html`: orden de hojas tokens → FA → nav → main → 404 (1fee14e).
- [x] `404.html` con `<meta name="description">` (2e1ed70); el `noindex,
  follow` ya estaba.

### Encontrado y sin agendar
- [ ] **Orden de hojas en `blog/index.html`**: `main.css` y `blog-index.css`
  antes que `nav.css` (regla 3). Hero del blog con degradé 135deg y literales.
- [ ] `demos/index.html`: error de consola "Elementos del chatbot no
  encontrados" (ya estaba).
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
| b422133 | `blog/index.html`: buscador por problema (texto completo de `data/blog-articles.json`, sinónimos, sin tildes, `?q=` y `?cat=` en la URL, tecla `/`), filtros por tema, estado con `aria-live`, vacío con Iris y WhatsApp con la búsqueda escrita, «Más leídos» con lista fija de respaldo; tarjetas `h4`→`h3` bajo un `h2`. `js/nav.js`: cuenta una vista por sesión en cada artículo |

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
| d0c4e7b | `.gitattributes` con `* text=auto eol=lf` y `git add --renormalize .`: 89 archivos que el repo guardaba con CRLF o mezclado (`blog-test/`, `data/*.json`, `forms/google-sheets.js`) pasan a LF. Sin cambios de contenido. |

| abf51ed | Merge de `mejoras-diseno` a `main` (en producción) |

### 25/11/2026 (tarde) — `blog-buscador` y `seo-limpieza`, mergeadas a `main`
| Rama | Commit | Qué |
|---|---|---|
| blog-buscador | b422133 | Buscador por problema, filtros por tema y «Más leídos» (parche) |
| blog-buscador | 2303ec3 | Correcciones del auditor: foco cian en el hero, campo sin sombra y radio chico, transiciones con `--dur`/`--ease` |
| blog-buscador | 2c77fe7 | `nav.js`: fuera la excepción de `articulo-prueba` |
| seo-limpieza | 9985a00 | `vercel.json` sin la reescritura comodín: rutas inexistentes → 404 con `404.html` (antes portada con 200). `404.html` con rutas absolutas |
| seo-limpieza | 25dbc72 | Demos: `noindex, follow` en las 11, fuera el JSON-LD ficticio de 5, fuera del sitemap |
| seo-limpieza | ad3da26 | Duplicado de Windows 10: 301 ×3 a `windows-10-sin-soporte.html`, fuera del sitemap y del JSON |
| seo-limpieza | 9a6fdb0 | `articulo-prueba` borrado (HTML ×2 y `.md`), 301 ×3 a `/blog/` |
| seo-limpieza | 6693080 | `sitemap.xml` sin `<lastmod>` (98 URLs) |
| seo-limpieza | 1fee14e | Borrados los HTML del duplicado y su `.md`; orden de hojas en `404.html` (0 píxeles de diferencia) |
| main | dcd993e | Merge `blog-buscador` |
| main | 3e4f9c3 | Merge `seo-limpieza` |
| main | 8cd75c8 | `vercel.json`: 301 de las 13 públicas de la raíz sin `.html` (con y sin barra) a su `.html`. Verificado en producción: 26 × 301 → 200 |
| main | 2e1ed70 | `404.html`: meta description |
| main | 665e7c2 | Buscador: título primero, sinónimos a mitad de peso, corte al 50 %. En producción: «compu anda lenta» 21 → 6, «wifi» 6 → 4 |
| — | — | Ramas `blog-buscador`, `seo-limpieza` y `mejoras-diseno` borradas (local y GitHub) |

Nota: la copia de trabajo puede seguir teniendo archivos en CRLF hasta que
se vuelvan a escribir o se haga checkout; Git ya no los marca como
cambiados y siempre los guarda en LF.

Herramientas de verificación usadas (scratchpad, no versionadas): capturas
y diferencia de píxeles con la librería Playwright del repo; el MCP de
Playwright no conectó en esta sesión.
