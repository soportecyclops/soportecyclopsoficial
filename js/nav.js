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
      t.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();t.parentElement.classList.toggle('open');});
      t.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();t.parentElement.classList.toggle('open');}});
    });
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
})();
