// ===========================
// CHATBOT INTELIGENTE CON DIAGNÓSTICO GUIADO
// Soporte Cyclops — v3.0
// Mejoras: Factor de Riesgo · Pipeline Diagnóstico · PDF · Google Sheets
// ===========================

// ===========================
// ⚙️ CONFIGURACIÓN — Editá estas variables antes de deployar
// ===========================
const CYCLOPS_CONFIG = {
    whatsapp:      "5491166804450",
    telefono:      "+54 9 11 6680-4450",
    email:         "contacto@soportecyclops.com.ar",
    sitio:         "www.soportecyclops.com.ar",
    logoUrl:       "https://www.soportecyclops.com.ar/public/images/Logo.jpg",
    // ⚠️ Pegá aquí la URL de tu Google Apps Script desplegado (ver GUIA_GOOGLE_APPS_SCRIPT.md)
    appsScriptUrl: "https://script.google.com/macros/s/AKfycbxiKuQZzxsSH6FFdlBxeZwc_iUOHTl4I-Hca1bg9q5elMbBaNuk9uVP-8qLPoxH84vfEw/exec"
};

document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 Inicializando Chatbot Cyclops v3.0...");
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

    // ── ESTADO ────────────────────────────────────────────────────────────────
    let diagState = {
        active:           false,
        flow:             null,
        step:             0,
        answers:          {},
        tempResult:       null,
        waitingForName:   false,
        waitingForEmail:  false,
        diagNum:          null
    };

    let conversationHistory = [];

    // ── Nº DIAGNÓSTICO ────────────────────────────────────────────────────────
    function generarDiagNum() {
        const ts   = Date.now().toString().slice(-5);
        const rand = Math.floor(100 + Math.random() * 900);
        return "CYC-" + ts + "-" + rand;
    }

    // ── ADVERTENCIAS DE RIESGO ────────────────────────────────────────────────
    const riskWarnings = {
        "⚡ No enciende o no arranca": {
            msg:   "Si el equipo no responde al inicio, puede deberse a una falla en la fuente de alimentación o en la placa madre. Seguir forzando el encendido podría agravar el daño eléctrico y aumentar el costo de reparación.",
            nivel: "alta"
        },
        "🔥 Se sobrecalienta o apaga solo": {
            msg:   "El calor excesivo deteriora los componentes internos de forma progresiva. Una limpieza de ventilación a tiempo es mucho más económica que el reemplazo de procesador o placa madre.",
            nivel: "media"
        },
        "🐌 Va muy lento o se traba": {
            msg:   "La lentitud sostenida puede indicar un disco rígido con sectores dañados. Si no se evalúa, el riesgo de pérdida de información crece con el uso cotidiano.",
            nivel: "media"
        },
        "💥 Pantalla negra o sin imagen": {
            msg:   "Una pantalla negra puede ser señal de falla en la GPU o en la pantalla misma. Apagar y encender repetidamente sin diagnóstico puede dañar permanentemente los conectores internos.",
            nivel: "alta"
        },
        "🦠 Sospecho de virus o malware": {
            msg:   "Ciertos tipos de malware pueden cifrar tus archivos de forma irreversible si no se detienen a tiempo. Cuanto antes se intervenga, mayores las chances de recuperación total.",
            nivel: "alta"
        },
        "💾 Perdí archivos o datos importantes": {
            msg:   "Cada vez que el equipo se usa después de una pérdida de datos, los archivos eliminados pueden ser sobreescritos de forma permanente. Para maximizar las chances de recuperación, lo ideal es no usar el equipo hasta la revisión técnica.",
            nivel: "critica"
        },
        "🔊 Hace ruidos extraños": {
            msg:   "Los ruidos (clicks, raspados) en la mayoría de los casos provienen del disco rígido mecánico y son señal de falla inminente. Se recomienda hacer backup inmediato antes de que el disco falle completamente.",
            nivel: "alta"
        },
        "🚫 Sin internet en absoluto": {
            msg:   "La pérdida total de conectividad en una empresa implica interrupción de operaciones, acceso a sistemas en la nube y comunicaciones. Cada hora sin red tiene un costo operativo real.",
            nivel: "alta"
        },
        "🔒 Necesito configurar una red segura nueva": {
            msg:   "Una red sin configuración de seguridad adecuada queda expuesta a accesos no autorizados. El costo de una auditoría después de un incidente es significativamente mayor que una configuración preventiva.",
            nivel: "media"
        },
        "🔧 Reparación o mantenimiento de sistema existente": {
            msg:   "Un sistema de cámaras con fallas intermitentes representa una vulnerabilidad real. Los incidentes suelen ocurrir precisamente en ventanas de mal funcionamiento.",
            nivel: "media"
        }
    };

    // ── FLUJOS DE DIAGNÓSTICO ─────────────────────────────────────────────────
    const diagFlows = {

        "pc_diagnostico": {
            intro: "🔍 **Diagnóstico de equipo informático**\n\nTe voy a hacer 3 preguntas rápidas para evaluar tu situación con precisión.",
            steps: [
                {
                    key: "tipo_equipo",
                    question: "¿Qué tipo de equipo tiene el problema?",
                    options: ["💻 Laptop / Notebook", "🖥️ PC de escritorio", "🖨️ Impresora / Periférico", "📱 Tablet / Dispositivo móvil"]
                },
                {
                    key: "sintoma",
                    question: "¿Cuál es el síntoma principal?",
                    options: ["⚡ No enciende o no arranca", "🔥 Se sobrecalienta o apaga solo", "🐌 Va muy lento o se traba", "💥 Pantalla negra o sin imagen", "🦠 Sospecho de virus o malware", "💾 Perdí archivos o datos importantes", "🔊 Hace ruidos extraños"]
                },
                {
                    key: "duracion",
                    question: "¿Desde cuándo tiene este problema?",
                    options: ["Hoy mismo (es nuevo)", "Desde esta semana", "Hace más de un mes", "Es intermitente, va y viene"]
                }
            ],
            diagnose: function (answers) {
                var critico = answers.sintoma === "💾 Perdí archivos o datos importantes";
                var urgente = critico || ["⚡ No enciende o no arranca", "💥 Pantalla negra o sin imagen", "🔊 Hace ruidos extraños"].includes(answers.sintoma);
                var risk    = riskWarnings[answers.sintoma] || null;
                return {
                    titulo:        "Diagnóstico de PC / Equipo Informático",
                    icono:         "💻",
                    severidad:     critico ? "critica" : urgente ? "alta" : "media",
                    equipoLabel:   (answers.tipo_equipo || "").replace(/[💻🖥️🖨️📱]/g, "").trim(),
                    sintomaLabel:  (answers.sintoma     || "").replace(/[⚡🔥🐌💥🦠💾🔊]/g, "").trim(),
                    duracionLabel: answers.duracion || "",
                    riskWarning:   risk ? risk.msg : "Se recomienda revisión técnica para descartar fallas secundarias.",
                    resumen:       "Equipo: " + (answers.tipo_equipo||"").replace(/[💻🖥️🖨️📱]/g,"").trim() + ". Síntoma: " + (answers.sintoma||"").replace(/[⚡🔥🐌💥🦠💾🔊]/g,"").trim() + ". Tiempo: " + (answers.duracion||"No especificado") + ".",
                    pasos: [
                        critico  ? "🚨 **Situación crítica** — Se recomienda no usar el equipo hasta la revisión para maximizar las chances de recuperación de datos."
                        : urgente ? "⚠️ **Atención prioritaria recomendada** — El problema puede agravarse con el uso normal del equipo."
                                  : "✅ El problema tiene solución y puede programarse con flexibilidad horaria.",
                        "🔍 Realizamos diagnóstico técnico completo antes de cualquier presupuesto, **sin cargo**.",
                        (answers.tipo_equipo && answers.tipo_equipo.includes("Laptop")) ? "🏠 Para laptops ofrecemos servicio a domicilio o retiro y entrega en CABA y GBA." : "🏠 Servicio a domicilio disponible en CABA y toda la zona GBA.",
                        "⏱️ Tiempo estimado de resolución: 2 a 6 horas según la complejidad del caso."
                    ],
                    servicio: "Soporte Informático"
                };
            }
        },

        "redes_diagnostico": {
            intro: "📡 **Diagnóstico de redes y conectividad**\n\nUnas pocas preguntas para entender tu situación.",
            steps: [
                {
                    key: "problema_red",
                    question: "¿Cuál es el problema principal?",
                    options: ["🚫 Sin internet en absoluto", "🐌 Conexión lenta o inestable", "📶 WiFi con mala cobertura o señal débil", "🔗 No conecta a la red interna de la empresa", "🔒 Necesito configurar una red segura nueva"]
                },
                {
                    key: "tipo_instalacion",
                    question: "¿Qué tipo de instalación es?",
                    options: ["🏠 Hogar / Departamento", "🏢 Oficina pequeña (hasta 10 equipos)", "🏗️ Empresa o local (más de 10 equipos)", "📦 Local comercial"]
                },
                {
                    key: "equipos_afectados",
                    question: "¿Cuántos equipos están afectados?",
                    options: ["Solo 1 dispositivo", "Entre 2 y 5 dispositivos", "Toda la red / todos los dispositivos", "No lo sé aún"]
                }
            ],
            diagnose: function (answers) {
                var empresarial = ["🏗️ Empresa o local (más de 10 equipos)", "🏢 Oficina pequeña (hasta 10 equipos)"].includes(answers.tipo_instalacion);
                var total       = answers.equipos_afectados === "Toda la red / todos los dispositivos";
                var risk        = riskWarnings[answers.problema_red] || null;
                return {
                    titulo:        "Diagnóstico de Red / Conectividad",
                    icono:         "📡",
                    severidad:     total ? "alta" : empresarial ? "media" : "baja",
                    equipoLabel:   (answers.tipo_instalacion || "").replace(/[🏠🏢🏗️📦]/g, "").trim(),
                    sintomaLabel:  (answers.problema_red    || "").replace(/[🚫🐌📶🔗🔒]/g, "").trim(),
                    duracionLabel: answers.equipos_afectados || "",
                    riskWarning:   risk ? risk.msg : "Una red con problemas intermitentes puede afectar la productividad y la seguridad de los datos en tránsito.",
                    resumen:       "Tipo: " + (answers.tipo_instalacion||"").replace(/[🏠🏢🏗️📦]/g,"").trim() + ". Problema: " + (answers.problema_red||"").replace(/[🚫🐌📶🔗🔒]/g,"").trim() + ". Equipos afectados: " + (answers.equipos_afectados||"No especificado") + ".",
                    pasos: [
                        empresarial ? "🏢 **Caso empresarial** — Enviamos técnico especializado con equipamiento de diagnóstico profesional." : "🔧 Diagnóstico remoto inicial disponible para muchos casos residenciales.",
                        (answers.problema_red && answers.problema_red.includes("segura")) ? "🔐 Configuramos firewall, VLAN, VPN y políticas de acceso adaptadas a tu red." : "📊 Revisamos router, modem, switches y puntos de acceso WiFi.",
                        "📋 Entregamos informe de infraestructura y recomendaciones al finalizar.",
                        "⚡ Resolución en el día para la mayoría de los casos."
                    ],
                    servicio: "Redes Cableadas e Inalámbricas"
                };
            }
        },

        "camaras_diagnostico": {
            intro: "📷 **Diagnóstico de sistemas CCTV**\n\nContame un poco más para darte la mejor recomendación.",
            steps: [
                {
                    key: "necesidad_camara",
                    question: "¿Qué necesitás exactamente?",
                    options: ["📦 Instalación nueva desde cero", "🔧 Reparación o mantenimiento de sistema existente", "⬆️ Ampliar el sistema actual", "💻 Configurar acceso remoto o apps"]
                },
                {
                    key: "tipo_lugar",
                    question: "¿Dónde se instalaría?",
                    options: ["🏠 Casa / Departamento", "🏢 Oficina / Consultorio", "🏪 Local comercial / Negocio", "🏭 Depósito / Nave industrial"]
                },
                {
                    key: "cantidad_camaras",
                    question: "¿Cuántas cámaras necesitarías?",
                    options: ["1-2 cámaras (vigilancia básica)", "3-5 cámaras (cobertura media)", "6-10 cámaras (cobertura completa)", "Más de 10 cámaras (sistema empresarial)"]
                }
            ],
            diagnose: function (answers) {
                var empresarial = ["🏭 Depósito / Nave industrial", "Más de 10 cámaras (sistema empresarial)"].some(function(opt){ return [answers.tipo_lugar, answers.cantidad_camaras].includes(opt); });
                var instalNueva = answers.necesidad_camara === "📦 Instalación nueva desde cero";
                var risk        = riskWarnings[answers.necesidad_camara] || null;
                return {
                    titulo:        "Diagnóstico de Sistema CCTV",
                    icono:         "📷",
                    severidad:     empresarial ? "alta" : "media",
                    equipoLabel:   (answers.tipo_lugar       || "").replace(/[🏠🏢🏪🏭]/g, "").trim(),
                    sintomaLabel:  (answers.necesidad_camara || "").replace(/[📦🔧⬆️💻]/g, "").trim(),
                    duracionLabel: answers.cantidad_camaras || "",
                    riskWarning:   risk ? risk.msg : "Un sistema de videovigilancia sin mantenimiento puede generar puntos ciegos o registros de baja calidad en el momento en que más importan.",
                    resumen:       "Servicio: " + (answers.necesidad_camara||"").replace(/[📦🔧⬆️💻]/g,"").trim() + ". Lugar: " + (answers.tipo_lugar||"").replace(/[🏠🏢🏪🏭]/g,"").trim() + ". Cantidad: " + (answers.cantidad_camaras||"No especificado") + ".",
                    pasos: [
                        instalNueva ? "📐 Realizamos **relevamiento técnico gratuito** para diseñar el sistema óptimo." : "🔍 Revisamos el sistema existente y hacemos diagnóstico del problema.",
                        empresarial ? "🏢 **Solución empresarial** — Cámaras IP, NVR/DVR, almacenamiento en la nube y monitoreo 24/7." : "🎥 Cámaras HD con visión nocturna, detección de movimiento y almacenamiento local o cloud.",
                        "📱 Configuramos app móvil para que veas tus cámaras desde cualquier lugar.",
                        "⚙️ Instalación con cableado estructurado y garantía de 12 meses."
                    ],
                    servicio: "Instalación CCTV"
                };
            }
        },

        "alarmas_diagnostico": {
            intro: "🚨 **Diagnóstico de sistemas de alarma**\n\n¿Qué tipo de solución estás buscando?",
            steps: [
                {
                    key: "tipo_alarma",
                    question: "¿Qué sistema te interesa?",
                    options: ["🔔 Alarma domiciliaria con sensores", "⚡ Cerco eléctrico perimetral", "🚨 Alarma monitoreada 24/7", "🔧 Reparación o mantenimiento de alarma existente"]
                },
                {
                    key: "ubicacion_alarma",
                    question: "¿Dónde se instalaría?",
                    options: ["🏠 Casa / Departamento", "🏢 Oficina / Local comercial", "🏭 Depósito / Galpón", "🏗️ Obra en construcción"]
                },
                {
                    key: "zonas_proteger",
                    question: "¿Cuántas zonas/ambientes necesitás proteger?",
                    options: ["1-3 ambientes (básico)", "4-6 ambientes (intermedio)", "7-10 ambientes (completo)", "Perímetro externo completo"]
                }
            ],
            diagnose: function (answers) {
                var cerco      = answers.tipo_alarma && answers.tipo_alarma.includes("Cerco");
                var monitoreada = answers.tipo_alarma && answers.tipo_alarma.includes("monitoreada");
                return {
                    titulo:        "Diagnóstico de Sistema de Alarma",
                    icono:         "🚨",
                    severidad:     (cerco || monitoreada) ? "alta" : "media",
                    equipoLabel:   (answers.ubicacion_alarma || "").replace(/[🏠🏢🏭🏗️]/g, "").trim(),
                    sintomaLabel:  (answers.tipo_alarma      || "").replace(/[🔔⚡🚨🔧]/g, "").trim(),
                    duracionLabel: answers.zonas_proteger || "",
                    riskWarning:   "Una alarma mal configurada puede activarse en falso o no responder ante un evento real. La revisión técnica periódica garantiza su funcionamiento cuando más importa.",
                    resumen:       "Sistema: " + (answers.tipo_alarma||"").replace(/[🔔⚡🚨🔧]/g,"").trim() + ". Lugar: " + (answers.ubicacion_alarma||"").replace(/[🏠🏢🏭🏗️]/g,"").trim() + ". Zonas: " + (answers.zonas_proteger||"No especificado") + ".",
                    pasos: [
                        cerco ? "⚡ **Cerco eléctrico** — 6000-10000V no letales, con certificación de seguridad." : "🔔 Alarma con sensores de movimiento, magnéticos y pánico.",
                        monitoreada ? "👮 Conexión directa con central de monitoreo 24/7 con respuesta ante emergencias." : "📱 App móvil con notificaciones push ante cualquier evento detectado.",
                        "🔊 Sirena exterior de alta potencia (120dB) y luz estroboscópica disuasoria.",
                        "🔐 Instalación profesional con garantía y mantenimiento anual incluido."
                    ],
                    servicio: "Sistemas de Alarmas"
                };
            }
        },

        "domotica_diagnostico": {
            intro: "🏠 **Diagnóstico de domótica y automatización**\n\nContame qué querés automatizar.",
            steps: [
                {
                    key: "sistema_domotica",
                    question: "¿Qué querés automatizar?",
                    options: ["💡 Iluminación inteligente", "🌡️ Climatización / Aire acondicionado", "🔌 Enchufes y electrodomésticos", "🎬 Sistema completo (todo integrado)"]
                },
                {
                    key: "control_deseado",
                    question: "¿Cómo te gustaría controlarlo?",
                    options: ["📱 App desde el celular", "🗣️ Comandos de voz (Alexa/Google)", "⏰ Automatización por horarios", "🏠 Todo lo anterior (control total)"]
                },
                {
                    key: "presupuesto_aprox",
                    question: "¿Qué nivel de inversión tenés en mente?",
                    options: ["💰 Básico (hasta $50.000)", "💰💰 Intermedio ($50.000 - $150.000)", "💰💰💰 Completo ($150.000+)", "🤷 No tengo idea, necesito asesoramiento"]
                }
            ],
            diagnose: function (answers) {
                var completo = answers.sistema_domotica && answers.sistema_domotica.includes("completo");
                var voz      = answers.control_deseado  && answers.control_deseado.includes("voz");
                return {
                    titulo:        "Diagnóstico de Sistema Domótico",
                    icono:         "🏠",
                    severidad:     completo ? "alta" : "media",
                    equipoLabel:   (answers.sistema_domotica || "").replace(/[💡🌡️🔌🎬]/g, "").trim(),
                    sintomaLabel:  (answers.control_deseado  || "").replace(/[📱🗣️⏰🏠]/g, "").trim(),
                    duracionLabel: answers.presupuesto_aprox || "",
                    riskWarning:   "Una instalación domótica sin configuración de seguridad puede dejar dispositivos IoT expuestos en la red. Es importante proteger cada dispositivo con credenciales robustas.",
                    resumen:       "Automatización: " + (answers.sistema_domotica||"").replace(/[💡🌡️🔌🎬]/g,"").trim() + ". Control: " + (answers.control_deseado||"").replace(/[📱🗣️⏰🏠]/g,"").trim() + ". Inversión: " + (answers.presupuesto_aprox||"No especificado") + ".",
                    pasos: [
                        completo ? "🏠 **Sistema integral** — Controlá luces, climatización, cortinas y seguridad desde una sola app." : "💡 Automatización modular que podés ampliar con el tiempo.",
                        voz ? "🗣️ Integración con Alexa o Google Assistant para control por voz en español." : "📱 App móvil intuitiva con control remoto desde cualquier lugar.",
                        "⚡ Instalación sin romper paredes — usamos tecnología inalámbrica siempre que es posible.",
                        "🎓 Capacitación completa para que uses tu sistema al 100% desde el primer día."
                    ],
                    servicio: "Automatización Domótica"
                };
            }
        }
    };

    // ── RESPUESTAS INTELIGENTES ───────────────────────────────────────────────
    var intelligentResponses = {
        'menu_diagnostico': {
            message: "🔍 **¿Con qué área necesitás ayuda?**\n\nElegí la categoría que mejor se ajuste:",
            options: [
                { text: "💻 PC / Laptop / Software",    next: "iniciar_diag_pc" },
                { text: "📡 Internet / Redes / WiFi",   next: "iniciar_diag_redes" },
                { text: "📷 Cámaras de Seguridad",      next: "iniciar_diag_camaras" },
                { text: "🚨 Alarmas / Cerco eléctrico", next: "iniciar_diag_alarmas" },
                { text: "🏠 Domótica / Automatización", next: "iniciar_diag_domotica" }
            ]
        },
        'consulta_urgente': {
            message: "🚨 **¿Tu problema es urgente?**\n\nOpciones para atención inmediata:",
            options: [
                { text: "📞 Llamar ahora",      action: "llamar_ahora" },
                { text: "💬 WhatsApp urgente",  action: "whatsapp_urgente" }
            ]
        }
    };

    // ── APERTURA / CIERRE ─────────────────────────────────────────────────────
    chatbotToggle.addEventListener('click', function () {
        chatbotWindow.classList.toggle('active');
        notificationDot.classList.remove('active');
        if (conversationHistory.length === 0) {
            addMessage(
                "¡Hola! 👋 Soy el **Asistente Cyclops**.\n\nEstoy aquí para ayudarte con cualquier problema técnico o consulta sobre nuestros servicios.\n\n¿En qué puedo asistirte hoy?",
                'bot',
                [
                    { text: "🔍 Diagnóstico técnico guiado", next: "menu_diagnostico" },
                    { text: "💬 Consulta general",           action: "consulta_general" },
                    { text: "📞 Llamar ahora",               action: "llamar_ahora" }
                ]
            );
        }
    });

    chatbotClose.addEventListener('click', function () { chatbotWindow.classList.remove('active'); });

    // ── ENVÍO DE MENSAJES ─────────────────────────────────────────────────────
    function sendMessage() {
        var message = chatbotInput.value.trim();
        if (!message) return;
        addMessage(message, 'user');
        chatbotInput.value = '';
        setTimeout(function () { processUserInput(message); }, 800);
    }

    function processUserInput(message) {
        // Pipeline post-diagnóstico: captura nombre
        if (diagState.waitingForName) {
            diagState.answers.nombre  = message;
            diagState.waitingForName  = false;
            diagState.waitingForEmail = true;
            addMessage("Perfecto, **" + message + "**.\n\n¿A qué email te enviamos el informe? (Escribí \"no\" si preferís omitirlo)", 'bot');
            return;
        }
        // Pipeline post-diagnóstico: captura email
        if (diagState.waitingForEmail) {
            var emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message);
            diagState.answers.email   = (message.toLowerCase() === "no" || !emailValido) ? "" : message;
            diagState.waitingForEmail = false;
            procesarYEnviarDiagnostico();
            return;
        }
        processUserMessage(message);
    }

    function processUserMessage(message) {
        var lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('horario') || lowerMsg.includes('hora') || lowerMsg.includes('atienden')) {
            addMessage("⏰ **Nuestros horarios de atención:**\n\n📅 Lunes a Viernes: 9:00 a 18:00 hs\n📅 Sábados: 9:00 a 13:00 hs\n📅 Domingos: Cerrado\n\n⚡ Para urgencias fuera de horario, contactanos por WhatsApp.", 'bot', [{ text: "💬 Contactar por WhatsApp", action: "whatsapp_urgente" }]);
        } else if (lowerMsg.includes('precio') || lowerMsg.includes('costo') || lowerMsg.includes('cuanto')) {
            addMessage("💰 **Los precios varían según el servicio:**\n\nCada caso es único, por eso hacemos una evaluación personalizada sin compromiso.\n\n✅ La **consulta inicial es gratuita**\n✅ Presupuesto detallado antes de cualquier trabajo\n✅ Garantía en todos los servicios", 'bot', [{ text: "📅 Solicitar presupuesto", action: "agendar_consulta" }, { text: "💬 Consultar por WhatsApp", action: "whatsapp_urgente" }]);
        } else if (lowerMsg.includes('zona') || lowerMsg.includes('cobertura') || lowerMsg.includes('donde')) {
            addMessage("📍 **Zona de cobertura:**\n\n✅ Ciudad Autónoma de Buenos Aires (CABA)\n✅ Gran Buenos Aires (GBA) — Zona Norte, Sur y Oeste\n\n🚗 Para zonas alejadas, consultanos disponibilidad.", 'bot', [{ text: "📞 Verificar mi zona", action: "llamar_ahora" }]);
        } else if (lowerMsg.includes('urgente') || lowerMsg.includes('urgencia') || lowerMsg.includes('rapido')) {
            processFlow('consulta_urgente');
        } else {
            addMessage("💡 **¿Te gustaría que hagamos un diagnóstico guiado?**\n\nPuedo hacerte algunas preguntas y darte una evaluación precisa.", 'bot', [{ text: "🔍 Sí, hacer diagnóstico", next: "menu_diagnostico" }, { text: "💬 Prefiero hablar con alguien", action: "whatsapp_urgente" }]);
        }
    }

    // ── FLUJO DE DIAGNÓSTICO ──────────────────────────────────────────────────
    function startDiagFlow(flowKey) {
        var flow = diagFlows[flowKey];
        if (!flow) return;
        diagState = { active: true, flow: flowKey, step: 0, answers: {}, tempResult: null, waitingForName: false, waitingForEmail: false, diagNum: null };
        addMessage(flow.intro, 'bot');
        setTimeout(askDiagStep, 600);
    }

    function askDiagStep() {
        var flow = diagFlows[diagState.flow];
        if (!flow) return;
        if (diagState.step >= flow.steps.length) { finishDiag(); return; }
        var currentStep = flow.steps[diagState.step];
        var opts = currentStep.options.map(function (opt) {
            return { text: opt, next: "__diag__" + diagState.step + "__" + opt };
        });
        addMessage(currentStep.question, 'bot', opts);
    }

    function finishDiag() {
        var flow   = diagFlows[diagState.flow];
        var result = flow.diagnose(diagState.answers);
        diagState.active     = false;
        diagState.tempResult = result;
        diagState.diagNum    = generarDiagNum();

        var nivelLabel = { critica: "🔴 Riesgo crítico", alta: "🟠 Riesgo elevado", media: "🟡 A tener en cuenta", baja: "🟢 Situación estable" };
        var nivelTexto = nivelLabel[result.severidad] || "🟡 A tener en cuenta";

        addMessage(
            "📋 **Evaluación técnica preliminar completada.**\n\n" + nivelTexto + "\n\n⚠️ **Nota técnica:** " + result.riskWarning + "\n\nTu diagnóstico está listo. ¿A nombre de quién querés que figure el informe?",
            'bot'
        );
        diagState.waitingForName = true;
    }

    function procesarYEnviarDiagnostico() {
        var result  = diagState.tempResult;
        var diagNum = diagState.diagNum;
        var nombre  = diagState.answers.nombre || "Cliente";
        var email   = diagState.answers.email  || "No provisto";

        addMessage("⏳ Generando tu informe técnico...", 'bot');

        var payload = {
            diagNum:     diagNum,
            fecha:       new Date().toLocaleString('es-AR'),
            nombre:      nombre,
            email:       email,
            servicio:    result.servicio,
            sintoma:     result.sintomaLabel,
            equipo:      result.equipoLabel,
            duracion:    result.duracionLabel,
            resumen:     result.resumen,
            riskWarning: result.riskWarning,
            severidad:   result.severidad,
            pasos:       result.pasos.join(" | "),
            logoUrl:     CYCLOPS_CONFIG.logoUrl,
            sitio:       CYCLOPS_CONFIG.sitio
        };

        guardarLocalDiag(payload);

        enviarAGoogleAppsScript(payload).then(function (response) {
            if (response && response.success) {
                mostrarResultadoFinal(diagNum, nombre, response.pdfUrl, result);
            } else {
                mostrarResultadoFinal(diagNum, nombre, null, result);
            }
        }).catch(function () {
            mostrarResultadoFinal(diagNum, nombre, null, result);
        });
    }

    function mostrarResultadoFinal(diagNum, nombre, pdfUrl, result) {
        var report = "✅ **" + result.icono + " " + result.titulo + "**\n\n";
        report += "📌 **Nº de Diagnóstico: " + diagNum + "**\n\n";
        report += result.resumen + "\n\n";
        report += "**Evaluación técnica:**\n";
        result.pasos.forEach(function (paso, idx) { report += (idx + 1) + ". " + paso + "\n"; });

        var acciones = [];
        if (pdfUrl) { acciones.push({ text: "📄 Descargar mi informe PDF", action: "__download__" + pdfUrl }); }

        var waMsg = encodeURIComponent("Hola! Completé el diagnóstico online. Mi número es *" + diagNum + "*.\nServicio: " + result.servicio + "\nProblema: " + result.sintomaLabel + "\n¿Me pueden contactar?");
        acciones.push({ text: "💬 Enviar diagnóstico al técnico", action: "__whatsapp_diag__" + waMsg });
        acciones.push({ text: "🔍 Hacer otro diagnóstico", next: "menu_diagnostico" });

        addMessage(report, 'bot', acciones);
    }

    // ── GOOGLE APPS SCRIPT ────────────────────────────────────────────────────
    function enviarAGoogleAppsScript(payload) {
        if (!CYCLOPS_CONFIG.appsScriptUrl || CYCLOPS_CONFIG.appsScriptUrl.includes("TU_ID_AQUI")) {
            console.warn("⚠️ Apps Script URL no configurada. Guardado local únicamente.");
            return Promise.resolve(null);
        }
        return fetch(CYCLOPS_CONFIG.appsScriptUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(function (r) { return r.json(); }).catch(function (e) {
            console.error("❌ Error Apps Script:", e);
            return null;
        });
    }

    function guardarLocalDiag(payload) {
        try {
            var historico = JSON.parse(sessionStorage.getItem('cyclopsDiagnosticos') || '[]');
            historico.push(payload);
            sessionStorage.setItem('cyclopsDiagnosticos', JSON.stringify(historico));
        } catch (e) { /* silencioso */ }
    }

    // ── RENDERIZADO ───────────────────────────────────────────────────────────
    function addMessage(text, sender, options) {
        options = options || [];
        var messageData = { text: text, sender: sender, options: options, timestamp: Date.now() };
        conversationHistory.push(messageData);
        renderMessage(messageData);
        saveConversation();
    }

    function renderMessage(messageData) {
        var messageDiv = document.createElement('div');
        messageDiv.classList.add('message', messageData.sender);
        var contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        var textDiv = document.createElement('div');
        textDiv.innerHTML = messageData.text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        contentDiv.appendChild(textDiv);

        if (messageData.options && messageData.options.length > 0) {
            var optionsDiv = document.createElement('div');
            optionsDiv.classList.add('service-options');
            messageData.options.forEach(function (option) {
                var button = document.createElement('button');
                button.classList.add('service-option');
                button.textContent = option.text;
                if (option.action) {
                    button.addEventListener('click', function () { handleAction(option.action); });
                } else if (option.next) {
                    button.addEventListener('click', function () {
                        addMessage(option.text, 'user');
                        setTimeout(function () { processFlow(option.next); }, 800);
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

    // ── PROCESADOR DE FLOWS ───────────────────────────────────────────────────
    function processFlow(flowKey) {
        if (flowKey === 'iniciar_diag_pc')      { startDiagFlow('pc_diagnostico');       return; }
        if (flowKey === 'iniciar_diag_redes')    { startDiagFlow('redes_diagnostico');    return; }
        if (flowKey === 'iniciar_diag_camaras')  { startDiagFlow('camaras_diagnostico');  return; }
        if (flowKey === 'iniciar_diag_alarmas')  { startDiagFlow('alarmas_diagnostico');  return; }
        if (flowKey === 'iniciar_diag_domotica') { startDiagFlow('domotica_diagnostico'); return; }

        if (diagState.active && flowKey.indexOf('__diag__') === 0) {
            var parts   = flowKey.split('__');
            var stepIdx = parseInt(parts[2]);
            var answer  = parts.slice(3).join('__');
            var flow    = diagFlows[diagState.flow];
            if (flow && stepIdx === diagState.step) {
                diagState.answers[flow.steps[stepIdx].key] = answer;
                diagState.step++;
                setTimeout(askDiagStep, 400);
            }
            return;
        }

        if (flowKey === 'menu_diagnostico') {
            var m = intelligentResponses['menu_diagnostico'];
            addMessage(m.message, 'bot', m.options);
            return;
        }

        if (intelligentResponses[flowKey]) {
            var r = intelligentResponses[flowKey];
            addMessage(r.message, 'bot', r.options);
        } else {
            addMessage("💡 **Te recomiendo que hablemos para evaluar tu caso específico.**", 'bot', [
                { text: "📅 Coordinar consulta", action: "agendar_consulta" },
                { text: "🔍 Diagnóstico guiado",  next: "menu_diagnostico" }
            ]);
        }
    }

    // ── MANEJADOR DE ACCIONES ─────────────────────────────────────────────────
    function handleAction(action) {
        if (action.startsWith('__download__')) {
            window.open(action.replace('__download__', ''), '_blank');
            addMessage("📄 Abriendo tu informe PDF...\n\nGuardalo en tu dispositivo para tenerlo disponible.", 'bot');
            return;
        }
        if (action.startsWith('__whatsapp_diag__')) {
            var msgEncoded = action.replace('__whatsapp_diag__', '');
            window.open("https://wa.me/" + CYCLOPS_CONFIG.whatsapp + "?text=" + msgEncoded, '_blank');
            addMessage("💬 Abriendo WhatsApp con tu diagnóstico adjunto...\n\nNuestro equipo técnico lo va a revisar antes de contactarte.", 'bot');
            return;
        }
        switch (action) {
            case 'llamar_ahora':
                window.open("tel:" + CYCLOPS_CONFIG.whatsapp);
                addMessage("📞 **Conectándote por teléfono...**\n\nSi no funciona, marcá directo al: " + CYCLOPS_CONFIG.telefono, 'bot');
                break;
            case 'whatsapp_urgente':
                window.open("https://wa.me/" + CYCLOPS_CONFIG.whatsapp + "?text=" + encodeURIComponent('¡Hola! Necesito ayuda técnica. ¿Me pueden asistir?'), '_blank');
                addMessage("💬 **¡Listo! Te redirijo a WhatsApp...**", 'bot');
                break;
            case 'agendar_consulta':
                addMessage("📅 **Para agendar una consulta:**\n\nContactanos al " + CYCLOPS_CONFIG.telefono + " o por WhatsApp.\n\nLa primera consulta no tiene costo 😊", 'bot', [{ text: "💬 Agendar por WhatsApp", action: "whatsapp_urgente" }]);
                break;
            case 'consulta_general':
                addMessage("💬 **¿En qué puedo ayudarte?**\n\nElegí una opción o escribime tu consulta:", 'bot', [
                    { text: "⏰ Horarios", next: "horarios" },
                    { text: "💰 Precios",  next: "precios" },
                    { text: "📍 Zona de cobertura", next: "zona" }
                ]);
                break;
            default:
                addMessage("💡 Contactanos directo: " + CYCLOPS_CONFIG.telefono, 'bot');
        }
    }

    // ── PERSISTENCIA ──────────────────────────────────────────────────────────
    function saveConversation() {
        try { localStorage.setItem('cyclopsChatbotConversation', JSON.stringify(conversationHistory)); } catch (e) { /* silencioso */ }
    }

    function loadConversation() {
        try {
            var saved = localStorage.getItem('cyclopsChatbotConversation');
            if (saved) {
                conversationHistory = JSON.parse(saved);
                chatbotMessages.innerHTML = '';
                conversationHistory.forEach(function (msg) { renderMessage(msg); });
            }
        } catch (e) { conversationHistory = []; }
    }

    // ── EVENTOS ───────────────────────────────────────────────────────────────
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') sendMessage(); });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.quick-question')) return;
        var button   = e.target.closest('.quick-question');
        var action   = button.getAttribute('data-action');
        var question = button.getAttribute('data-question');
        if (action === 'pc_problemas') {
            chatbotWindow.classList.add('active');
            addMessage("🔍 Quiero hacer un diagnóstico técnico guiado", 'user');
            setTimeout(function () { processFlow('menu_diagnostico'); }, 800);
        } else if (question) {
            chatbotWindow.classList.add('active');
            addMessage(button.textContent.trim(), 'user');
            setTimeout(function () { processUserMessage(button.textContent.trim()); }, 800);
        }
    });

    document.querySelectorAll('.suggestion-btn').forEach(function (button) {
        button.addEventListener('click', function () {
            addMessage(button.textContent.trim(), 'user');
            setTimeout(function () { processUserMessage(button.textContent.trim()); }, 800);
        });
    });

    loadConversation();
    console.log("✅ Chatbot Cyclops v3.0 inicializado correctamente");
}
