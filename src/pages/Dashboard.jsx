import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --sidebar-bg:     #2d1b69;
    --sidebar-hover:  rgba(255,255,255,0.08);
    --sidebar-active: rgba(255,255,255,0.15);
    --sidebar-text:   rgba(255,255,255,0.75);
    --sidebar-muted:  rgba(255,255,255,0.4);
    --accent:         #7c5cbf;
    --accent-light:   #a78bfa;
    --bg:             #f7f7f8;
    --surface:        #ffffff;
    --border:         #e5e7eb;
    --ink:            #111827;
    --ink2:           #374151;
    --ink3:           #6b7280;
    --ink4:           #9ca3af;
    --green:          #059669;
    --green-bg:       #ecfdf5;
    --red:            #dc2626;
    --red-bg:         #fef2f2;
    --amber:          #d97706;
    --amber-bg:       #fffbeb;
    --blue:           #2563eb;
    --blue-bg:        #eff6ff;
  }
  html, body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  .fade { animation: fadeIn .3s ease both; }
  .f1   { animation: fadeIn .3s .05s ease both; }
  .f2   { animation: fadeIn .3s .10s ease both; }
  .f3   { animation: fadeIn .3s .15s ease both; }
  .f4   { animation: fadeIn .3s .20s ease both; }
  .f5   { animation: fadeIn .3s .25s ease both; }
  .slink       { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active{ background: var(--sidebar-active) !important; color: #fff !important; }
  .statcard       { transition: box-shadow .2s; }
  .statcard:hover { box-shadow: 0 4px 20px rgba(0,0,0,.08) !important; }
  .txrow         { transition: background .12s; }
  .txrow:hover   { background: var(--bg) !important; }
  .badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:99px; font-size:11px; font-weight:500; }
  .month-select { border:1.5px solid var(--accent); background:var(--surface); color:var(--ink); font-size:13px; font-weight:600; padding:7px 36px 7px 14px; border-radius:8px; cursor:pointer; font-family:inherit; outline:none; appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237c5cbf' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; min-width:180px; transition:box-shadow .15s; box-shadow:0 1px 4px rgba(124,92,191,.1); }
  .month-select:hover { box-shadow:0 2px 10px rgba(124,92,191,.2); }
  .month-select:focus { box-shadow:0 0 0 3px rgba(124,92,191,.2); }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__ent__")) return;
  const s = document.createElement("style"); s.id = "__ent__"; s.textContent = CSS; document.head.appendChild(s);
}

const fmt  = n => new Intl.NumberFormat("en-IN", { maximumFractionDigits:0 }).format(n);
const fmtK = n => n>=100000?`${(n/100000).toFixed(2)}L`:n>=1000?`${(n/1000).toFixed(1)}K`:fmt(n);

const Icon = ({ d, size=15, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const ICONS = {
  home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  tx:       "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  analytics:"M18 20V10M12 20V4M6 20v-6",
  goals:    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  budget:   "M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
  detect:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  reminder: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  logout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  up:       "M18 15l-6-6-6 6",
  down:     "M6 9l6 6 6-6",
  warning:  "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
};

const NAV_SECTIONS = [
  { label:null, items:[{ to:"/dashboard", label:"Home", icon:"home" }] },
  { label:"Track Money", items:[
    { to:"/transactions",          label:"Transactions",  icon:"tx"       },
    { to:"/analytics",             label:"Analytics",     icon:"analytics"},
    { to:"/goals",                 label:"My Goals",      icon:"goals"    },
    { to:"/budgets",               label:"My Budgets",    icon:"budget"   },
  ]},
  { label:"Auto Features", items:[
    { to:"/detected-transactions", label:"SMS Detected",  icon:"detect"   },
    { to:"/reminders",             label:"Reminders",     icon:"reminder" },
  ]},
];

const CAT_EMOJI = { Food:"🍜", Transport:"🚗", Shopping:"🛍️", Entertainment:"🎬", Health:"💊", Utilities:"⚡", Groceries:"🛒", Coffee:"☕", Books:"📚", Bills:"📃", Travel:"✈️", Medicine:"💊", Other:"💳" };
const BAR_COLORS = ["#7c5cbf","#a78bfa","#60a5fa","#34d399","#fb923c"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const isAutoTx = t => t.is_auto===true||t.is_auto===1||t.is_auto==="true"||t.is_auto==="1";

function fmtTxDate(raw) {
  if (!raw) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    const [y,m,d]=raw.split("-"); const dt=new Date(+y,+m-1,+d);
    return dt.toDateString()===new Date().toDateString()?"Today":dt.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
  }
  const utc=(raw.endsWith("Z")||raw.includes("+"))?raw:raw.replace(" ","T")+"Z";
  return new Date(utc).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true});
}

function buildMonthList(expenses, incomes) {
  const set = new Set();
  const now = new Date();
  set.add(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`);
  [...expenses, ...incomes].forEach(t => {
    const d = t.date || t.created_at;
    if (d) set.add(d.slice(0,7));
  });
  return [...set].sort().reverse();
}

function Sidebar({ onLogout, pendingCount }) {
  const path = window.location.pathname;
  return (
    <aside style={{width:200,flexShrink:0,background:"var(--sidebar-bg)",display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,overflow:"hidden"}}>
      <div style={{padding:"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#7c5cbf,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff"}}>S</div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",lineHeight:1}}>SmartSpend</div>
          <div style={{fontSize:10,color:"var(--sidebar-muted)",marginTop:2}}>Student Finance</div>
        </div>
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"10px 10px"}}>
        {NAV_SECTIONS.map((sec,si)=>(
          <div key={si} style={{marginBottom:6}}>
            {sec.label&&<div style={{fontSize:10,fontWeight:600,color:"var(--sidebar-muted)",letterSpacing:"1px",textTransform:"uppercase",padding:"8px 8px 4px"}}>{sec.label}</div>}
            {sec.items.map(item=>(
              <a key={item.to} href={item.to} className={`slink${path===item.to?" active":""}`}
                style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,color:"var(--sidebar-text)",fontSize:13,textDecoration:"none",marginBottom:1,justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <Icon d={ICONS[item.icon]} size={14} color="currentColor"/>
                  {item.label}
                </div>
                {item.to==="/detected-transactions"&&pendingCount>0&&(
                  <span style={{background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,borderRadius:99,padding:"1px 6px",minWidth:18,textAlign:"center"}}>{pendingCount}</span>
                )}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <button onClick={onLogout} className="slink" style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,background:"transparent",border:"none",color:"var(--sidebar-text)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          <Icon d={ICONS.logout} size={14}/> Sign Out
        </button>
      </div>
    </aside>
  );
}

function MonthSelector({ months, selected, onChange }) {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const labelFull = m => { const [y, mo] = m.split("-"); return `${MONTHS[+mo-1]} ${y}`; };
  return (
    <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"10px 28px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <Icon d={ICONS.calendar} size={15} color="var(--accent)"/>
      <span style={{fontSize:13,color:"var(--ink3)"}}>Showing data for</span>
      <select className="month-select" value={selected} onChange={e => onChange(e.target.value)}>
        <option value="all">📊 All Time (everything)</option>
        {months.map(m => (
          <option key={m} value={m}>
            {m === currentKey ? `📅 ${labelFull(m)} — This Month` : `🗓️  ${labelFull(m)}`}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatCard({ label, value, prefix="₹", sub, change, icon, iconBg, ani }) {
  const pos = change >= 0;
  return (
    <div className={`statcard ${ani}`} style={{
      background:"var(--surface)", border:"1px solid var(--border)",
      borderRadius:10, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,.04)"
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:500,color:"var(--ink3)",lineHeight:1.4}}>{label}</div>
        <div style={{width:32,height:32,borderRadius:8,background:iconBg||"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{icon}</div>
      </div>
      <div style={{fontSize:24,fontWeight:700,color:"var(--ink)",lineHeight:1,marginBottom:6}}>{prefix}{fmtK(value)}</div>
      {sub&&<div style={{fontSize:11,color:"var(--ink4)"}}>{sub}</div>}
      {change!==undefined&&(
        <div style={{display:"inline-flex",alignItems:"center",gap:3,marginTop:8,fontSize:11,fontWeight:500,color:pos?"var(--green)":"var(--red)"}}>
          <Icon d={pos?ICONS.up:ICONS.down} size={11} color={pos?"var(--green)":"var(--red)"}/>
          {Math.abs(change).toFixed(1)}% vs prev month
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  injectCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading,       setLoading]       = useState(true);
  const [allExpenses,   setAllExpenses]   = useState([]);
  const [allIncomes,    setAllIncomes]    = useState([]);
  const [suggestions,   setSuggestions]   = useState([]);
  const [prediction,    setPrediction]    = useState(0);
  const [pendingCount,  setPendingCount]  = useState(0);
  const [budgetRisks,   setBudgetRisks]   = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  });

  const API = BASE_URL;

  useEffect(() => { if (!token) { navigate("/",{replace:true}); return; } loadAll(); }, []);
  useEffect(() => { const h=()=>loadAll(); window.addEventListener("transaction-confirmed",h); return()=>window.removeEventListener("transaction-confirmed",h); }, []);

  async function loadAll() {
    try { await Promise.all([loadExpenses(), loadIncomes(), loadSuggestions(), loadBudgetRisks(), loadPendingCount()]); }
    finally { setLoading(false); }
  }

  async function loadExpenses() {
    const r = await fetch(`${API}/api/expenses/`, { headers:{ Authorization:`Bearer ${token}` } });
    if (!r.ok) { logout(); return; }
    const d = await r.json();
    setAllExpenses(Array.isArray(d)?d:[]);
    const tot = (Array.isArray(d)?d:[]).reduce((s,e)=>s+e.amount,0);
    setPrediction(tot*1.12);
  }

  async function loadIncomes() {
    try {
      const r = await fetch(`${API}/api/income/`, { headers:{ Authorization:`Bearer ${token}` } });
      if (r.ok) { const d=await r.json(); setAllIncomes(Array.isArray(d)?d:[]); return; }
    } catch(_) {}
    try {
      const r = await fetch(`${API}/api/summary/`, { headers:{ Authorization:`Bearer ${token}` } });
      if (r.ok) {
        const d = await r.json();
        const now = new Date();
        const mKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
        setAllIncomes([{ id:-1, amount: d.total_income||0, date: mKey+"-01", source:"Summary" }]);
      }
    } catch(_) {}
  }

  async function loadSuggestions() {
    const r = await fetch(`${API}/api/suggestions/`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) setSuggestions(await r.json());
  }
  async function loadPendingCount() {
    const r = await fetch(`${API}/api/detected/count`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) { const d=await r.json(); setPendingCount(d.count||0); }
  }
  async function loadBudgetRisks() {
    const r = await fetch(`${API}/api/ai/risk`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) setBudgetRisks(await r.json());
  }
  async function confirmSuggestion(id) { await fetch(`${API}/api/suggestions/${id}/confirm`,{method:"POST",headers:{Authorization:`Bearer ${token}`}}); loadAll(); }
  async function rejectSuggestion(id)  { await fetch(`${API}/api/suggestions/${id}/reject`, {method:"POST",headers:{Authorization:`Bearer ${token}`}}); setSuggestions(suggestions.filter(s=>s.id!==id)); }
  function logout() { localStorage.removeItem("token"); navigate("/",{replace:true}); }

  const monthList = useMemo(() => buildMonthList(allExpenses, allIncomes), [allExpenses, allIncomes]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonth==="all") return allExpenses;
    return allExpenses.filter(e => { const d = e.date || e.created_at; return d && d.slice(0,7)===selectedMonth; });
  }, [allExpenses, selectedMonth]);

  const filteredIncomes = useMemo(() => {
    if (selectedMonth==="all") return allIncomes;
    return allIncomes.filter(e => { const d = e.date || e.created_at; return d && d.slice(0,7)===selectedMonth; });
  }, [allIncomes, selectedMonth]);

  const totalExpense = useMemo(() => filteredExpenses.reduce((s,e)=>s+e.amount,0), [filteredExpenses]);
  const totalIncome  = useMemo(() => filteredIncomes.reduce((s,e)=>s+e.amount,0),  [filteredIncomes]);
  const savings      = totalIncome - totalExpense;

  const prevMonthKey = useMemo(() => {
    if (selectedMonth==="all") return null;
    const [y,mo] = selectedMonth.split("-").map(Number);
    const prev = new Date(y, mo-2, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,"0")}`;
  }, [selectedMonth]);

  const prevExpense = useMemo(() => {
    if (!prevMonthKey) return null;
    return allExpenses.filter(e=>{const d=e.date||e.created_at; return d&&d.slice(0,7)===prevMonthKey;}).reduce((s,e)=>s+e.amount,0);
  }, [allExpenses, prevMonthKey]);

  const prevIncome = useMemo(() => {
    if (!prevMonthKey) return null;
    return allIncomes.filter(e=>{const d=e.date||e.created_at; return d&&d.slice(0,7)===prevMonthKey;}).reduce((s,e)=>s+e.amount,0);
  }, [allIncomes, prevMonthKey]);

  const expenseChange = prevExpense!=null&&prevExpense>0 ? ((totalExpense-prevExpense)/prevExpense*100) : undefined;
  const incomeChange  = prevIncome !=null&&prevIncome >0 ? ((totalIncome -prevIncome) /prevIncome *100) : undefined;

  const catMap = {};
  filteredExpenses.forEach(t=>{ catMap[t.category]=(catMap[t.category]||0)+t.amount; });
  const topCats = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const budgets = JSON.parse(localStorage.getItem("budgets")||"[]");
  const alerts  = budgets.map(b=>{
    const spent = filteredExpenses.filter(e=>e.category===b.category).reduce((s,e)=>s+e.amount,0);
    const p = Math.round((spent/b.limit)*100);
    if (p>=90) return { msg:`${b.category} — ${p}% used`, level:"high" };
    if (p>=70) return { msg:`${b.category} — ${p}% used`, level:"warn" };
    return null;
  }).filter(Boolean);

  const recent = useMemo(() => [...filteredExpenses]
    .sort((a,b)=>{
      if (b.id&&a.id&&b.id!==a.id) return b.id-a.id;
      const da=new Date(((a.created_at||a.date||"").replace(" ","T"))+(!(a.created_at||"").includes("Z")&&!(a.created_at||"").includes("+")?"Z":""));
      const db=new Date(((b.created_at||b.date||"").replace(" ","T"))+(!(b.created_at||"").includes("Z")&&!(b.created_at||"").includes("+")?"Z":""));
      return db-da;
    }).slice(0,8), [filteredExpenses]);

  const monthLabel = useMemo(() => {
    if (selectedMonth==="all") return "All Time";
    const [y,mo] = selectedMonth.split("-");
    return `${MONTHS[+mo-1]} ${y}`;
  }, [selectedMonth]);

  const TX_COLS = "36px 120px 1fr 90px 160px 80px";

  if (loading) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"var(--bg)",fontFamily:"Inter,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:28,height:28,border:"2.5px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px"}}/>
        <div style={{fontSize:12,color:"var(--ink3)"}}>Loading…</div>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout} pendingCount={pendingCount}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)"}}>
              {new Date().getHours()<12?"Good morning ☀️":new Date().getHours()<17?"Good afternoon 👋":"Good evening 🌙"}
            </div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>Here's where your money stands — <span style={{color:"var(--accent)",fontWeight:600}}>{monthLabel}</span></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <a href="/add-income"  style={{padding:"8px 16px",borderRadius:7,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--ink2)",fontSize:13,fontWeight:500,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>+ Add Income</a>
            <a href="/add-expense" style={{padding:"8px 16px",borderRadius:7,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>+ Add Expense</a>
          </div>
        </div>

        <MonthSelector months={monthList} selected={selectedMonth} onChange={setSelectedMonth}/>

        {pendingCount>0&&(
          <div style={{background:"#eff6ff",borderBottom:"1px solid #bfdbfe",padding:"10px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--blue)"}}>
              <Icon d={ICONS.detect} size={14} color="var(--blue)"/>
              <strong>{pendingCount}</strong> payment{pendingCount>1?"s":""} detected from your SMS
            </div>
            <a href="/detected-transactions" style={{fontSize:12,fontWeight:600,color:"var(--blue)",textDecoration:"none",borderBottom:"1px solid currentColor"}}>Review Now →</a>
          </div>
        )}

        <div style={{flex:1,overflowY:"auto",padding:"24px 28px",background:"var(--bg)"}}>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
            <StatCard label={`Money received — ${monthLabel}`} value={totalIncome} icon="💰" iconBg="#ecfdf5" change={incomeChange} ani="f1" />
            <StatCard label={`Money spent — ${monthLabel}`} value={totalExpense} icon="💸" iconBg="#faf5ff" change={expenseChange} ani="f2" />
            <StatCard label="Money left to spend" value={Math.abs(savings)} prefix={savings<0?"-₹":"₹"} sub={savings>=0?"Still in budget 🎉":"You've gone over budget ⚠️"} icon={savings>=0?"✅":"⚠️"} iconBg={savings>=0?"#ecfdf5":"#fef2f2"} ani="f3" />
            <StatCard label="Expected spend by month end" value={Math.round(totalExpense*1.12)} icon="📅" iconBg="#fffbeb" sub="Based on your current pace" ani="f4" />
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16}}>

            <div className="f3" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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
                return (
                  <div key={i} className="txrow" style={{display:"grid",gridTemplateColumns:TX_COLS,padding:"10px 16px",borderBottom:i<recent.length-1?"1px solid var(--border)":"none",alignItems:"center",borderLeft:`3px solid ${auto?"var(--blue)":"transparent"}`}}>
                    <div style={{width:28,height:28,borderRadius:7,background:auto?"var(--blue-bg)":"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{CAT_EMOJI[t.category]||"💳"}</div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.category||"—"}</div>
                    <div style={{fontSize:12,color:"var(--ink3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{merchant||<span style={{color:"var(--ink4)",fontStyle:"italic"}}>—</span>}</div>
                    <div style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>₹{fmt(t.amount)}</div>
                    <div style={{fontSize:11,color:"var(--ink3)"}}>{fmtTxDate(t.created_at||t.date)}</div>
                    <div>
                      <span className="badge" style={{background:auto?"var(--blue-bg)":"#f9fafb",color:auto?"var(--blue)":"var(--ink3)",border:`1px solid ${auto?"#bfdbfe":"var(--border)"}`,fontSize:10}}>
                        {auto?"🤖 Auto":"✍️ Manual"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div className="f4" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:14}}>Where am I spending? 🤔</div>
                {topCats.length===0?(
                  <div style={{fontSize:12,color:"var(--ink3)",textAlign:"center",padding:"16px 0"}}>No data for {monthLabel}.</div>
                ):topCats.map(([cat,amt],i)=>{
                  const pct=totalExpense>0?(amt/totalExpense)*100:0;
                  return (
                    <div key={cat} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:12,color:"var(--ink2)"}}>{CAT_EMOJI[cat]||"·"} {cat}</span>
                        <span style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>₹{fmtK(amt)}</span>
                      </div>
                      <div style={{height:5,background:"#f3f4f6",borderRadius:99}}>
                        <div style={{height:"100%",width:`${pct}%`,borderRadius:99,background:BAR_COLORS[i]||"var(--accent)",transition:"width .9s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {suggestions.length>0&&(
                <div className="f5" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
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