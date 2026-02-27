// ===========================
// NAVEGACIÓN Y FUNCIONALIDADES GENERALES
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Inicializando funcionalidades generales...");

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            console.log("📱 Menú móvil toggled");
        });
    } else {
        console.warn("⚠️ Elementos del menú móvil no encontrados");
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
                console.log(`🎯 Navegando a: ${targetId}`);
            }
        });
    });

    // ===========================
    // VALIDACIÓN DEL FORMULARIO (mejorada con #formMessage)
    // ===========================
    
    function showFormMessage(message, type) {
        const formMessage = document.getElementById('formMessage');
        if (!formMessage) return;
        
        formMessage.textContent = message;
        formMessage.style.display = 'block';
        formMessage.style.backgroundColor = type === 'error' ? '#fee' : '#efe';
        formMessage.style.color = type === 'error' ? '#c33' : '#3c3';
        formMessage.style.border = `1px solid ${type === 'error' ? '#c33' : '#3c3'}`;
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }

    function validateForm() {
        const nombre = document.getElementById('nombre');
        const telefono = document.getElementById('telefono');
        const email = document.getElementById('email');
        const direccion = document.getElementById('direccion');
        const servicio = document.getElementById('servicio');
        const descripcion = document.getElementById('descripcion');
        
        // Verificar que todos los elementos existan
        const requiredElements = [nombre, telefono, email, direccion, servicio, descripcion];
        const missingElements = requiredElements.filter(el => !el);
        
        if (missingElements.length > 0) {
            console.error("❌ Elementos del formulario no encontrados");
            showFormMessage('Error: No se pudo cargar el formulario. Por favor, recarga la página.', 'error');
            return false;
        }
        
        // Validar campos vacíos
        if (!nombre.value.trim()) {
            showFormMessage('Por favor, ingresa tu nombre completo.', 'error');
            nombre.focus();
            return false;
        }
        
        if (!telefono.value.trim()) {
            showFormMessage('Por favor, ingresa tu número de teléfono.', 'error');
            telefono.focus();
            return false;
        }
        
        // Validar formato de teléfono
        const telefonoRegex = /^[\d\s\-\+\(\)]{8,}$/;
        if (!telefonoRegex.test(telefono.value.trim())) {
            showFormMessage('El número de teléfono no es válido. Debe tener al menos 8 dígitos.', 'error');
            telefono.focus();
            return false;
        }
        
        if (!email.value.trim()) {
            showFormMessage('Por favor, ingresa tu email.', 'error');
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
            showFormMessage('Por favor, ingresa tu dirección o zona.', 'error');
            direccion.focus();
            return false;
        }
        
        if (!servicio.value) {
            showFormMessage('Por favor, selecciona el servicio que necesitas.', 'error');
            servicio.focus();
            return false;
        }
        
        if (!descripcion.value.trim()) {
            showFormMessage('Por favor, describe brevemente tu consulta o problema.', 'error');
            descripcion.focus();
            return false;
        }
        
        return true;
    }

    // ===========================
    // BOTÓN WHATSAPP DEL FORMULARIO
    // ===========================
    
    const whatsappBtn = document.getElementById('whatsappBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            // Validar formulario antes de enviar
            if (!validateForm()) {
                return;
            }
            
            const nombre = document.getElementById('nombre').value;
            const telefono = document.getElementById('telefono').value;
            const email = document.getElementById('email').value;
            const direccion = document.getElementById('direccion').value;
            const servicio = document.getElementById('servicio').value;
            const fecha = document.getElementById('fecha');
            const descripcion = document.getElementById('descripcion').value;
            const visitaTecnica = document.getElementById('visitaTecnica');
            
            // Construir mensaje
            let message = `Hola, me gustaría solicitar un servicio:\n\n`;
            message += `*Nombre:* ${nombre}\n`;
            message += `*Teléfono:* ${telefono}\n`;
            message += `*Email:* ${email}\n`;
            message += `*Dirección/Zona:* ${direccion}\n`;
            message += `*Servicio solicitado:* ${servicio}\n`;
            
            if (fecha && fecha.value) {
                message += `*Fecha y hora preferidas:* ${fecha.value}\n`;
            }
            
            message += `*Descripción:* ${descripcion}\n`;
            
            if (visitaTecnica && visitaTecnica.checked) {
                message += `*Solicita visita técnica:* Sí\n`;
            }
            
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/5491166804450?text=${encodedMessage}`, '_blank');
            
            showFormMessage('✅ Redirigiendo a WhatsApp...', 'success');
            console.log("📤 Formulario enviado por WhatsApp");
        });
    } else {
        console.warn("⚠️ Botón de WhatsApp no encontrado");
    }

    // ===========================
    // BOTÓN GOOGLE CALENDAR (NUEVO - FUNCIONAL)
    // ===========================
    
    const scheduleGoogleBtn = document.getElementById('scheduleGoogleBtn');
    if (scheduleGoogleBtn) {
        scheduleGoogleBtn.addEventListener('click', function() {
            // Validar formulario antes de agendar
            if (!validateForm()) {
                return;
            }
            
            const nombre = document.getElementById('nombre').value;
            const telefono = document.getElementById('telefono').value;
            const email = document.getElementById('email').value;
            const direccion = document.getElementById('direccion').value;
            const servicio = document.getElementById('servicio').value;
            const fecha = document.getElementById('fecha');
            const descripcion = document.getElementById('descripcion').value;
            
            // Preparar datos para Google Calendar
            const titulo = `Servicio: ${servicio} - ${nombre}`;
            
            let detalles = `Cliente: ${nombre}\n`;
            detalles += `Teléfono: ${telefono}\n`;
            detalles += `Email: ${email}\n`;
            detalles += `Dirección/Zona: ${direccion}\n\n`;
            detalles += `Descripción:\n${descripcion}\n\n`;
            detalles += `---\nSoporte Cyclops - www.soportecyclops.com.ar`;
            
            // Calcular fechas
            let fechaInicio, fechaFin;
            
            if (fecha && fecha.value) {
                // Si el usuario especificó una fecha, usarla
                fechaInicio = new Date(fecha.value);
                fechaFin = new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000); // +2 horas
            } else {
                // Si no especificó fecha, usar mañana a las 10:00
                fechaInicio = new Date();
                fechaInicio.setDate(fechaInicio.getDate() + 1);
                fechaInicio.setHours(10, 0, 0, 0);
                fechaFin = new Date(fechaInicio.getTime() + 2 * 60 * 60 * 1000);
            }
            
            // Formatear fechas para Google Calendar (formato: YYYYMMDDTHHmmssZ)
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
            
            // Crear URL de Google Calendar
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
                `&text=${encodeURIComponent(titulo)}` +
                `&dates=${fechaInicioStr}/${fechaFinStr}` +
                `&details=${encodeURIComponent(detalles)}` +
                `&location=${encodeURIComponent(direccion)}` +
                `&sf=true&output=xml`;
            
            // Abrir Google Calendar en nueva pestaña
            window.open(googleCalendarUrl, '_blank');
            
            showFormMessage('✅ Abriendo Google Calendar para agendar tu servicio...', 'success');
            console.log("📅 Evento de Google Calendar generado");
        });
    } else {
        console.warn("⚠️ Botón de Google Calendar no encontrado");
    }

    console.log("✅ Navegación y funcionalidades generales inicializadas correctamente");
});
