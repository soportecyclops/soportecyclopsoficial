# Soporte Cyclops — instrucciones del proyecto

Sitio estático (HTML/CSS/JS sin build) desplegado en Vercel desde GitHub.

## Diseño

@DESIGN.md
@PRODUCT.md

Leer ambos antes de tocar markup o CSS. `DESIGN.md` manda sobre cualquier
preferencia propia: color, tamaño tipográfico, espaciado, radio y sombra
salen de los tokens de `css/tokens.css`.

## Seguimiento

`PENDIENTES.md` (raíz): lo hecho por sesión con su commit y lo que quedó
pendiente. Leerlo al empezar; actualizarlo al terminar.

## Reglas duras

1. **Nada de `<style>` en HTML.** El CSS va en `css/`. Hay 364 bloques
   heredados pendientes de extraer; no sumar ninguno.
2. **Nada de valores literales.** Ni `#2563eb`, ni `font-size: 0.87rem`, ni
   `padding: 14px`. Sólo `var(--*)`. Si el token no existe, agregarlo primero
   a `css/tokens.css` y documentarlo en `DESIGN.md`.
3. **Orden de hojas**: `css/tokens.css` → Font Awesome → `css/nav.css` →
   la hoja de la página. Nunca otro orden.
4. **Un `<h1>` por página.** Jerarquía sin saltos.
5. **Prohibido emoji como icono.** Font Awesome 6 es el único sistema.
6. **Prohibida la lista de §10 de DESIGN.md** (badge sobre H1, orbes,
   degradé 135deg genérico, fade-up en cadena, `transition: all`).
7. Antes de dar por terminada una página: `/impeccable polish`, después
   `/impeccable audit`.
8. Cambio masivo (más de 5 archivos): avisar y mostrar el plan primero.

## Estructura

- `index.html` y páginas de nivel raíz: públicas
- `blog/<slug>/index.html`: 337 artículos, mismo esqueleto
- `herramientas/`: calculadoras interactivas (tienen su `base.css`)
- `css/tokens.css`: fuente única de tokens
- `css/main.css`: hoja de la home (ojo: tiene BOM y mojibake por arreglar)
- `data/*.json`: contenido de blog, noticias y servicios
- `admin*.html`, `cliente*.html`, `login.html`: privadas, `noindex`

## Chat y WhatsApp

- `js/chat.js`: widget de Cyclops Chat (Chatwoot en `chat.soportecyclops.com.ar`, entrada "Web Soporte Cyclops", `websiteToken` en el archivo). Atiende **Iris**, la asistente de IA. Es el chat por defecto.
- `chatbot.js`: asistente de diagnóstico guiado (sin IA, PDF y número de diagnóstico). Carga `js/chat.js` y se oculta cuando Iris está lista (`html.iris-activa .chatbot-container` en `css/main.css`); si Chatwoot no carga, queda como respaldo. Sus botones "Hablar con el asistente virtual" llaman a `abrirAsistente()`, que abre Iris o, a los 5 s, WhatsApp.
- `soporte.html`: página del chat de Iris (burbuja visible y apertura automática en escritorio).
- WhatsApp: todos los `wa.me` van al número de Iris, **5491151758025**. Los `tel:` y el teléfono visible para llamadas siguen en 11 6680-4450.
- Precios que muestra la web, `chatbot.js` e Iris deben coincidir. Fuente de Iris: `/opt/cyclops-chat/config/conocimiento/default/05-catalogo.md` en el servidor 192.168.0.200.
- `Code.gs` (Apps Script) se actualiza aparte, en el editor de Google.

## Automatización (`.claude/`, versionada)

- **Guardián de reglas duras** — `.claude/hooks/guardian.mjs`, hook PreToolUse
  registrado en `.claude/settings.json`. Rechaza toda edición que **sume**
  `<style>`, literales de color/px/rem/`font-size` (en `css/` y
  `herramientas/`, salvo `tokens.css`, y en `style=""`), `transition: all`,
  `background-clip: text`, `linear-gradient(135deg` u `overflow-x: hidden` en
  body. Bloquea `js/vendor/**` y `package-lock.json`; pide confirmación en
  `*.gs`. `demos/` queda afuera (§14). Compara antes/después: editar deuda
  heredada sin empeorarla se permite. Pruebas: `node --test .claude/hooks/guardian.test.mjs`.
  No cubre ediciones hechas con comandos de shell (`sed`, etc.).
  `.claude/` y `demos/` quedan fuera de su alcance.
- **`/chequeo-pagina <ruta>`** — `.claude/skills/chequeo-pagina/`. La parte
  medible de §11 en un navegador real: un `<h1>`, jerarquía, `img`,
  desborde a 390/1280, metadatos, `<style>`, emoji como icono, consola,
  recursos rotos, área táctil. Correrlo antes de `/impeccable audit`.
  `--raiz` revisa todas las públicas de nivel raíz.
- **Agente `auditor-tokens`** — `.claude/agents/auditor-tokens.md`. Sólo
  lectura. Contrasta `git diff HEAD` (o `main...HEAD`, o los archivos que se
  le pasen) contra §2–§8 y §10: tokens inexistentes, color en la superficie
  equivocada, radios, borde+sombra, degradés, movimiento, estados. Devuelve
  tabla con archivo:línea y el token exacto que va. Cubre lo que el guardián
  no ve: semántica, y lo que entra por shell o por merge.

## Agentes

Skills instaladas en `.claude/skills/`: `design-taste-frontend` (taste-skill 2.5.1,
clasificación de este sitio: **service** / site-kind **other**) e `impeccable`.
