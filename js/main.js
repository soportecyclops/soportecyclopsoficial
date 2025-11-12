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
// AGENDA SYSTEM - Appointment Scheduler CORREGIDO
// ===========================
class AppointmentScheduler {
    constructor() {
        this.selectedDate = null;
        this.selectedTime = null;
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.init();
    }

    init() {
        // Only initialize if agenda section exists
        if (!document.getElementById('agenda')) return;
        
        this.setupCalendar();
        this.setupEventListeners();
        this.updateConfirmButton();
    }

    setupCalendar() {
        this.renderCalendar();
        this.renderTimeSlots();
    }

    renderCalendar() {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

        const currentMonthElement = document.getElementById('currentMonthYear');
        if (currentMonthElement) {
            currentMonthElement.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const monthLength = lastDay.getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let calendarHTML = '';
        
        // Días de la semana - HEADERS
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        days.forEach(day => {
            calendarHTML += `<div class="calendar-day header">${day}</div>`;
        });

        // Días vacíos al inicio (ajustado para empezar en lunes)
        const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1;
        for (let i = 0; i < adjustedStartingDay; i++) {
            calendarHTML += `<div class="calendar-day empty"></div>`;
        }

        // Días del mes
        for (let day = 1; day <= monthLength; day++) {
            const dateStr = `${this.currentYear}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const currentDay = new Date(this.currentYear, this.currentMonth, day);
            currentDay.setHours(0, 0, 0, 0);
            
            const isAvailable = this.isDateAvailable(currentDay);
            const isToday = currentDay.getTime() === today.getTime();
            const isSelected = this.selectedDate && 
                              this.selectedDate.getDate() === day && 
                              this.selectedDate.getMonth() === this.currentMonth && 
                              this.selectedDate.getFullYear() === this.currentYear;
            
            let dayClass = 'calendar-day';
            if (isAvailable) dayClass += ' available';
            if (isToday) dayClass += ' today';
            if (isSelected) dayClass += ' selected';
            if (!isAvailable) dayClass += ' unavailable';

            calendarHTML += `
                <div class="${dayClass}" data-date="${dateStr}">
                    ${day}
                </div>
            `;
        }

        const calendarDays = document.getElementById('calendarDays');
        if (calendarDays) {
            calendarDays.innerHTML = calendarHTML;
        }
    }

    isDateAvailable(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // No permitir fechas pasadas
        if (date < today) return false;
        
        // No permitir domingos (0 = Domingo)
        if (date.getDay() === 0) return false;
        
        return true;
    }

    renderTimeSlots() {
        const container = document.getElementById('timeSlotsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Horarios disponibles (8 AM - 6 PM)
        const timeSlots = [
            '08:00', '09:00', '10:00', '11:00', 
            '12:00', '13:00', '14:00', '15:00', 
            '16:00', '17:00', '18:00'
        ];
        
        timeSlots.forEach(time => {
            const isSelected = this.selectedTime === time;
            const slotElement = document.createElement('div');
            
            slotElement.className = `time-slot ${isSelected ? 'selected' : ''}`;
            slotElement.textContent = this.formatTimeDisplay(time);
            slotElement.setAttribute('data-time', time);
            
            slotElement.addEventListener('click', () => {
                this.selectTime(time, slotElement);
            });
            
            container.appendChild(slotElement);
        });
    }

    formatTimeDisplay(time24) {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour > 12 ? hour - 12 : hour;
        return `${hour12}:${minutes} ${period}`;
    }

    setupEventListeners() {
        // NAVEGACIÓN DEL CALENDARIO - VERSIÓN CORREGIDA
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
                this.updateConfirmButton();
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
                this.updateConfirmButton();
            });
        }

        // Selección de fecha - EVENT DELEGATION CORREGIDO
        const calendarDays = document.getElementById('calendarDays');
        if (calendarDays) {
            calendarDays.addEventListener('click', (e) => {
                const dayElement = e.target.closest('.calendar-day.available');
                if (dayElement) {
                    this.selectDateFromElement(dayElement);
                }
            });
        }

        // Selección de hora ya está en renderTimeSlots()

        // Botón de limpiar selección
        const clearSelectionBtn = document.getElementById('clearSelection');
        if (clearSelectionBtn) {
            clearSelectionBtn.addEventListener('click', () => {
                this.clearSelection();
            });
        }

        // Confirmar cita
        const confirmBtn = document.getElementById('confirmAppointment');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.createAppointment();
            });
        }

        // Validación del formulario en tiempo real
        ['agendaNombre', 'agendaTelefono', 'agendaDireccion', 'agendaProblema'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateConfirmButton();
                });
            }
        });
    }

    selectDateFromElement(dayElement) {
        // Deseleccionar todos los días
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Seleccionar el día clickeado
        dayElement.classList.add('selected');
        
        const dateStr = dayElement.getAttribute('data-date');
        const [year, month, day] = dateStr.split('-');
        this.selectedDate = new Date(year, month - 1, day);
        
        this.updateConfirmButton();
        this.showTemporaryMessage(`Fecha seleccionada: ${day}/${month}/${year}`, 'success');
    }

    selectTime(time, element) {
        // Deseleccionar todos los horarios
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Seleccionar el horario clickeado
        element.classList.add('selected');
        this.selectedTime = time;
        
        this.updateConfirmButton();
        this.showTemporaryMessage(`Hora seleccionada: ${this.formatTimeDisplay(time)}`, 'success');
    }

    clearSelection() {
        this.selectedDate = null;
        this.selectedTime = null;
        
        // Deseleccionar todos los días y horarios
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        this.updateConfirmButton();
        this.showTemporaryMessage('Selección limpiada. Por favor, selecciona una nueva fecha y hora.', 'info');
    }

    updateConfirmButton() {
        const isFormComplete = this.isFormComplete();
        const hasSelection = this.selectedDate && this.selectedTime;
        const confirmBtn = document.getElementById('confirmAppointment');
        
        if (confirmBtn) {
            if (isFormComplete && hasSelection) {
                confirmBtn.disabled = false;
                confirmBtn.style.opacity = '1';
                confirmBtn.style.cursor = 'pointer';
                confirmBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirmar Reserva';
            } else {
                confirmBtn.disabled = true;
                confirmBtn.style.opacity = '0.6';
                confirmBtn.style.cursor = 'not-allowed';
                confirmBtn.innerHTML = '<i class="fas fa-calendar-times"></i> Completa los datos';
            }
        }
    }

    isFormComplete() {
        const nombre = document.getElementById('agendaNombre')?.value.trim() || '';
        const telefono = document.getElementById('agendaTelefono')?.value.trim() || '';
        const direccion = document.getElementById('agendaDireccion')?.value.trim() || '';
        const problema = document.getElementById('agendaProblema')?.value.trim() || '';
        
        return nombre !== '' && telefono !== '' && direccion !== '' && problema !== '';
    }

    async createAppointment() {
        if (!this.isFormComplete()) {
            this.showTemporaryMessage('Por favor, completa todos los campos obligatorios.', 'error');
            return;
        }
        
        if (!this.selectedDate || !this.selectedTime) {
            this.showTemporaryMessage('Por favor, selecciona una fecha y hora.', 'error');
            return;
        }

        const appointmentData = {
            nombre: document.getElementById('agendaNombre').value,
            telefono: document.getElementById('agendaTelefono').value,
            email: document.getElementById('agendaEmail')?.value || '',
            direccion: document.getElementById('agendaDireccion').value,
            problema: document.getElementById('agendaProblema').value,
            fecha: this.selectedDate,
            hora: this.selectedTime
        };

        try {
            // Enviar por WhatsApp
            this.sendWhatsAppNotification(appointmentData);
            
            // Mostrar confirmación
            this.showConfirmation(appointmentData);
            
        } catch (error) {
            console.error('Error al crear la cita:', error);
            this.showTemporaryMessage('Error al agendar la cita. Por favor, intentá nuevamente.', 'error');
        }
    }

    sendWhatsAppNotification(appointmentData) {
        const formattedDate = this.formatDate(appointmentData.fecha);
        
        let message = `¡Hola! Quiero agendar un servicio técnico:\n\n`;
        message += `*Nombre:* ${appointmentData.nombre}\n`;
        message += `*Teléfono:* ${appointmentData.telefono}\n`;
        if (appointmentData.email) {
            message += `*Email:* ${appointmentData.email}\n`;
        }
        message += `*Dirección:* ${appointmentData.direccion}\n`;
        message += `*Fecha seleccionada:* ${formattedDate}\n`;
        message += `*Hora seleccionada:* ${this.formatTimeDisplay(appointmentData.hora)}\n`;
        message += `*Problema/Servicio:* ${appointmentData.problema}\n\n`;
        message += `Por favor, confirmen mi reserva. ¡Gracias!`;
        
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/5491166804450?text=${encodedMessage}`, '_blank');
    }

    showConfirmation(appointmentData) {
        const formattedDate = this.formatDate(appointmentData.fecha);
        
        const confirmationHTML = `
            <div class="confirmation-modal">
                <div class="confirmation-content">
                    <div style="font-size: 3rem; color: #27ae60; margin-bottom: 15px;">✅</div>
                    <h3 style="color: #27ae60; margin-bottom: 20px; font-size: 1.5rem;">¡Cita Agendada Exitosamente!</h3>
                    <div class="appointment-details">
                        <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
                        <p><strong>🕒 Hora:</strong> ${this.formatTimeDisplay(appointmentData.hora)}</p>
                        <p><strong>👤 Cliente:</strong> ${appointmentData.nombre}</p>
                        <p><strong>📞 Teléfono:</strong> ${appointmentData.telefono}</p>
                        <p><strong>📍 Dirección:</strong> ${appointmentData.direccion}</p>
                        <p><strong>🔧 Servicio:</strong> ${appointmentData.problema}</p>
                    </div>
                    <p style="color: #666; margin-bottom: 20px; font-size: 0.9rem;">
                        Te contactaremos pronto para confirmar los detalles de tu servicio.
                    </p>
                    <div class="confirmation-actions">
                        <button class="btn btn-primary" onclick="window.print()">
                            <i class="fas fa-print"></i> Imprimir Comprobante
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.confirmation-modal').remove(); location.reload();">
                            <i class="fas fa-check"></i> Aceptar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', confirmationHTML);
        
        // Limpiar formulario
        this.clearForm();
    }

    clearForm() {
        const agendaForm = document.getElementById('agendaForm');
        if (agendaForm) {
            agendaForm.reset();
        }
        this.clearSelection();
    }

    showTemporaryMessage(message, type = 'info') {
        // Eliminar mensaje anterior si existe
        const existingMessage = document.querySelector('.temporary-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `temporary-message ${type}`;
        messageDiv.textContent = message;
        
        // Insertar en el contenedor de botones
        const buttonContainer = document.querySelector('.button-container');
        if (buttonContainer) {
            buttonContainer.parentNode.insertBefore(messageDiv, buttonContainer);
        }
        
        // Auto-eliminar después de 4 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 4000);
    }

    formatDate(date) {
        return date.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// ===========================
// CHATBOT INTELIGENTE Y EMPÁTICO - SISTEMA MEJORADO
// ===========================

// Variables globales del chatbot
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');
const notificationDot = document.getElementById('notificationDot');

// ===========================
// SISTEMA DE DETECCIÓN DE INTENCIONES MEJORADO
// ===========================
class IntentRecognizer {
    static recognizeIntent(message) {
        const lowerMessage = this.normalizeText(message);
        
        // Detección de problemas técnicos específicos
        if (this.isPCProblem(lowerMessage)) return 'pc_problemas';
        if (this.isNetworkProblem(lowerMessage)) return 'redes_problemas';
        if (this.isCameraProblem(lowerMessage)) return 'camaras_problemas';
        if (this.isAlarmProblem(lowerMessage)) return 'alarmas_problemas';
        if (this.isSmartHomeProblem(lowerMessage)) return 'domotica_problemas';
        
        // Detección de intenciones generales
        if (this.isServiceInquiry(lowerMessage)) return 'servicios';
        if (this.isPricingInquiry(lowerMessage)) return 'precios';
        if (this.isEmergency(lowerMessage)) return 'emergencia';
        if (this.isContactRequest(lowerMessage)) return 'contacto';
        if (this.isQuoteRequest(lowerMessage)) return 'cotizacion';
        if (this.isGreeting(lowerMessage)) return 'saludo';
        if (this.isThanks(lowerMessage)) return 'agradecimiento';
        
        return 'no_entendido';
    }
    
    static normalizeText(text) {
        return text.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // elimina acentos
            .replace(/[^a-z0-9\s]/g, ' ') // elimina caracteres especiales
            .replace(/\s+/g, ' ') // normaliza espacios
            .trim();
    }
    
    static isPCProblem(text) {
        const keywords = [
            'pc', 'computadora', 'laptop', 'notebook', 'windows', 'enciende', 'apaga',
            'pantalla', 'monitor', 'negro', 'azul', 'lento', 'trabado', 'congelado',
            'virus', 'antivirus', 'software', 'hardware', 'disco', 'memoria', 'ram',
            'procesador', 'teclado', 'mouse', 'sonido', 'audio', 'internet', 'wifi',
            'bloqueado', 'formatear', 'reinicia', 'no funciona', 'no anda'
        ];
        return keywords.some(keyword => text.includes(keyword));
    }
    
    static isNetworkProblem(text) {
        const keywords = [
            'internet', 'wifi', 'red', 'conexion', 'router', 'modem', 'inalambrico',
            'cable', 'ethernet', 'senal', 'velocidad', 'lento', 'corta', 'desconecta',
            'ip', 'dns', 'configuracion', 'contraseña', 'clave', 'acceso', 'conectividad',
            'no conecta', 'sin internet', 'no hay señal'
        ];
        return keywords.some(keyword => text.includes(keyword));
    }
    
    static isCameraProblem(text) {
        const keywords = [
            'camara', 'camaras', 'seguridad', 'cctv', 'grabacion', 'video', 'vigilancia',
            'dahua', 'hikvision', 'ip', 'analogica', 'monitoreo', 'alarma', 'sensor',
            'movimiento', 'noche', 'vision', 'no ve', 'no graba', 'no funciona'
        ];
        return keywords.some(keyword => text.includes(keyword));
    }
    
    static isAlarmProblem(text) {
        const keywords = [
            'alarma', 'sensor', 'movimiento', 'puerta', 'ventana', 'sirena', 'panel',
            'control', 'acceso', 'codigo', 'pin', 'activar', 'desactivar', 'falsa alarma',
            'no suena', 'no detecta', 'no funciona', 'seguridad', 'intrusion'
        ];
        return keywords.some(keyword => text.includes(keyword));
    }
    
    static isSmartHomeProblem(text) {
        const keywords = [
            'domotica', 'smart home', 'casa inteligente', 'automatizacion', 'luces',
            'iluminacion', 'clima', 'temperatura', 'termostato', 'cortinas', 'persianas',
            'control', 'app', 'movil', 'voz', 'alexa', 'google home', 'asistente'
        ];
        return keywords.some(keyword => text.includes(keyword));
    }
    
    static isServiceInquiry(text) {
        const keywords = ['servicio', 'servicios', 'ofrecen', 'hacen', 'que hacen', 'trabajan'];
        return keywords.some(keyword => text.includes(keyword));
    }
    
    static isPricingInquiry(text) {
        const keywords = ['precio', 'cuesta', 'costo', 'valor', 'cuanto sale', 'tarifa', 'honorario'];
        return keywords.some(keyword => text.includes(keyword));
    }
    
    static isEmergency(text) {
        const keywords = ['urgente', 'emergencia', 'ya', 'ahora', 'inmediato', 'rapido', 'ya mismo'];
        return keywords.some(keyword => text.includes(keyword));
    }
    
    static isContactRequest(text) {
        const keywords = ['contacto', 'telefono', 'whatsapp', 'llamar', 'numero', 'email', 'correo'];
        return keywords.some(keyword => text.includes(keyword));
    }
    
    static isQuoteRequest(text) {
        const keywords = ['cotizacion', 'presupuesto', 'presu', 'presupeusto', 'cotiza'];
        return keywords.some(keyword => text.includes(keyword));
    }
    
    static isGreeting(text) {
        const keywords = ['hola', 'buenas', 'buenos', 'buen dia', 'buenas tardes', 'buenas noches'];
        return keywords.some(keyword => text.includes(keyword));
    }
    
    static isThanks(text) {
        const keywords = ['gracias', 'gracia', 'thank', 'merci', 'agradecido'];
        return keywords.some(keyword => text.includes(keyword));
    }
}

// ===========================
// RESPUESTAS EMPÁTICAS Y NATURALES
// ===========================
const empatheticResponses = {
    "saludo": [
        "¡Hola! 👋 Me da gusto saludarte. Soy el asistente de Soporte Cyclops, ¿en qué puedo ayudarte hoy?",
        "¡Hola! 😊 ¿Cómo estás? Cuéntame, ¿qué problema técnico tenés para poder asistirte?",
        "¡Buen día! 🌟 Estoy aquí para ayudarte con cualquier problema técnico que tengas. ¿Por dónde empezamos?"
    ],
    
    "agradecimiento": [
        "¡De nada! 😊 Me alegra mucho poder haberte ayudado. ¿Hay algo más en lo que pueda asistirte?",
        "¡No hay problema! 👍 Estoy aquí cuando me necesites. ¿Necesitás ayuda con algo más?",
        "¡Un placer! ✨ No dudes en consultarme si tenés alguna otra duda o problema."
    ],
    
    "no_entendido": [
        "🤔 Perdoná, no estoy seguro de entenderte completamente. ¿Podrías contarme un poco más sobre lo que necesitás?",
        "😅 Creo que no capté bien tu mensaje. ¿Podrías explicarme de otra forma qué problema tenés?",
        "💭 No logro entender exactamente qué necesitás. ¿Me contás con más detalles para poder ayudarte mejor?"
    ]
};

// ===========================
// SISTEMA DE RESPUESTAS MEJORADO
// ===========================
const intelligentResponses = {
    "pc_problemas": {
        message: "🔧 **¡Entiendo que tenés problemas con la computadora!** \n\nLos problemas de PC son muy comunes, no te preocupes. Podemos resolverlo juntos. ¿Tu PC enciende normalmente o tenés algún problema específico?",
        options: [
            { text: "✅ Sí, enciende pero tiene problemas", next: "pc_enciende_si" },
            { text: "❌ No enciende para nada", next: "pc_no_enciende" },
            { text: "🐌 Va muy lento o se traba", next: "pc_lento" },
            { text: "🌐 Problemas de internet/WiFi", next: "redes_problemas" }
        ],
        empathetic: true
    },
    
    "redes_problemas": {
        message: "📶 **¡Veo que tenés problemas de conexión!** \n\nLas fallas de internet pueden ser muy frustrantes. ¿El problema es con el WiFi, con el cable de red, o no tenés conexión en absoluto?",
        options: [
            { text: "📶 WiFi no funciona o es lento", next: "wifi_problemas" },
            { text: "🔌 Cable de red no conecta", next: "cable_problemas" },
            { text: "🚫 No hay internet en ningún dispositivo", next: "internet_total" },
            { text: "📱 Solo falla en algunos dispositivos", next: "dispositivos_especificos" }
        ],
        empathetic: true
    },
    
    "wifi_problemas": {
        message: "📡 **Problemas de WiFi - te entiendo perfectamente** \n\nEl WiFi puede fallar por muchas razones. ¿Notás que la señal es débil, o directamente no te podés conectar?",
        options: [
            { text: "📶 Señal débil o intermitente", next: "wifi_senal_debil" },
            { text: "🚫 No me puedo conectar", next: "wifi_sin_conexion" },
            { text: "🐌 Conexión muy lenta", next: "wifi_lento" },
            { text: "🔄 Se desconecta solo", next: "wifi_inestable" }
        ],
        empathetic: true
    },
    
    "servicios": {
        message: "🔧 **¡Claro! Te cuento sobre nuestros servicios:**\n\nTrabajamos con todo tipo de soluciones técnicas. ¿Qué es lo que más te interesa o necesitás resolver?",
        options: [
            { text: "💻 Soporte de PC y computadoras", next: "soporte_detalles" },
            { text: "📡 Redes e Internet", next: "redes_detalles" },
            { text: "📹 Cámaras de seguridad", next: "cctv_detalles" },
            { text: "🚨 Alarmas y sistemas de seguridad", next: "alarmas_detalles" },
            { text: "🏠 Domótica y automatización", next: "domotica_detalles" }
        ],
        empathetic: false
    },
    
    "emergencia": {
        message: "🚨 **¡Entiendo que es urgente! Te ayudo inmediatamente**\n\nPara atención prioritaria te recomiendo:\n\n• 📞 **Llamada directa**: +54 9 11 6680-4450 (respuesta en segundos)\n• 💬 **WhatsApp urgente**: Mismo número, prioridad inmediata\n• 🚗 **Visita técnica**: Podemos coordinar para hoy mismo\n\n¿Qué te resulta más conveniente?",
        options: [
            { text: "📞 Llamar ahora mismo", action: "llamar_ahora" },
            { text: "💬 Escribir por WhatsApp", action: "whatsapp_urgente" },
            { text: "🚗 Coordinar visita urgente", action: "visita_urgente" }
        ],
        empathetic: true
    },
    
    "cotizacion": {
        message: "💰 **¡Perfecto! Te ayudo con el presupuesto**\n\nPara darte una cotización precisa, contame brevemente:\n• ¿Qué equipo o sistema necesitás arreglar/instalar?\n• ¿Qué problema específico tiene?\n• ¿En qué zona estás aproximadamente?\n\nCon eso te doy un estimado rápido 👍",
        quick_reply: true,
        empathetic: true
    },
    
    "precios": {
        message: "💲 **Sobre precios y formas de pago:**\n\nNuestros honorarios se adaptan a cada situación para que sea justo para vos. Trabajamos con:\n\n• **Presupuesto sin cargo** previo a cualquier trabajo\n• **Distintas opciones** según tu presupuesto\n• **Todas las formas de pago** disponibles\n• **Transparencia total** en los costos\n\n¿Te interesa que hablemos de números específicos para tu caso?",
        options: ["cotizacion_personalizada", "info_precios_general"],
        empathetic: true
    },
    
    "contacto": {
        message: "📞 **¡Claro! Acá tenés nuestras vías de contacto:**\n\n• **Teléfono/WhatsApp**: +54 9 11 6680-4450\n• **Email**: soportecyclops@gmail.com\n• **Horario**: Lunes a Viernes 9:00-18:00 | Sábados 9:00-13:00\n• **Zona**: Principalmente Capital Federal\n\n¿Preferís que te contactemos nosotros?",
        options: ["contactarme_yo", "que_me_llamen"],
        empathetic: false
    }
};

// ===========================
// DETALLES DE SERVICIOS (actualizados)
// ===========================
const serviceDetails = {
    "soporte_detalles": "💻 **Soporte Informático Completo**\n\nTrabajamos con:\n• Instalación y configuración de software (libre y de pago)\n• Mantenimiento preventivo y correctivo\n• Reparación o cambio de hardware\n• Optimización de sistemas\n• Eliminación de virus y malware\n\n¿Qué necesitás específicamente para tu equipo?",
    
    "redes_detalles": "🌐 **Redes Profesionales**\n\nSoluciones de conectividad:\n• Instalación de cableado estructurado\n• Configuración avanzada de routers\n• Optimización de señal WiFi\n• Seguridad de red empresarial\n• Soluciones para hogar y empresa\n\n¿Tenés algún problema de conectividad ahora mismo?",
    
    "cctv_detalles": "📹 **Sistemas de Seguridad CCTV**\n\nTrabajamos con marcas líderes:\n• Dahua, Hikvision y otras de alta calidad\n• Sistemas IP y analógicos\n• Instalación profesional completa\n• Monitoreo remoto\n• Asesoramiento personalizado\n\n¿Para qué tipo de propiedad necesitás el sistema?",
    
    "alarmas_detalles": "🚨 **Sistemas de Alarma Integrales**\n\nProtección completa:\n• Alarmas inalámbricas y cableadas\n• Sensores de movimiento y apertura\n• Controles de acceso modernos\n• Cercos eléctricos perimetrales\n• Configuración a tu medida\n\n¿Qué tipo de protección buscás?",
    
    "domotica_detalles": "🏠 **Domótica - Hogar Inteligente**\n\n¡Contame tu idea! Podemos hacer realidad proyectos como:\n• Iluminación inteligente programable\n• Control de climatización automático\n• Seguridad integrada\n• Electrodomésticos conectados\n• Sistemas de entretenimiento\n\n¿Qué te gustaría automatizar?"
};

// ===========================
// MENSAJE DE BIENVENIDA MEJORADO
// ===========================
const improvedWelcomeMessage = `
<div class="welcome-message">
    <strong>¡Hola! Soy tu asistente de Soporte Cyclops 👋</strong>
    <p>Estoy aquí para ayudarte a resolver tus problemas técnicos rápidamente. ¿Por dónde empezamos?</p>
    
    <div class="quick-actions">
        <div class="action-category">
            <h4>🚀 <strong>¿Qué necesitás resolver?</strong></h4>
            <button class="quick-question primary" data-action="diagnostico_rapido">
                <i class="fas fa-bolt"></i>
                Diagnóstico Rápido de Mi Problema
            </button>
        </div>
        
        <div class="action-category">
            <h4>🔧 <strong>Servicios Inmediatos</strong></h4>
            <button class="quick-question" data-intent="emergencia">
                <i class="fas fa-exclamation-triangle"></i>
                Necesito Ayuda Urgente
            </button>
            <button class="quick-question" data-intent="cotizacion">
                <i class="fas fa-calculator"></i>
                Presupuesto Express
            </button>
        </div>
        
        <div class="action-category">
            <h4>💡 <strong>Información y Consultas</strong></h4>
            <button class="quick-question" data-intent="servicios">
                <i class="fas fa-laptop-medical"></i>
                Conocer Servicios
            </button>
            <button class="quick-question" data-intent="precios">
                <i class="fas fa-file-invoice-dollar"></i>
                Precios y Formas de Pago
            </button>
        </div>
        
        <div class="direct-contact">
            <p><strong>¿Preferís contacto directo?</strong></p>
            <button class="contact-btn whatsapp-btn" data-action="contacto_whatsapp">
                <i class="fab fa-whatsapp"></i>
                Chat Directo por WhatsApp
            </button>
            <button class="contact-btn phone-btn" data-action="llamada_directa">
                <i class="fas fa-phone"></i>
                Llamada Inmediata
            </button>
        </div>
    </div>
</div>
`;

// ===========================
// FUNCIONES PRINCIPALES DEL CHATBOT MEJORADO
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

// Funciones del chatbot mejoradas
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

function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

function sendMessage() {
    const message = chatbotInput.value.trim();
    if (message === '') return;

    addMessage(message, 'user');
    chatbotInput.value = '';

    const typingIndicator = showTypingIndicator();

    setTimeout(() => {
        hideTypingIndicator();
        processUserMessage(message);
    }, 1500 + Math.random() * 1000); // Tiempo variable para parecer más humano
}

function processUserMessage(message) {
    const intent = IntentRecognizer.recognizeIntent(message);
    
    switch(intent) {
        case 'saludo':
            addMessage(getRandomResponse(empatheticResponses.saludo), 'bot');
            break;
            
        case 'agradecimiento':
            addMessage(getRandomResponse(empatheticResponses.agradecimiento), 'bot');
            break;
            
        case 'no_entendido':
            addMessage(getRandomResponse(empatheticResponses.no_entendido), 'bot');
            break;
            
        default:
            if (intelligentResponses[intent]) {
                const response = intelligentResponses[intent];
                let messageText = response.message;
                
                // Añadir toque empático si corresponde
                if (response.empathetic) {
                    messageText = messageText;
                }
                
                addMessage(messageText, 'bot', response.options);
            } else {
                // Respuesta por defecto mejorada
                addMessage("🤔 **Creo que entendí que necesitás ayuda técnica, pero no estoy seguro de qué específicamente.**\n\n¿Podrías contarme un poco más sobre el problema que tenés? Por ejemplo: 'mi PC no enciende', 'el WiFi no funciona', 'necesito instalar cámaras', etc.", 'bot');
            }
    }
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
    if (options && options.length > 0) {
        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('service-options');
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('service-option');
            
            if (option.action) {
                // Botón con acción directa
                button.textContent = option.text;
                button.addEventListener('click', () => {
                    handleAction(option.action);
                });
            } else if (option.next) {
                // Botón con flujo de conversación
                button.textContent = option.text;
                button.addEventListener('click', () => {
                    addMessage(option.text, 'user');
                    setTimeout(() => {
                        processFlow(option.next);
                    }, 1000);
                });
            } else {
                // Botón estándar
                button.textContent = option.replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())
                    .replace('Detalles', 'Más Info');
                button.addEventListener('click', () => {
                    addMessage(button.textContent, 'user');
                    setTimeout(() => {
                        addMessage(serviceDetails[option] || "Te cuento más sobre esto...", 'bot');
                    }, 1000);
                });
            }
            
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

function processFlow(flowKey) {
    if (intelligentResponses[flowKey]) {
        const response = intelligentResponses[flowKey];
        addMessage(response.message, 'bot', response.options);
    } else if (serviceDetails[flowKey]) {
        addMessage(serviceDetails[flowKey], 'bot');
    } else {
        addMessage("💡 **Basado en lo que me contás, te recomiendo que hablemos para evaluar tu caso específico.**\n\n¿Querés que coordine una consulta técnica sin compromiso?", 'bot', [
            { text: "📅 Sí, coordinar consulta", action: "agendar_consulta" },
            { text: "💬 Más información primero", action: "mas_info" }
        ]);
    }
}

function handleAction(action) {
    switch(action) {
        case 'llamar_ahora':
            window.open('tel:+5491166804450');
            addMessage("📞 **Perfecto, te estoy conectando por teléfono...**\n\nSi no se completa la llamada, podés marcar directamente al: +54 9 11 6680-4450", 'bot');
            break;
            
        case 'whatsapp_urgente':
            const urgentMessage = "¡Hola! Necesito ayuda urgente con un problema técnico. Por favor contáctenme lo antes posible.";
            window.open(`https://wa.me/5491166804450?text=${encodeURIComponent(urgentMessage)}`, '_blank');
            addMessage("💬 **¡Listo! Te redirijo a WhatsApp para atención inmediata...**", 'bot');
            break;
            
        case 'contacto_whatsapp':
            const defaultMessage = "¡Hola! Me comunico desde el sitio web de Soporte Cyclops y necesito información sobre sus servicios.";
            window.open(`https://wa.me/5491166804450?text=${encodeURIComponent(defaultMessage)}`, '_blank');
            addMessage("💬 **Te llevo a WhatsApp para que hablemos directamente...**", 'bot');
            break;
            
        case 'llamada_directa':
            window.open('tel:+5491166804450');
            addMessage("📞 **Conectándote por teléfono...**\n\nNúmero directo: +54 9 11 6680-4450", 'bot');
            break;
            
        case 'agendar_consulta':
            addMessage("📅 **¡Excelente! Para agendar una consulta técnica:**\n\nPodés contactarnos directamente al +54 9 11 6680-4450 o escribirnos por WhatsApp para coordinar día y hora que te convenga.\n\nLa consulta inicial no tiene costo 😊", 'bot');
            break;
            
        default:
            addMessage("💡 Te recomiendo contactarnos directamente para resolver esto más rápido: +54 9 11 6680-4450", 'bot');
    }
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
    } else {
        // Mostrar mensaje de bienvenida mejorado
        addMessage(improvedWelcomeMessage, 'bot');
    }
}

