(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function a(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(e){if(e.ep)return;e.ep=!0;const s=a(e);fetch(e.href,s)}})();const m={googleSheetsURL:"https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",scheduleRefreshInterval:3e5,googleCalendarEmail:"soportecyclops@gmail.com"};document.addEventListener("DOMContentLoaded",function(){const t=document.getElementById("menuToggle"),n=document.getElementById("navMenu");t&&t.addEventListener("click",function(){n.classList.toggle("active"),this.classList.toggle("active")});const a=document.querySelectorAll(".nav-link");a.forEach(c=>{c.addEventListener("click",function(){n.classList.remove("active"),t&&t.classList.remove("active"),a.forEach(i=>i.classList.remove("active")),this.classList.add("active")})});const o=document.getElementById("header");window.addEventListener("scroll",function(){window.scrollY>100?o.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)":o.style.boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"});const e={threshold:.1,rootMargin:"0px 0px -50px 0px"},s=new IntersectionObserver(function(c){c.forEach(i=>{i.isIntersecting&&(i.target.style.opacity="1",i.target.style.transform="translateY(0)")})},e);document.querySelectorAll(".slide-up").forEach(c=>{s.observe(c)}),E(),f(),I(),w(),b(),setInterval(f,m.scheduleRefreshInterval)});async function E(){try{const n=await(await fetch("./data/news.json")).json(),a=document.getElementById("newsGrid");if(n.length===0){a.innerHTML='<p class="schedule-message">No hay noticias disponibles en este momento.</p>';return}a.innerHTML=n.map(o=>`
            <div class="news-card slide-up">
                <img src="${o.image}" alt="${o.title}" class="news-image" onerror="this.src='https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600'">
                <div class="news-content">
                    <p class="news-date">${o.date}</p>
                    <h3>${o.title}</h3>
                    <p>${o.description}</p>
                </div>
            </div>
        `).join(""),document.querySelectorAll(".news-card").forEach(o=>{new IntersectionObserver(function(s){s.forEach(c=>{c.isIntersecting&&(c.target.style.opacity="1",c.target.style.transform="translateY(0)")})},{threshold:.1}).observe(o)})}catch(t){console.error("Error loading news:",t),document.getElementById("newsGrid").innerHTML='<p class="schedule-message">Error al cargar las noticias.</p>'}}async function f(){const t=document.getElementById("scheduleGrid"),n=document.getElementById("scheduleMessage");try{const o=[{date:"2025-01-15",time:"10:00",status:"disponible"},{date:"2025-01-15",time:"14:00",status:"disponible"},{date:"2025-01-16",time:"09:00",status:"ocupado"},{date:"2025-01-16",time:"15:00",status:"disponible"},{date:"2025-01-17",time:"10:00",status:"disponible"},{date:"2025-01-17",time:"16:00",status:"disponible"}].filter(e=>e.status==="disponible");if(o.length===0){n.textContent="No hay horarios disponibles en este momento. Por favor, contáctanos directamente.",t.innerHTML="";return}n.style.display="none",t.innerHTML=o.map(e=>`
            <div class="schedule-item available">
                <div class="schedule-date">
                    <i class="fas fa-calendar-check"></i>
                    <div class="schedule-details">
                        <h4>${r(e.date)} - ${e.time}</h4>
                        <p><i class="fas fa-clock"></i> Horario disponible para agendar</p>
                    </div>
                </div>
                <button class="btn-schedule" onclick="scheduleAppointment('${e.date}', '${e.time}')">
                    <i class="fas fa-calendar-plus"></i> Agendar
                </button>
            </div>
        `).join("")}catch(a){console.error("Error loading schedule:",a),n.textContent="Error al cargar la disponibilidad. Intente nuevamente más tarde.",t.innerHTML=""}}window.scheduleAppointment=function(t,n){document.getElementById("contacto").scrollIntoView({behavior:"smooth"});const o=document.getElementById("fecha");if(o){const s=`${t}T${n}`;o.value=s}const e=document.getElementById("formMessage");e.className="form-message success",e.textContent=`Horario seleccionado: ${r(t)} a las ${n}. Complete el formulario para confirmar.`,e.style.display="block",setTimeout(()=>{e.style.display="none"},5e3)};function b(){const t=document.getElementById("scheduleGoogleBtn");t&&t.addEventListener("click",function(){const n=document.getElementById("nombre").value,a=document.getElementById("telefono").value,o=document.getElementById("email").value,e=document.getElementById("servicio").value,s=document.getElementById("fecha").value,c=document.getElementById("descripcion").value;if(!n||!a||!o||!e||!s){alert("Por favor, completa todos los campos obligatorios antes de agendar con Google Calendar.");return}const i=new Date(s),p=new Date(i.getTime()+60*60*1e3),u=y=>y.toISOString().replace(/-|:|\.\d\d\d/g,""),g=`Servicio Técnico - ${e}`,h=`Cliente: ${n}
Teléfono: ${a}
Email: ${o}
Descripción: ${c}`,v=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(g)}&dates=${u(i)}/${u(p)}&details=${encodeURIComponent(h)}&location=${encodeURIComponent("Buenos Aires, Argentina")}&add=${encodeURIComponent(m.googleCalendarEmail)}`;window.open(v,"_blank");const l=document.getElementById("formMessage");l.className="form-message success",l.textContent="Se abrió Google Calendar. Completa la creación del evento y guárdalo para confirmar la cita.",l.style.display="block"})}function I(){const t=document.getElementById("contactForm"),n=document.getElementById("formMessage");t.addEventListener("submit",async function(a){a.preventDefault();const o=new FormData(t),e=Object.fromEntries(o.entries()),s=t.querySelector(".btn-submit"),c=s.innerHTML;s.innerHTML='<i class="fas fa-spinner fa-spin"></i> Enviando...',s.disabled=!0;try{if((await fetch(m.googleSheetsURL,{method:"POST",body:JSON.stringify(e),headers:{"Content-Type":"application/json"}})).ok)n.className="form-message success",n.textContent="¡Solicitud enviada con éxito! Nos pondremos en contacto contigo pronto.",t.reset();else throw new Error("Error al enviar el formulario")}catch(i){console.error("Error:",i),n.className="form-message error",n.textContent="Hubo un error al enviar tu solicitud. Por favor, intenta nuevamente o contáctanos por WhatsApp al +54 9 11 6680-4450."}finally{s.innerHTML=c,s.disabled=!1,setTimeout(()=>{n.style.display="none"},5e3)}})}function w(){const t=document.getElementById("ticketForm"),n=document.getElementById("ticketResult");t.addEventListener("submit",async function(a){a.preventDefault();const o=document.getElementById("ticketNumber").value.trim();if(!o){d("Por favor, ingresa un número de ticket válido.");return}n.innerHTML='<p style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Consultando...</p>',n.classList.add("show");try{const e={number:o,status:"en-proceso",service:"Instalación de CCTV",date:"2025-01-10",description:"Instalación de 4 cámaras IP en exterior",estimatedCompletion:"2025-01-15"};e?L(e):d("No se encontró el ticket. Verifica el número e intenta nuevamente.")}catch(e){console.error("Error:",e),d("Error al consultar el ticket. Intenta nuevamente más tarde.")}})}function L(t){const n=document.getElementById("ticketResult"),a={pendiente:"Pendiente","en-proceso":"En Proceso",completado:"Completado"};n.innerHTML=`
        <div class="ticket-header">
            <span class="ticket-number">Ticket: ${t.number}</span>
            <span class="ticket-status ${t.status}">${a[t.status]}</span>
        </div>
        <div class="ticket-info">
            <h4>Servicio</h4>
            <p>${t.service}</p>
        </div>
        <div class="ticket-info">
            <h4>Fecha de Solicitud</h4>
            <p>${r(t.date)}</p>
        </div>
        <div class="ticket-info">
            <h4>Descripción</h4>
            <p>${t.description}</p>
        </div>
        <div class="ticket-info">
            <h4>Fecha Estimada de Finalización</h4>
            <p>${r(t.estimatedCompletion)}</p>
        </div>
    `,n.classList.add("show")}function d(t){const n=document.getElementById("ticketResult");n.innerHTML=`
        <div style="text-align: center; color: #721c24;">
            <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>${t}</p>
        </div>
    `,n.classList.add("show")}function r(t){const n={year:"numeric",month:"long",day:"numeric"};return new Date(t).toLocaleDateString("es-AR",n)}document.querySelectorAll('a[href^="#"]').forEach(t=>{t.addEventListener("click",function(n){n.preventDefault();const a=document.querySelector(this.getAttribute("href"));if(a){const s=a.getBoundingClientRect().top+window.pageYOffset-80;window.scrollTo({top:s,behavior:"smooth"})}})});
