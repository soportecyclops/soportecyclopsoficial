/* Transición catálogo <-> demo.
   Sólo marca cuál de las diez miniaturas es la que participa.
   Si el navegador no soporta transiciones entre documentos,
   esto no hace nada visible y la navegación es la de siempre. */
(function () {
  'use strict';
  if (!('startViewTransition' in document)) return;

  var CLASE = 'tapa-activa';

  function limpiar() {
    var previa = document.querySelector('.' + CLASE);
    if (previa) previa.classList.remove(CLASE);
  }

  /* Devuelve la imagen de la tarjeta que apunta a esa URL */
  function miniaturaDe(url) {
    if (!url) return null;
    var ruta;
    try { ruta = new URL(url).pathname; } catch (e) { return null; }
    var enlace = document.querySelector('a[href="' + ruta + '"]');
    return enlace ? enlace.querySelector('img') : null;
  }

  /* Al salir del catálogo hacia una demo */
  window.addEventListener('pageswap', function (e) {
    if (!e.viewTransition) return;
    limpiar();
    var img = miniaturaDe(e.activation && e.activation.entry && e.activation.entry.url);
    if (img) img.classList.add(CLASE);
  });

  /* Al volver a el catálogo desde una demo */
  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    limpiar();
    var desde = window.navigation && navigation.activation && navigation.activation.from;
    var img = miniaturaDe(desde && desde.url);
    if (img) {
      img.classList.add(CLASE);
      /* Una vez terminada, el nombre se suelta: si queda puesto,
         la próxima navegación arranca con el nombre equivocado. */
      e.viewTransition.finished.then(limpiar, limpiar);
    }
  });
})();
