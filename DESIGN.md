# DESIGN.md — Soporte Cyclops

Fuente única de verdad visual. Toda decisión de color, tamaño, espacio y radio
sale de acá. Si un valor no está acá, no se usa: se agrega acá primero.

- Tokens reales: `css/tokens.css` (cargar SIEMPRE primero)
- Marcado `[EST]` = estimación a confirmar contra el Manual de Identidad v1.0
- Clasificación taste-skill: **service** / site-kind **other**
  (se contratan personas: oficio técnico). No es "tech": sin shaders, sin
  escenas, sin WebGL, sin loops. Fotografía + tipografía + iconos reales.

---

## 1. Identidad

**Qué es**: técnico IT a domicilio, CABA y GBA. Redes, CCTV, soporte, web para pymes.
**Promesa**: un solo punto de contacto, respuesta rápida, garantía escrita.
**No es**: una SaaS, una startup, una agencia creativa, una consultora enterprise.

**Consecuencia visual**: el sitio tiene que parecer de un oficio serio con
11 años de rodaje — no de un lanzamiento de producto. Oficio = pruebas, no efectos.

---

## 2. Color

### Marca
| Token | Valor | Contraste vs blanco | Uso |
|---|---|---|---|
| `--blue` | `#174ea6` | 7.85:1 | acción primaria, enlaces, foco |
| `--blue-hover` | `#123e85` | 10.23:1 | hover de acción |
| `--blue-dark` | `#1a3a5c` | 11.64:1 | titulares sobre claro, logo |
| `--blue-light` | `#3d77d1` | 3.9:1 | sólo texto grande o gráficos |
| `--navy` | `#12356f` | 11.4:1 | fondos oscuros profundos |
| `--blue-ui` | `#7ba7e8` | 2.1:1 | **sólo sobre oscuro** |

> Decidido el 15/11/2026: se abandonó `#2563eb`. Era exactamente Tailwind
> `blue-600`, el azul por defecto de toda página generada, y además el peor
> contraste de la paleta (5.17:1). `#174ea6` conserva la familia de color —
> sigue leyéndose como el mismo azul de marca — y sube a 7.85:1.

### Acento cálido
| Token | Valor | Dónde |
|---|---|---|
| `--amber` | `#b45309` | superficie **clara**: 5.02:1 con texto blanco encima, 5.02:1 como texto sobre blanco |
| `--amber-bright` | `#f59e0b` | superficie **oscura** únicamente: 7.21:1 sobre `#0f2444` |
| `--cyan` | `#00c6ff` | superficie **oscura** únicamente: 2.0:1 contra blanco, no alcanza para texto |

El acento cálido es el único color que compite con el azul, y compite poco:
rompe la monocromía fría que iguala a todo sitio de servicios técnicos.
Un acento por pantalla. El botón primario sigue siendo azul.

### Neutros
`--slate-950 #0f172a` · `--slate-800 #1e293b` · `--gray-600 #475569`
`--gray-500 #64748b` · `--border #e2e8f0` · `--gray-50 #f8fafc` · `--white #ffffff`

Texto cuerpo: `--text #1e293b` sobre `--white`. Nunca `--gray-400` sobre blanco
para texto (2.6:1, falla AA).

### Segmentos (acento único por sección de negocio)
`--seg-hogar #00c6ff` · `--seg-pyme #f59e0b` · `--seg-estudio #22c55e` · `--seg-obra #94a3b8`

Regla: el acento de segmento **sólo** tiñe el borde inferior del hero y el
icono de la tarjeta. Nunca el fondo de una sección entera.

### Funcionales
`--ok #16a34a` · `--error #dc2626` · `--warn-bg #fef3c7` · `--whatsapp #25d366`

### Contraste
- Texto normal ≥ 4.5:1 · Texto ≥24px o bold ≥19px: ≥ 3:1
- Botón azul sobre blanco y texto blanco sobre `--blue`: 7.85:1, verificado
- Todo texto debe ser legible en fondo claro **y** oscuro: usar
  `.on-dark { color: var(--white) }` / `.on-dark .muted { color: #cbd5e1 }`

