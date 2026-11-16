(function () {
  'use strict';

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var abierto = nav.classList.toggle('abierto');
      burger.setAttribute('aria-expanded', String(abierto));
      burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('abierto')) {
        nav.classList.remove('abierto');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('abierto');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Validación con el error al lado del campo, no arriba ni en un alert
  var form = document.getElementById('form');
  if (!form) return;
  var campos = ['nom', 'tel', 'materia', 'det'];

  function validar(id) {
    var el = document.getElementById(id);
    var err = document.getElementById('err-' + id);
    var bien = el.value.trim() !== '';
    el.closest('.campo').toggleAttribute('data-error', !bien);
    el.setAttribute('aria-invalid', String(!bien));
    if (err) {
      err.hidden = bien;
      el.setAttribute('aria-describedby', bien ? '' : 'err-' + id);
    }
    return bien;
  }

  campos.forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('blur', function () { validar(id); });
    el.addEventListener('input', function () {
      if (el.closest('.campo').hasAttribute('data-error')) validar(id);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = campos.map(validar).every(Boolean);
    if (!ok) {
      var primero = form.querySelector('[data-error] input, [data-error] select, [data-error] textarea');
      if (primero) primero.focus();
      return;
    }
    var btn = document.getElementById('enviar');
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    btn.textContent = 'Enviando…';
    window.setTimeout(function () {
      form.reset();
      btn.disabled = false;
      btn.removeAttribute('aria-disabled');
      btn.textContent = 'Pedir turno';
      document.getElementById('ok').hidden = false;
    }, 900);
  });
})();
