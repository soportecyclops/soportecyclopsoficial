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
// CHATBOT COMPLETO - SISTEMA MEJORADO
// ===========================

// Variables globales del chatbot
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');
const notificationDot = document.getElementById('notificationDot');

// Respuestas del chatbot original
const responses = {
    "servicios": {
        message: "🔧 *Te cuento sobre nuestros servicios técnicos integrales:*\n\n" +
                "• *Soporte Informático:* Instalación de software (libre y de pago), mantenimiento preventivo, reparación o cambio de hardware. Trabajamos con todo tipo de software según tus necesidades.\n\n" +
                "• *Redes y Conectividad:* Instalación profesional desde el cable UTP hasta la configuración avanzada para máxima seguridad y velocidad.\n\n" +
                "• *Cámaras de Seguridad (CCTV):* Sistemas con marcas líderes como Dahua, Hikvision y otras de alta calidad.\n\n" +
                "• *Alarmas y Seguridad:* Sistemas inalámbricos, barreras infrarrojas, controles de acceso y cercos eléctricos perimetrales.\n\n" +
                "• *Domótica:* Automatización inteligente adaptada específicamente a lo que necesites.\n\n" +
                "• *Ciberseguridad:* Software empresarial, antivirus, firewalls, diagnósticos de seguridad y capacitaciones.\n\n" +
                "¿Qué servicio te interesa conocer más a fondo?",
        options: ["soporte_detalles", "redes_detalles", "cctv_detalles", "alarmas_detalles", "domotica_detalles", "ciberseguridad_detalles"]
    },
    
    "cotizacion": "📋 *Te ayudo con tu cotización:*\n\n" +
                 "Para darte el mejor presupuesto:\n" +
                 "1. Contame exactamente qué necesitás\n" + 
                 "2. Te escuchamos y consultamos tu presupuesto disponible\n" +
                 "3. Te ofrecemos distintas soluciones adaptadas\n" +
                 "4. Si es necesario, coordinamos una evaluación previa\n\n" +
                 "💡 *Importante:* La visita técnica no tiene costo dentro de Capital Federal.\n\n" +
                 "¿Querés que te contactemos para coordinar?",
                 
    "emergencia": "🚨 *Entiendo que es urgente, te ayudo ahora mismo:*\n\n" +
                 "Para atención inmediata:\n" +
                 "• 📞 Llamanos directamente al: +54 9 11 6680-4450\n" +
                 "• 💬 Escribinos por WhatsApp para respuesta más rápida\n" +
                 "• ⏰ Respondemos lo antes posible\n" +
                 "• 🏠 Fines de semana y feriados sujetos a disponibilidad\n\n" +
                 "¿Necesitás que te contactemos ya?",
                 
    "contacto": "📞 *Te paso nuestros datos de contacto:*\n\n" +
               "• *Teléfono/WhatsApp:* +54 9 11 6680-4450\n" +
               "• *Email:* soportecyclops@gmail.com\n" +
               "• *Horario atención:* Lunes a Viernes 9:00-18:00 | Sábados 9:00-13:00\n" +
               "• *Zona de cobertura:* Principalmente Capital Federal (consultanos por otras zonas)\n\n" +
               "¿Preferís que te llamemos nosotros?",
               
    "precios": "💲 *Te cuento sobre precios y pagos:*\n\n" +
              "Nuestros precios se adaptan a:\n" +
              "• La complejidad del servicio que necesitás\n" +
              "• Los materiales y equipos requeridos\n" +
              "• El tiempo de trabajo necesario\n\n" +
              "💡 *Lo que incluye:*\n" +
              "• Cotizaciones personalizadas sin cargo\n" +
              "• Distintos abonos con mantenimiento periódico\n" +
              "• Aceptamos todas las formas de pago\n" +
              "• Los materiales se definen conversando con vos\n\n" +
              "¿Te interesa que te preparemos una cotización?",
              
    "garantias": "🛡️ *Nuestra política de garantías:*\n\n" +
                "• *Servicios:* Seguimiento post-venta incluido en todos nuestros trabajos\n" +
                "• *Equipos:* Aplicamos la garantía de fábrica de cada marca\n" +
                "• *Nuestro compromiso:* Tu satisfacción es lo más importante\n\n" +
                "Todos nuestros clientes quedan satisfechos con el servicio ✅",
                
    "horarios": "🕒 *Horarios y zona de cobertura:*\n\n" +
               "• *Lunes a Viernes:* 9:00 - 18:00 hs\n" +
               "• *Sábados:* 9:00 - 13:00 hs\n" +
               "• *Emergencias:* Fines de semana y feriados sujetos a disponibilidad\n" +
               "• *Zona principal:* Capital Federal (consultanos por otras zonas)\n\n" +
               "¿Necesitás coordinar un horario específico?",
               
    "default": "🤖 No estoy seguro de entender tu pregunta. Te puedo ayudar con:\n\n" +
              "• Información detallada de todos nuestros servicios técnicos\n" +
              "• Cotizaciones y presupuestos personalizados\n" +
              "• Contacto directo con nuestro equipo\n" +
              "• Soporte urgente para emergencias\n\n" +
              "¿En qué más puedo asistirte?"
};

