// Main JavaScript for Soporte Cyclops Website

// ===========================
// Configuration
// ===========================
const CONFIG = {
    googleSheetsURL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    scheduleRefreshInterval: 300000, // 5 minutes in milliseconds
    googleCalendarEmail: 'soportecyclops@gmail.com',
};

// ===========================
// Navigation & Mobile Menu
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            if (menuToggle) {
                menuToggle.classList.remove('active');
            }
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Sticky header on scroll
    const header = document.getElementById('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.slide-up').forEach(el => {
        observer.observe(el);
    });

    // Initialize all modules
    loadNews();
    loadSchedule();
    initContactForm();
    initTicketForm();
    initGoogleCalendarButton();
    
    // Set up schedule auto-refresh
    setInterval(loadSchedule, CONFIG.scheduleRefreshInterval);
});

// ===========================
// Load News from JSON
// ===========================
async function loadNews() {
    try {
        const response = await fetch('./data/news.json');
        const news = await response.json();
        
        const newsGrid = document.getElementById('newsGrid');
        
        if (news.length === 0) {
            newsGrid.innerHTML = '<p class="schedule-message">No hay noticias disponibles en este momento.</p>';
            return;
        }
        
        newsGrid.innerHTML = news.map(item => `
            <div class="news-card slide-up">
                <img src="${item.image}" alt="${item.title}" class="news-image" onerror="this.src='https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600'">
                <div class="news-content">
                    <p class="news-date">${item.date}</p>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');
        
        // Re-observe new elements for animations
        document.querySelectorAll('.news-card').forEach(el => {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(el);
        });
    } catch (error) {
        console.error('Error loading news:', error);
        document.getElementById('newsGrid').innerHTML = '<p class="schedule-message">Error al cargar las noticias.</p>';
    }
}

// ===========================
// Load Schedule - Only show availability
// ===========================
async function loadSchedule() {
    const scheduleGrid = document.getElementById('scheduleGrid');
    const scheduleMessage = document.getElementById('scheduleMessage');
    
    try {
        // Simulated availability data (replace with actual Google Calendar API fetch)
        // Only shows available time slots without client details
        const scheduleData = [
            {
                date: '2025-01-15',
                time: '10:00',
                status: 'disponible'
            },
            {
                date: '2025-01-15',
                time: '14:00',
                status: 'disponible'
            },
            {
                date: '2025-01-16',
                time: '09:00',
                status: 'ocupado'
            },
            {
                date: '2025-01-16',
                time: '15:00',
                status: 'disponible'
            },
            {
                date: '2025-01-17',
                time: '10:00',
                status: 'disponible'
            },
            {
                date: '2025-01-17',
                time: '16:00',
                status: 'disponible'
            }
        ];
        
        // Filter to show only available slots
        const availableSlots = scheduleData.filter(item => item.status === 'disponible');
        
        if (availableSlots.length === 0) {
            scheduleMessage.textContent = 'No hay horarios disponibles en este momento. Por favor, contáctanos directamente.';
            scheduleGrid.innerHTML = '';
            return;
        }
        
        scheduleMessage.style.display = 'none';
        scheduleGrid.innerHTML = availableSlots.map(item => `
            <div class="schedule-item available">
                <div class="schedule-date">
                    <i class="fas fa-calendar-check"></i>
                    <div class="schedule-details">
                        <h4>${formatDate(item.date)} - ${item.time}</h4>
                        <p><i class="fas fa-clock"></i> Horario disponible para agendar</p>
                    </div>
                </div>
                <button class="btn-schedule" onclick="scheduleAppointment('${item.date}', '${item.time}')">
                    <i class="fas fa-calendar-plus"></i> Agendar
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading schedule:', error);
        scheduleMessage.textContent = 'Error al cargar la disponibilidad. Intente nuevamente más tarde.';
        scheduleGrid.innerHTML = '';
    }
}

// ===========================
// Schedule Appointment Function
// ===========================
window.scheduleAppointment = function(date, time) {
    // Scroll to contact form
    const contactSection = document.getElementById('contacto');
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    // Pre-fill the date and time in the form
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const dateTimeValue = `${date}T${time}`;
        fechaInput.value = dateTimeValue;
    }
    
    // Show message
    const formMessage = document.getElementById('formMessage');
    formMessage.className = 'form-message success';
    formMessage.textContent = `Horario seleccionado: ${formatDate(date)} a las ${time}. Complete el formulario para confirmar.`;
    formMessage.style.display = 'block';
    
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
};

