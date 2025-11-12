// ===========================
// NAVEGACIÓN Y FUNCIONALIDADES GENERALES
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
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
            }
        });
    });

    // BOTÓN WHATSAPP DEL FORMULARIO
    document.getElementById('whatsappBtn').addEventListener('click', function() {
        const nombre = document.getElementById('nombre').value;
        const telefono = document.getElementById('telefono').value;
        const email = document.getElementById('email').value;
        const direccion = document.getElementById('direccion').value;
        const servicio = document.getElementById('servicio').value;
        const fecha = document.getElementById('fecha').value;
        const descripcion = document.getElementById('descripcion').value;
        const visitaTecnica = document.getElementById('visitaTecnica').checked;
        
        if (!nombre || !telefono || !email || !direccion || !servicio || !descripcion) {
            alert('Por favor, complete todos los campos obligatorios (*)');
            return;
        }
        
        let message = `Hola, me gustaría solicitar un servicio:\n\n`;
        message += `*Nombre:* ${nombre}\n`;
        message += `*Teléfono:* ${telefono}\n`;
        message += `*Email:* ${email}\n`;
        message += `*Dirección/Zona:* ${direccion}\n`;
        message += `*Servicio solicitado:* ${servicio}\n`;
        
        if (fecha) {
            message += `*Fecha y hora preferidas:* ${fecha}\n`;
        }
        
        message += `*Descripción:* ${descripcion}\n`;
        
        if (visitaTecnica) {
            message += `*Solicita visita técnica:* Sí\n`;
        }
        
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/5491166804450?text=${encodedMessage}`, '_blank');
    });

    console.log("✅ Navegación y funcionalidades generales inicializadas");
});
