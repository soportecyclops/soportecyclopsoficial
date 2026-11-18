/* Centro Veterinario Pampa — sin JS la página se ve y se usa entera.
   La banda de estado muestra el horario fijo si esto no corre. */
(function () {
  'use strict';
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Menú --- */
  var boton = document.getElementById('menu');
  var enlaces = document.getElementById('enlaces');
  if (boton && enlaces) {
    boton.addEventListener('click', function () {
      var abierta = enlaces.classList.toggle('abierta');
      boton.setAttribute('aria-expanded', String(abierta));
      boton.setAttribute('aria-label', abierta ? 'Cerrar menú' : 'Abrir menú');
    });
    enlaces.addEventListener('click', function (e) { if (e.target.tagName === 'A') cerrar(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && enlaces.classList.contains('abierta')) { cerrar(); boton.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 768) cerrar(); });
  }
  function cerrar() {
    if (!enlaces) return;
    enlaces.classList.remove('abierta');
    if (boton) { boton.setAttribute('aria-expanded','false'); boton.setAttribute('aria-label','Abrir menú'); }
  }

  /* --- ¿Abierto ahora? Lunes a sábado de 9 a 20, hora de Buenos Aires.
         Se calcula sobre la hora de Buenos Aires y no sobre la del
         visitante: alguien mirando desde Madrid tiene que ver si la
         clínica está abierta, no si lo está a su hora. --- */
  var texto = document.getElementById('estado-texto');
  var punto = document.getElementById('punto');
  if (texto && punto) {
    try {
      var f = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
      }).formatToParts(new Date());
      var h = 0, dia = '';
      f.forEach(function (p) {
        if (p.type === 'hour') h = parseInt(p.value, 10);
        if (p.type === 'weekday') dia = p.value.toLowerCase();
      });
      var domingo = dia.indexOf('dom') === 0;
      var abierto = !domingo && h >= 9 && h < 20;
      texto.textContent = abierto
        ? 'Abierto ahora · cerramos a las 20'
        : 'Cerrado ahora · lunes a sábado, 9 a 20';
      punto.classList.toggle('punto--cerrado', !abierto);
    } catch (e) {
      /* Si Intl falla, queda el horario fijo que ya está en el HTML. */
    }
  }

  /* --- Aparición --- */
  var piezas = document.querySelectorAll('.aflora');
  if (quieto || !('IntersectionObserver' in window)) {
    for (var i=0;i<piezas.length;i++) piezas[i].classList.add('visible');
    return;
  }
  var obs = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  for (var j=0;j<piezas.length;j++) obs.observe(piezas[j]);
})();
