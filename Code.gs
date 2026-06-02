// ══════════════════════════════════════════════════════════════════
// LOS MACHIRULOS — PRODE MUNDIAL 2026 v6
// Bloqueo por envío del jugador + fecha límite automática
// ══════════════════════════════════════════════════════════════════
//
// FECHAS LÍMITE (hora Argentina, UTC-3):
// Fecha 1 → 10 Jun 2026 23:59
// Fecha 2 → 14 Jun 2026 23:59
// Fecha 3 → 18 Jun 2026 23:59
// ══════════════════════════════════════════════════════════════════

// Fechas límite en UTC (Argentina = UTC-3, entonces 23:59 ARG = 02:59 UTC del día siguiente)
const FECHAS_LIMITE = {
  1: new Date("2026-06-11T02:59:00Z"), // 10 Jun 23:59 ARG
  2: new Date("2026-06-15T02:59:00Z"), // 14 Jun 23:59 ARG
  3: new Date("2026-06-19T02:59:00Z"), // 18 Jun 23:59 ARG
};

function estaBloquada(fecha, envios, jugador) {
  // Bloqueo por fecha límite
  const ahora = new Date();
  if (ahora >= FECHAS_LIMITE[fecha]) return true;
  // Bloqueo por envío del jugador
  const key = jugador + ":f" + fecha;
  return envios[key] === true;
}

