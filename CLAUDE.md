# Soporte Cyclops — instrucciones del proyecto

Sitio estático (HTML/CSS/JS sin build) desplegado en Vercel desde GitHub.

## Diseño

@DESIGN.md
@PRODUCT.md

Leer ambos antes de tocar markup o CSS. `DESIGN.md` manda sobre cualquier
preferencia propia: color, tamaño tipográfico, espaciado, radio y sombra
salen de los tokens de `css/tokens.css`.

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

## Agentes

Skills instaladas en `.claude/skills/`: `design-taste-frontend` (taste-skill 2.5.1,
clasificación de este sitio: **service** / site-kind **other**) e `impeccable`.
