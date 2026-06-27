const API = process.env.REACT_APP_API_URL;
const IMGUR_CLIENT_ID = "546c25a59c58ad7";

async function post(body) {
  try {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch (e) {
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

export const setJugadores  = (jugadores)                => post({ action:"setJugadores", jugadores });
export const setResultado  = (partidoId, l, v)          => post({ action:"setResultado", partidoId, l, v });
export const setPronostico = (jugador, partidoId, fecha, l, v) => post({ action:"setPronostico", jugador, partidoId, fecha, l, v });
export const desbloquearJugador = (jugador, fecha) => post({ action:"desbloquearJugador", jugador, fecha });
export const bloquearJugador    = (jugador, fecha) => post({ action:"bloquearJugador",    jugador, fecha });
export const enviarFecha        = (jugador, fecha) => post({ action:"enviarFecha", jugador, fecha });
export const setAdminPass  = (pass)                     => post({ action:"setAdminPass", pass });
export const checkPass     = (pass)                     => post({ action:"checkPass", pass });
export const checkDni      = (jugador, dni)             => post({ action:"checkDni", jugador, dni });

export async function subirFotoImgur(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(",")[1];
      try {
        const r = await fetch("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64, type: "base64" }),
        });
        const d = await r.json();
        if (d.success) resolve({ ok: true, url: d.data.link });
        else resolve({ ok: false });
      } catch {
        resolve({ ok: false });
      }
    };
    reader.readAsDataURL(file);
  });
}
