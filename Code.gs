// ============================================================
// Soporte Cyclops — Apps Script v4.5
// ============================================================
// CHANGELOG v4.5:
// [ADD]    registro_cliente: formulario público de inscripción (login.html)
//          — obligatorios nombre/telefono/email, resto opcional
// ------------------------------------------------------------
// CHANGELOG v4.4:
// [ADD]    admin_actualizar_documento: editar documento existente sin consumir número nuevo
// [ADD]    admin_eliminar_documento: borrar documento por número
// [ADD]    listar_documentos: listado completo o filtrado por cliente (multi-dispositivo)
// [ADD]    listar_clientes_completo: datos completos de Clientes (nombre/tel/dirección) para autocompletar Documentos
// ------------------------------------------------------------
// CHANGELOG v4.3:
// [ADD]    Módulo Documentos: Presupuestos / Hojas de Trabajo / Remitos
// [ADD]    obtenerSiguienteNumeroDoc: numeración correlativa ddmmyyyy-NNN por tipo+día (sheet "Correlativos")
// [ADD]    admin_guardar_documento: persiste el documento generado (sheet "Documentos")
// [ADD]    doGet: nuevo action "siguiente_numero_doc"
// [ADD]    doPost: nuevo actionAdmin "guardar_documento"
// ------------------------------------------------------------
// CHANGELOG v4.2:
// [MERGE]  Integración completa de v4.0 (producción) + v4.1 (fixes)
// [KEEP]   v4.1: mapearFila incluye rowIndex real (base-0)
// [KEEP]   v4.1: admin_editar_diag busca por diagNum (robusto), rowIndex como fallback
// [KEEP]   v4.1: columnas nuevas creadas automáticamente (asegurarColumnasDiag)
// [KEEP]   v4.1: obtenerTodosLosDiags sin .reverse() (el frontend ordena)
// [KEEP]   v4.1: Citas: fecha/hora serializadas como string (fix bug "1899")
// [KEEP]   v4.1: actualizarEstadoDiag usa colMap (robusto)
// [KEEP]   v4.1: guardarDiagnostico usa colMap (robusto)
// [RESTORE] enviarEmailCliente: HTML completo con resumen y adjunto (de v4.0)
// [RESTORE] testPDF: test manual de generación de PDF (de v4.0)
// [KEEP]   Todo el resto de v4.0 intacto
// ============================================================

// ── CONSTANTES ───────────────────────────────────────────────
var SHEET_DIAG      = "Diagnósticos";
var SHEET_CONTADOR  = "Contador";
var SHEET_CLIENTES  = "Clientes";
var DRIVE_FOLDER_ID = "1hLqetC34UwXc2kKh4YWqxLnutN2iSW4Y";

var ADMIN_EMAILS = [
  "soportecyclops@gmail.com",
  "contacto@soportecyclops.com.ar",
  "juan@soportecyclops.com.ar",
  "juanpabloalza@gmail.com"
];

var SHEET_CITAS    = "Citas";
var SHEET_LLAMADOS = "Llamados";

// v4.0 Accesos
var ACCESOS_SHEET_ID  = "125xvw4FWXPxc709XKqyUo9jZyNHxBGRins0jOS4TQGA";
var SHEET_ACCESOS_CLI = "Clientes";
var SHEET_ACCESOS_ADM = "Administradores";
var AUTO_REGISTRO     = true;

// v4.3 Documentos (Presupuestos / Hojas de Trabajo / Remitos)
var SHEET_DOCUMENTOS   = "Documentos";
var SHEET_CORRELATIVOS = "Correlativos";

// Columnas requeridas en el sheet de Diagnósticos
// Si no existen, se crean automáticamente al guardar.
var REQUIRED_COLS = [
  "Nº Diagnóstico", "Fecha", "Nombre", "Email",
  "Servicio", "Síntoma / Equipo", "Resumen",
  "Severidad", "Risk Warning", "PDF", "Pasos", "Estado",
  "Leido por", "Fecha lectura", "Técnico", "Presupuesto", "Notas Admin",
  "Categoria", "Canal"
];

// ── Helper: asegurar que el sheet tenga todas las columnas ───
function asegurarColumnasDiag() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SHEET_DIAG);
  if (!hoja) return;

  var cab      = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var faltantes = REQUIRED_COLS.filter(function(c){ return cab.indexOf(c) < 0; });
  if (faltantes.length === 0) return;

  var lastCol = hoja.getLastColumn();
  faltantes.forEach(function(col) {
    lastCol++;
    hoja.getRange(1, lastCol).setValue(col).setFontWeight("bold");
  });
  Logger.log("Columnas agregadas: " + faltantes.join(", "));
}

// ── Helpers para planilla de Accesos ─────────────────────────
function getAccesosSpreadsheet() {
  return SpreadsheetApp.openById(ACCESOS_SHEET_ID);
}

function getHojaAccesos(tipo) {
  var ss        = getAccesosSpreadsheet();
  var sheetName = (tipo === 'admin') ? SHEET_ACCESOS_ADM : SHEET_ACCESOS_CLI;
  var hoja      = ss.getSheetByName(sheetName);
  if (!hoja) {
    hoja = ss.insertSheet(sheetName);
    hoja.appendRow(["usuario", "email"]);
    hoja.getRange(1,1,1,2).setFontWeight("bold").setBackground("#1a3a5c").setFontColor("white");
  }
  return hoja;
}

function buscarEnAccesos(tipo, email) {
  var hoja       = getHojaAccesos(tipo);
  var datos      = hoja.getDataRange().getValues();
  var emailLower = String(email).toLowerCase().trim();
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][1] || "").toLowerCase().trim() === emailLower) {
      return { encontrado: true, rowIndex: i - 1, nombre: String(datos[i][0] || "") };
    }
  }
  return { encontrado: false };
}

function listarAccesos(tipo) {
  var hoja  = getHojaAccesos(tipo);
  var datos = hoja.getDataRange().getValues();
  var res   = [];
  for (var i = 1; i < datos.length; i++) {
    if (datos[i][0] || datos[i][1]) {
      res.push({ rowIndex: i - 1, nombre: String(datos[i][0] || ""), email: String(datos[i][1] || "") });
    }
  }
  return res;
}

