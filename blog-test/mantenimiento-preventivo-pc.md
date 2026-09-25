---
layout: base.njk
title: "Mantenimiento preventivo de PC: qué hacer cada cuánto para que dure más"
description: "Checklist completo semanal, mensual y anual. Evitá el 80% de las fallas."
image: "https://www.soportecyclops.com.ar/public/images/og-preview.jpg"
categoria: "Mantenimiento"
tiempo_lectura: "6 min de lectura"
fecha: "26 de julio de 2024"
tags: post
permalink: "mantenimiento-preventivo-pc.html"
---

<p>La mayoría de las PCs no muere de viejas: muere de abandonadas. Sobrecalentamiento por polvo, discos llenos al límite, actualizaciones pendientes durante meses y un backup que nunca existió. Lo interesante es que casi todo eso se previene con una rutina que lleva minutos.</p>

<p>Este es el checklist que aplicamos en los abonos de mantenimiento, adaptado para que lo puedas hacer vos mismo. Está dividido por frecuencia: no hace falta hacer todo siempre.</p>

<h2 id="sec-1">Todas las semanas (5 minutos)</h2>

<ul>
  <li><strong>Reiniciá el equipo de verdad.</strong> No suspender: reiniciar. Windows acumula procesos y memoria ocupada; un reinicio semanal resuelve la mitad de las "lentitudes misteriosas". Ojo: con el "inicio rápido" activado, apagar y prender no reinicia del todo — usá la opción Reiniciar.</li>
  <li><strong>Dejá correr las actualizaciones pendientes.</strong> Ese cartelito que venís posponiendo hace tres semanas incluye parches de seguridad. Elegí un momento que no te moleste (viernes al cierre, por ejemplo) y dejalas instalar.</li>
  <li><strong>Verificá que el backup corrió.</strong> Treinta segundos: mirá la fecha de la última copia. Si tu backup automático falló hace dos meses y no te enteraste, no tenés backup.</li>
</ul>

<h2 id="sec-2">Todos los meses (20 minutos)</h2>

<div class="cause-card">
  <h3><span class="cause-num">1</span> Liberá espacio en disco</h3>
  <p>Un disco al 95% ralentiza todo el sistema y puede impedir actualizaciones. Windows trae la herramienta integrada: <code>Configuración → Sistema → Almacenamiento → Recomendaciones de limpieza</code>. Vaciá papelera, archivos temporales y descargas viejas. Objetivo: mantener al menos un 15-20% libre.</p>
</div>

<div class="cause-card">
  <h3><span class="cause-num">2</span> Revisá qué arranca con Windows</h3>
  <p>Cada programa que se instala quiere arrancar con el sistema, y de a poco el inicio pasa de 20 segundos a 3 minutos. Abrí el Administrador de tareas (<code>Ctrl+Shift+Esc</code>) → pestaña <strong>Inicio</strong> → deshabilitá lo que no necesites apenas prende la máquina (Spotify, actualizadores varios, launchers de juegos).</p>
</div>

<div class="cause-card">
  <h3><span class="cause-num">3</span> Mirá la salud del disco</h3>
  <p>Con <code>CrystalDiskInfo</code> (gratuito) verificá que el estado sea "Bueno" en azul. Si aparece "Precaución" en amarillo, es momento de hacer backup completo y planificar el reemplazo. Dos minutos que pueden salvarte de perder todo.</p>
</div>

<div class="cause-card">
  <h3><span class="cause-num">4</span> Pasá un escaneo de malware completo</h3>
  <p>El antivirus de Windows (Microsoft Defender) es más que suficiente para la mayoría de los usos, pero corre escaneos rápidos. Una vez al mes, pedile uno completo: <code>Seguridad de Windows → Protección antivirus → Opciones de examen → Examen completo</code>.</p>
</div>

<h2 id="sec-3">Una o dos veces al año (1 hora)</h2>

