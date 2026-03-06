import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

/* ─── CSS ───────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --sb:#2d1b69; --accent:#7c5cbf; --accent2:#a78bfa;
    --bg:#f4f3f8; --surface:#fff; --border:#e5e7eb;
    --ink:#111827; --ink2:#374151; --ink3:#6b7280; --ink4:#9ca3af;
    --green:#059669; --gbg:#ecfdf5; --gborder:#a7f3d0;
    --red:#dc2626;   --rbg:#fef2f2; --rborder:#fecaca;
    --amber:#d97706; --abg:#fffbeb; --aborder:#fde68a;
    --blue:#2563eb;  --bbg:#eff6ff; --bborder:#bfdbfe;
    --nav-h:60px; --hdr-h:56px;
  }
  html,body { font-family:'Inter',sans-serif; background:var(--bg); color:var(--ink); -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar { width:3px; } ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  @keyframes shimUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .f1{animation:fadeIn .35s .04s both} .f2{animation:fadeIn .35s .08s both}
  .f3{animation:fadeIn .35s .12s both} .f4{animation:fadeIn .35s .16s both} .f5{animation:fadeIn .35s .20s both}

  /* ── Sidebar (desktop) ── */
  .sidebar {
    width:210px; flex-shrink:0; background:var(--sb);
    display:flex; flex-direction:column; height:100vh;
    position:sticky; top:0; overflow:hidden;
  }
  .slink { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:8px; color:rgba(255,255,255,.6); font-size:13px; font-weight:500; text-decoration:none; transition:all .15s; cursor:pointer; margin-bottom:1px; }
  .slink:hover  { background:rgba(255,255,255,.09); color:#fff; }
  .slink.active { background:rgba(255,255,255,.16); color:#fff; }

  /* ── Bottom nav (mobile) ── */
  .bottom-nav {
    display:none; position:fixed; bottom:0; left:0; right:0; z-index:300;
    height:var(--nav-h); background:var(--sb);
    border-top:1px solid rgba(255,255,255,.1);
    align-items:center; justify-content:space-around;
    padding-bottom:env(safe-area-inset-bottom,0);
  }
  .bnav { display:flex; flex-direction:column; align-items:center; gap:3px; padding:6px 12px; border-radius:10px; text-decoration:none; color:rgba(255,255,255,.38); font-size:10px; font-weight:600; transition:all .18s; }
  .bnav.active { color:#fff; background:rgba(255,255,255,.14); }

  /* ── Mobile top bar ── */
  .mob-bar {
    display:none; background:var(--sb); padding:12px 16px;
    align-items:center; justify-content:space-between;
    position:sticky; top:0; z-index:100; flex-shrink:0;
    border-bottom:1px solid rgba(255,255,255,.08);
  }

  /* ── Cards ── */
  .card { background:var(--surface); border:1px solid var(--border); border-radius:14px; box-shadow:0 1px 6px rgba(0,0,0,.05); }
  .kpi-card { padding:16px; transition:box-shadow .2s; }
  .kpi-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.09); }

  /* ── Txn row (desktop table) ── */
  .tx-row { transition:background .1s; cursor:pointer; }
  .tx-row:hover { background:var(--bg); }

  /* ── Txn card (mobile) ── */
  .txn-card { display:flex; align-items:center; gap:12px; background:var(--surface); border:1px solid var(--border); border-radius:13px; padding:13px 14px; box-shadow:0 1px 4px rgba(0,0,0,.04); transition:transform .12s; cursor:pointer; }
  .txn-card:active { transform:scale(.99); }

  .badge { display:inline-flex; align-items:center; gap:3px; padding:2px 7px; border-radius:99px; font-size:10.5px; font-weight:500; }

  /* ── Responsive breakpoints ── */
  @media (max-width:900px) {
    .sidebar    { display:none !important; }
    .bottom-nav { display:flex !important; }
    .mob-bar    { display:flex !important; }
    .desk-hdr   { display:none !important; }
    .month-bar  { display:none !important; }
    .right-col  { display:none !important; }
    .kpi-grid   { grid-template-columns:1fr 1fr !important; gap:10px !important; }
    .main-grid  { grid-template-columns:1fr !important; }
    .page-pad   { padding:12px 14px calc(var(--nav-h) + 20px) !important; }
    .mob-show   { display:block !important; }
    .desk-show  { display:none !important; }
    .mob-txn-list { display:flex !important; }
    .desk-tx    { display:none !important; }
    .mob-pill   { display:flex !important; }
  }

  @media (min-width:901px) {
    .mob-show     { display:none; }
    .desk-show    { display:block; }
    .mob-txn-list { display:none; }
    .desk-tx      { display:block; }
    .mob-pill     { display:none; }
  }

  /* ── Month select ── */
  .month-sel { border:1.5px solid var(--accent); background:var(--surface); color:var(--ink); font-size:13px; font-weight:600; padding:7px 34px 7px 12px; border-radius:8px; cursor:pointer; font-family:inherit; outline:none; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%237c5cbf' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; min-width:170px; }
  .month-sel:focus { box-shadow:0 0 0 3px rgba(124,92,191,.2); }

  /* ── Progress bar ── */
  .prog { height:5px; background:#f0eff6; border-radius:99px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:99px; transition:width 1s ease; }

  /* ── Mob quick actions ── */
  .mob-action { display:flex; flex-direction:column; align-items:center; gap:6px; padding:14px 10px; border-radius:13px; text-decoration:none; transition:transform .15s; }
  .mob-action:active { transform:scale(.97); }
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__db5")) return;
  const s=document.createElement("style"); s.id="__db5"; s.textContent=CSS;
  document.head.appendChild(s);
}

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
const fmt  = n => new Intl.NumberFormat("en-IN",{maximumFractionDigits:0}).format(n||0);
const fmtK = n => !n||n===0?"₹0":n>=100000?`₹${(n/100000).toFixed(1)}L`:n>=1000?`₹${(n/1000).toFixed(1)}K`:`₹${fmt(n)}`;
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CAT_EMOJI={Food:"🍜",Transport:"🚗",Shopping:"🛍️",Entertainment:"🎬",Health:"💊",Utilities:"⚡",Groceries:"🛒",Coffee:"☕",Books:"📚",Bills:"📃",Travel:"✈️",Medicine:"💊",Other:"💳"};
const BAR_COLORS=["#7c5cbf","#a78bfa","#60a5fa","#34d399","#fb923c"];
const isAuto = t=>t.is_auto===true||t.is_auto===1||t.is_auto==="true"||t.is_auto==="1";

function fmtDate(raw) {
  if (!raw) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    const [y,m,d]=raw.split("-"); const dt=new Date(+y,+m-1,+d);
    return dt.toDateString()===new Date().toDateString()?"Today":dt.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
  }
  const u=(raw.endsWith("Z")||raw.includes("+"))?raw:raw.replace(" ","T")+"Z";
  return new Date(u).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true});
}

