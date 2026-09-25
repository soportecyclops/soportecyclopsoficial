---
layout: base.njk
title: "¿Qué hacer si un ransomware bloqueó tu empresa? Guía de respuesta"
description: "Los primeros 30 minutos son críticos. Qué hacer, en qué orden, y qué nunca hacer."
image: "https://www.soportecyclops.com.ar/public/images/og-preview.jpg"
categoria: "Seguridad"
tiempo_lectura: "8 min de lectura"
fecha: "20 de diciembre de 2024"
tags: post
permalink: "ransomware-que-hacer.html"
---

<p>Llegás a la oficina y una máquina muestra un cartel: los archivos están cifrados y piden un rescate para devolverlos. Los servidores no responden, las carpetas compartidas están llenas de archivos con extensiones raras y nadie puede trabajar. Es un ransomware, y <strong>lo que hagas en los primeros 30 minutos define cuánto vas a perder</strong>.</p>

<p>Esta guía está pensada para pymes sin equipo de sistemas propio: qué hacer, en qué orden, y sobre todo qué no hacer.</p>

<h2 id="sec-1">Los primeros 30 minutos, paso a paso</h2>

<div class="cause-card">
  <h3><span class="cause-num">1</span> Desconectá de la red, no apagues</h3>
  <p>Sacale el cable de red a la máquina infectada (o apagá el WiFi). Si el cifrado se está propagando a las carpetas compartidas, esto lo frena. Si no podés identificar qué máquina fue, desconectá el switch o el router: mejor 2 horas sin internet que perder el servidor entero.</p>
  <p><strong>¿Por qué no apagar?</strong> Algunas variantes guardan claves de cifrado en la memoria RAM, y esa información puede servir para la recuperación. Apagar la borra para siempre. Desconectar aísla; apagar destruye evidencia.</p>
</div>

<div class="cause-card">
  <h3><span class="cause-num">2</span> Aislá los backups YA</h3>
  <p>El objetivo número uno del ransomware moderno son tus copias de seguridad: sabe que si las destruye, no te queda otra que pagar. Si tenés un disco externo de backup conectado, desconectalo físicamente. Si el backup es en la nube o en un NAS, verificá desde OTRA máquina (una que seguro esté limpia, o un celular) que esté intacto, y cortale el acceso a la red interna.</p>
</div>

<div class="cause-card">
  <h3><span class="cause-num">3</span> Hacé el relevamiento de daños</h3>
  <p>Desde una máquina limpia, anotá: qué equipos muestran el cartel, qué carpetas compartidas tienen archivos cifrados, a qué hora aparecieron los primeros archivos raros y quién notó algo inusual antes (un mail extraño, un adjunto abierto, un aviso de antivirus ignorado). Esta línea de tiempo vale oro para la recuperación.</p>
</div>

<div class="cause-card">
  <h3><span class="cause-num">4</span> Sacale una foto al cartel de rescate</h3>
  <p>El mensaje de rescate identifica la variante de ransomware. Con ese dato se puede buscar en <strong>nomoreransom.org</strong> (proyecto conjunto de Europol y empresas de seguridad, gratuito y legítimo) si existe un descifrador gratuito para esa variante. Para algunas familias viejas, existe: hay gente que recuperó todo sin pagar un peso.</p>
</div>

<div class="cause-card">
  <h3><span class="cause-num">5</span> Llamá a ayuda profesional antes de tocar nada más</h3>
  <p>A partir de acá, cada acción puede mejorar o empeorar el panorama. Un técnico con experiencia en incidentes va a evaluar el alcance, identificar la variante, verificar la integridad de los backups y armar el plan de recuperación en el orden correcto. Si manejás datos de clientes, considerá también el aviso legal que pueda corresponder y hacé la denuncia: en Argentina existe una fiscalía especializada en ciberdelito (UFECI).</p>
</div>

<h2 id="sec-2">Lo que NUNCA hay que hacer</h2>