// ── doPost ────────────────────────────────────────────────────
function doPost(e) {
  try {
    var _q = portalPost_(e); if (_q) return _q;

    var raw     = e.parameter.payload || (e.postData && e.postData.contents) || "{}";
    var payload = JSON.parse(raw);

    if (payload.action_type === "update_perfil") {
      actualizarPerfilCompleto(payload);
      return jsonResponse({ ok: true });
    }

    if (payload.action_type === "update_estado") {
      if (!esAdmin(payload.admin_email)) return jsonResponse({ ok: false, error: "No autorizado" });
      actualizarEstadoDiag(payload.diagNum, payload.estado, payload.admin_email);
      return jsonResponse({ ok: true });
    }

    var actionAdmin = e.parameter.action || "";

    if (actionAdmin === "admin_editar_diag")   return admin_editar_diag(e.parameter);
    if (actionAdmin === "admin_nuevo_diag")    return admin_nuevo_diag_manual(e.parameter);
    if (actionAdmin === "admin_nueva_cita")    return admin_nueva_cita(e.parameter);
    if (actionAdmin === "admin_editar_cita")   return admin_editar_cita(e.parameter);
    if (actionAdmin === "admin_nuevo_llamado") return admin_nuevo_llamado(e.parameter);
    if (actionAdmin === "nuevo_usuario")       return accion_nuevo_usuario(e.parameter);
    if (actionAdmin === "editar_usuario")      return accion_editar_usuario(e.parameter);
    if (actionAdmin === "eliminar_usuario")    return accion_eliminar_usuario(e.parameter);
    if (actionAdmin === "guardar_documento")   return admin_guardar_documento(e.parameter);
    if (actionAdmin === "actualizar_documento") return admin_actualizar_documento(e.parameter);
    if (actionAdmin === "eliminar_documento")   return admin_eliminar_documento(e.parameter);
    if (actionAdmin === "registro_cliente")     return registro_cliente(e.parameter);

    // Guardar diagnóstico nuevo desde chatbot
    var diagNum = generarDiagNumServidor();
    payload.diagNum = diagNum;

    var pdfUrl  = "";
    var pdfBlob = null;
    try {
      var resultado = generarPDFBlob(payload);
      pdfBlob = resultado.blob;
      pdfUrl  = resultado.url;
    } catch (pdfErr) { Logger.log("PDF error: " + pdfErr.toString()); }

    payload.pdf_url = pdfUrl;
    guardarDiagnostico(payload);

    if (payload.email && payload.email !== "No provisto" && payload.email !== "") {
      actualizarCliente(payload);
      if (AUTO_REGISTRO) {
        var busq = buscarEnAccesos('cliente', payload.email);
        if (!busq.encontrado) getHojaAccesos('cliente').appendRow([payload.nombre || "", payload.email]);
      }
      if (pdfBlob && payload.email) {
        try { enviarEmailCliente(payload, pdfBlob); } catch (mailErr) { Logger.log("Email error: " + mailErr.toString()); }
      }
    }

    return jsonResponse({ ok: true, diagNum: diagNum, pdfUrl: pdfUrl });

  } catch (err) {
    Logger.log("doPost error: " + err.toString());
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

// ── doGet ─────────────────────────────────────────────────────
function doGet(e) {
  var _p = portalGet_(e); if (_p) return _p;

  var action = e && e.parameter && e.parameter.action;

  if (action === "diags_por_email") {
    var email = e.parameter.email || "";
    if (AUTO_REGISTRO && email) {
      var busq = buscarEnAccesos('cliente', email);
      if (!busq.encontrado) getHojaAccesos('cliente').appendRow(["", email]);
    }
    return jsonResponse({ ok: true, diagnosticos: obtenerDiagsPorEmail(email) });
  }

  if (action === "buscar_diag") {
    var diagNum = (e.parameter.diagNum || "").trim().toUpperCase();
    var diag    = buscarDiagPorNumero(diagNum);
    if (diag) {
      var adminEmail = e.parameter.admin_email || "";
      if (!esAdmin(adminEmail)) { delete diag.email; if (diag.nombre) diag.nombre = diag.nombre.split(" ")[0]; }
      return jsonResponse({ ok: true, diagnostico: diag });
    }
    return jsonResponse({ ok: false, error: "No encontrado" });
  }

  if (action === "get_all_diags") {
    var adminEmailG = e.parameter.admin_email || "";
    if (!esAdmin(adminEmailG)) return jsonResponse({ ok: false, error: "No autorizado" });
    return jsonResponse({ ok: true, diagnosticos: obtenerTodosLosDiags() });
  }

  if (action === "ultimo_num") {
    return jsonResponse({ ok: true, ultimoNum: obtenerUltimoNumDia(), fecha: getFechaHoy() });
  }

  if (action === "admin_todos_diags") {
    return jsonResponse({ ok: true, diagnosticos: obtenerTodosLosDiags() });
  }
  if (action === "admin_todas_citas") {
    return jsonResponse({ ok: true, citas: obtenerTodasLasCitas() });
  }
  if (action === "admin_llamados") {
    return jsonResponse({ ok: true, llamados: obtenerTodosLosLlamados() });
  }

  // v4.0: verificar_acceso
  if (action === "verificar_acceso") {
    var emailV = (e.parameter.email || "").toLowerCase().trim();
    if (!emailV) return jsonResponse({ ok: false, rol: 'ninguno' });
    if (esAdmin(emailV)) return jsonResponse({ ok: true, rol: 'admin' });
    var esAdminSheet   = buscarEnAccesos('admin', emailV).encontrado;
    if (esAdminSheet) return jsonResponse({ ok: true, rol: 'admin' });
    var esClienteSheet = buscarEnAccesos('cliente', emailV).encontrado;
    if (esClienteSheet) return jsonResponse({ ok: true, rol: 'cliente' });
    if (AUTO_REGISTRO) {
      getHojaAccesos('cliente').appendRow(["", emailV]);
      return jsonResponse({ ok: true, rol: 'cliente' });
    }
    return jsonResponse({ ok: true, rol: 'ninguno' });
  }

  if (action === "get_clientes_autorizados") {
    return jsonResponse({ ok: true, usuarios: listarAccesos('cliente') });
  }
  if (action === "get_admins") {
    return jsonResponse({ ok: true, usuarios: listarAccesos('admin') });
  }

  // v4.3: numeración correlativa de Documentos (Presupuestos/Hojas/Remitos)
  if (action === "siguiente_numero_doc") {
    return jsonResponse(obtenerSiguienteNumeroDoc(e.parameter));
  }
  // v4.4: listado de documentos (por cliente opcional) y datos completos de clientes
  if (action === "listar_documentos") {
    return jsonResponse(listar_documentos(e.parameter));
  }
  if (action === "listar_clientes_completo") {
    return jsonResponse(listar_clientes_completo());
  }

  return jsonResponse({ ok: true, info: "Cyclops API v4.3" });
}

// ── Gestión de usuarios v4.0 ──────────────────────────────────
function accion_nuevo_usuario(p) {
  var tipo  = p.tipo || 'cliente';
  var email = (p.email || "").toLowerCase().trim();
  if (!email) return jsonResponse({ ok: false, error: "Email requerido" });
  var busq = buscarEnAccesos(tipo, email);
  if (busq.encontrado) return jsonResponse({ ok: false, error: "El email ya existe" });
  getHojaAccesos(tipo).appendRow([p.nombre || "", email]);
  return jsonResponse({ ok: true });
}

function accion_editar_usuario(p) {
  var tipo     = p.tipo || 'cliente';
  var rowIndex = parseInt(p.rowIndex);
  if (isNaN(rowIndex) || rowIndex < 0) return jsonResponse({ ok: false, error: "rowIndex inválido" });
  var hoja      = getHojaAccesos(tipo);
  var filaSheet = rowIndex + 2;
  if (filaSheet > hoja.getLastRow()) return jsonResponse({ ok: false, error: "Fila no existe" });
  if (p.nombre !== undefined) hoja.getRange(filaSheet, 1).setValue(p.nombre);
  if (p.email  !== undefined) hoja.getRange(filaSheet, 2).setValue((p.email || "").toLowerCase().trim());
  return jsonResponse({ ok: true });
}

function accion_eliminar_usuario(p) {
  var tipo     = p.tipo || 'cliente';
  var rowIndex = parseInt(p.rowIndex);
  if (isNaN(rowIndex) || rowIndex < 0) return jsonResponse({ ok: false, error: "rowIndex inválido" });
  var hoja      = getHojaAccesos(tipo);
  var filaSheet = rowIndex + 2;
  if (filaSheet > hoja.getLastRow()) return jsonResponse({ ok: false, error: "Fila no existe" });
  hoja.deleteRow(filaSheet);
  return jsonResponse({ ok: true });
}

function esAdmin(email) {
  if (!email) return false;
  var e = String(email).toLowerCase().trim();
  for (var i = 0; i < ADMIN_EMAILS.length; i++) {
    if (ADMIN_EMAILS[i].toLowerCase() === e) return true;
  }
  return false;
}

// ════════════════════════════════════════════════════════════
// SHEET — DIAGNÓSTICOS
// ════════════════════════════════════════════════════════════

function guardarDiagnostico(p) {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SHEET_DIAG);
  asegurarColumnasDiag();

  var sintomaEquipo = "";
  if (p.equipo && p.sintoma && p.equipo !== p.sintoma) sintomaEquipo = String(p.equipo) + " / " + String(p.sintoma);
  else if (p.sintoma) sintomaEquipo = String(p.sintoma);
  else if (p.equipo)  sintomaEquipo = String(p.equipo);

  var resumenFinal = "";
  var resumenRaw   = String(p.resumen || "").replace(/\n\n💰.*$/s, "").trim();
  if (resumenRaw.length > 50) {
    resumenFinal = resumenRaw;
  } else {
    var partes = [];
    if (p.equipo)   partes.push("Equipo: " + String(p.equipo));
    if (p.sintoma)  partes.push("Síntoma: " + String(p.sintoma));
    if (p.duracion) partes.push("Tiempo: " + String(p.duracion));
    if (resumenRaw && partes.indexOf(resumenRaw) === -1) partes.push(resumenRaw);
    resumenFinal = partes.join(". ");
  }

  var pasosStr = "";
  if (p.pasos) pasosStr = (typeof p.pasos === "string") ? p.pasos : p.pasos.join(" | ");

  var cab    = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var colMap = {};
  cab.forEach(function(col, idx) { if (col) colMap[String(col).trim()] = idx + 1; });

  var newRow = hoja.getLastRow() + 1;
  function setC(colName, val) {
    var c = colMap[colName];
    if (c) hoja.getRange(newRow, c).setValue(val || "");
  }

  setC("Nº Diagnóstico",  p.diagNum    || "");
  setC("Fecha",           p.fecha      || new Date().toLocaleString("es-AR"));
  setC("Nombre",          p.nombre     || "");
  setC("Email",           p.email      || "");
  setC("Servicio",        p.servicio   || "");
  setC("Síntoma / Equipo", sintomaEquipo);
  setC("Resumen",         resumenFinal);
  setC("Severidad",       p.severidad  || "");
  setC("Risk Warning",    p.riskWarning|| "");
  setC("PDF",             p.pdf_url    || "");
  setC("Pasos",           pasosStr);
  setC("Estado",          "nuevo");
  setC("Categoria",       p.categoria  || "");
  setC("Canal",           p.canal      || "");
}

// [FIX v4.1] admin_editar_diag: busca por diagNum (robusto), rowIndex como fallback
function admin_editar_diag(p) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var hoja  = ss.getSheetByName(SHEET_DIAG);
  asegurarColumnasDiag();

  var datos = hoja.getDataRange().getValues();
  var cab   = datos[0];
  var colMap = {};
  cab.forEach(function(col, idx) { if (col) colMap[String(col).trim()] = idx + 1; });

  var filaSheet  = -1;
  var diagNumCol = colMap["Nº Diagnóstico"] || 1;

  // Buscar por diagNum primero (más confiable)
  if (p.diagNum) {
    for (var i = 1; i < datos.length; i++) {
      if (String(datos[i][diagNumCol - 1] || "").toUpperCase() === String(p.diagNum).toUpperCase()) {
        filaSheet = i + 1;
        break;
      }
    }
  }

  // Fallback: rowIndex directo
  if (filaSheet < 0 && p.rowIndex !== undefined && p.rowIndex !== "") {
    var ri = parseInt(p.rowIndex);
    if (!isNaN(ri) && ri >= 0) filaSheet = ri + 2;
  }

  if (filaSheet < 0 || filaSheet > hoja.getLastRow()) {
    return jsonResponse({ ok: false, error: "Fila no encontrada para diagNum: " + (p.diagNum || "?") });
  }

  function setVal(colName, val) {
    if (val === undefined || val === null) return;
    var col = colMap[colName];
    if (!col) return;
    hoja.getRange(filaSheet, col).setValue(val);
  }

  var sintomaEquipo = "";
  if (p.equipo && p.sintoma && p.equipo !== p.sintoma) sintomaEquipo = String(p.equipo) + " / " + String(p.sintoma);
  else if (p.sintoma || p.equipo) sintomaEquipo = String(p.sintoma || p.equipo || "");

  if (p.nombre)        setVal("Nombre",          p.nombre);
  if (p.email)         setVal("Email",            p.email);
  if (p.servicio)      setVal("Servicio",         p.servicio);
  if (sintomaEquipo)   setVal("Síntoma / Equipo", sintomaEquipo);
  if (p.diagnostico)   setVal("Resumen",          p.diagnostico);
  if (p.severidad)     setVal("Severidad",        p.severidad);
  if (p.estado)        setVal("Estado",           p.estado);
  if (p.tecnico)       setVal("Técnico",          p.tecnico);
  if (p.presupuesto !== undefined && p.presupuesto !== "") setVal("Presupuesto", p.presupuesto);
  if (p.notas)         setVal("Notas Admin",      p.notas);
  if (p.categoria !== undefined) setVal("Categoria", p.categoria);
  if (p.canal     !== undefined) setVal("Canal",     p.canal);
  if (p.leido_por)     setVal("Leido por",        p.leido_por);
  if (p.fecha_lectura) setVal("Fecha lectura",    p.fecha_lectura);

  return jsonResponse({ ok: true, updated: filaSheet, diagNum: p.diagNum });
}

