/* Soporte Cyclops — comportamiento del navbar único */
(function(){
  function init(){
    var nav=document.getElementById('navbar'),menu=document.getElementById('navMenu'),btn=document.getElementById('menuToggle');
    if(!nav) return;
    // Toggle mobile solo si la página no tiene su propio handler
    var handled=[].some.call(document.scripts,function(s){return /main\.js$/.test(s.src)||(!s.src&&s.textContent.indexOf('menuToggle')>-1);});
    if(btn&&menu&&!handled){
      btn.addEventListener('click',function(){menu.classList.toggle('open');btn.innerHTML=menu.classList.contains('open')?'<i class="fas fa-times"></i>':'<i class="fas fa-bars"></i>';});
      window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>20);});
    }
    // Dropdown "Accesos": click en mobile / teclado
    [].forEach.call(nav.querySelectorAll('.nav-dropdown > .nav-link'),function(t){
      t.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();t.parentElement.classList.toggle('open');t.blur();});
      t.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();t.parentElement.classList.toggle('open');}});
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape')[].forEach.call(nav.querySelectorAll('.nav-dropdown.open'),function(d){d.classList.remove('open');});});
    document.addEventListener('click',function(e){[].forEach.call(nav.querySelectorAll('.nav-dropdown.open'),function(d){if(!d.contains(e.target))d.classList.remove('open');});});
    // Acceso según sesión
    try{
      var u=JSON.parse(sessionStorage.getItem('cyclops_user')),l=document.getElementById('navSoporteLink');
      if(u&&u.rol&&u.rol!=='ninguno'&&l){
        if(u.rol==='admin'){l.href='/admin.html';l.innerHTML='<i class="fas fa-gauge"></i><span>Panel Admin<small>Gestión interna</small></span>';}
        else{l.href='/cliente_panel.html';l.innerHTML='<i class="fas fa-user-circle"></i><span>Mi Panel<small>Mis tickets</small></span>';}
      }
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

  // Vista de artículo del blog → contador de "Más leídos" (una por sesión y artículo).
  // Backend: acción blog_vista del Apps Script del portal (código en PENDIENTES.md, 25/11).
  try{
    var m=location.pathname.match(/^\/blog\/([a-z0-9-]+)(?:\.html|\/(?:index\.html)?)?$/);
    if(m&&m[1]!=='index'&&m[1]!=='articulo-prueba'&&!/bot|crawl|spider|lighthouse/i.test(navigator.userAgent)){
      var k='vista_'+m[1];
      if(!sessionStorage.getItem(k)){
        sessionStorage.setItem(k,'1');
        fetch('https://script.google.com/macros/s/AKfycbwYHXr-AyhpaTLRydiQpE7S0boDZbK5_GEjjoI7GIlXaBpQdO7vO1tAhiriYvhms36P/exec?action=blog_vista&slug='+m[1],{mode:'no-cors',keepalive:true}).catch(function(){});
      }
    }
  }catch(e){}
})();