<div class="box box-danger"><strong>🚨 Errores que agravan el desastre</strong>No formatees ninguna máquina "para empezar de cero" antes de confirmar que los backups funcionan: podés estar destruyendo lo único recuperable. No conectes el disco de backup a una máquina posiblemente infectada "para ver si está bien". No intentes renombrar los archivos cifrados ni usar "recuperadores" milagrosos descargados de cualquier lado: muchos son malware disfrazado.</div>

<h2 id="sec-3">¿Pagar o no pagar?</h2>

<p>La respuesta corta: <strong>es la última opción, y aun pagando podés perder todo</strong>. Los datos de la industria son consistentes: una parte importante de quienes pagan no recupera la totalidad de sus archivos, y pagar te marca como "cliente que paga", lo que aumenta la chance de un segundo ataque. Además financia la operación criminal.</p>

<p>La decisión real se toma en base a una sola pregunta: <strong>¿tenés backups sanos?</strong> Si la respuesta es sí, la recuperación es cuestión de tiempo y trabajo, no de rescate.</p>

<h2 id="sec-4">El costo real: prevención vs. incidente</h2>

<table class="mat-table">
  <tr><th>Concepto</th><th>Prevenir</th><th>Sufrirlo</th></tr>
  <tr><td>Backup automático 3-2-1</td><td class="lo">Costo bajo, se configura una vez</td><td class="hi">Sin backup: pérdida potencialmente total</td></tr>
  <tr><td>Tiempo parado</td><td class="lo">Cero</td><td class="hi">Días o semanas sin operar</td></tr>
  <tr><td>Datos de clientes</td><td class="lo">Protegidos</td><td class="hi">Posible filtración y daño reputacional</td></tr>
</table>

<h2 id="sec-5">Las 5 defensas que evitan el 90% de los casos</h2>

<ul>
  <li><strong>Backup 3-2-1 con una copia desconectada:</strong> tres copias, dos medios, una fuera de línea o inmutable. Es LA diferencia entre incidente y catástrofe.</li>
  <li><strong>Actualizaciones al día:</strong> Windows, navegadores y sobre todo cualquier cosa expuesta a internet (accesos remotos, VPN, servidores).</li>
  <li><strong>Ojo con el escritorio remoto:</strong> RDP abierto a internet con contraseña débil es la puerta de entrada favorita. Si necesitás acceso remoto, que sea por VPN y con doble factor.</li>
  <li><strong>Cuentas sin privilegios de más:</strong> el usuario que usa Word no necesita ser administrador. Si la cuenta comprometida no puede tocar el servidor, el daño se achica muchísimo.</li>
  <li><strong>Capacitación básica:</strong> la mayoría de los ataques entra por un mail. Que todo el equipo sepa desconfiar de adjuntos inesperados y links de "facturas" que nadie pidió.</li>
</ul>

<div class="box box-success"><strong>✅ Recomendación final</strong>Hacé el simulacro: elegí un archivo al azar de tu backup e intentá restaurarlo hoy. Si tardás más de 15 minutos en lograrlo, o descubrís que el backup no corría hace meses, encontraste el problema a tiempo. Un backup que nunca se probó restaurar es una expresión de deseo, no un backup.</div>

    <div class="cta-box">
      <h3>¿Necesitás ayuda con esto?</h3>
      <p>Soporte técnico a domicilio en CABA y GBA. Diagnóstico claro, precio cerrado antes de empezar.</p>
      <a class="cta-btn" href="https://wa.me/5491166804450?text=Hola!%20Le%C3%AD%20el%20art%C3%ADculo%20%22%C2%BFQu%C3%A9%20hacer%20si%20un%20ransomware%20bloque%C3%B3%20tu%20empresa%3F%20Gu%C3%ADa%20de%20respuesta%22%20y%20necesito%20ayuda" target="_blank">
        <i class="fab fa-whatsapp"></i> Consultar por WhatsApp</a>
    </div>