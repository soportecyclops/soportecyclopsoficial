// ===========================
// CHATBOT INTELIGENTE — Soporte Cyclops v5.0
// Motor: IA real vía FastAPI + OpenClaw
// Mantiene: PDF, WhatsApp, diagNum desde Apps Script
// ===========================

const CYCLOPS_CONFIG = {
    whatsapp:      "5491166804450",
    telefono:      "+54 9 11 6680-4450",
    email:         "contacto@soportecyclops.com.ar",
    sitio:         "www.soportecyclops.com.ar",
    logoUrl:       "https://www.soportecyclops.com.ar/public/images/logo-icon.png",
    appsScriptUrl: "https://script.google.com/macros/s/AKfycbwjVWP25ZqWa3C0IuQ6rgHYxv1r4iqM5N5916i9gLYuKFEEC3nDyMh74RdG5T8Iv4_w/exec",
    // ── NUEVO: endpoint de IA en la VM ──
    iaEndpoint:    "https://chatbotdemo.soportecyclops.com.ar/chat/soporte"
};

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    console.log("🚀 Inicializando Chatbot Cyclops v5.0 (IA real)...");
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

    // Session ID único por visita
    var sessionId = 'web-' + Math.random().toString(36).substr(2, 12);

    // Estado del diagnóstico (para PDF y WhatsApp al finalizar)
    var diagState = {
        active:           false,
        waitingForName:   false,
        waitingForEmail:  false,
        answers:          {},
        diagNum:          null,
        pdfUrlServidor:   null
    };

    var conversationHistory = [];
    var isTyping = false;

    // ── APERTURA / CIERRE ─────────────────────────────────────────────────────
    chatbotToggle.addEventListener('click', function() {
        chatbotWindow.classList.toggle('active');
        if (notificationDot) notificationDot.classList.remove('active');
        if (conversationHistory.length === 0) {
            addMessage(
                "¡Hola! 👋 Soy el **Asistente Cyclops** con IA.\n\nEstoy aquí para ayudarte con cualquier problema técnico. Contame qué está pasando y te ayudo a resolverlo.",
                'bot',
                [
                    { text:"🔧 Tengo un problema técnico", action:"iniciar_soporte" },
                    { text:"💬 Consulta general",          action:"consulta_general" },
                    { text:"📞 Llamar ahora",              action:"llamar_ahora" }
                ]
            );
        }
    });
    chatbotClose.addEventListener('click', function() {
        chatbotWindow.classList.remove('active');
    });

    // ── ENVÍO ─────────────────────────────────────────────────────────────────
    function sendMessage() {
        var msg = chatbotInput.value.trim();
        if (!msg || isTyping) return;
        addMessage(msg, 'user');
        chatbotInput.value = '';
        processInput(msg);
    }

    // ── PROCESAR INPUT ────────────────────────────────────────────────────────
    function processInput(msg) {
        // Captura de nombre para el informe
        if (diagState.waitingForName) {
            diagState.answers.nombre  = msg;
            diagState.waitingForName  = false;
            diagState.waitingForEmail = true;
            addMessage(
                "Perfecto, **" + msg + "**.\n\n¿A qué email te enviamos el informe? (Escribí \"no\" para omitirlo)",
                'bot'
            );
            return;
        }

        // Captura de email
        if (diagState.waitingForEmail) {
            var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg);
            diagState.answers.email   = (msg.toLowerCase() === "no" || !emailOk) ? "" : msg;
            diagState.waitingForEmail = false;
            generarInforme();
            return;
        }

        // Enviar a la IA
        sendToIA(msg);
    }

    // ── LLAMADA A LA IA (FastAPI + OpenClaw) ──────────────────────────────────
    async function sendToIA(msg) {
        isTyping = true;
        showTypingIndicator();

        try {
            var res = await fetch(CYCLOPS_CONFIG.iaEndpoint, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    mensaje:    msg,
                    session_id: sessionId,
                    canal:      'web'
                })
            });

            hideTypingIndicator();

            if (!res.ok) throw new Error('HTTP ' + res.status);

            var data = await res.json();
            var respuesta = data.respuesta || "Sin respuesta del servidor.";

            // Detectar si la IA completó un diagnóstico (palabras clave)
            var esDiagnostico = detectarDiagnostico(respuesta);

            addMessage(respuesta, 'bot', esDiagnostico ? [
                { text:"📄 Generar informe PDF",       action:"pedir_nombre_informe" },
                { text:"💬 Enviar al técnico",         action:"whatsapp_con_contexto" },
                { text:"🔄 Continuar conversación",    action:"continuar" }
            ] : []);

        } catch(err) {
            hideTypingIndicator();
            console.error("Error IA:", err);
            // Fallback: respuesta local básica
            addMessage(
                "Hubo un problema al conectarme con el asistente. Podés contactarnos directamente:",
                'bot',
                [
                    { text:"💬 WhatsApp",  action:"whatsapp_urgente" },
                    { text:"📞 Llamar",    action:"llamar_ahora" }
                ]
            );
        }

        isTyping = false;
    }

    // ── DETECTAR SI LA IA DIO UN DIAGNÓSTICO COMPLETO ────────────────────────
    function detectarDiagnostico(texto) {
        var palabrasClave = [
            'diagnóstico', 'problema detectado', 'solución recomendada',
            'recomiendo', 'te sugiero', 'lo que necesitás',
            'pasos a seguir', 'presupuesto', 'servicio recomendado'
        ];
        var t = texto.toLowerCase();
        return palabrasClave.some(function(p) { return t.includes(p); });
    }

    // ── PEDIR NOMBRE PARA EL INFORME ──────────────────────────────────────────
    function pedirNombreInforme() {
        diagState.active          = true;
        diagState.waitingForName  = true;
        addMessage("¿A nombre de quién querés que figure el informe?", 'bot');
    }

    // ── GENERAR INFORME (diagNum desde servidor + PDF) ────────────────────────
    async function generarInforme() {
        var nombre = diagState.answers.nombre || "Cliente";
        var email  = diagState.answers.email  || "";

        addMessage("⏳ Generando tu informe técnico...", 'bot');

        // Construir resumen desde el historial de la conversación
        var resumen = construirResumenConversacion();

        var payload = {
            fecha:      new Date().toLocaleString('es-AR'),
            nombre:     nombre,
            email:      email,
            servicio:   "Soporte Técnico IA",
            sintoma:    resumen.sintoma,
            equipo:     resumen.equipo,
            duracion:   "",
            resumen:    resumen.texto,
            riskWarning:"Diagnóstico generado por IA. Se recomienda revisión técnica presencial para confirmación.",
            severidad:  "media",
            pasos:      resumen.pasos,
            logoUrl:    CYCLOPS_CONFIG.logoUrl,
            sitio:      CYCLOPS_CONFIG.sitio
        };

        // Obtener diagNum del servidor
        var servidor      = await enviarYObtenerDiagNum(payload);
        var diagNum       = servidor.diagNum;
        var pdfUrlSrv     = servidor.pdfUrl || "";

        payload.diagNum         = diagNum;
        diagState.diagNum       = diagNum;
        diagState.pdfUrlServidor = pdfUrlSrv;

        // Guardar para generarPDFDiagnostico()
        window.__lastDiagData = {
            diagNum:     diagNum,
            nombre:      nombre,
            fecha:       new Date().toLocaleString('es-AR'),
            titulo:      "Diagnóstico Técnico IA",
            icono:       "🤖",
            servicio:    "Soporte Técnico IA",
            sintoma:     resumen.sintoma,
            equipo:      resumen.equipo,
            severidad:   "media",
            resumen:     resumen.texto,
            riskWarning: payload.riskWarning,
            pasos:       resumen.pasos,
            pdfUrl:      pdfUrlSrv
        };

        var waMsg = encodeURIComponent(
            "Hola! Completé un diagnóstico con el asistente IA.\nNúmero: *" + diagNum + "*\n" +
            "Nombre: " + nombre + "\nProblema: " + resumen.sintoma + "\n¿Me pueden contactar?"
        );

        var pdfAction = pdfUrlSrv ? '__pdf_drive__' + pdfUrlSrv : 'descargar_pdf_diag';
        var pdfText   = pdfUrlSrv ? '📄 Descargar informe PDF' : '📄 Generar informe PDF';

        addMessage(
            "✅ **Informe generado**\n\n📌 **Nº: " + diagNum + "**\n\n" + resumen.texto,
            'bot',
            [
                { text:"💬 Enviar al técnico", action:"__whatsapp_diag__" + waMsg },
                { text: pdfText,              action: pdfAction },
                { text:"🔄 Continuar",        action:"continuar" }
            ]
        );
    }

    // ── CONSTRUIR RESUMEN DESDE EL HISTORIAL ──────────────────────────────────
    function construirResumenConversacion() {
        var mensajesUsuario = conversationHistory
            .filter(function(m) { return m.sender === 'user'; })
            .map(function(m) { return m.text; });

        var mensajesBot = conversationHistory
            .filter(function(m) { return m.sender === 'bot' && m.text.length > 80; })
            .map(function(m) { return m.text; });

        var sintoma  = mensajesUsuario[0] || "Consulta técnica";
        var ultimaIA = mensajesBot[mensajesBot.length - 1] || "Diagnóstico en proceso.";

        // Extraer pasos de la última respuesta de la IA (líneas numeradas)
        var pasos = [];
        ultimaIA.split('\n').forEach(function(linea) {
            if (/^\d+[\.\)]/.test(linea.trim())) {
                pasos.push(linea.replace(/^\d+[\.\)]\s*/, '').replace(/\*\*/g, '').trim());
            }
        });
        if (pasos.length === 0) {
            pasos = ["Diagnóstico realizado por asistente IA. Contactar al técnico para confirmar."];
        }

        return {
            sintoma: sintoma.substring(0, 120),
            equipo:  "Dispositivo del cliente",
            texto:   mensajesUsuario.join(' → ').substring(0, 400),
            pasos:   pasos.slice(0, 6)
        };
    }

    // ── ENVIAR A APPS SCRIPT Y OBTENER diagNum ────────────────────────────────
    async function enviarYObtenerDiagNum(payload) {
        function fallbackLocal() {
            var hoy  = new Date();
            var dd   = String(hoy.getDate()).padStart(2, "0");
            var mm   = String(hoy.getMonth() + 1).padStart(2, "0");
            var aa   = String(hoy.getFullYear()).slice(-2);
            var rand = String(Math.floor(Math.random() * 8999) + 1000);
            return { diagNum: "DIAG-" + dd + mm + aa + "-" + rand, pdfUrl: "" };
        }

        if (!CYCLOPS_CONFIG.appsScriptUrl || CYCLOPS_CONFIG.appsScriptUrl.includes("TU_ID")) {
            return fallbackLocal();
        }

        try {
            var fd = new FormData();
            fd.append('payload', JSON.stringify(payload));
            var response = await fetch(CYCLOPS_CONFIG.appsScriptUrl, { method: "POST", body: fd });
            if (!response.ok) return fallbackLocal();
            var data = await response.json();
            if (data && data.ok && data.diagNum) {
                return { diagNum: data.diagNum, pdfUrl: data.pdfUrl || "" };
            }
            return fallbackLocal();
        } catch (err) {
            console.warn("⚠️ Apps Script no disponible:", err.message);
            return fallbackLocal();
        }
    }

    // ── TYPING INDICATOR ──────────────────────────────────────────────────────
    function showTypingIndicator() {
        var existing = document.querySelector('.typing-indicator');
        if (existing) return;
        var div = document.createElement('div');
        div.classList.add('message', 'bot', 'typing-indicator');
        var content = document.createElement('div');
        content.classList.add('message-content');
        content.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
        div.appendChild(content);
        chatbotMessages.appendChild(div);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        var el = document.querySelector('.typing-indicator');
        if (el) el.remove();
    }

    // ── RENDERIZADO ───────────────────────────────────────────────────────────
    function addMessage(text, sender, options) {
        options = options || [];
        var md = { text: text, sender: sender, options: options, timestamp: Date.now() };
        conversationHistory.push(md);
        renderMessage(md);
        saveConversation();
    }

    function renderMessage(md) {
        var div = document.createElement('div');
        div.classList.add('message', md.sender);
        var content = document.createElement('div');
        content.classList.add('message-content');

        // Renderizar markdown básico (negrita, saltos de línea, listas numeradas)
        var html = md.text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')
            .replace(/\n/g, '<br>');

        var textEl = document.createElement('div');
        textEl.innerHTML = html;
        content.appendChild(textEl);

        if (md.options && md.options.length > 0) {
            var optsDiv = document.createElement('div');
            optsDiv.classList.add('service-options');
            md.options.forEach(function(opt) {
                var btn = document.createElement('button');
                btn.classList.add('service-option');
                btn.textContent = opt.text;
                if (opt.action) {
                    btn.addEventListener('click', function() { handleAction(opt.action); });
                } else if (opt.next) {
                    btn.addEventListener('click', function() {
                        addMessage(opt.text, 'user');
                        setTimeout(function() { processInput(opt.text); }, 400);
                    });
                }
                optsDiv.appendChild(btn);
            });
            content.appendChild(optsDiv);
        }

        div.appendChild(content);
        chatbotMessages.appendChild(div);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // ── MANEJADOR DE ACCIONES ─────────────────────────────────────────────────
    function handleAction(action) {

        if (action.startsWith('__whatsapp_diag__')) {
            window.open("https://wa.me/" + CYCLOPS_CONFIG.whatsapp + "?text=" + action.replace('__whatsapp_diag__', ''), '_blank');
            addMessage("💬 Abriendo WhatsApp con tu diagnóstico...", 'bot');
            return;
        }

        if (action.startsWith('__pdf_drive__')) {
            var url = action.replace('__pdf_drive__', '');
            var link = document.createElement('a');
            link.href = url; link.target = '_blank'; link.rel = 'noopener';
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            addMessage("📄 Abriendo tu informe en Google Drive...", 'bot');
            return;
        }

        if (action === 'descargar_pdf_diag') {
            var data = window.__lastDiagData || null;
            if (!data) { addMessage("❌ Completá el diagnóstico primero.", 'bot'); return; }
            generarPDFDiagnostico(data);
            addMessage("📄 Generando PDF...", 'bot');
            return;
        }

        if (action === 'pedir_nombre_informe') {
            pedirNombreInforme();
            return;
        }

        if (action === 'continuar') {
            addMessage("¿En qué más puedo ayudarte?", 'bot');
            return;
        }

        if (action === 'iniciar_soporte') {
            addMessage("Contame qué está pasando con tu equipo o red. Con los detalles que me des, voy a analizar el problema y orientarte.", 'bot');
            return;
        }

        if (action === 'whatsapp_con_contexto') {
            var resumen = construirResumenConversacion();
            var msg = encodeURIComponent(
                "Hola! Hablé con el asistente IA de Soporte Cyclops.\n\nProblema: " + resumen.sintoma +
                "\n\n¿Me pueden ayudar?"
            );
            window.open("https://wa.me/" + CYCLOPS_CONFIG.whatsapp + "?text=" + msg, '_blank');
            addMessage("💬 Abriendo WhatsApp con el resumen de tu consulta...", 'bot');
            return;
        }

        switch(action) {
            case 'llamar_ahora':
                window.open("tel:" + CYCLOPS_CONFIG.telefono.replace(/\s/g, ''));
                addMessage("📞 Conectándote al " + CYCLOPS_CONFIG.telefono, 'bot');
                break;
            case 'whatsapp_urgente':
                window.open("https://wa.me/" + CYCLOPS_CONFIG.whatsapp + "?text=" + encodeURIComponent('¡Hola! Necesito ayuda técnica urgente.'), '_blank');
                addMessage("💬 Abriendo WhatsApp...", 'bot');
                break;
            case 'consulta_general':
                addMessage("Podés preguntarme lo que quieras — horarios, precios, zona de cobertura, o directamente contarme tu problema técnico.", 'bot');
                break;
            case 'agendar_consulta':
                addMessage("📅 Podés agendar una consulta por WhatsApp. La consulta remota inicial es **sin cargo**.", 'bot', [
                    { text:"💬 Agendar por WhatsApp", action:"whatsapp_urgente" }
                ]);
                break;
            default:
                addMessage("💡 Para contacto directo: " + CYCLOPS_CONFIG.telefono, 'bot', [
                    { text:"💬 WhatsApp", action:"whatsapp_urgente" }
                ]);
        }
    }

    // ── PERSISTENCIA ──────────────────────────────────────────────────────────
    function saveConversation() {
        try {
            localStorage.setItem('cyclopsChatbotConversation', JSON.stringify(conversationHistory));
        } catch(e) {}
    }

    function loadConversation() {
        try {
            var saved = localStorage.getItem('cyclopsChatbotConversation');
            if (saved) {
                var parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    conversationHistory = parsed;
                    chatbotMessages.innerHTML = '';
                    conversationHistory.forEach(function(msg) { renderMessage(msg); });
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
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Botones de quick questions en la página
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.quick-question')) return;
        var button   = e.target.closest('.quick-question');
        var action   = button.getAttribute('data-action');
        var question = button.getAttribute('data-question');
        if (action === 'pc_problemas') {
            chatbotWindow.classList.add('active');
            addMessage("Tengo un problema técnico y quiero diagnóstico", 'user');
            setTimeout(function() { sendToIA("Hola, quiero hacer un diagnóstico técnico de mi equipo"); }, 400);
        } else if (question) {
            chatbotWindow.classList.add('active');
            addMessage(button.textContent.trim(), 'user');
            setTimeout(function() { sendToIA(button.textContent.trim()); }, 400);
        }
    });

    // Botones de sugerencias
    document.querySelectorAll('.suggestion-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            chatbotWindow.classList.add('active');
            addMessage(btn.textContent.trim(), 'user');
            setTimeout(function() { sendToIA(btn.textContent.trim()); }, 400);
        });
    });

    loadConversation();
    console.log("✅ Chatbot Cyclops v5.0 (IA real) inicializado.");
}

