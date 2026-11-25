/* Soporte Cyclops — buscador y "más leídos" del índice del blog.
   Mejora progresiva: sin JS se ven todas las tarjetas como siempre.
   Fuente del texto completo: /data/blog-articles.json (lo mantiene el CMS).
   Fuente de "más leídos": Apps Script del portal, acción blog_mas_leidos
   (código en PENDIENTES.md, 25/11). Si no responde, queda la lista fija. */
(function () {
  'use strict';

  var API = 'https://script.google.com/macros/s/AKfycbwYHXr-AyhpaTLRydiQpE7S0boDZbK5_GEjjoI7GIlXaBpQdO7vO1tAhiriYvhms36P/exec';
  var WA = 'https://wa.me/5491151758025?text=';

  var form = document.getElementById('blogBuscar');
  var input = document.getElementById('blogQ');
  var grid = document.querySelector('.related-grid');
  if (!form || !input || !grid) return;

  var estado = document.getElementById('blogEstado');
  var vacio = document.getElementById('blogVacio');
  var limpiar = document.getElementById('blogLimpiar');
  var chipsCat = [].slice.call(document.querySelectorAll('[data-cat]'));
  var chipsQ = [].slice.call(document.querySelectorAll('[data-q]'));

  /* ---------- normalización ---------- */
  function norm(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }

  var VACIAS = ' a al algo ahora anda ayuda con como cual cuando de del el en es esta este funciona hace hacer hay la las le lo los me mi mis mucho muy nada necesito no o para pero poco por problema puedo que quiero se sin siempre su sus te tengo tiene todo un una uno y ya ';

  var SINONIMOS = [
    ['pc', 'compu', 'computadora', 'ordenador', 'notebook', 'laptop', 'equipo', 'maquina'],
    ['lenta', 'lento', 'lentitud', 'tarda', 'tilda', 'colgada', 'cuelga', 'traba', 'demora'],
    ['wifi', 'senal', 'inalambrica', 'router', 'repetidor'],
    ['internet', 'conexion', 'fibra', 'proveedor', 'corta'],
    ['virus', 'malware', 'hackeo', 'hackearon', 'hackeado', 'ransomware', 'estafa', 'phishing'],
    ['camara', 'cctv', 'dvr', 'nvr', 'videovigilancia', 'seguridad'],
    ['arranca', 'enciende', 'prende', 'inicia', 'bootea'],
    ['impresora', 'imprime', 'imprimir'],
    ['contrasena', 'clave', 'password'],
    ['robaron', 'robo', 'robada', 'perdi', 'acceso', 'cuenta', 'recuperar'],
    ['correo', 'mail', 'email', 'gmail'],
    ['backup', 'respaldo', 'copia', 'recuperar'],
    ['disco', 'ssd', 'hdd', 'rigido'],
    ['celular', 'telefono', 'movil'],
    ['luz', 'energia', 'ups', 'electrica', 'corte']
  ];

  function raiz(t) { return t.length > 6 ? t.slice(0, -2) : t; }

  function grupos(q) {
    return norm(q).split(' ').filter(function (t) {
      return t && VACIAS.indexOf(' ' + t + ' ') < 0;
    }).map(function (t) {
      var g = [t];
      SINONIMOS.forEach(function (s) {
        if (s.some(function (x) { return raiz(x) === raiz(t) || x === t; })) g = g.concat(s);
      });
      return g.map(raiz).filter(function (x, i, a) { return a.indexOf(x) === i; });
    });
  }

  /* ---------- índice ---------- */
  var cards = [].slice.call(grid.querySelectorAll('.related-card')).map(function (el, i) {
    var m = (el.getAttribute('href') || '').match(/\/blog\/([^\/.]+)/);
    var tag = el.querySelector('.c-tag');
    var h = el.querySelector('h3, h4');
    var titulo = h ? h.textContent : '';
    return {
      el: el, orden: i, slug: m ? m[1] : '',
      cat: tag ? tag.className.replace('c-tag', '').trim() : '',
      catTxt: tag ? tag.textContent.trim() : '',
      titulo: titulo,
      t: ' ' + norm(titulo) + ' ', r: '', c: ''
    };
  });
  var porSlug = {};
  cards.forEach(function (c) { porSlug[c.slug] = c; });

  var cargado = null;
  function cargarTexto() {
    if (cargado) return cargado;
    cargado = fetch('/data/blog-articles.json', { cache: 'force-cache' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        (d.articulos || []).forEach(function (a) {
          var c = porSlug[a.slug];
          if (!c) return;
          c.resumen = a.resumen || '';
          c.r = ' ' + norm((a.resumen || '') + ' ' + (a.lead || '')) + ' ';
          c.c = ' ' + norm(a.cuerpo) + ' ';
        });
      })
      .catch(function () { /* sin texto completo: se busca en títulos */ });
    return cargado;
  }

  function cuenta(txt, r) {
    var n = 0, i = txt.indexOf(' ' + r);
    while (i > -1 && n < 3) { n++; i = txt.indexOf(' ' + r, i + 1); }
    return n;
  }

  /* Por cada palabra buscada (grupo): g[0] es la palabra tal cual, el resto
     sus sinónimos, que pesan la mitad (así «señales» no compite con «wifi»).
     Devuelve p (puntaje total), tit (cuánto de la búsqueda está en el título:
     1 por palabra literal, 0,5 por sinónimo) y lit (todas las palabras están
     literales en el título). */
  function puntaje(c, gs, todas) {
    var total = 0, hechas = 0, tit = 0, lit = true;
    gs.forEach(function (g) {
      var p = 0, t = 0;
      g.forEach(function (r, i) {
        var w = i === 0 ? 1 : 0.5;
        var enTit = cuenta(c.t, r);
        p = Math.max(p, w * (enTit * 10 + cuenta(c.r, r) * 4 + cuenta(c.c, r)));
        if (enTit) t = Math.max(t, w);
      });
      if (p > 0) hechas++;
      if (t < 1) lit = false;
      total += p;
      tit += t;
    });
    if (todas && hechas < gs.length) return { p: 0, tit: 0, lit: false };
    return { p: total, tit: tit, lit: lit };
  }

  /* ---------- pintar ---------- */
  var cat = '';

  function resumenDe(c, mostrar) {
    var p = c.el.querySelector('.r-res');
    if (mostrar && c.resumen) {
      if (!p) {
        p = document.createElement('p');
        p.className = 'r-res';
        c.el.insertBefore(p, c.el.querySelector('.r-time'));
      }
      p.textContent = c.resumen;
    } else if (p) {
      p.remove();
    }
  }

  function aplicar() {
    var q = input.value.trim();
    var gs = grupos(q);
    var lista, parecidos = false;

    if (gs.length) {
      var puntuar = function (todas) {
        return cards.map(function (c) { var s = puntaje(c, gs, todas); s.c = c; return s; })
          .filter(function (x) { return x.p > 0; });
      };
      lista = puntuar(true);
      if (!lista.length && gs.length > 1) {
        parecidos = true;
        lista = puntuar(false);
      }
      // Coincidir en el título manda: después el puntaje, después el orden fijo.
      lista.sort(function (a, b) { return b.tit - a.tit || b.p - a.p || a.c.orden - b.c.orden; });
      // Corte: la mitad del mejor puntaje. Lo que tiene todas las palabras
      // literales en el título queda siempre.
      var mejor = lista.reduce(function (m, x) { return Math.max(m, x.p); }, 0);
      var corte = Math.max(3, mejor * 0.5);
      lista = lista.filter(function (x) { return x.lit || x.p >= corte; }).map(function (x) { return x.c; });
    } else {
      lista = cards.slice();
    }
    if (cat) lista = lista.filter(function (c) { return c.cat === cat; });

    cards.forEach(function (c) { c.el.hidden = true; resumenDe(c, false); });
    lista.forEach(function (c) {
      c.el.hidden = false;
      grid.appendChild(c.el);
      resumenDe(c, gs.length > 0);
    });

    var n = lista.length;
    if (!gs.length && !cat) {
      estado.textContent = cards.length + ' artículos';
    } else if (n) {
      estado.textContent = (parecidos ? 'No hay uno exacto. Estos se parecen: ' : '') +
        n + (n === 1 ? ' artículo' : ' artículos') + (q ? ' para «' + q + '»' : '');
    } else {
      estado.textContent = 'Sin resultados' + (q ? ' para «' + q + '»' : '');
    }

    vacio.hidden = n > 0;
    if (!n) {
      var txt = 'Hola! Busqué en el blog "' + q + '" y no encontré. Mi problema es: ';
      document.getElementById('blogVacioWa').href = WA + encodeURIComponent(txt);
    }
    limpiar.hidden = !q;

    chipsCat.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === cat)); });

    try {
      var u = new URL(location.href);
      if (q) u.searchParams.set('q', q); else u.searchParams.delete('q');
      if (cat) u.searchParams.set('cat', cat); else u.searchParams.delete('cat');
      history.replaceState(null, '', u);
    } catch (e) {}
  }

  var espera;
  function alEscribir() {
    clearTimeout(espera);
    espera = setTimeout(function () { cargarTexto().then(aplicar); aplicar(); }, 120);
  }

  input.addEventListener('input', alEscribir);
  input.addEventListener('focus', cargarTexto, { once: true });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    cargarTexto().then(aplicar);
    var primero = grid.querySelector('.related-card:not([hidden])');
    if (primero) primero.focus();
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && input.value) { input.value = ''; aplicar(); }
  });
  limpiar.addEventListener('click', function () { input.value = ''; aplicar(); input.focus(); });

  chipsCat.forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-cat');
      cat = (cat === v) ? '' : v;
      aplicar();
    });
  });
  chipsQ.forEach(function (b) {
    b.addEventListener('click', function () {
      input.value = b.getAttribute('data-q');
      cargarTexto().then(aplicar);
      aplicar();
      input.focus();
    });
  });

  var asistente = document.getElementById('blogVacioIris');
  if (asistente) {
    asistente.addEventListener('click', function () {
      if (typeof window.abrirAsistente === 'function') window.abrirAsistente();
      else location.href = document.getElementById('blogVacioWa').href;
    });
  }

  document.addEventListener('keydown', function (e) {
    var t = e.target.tagName;
    if (e.key === '/' && t !== 'INPUT' && t !== 'TEXTAREA' && !e.target.isContentEditable) {
      e.preventDefault();
      input.focus();
    }
  });

  /* estado inicial desde la URL (?q=…&cat=…) */
  try {
    var p = new URLSearchParams(location.search);
    if (p.get('cat')) cat = p.get('cat');
    if (p.get('q')) { input.value = p.get('q'); cargarTexto().then(aplicar); }
  } catch (e) {}
  aplicar();

  /* ---------- más leídos ---------- */
  var caja = document.getElementById('masLeidos');
  if (!caja || !window.fetch) return;
  fetch(API + '?action=blog_mas_leidos&n=8')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var top = ((d && d.top) || []).filter(function (x) { return porSlug[x.slug]; }).slice(0, 5);
      if (top.length < 3) return;
      var lista = caja.querySelector('.ml-lista');
      lista.innerHTML = '';
      top.forEach(function (x, i) {
        var c = porSlug[x.slug];
        var a = document.createElement('a');
        a.className = 'side-rel ml-item';
        a.href = c.el.getAttribute('href');
        a.innerHTML = '<span class="ml-n" aria-hidden="true"></span><span class="sr-t"></span>';
        a.querySelector('.ml-n').textContent = String(i + 1);
        a.querySelector('.sr-t').textContent = c.titulo;
        lista.appendChild(a);
      });
      caja.querySelector('.ml-titulo').textContent = 'Más leídos';
    })
    .catch(function () { /* queda la lista fija */ });
})();