### Degradés — presupuesto duro
**Máximo 1 degradé por página**, reservado al hero de segmento (`--grad-*`).
Prohibido: degradé en botones, tarjetas, iconos, texto (`background-clip:text`),
badges y bordes. Estado actual: 1.788 degradés en el sitio → objetivo ≤ 20 totales.

---

## 3. Tipografía

| Rol | Familia | Peso | Tamaño | Line-height | Tracking |
|---|---|---|---|---|---|
| H1 | Space Grotesk | 700 | `clamp(2.25rem, 1.4rem + 3.2vw, 3.5rem)` | 1.1 | −0.02em |
| H2 | Space Grotesk | 700 | `clamp(1.75rem, 1.3rem + 1.6vw, 2.5rem)` | 1.2 | −0.015em |
| H3 | Space Grotesk | 600 | `1.375rem` | 1.3 | −0.01em |
| Lead | Open Sans | 400 | `1.125rem` | 1.6 | 0 |
| Cuerpo | Open Sans | 400 | `1rem` | 1.65 | 0 |
| Small | Open Sans | 400 | `0.875rem` | 1.5 | 0 |
| Label | Open Sans | 600 | `0.8125rem` | 1.4 | +0.02em, mayúscula |

**Escala cerrada — 7 tamaños, ninguno más.** Tokens ya en `css/tokens.css`:
`--t-label .8125rem` · `--t-small .875rem` · `--t-body 1rem` · `--t-lead 1.125rem`
· `--t-h3 1.375rem` · `--t-h2 clamp(...)` · `--t-h1 clamp(...)`

> Estado actual: **89 valores distintos de `font-size`** en 16.014
> declaraciones. Es la causa número uno de que el sitio se lea inconsistente.
> Ningún `font-size` literal en código nuevo: sólo `var(--t-*)`.

Mínimo de cuerpo: 16px. Nunca bajar de 14px ni en nota al pie.
Línea de texto: máx. 72 caracteres (`max-width: 68ch`).

---

## 4. Espaciado

Escala de 8 (múltiplos exactos, sin valores intermedios). Ya en `css/tokens.css`:

`--s-1 4px` · `--s-2 8px` · `--s-3 12px` · `--s-4 16px` · `--s-5 24px`
`--s-6 32px` · `--s-7 48px` · `--s-8 64px` · `--s-9 96px` · `--s-10 128px`

- Sección: `padding: var(--s-9) 0` (desktop) / `var(--s-7) 0` (≤768px)
- Título a contenido: `var(--s-7)` / `var(--s-6)` en móvil
- Tarjeta: `padding: var(--s-5)` · gap entre tarjetas: `var(--s-4)`
- Contenedor: `max-width: var(--container) 1140px`, `padding-inline: var(--s-5)`

> Prohibidos: 7px, 9px, 10px, 14px, 18px, 22px. Estado actual: 45 valores
> distintos. Objetivo: los 10 de la escala.

---

## 5. Forma

| Token | Valor | Aplica a |
|---|---|---|
| `--radius-sm` | `8px` | inputs, chips, botones |
| `--radius` | `12px` | tarjetas, dropdowns |
| `--radius-lg` | `16px` | paneles grandes, hero cards |
| `--radius-pill` | `50px` | **sólo** CTA de nav y chips de filtro |
| 50% | — | avatares e iconos circulares |

Nada más. Prohibido `20px`, `10px`, `6px` sueltos (hoy en uso).

### Sombras — 3, no 30
| Token | Valor | Uso |
|---|---|---|
| `--shadow-sm` | `0 2px 8px rgba(15,23,42,.08)` | nav al hacer scroll, chips |
| `--shadow-md` | `0 8px 24px rgba(15,23,42,.10)` | tarjeta en hover |
| `--shadow-lg` | `0 20px 60px rgba(15,23,42,.18)` | modal, dropdown |

