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
  }
  html, body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes check  { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  .fade { animation: fadeIn .3s ease both; }
  .slink       { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active{ background: var(--sidebar-active) !important; color: #fff !important; }
  .inp { width:100%; padding:10px 13px; border-radius:8px; border:1.5px solid var(--border); font-size:14px; font-family:inherit; color:var(--ink); outline:none; background:var(--surface); transition:border-color .15s, box-shadow .15s; }
  .inp:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(124,92,191,.1); }
  .inp::placeholder { color:#c4c4c4; }
  .sbtn { transition: opacity .15s, transform .1s; }
  .sbtn:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__ent__")) return;
  const s = document.createElement("style"); s.id = "__ent__"; s.textContent = CSS;
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
  home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  tx:       "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  analytics:"M18 20V10M12 20V4M6 20v-6",
  goals:    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  budget:   "M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
  detect:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  reminder: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  logout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  back:     "M19 12H5M12 19l-7-7 7-7",
  check:    "M20 6L9 17l-5-5",
};

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

// ─── Source quick-pick buttons ────────────────────────────────────────────────
const SOURCES = [
  { label:"Pocket money",  emoji:"👛" },
  { label:"Part-time job", emoji:"💼" },
  { label:"Scholarship",   emoji:"🎓" },
  { label:"Freelance",     emoji:"💻" },
  { label:"Family",        emoji:"🏠" },
  { label:"Internship",    emoji:"🏢" },
  { label:"Salary",        emoji:"💰" },
  { label:"Other",         emoji:"✨" },
];

export default function AddIncome() {
  injectCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [amount, setAmount]   = useState("");
  const [source, setSource]   = useState("");
  const [date, setDate]       = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState(null); // "success" | "error"
  const [errMsg, setErrMsg]   = useState("");

  useEffect(() => {
    if (!token) navigate("/", { replace:true });
  }, []);

  function logout() { localStorage.removeItem("token"); navigate("/"); }

  async function save(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setStatus(null);

    try {
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/income/", {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ amount:parseFloat(amount), source, date }),
      });

      if (!res.ok) {
        const d = await res.json();
        setErrMsg(d.detail || "Something went wrong. Try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setTimeout(() => navigate("/dashboard", { replace:true }), 1200);

    } catch {
      setErrMsg("Can't reach the server. Check your connection.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const F = ({ label, hint, children }) => (
    <div style={{ marginBottom:18 }}>
      <label style={{ fontSize:13, fontWeight:500, color:"var(--ink2)", display:"block", marginBottom:6 }}>{label}</label>
      {hint && <div style={{ fontSize:11, color:"var(--ink4)", marginBottom:6 }}>{hint}</div>}
      {children}
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar onLogout={logout} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"16px 28px", display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={() => navigate(-1)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:7, border:"1px solid var(--border)", background:"transparent", color:"var(--ink3)", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
            <Icon d={ICONS.back} size={13} /> Back
          </button>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--ink)" }}>Add Income 💰</div>
            <div style={{ fontSize:13, color:"var(--ink3)", marginTop:2 }}>Record money you've received</div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"32px 28px", background:"var(--bg)", display:"flex", justifyContent:"center" }}>
          <div className="fade" style={{ width:"100%", maxWidth:480 }}>

            {/* Success state */}
            {status === "success" ? (
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:"48px 32px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:"var(--green-bg)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", animation:"check .4s ease" }}>
                  <Icon d={ICONS.check} size={26} color="var(--green)" />
                </div>
                <div style={{ fontSize:17, fontWeight:700, color:"var(--ink)", marginBottom:6 }}>Income saved!</div>
                <div style={{ fontSize:13, color:"var(--ink3)" }}>
                  ₹{fmt(parseFloat(amount) || 0)} from {source} added.<br />Taking you back to the dashboard…
                </div>
              </div>
            ) : (
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:"28px 28px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>

                <form onSubmit={save}>

                  {/* Amount */}
                  <F label="How much did you receive? (₹)" hint="Enter the exact amount">
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"var(--ink3)", fontWeight:500 }}>₹</span>
                      <input
                        type="number" required min="1" step="0.01"
                        placeholder="0"
                        value={amount} onChange={e => setAmount(e.target.value)}
                        className="inp" style={{ paddingLeft:28, fontSize:20, fontWeight:600 }}
                      />
                    </div>
                  </F>

                  {/* Source — quick pick */}
                  <F label="Where did it come from?">
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom: source && !SOURCES.find(s=>s.label===source) ? 10 : 0 }}>
                      {SOURCES.map(s => (
                        <button key={s.label} type="button"
                          onClick={() => setSource(s.label)}
                          style={{
                            padding:"9px 4px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                            border: source===s.label ? "2px solid var(--accent)" : "1.5px solid var(--border)",
                            background: source===s.label ? "rgba(124,92,191,.07)" : "var(--surface)",
                            color: source===s.label ? "var(--accent)" : "var(--ink2)",
                            fontSize:11, fontWeight:500, textAlign:"center",
                            transition:"border-color .12s, background .12s",
                          }}>
                          <div style={{ fontSize:18, marginBottom:3 }}>{s.emoji}</div>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </F>

                  {/* Date */}
                  <F label="When did you get it?" hint="Defaults to today">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="inp" />
                  </F>

                  {/* Error */}
                  {status === "error" && (
                    <div style={{ marginBottom:16, padding:"10px 13px", borderRadius:8, background:"var(--red-bg)", color:"var(--red)", border:"1px solid #fecaca", fontSize:13 }}>
                      ⚠️ {errMsg}
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={loading || !source} className="sbtn"
                    style={{
                      width:"100%", padding:"11px", borderRadius:8,
                      background: (loading||!source) ? "#e5e7eb" : "var(--green)",
                      border:"none",
                      color: (loading||!source) ? "var(--ink4)" : "#fff",
                      fontSize:14, fontWeight:600,
                      cursor: (loading||!source) ? "not-allowed" : "pointer",
                      fontFamily:"inherit",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    }}>
                    {loading && <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }} />}
                    {loading ? "Saving…" : "Save Income"}
                  </button>

                  {!source && (
                    <div style={{ textAlign:"center", marginTop:8, fontSize:11, color:"var(--ink4)" }}>
                      Pick where it came from first ↑
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}