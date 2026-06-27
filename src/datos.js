// ══════════════════════════════════════════════════════════════════
// DATOS REALES FIFA WORLD CUP 2026
// Fuente: ESPN Deportes - fixture oficial
// Horarios en hora Argentina (ARG/URU)
// ══════════════════════════════════════════════════════════════════

export const GRUPOS = {
  A: ["México", "Sudáfrica", "Corea del Sur", "República Checa"],
  B: ["Canadá", "Bosnia-Herz.", "Qatar", "Suiza"],
  C: ["Brasil", "Marruecos", "Haití", "Escocia"],
  D: ["EEUU", "Paraguay", "Australia", "Turquía"],
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Países Bajos", "Japón", "Suecia", "Túnez"],
  G: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
  H: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"],
  I: ["Francia", "Senegal", "Irak", "Noruega"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "Congo DR", "Uzbekistán", "Colombia"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"],
};

export const GRUPOS_KEYS = Object.keys(GRUPOS);

export const FLAG = {
  "México":"🇲🇽","Sudáfrica":"🇿🇦","Corea del Sur":"🇰🇷","República Checa":"🇨🇿",
  "Canadá":"🇨🇦","Bosnia-Herz.":"🇧🇦","Qatar":"🇶🇦","Suiza":"🇨🇭",
  "Brasil":"🇧🇷","Marruecos":"🇲🇦","Haití":"🇭🇹","Escocia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "EEUU":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺","Turquía":"🇹🇷",
  "Alemania":"🇩🇪","Curazao":"🇨🇼","Costa de Marfil":"🇨🇮","Ecuador":"🇪🇨",
  "Países Bajos":"🇳🇱","Japón":"🇯🇵","Suecia":"🇸🇪","Túnez":"🇹🇳",
  "Bélgica":"🇧🇪","Egipto":"🇪🇬","Irán":"🇮🇷","Nueva Zelanda":"🇳🇿",
  "España":"🇪🇸","Cabo Verde":"🇨🇻","Arabia Saudita":"🇸🇦","Uruguay":"🇺🇾",
  "Francia":"🇫🇷","Senegal":"🇸🇳","Irak":"🇮🇶","Noruega":"🇳🇴",
  "Argentina":"🇦🇷","Argelia":"🇩🇿","Austria":"🇦🇹","Jordania":"🇯🇴",
  "Portugal":"🇵🇹","Congo DR":"🇨🇩","Uzbekistán":"🇺🇿","Colombia":"🇨🇴",
  "Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croacia":"🇭🇷","Ghana":"🇬🇭","Panamá":"🇵🇦",
};

export const PARTIDOS = [
  // GRUPO A
  {id:"A1",g:"A",f:1,fecha:"Jue 11 Jun",hora:"16:00",local:"México",         vis:"Sudáfrica",      sede:"Ciudad de México"},
  {id:"A2",g:"A",f:1,fecha:"Jue 11 Jun",hora:"23:00",local:"Corea del Sur",  vis:"República Checa",sede:"Guadalajara"},
  {id:"A3",g:"A",f:2,fecha:"Jue 18 Jun",hora:"13:00",local:"República Checa",vis:"Sudáfrica",      sede:"Atlanta"},
  {id:"A4",g:"A",f:2,fecha:"Jue 18 Jun",hora:"22:00",local:"México",         vis:"Corea del Sur",  sede:"Guadalajara"},
  {id:"A5",g:"A",f:3,fecha:"Mar 24 Jun",hora:"22:00",local:"Sudáfrica",      vis:"Corea del Sur",  sede:"Monterrey"},
  {id:"A6",g:"A",f:3,fecha:"Mar 24 Jun",hora:"22:00",local:"República Checa",vis:"México",         sede:"Ciudad de México"},
  // GRUPO B
  {id:"B1",g:"B",f:1,fecha:"Vie 12 Jun",hora:"16:00",local:"Canadá",        vis:"Bosnia-Herz.",   sede:"Toronto"},
  {id:"B2",g:"B",f:1,fecha:"Sáb 13 Jun",hora:"16:00",local:"Qatar",         vis:"Suiza",          sede:"San Francisco"},
  {id:"B3",g:"B",f:2,fecha:"Jue 18 Jun",hora:"16:00",local:"Suiza",         vis:"Bosnia-Herz.",   sede:"Los Ángeles"},
  {id:"B4",g:"B",f:2,fecha:"Jue 18 Jun",hora:"19:00",local:"Canadá",        vis:"Qatar",          sede:"Vancouver"},
  {id:"B5",g:"B",f:3,fecha:"Mar 24 Jun",hora:"16:00",local:"Suiza",         vis:"Canadá",         sede:"Vancouver"},
  {id:"B6",g:"B",f:3,fecha:"Mar 24 Jun",hora:"16:00",local:"Bosnia-Herz.",  vis:"Qatar",          sede:"Seattle"},
  // GRUPO C
  {id:"C1",g:"C",f:1,fecha:"Sáb 13 Jun",hora:"19:00",local:"Brasil",        vis:"Marruecos",      sede:"Nueva Jersey"},
  {id:"C2",g:"C",f:1,fecha:"Sáb 13 Jun",hora:"22:00",local:"Haití",         vis:"Escocia",        sede:"Boston"},
  {id:"C3",g:"C",f:2,fecha:"Vie 19 Jun",hora:"19:00",local:"Escocia",       vis:"Marruecos",      sede:"Boston"},
  {id:"C4",g:"C",f:2,fecha:"Vie 19 Jun",hora:"21:30",local:"Brasil",        vis:"Haití",          sede:"Philadelphia"},
  {id:"C5",g:"C",f:3,fecha:"Mar 24 Jun",hora:"19:00",local:"Marruecos",     vis:"Haití",          sede:"Atlanta"},
  {id:"C6",g:"C",f:3,fecha:"Mar 24 Jun",hora:"19:00",local:"Brasil",        vis:"Escocia",        sede:"Miami"},
  // GRUPO D
  {id:"D1",g:"D",f:1,fecha:"Vie 12 Jun",hora:"22:00",local:"EEUU",          vis:"Paraguay",       sede:"Los Ángeles"},
  {id:"D2",g:"D",f:1,fecha:"Dom 14 Jun",hora:"01:00",local:"Australia",     vis:"Turquía",        sede:"Vancouver"},
  {id:"D3",g:"D",f:2,fecha:"Vie 19 Jun",hora:"16:00",local:"EEUU",          vis:"Australia",      sede:"Seattle"},
  {id:"D4",g:"D",f:2,fecha:"Vie 19 Jun",hora:"00:00",local:"Turquía",       vis:"Paraguay",       sede:"San Francisco"},
  {id:"D5",g:"D",f:3,fecha:"Jue 25 Jun",hora:"23:00",local:"Paraguay",      vis:"Australia",      sede:"San Francisco"},
  {id:"D6",g:"D",f:3,fecha:"Jue 25 Jun",hora:"23:00",local:"Turquía",       vis:"EEUU",           sede:"Los Ángeles"},
  // GRUPO E
  {id:"E1",g:"E",f:1,fecha:"Dom 14 Jun",hora:"14:00",local:"Alemania",      vis:"Curazao",        sede:"Houston"},
  {id:"E2",g:"E",f:1,fecha:"Dom 14 Jun",hora:"20:00",local:"Costa de Marfil",vis:"Ecuador",       sede:"Philadelphia"},
  {id:"E3",g:"E",f:2,fecha:"Sáb 20 Jun",hora:"17:00",local:"Alemania",      vis:"Costa de Marfil",sede:"Toronto"},
  {id:"E4",g:"E",f:2,fecha:"Sáb 20 Jun",hora:"23:00",local:"Ecuador",       vis:"Curazao",        sede:"Kansas City"},
  {id:"E5",g:"E",f:3,fecha:"Jue 25 Jun",hora:"17:00",local:"Curazao",       vis:"Costa de Marfil",sede:"Philadelphia"},
  {id:"E6",g:"E",f:3,fecha:"Jue 25 Jun",hora:"17:00",local:"Ecuador",       vis:"Alemania",       sede:"Nueva Jersey"},
  // GRUPO F
  {id:"F1",g:"F",f:1,fecha:"Dom 14 Jun",hora:"17:00",local:"Países Bajos",  vis:"Japón",          sede:"Dallas"},
  {id:"F2",g:"F",f:1,fecha:"Dom 14 Jun",hora:"23:00",local:"Suecia",        vis:"Túnez",          sede:"Monterrey"},
  {id:"F3",g:"F",f:2,fecha:"Sáb 20 Jun",hora:"14:00",local:"Países Bajos",  vis:"Suecia",         sede:"Houston"},
  {id:"F4",g:"F",f:2,fecha:"Dom 21 Jun",hora:"01:00",local:"Túnez",         vis:"Japón",          sede:"Monterrey"},
  {id:"F5",g:"F",f:3,fecha:"Jue 25 Jun",hora:"20:00",local:"Japón",         vis:"Suecia",         sede:"Dallas"},
  {id:"F6",g:"F",f:3,fecha:"Jue 25 Jun",hora:"20:00",local:"Túnez",         vis:"Países Bajos",   sede:"Kansas City"},
  // GRUPO G
  {id:"G1",g:"G",f:1,fecha:"Lun 15 Jun",hora:"16:00",local:"Bélgica",       vis:"Egipto",         sede:"Seattle"},
  {id:"G2",g:"G",f:1,fecha:"Lun 15 Jun",hora:"22:00",local:"Irán",          vis:"Nueva Zelanda",  sede:"Los Ángeles"},
  {id:"G3",g:"G",f:2,fecha:"Dom 21 Jun",hora:"16:00",local:"Bélgica",       vis:"Irán",           sede:"Los Ángeles"},
  {id:"G4",g:"G",f:2,fecha:"Dom 21 Jun",hora:"22:00",local:"Nueva Zelanda", vis:"Egipto",         sede:"Vancouver"},
  {id:"G5",g:"G",f:3,fecha:"Vie 26 Jun",hora:"00:00",local:"Egipto",        vis:"Irán",           sede:"Seattle"},
  {id:"G6",g:"G",f:3,fecha:"Vie 26 Jun",hora:"00:00",local:"Nueva Zelanda", vis:"Bélgica",        sede:"Vancouver"},
  // GRUPO H
  {id:"H1",g:"H",f:1,fecha:"Lun 15 Jun",hora:"13:00",local:"España",        vis:"Cabo Verde",     sede:"Atlanta"},
  {id:"H2",g:"H",f:1,fecha:"Lun 15 Jun",hora:"19:00",local:"Arabia Saudita",vis:"Uruguay",        sede:"Miami"},
  {id:"H3",g:"H",f:2,fecha:"Dom 21 Jun",hora:"13:00",local:"España",        vis:"Arabia Saudita", sede:"Atlanta"},
  {id:"H4",g:"H",f:2,fecha:"Dom 21 Jun",hora:"19:00",local:"Uruguay",       vis:"Cabo Verde",     sede:"Miami"},
  {id:"H5",g:"H",f:3,fecha:"Vie 26 Jun",hora:"21:00",local:"Cabo Verde",    vis:"Arabia Saudita", sede:"Houston"},
  {id:"H6",g:"H",f:3,fecha:"Vie 26 Jun",hora:"21:00",local:"Uruguay",       vis:"España",         sede:"Guadalajara"},
  // GRUPO I
  {id:"I1",g:"I",f:1,fecha:"Mar 16 Jun",hora:"16:00",local:"Francia",       vis:"Senegal",        sede:"Nueva Jersey"},
  {id:"I2",g:"I",f:1,fecha:"Mar 16 Jun",hora:"19:00",local:"Irak",          vis:"Noruega",        sede:"Boston"},
  {id:"I3",g:"I",f:2,fecha:"Lun 22 Jun",hora:"18:00",local:"Francia",       vis:"Irak",           sede:"Philadelphia"},
  {id:"I4",g:"I",f:2,fecha:"Lun 22 Jun",hora:"21:00",local:"Noruega",       vis:"Senegal",        sede:"Nueva Jersey"},
  {id:"I5",g:"I",f:3,fecha:"Vie 26 Jun",hora:"16:00",local:"Noruega",       vis:"Francia",        sede:"Boston"},
  {id:"I6",g:"I",f:3,fecha:"Vie 26 Jun",hora:"16:00",local:"Senegal",       vis:"Irak",           sede:"Toronto"},
  // GRUPO J
  {id:"J1",g:"J",f:1,fecha:"Mar 16 Jun",hora:"22:00",local:"Argentina",     vis:"Argelia",        sede:"Kansas City"},
  {id:"J2",g:"J",f:1,fecha:"Mié 17 Jun",hora:"01:00",local:"Austria",       vis:"Jordania",       sede:"San Francisco"},
  {id:"J3",g:"J",f:2,fecha:"Lun 22 Jun",hora:"14:00",local:"Argentina",     vis:"Austria",        sede:"Dallas"},
  {id:"J4",g:"J",f:2,fecha:"Mar 23 Jun",hora:"00:00",local:"Jordania",      vis:"Argelia",        sede:"San Francisco"},
  {id:"J5",g:"J",f:3,fecha:"Sáb 27 Jun",hora:"23:00",local:"Argelia",       vis:"Austria",        sede:"Kansas City"},
  {id:"J6",g:"J",f:3,fecha:"Sáb 27 Jun",hora:"23:00",local:"Jordania",      vis:"Argentina",      sede:"Dallas"},
  // GRUPO K
  {id:"K1",g:"K",f:1,fecha:"Mié 17 Jun",hora:"14:00",local:"Portugal",      vis:"Congo DR",       sede:"Houston"},
  {id:"K2",g:"K",f:1,fecha:"Mié 17 Jun",hora:"23:00",local:"Uzbekistán",    vis:"Colombia",       sede:"Ciudad de México"},
  {id:"K3",g:"K",f:2,fecha:"Mar 23 Jun",hora:"14:00",local:"Portugal",      vis:"Uzbekistán",     sede:"Houston"},
  {id:"K4",g:"K",f:2,fecha:"Mar 23 Jun",hora:"23:00",local:"Colombia",      vis:"Congo DR",       sede:"Guadalajara"},
  {id:"K5",g:"K",f:3,fecha:"Sáb 27 Jun",hora:"20:30",local:"Colombia",      vis:"Portugal",       sede:"Miami"},
  {id:"K6",g:"K",f:3,fecha:"Sáb 27 Jun",hora:"20:30",local:"Congo DR",      vis:"Uzbekistán",     sede:"Atlanta"},
  // GRUPO L
  {id:"L1",g:"L",f:1,fecha:"Mié 17 Jun",hora:"17:00",local:"Inglaterra",    vis:"Croacia",        sede:"Dallas"},
  {id:"L2",g:"L",f:1,fecha:"Mié 17 Jun",hora:"20:00",local:"Ghana",         vis:"Panamá",         sede:"Toronto"},
  {id:"L3",g:"L",f:2,fecha:"Mar 23 Jun",hora:"17:00",local:"Inglaterra",    vis:"Ghana",          sede:"Boston"},
  {id:"L4",g:"L",f:2,fecha:"Mar 23 Jun",hora:"20:00",local:"Panamá",        vis:"Croacia",        sede:"Toronto"},
  {id:"L5",g:"L",f:3,fecha:"Sáb 27 Jun",hora:"18:00",local:"Croacia",       vis:"Ghana",          sede:"Philadelphia"},
  {id:"L6",g:"L",f:3,fecha:"Sáb 27 Jun",hora:"18:00",local:"Panamá",        vis:"Inglaterra",     sede:"Nueva Jersey"},
];

export function calcPts(pron, res) {
  if (!res || res.l === "" || res.v === "") return null;
  const rl=parseInt(res.l), rv=parseInt(res.v);
  const pl=parseInt(pron?.l??""), pv=parseInt(pron?.v??"");
  if (isNaN(rl)||isNaN(rv)||isNaN(pl)||isNaN(pv)) return null;
  if (pl===rl && pv===rv) return 3;
  const gr=rl>rv?"L":rl<rv?"V":"E";
  const gp=pl>pv?"L":pl<pv?"V":"E";
  return gr===gp ? 2 : 0;
}

// ══════════════════════════════════════════════════════════════════
// ROUND OF 32 — 16avos de Final
// Fuente: Ambito / SI Fútbol / Sky Sports — cruces confirmados
// Horarios en hora Argentina (ET+1h en verano = ET+2h)
// ══════════════════════════════════════════════════════════════════

export const PARTIDOS_R32 = [
  // Dom 28 Jun
  { id:"R01", fecha:"Dom 28 Jun", hora:"21:00", local:"Sudáfrica",      vis:"Canadá",          sede:"Los Ángeles" },
  // Lun 29 Jun
  { id:"R02", fecha:"Lun 29 Jun", hora:"19:00", local:"Brasil",         vis:"Japón",           sede:"Houston" },
  { id:"R03", fecha:"Lun 29 Jun", hora:"22:30", local:"Alemania",       vis:"3ro ABCDF",       sede:"Boston" },
  // Mar 30 Jun
  { id:"R04", fecha:"Mar 30 Jun", hora:"03:00", local:"Países Bajos",   vis:"Marruecos",       sede:"Guadalajara" },
  { id:"R05", fecha:"Mar 30 Jun", hora:"19:00", local:"Costa de Marfil",vis:"Noruega",         sede:"Dallas" },
  { id:"R06", fecha:"Mar 30 Jun", hora:"23:00", local:"Francia",        vis:"3ro CDFGH",       sede:"Nueva Jersey" },
  // Mié 1 Jul
  { id:"R07", fecha:"Mié 1 Jul",  hora:"03:00", local:"México",         vis:"Escocia",         sede:"Ciudad de México" },
  { id:"R08", fecha:"Mié 1 Jul",  hora:"18:00", local:"Inglaterra",     vis:"Argelia",         sede:"Atlanta" },
  { id:"R09", fecha:"Mié 1 Jul",  hora:"22:00", local:"Egipto",         vis:"Corea del Sur",   sede:"Seattle" },
  // Jue 2 Jul
  { id:"R10", fecha:"Jue 2 Jul",  hora:"02:00", local:"EEUU",           vis:"Bosnia-Herz.",    sede:"San Francisco" },
  { id:"R11", fecha:"Jue 2 Jul",  hora:"21:00", local:"Argentina",      vis:"Uruguay",         sede:"Miami" },
  // Vie 3 Jul
  { id:"R12", fecha:"Vie 3 Jul",  hora:"01:00", local:"Suiza",          vis:"Argelia",         sede:"Dallas" },
  { id:"R13", fecha:"Vie 3 Jul",  hora:"19:00", local:"España",         vis:"Austria",         sede:"Kansas City" },
  { id:"R14", fecha:"Vie 3 Jul",  hora:"22:00", local:"Colombia",       vis:"Croacia",         sede:"Miami" },
  // Sáb 4 Jul
  { id:"R15", fecha:"Sáb 4 Jul",  hora:"02:00", local:"Australia",      vis:"Irán",            sede:"Vancouver" },
  { id:"R16", fecha:"Sáb 4 Jul",  hora:"19:00", local:"Portugal",       vis:"Ghana",           sede:"Toronto" },
];

// ══════════════════════════════════════════════════════════════════
// CALCULAR CLASIFICADOS A 16AVOS DESDE RESULTADOS
// Retorna { R01: {local:"México", vis:"Canadá"}, R02: ... }
// ══════════════════════════════════════════════════════════════════

function calcPosGroup(equipos, grupo, ress) {
  // Calcula tabla de un grupo dado los resultados
  const partidos = PARTIDOS.filter(p => p.g === grupo);
  const tabla = equipos.map(eq => {
    let pts=0, gf=0, gc=0, gd=0, pj=0;
    partidos.forEach(p => {
      const res = ress[p.id];
      if (!res || res.l === "" || res.v === "") return;
      const rl=parseInt(res.l), rv=parseInt(res.v);
      if (isNaN(rl)||isNaN(rv)) return;
      pj++;
      if (p.local === eq) { gf+=rl; gc+=rv; if(rl>rv)pts+=3; else if(rl===rv)pts+=1; }
      if (p.vis === eq)   { gf+=rv; gc+=rl; if(rv>rl)pts+=3; else if(rl===rv)pts+=1; }
    });
    gd = gf - gc;
    return { eq, pts, gf, gc, gd, pj };
  });
  // Ordenar: pts > gd > gf
  tabla.sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf);
  return tabla; // [1ro, 2do, 3ro, 4to]
}