Regla: **borde `1px solid var(--border)` O sombra, no los dos** en la misma
tarjeta. Estado actual: 30 valores distintos de `box-shadow`.
Sombra en reposo sólo en elementos flotantes (nav, modal, dropdown); las
tarjetas en reposo llevan borde y ganan sombra al hover.

---

## 6. Iconografía

**Un solo sistema: Font Awesome 6** (ya cargado). 
**Prohibido emoji como icono.** Estado actual: 2.163 emoji en el markup,
mezclados con Font Awesome en la misma fila (`📶` junto a `fa-house-signal`).
El emoji se renderiza distinto en cada sistema operativo y es el tell más
fuerte de página generada.

- Tamaño: `1rem` inline en texto, `1.5rem` en tarjeta, `2rem` en hero de segmento
- Color: `currentColor` o el acento del segmento. Nunca degradé.
- Marcas de producto (Windows, Ubiquiti, Hikvision, Microsoft 365): logo real
  a color, nunca icono dibujado.
- Emoji permitido **sólo** como carácter de texto dentro de una frase, nunca
  como icono de una tarjeta, chip o lista de features.

**Excepción decidida el 17/11: el chatbot.** `chatbot.js` y el asistente
embebido en `cliente.html` suman unos 1.300 emoji en las etiquetas de los
botones de respuesta rápida y en el texto de los mensajes
(`{ text: '🔍 Sí, iniciar diagnóstico' }`). En una interfaz de chat el
emoji es idioma del medio, no iconografía: se quedan. Lo que sí se
convirtió es lo que era UI de verdad — las etiquetas de severidad del
portal, que además llevaban el color dentro del emoji, donde ningún CSS
llega. Si alguna vez se rehace el chatbot, revisar esta excepción.

---

## 7. Movimiento

| Token | Valor |
|---|---|
| `--dur` | `180ms` |
| `--dur-slow` | `280ms` (sólo entradas de modal/dropdown) |
| `--ease` | `cubic-bezier(.2,.8,.2,1)` |

- Hover de tarjeta enlazada: `translateY(-2px)` + `--shadow-md`
- Botón: hover sube 1px, `:active` baja a `translateY(0)` con escala 0.98
- Foto dentro de marco: `scale(1.02)` en hover, `overflow:hidden` en el marco
- Transición sólo en `transform`, `opacity`, `background-color`, `border-color`,
  `box-shadow`, `color`. **Nunca `transition: all`** (hoy `--transition: all .25s`)

### Scroll-reveal — recortado
Hoy toda sección entra con `opacity:0 → translateY(36px)` y stagger
(`reveal-delay-1/2/3`). Es el tell de movimiento más citado.
**Nuevo límite: máximo 2 reveals por página**, en la sección que realmente
lo merece. El resto del contenido está visible al cargar.

### Obligatorio
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Estado actual: **0 ocurrencias** de `prefers-reduced-motion` en todo el sitio.

---

## 8. Estados — obligatorios, no opcionales

Cada control los lleva todos. Estado actual: 61 `:hover`, 2 `:active`,
**0 `:focus-visible`**, **0 `:disabled`**.

### Botón
```css
.btn { transition: transform var(--dur) var(--ease), background-color var(--dur) var(--ease); }
.btn:hover   { background: var(--blue-hover); transform: translateY(-1px); }
.btn:active  { transform: translateY(0) scale(.98); }
.btn:focus-visible { outline: 2px solid var(--blue); outline-offset: 3px; }
.btn:disabled, .btn[aria-disabled="true"] {
  background: var(--gray-200); color: var(--gray-500);
  cursor: not-allowed; transform: none;
}
.btn[data-loading] { pointer-events: none; opacity: .7; }
```

