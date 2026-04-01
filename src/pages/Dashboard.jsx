import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api";
import {
  injectMobileCSS, fmt,
  Icon, ICONS, BottomNav
} from "./MobileLayout";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --sb:#2d1b69; --accent:#7c5cbf; --accent2:#a78bfa;
    --bg:#f4f3f8; --surface:#fff; --border:#e5e7eb;
    --ink:#111827; --ink2:#374151; --ink3:#6b7280; --ink4:#9ca3af;
    --green:#059669; --gbg:#ecfdf5; --gborder:#a7f3d0;
    --red:#dc2626;   --rbg:#fef2f2; --rborder:#fecaca;
    --amber:#d97706; --abg:#fffbeb; --aborder:#fde68a;
    --blue:#2563eb;  --bbg:#eff6ff; --bborder:#bfdbfe;
    --nav-h:64px;
  }
  html,body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;overscroll-behavior:none;}
  ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  .fade{animation:fadeIn .3s ease both}
  .f1{animation:fadeIn .3s .05s ease both}
  .f2{animation:fadeIn .3s .10s ease both}
  .f3{animation:fadeIn .3s .15s ease both}
  .f4{animation:fadeIn .3s .20s ease both}
  .f5{animation:fadeIn .3s .25s ease both}
  .slink{transition:background .15s,color .15s;cursor:pointer}
  .slink:hover{background:rgba(255,255,255,.09)!important;color:#fff!important}
  .slink.active{background:rgba(255,255,255,.16)!important;color:#fff!important}
  .statcard{transition:box-shadow .2s;}
  .statcard:hover{box-shadow:0 4px 20px rgba(0,0,0,.08)!important;}
  .txrow{transition:background .12s;}
  .txrow:hover{background:var(--bg)!important;}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:500;}
  .pulse{animation:pulse 2s infinite;}
  .sidebar{width:210px;flex-shrink:0;background:var(--sb);display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow:hidden;}
  .month-select{border:1.5px solid var(--accent);background:var(--surface);color:var(--ink);font-size:13px;font-weight:600;padding:7px 36px 7px 14px;border-radius:8px;cursor:pointer;font-family:inherit;outline:none;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237c5cbf' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;min-width:180px;}

  @media(max-width:900px){
    .sidebar{display:none!important;}
    .desk-hdr{display:none!important;}
    .desk-only{display:none!important;}
    .mob-only{display:flex!important;}
    .dash-content{padding:10px 12px calc(var(--nav-h) + 16px)!important;}
    .stats-grid{grid-template-columns:1fr 1fr!important;gap:8px!important;}
    .main-grid{grid-template-columns:1fr!important;}
    .month-select{min-width:0;font-size:12px;}
    .tx-desk-row{display:none!important;}
    .tx-mob-row{display:flex!important;}
  }
  @media(min-width:901px){
    .mob-only{display:none!important;}
    .desk-hdr{display:flex!important;}
    .desk-only{display:grid!important;}
    .desk-only-block{display:block!important;}
    .tx-desk-row{display:grid!important;}
    .tx-mob-row{display:none!important;}
  }
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__dash_mob__")) return;
  const s=document.createElement("style"); s.id="__dash_mob__"; s.textContent=CSS;
  document.head.appendChild(s);
  injectMobileCSS();
}

const NAV_SECTIONS=[
  {label:null,items:[{to:"/dashboard",label:"Home",icon:"home"}]},
  {label:"Track Money",items:[
    {to:"/transactions",label:"Transactions",icon:"tx"},
    {to:"/analytics",label:"Analytics",icon:"analytics"},
    {to:"/goals",label:"My Goals",icon:"goals"},
    {to:"/budgets",label:"My Budgets",icon:"budget"},
  ]},
  {label:"Auto Features",items:[
    {to:"/detected-transactions",label:"SMS Detected",icon:"detect"},
    {to:"/reminders",label:"Reminders",icon:"reminder"},
  ]},
  {label:"Account",items:[
    {to:"/settings",label:"Settings",icon:"home"},
  ]},
];

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
              <a key={it.to} href={it.to} className={`slink${path===it.to?" active":""}`}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:7,color:"rgba(255,255,255,.65)",fontSize:13,textDecoration:"none",marginBottom:1}}>
                <span style={{display:"flex",alignItems:"center",gap:9}}><Icon d={ICONS[it.icon]} size={14}/>{it.label}</span>
                {it.to==="/detected-transactions"&&pendingCount>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:9,fontWeight:700,borderRadius:99,padding:"1px 5px"}}>{pendingCount}</span>}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <button onClick={onLogout} className="slink" style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,background:"transparent",border:"none",color:"rgba(255,255,255,.65)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          <Icon d={ICONS.logout} size={14}/> Sign Out
        </button>
      </div>
    </aside>
  );
}

