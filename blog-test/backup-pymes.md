---
layout: base.njk
title: "Backup para pymes: qué respaldar, cada cuánto y los errores clásicos"
description: "La regla 3-2-1 explicada, qué respaldar según prioridad y la prueba que casi nadie hace."
image: "https://www.soportecyclops.com.ar/public/images/og-preview.jpg"
categoria: "Infraestructura"
tiempo_lectura: "6 min de lectura"
fecha: "21 de julio de 2025"
tags: post
permalink: "backup-pymes.html"
---

<p>Toda pyme tiene un backup. El problema es que la mayoría lo descubre el día que necesita restaurarlo: el disco externo dejó de copiar hace ocho meses, la carpeta clave nunca estuvo incluida, o el respaldo estaba en el mismo equipo que se rompió. Esta guía es para que eso no te pase.</p>

<div class="box box-danger"><strong>🚨 La definición que importa</strong>Un backup que nunca se probó restaurar no es un backup: es una expresión de deseo. La única prueba válida es recuperar un archivo y abrirlo.</div>

<h2 id="sec-1">Qué respaldar (y qué no)</h2>

<table class="mat-table">
<tr><th>Prioridad</th><th>Qué</th><th>Por qué</th></tr>
<tr><td class="hi">Crítico</td><td>Base de datos del sistema de gestión, facturación</td><td>Sin eso la empresa no opera</td></tr>
<tr><td class="hi">Crítico</td><td>Documentos, contratos, planillas de trabajo</td><td>Irremplazables</td></tr>
<tr><td class="me">Importante</td><td>Correo electrónico</td><td>Historial de acuerdos con clientes</td></tr>
<tr><td class="me">Importante</td><td>Configuraciones y licencias</td><td>Ahorra días de reinstalación</td></tr>
<tr><td class="lo">Opcional</td><td>Programas instalables</td><td>Se vuelven a descargar</td></tr>
</table>

<h2 id="sec-2">La regla 3-2-1</h2>

<div class="cause-card">
<h3><span class="cause-num">3</span> Tres copias de los datos</h3>
<p>El original más dos respaldos. Con una sola copia, cualquier problema con ella te deja sin red.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">2</span> Dos medios distintos</h3>
<p>Por ejemplo un disco externo y la nube. Si las dos copias están en el mismo tipo de dispositivo y en el mismo lugar, comparten los mismos riesgos.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">1</span> Una copia fuera del lugar</h3>
<p>En otra dirección física o en la nube. Un incendio, una inundación o un robo se lleva todo lo que está en el mismo edificio, backup incluido.</p>
</div>

<div class="box box-warn"><strong>⚠️ El detalle que cambió todo</strong>El ransomware moderno busca y cifra los backups conectados antes de atacar los archivos. Por eso al menos una copia tiene que estar desconectada (un disco que se enchufa, copia y se desenchufa) o ser inmutable. Un disco externo permanentemente conectado no te protege del escenario más frecuente hoy.</div>

<h2 id="sec-3">Cada cuánto</h2>

<p>La pregunta correcta no es "cada cuánto copio" sino <strong>"cuánto trabajo puedo perder"</strong>. Si la respuesta es "un día", el backup es diario. Si es "una hora", necesitás algo continuo. Para la mayoría de las pymes:</p>

<ul>
<li><strong>Diario automático:</strong> sistema de gestión, facturación, documentos en uso.</li>
<li><strong>Semanal:</strong> imagen completa del servidor o del equipo principal.</li>
<li><strong>Mensual:</strong> copia que se saca del lugar y se guarda aparte.</li>
</ul>

<h2 id="sec-4">Los cuatro errores clásicos</h2>

<ul>
<li><strong>Depender de que alguien se acuerde.</strong> El backup manual funciona tres semanas. Después se olvida. Tiene que ser automático.</li>
<li><strong>No monitorear.</strong> Si el proceso falla y nadie recibe un aviso, el error se descubre meses después. Que alguien mire el estado una vez por semana.</li>
<li><strong>Respaldar en el mismo equipo.</strong> Otra partición del mismo disco no es backup: si el disco muere, muere todo.</li>
<li><strong>No probar la restauración.</strong> El punto más importante y el que nadie hace.</li>
</ul>

<div class="box box-info"><strong>💡 Prueba concreta para hacer hoy</strong>Elegí un archivo cualquiera del backup e intentá restaurarlo. Si tardás más de 15 minutos o descubrís que no está, acabás de encontrar el problema más barato de tu vida: gratis y a tiempo.</div>

<div class="box box-success"><strong>✅ Recomendación final</strong>Un esquema básico para pyme: backup diario automático a un disco local, sincronización a la nube de las carpetas críticas, y una copia mensual que se desconecta y se guarda fuera. Se configura una vez y corre solo. Si querés, lo armamos y te dejamos el monitoreo andando.</div>

    <div class="cta-box">
      <h3>¿Necesitás ayuda con esto?</h3>
      <p>Soporte técnico a domicilio en CABA y GBA. Diagnóstico claro, precio cerrado antes de empezar.</p>
      <a class="cta-btn" href="https://wa.me/5491166804450?text=Hola!%20Le%C3%AD%20el%20art%C3%ADculo%20%22Backup%20para%20pymes%3A%20qu%C3%A9%20respaldar%2C%20cada%20cu%C3%A1nto%20y%20los%20errores%20cl%C3%A1sicos%22%20y%20necesito%20ayuda" target="_blank">
        <i class="fab fa-whatsapp"></i> Consultar por WhatsApp</a>
    </div>