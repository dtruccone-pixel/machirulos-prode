// ══════════════════════════════════════════════════════════════════
// DATOS REALES FIFA WORLD CUP 2026
// Fuente: calendario oficial + álbum Panini
// ══════════════════════════════════════════════════════════════════

export const GRUPOS = {
  A: ["México","Sudáfrica","Corea del Sur","Chequia"],
  B: ["Canadá","Bosnia-Herz.","Qatar","Suiza"],
  C: ["Brasil","Marruecos","Haití","Escocia"],
  D: ["EEUU","Paraguay","Australia","Turquía"],
  E: ["Alemania","Curazao","Costa de Marfil","Ecuador"],
  F: ["Países Bajos","Japón","Suecia","Túnez"],
  G: ["Bélgica","Egipto","Irán","Nueva Zelanda"],
  H: ["España","Cabo Verde","Arabia Saudita","Uruguay"],
  I: ["Francia","Senegal","Irak","Noruega"],
  J: ["Argentina","Argelia","Austria","Jordania"],
  K: ["Portugal","Congo DR","Uzbekistán","Colombia"],
  L: ["Inglaterra","Croacia","Ghana","Panamá"],
};

export const GRUPOS_KEYS = Object.keys(GRUPOS);

export const FLAG = {
  "México":"🇲🇽","Sudáfrica":"🇿🇦","Corea del Sur":"🇰🇷","Chequia":"🇨🇿",
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
  {id:"A1",g:"A",f:1,fecha:"11 Jun",local:"México",        vis:"Sudáfrica",        sede:"Ciudad de México"},
  {id:"A2",g:"A",f:1,fecha:"12 Jun",local:"Corea del Sur", vis:"Chequia",          sede:"Guadalajara"},
  {id:"A3",g:"A",f:2,fecha:"15 Jun",local:"México",        vis:"Corea del Sur",    sede:"Ciudad de México"},
  {id:"A4",g:"A",f:2,fecha:"15 Jun",local:"Sudáfrica",     vis:"Chequia",          sede:"Guadalajara"},
  {id:"A5",g:"A",f:3,fecha:"19 Jun",local:"México",        vis:"Chequia",          sede:"Ciudad de México"},
  {id:"A6",g:"A",f:3,fecha:"19 Jun",local:"Sudáfrica",     vis:"Corea del Sur",    sede:"Guadalajara"},
  // GRUPO B
  {id:"B1",g:"B",f:1,fecha:"12 Jun",local:"Canadá",        vis:"Bosnia-Herz.",     sede:"Toronto"},
  {id:"B2",g:"B",f:1,fecha:"13 Jun",local:"Qatar",         vis:"Suiza",            sede:"San Francisco"},
  {id:"B3",g:"B",f:2,fecha:"16 Jun",local:"Canadá",        vis:"Qatar",            sede:"Vancouver"},
  {id:"B4",g:"B",f:2,fecha:"16 Jun",local:"Bosnia-Herz.",  vis:"Suiza",            sede:"Seattle"},
  {id:"B5",g:"B",f:3,fecha:"20 Jun",local:"Canadá",        vis:"Suiza",            sede:"Vancouver"},
  {id:"B6",g:"B",f:3,fecha:"20 Jun",local:"Bosnia-Herz.",  vis:"Qatar",            sede:"Seattle"},
  // GRUPO C
  {id:"C1",g:"C",f:1,fecha:"12 Jun",local:"Brasil",        vis:"Marruecos",        sede:"Nueva York"},
  {id:"C2",g:"C",f:1,fecha:"13 Jun",local:"Haití",         vis:"Escocia",          sede:"Boston"},
  {id:"C3",g:"C",f:2,fecha:"17 Jun",local:"Brasil",        vis:"Haití",            sede:"Filadelfia"},
  {id:"C4",g:"C",f:2,fecha:"17 Jun",local:"Marruecos",     vis:"Escocia",          sede:"Boston"},
  {id:"C5",g:"C",f:3,fecha:"21 Jun",local:"Brasil",        vis:"Escocia",          sede:"Miami"},
  {id:"C6",g:"C",f:3,fecha:"21 Jun",local:"Marruecos",     vis:"Haití",            sede:"Atlanta"},
  // GRUPO D
  {id:"D1",g:"D",f:1,fecha:"12 Jun",local:"EEUU",          vis:"Paraguay",         sede:"Los Ángeles"},
  {id:"D2",g:"D",f:1,fecha:"13 Jun",local:"Australia",     vis:"Turquía",          sede:"Vancouver"},
  {id:"D3",g:"D",f:2,fecha:"17 Jun",local:"EEUU",          vis:"Australia",        sede:"Seattle"},
  {id:"D4",g:"D",f:2,fecha:"17 Jun",local:"Paraguay",      vis:"Turquía",          sede:"San Francisco"},
  {id:"D5",g:"D",f:3,fecha:"21 Jun",local:"EEUU",          vis:"Turquía",          sede:"Los Ángeles"},
  {id:"D6",g:"D",f:3,fecha:"21 Jun",local:"Paraguay",      vis:"Australia",        sede:"San Francisco"},
  // GRUPO E
  {id:"E1",g:"E",f:1,fecha:"14 Jun",local:"Alemania",      vis:"Curazao",          sede:"Houston"},
  {id:"E2",g:"E",f:1,fecha:"14 Jun",local:"Costa de Marfil",vis:"Ecuador",         sede:"Filadelfia"},
  {id:"E3",g:"E",f:2,fecha:"18 Jun",local:"Alemania",      vis:"Costa de Marfil",  sede:"Houston"},
  {id:"E4",g:"E",f:2,fecha:"18 Jun",local:"Curazao",       vis:"Ecuador",          sede:"Kansas City"},
  {id:"E5",g:"E",f:3,fecha:"22 Jun",local:"Alemania",      vis:"Ecuador",          sede:"Houston"},
  {id:"E6",g:"E",f:3,fecha:"22 Jun",local:"Costa de Marfil",vis:"Curazao",         sede:"Filadelfia"},
  // GRUPO F
  {id:"F1",g:"F",f:1,fecha:"14 Jun",local:"Países Bajos",  vis:"Japón",            sede:"Dallas"},
  {id:"F2",g:"F",f:1,fecha:"15 Jun",local:"Suecia",        vis:"Túnez",            sede:"Monterrey"},
  {id:"F3",g:"F",f:2,fecha:"18 Jun",local:"Países Bajos",  vis:"Suecia",           sede:"Houston"},
  {id:"F4",g:"F",f:2,fecha:"18 Jun",local:"Japón",         vis:"Túnez",            sede:"Monterrey"},
  {id:"F5",g:"F",f:3,fecha:"22 Jun",local:"Países Bajos",  vis:"Túnez",            sede:"Kansas City"},
  {id:"F6",g:"F",f:3,fecha:"22 Jun",local:"Japón",         vis:"Suecia",           sede:"Monterrey"},
  // GRUPO G
  {id:"G1",g:"G",f:1,fecha:"15 Jun",local:"Bélgica",       vis:"Egipto",           sede:"Seattle"},
  {id:"G2",g:"G",f:1,fecha:"15 Jun",local:"Irán",          vis:"Nueva Zelanda",    sede:"Los Ángeles"},
  {id:"G3",g:"G",f:2,fecha:"19 Jun",local:"Bélgica",       vis:"Irán",             sede:"Los Ángeles"},
  {id:"G4",g:"G",f:2,fecha:"19 Jun",local:"Egipto",        vis:"Nueva Zelanda",    sede:"Seattle"},
  {id:"G5",g:"G",f:3,fecha:"23 Jun",local:"Bélgica",       vis:"Nueva Zelanda",    sede:"Vancouver"},
  {id:"G6",g:"G",f:3,fecha:"23 Jun",local:"Egipto",        vis:"Irán",             sede:"Seattle"},
  // GRUPO H
  {id:"H1",g:"H",f:1,fecha:"15 Jun",local:"España",        vis:"Cabo Verde",       sede:"Atlanta"},
  {id:"H2",g:"H",f:1,fecha:"16 Jun",local:"Arabia Saudita",vis:"Uruguay",          sede:"Miami"},
  {id:"H3",g:"H",f:2,fecha:"19 Jun",local:"España",        vis:"Arabia Saudita",   sede:"Guadalajara"},
  {id:"H4",g:"H",f:2,fecha:"19 Jun",local:"Cabo Verde",    vis:"Uruguay",          sede:"Miami"},
  {id:"H5",g:"H",f:3,fecha:"23 Jun",local:"España",        vis:"Uruguay",          sede:"Guadalajara"},
  {id:"H6",g:"H",f:3,fecha:"23 Jun",local:"Cabo Verde",    vis:"Arabia Saudita",   sede:"Atlanta"},
  // GRUPO I
  {id:"I1",g:"I",f:1,fecha:"16 Jun",local:"Francia",       vis:"Senegal",          sede:"Nueva York"},
  {id:"I2",g:"I",f:1,fecha:"16 Jun",local:"Irak",          vis:"Noruega",          sede:"Boston"},
  {id:"I3",g:"I",f:2,fecha:"20 Jun",local:"Francia",       vis:"Irak",             sede:"Filadelfia"},
  {id:"I4",g:"I",f:2,fecha:"20 Jun",local:"Senegal",       vis:"Noruega",          sede:"Nueva York"},
  {id:"I5",g:"I",f:3,fecha:"24 Jun",local:"Francia",       vis:"Noruega",          sede:"Nueva York"},
  {id:"I6",g:"I",f:3,fecha:"24 Jun",local:"Senegal",       vis:"Irak",             sede:"Boston"},
  // GRUPO J
  {id:"J1",g:"J",f:1,fecha:"15 Jun",local:"Argentina",     vis:"Argelia",          sede:"Kansas City"},
  {id:"J2",g:"J",f:1,fecha:"16 Jun",local:"Austria",       vis:"Jordania",         sede:"San Francisco"},
  {id:"J3",g:"J",f:2,fecha:"19 Jun",local:"Argentina",     vis:"Austria",          sede:"Dallas"},
  {id:"J4",g:"J",f:2,fecha:"20 Jun",local:"Argelia",       vis:"Jordania",         sede:"Kansas City"},
  {id:"J5",g:"J",f:3,fecha:"24 Jun",local:"Argentina",     vis:"Jordania",         sede:"Dallas"},
  {id:"J6",g:"J",f:3,fecha:"24 Jun",local:"Argelia",       vis:"Austria",          sede:"Kansas City"},
  // GRUPO K
  {id:"K1",g:"K",f:1,fecha:"16 Jun",local:"Portugal",      vis:"Congo DR",         sede:"Guadalajara"},
  {id:"K2",g:"K",f:1,fecha:"16 Jun",local:"Uzbekistán",    vis:"Colombia",         sede:"Ciudad de México"},
  {id:"K3",g:"K",f:2,fecha:"20 Jun",local:"Portugal",      vis:"Uzbekistán",       sede:"Guadalajara"},
  {id:"K4",g:"K",f:2,fecha:"21 Jun",local:"Congo DR",      vis:"Colombia",         sede:"Toronto"},
  {id:"K5",g:"K",f:3,fecha:"25 Jun",local:"Portugal",      vis:"Colombia",         sede:"Kansas City"},
  {id:"K6",g:"K",f:3,fecha:"25 Jun",local:"Congo DR",      vis:"Uzbekistán",       sede:"Guadalajara"},
  // GRUPO L
  {id:"L1",g:"L",f:1,fecha:"17 Jun",local:"Inglaterra",    vis:"Croacia",          sede:"Dallas"},
  {id:"L2",g:"L",f:1,fecha:"17 Jun",local:"Ghana",         vis:"Panamá",           sede:"Toronto"},
  {id:"L3",g:"L",f:2,fecha:"21 Jun",local:"Inglaterra",    vis:"Ghana",            sede:"Boston"},
  {id:"L4",g:"L",f:2,fecha:"22 Jun",local:"Croacia",       vis:"Panamá",           sede:"Toronto"},
  {id:"L5",g:"L",f:3,fecha:"26 Jun",local:"Inglaterra",    vis:"Panamá",           sede:"Nueva York"},
  {id:"L6",g:"L",f:3,fecha:"27 Jun",local:"Croacia",       vis:"Ghana",            sede:"Boston"},
];

export function calcPts(pron, res) {
  if (!res || res.l === "" || res.v === "") return null;
  const rl=parseInt(res.l), rv=parseInt(res.v);
  const pl=parseInt(pron?.l ?? ""), pv=parseInt(pron?.v ?? "");
  if (isNaN(rl)||isNaN(rv)||isNaN(pl)||isNaN(pv)) return null;
  if (pl===rl && pv===rv) return 3;
  const gr=rl>rv?"L":rl<rv?"V":"E";
  const gp=pl>pv?"L":pl<pv?"V":"E";
  return gr===gp ? 2 : 0;
}