// ===========================
// EVENT LISTENERS MEJORADOS
// ===========================

// Event listeners del chatbot
chatbotSend.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Preguntas rápidas mejoradas
document.addEventListener('click', function(e) {
    if (e.target.closest('.quick-question')) {
        const button = e.target.closest('.quick-question');
        const action = button.getAttribute('data-action');
        const intent = button.getAttribute('data-intent');
        
        if (action === 'diagnostico_rapido') {
            addMessage("Necesito ayuda con un problema técnico - diagnóstico rápido", 'user');
            setTimeout(() => {
                addMessage("🔍 **¡Perfecto! Hagamos un diagnóstico rápido**\n\nContame, ¿qué equipo o sistema te está dando problemas?", 'bot', [
                    { text: "💻 Computadora/PC", next: "pc_problemas" },
                    { text: "📡 Internet/Redes", next: "redes_problemas" },
                    { text: "📹 Cámaras de seguridad", next: "camaras_problemas" },
                    { text: "🚨 Sistema de alarmas", next: "alarmas_problemas" },
                    { text: "🏠 Domótica/Automatización", next: "domotica_problemas" }
                ]);
            }, 1000);
        } else if (intent) {
            addMessage(button.textContent, 'user');
            setTimeout(() => {
                processUserMessage(button.textContent);
            }, 1000);
        }
    }
});

// Sugerencias
document.querySelectorAll('.suggestion-btn').forEach(button => {
    button.addEventListener('click', () => {
        const question = button.getAttribute('data-question');
        addMessage(button.textContent, 'user');
        setTimeout(() => {
            processUserMessage(button.textContent);
        }, 1000);
    });
});

// Cargar conversación al iniciar
loadConversation();

// Inicializar sistema de diagnóstico mejorado
function initChatbotDiagnostic() {
    // El sistema ahora está integrado en las funciones principales
    console.log("Chatbot inteligente inicializado ✅");
}

// Llamar a la inicialización
initChatbotDiagnostic();
