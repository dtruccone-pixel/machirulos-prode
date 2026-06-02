import { useState, useEffect, useCallback, useRef } from "react";
import { PARTIDOS, GRUPOS_KEYS, FLAG, calcPts } from "./datos";
import * as API from "./api";

// ── COLORES ───────────────────────────────────────────────────────
const BG="#07070d", CARD="#0e0e1a", BDR="#1a1a2c";
const GOLD="#f0c040", GREEN="#27ae60", BLUE="#2980b9", RED="#c0392b", MUTED="#4a4a68", TEXT="#e8e8f2";

// ── ESTILOS ───────────────────────────────────────────────────────
const S = {
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
    borderRadius:6,color:dis?"#333":TEXT,fontSize:18,fontWeight:700,fontFamily:"inherit"}),
  btn:(bg,col="#000",brd="none",ex={})=>({padding:"10px 18px",background:bg,border:brd,
    borderRadius:8,color:col,fontWeight:800,fontSize:13,letterSpacing:1,
    textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",...ex}),
  tab:(on)=>({padding:"5px 12px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:12,
    letterSpacing:1,fontFamily:"inherit",textTransform:"uppercase",
    background:on?GOLD:"#0b0b18",border:on?`1px solid ${GOLD}`:`1px solid ${BDR}`,
    color:on?"#000":MUTED}),
  ftab:(on)=>({flex:1,padding:"10px 6px",borderRadius:8,cursor:"pointer",fontWeight:800,
    fontSize:14,letterSpacing:1,fontFamily:"inherit",textTransform:"uppercase",textAlign:"center",
    background:on?`linear-gradient(135deg,${GOLD},#b88000)`:"#0b0b18",
    border:on?`1px solid ${GOLD}`:`1px solid ${BDR}`,color:on?"#000":MUTED}),
};

// ── HEADER ────────────────────────────────────────────────────────
function Header({sub,sync}) {
  return (
    <div style={{width:"100%",maxWidth:700,padding:"20px 0 8px",
      display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <span style={{fontSize:10,fontWeight:700,letterSpacing:3,color:GOLD,
        textTransform:"uppercase",opacity:.7}}>⚽ Mundial 2026 · Fase de Grupos</span>
      <h1 style={{fontSize:"clamp(36px,10vw,72px)",fontWeight:900,margin:0,
        textTransform:"uppercase",letterSpacing:6,lineHeight:1,
        background:`linear-gradient(90deg,${GOLD} 0%,#fff8e0 45%,${GOLD} 100%)`,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Los Machirulos</h1>
      {sub&&<p style={{color:MUTED,fontSize:12,margin:0,letterSpacing:2,textTransform:"uppercase"}}>{sub}</p>}
      {sync&&<p style={{color:"#252535",fontSize:10,margin:"2px 0 0"}}>🔄 {sync.toLocaleTimeString("es-AR")}</p>}
    </div>
  );
}

// ── AVATAR ────────────────────────────────────────────────────────
function Avatar({jugador, size=40}) {
  const url = jugador?.fotoUrl;
  return url
    ? <img src={url} alt={jugador.nombre} style={{width:size,height:size,borderRadius:"50%",
        objectFit:"cover",border:`2px solid ${GOLD}`,flexShrink:0}}
        onError={e=>{e.target.style.display="none"}}/>
    : <div style={{width:size,height:size,borderRadius:"50%",background:"#1a1a2c",
        border:`2px solid ${BDR}`,display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:size*0.4,flexShrink:0}}>👤</div>;
}

// ── UTILIDADES ────────────────────────────────────────────────────
const FECHAS=[1,2,3];

function calcTablaFecha(jugadoresData, pronosticos, resultados, fecha) {
  return jugadoresData.map(j=>{
    let pts=0,ex=0,gn=0,fa=0,jugados=0;
    PARTIDOS.filter(p=>p.f===fecha).forEach(p=>{
      const res=resultados[p.id], pr=pronosticos[j.nombre]?.[p.id];
      if(!pr||pr.l===""||pr.v===""||!res||res.l===""||res.v==="")return;
      const n=calcPts(pr,res); if(n===null)return;
      pts+=n; jugados++; if(n===3)ex++; else if(n===2)gn++; else fa++;
    });
    return {jugador:j,pts,ex,gn,fa,jugados};
  }).sort((a,b)=>b.pts-a.pts||b.ex-a.ex);
}

function calcTablaGeneral(jugadoresData, pronosticos, resultados) {
  return jugadoresData.map(j=>{
    let pts=0,ex=0,gn=0,fa=0,jugados=0;
    PARTIDOS.forEach(p=>{
      const res=resultados[p.id], pr=pronosticos[j.nombre]?.[p.id];
      if(!pr||pr.l===""||pr.v===""||!res||res.l===""||res.v==="")return;
      const n=calcPts(pr,res); if(n===null)return;
      pts+=n; jugados++; if(n===3)ex++; else if(n===2)gn++; else fa++;
    });
    return {jugador:j,pts,ex,gn,fa,jugados};
  }).sort((a,b)=>b.pts-a.pts||b.ex-a.ex);
}

function fechaCompleta(resultados, fecha) {
  const ps = PARTIDOS.filter(p=>p.f===fecha);
  return ps.length>0 && ps.every(p=>{const r=resultados[p.id];return r&&r.l!==""&&r.v!=="";});
}

// ── PANTALLA GANADOR DE FECHA ─────────────────────────────────────
function GanadorFecha({jugador, fecha, onClose}) {
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:1000,
      background:"rgba(0,0,0,0.95)",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:20,
      animation:"fadeIn .5s ease"}}>
      <div style={{textAlign:"center"}}>
        <p style={{color:GOLD,fontSize:13,letterSpacing:4,textTransform:"uppercase",
          fontFamily:"'Barlow Condensed',sans-serif",margin:"0 0 20px",opacity:.8}}>
          ⚽ Fecha {fecha} · Terminada
        </p>
        {jugador?.fotoUrl
          ? <img src={jugador.fotoUrl} alt={jugador.nombre}
              style={{width:200,height:200,borderRadius:"50%",objectFit:"cover",
                border:`6px solid ${GOLD}`,marginBottom:24,
                boxShadow:`0 0 60px ${GOLD}88`}}/>
          : <div style={{width:200,height:200,borderRadius:"50%",background:"#1a1a2c",
              border:`6px solid ${GOLD}`,marginBottom:24,display:"flex",
              alignItems:"center",justifyContent:"center",fontSize:80,
              boxShadow:`0 0 60px ${GOLD}88`}}>👤</div>
        }
        <h1 style={{fontSize:"clamp(40px,10vw,80px)",fontWeight:900,margin:"0 0 8px",
          textTransform:"uppercase",letterSpacing:4,
          background:`linear-gradient(90deg,${GOLD},#fff,${GOLD})`,
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          fontFamily:"'Barlow Condensed',sans-serif"}}>
          {jugador?.nombre}
        </h1>
        <p style={{fontSize:"clamp(20px,5vw,36px)",color:GOLD,fontWeight:900,
          fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:3,
          textTransform:"uppercase",margin:"0 0 32px"}}>
          🏆 Ganador de la Fecha {fecha}
        </p>
        <button style={{...S.btn(`linear-gradient(90deg,${GOLD},#b88000)`),fontSize:14,padding:"12px 30px"}}
          onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

// ── TABLA COMPACTA ────────────────────────────────────────────────
function TablaCompacta({data, titulo, maxPts}) {
  return (
    <div style={S.card}>
      <p style={S.sTitle}>{titulo}</p>
      {data.length===0
        ? <p style={{color:MUTED,fontSize:13}}>Sin puntos todavía</p>
        : data.map((j,i)=>{
            const pct = maxPts>0?(j.pts/maxPts)*100:0;
            const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
            const bc = i===0?GOLD:i===1?"#aaa":i===2?"#cd7f32":"transparent";
            return (
              <div key={j.jugador.nombre} style={{
                display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                borderRadius:10,marginBottom:6,position:"relative",overflow:"hidden",
                background:i===0?"#1a1200":i===1?"#0e0e18":i===2?"#110d00":"#0b0b14",
                borderLeft:`4px solid ${bc}`,
              }}>
                <div style={{position:"absolute",top:0,left:0,height:"100%",
                  width:`${pct}%`,opacity:.06,pointerEvents:"none",
                  background:i===0?GOLD:BLUE}}/>
                <span style={{width:28,textAlign:"center",fontWeight:900,fontSize:18,
                  color:i===0?GOLD:i===1?"#c0c0c0":i===2?"#cd7f32":MUTED,flexShrink:0}}>
                  {medal??i+1}
                </span>
                <Avatar jugador={j.jugador} size={34}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:15}}>{j.jugador.nombre}</div>
                  <div style={{fontSize:10,color:MUTED}}>
                    🎯{j.ex} · ✅{j.gn} · ❌{j.fa}
                  </div>
                </div>
                <div style={{fontWeight:900,fontSize:22,color:i===0?GOLD:"#fff",
                  textShadow:i===0?`0 0 20px ${GOLD}44`:"none"}}>
                  {j.pts}<span style={{fontSize:11,color:MUTED,marginLeft:2}}>pts</span>
                </div>
              </div>
            );
          })
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [scr,setScr]           = useState("loading");
  const [jugadoresData,setJD]  = useState([]); // [{nombre,dni,fotoUrl}]
  const [resultados,setR]      = useState({});
  const [pronosticos,setP]     = useState({});
  const [jugador,setJugador]   = useState(null); // objeto completo
  const [grupo,setGrupo]       = useState("A");
  const [fecha,setFecha]       = useState(1);
  const [sync,setSync]         = useState(null);
  const [ganadorFecha,setGF]   = useState(null); // {jugador, fecha}
  const [tabFecha,setTabFecha] = useState(1);

  // Admin
  const [nombreN,setNN]        = useState("");
  const [dniN,setDniN]         = useState("");
  const [passIn,setPI]         = useState("");
  const [passErr,setPE]        = useState(false);
  const [newPass,setNP]        = useState("");
  const [fotoSubiendo,setFS]   = useState(null);

  // Login
  const [dniInput,setDniInput] = useState("");
  const [dniErr,setDniErr]     = useState(false);
  const [jugadorLogin,setJL]   = useState(null); // nombre seleccionado

  const prevResultados = useRef({});

  const cargarTodo = useCallback(async()=>{
    const d = await API.getAll();
    if(!d) return;
    setJD(d.jugadores||[]);
    setR(prev=>{
      // detectar si se completó alguna fecha
      const nuevo = d.resultados||{};
      [1,2,3].forEach(f=>{
        const yaCompleta = fechaCompleta(prev,f);
        const ahoraCompleta = fechaCompleta(nuevo,f);
        if(!yaCompleta && ahoraCompleta) {
          // calcular ganador de esa fecha
          // se setea después de actualizar estado
          setTimeout(()=>{
            setGF({fecha:f});
          },100);
        }
      });
      return nuevo;
    });
    setP(d.pronosticos||{});
    setSync(new Date());
  },[]);

  useEffect(()=>{
    (async()=>{ await cargarTodo(); setScr("inicio"); })();
  },[cargarTodo]);

  useEffect(()=>{
    if(scr==="loading")return;
    const t=setInterval(cargarTodo,25000);
    return()=>clearInterval(t);
  },[scr,cargarTodo]);

  // Cuando hay ganadorFecha pendiente, calcularlo con datos actuales
  useEffect(()=>{
    if(!ganadorFecha||ganadorFecha.jugador)return;
    if(jugadoresData.length===0)return;
    const tabla = calcTablaFecha(jugadoresData,pronosticos,resultados,ganadorFecha.fecha);
    if(tabla.length>0) setGF({...ganadorFecha, jugador:tabla[0].jugador});
  },[ganadorFecha,jugadoresData,pronosticos,resultados]);

  // ── GUARDAR HELPERS ──
  const saveR = async v=>{setR(v);await API.setResultado(...Object.entries(v).pop()||[]);};
  const saveP = async v=>{setP(v);};

  // ── TABLA GENERAL ──
  const tablaGeneral = calcTablaGeneral(jugadoresData,pronosticos,resultados);
  const tablaFechaActual = calcTablaFecha(jugadoresData,pronosticos,resultados,tabFecha);

  // ══════════════════════════════════════════════════════════════════
  if(scr==="loading") return(
    <div style={{...S.root,justifyContent:"center",alignItems:"center"}}>
      <div style={{fontSize:64}}>⚽</div>
      <p style={{color:GOLD,letterSpacing:3,fontSize:13,textTransform:"uppercase",marginTop:16}}>Conectando…</p>
    </div>
  );

  // ── GANADOR OVERLAY ──
  if(ganadorFecha?.jugador) return(
    <GanadorFecha jugador={ganadorFecha.jugador} fecha={ganadorFecha.fecha}
      onClose={()=>setGF(null)}/>
  );

  // ══════════════════════════════════════════════════════════════════
  // INICIO
  if(scr==="inicio") return(
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
        <button style={S.btn(`linear-gradient(90deg,${GOLD},#b88000)`)}
          onClick={()=>setScr("elegir")}>⚽ Ingresar mis pronósticos</button>
        <button style={S.btn("transparent",GOLD,`2px solid ${GOLD}`)}
          onClick={()=>setScr("tabla")}>🏅 Tabla de posiciones</button>
        <button style={S.btn("#0d0d18","#666","1px solid #222")}
          onClick={()=>setScr("passAdmin")}>🔐 Panel de administración</button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  // ELEGIR JUGADOR (paso 1)
  if(scr==="elegir") return(
    <div style={S.root}>
      <Header sub="¿Quién sos?" sync={sync}/>
      <div style={S.wrap}>
        <div style={S.card}>
          {jugadoresData.length===0
            ? <p style={{color:MUTED,textAlign:"center",padding:"20px 0"}}>
                El admin tiene que agregar los jugadores primero.
              </p>
            : <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {jugadoresData.map(j=>{
                  const mp=pronosticos[j.nombre]||{};
                  const pts=PARTIDOS.reduce((a,p)=>{
                    const res=resultados[p.id],pr=mp[p.id];
                    if(!pr||!res||res.l===""||res.v==="")return a;
                    return a+(calcPts(pr,res)??0);
                  },0);
                  return(
                    <button key={j.nombre} style={{
                      ...S.btn("#0d0d18","#fff","1px solid "+BDR),
                      textAlign:"left",fontSize:17,padding:"12px 16px",
                      display:"flex",alignItems:"center",gap:12,
                    }} onClick={()=>{setJL(j);setDniInput("");setDniErr(false);setScr("login");}}>
                      <Avatar jugador={j} size={44}/>
                      <span style={{flex:1}}>{j.nombre}</span>
                      <span style={{fontSize:12,color:MUTED}}>
                        <span style={{color:GOLD,fontWeight:700}}>{pts}pts</span>
                      </span>
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

  // ══════════════════════════════════════════════════════════════════
  // LOGIN DNI
  if(scr==="login") return(
    <div style={S.root}>
      <Header sync={sync}/>
      <div style={S.wrap}>
        <div style={S.card}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <Avatar jugador={jugadorLogin} size={60}/>
            <div>
              <p style={{...S.sTitle,margin:0}}>Verificación de identidad</p>
              <p style={{fontSize:20,fontWeight:800,margin:"4px 0 0"}}>{jugadorLogin?.nombre}</p>
            </div>
          </div>
          <p style={{color:MUTED,fontSize:13,margin:"0 0 12px"}}>Ingresá tu DNI para confirmar tu identidad</p>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <input style={{...S.inp(),flex:1}} type="number" placeholder="Número de DNI"
              value={dniInput} onChange={e=>{setDniInput(e.target.value);setDniErr(false);}}
              onKeyDown={async e=>{
                if(e.key!=="Enter")return;
                const r=await API.checkDni(jugadorLogin.nombre,dniInput);
                if(r?.valid){setJugador(jugadorLogin);setGrupo("A");setFecha(1);setScr("jugador");}
                else setDniErr(true);
              }}
            />
            <button style={S.btn(GOLD)} onClick={async()=>{
              const r=await API.checkDni(jugadorLogin.nombre,dniInput);
              if(r?.valid){setJugador(jugadorLogin);setGrupo("A");setFecha(1);setScr("jugador");}
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

  // ══════════════════════════════════════════════════════════════════
  // JUGADOR
  if(scr==="jugador") {
    const mp=pronosticos[jugador.nombre]||{};
    const totalPts=PARTIDOS.reduce((a,p)=>{
      const res=resultados[p.id],pr=mp[p.id];
      if(!pr||!res||res.l===""||res.v==="")return a;
      return a+(calcPts(pr,res)??0);
    },0);
    const comp=PARTIDOS.filter(p=>{const pr=mp[p.id];return pr&&pr.l!==""&&pr.v!=="";}).length;
    const partidos=PARTIDOS.filter(p=>p.g===grupo&&p.f===fecha);

    async function setPron(pid,campo,val){
      const nuevo={...pronosticos,[jugador.nombre]:{
        ...(pronosticos[jugador.nombre]||{}),
        [pid]:{...(pronosticos[jugador.nombre]?.[pid]||{l:"",v:""}), [campo]:val},
      }};
      setP(nuevo);
      const pr=nuevo[jugador.nombre][pid];
      await API.setPronostico(jugador.nombre,pid,pr.l||"",pr.v||"");
    }

    return(
      <div style={S.root}>
        <Header sync={sync}/>
        <div style={S.wrap}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar jugador={jugador} size={48}/>
              <div>
                <div style={{fontSize:20,fontWeight:900}}>{jugador.nombre}</div>
                <div style={{fontSize:12,color:MUTED}}>
                  <span style={{color:GOLD,fontWeight:700}}>{totalPts} pts</span>
                  {" · "}{comp}/72 cargados
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:7}}>
              <button style={S.btn("transparent",GOLD,"1px solid "+GOLD)}
                onClick={()=>setScr("tabla")}>🏅 Tabla</button>
              <button style={S.btn("transparent",MUTED,"1px solid #222")}
                onClick={()=>setScr("inicio")}>← Salir</button>
            </div>
          </div>

          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {GRUPOS_KEYS.map(g=>{
              const done=PARTIDOS.filter(p=>p.g===g).every(p=>{const pr=mp[p.id];return pr&&pr.l!==""&&pr.v!=="";});
              return <button key={g} style={{...S.tab(grupo===g),
                ...(done&&grupo!==g?{borderColor:"#2a4a2a",color:"#3aaa3a"}:{})}}
                onClick={()=>setGrupo(g)}>{g}{done?" ✓":""}</button>;
            })}
          </div>

          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {FECHAS.map(f=>{
              const ps=PARTIDOS.filter(p=>p.g===grupo&&p.f===f);
              const done=ps.every(p=>{const pr=mp[p.id];return pr&&pr.l!==""&&pr.v!=="";});
              return(
                <button key={f} style={S.ftab(fecha===f)} onClick={()=>setFecha(f)}>
                  <div>FECHA {f}</div>
                  <div style={{fontSize:10,fontWeight:400,opacity:.7,marginTop:2}}>{ps[0]?.fecha||""}</div>
                  {done&&<div style={{fontSize:10,color:fecha===f?"#333":GREEN}}>✓</div>}
                </button>
              );
            })}
          </div>

          {partidos.map(p=>{
            const pron=mp[p.id]||{l:"",v:""};
            const res=resultados[p.id];
            const hRes=res&&res.l!==""&&res.v!=="";
            const pts=hRes?calcPts(pron,res):null;
            const ptC=pts===3?GREEN:pts===2?BLUE:pts===0?RED:MUTED;
            const bg=pts===3?"#091a0c":pts===2?"#091220":pts===0?"#180909":CARD;
            const bc=pts===3?GREEN:pts===2?BLUE:pts===0?"#601010":BDR;
            return(
              <div key={p.id} style={{background:bg,borderRadius:12,marginBottom:10,
                padding:14,border:`2px solid ${bc}`}}>
                <div style={{fontSize:10,color:MUTED,marginBottom:10,letterSpacing:1}}>
                  📅 {p.fecha} · 📍 {p.sede} · Grupo {p.g}
                  {hRes&&<span style={{marginLeft:8,color:"#2a2a4a"}}>· JUGADO</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <div style={{flex:"1 1 110px",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:22}}>{FLAG[p.local]||"🏳️"}</span>
                    <span style={{fontSize:15,fontWeight:600}}>{p.local}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    <input style={S.inpGol(hRes)} type="number" min="0" max="20"
                      value={pron.l} placeholder="-" disabled={hRes}
                      onChange={e=>setPron(p.id,"l",e.target.value)}/>
                    <span style={{color:MUTED,fontWeight:700,fontSize:20}}>—</span>
                    <input style={S.inpGol(hRes)} type="number" min="0" max="20"
                      value={pron.v} placeholder="-" disabled={hRes}
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
                        <div style={{fontSize:11,color:MUTED,textTransform:"uppercase"}}>Tu pronóstico</div>
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
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // TABLA
  if(scr==="tabla") {
    const jugados=PARTIDOS.filter(p=>{const r=resultados[p.id];return r&&r.l!==""&&r.v!=="";}).length;
    const maxG=tablaGeneral[0]?.pts??0;
    const maxF=tablaFechaActual[0]?.pts??0;

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

          {/* Tabla general */}
          <TablaCompacta data={tablaGeneral} titulo="🏆 Tabla General" maxPts={maxG}/>

          {/* Tabla por fecha */}
          <div style={S.card}>
            <p style={S.sTitle}>📅 Tabla por Fecha</p>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {FECHAS.map(f=>(
                <button key={f} style={S.ftab(tabFecha===f)} onClick={()=>setTabFecha(f)}>
                  FECHA {f}
                  {fechaCompleta(resultados,f)&&<div style={{fontSize:10,color:tabFecha===f?"#333":GREEN}}>✓</div>}
                </button>
              ))}
            </div>
            {tablaFechaActual.length===0
              ? <p style={{color:MUTED,fontSize:13}}>Sin puntos en esta fecha todavía</p>
              : tablaFechaActual.map((j,i)=>{
                  const pct=maxF>0?(j.pts/maxF)*100:0;
                  const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
                  const bc=i===0?GOLD:i===1?"#aaa":i===2?"#cd7f32":"transparent";
                  return(
                    <div key={j.jugador.nombre} style={{display:"flex",alignItems:"center",gap:10,
                      padding:"10px 12px",borderRadius:10,marginBottom:6,
                      position:"relative",overflow:"hidden",
                      background:i===0?"#1a1200":i===1?"#0e0e18":i===2?"#110d00":"#0b0b14",
                      borderLeft:`4px solid ${bc}`}}>
                      <div style={{position:"absolute",top:0,left:0,height:"100%",
                        width:`${pct}%`,opacity:.06,pointerEvents:"none",background:GOLD}}/>
                      <span style={{width:28,textAlign:"center",fontWeight:900,fontSize:18,
                        color:i===0?GOLD:i===1?"#c0c0c0":i===2?"#cd7f32":MUTED,flexShrink:0}}>
                        {medal??i+1}
                      </span>
                      <Avatar jugador={j.jugador} size={34}/>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:800,fontSize:15}}>{j.jugador.nombre}</div>
                        <div style={{fontSize:10,color:MUTED}}>🎯{j.ex} · ✅{j.gn} · ❌{j.fa}</div>
                      </div>
                      <div style={{fontWeight:900,fontSize:22,color:i===0?GOLD:"#fff"}}>
                        {j.pts}<span style={{fontSize:11,color:MUTED,marginLeft:2}}>pts</span>
                      </div>
                    </div>
                  );
                })
            }
          </div>

          <div style={{display:"flex",gap:20,justifyContent:"center",
            color:"#2a2a4a",fontSize:12,marginTop:8,flexWrap:"wrap"}}>
            <span>🎯 Exacto = 3 pts</span><span>✅ Ganador = 2 pts</span><span>❌ Error = 0 pts</span>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // PASS ADMIN
  if(scr==="passAdmin") return(
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
                if(r?.valid){setPI("");setPE(false);setScr("admin");}else setPE(true);}}
            />
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

  // ══════════════════════════════════════════════════════════════════
  // ADMIN
  if(scr==="admin") {
    const partidos=PARTIDOS.filter(p=>p.g===grupo&&p.f===fecha);
    const cargados=PARTIDOS.filter(p=>{const r=resultados[p.id];return r&&r.l!==""&&r.v!=="";}).length;

    async function updRes(pid,campo,val){
      const nuevo={...resultados,[pid]:{...(resultados[pid]||{l:"",v:""}), [campo]:val}};
      setR(nuevo);
      const r=nuevo[pid];
      await API.setResultado(pid,r.l||"",r.v||"");
    }

    async function addJugador(){
      const n=nombreN.trim(), d=dniN.trim();
      if(!n||jugadoresData.find(x=>x.nombre===n))return;
      const nuevos=[...jugadoresData,{nombre:n,dni:d,fotoUrl:""}];
      setJD(nuevos);
      await API.setJugadores(nuevos);
      setNN(""); setDniN("");
    }

    async function delJugador(nombre){
      if(!confirm(`¿Eliminar a ${nombre}?`))return;
      const nuevos=jugadoresData.filter(x=>x.nombre!==nombre);
      setJD(nuevos);
      await API.setJugadores(nuevos);
      const np={...pronosticos}; delete np[nombre]; setP(np);
    }

    async function handleFoto(nombre, file){
      if(!file)return;
      setFS(nombre);
      const r=await API.subirFoto(nombre,file);
      if(r?.ok&&r.url){
        const nuevos=jugadoresData.map(j=>j.nombre===nombre?{...j,fotoUrl:r.url}:j);
        setJD(nuevos);
        await API.setJugadores(nuevos);
      }
      setFS(null);
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
            <p style={S.sTitle}>👥 Jugadores ({jugadoresData.length})</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {jugadoresData.map(j=>(
                <div key={j.nombre} style={{display:"flex",alignItems:"center",gap:10,
                  padding:"10px 12px",background:"#0b0b18",
                  border:`1px solid ${BDR}`,borderRadius:10,flexWrap:"wrap"}}>
                  <Avatar jugador={j} size={44}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15}}>{j.nombre}</div>
                    <div style={{fontSize:11,color:MUTED}}>DNI: {j.dni||"—"}</div>
                  </div>
                  {/* Subir foto */}
                  <label style={{cursor:"pointer"}}>
                    <input type="file" accept="image/*" style={{display:"none"}}
                      onChange={e=>handleFoto(j.nombre,e.target.files[0])}/>
                    <span style={{...S.btn("#1a1a2a","#aaa","1px solid #333",{fontSize:12,padding:"6px 12px"})}}>
                      {fotoSubiendo===j.nombre?"⏳":"📷 Foto"}
                    </span>
                  </label>
                  <button onClick={()=>delJugador(j.nombre)}
                    style={{...S.btn("#3a0808",RED,"1px solid #601010",{padding:"6px 12px",fontSize:12})}}>
                    Eliminar
                  </button>
                </div>
              ))}
              {jugadoresData.length===0&&<span style={{color:MUTED,fontSize:13}}>Sin jugadores aún</span>}
            </div>
            {/* Agregar jugador */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <input style={{...S.inp(),flex:"2 1 140px"}} placeholder="Nombre"
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
                const done=PARTIDOS.filter(p=>p.g===g).every(p=>{
                  const r=resultados[p.id];return r&&r.l!==""&&r.v!=="";});
                return <button key={g} style={{...S.tab(grupo===g),
                  ...(done&&grupo!==g?{borderColor:"#2a4a2a",color:"#3aaa3a"}:{})}}
                  onClick={()=>setGrupo(g)}>{g}{done?" ✓":""}</button>;
              })}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {FECHAS.map(f=>{
                const ps=PARTIDOS.filter(p=>p.g===grupo&&p.f===f);
                const done=ps.every(p=>{const r=resultados[p.id];return r&&r.l!==""&&r.v!=="";});
                return(
                  <button key={f} style={S.ftab(fecha===f)} onClick={()=>setFecha(f)}>
                    <div>FECHA {f}</div>
                    <div style={{fontSize:10,fontWeight:400,opacity:.7,marginTop:2}}>{ps[0]?.fecha||""}</div>
                    {done&&<div style={{fontSize:10,color:fecha===f?"#333":GREEN}}>✓</div>}
                  </button>
                );
              })}
            </div>
            {partidos.map(p=>{
              const res=resultados[p.id]||{l:"",v:""};
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
