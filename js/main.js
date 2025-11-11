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
    
    // Initialize new modules
    new AppointmentScheduler();
    initChatbotDiagnostic();
    
    // Set up schedule auto-refresh
    setInterval(loadSchedule, CONFIG.scheduleRefreshInterval);
});

// ===========================
// AGENDA SYSTEM - Appointment Scheduler
// ===========================
class AppointmentScheduler {
    constructor() {
        this.selectedDate = null;
        this.selectedTime = null;
        this.calendarId = 'soportecyclops@gmail.com';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.init();
    }

    init() {
        // Only initialize if agenda section exists
        if (!document.getElementById('agenda')) return;
        
        this.generateCalendar();
        this.setupEventListeners();
        this.loadAvailableSlots();
    }

    generateCalendar() {
        this.renderCalendar();
    }

    renderCalendar() {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

        const currentMonthElement = document.getElementById('currentMonth');
        if (currentMonthElement) {
            currentMonthElement.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const monthLength = lastDay.getDate();

        let calendarHTML = '';
        
        // Días de la semana
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        days.forEach(day => {
            calendarHTML += `<div class="calendar-day header">${day}</div>`;
        });

        // Días vacíos al inicio
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += `<div class="calendar-day empty"></div>`;
        }

        // Días del mes
        for (let day = 1; day <= monthLength; day++) {
            const dateStr = `${this.currentYear}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const isAvailable = this.isDateAvailable(dateStr);
            const isToday = day === new Date().getDate() && this.currentMonth === new Date().getMonth();
            
            calendarHTML += `
                <div class="calendar-day ${isAvailable ? 'available' : 'unavailable'} ${isToday ? 'today' : ''}" 
                     data-date="${dateStr}" ${isAvailable ? '' : 'style="cursor: not-allowed; opacity: 0.5;"'}>
                    ${day}
                </div>
            `;
        }

        const calendarGrid = document.getElementById('calendarGrid');
        if (calendarGrid) {
            calendarGrid.innerHTML = calendarHTML;
        }
    }

    isDateAvailable(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // No permitir fechas pasadas
        if (date < today) return false;
        
        // No permitir domingos
        if (date.getDay() === 0) return false;
        
        return true;
    }

    async loadAvailableSlots() {
        const availableSlots = this.generateTimeSlots();
        this.renderTimeSlots(availableSlots);
    }

    generateTimeSlots() {
        const slots = [];
        const startHour = 9; // 9:00 AM
        const endHour = 18;  // 6:00 PM
        
        for (let hour = startHour; hour < endHour; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        
        return slots;
    }

    renderTimeSlots(slots) {
        let slotsHTML = '';
        slots.forEach(slot => {
            slotsHTML += `<div class="time-slot" data-time="${slot}">${slot}</div>`;
        });
        
        const slotsContainer = document.getElementById('slotsContainer');
        if (slotsContainer) {
            slotsContainer.innerHTML = slotsHTML;
        }
    }

    setupEventListeners() {
        // Navegación del calendario
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                this.currentMonth--;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }
                this.renderCalendar();
            });
        }

        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                this.currentMonth++;
                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
                this.renderCalendar();
            });
        }

        // Selección de fecha
        const calendarGrid = document.getElementById('calendarGrid');
        if (calendarGrid) {
            calendarGrid.addEventListener('click', (e) => {
                if (e.target.classList.contains('available')) {
                    document.querySelectorAll('.calendar-day').forEach(day => {
                        day.classList.remove('selected');
                    });
                    e.target.classList.add('selected');
                    this.selectedDate = e.target.dataset.date;
                    this.checkFormCompletion();
                }
            });
        }

        // Selección de hora
        const slotsContainer = document.getElementById('slotsContainer');
        if (slotsContainer) {
            slotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('time-slot')) {
                    document.querySelectorAll('.time-slot').forEach(slot => {
                        slot.classList.remove('selected');
                    });
                    e.target.classList.add('selected');
                    this.selectedTime = e.target.dataset.time;
                    this.checkFormCompletion();
                }
            });
        }

        // Confirmar cita
        const confirmBtn = document.getElementById('confirmAppointment');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.createAppointment();
            });
        }

        // Validación del formulario
        ['agendaNombre', 'agendaTelefono', 'agendaDireccion', 'agendaProblema'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.checkFormCompletion();
                });
            }
        });
    }

    checkFormCompletion() {
        const nombre = document.getElementById('agendaNombre')?.value || '';
        const telefono = document.getElementById('agendaTelefono')?.value || '';
        const direccion = document.getElementById('agendaDireccion')?.value || '';
        const problema = document.getElementById('agendaProblema')?.value || '';
        
        const isFormComplete = nombre && telefono && direccion && problema && this.selectedDate && this.selectedTime;
        
        const confirmBtn = document.getElementById('confirmAppointment');
        if (confirmBtn) {
            confirmBtn.disabled = !isFormComplete;
        }
    }

    async createAppointment() {
        const appointmentData = {
            nombre: document.getElementById('agendaNombre')?.value || '',
            telefono: document.getElementById('agendaTelefono')?.value || '',
            email: document.getElementById('agendaEmail')?.value || '',
            direccion: document.getElementById('agendaDireccion')?.value || '',
            problema: document.getElementById('agendaProblema')?.value || '',
            fecha: this.selectedDate,
            hora: this.selectedTime
        };

        try {
            const eventId = await this.createGoogleCalendarEvent(appointmentData);
            this.showConfirmation(appointmentData, eventId);
            
        } catch (error) {
            console.error('Error al crear la cita:', error);
            alert('Error al agendar la cita. Por favor, intentá nuevamente.');
        }
    }

    async createGoogleCalendarEvent(appointmentData) {
        // Simular creación de evento en Google Calendar
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('event_' + Date.now());
            }, 1000);
        });
    }

    showConfirmation(appointmentData, eventId) {
        const confirmationHTML = `
            <div class="confirmation-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div class="confirmation-content" style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; text-align: center;">
                    <h3 style="color: #27ae60; margin-bottom: 20px;">¡Cita Agendada Exitosamente! ✅</h3>
                    <div class="appointment-details" style="text-align: left; margin-bottom: 25px;">
                        <p><strong>Fecha:</strong> ${this.formatDate(appointmentData.fecha)}</p>
                        <p><strong>Hora:</strong> ${appointmentData.hora} hs</p>
                        <p><strong>Cliente:</strong> ${appointmentData.nombre}</p>
                        <p><strong>Servicio:</strong> ${appointmentData.problema}</p>
                    </div>
                    <div class="confirmation-actions" style="display: flex; gap: 10px; justify-content: center;">
                        <button class="btn btn-primary" onclick="window.print()" style="padding: 10px 20px;">
                            <i class="fas fa-print"></i> Imprimir Comprobante
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.confirmation-modal').remove()" style="padding: 10px 20px;">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', confirmationHTML);
        
        // Limpiar formulario
        const agendaForm = document.getElementById('agendaForm');
        if (agendaForm) {
            agendaForm.reset();
        }
        this.selectedDate = null;
        this.selectedTime = null;
        this.checkFormCompletion();
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// ===========================
// CHATBOT DIAGNOSTIC SYSTEM
// ===========================
const diagnosticFlows = {
    "pc_problemas": {
        question: "¡Entiendo que tenés problemas con tu PC! Empecemos por lo básico: ¿Tu PC enciende correctamente?",
        options: [
            { text: "✅ Sí, enciende normal", next: "pc_enciende_si" },
            { text: "❌ No enciende", next: "pc_no_enciende" },
            { text: "⚠️ Enciende pero con problemas", next: "pc_enciende_problemas" }
        ]
    },
    
    "pc_no_enciende": {
        question: "Veamos por qué no enciende. Cuando apretás el botón de encendido:",
        options: [
            { text: "🔴 No hace nada, ni luces ni sonidos", next: "pc_sin_señal_vida" },
            { text: "🟡 Se encienden luces pero no da imagen", next: "pc_luces_sin_imagen" },
            { text: "🔵 Enciende pero se apaga solo", next: "pc_apaga_solo" }
        ]
    },
    
    "pc_enciende_si": {
        question: "Perfecto, enciende. ¿Qué problema notás específicamente?",
        options: [
            { text: "🖥️ No da imagen o pantalla negra", next: "pc_sin_imagen" },
            { text: "🔊 Problemas de audio", next: "pc_problema_audio" },
            { text: "🐌 Va muy lento", next: "pc_lento" },
            { text: "🌐 Problemas de internet", next: "pc_internet" },
            { text: "❓ Otro problema", next: "pc_otro" }
        ]
    },
    
    "pc_sin_imagen": {
        question: "Sobre la falta de imagen:",
        options: [
            { text: "📺 La pantalla está completamente negra", next: "pc_pantalla_negra" },
            { text: "⚡ Veo el logo pero no carga Windows", next: "pc_logo_sin_windows" },
            { text: "🔄 Se reinicia constantemente", next: "pc_reinicia_constante" }
        ]
    },
    
    "pc_pantalla_negra": {
        question: "Para pantalla negra completa:",
        options: [
            { text: "💡 Escucho que Windows inicia (sonido)", next: "pc_windows_suena" },
            { text: "🔇 No escucho ningún sonido", next: "pc_sin_sonido" },
            { text: "⌨️ Las luces del teclado responden", next: "pc_teclado_funciona" }
        ]
    },
    
    "final_diagnostico": {
        message: "🔍 **Basado en lo que me contás, podría ser:**\n\n" +
                "• **Problema de fuente de alimentación**\n" +
                "• **Falla en la placa madre**\n" +
                "• **Problemas con la memoria RAM**\n\n" +
                "💡 **Mi recomendación:**\n" +
                "Necesito revisar el equipo para darte un diagnóstico preciso. ¿Querés que coordine una visita técnica?",
        options: ["agendar_visita", "mas_info", "contacto_directo"]
    }
};

function initChatbotDiagnostic() {
    // Actualizar preguntas rápidas del chatbot
    updateQuickQuestions();
    
    // Agregar event listeners para diagnóstico
    setupDiagnosticEventListeners();
}

function updateQuickQuestions() {
    const quickQuestionsContainer = document.querySelector('.quick-questions');
    if (!quickQuestionsContainer) return;

    // Actualizar solo si no se ha modificado antes
    if (!quickQuestionsContainer.querySelector('[data-action="pc_problemas"]')) {
        quickQuestionsContainer.innerHTML = `
            <button class="quick-question" data-action="pc_problemas">
                <i class="fas fa-stethoscope"></i>
                Diagnóstico de PC
            </button>
            <button class="quick-question" data-question="servicios">
                <i class="fas fa-laptop-code"></i>
                Conocer servicios disponibles
            </button>
            <button class="quick-question" data-question="cotizacion">
                <i class="fas fa-file-invoice-dollar"></i>
                Solicitar presupuesto
            </button>
            <button class="quick-question" data-question="emergencia">
                <i class="fas fa-exclamation-triangle"></i>
                Necesito ayuda urgente
            </button>
        `;
    }
}

function setupDiagnosticEventListeners() {
    // Event listener para preguntas rápidas del diagnóstico
    document.addEventListener('click', function(e) {
        if (e.target.closest('.quick-question')) {
            const button = e.target.closest('.quick-question');
            const action = button.getAttribute('data-action');
            const question = button.getAttribute('data-question');
            
            if (action === 'pc_problemas') {
                addMessage("Necesito ayuda con problemas técnicos de PC", 'user');
                setTimeout(() => {
                    startDiagnostic('pc_problemas');
                }, 1000);
            } else if (question) {
                // Comportamiento original para otras preguntas
                addMessage(button.querySelector('i').nextSibling.textContent.trim(), 'user');
                setTimeout(() => {
                    if (question === 'servicios') {
                        addMessage(responses[question].message, 'bot', responses[question].options);
                    } else {
                        addMessage(responses[question], 'bot');
                    }
                }, 1000);
            }
        }
        
        // Event listener para opciones de diagnóstico
        if (e.target.classList.contains('diagnostic-option')) {
            const nextFlow = e.target.getAttribute('data-next');
            addMessage(e.target.textContent, 'user');
            setTimeout(() => {
                startDiagnostic(nextFlow);
            }, 1000);
        }
    });
}

function startDiagnostic(flowKey) {
    const flow = diagnosticFlows[flowKey];
    if (!flow) return;
    
    let messageHTML = `<div class="diagnostic-question">${flow.question}</div>`;
    
    if (flow.options) {
        messageHTML += '<div class="diagnostic-options">';
        flow.options.forEach(option => {
            messageHTML += `
                <button class="diagnostic-option" data-next="${option.next}">
                    ${option.text}
                </button>
            `;
        });
        messageHTML += '</div>';
    } else if (flow.message) {
        messageHTML += `<div class="diagnostic-result">${flow.message.replace(/\n/g, '<br>')}</div>`;
        
        if (flow.options) {
            messageHTML += '<div class="diagnostic-actions">';
            flow.options.forEach(option => {
                messageHTML += `
                    <button class="diagnostic-action" data-action="${option}">
                        ${getActionText(option)}
                    </button>
                `;
            });
            messageHTML += '</div>';
        }
    }
    
    addMessage(messageHTML, 'bot');
}

function getActionText(action) {
    const actionTexts = {
        'agendar_visita': '📅 Agendar Visita Técnica',
        'mas_info': 'ℹ️ Más Información',
        'contacto_directo': '📞 Contacto Directo'
    };
    return actionTexts[action] || action;
}

// ===========================
// EXISTING FUNCTIONS (keep all your original code below)
// ===========================

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
    
    if (!contactForm) return;
    
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
    
    if (!ticketForm) return;
    
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