### Formulario
- Error **junto al campo**, debajo, con `aria-describedby` y `aria-invalid="true"`
- Borde del campo en error: `--error`; texto de error ≥14px en `--error`
- Estados del envío: reposo → enviando (texto del botón cambia, no spinner solo)
  → éxito (mensaje persistente) → fallo (mensaje + cómo reintentar)
- Nunca `alert()` ni mensaje sólo por color

### Página
Toda vista que carga datos necesita tres pantallas diseñadas:
**cargando**, **vacío** (con la acción que saca del vacío) y **error**
(con qué hacer). No un div en blanco.

Estado al 17/11: `cliente.html` ya tenía las tres; lo que le faltaba era
la acción en el error, que ahora es un botón de reintento real.
`herramientas/` no pide datos a ningún servidor — son calculadoras que
corren en el navegador — así que no necesita los tres estados.

### Foco
```css
:focus-visible { outline: 2px solid var(--blue); outline-offset: 3px; }
.on-dark :focus-visible { outline-color: var(--cyan); }
```
Nunca `outline: none` sin reemplazo visible.

---

## 9. Móvil

- Breakpoints: `900px` (nav) · `768px` (layout) · `480px` (apilado)
- **Cero scroll horizontal.** `body { overflow-x: hidden }` está prohibido:
  oculta el desborde en vez de arreglarlo. Quitarlo y corregir el culpable.
- Área táctil mínima **44×44px** en todo lo clickeable: token `--tap` (44px).
  No es un paso de la escala de §4, es un piso: se usa en `min-width` /
  `min-height`, nunca como padding ni margen. En un checkbox o radio el área
  la da su `<label>`: la caja queda en `--s-5` (24px) y la fila del label
  mide `--tap` de alto.
- El menú móvil ya existe (`#navMenu.open`) — mantener, y cerrar con `Esc`
- El layout aguanta texto al 200% sin romper: usar `rem`, nunca altura fija
  en contenedores de texto
- Tablas: `overflow-x:auto` en un wrapper propio, no en el `body`

---

## 10. Prohibido — lista corta

Estos son los patrones que hacen que una página se lea como generada.
Verificados contra el estado real del sitio:

| # | Patrón | Estado hoy |
|---|---|---|
| 1 | Pill/badge sobre un H1 centrado | `.hero-badge` en index |
| 2 | Orbes/blobs difuminados detrás del hero | `.hero-orb-1/2/3` |
| 3 | `linear-gradient(135deg, …)` como recurso general | 759 usos (pendiente) |
| 4 | Emoji como icono de tarjeta o chip | 2.163 |
| 5 | Fade-up con stagger en todas las secciones | `.reveal-delay-*` |
| 6 | Grilla de 3 o 4 tarjetas idénticas con icono arriba | `.niche-grid` (4) |
| 7 | Mismo radio + misma sombra blanda en todo | 20 radios / 30 sombras |
| 8 | Indicador "scroll" con mouse animado | `.hero-scroll` |
| 9 | Degradé en texto (`background-clip: text`) | revisar |
| 10 | `transition: all` | ~~token `--transition`~~ corregido 15/11 |
| 11 | Título centrado en toda sección | 1.471 `text-align:center` |
| 12 | Números sin fuente verificable | revisar "+11 años" (sí verificable) |
| 13 | Una sola pantalla con dos CTA (primario degradé + fantasma) | revisar |
| 14 | `overflow-x: hidden` en body | sí |

Lo que va en su lugar: fotografía real del trabajo (rack cableado, cámara
instalada, PC abierta), logos reales de los productos que instala, un dato
verificable, y una sola acción por pantalla.

---

## 11. Antes de publicar — checklist por página