// ===========================
// Google Calendar Integration
// ===========================
function initGoogleCalendarButton() {
    const scheduleGoogleBtn = document.getElementById('scheduleGoogleBtn');
    
    if (scheduleGoogleBtn) {
        scheduleGoogleBtn.addEventListener('click', function() {
            const nombre = document.getElementById('nombre').value;
            const telefono = document.getElementById('telefono').value;
            const email = document.getElementById('email').value;
            const servicio = document.getElementById('servicio').value;
            const fecha = document.getElementById('fecha').value;
            const descripcion = document.getElementById('descripcion').value;
            
            if (!nombre || !telefono || !email || !servicio || !fecha) {
                alert('Por favor, completa todos los campos obligatorios antes de agendar con Google Calendar.');
                return;
            }
            
            // Create Google Calendar event URL
            const startDate = new Date(fecha);
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
            
            const formatGoogleDate = (date) => {
                return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
            };
            
            const eventTitle = `Servicio Técnico - ${servicio}`;
            const eventDetails = `Cliente: ${nombre}\nTeléfono: ${telefono}\nEmail: ${email}\nDescripción: ${descripcion}`;
            const eventLocation = 'Buenos Aires, Argentina';
            
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
                `&text=${encodeURIComponent(eventTitle)}` +
                `&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}` +
                `&details=${encodeURIComponent(eventDetails)}` +
                `&location=${encodeURIComponent(eventLocation)}` +
                `&add=${encodeURIComponent(CONFIG.googleCalendarEmail)}`;
            
            // Open Google Calendar in new tab
            window.open(googleCalendarUrl, '_blank');
            
            // Show success message
            const formMessage = document.getElementById('formMessage');
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Se abrió Google Calendar. Completa la creación del evento y guárdalo para confirmar la cita.';
            formMessage.style.display = 'block';
        });
    }
}

// ===========================
// Contact Form Handler
// ===========================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        // Show loading state
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        try {
            // Send to Google Sheets
            const response = await fetch(CONFIG.googleSheetsURL, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                formMessage.className = 'form-message success';
                formMessage.textContent = '¡Solicitud enviada con éxito! Nos pondremos en contacto contigo pronto.';
                contactForm.reset();
            } else {
                throw new Error('Error al enviar el formulario');
            }
        } catch (error) {
            console.error('Error:', error);
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Hubo un error al enviar tu solicitud. Por favor, intenta nuevamente o contáctanos por WhatsApp al +54 9 11 6680-4450.';
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }
    });
}

// ===========================
// Ticket Form Handler
// ===========================
function initTicketForm() {
    const ticketForm = document.getElementById('ticketForm');
    const ticketResult = document.getElementById('ticketResult');
    
    ticketForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const ticketNumber = document.getElementById('ticketNumber').value.trim();
        
        if (!ticketNumber) {
            showTicketError('Por favor, ingresa un número de ticket válido.');
            return;
        }
        
        // Show loading state
        ticketResult.innerHTML = '<p style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Consultando...</p>';
        ticketResult.classList.add('show');
        
        try {
            // Simulated ticket data (replace with actual Google Sheets fetch)
            const ticketData = {
                number: ticketNumber,
                status: 'en-proceso',
                service: 'Instalación de CCTV',
                date: '2025-01-10',
                description: 'Instalación de 4 cámaras IP en exterior',
                estimatedCompletion: '2025-01-15'
            };
            
            if (ticketData) {
                displayTicketInfo(ticketData);
            } else {
                showTicketError('No se encontró el ticket. Verifica el número e intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error:', error);
            showTicketError('Error al consultar el ticket. Intenta nuevamente más tarde.');
        }
    });
}

function displayTicketInfo(ticket) {
    const ticketResult = document.getElementById('ticketResult');
    const statusText = {
        'pendiente': 'Pendiente',
        'en-proceso': 'En Proceso',
        'completado': 'Completado'
    };
    
    ticketResult.innerHTML = `
        <div class="ticket-header">
            <span class="ticket-number">Ticket: ${ticket.number}</span>
            <span class="ticket-status ${ticket.status}">${statusText[ticket.status]}</span>
        </div>
        <div class="ticket-info">
            <h4>Servicio</h4>
            <p>${ticket.service}</p>
        </div>
        <div class="ticket-info">
            <h4>Fecha de Solicitud</h4>
            <p>${formatDate(ticket.date)}</p>
        </div>
        <div class="ticket-info">
            <h4>Descripción</h4>
            <p>${ticket.description}</p>
        </div>
        <div class="ticket-info">
            <h4>Fecha Estimada de Finalización</h4>
            <p>${formatDate(ticket.estimatedCompletion)}</p>
        </div>
    `;
    ticketResult.classList.add('show');
}

function showTicketError(message) {
    const ticketResult = document.getElementById('ticketResult');
    ticketResult.innerHTML = `
        <div style="text-align: center; color: #721c24;">
            <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>${message}</p>
        </div>
    `;
    ticketResult.classList.add('show');
}

// ===========================
// Utility Functions
// ===========================
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', options);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Export for use in other modules
export { CONFIG, loadSchedule, loadNews };