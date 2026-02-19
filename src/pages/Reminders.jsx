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
  @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  .fade { animation: fadeIn .3s ease both; }
  .f1   { animation: fadeIn .3s .05s ease both; }
  .f2   { animation: fadeIn .3s .10s ease both; }
  .slink       { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active{ background: var(--sidebar-active) !important; color: #fff !important; }
  .inp { width:100%; padding:9px 12px; border-radius:7px; border:1px solid var(--border); font-size:13px; font-family:inherit; color:var(--ink); outline:none; background:var(--surface); transition:border-color .15s; }
  .inp:focus { border-color: var(--accent); }
  .rcard { transition: box-shadow .2s, transform .15s; }
  .rcard:hover { box-shadow: 0 6px 24px rgba(0,0,0,.08) !important; transform: translateY(-2px); }
  .abtn { transition: opacity .15s; cursor: pointer; }
  .abtn:hover { opacity: .85; }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__ent__")) return;
  const s = document.createElement("style"); s.id = "__ent__"; s.textContent = CSS;
  document.head.appendChild(s);
}

const fmt = n => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

function ordinal(d) {
  if (d > 3 && d < 21) return `${d}th`;
  switch (d % 10) { case 1: return `${d}st`; case 2: return `${d}nd`; case 3: return `${d}rd`; default: return `${d}th`; }
}

const CAT_ICONS = { Bills:"📄", Subscription:"📺", EMI:"💳", Insurance:"🛡️", Rent:"🏠", Other:"💰" };
const MODAL_CATEGORIES = ["Bills","Subscription","EMI","Insurance","Rent","Other"];

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
  trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  plus:     "M12 5v14M5 12h14",
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

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const due   = new Date(dateStr); due.setHours(0,0,0,0);
  return Math.ceil((due - today) / 86400000);
}

function ReminderCard({ r, onPaid, onDelete, paying, deleting }) {
  const days = daysUntil(r.next_payment_date);
  const overdue = days < 0;
  const urgent  = days >= 0 && days <= 1;
  const warn    = days > 1 && days <= 7;

  const urgencyColor  = overdue || urgent ? "var(--red)"    : warn ? "var(--amber)"    : "var(--green)";
  const urgencyBg     = overdue || urgent ? "var(--red-bg)" : warn ? "var(--amber-bg)" : "var(--green-bg)";
  const urgencyBorder = overdue || urgent ? "#fecaca"       : warn ? "#fde68a"          : "#bbf7d0";

  const urgencyLabel = overdue
    ? `⚠️ ${Math.abs(days)} day${Math.abs(days)!==1?"s":""} overdue!`
    : days === 0 ? "⚠️ Due today!"
    : days === 1 ? "Due tomorrow"
    : `${days} days left`;

  const notifChips = [
    r.notify_7_days   && "7 days before",
    r.notify_3_days   && "3 days before",
    r.notify_1_day    && "1 day before",
    r.notify_same_day && "On the day",
  ].filter(Boolean);

  return (
    <div className="rcard" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,.04)", borderTop:`3px solid ${urgencyColor}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, paddingBottom:12, borderBottom:"1px solid var(--border)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:9, background:"#faf5ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19 }}>
            {CAT_ICONS[r.category]||"💰"}
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)" }}>{r.name}</div>
            <div style={{ fontSize:11, color:"var(--ink3)", marginTop:1 }}>{r.category}</div>
          </div>
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:"var(--accent)" }}>₹{fmt(r.amount)}</div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:12, color:"var(--ink3)" }}>
          Next payment:{" "}
          <strong style={{ color:"var(--ink)" }}>
            {new Date(r.next_payment_date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
          </strong>
        </div>
        <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:99, background:urgencyBg, color:urgencyColor, border:`1px solid ${urgencyBorder}` }}>
          {urgencyLabel}
        </span>
      </div>
      {notifChips.length > 0 && (
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:10, color:"var(--ink4)", marginBottom:5, textTransform:"uppercase", letterSpacing:".5px" }}>Remind me</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {notifChips.map(c => (
              <span key={c} style={{ fontSize:10, fontWeight:500, padding:"2px 8px", borderRadius:99, background:"var(--green-bg)", color:"var(--green)", border:"1px solid #bbf7d0" }}>
                📅 {c}
              </span>
            ))}
          </div>
        </div>
      )}
      {r.auto_pay && (
        <div style={{ fontSize:11, fontWeight:600, color:"var(--blue)", background:"var(--blue-bg)", padding:"5px 10px", borderRadius:6, marginBottom:10, border:"1px solid #bfdbfe", display:"inline-block" }}>
          ⚡ Auto-Pay on
        </div>
      )}
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        <button className="abtn" onClick={() => onPaid(r.id)} disabled={paying||deleting}
          style={{ flex:1, padding:"9px", borderRadius:7, border:"none", background: paying?"#f3f4f6":"var(--green)", color: paying?"var(--ink4)":"#fff", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor: paying?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          {paying ? <span style={{ animation:"spin .7s linear infinite", display:"inline-block" }}>⟳</span> : <Icon d={ICONS.check} size={12} />}
          {paying ? "Marking…" : "I've paid this"}
        </button>
        <button className="abtn" onClick={() => onDelete(r.id)} disabled={paying||deleting}
          style={{ padding:"9px 13px", borderRadius:7, border:"1px solid var(--border)", background: deleting?"#f3f4f6":"var(--red-bg)", color: deleting?"var(--ink4)":"var(--red)", fontSize:12, fontFamily:"inherit", cursor: deleting?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:4 }}>
          <Icon d={ICONS.trash} size={12} />
          {deleting?"…":"Delete"}
        </button>
      </div>
    </div>
  );
}

