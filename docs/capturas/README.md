# Capturas de referencia

Tomadas con Playwright (Chromium) el 25/11/2026 sobre el repo local. Con Chatwoot bloqueado, el movimiento reducido y `.reveal` visible. En los recortes, además, la barra fija y el aviso de cookies ocultos.
`docs/` está en `.vercelignore`: no se publica.

| Archivo | Qué muestra | Commit |
|---|---|---|
| `soporte-antes-{390,1280}.png` / `soporte-despues-*` | soporte.html antes y después de cargar nav.css antes que soporte.css | 4ba4955 |
| `soporte-dif-{390,1280}.png` | Diferencia de píxeles entre las dos anteriores: 0 píxeles (todo gris) | 4ba4955 |
| `checkbox-{antes,despues}.png` | Checkbox de «Solicito visita técnica» de 18 a 24 px, label de 44 de alto | fd5f07f |
| `social-{antes,despues}.png` | Enlaces sociales del pie de 36 a 44 px | fd5f07f |
| `blog-trama-{390,1280}.png` | Tarjetas de artículos con la trama de puntos que apareció al arreglar `content: ''` | b025509 → borrada en 02d3406 |
| `tarjeta-{con,sin}.png` | Una tarjeta con y sin la trama, a 1280 | 02d3406 |
| `iconos-{antes,despues}-{390,1280}.png` | Iconos de las tarjetas de artículos: `--text` heredado vs `--white` | 08b90b3 |
| `herr-index-1280.png` | herramientas/index.html con `--blue` anulada por `--blue: var(--blue)` en herramientas/base.css: enlaces negros, iconos casi invisibles, botón «Contacto» invisible | corregido en el commit siguiente |
| `blue-autoref/<página>-{antes,despues}-{390,1280}.png` | Las 4 páginas de herramientas/ y cliente.html antes y después de sacar `--blue: var(--blue)` | ver git log |
| `peso-600/<página>-despues-{390,1280}.png` | Las mismas 5 páginas con la cara 600 de Space Grotesk pedida. El "antes" es `blue-autoref/*-despues-*`: 0 píxeles de diferencia (1 en chequeo-seguridad a 1280, antialiasing) | ver git log |
