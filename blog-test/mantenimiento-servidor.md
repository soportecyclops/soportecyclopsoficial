---
layout: base.njk
title: "Mantenimiento de servidores: la rutina que evita el día malo"
description: "Qué revisar cada semana, mes y trimestre, y por qué RAID no es backup."
image: "https://www.soportecyclops.com.ar/public/images/og-preview.jpg"
categoria: "Infraestructura"
tiempo_lectura: "6 min de lectura"
fecha: "28 de mayo de 2026"
tags: post
permalink: "mantenimiento-servidor.html"
---

<p>El servidor de una pyme suele ser lo más importante y lo menos atendido: mientras anda, nadie lo mira. Y como funciona sin quejarse durante años, la primera señal de problema suele ser el día que la empresa no puede trabajar.</p>

<div class="box box-warn"><strong>⚠️ La pregunta que ordena todo</strong>¿Cuánto tiempo puede estar tu empresa sin el servidor? Si la respuesta es "unas horas", necesitás un plan de recuperación probado. Si es "no puede", necesitás además redundancia. Esa respuesta define todo lo demás.</div>

<h2 id="sec-1">La rutina que hay que sostener</h2>

<div class="cause-card">
<h3><span class="cause-num">1</span> Semanal: verificar backups</h3>
<p>No que "esté configurado": que <strong>corrió</strong>. Mirá la fecha de la última copia exitosa y si hubo errores. Un backup que falla en silencio durante meses es el escenario más común y el peor.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">2</span> Mensual: espacio, discos y registros</h3>
<p>Espacio libre en cada volumen, estado de salud de los discos, y una mirada al registro de eventos buscando errores repetidos. Un disco que empieza a fallar avisa semanas antes en los registros.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">3</span> Mensual: actualizaciones</h3>
<p>Con criterio: primero en un entorno de prueba si existe, y en una ventana horaria fuera del trabajo. Las de seguridad no se postergan indefinidamente, pero tampoco se aplican a ciegas un martes al mediodía.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">4</span> Trimestral: probar la restauración</h3>
<p>El paso decisivo. Restaurar un archivo, una carpeta y —si es posible— la base de datos completa en un entorno aparte. Es la única forma de saber que el backup sirve. Todo lo demás es fe.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">5</span> Semestral: hardware y energía</h3>
<p>Limpieza de polvo, verificación de ventiladores, y prueba del UPS: desconectarlo de la red con carga y confirmar que sostiene. Las baterías de UPS duran entre 2 y 4 años; un UPS con batería muerta es una zapatilla cara.</p>
</div>

<h2 id="sec-2">Lo que hay que monitorear</h2>

<table class="mat-table">
<tr><th>Indicador</th><th>Señal de alerta</th></tr>
<tr><td>Espacio en disco</td><td class="hi">Menos del 15% libre</td></tr>
<tr><td>Estado S.M.A.R.T. de discos</td><td class="hi">Sectores reasignados en aumento</td></tr>
<tr><td>Temperatura</td><td class="me">Sostenidamente alta</td></tr>
<tr><td>Último backup exitoso</td><td class="hi">Más de 48 horas</td></tr>
<tr><td>Intentos de acceso fallidos</td><td class="hi">Picos inusuales</td></tr>
<tr><td>Estado del arreglo de discos</td><td class="hi">Un disco degradado</td></tr>
</table>

<div class="box box-danger"><strong>🚨 El malentendido más caro</strong>El arreglo de discos en espejo (RAID) <strong>no es un backup</strong>. Protege contra la falla de un disco, nada más. Si borrás una carpeta por error, se borra en los dos discos. Si entra ransomware, cifra los dos. Necesitás las dos cosas: redundancia para seguir trabajando, backup para recuperar.</div>

<h2 id="sec-3">Documentar: la parte que salva el día malo</h2>

<ul>
<li>Qué servicios corre el servidor y de qué depende cada uno.</li>
<li>Direcciones IP, usuarios administradores y dónde están las credenciales.</li>
<li>Dónde está el backup, cómo se restaura, y quién sabe hacerlo.</li>
<li>Contactos del proveedor de internet, del software de gestión y del soporte técnico.</li>
<li>Qué hacer si el servidor no arranca un lunes a las 8.</li>
</ul>

<p>Esa hoja parece burocracia hasta el día que pasa algo y la persona que sabía está de vacaciones.</p>

<div class="box box-success"><strong>✅ Recomendación final</strong>Verificación semanal de backups, revisión mensual de discos y espacio, prueba trimestral de restauración y limpieza semestral. Si nadie en la empresa tiene ese rol asignado, es cuestión de tiempo. Con un abono de mantenimiento nos ocupamos nosotros: monitoreo, revisiones programadas y el informe de qué está pasando con tu infraestructura.</div>

    <div class="cta-box">
      <h3>¿Necesitás ayuda con esto?</h3>
      <p>Soporte técnico a domicilio en CABA y GBA. Diagnóstico claro, precio cerrado antes de empezar.</p>
      <a class="cta-btn" href="https://wa.me/5491166804450?text=Hola!%20Le%C3%AD%20el%20art%C3%ADculo%20%22Mantenimiento%20de%20servidores%3A%20la%20rutina%20que%20evita%20el%20d%C3%ADa%20malo%22%20y%20necesito%20ayuda" target="_blank">
        <i class="fab fa-whatsapp"></i> Consultar por WhatsApp</a>
    </div>