// Detalles de servicios
const serviceDetails = {
    "soporte_detalles": "💻 *Soporte Informático Completo:*\n\n" +
                       "• Instalación y configuración de software (libre y de pago)\n" +
                       "• Software especializado: audio, video, gestión empresarial\n" +
                       "• Bases de datos, drivers y actualizaciones\n" +
                       "• Mantenimiento preventivo y correctivo\n" +
                       "• Reparación o cambio de hardware\n" +
                       "• Optimización de sistemas para máximo rendimiento\n\n" +
                       "¿Qué necesitás específicamente para tu equipo?",
                       
    "redes_detalles": "🌐 *Redes Profesionales Completas:*\n\n" +
                     "• Instalación de cable UTP con fichas profesionales\n" +
                     "• Configuración avanzada para seguridad y velocidad\n" +
                     "• Separación y segmentación de redes\n" +
                     "• Cableado estructurado empresarial\n" +
                     "• Soluciones de conectividad para hogar y empresa\n\n" +
                     "¿Tenés algún problema de conectividad actualmente?",
                     
    "cctv_detalles": "📹 *Sistemas CCTV de Alta Calidad:*\n\n" +
                    "• Trabajamos con marcas líderes: Dahua, Hikvision\n" +
                    "• Otras marcas asiáticas con calidad garantizada\n" +
                    "• Instalación y configuración profesional completa\n" +
                    "• Sistemas IP y analógicos según tu necesidad\n" +
                    "• Asesoramiento personalizado sin compromiso\n\n" +
                    "¿Para qué tipo de propiedad necesitás el sistema?",
                    
    "alarmas_detalles": "🚨 *Sistemas de Seguridad Integral:*\n\n" +
                       "• Alarmas inalámbricas y cableadas\n" +
                       "• Barreras infrarrojas perimetrales\n" +
                       "• Controles de acceso modernos\n" +
                       "• Cercos eléctricos perimetrales\n" +
                       "• Configuración para tu control total\n" +
                       "• No realizamos monitoreo remoto\n\n" +
                       "¿Qué tipo de protección necesitás para tu espacio?",
                       
    "domotica_detalles": "🏠 *Domótica - Tu Hogar Inteligente:*\n\n" +
                        "¡Contame exactamente qué querés automatizar! Podemos hacer realidad tu proyecto.\n\n" +
                        "Algunas posibilidades:\n" +
                        "• Iluminación inteligente y programable\n" +
                        "• Control de climatización automático\n" +
                        "• Seguridad integrada con otros sistemas\n" +
                        "• Electrodomésticos conectados y controlables\n" +
                        "• Sistemas de entretenimiento integrados\n\n" +
                        "¿Qué tenés en mente para tu hogar o empresa?",
                        
    "ciberseguridad_detalles": "🔒 *Ciberseguridad Empresarial Avanzada:*\n\n" +
                              "• Instalación de software de seguridad empresarial\n" +
                              "• Antivirus y firewalls de última generación\n" +
                              "• Diagnósticos completos de seguridad\n" +
                              "• Pentesting (pruebas de penetración)\n" +
                              "• Capacitaciones para usuarios en seguridad básica\n" +
                              "• Estrategias para evitar pérdida de datos críticos\n\n" +
                              "¿Tenés alguna preocupación específica sobre seguridad?"
};

// ===========================
// FLUJOS DE DIAGNÓSTICO (ya los tienes)
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

// ===========================
// FUNCIONES PRINCIPALES DEL CHATBOT
// ===========================

// Auto-abrir chatbot
setTimeout(() => {
    if (!localStorage.getItem('cyclopsChatbotShown')) {
        chatbotWindow.style.display = 'flex';
        notificationDot.style.display = 'block';
        localStorage.setItem('cyclopsChatbotShown', 'true');
    }
}, 30000);

// Toggle chatbot
chatbotToggle.addEventListener('click', () => {
    chatbotWindow.style.display = chatbotWindow.style.display === 'flex' ? 'none' : 'flex';
    notificationDot.style.display = 'none';
});

chatbotClose.addEventListener('click', () => {
    chatbotWindow.style.display = 'none';
});

