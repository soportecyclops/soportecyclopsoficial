/* Sofía Rinaldi — comportamiento mínimo.
   Regla: sin JS la página se ve y se usa entera. Esto sólo agrega
   comodidades encima. */
(function () {
  'use strict';

  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Menú del teléfono --- */
  var boton = document.getElementById('menu-boton');
  var indice = document.getElementById('indice');

  if (boton && indice) {
    boton.addEventListener('click', function () {
      var abierto = indice.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', String(abierto));
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });

    /* Al elegir una sección, se cierra */
    indice.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') cerrar();
    });

    /* Escape cierra y devuelve el foco al botón */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && indice.classList.contains('abierto')) {
        cerrar();
        boton.focus();
      }
    });

    /* Si la ventana crece hasta el ancho de escritorio, el menú deja de
       tener sentido abierto */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) cerrar();
    });
  }

  function cerrar() {
    if (!indice) return;
    indice.classList.remove('abierto');
    if (boton) {
      boton.setAttribute('aria-expanded', 'false');
      boton.setAttribute('aria-label', 'Abrir menú');
    }
  }

  /* --- Aparición al scroll --- */
  var piezas = document.querySelectorAll('.asoma');

  if (quieto || !('IntersectionObserver' in window)) {
    for (var i = 0; i < piezas.length; i++) piezas[i].classList.add('visible');
    return;
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  for (var j = 0; j < piezas.length; j++) observador.observe(piezas[j]);
})();