// ── AGREGAR CSS PARA TYPING DOTS (si no está en el HTML) ─────────────────────
(function injectTypingCSS() {
    if (document.getElementById('cyclops-typing-css')) return;
    var style = document.createElement('style');
    style.id = 'cyclops-typing-css';
    style.textContent = [
        '.typing-dot {',
        '  display: inline-block;',
        '  width: 7px; height: 7px;',
        '  background: #94a3b8;',
        '  border-radius: 50%;',
        '  margin: 0 2px;',
        '  animation: typingBounce 1.2s infinite;',
        '}',
        '.typing-dot:nth-child(2) { animation-delay: 0.2s; }',
        '.typing-dot:nth-child(3) { animation-delay: 0.4s; }',
        '@keyframes typingBounce {',
        '  0%,60%,100% { transform: translateY(0); }',
        '  30% { transform: translateY(-6px); }',
        '}'
    ].join('\n');
    document.head.appendChild(style);
})();

// ═══════════════════════════════════════════════════════════════
// GENERADOR DE PDF — igual que v4.1, compatible con cliente.html
// ═══════════════════════════════════════════════════════════════
function generarPDFDiagnostico(data) {
    function cargarJsPDF(callback) {
        if (window.jspdf && window.jspdf.jsPDF) { callback(); return; }
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = callback;
        script.onerror = function() { alert('No se pudo cargar la librería de PDF. Verificá tu conexión.'); };
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
        var amarillo   = [245, 158, 11];
        var verde      = [34, 197, 94];
        var rojo       = [239, 68, 68];

        var pageW    = 210;
        var pageH    = 297;
        var marginL  = 18;
        var marginR  = 18;
        var contentW = pageW - marginL - marginR;
        var y        = 0;

        // ENCABEZADO
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

        // DATOS DEL CLIENTE
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

        // SEVERIDAD
        var sevMap = {
            critica: { label: '🔴  RIESGO CRÍTICO',    color: rojo },
            alta:    { label: '🟠  RIESGO ELEVADO',     color: amarillo },
            media:   { label: '🟡  A TENER EN CUENTA', color: [234, 179, 8] },
            baja:    { label: '🟢  SITUACIÓN ESTABLE', color: verde }
        };
        var sev     = (data.severidad || 'media').toLowerCase();
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

        // SÍNTOMA
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(azulOscuro[0], azulOscuro[1], azulOscuro[2]);
        doc.text('SÍNTOMA PRINCIPAL', marginL, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(gris[0], gris[1], gris[2]);
        var sintomaLines = doc.splitTextToSize(data.sintoma || data.resumen || '—', contentW);
        doc.text(sintomaLines, marginL, y);
        y += sintomaLines.length * 5 + 6;

        // RESUMEN
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(azulOscuro[0], azulOscuro[1], azulOscuro[2]);
        doc.text('RESUMEN DEL DIAGNÓSTICO', marginL, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(gris[0], gris[1], gris[2]);
        var resumenLimpio = (data.resumen || '').replace(/\n\n💰.*$/s, '').trim();
        var resLines = doc.splitTextToSize(resumenLimpio, contentW);
        doc.text(resLines, marginL, y);
        y += resLines.length * 4.5 + 8;

        // NOTA DE RIESGO
        if (data.riskWarning) {
            var riskLines = doc.splitTextToSize(data.riskWarning, contentW - 10);
            var riskH = riskLines.length * 4.5 + 14;
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
            doc.text(riskLines, marginL + 7, y + 11);
            y += riskH + 8;
        }

        // PASOS
        if (data.pasos && data.pasos.length > 0) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(azulOscuro[0], azulOscuro[1], azulOscuro[2]);
            doc.text('EVALUACIÓN TÉCNICA Y PASOS RECOMENDADOS', marginL, y);
            y += 6;

            data.pasos.forEach(function(paso, i) {
                var pasoLimpio = paso
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .replace(/^\d+\.\s*/, '')
                    .trim();
                if (!pasoLimpio) return;
                var pasoLines = doc.splitTextToSize((i + 1) + '. ' + pasoLimpio, contentW - 14);
                var pasoH = pasoLines.length * 4.5 + 5;
                if (y + pasoH > pageH - 30) { doc.addPage(); y = 20; }
                if (i % 2 === 0) {
                    doc.setFillColor(grislista[0], grislista[1], grislista[2]);
                    doc.roundedRect(marginL, y - 2, contentW, pasoH, 2, 2, 'F');
                }
                doc.setFillColor(azul[0], azul[1], azul[2]);
                doc.circle(marginL + 5, y + pasoH / 2 - 3, 3.5, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.text(String(i + 1), marginL + 5, y + pasoH / 2 - 1.5, { align: 'center' });
                doc.setTextColor(gris[0], gris[1], gris[2]);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.text(pasoLines, marginL + 12, y + 3.5);
                y += pasoH + 2;
            });
        }

        // PIE DE PÁGINA
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
                'CABA y Gran Buenos Aires · Diagnóstico generado por asistente IA — sujeto a revisión técnica presencial.',
                pageW / 2, pageH - 7, { align: 'center' }
            );
            doc.text('Página ' + pg + ' de ' + totalPages, pageW - marginR, pageH - 10, { align: 'right' });
        }

        var fileName = 'diagnostico-' + (data.diagNum || 'cyclops').replace(/[^A-Z0-9-]/gi, '-') + '.pdf';
        doc.save(fileName);
    });
}
