import { useState, useEffect, useCallback } from "react";
import { PARTIDOS, GRUPOS_KEYS, FLAG, calcPts, PARTIDOS_R32, calcClasificados } from "./datos";
import * as API from "./api";



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


  // Admin resultados local
  const [resLocal,setResLocal]    =useState({});
  const [guardando,setGuardando]  =useState({});
  const [guardadoOk,setGuardadoOk]=useState({});
  // Equipos R32 editables manualmente
  const [equiposR32,setEquiposR32]=useState({});

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
    setEquiposR32(d.equiposR32||{});
    setSync(new Date());
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
      <Header sub="Mundial 2026" sync={sync}/>
      <div style={{...S.wrap,display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
        <div style={{...S.card,padding:0,overflow:"hidden",display:"flex"}}>
          {[{i:"🎯",p:"3 PTS",t:"Resultado exacto",bg:"#09180e",bc:GREEN},
            {i:"✅",p:"2 PTS",t:"Acierta ganador",bg:"#091220",bc:BLUE},
            {i:"❌",p:"0 PTS",t:"Error",bg:"#180909",bc:RED}].map(r=>(
            <div key={r.p} style={{flex:1,padding:"12px 6px",background:r.bg,
              textAlign:"center",borderTop:`3px solid ${r.bc}`}}>
              <div style={{fontSize:20}}>{r.i}</div>
              <div style={{fontSize:14,fontWeight:900,color:"#fff"}}>{r.p}</div>
              <div style={{fontSize:9,color:MUTED,textTransform:"uppercase"}}>{r.t}</div>
            </div>
          ))}
        </div>

        {/* SECCIÓN 1 — Fase de Grupos */}
        <div style={{background:"linear-gradient(135deg,#0a1a0a,#0d0d1a)",
          border:`2px solid ${GREEN}`,borderRadius:14,padding:"18px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:28}}>⚽</span>
            <div>
              <p style={{...S.sTitle,margin:0,color:GREEN}}>Fase de Grupos</p>
              <p style={{fontSize:13,color:MUTED,margin:0}}>12 grupos · 72 partidos · 3 fechas</p>
            </div>
          </div>
          <button style={S.btn(`linear-gradient(90deg,${GREEN},#1a6a30)`,"#fff","none",{width:"100%",padding:"13px"})}
            onClick={()=>setScr("elegir")}>⚽ Ingresar mis pronosticos</button>
        </div>

        {/* SECCIÓN 2 — 16avos */}
        <div style={{background:"linear-gradient(135deg,#1a0800,#0d0d00)",
          border:"2px solid #e67e22",borderRadius:14,padding:"18px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:28}}>⚔</span>
            <div>
              <p style={{...S.sTitle,margin:0,color:"#e67e22"}}>16avos de Final</p>
              <p style={{fontSize:13,color:MUTED,margin:0}}>16 partidos · 28 Jun – 4 Jul</p>
            </div>
          </div>
          <button style={S.btn("linear-gradient(90deg,#e67e22,#b05a0f)","#fff","none",{width:"100%",padding:"13px"})}
            onClick={()=>setScr("r32")}>⚔ Ver 16avos y pronosticos</button>
        </div>

        {/* SECCIÓN 3 — Tabla */}
        <div style={{background:"linear-gradient(135deg,#1a1200,#0d0d00)",
          border:`2px solid ${GOLD}`,borderRadius:14,padding:"18px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:28}}>🏅</span>
            <div>
              <p style={{...S.sTitle,margin:0,color:GOLD}}>Tabla de Posiciones</p>
              <p style={{fontSize:13,color:MUTED,margin:0}}>General · Por fecha · 16avos</p>
            </div>
          </div>
          <button style={S.btn(`linear-gradient(90deg,${GOLD},#b88000)`,"#000","none",{width:"100%",padding:"13px"})}
            onClick={()=>setScr("tabla")}>🏅 Ver tabla completa</button>
        </div>

        <button style={S.btn("#0d0d18","#555","1px solid #222")}
          onClick={()=>setScr("passAdmin")}>🔐 Panel de administracion</button>
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
              <button style={S.btn("transparent","#e67e22","1px solid #e67e22")}
                onClick={()=>setScr("r32")}>⚔ 16avos</button>
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

  // ── 16AVOS DE FINAL ──
  if(scr==="r32"){
    const mp=jugador?(prons[jugador.nombre]||{}):{};

    // Calcular clasificados automáticamente desde los resultados cargados
    const clasificados = calcClasificados(ress);

    // Resolver nombre real del equipo para cada partido
    function resolverEquipo(partidoId, campo) {
      const c = clasificados[partidoId];
      if (!c) return campo === "local" ? PARTIDOS_R32.find(p=>p.id===partidoId)?.local : PARTIDOS_R32.find(p=>p.id===partidoId)?.vis;
      return campo === "local" ? c.local : c.vis;
    }

    function calcTablaR32(jds2,prons2,ress2){
      return jds2.map(j=>{
        let pts=0,ex=0,gn=0,fa=0;
        PARTIDOS_R32.forEach(p=>{
          const res=ress2[p.id],pr=prons2[j.nombre]?.[p.id];
          if(!pr||pr.l===""||pr.v===""||!res||res.l===""||res.v==="")return;
          const n=calcPts(pr,res);if(n===null)return;
          pts+=n;if(n===3)ex++;else if(n===2)gn++;else fa++;
        });
        return{jugador:j,pts,ex,gn,fa};
      }).sort((a,b)=>b.pts-a.pts||b.ex-a.ex);
    }

    const tablaR32=calcTablaR32(jds,prons,ress);
    const maxR32=tablaR32[0]?.pts??0;

    async function setPronR32(pid,campo,val){
      if(!jugador)return;
      const nuevo={...prons,[jugador.nombre]:{
        ...(prons[jugador.nombre]||{}),
        [pid]:{...(prons[jugador.nombre]?.[pid]||{l:"",v:""}), [campo]:val},
      }};
      setProns(nuevo);
      const pr=nuevo[jugador.nombre][pid];
      await API.setPronostico(jugador.nombre,pid,0,pr.l||"",pr.v||"");
    }

    return(
      <div style={S.root}>
        <Header sync={sync}/>
        <div style={S.wrap}>
          <div style={{background:"linear-gradient(135deg,#1a0800,#0d0d00)",
            border:"2px solid #e67e22",borderRadius:14,
            padding:"14px 16px",marginBottom:12,textAlign:"center"}}>
            <p style={{...S.sTitle,color:"#e67e22",margin:"0 0 4px"}}>16avos de Final</p>
            <p style={{fontSize:11,color:MUTED,margin:0}}>28 Jun – 4 Jul · 16 partidos</p>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            <button style={S.btn("transparent",MUTED,"1px solid #222")}
              onClick={()=>setScr("inicio")}>← Volver</button>
            <button style={S.btn("#1a1a2a","#888","1px solid #333")}
              onClick={cargarTodo}>🔄 Actualizar</button>
          </div>
          {!jugador&&(
            <div style={{...S.card,textAlign:"center",padding:20}}>
              <p style={{color:MUTED,margin:"0 0 12px"}}>Inicia sesion para cargar pronosticos</p>
              <button style={S.btn(`linear-gradient(90deg,${GOLD},#b88000)`)}
                onClick={()=>setScr("elegir")}>⚽ Ingresar</button>
            </div>
          )}
          {PARTIDOS_R32.map(p=>{
            // Resolver equipos reales desde clasificados
            // Manual tiene prioridad sobre calculado
            const localReal = equiposR32[p.id]?.local || clasificados[p.id]?.local || p.local;
            const visReal   = equiposR32[p.id]?.vis   || clasificados[p.id]?.vis   || p.vis;
            const pron=mp[p.id]||{l:"",v:""};
            const res=ress[p.id];
            const hRes=res&&res.l!==""&&res.v!=="";
            const pts=hRes?calcPts(pron,res):null;
            const ptC=pts===3?GREEN:pts===2?BLUE:pts===0?RED:MUTED;
            const bg=pts===3?"#091a0c":pts===2?"#091220":pts===0?"#180909":CARD;
            const bc=pts===3?GREEN:pts===2?BLUE:pts===0?"#601010":"#e67e2244";
            const lK=!localReal.startsWith("1ro")&&!localReal.startsWith("2do")&&!localReal.startsWith("3ro");
            const vK=!visReal.startsWith("1ro")&&!visReal.startsWith("2do")&&!visReal.startsWith("3ro");
            return(
              <div key={p.id} style={{background:bg,borderRadius:12,marginBottom:10,
                padding:14,border:`2px solid ${bc}`}}>
                <div style={{fontSize:10,color:MUTED,marginBottom:10,letterSpacing:1}}>
                  ⚔ {p.fecha} {p.hora} · {p.sede}
                  {hRes&&<span style={{marginLeft:8,color:"#2a2a4a"}}>· JUGADO</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <div style={{flex:"1 1 100px",display:"flex",alignItems:"center",gap:6}}>
                    {lK&&<span style={{fontSize:20}}>{FLAG[localReal]||"🏳️"}</span>}
                    <span style={{fontSize:14,fontWeight:lK?700:400,color:lK?TEXT:MUTED}}>{localReal}</span>
                  </div>
                  {jugador&&lK&&vK?(
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      <input style={S.inpGol(hRes)} type="text" inputMode="numeric"
                        maxLength={2} value={pron.l} placeholder="-" disabled={hRes}
                        onChange={e=>setPronR32(p.id,"l",e.target.value.replace(/[^0-9]/g,""))}/>
                      <span style={{color:MUTED,fontWeight:700,fontSize:20}}>-</span>
                      <input style={S.inpGol(hRes)} type="text" inputMode="numeric"
                        maxLength={2} value={pron.v} placeholder="-" disabled={hRes}
                        onChange={e=>setPronR32(p.id,"v",e.target.value.replace(/[^0-9]/g,""))}/>
                    </div>
                  ):(
                    <span style={{color:MUTED,fontSize:18}}>{hRes?`${res.l}-${res.v}`:"?-?"}</span>
                  )}
                  <div style={{flex:"1 1 100px",display:"flex",alignItems:"center",
                    justifyContent:"flex-end",gap:6}}>
                    <span style={{fontSize:14,fontWeight:vK?700:400,color:vK?TEXT:MUTED,textAlign:"right"}}>{visReal}</span>
                    {vK&&<span style={{fontSize:20}}>{FLAG[visReal]||"🏳️"}</span>}
                  </div>
                </div>
                {hRes&&jugador&&(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                    marginTop:10,paddingTop:10,borderTop:"1px solid #1a1a2c"}}>
                    <div>
                      <div style={{color:"#3a3a6a",fontSize:11}}>Real</div>
                      <div style={{fontWeight:900,fontSize:18}}>{res.l}-{res.v}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:22}}>{pts===3?"🎯":pts===2?"✅":pts===0?"❌":"⏳"}</span>
                      <div style={{padding:"3px 10px",borderRadius:8,
                        border:`2px solid ${ptC}`,fontWeight:900,fontSize:18,color:ptC}}>{pts} pts</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {tablaR32.some(j=>j.pts>0)&&(
            <div style={S.card}>
              <p style={{...S.sTitle,color:"#e67e22"}}>Tabla 16avos</p>
              {tablaR32.map((item,i)=><TablaFila key={item.jugador.nombre} item={item} pos={i} maxPts={maxR32}/>)}
            </div>
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

    async function updRes(pid,campo,val){
      const nuevo={...ress,[pid]:{...(ress[pid]||{l:"",v:""}), [campo]:val}};
      setRess(nuevo);
      const r=nuevo[pid];
      await API.setResultado(pid,r.l||"",r.v||"");
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
            {partidos.map(p=>{
              const res=ress[p.id]||{l:"",v:""};
              const ok=res.l!==""&&res.v!=="";
              return(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,
                  padding:"12px 0",borderBottom:`1px solid ${BDR}`,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:MUTED,width:50,flexShrink:0}}>{p.fecha}</span>
                  <div style={{flex:"1 1 100px",display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:18}}>{FLAG[p.local]||"🏳️"}</span>
                    <span style={{fontSize:14}}>{p.local}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                    <input style={S.inpGol(false)} type="number" min="0" max="20"
                      value={res.l} placeholder="-" onChange={e=>updRes(p.id,"l",e.target.value)}/>
                    <span style={{color:MUTED,fontWeight:700}}>–</span>
                    <input style={S.inpGol(false)} type="number" min="0" max="20"
                      value={res.v} placeholder="-" onChange={e=>updRes(p.id,"v",e.target.value)}/>
                  </div>
                  <div style={{flex:"1 1 100px",display:"flex",alignItems:"center",
                    justifyContent:"flex-end",gap:5}}>
                    <span style={{fontSize:14,textAlign:"right"}}>{p.vis}</span>
                    <span style={{fontSize:18}}>{FLAG[p.vis]||"🏳️"}</span>
                  </div>
                  {ok&&<span style={{color:GREEN,fontSize:14}}>✓</span>}
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

          {/* RESULTADOS R32 + EQUIPOS EDITABLES */}
          <div style={S.card}>
            <p style={{...S.sTitle,color:"#e67e22"}}>Equipos y Resultados 16avos</p>
            <p style={{color:MUTED,fontSize:11,margin:"0 0 12px"}}>Los equipos se calculan solos. Editá manualmente si algo no cierra y guardá con 💾</p>
            {PARTIDOS_R32.map(p=>{
              const calc=calcClasificados(ress);
              const localCalc=calc[p.id]?.local||p.local;
              const visCalc=calc[p.id]?.vis||p.vis;
              const localMostrar=equiposR32[p.id]?.local!==undefined?equiposR32[p.id].local:localCalc;
              const visMostrar=equiposR32[p.id]?.vis!==undefined?equiposR32[p.id].vis:visCalc;
              const rl=resLocal[p.id]||{l:ress[p.id]?.l||"",v:ress[p.id]?.v||""};
              const gok=guardadoOk[p.id],cP=guardando[p.id];
              const listo=String(rl.l).trim()!==""&&String(rl.v).trim()!=="";
              const sinC=rl.l===(ress[p.id]?.l||"")&&rl.v===(ress[p.id]?.v||"");
              const eqOk=guardadoOk["eq_"+p.id];
              return(
                <div key={p.id} style={{padding:"12px 0",borderBottom:`1px solid ${BDR}`}}>
                  <div style={{fontSize:10,color:MUTED,marginBottom:6}}>{p.fecha} {p.hora} · {p.sede}</div>
                  {/* Editar equipos */}
                  <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
                    <input style={{...S.inp(),flex:"1 1 110px",fontSize:12,padding:"6px 8px"}}
                      value={localMostrar}
                      onChange={e=>setEquiposR32(prev=>({...prev,[p.id]:{...(prev[p.id]||{}),local:e.target.value}}))}/>
                    <span style={{color:MUTED,fontSize:12}}>vs</span>
                    <input style={{...S.inp(),flex:"1 1 110px",fontSize:12,padding:"6px 8px"}}
                      value={visMostrar}
                      onChange={e=>setEquiposR32(prev=>({...prev,[p.id]:{...(prev[p.id]||{}),vis:e.target.value}}))}/>
                    <button style={{
                      padding:"6px 12px",borderRadius:7,cursor:"pointer",fontWeight:800,
                      fontSize:11,fontFamily:"inherit",flexShrink:0,
                      background:eqOk?"#0f2a0f":"#e67e22",
                      border:`1px solid ${eqOk?GREEN:"#e67e22"}`,
                      color:eqOk?GREEN:"#000"}}
                      onClick={async()=>{
                        await API.setEquiposR32(p.id,localMostrar,visMostrar);
                        setGuardadoOk(prev=>({...prev,["eq_"+p.id]:true}));
                        setTimeout(()=>setGuardadoOk(prev=>({...prev,["eq_"+p.id]:false})),2000);
                      }}>
                      {eqOk?"✓":"💾 Equipos"}
                    </button>
                  </div>
                  {/* Resultado */}
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span style={{flex:"1 1 80px",fontSize:11,color:MUTED}}>{FLAG[localMostrar]||"⚽"} {localMostrar}</span>
                    <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                      <input style={{...S.inpGol(false),fontSize:16}} type="text" inputMode="numeric"
                        maxLength={2} value={rl.l} placeholder="-"
                        onChange={e=>setResLocal(prev=>({...prev,[p.id]:{...(prev[p.id]||{l:"",v:""}),l:e.target.value.replace(/[^0-9]/g,"")}}))}
                        onKeyDown={e=>{if(e.key==="Enter")guardarPartido(p.id);}}/>
                      <span style={{color:MUTED}}>-</span>
                      <input style={{...S.inpGol(false),fontSize:16}} type="text" inputMode="numeric"
                        maxLength={2} value={rl.v} placeholder="-"
                        onChange={e=>setResLocal(prev=>({...prev,[p.id]:{...(prev[p.id]||{l:"",v:""}),v:e.target.value.replace(/[^0-9]/g,"")}}))}
                        onKeyDown={e=>{if(e.key==="Enter")guardarPartido(p.id);}}/>
                    </div>
                    <span style={{flex:"1 1 80px",fontSize:11,color:MUTED,textAlign:"right"}}>{visMostrar} {FLAG[visMostrar]||"⚽"}</span>
                    <button disabled={!listo||cP} onClick={()=>guardarPartido(p.id)}
                      style={{padding:"5px 9px",borderRadius:7,cursor:listo&&!cP?"pointer":"default",
                        fontWeight:800,fontSize:11,fontFamily:"inherit",flexShrink:0,
                        background:gok?"#0f2a0f":listo&&!sinC?"#e67e22":"#1a1a2a",
                        border:`1px solid ${gok?GREEN:listo&&!sinC?"#e67e22":"#333"}`,
                        color:gok?GREEN:listo&&!sinC?"#000":"#444"}}>
                      {cP?"⏳":gok?"✓":"💾"}
                    </button>
                  </div>
                </div>
              );
            })}
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
