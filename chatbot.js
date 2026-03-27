// ===========================
// CHATBOT INTELIGENTE CON DIAGNÓSTICO GUIADO
// Soporte Cyclops — v5.0
// ===========================
// CHANGELOG v5.0:
// [NEW] 5 categorías nuevas: Impresoras/Periféricos, Servidores/NAS, Telefonía IP,
//       Energía Eléctrica / Instalaciones, Soporte Remoto / Software Empresarial
// [NEW] Diagnósticos ampliados en PC: subcategoría software vs. hardware
// [NEW] Diagnósticos ampliados en Redes: agrega latencia, VPN, cobertura móvil
// [NEW] Diagnósticos ampliados en CCTV: agrega grabación, imagen, noche, almacenamiento
// [NEW] Diagnósticos ampliados en Alarmas: agrega falsas alarmas, señal GSM
// [NEW] Diagnósticos ampliados en Ciberseguridad: agrega phishing, auditoría, contraseñas
// [NEW] Diagnósticos ampliados en UPS: agrega reemplazo de batería, cálculo de carga
// [NEW] "causasProbables" — análisis pre-diagnóstico con hipótesis técnicas
// [NEW] "contexto_uso" en PC (laboral/personal/gaming/servidor)
// [NEW] "frecuencia_uso" pregunta de contexto real en varios flows
// [NEW] riskWarnings ampliados para todos los síntomas nuevos
// [NEW] processUserMessage: keywords nuevas (impresora, servidor, VOIP, cableado, etc.)
// [NEW] intelligentResponses: menú expandido a 12 categorías
// [NEW] Respuestas de texto libre mejoradas con causas y checklist preventivo
// INALTERADO: CYCLOPS_CONFIG, appsScriptUrl, whatsapp, telefono, email, sitio, logoUrl
// INALTERADO: enviarYObtenerDiagNum, fallbackLocal, generarPDFDiagnostico
// INALTERADO: guardarLocalDiag, mostrarResultadoFinal, renderMessage, saveConversation
// ===========================

const CYCLOPS_CONFIG = {
    whatsapp:      "5491166804450",
    telefono:      "+54 9 11 6680-4450",
    email:         "contacto@soportecyclops.com.ar",
    sitio:         "www.soportecyclops.com.ar",
    logoUrl:       "https://www.soportecyclops.com.ar/public/images/logo-icon.png",
    appsScriptUrl: "https://script.google.com/macros/s/AKfycbwjVWP25ZqWa3C0IuQ6rgHYxv1r4iqM5N5916i9gLYuKFEEC3nDyMh74RdG5T8Iv4_w/exec"
};

// ── PRECIOS DOMÓTICA EN USD ──────────────────────────────────────────────────
const DOMOTICA_PRECIOS = {
    "Iluminación inteligente":           { min: 150,  max: 400  },
    "Climatización / Aire acondicionado":{ min: 200,  max: 500  },
    "Enchufes y electrodomésticos":      { min: 100,  max: 300  },
    "Sistema completo (todo integrado)": { min: 600,  max: 1800 }
};

