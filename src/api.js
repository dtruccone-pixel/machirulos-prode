const API = process.env.REACT_APP_API_URL;

async function post(body) {
  try {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch (e) {
    console.error("POST error:", e);
    return { ok: false };
  }
}

export async function getAll() {
  try {
    const r = await fetch(`${API}?action=getAll`);
    return await r.json();
  } catch (e) {
    return null;
  }
}

export const setJugadores  = (jugadores)               => post({ action:"setJugadores", jugadores });
export const setResultado  = (partidoId, l, v)         => post({ action:"setResultado", partidoId, l, v });
export const setPronostico = (jugador, partidoId, l, v)=> post({ action:"setPronostico", jugador, partidoId, l, v });
export const setAdminPass  = (pass)                    => post({ action:"setAdminPass", pass });
export const checkPass     = (pass)                    => post({ action:"checkPass", pass });
export const checkDni      = (jugador, dni)            => post({ action:"checkDni", jugador, dni });

export async function subirFoto(jugador, file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(",")[1];
      const mime   = file.type;
      const r = await post({ action:"subirFoto", jugador, base64, mime });
      resolve(r);
    };
    reader.readAsDataURL(file);
  });
}