// Funciones del chatbot
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing-indicator');
    typingDiv.id = 'typingIndicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.classList.add('typing-dot');
        typingDiv.appendChild(dot);
    }
    
    const typingText = document.createElement('span');
    typingText.textContent = 'Asistente Cyclops está escribiendo...';
    typingText.style.fontSize = '0.8rem';
    typingText.style.color = '#7f8c8d';
    typingText.style.marginLeft = '10px';
    
    typingDiv.appendChild(typingText);
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    return typingDiv;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function sendMessage() {
    const message = chatbotInput.value.trim();
    if (message === '') return;

    addMessage(message, 'user');
    chatbotInput.value = '';

    const typingIndicator = showTypingIndicator();

    setTimeout(() => {
        hideTypingIndicator();
        
        let response = responses.default;
        let options = [];

        const lowerMessage = message.toLowerCase();

        // Detección de intenciones
        if (lowerMessage.includes('servicio') || lowerMessage.includes('ofrecen') || lowerMessage.includes('hacen') || 
            lowerMessage.includes('qué hacen') || lowerMessage.includes('que hacen')) {
            response = responses.servicios.message;
            options = responses.servicios.options;
        } else if (lowerMessage.includes('precio') || lowerMessage.includes('cuesta') || lowerMessage.includes('costo') || 
                   lowerMessage.includes('valor') || lowerMessage.includes('cuánto sale') || lowerMessage.includes('cuanto sale')) {
            response = responses.precios;
        } else if (lowerMessage.includes('horario') || lowerMessage.includes('cuándo') || lowerMessage.includes('cuando') || 
                   lowerMessage.includes('disponible') || lowerMessage.includes('atien')) {
            response = responses.horarios;
        } else if (lowerMessage.includes('contacto') || lowerMessage.includes('teléfono') || lowerMessage.includes('telefono') || 
                   lowerMessage.includes('email') || lowerMessage.includes('correo') || lowerMessage.includes('llamar') || 
                   lowerMessage.includes('número') || lowerMessage.includes('numero')) {
            response = responses.contacto;
        } else if (lowerMessage.includes('emergencia') || lowerMessage.includes('urgente') || lowerMessage.includes('inmediat') || 
                   lowerMessage.includes('ya') || lowerMessage.includes('ahora')) {
            response = responses.emergencia;
        } else if (lowerMessage.includes('garantía') || lowerMessage.includes('garantia')) {
            response = responses.garantias;
        } else if (lowerMessage.includes('cotizacion') || lowerMessage.includes('presupuesto') || lowerMessage.includes('presu')) {
            response = responses.cotizacion;
        }

        // Detalles de servicios
        const serviceKey = lowerMessage.replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
        if (serviceDetails[serviceKey]) {
            response = serviceDetails[serviceKey];
        }

        addMessage(response, 'bot', options);
    }, 1500);
}

function addMessage(text, sender, options = []) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    const textDiv = document.createElement('div');
    textDiv.innerHTML = text.replace(/\n/g, '<br>');
    contentDiv.appendChild(textDiv);

    // Opciones de servicios
    if (options.length > 0) {
        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('service-options');
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('service-option');
            button.textContent = option.replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())
                .replace('Detalles', 'Más Info');
            button.addEventListener('click', () => {
                addMessage(button.textContent, 'user');
                setTimeout(() => {
                    addMessage(serviceDetails[option] || responses.default, 'bot');
                }, 1000);
            });
            optionsDiv.appendChild(button);
        });
        
        contentDiv.appendChild(optionsDiv);
    }

    messageDiv.appendChild(contentDiv);
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    // Guardar conversación
    saveConversation();
}

function saveConversation() {
    const messages = chatbotMessages.innerHTML;
    localStorage.setItem('cyclopsChatbotConversation', messages);
}

function loadConversation() {
    const savedConversation = localStorage.getItem('cyclopsChatbotConversation');
    if (savedConversation) {
        chatbotMessages.innerHTML = savedConversation;
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
}

// ===========================
// SISTEMA DE DIAGNÓSTICO MEJORADO
// ===========================

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
// EVENT LISTENERS DEL CHATBOT
// ===========================

// Event listeners del chatbot
chatbotSend.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Preguntas rápidas originales (actualizadas por el sistema de diagnóstico)
document.querySelectorAll('.quick-question').forEach(button => {
    button.addEventListener('click', () => {
        const question = button.getAttribute('data-question');
        addMessage(button.querySelector('i').nextSibling.textContent.trim(), 'user');
        setTimeout(() => {
            if (question === 'servicios') {
                addMessage(responses[question].message, 'bot', responses[question].options);
            } else {
                addMessage(responses[question], 'bot');
            }
        }, 1000);
    });
});

// Sugerencias
document.querySelectorAll('.suggestion-btn').forEach(button => {
    button.addEventListener('click', () => {
        const question = button.getAttribute('data-question');
        addMessage(button.textContent, 'user');
        setTimeout(() => {
            addMessage(responses[question], 'bot');
        }, 1000);
    });
});

// Cargar conversación al iniciar
loadConversation();

// Inicializar sistema de diagnóstico
initChatbotDiagnostic();
