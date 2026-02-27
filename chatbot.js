// ===========================
// CHATBOT INTELIGENTE CON DIAGNÓSTICO GUIADO
// Soporte Cyclops — v2.0
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
                        "📱 Configurar acceso remoto desde el celular"
                    ]
                },
                {
                    key: "tipo_espacio",
                    question: "¿Qué espacio querés cubrir?",
                    options: [
                        "🏠 Casa o departamento",
                        "🏢 Oficina",
                        "🏪 Local comercial",
                        "🏭 Depósito o galpón",
                        "🚗 Garage o estacionamiento"
                    ]
                },
                {
                    key: "cantidad_camaras",
                    question: "¿Cuántas cámaras aproximadamente?",
                    options: [
                        "1 a 4 cámaras",
                        "5 a 10 cámaras",
                        "Más de 10 cámaras",
                        "No sé, necesito asesoramiento"
                    ]
                }
            ],
            diagnose: function(answers) {
                const grande = answers.cantidad_camaras === "Más de 10 cámaras";
                return {
                    titulo: "📷 Diagnóstico: Sistema de Cámaras",
                    severidad: "baja",
                    resumen: ((answers.necesidad_camara||"Instalación").replace(/[📦🔧⬆️📱]/g,"").trim()) + " para " + ((answers.tipo_espacio||"el espacio").replace(/[🏠🏢🏪🏭🚗]/g,"").trim()) + " con aprox. " + (answers.cantidad_camaras||"varias cámaras") + ".",
                    pasos: [
                        "📐 **Visita de relevamiento gratuita** — evaluamos puntos ciegos, distancias y el tipo de cámaras más adecuado.",
                        grande
                            ? "🏗️ Proyecto grande — cotización personalizada con NVR/DVR dedicado, almacenamiento y monitoreo continuo."
                            : "⚡ Instalación rápida con cámaras HD o 4K según tu elección y presupuesto disponible.",
                        "📱 Configuramos app en tu celular para ver las cámaras en tiempo real desde cualquier lugar.",
                        "🔧 Garantía de instalación y soporte post-servicio incluido en todos los proyectos."
                    ],
                    servicio: "cctv",
                    servicioLabel: "Cámaras de Seguridad / CCTV"
                };
            }
        },

        "alarmas_diagnostico": {
            intro: "🚨 **¡Excelente! La seguridad perimetral es fundamental.**\n\nTe hago unas preguntas rápidas para recomendarte la mejor solución.",
            steps: [
                {
                    key: "tipo_alarma",
                    question: "¿Qué tipo de sistema de seguridad necesitás?",
                    options: [
                        "🔔 Alarma anti-intrusión para interiores",
                        "⚡ Cerco eléctrico perimetral",
                        "🚪 Control de accesos / barreras vehiculares",
                        "🔗 Integrar con sistema de cámaras existente",
                        "🏠 Sistema completo de seguridad para el hogar"
                    ]
                },
                {
                    key: "propiedad",
                    question: "¿Para qué tipo de propiedad?",
                    options: [
                        "🏠 Casa o departamento",
                        "🏢 Empresa u oficina",
                        "🏪 Local comercial",
                        "🏭 Depósito o galpón",
                        "🌳 Casa con terreno / quinta"
                    ]
                },
                {
                    key: "urgencia_alarma",
                    question: "¿Cuál es tu urgencia?",
                    options: [
                        "🔥 Urgente, lo antes posible",
                        "📅 Esta semana estaría bien",
                        "🗓️ Puedo esperar, quiero cotizar primero",
                        "💬 Solo quiero información por ahora"
                    ]
                }
            ],
            diagnose: function(answers) {
                const urgente = answers.urgencia_alarma === "🔥 Urgente, lo antes posible";
                return {
                    titulo: "🚨 Diagnóstico: Sistema de Seguridad",
                    severidad: urgente ? "media" : "baja",
                    resumen: ((answers.tipo_alarma||"Sistema de alarma").replace(/[🔔⚡🚪🔗🏠]/g,"").trim()) + " para " + ((answers.propiedad||"la propiedad").replace(/[🏠🏢🏪🏭🌳]/g,"").trim()) + ".",
                    pasos: [
                        urgente
                            ? "⚡ **Atención prioritaria** — Coordinamos visita técnica para esta misma semana."
                            : "📋 Realizamos relevamiento previo sin cargo para diseñar el sistema ideal para tu propiedad.",
                        (answers.tipo_alarma && answers.tipo_alarma.includes("Cerco"))
                            ? "⚡ Instalación de cerco eléctrico con energizador profesional, balizas y señalización reglamentaria."
                            : "🔔 Sistema con sirena, sensores de movimiento e infrarrojo, control remoto y notificaciones.",
                        "📱 Alertas en tiempo real en tu celular ante cualquier activación del sistema.",
                        "🔧 Plan de mantenimiento anual disponible con soporte técnico prioritario."
                    ],
                    servicio: "alarmas",
                    servicioLabel: "Alarmas y Barreras"
                };
            }
        },

        "domotica_diagnostico": {
            intro: "🏠 **¡La domótica puede transformar completamente tu espacio!**\n\nContame qué tenés en mente para asesorarte mejor.",
            steps: [
                {
                    key: "que_automatizar",
                    question: "¿Qué querés automatizar o controlar?",
                    options: [
                        "💡 Iluminación inteligente",
                        "🌡️ Climatización y temperatura",
                        "🔒 Seguridad integrada (cámaras + alarmas)",
                        "🎬 Sistema de entretenimiento y audio",
                        "🏠 Hogar completo — proyecto integral"
                    ]
                },
                {
                    key: "plataforma",
                    question: "¿Ya tenés algo instalado o empezás desde cero?",
                    options: [
                        "Desde cero, sin nada instalado",
                        "Ya tengo dispositivos (Alexa, Google Home, etc.)",
                        "Tengo instalaciones pero sin automatización",
                        "No sé, necesito asesoramiento completo"
                    ]
                },
                {
                    key: "vision",
                    question: "¿Cómo ves el proyecto?",
                    options: [
                        "Algo básico y económico para empezar",
                        "Proyecto completo y profesional",
                        "Quiero saber qué es posible primero",
                        "Depende del presupuesto que me presenten"
                    ]
                }
            ],
            diagnose: function(answers) {
                const integral = answers.que_automatizar === "🏠 Hogar completo — proyecto integral";
                return {
                    titulo: "🏠 Diagnóstico: Proyecto de Domótica",
                    severidad: "baja",
                    resumen: "Proyecto de " + ((answers.que_automatizar||"automatización").replace(/[💡🌡️🔒🎬🏠]/g,"").trim()) + " — " + (answers.plataforma||"desde cero") + ".",
                    pasos: [
                        "📋 **Primera reunión de diseño sin costo** — Remota o presencial, para entender tu visión y proponer soluciones concretas.",
                        integral
                            ? "🏗️ Proyecto integral — diseñamos la arquitectura completa con presupuesto dividido por etapas."
                            : "⚡ Podemos empezar con un módulo piloto y escalar progresivamente según tus necesidades.",
                        "🔗 Compatible con las principales plataformas: Home Assistant, Tuya, Google Home, Alexa.",
                        "✅ Acompañamiento durante toda la instalación y capacitación de uso incluida sin costo adicional."
                    ],
                    servicio: "domotica",
                    servicioLabel: "Domótica"
                };
            }
        }
    };

    // ===========================
    // DETECCIÓN DE INTENCIONES
    // ===========================
    class IntentRecognizer {
        static recognizeIntent(message) {
            const t = this.normalizeText(message);
            if (this.isPCProblem(t))        return 'pc_problemas';
            if (this.isNetworkProblem(t))   return 'redes_problemas';
            if (this.isCameraProblem(t))    return 'camaras_problemas';
            if (this.isAlarmProblem(t))     return 'alarmas_problemas';
            if (this.isSmartHomeProblem(t)) return 'domotica_problemas';
            if (this.isServiceInquiry(t))   return 'servicios';
            if (this.isPricingInquiry(t))   return 'precios';
            if (this.isEmergency(t))        return 'emergencia';
            if (this.isContactRequest(t))   return 'contacto';
            if (this.isQuoteRequest(t))     return 'cotizacion';
            if (this.isGreeting(t))         return 'saludo';
            if (this.isThanks(t))           return 'agradecimiento';
            return 'no_entendido';
        }

        static normalizeText(text) {
            return text.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s]/g, ' ')
                .replace(/\s+/g, ' ').trim();
        }

        static isPCProblem(t)       { return ['pc','computadora','laptop','notebook','windows','enciende','apaga','pantalla','lento','virus','software','hardware','formatear','archivo','datos'].some(k=>t.includes(k)); }
        static isNetworkProblem(t)  { return ['internet','wifi','red','conexion','router','modem','senal','cable','ethernet','fibra','conectividad'].some(k=>t.includes(k)); }
        static isCameraProblem(t)   { return ['camara','camaras','seguridad','cctv','video','vigilancia','dvr','nvr','ip','grabacion'].some(k=>t.includes(k)); }
        static isAlarmProblem(t)    { return ['alarma','sensor','movimiento','sirena','cerco','electrico','barrera','acceso','perimetral'].some(k=>t.includes(k)); }
        static isSmartHomeProblem(t){ return ['domotica','smart','automatizacion','luces','inteligente','alexa','google home','home assistant','clima','iluminacion'].some(k=>t.includes(k)); }
        static isServiceInquiry(t)  { return ['servicio','servicios','ofrecen','hacen','que hacen','trabajan','que tienen'].some(k=>t.includes(k)); }
        static isPricingInquiry(t)  { return ['precio','cuesta','costo','valor','cuanto','tarifa','cobran','sale','pago'].some(k=>t.includes(k)); }
        static isEmergency(t)       { return ['urgente','emergencia','urgencia','inmediato','ahora mismo','ya'].some(k=>t.includes(k)); }
        static isContactRequest(t)  { return ['contacto','telefono','whatsapp','llamar','numero','mail','email','horario','atienden','ubicacion'].some(k=>t.includes(k)); }
        static isQuoteRequest(t)    { return ['cotizacion','presupuesto','presu','cotizar','presupuestar'].some(k=>t.includes(k)); }
        static isGreeting(t)        { return ['hola','buenas','buenos','buen dia','buenas tardes','buenas noches'].some(k=>t.includes(k)); }
        static isThanks(t)          { return ['gracias','gracia','thank','dale','ok','genial','perfecto','copado'].some(k=>t.includes(k)); }
    }

    // ===========================
    // RESPUESTAS EMPÁTICAS
    // ===========================
    const empatheticResponses = {
        saludo: [
            "¡Hola! 👋 Me da gusto saludarte. Soy el asistente de Soporte Cyclops, ¿en qué puedo ayudarte hoy?",
            "¡Hola! 😊 ¿Cómo estás? Cuéntame, ¿qué problema técnico tenés para poder asistirte?",
            "¡Buen día! 🌟 Estoy aquí para ayudarte con cualquier problema técnico. ¿Por dónde empezamos?"
        ],
        agradecimiento: [
            "¡De nada! 😊 Me alegra haber podido ayudarte. ¿Hay algo más en lo que pueda asistirte?",
            "¡No hay problema! 👍 Estoy aquí cuando me necesites.",
            "¡Un placer! ✨ No dudes en volver si tenés alguna otra consulta."
        ],
        no_entendido: [
            "🤔 No estoy seguro de entenderte del todo. ¿Podés contarme un poco más sobre lo que necesitás?",
            "😅 Creo que no capté bien tu mensaje. ¿Me lo explicás de otra forma?",
            "💭 No logro entender exactamente qué necesitás. ¿Me das más detalles para poder ayudarte mejor?"
        ]
    };

    // ===========================
    // RESPUESTAS INTELIGENTES
    // ===========================
    const intelligentResponses = {
        "pc_problemas": {
            message: "🔍 **¡Detecté un problema con un equipo!** Te propongo hacer un diagnóstico guiado paso a paso para identificarlo con precisión.\n\n¿Arrancamos?",
            options: [
                { text: "✅ Sí, hacer diagnóstico guiado", next: "iniciar_diag_pc" },
                { text: "💬 Prefiero hablar directo", action: "whatsapp_urgente" }
            ]
        },
        "redes_problemas": {
            message: "📡 **¡Problema de red detectado!** Puedo hacer un diagnóstico guiado para identificarlo con precisión.\n\n¿Lo hacemos?",
            options: [
                { text: "✅ Sí, diagnosticar ahora", next: "iniciar_diag_redes" },
                { text: "💬 Contactar directo", action: "whatsapp_urgente" }
            ]
        },
        "camaras_problemas": {
            message: "📷 **¡Entendido! Te ayudo con las cámaras de seguridad.**",
            options: [
                { text: "🔍 Hacer diagnóstico guiado", next: "iniciar_diag_camaras" },
                { text: "💬 Consultar por WhatsApp", action: "whatsapp_urgente" }
            ]
        },
        "alarmas_problemas": {
            message: "🚨 **¡Perfecto! Te ayudo con el sistema de alarmas o cerco eléctrico.**",
            options: [
                { text: "🔍 Diagnóstico guiado de alarmas", next: "iniciar_diag_alarmas" },
                { text: "💬 Hablar por WhatsApp", action: "whatsapp_urgente" }
            ]
        },
        "domotica_problemas": {
            message: "🏠 **¡La domótica es uno de nuestros servicios favoritos!** Hagamos un diagnóstico.",
            options: [
                { text: "🔍 Diagnóstico de proyecto", next: "iniciar_diag_domotica" },
                { text: "💬 Consultar directo", action: "whatsapp_urgente" }
            ]
        },
        "servicios": {
            message: "🔧 **¡Claro! Te cuento sobre nuestros servicios:**\n\nTrabajamos con todo tipo de soluciones técnicas. ¿Qué es lo que más te interesa?",
            options: [
                { text: "💻 Soporte de PC y computadoras", next: "soporte_detalles" },
                { text: "📡 Redes e Internet", next: "redes_detalles" },
                { text: "📹 Cámaras de seguridad", next: "cctv_detalles" },
                { text: "🚨 Alarmas y sistemas de seguridad", next: "alarmas_detalles" },
                { text: "🏠 Domótica y automatización", next: "domotica_detalles" }
            ]
        },
        "emergencia": {
            message: "🚨 **¡Entiendo que es urgente! Te ayudo inmediatamente.**\n\nPara atención prioritaria:\n\n• 📞 **Llamada directa**: +54 9 11 6680-4450\n• 💬 **WhatsApp urgente**: mismo número\n\n¿Qué preferís?",
            options: [
                { text: "📞 Llamar ahora mismo", action: "llamar_ahora" },
                { text: "💬 Escribir por WhatsApp", action: "whatsapp_urgente" }
            ]
        },
        "cotizacion": {
            message: "💰 **¡Perfecto! La forma más rápida de cotizar es con el diagnóstico guiado.**\n\nAsí podemos darte un estimado preciso según tu caso específico. ¿Arrancamos?",
            options: [
                { text: "🔍 Hacer diagnóstico para cotizar", next: "menu_diagnostico" },
                { text: "💬 Prefiero hablar directo", action: "whatsapp_urgente" }
            ]
        },
        "precios": {
            message: "💲 **Sobre precios:**\n\n• **Diagnóstico inicial**: sin cargo\n• **Presupuesto**: siempre antes de cualquier trabajo\n• **Formas de pago**: todas disponibles\n• **Precios justos**: adaptados a cada situación\n\n¿Querés que hagamos un diagnóstico para cotizarte con precisión?",
            options: [
                { text: "🔍 Diagnóstico para cotizar", next: "menu_diagnostico" },
                { text: "💬 Consultar por WhatsApp", action: "whatsapp_urgente" }
            ]
        },
        "contacto": {
            message: "📞 **Información de contacto:**\n\n• 📞 +54 9 11 6680-4450\n• 💬 WhatsApp: mismo número\n• 📧 soportecyclops@gmail.com\n• 🕒 Lun–Vie 9:00–18:00 | Sáb 9:00–13:00\n• 📍 CABA y GBA",
            options: [
                { text: "💬 Escribir por WhatsApp ahora", action: "whatsapp_urgente" },
                { text: "📞 Llamar ahora", action: "llamar_ahora" }
            ]
        },
        "menu_diagnostico": {
            message: "🔍 **¿Con qué área necesitás ayuda?**",
            options: [
                { text: "💻 PC / Laptop / Software",     next: "iniciar_diag_pc" },
                { text: "📡 Internet / Redes / WiFi",    next: "iniciar_diag_redes" },
                { text: "📷 Cámaras de Seguridad",       next: "iniciar_diag_camaras" },
                { text: "🚨 Alarmas / Cerco eléctrico",  next: "iniciar_diag_alarmas" },
                { text: "🏠 Domótica / Automatización",  next: "iniciar_diag_domotica" }
            ]
        }
    };

    // ===========================
    // DETALLES DE SERVICIOS
    // ===========================
    const serviceDetails = {
        "soporte_detalles": "💻 **Soporte Informático Completo**\n\n• Instalación y configuración de software\n• Mantenimiento preventivo y correctivo\n• Reparación o cambio de hardware\n• Optimización de sistemas lentos\n• Eliminación de virus y malware\n• Recuperación de datos perdidos\n\n¿Querés hacer un diagnóstico guiado para tu equipo?",
        "redes_detalles": "🌐 **Redes Profesionales**\n\n• Cableado estructurado certificado\n• Configuración avanzada de routers\n• Optimización de señal WiFi\n• Seguridad de red empresarial\n• Soluciones para hogar y empresa\n\n¿Tenés algún problema de conectividad ahora mismo?",
        "cctv_detalles": "📹 **Sistemas de Seguridad CCTV**\n\n• Marcas: Dahua, Hikvision y otras líderes\n• Sistemas IP y analógicos HD/4K\n• Instalación profesional completa\n• Monitoreo remoto desde el celular\n• Asesoramiento personalizado\n\n¿Para qué tipo de propiedad necesitás el sistema?",
        "alarmas_detalles": "🚨 **Sistemas de Alarma Integrales**\n\n• Alarmas inalámbricas y cableadas\n• Sensores de movimiento e infrarrojo\n• Cercos eléctricos perimetrales\n• Controles de acceso y barreras\n• Notificaciones en tiempo real al celular\n\n¿Qué tipo de protección buscás?",
        "domotica_detalles": "🏠 **Domótica — Hogar Inteligente**\n\n• Iluminación inteligente programable\n• Control de climatización automático\n• Seguridad integrada\n• Sistemas de entretenimiento\n• Compatible: Home Assistant, Tuya, Alexa, Google\n\n¿Qué te gustaría automatizar primero?"
    };

    // ===========================
    // MOTOR DE DIAGNÓSTICO
    // ===========================

    function startDiagFlow(flowKey) {
        const flow = diagFlows[flowKey];
        if (!flow) return false;
        diagState = { active: true, flow: flowKey, step: 0, answers: {} };
        addMessage(flow.intro, 'bot');
        setTimeout(askDiagStep, 600);
        return true;
    }

    function askDiagStep() {
        const flow = diagFlows[diagState.flow];
        if (!flow) return;

        if (diagState.step >= flow.steps.length) {
            const result = flow.diagnose(diagState.answers);
            addMessage("⚡ **¡Listo! Analizé tus respuestas. Acá está tu diagnóstico:**", 'bot');
            setTimeout(function() { showDiagnosisResult(result); }, 400);
            diagState.active = false;
            return;
        }

        const step = flow.steps[diagState.step];
        const total = flow.steps.length;
        addMessage(
            "**Paso " + (diagState.step + 1) + " de " + total + ":** " + step.question,
            'bot',
            step.options.map(function(opt) {
                return { text: opt, next: "__diag__" + diagState.step + "__" + opt };
            })
        );
    }

    function showDiagnosisResult(result) {
        var colorMap = { alta: "#e74c3c", media: "#f39c12", baja: "#27ae60" };
        var labelMap = { alta: "🔴 Urgencia Alta", media: "🟡 Urgencia Media", baja: "🟢 Sin Urgencia" };
        var color = colorMap[result.severidad] || "#27ae60";
        var label = labelMap[result.severidad] || "🟢 Sin Urgencia";

        var stepsHTML = result.pasos.map(function(p) {
            return '<div style="margin-bottom:7px;font-size:13px;line-height:1.5;">' + p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</div>';
        }).join('');

        var resumenSafe = result.resumen.replace(/\*\*/g,'').replace(/"/g,"'");

        var msgDiv = document.createElement('div');
        msgDiv.classList.add('message', 'bot-message');
        var contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.innerHTML =
            '<div style="background:#f8f9fa;border-radius:10px;padding:16px;border-left:4px solid ' + color + ';margin-top:4px;">' +
                '<div style="font-weight:700;color:#2c3e50;font-size:14px;margin-bottom:8px;">' + result.titulo + '</div>' +
                '<span style="display:inline-block;background:' + color + '20;color:' + color + ';padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:10px;">' + label + '</span>' +
                '<p style="color:#555;font-size:13px;margin-bottom:12px;line-height:1.5;">' + result.resumen.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>') + '</p>' +
                '<div style="margin-bottom:14px;">' + stepsHTML + '</div>' +
                '<button class="diagnosis-cta-btn service-option"' +
                    ' data-servicio="' + result.servicio + '"' +
                    ' data-label="' + result.servicioLabel + '"' +
                    ' data-resumen="' + resumenSafe + '"' +
                    ' style="width:100%;background:#3498db;color:white;border:none;padding:11px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">' +
                    '📋 Solicitar servicio: ' + result.servicioLabel +
                '</button>' +
            '</div>';

        msgDiv.appendChild(contentDiv);
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        saveConversation();

        setTimeout(function() {
            addMessage("¿Necesitás hacer otro diagnóstico o tenés alguna consulta más?", 'bot', [
                { text: "🔄 Nuevo diagnóstico", next: "menu_diagnostico" },
                { text: "💬 Hablar con alguien ahora", action: "whatsapp_urgente" }
            ]);
        }, 500);
    }

    // CTA del diagnóstico → pre-llena formulario de contacto
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.diagnosis-cta-btn')) return;

        var btn      = e.target.closest('.diagnosis-cta-btn');
        var servicio = btn.getAttribute('data-servicio');
        var label    = btn.getAttribute('data-label');
        var resumen  = btn.getAttribute('data-resumen');

        chatbotWindow.style.display = 'none';

        var selectServicio = document.getElementById('servicio');
        if (selectServicio) selectServicio.value = servicio;

        var textareaDesc = document.getElementById('descripcion');
        if (textareaDesc) textareaDesc.value = 'Diagnóstico realizado por el asistente:\n' + resumen + '\n\nServicio requerido: ' + label + '.';

        var contactSection = document.getElementById('contacto');
        if (contactSection) {
            var navbar = document.querySelector('.navbar');
            var offset = navbar ? navbar.offsetHeight + 20 : 80;
            window.scrollTo({ top: contactSection.offsetTop - offset, behavior: 'smooth' });
        }

        setTimeout(function() {
            var formMsg = document.getElementById('formMessage');
            if (formMsg) {
                formMsg.style.cssText = 'display:block;background:#d4edda;color:#155724;padding:12px 15px;border-radius:8px;margin-top:10px;font-size:14px;border-left:4px solid #27ae60;';
                formMsg.textContent = '✅ Diagnóstico cargado. Completá tus datos y envianos la consulta por WhatsApp.';
                setTimeout(function() { formMsg.style.display = 'none'; formMsg.textContent = ''; }, 8000);
            }
        }, 800);
    });

    // ===========================
    // FUNCIONES PRINCIPALES
    // ===========================

    // Auto-abrir chatbot a los 30s (solo primera vez)
    setTimeout(function() {
        if (!localStorage.getItem('cyclopsChatbotShown')) {
            chatbotWindow.style.display = 'flex';
            if (notificationDot) notificationDot.style.display = 'block';
            localStorage.setItem('cyclopsChatbotShown', 'true');
        }
    }, 30000);

    chatbotToggle.addEventListener('click', function() {
        var isOpen = chatbotWindow.style.display === 'flex';
        chatbotWindow.style.display = isOpen ? 'none' : 'flex';
        if (notificationDot) notificationDot.style.display = 'none';
    });

    chatbotClose.addEventListener('click', function() {
        chatbotWindow.style.display = 'none';
    });

    function showTypingIndicator() {
        var typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.id = 'typingIndicator';
        for (var i = 0; i < 3; i++) {
            var dot = document.createElement('div');
            dot.classList.add('typing-dot');
            typingDiv.appendChild(dot);
        }
        var typingText = document.createElement('span');
        typingText.textContent = 'Asistente Cyclops está escribiendo...';
        typingText.style.cssText = 'font-size:0.8rem;color:#7f8c8d;margin-left:10px;';
        typingDiv.appendChild(typingText);
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return typingDiv;
    }

    function hideTypingIndicator() {
        var el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    function getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    function sendMessage() {
        var message = chatbotInput.value.trim();
        if (!message) return;
        addMessage(message, 'user');
        chatbotInput.value = '';
        showTypingIndicator();
        setTimeout(function() {
            hideTypingIndicator();
            processUserMessage(message);
        }, 1200 + Math.random() * 800);
    }

    function processUserMessage(message) {
        var intent = IntentRecognizer.recognizeIntent(message);
        switch (intent) {
            case 'saludo':
                addMessage(getRandomResponse(empatheticResponses.saludo), 'bot');
                break;
            case 'agradecimiento':
                addMessage(getRandomResponse(empatheticResponses.agradecimiento), 'bot');
                break;
            case 'no_entendido':
                addMessage(getRandomResponse(empatheticResponses.no_entendido), 'bot', [
                    { text: "🔍 Hacer diagnóstico guiado", next: "menu_diagnostico" },
                    { text: "💬 Hablar por WhatsApp", action: "whatsapp_urgente" }
                ]);
                break;
            default:
                if (intelligentResponses[intent]) {
                    var r = intelligentResponses[intent];
                    addMessage(r.message, 'bot', r.options);
                } else {
                    addMessage("🤔 **Creo que necesitás ayuda técnica, pero no identifiqué exactamente qué.**\n\nPodés usar el diagnóstico guiado o contactarnos directo:", 'bot', [
                        { text: "🔍 Diagnóstico guiado", next: "menu_diagnostico" },
                        { text: "💬 WhatsApp", action: "whatsapp_urgente" }
                    ]);
                }
        }
    }

    function addMessage(text, sender, options) {
        options = options || [];
        var messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender + '-message');

        var contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        var textDiv = document.createElement('div');
        textDiv.innerHTML = text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        contentDiv.appendChild(textDiv);

        if (options.length > 0) {
            var optionsDiv = document.createElement('div');
            optionsDiv.classList.add('service-options');

            options.forEach(function(option) {
                var button = document.createElement('button');
                button.classList.add('service-option');

                if (option.action) {
                    button.textContent = option.text;
                    button.addEventListener('click', function() { handleAction(option.action); });
                } else if (option.next) {
                    button.textContent = option.text;
                    (function(next) {
                        button.addEventListener('click', function() {
                            addMessage(option.text, 'user');
                            setTimeout(function() { processFlow(next); }, 800);
                        });
                    })(option.next);
                } else if (typeof option === 'string') {
                    button.textContent = option.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
                    (function(key) {
                        button.addEventListener('click', function() {
                            addMessage(button.textContent, 'user');
                            setTimeout(function() { addMessage(serviceDetails[key] || "Te cuento más sobre esto...", 'bot'); }, 800);
                        });
                    })(option);
                }

                optionsDiv.appendChild(button);
            });

            contentDiv.appendChild(optionsDiv);
        }

        messageDiv.appendChild(contentDiv);
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        saveConversation();
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
            var parts    = flowKey.split('__');
            var stepIdx  = parseInt(parts[2]);
            var answer   = parts.slice(3).join('__');
            var flow     = diagFlows[diagState.flow];
            if (flow && stepIdx === diagState.step) {
                diagState.answers[flow.steps[stepIdx].key] = answer;
                diagState.step++;
                setTimeout(askDiagStep, 400);
            }
            return;
        }

        // Menú principal
        if (flowKey === 'menu_diagnostico') {
            var m = intelligentResponses['menu_diagnostico'];
            addMessage(m.message, 'bot', m.options);
            return;
        }

        // Respuestas inteligentes y detalles
        if (intelligentResponses[flowKey]) {
            var r = intelligentResponses[flowKey];
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
            default:
                addMessage("💡 Contactanos directo: +54 9 11 6680-4450", 'bot');
        }
    }

    function saveConversation() {
        localStorage.setItem('cyclopsChatbotConversation', chatbotMessages.innerHTML);
    }

    function loadConversation() {
        var saved = localStorage.getItem('cyclopsChatbotConversation');
        if (saved) {
            chatbotMessages.innerHTML = saved;
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
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
        var button   = e.target.closest('.quick-question');
        var action   = button.getAttribute('data-action');
        var question = button.getAttribute('data-question');

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

    // Cargar historial
    loadConversation();

    console.log("✅ Chatbot con diagnóstico guiado inicializado correctamente");
}
