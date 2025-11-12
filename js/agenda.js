// ===========================
// SISTEMA DE AGENDAMIENTO
// ===========================

class AppointmentScheduler {
    constructor() {
        this.selectedDate = null;
        this.selectedTime = null;
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        
        // Solo inicializar si existe la sección de agenda
        if (document.getElementById('agenda')) {
            this.init();
        }
    }

    init() {
        console.log('🚀 Inicializando sistema de agendamiento...');
        this.renderCalendar();
        this.generateTimeSlots();
        this.setupEventListeners();
        this.updateConfirmButton();
    }

    renderCalendar() {
        const calendarDays = document.getElementById('calendarDays');
        const currentMonthYear = document.getElementById('currentMonthYear');
        
        if (!calendarDays || !currentMonthYear) {
            console.error('No se encontraron los elementos del calendario');
            return;
        }
        
        // Limpiar el calendario
        calendarDays.innerHTML = '';
        
        // Establecer el título del mes actual
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        currentMonthYear.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Obtener información del mes
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Ajustar para que la semana comience en lunes
        const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1;
        
        // Añadir días vacíos para alinear el primer día
        for (let i = 0; i < adjustedStartingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarDays.appendChild(emptyDay);
        }
        
        // Añadir los días del mes
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            const dateStr = `${this.currentYear}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const currentDay = new Date(this.currentYear, this.currentMonth, day);
            currentDay.setHours(0, 0, 0, 0);
            
            // Verificar si el día está disponible
            const isAvailable = this.isDateAvailable(currentDay);
            const isToday = currentDay.getTime() === today.getTime();
            const isSelected = this.selectedDate && this.selectedDate.toDateString() === currentDay.toDateString();
            
            // Establecer clases CSS
            let dayClass = 'calendar-day';
            if (isAvailable) {
                dayClass += ' available';
            } else {
                dayClass += ' unavailable';
            }
            if (isToday) {
                dayClass += ' today';
            }
            if (isSelected) {
                dayClass += ' selected';
            }
            
            dayElement.className = dayClass;
            dayElement.textContent = day;
            dayElement.setAttribute('data-date', dateStr);
            
            if (isAvailable) {
                dayElement.addEventListener('click', () => {
                    this.selectDate(currentDay);
                });
            } else {
                dayElement.style.cursor = 'not-allowed';
                dayElement.style.opacity = '0.5';
            }
            
            calendarDays.appendChild(dayElement);
        }
        
        console.log('📅 Calendario renderizado correctamente');
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

    generateTimeSlots() {
        const timeSlotsContainer = document.getElementById('timeSlotsContainer');
        if (!timeSlotsContainer) return;
        
        timeSlotsContainer.innerHTML = '';
        
        // Generar horarios de 8:00 AM a 6:00 PM
        for (let hour = 8; hour <= 18; hour++) {
            const time24 = `${hour.toString().padStart(2, '0')}:00`;
            const time12 = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
            
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
            slotElement.textContent = time12;
            slotElement.setAttribute('data-time', time24);
            
            slotElement.addEventListener('click', () => {
                this.selectTime(time24, time12, slotElement);
            });
            
            timeSlotsContainer.appendChild(slotElement);
        }
        
        console.log('🕒 Horarios generados correctamente');
    }

    selectDate(date) {
        this.selectedDate = date;
        
        // Actualizar UI
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        const selectedDayElement = document.querySelector(`.calendar-day[data-date="${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}"]`);
        if (selectedDayElement) {
            selectedDayElement.classList.add('selected');
        }
        
        this.updateConfirmButton();
        this.showTemporaryMessage(`Fecha seleccionada: ${this.formatDate(date)}`, 'success');
    }

    selectTime(time24, time12, element) {
        this.selectedTime = time24;
        
        // Actualizar UI
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        element.classList.add('selected');
        
        this.updateConfirmButton();
        this.showTemporaryMessage(`Hora seleccionada: ${time12}`, 'success');
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
        
        // Limpiar selección
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
                this.confirmAppointment();
            });
        }
        
        // Validación del formulario en tiempo real
        ['agendaNombre', 'agendaTelefono', 'agendaDireccion', 'agendaProblema'].forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateConfirmButton();
                });
            }
        });
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

    validateForm() {
        const isFormComplete = this.isFormValid();
        this.updateConfirmButton();
        return isFormComplete;
    }

    isFormValid() {
        const nombre = document.getElementById('agendaNombre')?.value.trim() || '';
        const telefono = document.getElementById('agendaTelefono')?.value.trim() || '';
        const direccion = document.getElementById('agendaDireccion')?.value.trim() || '';
        const problema = document.getElementById('agendaProblema')?.value.trim() || '';
        
        return nombre !== '' && telefono !== '' && direccion !== '' && problema !== '';
    }

    updateConfirmButton() {
        const confirmBtn = document.getElementById('confirmAppointment');
        if (!confirmBtn) return;
        
        const isFormComplete = this.isFormValid();
        const hasSelection = this.selectedDate && this.selectedTime;
        
        if (isFormComplete && hasSelection) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.cursor = 'pointer';
        } else {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.6';
            confirmBtn.style.cursor = 'not-allowed';
        }
    }

    confirmAppointment() {
        if (!this.isFormValid()) {
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

        // Enviar por WhatsApp
        this.sendWhatsAppNotification(appointmentData);
        
        // Mostrar confirmación
        this.showConfirmation(appointmentData);
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
        message += `*Fecha solicitada:* ${formattedDate}\n`;
        message += `*Hora solicitada:* ${this.formatTime12(appointmentData.hora)}\n`;
        message += `*Problema/Servicio:* ${appointmentData.problema}\n\n`;
        message += `Por favor, confirmen mi reserva. ¡Gracias!`;
        
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/5491166804450?text=${encodedMessage}`, '_blank');
    }

    showConfirmation(appointmentData) {
        const formattedDate = this.formatDate(appointmentData.fecha);
        
        const confirmationHTML = `
            <div class="confirmation-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div class="confirmation-content" style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                    <div style="font-size: 3rem; color: #27ae60; margin-bottom: 15px;">✅</div>
                    <h3 style="color: #27ae60; margin-bottom: 20px; font-size: 1.5rem;">¡Cita Agendada Exitosamente!</h3>
                    <div class="appointment-details" style="text-align: left; margin-bottom: 25px; background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
                        <p><strong>🕒 Hora:</strong> ${this.formatTime12(appointmentData.hora)}</p>
                        <p><strong>👤 Cliente:</strong> ${appointmentData.nombre}</p>
                        <p><strong>📞 Teléfono:</strong> ${appointmentData.telefono}</p>
                        <p><strong>📍 Dirección:</strong> ${appointmentData.direccion}</p>
                        <p><strong>🔧 Servicio:</strong> ${appointmentData.problema}</p>
                    </div>
                    <p style="color: #666; margin-bottom: 20px; font-size: 0.9rem;">
                        Te contactaremos pronto para confirmar los detalles de tu servicio.
                    </p>
                    <div class="confirmation-actions" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="window.print()" style="padding: 12px 20px; font-size: 16px;">
                            <i class="fas fa-print"></i> Imprimir Comprobante
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.confirmation-modal').remove(); location.reload();" style="padding: 12px 20px; font-size: 16px;">
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
        const backgroundColor = type === 'success' ? '#e8f5e8' : 
                              type === 'error' ? '#ffeaa7' : '#e3f2fd';
        const textColor = type === 'success' ? '#27ae60' : 
                         type === 'error' ? '#e67e22' : '#1976d2';
        
        messageDiv.style.cssText = `
            background: ${backgroundColor}; 
            color: ${textColor}; 
            padding: 12px 15px; 
            border-radius: 8px; 
            margin: 10px 0; 
            text-align: center; 
            font-weight: 500;
            border-left: 4px solid ${textColor};
            font-size: 14px;
        `;
        messageDiv.textContent = message;
        messageDiv.classList.add('temporary-message');
        
        // Insertar después del botón de limpiar
        const clearButton = document.getElementById('clearSelection');
        if (clearButton && clearButton.parentNode) {
            clearButton.parentNode.insertBefore(messageDiv, clearButton.nextSibling);
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

    formatTime12(time24) {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour > 12 ? hour - 12 : hour;
        return `${hour12}:${minutes} ${period}`;
    }
}

// Inicializar el sistema de agendamiento cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    new AppointmentScheduler();
});
