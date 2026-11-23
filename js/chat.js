// Chat de Iris (Cyclops Chat / Chatwoot): chat por defecto del sitio.
// Si Chatwoot no carga, queda visible el asistente guiado (chatbot.js) como respaldo.
(function () {
    var BASE = 'https://chat.soportecyclops.com.ar';
    var TOKEN = 'sjEcwPfBet3x5yP8pwPqnJAu';
    var WA = 'https://wa.me/5491151758025?text=' + encodeURIComponent('¡Hola! Necesito ayuda técnica.');
    var pendiente = false;
    var listo = false;

    window.chatwootSettings = {
        locale: 'es',
        position: 'right',
        hideMessageBubble: false,
        launcherTitle: 'Asistente virtual'
    };

    window.addEventListener('chatwoot:ready', function () {
        listo = true;
        document.documentElement.classList.add('iris-activa');
        if (pendiente) { pendiente = false; window.$chatwoot.toggle('open'); }
    });

    window.abrirAsistente = function () {
        if (listo && window.$chatwoot) { window.$chatwoot.toggle('open'); return; }
        pendiente = true;
        setTimeout(function () {
            if (pendiente) { pendiente = false; window.open(WA, '_blank'); }
        }, 5000);
    };

    if (document.querySelector('script[data-cyclops-chat]')) { return; }
    var s = document.createElement('script');
    s.src = BASE + '/packs/js/sdk.js';
    s.async = true;
    s.setAttribute('data-cyclops-chat', '1');
    s.onload = function () { window.chatwootSDK.run({ websiteToken: TOKEN, baseUrl: BASE }); };
    document.head.appendChild(s);
})();
