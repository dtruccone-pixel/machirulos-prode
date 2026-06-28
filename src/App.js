import { useState, useEffect, useCallback } from "react";
import { FLAG, calcPts, FASES_KO, getPartidosKO } from "./datos";
import * as API from "./api";

// ── PALETA ──────────────────────────────────────────────────────
const BG="#07070d",CARD="#0e0e1a",BDR="#1a1a2c";
const GOLD="#f0c040",GREEN="#27ae60",BLUE="#2980b9",RED="#c0392b",MUTED="#4a4a68",TEXT="#e8e8f2";




function estaBloquadaFase(faseId,enviosFase,nombre,desbloqueos){
  const key=nombre+":fase:"+faseId;
  if(desbloqueos?.[key])return false;
  return enviosFase?.[key]===true;
}



function calcTablaFase(jds,prons,ress,faseId,equiposPartidos){
  const ps=getPartidosKO(faseId,equiposPartidos);
  return jds.map(j=>{
    let pts=0,ex=0,gn=0,fa=0;
    ps.forEach(p=>{
      const res=ress[p.id],pr=prons[j.nombre]?.[p.id];
      if(!pr||pr.l===""||pr.v===""||!res||res.l===""||res.v==="")return;
      const n=calcPts(pr,res);if(n===null)return;
      pts+=n;if(n===3)ex++;else if(n===2)gn++;else fa++;
    });
    return{jugador:j,pts,ex,gn,fa};
  }).sort((a,b)=>b.pts-a.pts||b.ex-a.ex);
}

function calcTablaGeneral(jds,prons,ress,equiposPartidos){
  return jds.map(j=>{
    let pts=0,ex=0,gn=0,fa=0;
    FASES_KO.forEach(f=>{
      getPartidosKO(f.id,equiposPartidos).forEach(p=>{
        const res=ress[p.id],pr=prons[j.nombre]?.[p.id];
        if(!pr||pr.l===""||pr.v===""||!res||res.l===""||res.v==="")return;
        const n=calcPts(pr,res);if(n===null)return;
        pts+=n;if(n===3)ex++;else if(n===2)gn++;else fa++;
      });
    });
    return{jugador:j,pts,ex,gn,fa};
  }).sort((a,b)=>b.pts-a.pts||b.ex-a.ex);
}