- [ ] Una frase en la portada que diga qué se hace, sin adjetivos
- [ ] **Una** acción principal por página, visible sin scroll
- [ ] `<title>` único, `<meta name="description">`, `og:*`, favicon
- [ ] Exactamente un `<h1>`; jerarquía h2/h3 sin saltos
- [ ] Todo `<img>` con `alt`, `width`, `height` y `loading="lazy"` salvo el hero
- [ ] Cero texto de relleno, cero "Lorem", cero `pronto.html` enlazado como oferta
- [ ] Recorrido completo probado: contacto, WhatsApp, login, turnos
- [ ] Navegable sólo con teclado, foco siempre visible
- [ ] Sin scroll horizontal a 390px
- [ ] Legible con texto al 200%

---

## 12. Reglas para el agente

1. Leer este archivo antes de tocar CSS.
2. Nunca escribir un color, tamaño, espacio o radio literal: usar `var(--*)`.
   Si falta el token, agregarlo acá y a `css/tokens.css` primero.
3. Nunca agregar un bloque `<style>` a un HTML. El CSS va en `css/`.
   (Los 337 idénticos se extrajeron a `css/blog.css` el 15/11. Quedan 26
   bloques únicos por revisar. `admin-blog.html` genera artículos con
   `<style>` embebido: hay que hacer que emita un `<link>` a `/css/blog.css`.)
4. Reutilizar las clases que existen antes de inventar marcado nuevo.
5. Al terminar una página: `/impeccable polish`, después `/impeccable audit`.
6. Cualquier excepción a §10 se discute antes, no se implementa y se avisa.

---

## 13. Skills instaladas y cuál manda (18/11/2026)

**Dónde viven:** `%USERPROFILE%\.claude\skills\` — a nivel usuario, no dentro
de este repo. Se movieron el 18/11: eran 44 MB que cada clone del sitio se
bajaba sin necesidad, y las mismas skills sirven en todos los proyectos.
`.claude/skills/` y `.claude/agents/` están en `.gitignore`.

**Excepción (25/11):** lo que sólo tiene sentido para este sitio sí se
versiona en el repo: la skill `chequeo-pagina`, el agente `auditor-tokens` y
el hook guardián (`.claude/hooks/guardian.mjs`). Ver "Automatización" en
CLAUDE.md. `.claude/` sigue en `.vercelignore`: nada de eso se publica.

| Skill | Para qué sirve acá |
|---|---|
| `design-taste-frontend` | Clasificación del sitio: *service / site-kind other*. Prohíbe shaders, escenas y WebGL. Es el que define el techo. |
| `impeccable` | Vocabulario de diseño y los comandos `/impeccable polish` y `/impeccable audit`. |
| `emil-design-eng` | Criterio de prolijidad: estados, detalle, por qué una decisión se siente bien. |
| `break-ui` | Romper una pantalla con datos peores que los reales: nombres largos, cero ítems, emoji, texto no latino. |
| `mobile-native` | CSS y metas que hacen que una web no se sienta "una web en un navegador" en el teléfono. |
| `learn-taste` | Convierte las correcciones de una sesión en reglas dentro de este archivo. |
| `animation-vocabulary` | Buscar el nombre exacto de un efecto antes de pedirlo o escribirlo. |
| `animation-performance` | Que una animación no se coma el presupuesto de frame. |
| `review-animations`, `remove-animations`, `find-animation-opportunities`, `improve-animations` | Auditar movimiento. `remove-animations` es el más útil acá. |
| `animate`, `choreograph`, `gestures`, `apple-design`, `prototype` | Disponibles, de uso excepcional: ver el conflicto abajo. |

**Conflicto a resolver siempre a favor de §10.** Las skills de animación de
Emil Kowalski asumen una app con interacción rica. Este sitio es una web de
servicios: §7 fija una sola duración (`--dur: 180ms`), un solo easing
(`--ease`), y §10 prohíbe el fade-up escalonado, los orbes y los gradientes
decorativos. Si una skill de animación propone movimiento que §10 prohíbe,
gana §10 y se avisa. `remove-animations` empuja en la misma dirección que
este archivo; `animate` y `choreograph`, en la contraria.

No instaladas a propósito, 4 de las 20 del repo: `write-swift` (Swift),
`animate-expo` (React Native), `ask-sonner` y `pick-ui-library` (librerías de
React). Este sitio es HTML, CSS y JS sin framework.

### Skills agregadas el 18/11 (segunda tanda)

| Skill | Para qué sirve acá |
|---|---|
| `ui-ux-pro-max` | Catálogo consultable: 67 estilos de UI, 96 paletas, heurísticas de UX, íconos. Scripts Python de sólo lectura (`scripts/search.py`), stdlib, sin dependencias. |
| `design-system` | Arquitectura de tokens en tres capas (primitivo → semántico → componente). Útil si algún día `tokens.css` crece. |
| `brand` | Voz de marca, mensajes, consistencia. Aplica a los textos, no al CSS. |
| `banner-design` | Piezas para redes y avisos. Fuera del sitio, pero del mismo sistema. |

No instaladas de ese repo: `ui-styling` (5,9 MB de shadcn/ui, Radix y
Tailwind: nada de eso corre acá) y `design` (se solapa con las otras cuatro y
su parte de logos depende de APIs de generación pagas).

**Dato a tener presente:** `ui-ux-pro-max` trae 22 archivos de stack y
ninguno es HTML + CSS a mano. El más cercano es `html-tailwind.csv`. Cuando
proponga clases de utilidad, hay que traducirlas a las clases y tokens de
este proyecto, no adoptar Tailwind.

### Motion (ex Framer Motion) — vendorizado, sin usar

`js/vendor/motion-mini.js`, 24 KB (10 KB gzip), global `window.Motion`, con
`animate`, `animateSequence`, `inView`, `scroll` y `stagger`. Generado con
esbuild desde `node_modules/motion` v14.14.0; se regenera, no se edita.

**No está enlazado en ninguna página, a propósito.** El sitio necesita una
transición de 180 ms y un reveal que ya hace un `IntersectionObserver` de 15
líneas y cero bytes de dependencia. Sumar 10 KB gzip para lo que §10 prohíbe
usar es pérdida neta en una web de servicios que se juzga por lo rápido que
abre. Está disponible para las demos, donde un cliente puede pedir más
movimiento y el presupuesto de peso es otro.

### MCP (`.mcp.json`)

- **playwright** — `@playwright/mcp`. Verificación visual real: render,
  consola, desborde, estados. En Windows requiere una vez:
  `npx playwright install chromium`.
- **figma** — servidor remoto `https://mcp.figma.com/mcp`. Requiere
  autorizar con `/mcp` dentro de Claude Code.