// [FIX v4.1] actualizarEstadoDiag: usa colMap (robusto)
function actualizarEstadoDiag(diagNum, nuevoEstado, adminEmail) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var hoja  = ss.getSheetByName(SHEET_DIAG);
  var datos = hoja.getDataRange().getValues();
  var cab   = datos[0];
  var colMap = {};
  cab.forEach(function(col, idx) { if (col) colMap[String(col).trim()] = idx + 1; });

  var diagNumCol = colMap["Nº Diagnóstico"] || 1;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][diagNumCol - 1] || "").toUpperCase() === String(diagNum).toUpperCase()) {
      var estadoCol = colMap["Estado"];
      if (estadoCol) hoja.getRange(i + 1, estadoCol).setValue(nuevoEstado || "nuevo");
      var leidoCol  = colMap["Leido por"];
      var fechaLCol = colMap["Fecha lectura"];
      if (leidoCol)  hoja.getRange(i + 1, leidoCol).setValue(adminEmail);
      if (fechaLCol) hoja.getRange(i + 1, fechaLCol).setValue(new Date().toLocaleString("es-AR"));
      return true;
    }
  }
  return false;
}

function obtenerDiagsPorEmail(email) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var hoja  = ss.getSheetByName(SHEET_DIAG);
  var datos = hoja.getDataRange().getValues();
  var cab   = datos[0];
  var res   = [];
  var emailIdx = cab.indexOf("Email"); if (emailIdx < 0) emailIdx = 3;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][emailIdx] || "").toLowerCase().trim() === String(email).toLowerCase().trim()) {
      res.push(mapearFila(cab, datos[i], i));
    }
  }
  return res.reverse();
}

