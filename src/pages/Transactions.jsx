import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --sidebar-bg:#2d1b69; --sidebar-hover:rgba(255,255,255,0.08); --sidebar-active:rgba(255,255,255,0.15);
    --sidebar-text:rgba(255,255,255,0.75); --sidebar-muted:rgba(255,255,255,0.4);
    --accent:#7c5cbf; --bg:#f7f7f8; --surface:#ffffff; --border:#e5e7eb;
    --ink:#111827; --ink2:#374151; --ink3:#6b7280; --ink4:#9ca3af;
    --green:#059669; --green-bg:#ecfdf5; --red:#dc2626; --red-bg:#fef2f2;
    --amber:#d97706; --amber-bg:#fffbeb; --blue:#2563eb; --blue-bg:#eff6ff;
  }
  html,body { font-family:'Inter',system-ui,sans-serif; background:var(--bg); color:var(--ink); -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
  @keyframes fadeIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes slideRight{ from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes fadeBack  { from{opacity:0} to{opacity:1} }
  .fade  { animation:fadeIn .3s ease both }
  .f1    { animation:fadeIn .3s .05s ease both }
  .f2    { animation:fadeIn .3s .10s ease both }
  .slink { transition:background .15s,color .15s; cursor:pointer }
  .slink:hover  { background:var(--sidebar-hover)  !important; color:#fff !important }
  .slink.active { background:var(--sidebar-active) !important; color:#fff !important }
  .inp { padding:8px 12px; border-radius:7px; border:1px solid var(--border); font-size:13px; font-family:inherit; color:var(--ink); outline:none; background:var(--surface); transition:border-color .15s; }
  .inp:focus { border-color:var(--accent); }
  .txrow { transition:background .12s; cursor:pointer; }
  .txrow:hover   { background:#f0f4ff !important; }
  .txrow.selected{ background:#eff6ff !important; }
  .badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:99px; font-size:11px; font-weight:500; }
  .pulse  { animation:pulse 2s infinite; }
  .drawer { animation:slideRight .22s ease both; }
  .overlay{ animation:fadeBack .2s ease both; }
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__tx_v3__")) return;
  const s=document.createElement("style"); s.id="__tx_v3__"; s.textContent=CSS;
  document.head.appendChild(s);
}

const fmt     = n => new Intl.NumberFormat("en-IN",{maximumFractionDigits:0}).format(n);
const isAutoTx = t => t.is_auto===true||t.is_auto===1||t.is_auto==="true"||t.is_auto==="1";

const CAT_EMOJI = {
  Food:"🍜",Transport:"🚗",Shopping:"🛍️",Entertainment:"🎬",
  Health:"💊",Utilities:"⚡",Groceries:"🛒",Coffee:"☕",
  Books:"📚",Bills:"📃",Travel:"✈️",Medicine:"💊",Other:"💳",
};

const Icon = ({d,size=14,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const ICONS = {
  home:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  tx:      "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  analytics:"M18 20V10M12 20V4M6 20v-6",
  goals:   "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  budget:  "M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
  detect:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  reminder:"M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  logout:  "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  x:       "M18 6L6 18M6 6l12 12",
  cal:     "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
};

const NAV_SECTIONS = [
  {label:null,items:[{to:"/dashboard",label:"Home",icon:"home"}]},
  {label:"Track Money",items:[
    {to:"/transactions",label:"Transactions",icon:"tx"},
    {to:"/analytics",   label:"Analytics",   icon:"analytics"},
    {to:"/goals",       label:"My Goals",    icon:"goals"},
    {to:"/budgets",     label:"My Budgets",  icon:"budget"},
  ]},
  {label:"Auto Features",items:[
    {to:"/detected-transactions",label:"SMS Detected",icon:"detect"},
    {to:"/reminders",            label:"Reminders",   icon:"reminder"},
  ]},
];

function Sidebar({onLogout}) {
  const path=window.location.pathname;
  return (
    <aside style={{width:200,flexShrink:0,background:"var(--sidebar-bg)",display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,overflow:"hidden"}}>
      <div style={{padding:"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#7c5cbf,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff"}}>S</div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",lineHeight:1}}>SmartSpend</div>
          <div style={{fontSize:10,color:"var(--sidebar-muted)",marginTop:2}}>Student Finance</div>
        </div>
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"10px"}}>
        {NAV_SECTIONS.map((sec,si)=>(
          <div key={si} style={{marginBottom:6}}>
            {sec.label&&<div style={{fontSize:10,fontWeight:600,color:"var(--sidebar-muted)",letterSpacing:"1px",textTransform:"uppercase",padding:"8px 8px 4px"}}>{sec.label}</div>}
            {sec.items.map(item=>(
              <a key={item.to} href={item.to} className={`slink${path===item.to?" active":""}`}
                style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,color:"var(--sidebar-text)",fontSize:13,textDecoration:"none",marginBottom:1}}>
                <Icon d={ICONS[item.icon]} size={14}/>{item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <button onClick={onLogout} className="slink"
          style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,background:"transparent",border:"none",color:"var(--sidebar-text)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          <Icon d={ICONS.logout} size={14}/> Sign Out
        </button>
      </div>
    </aside>
  );
}

function fmtDateTime(raw) {
  if (!raw) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    const [y,m,d]=raw.split("-");
    return new Date(+y,+m-1,+d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  }
  const utc=(raw.endsWith("Z")||raw.includes("+"))?raw:raw.replace(" ","T")+"Z";
  return new Date(utc).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true});
}

function txDate(t) {
  const raw = t.date || (t.created_at||"").slice(0,10);
  return raw ? raw.slice(0,10) : null;
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({txn,onClose}) {
  if (!txn) return null;
  const auto    = isAutoTx(txn);
  const merchant= txn.merchant||txn.merchant_name||txn.description||null;
  const dateStr = fmtDateTime(txn.created_at||txn.date);
  const rows = [
    {emoji:"🏷️",label:"Category",         value:txn.category||"—"},
    {emoji:"🏪",label:"Merchant / Paid to",value:merchant||"—"},
    {emoji:"💰",label:"Amount",            value:"₹"+fmt(txn.amount)},
    {emoji:"📅",label:"Date & Time",       value:dateStr},
    {emoji:"📲",label:"Source",            value:auto?"Auto-detected from SMS":"Added manually"},
    {emoji:"🔢",label:"Transaction ID",    value:"#"+txn.id},
  ];
  return (
    <>
      <div className="overlay" onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(17,24,39,.4)",zIndex:100,backdropFilter:"blur(2px)"}}/>
      <div className="drawer" style={{position:"fixed",top:0,right:0,bottom:0,width:380,background:"var(--surface)",zIndex:101,boxShadow:"-8px 0 40px rgba(0,0,0,.15)",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--ink)"}}>Transaction Details</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:7,border:"1px solid var(--border)",background:"var(--bg)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon d={ICONS.x} size={13} color="var(--ink3)"/>
          </button>
        </div>
        <div style={{margin:"18px 22px 0",padding:"22px",borderRadius:14,textAlign:"center",background:auto?"linear-gradient(135deg,#eff6ff,#dbeafe)":"linear-gradient(135deg,#faf5ff,#ede9fe)",border:`1px solid ${auto?"#bfdbfe":"#ddd6fe"}`}}>
          <div style={{fontSize:38,marginBottom:8}}>{CAT_EMOJI[txn.category]||"💳"}</div>
          <div style={{fontSize:32,fontWeight:800,color:"var(--ink)",marginBottom:4}}>₹{fmt(txn.amount)}</div>
          <div style={{fontSize:13,color:"var(--ink3)",marginBottom:10}}>{txn.category}{merchant?" · "+merchant:""}</div>
          <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:600,background:auto?"var(--blue-bg)":"var(--amber-bg)",color:auto?"var(--blue)":"var(--amber)",border:`1px solid ${auto?"#bfdbfe":"#fde68a"}`}}>
            {auto?"Auto from SMS":"Manual entry"}
          </span>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 22px"}}>
          {rows.map((row,i)=>(
            <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:i<rows.length-1?"1px solid var(--border)":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>{row.emoji}</span>
                <span style={{fontSize:12,color:"var(--ink3)",fontWeight:500}}>{row.label}</span>
              </div>
              <span style={{fontSize:13,fontWeight:600,color:"var(--ink)",textAlign:"right",maxWidth:200,wordBreak:"break-word"}}>{row.value}</span>
            </div>
          ))}
        </div>
        <div style={{padding:"14px 22px",borderTop:"1px solid var(--border)"}}>
          <button onClick={onClose} style={{width:"100%",padding:"11px",borderRadius:9,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Close</button>
        </div>
      </div>
    </>
  );
}



// ── Summary Bar (date range) ──────────────────────────────────────────────────
function SummaryBar({filtered,totalAmt,dateFrom,dateTo,category}) {
  const topCatMap={};
  filtered.forEach(t=>{topCatMap[t.category]=(topCatMap[t.category]||0)+t.amount;});
  const topCat=Object.entries(topCatMap).sort((a,b)=>b[1]-a[1])[0];

  const fmtD = d => d ? new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "";
  const rangeLabel = dateFrom && dateTo ? `${fmtD(dateFrom)} – ${fmtD(dateTo)}`
    : dateFrom ? `From ${fmtD(dateFrom)}` : dateTo ? `Until ${fmtD(dateTo)}`
    : category || "Filtered";

  const autoAmt = filtered.filter(isAutoTx).reduce((s,t)=>s+t.amount,0);
  const cards = [
    {label:"Total Spent",  value:"₹"+fmt(totalAmt),  sub:filtered.length+" transactions"},
    {label:"Top Category", value:topCat?(CAT_EMOJI[topCat[0]]||"")+" "+topCat[0]:"—", sub:topCat?"₹"+fmt(topCat[1]):""},
    {label:"Auto (SMS)",   value:"₹"+fmt(autoAmt),   sub:filtered.filter(isAutoTx).length+" txns"},
    {label:"Manual",       value:"₹"+fmt(totalAmt-autoAmt), sub:filtered.filter(t=>!isAutoTx(t)).length+" txns"},
  ];
  return (
    <div className="fade" style={{marginBottom:16,background:"linear-gradient(135deg,#2d1b69,#4c3494)",borderRadius:12,padding:"18px 22px"}}>
      <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.55)",marginBottom:12,textTransform:"uppercase",letterSpacing:"1.2px"}}>
        Summary — {rangeLabel}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {cards.map(c=>(
          <div key={c.label} style={{background:"rgba(255,255,255,.1)",borderRadius:9,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,.55)",marginBottom:5,fontWeight:600,textTransform:"uppercase",letterSpacing:".5px"}}>{c.label}</div>
            <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:2}}>{c.value}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Quick range presets ───────────────────────────────────────────────────────
function todayStr()  { return new Date().toISOString().slice(0,10); }
function offsetDay(n){ const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
function startOfMonth(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; }
const QUICK_RANGES = [
  {label:"Today",      from:()=>todayStr(),    to:()=>todayStr()},
  {label:"Yesterday",  from:()=>offsetDay(-1), to:()=>offsetDay(-1)},
  {label:"Last 7 days",from:()=>offsetDay(-6), to:()=>todayStr()},
  {label:"Last 30 days",from:()=>offsetDay(-29),to:()=>todayStr()},
  {label:"This month", from:()=>startOfMonth(),to:()=>todayStr()},
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Transactions() {
  injectCSS();
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  const [all,      setAll]      = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  const CATEGORIES = ["Food","Bills","Shopping","Entertainment","Travel","Medicine","Groceries","Other"];
  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(()=>{
    if (!token){navigate("/",{replace:true});return;}
    load();
    const iv=setInterval(load,5000);
    return ()=>clearInterval(iv);
  },[]);

  useEffect(()=>{ applyFilters(); },[search,category,dateFrom,dateTo,all]);

  async function load() {
    try {
      const r=await fetch(`${API}/api/expenses/`,{headers:{Authorization:`Bearer ${token}`}});
      if (!r.ok){localStorage.removeItem("token");navigate("/",{replace:true});return;}
      const data=await r.json();
      data.sort((a,b)=>{
        if (b.id&&a.id&&b.id!==a.id) return b.id-a.id;
        const da=new Date((a.created_at||a.date||"").replace(" ","T")+"Z");
        const db=new Date((b.created_at||b.date||"").replace(" ","T")+"Z");
        return db-da;
      });
      setAll(data);
      setLastSync(new Date());
    } finally { setLoading(false); setSpinning(false); }
  }

  function applyFilters() {
    let list=[...all];
    if (search)   list=list.filter(t=>t.category?.toLowerCase().includes(search.toLowerCase())||t.merchant?.toLowerCase().includes(search.toLowerCase()));
    if (category) list=list.filter(t=>t.category===category);
    if (dateFrom) list=list.filter(t=>{ const d=txDate(t); return d && d>=dateFrom; });
    if (dateTo)   list=list.filter(t=>{ const d=txDate(t); return d && d<=dateTo;   });
    setFiltered(list);
  }

  function applyPreset(preset) {
    const f=preset.from(); const t=preset.to();
    setDateFrom(f); setDateTo(t); setActivePreset(preset.label);
  }

  function clearFilters() { setSearch(""); setCategory(""); setDateFrom(""); setDateTo(""); setActivePreset(null); }

  const hasFilters = search||category||dateFrom||dateTo;
  function logout(){localStorage.removeItem("token");navigate("/",{replace:true});}

  const autoCount   = filtered.filter(isAutoTx).length;
  const manualCount = filtered.length-autoCount;
  const totalAmt    = filtered.reduce((s,t)=>s+t.amount,0);
  const autoAmt     = filtered.filter(isAutoTx).reduce((s,t)=>s+t.amount,0);
  const manualAmt   = totalAmt-autoAmt;

  if (loading) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:28,height:28,border:"2.5px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px"}}/>
        <div style={{fontSize:12,color:"var(--ink3)"}}>Loading your transactions…</div>
      </div>
    </div>
  );

  const COLS    = "44px 130px 1fr 100px 190px 95px";
  const HEADERS = ["","Category","Merchant","Amount","Date & Time","Type"];

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout}/>
      <DetailDrawer txn={selected} onClose={()=>setSelected(null)}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Header */}
        <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)"}}>My Transactions</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>Click any row to see full details</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {lastSync&&(
              <div style={{fontSize:11,color:"var(--ink4)"}}>
                <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"var(--green)",marginRight:5}} className="pulse"/>
                Synced {lastSync.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
              </div>
            )}
            <button onClick={()=>{setSpinning(true);load();}} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:7,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--ink2)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
              <span style={{display:"inline-block",animation:spinning?"spin .7s linear infinite":"none"}}><Icon d={ICONS.refresh} size={13}/></span>
              Refresh
            </button>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"24px 28px",background:"var(--bg)"}}>

          {/* ── Stats row ── */}
          <div className="fade" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
            {[
              {label:"Transactions shown", val:filtered.length,             sub:"matching filters",            col:"var(--ink)",   bg:"var(--surface)"},
              {label:"Total spent",        val:"₹"+fmt(totalAmt),           sub:"in selected range",           col:"var(--accent)",bg:"#faf5ff"},
              {label:"Auto-detected (SMS)",val:"₹"+fmt(autoAmt),            sub:autoCount+" txns • saved time",col:"var(--blue)",  bg:"var(--blue-bg)"},
              {label:"Added manually",     val:"₹"+fmt(manualAmt),          sub:manualCount+" txns • by you",  col:"var(--amber)", bg:"var(--amber-bg)"},
            ].map(s=>(
              <div key={s.label} style={{background:s.bg,border:"1px solid var(--border)",borderRadius:10,padding:"16px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--ink3)",marginBottom:8}}>{s.label}</div>
                <div style={{fontSize:typeof s.val==="string"?18:26,fontWeight:700,color:s.col,marginBottom:2}}>{s.val}</div>
                <div style={{fontSize:11,color:"var(--ink4)"}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Filter bar ── */}
          <div className="f1" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"14px 18px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
            {/* Row 1: search + category */}
            <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:160}}>
                <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                  <Icon d={ICONS.search} size={13} color="var(--ink4)"/>
                </span>
                <input placeholder="Search category or merchant…" value={search} onChange={e=>setSearch(e.target.value)} className="inp" style={{paddingLeft:30,width:"100%"}}/>
              </div>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="inp" style={{minWidth:150}}>
                <option value="">All categories</option>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              {hasFilters&&(
                <button onClick={clearFilters} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",borderRadius:7,background:"var(--red-bg)",border:"1px solid #fecaca",color:"var(--red)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                  <Icon d={ICONS.x} size={12} color="var(--red)"/> Clear all
                </button>
              )}
            </div>

            {/* Row 2: date range */}
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <Icon d={ICONS.cal} size={14} color="var(--ink4)"/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div>
                  <div style={{fontSize:10,color:"var(--ink4)",marginBottom:3,fontWeight:600}}>FROM</div>
                  <input type="date" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setActivePreset(null);}} className="inp" style={{width:145}}/>
                </div>
                <div style={{fontSize:13,color:"var(--ink4)",marginTop:14}}>→</div>
                <div>
                  <div style={{fontSize:10,color:"var(--ink4)",marginBottom:3,fontWeight:600}}>TO</div>
                  <input type="date" value={dateTo} onChange={e=>{setDateTo(e.target.value);setActivePreset(null);}} className="inp" style={{width:145}}/>
                </div>
              </div>

              {/* Quick range presets */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginLeft:4}}>
                {QUICK_RANGES.map(p=>(
                  <button key={p.label} type="button" onClick={()=>applyPreset(p)}
                    style={{
                      padding:"5px 11px",borderRadius:99,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",
                      border:    activePreset===p.label?"1.5px solid var(--accent)":"1.5px solid var(--border)",
                      background:activePreset===p.label?"rgba(124,92,191,.08)":"var(--surface)",
                      color:     activePreset===p.label?"var(--accent)":"var(--ink3)",
                      transition:"all .12s",
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>

              <div style={{fontSize:11,color:"var(--ink4)",marginLeft:"auto",whiteSpace:"nowrap"}}>
                {filtered.length} of {all.length} · ₹{fmt(totalAmt)}
              </div>
            </div>
          </div>

          {/* ── Summary bar (when filtered) ── */}
          {hasFilters&&filtered.length>0&&(
            <SummaryBar filtered={filtered} totalAmt={totalAmt} dateFrom={dateFrom} dateTo={dateTo} category={category}/>
          )}

          {/* ── Table ── */}
          <div className="f2" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
            <div style={{display:"grid",gridTemplateColumns:COLS,padding:"8px 20px",background:"#f9fafb",borderBottom:"1px solid var(--border)"}}>
              {HEADERS.map(h=>(
                <div key={h} style={{fontSize:11,fontWeight:600,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".5px"}}>{h}</div>
              ))}
            </div>

            {filtered.length===0?(
              <div style={{padding:"48px 20px",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                <div style={{fontSize:14,fontWeight:500,color:"var(--ink2)",marginBottom:4}}>No transactions found</div>
                <div style={{fontSize:12,color:"var(--ink3)"}}>{hasFilters?"Try changing the date range or filters":"You haven't logged any expenses yet"}</div>
                {hasFilters&&<button onClick={clearFilters} style={{marginTop:12,padding:"7px 16px",borderRadius:7,background:"var(--accent)",border:"none",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Clear all filters</button>}
              </div>
            ):filtered.map((t,i)=>{
              const auto      =isAutoTx(t);
              const merchant  =t.merchant||t.merchant_name||t.description||null;
              const dateStr   =fmtDateTime(t.created_at||t.date);
              const isSelected=selected?.id===t.id;
              return (
                <div key={t.id||i}
                  className={`txrow${isSelected?" selected":""}`}
                  onClick={()=>setSelected(isSelected?null:t)}
                  style={{display:"grid",gridTemplateColumns:COLS,padding:"11px 20px",alignItems:"center",borderBottom:i<filtered.length-1?"1px solid var(--border)":"none",borderLeft:`3px solid ${auto?"var(--blue)":"transparent"}`}}>
                  <div style={{width:32,height:32,borderRadius:8,background:auto?"var(--blue-bg)":"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>
                    {CAT_EMOJI[t.category]||"💳"}
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>{t.category||"—"}</div>
                  <div style={{fontSize:13,color:"var(--ink3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {merchant||<span style={{color:"var(--ink4)",fontStyle:"italic"}}>—</span>}
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:"var(--ink)"}}>₹{fmt(t.amount)}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:"var(--ink2)"}}>{dateStr.split(",")[0]}</div>
                    <div style={{fontSize:11,color:"var(--ink4)",marginTop:1}}>{dateStr.split(",").slice(1).join(",").trim()}</div>
                  </div>
                  <span className="badge" style={{background:auto?"var(--blue-bg)":"var(--amber-bg)",color:auto?"var(--blue)":"var(--amber)",border:`1px solid ${auto?"#bfdbfe":"#fde68a"}`,fontSize:10}}>
                    {auto?"Auto":"Manual"}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"var(--ink4)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <span className="pulse" style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"var(--green)"}}/>
            Auto-updates every 5 seconds · Click any row for full details
          </div>
        </div>
      </div>
    </div>
  );
}