- **21st** — `https://21st.dev/api/mcp`. La clave se lee de la variable de
  entorno `TWENTYFIRST_API_KEY`, nunca va al repo. Genera componentes React
  con shadcn/ui y Tailwind: acá sirve como referencia visual, el código no se
  pega tal cual.

Ninguno de los dos se publica: `.claude/`, `.mcp.json`, `package.json` y
`node_modules/` están en `.vercelignore` desde el 18/11, junto con
`installCommand` y `buildCommand` neutralizados en `vercel.json` para que
Vercel no intente buildear un sitio que no tiene build.

---

## 14. Las demos no comparten andamiaje (18/11/2026)

Medición del 18/11: las 5 demos originales compartían **41 de 57 nombres de
clase CSS** entre sí (maquillaje vs odontología), la misma secuencia de
secciones — `hero · services · trust-split · gallery-section ·
location-section · faq` — y hasta los mismos nombres de token recoloreados
(`--c-charcoal` / `--c-champagne` en peluquería y maquillaje; `--c-navy` en
odontología y veterinaria). Las 5 nuevas comparten 2 clases con ellas.

Eso es lo que hacía que el catálogo se leyera como una plantilla. Un catálogo
de ejemplos cuyo argumento es "cada negocio queda distinto" se desarma solo si
los ejemplos tienen el mismo esqueleto.