// [FIX v4.1] Sin .reverse() — el frontend ordena con sort de columnas
function obtenerTodosLosDiags() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var hoja  = ss.getSheetByName(SHEET_DIAG);
  var datos = hoja.getDataRange().getValues();
  var cab   = datos[0];
  var res   = [];
  for (var i = 1; i < datos.length; i++) {
    if (datos[i].some(function(c){ return c !== ""; })) {
      res.push(mapearFila(cab, datos[i], i));
    }
  }
  return res;
}

function buscarDiagPorNumero(diagNum) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var hoja  = ss.getSheetByName(SHEET_DIAG);
  var datos = hoja.getDataRange().getValues();
  var cab   = datos[0];
  var diagIdx = cab.indexOf("Nº Diagnóstico"); if (diagIdx < 0) diagIdx = 0;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][diagIdx] || "").toUpperCase() === diagNum) return mapearFila(cab, datos[i], i);
  }
  return null;
}

// [FIX v4.1] Incluye rowIndex real (base-0 desde datos), serializa Dates
function mapearFila(cab, fila, filaRealIdx) {
  var obj = {};
  cab.forEach(function(col, idx) {
    var key = String(col || "col_" + idx).trim();
    if (key === "Nº Diagnóstico")                                   key = "diagNum";
    if (key === "Fecha")                                            key = "fecha";
    if (key === "Nombre")                                           key = "nombre";
    if (key === "Email")                                            key = "email";
    if (key === "Servicio")                                         key = "servicio";
    if (key === "Síntoma / Equipo" || key === "Síntoma / Equipo ")  key = "sintoma";
    if (key === "Resumen")                                          key = "resumen";
    if (key === "Severidad")                                        key = "severidad";
    if (key === "Risk Warning")                                     key = "riskWarning";
    if (key === "PDF")                                              key = "pdf_url";
    if (key === "Pasos")                                            key = "pasos";
    if (key === "Estado")                                           key = "estado";
    if (key === "Leido por")                                        key = "leido_por";
    if (key === "Fecha lectura")                                    key = "fecha_lectura";
    if (key === "Técnico")                                          key = "tecnico";
    if (key === "Presupuesto")                                      key = "presupuesto";
    if (key === "Notas Admin")                                      key = "notas";
    if (key === "Categoria")                                        key = "categoria";
    if (key === "Canal")                                            key = "canal";
    var val = fila[idx];
    if (val instanceof Date) val = val.toLocaleString("es-AR");
    obj[key] = val;
  });
  if (!obj.estado)        obj.estado        = "nuevo";
  if (!obj.leido_por)     obj.leido_por     = "";
  if (!obj.fecha_lectura) obj.fecha_lectura = "";
  // [FIX v4.1] rowIndex base-0 desde datos (fila 2 del sheet = idx 1 en datos = rowIndex 0)
  obj.rowIndex = filaRealIdx - 1;
  return obj;
}

// ════════════════════════════════════════════════════════════
// PDF — GENERA EL BLOB Y LO SUBE A DRIVE (v2.4, sin cambios)
// ════════════════════════════════════════════════════════════

