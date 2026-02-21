import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    --blue:           #2563eb;
    --blue-bg:        #eff6ff;
  }
  html, body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes pop    { 0%{transform:scale(.92);opacity:0} 100%{transform:scale(1);opacity:1} }
  .fade { animation: fadeIn .3s ease both; }
  .f1   { animation: fadeIn .3s .05s ease both; }
  .f2   { animation: fadeIn .3s .10s ease both; }
  .slink       { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active{ background: var(--sidebar-active) !important; color: #fff !important; }
  .inp { width:100%; padding:9px 12px; border-radius:7px; border:1px solid var(--border); font-size:13px; font-family:inherit; color:var(--ink); outline:none; background:var(--surface); transition:border-color .15s; }
  .inp:focus { border-color: var(--accent); }
  .gcard { transition: box-shadow .2s, transform .2s; }
  .gcard:hover { box-shadow: 0 6px 24px rgba(0,0,0,.08) !important; transform: translateY(-2px); }
  .act-btn { transition: opacity .15s, transform .1s; cursor: pointer; }
  .act-btn:hover { opacity: .85; transform: scale(1.01); }
  .modal-overlay { animation: pop .2s ease both; }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__goals_v2__")) return;
  const s = document.createElement("style");
  s.id = "__goals_v2__"; s.textContent = CSS;
  document.head.appendChild(s);
}

const fmt = n => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const Icon = ({ d, size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
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
};

const NAV_SECTIONS = [
  { label: null, items: [{ to:"/dashboard", label:"Home", icon:"home" }] },
  { label: "Track Money", items: [
    { to:"/transactions", label:"Transactions", icon:"tx"       },
    { to:"/analytics",    label:"Analytics",    icon:"analytics"},
    { to:"/goals",        label:"My Goals",     icon:"goals"    },
    { to:"/budgets",      label:"My Budgets",   icon:"budget"   },
  ]},
  { label: "Auto Features", items: [
    { to:"/detected-transactions", label:"SMS Detected", icon:"detect"   },
    { to:"/reminders",             label:"Reminders",    icon:"reminder" },
  ]},
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

// ─── Add Amount Modal ─────────────────────────────────────────────────────────
function AddAmountModal({ goal, savings, onConfirm, onClose }) {
  const [amount, setAmount] = useState("");
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const QUICK = [100, 200, 500, 1000].filter(q => q <= Math.min(remaining, savings));

  function submit(e) {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || val > savings) return;
    onConfirm(goal.id, val);
    onClose();
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
      <div className="modal-overlay" style={{ background:"var(--surface)", borderRadius:14, padding:"26px", width:380, boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ fontSize:16, fontWeight:700, color:"var(--ink)", marginBottom:2 }}>Add money to goal</div>
        <div style={{ fontSize:13, color:"var(--ink3)", marginBottom:18 }}>
          <strong style={{ color:"var(--green)" }}>₹{fmt(savings)}</strong> available · Goal needs <strong>₹{fmt(remaining)}</strong> more
        </div>

        {/* Quick amounts */}
        {QUICK.length > 0 && (
          <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
            {QUICK.map(q => (
              <button key={q} type="button" onClick={() => setAmount(q.toString())}
                style={{ padding:"4px 12px", borderRadius:99, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit",
                  border:     amount===q.toString() ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
                  background: amount===q.toString() ? "rgba(124,92,191,.08)"      : "var(--surface)",
                  color:      amount===q.toString() ? "var(--accent)"             : "var(--ink3)",
                }}>₹{q}</button>
            ))}
          </div>
        )}

        <form onSubmit={submit}>
          <label style={{ fontSize:12, fontWeight:500, color:"var(--ink2)", display:"block", marginBottom:5 }}>Custom amount (₹)</label>
          <input type="number" required min="1" max={savings}
            placeholder={`Up to ₹${fmt(savings)}`}
            value={amount} onChange={e => setAmount(e.target.value)}
            className="inp" style={{ marginBottom:8 }} />

          {remaining > 0 && savings > 0 && (
            <button type="button" onClick={() => setAmount(Math.min(remaining, savings).toString())}
              style={{ fontSize:11, color:"var(--accent)", background:"none", border:"none", cursor:"pointer", padding:0, marginBottom:14, fontFamily:"inherit", textDecoration:"underline" }}>
              Fill remaining ₹{fmt(Math.min(remaining, savings))}
            </button>
          )}

          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <button type="submit"
              style={{ flex:1, padding:"10px", borderRadius:8, background:"var(--accent)", border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Add Money ✓
            </button>
            <button type="button" onClick={onClose}
              style={{ flex:1, padding:"10px", borderRadius:8, background:"transparent", border:"1px solid var(--border)", color:"var(--ink3)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ goal, savings, onDelete, onAddAmount }) {
  const pct       = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const done      = goal.status === "completed" || pct === 100;

  // Date calculations
  const today    = new Date(); today.setHours(0,0,0,0);
  const daysLeft = goal.target_date
    ? Math.ceil((new Date(goal.target_date) - today) / 86400000)
    : null;

  // 🔑 Key student metric: how much to save per day/month to hit the goal
  const dailyNeeded  = daysLeft !== null && daysLeft > 0 && remaining > 0
    ? Math.ceil(remaining / daysLeft) : null;
  const monthlyNeeded = dailyNeeded ? Math.ceil(dailyNeeded * 30) : null;

  // Pace assessment
  let paceMsg = null;
  if (dailyNeeded !== null && !done) {
    if (dailyNeeded <= 50)       paceMsg = { text:"Easy pace — totally doable!", color:"var(--green)",  bg:"var(--green-bg)" };
    else if (dailyNeeded <= 150) paceMsg = { text:"Moderate — skip a few coffees a day ☕", color:"var(--amber)", bg:"var(--amber-bg)" };
    else if (dailyNeeded <= 500) paceMsg = { text:"Stretch goal — needs discipline 💪", color:"var(--amber)", bg:"var(--amber-bg)" };
    else                         paceMsg = { text:"Very ambitious — consider extending deadline", color:"var(--red)",   bg:"var(--red-bg)"   };
  }

  // Progress milestone labels
  const milestone = pct >= 75 ? "🏁 Almost there!" : pct >= 50 ? "⚡ Halfway!" : pct >= 25 ? "📈 Good start!" : null;

  return (
    <div className="gcard" style={{
      background:"var(--surface)", border:"1px solid var(--border)",
      borderRadius:12, padding:"20px", boxShadow:"0 1px 4px rgba(0,0,0,.04)",
      borderTop: `3px solid ${done ? "var(--green)" : "var(--accent)"}`,
    }}>

      {/* Title row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"var(--ink)", marginBottom:2 }}>{goal.title}</div>
          {goal.description && <div style={{ fontSize:12, color:"var(--ink3)", lineHeight:1.5 }}>{goal.description}</div>}
        </div>
        <span style={{
          marginLeft:10, flexShrink:0,
          padding:"3px 9px", borderRadius:99, fontSize:10, fontWeight:600,
          background: done ? "var(--green-bg)" : "rgba(124,92,191,.1)",
          color: done ? "var(--green)" : "var(--accent)",
        }}>
          {done ? "✓ Completed" : "Active"}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
          <span style={{ fontSize:12, color:"var(--ink3)" }}>Progress</span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {milestone && <span style={{ fontSize:10, color:"var(--accent)", fontWeight:600 }}>{milestone}</span>}
            <span style={{ fontSize:12, fontWeight:700, color: done ? "var(--green)" : "var(--ink)" }}>{pct}%</span>
          </div>
        </div>
        <div style={{ height:8, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, transition:"width 1s ease",
            background: done ? "var(--green)" : pct >= 75 ? "#7c5cbf" : "var(--accent)" }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
        {[
          { label:"Saved so far", value:`₹${fmt(goal.current_amount)}`, highlight: false },
          { label:"Target",       value:`₹${fmt(goal.target_amount)}`,  highlight: false },
          { label:"Still needed", value: done ? "Done! 🎉" : `₹${fmt(remaining)}`, highlight: !done && remaining > 0 },
        ].map(s => (
          <div key={s.label} style={{ background: s.highlight ? "var(--amber-bg)" : "#f9fafb", borderRadius:7, padding:"8px 10px", border: s.highlight ? "1px solid #fde68a" : "none" }}>
            <div style={{ fontSize:10, color:"var(--ink4)", marginBottom:3 }}>{s.label}</div>
            <div style={{ fontSize:12, fontWeight:700, color: s.highlight ? "var(--amber)" : "var(--ink)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 🔑 Daily/monthly saving required — the key student insight */}
      {dailyNeeded !== null && !done && (
        <div style={{ marginBottom:12, padding:"12px 14px", borderRadius:9, background:"linear-gradient(135deg,#faf5ff,#f0ebff)", border:"1px solid #ddd6fe" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:".5px", marginBottom:6 }}>
            💰 To reach this goal on time
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:"var(--ink)" }}>₹{fmt(dailyNeeded)}</div>
              <div style={{ fontSize:11, color:"var(--ink3)" }}>per day</div>
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:"var(--ink)" }}>₹{fmt(monthlyNeeded)}</div>
              <div style={{ fontSize:11, color:"var(--ink3)" }}>per month</div>
            </div>
          </div>
          {paceMsg && (
            <div style={{ marginTop:8, padding:"5px 9px", borderRadius:6, background:paceMsg.bg, color:paceMsg.color, fontSize:11, fontWeight:500 }}>
              {paceMsg.text}
            </div>
          )}
        </div>
      )}

      {/* No deadline — show monthly estimate suggestion */}
      {daysLeft === null && !done && remaining > 0 && (
        <div style={{ marginBottom:12, padding:"10px 12px", borderRadius:8, background:"var(--blue-bg)", border:"1px solid #bfdbfe", fontSize:12, color:"var(--blue)" }}>
          💡 Set a target date to see how much you need to save per day to reach this goal!
        </div>
      )}

      {/* Target date badge */}
      {daysLeft !== null && (
        <div style={{
          fontSize:11, marginBottom:14, padding:"5px 10px", borderRadius:6, display:"inline-block",
          background: daysLeft < 0 ? "var(--red-bg)" : daysLeft < 30 ? "var(--amber-bg)" : "#f3f4f6",
          color: daysLeft < 0 ? "var(--red)" : daysLeft < 30 ? "var(--amber)" : "var(--ink3)",
        }}>
          {daysLeft < 0
            ? `⚠️ Overdue by ${Math.abs(daysLeft)} days — extend deadline?`
            : daysLeft === 0 ? "⏰ Due today!"
            : `📅 ${daysLeft} days left — ${new Date(goal.target_date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}`}
        </div>
      )}

      {/* Actions */}
      {!done ? (
        <div style={{ display:"flex", gap:8 }}>
          <button className="act-btn" onClick={() => onAddAmount(goal)}
            style={{ flex:1, padding:"9px", borderRadius:8, background:"var(--accent)", border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            + Add Money
          </button>
          <button className="act-btn" onClick={() => onDelete(goal.id)}
            style={{ padding:"9px 14px", borderRadius:8, background:"var(--red-bg)", border:"1px solid #fecaca", color:"var(--red)", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
            Delete
          </button>
        </div>
      ) : (
        <button className="act-btn" onClick={() => onDelete(goal.id)}
          style={{ width:"100%", padding:"9px", borderRadius:8, background:"var(--red-bg)", border:"1px solid #fecaca", color:"var(--red)", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
          Remove Goal
        </button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Goals() {
  injectCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [goals,   setGoals]   = useState([]);
  const [savings, setSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [modalGoal, setModalGoal] = useState(null);

  const [title,        setTitle]        = useState("");
  const [description,  setDescription]  = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate,   setTargetDate]   = useState("");

  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(() => {
    if (!token) { navigate("/", { replace:true }); return; }
    loadAll();
  }, []);

  async function loadAll() {
    try { await Promise.all([loadGoals(), loadSavings()]); }
    finally { setLoading(false); }
  }

  async function loadGoals() {
    const r = await fetch(`${API}/api/goals/`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) setGoals(await r.json());
  }

  async function loadSavings() {
    const r = await fetch(`${API}/api/summary/`, { headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) { const d = await r.json(); setSavings(d.savings || 0); }
  }

  async function createGoal(e) {
    e.preventDefault();
    const r = await fetch(`${API}/api/goals/`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ title, description: description || null, target_amount: parseFloat(targetAmount), target_date: targetDate || null }),
    });
    if (!r.ok) { setMessage({ text:"Something went wrong. Try again.", ok:false }); return; }
    setMessage({ text:`"${title}" created! Now set a target date to see your daily savings plan 🎯`, ok:true });
    setTitle(""); setDescription(""); setTargetAmount(""); setTargetDate("");
    loadGoals();
    setTimeout(() => setMessage(null), 4000);
  }

  async function deleteGoal(id) {
    const r = await fetch(`${API}/api/goals/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
    if (r.ok) loadGoals();
  }

  async function addAmountToGoal(goalId, amount) {
    const r = await fetch(`${API}/api/goals/${goalId}/add-amount?amount=${amount}`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
    if (!r.ok) { const err = await r.json().catch(()=>{}); alert(err?.detail || "Failed to add amount"); return; }
    loadAll();
  }

  function logout() { localStorage.removeItem("token"); navigate("/", { replace:true }); }

  const active    = goals.filter(g => g.status !== "completed");
  const completed = goals.filter(g => g.status === "completed");

  // Total still needed across all active goals
  const totalNeeded = active.reduce((s,g) => s + Math.max(0, g.target_amount - g.current_amount), 0);

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:28, height:28, border:"2.5px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 12px" }} />
        <div style={{ fontSize:12, color:"var(--ink3)" }}>Loading your goals…</div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar onLogout={logout} />

      {modalGoal && (
        <AddAmountModal
          goal={modalGoal} savings={savings}
          onConfirm={addAmountToGoal}
          onClose={() => setModalGoal(null)}
        />
      )}

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--ink)" }}>My Goals 🎯</div>
            <div style={{ fontSize:13, color:"var(--ink3)", marginTop:2 }}>Save up for things that matter — one goal at a time</div>
          </div>

          {/* Savings + goals summary pills */}
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ padding:"10px 16px", borderRadius:8, background: savings >= 0 ? "var(--green-bg)" : "var(--red-bg)", border:`1px solid ${savings>=0?"#bbf7d0":"#fecaca"}` }}>
              <div style={{ fontSize:10, color: savings>=0?"var(--green)":"var(--red)", fontWeight:600, marginBottom:1 }}>Available to invest</div>
              <div style={{ fontSize:17, fontWeight:700, color: savings>=0?"var(--green)":"var(--red)" }}>
                ₹{fmt(Math.abs(savings))} {savings < 0 && <span style={{ fontSize:11 }}>(overspent)</span>}
              </div>
            </div>
            {active.length > 0 && totalNeeded > 0 && (
              <div style={{ padding:"10px 16px", borderRadius:8, background:"#faf5ff", border:"1px solid #ddd6fe" }}>
                <div style={{ fontSize:10, color:"var(--accent)", fontWeight:600, marginBottom:1 }}>Total still needed</div>
                <div style={{ fontSize:17, fontWeight:700, color:"var(--accent)" }}>₹{fmt(totalNeeded)}</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:"var(--bg)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:20, alignItems:"start" }}>

            {/* ── Create goal form ── */}
            <div className="fade" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)", fontWeight:600, fontSize:13, color:"var(--ink)" }}>
                + Create a new goal
              </div>
              <div style={{ padding:"20px" }}>
                <form onSubmit={createGoal}>
                  <div style={{ marginBottom:13 }}>
                    <label style={{ fontSize:12, fontWeight:500, color:"var(--ink2)", display:"block", marginBottom:5 }}>
                      What are you saving for? <span style={{ color:"var(--red)" }}>*</span>
                    </label>
                    <input type="text" required placeholder="e.g. New laptop, Trip to Goa…"
                      value={title} onChange={e=>setTitle(e.target.value)} className="inp" />
                  </div>

                  <div style={{ marginBottom:13 }}>
                    <label style={{ fontSize:12, fontWeight:500, color:"var(--ink2)", display:"block", marginBottom:5 }}>
                      A bit more detail (optional)
                    </label>
                    <textarea placeholder="Why is this goal important to you?"
                      value={description} onChange={e=>setDescription(e.target.value)}
                      className="inp" style={{ minHeight:56, resize:"vertical" }} />
                  </div>

                  <div style={{ marginBottom:13 }}>
                    <label style={{ fontSize:12, fontWeight:500, color:"var(--ink2)", display:"block", marginBottom:5 }}>
                      How much do you need? (₹) <span style={{ color:"var(--red)" }}>*</span>
                    </label>
                    <input type="number" required min="1" step="1" placeholder="e.g. 15000"
                      value={targetAmount} onChange={e=>setTargetAmount(e.target.value)} className="inp" />
                  </div>

                  <div style={{ marginBottom:6 }}>
                    <label style={{ fontSize:12, fontWeight:500, color:"var(--ink2)", display:"block", marginBottom:5 }}>
                      When do you want to reach it?
                    </label>
                    <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} className="inp" />
                    <div style={{ fontSize:11, color:"var(--ink4)", marginTop:4 }}>
                      💡 Set a date to see your daily savings plan
                    </div>
                  </div>

                  <button type="submit" style={{ width:"100%", marginTop:16, padding:"10px", borderRadius:8, background:"var(--accent)", border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                    Create Goal
                  </button>
                </form>

                {message && (
                  <div style={{ marginTop:12, padding:"10px 13px", borderRadius:7, fontSize:12, background: message.ok ? "var(--green-bg)" : "var(--red-bg)", color: message.ok ? "var(--green)" : "var(--red)", border:`1px solid ${message.ok?"#bbf7d0":"#fecaca"}` }}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>

            {/* ── Goals list ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {goals.length === 0 ? (
                <div className="f1" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"56px 20px", textAlign:"center" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
                  <div style={{ fontSize:15, fontWeight:600, color:"var(--ink2)", marginBottom:6 }}>No goals yet</div>
                  <div style={{ fontSize:13, color:"var(--ink3)", marginBottom:4 }}>Create your first goal and start saving for it!</div>
                  <div style={{ fontSize:12, color:"var(--ink4)" }}>Add a target date and SmartSpend will tell you exactly how much to save per day.</div>
                </div>
              ) : (
                <>
                  {active.length > 0 && (
                    <div className="f1">
                      <div style={{ fontSize:12, fontWeight:600, color:"var(--ink3)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>
                        In Progress ({active.length})
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(270px,1fr))", gap:14 }}>
                        {active.map(g => (
                          <GoalCard key={g.id} goal={g} savings={savings}
                            onDelete={deleteGoal} onAddAmount={setModalGoal} />
                        ))}
                      </div>
                    </div>
                  )}

                  {completed.length > 0 && (
                    <div className="f2">
                      <div style={{ fontSize:12, fontWeight:600, color:"var(--green)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>
                        Completed 🎉 ({completed.length})
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(270px,1fr))", gap:14 }}>
                        {completed.map(g => (
                          <GoalCard key={g.id} goal={g} savings={savings}
                            onDelete={deleteGoal} onAddAmount={setModalGoal} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}