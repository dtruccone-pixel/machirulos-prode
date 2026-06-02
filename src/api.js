// ══════════════════════════════════════════════════════════════════
// API — comunicación con Google Apps Script
// ══════════════════════════════════════════════════════════════════

const API = process.env.REACT_APP_API_URL;

// GET: trae todos los datos de una vez
export async function getAll() {
  try {
    const r = await fetch(`${API}?action=getAll`);
    const d = await r.json();
    if (!d.ok) throw new Error(d.error);
    return d;
  } catch (e) {
    console.error("getAll error:", e);
    return null;
  }
}

// POST helper (Apps Script solo acepta no-cors con redirect follow)
async function post(body) {
  try {
    const r = await fetch(API, {
      method: "POST",
      // Apps Script con "cualquier persona" acepta esto sin preflight
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    return d;
  } catch (e) {
    console.error("POST error:", e);
    return { ok: false };
  }
}

export const setJugadores   = (jugadores)              => post({ action:"setJugadores",   jugadores });
export const setResultado   = (partidoId, l, v)        => post({ action:"setResultado",   partidoId, l, v });
export const setPronostico  = (jugador, partidoId, l, v) => post({ action:"setPronostico", jugador, partidoId, l, v });
export const setAdminPass   = (pass)                   => post({ action:"setAdminPass",   pass });
export const checkPass      = (pass)                   => post({ action:"checkPass",      pass });
