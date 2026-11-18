/* Atelier Recoleta — sin JS la página se ve y se usa entera. */
(function () {
  'use strict';
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var boton = document.getElementById('abrir');
  var sendas = document.getElementById('sendas');

  if (boton && sendas) {
    boton.addEventListener('click', function () {
      var abierta = sendas.classList.toggle('abierta');
      boton.setAttribute('aria-expanded', String(abierta));
      boton.setAttribute('aria-label', abierta ? 'Cerrar menú' : 'Abrir menú');
    });
    sendas.addEventListener('click', function (e) { if (e.target.tagName === 'A') cerrar(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sendas.classList.contains('abierta')) { cerrar(); boton.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 768) cerrar(); });
  }
  function cerrar() {
    if (!sendas) return;
    sendas.classList.remove('abierta');
    if (boton) { boton.setAttribute('aria-expanded','false'); boton.setAttribute('aria-label','Abrir menú'); }
  }

  var piezas = document.querySelectorAll('.sale');
  if (quieto || !('IntersectionObserver' in window)) {
    for (var i=0;i<piezas.length;i++) piezas[i].classList.add('visible');
    return;
  }
  var obs = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  for (var j=0;j<piezas.length;j++) obs.observe(piezas[j]);
})();
