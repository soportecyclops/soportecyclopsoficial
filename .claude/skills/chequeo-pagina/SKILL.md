---
name: chequeo-pagina
description: Verifica en un navegador real la parte objetiva del checklist de DESIGN.md §11 de Soporte Cyclops — un solo h1 y jerarquía sin saltos, img con alt/width/height, cero scroll horizontal a 390 y 1280 px (y overflow-x oculto en body), metadatos title/description/og/favicon, bloques <style>, emoji usados como icono, errores de consola, recursos locales rotos y área táctil. Usar al terminar o tocar una página del sitio, antes de /impeccable audit, o cuando el usuario pida chequear, verificar o revisar una página.
argument-hint: "<ruta.html | carpeta/> [...] | --raiz  [--offline] [--json]"
---

# chequeo-pagina

Corre `check.mjs` contra el repo local con Playwright y devuelve un informe
pasa/falla por página. Cubre lo **medible** de DESIGN.md §11; el juicio de
diseño sigue siendo de `/impeccable audit`.

## Cómo correrlo

Desde la raíz del repo:

```bash
node .claude/skills/chequeo-pagina/check.mjs $ARGUMENTS
```

- Rutas relativas a la raíz: `index.html`, `servicios-pymes.html`, `blog/backup-pymes/`
  (una carpeta se resuelve a su `index.html`). Varias a la vez, separadas por espacio.
- `--raiz`: todas las páginas públicas del nivel raíz (excluye `admin*`,
  `cliente*`, `login`, `404`, `pronto` y la verificación de Google).
- `--offline`: corta todo pedido externo (Chatwoot, CDN de Font Awesome,
  fuentes). Usarlo si no hay red o para aislar errores propios.
- `--json`: salida estructurada.

Si el usuario no pasa ruta, preguntar cuál o usar la página que se acaba de editar.
Tarda ~4 s por página. Código de salida 1 si hay algún ✖.

## Qué controla

| Marca | Control | Fuente |
|---|---|---|
| ✖ | Bloques `<style>` en el HTML fuente | CLAUDE.md regla 1 |
| ✖ | `<title>`, meta description, favicon, `lang`; `og:title/description/image` salvo `noindex` | §11 |
| ✖ | Exactamente un `<h1>`, sin saltos de nivel al bajar | CLAUDE.md regla 4 |
| ✖ | Todo `<img>` con `alt`, `width` y `height` | §11 |
| ✖ | Scroll horizontal a 390 y 1280 px, con el elemento culpable | §9 |
| ✖ | `overflow-x: hidden/clip` en `html` o `body` | §9, §10 #14 |
| ✖ | Emoji como icono (clase icon/chip/badge/pill/tag/feature, `<i>`, o elemento sólo-emoji). El chatbot está exceptuado | §6 |
| ✖ | Errores de consola y excepciones; recursos locales 4xx | §11 |
| ⚠ | `loading="lazy"` faltante fuera de la primera pantalla, o puesto en la primera | §11 |
| ⚠ | Controles bajo 44×44 px a 390 (los enlaces dentro de texto no cuentan) | §9 |
| ⚠ | Sin `canonical`; recursos externos que fallaron | — |

**Queda manual** (decirlo en el informe): navegación sólo con teclado y foco
visible, texto al 200 %, y el recorrido real de contacto, WhatsApp, login y turnos.

## Cómo informar

1. Correr el script y leer la salida completa.
2. Resumir por página: primero los ✖ con el archivo y la línea del fuente
   donde está la causa (buscarla con Grep: el script nombra el selector, el
   título o la imagen), después los ⚠ que valga la pena atender.
3. No arreglar nada sin que el usuario lo pida. Si lo pide, el arreglo respeta
   DESIGN.md (tokens, nada de `<style>`, nada de `overflow-x: hidden`) y se
   vuelve a correr el chequeo para confirmar.

## Navegador

Usa el Chromium de Playwright si está instalado (`npx playwright install chromium`);
si no, el Chrome o el Edge del sistema. No hace falta descargar nada si hay Chrome.

## Prueba de la propia skill

`fixtures/mala.html` tiene que dar 10 ✖ y `fixtures/oculta.html` tiene que
señalar el `overflow-x` en body y al `div.ancha` como culpable. Si un cambio
en `check.mjs` hace que alguno deje de fallar, el cambio rompió un control.