**Regla:** una demo nueva o rehecha no reutiliza de otra ni los nombres de
sección, ni los nombres de clase, ni los nombres de token, ni el patrón de
héroe. Paleta y tipografía distintas no alcanzan: el molde se nota igual.
Límite a verificar antes de publicar: **menos de 5 clases compartidas** con
cualquier otra demo.

```bash
# Comparar dos demos
comm -12 <(grep -oE '^\.[a-z][a-z0-9_-]*' demos/A/style.css | sort -u) \
         <(grep -oE '^\.[a-z][a-z0-9_-]*' demos/B/style.css | sort -u) | wc -l
```

### Maquillaje — Sofía Rinaldi, dirección editorial

| | |
|---|---|
| Estilo | Editorial de revista: rejilla asimétrica de 12 columnas, capitular, cita al margen, epígrafe bajo cada foto, filetes como separadores |
| Paleta | Tinta `#15120F` sobre papel `#F7F4EF`, acento vino `#7A2E46`. Once pares medidos, todos por encima de 4.5:1 |
| Tipografía | Bodoni Moda (display, alto contraste) + Jost (texto). Vendorizadas en `fonts/`, 76 KB; antes cargaba Google Fonts por CDN |
| Héroe | Titular a todo el ancho, sin foto al lado. La foto de apertura va debajo, a 9 columnas, con epígrafe |
| WhatsApp | Sin burbuja flotante: CTA en la cabecera. La barra de demostración ya ocupa el borde inferior y dos barras fijas en un teléfono es una de más |
| Clases compartidas con odontología | 41 antes, **0** ahora |

### Las diez direcciones (18/11/2026)

Cada demo tiene un **organizador visual** propio: no alcanza con cambiar
paleta y tipografía, tiene que cambiar qué estructura la página.

| Demo | Organizador | Paleta | Tipografía |
|---|---|---|---|
| Maquillaje · Sofía Rinaldi | Editorial de revista: rejilla asimétrica, capitular, cita al margen | papel / tinta / vino | Bodoni Moda + Jost |
| Barbería · Corte Urbano | Doble panel: foto fija a media pantalla, contenido scrolleando al lado. Pizarra de precios con puntos guía | noche / crudo / rojo señal | Josefin Sans + Roboto Mono |
| Peluquería · Atelier Recoleta | Muestrario de color: la marca se queda en blanco y negro para que el único color sea el del pelo | blanco y negro + 6 swatches | Syne + Hanken Grotesk |
| Odontología · Inst. Rossi | Ficha clínica: tabla real con sesiones, duración y anestesia; protocolo numerado | nieve / grafito / turquesa | Red Hat Display + Text |
| Veterinaria · Centro Pampa | Panel operativo: banda de estado "abierto ahora", cifras, grilla de horarios | ultramar / crema / ámbar | Manrope sola |
| Jurídico · Marchetti | Secciones apiladas, sobriedad institucional | verde inglés / dorado | Libre Baskerville + Source Sans 3 |
| Gimnasio · Fragua | Tipografía como gesto, bloques duros | negro / lima | Archivo Black + Barlow |
| Taller · Peralta | Hoja de especificaciones | petróleo / naranja | Roboto Condensed + IBM Plex Sans |
| Parrilla · Don Ciro | Carta impresa | marrón / brasa | Zilla Slab + Karla |
| Inmobiliaria · Riera | Fichas de propiedad | carbón / cobre | Fraunces + Work Sans |

### Matriz de solapamiento — medida, no estimada

Clases CSS compartidas entre cada par, 18/11:

- Las 5 rehechas entre sí y contra el resto: **0 a 3**.
- Las 5 del 17/11 entre sí: **21 a 25**.

**Las 5 del 17/11 no cumplen la regla de arriba.** Comparten un chasis de 21
clases: `.wrap .top .nav .brand .burger .hero .btn .btn--line .form .campo
.pie .skip` y el resto. Es un problema más leve que el de las originales
—aquello era la misma secuencia de secciones y el mismo layout; esto es
infraestructura que el visitante no ve nombrada— pero produce el mismo ritmo
de cabecera, héroe y pie en las cinco, y el mismo formulario.

