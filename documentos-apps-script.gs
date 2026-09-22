// ═══════════════════════════════════════════════════════════════
// MÓDULO: Documentos (Presupuestos / Hojas de Trabajo / Remitos)
// Da soporte a admin.html → sección "Documentos"
//
// CÓMO INSTALARLO:
// 1. Abrí tu proyecto de Apps Script actual (el que ya usa admin.html,
//    Google Sheets > Extensiones > Apps Script, o script.google.com).
// 2. Pegá las DOS funciones de abajo al final de tu Code.gs (no reemplaces nada existente).
// 3. Buscá tu función doGet(e) y agregá, dentro del switch/if que ya tenés
//    sobre e.parameter.action, este caso:
//
//      if (action === 'siguiente_numero_doc') {
//        resultado = manejarSiguienteNumeroDoc(e.parameter);
//      }
//
// 4. Buscá tu función doPost(e) y agregá igual:
//
//      if (action === 'guardar_documento') {
//        resultado = manejarGuardarDocumento(e.parameter);
//      }
//
//    (Adaptá la sintaxis exacta a como esté armado tu switch/if actual —
//    el patrón es el mismo que ya usás para 'verificar_acceso', etc.)
//
// 5. IMPRESCINDIBLE: Implementar > Administrar implementaciones > ícono de
//    lápiz > Versión: "Nueva versión" > Implementar.
//    Si no hacés este paso, los cambios NO se activan en la URL que ya
//    usa admin.html, aunque hayas guardado el código.
//
// 6. Probalo abriendo en el navegador:
//    TU_URL_APPS_SCRIPT?action=siguiente_numero_doc&tipo=presupuesto&fecha=02092026&peek=1
//    Debería devolver: {"ok":true,"siguiente":1}
// ═══════════════════════════════════════════════════════════════

function manejarSiguienteNumeroDoc(params) {
  var tipo = params.tipo;          // 'presupuesto' | 'hoja' | 'remito'
  var fecha = params.fecha;        // formato ddmmyyyy, ej "02092026"
  var peek = params.peek === '1';  // '1' = solo consultar, no consumir el número

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Correlativos');
  if (!sheet) {
    sheet = ss.insertSheet('Correlativos');
    sheet.appendRow(['tipo_fecha', 'ultimo_numero']);
  }

  var key = tipo + '_' + fecha;
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  var ultimo = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) { rowIndex = i + 1; ultimo = Number(data[i][1]) || 0; break; }
  }

  var siguiente = ultimo + 1;

  if (!peek) {
    if (rowIndex === -1) {
      sheet.appendRow([key, siguiente]);
    } else {
      sheet.getRange(rowIndex, 2).setValue(siguiente);
    }
  }

  return { ok: true, siguiente: siguiente };
}

function manejarGuardarDocumento(params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Documentos');
  if (!sheet) {
    sheet = ss.insertSheet('Documentos');
    sheet.appendRow([
      'numero','tipo','fecha','cliente_nombre','cliente_telefono','cliente_email',
      'cliente_direccion','equipo_json','diagnostico','items_json',
      'subtotal','iva','total','observaciones','validez','creado_en'
    ]);
  }

  var cliente = {};
  var equipo = {};
  try { cliente = JSON.parse(params.cliente || '{}'); } catch (e) {}
  try { equipo = JSON.parse(params.equipo || '{}'); } catch (e) {}

  sheet.appendRow([
    params.numero || '',
    params.tipo || '',
    params.fecha || '',
    cliente.nombre || '',
    cliente.telefono || '',
    cliente.email || '',
    cliente.direccion || '',
    JSON.stringify(equipo),
    params.diagnostico || '',
    params.items || '[]',
    params.subtotal || 0,
    params.iva || 0,
    params.total || 0,
    params.observaciones || '',
    params.validez || '',
    new Date().toISOString()
  ]);

  return { ok: true };
}
