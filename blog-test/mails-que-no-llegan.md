---
layout: base.njk
title: "Mis mails llegan a spam o no llegan: por qué pasa"
description: "Los 3 registros que definen todo, otras causas frecuentes y cómo diagnosticarlo."
image: "https://www.soportecyclops.com.ar/public/images/og-preview.jpg"
categoria: "Infraestructura"
tiempo_lectura: "5 min de lectura"
fecha: "19 de mayo de 2025"
tags: post
permalink: "mails-que-no-llegan.html"
---

<p>Mandás un presupuesto y el cliente dice que nunca le llegó. Lo encontró en spam, o directamente no apareció. Es de los problemas más caros de una pyme, porque no da error: el mail sale, vos lo ves en enviados, y del otro lado no está.</p>

<div class="box box-info"><strong>💡 Por qué pasa</strong>Los servidores que reciben tu correo evalúan si sos quien decís ser. Si tu dominio no tiene configurados los registros que autorizan a tu servidor a enviar en su nombre, el mensaje queda sospechoso por defecto. No es un problema de contenido: es de identidad.</div>

<h2 id="sec-1">Los tres registros que definen todo</h2>

<div class="cause-card">
<h3><span class="cause-num">1</span> SPF: quién puede enviar por vos</h3>
<p>Es una lista publicada en tu dominio con los servidores autorizados. Si tu correo sale desde un servidor que no está en esa lista, el receptor lo trata como sospechoso. Error frecuente: tener dos registros SPF, lo que invalida los dos.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">2</span> DKIM: la firma digital</h3>
<p>Cada mensaje sale firmado criptográficamente. El receptor verifica la firma contra tu dominio y confirma que el mensaje no fue alterado y que salió de donde dice. Sin esto, tu reputación de envío es mucho menor.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">3</span> DMARC: qué hacer si algo falla</h3>
<p>Le dice al receptor qué hacer con los mensajes que no pasan las verificaciones anteriores: nada, spam, o rechazo. También permite recibir informes de quién está enviando en nombre de tu dominio, que es como se detecta la suplantación.</p>
</div>

<h2 id="sec-2">Otras causas frecuentes</h2>

<table class="mat-table">
<tr><th>Causa</th><th>Señal</th></tr>
<tr><td>IP del servidor en lista negra</td><td class="hi">Rebotan todos los envíos a cierto dominio</td></tr>
<tr><td>Enviás desde el hosting compartido</td><td class="me">Compartís reputación con otros del mismo servidor</td></tr>
<tr><td>Adjuntos pesados o tipos bloqueados</td><td class="me">Falla solo con ciertos mensajes</td></tr>
<tr><td>El dominio es muy nuevo</td><td class="me">Reputación aún no construida</td></tr>
<tr><td>El receptor tiene reglas propias muy estrictas</td><td class="me">Falla solo con una empresa</td></tr>
</table>

<div class="box box-warn"><strong>⚠️ El envío masivo desde el correo común</strong>Mandar una promoción a 400 contactos desde tu casilla habitual es la forma más rápida de arruinar tu reputación de envío y terminar en listas negras. Para envíos masivos se usan plataformas específicas, que además manejan las bajas como corresponde.</div>

<h2 id="sec-3">Cómo diagnosticarlo</h2>

<ul>
<li><strong>Mandate un mail a vos mismo</strong> a una casilla de otro proveedor y mirá si llega a bandeja o a spam.</li>
<li><strong>Revisá los encabezados</strong> del mensaje recibido: ahí figura si SPF y DKIM pasaron o fallaron.</li>
<li><strong>Preguntale al receptor</strong> si lo encontró en spam o si nunca llegó: son dos problemas distintos.</li>
<li><strong>Probá con varios destinos:</strong> si falla solo con un dominio, el problema puede estar del otro lado.</li>
</ul>

<h2 id="sec-4">Prácticas que ayudan</h2>

<ul>
<li>Asunto claro y sin todo en mayúsculas ni signos de exclamación repetidos.</li>
<li>Evitar mensajes que sean solo una imagen grande sin texto.</li>
<li>No mandar archivos ejecutables: se bloquean por defecto. Para archivos pesados, un enlace de descarga.</li>
<li>Firma con datos reales de la empresa.</li>
</ul>

<div class="box box-success"><strong>✅ Recomendación final</strong>Si tenés correo con dominio propio, verificá hoy que SPF, DKIM y DMARC estén bien configurados: es la causa del 80% de los mails que no llegan. Lo revisamos y lo dejamos configurado, y de paso cerramos la puerta a que alguien mande correos haciéndose pasar por tu empresa.</div>

    <div class="cta-box">
      <h3>¿Necesitás ayuda con esto?</h3>
      <p>Soporte técnico a domicilio en CABA y GBA. Diagnóstico claro, precio cerrado antes de empezar.</p>
      <a class="cta-btn" href="https://wa.me/5491166804450?text=Hola!%20Le%C3%AD%20el%20art%C3%ADculo%20%22Mis%20mails%20llegan%20a%20spam%20o%20no%20llegan%3A%20por%20qu%C3%A9%20pasa%22%20y%20necesito%20ayuda" target="_blank">
        <i class="fab fa-whatsapp"></i> Consultar por WhatsApp</a>
    </div>