// ── CACHÉ DE COTIZACIÓN DÓLAR BNA ────────────────────────────────────────────
var dolarCache = { valor: null, timestamp: 0 };
var DOLAR_TTL  = 15 * 60 * 1000;

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
    console.log("🚀 Inicializando Chatbot Cyclops v5.0...");
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

    var diagState = { active:false, flow:null, step:0, answers:{}, tempResult:null, waitingForName:false, waitingForEmail:false, diagNum:null };
    var conversationHistory = [];

    // ══════════════════════════════════════════════════════════════
    // RISK WARNINGS — ampliados v5.0
    // ══════════════════════════════════════════════════════════════
    var riskWarnings = {
        // PC — síntomas originales mejorados
        "⚡ No enciende o no arranca":
            "Puede deberse a falla en fuente de alimentación, placa madre o RAM. Forzar encendidos repetidos puede agravar el daño. El diagnóstico temprano evita costos mayores de reparación.",
        "🔥 Se sobrecalienta o apaga solo":
            "El calor excesivo es el principal enemigo de los componentes. Causas típicas: acumulación de polvo en ventiladores, pasta térmica seca en el procesador, o ventilador de CPU defectuoso. Una limpieza preventiva cuesta 10 veces menos que reemplazar un procesador quemado.",
        "🐌 Va muy lento o se traba":
            "La lentitud puede originarse en disco con sectores dañados, RAM insuficiente, infección de malware silencioso o exceso de programas en inicio. Ignorarlo degrada el disco progresivamente.",
        "💥 Pantalla negra o sin imagen":
            "Causas frecuentes: RAM desajustada, GPU con falla, cable de pantalla roto en notebooks, o BIOS corrupto. Apagar y encender sin diagnóstico puede empeorar fallas intermitentes.",
        "🦠 Sospecho de virus o malware":
            "El malware moderno opera de forma sigilosa, extrayendo datos o cifrando archivos en segundo plano. Cuanto más tiempo pase activo, más daño hace. Algunos tipos instalan puertas traseras permanentes.",
        "💾 Perdí archivos o datos importantes":
            "Cada escritura en el disco después de una pérdida de datos reduce las chances de recuperación. No instalar nada, no formatear, y traer el equipo lo antes posible maximiza las posibilidades de recuperar la información.",
        "🔊 Hace ruidos extraños (clicks o raspados)":
            "Clicks y raspados en disco mecánico (HDD) son señal de falla inminente de los cabezales de lectura. El disco puede morir en cualquier momento. Hacer backup urgente es la prioridad #1 antes que cualquier reparación.",
        "🖥️ Pantalla con rayas, parpadea o tiene píxeles muertos":
            "Puede ser falla en la GPU (placa de video), cable de pantalla dañado o pantalla en sí. En notebooks, doblar/cerrar la tapa con tensión en el cable lo daña progresivamente.",
        "⌨️ Teclado, mouse o periférico no funciona":
            "Puede ser problema de driver, puerto USB dañado, controlador USB muerto o el periférico mismo. A veces un simple reset de BIOS lo resuelve; otras veces requiere reemplazo de controlador.",
        "🔄 Se reinicia solo sin motivo":
            "Los reinicios espontáneos apuntan típicamente a sobrecalentamiento, falla en fuente de alimentación, RAM defectuosa o driver incompatible. Es un síntoma que escala rápido si no se trata.",
        "🔋 La batería no carga o dura muy poco":
            "Las baterías de notebook pierden capacidad con ciclos de carga. Una batería hinchada puede dañar la estructura interna del equipo y representa riesgo físico real.",
        // Redes — ampliados
        "🚫 Sin internet en absoluto":
            "La pérdida total de conectividad puede deberse al modem/router del proveedor, cableado interno o configuración del equipo. Cada hora sin red en un entorno laboral tiene un costo operativo concreto.",
        "🐌 Conexión lenta o inestable":
            "La inestabilidad suele originarse en interferencias de canal WiFi, router saturado, cable de red degradado o problema del ISP. Un canal WiFi congestionado puede reducir la velocidad al 20% de la contratada.",
        "📶 WiFi con mala cobertura":
            "Las paredes de hormigón, losas y distancia física atenúan la señal. Un solo router doméstico no puede cubrir departamentos grandes o casas de dos pisos sin puntos de acceso adicionales.",
        "🔗 No conecta a la red interna":
            "Fallos en la red interna (sin internet pero sí hay red local) apuntan a configuración de VLAN, switch defectuoso o conflicto de IPs. En entornos empresariales puede impedir el acceso a servidores y sistemas.",
        "🔒 Necesito configurar una red segura nueva":
            "Una red sin segmentación expone todos los dispositivos entre sí. Un solo equipo comprometido puede infectar toda la red. La configuración correcta desde el inicio es mucho más económica que una auditoría post-incidente.",
        "⏱️ Alta latencia / lag en videollamadas o gaming":
            "La latencia alta puede deberse a QoS no configurado, router saturado, ISP con problemas o interferencias. En videollamadas afecta la productividad; en sistemas de punto de venta puede interrumpir operaciones.",
        "🔐 VPN que no conecta o desconecta seguido":
            "Las VPNs mal configuradas exponen credenciales o crean un falso sentido de seguridad. Una VPN que cae constantemente interrumpe el acceso a sistemas remotos y puede dejar datos en tránsito sin cifrar.",
        // CCTV — ampliados
        "📷 Las cámaras no graban correctamente":
            "Grabación interrumpida puede deberse a disco lleno, DVR/NVR con falla, configuración incorrecta del motion detection o pérdida de señal. Una cámara que aparenta funcionar pero no graba es tan inútil como una cámara apagada.",
        "🌙 Imagen nocturna de mala calidad":
            "Los LEDs infrarrojos tienen vida útil limitada. Una cámara sin visión nocturna efectiva deja ciegos los momentos de mayor riesgo.",
        "💾 El disco del DVR/NVR está lleno o falla":
            "Un disco lleno detiene la grabación sin aviso. Los discos de DVR trabajan bajo escritura constante y tienen mayor tasa de falla que los de PC. El reemplazo preventivo es clave.",
        // Ciberseguridad — ampliados
        "🦠 Virus / ransomware activo":
            "ACCIÓN INMEDIATA: Desconectá el equipo de la red (cable y WiFi) YA. No apagues el equipo todavía — algunos ransomwares guardan claves de descifrado en RAM. Contactanos urgente para contención y recuperación.",
        "🔓 Creo que me hackearon":
            "Una intrusión confirmada requiere auditoría completa de accesos, cambio de todas las credenciales desde un dispositivo limpio, y revisión de qué información pudo haberse comprometido.",
        "📧 Recibí un email sospechoso o hice click en un link":
            "El phishing es el vector de entrada #1 del ransomware. Si se hizo click en un link malicioso, el malware puede estar instalándose silenciosamente. La acción rápida puede evitar el cifrado de archivos.",
        "🔑 Contraseñas débiles o reutilizadas en la empresa":
            "El 81% de los accesos no autorizados a empresas se deben a contraseñas comprometidas. Una sola contraseña débil en una cuenta con acceso a sistemas críticos es suficiente para una brecha.",
        // UPS — ampliados
        "⚡ Picos de tensión / cortes frecuentes":
            "Los picos de tensión al restaurarse la energía son la principal causa de fuentes quemadas y discos dañados. Un UPS habría prevenido este problema en el 90% de los casos.",
        "🔇 El UPS actual ya no sostiene la carga":
            "Un UPS que no sostiene la carga puede indicar batería degradada (vida útil: 3-5 años) o subdimensionamiento original. Operar con un UPS en falla da una falsa sensación de protección.",
        "🔋 La batería del UPS no dura o está hinchada":
            "Las baterías de UPS tienen vida útil de 3 a 5 años. Una batería hinchada es peligrosa y debe reemplazarse urgente. El costo del reemplazo es mucho menor al de los equipos que protege.",
        // Impresoras / Periféricos
        "🖨️ La impresora no imprime o imprime mal":
            "Los atascos de papel repetidos dañan los rodillos internos. Los cartuchos de tinta que se dejan secar pueden tapar el cabezal de forma permanente. La limpieza periódica extiende significativamente la vida útil.",
        "📠 El escáner o multifunción no es detectado":
            "Suele deberse a driver desactualizado, puerto USB dañado o conflicto con Windows Update. En entornos de trabajo, un escáner fuera de servicio puede paralizar procesos documentales.",
        // Servidores / NAS
        "🗄️ El servidor está lento o tiene alta carga":
            "Un servidor con alta carga puede afectar a todos los usuarios simultáneamente. Las causas van desde procesos en segundo plano, falla de RAM, disco al límite de capacidad o ataque en curso.",
        "💿 Un disco del RAID falló o está degradado":
            "Un RAID degradado sigue funcionando pero sin redundancia. Si falla un segundo disco antes de la reconstrucción, la pérdida de datos es total. La reconstrucción urgente es crítica.",
        "🌡️ El servidor se sobrecalienta":
            "Los servidores en espacios sin ventilación adecuada tienen una vida útil notablemente reducida. El sobrecalentamiento puede causar corrupción de datos además de daño físico.",
        // Telefonía IP
        "📞 El teléfono IP no tiene audio o corta":
            "Los problemas de audio en VoIP casi siempre se resuelven con QoS en el router. Sin priorización de tráfico, las videollamadas y el tráfico web compiten por el mismo ancho de banda.",
        // Energía eléctrica
        "⚠️ Hay problemas eléctricos en el local o la casa":
            "Instalaciones eléctricas deficientes son causa directa de equipos dañados, cortocircuitos y en casos extremos incendios. La puesta a tierra correcta es fundamental para la protección de equipos electrónicos.",
        // Soporte remoto / software
        "🖥️ Un programa de gestión o sistema no abre":
            "Los sistemas de gestión empresarial requieren configuración específica de permisos, dependencias de red y base de datos. Una actualización de Windows puede romper la compatibilidad de software legacy.",
        "☁️ No puedo acceder a la nube o al sistema remoto":
            "Los problemas de acceso a sistemas cloud pueden deberse a credenciales, VPN, firewall del cliente o problemas del proveedor. Identificar el origen rápido evita interrupciones prolongadas."
    };

    // ══════════════════════════════════════════════════════════════
    // CAUSAS PROBABLES — nuevo en v5.0
    // Función auxiliar que devuelve hipótesis técnicas según síntoma
    // ══════════════════════════════════════════════════════════════
    function getCausasProbables(sintoma, contexto) {
        var causas = {
            "⚡ No enciende o no arranca": [
                "Fuente de alimentación dañada (causa más frecuente, ~40% de los casos)",
                "RAM desajustada o con falla (equipo arranca y se apaga solo)",
                "Placa madre con condensadores quemados",
                "BIOS corrupta (equipo sin imagen pero con indicadores de actividad)"
            ],
            "🔥 Se sobrecalienta o apaga solo": [
                "Acumulación de polvo en disipador y ventiladores (causa #1)",
                "Pasta térmica seca o mal aplicada en el procesador",
                "Ventilador de CPU detenido o roto",
                "Thermal throttling por falla del sensor de temperatura"
            ],
            "🐌 Va muy lento o se traba": [
                "Disco HDD con sectores dañados o al límite de vida útil",
                "RAM insuficiente para los programas en uso actual",
                "Malware o minero de criptomonedas consumiendo recursos en silencio",
                "Windows con muchos programas de inicio o actualizaciones atascadas",
                "Disco SSD casi lleno (baja drásticamente la performance)"
            ],
            "💥 Pantalla negra o sin imagen": [
                "RAM desajustada — primer paso: retirar y reinsertar módulos",
                "GPU integrada o dedicada con falla",
                "Cable de pantalla interno roto (muy común en notebooks que se abren mucho)",
                "BIOS con configuración de salida de video incorrecta"
            ],
            "🦠 Sospecho de virus o malware": [
                "Adware que redirige búsquedas y muestra publicidad (el más común)",
                "Malware que usa el CPU/GPU para minar criptomonedas",
                "Keylogger que registra contraseñas y datos bancarios",
                "Ransomware en etapa temprana (aún no cifró archivos)"
            ],
            "💾 Perdí archivos o datos importantes": [
                "Borrado accidental sin papelera (recuperable con herramientas forenses)",
                "Formateo accidental de la unidad",
                "Falla física del disco — archivos parcialmente recuperables",
                "Ransomware que cifró los archivos"
            ],
            "🔊 Hace ruidos extraños (clicks o raspados)": [
                "Falla de cabezales de lectura del HDD (clicks = casi siempre esto)",
                "Cojinete del ventilador desgastado (raspado constante)",
                "Disco óptico intentando leer sin éxito (raro en equipos actuales)"
            ],
            "🔄 Se reinicia solo sin motivo": [
                "Sobrecalentamiento del procesador activando apagado de emergencia",
                "Fuente de alimentación inestable bajo carga",
                "RAM con errores de paridad",
                "Driver de dispositivo incompatible o corrupto"
            ],
            "🚫 Sin internet en absoluto": [
                "Modem/router del ISP colgado — reset simple suele resolverlo",
                "Cable de red físico dañado o desconectado",
                "Driver de placa de red desactualizado o corrupto",
                "Dirección IP en conflicto con otro dispositivo"
            ],
            "🐌 Conexión lenta o inestable": [
                "Canal WiFi saturado (muchos vecinos en el mismo canal 2.4GHz)",
                "Router sin reinicio hace meses — tabla de NAT llena",
                "Cable de red con par roto (funciona pero a 100Mbps en vez de 1Gbps)",
                "Problema puntual del ISP en la zona"
            ],
            "📶 WiFi con mala cobertura": [
                "Paredes de hormigón armado o losas que bloquean la señal",
                "Router colocado en posición no óptima (en rack, dentro de mueble)",
                "Interferencia de microondas o teléfonos inalámbricos en 2.4GHz",
                "Router de gama baja sin antenas suficientes para el espacio"
            ],
            "🖨️ La impresora no imprime o imprime mal": [
                "Cabezal de tinta obstruido por falta de uso (tinta seca)",
                "Driver desactualizado o en conflicto tras Windows Update",
                "Cola de impresión trabada — servicio de spooler detenido",
                "Tóner con sensor de nivel mal calibrado (imprime 'vacío' pero hay tóner)"
            ],
            "🗄️ El servidor está lento o tiene alta carga": [
                "Disco casi lleno — los sistemas con menos del 15% libre se degradan",
                "Proceso de antivirus escaneando en horario pico",
                "Memoria RAM insuficiente para la carga de usuarios concurrentes",
                "Fragmentación extrema en disco HDD de servidor legacy"
            ],
            "💿 Un disco del RAID falló o está degradado": [
                "Disco con sectores dañados sacado del array por el controlador RAID",
                "Falla física del disco por vida útil (discos de servidor: 3-5 años recomendados)",
                "Desconexión accidental durante operación (frecuente en hot-swap)",
                "RAID controller con falla de caché"
            ],
            "🦠 Virus / ransomware activo": [
                "Email con adjunto malicioso abierto recientemente",
                "Descarga de software pirata o keygen con troyano incluido",
                "Sitio web comprometido visitado con navegador desactualizado",
                "Dispositivo USB infectado conectado a la red"
            ],
            "📧 Recibí un email sospechoso o hice click en un link": [
                "Link de phishing que roba credenciales (el más común)",
                "Descarga automática de dropper que instala malware",
                "Macro maliciosa en documento Word/Excel adjunto",
                "Redirección a sitio falso de banco o servicio online"
            ]
        };
        return causas[sintoma] || null;
    }

    // ══════════════════════════════════════════════════════════════
    // FLOWS DE DIAGNÓSTICO — v5.0 (originales mejorados + 5 nuevos)
    // ══════════════════════════════════════════════════════════════

    var diagFlows = {

        // ─── PC / EQUIPO INFORMÁTICO — expandido ───────────────────
        "pc_diagnostico": {
            intro: "🔍 **Diagnóstico de equipo informático**\n\nTe voy a hacer 6 preguntas para darte una evaluación técnica precisa. Arrancamos.",
            steps: [
                {
                    key:"tipo_equipo",
                    question:"¿Qué tipo de equipo tiene el problema?",
                    options:["💻 Laptop / Notebook","🖥️ PC de escritorio","🖨️ Impresora / Periférico","📱 Tablet / Dispositivo móvil","🗄️ Servidor o NAS"]
                },
                {
                    key:"categoria_problema",
                    question:"¿El problema es más de hardware (físico) o de software (sistema, programas)?",
                    options:["🔩 Hardware — algo físico no funciona","💿 Software — Windows, programas o archivos","🤷 No sé / puede ser cualquiera de los dos","⚡ Es un problema eléctrico o de encendido"]
                },
                {
                    key:"sintoma",
                    question:"¿Cuál es el síntoma principal?",
                    options:[
                        "⚡ No enciende o no arranca",
                        "🔥 Se sobrecalienta o apaga solo",
                        "🐌 Va muy lento o se traba",
                        "💥 Pantalla negra o sin imagen",
                        "🖥️ Pantalla con rayas, parpadea o tiene píxeles muertos",
                        "🦠 Sospecho de virus o malware",
                        "💾 Perdí archivos o datos importantes",
                        "🔊 Hace ruidos extraños (clicks o raspados)",
                        "🔄 Se reinicia solo sin motivo",
                        "🔋 La batería no carga o dura muy poco",
                        "⌨️ Teclado, mouse o periférico no funciona"
                    ]
                },
                {
                    key:"contexto_uso",
                    question:"¿Para qué se usa principalmente este equipo?",
                    options:["💼 Trabajo / Laboral (archivos, correo, sistemas)","🎓 Estudio","🎮 Gaming / entretenimiento","🏠 Uso personal / hogar","🖥️ Servidor o uso intensivo 24/7"]
                },
                {
                    key:"duracion",
                    question:"¿Desde cuándo tiene este problema?",
                    options:["Hoy mismo (es nuevo)","Desde esta semana","Hace más de un mes","Es intermitente, va y viene"]
                },
                {
                    key:"ultimo_mantenimiento",
                    question:"¿Cuándo fue el último mantenimiento o limpieza técnica?",
                    options:["Nunca o no recuerdo","Hace más de 2 años","Hace 1-2 años","Hace menos de 1 año"]
                },
                {
                    key:"tiene_backup",
                    question:"¿Tenés backup actualizado de tus archivos importantes?",
                    options:["✅ Sí, tengo backup reciente","⚠️ Tengo algo pero desactualizado","❌ No tengo backup","🤷 No sé qué es un backup"]
                }
            ],
            diagnose: function(a) {
                var sinBackup   = ["❌ No tengo backup","🤷 No sé qué es un backup"].includes(a.tiene_backup);
                var sinMant     = ["Nunca o no recuerdo","Hace más de 2 años"].includes(a.ultimo_mantenimiento);
                var critico     = a.sintoma === "💾 Perdí archivos o datos importantes";
                var esServidor  = a.tipo_equipo && a.tipo_equipo.includes("Servidor");
                var esLaboral   = a.contexto_uso && a.contexto_uso.includes("Trabajo");
                var urgente     = critico || ["⚡ No enciende o no arranca","💥 Pantalla negra o sin imagen","🔊 Hace ruidos extraños (clicks o raspados)","🔄 Se reinicia solo sin motivo"].includes(a.sintoma);
                var risk        = riskWarnings[a.sintoma] || "Se recomienda revisión técnica para descartar fallas secundarias.";
                var sev         = critico ? "critica" : (urgente || (esLaboral && sinBackup)) ? "alta" : (sinBackup && a.sintoma === "🐌 Va muy lento o se traba") ? "alta" : "media";
                var extra       = [];
                var causas      = getCausasProbables(a.sintoma, a);

                if (sinBackup) extra.push("🔴 **Sin backup detectado** — Como parte del servicio configuramos backup automático en la nube o disco externo para que no vuelva a estar en riesgo.");
                if (sinMant)   extra.push("🧹 **Mantenimiento pendiente** — Incluimos limpieza de polvo y revisión de pasta térmica si corresponde al trabajo realizado.");
                if (esServidor) extra.push("🗄️ **Equipo servidor** — Prioridad de atención y resolución en horario que minimize el impacto en los usuarios.");
                if (esLaboral && urgente) extra.push("💼 **Equipo de trabajo** — Evaluamos solución de emergencia (préstamo de equipo o trabajo remoto) mientras se resuelve el problema.");

                var resumenCausas = "";
                if (causas && causas.length > 0) {
                    resumenCausas = "\n\n🔬 **Hipótesis técnicas más probables:**\n" + causas.slice(0,3).map(function(c){ return "• " + c; }).join("\n");
                }

                return {
                    titulo:"Diagnóstico de PC / Equipo Informático", icono:"💻", severidad:sev,
                    equipoLabel:  (a.tipo_equipo||"").replace(/[💻🖥️🖨️📱🗄️]/gu,"").trim(),
                    sintomaLabel: (a.sintoma||"").replace(/[⚡🔥🐌💥🖥️🦠💾🔊🔄🔋⌨️]/gu,"").trim(),
                    duracionLabel: a.duracion||"",
                    riskWarning: risk,
                    resumen: "Equipo: "+(a.tipo_equipo||"").replace(/[💻🖥️🖨️📱🗄️]/gu,"").trim()+". Categoría: "+(a.categoria_problema||"").replace(/[🔩💿🤷⚡]/gu,"").trim()+". Síntoma: "+(a.sintoma||"").replace(/[⚡🔥🐌💥🖥️🦠💾🔊🔄🔋⌨️]/gu,"").trim()+". Contexto: "+(a.contexto_uso||"").replace(/[💼🎓🎮🏠🖥️]/gu,"").trim()+". Tiempo: "+(a.duracion||"No especificado")+". Mantenimiento: "+(a.ultimo_mantenimiento||"No especificado")+". Backup: "+(a.tiene_backup||"No especificado")+"."+resumenCausas,
                    pasos: [
                        critico  ? "🚨 **Situación crítica** — No usar el equipo hasta la revisión. Cada uso reduce las chances de recuperar los datos."
                        : urgente ? "⚠️ **Atención prioritaria recomendada** — El problema puede agravarse con el uso normal."
                                  : "✅ El problema tiene solución y puede programarse con flexibilidad horaria.",
                        "🔍 Diagnóstico técnico completo antes de cualquier presupuesto, **sin cargo**.",
                        causas && causas.length > 0 ? "🔬 **Causas más frecuentes:** " + causas[0] + (causas[1] ? " También puede ser: " + causas[1] + "." : ".") : "🔬 Evaluaremos todas las causas posibles en el diagnóstico.",
                        (a.tipo_equipo && a.tipo_equipo.includes("Laptop")) ? "🏠 Para notebooks ofrecemos servicio a domicilio o retiro/entrega con seguimiento en CABA y GBA." : "🏠 Servicio a domicilio disponible en CABA y GBA.",
                        "⏱️ Tiempo estimado de resolución: 2 a 6 horas según la complejidad.",
                        ...extra
                    ],
                    servicio:"Soporte Informático"
                };
            }
        },

        // ─── IMPRESORAS Y PERIFÉRICOS — NUEVO ──────────────────────
        "impresoras_diagnostico": {
            intro: "🖨️ **Diagnóstico de impresoras y periféricos**\n\nUnas preguntas para evaluar el problema con precisión.",
            steps: [
                {
                    key:"tipo_dispositivo",
                    question:"¿Qué tipo de dispositivo tiene el problema?",
                    options:["🖨️ Impresora de tinta (inkjet)","🖨️ Impresora láser / tóner","📠 Multifunción (imprime, escanea, copia)","📡 Escáner standalone","🖱️ Mouse / teclado / periférico USB","🖥️ Monitor externo"]
                },
                {
                    key:"sintoma_periferico",
                    question:"¿Cuál es el problema?",
                    options:[
                        "🚫 No imprime nada — la PC no la detecta",
                        "⬜ Imprime en blanco o con colores incorrectos",
                        "📋 Imprime con rayas, manchas o borroso",
                        "🔁 Se atasca el papel constantemente",
                        "📠 El escáner no funciona o la imagen sale mal",
                        "🔌 El periférico no es reconocido por Windows",
                        "🖥️ El monitor no enciende o tiene imagen extraña"
                    ]
                },
                {
                    key:"entorno_impresora",
                    question:"¿En qué entorno está la impresora?",
                    options:["🏠 Uso hogareño (imprime ocasionalmente)","💼 Oficina pequeña (uso diario moderado)","🏢 Entorno empresarial (alto volumen de impresión)","🏪 Local comercial (tickets, etiquetas, facturas)"]
                },
                {
                    key:"ultimo_uso_correcto",
                    question:"¿Cuándo fue la última vez que funcionó bien?",
                    options:["Nunca funcionó (es nueva o recién instalada)","Funcionó hasta hace unos días","Hace semanas o meses que falla","Funciona a veces, a veces no"]
                }
            ],
            diagnose: function(a) {
                var esEmpresarial = a.entorno_impresora && (a.entorno_impresora.includes("empresarial") || a.entorno_impresora.includes("alto volumen"));
                var esNueva       = a.ultimo_uso_correcto && a.ultimo_uso_correcto.includes("Nunca funcionó");
                var esLaser       = a.tipo_dispositivo && a.tipo_dispositivo.includes("láser");
                var cabezal       = a.sintoma_periferico && (a.sintoma_periferico.includes("blanco") || a.sintoma_periferico.includes("rayas") || a.sintoma_periferico.includes("borroso"));
                var risk          = riskWarnings[a.sintoma_periferico && a.sintoma_periferico.includes("imprime") ? "🖨️ La impresora no imprime o imprime mal" : "📠 El escáner o multifunción no es detectado"] || "Un periférico fuera de servicio en entorno laboral puede paralizar flujos de trabajo completos.";

                var causas = getCausasProbables("🖨️ La impresora no imprime o imprime mal", a) || [
                    "Driver incompatible tras actualización de Windows",
                    "Cola de impresión trabada (servicio Spooler detenido)",
                    "Puerto USB dañado o cable defectuoso",
                    "Configuración incorrecta de impresora predeterminada"
                ];

                return {
                    titulo:"Diagnóstico de Impresora / Periférico", icono:"🖨️",
                    severidad: esEmpresarial ? "alta" : "media",
                    equipoLabel:  (a.tipo_dispositivo||"").replace(/[🖨️📠📡🖱️🖥️]/gu,"").trim(),
                    sintomaLabel: (a.sintoma_periferico||"").replace(/[🚫⬜📋🔁📠🔌🖥️]/gu,"").trim(),
                    duracionLabel:a.ultimo_uso_correcto||"",
                    riskWarning:  risk,
                    resumen: "Dispositivo: "+(a.tipo_dispositivo||"").replace(/[🖨️📠📡🖱️🖥️]/gu,"").trim()+". Problema: "+(a.sintoma_periferico||"").replace(/[🚫⬜📋🔁📠🔌🖥️]/gu,"").trim()+". Entorno: "+(a.entorno_impresora||"No especificado")+". Último uso correcto: "+(a.ultimo_uso_correcto||"No especificado")+".",
                    pasos: [
                        esNueva ? "📦 **Equipo nuevo sin funcionar** — Verificamos compatibilidad, driver oficial y configuración desde cero." : "🔍 Diagnóstico del historial de funcionamiento y últimos cambios en el sistema.",
                        cabezal && !esLaser ? "🖨️ **Posible cabezal obstruido** — Realizamos ciclo de limpieza profunda. Si el cabezal está dañado, evaluamos reemplazo vs. costo de equipo nuevo." : esLaser ? "🖨️ **Impresora láser** — Revisamos rodillo de fusión, tóner y tambor fotosensible." : "🔌 Revisamos driver, puerto USB, configuración del servicio de impresión y conectividad.",
                        "🔬 **Causas más frecuentes en este caso:** " + causas[0] + ". También puede ser: " + causas[1] + ".",
                        esEmpresarial ? "🏢 **Entorno de alto volumen** — Evaluamos plan de mantenimiento preventivo para evitar paradas de producción." : "💡 Asesoramos sobre mantenimiento preventivo para extender la vida útil del equipo.",
                        "🏠 Servicio a domicilio o retiro del equipo para taller. Diagnóstico sin cargo."
                    ],
                    servicio:"Soporte Informático — Periféricos"
                };
            }
        },

        // ─── SERVIDORES Y NAS — NUEVO ──────────────────────────────
        "servidores_diagnostico": {
            intro: "🗄️ **Diagnóstico de servidores y NAS**\n\nEste tipo de equipos requiere atención prioritaria. Unas preguntas para evaluar la situación.",
            steps: [
                {
                    key:"tipo_servidor",
                    question:"¿Qué tipo de equipo es?",
                    options:["🗄️ Servidor físico (rack o torre)","💻 Servidor virtual / VM","💾 NAS (almacenamiento en red)","🖥️ PC que actúa como servidor","☁️ Servidor en la nube (AWS, Google, Azure)"]
                },
                {
                    key:"problema_servidor",
                    question:"¿Cuál es el problema principal?",
                    options:[
                        "🐌 El servidor está lento o con alta carga",
                        "💿 Un disco del RAID falló o está degradado",
                        "🌡️ El servidor se sobrecalienta",
                        "🚫 No enciende o no responde",
                        "🔗 No es accesible desde la red",
                        "💾 Hay errores en la base de datos o en el sistema de archivos",
                        "🔄 Se reinicia o cuelga periódicamente",
                        "📊 Necesito ampliar capacidad de almacenamiento"
                    ]
                },
                {
                    key:"impacto_usuarios",
                    question:"¿Cuántos usuarios o servicios están afectados?",
                    options:["Solo el administrador puede acceder","Algunos usuarios afectados (< 5)","Varios usuarios afectados (5-20)","Toda la empresa sin servicio","Servicio público o crítico caído"]
                },
                {
                    key:"tiene_redundancia",
                    question:"¿Hay backup reciente o sistema redundante?",
                    options:["✅ Backup automático al día (probado)","⚠️ Backup manual, no se sabe si está actualizado","❌ No hay backup configurado","🔄 Hay redundancia pero también está afectada"]
                }
            ],
            diagnose: function(a) {
                var sinBackup    = ["❌ No hay backup configurado","⚠️ Backup manual, no se sabe si está actualizado"].includes(a.tiene_redundancia);
                var totalmenteDown = a.impacto_usuarios && (a.impacto_usuarios.includes("Toda la empresa") || a.impacto_usuarios.includes("crítico caído"));
                var raidFalla    = a.problema_servidor && a.problema_servidor.includes("RAID");
                var sev          = (totalmenteDown || raidFalla && sinBackup) ? "critica" : (raidFalla || (totalmenteDown)) ? "alta" : "media";
                var risk         = riskWarnings[a.problema_servidor && a.problema_servidor.includes("RAID") ? "💿 Un disco del RAID falló o está degradado" : a.problema_servidor && a.problema_servidor.includes("lento") ? "🗄️ El servidor está lento o tiene alta carga" : "🌡️ El servidor se sobrecalienta"] || "Un servidor fuera de servicio impacta en toda la organización. La atención debe ser inmediata.";

                var causas = getCausasProbables(a.problema_servidor && a.problema_servidor.includes("RAID") ? "💿 Un disco del RAID falló o está degradado" : "🗄️ El servidor está lento o tiene alta carga", a) || [
                    "Disco con sectores dañados detectado por el controlador RAID",
                    "RAM insuficiente para la carga actual de usuarios"
                ];
                var extra = [];
                if (sinBackup && raidFalla) extra.push("🔴 **CRÍTICO — Sin backup + RAID degradado**: Si falla otro disco antes de la reconstrucción, la pérdida de datos es total e irrecuperable. Intervención urgente.");
                if (sinBackup) extra.push("🔴 **Sin backup detectado** — La primera acción es asegurar un backup de emergencia antes de cualquier intervención.");

                return {
                    titulo:"Diagnóstico de Servidor / NAS", icono:"🗄️", severidad:sev,
                    equipoLabel:  (a.tipo_servidor||"").replace(/[🗄️💻💾🖥️☁️]/gu,"").trim(),
                    sintomaLabel: (a.problema_servidor||"").replace(/[🐌💿🌡️🚫🔗💾🔄📊]/gu,"").trim(),
                    duracionLabel:a.impacto_usuarios||"",
                    riskWarning:  risk,
                    resumen: "Tipo: "+(a.tipo_servidor||"").replace(/[🗄️💻💾🖥️☁️]/gu,"").trim()+". Problema: "+(a.problema_servidor||"").replace(/[🐌💿🌡️🚫🔗💾🔄📊]/gu,"").trim()+". Impacto: "+(a.impacto_usuarios||"No especificado")+". Backup: "+(a.tiene_redundancia||"No especificado")+".",
                    pasos: [
                        totalmenteDown ? "🚨 **Servicio caído — atención urgente**. Coordinamos respuesta inmediata." : raidFalla ? "⚠️ **RAID degradado** — Prioridad alta. Reconstrucción antes de que falle otro disco." : "🔍 Diagnóstico remoto inicial para evaluar el estado del sistema.",
                        "🔬 **Causas más probables:** " + causas[0] + (causas[1] ? ". También evaluamos: " + causas[1] + "." : "."),
                        raidFalla ? "💿 Identificamos el disco fallido, evaluamos la integridad del array y planificamos reemplazo con mínimo tiempo de inactividad." : "📊 Revisamos logs del sistema, uso de CPU/RAM/disco y procesos activos para identificar el cuello de botella.",
                        "🔐 Intervención con acceso remoto o visita técnica a datacenter/sala de servidores según corresponda.",
                        ...extra
                    ],
                    servicio:"Servidores y NAS"
                };
            }
        },

        // ─── REDES — expandido ─────────────────────────────────────
        "redes_diagnostico": {
            intro: "📡 **Diagnóstico de redes y conectividad**\n\nUnas preguntas para entender tu situación con exactitud.",
            steps: [
                {
                    key:"problema_red",
                    question:"¿Cuál es el problema principal?",
                    options:[
                        "🚫 Sin internet en absoluto",
                        "🐌 Conexión lenta o inestable",
                        "📶 WiFi con mala cobertura o se corta solo",
                        "⏱️ Alta latencia / lag en videollamadas o gaming",
                        "🔗 No conecta a la red interna (pero internet sí funciona)",
                        "🔐 VPN que no conecta o desconecta seguido",
                        "🔒 Necesito configurar una red segura nueva",
                        "📡 Necesito extender la red a otra área o piso"
                    ]
                },
                {
                    key:"tipo_instalacion",
                    question:"¿Qué tipo de instalación es?",
                    options:["🏠 Hogar / Departamento","🏢 Oficina pequeña (hasta 10 equipos)","🏗️ Empresa o local (más de 10 equipos)","🏪 Local comercial con POS / punto de venta","🏭 Depósito / Planta industrial"]
                },
                {
                    key:"tipo_conexion",
                    question:"¿Cómo se conecta principalmente a internet?",
                    options:["📶 WiFi","🔌 Cable de red (Ethernet)","🔀 Mixto — algunos por cable, otros por WiFi","📡 Fibra óptica instalada recientemente"]
                },
                {
                    key:"equipos_afectados",
                    question:"¿Cuántos equipos están afectados?",
                    options:["Solo 1 dispositivo","Entre 2 y 5 dispositivos","Toda la red / todos los dispositivos","No lo sé aún"]
                }
            ],
            diagnose: function(a) {
                var empresarial  = ["🏗️ Empresa o local (más de 10 equipos)","🏢 Oficina pequeña (hasta 10 equipos)","🏪 Local comercial con POS / punto de venta","🏭 Depósito / Planta industrial"].includes(a.tipo_instalacion);
                var total        = a.equipos_afectados === "Toda la red / todos los dispositivos";
                var wifi         = a.problema_red && (a.problema_red.includes("WiFi") || a.tipo_conexion === "📶 WiFi");
                var latencia     = a.problema_red && a.problema_red.includes("latencia");
                var vpn          = a.problema_red && a.problema_red.includes("VPN");
                var segura       = a.problema_red && a.problema_red.includes("segura");
                var posSinRed    = a.tipo_instalacion && a.tipo_instalacion.includes("POS");
                var risk         = riskWarnings[a.problema_red] || "Una red con problemas intermitentes puede afectar la productividad, la seguridad de los datos y el acceso a sistemas críticos.";

                var causas = getCausasProbables(a.problema_red, a) || [
                    "Router sin reinicio acumulando errores de tabla ARP",
                    "Interferencia de canal en banda 2.4GHz por densidad de redes vecinas"
                ];

                var sev = (total && empresarial) || posSinRed ? "alta" : total ? "media" : empresarial ? "media" : "baja";

                return {
                    titulo:"Diagnóstico de Red / Conectividad", icono:"📡", severidad:sev,
                    equipoLabel:  (a.tipo_instalacion||"").replace(/[🏠🏢🏗️🏪🏭]/gu,"").trim(),
                    sintomaLabel: (a.problema_red||"").replace(/[🚫🐌📶⏱️🔗🔐🔒📡]/gu,"").trim(),
                    duracionLabel:a.equipos_afectados||"",
                    riskWarning:  risk,
                    resumen: "Tipo: "+(a.tipo_instalacion||"").replace(/[🏠🏢🏗️🏪🏭]/gu,"").trim()+". Problema: "+(a.problema_red||"").replace(/[🚫🐌📶⏱️🔗🔐🔒📡]/gu,"").trim()+". Conexión: "+(a.tipo_conexion||"No especificado")+". Equipos afectados: "+(a.equipos_afectados||"No especificado")+".",
                    pasos: [
                        empresarial ? "🏢 **Caso empresarial** — Enviamos técnico con analizador de red y equipamiento de diagnóstico profesional." : "🔧 Diagnóstico remoto inicial disponible para la mayoría de los casos residenciales — resolvemos muchos problemas sin visita.",
                        causas && causas.length > 0 ? "🔬 **Causas más probables en este caso:** " + causas[0] + (causas[1] ? ". También evaluamos: " + causas[1] + "." : ".") : "🔬 Relevamiento de infraestructura completo.",
                        wifi ? "📶 Trabajamos con MikroTik, Ubiquiti y TP-Link EAP. Hacemos mapa de cobertura real antes de proponer solución." : vpn ? "🔐 Configuramos VPN con OpenVPN o WireGuard. Auditamos el punto de entrada y políticas de acceso." : latencia ? "⏱️ Configuramos QoS para priorizar tráfico crítico (VoIP, videollamadas, POS) sobre navegación general." : segura ? "🔒 Diseñamos red con VLAN separadas, firewall perimetral y política de acceso por dispositivo." : "🔌 Revisamos desde el modem del ISP hasta el último punto de red activo.",
                        posSinRed ? "🏪 **POS / punto de venta** — Atención urgente: cada minuto sin red en caja representa pérdida directa." : "📋 Entregamos documentación de la red al finalizar.",
                        "⚡ Resolución en el día para la mayoría de los casos residenciales y de oficina pequeña."
                    ],
                    servicio:"Redes Cableadas e Inalámbricas"
                };
            }
        },

        // ─── TELEFONÍA IP / VOIP — NUEVO ───────────────────────────
        "voip_diagnostico": {
            intro: "📞 **Diagnóstico de telefonía IP y VoIP**\n\nUnas preguntas para evaluar tu sistema de comunicaciones.",
            steps: [
                {
                    key:"tipo_voip",
                    question:"¿Qué tipo de sistema de telefonía tenés?",
                    options:["📞 Teléfonos IP físicos (Cisco, Yealink, Fanvil)","💻 Softphone en PC o celular (Zoiper, 3CX)","🏢 Central IP (PBX) — Asterisk, FreePBX, 3CX","☁️ Telefonía cloud (RingCentral, Vonage, etc.)","📱 WhatsApp Business o llamadas por internet"]
                },
                {
                    key:"problema_voip",
                    question:"¿Cuál es el problema principal?",
                    options:[
                        "🔇 No hay audio (silencio en una o ambas partes)",
                        "📵 Las llamadas se cortan solas",
                        "🔊 Hay eco, distorsión o ruido en la voz",
                        "🚫 El teléfono no registra o no conecta al servidor",
                        "📞 No se puede llamar a números externos",
                        "🔢 La numeración o los internos no funcionan bien",
                        "⏱️ Alta latencia / retardo en las llamadas"
                    ]
                },
                {
                    key:"afecta_todos",
                    question:"¿El problema afecta a todos los usuarios o a algunos?",
                    options:["Todos los teléfonos afectados","Solo uno o algunos teléfonos","Solo llamadas salientes / entrantes","Solo en ciertas horas o con ciertos destinos"]
                }
            ],
            diagnose: function(a) {
                var pbx         = a.tipo_voip && (a.tipo_voip.includes("PBX") || a.tipo_voip.includes("Asterisk"));
                var totalAfecta = a.afecta_todos && a.afecta_todos.includes("Todos");
                var audio       = a.problema_voip && (a.problema_voip.includes("audio") || a.problema_voip.includes("eco") || a.problema_voip.includes("ruido"));
                var sev         = (totalAfecta && pbx) ? "alta" : totalAfecta ? "media" : "baja";

                return {
                    titulo:"Diagnóstico de Telefonía IP / VoIP", icono:"📞", severidad:sev,
                    equipoLabel:  (a.tipo_voip||"").replace(/[📞💻🏢☁️📱]/gu,"").trim(),
                    sintomaLabel: (a.problema_voip||"").replace(/[🔇📵🔊🚫📞🔢⏱️]/gu,"").trim(),
                    duracionLabel:a.afecta_todos||"",
                    riskWarning:  riskWarnings["📞 El teléfono IP no tiene audio o corta"] || "Los problemas de VoIP en entornos empresariales generan pérdida de llamadas comerciales y afectan la imagen de la empresa.",
                    resumen: "Sistema: "+(a.tipo_voip||"").replace(/[📞💻🏢☁️📱]/gu,"").trim()+". Problema: "+(a.problema_voip||"").replace(/[🔇📵🔊🚫📞🔢⏱️]/gu,"").trim()+". Alcance: "+(a.afecta_todos||"No especificado")+".",
                    pasos: [
                        totalAfecta ? "⚠️ **Problema masivo** — Revisamos primero el servidor/PBX y la conectividad de la red con los teléfonos." : "🔍 Diagnóstico del teléfono o softphone afectado de forma aislada.",
                        audio ? "🔊 **Problema de audio en VoIP** — Causa más frecuente: falta de QoS en el router. El tráfico de voz compite con la navegación y genera pérdida de paquetes. Configuramos priorización de RTP." : pbx ? "🏢 Revisamos logs del PBX, rutas de marcación y registro SIP de los clientes." : "🔌 Verificamos registro SIP, credenciales del trunk y configuración del codec.",
                        "📊 Analizamos calidad de la llamada (jitter, latencia, pérdida de paquetes) con herramientas específicas de VoIP.",
                        "⚡ La mayoría de los problemas de VoIP se resuelven de forma remota. Si se requiere visita, coordinamos según urgencia.",
                        "🔧 Configuramos QoS, codecs óptimos y failover si aplica."
                    ],
                    servicio:"Telefonía IP y VoIP"
                };
            }
        },

        // ─── CÁMARAS — expandido ───────────────────────────────────
        "camaras_diagnostico": {
            intro: "📷 **Diagnóstico de sistemas de videovigilancia**\n\nUnas preguntas para la mejor recomendación.",
            steps: [
                {
                    key:"necesidad_camara",
                    question:"¿Qué necesitás exactamente?",
                    options:[
                        "📦 Instalación nueva desde cero",
                        "🔧 Reparación o mantenimiento de sistema existente",
                        "⬆️ Ampliar el sistema actual con más cámaras",
                        "💻 Configurar acceso remoto o app móvil",
                        "🌙 Las cámaras tienen mala imagen nocturna",
                        "📷 Las cámaras no graban correctamente",
                        "💾 El disco del DVR/NVR está lleno o falla"
                    ]
                },
                {
                    key:"tipo_sistema",
                    question:"¿Qué tipo de sistema tenés o querés?",
                    options:["🎥 Cámaras analógicas (cable coaxial / BNC)","🌐 Cámaras IP (cable de red / PoE)","📡 Cámaras WiFi (inalámbricas)","🤷 No sé qué tipo es / necesito asesoramiento"]
                },
                {
                    key:"tipo_lugar",
                    question:"¿Dónde se instalaría o dónde está el sistema?",
                    options:["🏠 Casa / Departamento","🏢 Oficina / Consultorio","🏪 Local comercial / Negocio","🏭 Depósito / Nave industrial","🅿️ Estacionamiento / Espacio exterior"]
                },
                {
                    key:"cantidad_camaras",
                    question:"¿Cuántas cámaras necesitarías o tenés?",
                    options:["1-2 cámaras (vigilancia básica)","3-5 cámaras (cobertura media)","6-10 cámaras (cobertura completa)","Más de 10 cámaras (sistema empresarial)"]
                }
            ],
            diagnose: function(a) {
                var empresarial  = ["🏭 Depósito / Nave industrial","Más de 10 cámaras (sistema empresarial)","🏪 Local comercial / Negocio"].some(function(o){ return [a.tipo_lugar, a.cantidad_camaras].includes(o); });
                var instalNueva  = a.necesidad_camara === "📦 Instalación nueva desde cero";
                var problemaNoche= a.necesidad_camara && a.necesidad_camara.includes("nocturna");
                var problemaGrab = a.necesidad_camara && a.necesidad_camara.includes("graban");
                var problemaDisco= a.necesidad_camara && a.necesidad_camara.includes("disco");
                var esIP         = a.tipo_sistema && a.tipo_sistema.includes("IP");

                var riskKey = problemaDisco ? "💾 El disco del DVR/NVR está lleno o falla" : problemaGrab ? "📷 Las cámaras no graban correctamente" : problemaNoche ? "🌙 Imagen nocturna de mala calidad" : "🔧 Reparación o mantenimiento de sistema existente";
                var risk = riskWarnings[riskKey] || "Un sistema de videovigilancia con fallas deja puntos ciegos justo cuando más se necesita cobertura.";

                var causas = [
                    instalNueva ? "Selección de cámara incorrecta para el ambiente (interior vs. exterior, focal requerida)" : problemaGrab ? "Disco lleno sin alertas configuradas — el DVR sobreescribe sin aviso" : problemaNoche ? "LEDs infrarrojos agotados o suciedad en el domo de la cámara" : "Pérdida de señal por conector BNC oxidado o cable deteriorado",
                    instalNueva ? "Posicionamiento sin análisis de ángulo de cobertura previo" : problemaDisco ? "Disco de PC en DVR (no recomendado) — discos para vigilancia tienen mayor durabilidad" : "Firmware desactualizado del DVR que genera incompatibilidades"
                ];

                return {
                    titulo:"Diagnóstico de Sistema CCTV", icono:"📷",
                    severidad: empresarial || problemaDisco ? "alta" : problemaGrab ? "media" : "media",
                    equipoLabel:  (a.tipo_lugar||"").replace(/[🏠🏢🏪🏭🅿️]/gu,"").trim(),
                    sintomaLabel: (a.necesidad_camara||"").replace(/[📦🔧⬆️💻🌙📷💾]/gu,"").trim(),
                    duracionLabel:a.cantidad_camaras||"",
                    riskWarning:  risk,
                    resumen: "Necesidad: "+(a.necesidad_camara||"").replace(/[📦🔧⬆️💻🌙📷💾]/gu,"").trim()+". Sistema: "+(a.tipo_sistema||"No especificado")+". Lugar: "+(a.tipo_lugar||"").replace(/[🏠🏢🏪🏭🅿️]/gu,"").trim()+". Cantidad: "+(a.cantidad_camaras||"No especificado")+".",
                    pasos: [
                        instalNueva ? "📐 **Relevamiento técnico gratuito** — Diseñamos el sistema óptimo: ángulos de cobertura, tipo de cámara por ambiente y almacenamiento recomendado." : problemaDisco ? "💾 **Disco del DVR/NVR** — Reemplazamos por disco específico de vigilancia (WD Purple, Seagate Skyhawk) y configuramos alertas de espacio." : problemaGrab ? "📋 Revisamos configuración de motion detection, horarios de grabación y capacidad del disco." : problemaNoche ? "🌙 Evaluamos los LEDs IR de cada cámara y limpiamos el domo protector. Si los LEDs fallaron, cotizamos reemplazo." : "🔍 Diagnóstico completo del sistema existente.",
                        "🔬 **Causa más probable:** " + causas[0] + ". También revisamos: " + causas[1] + ".",
                        esIP ? "🌐 **Sistema IP** — Verificamos configuración PoE, direcciones IP estáticas, ancho de banda y acceso ONVIF." : "🔌 Revisamos conectores BNC, fuente de alimentación y calidad del cable coaxial.",
                        empresarial ? "🏢 **Sistema empresarial** — Cámaras IP HD/4K, NVR con RAID, almacenamiento local + backup en nube." : "🎥 Cámaras HD con visión nocturna real (no emulada), detección de movimiento con alertas al celular.",
                        "📱 Configuramos acceso remoto desde el celular — sin cargos mensuales en sistemas locales.",
                        "⚙️ Garantía de instalación: 90 días en cableado y equipos instalados."
                    ],
                    servicio:"Instalación y Mantenimiento CCTV"
                };
            }
        },

        // ─── ALARMAS — expandido ────────────────────────────────────
        "alarmas_diagnostico": {
            intro: "🚨 **Diagnóstico de sistemas de alarma y seguridad**\n\n¿Qué tipo de solución estás buscando?",
            steps: [
                {
                    key:"tipo_alarma",
                    question:"¿Qué sistema te interesa o tenés?",
                    options:[
                        "🔔 Alarma domiciliaria con sensores",
                        "⚡ Cerco eléctrico perimetral",
                        "🚨 Alarma monitoreada 24/7",
                        "🔐 Control de acceso (tarjeta / huella / PIN)",
                        "🔧 Reparación o mantenimiento de alarma existente",
                        "📵 La alarma da falsas alarmas sin motivo",
                        "📡 La alarma no envía alertas al celular"
                    ]
                },
                {
                    key:"ubicacion_alarma",
                    question:"¿Dónde se instalaría o dónde está el sistema?",
                    options:["🏠 Casa / Departamento","🏢 Oficina / Local comercial","🏭 Depósito / Galpón","🏗️ Obra en construcción","🅿️ Cochera / Estacionamiento"]
                },
                {
                    key:"tiene_camara",
                    question:"¿Tenés o querés integrar cámaras al sistema de seguridad?",
                    options:["✅ Sí, ya tengo cámaras instaladas","🔗 Quiero integrar alarma con cámaras","❌ No, solo la alarma por ahora","💡 No lo había considerado, me interesa"]
                },
                {
                    key:"zonas_proteger",
                    question:"¿Cuántas zonas o ambientes necesitás proteger?",
                    options:["1-3 ambientes (básico)","4-6 ambientes (intermedio)","7-10 ambientes (completo)","Perímetro externo completo"]
                }
            ],
            diagnose: function(a) {
                var cerco        = a.tipo_alarma && a.tipo_alarma.includes("Cerco");
                var monitoreada  = a.tipo_alarma && a.tipo_alarma.includes("monitoreada");
                var acceso       = a.tipo_alarma && a.tipo_alarma.includes("acceso");
                var falsaAlarma  = a.tipo_alarma && a.tipo_alarma.includes("falsas");
                var sinAlertas   = a.tipo_alarma && a.tipo_alarma.includes("alertas");
                var quiereCamara = a.tiene_camara && (a.tiene_camara.includes("integrar") || a.tiene_camara.includes("me interesa"));
                var tieneCamara  = a.tiene_camara && a.tiene_camara.includes("ya tengo");

                var causasFalsa = [
                    "Sensor PIR desregulado o con lente sucia — detecta mascotas o cambios de temperatura",
                    "Batería del sensor baja — genera disparos espontáneos antes de morir",
                    "Interferencia eléctrica cerca del sensor (artefactos, luz fluorescente)",
                    "Sensores magnéticos de puertas desalineados"
                ];

                return {
                    titulo:"Diagnóstico de Sistema de Alarma", icono:"🚨",
                    severidad: (cerco || monitoreada || falsaAlarma) ? "alta" : "media",
                    equipoLabel:  (a.ubicacion_alarma||"").replace(/[🏠🏢🏭🏗️🅿️]/gu,"").trim(),
                    sintomaLabel: (a.tipo_alarma||"").replace(/[🔔⚡🚨🔐🔧📵📡]/gu,"").trim(),
                    duracionLabel:a.zonas_proteger||"",
                    riskWarning: falsaAlarma ? "Las falsas alarmas frecuentes llevan a los usuarios a desactivar el sistema permanentemente, dejando la propiedad sin protección real." : sinAlertas ? "Una alarma que no notifica al celular puede haber sido violada sin que el propietario lo sepa durante horas." : "Una alarma mal configurada puede activarse en falso o no responder ante un evento real. La revisión técnica periódica garantiza su funcionamiento cuando más importa.",
                    resumen: "Sistema: "+(a.tipo_alarma||"").replace(/[🔔⚡🚨🔐🔧📵📡]/gu,"").trim()+". Lugar: "+(a.ubicacion_alarma||"").replace(/[🏠🏢🏭🏗️🅿️]/gu,"").trim()+". Cámaras: "+(a.tiene_camara||"No especificado")+". Zonas: "+(a.zonas_proteger||"No especificado")+".",
                    pasos: [
                        falsaAlarma ? "📵 **Falsas alarmas** — Revisamos cada sensor: calibración del PIR, estado de la batería, alineación de contactos magnéticos. " + causasFalsa[0] + "." : sinAlertas ? "📡 **Sin alertas GSM/IP** — Verificamos configuración del módulo de comunicación, simcard activa, saldo, y configuración de destinos de alerta." : cerco ? "⚡ **Cerco eléctrico** — Impulsos no letales certificados, instalación prolija con canaleta, señalización reglamentaria." : acceso ? "🔐 **Control de acceso** — Tarjeta, huella o PIN con log de ingresos. Reportes por usuario y horario. Integración con alarma." : "🔔 Alarma con sensores PIR, magnéticos en puertas/ventanas, sirena y botón de pánico.",
                        falsaAlarma ? "🔬 **Causas más frecuentes de falsas alarmas:** " + causasFalsa[1] + ". También puede ser: " + causasFalsa[2] + "." : monitoreada ? "👮 Conexión con central de monitoreo 24/7 — respuesta ante emergencias con movilización si corresponde." : "📱 Configuramos notificaciones push y llamadas automáticas ante eventos.",
                        (quiereCamara || tieneCamara) ? "📷 **Integración con cámaras** — Configuramos eventos de alarma vinculados a grabación automática de cámaras para tener registro visual de cada evento." : "💡 ¿Sabías que la integración alarma + cámaras duplica la efectividad del sistema? Te asesoramos sin compromiso.",
                        "🔊 Sirena exterior de alta potencia (120dB) + luz estroboscópica disuasoria.",
                        "🔐 Garantía de instalación. Servicio técnico posterior disponible."
                    ],
                    servicio:"Sistemas de Alarmas y Control de Acceso"
                };
            }
        },

        // ─── DOMÓTICA — igual estructura, causas mejoradas ─────────
        "domotica_diagnostico": {
            intro: "🏠 **Diagnóstico de domótica y automatización**\n\nContame qué querés automatizar o qué problema tenés.",
            steps: [
                {
                    key:"situacion_domotica",
                    question:"¿Cuál es tu situación actual?",
                    options:[
                        "🆕 Quiero instalar domótica desde cero",
                        "🔧 Tengo domótica instalada con problemas",
                        "⬆️ Quiero ampliar o mejorar un sistema existente",
                        "🔗 Quiero integrar dispositivos que ya tengo (Alexa, Google, etc.)"
                    ]
                },
                {
                    key:"sistema_domotica",
                    question:"¿Qué querés automatizar?",
                    options:["💡 Iluminación inteligente","🌡️ Climatización / Aire acondicionado","🔌 Enchufes y electrodomésticos","🏠 Sistema completo (todo integrado)","🔐 Seguridad y accesos (cerraduras, sensores)","🌿 Riego automático"]
                },
                {
                    key:"control_deseado",
                    question:"¿Cómo te gustaría controlarlo?",
                    options:["📱 App desde el celular","🗣️ Comandos de voz (Alexa/Google)","⏰ Automatización por horarios y rutinas","🏠 Todo lo anterior (control total)"]
                },
                {
                    key:"tipo_lugar_dom",
                    question:"¿Dónde se instalaría?",
                    options:["🏠 Casa / Departamento","🏢 Oficina / Local","🏗️ Construcción nueva (más fácil de cablear)","🏘️ Propiedad con infraestructura existente"]
                }
            ],
            diagnose: async function(a) {
                var completo    = a.sistema_domotica && (a.sistema_domotica.includes("completo") || a.situacion_domotica && a.situacion_domotica.includes("ampliar"));
                var voz         = a.control_deseado  && a.control_deseado.includes("voz");
                var tieneProb   = a.situacion_domotica && a.situacion_domotica.includes("problemas");
                var esSeg       = a.sistema_domotica && a.sistema_domotica.includes("Seguridad");
                var esRiego     = a.sistema_domotica && a.sistema_domotica.includes("Riego");

                var precioKey   = (a.sistema_domotica||"").replace(/[💡🌡️🔌🏠🔐🌿]/gu,"").trim();
                var precioMatch = null;
                Object.keys(DOMOTICA_PRECIOS).forEach(function(k){ if (precioKey.includes(k) || k.includes(precioKey)) precioMatch = DOMOTICA_PRECIOS[k]; });
                var precioUSD   = precioMatch || (completo ? { min:600, max:1800 } : { min:100, max:400 });
                var dolar       = await obtenerDolarBNA();
                var precioStr   = dolar
                    ? "\n\n💰 **Inversión estimada:** USD "+precioUSD.min+" – USD "+precioUSD.max+"\n📊 **Al tipo oficial BNA ($"+Math.round(dolar)+"/USD):** "+formatARS(precioUSD.min*dolar)+" – "+formatARS(precioUSD.max*dolar)+"\n_Valores orientativos. Presupuesto acordado tras relevamiento._"
                    : "\n\n💰 **Inversión estimada:** USD "+precioUSD.min+" – USD "+precioUSD.max+"\n_Cotización BNA no disponible en este momento. Te la informamos al contactar._";

                var causasProblema = tieneProb ? [
                    "Dispositivo IoT desconectado de WiFi por cambio de contraseña o router nuevo",
                    "App del fabricante desactualizada o con servidores caídos",
                    "Conflicto de protocolo entre dispositivos de distintas marcas",
                    "Automatización mal configurada que se ejecuta en horarios incorrectos"
                ] : null;

                return {
                    titulo:"Diagnóstico de Sistema Domótico", icono:"🏠",
                    severidad: completo ? "alta" : tieneProb ? "media" : "media",
                    equipoLabel:  (a.tipo_lugar_dom||"").replace(/[🏠🏢🏗️🏘️]/gu,"").trim(),
                    sintomaLabel: (a.sistema_domotica||"").replace(/[💡🌡️🔌🏠🔐🌿]/gu,"").trim(),
                    duracionLabel:(a.control_deseado||"").replace(/[📱🗣️⏰🏠]/gu,"").trim(),
                    riskWarning: tieneProb ? "Una instalación domótica mal configurada puede generar automatizaciones que funcionen al revés de lo esperado o dejar dispositivos de seguridad inaccesibles. La revisión es rápida." : "Una instalación domótica sin segmentación de red puede dejar dispositivos IoT expuestos. Es importante configurar una VLAN separada para dispositivos del hogar.",
                    resumen: "Situación: "+(a.situacion_domotica||"").replace(/[🆕🔧⬆️🔗]/gu,"").trim()+". Automatización: "+(a.sistema_domotica||"").replace(/[💡🌡️🔌🏠🔐🌿]/gu,"").trim()+". Control: "+(a.control_deseado||"").replace(/[📱🗣️⏰🏠]/gu,"").trim()+". Lugar: "+(a.tipo_lugar_dom||"No especificado")+"."+precioStr,
                    pasos:[
                        tieneProb ? "🔧 **Sistema con problemas** — Diagnóstico de conectividad, app y configuración de automatizaciones. " + (causasProblema ? "Causa más frecuente: " + causasProblema[0] + "." : "") : completo ? "🏠 **Sistema integral** — Relevamiento técnico del espacio y diseño de arquitectura: protocolo, hub central y dispositivos por área." : "💡 Instalación modular — podés empezar con una zona y escalar.",
                        tieneProb && causasProblema ? "🔬 **Otras causas frecuentes:** " + causasProblema[1] + ". También: " + causasProblema[2] + "." : voz ? "🗣️ Integración con Alexa o Google Assistant en español — configuramos rutinas y grupos por habitación." : "📱 App móvil con control remoto desde cualquier parte del mundo.",
                        esSeg ? "🔐 **Automatización de seguridad** — Cerraduras inteligentes, sensores de apertura y cámaras integradas en un solo flujo de alertas." : esRiego ? "🌿 **Riego automático** — Programación por horario o sensor de humedad del suelo. Compatible con electroválvulas existentes en muchos casos." : "⚡ Instalación sin obra en la mayoría de los casos — tecnología inalámbrica Zigbee, Z-Wave o WiFi.",
                        "🎓 Capacitación completa incluida para que uses el sistema desde el primer día.",
                        precioStr
                    ],
                    servicio:"Automatización Domótica"
                };
            }
        },

        // ─── CIBERSEGURIDAD — expandido ────────────────────────────
        "ciber_diagnostico": {
            intro: "🛡️ **Diagnóstico de ciberseguridad**\n\nUnas preguntas para evaluar tu exposición real y darte una hoja de ruta concreta.",
            steps: [
                {
                    key:"problema_ciber",
                    question:"¿Cuál es la situación?",
                    options:[
                        "🦠 Virus / ransomware activo en este momento",
                        "🔓 Creo que me hackearon (acceso no autorizado)",
                        "📧 Recibí un email sospechoso o hice click en un link",
                        "🔑 Contraseñas débiles o reutilizadas en la empresa",
                        "🔒 Quiero proteger la red antes de que pase algo",
                        "📋 Necesito auditoría de seguridad para la empresa",
                        "🔐 Configurar VPN / acceso remoto seguro",
                        "📱 Creo que mi celular o dispositivo móvil está comprometido"
                    ]
                },
                {
                    key:"alcance_ciber",
                    question:"¿Cuántos equipos o usuarios están involucrados?",
                    options:["Solo 1 equipo / uso personal","2-10 equipos (pyme pequeña)","11-50 equipos (pyme mediana)","Más de 50 equipos (empresa grande)"]
                },
                {
                    key:"tiene_antivirus",
                    question:"¿Tenés antivirus o solución de seguridad activa?",
                    options:["✅ Antivirus corporativo pago (ESET, Bitdefender, etc.)","⚠️ Solo Windows Defender / gratuito","❌ No tengo nada instalado","🤷 No estoy seguro"]
                },
                {
                    key:"backup_ciber",
                    question:"¿Tenés backup reciente de los datos críticos?",
                    options:["✅ Sí, backup automático probado y al día","⚠️ Backup manual pero desactualizado","❌ No tengo backup","☁️ Solo en la nube (OneDrive / Google Drive)"]
                }
            ],
            diagnose: function(a) {
                var activo     = a.problema_ciber && a.problema_ciber.includes("activo");
                var hackeado   = a.problema_ciber && a.problema_ciber.includes("hackearon");
                var phishing   = a.problema_ciber && a.problema_ciber.includes("email sospechoso");
                var passDebil  = a.problema_ciber && a.problema_ciber.includes("Contraseñas");
                var celular    = a.problema_ciber && a.problema_ciber.includes("celular");
                var sinAV      = ["❌ No tengo nada instalado","🤷 No estoy seguro"].includes(a.tiene_antivirus);
                var sinBackup  = a.backup_ciber === "❌ No tengo backup";
                var empresarial= a.alcance_ciber !== "Solo 1 equipo / uso personal";
                var risk       = riskWarnings[a.problema_ciber] || (sinAV ? "Equipos sin protección activa son el vector de entrada más común para malware en pymes argentinas." : "La seguridad preventiva cuesta entre 10 y 100 veces menos que la respuesta a un incidente de seguridad.");
                var sev        = (activo||hackeado) ? "critica" : (phishing || (sinAV&&sinBackup)) ? "alta" : empresarial ? "media" : "baja";
                var alertas    = [];
                if (sinBackup)  alertas.push("🔴 **Sin backup** — En caso de ransomware activo, sin backup la recuperación puede ser imposible o requerir pagar el rescate.");
                if (sinAV)      alertas.push("🟠 **Sin protección activa** — Los equipos sin AV corporativo son el punto de entrada más usado por malware dirigido a pymes.");
                if (passDebil)  alertas.push("🔑 **Contraseñas débiles** — Implementamos gestión de contraseñas con LastPass/Bitwarden y política de cambio periódico.");

                var causas = getCausasProbables(a.problema_ciber, a) || [
                    "Falta de autenticación de dos factores en cuentas críticas",
                    "Software desactualizado con vulnerabilidades conocidas"
                ];

                return {
                    titulo:"Diagnóstico de Ciberseguridad", icono:"🛡️", severidad:sev,
                    equipoLabel:  a.alcance_ciber||"",
                    sintomaLabel: (a.problema_ciber||"").replace(/[🦠🔓📧🔑🔒📋🔐📱]/gu,"").trim(),
                    duracionLabel:a.tiene_antivirus||"",
                    riskWarning:  risk,
                    resumen: "Situación: "+(a.problema_ciber||"").replace(/[🦠🔓📧🔑🔒📋🔐📱]/gu,"").trim()+". Alcance: "+(a.alcance_ciber||"No especificado")+". Antivirus: "+(a.tiene_antivirus||"No especificado")+". Backup: "+(a.backup_ciber||"No especificado")+".",
                    pasos:[
                        activo   ? "🚨 **Ransomware ACTIVO — Pasos inmediatos:**\n   1. Desconectá el equipo de la red YA (cable y WiFi).\n   2. NO apagues el equipo todavía — las claves pueden estar en RAM.\n   3. No pagues el rescate sin consultarnos — hay opciones de recuperación.\n   4. Contactanos urgente."
                        : hackeado ? "⚠️ **Posible intrusión** — Cambiá TODAS las contraseñas desde un dispositivo limpio. Habilitá autenticación de dos factores (2FA) en todas las cuentas críticas. Auditamos los accesos de los últimos 30 días."
                        : phishing ? "📧 **Click en link sospechoso** — " + (causas[0] || "Causa más frecuente: descarga de dropper en segundo plano") + ". Escaneamos el equipo urgente y revisamos qué credenciales podrían estar comprometidas."
                        : celular  ? "📱 **Celular potencialmente comprometido** — Revisamos apps instaladas, permisos, logs de acceso y configuración de cuenta Google/Apple. Muchos 'hackeos' de celular son en realidad accesos a cuentas cloud."
                        : "🔒 Instalamos y configuramos ESET Endpoint o equivalente según el tamaño y presupuesto de la red.",
                        causas && causas.length > 0 && !activo ? "🔬 **Causas más frecuentes:** " + causas[0] + (causas[1] ? ". También: " + causas[1] + "." : ".") : activo ? "🔬 En casos de ransomware evaluamos: cepa específica, tablas de descifrado públicas disponibles (No More Ransom), y recuperación desde shadow copies." : "",
                        empresarial ? "🏢 **Entorno empresarial** — Firewall perimetral, VLAN segmentada, VPN con MFA, política de contraseñas, capacitación anti-phishing del equipo y monitoreo continuo." : "🔐 Configuración segura de red WiFi (WPA3), router con firewall, contraseñas con gestor y backup automático en la nube.",
                        ...alertas,
                        "📋 Entregamos informe de vulnerabilidades con priorización: crítico / moderado / bajo y plan de acción."
                    ],
                    servicio:"Ciberseguridad"
                };
            }
        },

        // ─── UPS — expandido ───────────────────────────────────────
        "ups_diagnostico": {
            intro: "🔋 **Diagnóstico de UPS y protección de energía**\n\nUnas preguntas para recomendarte la solución correcta.",
            steps: [
                {
                    key:"motivo_ups",
                    question:"¿Por qué necesitás un UPS o cuál es el problema?",
                    options:[
                        "⚡ Picos de tensión / cortes frecuentes en la zona",
                        "💾 Quiero proteger equipos o datos ante cortes",
                        "🔇 El UPS actual ya no sostiene la carga",
                        "🔋 La batería del UPS no dura o está hinchada",
                        "🆕 Instalación nueva, quiero hacerlo bien desde el principio",
                        "📊 No sé qué UPS necesito — quiero asesoramiento"
                    ]
                },
                {
                    key:"equipos_a_proteger",
                    question:"¿Qué equipos querés proteger?",
                    options:[
                        "🖥️ 1 PC + monitor (puesto individual)",
                        "🖥️🖥️ 2-5 PCs + red (oficina pequeña)",
                        "🗄️ Servidor o NAS (equipos críticos 24/7)",
                        "🔀 Router / switch / telecomunicaciones solamente",
                        "🏥 Equipamiento médico o industrial",
                        "💳 POS / sistema de caja (no puede apagarse)"
                    ]
                },
                {
                    key:"autonomia_deseada",
                    question:"¿Cuánta autonomía necesitás ante un corte?",
                    options:[
                        "⏱️ Solo para guardar y apagar correctamente (5-10 min)",
                        "🕐 Hasta 30 minutos",
                        "🕒 Más de 1 hora (operación continua durante el corte)",
                        "🤷 No sé, necesito asesoramiento"
                    ]
                },
                {
                    key:"frecuencia_cortes",
                    question:"¿Con qué frecuencia se corta la luz o hay picos?",
                    options:[
                        "🔴 Frecuente — varias veces por semana",
                        "🟡 Ocasional — una vez por mes aproximadamente",
                        "🟢 Raro — es una medida preventiva",
                        "⚡ Tuve un pico que ya dañó equipos"
                    ]
                }
            ],
            diagnose: function(a) {
                var critico   = a.equipos_a_proteger && (a.equipos_a_proteger.includes("Servidor") || a.equipos_a_proteger.includes("médico") || a.equipos_a_proteger.includes("POS"));
                var largo     = a.autonomia_deseada  && a.autonomia_deseada.includes("1 hora");
                var picos     = a.motivo_ups          && a.motivo_ups.includes("Picos");
                var batFalla  = a.motivo_ups          && (a.motivo_ups.includes("batería") || a.motivo_ups.includes("sostiene"));
                var danoYa    = a.frecuencia_cortes   && a.frecuencia_cortes.includes("ya dañó");
                var frecuente = a.frecuencia_cortes   && a.frecuencia_cortes.includes("Frecuente");
                var risk      = riskWarnings[a.motivo_ups && a.motivo_ups.includes("batería") ? "🔋 La batería del UPS no dura o está hinchada" : a.motivo_ups && a.motivo_ups.includes("sostiene") ? "🔇 El UPS actual ya no sostiene la carga" : "⚡ Picos de tensión / cortes frecuentes"] || "Los picos de tensión al restaurarse la energía son la causa #1 de fuentes de PC y discos de servidores dañados.";
                var tipo      = (critico||largo) ? "Online / Doble Conversión (conmutación 0ms)" : picos || frecuente ? "Line Interactive con AVR (regula tensión sin gastar batería)" : "Line Interactive (recomendado para pymes y hogares)";
                var vaMin     = critico ? "1500VA – 3000VA" : (a.equipos_a_proteger && a.equipos_a_proteger.includes("2-5 PCs")) ? "1000VA – 1500VA" : "650VA – 1000VA";

                return {
                    titulo:"Diagnóstico de UPS / Protección de Energía", icono:"🔋",
                    severidad: (critico || danoYa || (frecuente && !a.motivo_ups.includes("preventiva"))) ? "alta" : "media",
                    equipoLabel:  (a.equipos_a_proteger||"").replace(/[🖥️🗄️🔀🏥💳]/gu,"").trim(),
                    sintomaLabel: (a.motivo_ups||"").replace(/[⚡💾🔇🔋🆕📊]/gu,"").trim(),
                    duracionLabel:a.autonomia_deseada||"",
                    riskWarning:  risk,
                    resumen: "Motivo: "+(a.motivo_ups||"").replace(/[⚡💾🔇🔋🆕📊]/gu,"").trim()+". Equipos: "+(a.equipos_a_proteger||"No especificado")+". Autonomía: "+(a.autonomia_deseada||"No especificado")+". Frecuencia de cortes: "+(a.frecuencia_cortes||"No especificado")+".",
                    pasos:[
                        batFalla ? "🔋 **Reemplazo de batería** — Las baterías de UPS duran 3-5 años. Reemplazamos con batería compatible de calidad. Si el UPS está subdimensionado, evaluamos reemplazo completo." : danoYa ? "⚠️ **Ya hubo daños por pico** — Instalamos UPS urgente y revisamos si los equipos afectados tienen daños ocultos en fuente o placa." : "🔋 **UPS recomendado:** " + tipo + " — capacidad mínima sugerida: " + vaMin + ".",
                        critico ? "🗄️ **Equipos críticos** — UPS Online (doble conversión): la carga siempre está sobre la batería, la red eléctrica solo carga la batería. Tiempo de conmutación: 0ms. Recomendamos marcas: APC, Eaton, Vertiv." : picos || frecuente ? "⚡ **El Line Interactive con AVR** regula bajones y picos de tensión sin gastar batería. Ideal para zonas con fluctuaciones. Marcas: APC, Forza, CyberPower." : "✅ Un UPS Line Interactive cubre el 90% de los casos residenciales y de oficina pequeña. Calculamos la carga exacta antes de recomendar modelo.",
                        "📊 **Calculamos la carga real** de tus equipos antes de recomendar marca y modelo — evitamos subdimensionar o sobredimensionar la inversión.",
                        "🔧 Instalamos, conectamos y probamos el UPS completo. Configuramos el software de apagado automático para cierre limpio del sistema ante cortes prolongados.",
                        "💡 Más info: soportecyclops.com.ar/blog/ups-proteccion-energia.html"
                    ],
                    servicio:"UPS y Protección de Energía"
                };
            }
        },

        // ─── SOPORTE REMOTO / SOFTWARE EMPRESARIAL — NUEVO ─────────
        "software_diagnostico": {
            intro: "💼 **Diagnóstico de software y sistemas empresariales**\n\nUnas preguntas para evaluar el problema con tu sistema.",
            steps: [
                {
                    key:"tipo_software",
                    question:"¿Qué tipo de software o sistema tiene el problema?",
                    options:[
                        "🏢 Sistema de gestión / ERP (Tango, Bejerman, SAP, etc.)",
                        "💳 Sistema de punto de venta (POS / facturación)",
                        "📊 Microsoft Office / Excel / Word",
                        "☁️ Aplicación en la nube (acceso web)",
                        "📧 Cliente de correo (Outlook, Thunderbird)",
                        "🖨️ Sistema de impresión / gestión documental",
                        "🔗 Software a medida o desarrollo propio"
                    ]
                },
                {
                    key:"problema_software",
                    question:"¿Cuál es el problema específico?",
                    options:[
                        "🚫 El programa no abre o da error al iniciar",
                        "🐌 Funciona pero está muy lento",
                        "💥 Se cierra solo o da error en operaciones",
                        "🔗 No conecta a la base de datos o al servidor",
                        "☁️ No puedo acceder al sistema remoto o a la nube",
                        "📤 Error al imprimir, exportar o generar archivos",
                        "🔑 Problema de permisos o usuarios bloqueados",
                        "⬆️ Necesito actualización o migración del sistema"
                    ]
                },
                {
                    key:"cuantos_afectados_sw",
                    question:"¿A cuántos usuarios o equipos afecta el problema?",
                    options:["Solo a mí / un equipo","A un sector o algunos usuarios","A toda la empresa","El sistema está completamente caído"]
                },
                {
                    key:"hubo_cambio",
                    question:"¿Hubo algún cambio reciente antes de que apareciera el problema?",
                    options:[
                        "✅ Sí — Windows Update o actualización de sistema",
                        "✅ Sí — cambio de equipo o migración de datos",
                        "✅ Sí — cambio en la red (router, VPN, servidor)",
                        "❌ No hubo ningún cambio que yo sepa",
                        "🤷 No estoy seguro"
                    ]
                }
            ],
            diagnose: function(a) {
                var totalCaido   = a.cuantos_afectados_sw && (a.cuantos_afectados_sw.includes("toda la empresa") || a.cuantos_afectados_sw.includes("completamente caído"));
                var huboUpdate   = a.hubo_cambio && a.hubo_cambio.includes("Windows Update");
                var huboMigra    = a.hubo_cambio && a.hubo_cambio.includes("migración");
                var esPos        = a.tipo_software && a.tipo_software.includes("punto de venta");
                var esErp        = a.tipo_software && a.tipo_software.includes("gestión / ERP");
                var noConecta    = a.problema_software && a.problema_software.includes("base de datos");
                var sev          = (totalCaido || esPos) ? "alta" : (noConecta && esErp) ? "alta" : "media";

                var causas = [
                    huboUpdate ? "Windows Update cambió permisos o configuración del servicio del sistema de gestión (causa #1 de rotura de ERP/POS post-actualización)" : noConecta ? "String de conexión a base de datos incorrecto tras cambio de IP del servidor" : "Archivo de configuración corrupto o ruta de instalación incorrecta",
                    huboUpdate ? "Actualización de .NET Framework que rompe compatibilidad con versiones antiguas del sistema" : huboMigra ? "Permisos NTFS incorrectos en la nueva ubicación de la base de datos" : "Conflicto entre la versión del sistema y la versión de Windows actualmente instalada"
                ];

                return {
                    titulo:"Diagnóstico de Software / Sistema Empresarial", icono:"💼", severidad:sev,
                    equipoLabel:  (a.tipo_software||"").replace(/[🏢💳📊☁️📧🖨️🔗]/gu,"").trim(),
                    sintomaLabel: (a.problema_software||"").replace(/[🚫🐌💥🔗☁️📤🔑⬆️]/gu,"").trim(),
                    duracionLabel:a.cuantos_afectados_sw||"",
                    riskWarning:  esPos ? "Un punto de venta caído impide facturar y operar. Cada minuto sin sistema es pérdida directa." : totalCaido ? "Un sistema de gestión caído paraliza las operaciones de toda la empresa." : riskWarnings["🖥️ Un programa de gestión o sistema no abre"] || "Un sistema de gestión inaccesible puede paralizar facturación, stock y operaciones críticas.",
                    resumen: "Sistema: "+(a.tipo_software||"").replace(/[🏢💳📊☁️📧🖨️🔗]/gu,"").trim()+". Problema: "+(a.problema_software||"").replace(/[🚫🐌💥🔗☁️📤🔑⬆️]/gu,"").trim()+". Afectados: "+(a.cuantos_afectados_sw||"No especificado")+". Cambio previo: "+(a.hubo_cambio||"No especificado")+".",
                    pasos: [
                        totalCaido ? "🚨 **Sistema completamente caído** — Diagnóstico remoto urgente. Coordinamos acceso al equipo en los próximos minutos." : esPos ? "⚠️ **POS caído** — Atención prioritaria. Iniciamos soporte remoto de inmediato." : "🔍 Diagnóstico remoto: revisamos logs del sistema, configuración de servicios y estado de la base de datos.",
                        "🔬 **Causas más probables:** " + causas[0] + ". También evaluamos: " + causas[1] + ".",
                        huboUpdate ? "🔄 **Post Windows Update** — Revisamos compatibilidad, revertimos la actualización problemática si es necesario y aplicamos parches de compatibilidad." : huboMigra ? "🔀 **Post-migración** — Verificamos rutas de base de datos, permisos de carpetas y configuración de servicios en el nuevo entorno." : noConecta ? "🔗 **Sin conexión a BD** — Verificamos que el servicio SQL/MySQL esté activo, string de conexión y firewall del servidor." : "⚙️ Reinstalamos dependencias, reparamos o reinstalamos el sistema conservando la base de datos intacta.",
                        "💻 La mayoría de estos problemas se resuelven 100% de forma remota en 1-2 horas. Sin necesidad de visita.",
                        "📋 Si el sistema requiere actualización, asesoramos sin costo sobre versiones estables y proceso de migración."
                    ],
                    servicio:"Soporte de Software Empresarial"
                };
            }
        }

    }; // fin diagFlows

    // ══════════════════════════════════════════════════════════════
    // MENÚ PRINCIPAL — ampliado a 12 categorías
    // ══════════════════════════════════════════════════════════════
    var intelligentResponses = {
        'menu_diagnostico': {
            message: "🔍 **¿Con qué área necesitás ayuda?**\n\nElegí la categoría que más se acerca a tu situación:",
            options: [
                { text:"💻 PC / Laptop",                      next:"iniciar_diag_pc" },
                { text:"🖨️ Impresoras y periféricos",         next:"iniciar_diag_impresoras" },
                { text:"🗄️ Servidores y NAS",                 next:"iniciar_diag_servidores" },
                { text:"📡 Internet / Redes / WiFi",          next:"iniciar_diag_redes" },
                { text:"📞 Telefonía IP / VoIP",              next:"iniciar_diag_voip" },
                { text:"📷 Cámaras de Seguridad (CCTV)",     next:"iniciar_diag_camaras" },
                { text:"🚨 Alarmas / Control de Acceso",      next:"iniciar_diag_alarmas" },
                { text:"🏠 Domótica / Automatización",        next:"iniciar_diag_domotica" },
                { text:"🛡️ Ciberseguridad",                  next:"iniciar_diag_ciber" },
                { text:"🔋 UPS / Protección de Energía",     next:"iniciar_diag_ups" },
                { text:"💼 Software / Sistemas empresariales",next:"iniciar_diag_software" },
                { text:"🌐 Presencia web para mi negocio",   action:"whatsapp_web" }
            ]
        },
        'consulta_urgente': {
            message: "🚨 **¿Tu problema es urgente?**\n\nTe conectamos de inmediato:",
            options: [
                { text:"📞 Llamar ahora",       action:"llamar_ahora" },
                { text:"💬 WhatsApp urgente",   action:"whatsapp_urgente" }
            ]
        }
    };

    // ── APERTURA / CIERRE ─────────────────────────────────────────
    chatbotToggle.addEventListener('click', function() {
        chatbotWindow.classList.toggle('active');
        if (notificationDot) notificationDot.classList.remove('active');
        if (conversationHistory.length === 0) {
            addMessage(
                "¡Hola! 👋 Soy el **Asistente Cyclops**.\n\nEstoy aquí para ayudarte con cualquier problema técnico o consulta sobre nuestros servicios. Podés escribirme o elegir una opción.\n\n¿En qué puedo ayudarte hoy?",
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

    // ── ENVÍO ─────────────────────────────────────────────────────
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

    // ══════════════════════════════════════════════════════════════
    // PROCESADOR DE MENSAJES DE TEXTO LIBRE — v5.0 ampliado
    // ══════════════════════════════════════════════════════════════
    function processUserMessage(msg) {
        var m = msg.toLowerCase();

        // ── Información general ────────────────────────────────────
        if (m.includes('horario') || m.includes('atienden') || m.includes('sabado') || m.includes('sábado') || m.includes('domingo') || m.includes('cuando abren')) {
            addMessage("⏰ **Horarios de atención:**\n\n📅 Lunes a Viernes: 9:00 a 18:00 hs\n📅 Sábados: 9:00 a 13:00 hs\n📅 Domingos: Cerrado\n\n⚡ Para urgencias fuera de horario, escribinos por WhatsApp — evaluamos según disponibilidad y prioridad del caso.", 'bot', [{text:"💬 WhatsApp urgente", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('precio') || m.includes('costo') || m.includes('cuanto') || m.includes('cuánto') || m.includes('cobran') || m.includes('presupuesto') || m.includes('vale')) {
            addMessage("💰 **Política de precios:**\n\n✅ Consulta remota inicial **sin cargo**\n✅ Presupuesto detallado antes de empezar — sin sorpresas\n✅ Diagnóstico honesto: si el equipo no tiene solución viable, te lo decimos antes de cobrar\n\n**Garantías incluidas:**\n💻 Software / formateo: 15 días\n🔧 Mantenimiento físico: 30 días\n📡 Redes e instalaciones: 90 días\n\nEl precio depende del servicio, la complejidad y la zona. Lo acordamos siempre antes de tocar nada.", 'bot', [{text:"📅 Solicitar presupuesto", action:"agendar_consulta"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('zona') || m.includes('cobertura') || m.includes('donde llegan') || m.includes('dónde llegan') || m.includes('llegan a') || m.includes('atienden en')) {
            addMessage("📍 **Zona de cobertura:**\n\n✅ Ciudad Autónoma de Buenos Aires (CABA)\n✅ Gran Buenos Aires — Zona Norte, Sur y Oeste\n\n🚗 Para zonas alejadas del GBA, consultanos disponibilidad.\n💻 Soporte remoto disponible para todo el país — muchos problemas se resuelven sin visita.", 'bot', [{text:"📞 Verificar mi zona", action:"llamar_ahora"}]);
            return;
        }
        if (m.includes('garantia') || m.includes('garantía')) {
            addMessage("🛡️ **Política de garantías:**\n\n💻 Software y formateos: **15 días**\n🔧 Mantenimiento físico: **30 días**\n📡 Redes e instalaciones: **90 días**\n📷 CCTV y alarmas: **90 días**\n\nSiempre te informamos la garantía aplicable antes de empezar. Si el problema reaparece dentro del período, revisamos sin cargo adicional.", 'bot');
            return;
        }
        if (m.includes('factura') || m.includes('cuit') || m.includes('fiscal') || m.includes('monotributo') || m.includes('responsable inscripto')) {
            addMessage("🧾 **Facturación:**\n\nSí, emitimos comprobante fiscal. Consultanos el tipo de facturación disponible según tu situación impositiva.", 'bot', [{text:"💬 Consultar por WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('abono') || m.includes('mensual') || m.includes('mantenimiento preventivo') || m.includes('soporte mensual') || m.includes('contrato')) {
            addMessage("📋 **Abonos de soporte mensual:**\n\n✅ Soporte remoto ante incidentes con tiempo de respuesta garantizado\n✅ Visitas técnicas periódicas programadas\n✅ Mantenimiento preventivo de equipos, red y sistemas\n✅ Backup automático configurado y monitoreado\n✅ Prioridad de atención ante urgencias\n✅ Informe mensual del estado de la infraestructura\n\nIdeal para pymes que no quieren depender de que algo se rompa para llamar. El precio se acuerda según equipos, cobertura y complejidad.", 'bot', [{text:"💬 Consultar plan de abono", action:"whatsapp_abono"}]);
            return;
        }
        if (m.includes('remoto') || m.includes('acceso remoto') || m.includes('sin visita') || m.includes('a distancia')) {
            addMessage("💻 **Soporte remoto:**\n\nSí, resolvemos muchos problemas 100% de forma remota — sin visita y sin esperar turno:\n\n✅ Problemas de software, Windows y programas\n✅ Configuración de correo, redes y VPN\n✅ Eliminación de virus y malware\n✅ Optimización de equipos lentos\n✅ Sistemas de gestión y ERP con problemas de conexión\n\n🕐 En la mayoría de los casos empezamos en menos de 2 horas en horario laboral.", 'bot', [{text:"💬 Iniciar soporte remoto", action:"whatsapp_urgente"}]);
            return;
        }

        // ── Categorías de servicio ─────────────────────────────────
        if (m.includes('ups') || m.includes('corte de luz') || m.includes('pico de tension') || m.includes('pico de tensión') || m.includes('bateria del ups') || m.includes('batería del ups') || m.includes('no aguanta la carga')) {
            addMessage("🔋 **UPS y Protección de Energía**\n\nInstalamos, asesoramos y hacemos mantenimiento de UPS para hogares, oficinas y servidores.\n\n💡 Un UPS no solo protege ante cortes — el tipo correcto también regula bajones y picos de tensión sin gastar la batería.\n\n¿Hacemos un diagnóstico para recomendarte el equipo correcto?", 'bot', [{text:"🔋 Sí, diagnóstico UPS", next:"iniciar_diag_ups"}, {text:"💡 Guía sobre UPS", action:"link_blog_ups"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('virus') || m.includes('ransomware') || m.includes('hackeo') || m.includes('hackearon') || m.includes('malware') || m.includes('antivirus') || m.includes('firewall') || m.includes('ciberseguridad') || m.includes('phishing') || m.includes('contraseña') || m.includes('me robaron datos')) {
            addMessage("🛡️ **Ciberseguridad**\n\nOfrecemos protección práctica para pymes y hogares: antivirus corporativo, red segura, backup y respuesta ante incidentes.\n\n⚠️ Si tenés un ransomware activo o creés que te hackearon, la acción tiene que ser inmediata.\n\n¿Hacemos un diagnóstico de tu situación?", 'bot', [{text:"🛡️ Diagnóstico de seguridad", next:"iniciar_diag_ciber"}, {text:"🚨 Es urgente — WhatsApp ahora", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('impresora') || m.includes('imprime mal') || m.includes('no imprime') || m.includes('scanner') || m.includes('escáner') || m.includes('multifuncion') || m.includes('multifunción') || m.includes('toner') || m.includes('tóner') || m.includes('cartucho')) {
            addMessage("🖨️ **Impresoras y Periféricos**\n\nReparamos y configuramos impresoras de tinta y láser, multifunciones, escáneres y otros periféricos.\n\n🔬 Los problemas más frecuentes son cabezales obstruidos, drivers en conflicto y colas de impresión trabadas — la mayoría se resuelven sin cambiar el equipo.\n\n¿Hacemos un diagnóstico?", 'bot', [{text:"🖨️ Diagnóstico de impresora", next:"iniciar_diag_impresoras"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('servidor') || m.includes('nas') || m.includes('raid') || m.includes('vmware') || m.includes('hyper-v') || m.includes('virtualización') || m.includes('sql server') || m.includes('base de datos') || m.includes('active directory')) {
            addMessage("🗄️ **Servidores y NAS**\n\nAtendemos servidores físicos, virtuales y NAS — con prioridad según el impacto en los usuarios.\n\n⚠️ Un RAID degradado o un servidor con discos al límite requiere atención urgente para evitar pérdida de datos.\n\n¿Hacemos un diagnóstico?", 'bot', [{text:"🗄️ Diagnóstico de servidor", next:"iniciar_diag_servidores"}, {text:"💬 WhatsApp urgente", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('voip') || m.includes('telefono ip') || m.includes('teléfono ip') || m.includes('pbx') || m.includes('asterisk') || m.includes('3cx') || m.includes('llamadas ip') || m.includes('no hay audio') || m.includes('se corta la llamada') || m.includes('interno') || m.includes('central telefonica')) {
            addMessage("📞 **Telefonía IP y VoIP**\n\nConfiguramos y reparamos sistemas VoIP, teléfonos IP, PBX (Asterisk, FreePBX, 3CX) y troncales SIP.\n\n🔬 El 80% de los problemas de audio en VoIP se resuelven configurando QoS correctamente en el router.\n\n¿Hacemos un diagnóstico de tu sistema?", 'bot', [{text:"📞 Diagnóstico VoIP", next:"iniciar_diag_voip"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('software') || m.includes('sistema') || m.includes('tango') || m.includes('bejerman') || m.includes('sap') || m.includes('pos') || m.includes('punto de venta') || m.includes('no abre el programa') || m.includes('no abre el sistema') || m.includes('erp') || m.includes('crm')) {
            addMessage("💼 **Software y Sistemas Empresariales**\n\nResolvemos problemas con sistemas de gestión, ERP, POS, bases de datos y software a medida.\n\n💻 La mayoría de estos casos se resuelven 100% de forma remota — sin necesidad de visita.\n\n¿Hacemos un diagnóstico?", 'bot', [{text:"💼 Diagnóstico de software", next:"iniciar_diag_software"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('blog') || m.includes('artículo') || m.includes('articulo') || m.includes('guía') || m.includes('guia') || m.includes('aprender') || m.includes('manual')) {
            addMessage("📚 **Artículos técnicos gratuitos:**\n\n📶 Por qué el WiFi no llega a todos los ambientes\n💾 6 señales de que tu disco está por fallar\n🔒 Qué hacer ante un ransomware\n🔧 Mantenimiento preventivo de PC\n🔋 UPS y protección de energía\n📷 Guía de cámaras de seguridad\n\nTodo en: **soportecyclops.com.ar/blog**", 'bot', [{text:"📚 Ver todos los artículos", action:"link_blog"}, {text:"💬 Consulta técnica", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('cámara') || m.includes('camara') || m.includes('cctv') || m.includes('vigilancia') || m.includes('dvr') || m.includes('nvr') || m.includes('no graba') || m.includes('imagen nocturna')) {
            addMessage("📷 **Cámaras de Seguridad / CCTV**\n\nInstalamos y reparamos sistemas IP y analógicos con acceso remoto desde el celular.\n\n💡 ¿Sabías que las cámaras WiFi son cómodas pero las IP por cable son más confiables y de mejor calidad para vigilancia real?\n\n¿Hacemos un diagnóstico?", 'bot', [{text:"📷 Diagnóstico CCTV", next:"iniciar_diag_camaras"}, {text:"💡 Guía de cámaras", action:"link_blog_camaras"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('wifi') || m.includes('wi-fi') || m.includes('internet lento') || m.includes('señal débil') || m.includes('red') || m.includes('router') || m.includes('modem') || m.includes('sin internet') || m.includes('no conecta')) {
            addMessage("📶 **Problemas de Red / Conectividad**\n\n🔬 Las causas más frecuentes de WiFi lento: canal 2.4GHz saturado por vecinos, router sin reinicio hace meses, o posicionamiento incorrecto del router.\n\n¿Hacemos un diagnóstico detallado o preferís arrancar por el artículo?", 'bot', [{text:"🔍 Diagnóstico de red", next:"iniciar_diag_redes"}, {text:"📖 Artículo sobre WiFi", action:"link_blog_wifi"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('alarma') || m.includes('cerco electrico') || m.includes('cerco eléctrico') || m.includes('control de acceso') || m.includes('sensor de movimiento') || m.includes('falsa alarma') || m.includes('monitoreo')) {
            addMessage("🚨 **Alarmas y Control de Acceso**\n\nInstalamos y reparamos sistemas de alarma, cercos eléctricos y control de acceso.\n\n💡 Una alarma con falsas alarmas frecuentes termina siendo ignorada — revisamos los sensores antes de que pase algo real.\n\n¿Hacemos un diagnóstico?", 'bot', [{text:"🚨 Diagnóstico de alarma", next:"iniciar_diag_alarmas"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('domotica') || m.includes('domótica') || m.includes('automatización') || m.includes('automatizacion') || m.includes('alexa') || m.includes('google home') || m.includes('smart home') || m.includes('luces inteligentes') || m.includes('enchufes inteligentes')) {
            addMessage("🏠 **Domótica y Automatización**\n\nAutomatizamos hogares y oficinas: iluminación, climatización, persianas, enchufes y seguridad.\n\n⚡ En la mayoría de los casos instalamos sin romper paredes — tecnología inalámbrica que se integra a tu infraestructura actual.\n\n¿Hacemos un diagnóstico?", 'bot', [{text:"🏠 Diagnóstico de domótica", next:"iniciar_diag_domotica"}, {text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
            return;
        }
        if (m.includes('página web') || m.includes('pagina web') || m.includes('sitio web') || m.includes('presencia web') || m.includes('paquete web') || m.includes('mi negocio en internet') || m.includes('seo') || m.includes('google ads') || m.includes('instagram ads')) {
            addMessage("🌐 **Presencia Web para Pymes**\n\nArmamos tu sitio web, dominio, casillas de mail profesional y te posicionamos en Google. Tenemos 3 paquetes: **Arranque, Presencia e Integral**.\n\nEl paquete Integral incluye soporte técnico mensual — ideal para pymes que quieren todo cubierto.", 'bot', [{text:"💬 Consultar paquetes web", action:"whatsapp_web"}]);
            return;
        }
        if (m.includes('urgente') || m.includes('urgencia') || m.includes('rapido') || m.includes('rápido') || m.includes('ahora') || m.includes('emergencia') || m.includes('critico') || m.includes('crítico')) {
            processFlow('consulta_urgente');
            return;
        }
        if (m.includes('pc') || m.includes('notebook') || m.includes('laptop') || m.includes('computadora') || m.includes('computador') || m.includes('no enciende') || m.includes('lento') || m.includes('pantalla negra') || m.includes('se colgó') || m.includes('se reinicia') || m.includes('tarda') || m.includes('virus')) {
            addMessage("💻 **Soporte Informático**\n\n🔬 Antes de ir a un diagnóstico completo: ¿el problema es que no enciende, está lento, o es un problema de software/sistema?\n\nTe puedo hacer unas preguntas para darte una evaluación técnica precisa.", 'bot', [
                {text:"🔍 Diagnóstico completo de PC", next:"iniciar_diag_pc"},
                {text:"💬 Describir el problema por WhatsApp", action:"whatsapp_urgente"}
            ]);
            return;
        }

        // Default — fallback mejorado
        addMessage("💡 **No encontré una categoría exacta para tu consulta, pero puedo ayudarte.**\n\nTenemos técnicos especializados en 12 áreas distintas. ¿Te gustaría hacer un diagnóstico guiado o preferís contarnos el problema directamente?", 'bot', [
            {text:"🔍 Ver todas las categorías",     next:"menu_diagnostico"},
            {text:"💬 Describir el problema directo", action:"whatsapp_urgente"}
        ]);
    }

    // ── FLUJO DE DIAGNÓSTICO ──────────────────────────────────────
    function startDiagFlow(flowKey) {
        var flow = diagFlows[flowKey];
        if (!flow) return;
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

    // ── PROCESAR Y ENVIAR DIAGNÓSTICO (sin cambios vs v4.1) ───────
    async function procesarYEnviarDiagnostico() {
        var result  = diagState.tempResult;
        var nombre  = diagState.answers.nombre || "Cliente";
        var email   = diagState.answers.email  || "";

        addMessage("⏳ Generando tu informe técnico...", 'bot');

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

        var servidor       = await enviarYObtenerDiagNum(payload);
        var diagNum        = servidor.diagNum;
        var pdfUrlServidor = servidor.pdfUrl || "";

        payload.diagNum    = diagNum;
        diagState.diagNum  = diagNum;

        guardarLocalDiag(payload);

        diagState.pdfUrlServidor = pdfUrlServidor;

        mostrarResultadoFinal(diagNum, nombre, result);
    }

    // ── ENVIAR A APPS SCRIPT Y OBTENER diagNum (sin cambios) ──────
    async function enviarYObtenerDiagNum(payload) {
        function fallbackLocal() {
            var hoy  = new Date();
            var dd   = String(hoy.getDate()).padStart(2, "0");
            var mm   = String(hoy.getMonth() + 1).padStart(2, "0");
            var aa   = String(hoy.getFullYear()).slice(-2);
            var rand = String(Math.floor(Math.random() * 8999) + 1000);
            console.warn("⚠️ Usando diagNum de fallback local");
            return { diagNum: "DIAG-" + dd + mm + aa + "-" + rand, pdfUrl: "" };
        }

        if (!CYCLOPS_CONFIG.appsScriptUrl || CYCLOPS_CONFIG.appsScriptUrl.includes("TU_ID")) {
            console.warn("⚠️ appsScriptUrl no configurado — usando fallback local");
            return fallbackLocal();
        }

        try {
            var fd = new FormData();
            fd.append('payload', JSON.stringify(payload));

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
                console.log("✅ diagNum:", data.diagNum, "| pdfUrl:", data.pdfUrl || "(sin PDF)");
                return { diagNum: data.diagNum, pdfUrl: data.pdfUrl || "" };
            } else {
                console.warn("⚠️ Apps Script sin diagNum:", data);
                return fallbackLocal();
            }

        } catch (err) {
            console.warn("⚠️ Error al contactar Apps Script:", err.message);
            return fallbackLocal();
        }
    }

    function mostrarResultadoFinal(diagNum, nombre, result) {
        var report = "✅ **" + result.icono + " " + result.titulo + "**\n\n📌 **Nº de Diagnóstico: " + diagNum + "**\n\n" + result.resumen + "\n\n**Evaluación técnica:**\n";
        result.pasos.forEach(function(paso, i){
            if (paso && paso.trim()) report += (i+1) + ". " + paso + "\n";
        });
        var waMsg = encodeURIComponent("Hola! Completé el diagnóstico online.\nNúmero: *" + diagNum + "*\nNombre: " + nombre + "\nServicio: " + result.servicio + "\nProblema: " + result.sintomaLabel + "\n¿Me pueden contactar?");
        var pdfUrlServidor = diagState.pdfUrlServidor || "";
        window.__lastDiagData = {
            diagNum:      diagNum,
            nombre:       nombre,
            fecha:        new Date().toLocaleString('es-AR'),
            titulo:       result.titulo,
            icono:        result.icono,
            servicio:     result.servicio,
            sintoma:      result.sintomaLabel,
            equipo:       result.equipoLabel,
            severidad:    result.severidad,
            resumen:      result.resumen,
            riskWarning:  result.riskWarning,
            pasos:        result.pasos,
            pdfUrl:       pdfUrlServidor
        };
        var pdfAction = pdfUrlServidor ? "__pdf_drive__" + pdfUrlServidor : "descargar_pdf_diag";
        var pdfText   = pdfUrlServidor ? "📄 Descargar informe PDF" : "📄 Generar informe PDF";
        addMessage(report, 'bot', [
            { text:"💬 Enviar diagnóstico al técnico", action:"__whatsapp_diag__" + waMsg },
            { text:pdfText,                            action:pdfAction },
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

    // ── RENDERIZADO ───────────────────────────────────────────────
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

    // ── PROCESADOR DE FLOWS ───────────────────────────────────────
    function processFlow(flowKey) {
        if (flowKey === 'iniciar_diag_pc')          { startDiagFlow('pc_diagnostico');          return; }
        if (flowKey === 'iniciar_diag_impresoras')   { startDiagFlow('impresoras_diagnostico');  return; }
        if (flowKey === 'iniciar_diag_servidores')   { startDiagFlow('servidores_diagnostico');  return; }
        if (flowKey === 'iniciar_diag_redes')        { startDiagFlow('redes_diagnostico');       return; }
        if (flowKey === 'iniciar_diag_voip')         { startDiagFlow('voip_diagnostico');        return; }
        if (flowKey === 'iniciar_diag_camaras')      { startDiagFlow('camaras_diagnostico');     return; }
        if (flowKey === 'iniciar_diag_alarmas')      { startDiagFlow('alarmas_diagnostico');     return; }
        if (flowKey === 'iniciar_diag_domotica')     { startDiagFlow('domotica_diagnostico');    return; }
        if (flowKey === 'iniciar_diag_ciber')        { startDiagFlow('ciber_diagnostico');       return; }
        if (flowKey === 'iniciar_diag_ups')          { startDiagFlow('ups_diagnostico');         return; }
        if (flowKey === 'iniciar_diag_software')     { startDiagFlow('software_diagnostico');    return; }

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
            var m2 = intelligentResponses['menu_diagnostico'];
            addMessage(m2.message, 'bot', m2.options);
            return;
        }
        if (intelligentResponses[flowKey]) {
            var r = intelligentResponses[flowKey];
            addMessage(r.message, 'bot', r.options);
        } else {
            addMessage("💡 **Te recomiendo que hablemos para evaluar tu caso específico.**", 'bot', [
                { text:"📅 Coordinar consulta", action:"agendar_consulta" },
                { text:"🔍 Ver categorías",      next:"menu_diagnostico" }
            ]);
        }
    }

    // ── MANEJADOR DE ACCIONES (sin cambios en lógica de envío) ────
    function handleAction(action) {
        if (action.startsWith('__whatsapp_diag__')) {
            window.open("https://wa.me/" + CYCLOPS_CONFIG.whatsapp + "?text=" + action.replace('__whatsapp_diag__',''), '_blank');
            addMessage("💬 Abriendo WhatsApp con tu diagnóstico adjunto...\n\nNuestro técnico lo va a revisar antes de contactarte.", 'bot');
            return;
        }
        if (action.startsWith('__pdf_drive__')) {
            var url = action.replace('__pdf_drive__', '');
            var link = document.createElement('a');
            link.href = url; link.target = '_blank'; link.rel = 'noopener';
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            addMessage("📄 **Abriendo tu informe en Google Drive...**\n\nEl PDF se abre en una nueva pestaña. Desde ahí podés descargarlo con el ícono de descarga.", 'bot');
            return;
        }
        if (action === 'descargar_pdf_diag') {
            var data = window.__lastDiagData || null;
            if (!data) { addMessage("❌ No se encontraron datos del diagnóstico. Completá el diagnóstico primero.", 'bot'); return; }
            generarPDFDiagnostico(data);
            addMessage("📄 **Generando tu informe PDF...**\n\nEl archivo se descarga automáticamente en tu dispositivo.", 'bot');
            return;
        }
        switch(action) {
            case 'llamar_ahora':
                window.open("tel:" + CYCLOPS_CONFIG.telefono.replace(/\s/g,''));
                addMessage("📞 **Conectándote por teléfono...**\n\nSi no funciona, marcá directo al: " + CYCLOPS_CONFIG.telefono, 'bot');
                break;
            case 'whatsapp_urgente':
                window.open("https://wa.me/" + CYCLOPS_CONFIG.whatsapp + "?text=" + encodeURIComponent('¡Hola! Necesito ayuda técnica. ¿Me pueden asistir?'), '_blank');
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
                    { text:"⏰ Horarios de atención",      action:"info_horarios" },
                    { text:"💰 Precios y garantías",       action:"info_precios" },
                    { text:"📍 Zona de cobertura",         action:"info_zona" },
                    { text:"💻 Soporte remoto",            action:"info_remoto" },
                    { text:"📚 Artículos del blog",        action:"link_blog" }
                ]);
                break;
            case 'info_horarios':
                addMessage("⏰ **Horarios:**\n\n📅 Lunes a Viernes: 9:00 a 18:00 hs\n📅 Sábados: 9:00 a 13:00 hs\n📅 Domingos: Cerrado\n\n⚡ Urgencias fuera de horario: WhatsApp.", 'bot', [{text:"💬 WhatsApp", action:"whatsapp_urgente"}]);
                break;
            case 'info_precios':
                addMessage("💰 **Precios y garantías:**\n\n✅ Consulta remota inicial **sin cargo**\n✅ Presupuesto antes de empezar, siempre\n✅ Garantía: 15 días software / 30 días hardware / 90 días instalaciones\n\nSin sorpresas — todo acordado antes de tocar nada.", 'bot', [{text:"💬 Solicitar presupuesto", action:"whatsapp_urgente"}]);
                break;
            case 'info_zona':
                addMessage("📍 **Zona de cobertura:**\n\n✅ Ciudad Autónoma de Buenos Aires (CABA)\n✅ Gran Buenos Aires — Zona Norte, Sur y Oeste\n💻 Soporte remoto para todo el país.\n\n🚗 Zonas alejadas: consultamos disponibilidad.", 'bot', [{text:"📞 Verificar mi zona", action:"llamar_ahora"}]);
                break;
            case 'info_remoto':
                addMessage("💻 **Soporte remoto:**\n\nResolvemos muchos problemas sin visita:\n✅ Software, Windows, programas\n✅ Configuración de red, correo, VPN\n✅ Virus y malware\n✅ Sistemas de gestión y ERP\n\n🕐 Tiempo de respuesta: menos de 2 horas en horario laboral.", 'bot', [{text:"💬 Iniciar soporte remoto", action:"whatsapp_urgente"}]);
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

    // ── PERSISTENCIA ──────────────────────────────────────────────
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

    // ── EVENTOS ───────────────────────────────────────────────────
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
    console.log("✅ Chatbot Cyclops v5.0 inicializado correctamente");
}

// ═══════════════════════════════════════════════════════════════
// GENERADOR DE PDF — usa jsPDF (cargado bajo demanda)
// Se define FUERA de initChatbot para ser accesible globalmente
// ═══════════════════════════════════════════════════════════════
function generarPDFDiagnostico(data) {
    function cargarJsPDF(callback) {
        if (window.jspdf && window.jspdf.jsPDF) { callback(); return; }
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = callback;
        script.onerror = function() {
            alert('No se pudo cargar la librería de PDF. Verificá tu conexión a internet.');
        };
        document.head.appendChild(script);
    }

    cargarJsPDF(function() {
        var jsPDF = window.jspdf.jsPDF;
        var doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        var azulOscuro = [26, 58, 92];
        var azul       = [37, 99, 235];
        var gris       = [71, 85, 105];
        var grisClaroF = [248, 250, 252];
        var grislista  = [241, 245, 249];
        var rojo       = [239, 68, 68];
        var amarillo   = [245, 158, 11];
        var verde      = [34, 197, 94];

        var pageW  = 210;
        var pageH  = 297;
        var marginL = 18;
        var marginR = 18;
        var contentW = pageW - marginL - marginR;
        var y = 0;

        doc.setFillColor(azulOscuro[0], azulOscuro[1], azulOscuro[2]);
        doc.rect(0, 0, pageW, 42, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Soporte Cyclops', marginL, 16);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 210, 240);
        doc.text('Técnico IT a domicilio · CABA y GBA · soportecyclops.com.ar', marginL, 23);

        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORME DE DIAGNÓSTICO TÉCNICO', marginL, 33);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 200, 255);
        doc.text(data.diagNum || '—', pageW - marginR, 16, { align: 'right' });
        doc.text(data.fecha || '', pageW - marginR, 23, { align: 'right' });

        y = 52;

        doc.setFillColor(grisClaroF[0], grisClaroF[1], grisClaroF[2]);
        doc.roundedRect(marginL, y, contentW, 26, 3, 3, 'F');
        doc.setDrawColor(220, 228, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(marginL, y, contentW, 26, 3, 3, 'S');

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(gris[0], gris[1], gris[2]);
        doc.text('CLIENTE', marginL + 5, y + 7);
        doc.text('SERVICIO', marginL + 60, y + 7);
        doc.text('Nº DIAGNÓSTICO', marginL + 120, y + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(azulOscuro[0], azulOscuro[1], azulOscuro[2]);
        doc.text(data.nombre || '—', marginL + 5, y + 16);

        doc.setFontSize(9);
        var servicioText = doc.splitTextToSize(data.servicio || '—', 54);
        doc.text(servicioText[0], marginL + 60, y + 16);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(azul[0], azul[1], azul[2]);
        doc.text(data.diagNum || '—', marginL + 120, y + 16);

        y += 34;

        var sevMap = {
            critica: { label: '🔴  RIESGO CRÍTICO',    color: rojo },
            alta:    { label: '🟠  RIESGO ELEVADO',     color: amarillo },
            media:   { label: '🟡  A TENER EN CUENTA', color: [234, 179, 8] },
            baja:    { label: '🟢  SITUACIÓN ESTABLE', color: verde }
        };
        var sev = (data.severidad || 'media').toLowerCase();
        var sevInfo = sevMap[sev] || sevMap['media'];
        var sevColor = sevInfo.color;

        doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
        doc.setGlobalAlpha(0.12);
        doc.roundedRect(marginL, y, contentW, 10, 2, 2, 'F');
        doc.setGlobalAlpha(1);
        doc.setDrawColor(sevColor[0], sevColor[1], sevColor[2]);
        doc.setLineWidth(0.4);
        doc.roundedRect(marginL, y, contentW, 10, 2, 2, 'S');
        doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
        doc.rect(marginL, y, 3, 10, 'F');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
        doc.text(sevInfo.label, marginL + 7, y + 6.5);

        y += 16;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(azulOscuro[0], azulOscuro[1], azulOscuro[2]);
        doc.text('SÍNTOMA PRINCIPAL', marginL, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(gris[0], gris[1], gris[2]);
        var sintomaLines = doc.splitTextToSize((data.sintoma || data.resumen || '—'), contentW);
        doc.text(sintomaLines, marginL, y);
        y += sintomaLines.length * 5 + 6;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(azulOscuro[0], azulOscuro[1], azulOscuro[2]);
        doc.text('RESUMEN DEL DIAGNÓSTICO', marginL, y);
        y += 5;

        var resumenLimpio = (data.resumen || '').replace(/\n\n💰.*$/s, '').trim();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(gris[0], gris[1], gris[2]);
        var resLines = doc.splitTextToSize(resumenLimpio, contentW);
        doc.text(resLines, marginL, y);
        y += resLines.length * 4.5 + 8;

        if (data.riskWarning) {
            doc.setFillColor(255, 251, 235);
            doc.roundedRect(marginL, y, contentW, 2, 1, 1, 'F');
            var riskLines = doc.splitTextToSize('⚠  ' + data.riskWarning, contentW - 10);
            var riskH = riskLines.length * 4.5 + 8;
            doc.setFillColor(255, 251, 235);
            doc.roundedRect(marginL, y, contentW, riskH, 2, 2, 'F');
            doc.setFillColor(245, 158, 11);
            doc.rect(marginL, y, 3, riskH, 'F');
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(120, 60, 0);
            doc.text('NOTA TÉCNICA DE RIESGO', marginL + 7, y + 5.5);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            var riskLinesBody = doc.splitTextToSize(data.riskWarning, contentW - 10);
            doc.text(riskLinesBody, marginL + 7, y + 11);
            y += riskH + 8;
        }

        if (data.pasos && data.pasos.length > 0) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(azulOscuro[0], azulOscuro[1], azulOscuro[2]);
            doc.text('EVALUACIÓN TÉCNICA Y PASOS RECOMENDADOS', marginL, y);
            y += 6;

            var pasoIdx = 0;
            data.pasos.forEach(function(paso) {
                var pasoLimpio = paso
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .replace(/^\d+\.\s*/, '')
                    .replace(/[🔴🟠🟡🟢✅⚠🚨🔍🏠⏱🧹🔐📋🔧🔋📡📷🎓💡🏢🗄📊🛡🦠📶🎥⚙🔊🖨️📞💼💻🌡️🔌🌐📱🗣️⏰💳🌿🔑📧]/gu, '')
                    .trim();

                if (!pasoLimpio) return;
                pasoIdx++;

                var pasoLines = doc.splitTextToSize(pasoIdx + '. ' + pasoLimpio, contentW - 14);
                var pasoH = pasoLines.length * 4.5 + 5;

                if (y + pasoH > pageH - 30) {
                    doc.addPage();
                    y = 20;
                }

                if (pasoIdx % 2 === 1) {
                    doc.setFillColor(grislista[0], grislista[1], grislista[2]);
                    doc.roundedRect(marginL, y - 2, contentW, pasoH, 2, 2, 'F');
                }

                doc.setFillColor(azul[0], azul[1], azul[2]);
                doc.circle(marginL + 5, y + pasoH/2 - 3, 3.5, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.text(String(pasoIdx), marginL + 5, y + pasoH/2 - 1.5, { align: 'center' });

                doc.setTextColor(gris[0], gris[1], gris[2]);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.text(pasoLines, marginL + 12, y + 3.5);
                y += pasoH + 2;
            });
        }

        var totalPages = doc.getNumberOfPages();
        for (var pg = 1; pg <= totalPages; pg++) {
            doc.setPage(pg);
            doc.setDrawColor(220, 228, 240);
            doc.setLineWidth(0.3);
            doc.line(marginL, pageH - 18, pageW - marginR, pageH - 18);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(150, 160, 180);
            doc.text(
                'Soporte Cyclops · +54 9 11 6680-4450 · contacto@soportecyclops.com.ar · soportecyclops.com.ar',
                pageW / 2, pageH - 12, { align: 'center' }
            );
            doc.text(
                'CABA y Gran Buenos Aires · Este informe es orientativo y no reemplaza el diagnóstico técnico presencial.',
                pageW / 2, pageH - 7, { align: 'center' }
            );
            doc.text('Página ' + pg + ' de ' + totalPages, pageW - marginR, pageH - 10, { align: 'right' });
        }

        var fileName = 'diagnostico-' + (data.diagNum || 'cyclops').replace(/[^A-Z0-9-]/gi, '-') + '.pdf';
        doc.save(fileName);
    });
}