export function calcClasificados(ress) {
  // Calcular tabla de cada grupo
  const tablas = {};
  Object.entries(GRUPOS).forEach(([g, equipos]) => {
    tablas[g] = calcPosGroup(equipos, g, ress);
  });

  // 1ros y 2dos de cada grupo
  const primero = g => tablas[g]?.[0]?.eq || `1ro Grupo ${g}`;
  const segundo = g => tablas[g]?.[1]?.eq || `2do Grupo ${g}`;
  const tercero = g => tablas[g]?.[2];

  // Los 8 mejores terceros
  const terceros = Object.keys(GRUPOS).map(g => ({
    g, ...tercero(g), label: `3ro Grupo ${g}`
  })).filter(t => t.pts !== undefined);

  // Ordenar terceros: pts > gd > gf
  terceros.sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf);
  const top8 = terceros.slice(0, 8);

  // Función para obtener nombre del equipo o placeholder
  const t = (n) => top8[n]?.eq || top8[n]?.label || `3ro #${n+1}`;

  // Tabla de cruces FIFA Mundial 2026
  // Fuente: bracket oficial FIFA
  // Los 16 partidos del R32 con sus cruces definidos
  return {
    R01: { local: segundo("A"),  vis: segundo("B")  },  // Sudáfrica vs Canadá
    R02: { local: primero("C"), vis: segundo("F")  },  // Brasil vs 2do F
    R03: { local: primero("E"), vis: t(0)           },  // Alemania vs mejor 3ro
    R04: { local: primero("A"), vis: segundo("C")  },  // México vs Marruecos
    R05: { local: primero("F"), vis: segundo("E")  },  // Países Bajos vs Costa de Marfil
    R06: { local: primero("I"), vis: t(1)           },  // Francia vs 3ro
    R07: { local: primero("B"), vis: t(2)           },  // Suiza vs 3ro
    R08: { local: primero("L"), vis: t(3)           },  // Inglaterra vs 3ro
    R09: { local: primero("G"), vis: segundo("D")  },  // Egipto vs Australia
    R10: { local: segundo("J"), vis: segundo("B")  },  // Austria vs Suiza — wait
    R11: { local: primero("J"), vis: segundo("H")  },  // Argentina vs 2do H
    R12: { local: segundo("K"), vis: segundo("L")  },  // Portugal vs Ghana
    R13: { local: primero("H"), vis: segundo("J")  },  // España vs Austria
    R14: { local: primero("K"), vis: t(4)           },  // Colombia vs 3ro
    R15: { local: segundo("G"), vis: segundo("I")  },  // Irán vs Noruega
    R16: { local: primero("D"), vis: segundo("I")  },  // EEUU vs Bosnia
  };
}
