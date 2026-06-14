import { useState, useEffect, useCallback, useRef } from "react";
import { PARTIDOS, GRUPOS_KEYS, FLAG, calcPts } from "./datos";
import * as API from "./api";

// ── PANTALLA DE INTRO ─────────────────────────────────────────────
const CSS_ANIM = `
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes fadeOut { from{opacity:1} to{opacity:0} }
  @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes zoomIn  { from{opacity:0;transform:scale(.6)} to{opacity:1;transform:scale(1)} }
  @keyframes floatIn { from{opacity:0;transform:translateY(60px) scale(.8)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes floatOut{ from{opacity:1;transform:scale(1)} to{opacity:0;transform:translateY(-40px) scale(.9)} }
  @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes pulseGold { 0%,100%{box-shadow:0 0 30px #f0c04055} 50%{box-shadow:0 0 80px #f0c040bb,0 0 140px #f0c04033} }
  @keyframes discoBall { 0%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} 100%{transform:rotate(-8deg)} }
  @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes titleGlow { 0%,100%{text-shadow:0 0 20px #f0c04044} 50%{text-shadow:0 0 60px #f0c040cc,0 0 100px #f0c04055} }
`;

function IntroScreen({ jugadores, onDone }) {
  const [fase, setFase]     = useState("gif");   // gif | desfile | final
  const [actual, setActual] = useState(0);
  const [visible, setVisible]= useState(false);
  const [fade, setFade]     = useState(false);   // fade out de la pantalla gif
  const audioRef            = useRef(null);
  const timerRef            = useRef(null);

  const GOLD = "#f0c040";

  // ── Música: Web Audio API genera un ritmo mundialista sintético ──
  useEffect(() => {
    let ctx, stopped = false;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Melodía tipo fanfarria mundialista
      const notas = [
        // freq, inicio, duracion, gain
        [523,0,.18,.4],[659,.2,.18,.4],[784,.4,.18,.4],[1047,.6,.35,.5],
        [784,.95,.18,.35],[880,1.15,.18,.35],[1047,1.35,.45,.5],
        [523,1.8,.15,.3],[659,1.95,.15,.3],[784,2.1,.15,.3],[1047,2.25,.15,.4],
        [880,2.4,.15,.3],[784,2.55,.15,.3],[659,2.7,.3,.35],
        [523,3.0,.18,.3],[659,3.18,.18,.3],[784,3.36,.18,.3],[1047,3.54,.5,.5],
        [523,4.0,.15,.25],[784,4.15,.15,.25],[1047,4.3,.6,.5],
      ];
      notas.forEach(([freq,start,dur,gain])=>{
        if(stopped)return;
        const o=ctx.createOscillator();
        const g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value=freq;
        o.type="square";
        g.gain.setValueAtTime(0,ctx.currentTime+start);
        g.gain.linearRampToValueAtTime(gain*.3,ctx.currentTime+start+.02);
        g.gain.linearRampToValueAtTime(0,ctx.currentTime+start+dur);
        o.start(ctx.currentTime+start);
        o.stop(ctx.currentTime+start+dur+.05);
        // Armónico
        const o2=ctx.createOscillator();
        const g2=ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value=freq*2;
        o2.type="sine";
        g2.gain.setValueAtTime(0,ctx.currentTime+start);
        g2.gain.linearRampToValueAtTime(gain*.08,ctx.currentTime+start+.02);
        g2.gain.linearRampToValueAtTime(0,ctx.currentTime+start+dur);
        o2.start(ctx.currentTime+start);
        o2.stop(ctx.currentTime+start+dur+.05);
      });
      // Bombo cada beat
      for(let i=0;i<12;i++){
        const b=ctx.createOscillator();
        const bg=ctx.createGain();
        b.connect(bg);bg.connect(ctx.destination);
        b.frequency.setValueAtTime(120,ctx.currentTime+i*.5);
        b.frequency.exponentialRampToValueAtTime(40,ctx.currentTime+i*.5+.15);
        bg.gain.setValueAtTime(.25,ctx.currentTime+i*.5);
        bg.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.5+.2);
        b.start(ctx.currentTime+i*.5);
        b.stop(ctx.currentTime+i*.5+.25);
      }
    } catch(e) { /* sin audio si el browser lo bloquea */ }
    return ()=>{ stopped=true; try{ctx?.close();}catch{} };
  }, []);

  // ── Fase GIF: 4 segundos → fade out → desfile ──
  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 3800);
    const t2 = setTimeout(() => {
      if (jugadores.length === 0) { onDone(); return; }
      setFase("desfile"); setActual(0); setVisible(true);
    }, 4400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [jugadores, onDone]);

  // ── Fase desfile ──
  useEffect(() => {
    if (fase !== "desfile") return;
    if (actual >= jugadores.length) {
      timerRef.current = setTimeout(() => setFase("final"), 300);
      return;
    }
    setVisible(true);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setActual(a => a + 1), 320);
    }, 1300);
    return () => clearTimeout(timerRef.current);
  }, [fase, actual, jugadores.length]);

  // ── Fase final ──
  useEffect(() => {
    if (fase !== "final") return;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [fase, onDone]);

  const base = {
    position: "fixed", top:0, left:0, right:0, bottom:0,
    display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center",
    fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",
    overflow:"hidden",
  };

  // ═══════════════════════════════════════════════════
  // FASE 1: GIF BAILANDO
  // ═══════════════════════════════════════════════════
  if (fase === "gif") return (
    <div style={{
      ...base,
      background: "#000",
      animation: fade ? "fadeOut .6s ease forwards" : "fadeIn .4s ease",
    }}>
      <style>{CSS_ANIM}</style>

      {/* GIF a pantalla completa */}
      <img
        src="/lambada.gif"
        alt="Los Machirulos"
        style={{
          position:"absolute", top:0, left:0, width:"100%", height:"100%",
          objectFit:"cover", objectPosition:"center top",
        }}
      />

      {/* Overlay gradiente inferior para el texto */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:"45%",
        background:"linear-gradient(transparent, rgba(0,0,0,.92))",
      }}/>

      {/* Bola de discoteca decorativa */}
      <div style={{
        position:"absolute", top:16, right:20, fontSize:32,
        animation:"discoBall 1.5s ease-in-out infinite",
      }}>🪩</div>

      {/* Texto sobre el GIF */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        textAlign:"center", padding:"0 16px 32px",
      }}>
        <div style={{
          fontSize:"clamp(36px,10vw,72px)", fontWeight:900,
          textTransform:"uppercase", letterSpacing:5, lineHeight:1,
          background:`linear-gradient(90deg,${GOLD} 0%,#fff 50%,${GOLD} 100%)`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          animation:"titleGlow 1.5s infinite",
        }}>Los Machirulos</div>
        <div style={{
          fontSize:"clamp(13px,3vw,18px)", color:"#aaa",
          letterSpacing:4, textTransform:"uppercase", marginTop:6,
          animation:"shimmer 2s infinite",
        }}>⚽ Mundial 2026 · Prode Oficial ⚽</div>
      </div>

      {/* Toque para saltar */}
      <div style={{
        position:"absolute", top:16, left:0, right:0, textAlign:"center",
        color:"rgba(255,255,255,.3)", fontSize:11, letterSpacing:2,
        textTransform:"uppercase", cursor:"pointer",
      }} onClick={()=>{setFade(true);setTimeout(()=>{
        if(jugadores.length===0){onDone();return;}
        setFase("desfile");setActual(0);setVisible(true);
      },400)}}>
        Tocar para saltar
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // FASE 2: DESFILE DE JUGADORES
  // ═══════════════════════════════════════════════════
  if (fase === "desfile") {
    const j = jugadores[actual];
    if (!j) return null;
    return (
      <div style={{
        ...base,
        background:"radial-gradient(ellipse at center, #1a1000 0%, #07070d 70%)",
      }}>
        <style>{CSS_ANIM}</style>

        {/* Barras doradas */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,
          background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,opacity:.7}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,
          background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,opacity:.7}}/>

        {/* Contador */}
        <div style={{position:"absolute",top:20,left:0,right:0,textAlign:"center",
          color:"#333",fontSize:11,letterSpacing:3,textTransform:"uppercase"}}>
          {actual+1} / {jugadores.length}
        </div>

        <div style={{
          display:"flex",flexDirection:"column",alignItems:"center",gap:22,
          animation: visible ? "floatIn .33s ease both" : "floatOut .33s ease both",
        }}>
          {j.fotoUrl
            ?<img src={j.fotoUrl} alt={j.nombre} style={{
                width:170,height:170,borderRadius:"50%",objectFit:"cover",
                border:`5px solid ${GOLD}`,animation:"pulseGold 1.5s infinite",
              }}/>
            :<div style={{
                width:170,height:170,borderRadius:"50%",background:"#111",
                border:`5px solid ${GOLD}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:76,animation:"pulseGold 1.5s infinite",
              }}>👤</div>
          }
          <div style={{
            fontSize:"clamp(30px,8vw,62px)",fontWeight:900,
            textTransform:"uppercase",letterSpacing:4,textAlign:"center",
            background:`linear-gradient(90deg,${GOLD},#fff,${GOLD})`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          }}>{j.nombre}</div>
          <div style={{fontSize:22,letterSpacing:10,opacity:.5}}>⭐⭐⭐</div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // FASE 3: TODOS JUNTOS
  // ═══════════════════════════════════════════════════
  if (fase === "final") {
    const cols = jugadores.length<=4?2:jugadores.length<=9?3:4;
    return (
      <div style={{
        ...base,
        background:"radial-gradient(ellipse at center,#1a0f00 0%,#07070d 70%)",
        padding:"20px 10px",gap:16,
      }}>
        <style>{CSS_ANIM}</style>
        <div style={{fontSize:48,animation:"discoBall 1.5s ease-in-out infinite"}}>🏆</div>
        <div style={{
          fontSize:"clamp(22px,6vw,40px)",fontWeight:900,
          textTransform:"uppercase",letterSpacing:4,textAlign:"center",
          background:`linear-gradient(90deg,${GOLD},#fff,${GOLD})`,
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          animation:"slideDown .5s ease",
        }}>¡Que empiece el prode!</div>

        <div style={{
          display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,
          gap:14,width:"100%",maxWidth:520,
          animation:"zoomIn .5s ease .1s both",
        }}>
          {jugadores.map((j,i)=>(
            <div key={j.nombre} style={{
              display:"flex",flexDirection:"column",alignItems:"center",gap:5,
              animation:`floatIn .4s ease ${i*.07}s both`,
            }}>
              {j.fotoUrl
                ?<img src={j.fotoUrl} alt={j.nombre} style={{
                    width:58,height:58,borderRadius:"50%",objectFit:"cover",
                    border:`2px solid ${GOLD}`,boxShadow:`0 0 14px ${GOLD}44`,
                  }}/>
                :<div style={{
                    width:58,height:58,borderRadius:"50%",background:"#111",
                    border:`2px solid ${GOLD}`,display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:28,
                  }}>👤</div>
              }
              <span style={{
                fontSize:11,fontWeight:700,color:"#ccc",
                textTransform:"uppercase",letterSpacing:.5,
                textAlign:"center",lineHeight:1.2,
              }}>{j.nombre}</span>
            </div>
          ))}
        </div>
        <div style={{
          fontSize:11,color:"#333",letterSpacing:2,
          textTransform:"uppercase",animation:"shimmer 1.5s infinite",
        }}>Cargando…</div>
      </div>
    );
  }

  return null;
}

// ── PALETA ────────────────────────────────────────────────────────
const BG="#07070d",CARD="#0e0e1a",BDR="#1a1a2c";
const GOLD="#f0c040",GREEN="#27ae60",BLUE="#2980b9",RED="#c0392b",MUTED="#4a4a68",TEXT="#e8e8f2";
const FECHAS=[1,2,3];

// Fechas límite en UTC (10 Jun 23:59 ARG = 11 Jun 02:59 UTC)
const LIMITES_UTC = {
  1: new Date("2026-06-11T18:59:00Z"),
  2: new Date("2026-06-14T02:59:00Z"),
  3: new Date("2026-06-19T18:59:00Z"),
};

const LIMITE_LABELS = {
  1: "Cierre: 11 Jun 15:59",
  2: "Cierre: 13 Jun 22:59",
  3: "Cierre: 19 Jun 15:59",
};

// ── UTILS ─────────────────────────────────────────────────────────
function estaBloquada(fecha, envios, jugadorNombre, desbloqueos) {
  const key = jugadorNombre + ":f" + fecha;
  // Si el admin desbloqueó → no está bloqueado
  if (desbloqueos && desbloqueos[key] === true) return false;
  if (new Date() >= LIMITES_UTC[fecha]) return true;
  return envios[key] === true;
}

function tiempoRestante(fecha) {
  const diff = LIMITES_UTC[fecha] - new Date();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h/24)}d ${h%24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function fechaCompleta(ress, f) {
  const ps = PARTIDOS.filter(p => p.f === f);
  return ps.length > 0 && ps.every(p => { const r = ress[p.id]; return r && r.l !== "" && r.v !== ""; });
}

function calcTablaFecha(jds, prons, ress, f) {
  return jds.map(j => {
    let pts=0,ex=0,gn=0,fa=0;
    PARTIDOS.filter(p=>p.f===f).forEach(p=>{
      const res=ress[p.id],pr=prons[j.nombre]?.[p.id];
      if(!pr||pr.l===""||pr.v===""||!res||res.l===""||res.v==="")return;
      const n=calcPts(pr,res);if(n===null)return;
      pts+=n;if(n===3)ex++;else if(n===2)gn++;else fa++;
    });
    return{jugador:j,pts,ex,gn,fa};
  }).sort((a,b)=>b.pts-a.pts||b.ex-a.ex);
}

function calcTablaGeneral(jds, prons, ress) {
  return jds.map(j=>{
    let pts=0,ex=0,gn=0,fa=0,jugados=0;
    PARTIDOS.forEach(p=>{
      const res=ress[p.id],pr=prons[j.nombre]?.[p.id];
      if(!pr||pr.l===""||pr.v===""||!res||res.l===""||res.v==="")return;
      const n=calcPts(pr,res);if(n===null)return;
      pts+=n;jugados++;if(n===3)ex++;else if(n===2)gn++;else fa++;
    });
    return{jugador:j,pts,ex,gn,fa,jugados};
  }).sort((a,b)=>b.pts-a.pts||b.ex-a.ex);
}

function pronCompletosEnFecha(prons, jugadorNombre, f) {
  const ps = PARTIDOS.filter(p => p.f === f);
  const mp = prons[jugadorNombre] || {};
  return ps.filter(p => { const pr = mp[p.id]; return pr && pr.l !== "" && pr.v !== ""; }).length;
}

// ── COMPONENTES ───────────────────────────────────────────────────
function Avatar({j,size=40}){
  if(!j)return null;
  return j.fotoUrl
    ?<img src={j.fotoUrl} alt={j.nombre} style={{width:size,height:size,borderRadius:"50%",
        objectFit:"cover",border:`2px solid ${GOLD}`,flexShrink:0}}/>
    :<div style={{width:size,height:size,borderRadius:"50%",background:"#1a1a2c",
        border:`2px solid ${BDR}`,display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:size*0.42,flexShrink:0}}>👤</div>;
}

function Header({sub,sync}){
  return(
    <div style={{width:"100%",maxWidth:700,padding:"18px 0 8px",
      display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <span style={{fontSize:10,fontWeight:700,letterSpacing:3,color:GOLD,
        textTransform:"uppercase",opacity:.7}}>⚽ Mundial 2026 · Fase de Grupos</span>
      <h1 style={{fontSize:"clamp(34px,9vw,68px)",fontWeight:900,margin:0,
        textTransform:"uppercase",letterSpacing:5,lineHeight:1,
        background:`linear-gradient(90deg,${GOLD} 0%,#fff8e0 45%,${GOLD} 100%)`,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Los Machirulos</h1>
      {sub&&<p style={{color:MUTED,fontSize:12,margin:0,letterSpacing:2,textTransform:"uppercase"}}>{sub}</p>}
      {sync&&<p style={{color:"#252535",fontSize:10,margin:"2px 0 0"}}>🔄 {sync.toLocaleTimeString("es-AR")}</p>}
    </div>
  );
}

const S={
  root:{minHeight:"100vh",background:`linear-gradient(160deg,#120a00 0%,${BG} 40%,#000a12 100%)`,
    fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",color:TEXT,
    display:"flex",flexDirection:"column",alignItems:"center",padding:"0 10px 60px"},
  wrap:{width:"100%",maxWidth:700},
  card:{background:CARD,border:`1px solid ${BDR}`,borderRadius:13,padding:"16px 14px",marginBottom:10},
  sTitle:{margin:"0 0 12px",fontSize:11,fontWeight:700,color:GOLD,letterSpacing:3,textTransform:"uppercase"},
  inp:(ex={})=>({background:"#06060f",border:`1px solid ${BDR}`,borderRadius:7,color:TEXT,
    outline:"none",padding:"10px 13px",fontSize:15,fontFamily:"inherit",...ex}),
  inpGol:(dis)=>({width:46,padding:"8px 2px",textAlign:"center",outline:"none",
    background:dis?"#040408":"#06060f",border:`1px solid ${dis?"#111":BDR}`,
    borderRadius:6,color:dis?"#444":TEXT,fontSize:18,fontWeight:700,fontFamily:"inherit",
    cursor:dis?"not-allowed":"text"}),
  btn:(bg,col="#000",brd="none",ex={})=>({padding:"10px 18px",background:bg,border:brd,
    borderRadius:8,color:col,fontWeight:800,fontSize:13,letterSpacing:1,
    textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",...ex}),
  tab:(on)=>({padding:"5px 12px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:12,
    letterSpacing:1,fontFamily:"inherit",textTransform:"uppercase",
    background:on?GOLD:"#0b0b18",border:on?`1px solid ${GOLD}`:`1px solid ${BDR}`,
    color:on?"#000":MUTED}),
  ftab:(on,bloq)=>({flex:1,padding:"10px 6px",borderRadius:8,cursor:"pointer",fontWeight:800,
    fontSize:14,letterSpacing:1,fontFamily:"inherit",textTransform:"uppercase",textAlign:"center",
    background:on?`linear-gradient(135deg,${GOLD},#b88000)`:bloq?"#0f1a0f":"#0b0b18",
    border:on?`1px solid ${GOLD}`:bloq?`1px solid #2a4a2a`:`1px solid ${BDR}`,
    color:on?"#000":bloq?"#3aaa3a":MUTED}),
};

function GanadorOverlay({jugador,fecha,onClose}){
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:999,
      background:"rgba(0,0,0,0.96)",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:20,textAlign:"center"}}>
      <p style={{color:GOLD,fontSize:12,letterSpacing:4,textTransform:"uppercase",
        fontFamily:"'Barlow Condensed',sans-serif",margin:"0 0 20px",opacity:.8}}>
        ⚽ Fecha {fecha} · Completada
      </p>
      {jugador?.fotoUrl
        ?<img src={jugador.fotoUrl} alt={jugador.nombre}
            style={{width:200,height:200,borderRadius:"50%",objectFit:"cover",
              border:`6px solid ${GOLD}`,marginBottom:24,boxShadow:`0 0 80px ${GOLD}66`}}/>
        :<div style={{width:200,height:200,borderRadius:"50%",background:"#1a1a2c",
            border:`6px solid ${GOLD}`,marginBottom:24,display:"flex",
            alignItems:"center",justifyContent:"center",fontSize:90,
            boxShadow:`0 0 80px ${GOLD}66`}}>👤</div>
      }
      <h1 style={{fontSize:"clamp(36px,9vw,72px)",fontWeight:900,margin:"0 0 6px",
        textTransform:"uppercase",letterSpacing:4,
        background:`linear-gradient(90deg,${GOLD},#fff,${GOLD})`,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        fontFamily:"'Barlow Condensed',sans-serif"}}>{jugador?.nombre}</h1>
      <p style={{fontSize:"clamp(18px,4vw,28px)",color:GOLD,fontWeight:900,margin:"0 0 30px",
        fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,textTransform:"uppercase"}}>
        🏆 Ganador de la Fecha {fecha}
      </p>
      <button style={S.btn(`linear-gradient(90deg,${GOLD},#b88000)`,"#000","none",
        {fontSize:14,padding:"13px 32px"})} onClick={onClose}>Ver tabla</button>
    </div>
  );
}

function TablaFila({item,pos,maxPts}){
  const i=pos;
  const pct=maxPts>0?(item.pts/maxPts)*100:0;
  const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
  const bc=i===0?GOLD:i===1?"#aaa":i===2?"#cd7f32":"transparent";
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",
      borderRadius:10,marginBottom:6,position:"relative",overflow:"hidden",
      background:i===0?"#1a1200":i===1?"#0e0e18":i===2?"#110d00":"#0b0b14",
      borderLeft:`4px solid ${bc}`}}>
      <div style={{position:"absolute",top:0,left:0,height:"100%",
        width:`${pct}%`,opacity:.06,pointerEvents:"none",background:i===0?GOLD:BLUE}}/>
      <span style={{width:28,textAlign:"center",fontWeight:900,fontSize:18,flexShrink:0,
        color:i===0?GOLD:i===1?"#c0c0c0":i===2?"#cd7f32":MUTED}}>
        {medal??i+1}
      </span>
      <Avatar j={item.jugador} size={36}/>
      <div style={{flex:1}}>
        <div style={{fontWeight:800,fontSize:15}}>{item.jugador.nombre}</div>
        <div style={{fontSize:10,color:MUTED}}>🎯{item.ex} · ✅{item.gn} · ❌{item.fa}</div>
      </div>
      <div style={{fontWeight:900,fontSize:22,color:i===0?GOLD:"#fff",
        textShadow:i===0?`0 0 20px ${GOLD}44`:"none"}}>
        {item.pts}<span style={{fontSize:11,color:MUTED,marginLeft:2}}>pts</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════
export default function App(){
  const [intro,setIntro]     = useState(true);
  const [scr,setScr]         = useState("loading");
  const [jds,setJds]         = useState([]);
  const [ress,setRess]       = useState({});
  const [prons,setProns]     = useState({});
  const [envios,setEnvios]       = useState({});
  const [desbloqueos,setDesbloq] = useState({});
  const [jugador,setJugador] = useState(null);
  const [grupo,setGrupo]     = useState("A");
  const [fecha,setFecha]     = useState(1);
  const [sync,setSync]       = useState(null);
  const [ganador,setGanador] = useState(null);
  const [tabFecha,setTabFecha]=useState(1);
  const [verProns,setVerProns]=useState(false);
  const [enviando,setEnviando]=useState(false);
  const [confirmEnvio,setConfirmEnvio]=useState(null);

  // Minijuego piedrazo
  const [juegoActivo,setJuegoActivo]=useState(false);
  const [piedras,setPiedras]  = useState([]);
  const [golpes,setGolpes]    = useState(0);
  const [tambaleo,setTambaleo]= useState(false);
  const [derribado,setDerribado]=useState(false);

  // Admin
  const [nombreN,setNN]      = useState("");
  const [dniN,setDniN]       = useState("");
  const [passIn,setPI]       = useState("");
  const [passErr,setPE]      = useState(false);
  const [newPass,setNP]      = useState("");
  const [fotoSub,setFotoSub] = useState(null);
  const [fotoErr,setFotoErr] = useState(null);
  const [jLogin,setJLogin]   = useState(null);
  const [dniInput,setDniInput]=useState("");
  const [dniErr,setDniErr]   = useState(false);

  // Admin resultados local
  const [resLocal,setResLocal]   = useState({});
  const [guardando,setGuardando] = useState({});
  const [guardadoOk,setGuardadoOk]=useState({});

  // useEffect para sincronizar resLocal cuando cambia grupo/fecha en admin
  useEffect(()=>{
    if(scr!=="admin")return;
    const ps=PARTIDOS.filter(p=>p.g===grupo&&p.f===fecha);
    const init={};
    ps.forEach(p=>{
      // Toma el valor del servidor como base
      init[p.id]={l:ress[p.id]?.l||"", v:ress[p.id]?.v||""};
    });
    setResLocal(init);
    setGuardadoOk({});
    setGuardando({});
  },[scr,grupo,fecha]); // NO incluir ress para no sobreescribir mientras editás

  const cargarTodo=useCallback(async()=>{
    const d=await API.getAll();
    if(!d)return;
    setJds(d.jugadores||[]);
    const nuevoR=d.resultados||{};
    setRess(prev=>{
      FECHAS.forEach(f=>{
        if(!fechaCompleta(prev,f)&&fechaCompleta(nuevoR,f)){
          setTimeout(()=>setGanador({fecha:f,jugador:null}),300);
        }
      });
      return nuevoR;
    });
    setProns(d.pronosticos||{});
    setEnvios(d.envios||{});
    setDesbloq(d.desbloqueos||{});
    setSync(new Date());
    // Actualizar resLocal con datos frescos del servidor (solo si el admin está activo)
    setResLocal(prev=>{
      const next={...prev};
      Object.entries(d.resultados||{}).forEach(([pid,val])=>{
        // Solo actualiza si el valor local está vacío (no sobreescribe ediciones en curso)
        if(!next[pid]||next[pid].l===""||next[pid].v===""){
          next[pid]={l:val.l||"",v:val.v||""};
        }
      });
      return next;
    });
  },[]);

  useEffect(()=>{
    (async()=>{await cargarTodo();setScr("inicio");})();
  },[cargarTodo]);

  useEffect(()=>{
    if(scr==="loading")return;
    const t=setInterval(cargarTodo,25000);
    return()=>clearInterval(t);
  },[scr,cargarTodo]);

  // Resolver ganador
  useEffect(()=>{
    if(!ganador||ganador.jugador||jds.length===0)return;
    const tabla=calcTablaFecha(jds,prons,ress,ganador.fecha);
    if(tabla.length>0)setGanador(g=>({...g,jugador:tabla[0].jugador}));
  },[ganador,jds,prons,ress]);

  // ── INTRO ──
  if(intro) return(
    <IntroScreen jugadores={jds} onDone={()=>setIntro(false)}/>
  );

  // ── LOADING ──
  if(scr==="loading")return(
    <div style={{...S.root,justifyContent:"center",alignItems:"center"}}>
      <div style={{fontSize:64}}>⚽</div>
      <p style={{color:GOLD,letterSpacing:3,fontSize:13,textTransform:"uppercase",marginTop:16}}>Conectando…</p>
    </div>
  );

  if(ganador?.jugador)return(
    <GanadorOverlay jugador={ganador.jugador} fecha={ganador.fecha}
      onClose={()=>{setGanador(null);setScr("tabla");}}/>
  );

  // ── INICIO ──
  if(scr==="inicio")return(
    <div style={S.root}>
      <Header sub="12 grupos · 72 partidos · 3 fechas" sync={sync}/>
      <div style={{...S.wrap,display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
        <div style={{...S.card,padding:0,overflow:"hidden",display:"flex"}}>
          {[{i:"🎯",p:"3 PTS",t:"Resultado exacto",bg:"#09180e",bc:GREEN},
            {i:"✅",p:"2 PTS",t:"Acierta ganador",bg:"#091220",bc:BLUE},
            {i:"❌",p:"0 PTS",t:"Error",bg:"#180909",bc:RED}].map(r=>(
            <div key={r.p} style={{flex:1,padding:"14px 6px",background:r.bg,
              textAlign:"center",borderTop:`3px solid ${r.bc}`}}>
              <div style={{fontSize:22}}>{r.i}</div>
              <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>{r.p}</div>
              <div style={{fontSize:10,color:MUTED,textTransform:"uppercase"}}>{r.t}</div>
            </div>
          ))}
        </div>

        {/* Fechas límite */}
        <div style={{...S.card,padding:"12px 14px"}}>
          <p style={{...S.sTitle,marginBottom:8}}>⏰ Fechas límite de envío</p>
          {FECHAS.map(f=>{
            const resto=tiempoRestante(f);
            const cerrada=!resto;
            return(
              <div key={f} style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",padding:"6px 0",
                borderBottom:f<3?`1px solid ${BDR}`:"none"}}>
                <span style={{fontSize:14,fontWeight:700}}>Fecha {f}</span>
                <span style={{fontSize:12,color:MUTED}}>{LIMITE_LABELS[f]}</span>
                <span style={{fontSize:12,fontWeight:700,
                  color:cerrada?RED:resto&&resto.includes("min")?RED:GREEN}}>
                  {cerrada?"🔒 Cerrada":`⏱ ${resto}`}
                </span>
              </div>
            );
          })}
        </div>

        <button style={S.btn(`linear-gradient(90deg,${GOLD},#b88000)`)}
          onClick={()=>setScr("elegir")}>⚽ Ingresar mis pronósticos</button>
        <button style={S.btn("transparent",GOLD,`2px solid ${GOLD}`)}
          onClick={()=>setScr("tabla")}>🏅 Tabla de posiciones</button>
        <button style={S.btn("#0d0d18","#666","1px solid #222")}
          onClick={()=>setScr("passAdmin")}>🔐 Panel de administración</button>
      </div>
    </div>
  );

  // ── ELEGIR JUGADOR ──
  if(scr==="elegir")return(
    <div style={S.root}>
      <Header sub="¿Quién sos?" sync={sync}/>
      <div style={S.wrap}>
        <div style={S.card}>
          {jds.length===0
            ?<p style={{color:MUTED,textAlign:"center",padding:"20px 0"}}>
                El admin tiene que agregar los jugadores primero.
              </p>
            :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                {jds.map(j=>{
                  const pts=PARTIDOS.reduce((a,p)=>{
                    const res=ress[p.id],pr=prons[j.nombre]?.[p.id];
                    if(!pr||!res||res.l===""||res.v==="")return a;
                    return a+(calcPts(pr,res)??0);
                  },0);
                  const enviadas=FECHAS.filter(f=>estaBloquada(f,envios,j.nombre,desbloqueos)).length;
                  return(
                    <button key={j.nombre} style={{...S.btn("#0d0d18","#fff","1px solid "+BDR),
                      textAlign:"left",padding:"12px 16px",
                      display:"flex",alignItems:"center",gap:12}}
                      onClick={()=>{setJLogin(j);setDniInput("");setDniErr(false);setScr("login");}}>
                      <Avatar j={j} size={44}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:17,fontWeight:700}}>{j.nombre}</div>
                        <div style={{fontSize:11,color:MUTED}}>
                          {enviadas}/3 fechas enviadas
                        </div>
                      </div>
                      <span style={{fontSize:13,color:GOLD,fontWeight:700}}>{pts} pts</span>
                    </button>
                  );
                })}
              </div>
          }
          <button style={{...S.btn("transparent",MUTED,"1px solid #222"),marginTop:14}}
            onClick={()=>setScr("inicio")}>← Volver</button>
        </div>
      </div>
    </div>
  );

  // ── LOGIN DNI ──
  if(scr==="login")return(
    <div style={S.root}>
      <Header sync={sync}/>
      <div style={S.wrap}>
        <div style={S.card}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <Avatar j={jLogin} size={60}/>
            <div>
              <p style={{...S.sTitle,margin:0}}>Verificación</p>
              <p style={{fontSize:22,fontWeight:800,margin:"4px 0 0"}}>{jLogin?.nombre}</p>
            </div>
          </div>
          <p style={{color:MUTED,fontSize:13,margin:"0 0 12px"}}>Ingresá tu número de DNI</p>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <input style={{...S.inp(),flex:1}} type="number" placeholder="Número de DNI"
              value={dniInput} onChange={e=>{setDniInput(e.target.value);setDniErr(false);}}
              onKeyDown={async e=>{
                if(e.key!=="Enter")return;
                const r=await API.checkDni(jLogin.nombre,dniInput);
                if(r?.valid){setJugador(jLogin);setGrupo("A");setFecha(1);setVerProns(false);setScr("jugador");}
                else setDniErr(true);
              }}/>
            <button style={S.btn(GOLD)} onClick={async()=>{
              const r=await API.checkDni(jLogin.nombre,dniInput);
              if(r?.valid){setJugador(jLogin);setGrupo("A");setFecha(1);setVerProns(false);setScr("jugador");}
              else setDniErr(true);
            }}>Entrar</button>
          </div>
          {dniErr&&<p style={{color:RED,fontSize:12,margin:"4px 0"}}>DNI incorrecto</p>}
          <button style={{...S.btn("transparent",MUTED,"1px solid #222"),marginTop:8}}
            onClick={()=>setScr("elegir")}>← Volver</button>
        </div>
      </div>
    </div>
  );

  // ── JUGADOR ──
  if(scr==="jugador"){
    const mp=prons[jugador.nombre]||{};
    const totalPts=PARTIDOS.reduce((a,p)=>{
      const res=ress[p.id],pr=mp[p.id];
      if(!pr||!res||res.l===""||res.v==="")return a;
      return a+(calcPts(pr,res)??0);
    },0);

    const partidos=PARTIDOS.filter(p=>p.g===grupo&&p.f===fecha);
    const bloqueada=estaBloquada(fecha,envios,jugador.nombre,desbloqueos);
    const resto=tiempoRestante(fecha);
    const compEnFecha=pronCompletosEnFecha(prons,jugador.nombre,fecha);
    const totalEnFecha=PARTIDOS.filter(p=>p.f===fecha).length;

    // Modal confirmación envío
    if(confirmEnvio!==null){
      const f=confirmEnvio;
      const comp=pronCompletosEnFecha(prons,jugador.nombre,f);
      const total=PARTIDOS.filter(p=>p.f===f).length;
      return(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:500,
          background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",
          justifyContent:"center",padding:20}}>
          <div style={{...S.card,maxWidth:400,width:"100%",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>📤</div>
            <h2 style={{margin:"0 0 8px",fontSize:22,color:GOLD}}>¿Enviar Fecha {f}?</h2>
            <p style={{color:TEXT,fontSize:15,margin:"0 0 6px"}}>
              Tenés <strong>{comp}/{total}</strong> partidos cargados.
            </p>
            <p style={{color:RED,fontSize:13,margin:"0 0 20px"}}>
              ⚠️ Una vez enviado no podés modificar tus pronósticos de esta fecha.
            </p>
            {comp<total&&(
              <p style={{color:GOLD,fontSize:12,margin:"0 0 16px",
                padding:"8px",background:"#1a1200",borderRadius:8,border:`1px solid ${GOLD}`}}>
                Los partidos sin cargar quedarán en blanco (0 puntos).
              </p>
            )}
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button style={S.btn(RED,"#fff","none",{padding:"12px 24px"})}
                disabled={enviando}
                onClick={async()=>{
                  setEnviando(true);
                  const r=await API.enviarFecha(jugador.nombre,f);
                  if(r?.ok){
                    setEnvios(prev=>({...prev,[jugador.nombre+":f"+f]:true}));
                  }
                  setEnviando(false);
                  setConfirmEnvio(null);
                }}>
                {enviando?"Enviando…":"Sí, enviar"}
              </button>
              <button style={S.btn("#1a1a2a","#ccc","1px solid #333",{padding:"12px 24px"})}
                onClick={()=>setConfirmEnvio(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      );
    }

    async function setPron(pid,campo,val){
      if(bloqueada)return;
      const nuevo={...prons,[jugador.nombre]:{
        ...(prons[jugador.nombre]||{}),
        [pid]:{...(prons[jugador.nombre]?.[pid]||{l:"",v:""}), [campo]:val},
      }};
      setProns(nuevo);
      const pr=nuevo[jugador.nombre][pid];
      await API.setPronostico(jugador.nombre,pid,fecha,pr.l||"",pr.v||"");
    }

    const otrosJugadores=jds.filter(j=>j.nombre!==jugador.nombre);

    return(
      <div style={S.root}>
        <Header sync={sync}/>
        <div style={S.wrap}>
          {/* topbar */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar j={jugador} size={46}/>
              <div>
                <div style={{fontSize:19,fontWeight:900}}>{jugador.nombre}</div>
                <div style={{fontSize:12,color:MUTED}}>
                  <span style={{color:GOLD,fontWeight:700}}>{totalPts} pts</span>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button style={{...S.btn(verProns?"transparent":"#1a1a2c",
                verProns?GOLD:TEXT,verProns?`1px solid ${GOLD}`:`1px solid ${BDR}`)}}
                onClick={()=>setVerProns(v=>!v)}>
                {verProns?"📋 Mis pronós.":"👥 Ver todos"}
              </button>
              <button style={S.btn("transparent",GOLD,"1px solid "+GOLD)}
                onClick={()=>setScr("tabla")}>🏅 Tabla</button>
              <button style={S.btn("transparent",MUTED,"1px solid #222")}
                onClick={()=>setScr("inicio")}>← Salir</button>
            </div>
          </div>

          {/* tabs grupo */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {GRUPOS_KEYS.map(g=>(
              <button key={g} style={S.tab(grupo===g)} onClick={()=>setGrupo(g)}>{g}</button>
            ))}
          </div>

          {/* tabs fecha con estado */}
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {FECHAS.map(f=>{
              const bloq=estaBloquada(f,envios,jugador.nombre,desbloqueos);
              const ps=PARTIDOS.filter(p=>p.g===grupo&&p.f===f);
              return(
                <button key={f} style={S.ftab(fecha===f,bloq)} onClick={()=>setFecha(f)}>
                  <div>FECHA {f} {bloq?"🔒":""}</div>
                  <div style={{fontSize:10,fontWeight:400,opacity:.7,marginTop:2}}>
                    {ps[0]?.fecha||""}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Banner estado de la fecha */}
          <div style={{
            padding:"10px 14px",borderRadius:10,marginBottom:12,
            background:bloqueada?"#0f1a0f":"#120a00",
            border:`1px solid ${bloqueada?GREEN:GOLD}`,
            display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,
          }}>
            <div>
              {bloqueada
                ?<span style={{color:GREEN,fontWeight:700,fontSize:14}}>
                    🔒 Fecha {fecha} enviada · No se puede modificar
                  </span>
                :<span style={{color:GOLD,fontWeight:700,fontSize:14}}>
                    ⏰ {LIMITE_LABELS[fecha]}
                    {resto&&<span style={{color:texto=>resto.includes("min")?RED:GREEN,marginLeft:8}}>
                      · {resto} restantes
                    </span>}
                  </span>
              }
              {!bloqueada&&<div style={{fontSize:11,color:MUTED,marginTop:3}}>
                {compEnFecha}/{totalEnFecha} partidos cargados en esta fecha
              </div>}
            </div>
            {!bloqueada&&(
              <button style={S.btn(`linear-gradient(90deg,${GREEN},#1a6a30)`,"#fff","none",
                {fontSize:13,padding:"9px 18px"})}
                onClick={()=>setConfirmEnvio(fecha)}>
                📤 Enviar Fecha {fecha}
              </button>
            )}
          </div>

          {/* PARTIDOS */}
          {verProns ? (
            // Mostrar TODOS los partidos de la fecha seleccionada (todos los grupos)
            PARTIDOS.filter(p=>p.f===fecha).map(p=>{
              const res=ress[p.id];
              const hRes=res&&res.l!==""&&res.v!=="";
              return(
                <div key={p.id} style={{...S.card,marginBottom:10}}>
                  <div style={{fontSize:10,color:MUTED,marginBottom:8,letterSpacing:1}}>
                    📅 {p.fecha} {p.hora} · Grupo {p.g} · {FLAG[p.local]||"🏳️"} {p.local} vs {p.vis} {FLAG[p.vis]||"🏳️"}
                    {hRes&&<span style={{marginLeft:8,color:GREEN}}> · Real: {res.l}–{res.v}</span>}
                  </div>
                  {[jugador,...otrosJugadores].map(j=>{
                    const pr=prons[j.nombre]?.[p.id];
                    const tienePron=pr&&pr.l!==""&&pr.v!=="";
                    const pts=hRes&&tienePron?calcPts(pr,res):null;
                    const ptC=pts===3?GREEN:pts===2?BLUE:pts===0?RED:MUTED;
                    return(
                      <div key={j.nombre} style={{display:"flex",alignItems:"center",gap:10,
                        padding:"8px 10px",borderRadius:8,marginBottom:5,
                        background:j.nombre===jugador.nombre?"#0d0d1a":"#090910",
                        border:`1px solid ${j.nombre===jugador.nombre?BDR:"#111"}`}}>
                        <Avatar j={j} size={28}/>
                        <span style={{flex:1,fontSize:13,
                          fontWeight:j.nombre===jugador.nombre?700:400}}>
                          {j.nombre}{j.nombre===jugador.nombre?" (vos)":""}
                        </span>
                        <span style={{fontSize:15,fontWeight:700,
                          color:tienePron?TEXT:MUTED}}>
                          {tienePron?`${pr.l} – ${pr.v}`:"sin cargar"}
                        </span>
                        {pts!==null&&(
                          <span style={{fontSize:14,fontWeight:900,color:ptC}}>
                            {pts===3?"🎯":pts===2?"✅":"❌"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          ) : (
            partidos.map(p=>{
              const pron=mp[p.id]||{l:"",v:""};
              const res=ress[p.id];
              const hRes=res&&res.l!==""&&res.v!=="";
              const pts=hRes?calcPts(pron,res):null;
              const ptC=pts===3?GREEN:pts===2?BLUE:pts===0?RED:MUTED;
              const bg=pts===3?"#091a0c":pts===2?"#091220":pts===0?"#180909":CARD;
              const bc=pts===3?GREEN:pts===2?BLUE:pts===0?"#601010":bloqueada?"#1a2a1a":BDR;
              return(
                <div key={p.id} style={{background:bg,borderRadius:12,marginBottom:10,
                  padding:14,border:`2px solid ${bc}`}}>
                  <div style={{fontSize:10,color:MUTED,marginBottom:10,letterSpacing:1}}>
                    📅 {p.fecha} · 📍 {p.sede} · Grupo {p.g}
                    {hRes&&<span style={{marginLeft:8,color:"#2a2a4a"}}>· JUGADO</span>}
                    {bloqueada&&!hRes&&<span style={{marginLeft:8,color:GREEN}}>· 🔒 Enviado</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <div style={{flex:"1 1 110px",display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:22}}>{FLAG[p.local]||"🏳️"}</span>
                      <span style={{fontSize:15,fontWeight:600}}>{p.local}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      <input style={S.inpGol(bloqueada||hRes)} type="number" min="0" max="20"
                        value={pron.l} placeholder="-" disabled={bloqueada||hRes}
                        onChange={e=>setPron(p.id,"l",e.target.value)}/>
                      <span style={{color:MUTED,fontWeight:700,fontSize:20}}>—</span>
                      <input style={S.inpGol(bloqueada||hRes)} type="number" min="0" max="20"
                        value={pron.v} placeholder="-" disabled={bloqueada||hRes}
                        onChange={e=>setPron(p.id,"v",e.target.value)}/>
                    </div>
                    <div style={{flex:"1 1 110px",display:"flex",alignItems:"center",
                      justifyContent:"flex-end",gap:6}}>
                      <span style={{fontSize:15,fontWeight:600,textAlign:"right"}}>{p.vis}</span>
                      <span style={{fontSize:22}}>{FLAG[p.vis]||"🏳️"}</span>
                    </div>
                  </div>
                  {hRes&&(
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                      marginTop:12,paddingTop:12,borderTop:"1px solid #1a1a2c"}}>
                      <div>
                        <div style={{color:"#3a3a6a",fontSize:11,textTransform:"uppercase"}}>Resultado real</div>
                        <div style={{fontWeight:900,fontSize:20}}>{res.l} – {res.v}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:24}}>{pts===3?"🎯":pts===2?"✅":pts===0?"❌":"⏳"}</span>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontSize:11,color:MUTED,textTransform:"uppercase"}}>Tu pron.</div>
                          <div style={{fontWeight:900,fontSize:18,color:ptC}}>
                            {pron.l!==""&&pron.v!==""?`${pron.l}–${pron.v}`:"–"}
                          </div>
                        </div>
                        <div style={{padding:"4px 12px",borderRadius:8,border:`2px solid ${ptC}`,
                          fontWeight:900,fontSize:20,color:ptC}}>{pts} pts</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ── TABLA ──
  if(scr==="tabla"){
    const jugados=PARTIDOS.filter(p=>{const r=ress[p.id];return r&&r.l!==""&&r.v!=="";}).length;
    const tablaG=calcTablaGeneral(jds,prons,ress);
    const tablaF=calcTablaFecha(jds,prons,ress,tabFecha);
    const maxG=tablaG[0]?.pts??0;
    const maxF=tablaF[0]?.pts??0;
    const lider=tablaG[0]?.jugador||null;
    const liderPts=tablaG[0]?.pts??0;

    // Minijuego piedrazo
    function tirarPiedra(e){
      if(derribado)return;
      const rect=e.currentTarget.getBoundingClientRect();
      // Sale desde la izquierda (barrabrava) hacia la derecha (líder)
      const ox=rect.left+rect.width*0.25;
      const oy=rect.top+rect.height*0.45;
      const tx=rect.left+rect.width*0.72;
      const ty=rect.top+rect.height*0.38;
      const id=Date.now()+Math.random();
      setPiedras(prev=>[...prev,{id,x:ox,y:oy,tx,ty}]);
      setTimeout(()=>setPiedras(prev=>prev.filter(p=>p.id!==id)),650);
      setTambaleo(true);
      setTimeout(()=>setTambaleo(false),380);
      const ng=golpes+1;
      setGolpes(ng);
      if(ng>=5) setDerribado(true);
    }

    if(juegoActivo&&lider) return(
      <div style={{
        position:"fixed",top:0,left:0,right:0,bottom:0,
        background:"radial-gradient(ellipse at center,#1a0a00 0%,#07070d 70%)",
        display:"flex",flexDirection:"column",alignItems:"center",
        fontFamily:"'Barlow Condensed',sans-serif",
        overflow:"hidden",userSelect:"none",
        cursor:derribado?"default":"crosshair",
      }}
        onClick={tirarPiedra}
        onTouchStart={tirarPiedra}
      >
        <style>{`
          @keyframes tambaleo{
            0%{transform:rotate(0deg) scale(1)}
            20%{transform:rotate(-18deg) scale(1.08) translateY(-5px)}
            50%{transform:rotate(14deg) scale(.95)}
            75%{transform:rotate(-8deg) scale(1.03)}
            100%{transform:rotate(0deg) scale(1)}
          }
          @keyframes derribadoAnim{
            0%{transform:rotate(0deg) translateY(0);opacity:1}
            40%{transform:rotate(40deg) translateY(15px);opacity:1}
            70%{transform:rotate(80deg) translateY(40px);opacity:.5}
            100%{transform:rotate(100deg) translateY(80px);opacity:0}
          }
          @keyframes boom{
            0%{transform:scale(0) rotate(-30deg);opacity:1}
            50%{transform:scale(1.6) rotate(10deg);opacity:1}
            100%{transform:scale(.8) rotate(0deg);opacity:0}
          }
          @keyframes piedraTiro{
            0%{opacity:1;transform:translate(0,0) scale(1.3) rotate(0deg)}
            100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.3) rotate(720deg)}
          }
          @keyframes barraIdle{
            0%,100%{transform:translateY(0)}
            50%{transform:translateY(-3px)}
          }
          @keyframes lanzar{
            0%{transform:rotate(0deg)}
            15%{transform:rotate(20deg) translateY(8px)}
            35%{transform:rotate(-30deg) translateY(-12px)}
            55%{transform:rotate(10deg) translateY(4px)}
            75%{transform:rotate(-8deg)}
            100%{transform:rotate(0deg)}
          }
          @keyframes brazoAtras{
            0%,100%{transform:rotate(-15deg)}
            30%{transform:rotate(-120deg) translateY(-10px)}
            60%{transform:rotate(40deg) translateY(5px)}
          }
          @keyframes brazoDer{
            0%,100%{transform:rotate(20deg)}
            40%{transform:rotate(60deg)}
          }
          @keyframes piernaDer{
            0%,100%{transform:rotate(0deg)}
            40%{transform:rotate(-25deg)}
            70%{transform:rotate(15deg)}
          }
          @keyframes piernaIzq{
            0%,100%{transform:rotate(0deg)}
            40%{transform:rotate(20deg)}
            70%{transform:rotate(-10deg)}
          }
          @keyframes humo{
            0%{opacity:.8;transform:scale(.5) translateY(0)}
            100%{opacity:0;transform:scale(2) translateY(-30px)}
          }
          @keyframes shake{
            0%,100%{transform:translateX(0)}
            25%{transform:translateX(-6px)}
            75%{transform:translateX(6px)}
          }
        `}</style>

        {/* Título */}
        <div style={{position:"absolute",top:16,left:0,right:0,textAlign:"center",zIndex:10}}>
          <p style={{color:GOLD,fontSize:13,letterSpacing:3,textTransform:"uppercase",margin:0,fontWeight:900}}>
            🪨 ¡Sacalo del primer puesto!
          </p>
          {!derribado&&<p style={{color:"#555",fontSize:11,margin:"3px 0 0"}}>
            Tocá para tirar · {5-golpes} piedras restantes
          </p>}
        </div>

        {/* Puntos visual */}
        <div style={{position:"absolute",top:58,left:0,right:0,textAlign:"center",zIndex:10}}>
          <span style={{
            fontSize:42,fontWeight:900,
            background:`linear-gradient(90deg,${GOLD},#fff)`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            animation:tambaleo?"shake .3s ease":"none",
          }}>{Math.max(0,liderPts-golpes*3)}</span>
          <span style={{color:MUTED,fontSize:12,marginLeft:6}}>pts</span>
        </div>

        {/* Área de juego */}
        <div style={{
          flex:1,display:"flex",width:"100%",
          alignItems:"center",justifyContent:"space-around",
          paddingTop:110,paddingBottom:100,
          position:"relative",
        }}>

          {/* ── BARRABRAVA LANZADOR (izquierda) ── */}
          {!derribado&&(
            <div style={{
              display:"flex",flexDirection:"column",alignItems:"center",
              animation:`barraIdle 1.2s ease-in-out infinite`,
              position:"relative",
            }}>
              {/* Foto en la cabeza */}
              <div style={{
                width:52,height:52,borderRadius:"50%",overflow:"hidden",
                border:`3px solid #e63946`,marginBottom:-4,
                background:"#111",zIndex:2,position:"relative",
                boxShadow:"0 4px 12px rgba(0,0,0,.6)",
              }}>
                {jugador?.fotoUrl
                  ?<img src={jugador.fotoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:24,background:"#222"}}>😤</div>
                }
              </div>

              {/* SVG cuerpo barrabrava */}
              <svg width="90" height="130" viewBox="0 0 90 130"
                style={{overflow:"visible",marginTop:-2}}>

                {/* Cuello */}
                <rect x="38" y="0" width="14" height="10" rx="3" fill="#c8956c"/>

                {/* Torso — remera a rayas */}
                <rect x="22" y="10" width="46" height="45" rx="8" fill="#c0392b"/>
                <rect x="22" y="18" width="46" height="5" fill="#fff" opacity=".3"/>
                <rect x="22" y="30" width="46" height="5" fill="#fff" opacity=".3"/>
                <rect x="22" y="42" width="46" height="5" fill="#fff" opacity=".3"/>

                {/* BRAZO IZQUIERDO (atrás, con piedra — el que lanza) */}
                <g style={{
                  transformOrigin:"22px 18px",
                  animation:`brazoAtras ${tambaleo?.3:.9}s ease-in-out ${tambaleo?"":"infinite"}`,
                }}>
                  {/* Brazo superior */}
                  <rect x="-8" y="12" width="32" height="12" rx="6" fill="#c0392b"/>
                  {/* Antebrazo */}
                  <rect x="-22" y="6" width="20" height="10" rx="5" fill="#c8956c"
                    style={{transformOrigin:"-8px 18px",transform:"rotate(-30deg)"}}/>
                  {/* Mano con PIEDRA */}
                  <g style={{transform:"translate(-32px, 2px)"}}>
                    <ellipse cx="0" cy="0" rx="12" ry="10" fill="#7f8c8d"/>
                    <ellipse cx="-2" cy="-2" rx="5" ry="4" fill="#95a5a6" opacity=".6"/>
                    <ellipse cx="3" cy="3" rx="3" ry="2.5" fill="#636e72" opacity=".4"/>
                    {/* Dedos sosteniendo */}
                    <rect x="-10" y="-12" width="5" height="10" rx="2.5" fill="#c8956c" transform="rotate(-10deg)"/>
                    <rect x="-4" y="-13" width="5" height="11" rx="2.5" fill="#c8956c"/>
                    <rect x="2" y="-12" width="5" height="10" rx="2.5" fill="#c8956c" transform="rotate(10deg)"/>
                  </g>
                </g>

                {/* BRAZO DERECHO (adelante, equilibrio) */}
                <g style={{
                  transformOrigin:"68px 18px",
                  animation:`brazoDer .9s ease-in-out infinite`,
                }}>
                  <rect x="68" y="12" width="26" height="12" rx="6" fill="#c0392b"/>
                  <rect x="90" y="16" width="14" height="10" rx="5" fill="#c8956c"/>
                </g>

                {/* Cintura / pantalon */}
                <rect x="22" y="52" width="46" height="8" rx="3" fill="#2c3e50"/>

                {/* PIERNA DERECHA */}
                <g style={{
                  transformOrigin:"52px 60px",
                  animation:`piernaDer .9s ease-in-out infinite`,
                }}>
                  <rect x="42" y="58" width="18" height="40" rx="7" fill="#2c3e50"/>
                  {/* Bota derecha */}
                  <ellipse cx="51" cy="100" rx="14" ry="7" fill="#1a1a1a"/>
                  <ellipse cx="58" cy="99" rx="7" ry="5" fill="#333"/>
                </g>

                {/* PIERNA IZQUIERDA */}
                <g style={{
                  transformOrigin:"38px 60px",
                  animation:`piernaIzq .9s ease-in-out infinite`,
                }}>
                  <rect x="28" y="58" width="18" height="38" rx="7" fill="#2c3e50"/>
                  {/* Bota izquierda */}
                  <ellipse cx="37" cy="98" rx="14" ry="7" fill="#1a1a1a"/>
                  <ellipse cx="30" cy="97" rx="7" ry="5" fill="#333"/>
                </g>

              </svg>

              {/* Polvo bajo los pies */}
              {tambaleo&&[1,2,3].map(i=>(
                <div key={i} style={{
                  position:"absolute",bottom:-5,
                  left:`${20+i*18}%`,
                  width:8,height:8,borderRadius:"50%",
                  background:"#555",
                  animation:`humo .5s ease ${i*.1}s forwards`,
                }}/>
              ))}

              <div style={{fontSize:11,color:"#e63946",fontWeight:700,
                textTransform:"uppercase",letterSpacing:1,marginTop:4}}>
                {jugador?.nombre||"Vos"}
              </div>
            </div>
          )}

          {/* ── FOTO DEL LÍDER (objetivo, derecha) ── */}
          <div style={{
            display:"flex",flexDirection:"column",alignItems:"center",gap:8,
          }}>
            <div style={{
              animation: derribado?"derribadoAnim .8s ease forwards":
                         tambaleo?"tambaleo .35s ease":"none",
              position:"relative",
            }}>
              {lider.fotoUrl
                ?<img src={lider.fotoUrl} alt={lider.nombre} style={{
                    width:130,height:130,borderRadius:"50%",objectFit:"cover",
                    border:`5px solid ${GOLD}`,
                    boxShadow:`0 0 40px ${GOLD}66`,
                    pointerEvents:"none",display:"block",
                  }}/>
                :<div style={{
                    width:130,height:130,borderRadius:"50%",background:"#111",
                    border:`5px solid ${GOLD}`,display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:58,
                  }}>👤</div>
              }
              {/* Estrella de impacto */}
              {tambaleo&&(
                <div style={{
                  position:"absolute",top:-15,right:-15,
                  fontSize:28,animation:"boom .4s ease forwards",
                }}>💥</div>
              )}
            </div>

            {!derribado&&(
              <div style={{
                fontSize:20,fontWeight:900,textTransform:"uppercase",
                letterSpacing:2,color:TEXT,textAlign:"center",
              }}>{lider.nombre}</div>
            )}

            {derribado&&(
              <div style={{textAlign:"center",marginTop:8}}>
                <div style={{fontSize:50,animation:"boom .5s ease"}}>💥⭐💥</div>
                <p style={{color:GOLD,fontWeight:900,fontSize:20,
                  textTransform:"uppercase",letterSpacing:3,margin:"8px 0 4px"}}>
                  ¡Derribado!
                </p>
                <p style={{color:MUTED,fontSize:12,margin:0}}>
                  (los puntos reales siguen igual 😅)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Piedras volando */}
        {piedras.map(p=>(
          <div key={p.id} style={{
            position:"fixed",
            left:p.x, top:p.y,
            fontSize:28,pointerEvents:"none",zIndex:50,
            "--dx":`${p.tx-p.x}px`,
            "--dy":`${p.ty-p.y}px`,
            animation:"piedraTiro .55s cubic-bezier(.2,.8,.3,1) forwards",
          }}>🪨</div>
        ))}

        {/* Indicador de golpes */}
        <div style={{
          position:"absolute",bottom:76,left:0,right:0,
          display:"flex",justifyContent:"center",gap:8,
        }}>
          {Array.from({length:5}).map((_,i)=>(
            <div key={i} style={{
              width:30,height:30,borderRadius:"50%",
              background:i<golpes?RED:"#1a1a2a",
              border:`2px solid ${i<golpes?RED:"#333"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:14,transition:"all .2s",
              transform:i<golpes?"scale(1.1)":"scale(1)",
            }}>{i<golpes?"💥":"🪨"}</div>
          ))}
        </div>

        {/* Botones */}
        <div style={{position:"absolute",bottom:18,display:"flex",gap:10}}>
          <button style={S.btn(
            derribado?GREEN:"#1a1a2a",
            derribado?"#000":"#888",
            `1px solid ${derribado?GREEN:"#333"}`,
            {fontSize:13,padding:"10px 20px"}
          )} onClick={e=>{
            e.stopPropagation();
            setJuegoActivo(false);
            setGolpes(0);setDerribado(false);
            setPiedras([]);setTambaleo(false);
          }}>
            {derribado?"🏆 Ver tabla":"← Salir"}
          </button>
          {golpes>0&&!derribado&&(
            <button style={S.btn("#1a0808",RED,"1px solid #601010",
              {fontSize:13,padding:"10px 20px"})}
              onClick={e=>{e.stopPropagation();setGolpes(0);setTambaleo(false);}}>
              Resetear
            </button>
          )}
        </div>
      </div>
    );

    return(
      <div style={S.root}>
        <Header sub={`${jugados}/72 partidos jugados`} sync={sync}/>
        <div style={S.wrap}>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            <button style={S.btn("transparent",MUTED,"1px solid #222")}
              onClick={()=>setScr("inicio")}>← Volver</button>
            <button style={S.btn("#1a1a2a","#888","1px solid #333")}
              onClick={cargarTodo}>🔄 Actualizar</button>
          </div>

          {/* LÍDER DESTACADO */}
          {lider&&liderPts>0&&(
            <div style={{
              background:"linear-gradient(135deg,#1a1200,#0d0d00)",
              border:`2px solid ${GOLD}`,borderRadius:16,
              padding:"20px 16px",marginBottom:12,
              textAlign:"center",position:"relative",overflow:"hidden",
            }}>
              <div style={{
                position:"absolute",top:0,left:0,right:0,bottom:0,
                background:`radial-gradient(ellipse at center,${GOLD}11,transparent)`,
                pointerEvents:"none",
              }}/>
              <p style={{...S.sTitle,marginBottom:12}}>👑 Líder actual</p>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                {lider.fotoUrl
                  ?<img src={lider.fotoUrl} alt={lider.nombre} style={{
                      width:110,height:110,borderRadius:"50%",objectFit:"cover",
                      border:`4px solid ${GOLD}`,
                      boxShadow:`0 0 30px ${GOLD}66`,
                    }}/>
                  :<div style={{
                      width:110,height:110,borderRadius:"50%",background:"#111",
                      border:`4px solid ${GOLD}`,display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:50,
                      boxShadow:`0 0 30px ${GOLD}66`,
                    }}>👤</div>
                }
                <div style={{
                  fontSize:30,fontWeight:900,textTransform:"uppercase",letterSpacing:3,
                  background:`linear-gradient(90deg,${GOLD},#fff,${GOLD})`,
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                }}>{lider.nombre}</div>
                <div style={{
                  fontSize:42,fontWeight:900,color:GOLD,
                  textShadow:`0 0 20px ${GOLD}88`,lineHeight:1,
                }}>{liderPts} <span style={{fontSize:16,color:MUTED,fontWeight:400}}>pts</span></div>
                <button style={{
                  ...S.btn("#1a0808",RED,"2px solid #802020",{fontSize:14,padding:"10px 22px",marginTop:4}),
                }}
                  onClick={()=>{setJuegoActivo(true);setGolpes(0);setDerribado(false);}}>
                  🪨 ¡Tirarle una piedra!
                </button>
              </div>
            </div>
          )}

          <div style={S.card}>
            <p style={S.sTitle}>🏆 Tabla General</p>
            {tablaG.length===0?<p style={{color:MUTED,fontSize:13}}>Sin puntos todavía</p>
              :tablaG.map((item,i)=><TablaFila key={item.jugador.nombre} item={item} pos={i} maxPts={maxG}/>)}
          </div>
          <div style={S.card}>
            <p style={S.sTitle}>📅 Tabla por Fecha</p>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {FECHAS.map(f=>(
                <button key={f} style={S.ftab(tabFecha===f,fechaCompleta(ress,f))}
                  onClick={()=>setTabFecha(f)}>
                  FECHA {f}
                  {fechaCompleta(ress,f)&&<div style={{fontSize:10,color:tabFecha===f?"#333":GREEN}}>✓</div>}
                </button>
              ))}
            </div>
            {tablaF.length===0?<p style={{color:MUTED,fontSize:13}}>Sin puntos en esta fecha</p>
              :tablaF.map((item,i)=><TablaFila key={item.jugador.nombre} item={item} pos={i} maxPts={maxF}/>)}
          </div>
          <div style={{display:"flex",gap:20,justifyContent:"center",
            color:"#2a2a4a",fontSize:12,marginTop:8,flexWrap:"wrap"}}>
            <span>🎯 Exacto=3pts</span><span>✅ Ganador=2pts</span><span>❌ Error=0pts</span>
          </div>
        </div>
      </div>
    );
  }

  // ── PASS ADMIN ──
  if(scr==="passAdmin")return(
    <div style={S.root}>
      <Header sync={sync}/>
      <div style={S.wrap}>
        <div style={S.card}>
          <p style={S.sTitle}>🔐 Acceso administrador</p>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <input style={{...S.inp(),flex:1}} type="password" placeholder="Contraseña"
              value={passIn} onChange={e=>{setPI(e.target.value);setPE(false);}}
              onKeyDown={async e=>{if(e.key!=="Enter")return;
                const r=await API.checkPass(passIn);
                if(r?.valid){setPI("");setPE(false);setScr("admin");}else setPE(true);}}/>
            <button style={S.btn(GOLD)} onClick={async()=>{
              const r=await API.checkPass(passIn);
              if(r?.valid){setPI("");setPE(false);setScr("admin");}else setPE(true);
            }}>Entrar</button>
          </div>
          {passErr&&<p style={{color:RED,fontSize:12}}>Contraseña incorrecta</p>}
          <button style={{...S.btn("transparent",MUTED,"1px solid #222"),marginTop:8}}
            onClick={()=>setScr("inicio")}>← Volver</button>
        </div>
      </div>
    </div>
  );

  // ── ADMIN ──
  if(scr==="admin"){
    const partidos=PARTIDOS.filter(p=>p.g===grupo&&p.f===fecha);
    const cargados=PARTIDOS.filter(p=>{const r=ress[p.id];return r&&r.l!==""&&r.v!=="";}).length;

    async function guardarPartido(pid){
      const r=resLocal[pid]||{l:"",v:""};
      // Acepta "0" como valor válido
      const lVal = String(r.l).trim();
      const vVal = String(r.v).trim();
      if(lVal===""||vVal===""){return;}
      setGuardando(prev=>({...prev,[pid]:true}));
      const res = await API.setResultado(pid,lVal,vVal);
      setRess(prev=>({...prev,[pid]:{l:lVal,v:vVal}}));
      setGuardando(prev=>({...prev,[pid]:false}));
      setGuardadoOk(prev=>({...prev,[pid]:true}));
      setTimeout(()=>setGuardadoOk(prev=>({...prev,[pid]:false})),2500);
    }
    async function addJugador(){
      const n=nombreN.trim(),d=dniN.trim();
      if(!n||jds.find(x=>x.nombre===n))return;
      const nuevos=[...jds,{nombre:n,dni:d,fotoUrl:""}];
      setJds(nuevos);
      await API.setJugadores(nuevos);
      setNN("");setDniN("");
    }
    async function delJugador(nombre){
      if(!confirm(`¿Eliminar a ${nombre}?`))return;
      const nuevos=jds.filter(x=>x.nombre!==nombre);
      setJds(nuevos);
      await API.setJugadores(nuevos);
    }
    async function handleFoto(nombre,file){
      if(!file)return;
      setFotoSub(nombre);setFotoErr(null);
      const r=await API.subirFotoImgur(file);
      if(r?.ok&&r.url){
        const nuevos=jds.map(j=>j.nombre===nombre?{...j,fotoUrl:r.url}:j);
        setJds(nuevos);
        await API.setJugadores(nuevos);
      }else{setFotoErr(nombre);}
      setFotoSub(null);
    }

    return(
      <div style={S.root}>
        <Header sub="Panel de administración" sync={sync}/>
        <div style={S.wrap}>
          <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <button style={S.btn("transparent",GOLD,"1px solid "+GOLD)}
              onClick={()=>setScr("tabla")}>🏅 Tabla</button>
            <button style={S.btn("transparent",MUTED,"1px solid #222")}
              onClick={()=>setScr("inicio")}>← Salir</button>
            <button style={S.btn("#1a1a2a","#888","1px solid #333")}
              onClick={cargarTodo}>🔄 Sync</button>
            <span style={{color:MUTED,fontSize:11}}>{cargados}/72 resultados</span>
          </div>

          {/* JUGADORES */}
          <div style={S.card}>
            <p style={S.sTitle}>👥 Jugadores ({jds.length})</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {jds.map(j=>(
                <div key={j.nombre} style={{display:"flex",alignItems:"center",gap:10,
                  padding:"10px 12px",background:"#0b0b18",
                  border:`1px solid ${BDR}`,borderRadius:10,flexWrap:"wrap"}}>
                  <Avatar j={j} size={46}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15}}>{j.nombre}</div>
                    <div style={{fontSize:11,color:MUTED}}>DNI: {j.dni||"—"}</div>
                    <div style={{fontSize:11,color:MUTED,marginTop:2}}>
                      {FECHAS.map(f=>(
                        <span key={f} style={{marginRight:8,
                          color:estaBloquada(f,envios,j.nombre,desbloqueos)?GREEN:MUTED}}>
                          F{f}:{estaBloquada(f,envios,j.nombre,desbloqueos)?"🔒":"⏳"}
                        </span>
                      ))}
                    </div>
                    {fotoErr===j.nombre&&<div style={{fontSize:11,color:RED}}>Error al subir foto</div>}
                  </div>
                  <label style={{cursor:"pointer"}}>
                    <input type="file" accept="image/*" style={{display:"none"}}
                      onChange={e=>handleFoto(j.nombre,e.target.files[0])}/>
                    <span style={{...S.btn("#1a1a2a","#ccc","1px solid #333",
                      {fontSize:12,padding:"7px 12px",display:"inline-block"})}}>
                      {fotoSub===j.nombre?"⏳":"📷 Foto"}
                    </span>
                  </label>
                  <button onClick={()=>delJugador(j.nombre)}
                    style={S.btn("#1a0808",RED,"1px solid #401010",{padding:"7px 12px",fontSize:12})}>
                    Borrar
                  </button>
                </div>
              ))}
              {jds.length===0&&<span style={{color:MUTED,fontSize:13}}>Sin jugadores aún</span>}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <input style={{...S.inp(),flex:"2 1 130px"}} placeholder="Nombre"
                value={nombreN} onChange={e=>setNN(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")addJugador();}}/>
              <input style={{...S.inp(),flex:"1 1 100px"}} placeholder="DNI" type="number"
                value={dniN} onChange={e=>setDniN(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")addJugador();}}/>
              <button style={S.btn(GOLD)} onClick={addJugador}>+ Agregar</button>
            </div>
          </div>

          {/* RESULTADOS */}
          <div style={S.card}>
            <p style={S.sTitle}>📋 Resultados reales</p>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
              {GRUPOS_KEYS.map(g=>{
                const done=PARTIDOS.filter(p=>p.g===g)
                  .every(p=>{const r=ress[p.id];return r&&r.l!==""&&r.v!=="";});
                return<button key={g} style={{...S.tab(grupo===g),
                  ...(done&&grupo!==g?{borderColor:"#2a4a2a",color:"#3aaa3a"}:{})}}
                  onClick={()=>setGrupo(g)}>{g}{done?" ✓":""}</button>;
              })}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {FECHAS.map(f=>{
                const ps=PARTIDOS.filter(p=>p.g===grupo&&p.f===f);
                const done=ps.every(p=>{const r=ress[p.id];return r&&r.l!==""&&r.v!=="";});
                return(
                  <button key={f} style={S.ftab(fecha===f,done)} onClick={()=>setFecha(f)}>
                    <div>FECHA {f}</div>
                    <div style={{fontSize:10,fontWeight:400,opacity:.7,marginTop:2}}>{ps[0]?.fecha||""}</div>
                    {done&&<div style={{fontSize:10,color:fecha===f?"#333":GREEN}}>✓</div>}
                  </button>
                );
              })}
            </div>
            {/* Botón guardar todos los partidos de esta fecha */}
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
              <button style={S.btn(GREEN,"#000","none",{fontSize:13,padding:"10px 20px"})}
                onClick={async()=>{
                  const ps=PARTIDOS.filter(p=>p.g===grupo&&p.f===fecha);
                  for(const p of ps){
                    const r=resLocal[p.id]||{l:"",v:""};
                    if(r.l!==""&&r.v!==""){
                      await guardarPartido(p.id);
                    }
                  }
                }}>
                💾 Guardar todos
              </button>
            </div>
            {partidos.map(p=>{
              const rl=resLocal[p.id]||{l:"",v:""};
              const guardado=guardadoOk[p.id];
              const cargandoP=guardando[p.id];
              const yaGuardado=ress[p.id]?.l!==""&&ress[p.id]?.v!=="";
              const listoParaGuardar=rl.l!==""&&rl.v!=="";
              const sinCambios=rl.l===(ress[p.id]?.l||"")&&rl.v===(ress[p.id]?.v||"");
              return(
                <div key={p.id} style={{
                  padding:"12px 0",borderBottom:`1px solid ${BDR}`,
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:MUTED,width:50,flexShrink:0}}>{p.fecha}</span>
                    <div style={{flex:"1 1 100px",display:"flex",alignItems:"center",gap:5}}>
                      <span style={{fontSize:18}}>{FLAG[p.local]||"🏳️"}</span>
                      <span style={{fontSize:13}}>{p.local}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                      <input
                        style={{...S.inpGol(false),fontSize:20}}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={2}
                        value={rl.l}
                        placeholder="-"
                        onChange={e=>{
                          const v=e.target.value.replace(/[^0-9]/g,"");
                          setResLocal(prev=>({...prev,[p.id]:{...(prev[p.id]||{l:"",v:""}),l:v}}));
                        }}
                        onKeyDown={e=>{if(e.key==="Enter")guardarPartido(p.id);}}
                      />
                      <span style={{color:MUTED,fontWeight:700}}>–</span>
                      <input
                        style={{...S.inpGol(false),fontSize:20}}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={2}
                        value={rl.v}
                        placeholder="-"
                        onChange={e=>{
                          const v=e.target.value.replace(/[^0-9]/g,"");
                          setResLocal(prev=>({...prev,[p.id]:{...(prev[p.id]||{l:"",v:""}),v}}));
                        }}
                        onKeyDown={e=>{if(e.key==="Enter")guardarPartido(p.id);}}
                      />
                    </div>
                    <div style={{flex:"1 1 80px",display:"flex",alignItems:"center",
                      justifyContent:"flex-end",gap:5}}>
                      <span style={{fontSize:13,textAlign:"right"}}>{p.vis}</span>
                      <span style={{fontSize:18}}>{FLAG[p.vis]||"🏳️"}</span>
                    </div>
                    {/* Botón guardar */}
                    <button
                      disabled={!listoParaGuardar||cargandoP}
                      style={{
                        padding:"7px 12px",borderRadius:7,cursor:listoParaGuardar&&!cargandoP?"pointer":"default",
                        fontWeight:800,fontSize:12,fontFamily:"inherit",
                        textTransform:"uppercase",letterSpacing:.5,flexShrink:0,
                        background:guardado?"#0f2a0f":listoParaGuardar&&!sinCambios?GREEN:"#1a1a2a",
                        border:`1px solid ${guardado?GREEN:listoParaGuardar&&!sinCambios?GREEN:"#333"}`,
                        color:guardado?GREEN:listoParaGuardar&&!sinCambios?"#000":"#444",
                        transition:"all .2s",
                      }}
                      onClick={()=>guardarPartido(p.id)}
                    >
                      {cargandoP?"⏳":guardado?"✓ OK":yaGuardado&&sinCambios?"✓":"💾 Guardar"}
                    </button>
                  </div>
                  {/* Aviso si falta algún gol */}
                  {(rl.l!==""&&rl.v==="")||(rl.l===""&&rl.v!=="")?(
                    <p style={{color:GOLD,fontSize:11,margin:"4px 0 0 58px"}}>
                      ⚠️ Completá los dos goles para guardar
                    </p>
                  ):null}
                </div>
              );
            })}
          </div>

          {/* DESBLOQUEOS */}
          <div style={S.card}>
            <p style={S.sTitle}>🔓 Habilitar modificación fuera de límite</p>
            <p style={{color:MUTED,fontSize:12,margin:"0 0 12px",lineHeight:1.5}}>
              Permitís que un jugador modifique sus pronósticos de una fecha aunque ya haya enviado o pasado el límite.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {jds.map(j=>(
                <div key={j.nombre} style={{
                  display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                  background:"#0b0b18",border:`1px solid ${BDR}`,borderRadius:10,flexWrap:"wrap",
                }}>
                  <Avatar j={j} size={36}/>
                  <span style={{flex:1,fontWeight:700,fontSize:14}}>{j.nombre}</span>
                  <div style={{display:"flex",gap:6}}>
                    {FECHAS.map(f=>{
                      const key=j.nombre+":f"+f;
                      const desbloq=desbloqueos[key]===true;
                      const bloq=estaBloquada(f,envios,j.nombre,desbloqueos);
                      return(
                        <button key={f}
                          style={{
                            padding:"6px 10px",borderRadius:7,cursor:"pointer",
                            fontWeight:700,fontSize:12,fontFamily:"inherit",
                            textTransform:"uppercase",letterSpacing:.5,
                            background:desbloq?"#0f2a0f":bloq?"#1a0808":"#111",
                            border:`1px solid ${desbloq?GREEN:bloq?"#601010":"#333"}`,
                            color:desbloq?GREEN:bloq?RED:MUTED,
                          }}
                          onClick={async()=>{
                            if(desbloq){
                              // volver a bloquear
                              await API.bloquearJugador(j.nombre,f);
                              setDesbloq(prev=>{const n={...prev};delete n[key];return n;});
                            } else {
                              // desbloquear
                              await API.desbloquearJugador(j.nombre,f);
                              setDesbloq(prev=>({...prev,[key]:true}));
                            }
                          }}>
                          F{f} {desbloq?"🔓":bloq?"🔒":"⏳"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {jds.length===0&&<span style={{color:MUTED,fontSize:13}}>Sin jugadores</span>}
            </div>
            <div style={{marginTop:10,fontSize:11,color:MUTED,lineHeight:1.6}}>
              🔒 Bloqueado · 🔓 Habilitado por vos · ⏳ Abierto normalmente
            </div>
          </div>

          {/* CONTRASEÑA */}
          <div style={S.card}>
            <p style={S.sTitle}>🔑 Contraseña admin</p>
            <div style={{display:"flex",gap:8}}>
              <input style={{...S.inp(),flex:1}} type="password" placeholder="Nueva contraseña"
                value={newPass} onChange={e=>setNP(e.target.value)}/>
              <button style={S.btn("#1a1a2a","#ccc","1px solid #333")} onClick={async()=>{
                const v=newPass.trim();
                if(v){await API.setAdminPass(v);setNP("");alert("✓ Contraseña actualizada");}
              }}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
