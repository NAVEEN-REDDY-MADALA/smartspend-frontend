

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
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
    --green-border:   #a7f3d0;
    --red:            #dc2626;
    --red-bg:         #fef2f2;
    --red-border:     #fecaca;
    --amber:          #d97706;
    --amber-bg:       #fffbeb;
    --blue:           #2563eb;
    --blue-bg:        #eff6ff;
    --blue-border:    #bfdbfe;
    --purple:         #7c3aed;
    --purple-bg:      #f5f3ff;
    --purple-border:  #ddd6fe;
  }
  html, body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  @keyframes fadeIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes popIn   { 0%{transform:scale(.93);opacity:0} 100%{transform:scale(1);opacity:1} }
  .fade   { animation: fadeIn  .3s ease both; }
  .slide  { animation: slideIn .25s ease both; }
  .pop    { animation: popIn   .2s ease both; }
  .slink       { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active{ background: var(--sidebar-active) !important; color: #fff !important; }
  .row-card { transition: box-shadow .2s, transform .12s; }
  .row-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.07) !important; transform: translateY(-1px); }
  .chip-btn { transition: all .15s; cursor: pointer; border: none; font-family: inherit; }
  .chip-btn:hover { opacity: .85; }
  .action-btn { transition: opacity .15s, transform .1s; }
  .action-btn:hover { opacity: .88; transform: scale(1.02); }
  .pulse { animation: pulse 2s infinite; }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__det2__")) return;
  const s = document.createElement("style"); s.id = "__det2__"; s.textContent = CSS;
  document.head.appendChild(s);
}

const fmt = n => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(parseFloat(n) || 0);

const CAT_EMOJI = {
  Food:"🍜", Groceries:"🛒", Travel:"🚗", Shopping:"🛍️",
  Entertainment:"🎬", Bills:"💡", Medicine:"💊", Finance:"💳",
  Income:"💰", Other:"💸",
};

const CREDIT_SOURCE_EMOJI = {
  Salary:"💼", Refund:"↩️", Cashback:"🎁", "UPI Received":"📲", Other:"💰",
};

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
  filter:   "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  arrowUp:  "M12 19V5M5 12l7-7 7 7",
  arrowDn:  "M12 5v14M19 12l-7 7-7-7",
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

