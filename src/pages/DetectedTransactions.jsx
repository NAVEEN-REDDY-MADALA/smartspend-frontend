import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --sidebar-bg:     #2d1b69;
    --sidebar-hover:  rgba(255,255,255,0.08);
    --sidebar-active: rgba(255,255,255,0.15);
    --sidebar-text:   rgba(255,255,255,0.75);
    --sidebar-muted:  rgba(255,255,255,0.4);
    --accent:         #7c5cbf;
    --bg:             #f4f3f8;
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
    --font: 'Plus Jakarta Sans', system-ui, sans-serif;
    --bottom-nav-h: 64px;
  }

  html, body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
    overscroll-behavior: none;
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideDown{ from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes popIn    { 0%{transform:scale(.95);opacity:0} 100%{transform:scale(1);opacity:1} }
  @keyframes slideUp  { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes toastIn  { from{transform:translateY(20px) translateX(-50%);opacity:0} to{transform:translateY(0) translateX(-50%);opacity:1} }

  .fade-up   { animation: fadeUp   .3s ease both; }
  .slide-down{ animation: slideDown .25s ease both; }
  .pop-in    { animation: popIn    .2s ease both; }
  .slide-up  { animation: slideUp  .3s cubic-bezier(.34,1.56,.64,1) both; }

  /* Desktop sidebar */
  .desktop-sidebar { display:flex; }
  .bottom-nav      { display:none; }
  .mobile-header   { display:none; }
  .desktop-header  { display:flex; }

  /* ── Mobile breakpoint ── */
  @media (max-width: 768px) {
    .desktop-sidebar { display:none !important; }
    .bottom-nav      { display:flex !important; }
    .mobile-header   { display:flex !important; }
    .desktop-header  { display:none !important; }
    .main-content    { padding-bottom: calc(var(--bottom-nav-h) + 16px) !important; }
    .page-wrap       { padding: 14px 14px !important; }
    .summary-grid    { grid-template-columns: 1fr 1fr !important; gap:8px !important; }
    .summary-grid > div:first-child { grid-column: 1 / -1; }
    .filter-grid     { grid-template-columns: 1fr !important; }
    .txn-row         { flex-direction: column !important; gap:10px !important; padding:14px !important; }
    .txn-actions     { width:100% !important; justify-content:stretch !important; }
    .txn-actions button { flex:1 !important; justify-content:center !important; }
    .txn-amount-row  { gap:6px !important; }
    .filter-bar      { padding:14px !important; }
  }

  .slink { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active { background: var(--sidebar-active) !important; color: #fff !important; }

  .row-card { transition: box-shadow .2s, transform .12s; }
  .row-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.08) !important; transform: translateY(-1px); }

  .chip-btn { transition: all .15s; cursor: pointer; border: none; font-family: inherit; }
  .chip-btn:hover { opacity: .85; }

  .action-btn { transition: opacity .15s, transform .1s; }
  .action-btn:hover { opacity:.88; transform:scale(1.02); }

  .pulse { animation: pulse 2s infinite; }

  /* Bottom nav */
  .bottom-nav {
    position: fixed; bottom:0; left:0; right:0; z-index:100;
    height: var(--bottom-nav-h);
    background: var(--sidebar-bg);
    border-top: 1px solid rgba(255,255,255,.1);
    align-items: center;
    justify-content: space-around;
    padding: 0 8px;
    safe-area-inset-bottom: env(safe-area-inset-bottom);
  }

  .bnav-item {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:6px 10px; border-radius:10px; cursor:pointer;
    text-decoration:none; color: var(--sidebar-muted);
    font-size:10px; font-weight:600; font-family:var(--font);
    transition: all .2s; position:relative; min-width:52px;
  }
  .bnav-item.active { color:#fff; background: rgba(255,255,255,.12); }
  .bnav-badge {
    position:absolute; top:2px; right:6px;
    background:#ef4444; color:#fff; font-size:9px; font-weight:700;
    border-radius:99px; padding:1px 5px; min-width:16px; text-align:center;
  }

  /* Sheet overlay */
  .sheet-overlay {
    position:fixed; inset:0; z-index:200;
    background: rgba(0,0,0,.45);
    backdrop-filter: blur(2px);
  }
  .sheet-panel {
    position:fixed; bottom:0; left:0; right:0; z-index:201;
    background: var(--surface);
    border-radius:20px 20px 0 0;
    max-height:82vh; overflow-y:auto;
    animation: slideUp .32s cubic-bezier(.34,1.2,.64,1) both;
    padding-bottom: env(safe-area-inset-bottom, 16px);
  }

  /* Swipe hint */
  .sheet-handle {
    width:38px; height:4px; background:var(--border);
    border-radius:99px; margin:10px auto 0;
  }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__det3__")) return;
  const s = document.createElement("style"); s.id = "__det3__"; s.textContent = CSS;
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
  chevDown: "M6 9l6 6 6-6",
  menu:     "M4 6h16M4 12h16M4 18h16",
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

const BOTTOM_NAV = [
  { to:"/dashboard",              label:"Home",     icon:"home"     },
  { to:"/transactions",           label:"Txns",     icon:"tx"       },
  { to:"/detected-transactions",  label:"SMS",      icon:"detect"   },
  { to:"/analytics",              label:"Analytics",icon:"analytics"},
  { to:"/reminders",              label:"Remind",   icon:"reminder" },
];

function Sidebar({ onLogout, pendingCount }) {
  const path = window.location.pathname;
  return (
    <aside className="desktop-sidebar" style={{ width:200, flexShrink:0, background:"var(--sidebar-bg)", flexDirection:"column", height:"100vh", position:"sticky", top:0, overflow:"hidden" }}>
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

function BottomNav({ pendingCount, onLogout }) {
  const path = window.location.pathname;
  return (
    <nav className="bottom-nav">
      {BOTTOM_NAV.map(item => (
        <a key={item.to} href={item.to}
          className={`bnav-item${path===item.to?" active":""}`}>
          <Icon d={ICONS[item.icon]} size={20} />
          {item.label}
          {item.to==="/detected-transactions" && pendingCount > 0 && (
            <span className="bnav-badge">{pendingCount}</span>
          )}
        </a>
      ))}
    </nav>
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
  const emoji        = isCredit
    ? (CREDIT_SOURCE_EMOJI[txn.credit_source] || "💰")
    : (CAT_EMOJI[txn.category_guess] || "💸");

  return (
    <div className="row-card txn-row fade-up" style={{
      display:"flex", alignItems:"flex-start", gap:12,
      background:"var(--surface)", borderRadius:14,
      padding:"16px", border:`1px solid var(--border)`,
      borderLeft:`4px solid ${accentColor}`,
      boxShadow:"0 1px 6px rgba(0,0,0,.05)",
    }}>
      {/* Emoji icon */}
      <div style={{ width:44, height:44, borderRadius:12, background:accentBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
        {emoji}
      </div>

      {/* Main info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div className="txn-amount-row" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
          <span style={{ fontSize:17, fontWeight:800, color:"var(--ink)", fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
            {isCredit ? "+" : "-"}₹{fmt(txn.amount)}
          </span>
          <span style={{ padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:700, background:accentBg, color:accentColor, border:`1px solid ${accentBorder}` }}>
            {isCredit ? "CREDIT" : "DEBIT"}
          </span>
          {isCredit && txn.credit_source && (
            <span style={{ padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:600, background:"var(--purple-bg)", color:"var(--purple)", border:"1px solid var(--purple-border)" }}>
              {txn.credit_source}
            </span>
          )}
        </div>
        <div style={{ fontSize:13, color:"var(--ink2)", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:4 }}>
          {isCredit ? `From: ${txn.merchant || "Unknown"}` : (txn.merchant || "Unknown merchant")}
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:"var(--ink4)", background:"var(--bg)", padding:"2px 7px", borderRadius:5 }}>
            {isCredit ? "Income" : txn.category_guess || "Other"}
          </span>
          <span style={{ fontSize:11, color:"var(--ink4)" }}>
            {fmtDate(txn.transaction_date)}
          </span>
        </div>

        {/* Action buttons — full width on mobile */}
        <div className="txn-actions" style={{ display:"flex", gap:8, marginTop:12 }}>
          <button className="action-btn" onClick={() => onAccept(txn.sms_hash, txn)} disabled={busy}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 14px", borderRadius:9, border:"none",
              background: busy ? "#f3f4f6" : "var(--green)", color: busy ? "var(--ink4)" : "#fff",
              fontSize:12, fontWeight:700, cursor: busy ? "not-allowed" : "pointer", fontFamily:"inherit",
              flex: 1 }}>
            {accepting
              ? <span style={{ display:"inline-block", animation:"spin .7s linear infinite", width:13, height:13 }}><Icon d={ICONS.refresh} size={12} /></span>
              : <Icon d={ICONS.check} size={12} />}
            {accepting ? "Adding…" : isCredit ? "Add to Income" : "Add Expense"}
          </button>
          <button className="action-btn" onClick={() => onIgnore(txn.sms_hash)} disabled={busy}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 13px", borderRadius:9,
              border:"1px solid var(--border)", background: busy ? "#f3f4f6" : "var(--surface)",
              color: busy ? "var(--ink4)" : "var(--ink3)", fontSize:12, fontWeight:700,
              cursor: busy ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
            {ignoring
              ? <span style={{ display:"inline-block", animation:"spin .7s linear infinite" }}><Icon d={ICONS.refresh} size={12} /></span>
              : <Icon d={ICONS.x} size={12} />}
            {ignoring ? "…" : "Ignore"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Filter Sheet (mobile bottom sheet + desktop panel) ───────────────────────
function FilterSheet({ filters, onChange, counts, onClose, isMobile }) {
  const typeOptions = [
    { value:"all",    label:"All",       count: counts.all    },
    { value:"debit",  label:"💸 Debits",   count: counts.debit  },
    { value:"credit", label:"💰 Credits",  count: counts.credit },
  ];
  const amountOptions = [
    { value:"all",    label:"Any"         },
    { value:"small",  label:"< ₹500"      },
    { value:"medium", label:"₹500–₹2K"    },
    { value:"large",  label:"> ₹2K"       },
  ];
  const categoryOptions = ["All","Food","Travel","Shopping","Entertainment","Bills","Groceries","Medicine","Income","Other"];
  const dateOptions = [
    { value:"all",   label:"All time"   },
    { value:"today", label:"Today"      },
    { value:"week",  label:"This week"  },
    { value:"month", label:"This month" },
  ];
  const chipStyle = (active) => ({
    padding:"7px 13px", borderRadius:99, fontSize:12, fontWeight:600,
    background: active ? "var(--accent)" : "var(--bg)",
    color:      active ? "#fff"          : "var(--ink3)",
    border:     active ? "none"          : "1px solid var(--border)",
    cursor:"pointer", fontFamily:"inherit",
  });

  const content = (
    <div style={{ padding:"0 16px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <span style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>Filters</span>
        <div style={{ display:"flex", gap:8 }}>
          {(filters.type !== "all" || filters.amount !== "all" || filters.category !== "All" || filters.date !== "all") && (
            <button onClick={() => onChange({ type:"all", amount:"all", category:"All", date:"all" })}
              style={{ fontSize:11, color:"var(--accent)", background:"none", border:"none", cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}>
              Clear all
            </button>
          )}
          {isMobile && (
            <button onClick={onClose}
              style={{ width:28, height:28, borderRadius:99, border:"1px solid var(--border)", background:"var(--bg)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon d={ICONS.x} size={13} color="var(--ink3)" />
            </button>
          )}
        </div>
      </div>

      {[
        { label:"Type", options: typeOptions, key:"type", renderOpt: o => (
          <button key={o.value} className="chip-btn" style={chipStyle(filters.type===o.value)} onClick={() => onChange({...filters,type:o.value})}>
            {o.label}{o.count>0 && <span style={{marginLeft:4,fontSize:10,opacity:.7}}>{o.count}</span>}
          </button>
        )},
        { label:"Amount", options: amountOptions, key:"amount", renderOpt: o => (
          <button key={o.value} className="chip-btn" style={chipStyle(filters.amount===o.value)} onClick={() => onChange({...filters,amount:o.value})}>{o.label}</button>
        )},
        { label:"Date", options: dateOptions, key:"date", renderOpt: o => (
          <button key={o.value} className="chip-btn" style={chipStyle(filters.date===o.value)} onClick={() => onChange({...filters,date:o.value})}>{o.label}</button>
        )},
      ].map(section => (
        <div key={section.key} style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--ink4)", textTransform:"uppercase", letterSpacing:".8px", marginBottom:8 }}>{section.label}</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{section.options.map(section.renderOpt)}</div>
        </div>
      ))}

      {filters.type !== "credit" && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--ink4)", textTransform:"uppercase", letterSpacing:".8px", marginBottom:8 }}>Category</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {categoryOptions.map(cat => (
              <button key={cat} className="chip-btn" style={chipStyle(filters.category===cat)} onClick={() => onChange({...filters,category:cat})}>
                {CAT_EMOJI[cat]||""} {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="sheet-overlay" onClick={onClose} />
        <div className="sheet-panel">
          <div className="sheet-handle" />
          <div style={{ height:16 }} />
          {content}
        </div>
      </>
    );
  }

  return (
    <div className="pop-in filter-bar" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:"16px", marginBottom:14 }}>
      {content}
    </div>
  );
}

// ── Summary Bar ───────────────────────────────────────────────────────────────
function SummaryBar({ pending }) {
  const totalDebit  = pending.filter(t => t.transaction_type !== "credit").reduce((s,t)=>s+t.amount,0);
  const totalCredit = pending.filter(t => t.transaction_type === "credit").reduce((s,t)=>s+t.amount,0);
  const debitCount  = pending.filter(t => t.transaction_type !== "credit").length;
  const creditCount = pending.filter(t => t.transaction_type === "credit").length;
  return (
    <div className="summary-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
      {[
        { label:"Pending",          value: pending.length,         sub:"transactions",        bg:"var(--purple-bg)", color:"var(--purple)", border:"var(--purple-border)" },
        { label:"Expenses Waiting", value:`₹${fmt(totalDebit)}`,   sub:`${debitCount} debits`,    bg:"var(--red-bg)",    color:"var(--red)",    border:"var(--red-border)"    },
        { label:"Income Waiting",   value:`₹${fmt(totalCredit)}`,  sub:`${creditCount} credits`,  bg:"var(--green-bg)",  color:"var(--green)",  border:"var(--green-border)"  },
      ].map((s,i) => (
        <div key={i} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:12, padding:"12px 14px" }}>
          <div style={{ fontSize:10, fontWeight:700, color:s.color, textTransform:"uppercase", letterSpacing:".5px", marginBottom:4 }}>{s.label}</div>
          <div style={{ fontSize:18, fontWeight:800, color:s.color, fontFamily:"'Sora',sans-serif", lineHeight:1.1 }}>{s.value}</div>
          <div style={{ fontSize:10, color:s.color, opacity:.7, marginTop:2 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DetectedTransactions() {
  injectCSS();
  const navigate = useNavigate();

  const [pending,    setPending]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [spinning,   setSpinning]   = useState(false);
  const [accepting,  setAccepting]  = useState(null);
  const [ignoring,   setIgnoring]   = useState(null);
  const [toast,      setToast]      = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters,    setFilters]    = useState({ type:"all", amount:"all", category:"All", date:"all" });
  const [isMobile,   setIsMobile]   = useState(window.innerWidth <= 768);

  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { load(); const iv = setInterval(load, 5000); return () => clearInterval(iv); }, []);

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
      setError("Couldn't load. Check your connection.");
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  }

  const filtered = useMemo(() => {
    let result = [...pending];
    if (filters.type === "debit")  result = result.filter(t => t.transaction_type !== "credit");
    if (filters.type === "credit") result = result.filter(t => t.transaction_type === "credit");
    if (filters.amount === "small")  result = result.filter(t => t.amount < 500);
    if (filters.amount === "medium") result = result.filter(t => t.amount >= 500 && t.amount <= 2000);
    if (filters.amount === "large")  result = result.filter(t => t.amount > 2000);
    if (filters.category !== "All") {
      result = result.filter(t => t.transaction_type === "credit"
        ? filters.category === "Income"
        : (t.category_guess || "Other") === filters.category);
    }
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week  = new Date(today); week.setDate(today.getDate() - 7);
    const month = new Date(today.getFullYear(), today.getMonth(), 1);
    if (filters.date === "today") result = result.filter(t => new Date(t.transaction_date+"Z") >= today);
    if (filters.date === "week")  result = result.filter(t => new Date(t.transaction_date+"Z") >= week);
    if (filters.date === "month") result = result.filter(t => new Date(t.transaction_date+"Z") >= month);
    return result;
  }, [pending, filters]);

  const counts = useMemo(() => ({
    all:    pending.length,
    debit:  pending.filter(t => t.transaction_type !== "credit").length,
    credit: pending.filter(t => t.transaction_type === "credit").length,
  }), [pending]);

  function showToast(text, ok) { setToast({text,ok}); setTimeout(()=>setToast(null),3500); }

  async function handleAccept(smsHash, originalTxn) {
    const token = localStorage.getItem("token");
    const isCredit = originalTxn.transaction_type === "credit";
    setAccepting(smsHash);
    try {
      const r = await fetch(`${API}/api/detected/accept/${smsHash}`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
      if (!r.ok) throw new Error();
      const result = await r.json();
      const amount = result.amount ?? originalTxn.amount;
      showToast(isCredit ? `₹${fmt(amount)} added to Income 💰` : `₹${fmt(amount)} added as Expense ✓`, true);
      window.dispatchEvent(new Event("transaction-confirmed"));
      await load();
    } catch { showToast("Something went wrong. Try again.", false); }
    finally { setAccepting(null); }
  }

  async function handleIgnore(smsHash) {
    const token = localStorage.getItem("token");
    setIgnoring(smsHash);
    try {
      const r = await fetch(`${API}/api/detected/ignore/${smsHash}`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
      if (!r.ok) throw new Error();
      showToast("Transaction ignored.", true);
      await load();
    } catch { showToast("Something went wrong. Try again.", false); }
    finally { setIgnoring(null); }
  }

  function logout() { localStorage.removeItem("token"); navigate("/"); }

  const activeFilterCount = [
    filters.type !== "all", filters.amount !== "all",
    filters.category !== "All", filters.date !== "all",
  ].filter(Boolean).length;

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"var(--bg)", flexDirection:"column", gap:12 }}>
      <div style={{ width:28, height:28, border:"2.5px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
      <div style={{ fontSize:13, color:"var(--ink3)", fontFamily:"var(--font)" }}>Loading SMS transactions…</div>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar onLogout={logout} pendingCount={pending.length} />

      {/* Mobile filter sheet */}
      {showFilter && isMobile && (
        <FilterSheet filters={filters} onChange={setFilters} counts={counts} onClose={()=>setShowFilter(false)} isMobile={true} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom: isMobile ? `calc(var(--bottom-nav-h) + 12px)` : 24, left:"50%", transform:"translateX(-50%)", zIndex:9999, padding:"12px 20px", borderRadius:12, background: toast.ok ? "var(--green)" : "var(--red)", color:"#fff", fontSize:13, fontWeight:600, boxShadow:"0 8px 28px rgba(0,0,0,.2)", animation:"toastIn .3s ease both", whiteSpace:"nowrap", fontFamily:"var(--font)" }}>
          {toast.text}
        </div>
      )}

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Desktop Header */}
        <div className="desktop-header" style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"16px 28px", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>SMS Detected 📱</div>
            <div style={{ fontSize:13, color:"var(--ink3)", marginTop:2 }}>Review expenses & income spotted in your SMS</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:11, color:"var(--ink4)", display:"flex", alignItems:"center", gap:5 }}>
              <span className="pulse" style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"var(--green)" }} />
              Auto-refreshing
            </div>
            <button onClick={()=>setShowFilter(f=>!f)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"1px solid var(--border)", background: showFilter?"var(--purple-bg)":"var(--surface)", color: showFilter?"var(--purple)":"var(--ink2)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", position:"relative" }}>
              <Icon d={ICONS.filter} size={13} /> Filters
              {activeFilterCount > 0 && (
                <span style={{ position:"absolute", top:-5, right:-5, width:16, height:16, borderRadius:"50%", background:"var(--accent)", color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{activeFilterCount}</span>
              )}
            </button>
            <button onClick={()=>{setSpinning(true);load();}}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface)", color:"var(--ink2)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              <span style={{ display:"inline-block", animation: spinning?"spin .7s linear infinite":"none" }}><Icon d={ICONS.refresh} size={13} /></span>
              Refresh
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="mobile-header" style={{ background:"var(--sidebar-bg)", padding:"14px 16px 12px", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:"#fff", fontFamily:"'Sora',sans-serif", lineHeight:1 }}>SMS Detected 📱</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.55)", marginTop:2 }}>
              {pending.length > 0 ? `${pending.length} pending review` : "All caught up!"}
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setShowFilter(f=>!f)}
              style={{ width:36, height:36, borderRadius:10, border:"1px solid rgba(255,255,255,.2)", background: showFilter?"rgba(255,255,255,.2)":"rgba(255,255,255,.1)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <Icon d={ICONS.filter} size={16} color="#fff" />
              {activeFilterCount > 0 && (
                <span style={{ position:"absolute", top:-3, right:-3, width:14, height:14, borderRadius:"50%", background:"#ef4444", color:"#fff", fontSize:8, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{activeFilterCount}</span>
              )}
            </button>
            <button onClick={()=>{setSpinning(true);load();}}
              style={{ width:36, height:36, borderRadius:10, border:"1px solid rgba(255,255,255,.2)", background:"rgba(255,255,255,.1)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ display:"inline-block", animation: spinning?"spin .7s linear infinite":"none" }}><Icon d={ICONS.refresh} size={16} color="#fff" /></span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="main-content" style={{ flex:1, overflowY:"auto", background:"var(--bg)" }}>
          <div className="page-wrap" style={{ padding:"18px 24px", maxWidth:820 }}>

            {error && (
              <div className="fade-up" style={{ marginBottom:12, padding:"12px 16px", borderRadius:10, background:"var(--red-bg)", border:"1px solid var(--red-border)", color:"var(--red)", fontSize:13 }}>
                ⚠️ {error}
              </div>
            )}

            {pending.length > 0 && <SummaryBar pending={pending} />}

            {pending.length > 0 && (
              <div className="fade-up" style={{ marginBottom:12, padding:"11px 14px", borderRadius:10, background:"var(--blue-bg)", border:"1px solid var(--blue-border)", display:"flex", alignItems:"center", gap:10 }}>
                <Icon d={ICONS.sms} size={16} color="var(--blue)" />
                <div style={{ fontSize:12, color:"var(--blue)", lineHeight:1.4 }}>
                  <strong>{pending.length} transaction{pending.length>1?"s":""}</strong> detected.
                  💸 Debits → Expenses · 💰 Credits → Income
                </div>
              </div>
            )}

            {/* Desktop filter panel */}
            {showFilter && !isMobile && (
              <FilterSheet filters={filters} onChange={setFilters} counts={counts} onClose={()=>setShowFilter(false)} isMobile={false} />
            )}

            {showFilter && filtered.length !== pending.length && (
              <div style={{ marginBottom:10, fontSize:12, color:"var(--ink3)", display:"flex", alignItems:"center", gap:5 }}>
                <Icon d={ICONS.filter} size={12} color="var(--ink4)" />
                Showing {filtered.length} of {pending.length}
              </div>
            )}

            {/* Empty state */}
            {pending.length === 0 && !error && (
              <div className="fade-up" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:"52px 20px", textAlign:"center", boxShadow:"0 1px 6px rgba(0,0,0,.04)" }}>
                <div style={{ fontSize:44, marginBottom:12 }}>✅</div>
                <div style={{ fontSize:15, fontWeight:700, color:"var(--ink2)", marginBottom:6 }}>You're all caught up!</div>
                <div style={{ fontSize:13, color:"var(--ink3)", lineHeight:1.6 }}>
                  No SMS payments waiting for review.<br />
                  New ones appear here automatically.
                </div>
              </div>
            )}

            {/* No filter match */}
            {pending.length > 0 && filtered.length === 0 && (
              <div className="fade-up" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:"40px 20px", textAlign:"center" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🔍</div>
                <div style={{ fontSize:14, fontWeight:700, color:"var(--ink2)", marginBottom:12 }}>No matches for these filters</div>
                <button onClick={() => setFilters({ type:"all", amount:"all", category:"All", date:"all" })}
                  style={{ padding:"8px 18px", borderRadius:8, background:"var(--accent)", color:"#fff", border:"none", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  Clear filters
                </button>
              </div>
            )}

            {/* Transaction list */}
            {filtered.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {filtered.map((txn, i) => (
                  <div key={txn.id} style={{ animationDelay:`${i*0.04}s` }}>
                    <TxnRow
                      txn={txn}
                      onAccept={handleAccept}
                      onIgnore={handleIgnore}
                      accepting={accepting === txn.sms_hash}
                      ignoring={ignoring === txn.sms_hash}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <BottomNav pendingCount={pending.length} onLogout={logout} /> */}
    </div>
  );
}