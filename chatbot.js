// ===========================
// CHATBOT INTELIGENTE CON DIAGNÓSTICO GUIADO
// Soporte Cyclops — v4.1
// ===========================
// CHANGELOG v4.1:
// [FIX] generarDiagNum() eliminada — el número se genera en Apps Script
// [NEW] procesarYEnviarDiagnostico() ahora es async: espera diagNum del servidor
// [NEW] Formato de número: DIAG-DDMMAA-NNNN (ej: DIAG-190326-0001)
// [NEW] enviarYObtenerDiagNum() reemplaza enviarAGoogleAppsScript()
// [NEW] fallbackLocal() garantiza funcionamiento offline con mismo formato
// [NEW] finishDiag() ya NO genera diagNum local — se elimina esa línea
// ===========================
// CHANGELOG v4.0 (histórico):
// [FIX] tel: usaba número WA sin "+" — corregido a CYCLOPS_CONFIG.telefono
// [FIX] Flujos "horarios","precios","zona" en consulta_general caían silenciosamente al default
// [FIX] Garantías: texto actualizado a política real (variable por tipo)
// [FIX] "Consulta sin cargo" aclarado: remota sin cargo, visita con presupuesto previo
// [FIX] logoUrl apuntaba a placeholder .txt — corregido a logo-icon.png
// [FIX] localStorage corrupto ya no bloquea UI — se limpia y resetea
// [NEW] Flow de Ciberseguridad con diagnóstico completo (4 pasos)
// [NEW] Flow de UPS / Protección de Energía con diagnóstico y recomendación de VA
// [NEW] Flow de Presencia Web con derivación directa a WhatsApp
// [NEW] Menú principal expandido a 7 servicios
// [NEW] Keywords ampliadas: ups, ciberseguridad, factura, abono, blog, cctv, etc.
// [NEW] Blog referenciado como recurso en respuestas temáticas
// [NEW] Diagnóstico PC: 5 pasos (agrega mantenimiento previo + estado de backup)
// [NEW] Domótica: precios en USD con conversión automática al tipo oficial BNA
// [NEW] DOMOTICA_PRECIOS: objeto editable con rangos USD por categoría
// [NEW] dolarapi.com con caché de 15 min y fallback elegante si la API no responde
// [NEW] Alarmas: opción de Control de Acceso agregada

const CYCLOPS_CONFIG = {
    whatsapp:      "5491166804450",
    telefono:      "+54 9 11 6680-4450",
    email:         "contacto@soportecyclops.com.ar",
    sitio:         "www.soportecyclops.com.ar",
    logoUrl:       "https://www.soportecyclops.com.ar/public/images/logo-icon.png",
    appsScriptUrl: "https://script.google.com/macros/s/AKfycbwTWIw7r8HoVqz5c2jloC0r1af7JdTC518coiKnKd-VP_O6kGdETnj1Xi6z8PSOueJgAg/exec"
};

// ── PRECIOS DOMÓTICA EN USD ──────────────────────────────────────────────────
// Editá estos rangos cuando cambien tus precios. Son valores estimativos.
// Se convierten al tipo oficial BNA en tiempo real.
const DOMOTICA_PRECIOS = {
    "Iluminación inteligente":           { min: 150,  max: 400  },
    "Climatización / Aire acondicionado":{ min: 200,  max: 500  },
    "Enchufes y electrodomésticos":      { min: 100,  max: 300  },
    "Sistema completo (todo integrado)": { min: 600,  max: 1800 }
};

// ── CACHÉ DE COTIZACIÓN DÓLAR BNA ────────────────────────────────────────────
var dolarCache = { valor: null, timestamp: 0 };
var DOLAR_TTL  = 15 * 60 * 1000; // 15 minutos

async function obtenerDolarBNA() {
    var ahora = Date.now();
    if (dolarCache.valor && (ahora - dolarCache.timestamp) < DOLAR_TTL) {
        return dolarCache.valor;
    }
    try {
        var controller = new AbortController();
        var timer = setTimeout(function() { controller.abort(); }, 4000);
        var res  = await fetch("https://dolarapi.com/v1/dolares/oficial", { signal: controller.signal });
        clearTimeout(timer);
        var data = await res.json();
        if (data.venta && data.venta > 0) {
            dolarCache = { valor: data.venta, timestamp: ahora };
            return data.venta;
        }
    } catch (e) {
        console.warn("⚠️ No se pudo obtener cotización BNA:", e.message);
    }
    return null;
}

function formatARS(n) {
    return new Intl.NumberFormat("es-AR", { style:"currency", currency:"ARS", maximumFractionDigits:0 }).format(n);
}

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 Inicializando Chatbot Cyclops v4.1...");
    initChatbot();
});

