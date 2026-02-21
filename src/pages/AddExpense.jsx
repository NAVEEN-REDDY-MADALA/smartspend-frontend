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
  @keyframes check  { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  @keyframes pop    { 0%{transform:scale(.9);opacity:0} 100%{transform:scale(1);opacity:1} }
  .fade { animation: fadeIn .3s ease both; }
  .slink       { transition: background .15s, color .15s; cursor: pointer; }
  .slink:hover { background: var(--sidebar-hover) !important; color: #fff !important; }
  .slink.active{ background: var(--sidebar-active) !important; color: #fff !important; }
  .inp { width:100%; padding:10px 13px; border-radius:8px; border:1.5px solid var(--border); font-size:14px; font-family:inherit; color:var(--ink); outline:none; background:var(--surface); transition:border-color .15s, box-shadow .15s; }
  .inp:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(124,92,191,.1); }
  .inp::placeholder { color:#c4c4c4; }
  .qbtn { transition: border-color .12s, background .12s, color .12s; cursor: pointer; }
  .qbtn:hover { border-color: var(--accent) !important; }
  .sbtn { transition: opacity .15s, transform .1s; }
  .sbtn:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
  .tip-card { animation: pop .3s ease both; }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__addexp__")) return;
  const s = document.createElement("style"); s.id = "__addexp__"; s.textContent = CSS;
  document.head.appendChild(s);
}

const fmt = n => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

// IST time — always correct regardless of device timezone
function nowIST() {
  const now = new Date();
  // IST = UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  return new Date(utc + istOffset);
}
function todayIST() {
  const d = nowIST();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function currentTimeIST() {
  const d = nowIST();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

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
  bulb:     "M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z",
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
              <a key={item.to} href={item.to} className={`slink${path===item.to?" active":""}`}
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

// ─── Student tips per category ────────────────────────────────────────────────
const STUDENT_TIPS = {
  Food:          { tip: "Cooking at home 3x a week saves ~₹800/month on average.", emoji:"🍜" },
  Groceries:     { tip: "Buy weekly in bulk from D-Mart or local mandi — saves 20–30% vs daily shopping.", emoji:"🛒" },
  Transport:     { tip: "A monthly bus pass costs ₹200–400. If you travel daily, it pays off in 3 rides.", emoji:"🚗" },
  Shopping:      { tip: "Wait 48 hours before buying anything over ₹500 — you'll skip 60% of impulse buys.", emoji:"🛍️" },
  Entertainment: { tip: "Share OTT subscriptions with 3 friends and split the cost — pay just ₹50/month.", emoji:"🎬" },
  Bills:         { tip: "Set auto-pay reminders 3 days before due dates to avoid late fees.", emoji:"💡" },
  Medicine:      { tip: "Generic medicines are 50–80% cheaper and equally effective. Ask your pharmacist.", emoji:"💊" },
  Travel:        { tip: "Book train tickets 90+ days ahead for tatkal savings. Use student IRCTC concession.", emoji:"✈️" },
  Coffee:        { tip: "₹80 coffee daily = ₹2,400/month. A decent French press costs ₹400 one-time.", emoji:"☕" },
  Books:         { tip: "Check your college library first. Z-Library and Anna's Archive have most textbooks free.", emoji:"📚" },
  Rent:          { tip: "Split Wi-Fi, LPG, and electricity bills clearly with flatmates to avoid disputes.", emoji:"🏠" },
  Other:         { tip: "Log even small spends — ₹20 here and ₹50 there add up to ₹1,500+/month.", emoji:"💳" },
};

// ─── Quick merchant suggestions per category ──────────────────────────────────
const MERCHANT_SUGGESTIONS = {
  Food:          ["Zomato", "Swiggy", "Mess", "Canteen", "Domino's", "McDonald's"],
  Groceries:     ["D-Mart", "Big Basket", "Blinkit", "Zepto", "Local Market"],
  Transport:     ["Uber", "Ola", "Rapido", "Metro", "IRCTC", "RedBus"],
  Shopping:      ["Amazon", "Flipkart", "Myntra", "Meesho", "Ajio"],
  Entertainment: ["Netflix", "Hotstar", "BookMyShow", "Spotify", "PVR"],
  Bills:         ["Jio", "Airtel", "Vi", "Electricity Board", "College Fees"],
  Medicine:      ["MedLife", "Apollo Pharmacy", "1mg", "PharmEasy", "Netmeds"],
  Travel:        ["IRCTC", "MakeMyTrip", "Goibibo", "RedBus", "IndiGo"],
  Coffee:        ["Starbucks", "CCD", "Third Wave", "Local Cafe"],
  Books:         ["Amazon", "Flipkart", "Local Book Store", "College Bookshop"],
  Rent:          ["Landlord", "PG Owner", "Hostel"],
  Other:         [],
};

const CATEGORIES = [
  { label:"Food",          emoji:"🍜" },
  { label:"Groceries",     emoji:"🛒" },
  { label:"Transport",     emoji:"🚗" },
  { label:"Shopping",      emoji:"🛍️" },
  { label:"Entertainment", emoji:"🎬" },
  { label:"Bills",         emoji:"💡" },
  { label:"Medicine",      emoji:"💊" },
  { label:"Travel",        emoji:"✈️" },
  { label:"Coffee",        emoji:"☕" },
  { label:"Books",         emoji:"📚" },
  { label:"Rent",          emoji:"🏠" },
  { label:"Other",         emoji:"💳" },
];

const PAYMENTS = [
  { label:"UPI",         emoji:"📱" },
  { label:"Card",        emoji:"💳" },
  { label:"Cash",        emoji:"💵" },
  { label:"Net Banking", emoji:"🏦" },
];

const QUICK_AMOUNTS = [50, 100, 150, 200, 500, 1000];

// ─── Sub-components at module scope (prevent focus loss on re-render) ─────────
const F = ({ label, hint, children }) => (
  <div style={{ marginBottom:20 }}>
    <label style={{ fontSize:13, fontWeight:500, color:"var(--ink2)", display:"block", marginBottom: hint?4:6 }}>{label}</label>
    {hint && <div style={{ fontSize:11, color:"var(--ink4)", marginBottom:6 }}>{hint}</div>}
    {children}
  </div>
);

const QuickGrid = ({ items, selected, onSelect, cols = 4 }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:8 }}>
    {items.map(item => (
      <button key={item.label} type="button" className="qbtn" onClick={() => onSelect(item.label)}
        style={{
          padding:"9px 4px", borderRadius:8, fontFamily:"inherit",
          border:      selected===item.label ? "2px solid var(--accent)"  : "1.5px solid var(--border)",
          background:  selected===item.label ? "rgba(124,92,191,.07)"     : "var(--surface)",
          color:       selected===item.label ? "var(--accent)"            : "var(--ink2)",
          fontSize:11, fontWeight:500, textAlign:"center",
        }}>
        <div style={{ fontSize:17, marginBottom:3 }}>{item.emoji}</div>
        {item.label}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function AddExpense() {
  injectCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [amount,   setAmount]   = useState("");
  const [category, setCategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [payment,  setPayment]  = useState("");
  const [date,     setDate]     = useState(todayIST);
  const [time,     setTime]     = useState(currentTimeIST);  // IST time
  const [loading,  setLoading]  = useState(false);
  const [status,   setStatus]   = useState(null);
  const [errMsg,   setErrMsg]   = useState("");

  useEffect(() => { if (!token) navigate("/", { replace:true }); }, []);

  function logout() { localStorage.removeItem("token"); navigate("/"); }

  // Merchant suggestions for selected category
  const suggestions = category ? (MERCHANT_SUGGESTIONS[category] || []) : [];
  const currentTip  = category ? STUDENT_TIPS[category] : null;

  async function save(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setStatus(null);

    // Build IST datetime string for created_at
    const createdAt = `${date}T${time}:00+05:30`;

    try {
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/expenses/", {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          amount:         parseFloat(amount),
          category,
          merchant:       merchant.trim() || null,
          payment_method: payment,
          date,
          created_at:     createdAt,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErrMsg(d.detail || "Something went wrong. Try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setTimeout(() => navigate("/dashboard", { replace:true }), 1400);
    } catch {
      setErrMsg("Can't reach the server. Check your internet.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = amount && category && payment && date && !loading;

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
            <div style={{ fontSize:20, fontWeight:700, color:"var(--ink)" }}>Add Expense 💸</div>
            <div style={{ fontSize:13, color:"var(--ink3)", marginTop:2 }}>Record what you just spent</div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"32px 28px", background:"var(--bg)", display:"flex", justifyContent:"center" }}>
          <div className="fade" style={{ width:"100%", maxWidth:540 }}>

            {status === "success" ? (
              // ── Success screen ──────────────────────────────────────────────
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:"48px 32px", textAlign:"center" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(124,92,191,.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", animation:"check .4s ease" }}>
                  <Icon d={ICONS.check} size={26} color="var(--accent)" />
                </div>
                <div style={{ fontSize:17, fontWeight:700, color:"var(--ink)", marginBottom:6 }}>Expense saved!</div>
                <div style={{ fontSize:13, color:"var(--ink3)", lineHeight:1.7 }}>
                  ₹{fmt(parseFloat(amount)||0)} on {category}
                  {merchant ? ` at ${merchant}` : ""} — logged.<br />
                  Taking you back to the dashboard…
                </div>
              </div>
            ) : (
              // ── Form ────────────────────────────────────────────────────────
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:"28px", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                <form onSubmit={save}>

                  {/* ── Amount ── */}
                  <F label="How much did you spend? (₹)">
                    <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                      {QUICK_AMOUNTS.map(q => (
                        <button key={q} type="button"
                          onClick={() => setAmount(q.toString())}
                          style={{
                            padding:"4px 12px", borderRadius:99, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit",
                            border:      amount===q.toString() ? "1.5px solid var(--accent)"   : "1.5px solid var(--border)",
                            background:  amount===q.toString() ? "rgba(124,92,191,.07)"         : "var(--surface)",
                            color:       amount===q.toString() ? "var(--accent)"               : "var(--ink3)",
                            transition:"border-color .12s, background .12s",
                          }}>
                          ₹{q}
                        </button>
                      ))}
                    </div>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"var(--ink3)", fontWeight:500 }}>₹</span>
                      <input
                        type="number" required min="1" step="0.01"
                        placeholder="0"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="inp"
                        inputMode="decimal"
                        style={{ paddingLeft:28, fontSize:20, fontWeight:600 }}
                      />
                    </div>
                  </F>

                  {/* ── Category ── */}
                  <F label="What did you spend on?">
                    <QuickGrid items={CATEGORIES} selected={category} onSelect={cat => { setCategory(cat); setMerchant(""); }} cols={4} />
                  </F>

                  {/* ── Student tip — appears after category is picked ── */}
                  {currentTip && (
                    <div className="tip-card" style={{
                      marginBottom:20, padding:"12px 14px", borderRadius:9,
                      background:"var(--amber-bg)", border:"1px solid #fde68a",
                      display:"flex", gap:10, alignItems:"flex-start",
                    }}>
                      <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:"var(--amber)", textTransform:"uppercase", letterSpacing:".5px", marginBottom:3 }}>Student Tip</div>
                        <div style={{ fontSize:12, color:"var(--ink2)", lineHeight:1.6 }}>{currentTip.tip}</div>
                      </div>
                    </div>
                  )}

                  {/* ── Merchant ── */}
                  <F label="Where did you pay? (optional)" hint="Helps you track spending at specific places">
                    {/* Quick suggestions */}
                    {suggestions.length > 0 && (
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                        {suggestions.map(s => (
                          <button key={s} type="button"
                            onClick={() => setMerchant(s)}
                            style={{
                              padding:"3px 11px", borderRadius:99, fontSize:11, fontWeight:500, cursor:"pointer", fontFamily:"inherit",
                              border:     merchant===s ? "1.5px solid var(--accent)"  : "1.5px solid var(--border)",
                              background: merchant===s ? "rgba(124,92,191,.07)"        : "var(--surface)",
                              color:      merchant===s ? "var(--accent)"              : "var(--ink3)",
                              transition:"border-color .12s",
                            }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder={category ? `e.g. ${suggestions[0] || "Merchant name"}` : "Pick a category first"}
                      value={merchant}
                      onChange={e => setMerchant(e.target.value)}
                      className="inp"
                      maxLength={80}
                      disabled={!category}
                      style={{ opacity: category ? 1 : 0.5 }}
                    />
                  </F>

                  {/* ── Payment method ── */}
                  <F label="How did you pay?">
                    <QuickGrid items={PAYMENTS} selected={payment} onSelect={setPayment} cols={4} />
                  </F>

                  {/* ── Date & Time ── */}
                  <F label="When?" hint="Defaults to right now (IST)">
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <div>
                        <div style={{ fontSize:11, color:"var(--ink4)", marginBottom:4 }}>Date</div>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="inp" />
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:"var(--ink4)", marginBottom:4 }}>Time (IST)</div>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="inp" />
                      </div>
                    </div>
                    <div style={{ marginTop:6, fontSize:11, color:"var(--ink4)" }}>
                      📍 Currently {nowIST().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true })} IST
                    </div>
                  </F>

                  {/* ── Error ── */}
                  {status === "error" && (
                    <div style={{ marginBottom:16, padding:"10px 13px", borderRadius:8, background:"var(--red-bg)", color:"var(--red)", border:"1px solid #fecaca", fontSize:13 }}>
                      ⚠️ {errMsg}
                    </div>
                  )}

                  {/* ── Submit ── */}
                  <button type="submit" disabled={!canSubmit} className="sbtn"
                    style={{
                      width:"100%", padding:"12px", borderRadius:8,
                      background: !canSubmit ? "#e5e7eb" : "var(--accent)",
                      border:"none",
                      color:      !canSubmit ? "var(--ink4)" : "#fff",
                      fontSize:14, fontWeight:600,
                      cursor:     !canSubmit ? "not-allowed" : "pointer",
                      fontFamily:"inherit",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    }}>
                    {loading && <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }} />}
                    {loading ? "Saving…" : `Save ₹${amount || "0"} Expense`}
                  </button>

                  {/* ── Helper nudge ── */}
                  {(!category || !payment) && (
                    <div style={{ textAlign:"center", marginTop:8, fontSize:11, color:"var(--ink4)" }}>
                      {!category && !payment ? "Pick a category and payment method above"
                        : !category ? "Pick what you spent on above"
                        : "Pick how you paid above"}
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