// ===========================
// CHATBOT INTELIGENTE CON DIAGNÓSTICO GUIADO
// Soporte Cyclops — v2.1 (con fix de localStorage)
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Inicializando chatbot con diagnóstico guiado...");
    initChatbot();
});

function initChatbot() {
    const chatbotToggle   = document.getElementById('chatbotToggle');
    const chatbotWindow   = document.getElementById('chatbotWindow');
    const chatbotClose    = document.getElementById('chatbotClose');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput    = document.getElementById('chatbotInput');
    const chatbotSend     = document.getElementById('chatbotSend');
    const notificationDot = document.getElementById('notificationDot');

    if (!chatbotToggle || !chatbotWindow) {
        console.error("❌ No se encontraron los elementos del chatbot");
        return;
    }

    // ===========================
    // ESTADO DEL DIAGNÓSTICO
    // ===========================
    let diagState = {
        active: false,
        flow: null,
        step: 0,
        answers: {}
    };

    // ===========================
    // ARRAY DE MENSAJES ESTRUCTURADOS (para localStorage)
    // ===========================
    let conversationHistory = [];

    // ===========================
    // FLUJOS DE DIAGNÓSTICO GUIADO
    // ===========================
    const diagFlows = {
        "pc_diagnostico": {
            intro: "🔍 **¡Perfecto! Hagamos un diagnóstico de tu equipo en 3 pasos.**\n\nTe voy a hacer algunas preguntas para identificar el problema con precisión.",
            steps: [
                {
                    key: "tipo_equipo",
                    question: "¿Qué tipo de equipo tiene el problema?",
                    options: [
                        "💻 Laptop / Notebook",
                        "🖥️ PC de escritorio",
                        "🖨️ Impresora / Periférico",
                        "📱 Tablet / Dispositivo móvil"
                    ]
                },
                {
                    key: "sintoma",
                    question: "¿Cuál es el síntoma principal?",
                    options: [
                        "⚡ No enciende o no arranca",
                        "🔥 Se sobrecalienta o apaga solo",
                        "🐌 Va muy lento o se traba",
                        "💥 Pantalla negra o sin imagen",
                        "🦠 Sospecho de virus o malware",
                        "💾 Perdí archivos o datos importantes",
                        "🔊 Hace ruidos extraños"
                    ]
                },
                {
                    key: "duracion",
                    question: "¿Desde cuándo tiene este problema?",
                    options: [
                        "Hoy mismo (es nuevo)",
                        "Desde esta semana",
                        "Hace más de un mes",
                        "Es intermitente, va y viene"
                    ]
                }
            ],
            diagnose: function(answers) {
                const critico = answers.sintoma === "💾 Perdí archivos o datos importantes";
                const urgente = critico || ["⚡ No enciende o no arranca", "💥 Pantalla negra o sin imagen"].includes(answers.sintoma);
                return {
                    titulo: "🖥️ Diagnóstico: " + (answers.tipo_equipo || "PC/Laptop"),
                    severidad: critico ? "alta" : urgente ? "media" : "baja",
                    resumen: "Tu equipo presenta **" + ((answers.sintoma||"").replace(/[⚡🔥🐌💥🦠💾🔊]/g,"").trim()) + "**.",
                    pasos: [
                        critico
                            ? "🚨 **Situación crítica** — No uses el equipo para evitar mayor pérdida de datos. La recuperación es posible con intervención especializada inmediata."
                            : urgente
                                ? "⚠️ **Atención prioritaria recomendada** — El problema puede agravarse si no se atiende pronto."
                                : "✅ El problema tiene solución, podemos programar la visita con flexibilidad horaria.",
                        "🔍 Realizamos diagnóstico técnico completo antes de cualquier presupuesto, **sin cargo**.",
                        (answers.tipo_equipo && answers.tipo_equipo.includes("Laptop"))
                            ? "🏠 Para laptops ofrecemos servicio a domicilio o retiro y entrega en CABA y GBA."
                            : "🏠 Servicio a domicilio disponible en CABA y toda la zona GBA.",
                        "⏱️ Tiempo estimado de resolución: 2 a 6 horas según la complejidad del caso."
                    ],
                    servicio: "soporte-informatico",
                    servicioLabel: "Soporte Informático"
                };
            }
        },

        "redes_diagnostico": {
            intro: "📡 **¡Entendido! Diagnostiquemos tu problema de red.**\n\nEsto nos va a llevar solo un momento.",
            steps: [
                {
                    key: "problema_red",
                    question: "¿Cuál es el problema principal?",
                    options: [
                        "🚫 Sin internet en absoluto",
                        "🐌 Conexión lenta o inestable",
                        "📶 WiFi con mala cobertura o señal débil",
                        "🔗 No conecta a la red interna de la empresa",
                        "🔒 Necesito configurar una red segura nueva"
                    ]
                },
                {
                    key: "tipo_instalacion",
                    question: "¿Qué tipo de instalación es?",
                    options: [
                        "🏠 Hogar / Departamento",
                        "🏢 Oficina pequeña (hasta 10 equipos)",
                        "🏗️ Empresa o local (más de 10 equipos)",
                        "📦 Local comercial"
                    ]
                },
                {
                    key: "equipos_afectados",
                    question: "¿Cuántos equipos están afectados?",
                    options: [
                        "Solo 1 dispositivo",
                        "Entre 2 y 5 dispositivos",
                        "Toda la red / todos los dispositivos",
                        "No lo sé aún"
                    ]
                }
            ],
            diagnose: function(answers) {
                const empresarial = ["🏗️ Empresa o local (más de 10 equipos)", "🏢 Oficina pequeña (hasta 10 equipos)"].includes(answers.tipo_instalacion);
                const total = answers.equipos_afectados === "Toda la red / todos los dispositivos";
                return {
                    titulo: "🌐 Diagnóstico: Problema de Red",
                    severidad: total ? "alta" : empresarial ? "media" : "baja",
                    resumen: "Problema de conectividad (" + ((answers.problema_red||"").replace(/[🚫🐌📶🔗🔒]/g,"").trim()) + ") en instalación tipo " + ((answers.tipo_instalacion||"").replace(/[🏠🏢🏗️📦]/g,"").trim()) + ".",
                    pasos: [
                        empresarial
                            ? "🏢 **Caso empresarial** — Enviamos técnico especializado en redes con equipamiento de diagnóstico profesional."
                            : "🔧 Diagnóstico remoto inicial disponible para muchos casos residenciales.",
                        (answers.problema_red && answers.problema_red.includes("segura"))
                            ? "🔐 Configuramos firewall, VLAN, VPN y políticas de acceso adaptadas a tu red."
                            : "📊 Revisamos router, modem, switches y puntos de acceso WiFi para encontrar el origen.",
                        "📋 Entregamos informe de infraestructura y recomendaciones al finalizar el servicio.",
                        "⚡ Resolución en el día para la mayoría de los casos."
                    ],
                    servicio: "redes",
                    servicioLabel: "Redes Cableadas e Inalámbricas"
                };
            }
        },

        "camaras_diagnostico": {
            intro: "📷 **¡Buena elección! Las cámaras de seguridad son una gran inversión.**\n\nContame un poco más para darte la mejor recomendación.",
            steps: [
                {
                    key: "necesidad_camara",
                    question: "¿Qué necesitás exactamente?",
                    options: [
                        "📦 Instalación nueva desde cero",
                        "🔧 Reparación o mantenimiento de sistema existente",
                        "⬆️ Ampliar el sistema actual",
                        "💻 Configurar acceso remoto o apps"
                    ]
                },
                {
                    key: "tipo_lugar",
                    question: "¿Dónde se instalaría?",
                    options: [
                        "🏠 Casa / Departamento",
                        "🏢 Oficina / Consultorio",
                        "🏪 Local comercial / Negocio",
                        "🏭 Depósito / Nave industrial"
                    ]
                },
                {
                    key: "cantidad_camaras",
                    question: "¿Cuántas cámaras necesitarías?",
                    options: [
                        "1-2 cámaras (vigilancia básica)",
                        "3-5 cámaras (cobertura media)",
                        "6-10 cámaras (cobertura completa)",
                        "Más de 10 cámaras (sistema empresarial)"
                    ]
                }
            ],
            diagnose: function(answers) {
                const empresarial = ["🏭 Depósito / Nave industrial", "Más de 10 cámaras (sistema empresarial)"].some(opt => 
                    [answers.tipo_lugar, answers.cantidad_camaras].includes(opt)
                );
                const instalacionNueva = answers.necesidad_camara === "📦 Instalación nueva desde cero";
                
                return {
                    titulo: "📹 Diagnóstico: Sistema CCTV",
                    severidad: empresarial ? "alta" : "media",
                    resumen: "Servicio: " + ((answers.necesidad_camara||"").replace(/[📦🔧⬆️💻]/g,"").trim()) + " en " + ((answers.tipo_lugar||"").replace(/[🏠🏢🏪🏭]/g,"").trim()) + ".",
                    pasos: [
                        instalacionNueva
                            ? "📐 Realizamos **relevamiento técnico gratuito** para diseñar el sistema óptimo según tu presupuesto."
                            : "🔍 Revisamos el sistema existente y hacemos diagnóstico del problema.",
                        empresarial
                            ? "🏢 **Solución empresarial** — Cámaras IP profesionales, NVR/DVR, almacenamiento en la nube y monitoreo 24/7."
                            : "🎥 Cámaras HD con visión nocturna, detección de movimiento y almacenamiento local o cloud.",
                        "📱 Configuramos app móvil para que veas tus cámaras desde cualquier lugar en tiempo real.",
                        "⚙️ Instalación completa con cableado estructurado y garantía de 12 meses."
                    ],
                    servicio: "cctv",
                    servicioLabel: "Instalación de CCTV"
                };
            }
        },

        "alarmas_diagnostico": {
            intro: "🚨 **¡Protegé tu propiedad con un sistema de alarmas profesional!**\n\n¿Qué tipo de solución estás buscando?",
            steps: [
                {
                    key: "tipo_alarma",
                    question: "¿Qué sistema te interesa?",
                    options: [
                        "🔔 Alarma domiciliaria con sensores",
                        "⚡ Cerco eléctrico perimetral",
                        "🚨 Alarma monitoreada 24/7",
                        "🔧 Reparación o mantenimiento de alarma existente"
                    ]
                },
                {
                    key: "ubicacion_alarma",
                    question: "¿Dónde se instalaría?",
                    options: [
                        "🏠 Casa / Departamento",
                        "🏢 Oficina / Local comercial",
                        "🏭 Depósito / Galpón",
                        "🏗️ Obra en construcción"
                    ]
                },
                {
                    key: "zonas_proteger",
                    question: "¿Cuántas zonas/ambientes necesitás proteger?",
                    options: [
                        "1-3 ambientes (básico)",
                        "4-6 ambientes (intermedio)",
                        "7-10 ambientes (completo)",
                        "Perímetro externo completo"
                    ]
                }
            ],
            diagnose: function(answers) {
                const cerco = answers.tipo_alarma && answers.tipo_alarma.includes("Cerco");
                const monitoreada = answers.tipo_alarma && answers.tipo_alarma.includes("monitoreada");
                
                return {
                    titulo: "🛡️ Diagnóstico: Sistema de Alarma",
                    severidad: cerco || monitoreada ? "alta" : "media",
                    resumen: "Instalación de " + ((answers.tipo_alarma||"").replace(/[🔔⚡🚨🔧]/g,"").trim()) + " en " + ((answers.ubicacion_alarma||"").replace(/[🏠🏢🏭🏗️]/g,"").trim()) + ".",
                    pasos: [
                        cerco
                            ? "⚡ **Cerco eléctrico** — 6000-10000V no letales, con certificación de seguridad."
                            : "🔔 Alarma con sensores de movimiento, magnéticos (puertas/ventanas) y pánico.",
                        monitoreada
                            ? "👮 Conexión directa con central de monitoreo 24/7 con respuesta ante emergencias."
                            : "📱 App móvil con notificaciones push ante cualquier evento detectado.",
                        "🔊 Sirena exterior de alta potencia (120dB) y luz estroboscópica disuasoria.",
                        "🔐 Instalación profesional con garantía y mantenimiento anual incluido."
                    ],
                    servicio: "alarmas",
                    servicioLabel: "Sistemas de Alarmas"
                };
            }
        },

        "domotica_diagnostico": {
            intro: "🏠 **¡La domótica hace tu vida más cómoda y eficiente!**\n\nContame qué querés automatizar.",
            steps: [
                {
                    key: "sistema_domotica",
                    question: "¿Qué querés automatizar?",
                    options: [
                        "💡 Iluminación inteligente",
                        "🌡️ Climatización / Aire acondicionado",
                        "🔌 Enchufes y electrodomésticos",
                        "🎬 Sistema completo (todo integrado)"
                    ]
                },
                {
                    key: "control_deseado",
                    question: "¿Cómo te gustaría controlarlo?",
                    options: [
                        "📱 App desde el celular",
                        "🗣️ Comandos de voz (Alexa/Google)",
                        "⏰ Automatización por horarios",
                        "🏠 Todo lo anterior (control total)"
                    ]
                },
                {
                    key: "presupuesto_aprox",
                    question: "¿Qué nivel de inversión tenés en mente?",
                    options: [
                        "💰 Básico (hasta $50.000)",
                        "💰💰 Intermedio ($50.000 - $150.000)",
                        "💰💰💰 Completo ($150.000+)",
                        "🤷 No tengo idea, necesito asesoramiento"
                    ]
                }
            ],
            diagnose: function(answers) {
                const completo = answers.sistema_domotica && answers.sistema_domotica.includes("completo");
                const voz = answers.control_deseado && answers.control_deseado.includes("voz");
                
                return {
                    titulo: "🤖 Diagnóstico: Sistema Domótico",
                    severidad: completo ? "alta" : "media",
                    resumen: "Automatización de " + ((answers.sistema_domotica||"").replace(/[💡🌡️🔌🎬]/g,"").trim()) + " con " + ((answers.control_deseado||"").replace(/[📱🗣️⏰🏠]/g,"").trim()) + ".",
                    pasos: [
                        completo
                            ? "🏠 **Sistema integral** — Controlá luces, climatización, cortinas, seguridad y más desde una sola app."
                            : "💡 Automatización modular que podés ampliar con el tiempo.",
                        voz
                            ? "🗣️ Integración con Alexa o Google Assistant para control por voz en español."
                            : "📱 App móvil intuitiva con control remoto desde cualquier lugar.",
                        "⚡ Instalación sin romper paredes — usamos tecnología inalámbrica siempre que sea posible.",
                        "🎓 Capacitación completa para que uses tu sistema al 100% desde el primer día."
                    ],
                    servicio: "domotica",
                    servicioLabel: "Automatización Domótica"
                };
            }
        }
    };

    // ===========================
    // RESPUESTAS INTELIGENTES
    // ===========================
    const intelligentResponses = {
        'menu_diagnostico': {
            message: "🔍 **¿Con qué área necesitás ayuda?**\n\nElegí la categoría que mejor se ajuste a tu consulta:",
            options: [
                { text: "💻 PC / Laptop / Software",     next: "iniciar_diag_pc" },
                { text: "📡 Internet / Redes / WiFi",    next: "iniciar_diag_redes" },
                { text: "📷 Cámaras de Seguridad",       next: "iniciar_diag_camaras" },
                { text: "🚨 Alarmas / Cerco eléctrico",  next: "iniciar_diag_alarmas" },
                { text: "🏠 Domótica / Automatización",  next: "iniciar_diag_domotica" }
            ]
        },

        'consulta_urgente': {
            message: "🚨 **¿Tu problema es urgente?**\n\nSi necesitás atención inmediata, estas son tus mejores opciones:",
            options: [
                { text: "📞 Llamar ahora", action: "llamar_ahora" },
                { text: "💬 WhatsApp urgente", action: "whatsapp_urgente" }
            ]
        }
    };

    // ===========================
    // DETALLES DE SERVICIOS
    // ===========================
    const serviceDetails = {
        'soporte_informatico': "💻 **Soporte Informático Integral**\n\n✅ Reparación de PC y laptops\n✅ Instalación de software\n✅ Limpieza y mantenimiento preventivo\n✅ Recuperación de datos\n✅ Optimización de rendimiento\n\n📍 Servicio a domicilio en CABA y GBA",
        'redes': "📡 **Redes Cableadas e Inalámbricas**\n\n✅ Instalación de WiFi profesional\n✅ Cableado estructurado Cat6/Cat7\n✅ Configuración de routers y switches\n✅ Solución de problemas de conectividad\n✅ VPN para acceso remoto seguro\n\n📍 Atendemos hogares y empresas",
        'cctv': "📹 **Sistemas de Videovigilancia CCTV**\n\n✅ Cámaras IP Full HD 1080p/4K\n✅ Visión nocturna avanzada\n✅ Acceso remoto desde celular\n✅ Almacenamiento local y en la nube\n✅ Detección de movimiento inteligente\n\n📍 Instalación profesional certificada",
        'alarmas': "🚨 **Alarmas y Cercos Eléctricos**\n\n✅ Sistemas de alarma monitoreada 24/7\n✅ Cercos eléctricos perimetrales\n✅ Sensores de movimiento y magnéticos\n✅ Pánico silencioso y sonoro\n✅ Integración con celular\n\n📍 Instalación con garantía",
        'domotica': "🏠 **Domótica y Automatización**\n\n✅ Iluminación inteligente\n✅ Control de climatización\n✅ Cortinas y persianas automáticas\n✅ Control por voz (Alexa/Google)\n✅ Escenas personalizadas\n\n📍 Smart home a medida",
        'ciberseguridad': "🔐 **Ciberseguridad y Protección de Datos**\n\n✅ Auditorías de seguridad\n✅ Configuración de firewalls\n✅ Protección contra ransomware\n✅ Backup automatizado\n✅ Capacitación en seguridad\n\n📍 Consultores certificados"
    };

    // ===========================
    // CONTROL DE APERTURA/CIERRE
    // ===========================

    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.toggle('active');
        notificationDot.classList.remove('active');
        
        // Si es la primera vez que abre, mostrar mensaje de bienvenida
        if (conversationHistory.length === 0) {
            addMessage("¡Hola! 👋 Soy el **Asistente Cyclops**.\n\nEstoy aquí para ayudarte con cualquier problema técnico o consulta sobre nuestros servicios.\n\n¿En qué puedo asistirte hoy?", 'bot', [
                { text: "🔍 Hacer diagnóstico técnico guiado", next: "menu_diagnostico" },
                { text: "💬 Consulta general", action: "consulta_general" },
                { text: "📞 Llamar ahora", action: "llamar_ahora" }
            ]);
        }
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });

    // ===========================
    // ENVÍO DE MENSAJES
    // ===========================

    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatbotInput.value = '';

        setTimeout(() => processUserMessage(message), 800);
    }

    function processUserMessage(message) {
        const lowerMsg = message.toLowerCase();

        // Detectar intenciones
        if (lowerMsg.includes('horario') || lowerMsg.includes('hora') || lowerMsg.includes('atienden')) {
            addMessage("⏰ **Nuestros horarios de atención son:**\n\n📅 Lunes a Viernes: 9:00 a 18:00 hs\n📅 Sábados: 9:00 a 13:00 hs\n📅 Domingos: Cerrado\n\n⚡ Para urgencias fuera de horario, contactanos por WhatsApp.", 'bot', [
                { text: "💬 Contactar por WhatsApp", action: "whatsapp_urgente" }
            ]);
        } else if (lowerMsg.includes('precio') || lowerMsg.includes('costo') || lowerMsg.includes('cuanto')) {
            addMessage("💰 **Los precios varían según el servicio:**\n\nCada caso es único, por eso preferimos hacer una evaluación personalizada sin compromiso.\n\n✅ La **consulta inicial es gratuita**\n✅ Presupuesto detallado antes de cualquier trabajo\n✅ Garantía en todos los servicios", 'bot', [
                { text: "📅 Solicitar presupuesto", action: "agendar_consulta" },
                { text: "💬 Consultar por WhatsApp", action: "whatsapp_urgente" }
            ]);
        } else if (lowerMsg.includes('zona') || lowerMsg.includes('cobertura') || lowerMsg.includes('donde')) {
            addMessage("📍 **Zona de cobertura:**\n\n✅ Ciudad Autónoma de Buenos Aires (CABA)\n✅ Gran Buenos Aires (GBA) — Zona Norte, Sur y Oeste\n\n🚗 Para zonas alejadas, consultanos disponibilidad.\n\nTenemos más de 10 años atendiendo clientes en toda la región metropolitana.", 'bot', [
                { text: "📞 Verificar mi zona", action: "llamar_ahora" }
            ]);
        } else if (lowerMsg.includes('urgente') || lowerMsg.includes('urgencia') || lowerMsg.includes('rapido')) {
            processFlow('consulta_urgente');
        } else {
            addMessage("💡 **¿Te gustaría que hagamos un diagnóstico guiado?**\n\nPuedo hacerte algunas preguntas para entender mejor tu problema y darte una solución precisa.", 'bot', [
                { text: "🔍 Sí, hacer diagnóstico", next: "menu_diagnostico" },
                { text: "💬 Prefiero hablar con alguien", action: "whatsapp_urgente" }
            ]);
        }
    }

    // ===========================
    // FLUJO DE DIAGNÓSTICO
    // ===========================

    function startDiagFlow(flowKey) {
        const flow = diagFlows[flowKey];
        if (!flow) return;

        diagState = {
            active: true,
            flow: flowKey,
            step: 0,
            answers: {}
        };

        addMessage(flow.intro, 'bot');
        setTimeout(askDiagStep, 600);
    }

    function askDiagStep() {
        const flow = diagFlows[diagState.flow];
        if (!flow) return;

        if (diagState.step >= flow.steps.length) {
            finishDiag();
            return;
        }

        const currentStep = flow.steps[diagState.step];
        const opts = currentStep.options.map((opt, idx) => ({
            text: opt,
            next: `__diag__${diagState.step}__${opt}`
        }));

        addMessage(currentStep.question, 'bot', opts);
    }

    function finishDiag() {
        const flow = diagFlows[diagState.flow];
        const result = flow.diagnose(diagState.answers);

        let report = `✅ **${result.titulo}**\n\n`;
        report += `${result.resumen}\n\n`;
        report += `**Recomendaciones:**\n`;
        result.pasos.forEach((paso, idx) => {
            report += `${idx + 1}. ${paso}\n`;
        });

        addMessage(report, 'bot', [
            { text: "📅 Agendar servicio", action: "agendar_consulta" },
            { text: "💬 Consultar por WhatsApp", action: "whatsapp_urgente" },
            { text: "🔍 Hacer otro diagnóstico", next: "menu_diagnostico" }
        ]);

        diagState.active = false;
    }

    // ===========================
    // RENDERIZADO DE MENSAJES (con guardado estructurado)
    // ===========================

    function addMessage(text, sender, options = []) {
        // Guardar mensaje en el historial estructurado
        const messageData = {
            text: text,
            sender: sender,
            options: options,
            timestamp: Date.now()
        };
        conversationHistory.push(messageData);

        // Renderizar el mensaje
        renderMessage(messageData);

        // Guardar en localStorage
        saveConversation();
    }

    function renderMessage(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', messageData.sender);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        const textDiv = document.createElement('div');
        textDiv.innerHTML = messageData.text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        contentDiv.appendChild(textDiv);

        if (messageData.options && messageData.options.length > 0) {
            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('service-options');

            messageData.options.forEach(function(option) {
                const button = document.createElement('button');
                button.classList.add('service-option');

                if (option.action) {
                    button.textContent = option.text;
                    button.addEventListener('click', function() { 
                        handleAction(option.action); 
                    });
                } else if (option.next) {
                    button.textContent = option.text;
                    button.addEventListener('click', function() {
                        addMessage(option.text, 'user');
                        setTimeout(function() { 
                            processFlow(option.next); 
                        }, 800);
                    });
                } else if (typeof option === 'string') {
                    button.textContent = option.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
                    button.addEventListener('click', function() {
                        addMessage(button.textContent, 'user');
                        setTimeout(function() { 
                            addMessage(serviceDetails[option] || "Te cuento más sobre esto...", 'bot'); 
                        }, 800);
                    });
                }

                optionsDiv.appendChild(button);
            });

            contentDiv.appendChild(optionsDiv);
        }

        messageDiv.appendChild(contentDiv);
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function processFlow(flowKey) {
        // Iniciar flujos de diagnóstico
        if (flowKey === 'iniciar_diag_pc')       { startDiagFlow('pc_diagnostico');        return; }
        if (flowKey === 'iniciar_diag_redes')     { startDiagFlow('redes_diagnostico');     return; }
        if (flowKey === 'iniciar_diag_camaras')   { startDiagFlow('camaras_diagnostico');   return; }
        if (flowKey === 'iniciar_diag_alarmas')   { startDiagFlow('alarmas_diagnostico');   return; }
        if (flowKey === 'iniciar_diag_domotica')  { startDiagFlow('domotica_diagnostico');  return; }

        // Capturar respuestas del diagnóstico activo
        if (diagState.active && flowKey.indexOf('__diag__') === 0) {
            const parts    = flowKey.split('__');
            const stepIdx  = parseInt(parts[2]);
            const answer   = parts.slice(3).join('__');
            const flow     = diagFlows[diagState.flow];
            if (flow && stepIdx === diagState.step) {
                diagState.answers[flow.steps[stepIdx].key] = answer;
                diagState.step++;
                setTimeout(askDiagStep, 400);
            }
            return;
        }

        // Menú principal
        if (flowKey === 'menu_diagnostico') {
            const m = intelligentResponses['menu_diagnostico'];
            addMessage(m.message, 'bot', m.options);
            return;
        }

        // Respuestas inteligentes y detalles
        if (intelligentResponses[flowKey]) {
            const r = intelligentResponses[flowKey];
            addMessage(r.message, 'bot', r.options);
        } else if (serviceDetails[flowKey]) {
            addMessage(serviceDetails[flowKey], 'bot', [
                { text: "🔍 Hacer diagnóstico guiado", next: "menu_diagnostico" },
                { text: "💬 Consultar por WhatsApp", action: "whatsapp_urgente" }
            ]);
        } else {
            addMessage("💡 **Te recomiendo que hablemos para evaluar tu caso específico.**", 'bot', [
                { text: "📅 Coordinar consulta", action: "agendar_consulta" },
                { text: "🔍 Diagnóstico guiado", next: "menu_diagnostico" }
            ]);
        }
    }

    function handleAction(action) {
        switch (action) {
            case 'llamar_ahora':
                window.open('tel:+5491166804450');
                addMessage("📞 **¡Perfecto! Conectándote por teléfono...**\n\nSi no funciona, marcá directo al: +54 9 11 6680-4450", 'bot');
                break;
            case 'whatsapp_urgente':
                window.open('https://wa.me/5491166804450?text=' + encodeURIComponent('¡Hola! Necesito ayuda técnica. ¿Me pueden asistir?'), '_blank');
                addMessage("💬 **¡Listo! Te redirijo a WhatsApp...**", 'bot');
                break;
            case 'agendar_consulta':
                addMessage("📅 **Para agendar una consulta:**\n\nContactanos al +54 9 11 6680-4450 o por WhatsApp para coordinar día y hora.\n\nLa primera consulta no tiene costo 😊", 'bot', [
                    { text: "💬 Agendar por WhatsApp", action: "whatsapp_urgente" }
                ]);
                break;
            case 'consulta_general':
                addMessage("💬 **¿En qué puedo ayudarte?**\n\nPodés escribirme tu consulta o elegir una de las opciones rápidas:", 'bot', [
                    { text: "⏰ Horarios", next: "horarios" },
                    { text: "💰 Precios", next: "precios" },
                    { text: "📍 Zona de cobertura", next: "zona" }
                ]);
                break;
            default:
                addMessage("💡 Contactanos directo: +54 9 11 6680-4450", 'bot');
        }
    }

    // ===========================
    // PERSISTENCIA (Fix del localStorage)
    // ===========================

    function saveConversation() {
        try {
            localStorage.setItem('cyclopsChatbotConversation', JSON.stringify(conversationHistory));
            console.log('✅ Conversación guardada correctamente');
        } catch (e) {
            console.error('❌ Error al guardar conversación:', e);
        }
    }

    function loadConversation() {
        try {
            const saved = localStorage.getItem('cyclopsChatbotConversation');
            if (saved) {
                conversationHistory = JSON.parse(saved);
                
                // Re-renderizar todos los mensajes con event listeners activos
                chatbotMessages.innerHTML = '';
                conversationHistory.forEach(msg => {
                    renderMessage(msg);
                });
                
                console.log('✅ Conversación cargada correctamente');
            }
        } catch (e) {
            console.error('❌ Error al cargar conversación:', e);
            conversationHistory = [];
        }
    }

    // ===========================
    // EVENTOS
    // ===========================

    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Botón de diagnóstico rápido del widget de bienvenida
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.quick-question')) return;
        const button   = e.target.closest('.quick-question');
        const action   = button.getAttribute('data-action');
        const question = button.getAttribute('data-question');

        if (action === 'pc_problemas') {
            addMessage("🔍 Quiero hacer un diagnóstico técnico guiado", 'user');
            setTimeout(function() {
                addMessage("🔍 **¡Perfecto! ¿Con qué área necesitás ayuda?**", 'bot', [
                    { text: "💻 PC / Laptop / Software",     next: "iniciar_diag_pc" },
                    { text: "📡 Internet / Redes / WiFi",    next: "iniciar_diag_redes" },
                    { text: "📷 Cámaras de Seguridad",       next: "iniciar_diag_camaras" },
                    { text: "🚨 Alarmas / Cerco eléctrico",  next: "iniciar_diag_alarmas" },
                    { text: "🏠 Domótica / Automatización",  next: "iniciar_diag_domotica" }
                ]);
            }, 800);
        } else if (question) {
            addMessage(button.textContent.trim(), 'user');
            setTimeout(function() { processUserMessage(button.textContent.trim()); }, 800);
        }
    });

    // Sugerencias rápidas del footer del chatbot
    document.querySelectorAll('.suggestion-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            addMessage(button.textContent.trim(), 'user');
            setTimeout(function() { processUserMessage(button.textContent.trim()); }, 800);
        });
    });

    // Cargar historial al iniciar
    loadConversation();

    console.log("✅ Chatbot con diagnóstico guiado inicializado correctamente");
}
