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

    // BOTÓN WHATSAPP DEL FORMULARIO
    const whatsappBtn = document.getElementById('whatsappBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            // Validar que los elementos existan
            const nombre = document.getElementById('nombre');
            const telefono = document.getElementById('telefono');
            const email = document.getElementById('email');
            const direccion = document.getElementById('direccion');
            const servicio = document.getElementById('servicio');
            const fecha = document.getElementById('fecha');
            const descripcion = document.getElementById('descripcion');
            const visitaTecnica = document.getElementById('visitaTecnica');
            
            // Verificar que todos los elementos obligatorios existan
            const requiredElements = [nombre, telefono, email, direccion, servicio, descripcion];
            const missingElements = requiredElements.filter(el => !el);
            
            if (missingElements.length > 0) {
                console.error("❌ Elementos del formulario no encontrados:", missingElements.map(el => el?.id || 'unknown'));
                alert('Error: No se pudo cargar el formulario. Por favor, recarga la página.');
                return;
            }
            
            // Validar campos obligatorios
            if (!nombre.value || !telefono.value || !email.value || !direccion.value || !servicio.value || !descripcion.value) {
                alert('Por favor, complete todos los campos obligatorios (*)');
                return;
            }
            
            // Construir mensaje
            let message = `Hola, me gustaría solicitar un servicio:\n\n`;
            message += `*Nombre:* ${nombre.value}\n`;
            message += `*Teléfono:* ${telefono.value}\n`;
            message += `*Email:* ${email.value}\n`;
            message += `*Dirección/Zona:* ${direccion.value}\n`;
            message += `*Servicio solicitado:* ${servicio.value}\n`;
            
            if (fecha && fecha.value) {
                message += `*Fecha y hora preferidas:* ${fecha.value}\n`;
            }
            
            message += `*Descripción:* ${descripcion.value}\n`;
            
            if (visitaTecnica && visitaTecnica.checked) {
                message += `*Solicita visita técnica:* Sí\n`;
            }
            
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/5491166804450?text=${encodedMessage}`, '_blank');
            
            console.log("📤 Formulario enviado por WhatsApp");
        });
    } else {
        console.warn("⚠️ Botón de WhatsApp no encontrado");
    }

    console.log("✅ Navegación y funcionalidades generales inicializadas correctamente");
});