function generarPDFBlob(p) {
  var sevLabels = {
    critica: "RIESGO CRÍTICO",
    alta:    "RIESGO ELEVADO",
    media:   "A TENER EN CUENTA",
    baja:    "SITUACIÓN ESTABLE"
  };
  var sevBorderColors = {
    critica: "#ef4444",
    alta:    "#f59e0b",
    media:   "#2563eb",
    baja:    "#22c55e"
  };
  var sev      = String(p.severidad || "media").toLowerCase();
  var sevLabel = sevLabels[sev]       || "A TENER EN CUENTA";
  var sevColor = sevBorderColors[sev] || "#2563eb";

  function clean(txt) {
    return String(txt || "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/[^\u0000-\u007F\u00C0-\u024F\u00A0-\u00FF]/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  var resumenFinal = "";
  if (p.resumen && p.resumen.length > 30) {
    resumenFinal = clean(p.resumen.replace(/\n\n.*USD.*/s, ""));
  } else {
    var partes = [];
    if (p.equipo)   partes.push("Equipo: " + clean(p.equipo));
    if (p.sintoma)  partes.push("Síntoma: " + clean(p.sintoma));
    if (p.duracion) partes.push("Tiempo: " + clean(p.duracion));
    resumenFinal = partes.join(". ");
  }

  var pasosArr = [];
  if (p.pasos) {
    if (typeof p.pasos === "string") {
      pasosArr = p.pasos.split(" | ").map(function(s){ return clean(s); }).filter(Boolean);
    } else if (Array.isArray(p.pasos)) {
      pasosArr = p.pasos.map(clean).filter(Boolean);
    }
  }

  var sintomaParaPDF = "";
  if (p.equipo && p.sintoma && p.equipo !== p.sintoma) {
    sintomaParaPDF = clean(p.equipo) + " / " + clean(p.sintoma);
  } else {
    sintomaParaPDF = clean(p.sintoma || p.equipo || "");
  }

  var docName = "DIAG_" + (p.diagNum || Date.now());
  var doc     = DocumentApp.create(docName);
  var body    = doc.getBody();

  var styleLabel = {};
  styleLabel[DocumentApp.Attribute.FONT_SIZE]        = 8;
  styleLabel[DocumentApp.Attribute.BOLD]             = true;
  styleLabel[DocumentApp.Attribute.FOREGROUND_COLOR] = "#94a3b8";

  var styleBody = {};
  styleBody[DocumentApp.Attribute.FONT_SIZE]        = 11;
  styleBody[DocumentApp.Attribute.FOREGROUND_COLOR] = "#475569";

  body.clear();

  body.appendParagraph("Soporte Cyclops")
      .setFontSize(20).setBold(true).setForegroundColor("#1a3a5c");
  body.appendParagraph("soporte.cyclops.com.ar  ·  +54 9 11 6680-4450  ·  contacto@soportecyclops.com.ar")
      .setFontSize(10).setForegroundColor("#64748b");
  body.appendParagraph("").setSpacingAfter(4);
  body.appendHorizontalRule();
  body.appendParagraph("").setSpacingAfter(4);

  body.appendParagraph("INFORME DE DIAGNÓSTICO TÉCNICO")
      .setFontSize(13).setBold(true).setForegroundColor("#2563eb");
  body.appendParagraph("").setSpacingAfter(2);
  body.appendParagraph("Nº " + (p.diagNum || "—") + "   |   " + (p.fecha || ""))
      .setFontSize(10).setBold(true).setForegroundColor("#2563eb");
  body.appendParagraph("").setSpacingAfter(4);

  var tblDatos = body.appendTable([
    ["CLIENTE",  p.nombre   || "—"],
    ["EMAIL",    p.email    || "—"],
    ["SERVICIO", p.servicio || "—"]
  ]);
  tblDatos.setColumnWidth(0, 100);
  tblDatos.setColumnWidth(1, 350);
  for (var ri = 0; ri < 3; ri++) {
    tblDatos.getCell(ri, 0).getChild(0).asParagraph()
      .setFontSize(8).setBold(true).setForegroundColor("#94a3b8");
    tblDatos.getCell(ri, 1).getChild(0).asParagraph()
      .setFontSize(11).setBold(ri === 0).setForegroundColor("#1e293b");
  }

  body.appendParagraph("").setSpacingAfter(4);
  body.appendParagraph("NIVEL DE RIESGO").setAttributes(styleLabel);
  body.appendParagraph(sevLabel).setFontSize(13).setBold(true).setForegroundColor(sevColor);
  body.appendParagraph("").setSpacingAfter(4);

  if (sintomaParaPDF) {
    body.appendParagraph("SÍNTOMA PRINCIPAL").setAttributes(styleLabel);
    body.appendParagraph(sintomaParaPDF).setAttributes(styleBody);
    if (p.duracion) {
      body.appendParagraph("Desde: " + clean(p.duracion)).setFontSize(10).setForegroundColor("#94a3b8");
    }
    body.appendParagraph("").setSpacingAfter(2);
  }

  if (resumenFinal) {
    body.appendParagraph("RESUMEN DEL DIAGNÓSTICO").setAttributes(styleLabel);
    body.appendParagraph(resumenFinal).setAttributes(styleBody);
    body.appendParagraph("").setSpacingAfter(2);
  }

  if (p.riskWarning) {
    body.appendParagraph("NOTA TÉCNICA DE RIESGO").setAttributes(styleLabel);
    body.appendParagraph(clean(p.riskWarning)).setFontSize(11).setForegroundColor("#78350f").setBold(false);
    body.appendParagraph("").setSpacingAfter(2);
  }

  if (pasosArr.length > 0) {
    body.appendParagraph("EVALUACIÓN TÉCNICA Y PASOS RECOMENDADOS").setAttributes(styleLabel);
    pasosArr.forEach(function(paso, i) {
      body.appendParagraph((i + 1) + ". " + paso)
          .setFontSize(11).setForegroundColor("#1e293b").setSpacingAfter(4);
    });
    body.appendParagraph("").setSpacingAfter(2);
  }

  body.appendHorizontalRule();
  body.appendParagraph("").setSpacingAfter(2);
  body.appendParagraph(
    "Soporte Cyclops  ·  +54 9 11 6680-4450  ·  contacto@soportecyclops.com.ar\n" +
    "CABA y Gran Buenos Aires  ·  Este informe es orientativo y no reemplaza el diagnóstico técnico presencial."
  ).setFontSize(8).setForegroundColor("#94a3b8").setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  doc.saveAndClose();

  var docId   = doc.getId();
  var pdfBlob = DriveApp.getFileById(docId)
    .getAs("application/pdf")
    .setName("diagnostico-" + (p.diagNum || "cyclops") + ".pdf");

  var folder  = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  var pdfFile = folder.createFile(pdfBlob);
  pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  DriveApp.getFileById(docId).setTrashed(true);

  var blobParaEmail = DriveApp.getFileById(pdfFile.getId()).getBlob();
  return { blob: blobParaEmail, url: "https://drive.google.com/file/d/" + pdfFile.getId() + "/view" };
}

// ════════════════════════════════════════════════════════════
// EMAIL AL CLIENTE — HTML completo (restaurado desde v4.0)
// ════════════════════════════════════════════════════════════

function enviarEmailCliente(p, pdfBlob) {
  var sevLabels = {
    critica: "Riesgo crítico",
    alta:    "Riesgo elevado",
    media:   "A tener en cuenta",
    baja:    "Situación estable"
  };
  var sev      = String(p.severidad || "media").toLowerCase();
  var sevLabel = sevLabels[sev] || "A tener en cuenta";
  var subject  = "Tu diagnóstico técnico Soporte Cyclops — " + (p.diagNum || "");

  var htmlBody =
    "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;'>" +
    "<div style='background:#1a3a5c;padding:24px 28px;border-radius:8px 8px 0 0;'>" +
      "<div style='font-size:20px;font-weight:700;color:#ffffff;'>Soporte Cyclops</div>" +
      "<div style='font-size:11px;color:#93c5fd;margin-top:4px;'>soportecyclops.com.ar  ·  +54 9 11 6680-4450</div>" +
    "</div>" +
    "<div style='background:#f8fafc;padding:28px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;'>" +
      "<p style='font-size:15px;margin:0 0 16px;'>Hola <strong>" + (p.nombre || "cliente") + "</strong>,</p>" +
      "<p style='color:#475569;line-height:1.6;margin:0 0 20px;'>Completaste tu diagnóstico técnico. Adjuntamos el informe en PDF.</p>" +
      "<div style='background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:18px 20px;margin-bottom:20px;'>" +
        "<div style='font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:10px;'>RESUMEN</div>" +
        "<div style='margin-bottom:8px;'><span style='font-size:11px;color:#94a3b8;'>N° </span><strong style='color:#2563eb;'>" + (p.diagNum || "—") + "</strong></div>" +
        "<div style='margin-bottom:8px;'><span style='font-size:11px;color:#94a3b8;'>Servicio: </span>" + (p.servicio || "—") + "</div>" +
        "<div><span style='font-size:11px;color:#94a3b8;'>Nivel: </span><strong>" + sevLabel + "</strong></div>" +
      "</div>" +
      "<p style='color:#475569;line-height:1.6;margin:0 0 20px;'>Un técnico va a revisar tu diagnóstico y te va a contactar a la brevedad para darte un presupuesto.</p>" +
      "<a href='https://wa.me/5491166804450' style='display:inline-block;background:#25D366;color:#ffffff;padding:12px 24px;border-radius:50px;font-weight:700;font-size:14px;text-decoration:none;'>Contactar por WhatsApp</a>" +
    "</div>" +
    "<div style='text-align:center;padding:16px;font-size:11px;color:#94a3b8;'>Soporte Cyclops  ·  CABA y Gran Buenos Aires</div>" +
    "</div>";

  var textBody =
    "Hola " + (p.nombre || "cliente") + ",\n\n" +
    "Completaste tu diagnóstico en soportecyclops.com.ar.\n" +
    "N° " + (p.diagNum || "—") + " — " + (p.servicio || "—") + " — " + sevLabel + "\n\n" +
    "Un técnico te va a contactar a la brevedad.\n" +
    "WhatsApp: https://wa.me/5491166804450\n\n" +
    "Soporte Cyclops · soportecyclops.com.ar";

  GmailApp.sendEmail(p.email, subject, textBody, {
    htmlBody:    htmlBody,
    attachments: pdfBlob ? [pdfBlob] : [],
    name:        "Soporte Cyclops",
    replyTo:     "contacto@soportecyclops.com.ar"
  });
}

// ════════════════════════════════════════════════════════════
// NUMERACIÓN SECUENCIAL (v2.4, sin cambios)
// ════════════════════════════════════════════════════════════

function generarDiagNumServidor() {
  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var hoja    = ss.getSheetByName(SHEET_CONTADOR);
  var fecha   = getFechaHoy();
  var datos   = hoja.getDataRange().getValues();
  var filaIdx = -1;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]) === fecha) { filaIdx = i + 1; break; }
  }
  var nuevoNum;
  if (filaIdx === -1) { nuevoNum = 1; hoja.appendRow([fecha, nuevoNum]); }
  else { nuevoNum = Number(datos[filaIdx - 1][1]) + 1; hoja.getRange(filaIdx, 2).setValue(nuevoNum); }
  return "DIAG-" + fecha + "-" + String(nuevoNum).padStart(4, "0");
}