// ─── F must be OUTSIDE AddModal so React doesn't remount inputs on every keystroke ───
const ModalField = ({ label, required, children }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ fontSize:12, fontWeight:500, color:"var(--ink2)", display:"block", marginBottom:5 }}>
      {label}{required && <span style={{ color:"var(--red)" }}> *</span>}
    </label>
    {children}
  </div>
);

function AddModal({ token, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name:"", amount:"", category:"Bills", day_of_month:"1",
    notify_7_days:true, notify_3_days:false, notify_1_day:true, notify_same_day:true, auto_pay:false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function set(k, v) { setForm(f => ({...f, [k]:v})); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const r = await fetch("https://smartspend-backend-aupt.onrender.com/api/reminders/", {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ ...form, amount:parseFloat(form.amount), day_of_month:parseInt(form.day_of_month), frequency:"monthly" }),
      });
      const data = await r.json();
      if (r.ok) { onSuccess(); }
      else { setError(data.detail || "Something went wrong. Try again."); }
    } catch { setError("Network error. Check your connection."); }
    finally { setLoading(false); }
  }

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"var(--surface)", borderRadius:12, width:"100%", maxWidth:480, maxHeight:"90vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>

        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>+ Add a payment reminder</div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:"50%", border:"none", background:"#f3f4f6", color:"var(--ink3)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon d={ICONS.x} size={13} />
          </button>
        </div>

        <form onSubmit={submit} style={{ padding:"20px" }}>
          <ModalField label="What's the payment for?" required>
            <input type="text" required placeholder="e.g. Netflix, Hostel rent, Phone EMI…" value={form.name} onChange={e=>set("name",e.target.value)} className="inp" />
          </ModalField>

          <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:12, marginBottom:14 }}>
            <ModalField label="Amount (₹)" required>
              <input type="number" required min="0" step="0.01" placeholder="499" value={form.amount} onChange={e=>set("amount",e.target.value)} className="inp" />
            </ModalField>
            <ModalField label="Which day of the month?" required>
              <select value={form.day_of_month} onChange={e=>set("day_of_month",e.target.value)} className="inp">
                {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{ordinal(d)}</option>)}
              </select>
            </ModalField>
          </div>

          <ModalField label="Category">
            <select value={form.category} onChange={e=>set("category",e.target.value)} className="inp">
              {MODAL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </ModalField>

          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:500, color:"var(--ink2)", marginBottom:8 }}>Remind me before it's due</div>
            <div style={{ background:"#f9fafb", borderRadius:8, padding:"10px 12px", display:"grid", gap:8 }}>
              {[
                { key:"notify_7_days",   label:"7 days before" },
                { key:"notify_3_days",   label:"3 days before" },
                { key:"notify_1_day",    label:"1 day before"  },
                { key:"notify_same_day", label:"On the same day"},
              ].map(n => (
                <label key={n.key} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--ink2)", cursor:"pointer" }}>
                  <input type="checkbox" checked={form[n.key]} onChange={e=>set(n.key,e.target.checked)} style={{ accentColor:"var(--accent)", width:14, height:14 }} />
                  {n.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:18 }}>
            <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--ink2)", cursor:"pointer" }}>
              <input type="checkbox" checked={form.auto_pay} onChange={e=>set("auto_pay",e.target.checked)} style={{ accentColor:"var(--accent)", width:14, height:14 }} />
              ⚡ Auto-pay is on for this (tracking only)
            </label>
          </div>

          {error && (
            <div style={{ marginBottom:14, padding:"10px 13px", borderRadius:7, background:"var(--red-bg)", color:"var(--red)", border:"1px solid #fecaca", fontSize:12 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width:"100%", padding:"10px", borderRadius:7, background: loading?"#f3f4f6":"var(--accent)", border:"none", color: loading?"var(--ink4)":"#fff", fontSize:13, fontWeight:600, cursor: loading?"not-allowed":"pointer", fontFamily:"inherit" }}>
            {loading ? "Saving…" : "Save Reminder"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Reminders() {
  injectCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [paying, setPaying]       = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [toast, setToast]         = useState(null);

  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/reminders/`, { headers:{ Authorization:`Bearer ${token}` } });
      if (r.ok) setReminders(await r.json());
    } finally { setLoading(false); }
  }

  function showToast(text, ok=true) { setToast({text,ok}); setTimeout(()=>setToast(null),3500); }

  async function markPaid(id) {
    setPaying(id);
    try {
      const r = await fetch(`${API}/api/reminders/${id}/mark-paid`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
      if (r.ok) { showToast("Marked as paid and added to your expenses ✓"); load(); }
      else showToast("Couldn't mark as paid. Try again.", false);
    } finally { setPaying(null); }
  }

  async function deleteReminder(id) {
    setDeleting(id);
    try {
      const r = await fetch(`${API}/api/reminders/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
      if (r.ok) { showToast("Reminder deleted."); load(); }
      else showToast("Couldn't delete. Try again.", false);
    } finally { setDeleting(null); }
  }

  function logout() { localStorage.removeItem("token"); navigate("/"); }

  const sorted   = [...reminders].sort((a,b) => daysUntil(a.next_payment_date) - daysUntil(b.next_payment_date));
  const overdue  = sorted.filter(r => daysUntil(r.next_payment_date) < 0);
  const upcoming = sorted.filter(r => daysUntil(r.next_payment_date) >= 0);

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:28, height:28, border:"2.5px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 12px" }} />
        <div style={{ fontSize:12, color:"var(--ink3)" }}>Loading your reminders…</div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar onLogout={logout} />

      {showModal && <AddModal token={token} onClose={()=>setShowModal(false)} onSuccess={()=>{ setShowModal(false); load(); showToast("Reminder saved! We'll remind you before it's due 🔔"); }} />}

      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, padding:"12px 18px", borderRadius:9, background: toast.ok?"var(--green)":"var(--red)", color:"#fff", fontSize:13, fontWeight:500, boxShadow:"0 8px 24px rgba(0,0,0,.15)", maxWidth:340 }}>
          {toast.text}
        </div>
      )}

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--ink)" }}>Reminders 🔔</div>
            <div style={{ fontSize:13, color:"var(--ink3)", marginTop:2 }}>Never miss a bill or subscription again</div>
          </div>
          <button onClick={()=>setShowModal(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:7, background:"var(--accent)", border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            <Icon d={ICONS.plus} size={13} /> Add Reminder
          </button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:"var(--bg)" }}>
          {reminders.length === 0 ? (
            <div className="fade" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"56px 20px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--ink2)", marginBottom:6 }}>No reminders set up yet</div>
              <div style={{ fontSize:13, color:"var(--ink3)", marginBottom:18 }}>Add your recurring bills — like rent, Netflix, phone recharge — and we'll remind you before they're due.</div>
              <button onClick={()=>setShowModal(true)} style={{ padding:"9px 20px", borderRadius:7, background:"var(--accent)", border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                + Add your first reminder
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {overdue.length > 0 && (
                <div className="fade">
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--red)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>
                    ⚠️ Overdue ({overdue.length})
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:14 }}>
                    {overdue.map(r => <ReminderCard key={r.id} r={r} onPaid={markPaid} onDelete={deleteReminder} paying={paying===r.id} deleting={deleting===r.id} />)}
                  </div>
                </div>
              )}
              {upcoming.length > 0 && (
                <div className="f1">
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--ink3)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>
                    Upcoming ({upcoming.length})
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:14 }}>
                    {upcoming.map(r => <ReminderCard key={r.id} r={r} onPaid={markPaid} onDelete={deleteReminder} paying={paying===r.id} deleting={deleting===r.id} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}