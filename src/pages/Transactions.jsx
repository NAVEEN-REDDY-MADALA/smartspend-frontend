import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --sidebar-bg:#2d1b69; --sidebar-hover:rgba(255,255,255,0.08); --sidebar-active:rgba(255,255,255,0.15);
    --sidebar-text:rgba(255,255,255,0.75); --sidebar-muted:rgba(255,255,255,0.4);
    --accent:#7c5cbf; --bg:#f4f3f8; --surface:#ffffff; --border:#e5e7eb;
    --ink:#111827; --ink2:#374151; --ink3:#6b7280; --ink4:#9ca3af;
    --green:#059669; --green-bg:#ecfdf5; --green-border:#a7f3d0;
    --red:#dc2626;   --red-bg:#fef2f2;   --red-border:#fecaca;
    --amber:#d97706; --amber-bg:#fffbeb; --amber-border:#fde68a;
    --blue:#2563eb;  --blue-bg:#eff6ff;  --blue-border:#bfdbfe;
    --purple:#7c3aed; --purple-bg:#f5f3ff; --purple-border:#ddd6fe;
    --font: 'Plus Jakarta Sans', system-ui, sans-serif;
    --bottom-nav-h: 64px;
  }
  html,body { font-family:var(--font); background:var(--bg); color:var(--ink); -webkit-font-smoothing:antialiased; overscroll-behavior:none; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
  @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes slideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes fadeBack   { from{opacity:0} to{opacity:1} }
  @keyframes slideUp    { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
  .fade { animation:fadeIn .3s ease both }
  .f1   { animation:fadeIn .3s .05s ease both }
  .f2   { animation:fadeIn .3s .10s ease both }
  .slink { transition:background .15s,color .15s; cursor:pointer; text-decoration:none; display:flex; }
  .slink:hover  { background:var(--sidebar-hover)  !important; color:#fff !important }
  .slink.active { background:var(--sidebar-active) !important; color:#fff !important }
  .inp { padding:8px 12px; border-radius:7px; border:1px solid var(--border); font-size:13px; font-family:inherit; color:var(--ink); outline:none; background:var(--surface); transition:border-color .15s; }
  .inp:focus { border-color:var(--accent); }
  .txrow { transition:background .12s; cursor:pointer; }
  .txrow:hover   { background:#f0f4ff !important; }
  .txrow.selected{ background:#eff6ff !important; }
  .badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:99px; font-size:11px; font-weight:600; }
  .pulse { animation:pulse 2s infinite; }
  .drawer  { animation:slideRight .22s ease both; }
  .overlay { animation:fadeBack .2s ease both; }

  /* Layout switching */
  .desktop-sidebar { display:flex; }
  .bottom-nav      { display:none; }
  .mobile-header   { display:none; }
  .desktop-header  { display:flex; }
  .desktop-only    { display:block; }
  .mobile-only     { display:none; }

  @media (max-width:768px) {
    .desktop-sidebar { display:none !important; }
    .bottom-nav      { display:flex !important; }
    .mobile-header   { display:flex !important; }
    .desktop-header  { display:none !important; }
    .desktop-only    { display:none !important; }
    .mobile-only     { display:flex !important; }
    .main-scroll     { padding:12px 14px calc(var(--bottom-nav-h) + 20px) !important; }
    .summary-grid    { grid-template-columns:1fr 1fr !important; gap:8px !important; }
    .summary-grid > div:first-child { grid-column:1/-1; }
  }

  /* Bottom nav */
  .bottom-nav {
    position:fixed; bottom:0; left:0; right:0; z-index:100;
    height:var(--bottom-nav-h);
    background:var(--sidebar-bg);
    border-top:1px solid rgba(255,255,255,.1);
    align-items:center; justify-content:space-around;
    padding:0 8px; padding-bottom:env(safe-area-inset-bottom,0px);
  }
  .bnav-item {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:6px 10px; border-radius:10px; cursor:pointer;
    text-decoration:none; color:var(--sidebar-muted);
    font-size:10px; font-weight:600; font-family:var(--font);
    transition:all .2s; position:relative; min-width:52px;
  }
  .bnav-item.active { color:#fff; background:rgba(255,255,255,.12); }

  /* Sheet */
  .sheet-overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.45); backdrop-filter:blur(2px); }
  .sheet-panel {
    position:fixed; bottom:0; left:0; right:0; z-index:201;
    background:var(--surface); border-radius:20px 20px 0 0;
    max-height:85vh; overflow-y:auto;
    animation:slideUp .3s cubic-bezier(.34,1.2,.64,1) both;
    padding-bottom:env(safe-area-inset-bottom,16px);
  }
  .sheet-handle { width:38px; height:4px; background:var(--border); border-radius:99px; margin:10px auto 0; }
  .tx-card { transition:transform .1s,box-shadow .15s; }
  .tx-card:active { transform:scale(.99); box-shadow:0 2px 12px rgba(0,0,0,.1); }
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__tx_v5__")) return;
  const s=document.createElement("style"); s.id="__tx_v5__"; s.textContent=CSS;
  document.head.appendChild(s);
}

const fmt      = n => new Intl.NumberFormat("en-IN",{maximumFractionDigits:0}).format(n);
const isAutoTx = t => t.is_auto===true||t.is_auto===1||t.is_auto==="true"||t.is_auto==="1";

const CAT_EMOJI = {
  Food:"🍜", Transport:"🚗", Shopping:"🛍️", Entertainment:"🎬",
  Health:"💊", Utilities:"⚡", Groceries:"🛒", Coffee:"☕",
  Books:"📚", Bills:"📃", Travel:"✈️", Medicine:"💊",
  Income:"💰", Salary:"💼", Refund:"↩️", Cashback:"🎁", Other:"💳",
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
  filter:  "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
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

const BOTTOM_NAV = [
  {to:"/dashboard",             label:"Home",     icon:"home"    },
  {to:"/transactions",          label:"Txns",     icon:"tx"      },
  {to:"/detected-transactions", label:"SMS",      icon:"detect"  },
  {to:"/analytics",             label:"Analytics",icon:"analytics"},
  {to:"/reminders",             label:"Remind",   icon:"reminder"},
];

function Sidebar({ onLogout }) {
  const location = useLocation();
  const path = location.pathname;
  return (
    <aside className="desktop-sidebar" style={{width:200,flexShrink:0,background:"var(--sidebar-bg)",flexDirection:"column",height:"100vh",position:"sticky",top:0,overflow:"hidden"}}>
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
              <Link key={item.to} to={item.to}
                className={`slink${path===item.to?" active":""}`}
                style={{alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,color:"var(--sidebar-text)",fontSize:13,marginBottom:1}}>
                <Icon d={ICONS[item.icon]} size={14}/>{item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <button onClick={onLogout} className="slink"
          style={{width:"100%",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,background:"transparent",border:"none",color:"var(--sidebar-text)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          <Icon d={ICONS.logout} size={14}/> Sign Out
        </button>
      </div>
    </aside>
  );
}

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  return (
    <nav className="bottom-nav">
      {BOTTOM_NAV.map(item=>(
        <Link key={item.to} to={item.to} className={`bnav-item${path===item.to?" active":""}`}>
          <Icon d={ICONS[item.icon]} size={20}/>
          {item.label}
        </Link>
      ))}
    </nav>
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
  const raw=t.date||(t.created_at||"").slice(0,10);
  return raw?raw.slice(0,10):null;
}

// Shared helper — gets display values for any transaction
function getTxDisplay(t) {
  const isCredit = t._type==="credit";
  const auto     = isAutoTx(t);
  const merchant = isCredit?(t.source||t.merchant||null):(t.merchant||t.merchant_name||t.description||null);
  const category = isCredit?"Income":(t.category||t.category_guess||"Other");
  const dateStr  = fmtDateTime(t.created_at||t.date);
  const accentColor = isCredit?"var(--green)":"var(--red)";
  const accentBg    = isCredit?"var(--green-bg)":"var(--red-bg)";
  const accentBorder= isCredit?"var(--green-border)":"var(--red-border)";
  const borderColor = isCredit?"var(--green)":auto?"var(--blue)":"transparent";
  return {isCredit,auto,merchant,category,dateStr,accentColor,accentBg,accentBorder,borderColor};
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ txn, onClose }) {
  if (!txn) return null;
  const {isCredit,auto,merchant,category,dateStr,accentColor,accentBg,accentBorder} = getTxDisplay(txn);

  const rows = [
    {emoji:"🏷️",label:"Type",          value:isCredit?"💰 Income / Credit":"💸 Expense / Debit"},
    {emoji:"📂",label:"Category",       value:category},
    {emoji:"🏪",label:"Merchant / From",value:merchant||"—"},
    {emoji:"💵",label:"Amount",         value:(isCredit?"+":"−")+" ₹"+fmt(txn.amount)},
    {emoji:"📅",label:"Date & Time",    value:dateStr},
    {emoji:"📲",label:"Source",         value:auto?"Auto-detected from SMS":"Added manually"},
    {emoji:"🔢",label:"Transaction ID", value:"#"+txn.id},
  ];

  return (
    <>
      <div className="overlay" onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(17,24,39,.4)",zIndex:100,backdropFilter:"blur(2px)"}}/>
      <div className="drawer" style={{position:"fixed",top:0,right:0,bottom:0,width:"min(380px,100vw)",background:"var(--surface)",zIndex:101,boxShadow:"-8px 0 40px rgba(0,0,0,.15)",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--ink)"}}>Transaction Details</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:7,border:"1px solid var(--border)",background:"var(--bg)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon d={ICONS.x} size={13} color="var(--ink3)"/>
          </button>
        </div>
        <div style={{margin:"18px 22px 0",padding:"22px",borderRadius:14,textAlign:"center",background:accentBg,border:`1px solid ${accentBorder}`}}>
          <div style={{fontSize:36,marginBottom:8}}>{CAT_EMOJI[category]||(isCredit?"💰":"💳")}</div>
          <div style={{fontSize:30,fontWeight:800,color:accentColor,marginBottom:4,fontFamily:"'Sora',sans-serif"}}>
            {isCredit?"+":"−"}₹{fmt(txn.amount)}
          </div>
          <div style={{fontSize:12,color:"var(--ink3)",marginBottom:10}}>{category}{merchant?" · "+merchant:""}</div>
          <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:600,
              background:accentBg,color:accentColor,border:`1px solid ${accentBorder}`}}>
              {isCredit?"💰 Income":"💸 Expense"}
            </span>
            <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:600,
              background:auto?"var(--blue-bg)":"var(--amber-bg)",color:auto?"var(--blue)":"var(--amber)",
              border:`1px solid ${auto?"var(--blue-border)":"var(--amber-border)"}`}}>
              {auto?"🤖 Auto SMS":"✍️ Manual"}
            </span>
          </div>
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

// ── Mobile Filter Sheet ───────────────────────────────────────────────────────
function FilterSheet({ typeFilter, setTypeFilter, search, setSearch, category, setCategory, dateFrom, setDateFrom, dateTo, setDateTo, onClose, onClear }) {
  const CATEGORIES = ["Food","Bills","Shopping","Entertainment","Travel","Medicine","Groceries","Income","Salary","Other"];
  const chip = (active) => ({
    padding:"9px 18px", borderRadius:99, fontSize:13, fontWeight:600,
    background:active?"var(--accent)":"var(--bg)",
    color:active?"#fff":"var(--ink3)",
    border:active?"none":"1px solid var(--border)",
    cursor:"pointer", fontFamily:"inherit",
  });
  return (
    <>
      <div className="sheet-overlay" onClick={onClose}/>
      <div className="sheet-panel">
        <div className="sheet-handle"/>
        <div style={{padding:"16px 20px 8px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <span style={{fontSize:16,fontWeight:700,color:"var(--ink)"}}>Filter Transactions</span>
            <div style={{display:"flex",gap:8}}>
              <button onClick={onClear} style={{fontSize:12,color:"var(--accent)",background:"none",border:"none",cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>Clear all</button>
              <button onClick={onClose} style={{width:30,height:30,borderRadius:99,border:"1px solid var(--border)",background:"var(--bg)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon d={ICONS.x} size={13} color="var(--ink3)"/>
              </button>
            </div>
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:10}}>Transaction Type</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[{value:"all",label:"All"},{value:"debit",label:"💸 Expenses"},{value:"credit",label:"💰 Income"}].map(opt=>(
                <button key={opt.value} style={chip(typeFilter===opt.value)} onClick={()=>setTypeFilter(opt.value)}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:10}}>Search</div>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d={ICONS.search} size={14} color="var(--ink4)"/></span>
              <input placeholder="Search category or merchant…" value={search}
                onChange={e=>setSearch(e.target.value)} className="inp"
                style={{paddingLeft:38,width:"100%",padding:"12px 12px 12px 38px",fontSize:14}}/>
            </div>
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:10}}>Category</div>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="inp" style={{width:"100%",padding:"12px",fontSize:14}}>
              <option value="">All categories</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{marginBottom:24}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:10}}>Date Range</div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"var(--ink4)",marginBottom:4,fontWeight:600}}>FROM</div>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="inp" style={{width:"100%",padding:"10px"}}/>
              </div>
              <div style={{color:"var(--ink4)",marginTop:14}}>→</div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"var(--ink4)",marginBottom:4,fontWeight:600}}>TO</div>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="inp" style={{width:"100%",padding:"10px"}}/>
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{width:"100%",padding:"14px",borderRadius:10,background:"var(--accent)",border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

// ── Mobile Transaction Card ───────────────────────────────────────────────────
function MobileTxCard({ t, onClick }) {
  const {isCredit,auto,merchant,category,dateStr,accentColor,accentBg,accentBorder,borderColor} = getTxDisplay(t);
  return (
    <div className="tx-card" onClick={onClick}
      style={{background:"var(--surface)",borderRadius:12,padding:"14px",border:"1px solid var(--border)",borderLeft:`4px solid ${borderColor}`,display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
      <div style={{width:44,height:44,borderRadius:11,background:accentBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
        {CAT_EMOJI[category]||(isCredit?"💰":"💳")}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"50%"}}>{category}</div>
          <div style={{fontSize:16,fontWeight:800,color:accentColor,fontFamily:"'Sora',sans-serif",letterSpacing:"-0.3px"}}>{isCredit?"+":"−"}₹{fmt(t.amount)}</div>
        </div>
        <div style={{fontSize:12,color:"var(--ink3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:5}}>{merchant||"—"}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:10,color:"var(--ink4)"}}>{dateStr.split(",")[0]}</span>
          <div style={{display:"flex",gap:4}}>
            <span className="badge" style={{background:accentBg,color:accentColor,border:`1px solid ${accentBorder}`,fontSize:9,padding:"1px 6px"}}>
              {isCredit?"💰 Income":"💸 Expense"}
            </span>
            <span className="badge" style={{background:auto?"var(--blue-bg)":"var(--amber-bg)",color:auto?"var(--blue)":"var(--amber)",border:`1px solid ${auto?"var(--blue-border)":"var(--amber-border)"}`,fontSize:9,padding:"1px 6px"}}>
              {auto?"🤖 Auto":"✍️ Manual"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Quick date presets ────────────────────────────────────────────────────────
function todayStr()    { return new Date().toISOString().slice(0,10); }
function offsetDay(n)  { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
function startOfMonth(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; }
const QUICK_RANGES = [
  {label:"Today",       from:()=>todayStr(),    to:()=>todayStr()},
  {label:"Yesterday",   from:()=>offsetDay(-1), to:()=>offsetDay(-1)},
  {label:"Last 7 days", from:()=>offsetDay(-6), to:()=>todayStr()},
  {label:"Last 30 days",from:()=>offsetDay(-29),to:()=>todayStr()},
  {label:"This month",  from:()=>startOfMonth(),to:()=>todayStr()},
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Transactions() {
  injectCSS();
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  const [all,          setAll]          = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [category,     setCategory]     = useState("");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [loading,      setLoading]      = useState(true);
  const [lastSync,     setLastSync]     = useState(null);
  const [spinning,     setSpinning]     = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const [showFilter,   setShowFilter]   = useState(false);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth<=768);

  const CATEGORIES = ["Food","Bills","Shopping","Entertainment","Travel","Medicine","Groceries","Income","Salary","Other"];
  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(()=>{
    const onResize=()=>setIsMobile(window.innerWidth<=768);
    window.addEventListener("resize",onResize);
    return ()=>window.removeEventListener("resize",onResize);
  },[]);

  useEffect(()=>{
    if (!token){navigate("/",{replace:true});return;}
    load();
    const iv=setInterval(load,5000);
    return ()=>clearInterval(iv);
  },[]);

  useEffect(()=>{applyFilters();},[search,typeFilter,category,dateFrom,dateTo,all]);

  async function load() {
    try {
      const headers={Authorization:`Bearer ${token}`};
      const expRes=await fetch(`${API}/api/expenses/`,{headers});
      if (expRes.status===401){localStorage.removeItem("token");navigate("/",{replace:true});return;}
      const expenses=expRes.ok?await expRes.json():[];
      const incRes=await fetch(`${API}/api/income/`,{headers});
      const incomes=incRes.ok?await incRes.json():[];
      const tagged=[
        ...expenses.map(t=>({...t,_type:"debit"})),
        ...incomes.map(t=>({...t,_type:"credit",category:t.category||t.source||"Income"})),
      ];
      tagged.sort((a,b)=>{
        if (b.id&&a.id&&b.id!==a.id) return b.id-a.id;
        const da=new Date(((a.created_at||a.date||"").replace(" ","T"))+"Z");
        const db=new Date(((b.created_at||b.date||"").replace(" ","T"))+"Z");
        return db-da;
      });
      setAll(tagged);
      setLastSync(new Date());
    } finally {setLoading(false);setSpinning(false);}
  }

  function applyFilters() {
    let list=[...all];
    if (typeFilter==="debit")  list=list.filter(t=>t._type==="debit");
    if (typeFilter==="credit") list=list.filter(t=>t._type==="credit");
    if (search){
      const q=search.toLowerCase();
      list=list.filter(t=>t.category?.toLowerCase().includes(q)||t.merchant?.toLowerCase().includes(q)||t.source?.toLowerCase().includes(q));
    }
    if (category) list=list.filter(t=>(t._type==="credit"?"Income":(t.category||""))===category);
    if (dateFrom) list=list.filter(t=>{const d=txDate(t);return d&&d>=dateFrom;});
    if (dateTo)   list=list.filter(t=>{const d=txDate(t);return d&&d<=dateTo;});
    setFiltered(list);
  }

  function applyPreset(p){setDateFrom(p.from());setDateTo(p.to());setActivePreset(p.label);}
  function clearFilters(){setSearch("");setTypeFilter("all");setCategory("");setDateFrom("");setDateTo("");setActivePreset(null);}
  function logout(){localStorage.removeItem("token");navigate("/",{replace:true});}

  const hasFilters = search||typeFilter!=="all"||category||dateFrom||dateTo;
  const totalDebit  = filtered.filter(t=>t._type==="debit") .reduce((s,t)=>s+t.amount,0);
  const totalCredit = filtered.filter(t=>t._type==="credit").reduce((s,t)=>s+t.amount,0);
  const debitCount  = filtered.filter(t=>t._type==="debit").length;
  const creditCount = filtered.filter(t=>t._type==="credit").length;
  const activeFilterCount = [search,typeFilter!=="all",category,dateFrom,dateTo].filter(Boolean).length;

  if (loading) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:28,height:28,border:"2.5px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px"}}/>
        <div style={{fontSize:12,color:"var(--ink3)"}}>Loading your transactions…</div>
      </div>
    </div>
  );

  const COLS    = "44px 110px 1fr 110px 100px 180px 90px";
  const HEADERS = ["","Category","Merchant / From","Amount","Type","Date & Time","Source"];

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout}/>
      <DetailDrawer txn={selected} onClose={()=>setSelected(null)}/>

      {showFilter && isMobile && (
        <FilterSheet
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          search={search} setSearch={setSearch}
          category={category} setCategory={setCategory}
          dateFrom={dateFrom} setDateFrom={setDateFrom}
          dateTo={dateTo} setDateTo={setDateTo}
          onClose={()=>setShowFilter(false)}
          onClear={clearFilters}
        />
      )}

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Desktop Header */}
        <div className="desktop-header" style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>My Transactions</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>All your expenses and income · Click any row for details</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {lastSync&&(
              <div style={{fontSize:11,color:"var(--ink4)",display:"flex",alignItems:"center",gap:5}}>
                <span className="pulse" style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"var(--green)"}}/>
                Synced {lastSync.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
              </div>
            )}
            <button onClick={()=>{setSpinning(true);load();}}
              style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:7,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--ink2)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
              <span style={{display:"inline-block",animation:spinning?"spin .7s linear infinite":"none"}}><Icon d={ICONS.refresh} size={13}/></span>
              Refresh
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="mobile-header" style={{background:"var(--sidebar-bg)",padding:"14px 16px 12px",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#fff",fontFamily:"'Sora',sans-serif",lineHeight:1}}>My Transactions</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.55)",marginTop:2}}>{filtered.length} of {all.length} shown</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setSpinning(true);load();}}
              style={{width:36,height:36,borderRadius:10,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{display:"inline-block",animation:spinning?"spin .7s linear infinite":"none"}}><Icon d={ICONS.refresh} size={16} color="#fff"/></span>
            </button>
            <button onClick={()=>setShowFilter(true)}
              style={{width:36,height:36,borderRadius:10,border:"1px solid rgba(255,255,255,.2)",background:activeFilterCount>0?"rgba(255,255,255,.25)":"rgba(255,255,255,.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              <Icon d={ICONS.filter} size={16} color="#fff"/>
              {activeFilterCount>0&&<span style={{position:"absolute",top:-3,right:-3,width:15,height:15,borderRadius:"50%",background:"#ef4444",color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        <div className="main-scroll" style={{flex:1,overflowY:"auto",padding:"24px 28px",background:"var(--bg)"}}>

          {/* Summary cards */}
          <div className="summary-grid fade" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
            {[
              {label:"Total",         val:filtered.length,         sub:"transactions",                col:"var(--ink)",   bg:"var(--surface)"},
              {label:"Total income",  val:"₹"+fmt(totalCredit),    sub:creditCount+" entries",        col:"var(--green)", bg:"var(--green-bg)"},
              {label:"Total expenses",val:"₹"+fmt(totalDebit),     sub:debitCount+" entries",         col:"var(--red)",   bg:"var(--red-bg)"},
              {label:"Net balance",   val:(totalCredit>=totalDebit?"+":"-")+"₹"+fmt(Math.abs(totalCredit-totalDebit)),
                                      sub:totalCredit>=totalDebit?"More in 🎉":"More out ⚠️",
                                      col:totalCredit>=totalDebit?"var(--green)":"var(--red)",
                                      bg:totalCredit>=totalDebit?"var(--green-bg)":"var(--red-bg)"},
            ].map(s=>(
              <div key={s.label} style={{background:s.bg,border:"1px solid var(--border)",borderRadius:10,padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{fontSize:10,fontWeight:600,color:"var(--ink3)",marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:17,fontWeight:700,color:s.col,marginBottom:2}}>{s.val}</div>
                <div style={{fontSize:10,color:"var(--ink4)"}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Desktop filter */}
          <div className="f1 desktop-only" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"14px 18px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
            <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{display:"flex",gap:6,background:"var(--bg)",borderRadius:8,padding:4}}>
                {[{value:"all",label:"All"},{value:"debit",label:"💸 Expenses"},{value:"credit",label:"💰 Income"}].map(opt=>(
                  <button key={opt.value} onClick={()=>setTypeFilter(opt.value)}
                    style={{padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"inherit",
                      background:typeFilter===opt.value?"var(--accent)":"transparent",
                      color:typeFilter===opt.value?"#fff":"var(--ink3)",transition:"all .15s"}}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div style={{position:"relative",flex:1,minWidth:160}}>
                <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d={ICONS.search} size={13} color="var(--ink4)"/></span>
                <input placeholder="Search category or merchant…" value={search} onChange={e=>setSearch(e.target.value)} className="inp" style={{paddingLeft:30,width:"100%"}}/>
              </div>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="inp" style={{minWidth:150}}>
                <option value="">All categories</option>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              {hasFilters&&(
                <button onClick={clearFilters} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",borderRadius:7,background:"var(--red-bg)",border:"1px solid var(--red-border)",color:"var(--red)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                  <Icon d={ICONS.x} size={12} color="var(--red)"/> Clear all
                </button>
              )}
            </div>
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
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginLeft:4}}>
                {QUICK_RANGES.map(p=>(
                  <button key={p.label} onClick={()=>applyPreset(p)}
                    style={{padding:"5px 11px",borderRadius:99,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",
                      border:activePreset===p.label?"1.5px solid var(--accent)":"1.5px solid var(--border)",
                      background:activePreset===p.label?"rgba(124,92,191,.08)":"var(--surface)",
                      color:activePreset===p.label?"var(--accent)":"var(--ink3)",transition:"all .12s"}}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div style={{fontSize:11,color:"var(--ink4)",marginLeft:"auto",whiteSpace:"nowrap"}}>{filtered.length} of {all.length} shown</div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="f2 desktop-only" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
            <div style={{display:"grid",gridTemplateColumns:COLS,padding:"8px 20px",background:"#f9fafb",borderBottom:"1px solid var(--border)"}}>
              {HEADERS.map(h=><div key={h} style={{fontSize:11,fontWeight:600,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".5px"}}>{h}</div>)}
            </div>
            {filtered.length===0?(
              <div style={{padding:"48px 20px",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                <div style={{fontSize:14,fontWeight:500,color:"var(--ink2)",marginBottom:4}}>No transactions found</div>
                <div style={{fontSize:12,color:"var(--ink3)"}}>{hasFilters?"Try changing the filters":"You haven't added any transactions yet"}</div>
                {hasFilters&&<button onClick={clearFilters} style={{marginTop:12,padding:"7px 16px",borderRadius:7,background:"var(--accent)",border:"none",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Clear all filters</button>}
              </div>
            ):filtered.map((t,i)=>{
              const {isCredit,auto,merchant,category,dateStr,accentColor,accentBg,accentBorder,borderColor}=getTxDisplay(t);
              const isSelected=selected?.id===t.id&&selected?._type===t._type;
              return (
                <div key={`${t._type}-${t.id}-${i}`}
                  className={`txrow${isSelected?" selected":""}`}
                  onClick={()=>setSelected(isSelected?null:t)}
                  style={{display:"grid",gridTemplateColumns:COLS,padding:"11px 20px",alignItems:"center",borderBottom:i<filtered.length-1?"1px solid var(--border)":"none",borderLeft:`3px solid ${borderColor}`}}>
                  <div style={{width:34,height:34,borderRadius:8,background:accentBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{CAT_EMOJI[category]||(isCredit?"💰":"💳")}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>{category}</div>
                  <div style={{fontSize:13,color:"var(--ink3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{merchant||<span style={{color:"var(--ink4)",fontStyle:"italic"}}>—</span>}</div>
                  <div style={{fontSize:14,fontWeight:700,color:accentColor}}>{isCredit?"+":"−"}₹{fmt(t.amount)}</div>
                  <span className="badge" style={{background:accentBg,color:accentColor,border:`1px solid ${accentBorder}`,fontSize:10,whiteSpace:"nowrap"}}>{isCredit?"💰 Income":"💸 Expense"}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:"var(--ink2)"}}>{dateStr.split(",")[0]}</div>
                    <div style={{fontSize:11,color:"var(--ink4)",marginTop:1}}>{dateStr.split(",").slice(1).join(",").trim()}</div>
                  </div>
                  <span className="badge" style={{background:auto?"var(--blue-bg)":"var(--amber-bg)",color:auto?"var(--blue)":"var(--amber)",border:`1px solid ${auto?"var(--blue-border)":"var(--amber-border)"}`,fontSize:10}}>
                    {auto?"🤖 Auto":"✍️ Manual"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile Cards */}
          <div className="mobile-only" style={{flexDirection:"column",gap:10}}>
            {hasFilters&&(
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:4}}>
                {typeFilter!=="all"&&<span style={{padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:"var(--purple-bg)",color:"var(--purple)",border:"1px solid var(--purple-border)"}}>{typeFilter==="debit"?"💸 Expenses":"💰 Income"}</span>}
                {search&&<span style={{padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:"var(--blue-bg)",color:"var(--blue)",border:"1px solid var(--blue-border)"}}>"{search}"</span>}
                {category&&<span style={{padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:"var(--amber-bg)",color:"var(--amber)",border:"1px solid var(--amber-border)"}}>{category}</span>}
                <button onClick={clearFilters} style={{padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:"var(--red-bg)",color:"var(--red)",border:"1px solid var(--red-border)",cursor:"pointer",fontFamily:"inherit"}}>Clear ✕</button>
              </div>
            )}
            {filtered.length===0?(
              <div style={{background:"var(--surface)",borderRadius:14,padding:"48px 20px",textAlign:"center",border:"1px solid var(--border)"}}>
                <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                <div style={{fontSize:14,fontWeight:600,color:"var(--ink2)",marginBottom:4}}>No transactions found</div>
                <div style={{fontSize:12,color:"var(--ink3)"}}>{hasFilters?"Try changing the filters":"You haven't added any transactions yet"}</div>
                {hasFilters&&<button onClick={clearFilters} style={{marginTop:12,padding:"8px 18px",borderRadius:8,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Clear filters</button>}
              </div>
            ):filtered.map((t,i)=>(
              <MobileTxCard key={`${t._type}-${t.id}-${i}`} t={t} onClick={()=>setSelected(selected?.id===t.id&&selected?._type===t._type?null:t)}/>
            ))}
          </div>

          <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"var(--ink4)",display:"flex",alignItems:"center",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
            <span className="pulse" style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"var(--green)"}}/>
            Auto-updates every 5 seconds ·
            <span style={{color:"var(--green)",fontWeight:600}}>Green = Income</span> ·
            <span style={{color:"var(--red)",fontWeight:600}}>Red = Expense</span>
          </div>
        </div>
      </div>

      {/* <BottomNav/> */}
    </div>
  );
}