function getFechaHoy() {
  var h  = new Date();
  var dd = String(h.getDate()).padStart(2, "0");
  var mm = String(h.getMonth() + 1).padStart(2, "0");
  var aa = String(h.getFullYear()).slice(-2);
  return dd + mm + aa;
}

function obtenerUltimoNumDia() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var hoja  = ss.getSheetByName(SHEET_CONTADOR);
  var fecha = getFechaHoy();
  var datos = hoja.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]) === fecha) return Number(datos[i][1]);
  }
  return 0;
}

// ════════════════════════════════════════════════════════════
// SHEET — CLIENTES historial (v2.4, sin cambios)
// ════════════════════════════════════════════════════════════

function actualizarCliente(p) {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SHEET_CLIENTES);
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(["email","nombre","primer_diag","total_diags","ultimo_diag","ultima_fecha","telefono","direccion","localidad","cp","empresa","nota"]);
  }
  var datos   = hoja.getDataRange().getValues();
  var filaIdx = -1;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]).toLowerCase() === String(p.email).toLowerCase()) { filaIdx = i + 1; break; }
  }
  if (filaIdx === -1) {
    hoja.appendRow([p.email, p.nombre, p.diagNum, 1, p.diagNum, p.fecha, "","","","","",""]);
  } else {
    var total = Number(datos[filaIdx - 1][3]) || 0;
    hoja.getRange(filaIdx, 2).setValue(p.nombre);
    hoja.getRange(filaIdx, 4).setValue(total + 1);
    hoja.getRange(filaIdx, 5).setValue(p.diagNum);
    hoja.getRange(filaIdx, 6).setValue(p.fecha);
  }
}

function actualizarPerfilCompleto(p) {
  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var hoja    = ss.getSheetByName(SHEET_CLIENTES);
  var datos   = hoja.getDataRange().getValues();
  var filaIdx = -1;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]).toLowerCase() === String(p.email || "").toLowerCase()) { filaIdx = i + 1; break; }
  }
  if (filaIdx === -1) {
    hoja.appendRow([p.email, p.nombre||"","",0,"","", p.telefono||"",p.direccion||"",p.localidad||"",p.cp||"",p.empresa||"",p.nota||""]);
  } else {
    if (p.nombre    !== undefined) hoja.getRange(filaIdx, 2).setValue(p.nombre);
    if (p.telefono  !== undefined) hoja.getRange(filaIdx, 7).setValue(p.telefono);
    if (p.direccion !== undefined) hoja.getRange(filaIdx, 8).setValue(p.direccion);
    if (p.localidad !== undefined) hoja.getRange(filaIdx, 9).setValue(p.localidad);
    if (p.cp        !== undefined) hoja.getRange(filaIdx, 10).setValue(p.cp);
    if (p.empresa   !== undefined) hoja.getRange(filaIdx, 11).setValue(p.empresa);
    if (p.nota      !== undefined) hoja.getRange(filaIdx, 12).setValue(p.nota);
  }
}

// ════════════════════════════════════════════════════════════
// HELPER JSON
// ════════════════════════════════════════════════════════════

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ════════════════════════════════════════════════════════════
// ADMIN: DIAGNÓSTICOS — nuevo manual desde panel
// ════════════════════════════════════════════════════════════

function admin_nuevo_diag_manual(p) {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SHEET_DIAG);
  asegurarColumnasDiag();

  var diagNum = generarDiagNumServidor();
  var fecha   = new Date().toLocaleString("es-AR");
  var sintomaEquipo = (p.equipo && p.sintoma && p.equipo !== p.sintoma)
    ? String(p.equipo) + " / " + String(p.sintoma)
    : String(p.sintoma || p.equipo || "");

  var cab    = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var colMap = {};
  cab.forEach(function(col, idx) { if (col) colMap[String(col).trim()] = idx + 1; });

  var newRow = hoja.getLastRow() + 1;
  function setC(cn, v) { var c = colMap[cn]; if (c) hoja.getRange(newRow, c).setValue(v || ""); }

  setC("Nº Diagnóstico",  diagNum);
  setC("Fecha",            fecha);
  setC("Nombre",           p.nombre    || "");
  setC("Email",            p.email     || "");
  setC("Servicio",         p.servicio  || "");
  setC("Síntoma / Equipo", sintomaEquipo);
  setC("Resumen",          p.diagnostico || p.sintoma || "");
  setC("Severidad",        p.severidad || "media");
  setC("Estado",           p.estado    || "nuevo");
  setC("Técnico",          p.tecnico   || "");
  setC("Presupuesto",      p.presupuesto || "");
  setC("Notas Admin",      p.notas     || "");
  setC("Categoria",        p.categoria || "");
  setC("Canal",            p.canal     || "");

  if (p.email) actualizarCliente({ email: p.email, nombre: p.nombre, diagNum: diagNum, fecha: fecha });
  return jsonResponse({ ok: true, diagNum: diagNum });
}

// ════════════════════════════════════════════════════════════
// ADMIN: CITAS — [FIX v4.1] fecha/hora se guardan como string
// ════════════════════════════════════════════════════════════

function getSheetCitas() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SHEET_CITAS);
  if (!hoja) {
    hoja = ss.insertSheet(SHEET_CITAS);
    hoja.appendRow(["Fecha","Hora","Nombre","Teléfono","Email","Dirección","Servicio","Estado","N° Diagnóstico","Notas"]);
    hoja.getRange(1,1,1,10).setFontWeight("bold").setBackground("#1a3a5c").setFontColor("white");
    // Formatear columnas Fecha y Hora como texto para evitar conversión automática de Sheets
    hoja.getRange("A:A").setNumberFormat("@");
    hoja.getRange("B:B").setNumberFormat("@");
  }
  return hoja;
}

function obtenerTodasLasCitas() {
  var hoja  = getSheetCitas();
  var datos = hoja.getDataRange().getValues();
  var res   = [];
  for (var i = 1; i < datos.length; i++) {
    var r = datos[i];
    if (r.some(function(c){ return c !== ""; })) {
      // [FIX v4.1] serializar fecha/hora correctamente (evitar objeto Date de Sheets)
      var fechaStr = r[0] instanceof Date
        ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), "dd/MM/yyyy")
        : String(r[0] || "");
      var horaStr  = r[1] instanceof Date
        ? Utilities.formatDate(r[1], Session.getScriptTimeZone(), "HH:mm")
        : String(r[1] || "");
      res.push({
        rowIndex: i - 1,
        fecha:    fechaStr,
        hora:     horaStr,
        nombre:   String(r[2] || ""),
        telefono: String(r[3] || ""),
        email:    String(r[4] || ""),
        direccion:String(r[5] || ""),
        servicio: String(r[6] || ""),
        estado:   String(r[7] || "pendiente"),
        diagNum:  String(r[8] || ""),
        notas:    String(r[9] || "")
      });
    }
  }
  return res;
}

