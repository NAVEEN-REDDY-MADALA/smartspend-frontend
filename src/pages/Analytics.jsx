import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

// ─── Shared design system ─────────────────────────────────────────────────────
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
  .slink       { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active{ background: var(--sidebar-active) !important; color: #fff !important; }
  .kcard { transition: box-shadow .2s; }
  .kcard:hover { box-shadow: 0 6px 24px rgba(0,0,0,.09) !important; }
  .catrow { transition: background .12s; }
  .catrow:hover { background: #f3f4f6 !important; }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__ent__")) return;
  const s = document.createElement("style"); s.id = "__ent__"; s.textContent = CSS;
  document.head.appendChild(s);
}

const fmt = n => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

// ─── Icon ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
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
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { label: null, items: [{ to:"/dashboard", label:"Home", icon:"home" }] },
  {
    label: "Track Money",
    items: [
      { to:"/transactions", label:"Transactions", icon:"tx"       },
      { to:"/analytics",    label:"Analytics",    icon:"analytics"},
      { to:"/goals",        label:"My Goals",     icon:"goals"    },
      { to:"/budgets",      label:"My Budgets",   icon:"budget"   },
    ]
  },
  {
    label: "Auto Features",
    items: [
      { to:"/detected-transactions", label:"SMS Detected", icon:"detect"   },
      { to:"/reminders",             label:"Reminders",    icon:"reminder" },
    ]
  },
];

function Sidebar({ onLogout }) {
  const path = window.location.pathname;
  return (
    <aside style={{ width:200, flexShrink:0, background:"var(--sidebar-bg)", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, overflow:"hidden" }}>
      <div style={{ padding:"20px 18px 16px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:9 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#7c5cbf,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff" }}>S</div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:"#fff", lineHeight:1 }}>SmartSpend</div>
          <div style={{ fontSize:10, color:"var(--sidebar-muted)", marginTop:2 }}>Student Finance</div>
        </div>
      </div>
      <nav style={{ flex:1, overflowY:"auto", padding:"10px" }}>
        {NAV_SECTIONS.map((sec, si) => (
          <div key={si} style={{ marginBottom:6 }}>
            {sec.label && <div style={{ fontSize:10, fontWeight:600, color:"var(--sidebar-muted)", letterSpacing:"1px", textTransform:"uppercase", padding:"8px 8px 4px" }}>{sec.label}</div>}
            {sec.items.map(item => (
              <a key={item.to} href={item.to}
                className={`slink${path===item.to?" active":""}`}
                style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:7, color:"var(--sidebar-text)", fontSize:13, textDecoration:"none", marginBottom:1 }}>
                <Icon d={ICONS[item.icon]} size={14} />{item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding:"10px", borderTop:"1px solid rgba(255,255,255,.08)" }}>
        <button onClick={onLogout} className="slink"
          style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:7, background:"transparent", border:"none", color:"var(--sidebar-text)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
          <Icon d={ICONS.logout} size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, trend, icon, iconBg, ani }) {
  const up = trend > 0;
  return (
    <div className={`kcard ${ani}`} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div style={{ fontSize:11, fontWeight:600, color:"var(--ink3)", textTransform:"uppercase", letterSpacing:".6px" }}>{label}</div>
        <div style={{ width:32, height:32, borderRadius:8, background: iconBg||"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{icon}</div>
      </div>
      <div style={{ fontSize:22, fontWeight:700, color:"var(--ink)", marginBottom:4 }}>₹{fmt(value)}</div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        {trend !== undefined && (
          <span style={{ display:"inline-flex", alignItems:"center", gap:2, fontSize:11, fontWeight:600, color: up?"var(--green)":"var(--red)" }}>
            <Icon d={up?ICONS.up:ICONS.down} size={10} color={up?"var(--green)":"var(--red)"} />
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        <span style={{ fontSize:11, color:"var(--ink3)" }}>{sub}</span>
      </div>
    </div>
  );
}

// ─── Chart wrapper ────────────────────────────────────────────────────────────
function ChartPanel({ title, children, span = 1, ani }) {
  return (
    <div className={ani} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,.04)", gridColumn: span > 1 ? `span ${span}` : "auto" }}>
      <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)", marginBottom:16 }}>{title}</div>
      <div style={{ height:240 }}>{children}</div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ msg }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"var(--ink4)" }}>
      <div style={{ fontSize:32, marginBottom:8, opacity:.4 }}>📊</div>
      <div style={{ fontSize:12 }}>{msg}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Analytics() {
  injectCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [expenses, setExpenses]     = useState([]);
  const [history, setHistory]       = useState({});
  const [prediction, setPrediction] = useState(0);
  const [loading, setLoading]       = useState(true);

  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(() => {
    if (!token) { navigate("/", { replace:true }); return; }
    load();
  }, []);

  async function load() {
    try {
      const r = await fetch(`${API}/api/expenses/`, { headers:{ Authorization:`Bearer ${token}` } });
      if (!r.ok) { localStorage.removeItem("token"); navigate("/", { replace:true }); return; }
      const data = await r.json();
      const arr = Array.isArray(data) ? data : [];
      setExpenses(arr);
      const monthly = {};
      arr.forEach(e => { if (!e.date) return; const m = e.date.slice(0,7); monthly[m] = (monthly[m]||0) + e.amount; });
      setHistory(monthly);
      setPrediction(arr.reduce((s,e)=>s+e.amount,0) * 1.12);
    } finally { setLoading(false); }
  }

  function logout() { localStorage.removeItem("token"); navigate("/", { replace:true }); }

  // ── Data prep ──
  const months      = Object.keys(history).sort();
  const monthVals   = months.map(m => history[m]);
  const catTotals   = {};
  expenses.forEach(e => { if (!e.category) return; const k = e.category.charAt(0).toUpperCase()+e.category.slice(1).toLowerCase(); catTotals[k]=(catTotals[k]||0)+e.amount; });
  const catLabels   = Object.keys(catTotals).sort((a,b)=>catTotals[b]-catTotals[a]);
  const catData     = catLabels.map(l=>catTotals[l]);
  const totalSpent  = expenses.reduce((s,e)=>s+e.amount,0);
  const avgPerMonth = months.length > 0 ? totalSpent / months.length : 0;
  const curMonth    = months[months.length-1] || null;
  const prevMonth   = months[months.length-2] || null;
  const curVal      = curMonth ? history[curMonth] : 0;
  const prevVal     = prevMonth ? history[prevMonth] : 0;
  const trend       = prevVal > 0 ? ((curVal - prevVal) / prevVal * 100) : 0;

  const COLORS = ["#7c5cbf","#a78bfa","#60a5fa","#34d399","#fb923c","#f472b6","#facc15","#38bdf8"];

  // Chart configs
  const chartDefaults = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:"rgba(17,24,39,.9)", padding:10, callbacks:{ label: ctx => `₹${fmt(ctx.parsed.y??ctx.parsed)}` } } },
  };

  const lineData = {
    labels: months,
    datasets: [{ label:"Spend", data:monthVals, borderColor:"#7c5cbf", backgroundColor:"rgba(124,92,191,.08)", fill:true, tension:.4, borderWidth:2, pointRadius:4, pointBackgroundColor:"#7c5cbf", pointBorderColor:"#fff", pointBorderWidth:2 }]
  };
  const lineOpts = { ...chartDefaults, scales:{ y:{ beginAtZero:true, grid:{ color:"rgba(0,0,0,.04)" }, ticks:{ callback: v=>`₹${fmt(v)}`, font:{ size:11 } } }, x:{ grid:{ display:false }, ticks:{ font:{ size:11 } } } } };

  const doughnutData = {
    labels: catLabels,
    datasets: [{ data:catData, backgroundColor: catLabels.map((_,i)=>COLORS[i%COLORS.length]), borderWidth:0, hoverOffset:8 }]
  };
  const doughnutOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{ position:"right", labels:{ padding:12, font:{ size:11 }, usePointStyle:true, pointStyle:"circle" } },
      tooltip:{ backgroundColor:"rgba(17,24,39,.9)", padding:10, callbacks:{ label: ctx => { const pct=((ctx.parsed/catData.reduce((a,b)=>a+b,0))*100).toFixed(1); return `${ctx.label}: ₹${fmt(ctx.parsed)} (${pct}%)`; } } }
    }
  };

  const barData = {
    labels: [prevMonth, curMonth].filter(Boolean),
    datasets: [{ data:[prevVal, curVal].filter((_,i)=>(i===0?prevMonth:curMonth)), backgroundColor:["rgba(124,92,191,.45)","#7c5cbf"], borderRadius:6, borderWidth:0 }]
  };
  const barOpts = { ...chartDefaults, scales:{ y:{ beginAtZero:true, grid:{ color:"rgba(0,0,0,.04)" }, ticks:{ callback: v=>`₹${fmt(v)}`, font:{ size:11 } } }, x:{ grid:{ display:false }, ticks:{ font:{ size:11 } } } } };

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:28, height:28, border:"2.5px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 12px" }} />
        <div style={{ fontSize:12, color:"var(--ink3)" }}>Crunching your numbers…</div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar onLogout={logout} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"16px 28px" }}>
          <div style={{ fontSize:20, fontWeight:700, color:"var(--ink)" }}>Analytics 📊</div>
          <div style={{ fontSize:13, color:"var(--ink3)", marginTop:2 }}>See where your money goes and spot patterns</div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:"var(--bg)" }}>

          {/* ── KPI row ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
            <KPICard label="Total spent (all time)" value={totalSpent}            icon="💸" iconBg="#faf5ff" ani="fade" />
            <KPICard label="This month"              value={curVal}               icon="📅" iconBg="#eff6ff" trend={trend} sub="vs last month" ani="f1" />
            <KPICard label="Average per month"        value={Math.round(avgPerMonth)} icon="📈" iconBg="#ecfdf5" sub={`over ${months.length} month${months.length!==1?"s":""}`} ani="f2" />
            <KPICard label="Predicted next month"     value={Math.round(prediction)}  icon="🔮" iconBg="#fffbeb" sub="based on current pace" ani="f3" />
          </div>

          {/* ── Insight strip ── */}
          {catLabels.length > 0 && (
            <div className="f1" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
              {[
                { label:"Your biggest spend category", val: catLabels[0], sub:`₹${fmt(catData[0])} spent`, bg:"#faf5ff", col:"var(--accent)" },
                { label:"Spending trend vs last month", val: trend > 0 ? `↑ Up ${trend.toFixed(1)}%` : trend < 0 ? `↓ Down ${Math.abs(trend).toFixed(1)}%` : "Stable", sub: trend > 0 ? "Try to cut back a little" : trend < 0 ? "Nice work saving more!" : "Consistent spending", bg: trend > 0 ? "var(--red-bg)" : "var(--green-bg)", col: trend > 0 ? "var(--red)" : "var(--green)" },
                { label:"Smart tip for you", val: trend > 10 ? "Spending rising fast ⚠️" : avgPerMonth > 50000 ? "Consider a monthly budget" : "Great job! Keep it up 🎉", sub: trend > 10 ? "Check your biggest categories" : "You're managing well", bg:"var(--amber-bg)", col:"var(--amber)" },
              ].map((ins,i) => (
                <div key={i} style={{ background:ins.bg, border:`1px solid ${ins.col}22`, borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"var(--ink3)", marginBottom:6, textTransform:"uppercase", letterSpacing:".5px" }}>{ins.label}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:ins.col, marginBottom:3 }}>{ins.val}</div>
                  <div style={{ fontSize:11, color:"var(--ink3)" }}>{ins.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Charts ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, marginBottom:20 }}>
            <ChartPanel title="📈 How much have I spent each month?" span={2} ani="f2">
              {months.length > 0 ? <Line data={lineData} options={lineOpts} /> : <Empty msg="No spending data yet — add some expenses first!" />}
            </ChartPanel>

            <ChartPanel title="🎯 What am I spending most on?" ani="f3">
              {catLabels.length > 0 ? <Doughnut data={doughnutData} options={doughnutOpts} /> : <Empty msg="No categories yet" />}
            </ChartPanel>

            <ChartPanel title="📊 Did I spend more or less than last month?" ani="f3">
              {barData.labels.length > 1 ? <Bar data={barData} options={barOpts} /> : <Empty msg="Need at least 2 months of data" />}
            </ChartPanel>
          </div>

          {/* ── Category breakdown table ── */}
          {catLabels.length > 0 && (
            <div className="f4" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)", fontWeight:600, fontSize:13, color:"var(--ink)" }}>
                🏆 Where does most of my money go?
              </div>

              {/* Table head */}
              <div style={{ display:"grid", gridTemplateColumns:"36px 1fr 110px 80px 160px", padding:"8px 20px", background:"#f9fafb", borderBottom:"1px solid var(--border)" }}>
                {["#","Category","Amount","% of total","Breakdown"].map(h => (
                  <div key={h} style={{ fontSize:11, fontWeight:600, color:"var(--ink3)", textTransform:"uppercase", letterSpacing:".5px" }}>{h}</div>
                ))}
              </div>

              {catLabels.slice(0,8).map((cat, i) => {
                const pct = totalSpent > 0 ? ((catTotals[cat]/totalSpent)*100).toFixed(1) : 0;
                return (
                  <div key={cat} className="catrow" style={{ display:"grid", gridTemplateColumns:"36px 1fr 110px 80px 160px", padding:"12px 20px", borderBottom: i < Math.min(catLabels.length,8)-1 ? "1px solid var(--border)" : "none", alignItems:"center" }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:COLORS[i%COLORS.length], display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700 }}>{i+1}</div>
                    <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>{cat}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>₹{fmt(catTotals[cat])}</div>
                    <div style={{ fontSize:13, color:"var(--ink3)" }}>{pct}%</div>
                    <div style={{ height:6, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, background:COLORS[i%COLORS.length], transition:"width .9s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}