import { useState, useEffect } from "react";
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
  @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  .fade { animation: fadeIn .3s ease both; }
  .f1   { animation: fadeIn .3s .05s ease both; }
  .f2   { animation: fadeIn .3s .10s ease both; }
  .slide { animation: slideIn .25s ease both; }
  .slink       { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active{ background: var(--sidebar-active) !important; color: #fff !important; }
  .txcard { transition: box-shadow .2s, transform .15s; border: 1px solid var(--border) !important; }
  .txcard:hover { box-shadow: 0 6px 24px rgba(0,0,0,.08) !important; transform: translateY(-2px); }
  .abtn { transition: opacity .15s, transform .1s; }
  .abtn:hover { opacity: .88; transform: scale(1.02); }
  .pulse { animation: pulse 2s infinite; }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__ent__")) return;
  const s = document.createElement("style"); s.id = "__ent__"; s.textContent = CSS;
  document.head.appendChild(s);
}

const fmt = n => {
  const num = parseFloat(n);
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);
};

const CAT_EMOJI = { Food:"🍜", Groceries:"🛒", Travel:"🚗", Shopping:"🛍️", Entertainment:"🎬", Bills:"💡", Medicine:"💊", Other:"💰" };

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
  refresh:  "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  sms:      "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
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

function Sidebar({ onLogout, pendingCount }) {
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
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", borderRadius:7, color:"var(--sidebar-text)", fontSize:13, textDecoration:"none", marginBottom:1 }}>
                <span style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <Icon d={ICONS[item.icon]} size={14} />{item.label}
                </span>
                {item.to==="/detected-transactions" && pendingCount > 0 && (
                  <span style={{ background:"#ef4444", color:"#fff", fontSize:10, fontWeight:700, borderRadius:99, padding:"1px 6px" }}>{pendingCount}</span>
                )}
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

function TxnCard({ txn, onAccept, onIgnore, accepting, ignoring }) {
  const fmt2 = (ds) => {
    const utcStr = ds.endsWith('Z') || ds.includes('+') ? ds : ds + 'Z';
    return new Date(utcStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };
  const busy = accepting || ignoring;

  return (
    <div className="txcard slide" style={{ background:"var(--surface)", borderRadius:10, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,.04)", borderLeft:"3px solid var(--accent) !important" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:"var(--blue-bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
            {CAT_EMOJI[txn.category_guess] || "💰"}
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--ink)" }}>₹{fmt(txn.amount)}</div>
            <div style={{ fontSize:13, color:"var(--ink3)", marginTop:1 }}>{txn.merchant || "Unknown merchant"}</div>
          </div>
        </div>
        <span style={{ padding:"3px 9px", borderRadius:99, fontSize:10, fontWeight:700, background:"rgba(124,92,191,.1)", color:"var(--accent)" }}>
          PENDING
        </span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14, padding:"10px 12px", background:"#f9fafb", borderRadius:8 }}>
        <div>
          <div style={{ fontSize:10, color:"var(--ink4)", marginBottom:3 }}>CATEGORY GUESS</div>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>{txn.category_guess || "Other"}</div>
        </div>
        <div>
          <div style={{ fontSize:10, color:"var(--ink4)", marginBottom:3 }}>DETECTED ON</div>
          <div style={{ fontSize:12, fontWeight:500, color:"var(--ink2)" }}>{fmt2(txn.transaction_date)}</div>
        </div>
      </div>
      <div style={{ fontSize:11, color:"var(--ink3)", marginBottom:12, padding:"8px 10px", background:"var(--blue-bg)", borderRadius:7, border:"1px solid #bfdbfe" }}>
        📱 SmartSpend read this from your SMS — is it correct? Confirm or ignore it below.
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button className="abtn" onClick={() => onAccept(txn.sms_hash, txn)} disabled={busy}
          style={{ flex:1, padding:"9px", borderRadius:7, border:"none", background: busy?"#f3f4f6":"var(--green)", color: busy?"var(--ink4)":"#fff", fontSize:13, fontWeight:600, cursor: busy?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          {accepting ? <span style={{ display:"inline-block", animation:"spin .7s linear infinite" }}><Icon d={ICONS.refresh} size={13} /></span>
            : <Icon d={ICONS.check} size={13} />}
          {accepting ? "Adding…" : "Yes, add it"}
        </button>
        <button className="abtn" onClick={() => onIgnore(txn.sms_hash)} disabled={busy}
          style={{ flex:1, padding:"9px", borderRadius:7, border:"1px solid var(--border)", background: busy?"#f3f4f6":"var(--red-bg)", color: busy?"var(--ink4)":"var(--red)", fontSize:13, fontWeight:600, cursor: busy?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          {ignoring ? <span style={{ display:"inline-block", animation:"spin .7s linear infinite" }}><Icon d={ICONS.refresh} size={13} /></span>
            : <Icon d={ICONS.x} size={13} />}
          {ignoring ? "Ignoring…" : "No, ignore"}
        </button>
      </div>
    </div>
  );
}

export default function DetectedTransactions() {
  injectCSS();
  const navigate = useNavigate();

  const [pending, setPending]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [spinning, setSpinning]   = useState(false);
  const [accepting, setAccepting] = useState(null);
  const [ignoring, setIgnoring]   = useState(null);
  const [toast, setToast]         = useState(null);

  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  async function load() {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    try {
      const r = await fetch(`${API}/api/detected/pending`, { headers:{ Authorization:`Bearer ${token}` } });
      if (r.status === 401) { localStorage.removeItem("token"); navigate("/"); return; }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setPending(await r.json());
      setError(null);
    } catch {
      setError("Couldn't load transactions. Check your connection.");
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  }

  function showToast(text, ok) {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAccept(smsHash, originalTxn) {
    const token = localStorage.getItem("token");
    setAccepting(smsHash);
    try {
      const r = await fetch(`${API}/api/detected/accept/${smsHash}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error();

      const result = await r.json();
      console.log("Accept response:", result); // helps debug field names

      // Try every common field name the API might return, fall back to original txn data
      const amount   = result.amount   ?? result.expense?.amount   ?? originalTxn.amount;
      const merchant = result.merchant ?? result.expense?.merchant  ?? result.expense?.category
                     ?? result.description ?? originalTxn.merchant ?? "transaction";

      showToast(`Added ₹${fmt(amount)} — ${merchant} to your expenses ✓`, true);
      window.dispatchEvent(new Event("transaction-confirmed"));
      await load();
    } catch {
      showToast("Something went wrong. Try again.", false);
    } finally {
      setAccepting(null);
    }
  }

  async function handleIgnore(smsHash) {
    const token = localStorage.getItem("token");
    setIgnoring(smsHash);
    try {
      const r = await fetch(`${API}/api/detected/ignore/${smsHash}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error();
      showToast("Transaction ignored and removed.", true);
      await load();
    } catch {
      showToast("Something went wrong. Try again.", false);
    } finally {
      setIgnoring(null);
    }
  }

  function logout() { localStorage.removeItem("token"); navigate("/"); }

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:28, height:28, border:"2.5px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 12px" }} />
        <div style={{ fontSize:12, color:"var(--ink3)" }}>Checking your SMS transactions…</div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar onLogout={logout} pendingCount={pending.length} />

      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, padding:"12px 18px", borderRadius:9, background: toast.ok ? "var(--green)" : "var(--red)", color:"#fff", fontSize:13, fontWeight:500, boxShadow:"0 8px 24px rgba(0,0,0,.15)", animation:"slideIn .25s ease", maxWidth:340 }}>
          {toast.text}
        </div>
      )}

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--ink)" }}>SMS Detected 📱</div>
            <div style={{ fontSize:13, color:"var(--ink3)", marginTop:2 }}>
              Payments spotted in your SMS — confirm the ones that are real
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:11, color:"var(--ink4)", display:"flex", alignItems:"center", gap:5 }}>
              <span className="pulse" style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"var(--green)" }} />
              Auto-refreshing
            </div>
            <button onClick={() => { setSpinning(true); load(); }} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:7, border:"1px solid var(--border)", background:"var(--surface)", color:"var(--ink2)", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
              <span style={{ display:"inline-block", animation: spinning?"spin .7s linear infinite":"none" }}>
                <Icon d={ICONS.refresh} size={13} />
              </span>
              Refresh
            </button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:"var(--bg)" }}>
          {error && (
            <div className="fade" style={{ marginBottom:16, padding:"12px 16px", borderRadius:8, background:"var(--red-bg)", border:"1px solid #fecaca", color:"var(--red)", fontSize:13 }}>
              ⚠️ {error}
            </div>
          )}

          {pending.length > 0 && (
            <div className="fade" style={{ marginBottom:20, padding:"12px 16px", borderRadius:9, background:"var(--blue-bg)", border:"1px solid #bfdbfe", display:"flex", alignItems:"center", gap:12 }}>
              <Icon d={ICONS.sms} size={18} color="var(--blue)" />
              <div style={{ fontSize:13, color:"var(--blue)" }}>
                <strong>{pending.length} payment{pending.length>1?"s":""}</strong> detected from your SMS.
                Tap <strong>"Yes, add it"</strong> to log it as an expense, or <strong>"No, ignore"</strong> if it's not yours.
              </div>
            </div>
          )}

          {pending.length === 0 && !error ? (
            <div className="fade" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"56px 20px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--ink2)", marginBottom:6 }}>You're all caught up!</div>
              <div style={{ fontSize:13, color:"var(--ink3)" }}>
                No SMS payments waiting for review.<br />
                New ones will appear here automatically when detected.
              </div>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px,1fr))", gap:16 }}>
              {pending.map(txn => (
                <TxnCard
                  key={txn.id}
                  txn={txn}
                  onAccept={handleAccept}
                  onIgnore={handleIgnore}
                  accepting={accepting === txn.sms_hash}
                  ignoring={ignoring === txn.sms_hash}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}