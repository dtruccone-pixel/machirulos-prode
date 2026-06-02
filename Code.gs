// ══════════════════════════════════════════════════════════════════
// LOS MACHIRULOS — PRODE MUNDIAL 2026 v4
// Backend: Google Apps Script + Google Sheets + Google Drive
// ══════════════════════════════════════════════════════════════════
//
// INSTRUCCIONES:
// 1. Reemplazá todo el código anterior con este
// 2. Implementar → Administrar implementaciones → Nueva versión
// 3. La URL no cambia
// ══════════════════════════════════════════════════════════════════

// ── HELPERS ──────────────────────────────────────────────────────

function getOrCreateSheet(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function getSpreadsheet() {
  const files = DriveApp.getFilesByName("Machirulos_Prode2026");
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  const ss = SpreadsheetApp.create("Machirulos_Prode2026");
  ["jugadores","resultados","pronosticos","config"].forEach(n => getOrCreateSheet(ss, n));
  return ss;
}

function getDriveFolder() {
  const folders = DriveApp.getFoldersByName("Machirulos_Fotos");
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder("Machirulos_Fotos");
}

function jsonResp(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── ROUTER ───────────────────────────────────────────────────────

function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = getSpreadsheet();

    if (action === "getAll") {
      return jsonResp({
        ok: true,
        jugadores:   getJugadores(ss),
        resultados:  getResultados(ss),
        pronosticos: getPronosticos(ss),
      });
    }

    return jsonResp({ ok: false, error: "Acción desconocida" });
  } catch(err) {
    return jsonResp({ ok: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action;
    const ss     = getSpreadsheet();

    switch(action) {

      case "setJugadores":
        setJugadores(ss, body.jugadores);
        return jsonResp({ ok: true });

      case "setResultado":
        setResultado(ss, body.partidoId, body.l, body.v);
        return jsonResp({ ok: true });

      case "setPronostico":
        setPronostico(ss, body.jugador, body.partidoId, body.l, body.v);
        return jsonResp({ ok: true });

      case "setAdminPass":
        setConfig(ss, "adminPass", body.pass);
        return jsonResp({ ok: true });

      case "checkPass":
        const stored = getConfig(ss, "adminPass") || "machirulos2026";
        return jsonResp({ ok: true, valid: body.pass === stored });

      case "checkDni":
        return jsonResp({ ok: true, valid: checkDni(ss, body.jugador, body.dni) });

      case "subirFoto":
        // body.jugador = nombre, body.base64 = imagen en base64, body.mime = tipo
        const url = subirFotoADrive(body.jugador, body.base64, body.mime);
        // guardar URL en jugadores
        setFotoJugador(ss, body.jugador, url);
        return jsonResp({ ok: true, url });

      default:
        return jsonResp({ ok: false, error: "Acción desconocida" });
    }
  } catch(err) {
    return jsonResp({ ok: false, error: err.toString() });
  }
}

// ── JUGADORES ─────────────────────────────────────────────────────
// Estructura: nombre | dni | fotoUrl

function getJugadores(ss) {
  const sh   = getOrCreateSheet(ss, "jugadores");
  const data = sh.getDataRange().getValues();
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const [nombre, dni, fotoUrl] = data[i];
    if (nombre) result.push({ nombre: String(nombre), dni: String(dni||""), fotoUrl: String(fotoUrl||"") });
  }
  return result;
}

function setJugadores(ss, lista) {
  // lista = [{nombre, dni, fotoUrl}]
  const sh = getOrCreateSheet(ss, "jugadores");
  sh.clearContents();
  sh.getRange(1, 1, 1, 3).setValues([["nombre","dni","fotoUrl"]]);
  lista.forEach((j, i) => {
    sh.getRange(i + 2, 1, 1, 3).setValues([[j.nombre, j.dni||"", j.fotoUrl||""]]);
  });
}

function checkDni(ss, jugador, dni) {
  const jugadores = getJugadores(ss);
  const j = jugadores.find(x => x.nombre === jugador);
  if (!j) return false;
  return String(j.dni) === String(dni);
}

function setFotoJugador(ss, jugador, fotoUrl) {
  const sh   = getOrCreateSheet(ss, "jugadores");
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === jugador) {
      sh.getRange(i + 1, 3).setValue(fotoUrl);
      return;
    }
  }
}

// ── FOTO EN DRIVE ─────────────────────────────────────────────────

function subirFotoADrive(jugador, base64, mime) {
  const folder  = getDriveFolder();
  const decoded = Utilities.base64Decode(base64);
  const blob    = Utilities.newBlob(decoded, mime, jugador + "_foto");

  // Borrar foto anterior si existe
  const existing = folder.getFilesByName(jugador + "_foto");
  while (existing.hasNext()) existing.next().setTrashed(true);

  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // URL directa para mostrar como imagen
  const fileId = file.getId();
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

// ── RESULTADOS ────────────────────────────────────────────────────

function getResultados(ss) {
  const sh   = getOrCreateSheet(ss, "resultados");
  const data = sh.getDataRange().getValues();
  const res  = {};
  for (let i = 1; i < data.length; i++) {
    const [id, l, v] = data[i];
    if (id) res[id] = { l: String(l), v: String(v) };
  }
  return res;
}

function setResultado(ss, partidoId, l, v) {
  const sh   = getOrCreateSheet(ss, "resultados");
  const data = sh.getDataRange().getValues();

  if (data.length === 0 || data[0][0] !== "partidoId") {
    sh.getRange(1, 1, 1, 3).setValues([["partidoId","l","v"]]);
  }

  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === partidoId) {
      sh.getRange(i + 1, 2, 1, 2).setValues([[l, v]]);
      return;
    }
  }
  sh.appendRow([partidoId, l, v]);
}

// ── PRONÓSTICOS ───────────────────────────────────────────────────

function getPronosticos(ss) {
  const sh   = getOrCreateSheet(ss, "pronosticos");
  const data = sh.getDataRange().getValues();
  const res  = {};
  for (let i = 1; i < data.length; i++) {
    const [jugador, pid, l, v] = data[i];
    if (!jugador || !pid) continue;
    if (!res[jugador]) res[jugador] = {};
    res[jugador][pid] = { l: String(l), v: String(v) };
  }
  return res;
}

function setPronostico(ss, jugador, partidoId, l, v) {
  const sh      = getOrCreateSheet(ss, "pronosticos");
  const allData = sh.getDataRange().getValues();

  if (allData.length === 0 || allData[0][0] !== "jugador") {
    sh.getRange(1, 1, 1, 4).setValues([["jugador","partidoId","l","v"]]);
  }

  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === jugador && rows[i][1] === partidoId) {
      sh.getRange(i + 1, 3, 1, 2).setValues([[l, v]]);
      return;
    }
  }
  sh.appendRow([jugador, partidoId, l, v]);
}

// ── CONFIG ────────────────────────────────────────────────────────

function getConfig(ss, key) {
  const sh   = getOrCreateSheet(ss, "config");
  const data = sh.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return null;
}

function setConfig(ss, key, value) {
  const sh   = getOrCreateSheet(ss, "config");
  const data = sh.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) {
      sh.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sh.appendRow([key, value]);
}