Queda pendiente decidir si se rehacen. No es urgente: visualmente se
distinguen bien entre ellas. Pero la regla es la regla y hoy cinco de diez
no la cumplen.

---

## 15. Movimiento permitido — excepciones a §10 (18/11/2026)

§10 prohíbe el movimiento **decorativo**: el fade-up escalonado, los orbes,
los gradientes que se mueven. Eso no cambia. Lo que se permite, caso por
caso y anotado acá, es el movimiento que **carga información**: continuidad,
causalidad, jerarquía o estado.

La prueba para aceptar uno nuevo: si al sacarlo el usuario pierde una pista
sobre qué pasó o dónde está, el movimiento estaba haciendo un trabajo. Si al
sacarlo la página sólo queda más sobria, era decoración y se saca.

### 15.1 — Catálogo → demo: la miniatura crece hasta ser la página

**Implementado.** `demos/transicion.css` + `demos/transicion.js`, cargados
por el catálogo y por las diez demos.

Qué comunica: que la miniatura y la demo son la misma cosa a dos tamaños, y
que el catálogo y los ejemplos son un solo producto. Sin esto hay un
parpadeo en blanco y la relación entre lo que tocaste y lo que apareció se
pierde.

Cómo funciona:

- `@view-transition { navigation: auto; }` en las once páginas.
- La raíz de cada demo se llama `tapa` (`.es-demo:root`), así el morph es
  miniatura → página entera y no miniatura → una foto suelta de adentro.
  Eso además evita el estirado al pasar de 16:10 a vertical.
- `transicion.js` le pone la clase `.tapa-activa` a la miniatura correcta en
  `pageswap` (ida) y en `pagereveal` (vuelta), porque el nombre tiene que ser
  único en el documento y el catálogo tiene diez.
- 420 ms para el grupo. La capa vieja se va en 180 ms: lo que importa es el
  movimiento, no ver dos capas superpuestas.

Soporte: Chrome 126+, Edge 126+, Safari 18.2+. Firefox todavía no tiene
transiciones entre documentos. Quien no lo soporta navega como siempre y no
ve nada roto: es mejora progresiva, no una dependencia.

Con `prefers-reduced-motion: reduce` no corre ninguna animación —
verificado en navegador: a los 150 ms la página de destino ya está entera y
en su lugar, sin caja creciendo.

### 15.2 — Propuestas sin implementar

Quedan evaluadas y no construidas. Cada una necesita su propia entrada acá
antes de entrar al código:

| Demo | Movimiento | Qué comunica |
|---|---|---|
| Barbería | La foto fija escala de 1.00 a 1.06 a lo largo del scroll | Que la foto y el texto son una escena, no dos columnas |
| Peluquería | El tono del muestrario crece al pasar el mouse o al tocarlo, los otros se comprimen | Estás eligiendo un color y lo ves más grande para decidir |
| Odontología | La línea del protocolo se traza hacia abajo y cada número se rellena al alcanzarlo | Secuencia y avance, que es el contenido de esa sección |
| Veterinaria | El punto de "abierto ahora" late cada 2 s, sólo si está abierto | Que el dato es en vivo y no un cartel impreso |

Las tres primeras son CSS puro con `animation-timeline`, que es Baseline
desde Firefox 159: Chrome 115, Edge 115, Firefox 159, Safari 26. Ninguna
necesita los 10 KB de Motion que están vendorizados en `js/vendor/`.

### 15.3 — Deuda detectada el 18/11, sin tocar

**365 archivos HTML cargan Font Awesome desde `cdnjs.cloudflare.com`.** Es un
punto único de falla externo, una fuga de datos de cada visitante hacia un
tercero, y contradice el trabajo de vendorizar las fuentes de las demos. Hay
que bajarlo al repo y cambiar los 365 enlaces. No se hizo todavía.
