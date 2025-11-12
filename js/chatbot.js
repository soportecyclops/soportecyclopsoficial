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
    }
};

// ===========================
// DETALLES DE SERVICIOS
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
    console.log("Chatbot inteligente inicializado ✅");
}

// Llamar a la inicialización
initChatbotDiagnostic();
