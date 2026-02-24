import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  injectMobileCSS, fmt, fmtK, CAT_EMOJI, Icon, ICONS,
  MobilePage, MobileHeader, LoadingScreen, StatCard,
} from "./MobileLayout";

const isAutoTx = t => t.is_auto === true || t.is_auto === 1 || t.is_auto === "true" || t.is_auto === "1";

function fmtTxDate(raw) {
  if (!raw) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    const [y,m,d] = raw.split("-");
    const dt = new Date(+y,+m-1,+d);
    return dt.toDateString() === new Date().toDateString()
      ? "Today"
      : dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short" });
  }
  const utc = (raw.endsWith("Z")||raw.includes("+")) ? raw : raw.replace(" ","T")+"Z";
  return new Date(utc).toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit", hour12:true });
}

const BAR_COLORS = ["#5b3ff8","#a78bfa","#60a5fa","#34d399","#fb923c"];

export default function Dashboard() {
  injectMobileCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading]           = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [suggestions, setSuggestions]   = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome]   = useState(0);
  const [savings, setSavings]           = useState(0);
  const [prediction, setPrediction]     = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [budgetRisks, setBudgetRisks]   = useState([]);

  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(() => {
    if (!token) { navigate("/", { replace:true }); return; }
    loadAll();
  }, []);

  useEffect(() => {
    const h = () => loadAll();
    window.addEventListener("transaction-confirmed", h);
    return () => window.removeEventListener("transaction-confirmed", h);
  }, []);

  async function loadAll() {
    try { await Promise.all([loadExpenses(), loadSuggestions(), loadBudgetRisks(), loadSummary(), loadPendingCount()]); }
    finally { setLoading(false); }
  }
  async function loadExpenses() {
    const r = await fetch(`${API}/api/expenses/`, { headers:{ Authorization:`Bearer ${token}` } });
    if (!r.ok) { logout(); return; }
    const d = await r.json(); setTransactions(d);
    const tot = d.reduce((s,e)=>s+e.amount,0);
    setTotalExpense(Math.round(tot)); setPrediction(tot*1.12);
  }
  async function loadSuggestions() {
    const r = await fetch(`${API}/api/suggestions/`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) setSuggestions(await r.json());
  }
  async function loadSummary() {
    const r = await fetch(`${API}/api/summary/`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) { const d = await r.json(); setTotalIncome(Math.round(d.total_income||0)); setSavings(Math.round(d.savings||0)); }
  }
  async function loadPendingCount() {
    const r = await fetch(`${API}/api/detected/pending/count`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) { const d = await r.json(); setPendingCount(d.count||0); }
  }
  async function loadBudgetRisks() {
    const r = await fetch(`${API}/api/ai/risk`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) setBudgetRisks(await r.json());
  }
  async function confirmSuggestion(id) {
    await fetch(`${API}/api/suggestions/${id}/confirm`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
    loadAll();
  }
  async function rejectSuggestion(id) {
    await fetch(`${API}/api/suggestions/${id}/reject`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
    setSuggestions(suggestions.filter(s=>s.id!==id));
  }
  function logout() { localStorage.removeItem("token"); navigate("/", { replace:true }); }

  const catMap = {};
  transactions.forEach(t=>{ catMap[t.category]=(catMap[t.category]||0)+t.amount; });
  const topCats = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const recent = [...transactions]
    .sort((a, b) => {
      if (b.id && a.id && b.id !== a.id) return b.id - a.id;
      const da = new Date((a.created_at||a.date||"").replace(" ","T")+(!(a.created_at||"").includes("Z")&&!(a.created_at||"").includes("+")?"Z":""));
      const db = new Date((b.created_at||b.date||"").replace(" ","T")+(!(b.created_at||"").includes("Z")&&!(b.created_at||"").includes("+")?"Z":""));
      return db-da;
    })
    .slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning ☀️" : hour < 17 ? "Good afternoon 👋" : "Good evening 🌙";

  if (loading) return <LoadingScreen text="Loading your finances…" />;

  return (
    <MobilePage pendingCount={pendingCount}>
      {/* Header */}
      <MobileHeader
        title="SmartSpend"
        subtitle={greeting}
        right={
          <button onClick={logout} style={{ width:36, height:36, borderRadius:10, border:"1.5px solid var(--border)", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Icon d={ICONS.logout} size={16} color="var(--ink3)" />
          </button>
        }
      />

      <div style={{ padding:"16px 16px 0" }}>

        {/* Pending SMS banner */}
        {pendingCount > 0 && (
          <a href="/detected-transactions" style={{ textDecoration:"none" }}>
            <div className="fu0" style={{ background:"linear-gradient(135deg,#5b3ff8,#7c5cfc)", borderRadius:14, padding:"12px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:20 }}>📱</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{pendingCount} SMS payments detected</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.7)" }}>Tap to review & confirm</div>
                </div>
              </div>
              <span style={{ color:"rgba(255,255,255,.8)", fontSize:18 }}>›</span>
            </div>
          </a>
        )}

        {/* Hero balance card */}
        <div className="fu0" style={{ background:"linear-gradient(145deg,#1a0a4e,#3b1fa8)", borderRadius:20, padding:"22px 20px", marginBottom:14, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-20, right:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,.05)" }}/>
          <div style={{ position:"absolute", bottom:-30, left:10, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,.04)" }}/>
          <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,.55)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>Money Left</div>
          <div style={{ fontSize:38, fontWeight:800, color:savings >= 0 ? "#fff" : "#ff8fa3", fontFamily:"'Sora',sans-serif", lineHeight:1, marginBottom:4 }}>
            {savings < 0 ? "-" : ""}₹{fmtK(Math.abs(savings))}
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.55)", marginBottom:16 }}>
            {savings >= 0 ? "Still in budget 🎉" : "Over budget ⚠️"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div style={{ background:"rgba(255,255,255,.1)", borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.5)", marginBottom:3 }}>Income</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#fff", fontFamily:"'Sora',sans-serif" }}>₹{fmtK(totalIncome)}</div>
            </div>
            <div style={{ background:"rgba(255,255,255,.1)", borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.5)", marginBottom:3 }}>Spent</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#fff", fontFamily:"'Sora',sans-serif" }}>₹{fmtK(totalExpense)}</div>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="fu1" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <a href="/add-income" style={{ textDecoration:"none" }}>
            <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:14, padding:"14px", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"var(--green-bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💰</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--ink)" }}>Add Income</div>
                <div style={{ fontSize:11, color:"var(--ink4)" }}>Record money in</div>
              </div>
            </div>
          </a>
          <a href="/add-expense" style={{ textDecoration:"none" }}>
            <div style={{ background:"var(--brand)", borderRadius:14, padding:"14px", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💸</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>Add Expense</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.65)" }}>Record a spend</div>
              </div>
            </div>
          </a>
        </div>

        {/* Spending breakdown */}
        {topCats.length > 0 && (
          <div className="fu2 card" style={{ padding:"16px", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>Where's it going? 🤔</div>
              <a href="/analytics" style={{ fontSize:12, color:"var(--brand)", textDecoration:"none", fontWeight:600 }}>See all →</a>
            </div>
            {topCats.map(([cat,amt],i) => {
              const pct = totalExpense > 0 ? (amt/totalExpense)*100 : 0;
              return (
                <div key={cat} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:13, color:"var(--ink2)", fontWeight:500 }}>{CAT_EMOJI[cat]||"·"} {cat}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>₹{fmtK(amt)}</span>
                  </div>
                  <div className="prog-track">
                    <div className="prog-fill" style={{ width:`${pct}%`, background:BAR_COLORS[i]||"var(--brand)" }}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AI budget risks */}
        {budgetRisks.length > 0 && (
          <div className="fu3 card" style={{ padding:"16px", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif", marginBottom:12 }}>AI Risk Alert 📊</div>
            {budgetRisks.slice(0,3).map((r,i) => {
              const high = r.risk_level==="HIGH";
              const med  = r.risk_level==="MEDIUM";
              const col  = high ? "var(--red)" : med ? "var(--amber)" : "var(--green)";
              const bg   = high ? "var(--red-bg)" : med ? "var(--amber-bg)" : "var(--green-bg)";
              return (
                <div key={i} style={{ padding:"10px 12px", borderRadius:10, marginBottom:8, background:bg }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:col }}>{r.category}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:col }}>{r.risk_level}</span>
                  </div>
                  <div style={{ fontSize:11, color:"var(--ink3)" }}>
                    ₹{fmtK(r.expected_spend)} expected · {Math.round(r.probability*100)}% chance of overspend
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent transactions */}
        <div className="fu4 card" style={{ marginBottom:14, overflow:"hidden" }}>
          <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>Recent Activity</div>
            <a href="/transactions" style={{ fontSize:12, color:"var(--brand)", textDecoration:"none", fontWeight:600 }}>View all →</a>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding:"32px 16px", textAlign:"center", color:"var(--ink4)", fontSize:13 }}>No transactions yet</div>
          ) : recent.map((t,i) => {
            const auto = isAutoTx(t);
            const merchant = t.merchant || t.merchant_name || t.description || null;
            return (
              <div key={t.id||i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:i<recent.length-1?"1px solid var(--border)":"none", borderLeft:`3px solid ${auto?"var(--blue)":"transparent"}` }}>
                <div style={{ width:40, height:40, borderRadius:12, background:auto?"var(--blue-bg)":"var(--surface2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, flexShrink:0 }}>
                  {CAT_EMOJI[t.category]||"💳"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.category}</div>
                  <div style={{ fontSize:11, color:"var(--ink4)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{merchant || fmtTxDate(t.created_at||t.date)}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>₹{fmt(t.amount)}</div>
                  <div style={{ fontSize:10, color:auto?"var(--blue)":"var(--ink4)", fontWeight:500 }}>{auto?"Auto":"Manual"}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI suggestions */}
        {suggestions.length > 0 && (
          <div className="card" style={{ padding:"16px", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif", marginBottom:10 }}>🤖 Did you forget these?</div>
            {suggestions.slice(0,2).map(s => (
              <div key={s.id} style={{ padding:"12px", borderRadius:12, marginBottom:8, border:"1px solid var(--border)" }}>
                <div style={{ fontSize:13, color:"var(--ink2)", marginBottom:10 }}>
                  Add <strong style={{ fontFamily:"'Sora',sans-serif" }}>₹{fmt(s.suggested_amount)}</strong> for {s.category}?
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>confirmSuggestion(s.id)} style={{ flex:1, padding:"8px", borderRadius:9, cursor:"pointer", background:"var(--brand)", border:"none", color:"#fff", fontSize:13, fontWeight:600, fontFamily:"inherit" }}>Confirm ✓</button>
                  <button onClick={()=>rejectSuggestion(s.id)} style={{ flex:1, padding:"8px", borderRadius:9, cursor:"pointer", background:"transparent", border:"1px solid var(--border)", color:"var(--ink3)", fontSize:13, fontFamily:"inherit" }}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobilePage>
  );
}