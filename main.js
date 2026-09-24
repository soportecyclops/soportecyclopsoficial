// =========================================================
// SOPORTE CYCLOPS — MAIN.JS (NAVEGACIÓN, FORMULARIOS & PRIVACIDAD)
// =========================================================

document.addEventListener('DOMContentLoaded', function() {

    // ===========================
    // 1. NAVEGACIÓN Y MENÚ MOBILE
    // ===========================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navMenu.classList.toggle('open');
        });
    }

    // Cerrar menú mobile al hacer clic en un enlace
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
                navMenu.classList.remove('open');
            }
        });
    });

    // Desplazamiento suave (Smooth Scroll)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===========================
    // 2. COOKIE BANNER (PRIVACIDAD & LEY 25.326)
    // ===========================
    (function initCookieBanner() {
        if (localStorage.getItem('cyclops_cookie_consent')) return;
        
        const banner = document.createElement('div');
        banner.id = 'cookieBanner';
        banner.style.cssText = 'position:fixed;bottom:20px;left:20px;right:20px;max-width:480px;background:#0f172a;color:#fff;padding:18px 22px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.35);z-index:9999;font-size:0.85rem;line-height:1.5;display:flex;flex-direction:column;gap:12px;border:1px solid rgba(255,255,255,0.12);';
        
        banner.innerHTML = '<div>Usamos cookies para analizar el tráfico de forma anónima y mejorar la experiencia de servicio. <a href="politica-de-privacidad.html" style="color:#60a5fa;text-decoration:underline;">Ver política de privacidad</a>.</div>'
          + '<div style="display:flex;gap:8px;justify-content:flex-end;">'
          + '<button id="btnAcceptCookies" style="background:#2563eb;color:#fff;border:none;padding:8px 18px;border-radius:50px;font-weight:700;font-size:0.8rem;cursor:pointer;transition:background 0.2s;">Aceptar</button>'
          + '</div>';
          
        document.body.appendChild(banner);
        
        const btnAccept = document.getElementById('btnAcceptCookies');
        if (btnAccept) {
            btnAccept.addEventListener('click', function() {
                localStorage.setItem('cyclops_cookie_consent', 'accepted');
                banner.remove();
            });
        }
    })();

    // ===========================
    // 3. MENSAJES Y VALIDACIÓN DE FORMULARIO
    // ===========================
    function showFormMessage(message, type) {
        const formMessage = document.getElementById('formMessage');
        if (!formMessage) return;
        
        formMessage.textContent = message;
        formMessage.style.display = 'block';
        formMessage.style.backgroundColor = type === 'error' ? '#fee2e2' : '#f0fdf4';
        formMessage.style.color = type === 'error' ? '#991b1b' : '#166534';
        formMessage.style.border = `1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'}`;
        
        // Auto-ocultar después de 6 segundos
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 6000);
    }

    function validateForm() {
        // Anti-Spam Honeypot (Bloqueo silencioso de bots)
        const honeypot = document.getElementById('b_honeypot');
        if (honeypot && honeypot.value.trim() !== '') {
            console.warn('🤖 Bot de spam detectado por honeypot.');
            return false;
        }

        const nombre = document.getElementById('nombre');
        const telefono = document.getElementById('telefono');
        const email = document.getElementById('email');
        const direccion = document.getElementById('direccion');
        const servicio = document.getElementById('servicio');
        const descripcion = document.getElementById('descripcion');
        
        // Verificar que existan los campos en el DOM
        const requiredElements = [nombre, telefono, email, direccion, servicio, descripcion];
        const missingElements = requiredElements.filter(el => !el);
        
        if (missingElements.length > 0) {
            console.error("❌ Elementos del formulario no encontrados.");
            showFormMessage('Error: No se pudo validar el formulario. Recargá la página e intentá de nuevo.', 'error');
            return false;
        }
        
        // Validar campos vacíos
        if (!nombre.value.trim()) {
            showFormMessage('Por favor, ingresá tu nombre completo.', 'error');
            nombre.focus();
            return false;
        }
        
        if (!telefono.value.trim()) {
            showFormMessage('Por favor, ingresá tu número de teléfono.', 'error');
            telefono.focus();
            return false;
        }
        
        // Validar formato de teléfono (mínimo 8 dígitos)
        const telefonoRegex = /^[\d\s\-\+\(\)]{8,}$/;
        if (!telefonoRegex.test(telefono.value.trim())) {
            showFormMessage('El número de teléfono no es válido. Debe contener al menos 8 dígitos.', 'error');
            telefono.focus();
            return false;
        }
        
        if (!email.value.trim()) {
            showFormMessage('Por favor, ingresá tu correo electrónico.', 'error');
            email.focus();
            return false;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            showFormMessage('El email no es válido. Ejemplo: nombre@ejemplo.com', 'error');
            email.focus();
            return false;
        }
        
        if (!direccion.value.trim()) {
            showFormMessage('Por favor, ingresá tu dirección o zona (ej: Palermo, CABA).', 'error');
            direccion.focus();
            return false;
        }
        
        if (!servicio.value) {
            showFormMessage('Por favor, seleccioná el servicio que necesitás.', 'error');
            servicio.focus();
            return false;
        }
        
        if (!descripcion.value.trim()) {
            showFormMessage('Por favor, describí brevemente tu consulta o problema.', 'error');
            descripcion.focus();
            return false;
        }
        
        return true;
    }

    // ===========================
    // 4. BOTÓN WHATSAPP DEL FORMULARIO
    // ===========================
    const whatsappBtn = document.getElementById('whatsappBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            if (!validateForm()) return;
            
            const nombre = document.getElementById('nombre').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const email = document.getElementById('email').value.trim();
            const direccion = document.getElementById('direccion').value.trim();
            const servicio = document.getElementById('servicio').value;
            const fecha = document.getElementById('fecha');
            const descripcion = document.getElementById('descripcion').value.trim();
            const visitaTecnica = document.getElementById('visitaTecnica');
            
            // Construir mensaje preformateado
            let message = `Hola, me gustaría solicitar un servicio:\n\n`;
            message += `*Nombre:* ${nombre}\n`;
            message += `*Teléfono:* ${telefono}\n`;
            message += `*Email:* ${email}\n`;
            message += `*Dirección/Zona:* ${direccion}\n`;
            message += `*Servicio solicitado:* ${servicio}\n`;
            
            if (fecha && fecha.value) {
                message += `*Fecha/Hora preferida:* ${fecha.value}\n`;
            }
            
            message += `*Descripción:* ${descripcion}\n`;
            
            if (visitaTecnica && visitaTecnica.checked) {
                message += `*Solicita visita técnica:* Sí\n`;
            }
            
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/5491166804450?text=${encodedMessage}`, '_blank');
            
            // Medición GA4 si está configurado
            if (typeof gtag === 'function') {
                gtag('event', 'click_whatsapp', {
                    'event_category': 'Conversion',
                    'event_label': servicio
                });
            }

            showFormMessage('✅ Redirigiendo a WhatsApp...', 'success');
        });
    }

    // ===========================
    // 5. BOTÓN GOOGLE CALENDAR
    // ===========================
    const scheduleGoogleBtn = document.getElementById('scheduleGoogleBtn');
    if (scheduleGoogleBtn) {
        scheduleGoogleBtn.addEventListener('click', function() {
            if (!validateForm()) return;
            
            const nombre = document.getElementById('nombre').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const email = document.getElementById('email').value.trim();
            const direccion = document.getElementById('direccion').value.trim();
            const servicio = document.getElementById('servicio').value;
            const fecha = document.getElementById('fecha');
            const descripcion = document.getElementById('descripcion').value.trim();
            
            const titulo = `Servicio IT: ${servicio} - ${nombre}`;
            
            let detalles = `Cliente: ${nombre}\n`;
            detalles += `Teléfono: ${telefono}\n`;
            detalles += `Email: ${email}\n`;
            detalles += `Dirección/Zona: ${direccion}\n\n`;
            detalles += `Descripción del problema:\n${descripcion}\n\n`;
            detalles += `---\nSoporte Cyclops - www.soportecyclops.com.ar`;
            
            let fechaInicio, fechaFin;
            
            if (fecha && fecha.value) {
                fechaInicio = new Date(fecha.value);
                fechaFin = new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000); // +2 horas
            } else {
                fechaInicio = new Date();
                fechaInicio.setDate(fechaInicio.getDate() + 1);
                fechaInicio.setHours(10, 0, 0, 0);
                fechaFin = new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000);
            }
            
            function formatGoogleDate(date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}${month}${day}T${hours}${minutes}${seconds}`;
            }
            
            const fechaInicioStr = formatGoogleDate(fechaInicio);
            const fechaFinStr = formatGoogleDate(fechaFin);
            
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
                `&text=${encodeURIComponent(titulo)}` +
                `&dates=${fechaInicioStr}/${fechaFinStr}` +
                `&details=${encodeURIComponent(detalles)}` +
                `&location=${encodeURIComponent(direccion)}` +
                `&sf=true&output=xml`;
            
            window.open(googleCalendarUrl, '_blank');
            
            showFormMessage('✅ Abriendo Google Calendar para agendar el servicio...', 'success');
        });
    }

});