function initChatbot() {

    var chatbotToggle   = document.getElementById('chatbotToggle');
    var chatbotWindow   = document.getElementById('chatbotWindow');
    var chatbotClose    = document.getElementById('chatbotClose');
    var chatbotMessages = document.getElementById('chatbotMessages');
    var chatbotInput    = document.getElementById('chatbotInput');
    var chatbotSend     = document.getElementById('chatbotSend');
    var notificationDot = document.getElementById('notificationDot');

    if (!chatbotToggle || !chatbotWindow) {
        console.error("❌ Elementos del chatbot no encontrados");
        return;
    }

    // diagNum ya NO se pre-genera aquí. Se asigna después de la respuesta del servidor.
    var diagState = { active:false, flow:null, step:0, answers:{}, tempResult:null, waitingForName:false, waitingForEmail:false, diagNum:null };
    var conversationHistory = [];

    // ── NOTA v4.1: generarDiagNum() fue eliminada.
    // El número se genera en Apps Script (Code.gs → generarDiagNumServidor).
    // Formato: DIAG-DDMMAA-NNNN  ej: DIAG-190326-0001
    // Si el servidor no responde, fallbackLocal() en enviarYObtenerDiagNum()
    // genera un número con el mismo formato pero con 4 dígitos aleatorios.

    // ── RISK WARNINGS ─────────────────────────────────────────────────────────
    var riskWarnings = {
        "⚡ No enciende o no arranca":
            "Si el equipo no responde al inicio puede deberse a falla en fuente de alimentación o placa madre. Seguir forzando el encendido puede agravar el daño y aumentar el costo de reparación.",
        "🔥 Se sobrecalienta o apaga solo":
            "El calor excesivo deteriora los componentes internos de forma progresiva. Una limpieza a tiempo es mucho más económica que reemplazar procesador o placa madre.",
        "🐌 Va muy lento o se traba":
            "La lentitud sostenida puede indicar un disco con sectores dañados. Si no se evalúa, el riesgo de pérdida de datos crece con el uso cotidiano.",
        "💥 Pantalla negra o sin imagen":
            "Puede ser falla en la GPU o en la pantalla. Apagar y encender repetidamente sin diagnóstico puede dañar permanentemente los conectores internos.",
        "🦠 Sospecho de virus o malware":
            "Ciertos tipos de malware pueden cifrar archivos de forma irreversible si no se detienen a tiempo. Cuanto antes se intervenga, mayores las chances de recuperación total.",
        "💾 Perdí archivos o datos importantes":
            "Cada vez que el equipo se usa después de una pérdida de datos, los archivos eliminados pueden ser sobreescritos permanentemente. Para maximizar las chances de recuperación, no usar el equipo hasta la revisión técnica.",
        "🔊 Hace ruidos extraños (clicks o raspados)":
            "Los clicks o raspados casi siempre provienen del disco mecánico y son señal de falla inminente. Hacer backup inmediato antes de que el disco falle completamente.",
        "🚫 Sin internet en absoluto":
            "La pérdida total de conectividad implica interrupción de operaciones, acceso a sistemas en la nube y comunicaciones. Cada hora sin red tiene un costo operativo real.",
        "🔒 Necesito configurar una red segura nueva":
            "Una red sin configuración de seguridad adecuada queda expuesta a accesos no autorizados. Una configuración preventiva cuesta significativamente menos que una auditoría post-incidente.",
        "🔧 Reparación o mantenimiento de sistema existente":
            "Un sistema de cámaras con fallas intermitentes representa una vulnerabilidad real. Los incidentes suelen ocurrir precisamente en ventanas de mal funcionamiento.",
        "🦠 Virus / ransomware activo":
            "ACCIÓN INMEDIATA: Desconectá el equipo de la red (cable y WiFi) YA. No apagues el equipo todavía — algunos ransomwares guardan claves en RAM. Contactanos urgente para contención y recuperación.",
        "⚡ Picos de tensión / cortes frecuentes":
            "Los picos de tensión al restaurarse la energía son la principal causa de fuentes quemadas y discos dañados. Un UPS habría prevenido este problema en el 90% de los casos."
    };

    // ── FLOWS ─────────────────────────────────────────────────────────────────

    var diagFlows = {

        // PC — 5 pasos
        "pc_diagnostico": {
            intro: "🔍 **Diagnóstico de equipo informático**\n\nTe voy a hacer 5 preguntas para evaluar tu situación con precisión.",
            steps: [
                { key:"tipo_equipo",           question:"¿Qué tipo de equipo tiene el problema?",                  options:["💻 Laptop / Notebook","🖥️ PC de escritorio","🖨️ Impresora / Periférico","📱 Tablet / Dispositivo móvil"] },
                { key:"sintoma",               question:"¿Cuál es el síntoma principal?",                          options:["⚡ No enciende o no arranca","🔥 Se sobrecalienta o apaga solo","🐌 Va muy lento o se traba","💥 Pantalla negra o sin imagen","🦠 Sospecho de virus o malware","💾 Perdí archivos o datos importantes","🔊 Hace ruidos extraños (clicks o raspados)"] },
                { key:"duracion",              question:"¿Desde cuándo tiene este problema?",                      options:["Hoy mismo (es nuevo)","Desde esta semana","Hace más de un mes","Es intermitente, va y viene"] },
                { key:"ultimo_mantenimiento",  question:"¿Cuándo fue el último mantenimiento (limpieza o revisión técnica)?", options:["Nunca o no recuerdo","Hace más de 2 años","Hace 1-2 años","Hace menos de 1 año"] },
                { key:"tiene_backup",          question:"¿Tenés backup actualizado de tus archivos importantes?",  options:["✅ Sí, tengo backup reciente","⚠️ Tengo algo pero desactualizado","❌ No tengo backup","🤷 No sé qué es un backup"] }
            ],
            diagnose: function(a) {
                var sinBackup = ["❌ No tengo backup","🤷 No sé qué es un backup"].includes(a.tiene_backup);
                var sinMant   = ["Nunca o no recuerdo","Hace más de 2 años"].includes(a.ultimo_mantenimiento);
                var critico   = a.sintoma === "💾 Perdí archivos o datos importantes";
                var urgente   = critico || ["⚡ No enciende o no arranca","💥 Pantalla negra o sin imagen","🔊 Hace ruidos extraños (clicks o raspados)"].includes(a.sintoma);
                var risk      = riskWarnings[a.sintoma] || "Se recomienda revisión técnica para descartar fallas secundarias.";
                var sev       = critico ? "critica" : urgente ? "alta" : (sinBackup && a.sintoma === "🐌 Va muy lento o se traba") ? "alta" : "media";
                var extra     = [];
                if (sinBackup) extra.push("🔴 **Sin backup detectado** — Como parte del servicio configuramos backup automático para evitar futuros riesgos.");
                if (sinMant)   extra.push("🧹 **Mantenimiento pendiente** — Incluimos limpieza de polvo y revisión de pasta térmica si corresponde.");
                return {
                    titulo:"Diagnóstico de PC / Equipo Informático", icono:"💻", severidad:sev,
                    equipoLabel:  (a.tipo_equipo||"").replace(/[💻🖥️🖨️📱]/gu,"").trim(),
                    sintomaLabel: (a.sintoma||"").replace(/[⚡🔥🐌💥🦠💾🔊]/gu,"").trim(),
                    duracionLabel: a.duracion||"",
                    riskWarning: risk,
                    resumen: "Equipo: "+(a.tipo_equipo||"").replace(/[💻🖥️🖨️📱]/gu,"").trim()+". Síntoma: "+(a.sintoma||"").replace(/[⚡🔥🐌💥🦠💾🔊]/gu,"").trim()+". Tiempo: "+(a.duracion||"No especificado")+". Último mantenimiento: "+(a.ultimo_mantenimiento||"No especificado")+". Backup: "+(a.tiene_backup||"No especificado")+".",
                    pasos: [
                        critico  ? "🚨 **Situación crítica** — No usar el equipo hasta la revisión para maximizar las chances de recuperación de datos."
                        : urgente ? "⚠️ **Atención prioritaria** — El problema puede agravarse con el uso normal del equipo."
                                  : "✅ El problema tiene solución y puede programarse con flexibilidad horaria.",
                        "🔍 Diagnóstico técnico completo antes de cualquier presupuesto, **sin cargo**.",
                        (a.tipo_equipo && a.tipo_equipo.includes("Laptop")) ? "🏠 Para laptops ofrecemos servicio a domicilio o retiro/entrega en CABA y GBA." : "🏠 Servicio a domicilio disponible en CABA y GBA.",
                        "⏱️ Tiempo estimado de resolución: 2 a 6 horas según la complejidad del caso.",
                        ...extra
                    ],
                    servicio:"Soporte Informático"
                };
            }
        },

        // REDES
        "redes_diagnostico": {
            intro: "📡 **Diagnóstico de redes y conectividad**\n\nUnas preguntas para entender tu situación.",
            steps: [
                { key:"problema_red",      question:"¿Cuál es el problema principal?",          options:["🚫 Sin internet en absoluto","🐌 Conexión lenta o inestable","📶 WiFi con mala cobertura","🔗 No conecta a la red interna","🔒 Necesito configurar una red segura nueva"] },
                { key:"tipo_instalacion",  question:"¿Qué tipo de instalación es?",             options:["🏠 Hogar / Departamento","🏢 Oficina pequeña (hasta 10 equipos)","🏗️ Empresa o local (más de 10 equipos)","📦 Local comercial"] },
                { key:"equipos_afectados", question:"¿Cuántos equipos están afectados?",        options:["Solo 1 dispositivo","Entre 2 y 5 dispositivos","Toda la red / todos los dispositivos","No lo sé aún"] }
            ],
            diagnose: function(a) {
                var empresarial = ["🏗️ Empresa o local (más de 10 equipos)","🏢 Oficina pequeña (hasta 10 equipos)"].includes(a.tipo_instalacion);
                var total       = a.equipos_afectados === "Toda la red / todos los dispositivos";
                var wifi        = a.problema_red && a.problema_red.includes("WiFi");
                var risk        = riskWarnings[a.problema_red] || "Una red con problemas intermitentes puede afectar la productividad y la seguridad de los datos.";
                return {
                    titulo:"Diagnóstico de Red / Conectividad", icono:"📡",
                    severidad: total ? "alta" : empresarial ? "media" : "baja",
                    equipoLabel:  (a.tipo_instalacion||"").replace(/[🏠🏢🏗️📦]/gu,"").trim(),
                    sintomaLabel: (a.problema_red||"").replace(/[🚫🐌📶🔗🔒]/gu,"").trim(),
                    duracionLabel: a.equipos_afectados||"",
                    riskWarning: risk,
                    resumen: "Tipo: "+(a.tipo_instalacion||"").replace(/[🏠🏢🏗️📦]/gu,"").trim()+". Problema: "+(a.problema_red||"").replace(/[🚫🐌📶🔗🔒]/gu,"").trim()+". Equipos afectados: "+(a.equipos_afectados||"No especificado")+".",
                    pasos: [
                        empresarial ? "🏢 **Caso empresarial** — Enviamos técnico con equipamiento de diagnóstico profesional." : "🔧 Diagnóstico remoto inicial disponible para muchos casos residenciales.",
                        wifi ? "📶 Trabajamos con MikroTik y Ubiquiti. 💡 Artículo gratuito: soportecyclops.com.ar/blog/wifi-no-llega.html" : "📊 Revisamos router, modem, switches y puntos de acceso.",
                        (a.problema_red && a.problema_red.includes("segura")) ? "🔐 Configuramos firewall, VLAN, VPN y políticas de acceso." : "📋 Entregamos informe de infraestructura al finalizar.",
                        "⚡ Resolución en el día para la mayoría de los casos."
                    ],
                    servicio:"Redes Cableadas e Inalámbricas"
                };
            }
        },

        // CÁMARAS
        "camaras_diagnostico": {
            intro: "📷 **Diagnóstico de sistemas CCTV**\n\nContame un poco más para la mejor recomendación.",
            steps: [
                { key:"necesidad_camara", question:"¿Qué necesitás exactamente?",          options:["📦 Instalación nueva desde cero","🔧 Reparación o mantenimiento de sistema existente","⬆️ Ampliar el sistema actual","💻 Configurar acceso remoto o app"] },
                { key:"tipo_lugar",       question:"¿Dónde se instalaría?",                options:["🏠 Casa / Departamento","🏢 Oficina / Consultorio","🏪 Local comercial / Negocio","🏭 Depósito / Nave industrial"] },
                { key:"cantidad_camaras", question:"¿Cuántas cámaras necesitarías?",       options:["1-2 cámaras (vigilancia básica)","3-5 cámaras (cobertura media)","6-10 cámaras (cobertura completa)","Más de 10 cámaras (sistema empresarial)"] }
            ],
            diagnose: function(a) {
                var empresarial = ["🏭 Depósito / Nave industrial","Más de 10 cámaras (sistema empresarial)"].some(function(o){ return [a.tipo_lugar, a.cantidad_camaras].includes(o); });
                var instalNueva = a.necesidad_camara === "📦 Instalación nueva desde cero";
                var risk        = riskWarnings[a.necesidad_camara] || "Un sistema sin mantenimiento puede tener puntos ciegos en el momento en que más importan.";
                return {
                    titulo:"Diagnóstico de Sistema CCTV", icono:"📷",
                    severidad: empresarial ? "alta" : "media",
                    equipoLabel:  (a.tipo_lugar||"").replace(/[🏠🏢🏪🏭]/gu,"").trim(),
                    sintomaLabel: (a.necesidad_camara||"").replace(/[📦🔧⬆️💻]/gu,"").trim(),
                    duracionLabel: a.cantidad_camaras||"",
                    riskWarning: risk,
                    resumen: "Servicio: "+(a.necesidad_camara||"").replace(/[📦🔧⬆️💻]/gu,"").trim()+". Lugar: "+(a.tipo_lugar||"").replace(/[🏠🏢🏪🏭]/gu,"").trim()+". Cantidad: "+(a.cantidad_camaras||"No especificado")+".",
                    pasos: [
                        instalNueva ? "📐 **Relevamiento técnico gratuito** para diseñar el sistema óptimo." : "🔍 Revisamos el sistema existente y hacemos diagnóstico del problema.",
                        empresarial ? "🏢 **Solución empresarial** — Cámaras IP HD/4K, NVR, almacenamiento local o cloud." : "🎥 Cámaras HD con visión nocturna, detección de movimiento y almacenamiento local.",
                        "📱 Configuramos app móvil para ver tus cámaras desde cualquier lugar.",
                        "⚙️ Instalación con cableado prolijo y garantía de 90 días.",
                        "💡 Guía completa: soportecyclops.com.ar/blog/camaras-seguridad-guia.html"
                    ],
                    servicio:"Instalación CCTV"
                };
            }
        },

        // ALARMAS
        "alarmas_diagnostico": {
            intro: "🚨 **Diagnóstico de sistemas de alarma**\n\n¿Qué tipo de solución estás buscando?",
            steps: [
                { key:"tipo_alarma",       question:"¿Qué sistema te interesa?",               options:["🔔 Alarma domiciliaria con sensores","⚡ Cerco eléctrico perimetral","🚨 Alarma monitoreada 24/7","🔐 Control de acceso (tarjeta / huella)","🔧 Reparación o mantenimiento de alarma existente"] },
                { key:"ubicacion_alarma",  question:"¿Dónde se instalaría?",                   options:["🏠 Casa / Departamento","🏢 Oficina / Local comercial","🏭 Depósito / Galpón","🏗️ Obra en construcción"] },
                { key:"zonas_proteger",    question:"¿Cuántas zonas/ambientes necesitás proteger?", options:["1-3 ambientes (básico)","4-6 ambientes (intermedio)","7-10 ambientes (completo)","Perímetro externo completo"] }
            ],
            diagnose: function(a) {
                var cerco       = a.tipo_alarma && a.tipo_alarma.includes("Cerco");
                var monitoreada = a.tipo_alarma && a.tipo_alarma.includes("monitoreada");
                var acceso      = a.tipo_alarma && a.tipo_alarma.includes("acceso");
                return {
                    titulo:"Diagnóstico de Sistema de Alarma", icono:"🚨",
                    severidad: (cerco || monitoreada) ? "alta" : "media",
                    equipoLabel:  (a.ubicacion_alarma||"").replace(/[🏠🏢🏭🏗️]/gu,"").trim(),
                    sintomaLabel: (a.tipo_alarma||"").replace(/[🔔⚡🚨🔐🔧]/gu,"").trim(),
                    duracionLabel: a.zonas_proteger||"",
                    riskWarning: "Una alarma mal configurada puede activarse en falso o no responder ante un evento real. La revisión técnica periódica garantiza su funcionamiento cuando más importa.",
                    resumen: "Sistema: "+(a.tipo_alarma||"").replace(/[🔔⚡🚨🔐🔧]/gu,"").trim()+". Lugar: "+(a.ubicacion_alarma||"").replace(/[🏠🏢🏭🏗️]/gu,"").trim()+". Zonas: "+(a.zonas_proteger||"No especificado")+".",
                    pasos: [
                        cerco    ? "⚡ **Cerco eléctrico** — Impulsos no letales, certificación de seguridad, instalación prolija."
                        : acceso ? "🔐 **Control de acceso** — Tarjeta, huella o PIN con log de ingresos/egresos y gestión de usuarios."
                                 : "🔔 Alarma con sensores de movimiento, magnéticos y botón de pánico.",
                        monitoreada ? "👮 Conexión con central de monitoreo 24/7 con respuesta ante emergencias." : "📱 App móvil con notificaciones push ante cualquier evento.",
                        "🔊 Sirena exterior de alta potencia (120dB) y luz estroboscópica disuasoria.",
                        "🔐 Instalación profesional con garantía y soporte posterior incluido."
                    ],
                    servicio:"Sistemas de Alarmas y Control de Acceso"
                };
            }
        },

        // DOMÓTICA — con precios USD/BNA
        "domotica_diagnostico": {
            intro: "🏠 **Diagnóstico de domótica y automatización**\n\nContame qué querés automatizar.",
            steps: [
                { key:"sistema_domotica",  question:"¿Qué querés automatizar?",               options:["💡 Iluminación inteligente","🌡️ Climatización / Aire acondicionado","🔌 Enchufes y electrodomésticos","🎬 Sistema completo (todo integrado)"] },
                { key:"control_deseado",   question:"¿Cómo te gustaría controlarlo?",         options:["📱 App desde el celular","🗣️ Comandos de voz (Alexa/Google)","⏰ Automatización por horarios","🏠 Todo lo anterior (control total)"] },
                { key:"tipo_lugar_dom",    question:"¿Dónde se instalaría?",                  options:["🏠 Casa / Departamento","🏢 Oficina / Local","🏗️ Construcción nueva (más fácil de cablear)","🏘️ Propiedad con infraestructura existente"] }
            ],
            diagnose: async function(a) {
                var completo    = a.sistema_domotica && a.sistema_domotica.includes("completo");
                var voz         = a.control_deseado  && a.control_deseado.includes("voz");
                var precioKey   = (a.sistema_domotica||"").replace(/[💡🌡️🔌🎬]/gu,"").trim();
                var precioMatch = null;
                Object.keys(DOMOTICA_PRECIOS).forEach(function(k){ if (precioKey.includes(k) || k.includes(precioKey)) precioMatch = DOMOTICA_PRECIOS[k]; });
                var precioUSD   = precioMatch || { min:300, max:1500 };
                var dolar       = await obtenerDolarBNA();
                var precioStr   = dolar
                    ? "\n\n💰 **Inversión estimada:** USD "+precioUSD.min+" – USD "+precioUSD.max+"\n📊 **Al tipo oficial BNA ($"+Math.round(dolar)+"/USD):** "+formatARS(precioUSD.min*dolar)+" – "+formatARS(precioUSD.max*dolar)+"\n_Valores orientativos. Presupuesto final acordado tras relevamiento._"
                    : "\n\n💰 **Inversión estimada:** USD "+precioUSD.min+" – USD "+precioUSD.max+"\n_Cotización no disponible en este momento. Te la informamos al contactar._";
                return {
                    titulo:"Diagnóstico de Sistema Domótico", icono:"🏠",
                    severidad: completo ? "alta" : "media",
                    equipoLabel:  (a.tipo_lugar_dom||"").replace(/[🏠🏢🏗️🏘️]/gu,"").trim(),
                    sintomaLabel: (a.sistema_domotica||"").replace(/[💡🌡️🔌🎬]/gu,"").trim(),
                    duracionLabel:(a.control_deseado||"").replace(/[📱🗣️⏰🏠]/gu,"").trim(),
                    riskWarning: "Una instalación domótica sin configuración de seguridad puede dejar dispositivos IoT expuestos en la red. Es importante proteger cada dispositivo con credenciales robustas.",
                    resumen: "Automatización: "+(a.sistema_domotica||"").replace(/[💡🌡️🔌🎬]/gu,"").trim()+". Control: "+(a.control_deseado||"").replace(/[📱🗣️⏰🏠]/gu,"").trim()+". Lugar: "+(a.tipo_lugar_dom||"No especificado")+"."+precioStr,
                    pasos:[
                        completo ? "🏠 **Sistema integral** — Controlá luces, climatización, cortinas y seguridad desde una sola app." : "💡 Automatización modular que podés ampliar con el tiempo.",
                        voz      ? "🗣️ Integración con Alexa o Google Assistant para control por voz en español." : "📱 App móvil con control remoto desde cualquier lugar.",
                        "⚡ Instalación sin romper paredes en la mayoría de los casos — tecnología inalámbrica.",
                        "🎓 Capacitación completa incluida para que uses el sistema desde el primer día.",
                        precioStr
                    ],
                    servicio:"Automatización Domótica"
                };
            }
        },

        // CIBERSEGURIDAD
        "ciber_diagnostico": {
            intro: "🛡️ **Diagnóstico de ciberseguridad**\n\nUnas preguntas para evaluar tu situación actual.",
            steps: [
                { key:"problema_ciber",    question:"¿Cuál es la situación?",                 options:["🦠 Virus / ransomware activo","🔓 Creo que me hackearon","🔒 Quiero proteger la red antes de que pase algo","📋 Necesito auditoría de seguridad para la empresa","🔐 Configurar VPN / acceso remoto seguro"] },
                { key:"alcance_ciber",     question:"¿Cuántos equipos están involucrados?",   options:["Solo 1 equipo / uso personal","2-10 equipos (pyme pequeña)","11-50 equipos (pyme mediana)","Más de 50 equipos (empresa grande)"] },
                { key:"tiene_antivirus",   question:"¿Tenés antivirus o solución de seguridad activa?", options:["✅ Antivirus corporativo pago (ESET, Bitdefender, etc.)","⚠️ Solo Windows Defender / gratuito","❌ No tengo nada instalado","🤷 No estoy seguro"] },
                { key:"backup_ciber",      question:"¿Tenés backup reciente de los datos críticos?",    options:["✅ Sí, backup automático al día","⚠️ Backup manual pero desactualizado","❌ No tengo backup","☁️ Solo en la nube (OneDrive / Google Drive)"] }
            ],
            diagnose: function(a) {
                var activo     = a.problema_ciber && a.problema_ciber.includes("activo");
                var hackeado   = a.problema_ciber && a.problema_ciber.includes("hackearon");
                var sinAV      = ["❌ No tengo nada instalado","🤷 No estoy seguro"].includes(a.tiene_antivirus);
                var sinBackup  = a.backup_ciber === "❌ No tengo backup";
                var empresarial= a.alcance_ciber !== "Solo 1 equipo / uso personal";
                var risk       = riskWarnings[a.problema_ciber] || (sinAV ? "Equipos sin protección activa son el vector de entrada más común para malware en pymes." : "La seguridad preventiva cuesta entre 10 y 100 veces menos que la respuesta a un incidente.");
                var sev        = (activo||hackeado) ? "critica" : (sinAV&&sinBackup) ? "alta" : empresarial ? "media" : "baja";
                var alertas    = [];
                if (sinBackup) alertas.push("🔴 **Sin backup** — En caso de ransomware, la recuperación sin backup puede ser imposible.");
                if (sinAV)     alertas.push("🟠 **Sin protección activa** — Los equipos sin antivirus corporativo son el vector de entrada más común para malware.");
                return {
                    titulo:"Diagnóstico de Ciberseguridad", icono:"🛡️", severidad:sev,
                    equipoLabel:  a.alcance_ciber||"",
                    sintomaLabel: (a.problema_ciber||"").replace(/[🦠🔓🔒📋🔐]/gu,"").trim(),
                    duracionLabel:a.tiene_antivirus||"",
                    riskWarning: risk,
                    resumen: "Situación: "+(a.problema_ciber||"").replace(/[🦠🔓🔒📋🔐]/gu,"").trim()+". Alcance: "+(a.alcance_ciber||"No especificado")+". Antivirus: "+(a.tiene_antivirus||"No especificado")+". Backup: "+(a.backup_ciber||"No especificado")+".",
                    pasos:[
                        activo   ? "🚨 **Ransomware activo — Pasos inmediatos:**\n   1. Desconectá el equipo de la red YA.\n   2. No apagues el equipo todavía.\n   3. Contactanos urgente para contención y recuperación."
                        : hackeado ? "⚠️ **Posible intrusión** — Cambiá todas las contraseñas desde un dispositivo limpio y contactanos para auditoría de accesos."
                                   : "🔒 Instalamos y configuramos ESET Endpoint o equivalente según el tamaño de la red.",
                        empresarial ? "🏢 **Entorno empresarial:** firewall perimetral, VLAN segmentada, VPN para acceso remoto, políticas de contraseñas y capacitación del equipo." : "🔐 Configuración segura de red WiFi, router, contraseñas y backup automático.",
                        ...alertas,
                        "📋 Entregamos informe de vulnerabilidades con priorización (crítico / moderado / bajo)."
                    ],
                    servicio:"Ciberseguridad"
                };
            }
        },

        // UPS
        "ups_diagnostico": {
            intro: "🔋 **Diagnóstico de UPS y protección de energía**\n\nUnas preguntas para recomendarte el equipo correcto.",
            steps: [
                { key:"motivo_ups",             question:"¿Por qué necesitás un UPS?",                    options:["⚡ Picos de tensión / cortes frecuentes","💾 Quiero proteger equipos o datos ante cortes","🔇 El UPS actual ya no sostiene la carga","🆕 Instalación nueva, quiero hacerlo bien"] },
                { key:"equipos_a_proteger",     question:"¿Qué equipos querés proteger?",                 options:["🖥️ 1 PC + monitor (puesto individual)","🖥️🖥️ 2-5 PCs + red (oficina pequeña)","🗄️ Servidor o NAS (equipos críticos)","🔀 Router / switch / telecomunicaciones solamente"] },
                { key:"autonomia_deseada",      question:"¿Cuánta autonomía necesitás ante un corte?",    options:["⏱️ Solo para guardar y apagar bien (5-10 min)","🕐 Hasta 30 minutos","🕒 Más de 1 hora (operación continua)","🤷 No sé, necesito asesoramiento"] }
            ],
            diagnose: function(a) {
                var critico = a.equipos_a_proteger && a.equipos_a_proteger.includes("Servidor");
                var largo   = a.autonomia_deseada  && a.autonomia_deseada.includes("1 hora");
                var picos   = a.motivo_ups          && a.motivo_ups.includes("Picos");
                var risk    = riskWarnings[a.motivo_ups] || "Los picos de tensión al restaurarse la energía son la principal causa de fuentes quemadas y discos dañados. Un UPS instalado hoy protege los equipos por años.";
                var tipo    = (critico||largo) ? "Online / Doble Conversión" : "Line Interactive (recomendado para pymes)";
                var vaMin   = critico ? "1500VA" : (a.equipos_a_proteger && a.equipos_a_proteger.includes("2-5 PCs")) ? "1000VA" : "650VA";
                return {
                    titulo:"Diagnóstico de UPS / Protección de Energía", icono:"🔋",
                    severidad: (critico||picos) ? "alta" : "media",
                    equipoLabel:  (a.equipos_a_proteger||"").replace(/[🖥️🗄️🔀]/gu,"").trim(),
                    sintomaLabel: (a.motivo_ups||"").replace(/[⚡💾🔇🆕]/gu,"").trim(),
                    duracionLabel:a.autonomia_deseada||"",
                    riskWarning: risk,
                    resumen: "Motivo: "+(a.motivo_ups||"").replace(/[⚡💾🔇🆕]/gu,"").trim()+". Equipos: "+(a.equipos_a_proteger||"No especificado")+". Autonomía: "+(a.autonomia_deseada||"No especificado")+".",
                    pasos:[
                        "🔋 **UPS recomendado:** "+tipo+" — capacidad mínima sugerida: "+vaMin+".",
                        critico ? "🗄️ Para servidores recomendamos UPS Online (doble conversión) con tiempo de conmutación cero." : picos ? "⚡ El tipo Line Interactive incluye regulador de tensión (AVR) que corrige picos sin gastar batería." : "✅ Un UPS Line Interactive cubre el 90% de los casos de pymes y hogares.",
                        "📊 Incluimos configuración del software de apagado automático para cierre limpio en cortes prolongados.",
                        "🔧 Instalamos, configuramos y probamos el UPS. Asesoramos sobre marca y modelo según carga real.",
                        "💡 Más info: soportecyclops.com.ar/blog/ups-proteccion-energia.html"
                    ],
                    servicio:"UPS y Protección de Energía"
                };
            }
        }
    };

    // ── RESPUESTAS RÁPIDAS ────────────────────────────────────────────────────
    var intelligentResponses = {
        'menu_diagnostico': {
            message: "🔍 **¿Con qué área necesitás ayuda?**\n\nElegí la categoría:",
            options: [
                { text:"💻 PC / Laptop / Software",         next:"iniciar_diag_pc" },
                { text:"📡 Internet / Redes / WiFi",        next:"iniciar_diag_redes" },
                { text:"📷 Cámaras de Seguridad (CCTV)",   next:"iniciar_diag_camaras" },
                { text:"🚨 Alarmas / Control de Acceso",    next:"iniciar_diag_alarmas" },
                { text:"🏠 Domótica / Automatización",      next:"iniciar_diag_domotica" },
                { text:"🛡️ Ciberseguridad",                next:"iniciar_diag_ciber" },
                { text:"🔋 UPS / Protección de Energía",   next:"iniciar_diag_ups" }
            ]
        },
        'consulta_urgente': {
            message: "🚨 **¿Tu problema es urgente?**\n\nOpciones para atención inmediata:",
            options: [
                { text:"📞 Llamar ahora",     action:"llamar_ahora" },
                { text:"💬 WhatsApp urgente", action:"whatsapp_urgente" }
            ]
        }
    };

    // ── APERTURA / CIERRE ─────────────────────────────────────────────────────
    chatbotToggle.addEventListener('click', function() {
        chatbotWindow.classList.toggle('active');
        if (notificationDot) notificationDot.classList.remove('active');
        if (conversationHistory.length === 0) {
            addMessage(
                "¡Hola! 👋 Soy el **Asistente Cyclops**.\n\nEstoy aquí para ayudarte con cualquier problema técnico o consulta sobre nuestros servicios.\n\n¿En qué puedo asistirte hoy?",
                'bot',
                [
                    { text:"🔍 Diagnóstico técnico guiado", next:"menu_diagnostico" },
                    { text:"💬 Consulta general",           action:"consulta_general" },
                    { text:"📞 Llamar ahora",               action:"llamar_ahora" }
                ]
            );
        }
    });
    chatbotClose.addEventListener('click', function() { chatbotWindow.classList.remove('active'); });

    // ── ENVÍO ─────────────────────────────────────────────────────────────────
    function sendMessage() {
        var msg = chatbotInput.value.trim();
        if (!msg) return;
        addMessage(msg, 'user');
        chatbotInput.value = '';
        setTimeout(function() { processUserInput(msg); }, 800);
    }

    function processUserInput(msg) {
        if (diagState.waitingForName) {
            diagState.answers.nombre  = msg;
            diagState.waitingForName  = false;
            diagState.waitingForEmail = true;
            addMessage("Perfecto, **" + msg + "**.\n\n¿A qué email te enviamos el informe? (Escribí \"no\" para omitirlo)", 'bot');
            return;
        }
        if (diagState.waitingForEmail) {
            var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg);
            diagState.answers.email   = (msg.toLowerCase() === "no" || !ok) ? "" : msg;
            diagState.waitingForEmail = false;
            procesarYEnviarDiagnostico();
            return;
        }
        processUserMessage(msg);
    }

    function processUserMessage(msg) {
        var m = msg.toLowerCase();

        if (m.includes('horario') || m.includes('atienden') || m.includes('sabado') || m.includes('sábado') || m.includes('domingo')) {
            addMessage("⏰ **Horarios de atención:**\n\n📅 Lunes a Viernes: 9:00 a 18:00 hs\n📅 Sábados: 9:00 a 13:00 hs\n📅 Domingos: Cerrado\n\n⚡ Para urgencias fuera de horario, contactanos por WhatsApp y evaluamos según agenda.", 'bot', [{text:"💬 Contactar por WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('precio') || m.includes('costo') || m.includes('cuanto') || m.includes('cuánto') || m.includes('cobran') || m.includes('presupuesto')) {
            addMessage("💰 **Los precios varían según el servicio:**\n\n✅ Consulta remota inicial **sin cargo**\n✅ Presupuesto detallado antes de empezar\n✅ Garantía de 15 días en software/formateos\n✅ Garantía de 30 días en mantenimiento físico\n✅ Garantía de 90 días en redes e instalaciones\n\nSin sorpresas — el precio se acuerda antes de tocar nada.", 'bot', [{text:"📅 Solicitar presupuesto", action:"agendar_consulta"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('zona') || m.includes('cobertura') || m.includes('donde') || m.includes('dónde') || m.includes('llegan')) {
            addMessage("📍 **Zona de cobertura:**\n\n✅ Ciudad Autónoma de Buenos Aires (CABA)\n✅ Gran Buenos Aires — Zona Norte, Sur y Oeste\n\n🚗 Para zonas alejadas, consultanos disponibilidad.", 'bot', [{text:"📞 Verificar mi zona", action:"llamar_ahora"}]);
            return;
        }
        if (m.includes('garantia') || m.includes('garantía')) {
            addMessage("🛡️ **Política de garantías:**\n\n💻 Software y formateos: **15 días**\n🔧 Mantenimiento físico: **30 días**\n📡 Redes e instalaciones: **90 días**\n\nSiempre te informamos la garantía aplicable antes de empezar. Si el problema reaparece dentro del período, revisamos sin cargo.", 'bot');
            return;
        }
        if (m.includes('factura') || m.includes('cuit') || m.includes('fiscal') || m.includes('monotributo')) {
            addMessage("🧾 **Facturación:**\n\nSí, emitimos comprobante fiscal. Consultanos el tipo de facturación disponible según tu situación impositiva.", 'bot', [{text:"💬 Consultar por WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('abono') || m.includes('mensual') || m.includes('mantenimiento preventivo') || m.includes('soporte mensual')) {
            addMessage("📋 **Abonos de soporte mensual:**\n\n✅ Soporte remoto ante incidentes\n✅ Visitas técnicas periódicas programadas\n✅ Mantenimiento preventivo de equipos y red\n✅ Backup automático configurado y monitoreado\n✅ Prioridad de atención ante urgencias\n\nEl precio se acuerda según la cantidad de equipos y la cobertura requerida.", 'bot', [{text:"💬 Consultar plan de abono", action:"whatsapp_abono"}]);
            return;
        }
        if (m.includes('ups') || m.includes('corte de luz') || m.includes('pico') || m.includes('tensión') || m.includes('bateria') || m.includes('batería')) {
            addMessage("🔋 **UPS y Protección de Energía**\n\nInstalamos y asesoramos sobre UPS para hogares, oficinas y servidores.\n\n¿Querés hacer un diagnóstico para recomendarte el equipo correcto?", 'bot', [{text:"🔋 Sí, diagnóstico UPS", next:"iniciar_diag_ups"}, {text:"💡 Leer guía sobre UPS", action:"link_blog_ups"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('virus') || m.includes('ransomware') || m.includes('hackeo') || m.includes('malware') || m.includes('antivirus') || m.includes('firewall') || m.includes('ciberseguridad')) {
            addMessage("🛡️ **Ciberseguridad**\n\nOfrecemos protección práctica para pymes y hogares: antivirus corporativo, red segura, backup y respuesta ante incidentes.\n\n¿Querés un diagnóstico de tu situación actual?", 'bot', [{text:"🛡️ Diagnóstico de seguridad", next:"iniciar_diag_ciber"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('blog') || m.includes('artículo') || m.includes('articulo') || m.includes('guía') || m.includes('guia') || m.includes('leer') || m.includes('aprender')) {
            addMessage("📚 **Artículos técnicos gratuitos:**\n\n📶 Por qué el WiFi no llega a todos los ambientes\n💾 6 señales de que tu disco está por fallar\n🔒 Qué hacer ante un ransomware\n🔧 Mantenimiento preventivo de PC\n🔋 UPS y protección de energía\n📷 Guía de cámaras de seguridad\n\nTodo en: **soportecyclops.com.ar/blog**", 'bot', [{text:"📚 Ver todos los artículos", action:"link_blog"}, {text:"💬 Consulta técnica", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('cámara') || m.includes('camara') || m.includes('cctv') || m.includes('vigilancia')) {
            addMessage("📷 **Cámaras de Seguridad / CCTV**\n\nInstalamos sistemas IP con acceso remoto desde el celular para hogares, locales y empresas.\n\n¿Querés hacer un diagnóstico?", 'bot', [{text:"📷 Diagnóstico CCTV", next:"iniciar_diag_camaras"}, {text:"💡 Guía de cámaras", action:"link_blog_camaras"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('wifi') || m.includes('wi-fi') || m.includes('internet lento') || m.includes('señal débil')) {
            addMessage("📶 **Problemas de WiFi / Red**\n\n¿Hacemos un diagnóstico rápido o preferís leer nuestro artículo con las 5 causas más comunes?", 'bot', [{text:"🔍 Diagnóstico de red", next:"iniciar_diag_redes"}, {text:"📖 Artículo sobre WiFi", action:"link_blog_wifi"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('página web') || m.includes('pagina web') || m.includes('sitio web') || m.includes('presencia web') || m.includes('paquete web') || m.includes('mi negocio en internet')) {
            addMessage("🌐 **Presencia Web para Pymes**\n\nArmamos tu sitio web, dominio, casillas de mail y te posicionamos en Google. Tenemos 3 paquetes: Arranque, Presencia e Integral.\n\n¿Te contactamos para contarte los detalles?", 'bot', [{text:"💬 Consultar paquetes web", action:"whatsapp_web"}]);
            return;
        }
        if (m.includes('urgente') || m.includes('urgencia') || m.includes('rapido') || m.includes('rápido') || m.includes('emergency')) {
            processFlow('consulta_urgente');
            return;
        }
        addMessage("💡 **¿Te gustaría que hagamos un diagnóstico guiado?**\n\nPuedo hacerte algunas preguntas y darte una evaluación técnica precisa.", 'bot', [
            {text:"🔍 Sí, diagnóstico guiado",    next:"menu_diagnostico"},
            {text:"💬 Prefiero hablar con alguien", action:"whatsapp_urgente"}
        ]);
    }

    // ── FLUJO DE DIAGNÓSTICO ──────────────────────────────────────────────────
    function startDiagFlow(flowKey) {
        var flow = diagFlows[flowKey];
        if (!flow) return;
        // diagNum se inicializa en null — se asigna al finalizar, desde el servidor
        diagState = { active:true, flow:flowKey, step:0, answers:{}, tempResult:null, waitingForName:false, waitingForEmail:false, diagNum:null };
        addMessage(flow.intro, 'bot');
        setTimeout(askDiagStep, 600);
    }

    function askDiagStep() {
        var flow = diagFlows[diagState.flow];
        if (!flow) return;
        if (diagState.step >= flow.steps.length) { finishDiag(); return; }
        var step = flow.steps[diagState.step];
        var opts = step.options.map(function(opt){ return { text:opt, next:"__diag__"+diagState.step+"__"+opt }; });
        addMessage(step.question, 'bot', opts);
    }

    function finishDiag() {
        var flow = diagFlows[diagState.flow];
        diagState.active = false;
        // NOTA v4.1: Se eliminó diagState.diagNum = generarDiagNum() que estaba aquí.
        // El número se genera en el servidor dentro de procesarYEnviarDiagnostico().
        Promise.resolve(flow.diagnose(diagState.answers)).then(function(result) {
            diagState.tempResult = result;
            var niveles = { critica:"🔴 Riesgo crítico", alta:"🟠 Riesgo elevado", media:"🟡 A tener en cuenta", baja:"🟢 Situación estable" };
            addMessage(
                "📋 **Evaluación técnica preliminar completada.**\n\n" + (niveles[result.severidad]||"🟡 A tener en cuenta") + "\n\n⚠️ **Nota técnica:** " + result.riskWarning + "\n\nTu diagnóstico está listo. ¿A nombre de quién querés que figure el informe?",
                'bot'
            );
            diagState.waitingForName = true;
        });
    }

    // ── PROCESAR Y ENVIAR DIAGNÓSTICO (v4.1 — async) ─────────────────────────
    // Flujo:
    //   1. Arma payload sin diagNum
    //   2. Llama a Apps Script → recibe diagNum confirmado (ej: DIAG-190326-0001)
    //   3. Asigna diagNum al payload y al estado
    //   4. Guarda en sessionStorage
    //   5. Muestra el resultado al usuario con el número real
    async function procesarYEnviarDiagnostico() {
        var result  = diagState.tempResult;
        var nombre  = diagState.answers.nombre || "Cliente";
        var email   = diagState.answers.email  || "";

        addMessage("⏳ Generando tu informe técnico...", 'bot');

        // Payload sin diagNum — el servidor lo genera y retorna
        var payload = {
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

        // Enviar a Apps Script y obtener el número confirmado
        var diagNum = await enviarYObtenerDiagNum(payload);

        // Asignar número confirmado a todos los registros
        payload.diagNum   = diagNum;
        diagState.diagNum = diagNum;

        // Guardar localmente con el número real
        guardarLocalDiag(payload);

        // Mostrar al usuario
        mostrarResultadoFinal(diagNum, nombre, result);
    }

    // ── ENVIAR A APPS SCRIPT Y OBTENER diagNum ────────────────────────────────
    // Si el servidor responde correctamente, usa el número secuencial.
    // Si falla (red, timeout, config), usa fallbackLocal() con mismo formato.
    async function enviarYObtenerDiagNum(payload) {
        // Fallback: mismo formato DIAG-DDMMAA-NNNN pero con 4 dígitos aleatorios
        function fallbackLocal() {
            var hoy  = new Date();
            var dd   = String(hoy.getDate()).padStart(2, "0");
            var mm   = String(hoy.getMonth() + 1).padStart(2, "0");
            var aa   = String(hoy.getFullYear()).slice(-2);
            var rand = String(Math.floor(Math.random() * 8999) + 1000); // 1000-9999
            console.warn("⚠️ Usando diagNum de fallback local:", "DIAG-" + dd + mm + aa + "-" + rand);
            return "DIAG-" + dd + mm + aa + "-" + rand;
        }

        if (!CYCLOPS_CONFIG.appsScriptUrl || CYCLOPS_CONFIG.appsScriptUrl.includes("TU_ID")) {
            console.warn("⚠️ appsScriptUrl no configurado — usando fallback local");
            return fallbackLocal();
        }

        try {
            var fd = new FormData();
            fd.append('payload', JSON.stringify(payload));

            // Sin mode:"no-cors" para poder leer la respuesta JSON.
            // Requiere que el script esté publicado con acceso "Cualquier persona".
            var response = await fetch(CYCLOPS_CONFIG.appsScriptUrl, {
                method: "POST",
                body:   fd
            });

            if (!response.ok) {
                console.warn("⚠️ Respuesta HTTP no OK:", response.status);
                return fallbackLocal();
            }

            var data = await response.json();

            if (data && data.ok && data.diagNum) {
                console.log("✅ diagNum recibido del servidor:", data.diagNum);
                return data.diagNum;
            } else {
                console.warn("⚠️ Apps Script respondió pero sin diagNum:", data);
                return fallbackLocal();
            }

        } catch (err) {
            console.warn("⚠️ Error al contactar Apps Script — usando fallback:", err.message);
            return fallbackLocal();
        }
    }

    function mostrarResultadoFinal(diagNum, nombre, result) {
        var report = "✅ **" + result.icono + " " + result.titulo + "**\n\n📌 **Nº de Diagnóstico: " + diagNum + "**\n\n" + result.resumen + "\n\n**Evaluación técnica:**\n";
        result.pasos.forEach(function(paso, i){ report += (i+1) + ". " + paso + "\n"; });
        var waMsg = encodeURIComponent("Hola! Completé el diagnóstico online.\nNúmero: *" + diagNum + "*\nNombre: " + nombre + "\nServicio: " + result.servicio + "\nProblema: " + result.sintomaLabel + "\n¿Me pueden contactar?");
        addMessage(report, 'bot', [
            { text:"💬 Enviar diagnóstico al técnico", action:"__whatsapp_diag__" + waMsg },
            { text:"🔍 Hacer otro diagnóstico",        next:"menu_diagnostico" }
        ]);
    }

    function guardarLocalDiag(payload) {
        try {
            var h = JSON.parse(sessionStorage.getItem('cyclopsDiagnosticos') || '[]');
            h.push(payload);
            sessionStorage.setItem('cyclopsDiagnosticos', JSON.stringify(h));
        } catch(e) { /* silencioso */ }
    }

    // ── RENDERIZADO ───────────────────────────────────────────────────────────
    function addMessage(text, sender, options) {
        options = options || [];
        var md = { text:text, sender:sender, options:options, timestamp:Date.now() };
        conversationHistory.push(md);
        renderMessage(md);
        saveConversation();
    }

    function renderMessage(md) {
        var div = document.createElement('div');
        div.classList.add('message', md.sender);
        var content = document.createElement('div');
        content.classList.add('message-content');
        var textEl = document.createElement('div');
        textEl.innerHTML = md.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        content.appendChild(textEl);
        if (md.options && md.options.length > 0) {
            var optsDiv = document.createElement('div');
            optsDiv.classList.add('service-options');
            md.options.forEach(function(opt) {
                var btn = document.createElement('button');
                btn.classList.add('service-option');
                btn.textContent = opt.text;
                if (opt.action)     btn.addEventListener('click', function(){ handleAction(opt.action); });
                else if (opt.next)  btn.addEventListener('click', function(){ addMessage(opt.text,'user'); setTimeout(function(){ processFlow(opt.next); }, 800); });
                optsDiv.appendChild(btn);
            });
            content.appendChild(optsDiv);
        }
        div.appendChild(content);
        chatbotMessages.appendChild(div);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // ── PROCESADOR DE FLOWS ───────────────────────────────────────────────────
    function processFlow(flowKey) {
        if (flowKey === 'iniciar_diag_pc')       { startDiagFlow('pc_diagnostico');       return; }
        if (flowKey === 'iniciar_diag_redes')     { startDiagFlow('redes_diagnostico');    return; }
        if (flowKey === 'iniciar_diag_camaras')   { startDiagFlow('camaras_diagnostico');  return; }
        if (flowKey === 'iniciar_diag_alarmas')   { startDiagFlow('alarmas_diagnostico');  return; }
        if (flowKey === 'iniciar_diag_domotica')  { startDiagFlow('domotica_diagnostico'); return; }
        if (flowKey === 'iniciar_diag_ciber')     { startDiagFlow('ciber_diagnostico');    return; }
        if (flowKey === 'iniciar_diag_ups')       { startDiagFlow('ups_diagnostico');      return; }

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
                { text:"📅 Coordinar consulta", action:"agendar_consulta" },
                { text:"🔍 Diagnóstico guiado",  next:"menu_diagnostico" }
            ]);
        }
    }

    // ── MANEJADOR DE ACCIONES ─────────────────────────────────────────────────
    function handleAction(action) {
        if (action.startsWith('__whatsapp_diag__')) {
            window.open("https://wa.me/" + CYCLOPS_CONFIG.whatsapp + "?text=" + action.replace('__whatsapp_diag__',''), '_blank');
            addMessage("💬 Abriendo WhatsApp con tu diagnóstico adjunto...\n\nNuestro técnico lo va a revisar antes de contactarte.", 'bot');
            return;
        }
        switch(action) {
            case 'llamar_ahora':
                window.open("tel:" + CYCLOPS_CONFIG.telefono.replace(/\s/g,''));
                addMessage("📞 **Conectándote por teléfono...**\n\nSi no funciona, marcá directo al: " + CYCLOPS_CONFIG.telefono, 'bot');
                break;
            case 'whatsapp_urgente':
                window.open("https://wa.me/" + CYCLOPS_CONFIG.whatsapp + "?text=" + encodeURIComponent('¡Hola! Necesito ayuda técnica urgente. ¿Me pueden asistir?'), '_blank');
                addMessage("💬 **¡Listo! Te redirijo a WhatsApp...**", 'bot');
                break;
            case 'whatsapp_abono':
                window.open("https://wa.me/" + CYCLOPS_CONFIG.whatsapp + "?text=" + encodeURIComponent('Hola, me interesa un plan de abono de soporte mensual. ¿Me pueden dar más información?'), '_blank');
                addMessage("💬 Abriendo WhatsApp para consultar planes de abono...", 'bot');
                break;
            case 'whatsapp_web':
                window.open("https://wa.me/" + CYCLOPS_CONFIG.whatsapp + "?text=" + encodeURIComponent('Hola, me interesa el servicio de presencia web para mi negocio. ¿Me pueden contar los paquetes disponibles?'), '_blank');
                addMessage("💬 Abriendo WhatsApp para consultar paquetes web...", 'bot');
                break;
            case 'agendar_consulta':
                addMessage("📅 **Para agendar una consulta:**\n\nContactanos al " + CYCLOPS_CONFIG.telefono + " o por WhatsApp.\n\n✅ La consulta remota inicial es **sin cargo**.\n✅ Si requiere visita, acordamos el presupuesto antes de la misma.", 'bot', [{text:"💬 Agendar por WhatsApp", action:"whatsapp_urgente"}]);
                break;
            case 'consulta_general':
                addMessage("💬 **¿En qué puedo ayudarte?**\n\nElegí una opción o escribime tu consulta:", 'bot', [
                    { text:"⏰ Horarios de atención",  action:"info_horarios" },
                    { text:"💰 Precios y garantías",   action:"info_precios" },
                    { text:"📍 Zona de cobertura",     action:"info_zona" },
                    { text:"📚 Artículos del blog",    action:"link_blog" }
                ]);
                break;
            case 'info_horarios':
                addMessage("⏰ **Horarios:**\n\n📅 Lunes a Viernes: 9:00 a 18:00 hs\n📅 Sábados: 9:00 a 13:00 hs\n📅 Domingos: Cerrado\n\n⚡ Urgencias fuera de horario: WhatsApp.", 'bot', [{text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
                break;
            case 'info_precios':
                addMessage("💰 **Precios y garantías:**\n\n✅ Consulta remota inicial **sin cargo**\n✅ Presupuesto detallado antes de empezar\n✅ Garantía de 15 días en software/formateos\n✅ Garantía de 30 días en mantenimiento físico\n✅ Garantía de 90 días en redes e instalaciones\n\nSin sorpresas — acordamos todo antes de tocar nada.", 'bot', [{text:"💬 Solicitar presupuesto", action:"whatsapp_urgente"}]);
                break;
            case 'info_zona':
                addMessage("📍 **Zona de cobertura:**\n\n✅ Ciudad Autónoma de Buenos Aires (CABA)\n✅ Gran Buenos Aires — Zona Norte, Sur y Oeste\n\n🚗 Zonas alejadas: consultamos disponibilidad.", 'bot', [{text:"📞 Verificar mi zona", action:"llamar_ahora"}]);
                break;
            case 'link_blog':
                window.open("https://www.soportecyclops.com.ar/blog/index.html", '_blank');
                addMessage("📚 Abriendo el blog técnico en una nueva pestaña...", 'bot');
                break;
            case 'link_blog_wifi':
                window.open("https://www.soportecyclops.com.ar/blog/wifi-no-llega.html", '_blank');
                addMessage("📶 Abriendo el artículo sobre WiFi...", 'bot');
                break;
            case 'link_blog_ups':
                window.open("https://www.soportecyclops.com.ar/blog/ups-proteccion-energia.html", '_blank');
                addMessage("🔋 Abriendo la guía de UPS...", 'bot');
                break;
            case 'link_blog_camaras':
                window.open("https://www.soportecyclops.com.ar/blog/camaras-seguridad-guia.html", '_blank');
                addMessage("📷 Abriendo la guía de cámaras...", 'bot');
                break;
            default:
                addMessage("💡 Contactanos directo: " + CYCLOPS_CONFIG.telefono, 'bot', [{text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
        }
    }

    // ── PERSISTENCIA ──────────────────────────────────────────────────────────
    function saveConversation() {
        try { localStorage.setItem('cyclopsChatbotConversation', JSON.stringify(conversationHistory)); } catch(e) {}
    }

    function loadConversation() {
        try {
            var saved = localStorage.getItem('cyclopsChatbotConversation');
            if (saved) {
                var parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    conversationHistory = parsed;
                    chatbotMessages.innerHTML = '';
                    conversationHistory.forEach(function(msg){ renderMessage(msg); });
                } else {
                    localStorage.removeItem('cyclopsChatbotConversation');
                }
            }
        } catch(e) {
            conversationHistory = [];
            try { localStorage.removeItem('cyclopsChatbotConversation'); } catch(e2) {}
        }
    }

    // ── EVENTOS ───────────────────────────────────────────────────────────────
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', function(e){ if(e.key==='Enter') sendMessage(); });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.quick-question')) return;
        var button   = e.target.closest('.quick-question');
        var action   = button.getAttribute('data-action');
        var question = button.getAttribute('data-question');
        if (action === 'pc_problemas') {
            chatbotWindow.classList.add('active');
            addMessage("🔍 Quiero hacer un diagnóstico técnico guiado", 'user');
            setTimeout(function(){ processFlow('menu_diagnostico'); }, 800);
        } else if (question) {
            chatbotWindow.classList.add('active');
            addMessage(button.textContent.trim(), 'user');
            setTimeout(function(){ processUserMessage(button.textContent.trim()); }, 800);
        }
    });

    document.querySelectorAll('.suggestion-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            addMessage(btn.textContent.trim(), 'user');
            setTimeout(function(){ processUserMessage(btn.textContent.trim()); }, 800);
        });
    });

    loadConversation();
    console.log("✅ Chatbot Cyclops v4.1 inicializado correctamente");
}