function getOrCreateSheet(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function getSpreadsheet() {
  const files = DriveApp.getFilesByName("Machirulos_Prode2026");
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  const ss = SpreadsheetApp.create("Machirulos_Prode2026");
  ["jugadores","resultados","pronosticos","envios","config"].forEach(n => getOrCreateSheet(ss, n));
  return ss;
}

function jsonResp(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── ROUTER ───────────────────────────────────────────────────────

function doGet(e) {
  try {
    const ss = getSpreadsheet();
    if (e.parameter.action === "getAll") {
      return jsonResp({
        ok: true,
        jugadores:   getJugadores(ss),
        resultados:  getResultados(ss),
        pronosticos: getPronosticos(ss),
        envios:      getEnvios(ss),
        ahora:       new Date().toISOString(),
        limites: {
          1: FECHAS_LIMITE[1].toISOString(),
          2: FECHAS_LIMITE[2].toISOString(),
          3: FECHAS_LIMITE[3].toISOString(),
        }
      });
    }
    return jsonResp({ ok: false, error: "Acción desconocida" });
  } catch(err) {
    return jsonResp({ ok: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const ss   = getSpreadsheet();
    const envios = getEnvios(ss);

    switch(body.action) {

      case "setJugadores":
        setJugadores(ss, body.jugadores);
        return jsonResp({ ok: true });

      case "setResultado":
        setResultado(ss, body.partidoId, body.l, body.v);
        return jsonResp({ ok: true });

      case "setPronostico":
        // Verificar bloqueo
        if (estaBloquada(body.fecha, envios, body.jugador)) {
          return jsonResp({ ok: false, error: "Fecha bloqueada" });
        }
        setPronostico(ss, body.jugador, body.partidoId, body.l, body.v);
        return jsonResp({ ok: true });

      case "enviarFecha":
        // El jugador confirma y bloquea su fecha
        if (estaBloquada(body.fecha, envios, body.jugador)) {
          return jsonResp({ ok: false, error: "Ya enviada" });
        }
        setEnvio(ss, body.jugador, body.fecha);
        return jsonResp({ ok: true });

      case "setAdminPass":
        setConfig(ss, "adminPass", body.pass);
        return jsonResp({ ok: true });

      case "checkPass":
        const stored = getConfig(ss, "adminPass") || "machirulos2026";
        return jsonResp({ ok: true, valid: body.pass === stored });

      case "checkDni":
        return jsonResp({ ok: true, valid: checkDni(ss, body.jugador, body.dni) });

      default:
        return jsonResp({ ok: false, error: "Acción desconocida" });
    }
  } catch(err) {
    return jsonResp({ ok: false, error: err.toString() });
  }
}

// ── JUGADORES ────────────────────────────────────────────────────

function getJugadores(ss) {
  const sh   = getOrCreateSheet(ss, "jugadores");
  const data = sh.getDataRange().getValues();
  const res  = [];
  for (let i = 1; i < data.length; i++) {
    const [nombre, dni, fotoUrl] = data[i];
    if (nombre) res.push({ nombre:String(nombre), dni:String(dni||""), fotoUrl:String(fotoUrl||"") });
  }
  return res;
}

function setJugadores(ss, lista) {
  const sh = getOrCreateSheet(ss, "jugadores");
  sh.clearContents();
  sh.getRange(1,1,1,3).setValues([["nombre","dni","fotoUrl"]]);
  lista.forEach((j,i) => sh.getRange(i+2,1,1,3).setValues([[j.nombre,j.dni||"",j.fotoUrl||""]]));
}

function checkDni(ss, jugador, dni) {
  const j = getJugadores(ss).find(x => x.nombre === jugador);
  if (!j) return false;
  return String(j.dni).trim() === String(dni).trim();
}

// ── RESULTADOS ───────────────────────────────────────────────────

function getResultados(ss) {
  const sh   = getOrCreateSheet(ss, "resultados");
  const data = sh.getDataRange().getValues();
  const res  = {};
  for (let i = 1; i < data.length; i++) {
    const [id,l,v] = data[i];
    if (id) res[id] = { l:String(l), v:String(v) };
  }
  return res;
}

function setResultado(ss, partidoId, l, v) {
  const sh   = getOrCreateSheet(ss, "resultados");
  const data = sh.getDataRange().getValues();
  if (!data.length || data[0][0] !== "partidoId") {
    sh.getRange(1,1,1,3).setValues([["partidoId","l","v"]]);
  }
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === partidoId) { sh.getRange(i+1,2,1,2).setValues([[l,v]]); return; }
  }
  sh.appendRow([partidoId,l,v]);
}

// ── PRONÓSTICOS ──────────────────────────────────────────────────

function getPronosticos(ss) {
  const sh   = getOrCreateSheet(ss, "pronosticos");
  const data = sh.getDataRange().getValues();
  const res  = {};
  for (let i = 1; i < data.length; i++) {
    const [jugador,pid,l,v] = data[i];
    if (!jugador||!pid) continue;
    if (!res[jugador]) res[jugador] = {};
    res[jugador][pid] = { l:String(l), v:String(v) };
  }
  return res;
}

function setPronostico(ss, jugador, partidoId, l, v) {
  const sh      = getOrCreateSheet(ss, "pronosticos");
  const allData = sh.getDataRange().getValues();
  if (!allData.length || allData[0][0] !== "jugador") {
    sh.getRange(1,1,1,4).setValues([["jugador","partidoId","l","v"]]);
  }
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]===jugador && rows[i][1]===partidoId) {
      sh.getRange(i+1,3,1,2).setValues([[l,v]]); return;
    }
  }
  sh.appendRow([jugador,partidoId,l,v]);
}

// ── ENVÍOS (bloqueos voluntarios) ────────────────────────────────
// Estructura: jugador | fecha
function getEnvios(ss) {
  const sh   = getOrCreateSheet(ss, "envios");
  const data = sh.getDataRange().getValues();
  const res  = {};
  for (let i = 1; i < data.length; i++) {
    const [jugador, fecha] = data[i];
    if (jugador && fecha) res[jugador + ":f" + fecha] = true;
  }
  return res;
}

function setEnvio(ss, jugador, fecha) {
  const sh  = getOrCreateSheet(ss, "envios");
  const key = jugador + ":f" + fecha;
  // Evitar duplicados
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]===jugador && String(data[i][1])===String(fecha)) return;
  }
  if (!data.length || data[0][0] !== "jugador") {
    sh.getRange(1,1,1,2).setValues([["jugador","fecha"]]);
  }
  sh.appendRow([jugador, fecha]);
}

// ── CONFIG ───────────────────────────────────────────────────────

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
    if (data[i][0] === key) { sh.getRange(i+1,2).setValue(value); return; }
  }
  sh.appendRow([key, value]);
}