// ── COMPONENTES ─────────────────────────────────────────────────
function Avatar({j,size=40}){
  if(!j)return null;
  return j.fotoUrl
    ?<img src={j.fotoUrl} alt={j.nombre} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:`2px solid ${GOLD}`,flexShrink:0}}/>
    :<div style={{width:size,height:size,borderRadius:"50%",background:"#1a1a2c",border:`2px solid ${BDR}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.42,flexShrink:0}}>👤</div>;
}

function Header({sub,sync}){
  return(
    <div style={{width:"100%",maxWidth:700,padding:"18px 0 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <span style={{fontSize:10,fontWeight:700,letterSpacing:3,color:GOLD,textTransform:"uppercase",opacity:.7}}>⚽ Mundial 2026</span>
      <h1 style={{fontSize:"clamp(34px,9vw,68px)",fontWeight:900,margin:0,textTransform:"uppercase",letterSpacing:5,lineHeight:1,
        background:`linear-gradient(90deg,${GOLD} 0%,#fff8e0 45%,${GOLD} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
        Los Machirulos
      </h1>
      {sub&&<p style={{color:MUTED,fontSize:12,margin:0,letterSpacing:2,textTransform:"uppercase"}}>{sub}</p>}
      {sync&&<p style={{color:"#252535",fontSize:10,margin:"2px 0 0"}}>🔄 {sync.toLocaleTimeString("es-AR")}</p>}
    </div>
  );
}

const S={
  root:{minHeight:"100vh",background:`linear-gradient(160deg,#120a00 0%,${BG} 40%,#000a12 100%)`,
    fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",color:TEXT,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 10px 60px"},
  wrap:{width:"100%",maxWidth:700},
  card:{background:CARD,border:`1px solid ${BDR}`,borderRadius:13,padding:"16px 14px",marginBottom:10},
  sTitle:{margin:"0 0 12px",fontSize:11,fontWeight:700,color:GOLD,letterSpacing:3,textTransform:"uppercase"},
  inp:(ex={})=>({background:"#06060f",border:`1px solid ${BDR}`,borderRadius:7,color:TEXT,outline:"none",padding:"10px 13px",fontSize:15,fontFamily:"inherit",...ex}),
  inpGol:(dis)=>({width:46,padding:"8px 2px",textAlign:"center",outline:"none",
    background:dis?"#040408":"#06060f",border:`1px solid ${dis?"#111":BDR}`,
    borderRadius:6,color:dis?"#444":TEXT,fontSize:18,fontWeight:700,fontFamily:"inherit",cursor:dis?"not-allowed":"text"}),
  btn:(bg,col="#000",brd="none",ex={})=>({padding:"10px 18px",background:bg,border:brd,borderRadius:8,color:col,
    fontWeight:800,fontSize:13,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",...ex}),
  tab:(on)=>({padding:"5px 12px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:12,letterSpacing:1,
    fontFamily:"inherit",textTransform:"uppercase",background:on?GOLD:"#0b0b18",
    border:on?`1px solid ${GOLD}`:`1px solid ${BDR}`,color:on?"#000":MUTED}),
  ftab:(on,done)=>({flex:1,padding:"10px 6px",borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:14,
    letterSpacing:1,fontFamily:"inherit",textTransform:"uppercase",textAlign:"center",
    background:on?`linear-gradient(135deg,${GOLD},#b88000)`:done?"#0f1a0f":"#0b0b18",
    border:on?`1px solid ${GOLD}`:done?`1px solid #2a4a2a`:`1px solid ${BDR}`,
    color:on?"#000":done?"#3aaa3a":MUTED}),
};

function TablaFila({item,pos,maxPts}){
  const medal=pos===0?"🥇":pos===1?"🥈":pos===2?"🥉":null;
  const bc=pos===0?GOLD:pos===1?"#aaa":pos===2?"#cd7f32":"transparent";
  const pct=maxPts>0?(item.pts/maxPts)*100:0;
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",borderRadius:10,marginBottom:6,
      position:"relative",overflow:"hidden",
      background:pos===0?"#1a1200":pos===1?"#0e0e18":pos===2?"#110d00":"#0b0b14",
      borderLeft:`4px solid ${bc}`}}>
      <div style={{position:"absolute",top:0,left:0,height:"100%",width:`${pct}%`,opacity:.06,pointerEvents:"none",background:pos===0?GOLD:BLUE}}/>
      <span style={{width:28,textAlign:"center",fontWeight:900,fontSize:18,flexShrink:0,color:pos===0?GOLD:pos===1?"#c0c0c0":pos===2?"#cd7f32":MUTED}}>
        {medal??pos+1}
      </span>
      <Avatar j={item.jugador} size={36}/>
      <div style={{flex:1}}>
        <div style={{fontWeight:800,fontSize:15}}>{item.jugador.nombre}</div>
        <div style={{fontSize:10,color:MUTED}}>🎯{item.ex} · ✅{item.gn} · ❌{item.fa}</div>
      </div>
      <div style={{fontWeight:900,fontSize:22,color:pos===0?GOLD:"#fff"}}>
        {item.pts}<span style={{fontSize:11,color:MUTED,marginLeft:2}}>pts</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════
export default function App(){
  const [scr,setScr]           = useState("loading");
  const [jds,setJds]           = useState([]);
  const [ress,setRess]         = useState({});
  const [prons,setProns]       = useState({});
  const [enviosFase,setEnviosFase] = useState({});  // bloqueos fases KO
  const [desbloqueos,setDesbloq]   = useState({});
  const [equiposPartidos,setEquiposPartidos] = useState({}); // equipos KO editables
  const [jugador,setJugador]   = useState(null);
  const [grupo,setGrupo]       = useState("A"); // solo para admin grupos
  const [fecha,setFecha]       = useState(1);   // solo para admin grupos
  const [nombreN,setNN]        = useState("");
  const [dniN,setDniN]         = useState("");
  const [confirmEnvio,setConfirmEnvio] = useState(null);
  const [resLocal,setResLocal] = useState({});
  const [guardando,setGuardando]   = useState({});
  const [guardadoOk,setGuardadoOk] = useState({});
  const [eqLocal,setEqLocal]   = useState({});
  const [faseKO,setFaseKO]     = useState("r32");
  const [sync,setSync]         = useState(null);
  const [tabFase,setTabFase]   = useState("general");
  const [verProns,setVerProns] = useState(false);
  const [enviando,setEnviando] = useState(false);
  const [confirmFase,setConfirmFase]   = useState(null);

  // Admin
  const [passIn,setPI]         = useState("");
  const [passErr,setPE]        = useState(false);
  const [newPass,setNP]        = useState("");
  const [fotoSub,setFotoSub]   = useState(null);
  const [fotoErr,setFotoErr]   = useState(null);
  const [jLogin,setJLogin]     = useState(null);
  const [dniInput,setDniInput] = useState("");
  const [dniErr,setDniErr]     = useState(false);

  // useEffect admin sync
  useEffect(()=>{
    if(scr!=="admin")return;
    const init={};
    getPartidosKO(faseKO,equiposPartidos).forEach(p=>{
      init[p.id]={l:ress[p.id]?.l||"",v:ress[p.id]?.v||""};
    });
    setResLocal(init);
    setGuardadoOk({});
  },[scr,faseKO,equiposPartidos]);

  const cargarTodo=useCallback(async()=>{
    const d=await API.getAll();
    if(!d)return;
    setJds(d.jugadores||[]);
    setRess(d.resultados||{});
    setProns(d.pronosticos||{});
    setEnvios(d.envios||{});
    setEnviosFase(d.enviosFase||{});
    setDesbloq(d.desbloqueos||{});
    setEquiposPartidos(d.equiposPartidos||{});
    setSync(new Date());
  },[]);

  useEffect(()=>{ (async()=>{await cargarTodo();setScr("inicio");})(); },[cargarTodo]);
  useEffect(()=>{
    if(scr==="loading")return;
    const t=setInterval(cargarTodo,25000);
    return()=>clearInterval(t);
  },[scr,cargarTodo]);

  async function guardarResultado(pid){
    const r=resLocal[pid]||{l:"",v:""};
    const lv=String(r.l).trim(),vv=String(r.v).trim();
    if(!lv||!vv)return;
    setGuardando(p=>({...p,[pid]:true}));
    await API.setResultado(pid,lv,vv);
    setRess(p=>({...p,[pid]:{l:lv,v:vv}}));
    setGuardando(p=>({...p,[pid]:false}));
    setGuardadoOk(p=>({...p,[pid]:true}));
    setTimeout(()=>setGuardadoOk(p=>({...p,[pid]:false})),2500);
  }

  // ── LOADING ──
  if(scr==="loading")return(
    <div style={{...S.root,justifyContent:"center",alignItems:"center"}}>
      <div style={{fontSize:64}}>⚽</div>
      <p style={{color:GOLD,letterSpacing:3,fontSize:13,textTransform:"uppercase",marginTop:16}}>Conectando…</p>
    </div>
  );

  // ── INICIO ──
  if(scr==="inicio")return(
    <div style={S.root}>
      <Header sub="Fase Eliminatoria" sync={sync}/>
      <div style={{...S.wrap,display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
        {/* Puntaje */}
        <div style={{...S.card,padding:0,overflow:"hidden",display:"flex"}}>
          {[{i:"🎯",p:"3 PTS",t:"Exacto",bg:"#09180e",bc:GREEN},
            {i:"✅",p:"2 PTS",t:"Ganador",bg:"#091220",bc:BLUE},
            {i:"❌",p:"0 PTS",t:"Error",bg:"#180909",bc:RED}].map(r=>(
            <div key={r.p} style={{flex:1,padding:"12px 6px",background:r.bg,textAlign:"center",borderTop:`3px solid ${r.bc}`}}>
              <div style={{fontSize:20}}>{r.i}</div>
              <div style={{fontSize:14,fontWeight:900,color:"#fff"}}>{r.p}</div>
              <div style={{fontSize:9,color:MUTED,textTransform:"uppercase"}}>{r.t}</div>
            </div>
          ))}
        </div>

        {/* Secciones KO */}
        {FASES_KO.map(f=>(
          <div key={f.id} style={{background:`linear-gradient(135deg,#1a0800,#0d0d00)`,border:`2px solid ${f.color}`,borderRadius:14,padding:"18px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <span style={{fontSize:28}}>{f.emoji}</span>
              <div>
                <p style={{...S.sTitle,margin:0,color:f.color}}>{f.label}</p>
                <p style={{fontSize:13,color:MUTED,margin:0}}>{f.partidos} partidos</p>
              </div>
            </div>
            <button style={S.btn(`linear-gradient(90deg,${f.color},${f.color}99)`,"#000","none",{width:"100%",padding:"13px"})}
              onClick={()=>{setFaseKO(f.id);setScr("faseKO");}}>
              {f.emoji} Ver {f.label}
            </button>
          </div>
        ))}

        {/* Tabla */}
        <div style={{background:"linear-gradient(135deg,#1a1200,#0d0d00)",border:`2px solid ${GOLD}`,borderRadius:14,padding:"18px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:28}}>🏅</span>
            <div>
              <p style={{...S.sTitle,margin:0,color:GOLD}}>Tabla de Posiciones</p>
              <p style={{fontSize:13,color:MUTED,margin:0}}>Acumulado de todas las fases</p>
            </div>
          </div>
          <button style={S.btn(`linear-gradient(90deg,${GOLD},#b88000)`,"#000","none",{width:"100%",padding:"13px"})}
            onClick={()=>setScr("tabla")}>🏅 Ver tabla completa</button>
        </div>

        <button style={S.btn("#0d0d18","#555","1px solid #222")}
          onClick={()=>setScr("passAdmin")}>🔐 Administracion</button>
      </div>
    </div>
  );

  // ── ELEGIR JUGADOR KO ──
  if(scr==="elegirKO")return(
    <div style={S.root}>
      <Header sub="Quien sos?" sync={sync}/>
      <div style={S.wrap}>
        <div style={S.card}>
          <p style={{color:MUTED,fontSize:13,margin:"0 0 14px"}}>Elegí tu nombre para cargar pronósticos</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {jds.map(j=>(
              <button key={j.nombre} style={{...S.btn("#0d0d18","#fff","1px solid "+BDR),
                textAlign:"left",padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}
                onClick={()=>{setJLogin(j);setDniInput("");setDniErr(false);setScr("loginKO");}}>
                <Avatar j={j} size={44}/>
                <span style={{fontSize:17,fontWeight:700}}>{j.nombre}</span>
              </button>
            ))}
          </div>
          <button style={{...S.btn("transparent",MUTED,"1px solid #222"),marginTop:14}}
            onClick={()=>setScr("inicio")}>← Volver</button>
        </div>
      </div>
    </div>
  );

  // ── LOGIN KO ──
  if(scr==="loginKO")return(
    <div style={S.root}>
      <Header sync={sync}/>
      <div style={S.wrap}>
        <div style={S.card}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <Avatar j={jLogin} size={60}/>
            <p style={{fontSize:22,fontWeight:800,margin:0}}>{jLogin?.nombre}</p>
          </div>
          <p style={{color:MUTED,fontSize:13,margin:"0 0 12px"}}>Ingresá tu DNI</p>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <input style={{...S.inp(),flex:1}} type="number" placeholder="Numero de DNI"
              value={dniInput} onChange={e=>{setDniInput(e.target.value);setDniErr(false);}}
              onKeyDown={async e=>{if(e.key!=="Enter")return;
                const r=await API.checkDni(jLogin.nombre,dniInput);
                if(r?.valid){setJugador(jLogin);setScr("faseKO");}else setDniErr(true);}}/>
            <button style={S.btn(GOLD)} onClick={async()=>{
              const r=await API.checkDni(jLogin.nombre,dniInput);
              if(r?.valid){setJugador(jLogin);setScr("faseKO");}else setDniErr(true);
            }}>Entrar</button>
          </div>
          {dniErr&&<p style={{color:RED,fontSize:12}}>DNI incorrecto</p>}
          <button style={{...S.btn("transparent",MUTED,"1px solid #222"),marginTop:8}}
            onClick={()=>setScr("elegirKO")}>← Volver</button>
        </div>
      </div>
    </div>
  );

  // ── FASE KO ──
  if(scr==="faseKO"){
    const fase=FASES_KO.find(f=>f.id===faseKO)||FASES_KO[0];
    const partidos=getPartidosKO(faseKO,equiposPartidos);
    const mp=jugador?(prons[jugador.nombre]||{}):{};
    const bloqueada=jugador?estaBloquadaFase(faseKO,enviosFase,jugador.nombre,desbloqueos):false;

    if(confirmFase){
      const comp=partidos.filter(p=>{const pr=mp[p.id];return pr&&pr.l!==""&&pr.v!=="";}).length;
      return(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:500,
          background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...S.card,maxWidth:400,width:"100%",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>{fase.emoji}</div>
            <h2 style={{margin:"0 0 8px",fontSize:22,color:fase.color}}>Enviar {fase.label}?</h2>
            <p style={{color:TEXT,fontSize:15,margin:"0 0 6px"}}>{comp}/{partidos.length} partidos cargados.</p>
            <p style={{color:RED,fontSize:13,margin:"0 0 20px"}}>Una vez enviado no podes modificar.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button style={S.btn(RED,"#fff","none",{padding:"12px 24px"})} disabled={enviando}
                onClick={async()=>{
                  setEnviando(true);
                  const r=await API.enviarFase(jugador.nombre,"fase:"+faseKO);
                  if(r?.ok)setEnviosFase(prev=>({...prev,[jugador.nombre+":fase:"+faseKO]:true}));
                  setEnviando(false);setConfirmFase(false);
                }}>{enviando?"Enviando…":"Si, enviar"}</button>
              <button style={S.btn("#1a1a2a","#ccc","1px solid #333",{padding:"12px 24px"})}
                onClick={()=>setConfirmFase(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      );
    }

    async function setPronKO(pid,campo,val){
      if(!jugador||bloqueada)return;
      const nuevo={...prons,[jugador.nombre]:{...(prons[jugador.nombre]||{}),[pid]:{...(prons[jugador.nombre]?.[pid]||{l:"",v:""}), [campo]:val}}};
      setProns(nuevo);
      const pr=nuevo[jugador.nombre][pid];
      await API.setPronostico(jugador.nombre,pid,faseKO,pr.l||"",pr.v||"");
    }

    const tablaFase=calcTablaFase(jds,prons,ress,faseKO,equiposPartidos);
    const maxFase=tablaFase[0]?.pts??0;
    const otrosJds=jugador?jds.filter(j=>j.nombre!==jugador.nombre):jds;

    return(
      <div style={S.root}>
        <Header sync={sync}/>
        <div style={S.wrap}>
          {/* Header fase */}
          <div style={{background:"linear-gradient(135deg,#1a0800,#0d0d00)",border:`2px solid ${fase.color}`,
            borderRadius:14,padding:"14px 16px",marginBottom:12,textAlign:"center"}}>
            <p style={{...S.sTitle,color:fase.color,margin:"0 0 4px"}}>{fase.emoji} {fase.label}</p>
            <p style={{fontSize:11,color:MUTED,margin:0}}>{partidos.length} partidos</p>
          </div>

          {/* Nav */}
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            <button style={S.btn("transparent",MUTED,"1px solid #222")} onClick={()=>setScr("inicio")}>← Volver</button>
            <button style={S.btn("#1a1a2a","#888","1px solid #333")} onClick={cargarTodo}>🔄</button>
            {FASES_KO.map(f=>(
              <button key={f.id} style={{...S.tab(faseKO===f.id),borderColor:faseKO===f.id?f.color:undefined,
                color:faseKO===f.id?f.color:MUTED}}
                onClick={()=>setFaseKO(f.id)}>
                {f.emoji}
              </button>
            ))}
          </div>



          {/* Banner envio */}
          {jugador&&(
            <div style={{padding:"10px 14px",borderRadius:10,marginBottom:12,
              background:bloqueada?"#0f1a0f":"#120a00",border:`1px solid ${bloqueada?GREEN:fase.color}`,
              display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <span style={{color:bloqueada?GREEN:fase.color,fontWeight:700,fontSize:14}}>
                {bloqueada?`🔒 ${fase.label} enviada`:`📤 Podes enviar cuando quieras`}
              </span>
              {!bloqueada&&(
                <button style={S.btn(`linear-gradient(90deg,${fase.color},${fase.color}99)`,"#000","none",{fontSize:13,padding:"9px 18px"})}
                  onClick={()=>setConfirmFase(true)}>📤 Enviar {fase.label}</button>
              )}
            </div>
          )}

          {/* Ver todos toggle */}
          {jugador&&(
            <div style={{marginBottom:10}}>
              <button style={S.btn(verProns?"transparent":"#1a1a2c",verProns?fase.color:TEXT,verProns?`1px solid ${fase.color}`:`1px solid ${BDR}`)}
                onClick={()=>setVerProns(v=>!v)}>
                {verProns?"📋 Mis pronos":"👥 Ver todos"}
              </button>
            </div>
          )}

          {/* Partidos KO */}
          {partidos.length===0&&(
            <div style={{...S.card,textAlign:"center",padding:24,color:MUTED}}>
              El admin todavia no cargo los equipos para esta fase.
            </div>
          )}

          {verProns&&jugador ? (
            partidos.map(p=>{
              if(!p.local&&!p.vis)return null;
              const res=ress[p.id];
              const hRes=res&&res.l!==""&&res.v!=="";
              return(
                <div key={p.id} style={{...S.card,marginBottom:10}}>
                  <div style={{fontSize:10,color:MUTED,marginBottom:8}}>
                    {p.fecha||""} · {p.local||"?"} vs {p.vis||"?"}
                    {hRes&&<span style={{color:GREEN,marginLeft:8}}>Real: {res.l}-{res.v}</span>}
                  </div>
                  {[jugador,...otrosJds].map(j=>{
                    const pr=prons[j.nombre]?.[p.id];
                    const tiene=pr&&pr.l!==""&&pr.v!=="";
                    const pts=hRes&&tiene?calcPts(pr,res):null;
                    const ptC=pts===3?GREEN:pts===2?BLUE:pts===0?RED:MUTED;
                    return(
                      <div key={j.nombre} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,marginBottom:5,
                        background:j.nombre===jugador.nombre?"#0d0d1a":"#090910",border:`1px solid ${j.nombre===jugador.nombre?BDR:"#111"}`}}>
                        <Avatar j={j} size={28}/>
                        <span style={{flex:1,fontSize:13,fontWeight:j.nombre===jugador.nombre?700:400}}>
                          {j.nombre}{j.nombre===jugador.nombre?" (vos)":""}
                        </span>
                        <span style={{fontSize:15,fontWeight:700,color:tiene?TEXT:MUTED}}>{tiene?`${pr.l}-${pr.v}`:"sin cargar"}</span>
                        {pts!==null&&<span style={{fontSize:14,color:ptC}}>{pts===3?"🎯":pts===2?"✅":"❌"}</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })
          ) : (
            partidos.map(p=>{
              if(!p.local&&!p.vis)return(
                <div key={p.id} style={{...S.card,marginBottom:8,padding:"12px 14px"}}>
                  <div style={{color:MUTED,fontSize:13}}>Partido {p.numero} — equipos pendientes</div>
                </div>
              );
              const pron=(jugador?mp[p.id]:null)||{l:"",v:""};
              const res=ress[p.id];
              const hRes=res&&res.l!==""&&res.v!=="";
              const pts=hRes&&jugador?calcPts(pron,res):null;
              const ptC=pts===3?GREEN:pts===2?BLUE:pts===0?RED:MUTED;
              const bg=pts===3?"#091a0c":pts===2?"#091220":pts===0?"#180909":CARD;
              const bc=pts===3?GREEN:pts===2?BLUE:pts===0?"#601010":`${fase.color}44`;
              return(
                <div key={p.id} style={{background:bg,borderRadius:12,marginBottom:10,padding:14,border:`2px solid ${bc}`}}>
                  {p.fecha&&<div style={{fontSize:10,color:MUTED,marginBottom:10}}>📅 {p.fecha} {p.hora} · {p.sede}</div>}
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <div style={{flex:"1 1 110px",display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:22}}>{FLAG[p.local]||"🏳️"}</span>
                      <span style={{fontSize:15,fontWeight:600}}>{p.local}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      {jugador?(
                        <>
                          <input style={S.inpGol(bloqueada||hRes)} type="text" inputMode="numeric" maxLength={2}
                            value={pron.l} placeholder="-" disabled={bloqueada||hRes}
                            onChange={e=>setPronKO(p.id,"l",e.target.value.replace(/[^0-9]/g,""))}/>
                          <span style={{color:MUTED,fontWeight:700,fontSize:20}}>-</span>
                          <input style={S.inpGol(bloqueada||hRes)} type="text" inputMode="numeric" maxLength={2}
                            value={pron.v} placeholder="-" disabled={bloqueada||hRes}
                            onChange={e=>setPronKO(p.id,"v",e.target.value.replace(/[^0-9]/g,""))}/>
                        </>
                      ):(
                        <span style={{color:MUTED,fontSize:16}}>{hRes?`${res.l}-${res.v}`:"?-?"}</span>
                      )}
                    </div>
                    <div style={{flex:"1 1 110px",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
                      <span style={{fontSize:15,fontWeight:600,textAlign:"right"}}>{p.vis}</span>
                      <span style={{fontSize:22}}>{FLAG[p.vis]||"🏳️"}</span>
                    </div>
                  </div>
                  {hRes&&jugador&&(
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:"1px solid #1a1a2c"}}>
                      <div>
                        <div style={{color:"#3a3a6a",fontSize:11}}>Real</div>
                        <div style={{fontWeight:900,fontSize:20}}>{res.l}-{res.v}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:22}}>{pts===3?"🎯":pts===2?"✅":pts===0?"❌":"⏳"}</span>
                        <div style={{padding:"4px 12px",borderRadius:8,border:`2px solid ${ptC}`,fontWeight:900,fontSize:20,color:ptC}}>{pts} pts</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Tabla de la fase */}
          {tablaFase.some(j=>j.pts>0)&&(
            <div style={S.card}>
              <p style={{...S.sTitle,color:fase.color}}>Tabla {fase.label}</p>
              {tablaFase.map((item,i)=><TablaFila key={item.jugador.nombre} item={item} pos={i} maxPts={maxFase}/>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── TABLA GENERAL ──
  if(scr==="tabla"){
    const tablaGen=calcTablaGeneral(jds,prons,ress,equiposPartidos);
    const maxGen=tablaGen[0]?.pts??0;
    return(
      <div style={S.root}>
        <Header sub="Fase Eliminatoria" sync={sync}/>
        <div style={S.wrap}>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            <button style={S.btn("transparent",MUTED,"1px solid #222")} onClick={()=>setScr("inicio")}>← Volver</button>
            <button style={S.btn("#1a1a2a","#888","1px solid #333")} onClick={cargarTodo}>🔄 Actualizar</button>
          </div>

          {/* Tabla por fase */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            <button style={S.tab(tabFase==="general")} onClick={()=>setTabFase("general")}>General</button>
            {FASES_KO.map(f=>(
              <button key={f.id} style={{...S.tab(tabFase===f.id),color:tabFase===f.id?f.color:MUTED}}
                onClick={()=>setTabFase(f.id)}>{f.emoji}</button>
            ))}
          </div>

          {tabFase==="general"&&(
            <div style={S.card}>
              <p style={S.sTitle}>🏆 Tabla General — Acumulado</p>
              {tablaGen.length===0?<p style={{color:MUTED}}>Sin puntos todavia</p>
                :tablaGen.map((item,i)=><TablaFila key={item.jugador.nombre} item={item} pos={i} maxPts={maxGen}/>)}
            </div>
          )}



          {FASES_KO.map(f=>{
            if(tabFase!==f.id)return null;
            const t=calcTablaFase(jds,prons,ress,f.id,equiposPartidos);
            const mx=t[0]?.pts??0;
            return(
              <div key={f.id} style={S.card}>
                <p style={{...S.sTitle,color:f.color}}>{f.emoji} Tabla {f.label}</p>
                {t.some(j=>j.pts>0)?t.map((item,i)=><TablaFila key={item.jugador.nombre} item={item} pos={i} maxPts={mx}/>)
                  :<p style={{color:MUTED}}>Sin puntos todavia</p>}
              </div>
            );
          })}

          <div style={{display:"flex",gap:20,justifyContent:"center",color:"#2a2a4a",fontSize:12,marginTop:8,flexWrap:"wrap"}}>
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
            <input style={{...S.inp(),flex:1}} type="password" placeholder="Contrasena"
              value={passIn} onChange={e=>{setPI(e.target.value);setPE(false);}}
              onKeyDown={async e=>{if(e.key!=="Enter")return;
                const r=await API.checkPass(passIn);
                if(r?.valid){setPI("");setPE(false);setScr("admin");}else setPE(true);}}/>
            <button style={S.btn(GOLD)} onClick={async()=>{
              const r=await API.checkPass(passIn);
              if(r?.valid){setPI("");setPE(false);setScr("admin");}else setPE(true);
            }}>Entrar</button>
          </div>
          {passErr&&<p style={{color:RED,fontSize:12}}>Contrasena incorrecta</p>}
          <button style={{...S.btn("transparent",MUTED,"1px solid #222"),marginTop:8}}
            onClick={()=>setScr("inicio")}>← Volver</button>
        </div>
      </div>
    </div>
  );

  // ── ADMIN ──
  if(scr==="admin"){
    const faseAdmin=FASES_KO.find(f=>f.id===faseKO)||FASES_KO[0];
    const partKO=getPartidosKO(faseKO,equiposPartidos);

    async function addJugador(){
      const n=nombreN.trim(),d=dniN.trim();
      if(!n||jds.find(x=>x.nombre===n))return;
      const nuevos=[...jds,{nombre:n,dni:d,fotoUrl:""}];
      setJds(nuevos);await API.setJugadores(nuevos);setNN("");setDniN("");
    }
    async function delJugador(nombre){
      if(!confirm(`Eliminar a ${nombre}?`))return;
      const nuevos=jds.filter(x=>x.nombre!==nombre);
      setJds(nuevos);await API.setJugadores(nuevos);
    }
    async function handleFoto(nombre,file){
      if(!file)return;setFotoSub(nombre);setFotoErr(null);
      const r=await API.subirFotoImgur(file);
      if(r?.ok&&r.url){const nuevos=jds.map(j=>j.nombre===nombre?{...j,fotoUrl:r.url}:j);setJds(nuevos);await API.setJugadores(nuevos);}
      else setFotoErr(nombre);
      setFotoSub(null);
    }
    async function guardarEqKO(pid){
      const eq=eqLocal[pid]||{};
      const local=eq.local!==undefined?eq.local:(equiposPartidos[pid]?.local||"");
      const vis=eq.vis!==undefined?eq.vis:(equiposPartidos[pid]?.vis||"");
      const fecha2=eq.fecha!==undefined?eq.fecha:(equiposPartidos[pid]?.fecha||"");
      const hora2=eq.hora!==undefined?eq.hora:(equiposPartidos[pid]?.hora||"");
      const sede2=eq.sede!==undefined?eq.sede:(equiposPartidos[pid]?.sede||"");
      await API.setEquiposPartido(pid,local,vis,fecha2,hora2,sede2);
      setEquiposPartidos(prev=>({...prev,[pid]:{local,vis,fecha:fecha2,hora:hora2,sede:sede2}}));
      setGuardadoOk(prev=>({...prev,["eq_"+pid]:true}));
      setTimeout(()=>setGuardadoOk(prev=>({...prev,["eq_"+pid]:false})),2000);
    }

    return(
      <div style={S.root}>
        <Header sub="Panel de administracion" sync={sync}/>
        <div style={S.wrap}>
          <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <button style={S.btn("transparent",GOLD,"1px solid "+GOLD)} onClick={()=>setScr("tabla")}>🏅 Tabla</button>
            <button style={S.btn("transparent",MUTED,"1px solid #222")} onClick={()=>setScr("inicio")}>← Salir</button>
            <button style={S.btn("#1a1a2a","#888","1px solid #333")} onClick={cargarTodo}>🔄</button>
          </div>

          {/* JUGADORES */}
          <div style={S.card}>
            <p style={S.sTitle}>👥 Jugadores ({jds.length})</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {jds.map(j=>(
                <div key={j.nombre} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                  background:"#0b0b18",border:`1px solid ${BDR}`,borderRadius:10,flexWrap:"wrap"}}>
                  <Avatar j={j} size={46}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15}}>{j.nombre}</div>
                    <div style={{fontSize:11,color:MUTED}}>DNI: {j.dni||"—"}</div>
                    {fotoErr===j.nombre&&<div style={{fontSize:11,color:RED}}>Error al subir foto</div>}
                  </div>
                  <label style={{cursor:"pointer"}}>
                    <input type="file" accept="image/*" style={{display:"none"}}
                      onChange={e=>handleFoto(j.nombre,e.target.files[0])}/>
                    <span style={{...S.btn("#1a1a2a","#ccc","1px solid #333",{fontSize:12,padding:"7px 12px",display:"inline-block"})}}>
                      {fotoSub===j.nombre?"⏳":"📷"}
                    </span>
                  </label>
                  <button onClick={()=>delJugador(j.nombre)}
                    style={S.btn("#1a0808",RED,"1px solid #401010",{padding:"7px 12px",fontSize:12})}>Borrar</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <input style={{...S.inp(),flex:"2 1 130px"}} placeholder="Nombre" value={nombreN}
                onChange={e=>setNN(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addJugador();}}/>
              <input style={{...S.inp(),flex:"1 1 100px"}} placeholder="DNI" type="number" value={dniN}
                onChange={e=>setDniN(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addJugador();}}/>
              <button style={S.btn(GOLD)} onClick={addJugador}>+ Agregar</button>
            </div>
          </div>

          {/* FASES KO — equipos y resultados */}
          <div style={S.card}>
            <p style={S.sTitle}>⚔ Fases Eliminatorias</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              {FASES_KO.map(f=>(
                <button key={f.id} style={{...S.tab(faseKO===f.id),color:faseKO===f.id?f.color:MUTED,borderColor:faseKO===f.id?f.color:undefined}}
                  onClick={()=>setFaseKO(f.id)}>{f.emoji} {f.label}</button>
              ))}
            </div>
            <p style={{color:MUTED,fontSize:11,margin:"0 0 12px"}}>Carga equipos, fecha, hora y sede. Los jugadores los ven al instante.</p>
            {partKO.map(p=>{
              const eq=eqLocal[p.id]||{};
              const localV=eq.local!==undefined?eq.local:(equiposPartidos[p.id]?.local||"");
              const visV=eq.vis!==undefined?eq.vis:(equiposPartidos[p.id]?.vis||"");
              const fechaV=eq.fecha!==undefined?eq.fecha:(equiposPartidos[p.id]?.fecha||"");
              const horaV=eq.hora!==undefined?eq.hora:(equiposPartidos[p.id]?.hora||"");
              const sedeV=eq.sede!==undefined?eq.sede:(equiposPartidos[p.id]?.sede||"");
              const rl=resLocal[p.id]||{l:ress[p.id]?.l||"",v:ress[p.id]?.v||""};
              const gok=guardadoOk[p.id],cP=guardando[p.id];
              const listo=String(rl.l).trim()!==""&&String(rl.v).trim()!=="";
              const sinC=rl.l===(ress[p.id]?.l||"")&&rl.v===(ress[p.id]?.v||"");
              const eqOk=guardadoOk["eq_"+p.id];
              return(
                <div key={p.id} style={{padding:"14px 0",borderBottom:`1px solid ${BDR}`}}>
                  <div style={{fontSize:11,color:faseAdmin.color,fontWeight:700,marginBottom:8}}>
                    Partido {p.numero}
                  </div>
                  {/* Equipos */}
                  <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>
                    <input style={{...S.inp(),flex:"1 1 110px",fontSize:13,padding:"6px 8px"}}
                      placeholder="Local" value={localV}
                      onChange={e=>setEqLocal(prev=>({...prev,[p.id]:{...(prev[p.id]||{}),local:e.target.value}}))}/>
                    <span style={{color:MUTED}}>vs</span>
                    <input style={{...S.inp(),flex:"1 1 110px",fontSize:13,padding:"6px 8px"}}
                      placeholder="Visitante" value={visV}
                      onChange={e=>setEqLocal(prev=>({...prev,[p.id]:{...(prev[p.id]||{}),vis:e.target.value}}))}/>
                  </div>
                  {/* Fecha / hora / sede */}
                  <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
                    <input style={{...S.inp(),flex:"1 1 90px",fontSize:11,padding:"5px 8px"}}
                      placeholder="Fecha (ej: Sab 5 Jul)" value={fechaV}
                      onChange={e=>setEqLocal(prev=>({...prev,[p.id]:{...(prev[p.id]||{}),fecha:e.target.value}}))}/>
                    <input style={{...S.inp(),width:70,fontSize:11,padding:"5px 8px"}}
                      placeholder="Hora" value={horaV}
                      onChange={e=>setEqLocal(prev=>({...prev,[p.id]:{...(prev[p.id]||{}),hora:e.target.value}}))}/>
                    <input style={{...S.inp(),flex:"1 1 100px",fontSize:11,padding:"5px 8px"}}
                      placeholder="Sede" value={sedeV}
                      onChange={e=>setEqLocal(prev=>({...prev,[p.id]:{...(prev[p.id]||{}),sede:e.target.value}}))}/>
                    <button style={{...S.btn(eqOk?"#0f2a0f":faseAdmin.color,"#000","none",{fontSize:11,padding:"6px 12px",flexShrink:0,
                      color:eqOk?GREEN:"#000"})}
                    } onClick={()=>guardarEqKO(p.id)}>
                      {eqOk?"✓ OK":"💾 Equipos"}
                    </button>
                  </div>
                  {/* Resultado */}
                  {(localV||visV)&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <span style={{flex:"1 1 80px",fontSize:12,color:MUTED}}>{FLAG[localV]||"⚽"} {localV||"?"}</span>
                      <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                        <input style={{...S.inpGol(false),fontSize:16}} type="text" inputMode="numeric" maxLength={2}
                          value={rl.l} placeholder="-"
                          onChange={e=>setResLocal(prev=>({...prev,[p.id]:{...(prev[p.id]||{l:"",v:""}),l:e.target.value.replace(/[^0-9]/g,"")}}))}
                          onKeyDown={e=>{if(e.key==="Enter")guardarResultado(p.id);}}/>
                        <span style={{color:MUTED}}>-</span>
                        <input style={{...S.inpGol(false),fontSize:16}} type="text" inputMode="numeric" maxLength={2}
                          value={rl.v} placeholder="-"
                          onChange={e=>setResLocal(prev=>({...prev,[p.id]:{...(prev[p.id]||{l:"",v:""}),v:e.target.value.replace(/[^0-9]/g,"")}}))}
                          onKeyDown={e=>{if(e.key==="Enter")guardarResultado(p.id);}}/>
                      </div>
                      <span style={{flex:"1 1 80px",fontSize:12,color:MUTED,textAlign:"right"}}>{visV||"?"} {FLAG[visV]||"⚽"}</span>
                      <button disabled={!listo||cP} onClick={()=>guardarResultado(p.id)}
                        style={{padding:"5px 9px",borderRadius:7,cursor:listo&&!cP?"pointer":"default",
                          fontWeight:800,fontSize:11,fontFamily:"inherit",flexShrink:0,
                          background:gok?"#0f2a0f":listo&&!sinC?faseAdmin.color:"#1a1a2a",
                          border:`1px solid ${gok?GREEN:listo&&!sinC?faseAdmin.color:"#333"}`,
                          color:gok?GREEN:listo&&!sinC?"#000":"#444"}}>
                        {cP?"⏳":gok?"✓":"💾"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DESBLOQUEOS */}
          <div style={S.card}>
            <p style={S.sTitle}>🔓 Habilitar modificacion fuera de limite</p>
            {jds.map(j=>(
              <div key={j.nombre} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                background:"#0b0b18",border:`1px solid ${BDR}`,borderRadius:10,marginBottom:8,flexWrap:"wrap"}}>
                <Avatar j={j} size={36}/>
                <span style={{flex:1,fontWeight:700,fontSize:14}}>{j.nombre}</span>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>

                  {FASES_KO.map(f=>{
                    const key=j.nombre+":fase:"+f.id;
                    const desbloq=desbloqueos[key];
                    const bloq=estaBloquadaFase(f.id,enviosFase,j.nombre,desbloqueos);
                    return(
                      <button key={f.id} onClick={async()=>{
                        if(desbloq){await API.bloquearJugador(j.nombre,"fase:"+f.id);setDesbloq(p=>{const n={...p};delete n[key];return n;});}
                        else{await API.desbloquearJugador(j.nombre,"fase:"+f.id);setDesbloq(p=>({...p,[key]:true}));}
                      }} style={{padding:"5px 9px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:11,fontFamily:"inherit",
                        background:desbloq?"#0f2a0f":bloq?"#1a0808":"#111",
                        border:`1px solid ${desbloq?f.color:bloq?"#601010":"#333"}`,
                        color:desbloq?f.color:bloq?RED:MUTED}}>
                        {f.emoji} {desbloq?"HAB":bloq?"🔒":"⏳"}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* CONTRASEÑA */}
          <div style={S.card}>
            <p style={S.sTitle}>🔑 Contrasena admin</p>
            <div style={{display:"flex",gap:8}}>
              <input style={{...S.inp(),flex:1}} type="password" placeholder="Nueva contrasena"
                value={newPass} onChange={e=>setNP(e.target.value)}/>
              <button style={S.btn("#1a1a2a","#ccc","1px solid #333")} onClick={async()=>{
                const v=newPass.trim();if(v){await API.setAdminPass(v);setNP("");alert("Contrasena actualizada");}
              }}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