function MobileDashHeader({pendingCount,onLogout}) {
  const [menuOpen,setMenuOpen]=useState(false);
  const now=new Date();
  const greeting=now.getHours()<12?"Good morning ☀️":now.getHours()<17?"Good afternoon 👋":"Good evening 🌙";
  return (
    <div style={{background:"var(--sb)",padding:"14px 16px 12px",position:"sticky",top:0,zIndex:100,borderBottom:"1px solid rgba(255,255,255,.08)",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#7c5cbf,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff",fontFamily:"'Sora',sans-serif"}}>S</div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:"#fff",lineHeight:1,fontFamily:"'Sora',sans-serif"}}>{greeting}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginTop:2}}>SmartSpend</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {pendingCount>0&&(
            <a href="/detected-transactions" style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:99,background:"rgba(239,68,68,.25)",border:"1px solid rgba(239,68,68,.4)",textDecoration:"none"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#ef4444",display:"inline-block"}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#fca5a5"}}>{pendingCount} SMS</span>
            </a>
          )}
          <div style={{position:"relative"}}>
            <button onClick={()=>setMenuOpen(o=>!o)}
              style={{width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,.25)",background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexDirection:"column",gap:3}}>
              <span style={{width:14,height:1.5,background:"rgba(255,255,255,.8)",borderRadius:99,display:"block"}}/>
              <span style={{width:14,height:1.5,background:"rgba(255,255,255,.8)",borderRadius:99,display:"block"}}/>
              <span style={{width:14,height:1.5,background:"rgba(255,255,255,.8)",borderRadius:99,display:"block"}}/>
            </button>
            {menuOpen&&(
              <>
                <div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:199}}/>
                <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,zIndex:200,background:"var(--surface)",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,.15)",border:"1px solid var(--border)",minWidth:180,animation:"slideDown .18s ease",overflow:"hidden"}}>
                  <a href="/add-income" style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",textDecoration:"none",color:"var(--ink2)",fontSize:13,fontWeight:500,borderBottom:"1px solid var(--border)"}}>
                    <span style={{fontSize:16}}>💰</span> Add Income
                  </a>
                  <a href="/add-expense" style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",textDecoration:"none",color:"var(--ink2)",fontSize:13,fontWeight:500,borderBottom:"1px solid var(--border)"}}>
                    <span style={{fontSize:16}}>💸</span> Add Expense
                  </a>
                  <button onClick={()=>{setMenuOpen(false);onLogout();}}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"none",border:"none",color:"var(--red)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                    <Icon d={ICONS.logout} size={14} color="var(--red)"/> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildMonthList(expenses,incomes) {
  const set=new Set();
  const now=new Date();
  set.add(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`);
  [...expenses,...incomes].forEach(t=>{const d=t.date||(t.created_at||"").slice(0,10);if(d)set.add(d.slice(0,7));});
  return [...set].sort().reverse();
}

function MonthSelector({months,selected,onChange}) {
  const now=new Date();
  const currentKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const labelFull=m=>{const[y,mo]=m.split("-");return `${MONTHS[+mo-1]} ${y}`;};
  return (
    <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",flexShrink:0}}>
      <Icon d={ICONS.cal} size={14} color="var(--accent)"/>
      <span style={{fontSize:12,color:"var(--ink3)"}}>Showing data for</span>
      <select className="month-select" value={selected} onChange={e=>onChange(e.target.value)}>
        <option value="all">📊 All Time</option>
        {months.map(m=>(
          <option key={m} value={m}>{m===currentKey?`📅 ${labelFull(m)} — This Month`:`🗓️  ${labelFull(m)}`}</option>
        ))}
      </select>
    </div>
  );
}

function StatCard({label,value,prefix="₹",sub,change,icon,iconBg,ani,highlight,highlightNeg}) {
  const pos=change>=0;
  return (
    <div className={`statcard ${ani}`} style={{
      background:highlight?"linear-gradient(135deg,#ecfdf5,#f0fdf4)":highlightNeg?"var(--rbg)":"var(--surface)",
      border:highlight?"1.5px solid var(--gborder)":highlightNeg?"1.5px solid var(--rborder)":"1px solid var(--border)",
      borderRadius:10,padding:"14px 16px",
      boxShadow:highlight?"0 2px 8px rgba(5,150,105,.1)":"0 1px 4px rgba(0,0,0,.04)"
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:500,color:"var(--ink3)",lineHeight:1.4}}>{label}</div>
        <div style={{width:30,height:30,borderRadius:8,background:iconBg||"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{icon}</div>
      </div>
      <div style={{fontSize:20,fontWeight:700,color:highlight?"var(--green)":highlightNeg?"var(--red)":"var(--ink)",lineHeight:1,marginBottom:5}}>{prefix}{fmt(value)}</div>
      {sub&&<div style={{fontSize:11,color:highlight?"var(--green)":highlightNeg?"var(--red)":"var(--ink4)"}}>{sub}</div>}
      {change!==undefined&&(
        <div style={{display:"inline-flex",alignItems:"center",gap:3,marginTop:6,fontSize:11,fontWeight:500,color:pos?"var(--green)":"var(--red)"}}>
          {pos?"↑":"↓"}{Math.abs(change).toFixed(1)}% vs prev month
        </div>
      )}
    </div>
  );
}

/* ─── Carry Forward Banner ───────────────────────────────────────────────── */
function CarryForwardBanner({carryForward,prevMonthLabel,selectedMonth,allTimeBalance,savings,realAvailable}) {
  if(selectedMonth==="all") return null;
  const cfPositive=carryForward>=0;
  const realPositive=realAvailable>=0;

  return (
    <div style={{marginBottom:14}}>
      {/* Main banner */}
      <div style={{
        display:"flex",alignItems:"center",gap:12,
        padding:"12px 14px",borderRadius:12,
        background:cfPositive?"linear-gradient(135deg,#ecfdf5,#f0fdf4)":"linear-gradient(135deg,#fff1f2,#fef2f2)",
        border:`1.5px solid ${cfPositive?"var(--gborder)":"var(--rborder)"}`,
        marginBottom:8
      }}>
        <div style={{fontSize:24}}>💼</div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:700,color:cfPositive?"var(--green)":"var(--red)",marginBottom:2}}>
            Carried forward from {prevMonthLabel||"previous months"}
          </div>
          <div style={{fontSize:11,color:"var(--ink4)"}}>
            Your savings from before {selectedMonth.split("-")[0]+"-"+MONTHS[+selectedMonth.split("-")[1]-1]} are added to this month
          </div>
        </div>
        <div style={{
          fontSize:20,fontWeight:800,
          color:cfPositive?"var(--green)":"var(--red)",
          fontFamily:"'Sora',sans-serif",flexShrink:0
        }}>
          {cfPositive?"+":""}{carryForward<0?"-₹":"₹"}{fmt(Math.abs(carryForward))}
        </div>
      </div>

      {/* Formula row */}
      <div style={{
        display:"flex",alignItems:"center",gap:6,
        padding:"10px 14px",borderRadius:10,
        background:"var(--surface)",border:"1px solid var(--border)",
        flexWrap:"wrap"
      }}>
        <span style={{fontSize:11,fontWeight:600,color:"var(--ink3)"}}>💼 ₹{fmt(Math.abs(carryForward))}</span>
        <span style={{fontSize:11,color:"var(--ink4)"}}>carried</span>
        <span style={{fontSize:13,color:"var(--ink4)"}}>+</span>
        <span style={{fontSize:11,fontWeight:600,color:"var(--green)"}}>💰 ₹{fmt(Math.max(savings,0))}</span>
        <span style={{fontSize:11,color:"var(--ink4)"}}>this month net</span>
        <span style={{fontSize:13,color:"var(--ink4)"}}>=</span>
        <span style={{
          fontSize:13,fontWeight:800,
          color:realPositive?"var(--green)":"var(--red)",
          fontFamily:"'Sora',sans-serif",
          background:realPositive?"var(--gbg)":"var(--rbg)",
          border:`1px solid ${realPositive?"var(--gborder)":"var(--rborder)"}`,
          padding:"2px 10px",borderRadius:99
        }}>
          {realPositive?"₹":"-₹"}{fmt(Math.abs(realAvailable))} available
        </span>
        <span style={{fontSize:10,color:"var(--ink4)",marginLeft:"auto"}}>
          🏦 All-time: {allTimeBalance>=0?"₹":"-₹"}{fmt(Math.abs(allTimeBalance))}
        </span>
      </div>
    </div>
  );
}

const CAT_EMOJI={Food:"🍜",Transport:"🚗",Shopping:"🛍️",Entertainment:"🎬",Health:"💊",Utilities:"⚡",Groceries:"🛒",Coffee:"☕",Books:"📚",Bills:"💡",Travel:"✈️",Medicine:"💊",Income:"💰",Salary:"💼",Refund:"↩️",Cashback:"🎁",Transfer:"🔁",Finance:"💳",Education:"📚",Other:"💳"};
const BAR_COLORS=["#7c5cbf","#a78bfa","#60a5fa","#34d399","#fb923c"];
const isAutoTx=t=>t.is_auto===true||t.is_auto===1||t.is_auto==="true"||t.is_auto==="1";

function fmtTxDate(raw) {
  if(!raw) return "—";
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())){
    const[y,m,d]=raw.split("-");const dt=new Date(+y,+m-1,+d);
    return dt.toDateString()===new Date().toDateString()?"Today":dt.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
  }
  const utc=(raw.endsWith("Z")||raw.includes("+"))?raw:raw.replace(" ","T")+"Z";
  return new Date(utc).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true});
}

export default function Dashboard() {
  injectCSS();
  const navigate=useNavigate();
  const token=localStorage.getItem("token");

  const [loading,setLoading]=useState(true);
  const [allExpenses,setAllExpenses]=useState([]);
  const [allIncomes,setAllIncomes]=useState([]);
  const [suggestions,setSuggestions]=useState([]);
  const [pendingCount,setPendingCount]=useState(0);
  const [selectedMonth,setSelectedMonth]=useState(()=>{
    const now=new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  });

  const API=BASE_URL;

  useEffect(()=>{if(!token){navigate("/",{replace:true});return;}loadAll();},[]);
  useEffect(()=>{const h=()=>loadAll();window.addEventListener("transaction-confirmed",h);return()=>window.removeEventListener("transaction-confirmed",h);},[]);

  async function loadAll() {
    try{await Promise.all([loadExpenses(),loadIncomes(),loadSuggestions(),loadPendingCount()]);}
    finally{setLoading(false);}
  }

  async function loadExpenses() {
    const r=await fetch(`${API}/api/expenses/`,{headers:{Authorization:`Bearer ${token}`}});
    if(!r.ok){logout();return;}
    const d=await r.json();
    setAllExpenses(Array.isArray(d)?d:[]);
  }

  async function loadIncomes() {
    try {
      const r=await fetch(`${API}/api/income/`,{headers:{Authorization:`Bearer ${token}`}});
      if(r.ok){const d=await r.json();setAllIncomes(Array.isArray(d)?d:[]);return;}
    } catch(_){}
    try {
      const r=await fetch(`${API}/api/summary/`,{headers:{Authorization:`Bearer ${token}`}});
      if(r.ok){
        const d=await r.json();
        const now=new Date();
        const mKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
        setAllIncomes([{id:-1,amount:d.total_income||0,date:mKey+"-01",source:"Summary"}]);
      }
    } catch(_){}
  }

  async function loadSuggestions() {
    const r=await fetch(`${API}/api/suggestions/`,{headers:{Authorization:`Bearer ${token}`}});
    if(r.ok) setSuggestions(await r.json());
  }

  async function loadPendingCount() {
    const r=await fetch(`${API}/api/detected/count`,{headers:{Authorization:`Bearer ${token}`}});
    if(r.ok){const d=await r.json();setPendingCount(d.count||0);}
  }

  async function confirmSuggestion(id){await fetch(`${API}/api/suggestions/${id}/confirm`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});loadAll();}
  async function rejectSuggestion(id){await fetch(`${API}/api/suggestions/${id}/reject`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});setSuggestions(suggestions.filter(s=>s.id!==id));}

  function logout(){localStorage.removeItem("token");navigate("/",{replace:true});}

  const monthList=useMemo(()=>buildMonthList(allExpenses,allIncomes),[allExpenses,allIncomes]);

  const filteredExpenses=useMemo(()=>{
    if(selectedMonth==="all") return allExpenses;
    return allExpenses.filter(e=>{const d=e.date||e.created_at;return d&&d.slice(0,7)===selectedMonth;});
  },[allExpenses,selectedMonth]);

  const filteredIncomes=useMemo(()=>{
    if(selectedMonth==="all") return allIncomes;
    return allIncomes.filter(e=>{const d=e.date||e.created_at;return d&&d.slice(0,7)===selectedMonth;});
  },[allIncomes,selectedMonth]);

  const totalExpense=useMemo(()=>filteredExpenses.reduce((s,e)=>s+e.amount,0),[filteredExpenses]);
  const totalIncome=useMemo(()=>filteredIncomes.reduce((s,e)=>s+e.amount,0),[filteredIncomes]);
  const savings=totalIncome-totalExpense;

  // ── All-time totals ───────────────────────────────────────────────────────
  const allTimeIncome=useMemo(()=>allIncomes.reduce((s,e)=>s+e.amount,0),[allIncomes]);
  const allTimeExpense=useMemo(()=>allExpenses.reduce((s,e)=>s+e.amount,0),[allExpenses]);
  const allTimeBalance=allTimeIncome-allTimeExpense;

  // ── Previous month ────────────────────────────────────────────────────────
  const prevMonthKey=useMemo(()=>{
    if(selectedMonth==="all") return null;
    const[y,mo]=selectedMonth.split("-").map(Number);
    const prev=new Date(y,mo-2,1);
    return `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,"0")}`;
  },[selectedMonth]);

  const prevMonthLabel=useMemo(()=>{
    if(!prevMonthKey) return "";
    const[y,mo]=prevMonthKey.split("-");
    return `${MONTHS[+mo-1]} ${y}`;
  },[prevMonthKey]);

  // ── Carry Forward = cumulative balance BEFORE selected month ──────────────
  const carryForward=useMemo(()=>{
    if(selectedMonth==="all") return 0;
    const incBefore=allIncomes
      .filter(e=>{const d=e.date||e.created_at;return d&&d.slice(0,7)<selectedMonth;})
      .reduce((s,e)=>s+e.amount,0);
    const expBefore=allExpenses
      .filter(e=>{const d=e.date||e.created_at;return d&&d.slice(0,7)<selectedMonth;})
      .reduce((s,e)=>s+e.amount,0);
    return incBefore-expBefore;
  },[allIncomes,allExpenses,selectedMonth]);

  // ── Real available = carry forward + this month net ───────────────────────
  const realAvailable=carryForward+savings;

  const prevExpense=useMemo(()=>{
    if(!prevMonthKey) return null;
    return allExpenses.filter(e=>{const d=e.date||e.created_at;return d&&d.slice(0,7)===prevMonthKey;}).reduce((s,e)=>s+e.amount,0);
  },[allExpenses,prevMonthKey]);

  const prevIncome=useMemo(()=>{
    if(!prevMonthKey) return null;
    return allIncomes.filter(e=>{const d=e.date||e.created_at;return d&&d.slice(0,7)===prevMonthKey;}).reduce((s,e)=>s+e.amount,0);
  },[allIncomes,prevMonthKey]);

  const expenseChange=prevExpense!=null&&prevExpense>0?((totalExpense-prevExpense)/prevExpense*100):undefined;
  const incomeChange=prevIncome!=null&&prevIncome>0?((totalIncome-prevIncome)/prevIncome*100):undefined;

  const catMap={};
  filteredExpenses.forEach(t=>{catMap[t.category]=(catMap[t.category]||0)+t.amount;});
  const topCats=Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const monthLabel=useMemo(()=>{
    if(selectedMonth==="all") return "All Time";
    const[y,mo]=selectedMonth.split("-");
    return `${MONTHS[+mo-1]} ${y}`;
  },[selectedMonth]);

  const recent=useMemo(()=>[...filteredExpenses]
    .sort((a,b)=>{
      if(b.id&&a.id&&b.id!==a.id) return b.id-a.id;
      const da=new Date(((a.created_at||a.date||"").replace(" ","T"))+(!(a.created_at||"").includes("Z")&&!(a.created_at||"").includes("+")?"Z":""));
      const db=new Date(((b.created_at||b.date||"").replace(" ","T"))+(!(b.created_at||"").includes("Z")&&!(b.created_at||"").includes("+")?"Z":""));
      return db-da;
    }).slice(0,8),[filteredExpenses]);

  if(loading) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:28,height:28,border:"2.5px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px"}}/>
        <div style={{fontSize:12,color:"var(--ink3)"}}>Loading…</div>
      </div>
    </div>
  );

  const TX_COLS="36px 110px 1fr 90px 150px 80px";

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout} pendingCount={pendingCount}/>
      <BottomNav pendingCount={pendingCount}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        <div className="mob-only" style={{flexDirection:"column"}}>
          <MobileDashHeader pendingCount={pendingCount} onLogout={logout}/>
        </div>

        <div className="desk-hdr" style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)"}}>
              {new Date().getHours()<12?"Good morning ☀️":new Date().getHours()<17?"Good afternoon 👋":"Good evening 🌙"}
            </div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>Here's where your money stands — <span style={{color:"var(--accent)",fontWeight:600}}>{monthLabel}</span></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <a href="/add-income" style={{padding:"8px 16px",borderRadius:7,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--ink2)",fontSize:13,fontWeight:500,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>+ Add Income</a>
            <a href="/add-expense" style={{padding:"8px 16px",borderRadius:7,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>+ Add Expense</a>
          </div>
        </div>

        <MonthSelector months={monthList} selected={selectedMonth} onChange={setSelectedMonth}/>

        {pendingCount>0&&(
          <div className="desk-hdr" style={{background:"#eff6ff",borderBottom:"1px solid #bfdbfe",padding:"10px 28px",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--blue)"}}>
              <Icon d={ICONS.detect} size={14} color="var(--blue)"/>
              <strong>{pendingCount}</strong> payment{pendingCount>1?"s":""} detected from your SMS
            </div>
            <a href="/detected-transactions" style={{fontSize:12,fontWeight:600,color:"var(--blue)",textDecoration:"none",borderBottom:"1px solid currentColor"}}>Review Now →</a>
          </div>
        )}

        <div className="dash-content" style={{flex:1,overflowY:"auto",padding:"16px 16px 28px",background:"var(--bg)"}}>

          {/* ── Carry Forward Banner ── */}
          <CarryForwardBanner
            carryForward={carryForward}
            prevMonthLabel={prevMonthLabel}
            selectedMonth={selectedMonth}
            allTimeBalance={allTimeBalance}
            savings={savings}
            realAvailable={realAvailable}
          />

          {/* Stats grid */}
          <div className="stats-grid fade" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
            <StatCard label={`Money received — ${monthLabel}`} value={totalIncome} icon="💰" iconBg="#ecfdf5" change={incomeChange} ani="f1"/>
            <StatCard label={`Money spent — ${monthLabel}`} value={totalExpense} icon="💸" iconBg="#faf5ff" change={expenseChange} ani="f2"/>
            <StatCard
              label="Real available balance"
              value={Math.abs(realAvailable)}
              prefix={realAvailable<0?"-₹":"₹"}
              sub={realAvailable>=0
                ? `₹${fmt(carryForward)} carried + ₹${fmt(Math.max(savings,0))} saved`
                : "Over budget ⚠️"}
              icon={realAvailable>=0?"💳":"⚠️"}
              iconBg={realAvailable>=0?"#ecfdf5":"#fef2f2"}
              ani="f3"
              highlight={realAvailable>=0}
              highlightNeg={realAvailable<0}
            />
            <StatCard label="Expected spend by month end" value={Math.round(totalExpense*1.12)} icon="📅" iconBg="#fffbeb" sub="Based on your current pace" ani="f4"/>
          </div>

          {/* Main grid */}
          <div className="main-grid f3" style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:14}}>

            {/* Recent transactions */}
            <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{padding:"13px 18px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontWeight:600,fontSize:13,color:"var(--ink)"}}>Recent Transactions</div>
                <a href="/transactions" style={{fontSize:12,color:"var(--accent)",textDecoration:"none",fontWeight:500}}>View All →</a>
              </div>
              {recent.length===0?(
                <div style={{padding:"40px 20px",textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:8}}>🗓️</div>
                  <div style={{fontSize:13,color:"var(--ink3)"}}>No transactions in {monthLabel}.</div>
                </div>
              ):recent.map((t,i)=>{
                const auto=isAutoTx(t);
                const merchant=t.merchant||t.merchant_name||t.description||null;
                const cat=t.category||"Other";
                const dateStr=fmtTxDate(t.created_at||t.date);
                return (
                  <div key={i} style={{borderBottom:i<recent.length-1?"1px solid var(--border)":"none",borderLeft:`3px solid ${auto?"var(--blue)":"transparent"}`}}>
                    <div className="txrow tx-desk-row" style={{display:"grid",gridTemplateColumns:TX_COLS,padding:"10px 16px",alignItems:"center"}}>
                      <div style={{width:28,height:28,borderRadius:7,background:auto?"var(--bbg)":"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{CAT_EMOJI[cat]||"💳"}</div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{cat}</div>
                      <div style={{fontSize:12,color:"var(--ink3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{merchant||<span style={{color:"var(--ink4)",fontStyle:"italic"}}>—</span>}</div>
                      <div style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>₹{fmt(t.amount)}</div>
                      <div style={{fontSize:11,color:"var(--ink3)"}}>{dateStr}</div>
                      <div>
                        <span className="badge" style={{background:auto?"var(--bbg)":"#f9fafb",color:auto?"var(--blue)":"var(--ink3)",border:`1px solid ${auto?"#bfdbfe":"var(--border)"}`,fontSize:10}}>
                          {auto?"🤖 Auto":"✍️ Manual"}
                        </span>
                      </div>
                    </div>
                    <div className="tx-mob-row" style={{display:"none",padding:"10px 14px",alignItems:"center",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:9,background:auto?"var(--bbg)":"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                        {CAT_EMOJI[cat]||"💳"}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                          <span style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>{cat}</span>
                          <span style={{fontSize:14,fontWeight:800,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>₹{fmt(t.amount)}</span>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:11,color:"var(--ink3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60%"}}>{merchant||"—"}</span>
                          <span style={{fontSize:10,color:"var(--ink4)",flexShrink:0}}>{dateStr}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right column */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* Balance Breakdown — desktop only */}
              <div className="f4 desk-only-block" style={{
                background:"linear-gradient(135deg,#ecfdf5,#f0fdf4)",
                border:"1.5px solid var(--gborder)",
                borderRadius:10,padding:"16px",
                boxShadow:"0 2px 8px rgba(5,150,105,.08)"
              }}>
                <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",marginBottom:12}}>💼 Balance Breakdown</div>
                {[
                  {label:"Carried from "+prevMonthLabel,value:carryForward,color:carryForward>=0?"var(--green)":"var(--red)",prefix:carryForward<0?"-₹":"₹"},
                  {label:`+ ${monthLabel} income`,value:totalIncome,color:"var(--green)",prefix:"₹"},
                  {label:`− ${monthLabel} expenses`,value:totalExpense,color:"var(--red)",prefix:"₹"},
                ].map((row,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<2?"1px dashed var(--gborder)":"none"}}>
                    <span style={{fontSize:12,color:"var(--ink3)"}}>{row.label}</span>
                    <span style={{fontSize:13,fontWeight:700,color:row.color}}>{row.prefix}{fmt(Math.abs(row.value))}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0 0",marginTop:4,borderTop:"2px solid var(--gborder)"}}>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>= Real balance</span>
                  <span style={{fontSize:18,fontWeight:800,color:realAvailable>=0?"var(--green)":"var(--red)",fontFamily:"'Sora',sans-serif"}}>
                    {realAvailable>=0?"₹":"-₹"}{fmt(Math.abs(realAvailable))}
                  </span>
                </div>
              </div>

              {/* Spending breakdown */}
              <div className="f4" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:12}}>Where am I spending? 🤔</div>
                {topCats.length===0?(
                  <div style={{fontSize:12,color:"var(--ink3)",textAlign:"center",padding:"16px 0"}}>No data for {monthLabel}.</div>
                ):topCats.map(([cat,amt],i)=>{
                  const pct=totalExpense>0?(amt/totalExpense)*100:0;
                  return (
                    <div key={cat} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:12,color:"var(--ink2)"}}>{CAT_EMOJI[cat]||"·"} {cat}</span>
                        <span style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>₹{fmt(amt)}</span>
                      </div>
                      <div style={{height:5,background:"#f3f4f6",borderRadius:99}}>
                        <div style={{height:"100%",width:`${pct}%`,borderRadius:99,background:BAR_COLORS[i]||"var(--accent)",transition:"width .9s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Suggestions */}
              {suggestions.length>0&&(
                <div className="f5" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:10}}>🤖 Quick add — did you forget these?</div>
                  {suggestions.slice(0,2).map(s=>(
                    <div key={s.id} style={{padding:"10px 12px",borderRadius:8,marginBottom:8,border:"1px solid var(--border)"}}>
                      <div style={{fontSize:12,color:"var(--ink2)",marginBottom:9}}>Add <strong>₹{fmt(s.suggested_amount)}</strong> for {s.category}?</div>
                      <div style={{display:"flex",gap:7}}>
                        <button onClick={()=>confirmSuggestion(s.id)} style={{flex:1,padding:"6px",borderRadius:6,cursor:"pointer",background:"var(--accent)",border:"none",color:"#fff",fontSize:12,fontWeight:500,fontFamily:"inherit"}}>Confirm</button>
                        <button onClick={()=>rejectSuggestion(s.id)} style={{flex:1,padding:"6px",borderRadius:6,cursor:"pointer",background:"transparent",border:"1px solid var(--border)",color:"var(--ink3)",fontSize:12,fontFamily:"inherit"}}>Dismiss</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}