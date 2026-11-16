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

### Marca (vigente)
| Token | Valor | Uso |
|---|---|---|
| `--blue` | `#2563eb` | acción primaria, enlaces, foco |
| `--blue-hover` | `#1d4ed8` | hover de acción |
| `--blue-dark` | `#1a3a5c` | titulares sobre claro, logo |
| `--navy` | `#1e3a8a` | fondos oscuros profundos |
| `--cyan` | `#00c6ff` | acento, **≤1 por pantalla** |

> `#2563eb` es exactamente Tailwind `blue-600`. Es el azul por defecto de
> toda página generada. Decisión pendiente (ver §10): desplazarlo a un azul
> propio manteniendo el contraste.

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
- Botón azul sobre blanco y texto blanco sobre `--blue`: ambos verificados
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

**Escala cerrada — 7 tamaños, ninguno más.** Tokens a crear:
`--t-label .8125rem` · `--t-small .875rem` · `--t-body 1rem` · `--t-lead 1.125rem`
· `--t-h3 1.375rem` · `--t-h2 clamp(...)` · `--t-h1 clamp(...)`

> Estado actual: **89 valores distintos de `font-size`** en 16.014
> declaraciones. Es la causa número uno de que el sitio se lea inconsistente.
> Ningún `font-size` literal en código nuevo: sólo `var(--t-*)`.

Mínimo de cuerpo: 16px. Nunca bajar de 14px ni en nota al pie.
Línea de texto: máx. 72 caracteres (`max-width: 68ch`).

---

## 4. Espaciado

Escala de 8 (múltiplos exactos, sin valores intermedios):

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
Toda vista que carga datos (panel cliente, blog filtrado, herramientas)
necesita tres pantallas diseñadas: **cargando**, **vacío** (con la acción que
saca del vacío) y **error** (con qué hacer). No un div en blanco.

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
- Área táctil mínima **44×44px** en todo lo clickeable
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
| 3 | `linear-gradient(135deg, …)` como recurso general | 759 usos |
| 4 | Emoji como icono de tarjeta o chip | 2.163 |
| 5 | Fade-up con stagger en todas las secciones | `.reveal-delay-*` |
| 6 | Grilla de 3 o 4 tarjetas idénticas con icono arriba | `.niche-grid` (4) |
| 7 | Mismo radio + misma sombra blanda en todo | 20 radios / 30 sombras |
| 8 | Indicador "scroll" con mouse animado | `.hero-scroll` |
| 9 | Degradé en texto (`background-clip: text`) | revisar |
| 10 | `transition: all` | token `--transition` |
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
   (Hoy hay 364 bloques `<style>`, 4,1 MB, 337 de ellos idénticos.)
4. Reutilizar las clases que existen antes de inventar marcado nuevo.
5. Al terminar una página: `/impeccable polish`, después `/impeccable audit`.
6. Cualquier excepción a §10 se discute antes, no se implementa y se avisa.