function admin_nueva_cita(p) {
  var hoja = getSheetCitas();
  hoja.appendRow([
    p.fecha || "", p.hora || "", p.nombre || "", p.telefono || "",
    p.email || "", p.direccion || "", p.servicio || "",
    p.estado || "pendiente", p.diagNum || "", p.notas || ""
  ]);
  return jsonResponse({ ok: true, message: "Cita creada" });
}

function admin_editar_cita(p) {
  var rowIndex = parseInt(p.rowIndex);
  if (isNaN(rowIndex) || rowIndex < 0) return jsonResponse({ ok: false, error: "rowIndex inválido" });
  var hoja      = getSheetCitas();
  var filaSheet = rowIndex + 2;
  if (filaSheet > hoja.getLastRow()) return jsonResponse({ ok: false, error: "Fila no existe" });
  var cols = { fecha:1, hora:2, nombre:3, telefono:4, email:5, direccion:6, servicio:7, estado:8, diagNum:9, notas:10 };
  function setVal(col, val) { if (val !== undefined && val !== null) hoja.getRange(filaSheet, col).setValue(val); }
  setVal(cols.fecha, p.fecha);       setVal(cols.hora,     p.hora);
  setVal(cols.nombre, p.nombre);     setVal(cols.telefono, p.telefono);
  setVal(cols.email, p.email);       setVal(cols.direccion,p.direccion);
  setVal(cols.servicio, p.servicio); setVal(cols.estado,   p.estado);
  setVal(cols.diagNum, p.diagNum);   setVal(cols.notas,    p.notas);
  return jsonResponse({ ok: true, updated: filaSheet });
}

// ════════════════════════════════════════════════════════════
// ADMIN: LLAMADOS
// ════════════════════════════════════════════════════════════

function getSheetLlamados() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SHEET_LLAMADOS);
  if (!hoja) {
    hoja = ss.insertSheet(SHEET_LLAMADOS);
    hoja.appendRow(["Fecha","Hora","Tipo","Nombre","Contacto","Notas"]);
    hoja.getRange(1,1,1,6).setFontWeight("bold").setBackground("#1a3a5c").setFontColor("white");
  }
  return hoja;
}

function obtenerTodosLosLlamados() {
  var hoja  = getSheetLlamados();
  var datos = hoja.getDataRange().getValues();
  var res   = [];
  for (var i = 1; i < datos.length; i++) {
    var r = datos[i];
    if (r.some(function(c){ return c !== ""; })) {
      res.push({
        rowIndex: i - 1,
        fecha:    String(r[0] || ""),
        hora:     String(r[1] || ""),
        tipo:     String(r[2] || "llamado"),
        nombre:   String(r[3] || ""),
        contacto: String(r[4] || ""),
        notas:    String(r[5] || "")
      });
    }
  }
  return res.reverse();
}

function admin_nuevo_llamado(p) {
  var hoja = getSheetLlamados();
  hoja.appendRow([
    p.fecha    || new Date().toLocaleDateString("es-AR"),
    p.hora     || new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    p.tipo     || "llamado",
    p.nombre   || "",
    p.contacto || "",
    p.notas    || ""
  ]);
  return jsonResponse({ ok: true, message: "Llamado registrado" });
}

// ════════════════════════════════════════════════════════════
// v4.3 — ADMIN: DOCUMENTOS (Presupuestos / Hojas de Trabajo / Remitos)
// ════════════════════════════════════════════════════════════

function getHojaCorrelativos() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SHEET_CORRELATIVOS);
  if (!hoja) {
    hoja = ss.insertSheet(SHEET_CORRELATIVOS);
    hoja.appendRow(["tipo_fecha", "ultimo_numero"]);
    hoja.getRange(1,1,1,2).setFontWeight("bold").setBackground("#1a3a5c").setFontColor("white");
  }
  return hoja;
}

function getHojaDocumentos() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SHEET_DOCUMENTOS);
  if (!hoja) {
    hoja = ss.insertSheet(SHEET_DOCUMENTOS);
    hoja.appendRow([
      "Numero","Tipo","Fecha","Cliente Nombre","Cliente Telefono","Cliente Email",
      "Cliente Direccion","Equipo","Diagnostico","Items","Subtotal","IVA","Total",
      "Observaciones","Validez","Creado en"
    ]);
    hoja.getRange(1,1,1,16).setFontWeight("bold").setBackground("#1a3a5c").setFontColor("white");
  }
  return hoja;
}

// GET ?action=siguiente_numero_doc&tipo=presupuesto&fecha=02092026&peek=1
// peek=1 → solo consulta el próximo número, no lo consume
// peek=0 (o ausente en el flujo de guardado) → reserva y consume el número
function obtenerSiguienteNumeroDoc(p) {
  var tipo  = p.tipo || "documento";
  var fecha = p.fecha || getFechaHoyDDMMYYYY();
  var peek  = p.peek === "1";

  var hoja = getHojaCorrelativos();
  var key  = tipo + "_" + fecha;
  var datos = hoja.getDataRange().getValues();

  var filaIdx = -1;
  var ultimo  = 0;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]) === key) { filaIdx = i + 1; ultimo = Number(datos[i][1]) || 0; break; }
  }

  var siguiente = ultimo + 1;

  if (!peek) {
    if (filaIdx === -1) hoja.appendRow([key, siguiente]);
    else hoja.getRange(filaIdx, 2).setValue(siguiente);
  }

  return { ok: true, siguiente: siguiente };
}

function getFechaHoyDDMMYYYY() {
  var h  = new Date();
  var dd = String(h.getDate()).padStart(2, "0");
  var mm = String(h.getMonth() + 1).padStart(2, "0");
  var aa = h.getFullYear();
  return dd + mm + aa;
}

// POST action=guardar_documento — persiste el documento en el sheet "Documentos"
function admin_guardar_documento(p) {
  var hoja = getHojaDocumentos();

  var cliente = {};
  var equipo  = {};
  try { cliente = JSON.parse(p.cliente || "{}"); } catch (err) {}
  try { equipo  = JSON.parse(p.equipo  || "{}"); } catch (err) {}

  hoja.appendRow([
    p.numero || "",
    p.tipo || "",
    p.fecha || "",
    cliente.nombre    || "",
    cliente.telefono  || "",
    cliente.email     || "",
    cliente.direccion || "",
    JSON.stringify(equipo),
    p.diagnostico || "",
    p.items || "[]",
    p.subtotal || 0,
    p.iva || 0,
    p.total || 0,
    p.observaciones || "",
    p.validez || "",
    new Date().toLocaleString("es-AR")
  ]);

  return jsonResponse({ ok: true });
}

// ════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════

function testV42() {
  Logger.log("=== TEST v4.2 ===");
  asegurarColumnasDiag();
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DIAG);
  var cab  = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  Logger.log("Columnas actuales: " + cab.filter(Boolean).join(", "));

  var diags = obtenerTodosLosDiags();
  Logger.log("Total diags: " + diags.length);
  if (diags.length > 0) {
    Logger.log("Primer diag — rowIndex: " + diags[0].rowIndex + " | diagNum: " + diags[0].diagNum);
    Logger.log("Último diag — rowIndex: " + diags[diags.length-1].rowIndex + " | diagNum: " + diags[diags.length-1].diagNum);
  }
  return "OK";
}