// ── Transaction Row ───────────────────────────────────────────────────────────
function TxnRow({ txn, onAccept, onIgnore, accepting, ignoring }) {
  const isCredit = txn.transaction_type === "credit";
  const busy     = accepting || ignoring;

  const fmtDate = (ds) => {
    const utcStr = ds.endsWith("Z") || ds.includes("+") ? ds : ds + "Z";
    return new Date(utcStr).toLocaleString("en-IN", {
      day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", hour12:true
    });
  };

  const accentColor  = isCredit ? "var(--green)"  : "var(--red)";
  const accentBg     = isCredit ? "var(--green-bg)" : "var(--red-bg)";
  const accentBorder = isCredit ? "var(--green-border)" : "var(--red-border)";
  const typeLabel    = isCredit ? "CREDIT" : "DEBIT";
  const emoji        = isCredit
    ? (CREDIT_SOURCE_EMOJI[txn.credit_source] || "💰")
    : (CAT_EMOJI[txn.category_guess] || "💸");

  return (
    <div className="row-card fade" style={{
      display:"flex", alignItems:"center", gap:14,
      background:"var(--surface)", borderRadius:10,
      padding:"14px 18px",
      border:`1px solid var(--border)`,
      borderLeft:`4px solid ${accentColor}`,
      boxShadow:"0 1px 4px rgba(0,0,0,.04)",
    }}>
      {/* Emoji icon */}
      <div style={{ width:42, height:42, borderRadius:10, background:accentBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
        {emoji}
      </div>

      {/* Main info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
          <span style={{ fontSize:16, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>
            {isCredit ? "+" : "-"}₹{fmt(txn.amount)}
          </span>
          <span style={{ padding:"2px 7px", borderRadius:99, fontSize:10, fontWeight:700, background:accentBg, color:accentColor, border:`1px solid ${accentBorder}` }}>
            {typeLabel}
          </span>
          {isCredit && txn.credit_source && (
            <span style={{ padding:"2px 7px", borderRadius:99, fontSize:10, fontWeight:600, background:"var(--purple-bg)", color:"var(--purple)", border:"1px solid var(--purple-border)" }}>
              {txn.credit_source}
            </span>
          )}
        </div>
        <div style={{ fontSize:13, color:"var(--ink2)", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {isCredit ? `From: ${txn.merchant || "Unknown"}` : (txn.merchant || "Unknown merchant")}
        </div>
        <div style={{ display:"flex", gap:12, marginTop:4 }}>
          <span style={{ fontSize:11, color:"var(--ink4)" }}>
            {isCredit ? "Income" : txn.category_guess || "Other"}
          </span>
          <span style={{ fontSize:11, color:"var(--ink4)" }}>
            {fmtDate(txn.transaction_date)}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display:"flex", gap:7, flexShrink:0 }}>
        <button className="action-btn" onClick={() => onAccept(txn.sms_hash, txn)} disabled={busy}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 13px", borderRadius:7, border:"none",
            background: busy ? "#f3f4f6" : "var(--green)", color: busy ? "var(--ink4)" : "#fff",
            fontSize:12, fontWeight:600, cursor: busy ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
          {accepting
            ? <span style={{ display:"inline-block", animation:"spin .7s linear infinite", width:13, height:13 }}><Icon d={ICONS.refresh} size={12} /></span>
            : <Icon d={ICONS.check} size={12} />}
          {accepting ? "…" : isCredit ? "Add to Income" : "Add Expense"}
        </button>
        <button className="action-btn" onClick={() => onIgnore(txn.sms_hash)} disabled={busy}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 11px", borderRadius:7,
            border:"1px solid var(--border)", background: busy ? "#f3f4f6" : "var(--surface)",
            color: busy ? "var(--ink4)" : "var(--ink3)", fontSize:12, fontWeight:600,
            cursor: busy ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
          {ignoring
            ? <span style={{ display:"inline-block", animation:"spin .7s linear infinite" }}><Icon d={ICONS.refresh} size={12} /></span>
            : <Icon d={ICONS.x} size={12} />}
          {ignoring ? "…" : "Ignore"}
        </button>
      </div>
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
function FilterBar({ filters, onChange, counts }) {
  const typeOptions = [
    { value:"all",    label:"All",     count: counts.all    },
    { value:"debit",  label:"💸 Debits",  count: counts.debit  },
    { value:"credit", label:"💰 Credits", count: counts.credit },
  ];

  const amountOptions = [
    { value:"all",    label:"Any amount"  },
    { value:"small",  label:"Under ₹500"  },
    { value:"medium", label:"₹500 – ₹2K"  },
    { value:"large",  label:"Above ₹2K"   },
  ];

  const categoryOptions = ["All", "Food", "Travel", "Shopping", "Entertainment", "Bills", "Groceries", "Medicine", "Income", "Other"];

  const dateOptions = [
    { value:"all",   label:"All time"   },
    { value:"today", label:"Today"      },
    { value:"week",  label:"This week"  },
    { value:"month", label:"This month" },
  ];

  const chipStyle = (active) => ({
    padding:"6px 13px", borderRadius:99, fontSize:12, fontWeight:600,
    background: active ? "var(--accent)" : "var(--surface)",
    color:      active ? "#fff"          : "var(--ink3)",
    border:     active ? "none"          : "1px solid var(--border)",
    cursor:"pointer", fontFamily:"inherit",
  });

  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 18px", marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <Icon d={ICONS.filter} size={14} color="var(--ink3)" />
        <span style={{ fontSize:13, fontWeight:600, color:"var(--ink2)" }}>Filters</span>
        {(filters.type !== "all" || filters.amount !== "all" || filters.category !== "All" || filters.date !== "all") && (
          <button onClick={() => onChange({ type:"all", amount:"all", category:"All", date:"all" })}
            style={{ marginLeft:"auto", fontSize:11, color:"var(--accent)", background:"none", border:"none", cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}>
            Clear all ✕
          </button>
        )}
      </div>

      {/* Type filter */}
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:10, fontWeight:700, color:"var(--ink4)", textTransform:"uppercase", letterSpacing:".8px", marginBottom:6 }}>Transaction type</div>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
          {typeOptions.map(opt => (
            <button key={opt.value} className="chip-btn"
              style={chipStyle(filters.type === opt.value)}
              onClick={() => onChange({ ...filters, type: opt.value })}>
              {opt.label}
              {opt.count > 0 && <span style={{ marginLeft:5, padding:"1px 6px", borderRadius:99, fontSize:10, background: filters.type===opt.value ? "rgba(255,255,255,.25)" : "var(--bg)", color: filters.type===opt.value ? "#fff" : "var(--ink4)" }}>{opt.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Amount + Date filters in a row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:10 }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"var(--ink4)", textTransform:"uppercase", letterSpacing:".8px", marginBottom:6 }}>Amount range</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {amountOptions.map(opt => (
              <button key={opt.value} className="chip-btn"
                style={chipStyle(filters.amount === opt.value)}
                onClick={() => onChange({ ...filters, amount: opt.value })}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"var(--ink4)", textTransform:"uppercase", letterSpacing:".8px", marginBottom:6 }}>Date</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {dateOptions.map(opt => (
              <button key={opt.value} className="chip-btn"
                style={chipStyle(filters.date === opt.value)}
                onClick={() => onChange({ ...filters, date: opt.value })}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category filter — only for debit / all */}
      {filters.type !== "credit" && (
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"var(--ink4)", textTransform:"uppercase", letterSpacing:".8px", marginBottom:6 }}>Category</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {categoryOptions.map(cat => (
              <button key={cat} className="chip-btn"
                style={chipStyle(filters.category === cat)}
                onClick={() => onChange({ ...filters, category: cat })}>
                {CAT_EMOJI[cat] || ""} {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Summary Stats Row ─────────────────────────────────────────────────────────
function SummaryBar({ pending }) {
  const totalDebit  = pending.filter(t => t.transaction_type !== "credit").reduce((s, t) => s + t.amount, 0);
  const totalCredit = pending.filter(t => t.transaction_type === "credit").reduce((s, t) => s + t.amount, 0);
  const debitCount  = pending.filter(t => t.transaction_type !== "credit").length;
  const creditCount = pending.filter(t => t.transaction_type === "credit").length;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
      {[
        { label:"Total Pending",   value: pending.length,           sub:"transactions",      bg:"var(--purple-bg)", color:"var(--purple)", border:"var(--purple-border)" },
        { label:"Expenses Waiting", value:`₹${fmt(totalDebit)}`,   sub:`${debitCount} debits`,   bg:"var(--red-bg)",    color:"var(--red)",    border:"var(--red-border)"    },
        { label:"Income Waiting",  value:`₹${fmt(totalCredit)}`,   sub:`${creditCount} credits`, bg:"var(--green-bg)",  color:"var(--green)",  border:"var(--green-border)"  },
      ].map((s, i) => (
        <div key={i} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:10, padding:"12px 16px" }}>
          <div style={{ fontSize:11, fontWeight:600, color:s.color, textTransform:"uppercase", letterSpacing:".5px", marginBottom:4 }}>{s.label}</div>
          <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:"'Sora',sans-serif", lineHeight:1.1 }}>{s.value}</div>
          <div style={{ fontSize:11, color:s.color, opacity:.7, marginTop:2 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DetectedTransactions() {
  injectCSS();
  const navigate = useNavigate();

  const [pending,   setPending]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [spinning,  setSpinning]  = useState(false);
  const [accepting, setAccepting] = useState(null);
  const [ignoring,  setIgnoring]  = useState(null);
  const [toast,     setToast]     = useState(null);
  const [showFilter,setShowFilter]= useState(false);
  const [filters,   setFilters]   = useState({ type:"all", amount:"all", category:"All", date:"all" });

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

  // ── Filter logic ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...pending];

    // Type filter
    if (filters.type === "debit")  result = result.filter(t => t.transaction_type !== "credit");
    if (filters.type === "credit") result = result.filter(t => t.transaction_type === "credit");

    // Amount filter
    if (filters.amount === "small")  result = result.filter(t => t.amount < 500);
    if (filters.amount === "medium") result = result.filter(t => t.amount >= 500 && t.amount <= 2000);
    if (filters.amount === "large")  result = result.filter(t => t.amount > 2000);

    // Category filter (only applies to debit)
    if (filters.category !== "All") {
      result = result.filter(t =>
        t.transaction_type === "credit"
          ? filters.category === "Income"
          : (t.category_guess || "Other") === filters.category
      );
    }

    // Date filter
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week  = new Date(today); week.setDate(today.getDate() - 7);
    const month = new Date(today.getFullYear(), today.getMonth(), 1);

    if (filters.date === "today") result = result.filter(t => new Date(t.transaction_date + "Z") >= today);
    if (filters.date === "week")  result = result.filter(t => new Date(t.transaction_date + "Z") >= week);
    if (filters.date === "month") result = result.filter(t => new Date(t.transaction_date + "Z") >= month);

    return result;
  }, [pending, filters]);

  // Counts for filter badges
  const counts = useMemo(() => ({
    all:    pending.length,
    debit:  pending.filter(t => t.transaction_type !== "credit").length,
    credit: pending.filter(t => t.transaction_type === "credit").length,
  }), [pending]);

  function showToast(text, ok) {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAccept(smsHash, originalTxn) {
    const token    = localStorage.getItem("token");
    const isCredit = originalTxn.transaction_type === "credit";
    setAccepting(smsHash);
    try {
      const r = await fetch(`${API}/api/detected/accept/${smsHash}`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}` },
      });
      if (!r.ok) throw new Error();
      const result = await r.json();
      const amount = result.amount ?? originalTxn.amount;
      const label  = isCredit
        ? `₹${fmt(amount)} added to Income 💰`
        : `₹${fmt(amount)} — ${result.merchant || originalTxn.merchant} added as Expense ✓`;
      showToast(label, true);
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
        method:"POST", headers:{ Authorization:`Bearer ${token}` },
      });
      if (!r.ok) throw new Error();
      showToast("Transaction ignored.", true);
      await load();
    } catch {
      showToast("Something went wrong. Try again.", false);
    } finally {
      setIgnoring(null);
    }
  }

  function logout() { localStorage.removeItem("token"); navigate("/"); }

  const activeFilterCount = [
    filters.type !== "all",
    filters.amount !== "all",
    filters.category !== "All",
    filters.date !== "all",
  ].filter(Boolean).length;

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

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, padding:"12px 18px", borderRadius:9, background: toast.ok ? "var(--green)" : "var(--red)", color:"#fff", fontSize:13, fontWeight:500, boxShadow:"0 8px 24px rgba(0,0,0,.15)", animation:"slideIn .25s ease", maxWidth:360 }}>
          {toast.text}
        </div>
      )}

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>SMS Detected 📱</div>
            <div style={{ fontSize:13, color:"var(--ink3)", marginTop:2 }}>
              Expenses & income spotted in your SMS — review and confirm
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:11, color:"var(--ink4)", display:"flex", alignItems:"center", gap:5 }}>
              <span className="pulse" style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"var(--green)" }} />
              Auto-refreshing
            </div>
            {/* Filter toggle */}
            <button onClick={() => setShowFilter(f => !f)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:7, border:"1px solid var(--border)", background: showFilter ? "var(--purple-bg)" : "var(--surface)", color: showFilter ? "var(--purple)" : "var(--ink2)", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", position:"relative" }}>
              <Icon d={ICONS.filter} size={13} />
              Filters
              {activeFilterCount > 0 && (
                <span style={{ position:"absolute", top:-5, right:-5, width:16, height:16, borderRadius:"50%", background:"var(--accent)", color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button onClick={() => { setSpinning(true); load(); }}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:7, border:"1px solid var(--border)", background:"var(--surface)", color:"var(--ink2)", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
              <span style={{ display:"inline-block", animation: spinning ? "spin .7s linear infinite" : "none" }}>
                <Icon d={ICONS.refresh} size={13} />
              </span>
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 28px", background:"var(--bg)" }}>
          {error && (
            <div className="fade" style={{ marginBottom:16, padding:"12px 16px", borderRadius:8, background:"var(--red-bg)", border:"1px solid var(--red-border)", color:"var(--red)", fontSize:13 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Summary bar */}
          {pending.length > 0 && <SummaryBar pending={pending} />}

          {/* Info banner */}
          {pending.length > 0 && (
            <div className="fade" style={{ marginBottom:16, padding:"11px 16px", borderRadius:9, background:"var(--blue-bg)", border:"1px solid var(--blue-border)", display:"flex", alignItems:"center", gap:10 }}>
              <Icon d={ICONS.sms} size={16} color="var(--blue)" />
              <div style={{ fontSize:13, color:"var(--blue)" }}>
                <strong>{pending.length} transaction{pending.length>1?"s":""}</strong> detected.
                💸 Debits → saved as Expenses · 💰 Credits → saved as Income
              </div>
            </div>
          )}

          {/* Filter panel */}
          {showFilter && (
            <div className="pop">
              <FilterBar filters={filters} onChange={setFilters} counts={counts} />
            </div>
          )}

          {/* Filtered results info */}
          {showFilter && filtered.length !== pending.length && (
            <div style={{ marginBottom:12, fontSize:12, color:"var(--ink3)", display:"flex", alignItems:"center", gap:6 }}>
              <Icon d={ICONS.filter} size={12} color="var(--ink4)" />
              Showing {filtered.length} of {pending.length} transactions
            </div>
          )}

          {/* Empty state */}
          {pending.length === 0 && !error && (
            <div className="fade" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"56px 20px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--ink2)", marginBottom:6 }}>You're all caught up!</div>
              <div style={{ fontSize:13, color:"var(--ink3)" }}>
                No SMS payments waiting for review.<br />
                New ones appear here automatically when detected.
              </div>
            </div>
          )}

          {/* No filter match */}
          {pending.length > 0 && filtered.length === 0 && (
            <div className="fade" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"40px 20px", textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
              <div style={{ fontSize:14, fontWeight:600, color:"var(--ink2)", marginBottom:6 }}>No matches for these filters</div>
              <button onClick={() => setFilters({ type:"all", amount:"all", category:"All", date:"all" })}
                style={{ padding:"7px 16px", borderRadius:7, background:"var(--accent)", color:"#fff", border:"none", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", marginTop:4 }}>
                Clear filters
              </button>
            </div>
          )}

          {/* Transaction list */}
          {filtered.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {filtered.map(txn => (
                <TxnRow
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