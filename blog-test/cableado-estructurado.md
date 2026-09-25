---
layout: base.njk
title: "Cableado de red: los errores que generan fallas imposibles de diagnosticar"
description: "Qué categoría corresponde, los 5 errores típicos y por qué el cable barato sale caro."
image: "https://www.soportecyclops.com.ar/public/images/og-preview.jpg"
categoria: "Redes"
tiempo_lectura: "6 min de lectura"
fecha: "3 de enero de 2026"
tags: post
permalink: "cableado-estructurado.html"
---

<p>El cable de red parece un detalle menor al lado del router o del servidor. Después aparecen los problemas raros: una PC que pierde conexión cada tanto, velocidad que no llega a lo contratado, una impresora que desaparece. Y son de los problemas más difíciles de diagnosticar, porque no hay nada visiblemente roto.</p>

<div class="box box-info"><strong>💡 Por qué el cableado se hace bien una vez</strong>Es lo más barato de hacer bien al principio y lo más caro de corregir después. Cambiar un router es enchufar otro; rehacer el cableado de una oficina implica volver a pasar cables por donde ya hay muebles, gente trabajando y paredes cerradas.</div>

<h2 id="sec-1">Qué cable corresponde</h2>

<table class="mat-table">
<tr><th>Categoría</th><th>Soporta</th><th>Cuándo usarlo</th></tr>
<tr><td>Cat 5e</td><td>1 Gbps</td><td class="me">Instalaciones existentes que funcionan</td></tr>
<tr><td>Cat 6</td><td>1 Gbps sólido, 10 en tramos cortos</td><td class="lo">El estándar recomendado hoy</td></tr>
<tr><td>Cat 6A</td><td>10 Gbps</td><td class="me">Backbone entre racks, servidores</td></tr>
</table>

<p>Para instalaciones nuevas, categoría 6: la diferencia de costo con 5e es mínima y te deja margen para años. El límite de distancia es 90 metros por tramo; más que eso requiere un equipo intermedio.</p>

<h2 id="sec-2">Los errores que generan fallas intermitentes</h2>

<div class="cause-card">
<h3><span class="cause-num">1</span> Fichas mal armadas</h3>
<p>Es la causa número uno. Un par destrenzado de más, un conductor que no llega al fondo del conector, una ficha apretada de forma despareja. El cable "anda", pero pierde paquetes y la conexión se degrada bajo carga.</p>
<p><strong>Cómo se detecta:</strong> con un certificador o al menos un tester de continuidad. A ojo es imposible.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">2</span> Correr paralelo al cableado eléctrico</h3>
<p>El cable de red pegado y paralelo a los eléctricos toma interferencia. Si tienen que cruzarse, que sea en ángulo recto, y mantené separación en los tramos paralelos.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">3</span> Radios de curvatura muy cerrados</h3>
<p>Doblar el cable en ángulo vivo, o apretarlo con un precinto hasta deformarlo, altera la geometría interna de los pares y degrada la señal. Las curvas tienen que ser suaves.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">4</span> Cable de interior usado en exterior</h3>
<p>El sol y la humedad degradan la cubierta común en pocos meses. Para tramos exteriores hay cable específico, y si el tendido es entre edificios distintos, hay que considerar además la protección eléctrica.</p>
</div>

<div class="cause-card">
<h3><span class="cause-num">5</span> No identificar nada</h3>
<p>Veinte cables llegando a un switch, ninguno etiquetado. Cada falla se convierte en una investigación de una hora. Etiquetar en los dos extremos es lo más barato y lo que más tiempo ahorra a futuro.</p>
</div>

<div class="box box-warn"><strong>⚠️ El cable barato del mostrador</strong>Buena parte del cable que se vende en comercios generales es de aluminio recubierto de cobre en lugar de cobre puro. Es más rígido, se corta al doblarlo, conduce peor y no soporta alimentación por red (PoE) para cámaras o puntos de acceso. Es el ahorro que después se paga en visitas de diagnóstico.</div>

<h2 id="sec-3">Sobre PoE, para cámaras y puntos de acceso</h2>

<p>La alimentación por el mismo cable de red es lo que hace práctico instalar cámaras y puntos de acceso donde no hay tomacorriente. Requiere cable de cobre real y un switch o inyector adecuado. Con cable de mala calidad, la caída de tensión en el tramo hace que el equipo se reinicie solo — otra falla intermitente difícil de rastrear.</p>

<div class="box box-success"><strong>✅ Recomendación final</strong>Categoría 6 de cobre, fichas bien armadas y certificadas, separado del cableado eléctrico, con curvas suaves y todo etiquetado. Hacerlo bien la primera vez cuesta poco más y te ahorra años de fallas fantasma. Hacemos el tendido, la certificación de cada punto y te entregamos el plano de lo instalado.</div>

    <div class="cta-box">
      <h3>¿Necesitás ayuda con esto?</h3>
      <p>Soporte técnico a domicilio en CABA y GBA. Diagnóstico claro, precio cerrado antes de empezar.</p>
      <a class="cta-btn" href="https://wa.me/5491166804450?text=Hola!%20Le%C3%AD%20el%20art%C3%ADculo%20%22Cableado%20de%20red%3A%20los%20errores%20que%20generan%20fallas%20imposibles%20de%20diagnosticar%22%20y%20necesito%20ayuda" target="_blank">
        <i class="fab fa-whatsapp"></i> Consultar por WhatsApp</a>
    </div>