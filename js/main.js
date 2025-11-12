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