<div class="cause-card">
  <h3><span class="cause-num">5</span> Limpieza física del polvo</h3>
  <p>El polvo es el asesino silencioso número uno. Tapa los disipadores, el equipo levanta temperatura, los ventiladores giran al máximo (ese ruido a turbina) y con el tiempo el sistema se apaga solo o se degrada el hardware. Con el equipo <strong>apagado y desenchufado</strong>: aire comprimido en rejillas, ventiladores y disipador. Sujetá las paletas de los ventiladores al soplar para que no giren locas. En ambientes con mucho polvo o mascotas, cada 6 meses; si no, una vez al año alcanza.</p>
</div>

<div class="cause-card">
  <h3><span class="cause-num">6</span> Desinstalá lo que no usás</h3>
  <p>Programas que probaste una vez, barras de herramientas, versiones viejas de cosas que ya reemplazaste. Cada uno ocupa espacio, algunos corren servicios de fondo y todos agrandan la superficie de ataque. <code>Configuración → Aplicaciones</code>, ordenar por fecha de uso, y a limpiar.</p>
</div>

<div class="cause-card">
  <h3><span class="cause-num">7</span> Probá restaurar un archivo del backup</h3>
  <p>El paso que nadie hace y todos deberían: elegí un archivo cualquiera del backup y restauralo. Si funciona, dormí tranquilo un año más. Si no funciona, acabás de descubrir el problema más barato de tu vida: gratis y a tiempo.</p>
</div>

<h2 id="sec-4">Resumen: el calendario completo</h2>

<table class="mat-table">
  <tr><th>Frecuencia</th><th>Tarea</th><th>Tiempo</th></tr>
  <tr><td>Semanal</td><td>Reinicio real + actualizaciones + verificar backup</td><td class="lo">5 min</td></tr>
  <tr><td>Mensual</td><td>Espacio en disco, inicio de Windows, salud del disco, escaneo completo</td><td class="lo">20 min</td></tr>
  <tr><td>Semestral/Anual</td><td>Limpieza de polvo, desinstalar software, prueba de restauración</td><td class="me">1 hora</td></tr>
</table>

<div class="box box-warn"><strong>⚠️ Lo que NO recomendamos</strong>Los "optimizadores mágicos" que prometen acelerar la PC un 300%: la mayoría son inútiles y varios directamente contraproducentes (limpian el registro rompiendo cosas, o instalan más basura de la que sacan). Windows moderno no necesita optimizadores de terceros. Tampoco desfragmentes un SSD: no sirve y gasta su vida útil.</div>

<div class="box box-info"><strong>💡 Para notebooks, dos extras</strong>Cuidá la batería evitando dejarla siempre al 100% enchufada si el fabricante ofrece un modo de "carga inteligente" (límite al 80%), y nunca la uses sobre la cama o almohadones: tapa las rejillas de ventilación y el calor se acumula exactamente donde no debe.</div>

<div class="box box-success"><strong>✅ Recomendación final</strong>Agendá el mantenimiento mensual como un evento recurrente en el calendario (primer viernes de cada mes, por ejemplo). Lo que no está agendado, no ocurre. Una PC con esta rutina llega fácil a los 7-8 años de vida útil; una abandonada, a la mitad.</div>

    <div class="cta-box">
      <h3>¿Necesitás ayuda con esto?</h3>
      <p>Soporte técnico a domicilio en CABA y GBA. Diagnóstico claro, precio cerrado antes de empezar.</p>
      <a class="cta-btn" href="https://wa.me/5491166804450?text=Hola!%20Le%C3%AD%20el%20art%C3%ADculo%20%22Mantenimiento%20preventivo%20de%20PC%3A%20qu%C3%A9%20hacer%20cada%20cu%C3%A1nto%20para%20que%20dure%20m%C3%A1s%22%20y%20necesito%20ayuda" target="_blank">
        <i class="fab fa-whatsapp"></i> Consultar por WhatsApp</a>
    </div>