function testAccesos() {
  Logger.log("=== TEST ACCESOS ===");
  var ss = getAccesosSpreadsheet();
  Logger.log("Planilla accesos: " + ss.getName());
  Logger.log("Hoja clientes: " + getHojaAccesos('cliente').getName());
  Logger.log("Hoja admins: " + getHojaAccesos('admin').getName());
  Logger.log("Clientes: " + listarAccesos('cliente').length);
  Logger.log("Admins: " + listarAccesos('admin').length);
  var r1 = buscarEnAccesos('admin', 'juanpabloalza@gmail.com');
  Logger.log("Buscar juanpabloalza en admin: " + JSON.stringify(r1));
  return "OK";
}

function testPDF() {
  var payload = {
    diagNum:     "DIAG-TEST-0001",
    fecha:       new Date().toLocaleString("es-AR"),
    nombre:      "Test Automatico",
    email:       "contacto@soportecyclops.com.ar",
    servicio:    "Soporte Informatico",
    sintoma:     "Prueba de generacion de PDF",
    equipo:      "PC de escritorio",
    duracion:    "Hoy mismo",
    resumen:     "Equipo: PC de escritorio. Sintoma: Prueba. Tiempo: Hoy mismo.",
    riskWarning: "Este es un diagnostico de prueba.",
    severidad:   "baja",
    pasos:       "1. Verificar conexiones. | 2. Reiniciar equipo. | 3. Contactar tecnico."
  };
  try {
    var r = generarPDFBlob(payload);
    Logger.log("PDF generado OK — URL: " + r.url);
    return "OK — " + r.url;
  } catch (e) {
    Logger.log("Error: " + e.toString());
    return "ERROR: " + e.toString();
  }
}

// POST action=actualizar_documento — actualiza un documento existente (por Numero), sin consumir correlativo nuevo
function admin_actualizar_documento(p) {
  var hoja = getHojaDocumentos();
  var datos = hoja.getDataRange().getValues();
  var cab = datos[0];
  var colNumero = cab.indexOf("Numero");
  var filaSheet = -1;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][colNumero]) === String(p.numero)) { filaSheet = i + 1; break; }
  }
  if (filaSheet === -1) {
    // No existía (por ejemplo, se editó un doc que sólo estaba guardado localmente): lo insertamos
    return admin_guardar_documento(p);
  }

  var cliente = {};
  var equipo  = {};
  try { cliente = JSON.parse(p.cliente || "{}"); } catch (err) {}
  try { equipo  = JSON.parse(p.equipo  || "{}"); } catch (err) {}

  var colMap = {};
  cab.forEach(function(c, idx) { colMap[c] = idx + 1; });
  function setC(nombre, val) { if (colMap[nombre]) hoja.getRange(filaSheet, colMap[nombre]).setValue(val); }

  setC("Tipo", p.tipo || "");
  setC("Fecha", p.fecha || "");
  setC("Cliente Nombre", cliente.nombre || "");
  setC("Cliente Telefono", cliente.telefono || "");
  setC("Cliente Email", cliente.email || "");
  setC("Cliente Direccion", cliente.direccion || "");
  setC("Equipo", JSON.stringify(equipo));
  setC("Diagnostico", p.diagnostico || "");
  setC("Items", p.items || "[]");
  setC("Subtotal", p.subtotal || 0);
  setC("IVA", p.iva || 0);
  setC("Total", p.total || 0);
  setC("Observaciones", p.observaciones || "");
  setC("Validez", p.validez || "");

  return jsonResponse({ ok: true, actualizado: p.numero });
}

// POST action=eliminar_documento — borra un documento por Numero
function admin_eliminar_documento(p) {
  var hoja = getHojaDocumentos();
  var datos = hoja.getDataRange().getValues();
  var cab = datos[0];
  var colNumero = cab.indexOf("Numero");
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][colNumero]) === String(p.numero)) {
      hoja.deleteRow(i + 1);
      return jsonResponse({ ok: true, eliminado: p.numero });
    }
  }
  return jsonResponse({ ok: false, error: "No se encontró el documento " + p.numero });
}

// GET action=listar_documentos&email=... (email opcional, filtra por Cliente Email)
function listar_documentos(p) {
  var hoja = getHojaDocumentos();
  var datos = hoja.getDataRange().getValues();
  if (datos.length < 2) return { ok: true, documentos: [] };
  var cab = datos[0];
  var emailFiltro = (p.email || "").toLowerCase().trim();
  var colEmail = cab.indexOf("Cliente Email");

  var res = [];
  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    if (emailFiltro && String(fila[colEmail] || "").toLowerCase().trim() !== emailFiltro) continue;
    var obj = {};
    cab.forEach(function(c, idx) { obj[c] = fila[idx]; });
    res.push(obj);
  }
  return { ok: true, documentos: res.reverse() };
}

// GET action=listar_clientes_completo — datos completos desde el sheet "Clientes" (nombre, telefono, direccion, etc.)
function listar_clientes_completo() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SHEET_CLIENTES);
  if (!hoja) return { ok: true, clientes: [] };
  var datos = hoja.getDataRange().getValues();
  if (datos.length < 2) return { ok: true, clientes: [] };
  var cab = datos[0];
  var res = [];
  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    if (!fila[0]) continue; // sin email, se ignora
    var obj = {};
    cab.forEach(function(c, idx) { obj[c] = fila[idx]; });
    res.push(obj);
  }
  return { ok: true, clientes: res };
}

// POST action=registro_cliente — formulario público de inscripción (login.html, pestaña Registrarme)
// Obligatorios: nombre, telefono, email. El resto es opcional.
// Crea/actualiza la fila en SHEET_CLIENTES y agrega el email a Accesos > Clientes,
// para que al iniciar sesión con Google con ese mismo email ya quede reconocido y con el perfil completo.
function registro_cliente(p) {
  var email = (p.email || "").toLowerCase().trim();
  var nombre = (p.nombre || "").trim();
  var telefono = (p.telefono || "").trim();

  if (!email || !nombre || !telefono) {
    return jsonResponse({ ok: false, error: "Nombre, teléfono y email son obligatorios" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ ok: false, error: "Email inválido" });
  }

  actualizarPerfilCompleto({
    email: email,
    nombre: nombre,
    telefono: telefono,
    direccion: p.direccion || "",
    localidad: p.localidad || "",
    cp: p.cp || "",
    empresa: p.empresa || "",
    nota: p.nota || ""
  });

  var busq = buscarEnAccesos('cliente', email);
  if (!busq.encontrado) getHojaAccesos('cliente').appendRow([nombre, email]);

  return jsonResponse({ ok: true });
}

function testDocumentos() {
  Logger.log("=== TEST DOCUMENTOS v4.3 ===");
  var fecha = getFechaHoyDDMMYYYY();
  var r1 = obtenerSiguienteNumeroDoc({ tipo: "presupuesto", fecha: fecha, peek: "1" });
  Logger.log("Próximo número (peek): " + JSON.stringify(r1));
  var r2 = admin_guardar_documento({
    numero: fecha + "-001",
    tipo: "presupuesto",
    fecha: fecha,
    cliente: JSON.stringify({ nombre: "Cliente Test", telefono: "11-0000-0000" }),
    equipo: JSON.stringify({}),
    diagnostico: "Prueba de guardado",
    items: JSON.stringify([{ desc: "Item test", cant: 1, precio: 1000 }]),
    subtotal: 1000, iva: 0, total: 1000,
    observaciones: "Test automático"
  });
  Logger.log("Guardado: " + r2.getContent());
  return "OK";
}