function buildMonthList(exp,inc) {
  const set=new Set();
  const n=new Date(); set.add(`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`);
  [...exp,...inc].forEach(t=>{const d=t.date||t.created_at; if(d) set.add(d.slice(0,7));});
  return [...set].sort().reverse();
}

const Ico=({d,s=14,c="currentColor"})=>(
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const IC={
  home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  tx:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  chart:"M18 20V10M12 20V4M6 20v-6",
  goals:"M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  budget:"M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
  detect:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  bell:"M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  logout:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  warn:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  up:"M18 15l-6-6-6 6",
  down:"M6 9l6 6 6-6",
  cal:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  plus:"M12 5v14M5 12h14",
  settings:"M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
};

const NAV_SECTIONS=[
  {label:null,items:[{to:"/dashboard",label:"Home",icon:"home"}]},
  {label:"Track Money",items:[
    {to:"/transactions",label:"Transactions",icon:"tx"},
    {to:"/analytics",label:"Analytics",icon:"chart"},
    {to:"/goals",label:"My Goals",icon:"goals"},
    {to:"/budgets",label:"My Budgets",icon:"budget"},
  ]},
  {label:"Auto Features",items:[
    {to:"/detected-transactions",label:"SMS Detected",icon:"detect"},
    {to:"/reminders",label:"Reminders",icon:"bell"},
  ]},
];
const BOT_NAV=[
  {to:"/dashboard",label:"Home",icon:"home"},
  {to:"/transactions",label:"Spends",icon:"tx"},
  {to:"/analytics",label:"Analytics",icon:"chart"},
  {to:"/budgets",label:"Budgets",icon:"budget"},
  {to:"/goals",label:"Goals",icon:"goals"},
  {to:"/detected-transactions",label:"SMS",icon:"detect"},
  {to:"/reminders",label:"Reminders",icon:"bell"},
];

/* ─── SIDEBAR ─────────────────────────────────────────────────────────────── */
function Sidebar({onLogout,pendingCount}) {
  const path=window.location.pathname;
  return (
    <aside className="sidebar">
      <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#7c5cbf,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff"}}>S</div>
        <div><div style={{fontSize:14,fontWeight:700,color:"#fff",lineHeight:1}}>SmartSpend</div><div style={{fontSize:10,color:"rgba(255,255,255,.38)",marginTop:2}}>Student Finance</div></div>
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"10px"}}>
        {NAV_SECTIONS.map((sec,si)=>(
          <div key={si} style={{marginBottom:6}}>
            {sec.label&&<div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,.32)",letterSpacing:"1px",textTransform:"uppercase",padding:"8px 8px 4px"}}>{sec.label}</div>}
            {sec.items.map(it=>(
              <a key={it.to} href={it.to} className={`slink${path===it.to?" active":""}`} style={{justifyContent:"space-between"}}>
                <span style={{display:"flex",alignItems:"center",gap:9}}><Ico d={IC[it.icon]} s={14}/>{it.label}</span>
                {it.to==="/detected-transactions"&&pendingCount>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,borderRadius:99,padding:"1px 6px"}}>{pendingCount}</span>}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <button onClick={onLogout} className="slink" style={{width:"100%",border:"none",background:"transparent",fontFamily:"inherit",cursor:"pointer"}}><Ico d={IC.logout} s={14}/>Sign Out</button>
      </div>
    </aside>
  );
}

/* ─── BOTTOM NAV ──────────────────────────────────────────────────────────── */
function BottomNav({pendingCount}) {
  const path=window.location.pathname;
  return (
    <nav className="bottom-nav">
      {BOT_NAV.map(it=>(
        <a key={it.to} href={it.to} className={`bnav${path===it.to?" active":""}`} style={{position:"relative"}}>
          <Ico d={IC[it.icon]} s={22}/>
          {it.label}
          {it.to==="/detected-transactions"&&pendingCount>0&&(
            <span style={{position:"absolute",top:2,right:6,background:"#ef4444",color:"#fff",fontSize:9,fontWeight:700,borderRadius:99,padding:"1px 5px"}}>{pendingCount}</span>
          )}
        </a>
      ))}
    </nav>
  );
}

/* ─── MOBILE TOP BAR ──────────────────────────────────────────────────────── */
function MobBar({greeting,monthList,selectedMonth,setSelectedMonth,onLogout}) {
  const now=new Date();
  const curKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  return (
    <div className="mob-bar">
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#7c5cbf,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0}}>S</div>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:"#fff",lineHeight:1.1,letterSpacing:"-.3px"}}>SmartSpend</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginTop:1}}>{greeting}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:7,alignItems:"center"}}>
        <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}
          style={{padding:"5px 26px 5px 9px",borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:"#fff",fontSize:11,fontFamily:"inherit",cursor:"pointer",outline:"none",appearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 7px center",maxWidth:100}}>
          <option value="all" style={{background:"#2d1b69"}}>All Time</option>
          {monthList.map(m=>{const [y,mo]=m.split("-"); return <option key={m} value={m} style={{background:"#2d1b69"}}>{MONTHS[+mo-1]} {y}{m===curKey?" ✓":""}</option>;})}
        </select>
        {/* Logout button — top right, always visible on mobile */}
        <button onClick={onLogout} title="Sign Out"
          style={{width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,.25)",background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"background .15s"}}
          onMouseDown={e=>e.currentTarget.style.background="rgba(255,255,255,.22)"}
          onMouseUp={e=>e.currentTarget.style.background="rgba(255,255,255,.12)"}>
          <Ico d={IC.logout} s={16} c="rgba(255,255,255,.9)"/>
        </button>
      </div>
    </div>
  );
}

/* ─── KPI CARD ────────────────────────────────────────────────────────────── */
function KpiCard({label,value,icon,iconBg,sub,change,ani,highlight}) {
  const pos=change>=0;
  return (
    <div className={`card kpi-card ${ani}`} style={{border:`1px solid ${highlight?"var(--accent)":"var(--border)"}`,boxShadow:highlight?"0 0 0 3px rgba(124,92,191,.1)":"0 1px 6px rgba(0,0,0,.05)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:500,color:"var(--ink3)",lineHeight:1.4,paddingRight:6}}>{label}</div>
        <div style={{width:32,height:32,borderRadius:8,background:iconBg||"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{icon}</div>
      </div>
      <div style={{fontSize:22,fontWeight:700,color:"var(--ink)",lineHeight:1,marginBottom:5}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:"var(--ink4)",lineHeight:1.4}}>{sub}</div>}
      {change!==undefined&&(
        <div style={{display:"inline-flex",alignItems:"center",gap:3,marginTop:7,fontSize:11,fontWeight:500,color:pos?"var(--green)":"var(--red)"}}>
          <Ico d={pos?IC.up:IC.down} s={11} c={pos?"var(--green)":"var(--red)"}/>
          {Math.abs(change).toFixed(1)}% vs last month
        </div>
      )}
    </div>
  );
}

/* ─── MOBILE TXN CARD ─────────────────────────────────────────────────────── */
function TxnCard({t}) {
  const isInc=t._type==="credit";
  const auto=isAuto(t);
  const cat=isInc?"Income":(t.category||"Other");
  const merchant=isInc?(t.source||t.merchant||t.merchant_name||t.description||"—"):(t.merchant||t.merchant_name||t.description||"—");
  const col=isInc?"var(--green)":"var(--red)";
  const bg=isInc?"var(--gbg)":"var(--rbg)";
  const bdr=isInc?"var(--gborder)":"var(--rborder)";
  const bl=isInc?"4px solid var(--green)":auto?"4px solid var(--blue)":"4px solid transparent";
  return (
    <div className="txn-card" style={{borderLeft:bl}}>
      <div style={{width:42,height:42,borderRadius:11,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
        {isInc?"💰":(CAT_EMOJI[cat]||"💳")}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:4}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"55%"}}>{cat}</div>
          <div style={{fontSize:15,fontWeight:700,color:col,flexShrink:0}}>{isInc?"+":"-"}{fmtK(t.amount)}</div>
        </div>
        <div style={{fontSize:11,color:"var(--ink3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",margin:"2px 0 5px"}}>{merchant}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:4}}>
          <span style={{fontSize:10,color:"var(--ink4)"}}>{fmtDate(t.created_at||t.date)}</span>
          <div style={{display:"flex",gap:4,flexWrap:"nowrap"}}>
            <span className="badge" style={{background:bg,color:col,border:`1px solid ${bdr}`,padding:"1px 6px"}}>{isInc?"💰 Income":"💸 Expense"}</span>
            <span className="badge" style={{background:auto?"var(--bbg)":"#f9fafb",color:auto?"var(--blue)":"var(--ink3)",border:`1px solid ${auto?"var(--bborder)":"var(--border)"}`,padding:"1px 6px"}}>{auto?"🤖":"✍️"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN EXPORT ─────────────────────────────────────────────────────────── */
export default function Dashboard() {
  injectCSS();
  const navigate=useNavigate();
  const token=localStorage.getItem("token");

  const [loading,      setLoading]     =useState(true);
  const [allExp,       setAllExp]      =useState([]);
  const [allInc,       setAllInc]      =useState([]);
  const [sugg,         setSugg]        =useState([]);
  const [pendingCount, setPending]     =useState(0);
  const [budgetRisks,  setBudgetRisks] =useState([]);
  const [selMonth,     setSelMonth]    =useState(()=>{const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;});

  const API="https://smartspend-backend-aupt.onrender.com";

  useEffect(()=>{ if(!token){navigate("/",{replace:true});return;} loadAll(); },[]);
  useEffect(()=>{ const h=()=>loadAll(); window.addEventListener("transaction-confirmed",h); return()=>window.removeEventListener("transaction-confirmed",h); },[]);

  async function loadAll() {
    try { await Promise.all([fetchExp(),fetchInc(),fetchSugg(),fetchRisk(),fetchPending()]); }
    finally { setLoading(false); }
  }
  async function fetchExp() {
    const r=await fetch(`${API}/api/expenses/`,{headers:{Authorization:`Bearer ${token}`}});
    if(r.status===401){logout();return;} const d=await r.json(); setAllExp(Array.isArray(d)?d:[]);
  }
  async function fetchInc() {
    try { const r=await fetch(`${API}/api/income/`,{headers:{Authorization:`Bearer ${token}`}}); if(r.ok){const d=await r.json(); setAllInc(Array.isArray(d)?d:[]); return;} } catch(_){}
    try { const r=await fetch(`${API}/api/summary/`,{headers:{Authorization:`Bearer ${token}`}}); if(r.ok){const d=await r.json(); const n=new Date(); setAllInc([{id:-1,amount:d.total_income||0,date:`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-01`,source:"Summary"}]);} } catch(_){}
  }
  async function fetchSugg() { try{ const r=await fetch(`${API}/api/suggestions/`,{headers:{Authorization:`Bearer ${token}`}}); if(r.ok) setSugg(await r.json()); }catch(_){} }
  async function fetchPending() { try{ const r=await fetch(`${API}/api/detected/pending/count`,{headers:{Authorization:`Bearer ${token}`}}); if(r.ok){const d=await r.json(); setPending(d.count||0);} }catch(_){} }
  async function fetchRisk() { try{ const r=await fetch(`${API}/api/ai/risk`,{headers:{Authorization:`Bearer ${token}`}}); if(r.ok) setBudgetRisks(await r.json()); }catch(_){} }
  async function confirmSugg(id){ await fetch(`${API}/api/suggestions/${id}/confirm`,{method:"POST",headers:{Authorization:`Bearer ${token}`}}); loadAll(); }
  async function rejectSugg(id){ await fetch(`${API}/api/suggestions/${id}/reject`,{method:"POST",headers:{Authorization:`Bearer ${token}`}}); setSugg(sugg.filter(s=>s.id!==id)); }
  function logout(){ localStorage.removeItem("token"); navigate("/",{replace:true}); }

  const monthList=useMemo(()=>buildMonthList(allExp,allInc),[allExp,allInc]);

  const filtExp=useMemo(()=>selMonth==="all"?allExp:allExp.filter(e=>(e.date||e.created_at||"").slice(0,7)===selMonth),[allExp,selMonth]);
  const filtInc=useMemo(()=>selMonth==="all"?allInc:allInc.filter(e=>(e.date||e.created_at||"").slice(0,7)===selMonth),[allInc,selMonth]);

  const totalExp=useMemo(()=>filtExp.reduce((s,e)=>s+e.amount,0),[filtExp]);
  const totalInc=useMemo(()=>filtInc.reduce((s,e)=>s+e.amount,0),[filtInc]);
  const savings=totalInc-totalExp;
  const savRate=totalInc>0?Math.max(0,Math.round((savings/totalInc)*100)):0;

  // Prev month comparison
  const prevKey=useMemo(()=>{ if(selMonth==="all") return null; const [y,mo]=selMonth.split("-").map(Number); const p=new Date(y,mo-2,1); return `${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,"0")}`; },[selMonth]);
  const prevExp=useMemo(()=>prevKey?allExp.filter(e=>(e.date||e.created_at||"").slice(0,7)===prevKey).reduce((s,e)=>s+e.amount,0):null,[allExp,prevKey]);
  const prevInc=useMemo(()=>prevKey?allInc.filter(e=>(e.date||e.created_at||"").slice(0,7)===prevKey).reduce((s,e)=>s+e.amount,0):null,[allInc,prevKey]);
  const expChange=prevExp!=null&&prevExp>0?((totalExp-prevExp)/prevExp*100):undefined;
  const incChange=prevInc!=null&&prevInc>0?((totalInc-prevInc)/prevInc*100):undefined;

  // Categories
  const catMap={};
  filtExp.forEach(t=>{catMap[t.category]=(catMap[t.category]||0)+t.amount;});
  const topCats=Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Budget alerts
  const budgets=JSON.parse(localStorage.getItem("budgets")||"[]");
  const alerts=budgets.map(b=>{
    const spent=filtExp.filter(e=>e.category===b.category).reduce((s,e)=>s+e.amount,0);
    const p=Math.round((spent/b.limit)*100);
    if(p>=90) return {msg:`${b.category} — ${p}% used`,level:"high"};
    if(p>=70) return {msg:`${b.category} — ${p}% used`,level:"warn"};
    return null;
  }).filter(Boolean);

  // Combined recent (income + expense)
  const recentAll=useMemo(()=>{
    const tagged=[...filtExp.map(t=>({...t,_type:"debit"})),...filtInc.map(t=>({...t,_type:"credit"}))];
    return tagged.sort((a,b)=>{
      const da=new Date(((a.created_at||a.date||"").replace(" ","T"))+(!(a.created_at||"").includes("Z")&&!(a.created_at||"").includes("+")?"Z":""));
      const db=new Date(((b.created_at||b.date||"").replace(" ","T"))+(!(b.created_at||"").includes("Z")&&!(b.created_at||"").includes("+")?"Z":""));
      if(db-da!==0) return db-da;
      if(a._type!==b._type) return a._type==="credit"?-1:1;
      return (b.id||0)-(a.id||0);
    }).slice(0,10);
  },[filtExp,filtInc]);

  const monthLabel=useMemo(()=>{ if(selMonth==="all") return "All Time"; const [y,mo]=selMonth.split("-"); return `${MONTHS[+mo-1]} ${y}`; },[selMonth]);
  const hr=new Date().getHours();
  const greeting=hr<12?"Good morning ☀️":hr<17?"Good afternoon 👋":"Good evening 🌙";
  const TX="32px 100px 1fr 90px 88px 150px 76px";

  if(loading) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:28,height:28,border:"2.5px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px"}}/>
        <div style={{fontSize:12,color:"var(--ink3)"}}>Loading your dashboard…</div>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout} pendingCount={pendingCount}/>
      <BottomNav pendingCount={pendingCount}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>

        {/* Mobile top bar */}
        <MobBar greeting={greeting} monthList={monthList} selectedMonth={selMonth} setSelectedMonth={setSelMonth} onLogout={logout}/>

        {/* Desktop header */}
        <div className="desk-hdr" style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"15px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:20,fontWeight:700}}>{greeting}</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>Here's where your money stands — <span style={{color:"var(--accent)",fontWeight:600}}>{monthLabel}</span></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <a href="/add-income" style={{padding:"8px 16px",borderRadius:8,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--ink2)",fontSize:13,fontWeight:500,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>+ Add Income</a>
            <a href="/add-expense" style={{padding:"8px 16px",borderRadius:8,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>+ Add Expense</a>
          </div>
        </div>

        {/* Desktop month bar */}
        <div className="month-bar desk-hdr" style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"9px 28px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <Ico d={IC.cal} s={14} c="var(--accent)"/>
          <span style={{fontSize:13,color:"var(--ink3)"}}>Showing data for</span>
          <select className="month-sel" value={selMonth} onChange={e=>setSelMonth(e.target.value)}>
            <option value="all">📊 All Time</option>
            {monthList.map(m=>{const [y,mo]=m.split("-"); const n=new Date(); const isCur=m===`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`; return <option key={m} value={m}>{isCur?`📅 ${MONTHS[+mo-1]} ${y} — This Month`:`🗓️  ${MONTHS[+mo-1]} ${y}`}</option>;})}
          </select>
        </div>

        {/* SMS banner */}
        {pendingCount>0&&(
          <div style={{background:"var(--bbg)",borderBottom:"1px solid var(--bborder)",padding:"9px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--blue)"}}>
              <Ico d={IC.detect} s={14} c="var(--blue)"/>
              <strong>{pendingCount}</strong> SMS payment{pendingCount>1?"s":""} detected
            </div>
            <a href="/detected-transactions" style={{fontSize:12,fontWeight:600,color:"var(--blue)",textDecoration:"none",borderBottom:"1px solid currentColor"}}>Review →</a>
          </div>
        )}

        {/* ── PAGE CONTENT ── */}
        <div className="page-pad" style={{flex:1,overflowY:"auto",padding:"18px 24px 28px",background:"var(--bg)"}}>

          {/* ── Mobile: Hero Card (matches screenshot) ── */}
          <div className="mob-show" style={{marginBottom:14}}>
            {/* Hero balance card */}
            <div style={{background:"linear-gradient(140deg,#2d1b69 0%,#4c2a9e 60%,#6d3fbd 100%)",borderRadius:20,padding:"22px 20px 20px",color:"#fff",position:"relative",overflow:"hidden",marginBottom:12}}>
              {/* Decorative circles */}
              <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,.06)"}}/>
              <div style={{position:"absolute",bottom:-20,right:40,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,.04)"}}/>
              {/* Label */}
              <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.55)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>MONEY LEFT</div>
              {/* Big number */}
              <div style={{fontSize:38,fontWeight:800,lineHeight:1,marginBottom:4,color:savings>=0?"#fff":"#fb7185",letterSpacing:"-1px"}}>
                {savings<0?"-":""}{fmtK(Math.abs(savings))}
              </div>
              {/* Status */}
              <div style={{fontSize:12,color:"rgba(255,255,255,.55)",marginBottom:18,display:"flex",alignItems:"center",gap:5}}>
                {savings>=0?"✅ In budget":"⚠️ Over budget"}
              </div>
              {/* Income / Spent tiles */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:"rgba(255,255,255,.12)",borderRadius:12,padding:"12px 14px"}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:500,marginBottom:4}}>Income</div>
                  <div style={{fontSize:18,fontWeight:700,color:"#fff"}}>{fmtK(totalInc)}</div>
                </div>
                <div style={{background:"rgba(255,255,255,.12)",borderRadius:12,padding:"12px 14px"}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:500,marginBottom:4}}>Spent</div>
                  <div style={{fontSize:18,fontWeight:700,color:"#fb7185"}}>{fmtK(totalExp)}</div>
                </div>
              </div>
            </div>

            {/* Add Income / Add Expense buttons */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <a href="/add-income" style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderRadius:14,background:"var(--surface)",border:"1px solid var(--border)",textDecoration:"none",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
                <div style={{width:36,height:36,borderRadius:10,background:"var(--gbg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💰</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>Add Income</div>
                  <div style={{fontSize:10,color:"var(--ink3)"}}>Record money in</div>
                </div>
              </a>
              <a href="/add-expense" style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderRadius:14,background:"var(--accent)",textDecoration:"none",boxShadow:"0 2px 8px rgba(124,92,191,.3)"}}>
                <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💸</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Add Expense</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.7)"}}>Record a spend</div>
                </div>
              </a>
            </div>

            {/* Where's it going */}
            {topCats.length>0&&(
              <div className="card" style={{padding:"16px 16px 12px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontSize:14,fontWeight:700,color:"var(--ink)"}}>Where's it going? 🤔</span>
                  <a href="/analytics" style={{fontSize:12,color:"var(--accent)",textDecoration:"none",fontWeight:600}}>See all →</a>
                </div>
                {topCats.map(([cat,amt],i)=>{
                  const p=totalExp>0?(amt/totalExp)*100:0;
                  return (
                    <div key={cat} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                        <span style={{fontSize:13,color:"var(--ink2)",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:16}}>{CAT_EMOJI[cat]||"💳"}</span>{cat}</span>
                        <span style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>{fmtK(amt)}</span>
                      </div>
                      <div className="prog"><div className="prog-fill" style={{width:`${p}%`,background:BAR_COLORS[i]||"var(--accent)"}}/></div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Risk Alert */}
            {budgetRisks.length>0&&(
              <div className="card" style={{padding:"16px",marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--ink)",marginBottom:12}}>AI Risk Alert 📊</div>
                {budgetRisks.slice(0,3).map((r,i)=>{
                  const h=r.risk_level==="HIGH",m=r.risk_level==="MEDIUM";
                  const bg=h?"var(--rbg)":m?"var(--abg)":"var(--gbg)";
                  const col=h?"var(--red)":m?"var(--amber)":"var(--green)";
                  const bdr=h?"var(--rborder)":m?"var(--aborder)":"var(--gborder)";
                  return (
                    <div key={i} style={{padding:"11px 13px",borderRadius:11,marginBottom:8,background:bg,border:`1px solid ${bdr}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <span style={{fontSize:13,fontWeight:700,color:col}}>{r.category}</span>
                        <span style={{fontSize:10,fontWeight:700,color:col,textTransform:"uppercase",letterSpacing:".5px"}}>{r.risk_level}</span>
                      </div>
                      <div style={{fontSize:11,color:"var(--ink3)"}}>{fmtK(r.expected_spend)} expected · {Math.round(r.probability*100)}% chance of overspend</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Budget alerts */}
            {alerts.length>0&&(
              <div className="card" style={{padding:"14px 16px",marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>🔔 Heads up!</div>
                {alerts.map((a,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<alerts.length-1?"1px solid var(--border)":"none"}}>
                    <Ico d={IC.warn} s={13} c={a.level==="high"?"var(--red)":"var(--amber)"}/>
                    <span style={{fontSize:12,color:a.level==="high"?"var(--red)":"var(--amber)"}}>{a.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KPI cards - desktop only */}
          <div className="kpi-grid desk-show f1" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
            <KpiCard label="💰 Income" value={fmtK(totalInc)} icon="💰" iconBg="var(--gbg)" change={incChange} ani="f1"/>
            <KpiCard label="💸 Spent" value={fmtK(totalExp)} icon="💸" iconBg="#faf5ff" change={expChange} ani="f2"/>
            <KpiCard label="💵 Money left" value={(savings<0?"-":"")+fmtK(Math.abs(savings))} icon={savings>=0?"✅":"⚠️"} iconBg={savings>=0?"var(--gbg)":"var(--rbg)"} sub={savings>=0?"In budget 🎉":"Over budget ⚠️"} ani="f3" highlight={savings<0}/>
            <KpiCard label="📈 Savings rate" value={`${savRate}%`} icon="📈" iconBg="#f0f9ff" sub={savRate>30?"Excellent! 🎉":savRate>10?"Keep going":"Save more!"} ani="f4"/>
          </div>

          {/* Main grid */}
          <div className="main-grid f2" style={{display:"grid",gridTemplateColumns:"1fr 316px",gap:14}}>

            {/* Left: Recent transactions */}
            <div className="card" style={{overflow:"hidden"}}>
              {/* Header */}
              <div style={{padding:"13px 18px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontWeight:700,fontSize:15,color:"var(--ink)"}}>Recent Activity</span>
                </div>
                <a href="/transactions" style={{fontSize:13,color:"var(--accent)",textDecoration:"none",fontWeight:600}}>View all →</a>
              </div>

              {/* Desktop table */}
              <div className="desk-tx">
                <div style={{display:"grid",gridTemplateColumns:TX,padding:"8px 16px",background:"#f9fafb",borderBottom:"1px solid var(--border)"}}>
                  {["","Category","Merchant / From","Amount","Kind","Date & Time","Source"].map(h=>(
                    <div key={h} style={{fontSize:10,fontWeight:600,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".5px"}}>{h}</div>
                  ))}
                </div>
                {recentAll.length===0?(
                  <div style={{padding:"36px 20px",textAlign:"center"}}>
                    <div style={{fontSize:24,marginBottom:8}}>🗓️</div>
                    <div style={{fontSize:13,color:"var(--ink3)"}}>No transactions in {monthLabel}.</div>
                    {selMonth!=="all"&&<button onClick={()=>setSelMonth("all")} style={{marginTop:8,fontSize:12,color:"var(--accent)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Show all</button>}
                  </div>
                ):recentAll.map((t,i)=>{
                  const isInc=t._type==="credit";
                  const auto=isAuto(t);
                  const cat=isInc?"Income":(t.category||"Other");
                  const merch=isInc?(t.source||t.merchant||t.merchant_name||t.description||"—"):(t.merchant||t.merchant_name||t.description||"—");
                  const col=isInc?"var(--green)":"var(--red)";
                  const bg=isInc?"var(--gbg)":"var(--rbg)";
                  const bdr=isInc?"var(--gborder)":"var(--rborder)";
                  const bl=isInc?"3px solid var(--green)":auto?"3px solid var(--blue)":"3px solid transparent";
                  return (
                    <div key={`${t._type}-${t.id}-${i}`} className="tx-row"
                      style={{display:"grid",gridTemplateColumns:TX,padding:"10px 16px",borderBottom:i<recentAll.length-1?"1px solid var(--border)":"none",alignItems:"center",borderLeft:bl}}>
                      <div style={{width:28,height:28,borderRadius:8,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{isInc?"💰":(CAT_EMOJI[cat]||"💳")}</div>
                      <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cat}</div>
                      <div style={{fontSize:12,color:"var(--ink3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{merch}</div>
                      <div style={{fontSize:13,fontWeight:700,color:col}}>{isInc?"+":"-"}{fmtK(t.amount)}</div>
                      <span className="badge" style={{background:bg,color:col,border:`1px solid ${bdr}`}}>{isInc?"💰 Income":"💸 Expense"}</span>
                      <div style={{fontSize:11,color:"var(--ink3)"}}>{fmtDate(t.created_at||t.date)}</div>
                      <span className="badge" style={{background:auto?"var(--bbg)":"#f9fafb",color:auto?"var(--blue)":"var(--ink3)",border:`1px solid ${auto?"var(--bborder)":"var(--border)"}`}}>{auto?"🤖 Auto":"✍️ Manual"}</span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile cards */}
              <div className="mob-txn-list" style={{flexDirection:"column",gap:8,padding:"12px"}}>
                {recentAll.length===0?(
                  <div style={{padding:"32px 0",textAlign:"center"}}>
                    <div style={{fontSize:24,marginBottom:8}}>🗓️</div>
                    <div style={{fontSize:13,color:"var(--ink3)"}}>No transactions in {monthLabel}.</div>
                    {selMonth!=="all"&&<button onClick={()=>setSelMonth("all")} style={{marginTop:8,fontSize:12,color:"var(--accent)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Show all</button>}
                  </div>
                ):recentAll.map((t,i)=><TxnCard key={`${t._type}-${t.id}-${i}`} t={t}/>)}
              </div>
            </div>

            {/* Right column (desktop only) */}
            <div className="right-col" style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* Spending breakdown */}
              <div className="card f3" style={{padding:"16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontSize:13,fontWeight:600}}>Where am I spending? 🤔</span>
                  <a href="/analytics" style={{fontSize:11,color:"var(--accent)",textDecoration:"none",fontWeight:500}}>More →</a>
                </div>
                {topCats.length===0?<div style={{fontSize:12,color:"var(--ink3)",textAlign:"center",padding:"14px 0"}}>No data.</div>
                :topCats.map(([cat,amt],i)=>{
                  const p=totalExp>0?(amt/totalExp)*100:0;
                  return (
                    <div key={cat} style={{marginBottom:11}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:12,color:"var(--ink2)"}}>{CAT_EMOJI[cat]||"·"} {cat}</span>
                        <span style={{fontSize:12,fontWeight:600}}>{fmtK(amt)}</span>
                      </div>
                      <div className="prog"><div className="prog-fill" style={{width:`${p}%`,background:BAR_COLORS[i]||"var(--accent)"}}/></div>
                    </div>
                  );
                })}
              </div>

              {/* Budget risks */}
              {budgetRisks.length>0&&(
                <div className="card f4" style={{padding:"16px"}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Overspending risk? 📊</div>
                  {budgetRisks.slice(0,3).map((r,i)=>{
                    const h=r.risk_level==="HIGH",m=r.risk_level==="MEDIUM";
                    const bg=h?"var(--rbg)":m?"var(--abg)":"var(--gbg)";
                    const col=h?"var(--red)":m?"var(--amber)":"var(--green)";
                    return (
                      <div key={i} style={{padding:"9px 11px",borderRadius:8,marginBottom:7,background:bg,border:`1px solid ${h?"var(--rborder)":m?"var(--aborder)":"var(--gborder)"}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                          <span style={{fontSize:12,fontWeight:600,color:col}}>{r.category}</span>
                          <span className="badge" style={{color:col,fontSize:10,padding:0}}>{r.risk_level}</span>
                        </div>
                        <div style={{fontSize:11,color:"var(--ink3)"}}>{fmtK(r.expected_spend)} / {fmtK(r.budget_limit)} · {Math.round(r.probability*100)}% prob</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Alerts */}
              {alerts.length>0&&(
                <div className="card f4" style={{padding:"16px"}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>🔔 Heads up</div>
                  {alerts.map((a,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<alerts.length-1?"1px solid var(--border)":"none"}}>
                      <Ico d={IC.warn} s={13} c={a.level==="high"?"var(--red)":"var(--amber)"}/>
                      <span style={{fontSize:12,color:a.level==="high"?"var(--red)":"var(--amber)"}}>{a.msg}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {sugg.length>0&&(
                <div className="card f5" style={{padding:"16px"}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>🤖 Did you forget?</div>
                  {sugg.slice(0,2).map(s=>(
                    <div key={s.id} style={{padding:"10px 11px",borderRadius:8,marginBottom:8,border:"1px solid var(--border)"}}>
                      <div style={{fontSize:12,color:"var(--ink2)",marginBottom:8}}>Add <strong>{fmtK(s.suggested_amount)}</strong> for {s.category}?</div>
                      <div style={{display:"flex",gap:7}}>
                        <button onClick={()=>confirmSugg(s.id)} style={{flex:1,padding:"6px",borderRadius:6,cursor:"pointer",background:"var(--accent)",border:"none",color:"#fff",fontSize:12,fontWeight:500,fontFamily:"inherit"}}>Confirm</button>
                        <button onClick={()=>rejectSugg(s.id)} style={{flex:1,padding:"6px",borderRadius:6,cursor:"pointer",background:"transparent",border:"1px solid var(--border)",color:"var(--ink3)",fontSize:12,fontFamily:"inherit"}}>Dismiss</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick actions */}
              <div className="f5" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {label:"Add Income", href:"/add-income", emoji:"💰",bg:"var(--gbg)",col:"var(--green)"},
                  {label:"Add Expense",href:"/add-expense",emoji:"💸",bg:"var(--rbg)", col:"var(--red)"},
                  {label:"My Goals",   href:"/goals",       emoji:"🎯",bg:"#f5f3ff",   col:"var(--accent)"},
                  {label:"Analytics",  href:"/analytics",   emoji:"📊",bg:"var(--bbg)",col:"var(--blue)"},
                ].map(a=>(
                  <a key={a.label} href={a.href} className="mob-action" style={{background:a.bg}}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform=""}>
                    <span style={{fontSize:20}}>{a.emoji}</span>
                    <span style={{fontSize:11,fontWeight:600,color:a.col}}>{a.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: Recent Activity section (below txn list, matching screenshot) */}
          <div className="mob-show" style={{marginTop:0}}>
            {/* SMS pending banner on mobile */}
            {pendingCount>0&&(
              <div style={{background:"var(--bbg)",border:"1px solid var(--bborder)",borderRadius:12,padding:"12px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"var(--blue)"}}><strong>{pendingCount}</strong> SMS payment{pendingCount>1?"s":""} to review</span>
                <a href="/detected-transactions" style={{fontSize:12,fontWeight:700,color:"var(--blue)",textDecoration:"none"}}>Review →</a>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}