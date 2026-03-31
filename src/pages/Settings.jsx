import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { BASE_URL } from "../api";
import { injectMobileCSS, fmt, Icon, ICONS, BottomNav } from "./MobileLayout";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --sb:#2d1b69; --sb2:#1e293b;
    --accent:#6366f1; --accent2:#818cf8; --accent3:#e0e7ff;
    --bg:#f8fafc; --surface:#ffffff; --surface2:#f1f5f9;
    --border:#e2e8f0; --border2:#cbd5e1;
    --ink:#0f172a; --ink2:#334155; --ink3:#64748b; --ink4:#94a3b8;
    --green:#059669; --gbg:#f0fdf4; --gborder:#bbf7d0;
    --red:#dc2626; --rbg:#fff1f2; --rborder:#fecdd3;
    --amber:#d97706; --abg:#fffbeb; --aborder:#fde68a;
    --blue:#2563eb; --bbg:#eff6ff; --bborder:#bfdbfe;
    --purple:#7c3aed; --pbg:#f5f3ff; --pborder:#ddd6fe;
    --nav-h:64px;
    --font:'DM Sans',sans-serif;
    --font-display:'Playfair Display',serif;
    --font-mono:'DM Mono',monospace;
    --shadow-sm:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
    --shadow-md:0 4px 16px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.04);
  }
  html,body{font-family:var(--font);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;overscroll-behavior:none;}
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px;}

  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

  .fade{animation:fadeUp .3s ease both}
  .f1{animation:fadeUp .3s .05s ease both}
  .f2{animation:fadeUp .3s .10s ease both}
  .f3{animation:fadeUp .3s .15s ease both}
  .f4{animation:fadeUp .3s .20s ease both}

  .slink{transition:all .15s;cursor:pointer;text-decoration:none;display:flex;}
  .slink:hover{background:rgba(255,255,255,.07)!important;}
  .slink.active{background:rgba(99,102,241,.15)!important;color:#a5b4fc!important;}

  .card{background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-sm);}

  /* Toggle Switch */
  .toggle-track{
    width:44px;height:24px;border-radius:99px;
    transition:background .2s;
    cursor:pointer;position:relative;flex-shrink:0;
    border:none;padding:0;
  }
  .toggle-thumb{
    position:absolute;top:3px;left:3px;
    width:18px;height:18px;border-radius:50%;
    background:#fff;transition:transform .2s;
    box-shadow:0 1px 4px rgba(0,0,0,.2);
  }
  .toggle-track.on .toggle-thumb{transform:translateX(20px);}

  /* Mode Option Card */
  .mode-option{
    border:1.5px solid var(--border);border-radius:12px;
    padding:14px 16px;cursor:pointer;
    transition:all .2s;background:var(--surface2);
  }
  .mode-option:hover{border-color:var(--border2);}
  .mode-option.selected-green{border-color:var(--green)!important;background:var(--gbg)!important;}
  .mode-option.selected-purple{border-color:var(--accent)!important;background:var(--accent3)!important;}

  .sidebar{width:220px;flex-shrink:0;background:var(--sb);display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow:hidden;border-right:1px solid rgba(255,255,255,.05);}

  @media(max-width:900px){
    .sidebar{display:none!important;}
    .desk-hdr{display:none!important;}
    .mob-only{display:flex!important;}
    .settings-content{padding:14px 14px calc(var(--nav-h) + 20px)!important;}
  }
  @media(min-width:901px){
    .mob-only{display:none!important;}
    .desk-hdr{display:flex!important;}
  }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__settings__")) return;
  const s = document.createElement("style"); s.id = "__settings__"; s.textContent = CSS;
  document.head.appendChild(s);
  injectMobileCSS();
}

const NAV_SECTIONS = [
  { label: null, items: [{ to: "/dashboard", label: "Home", icon: "home" }] },
  { label: "Track Money", items: [{ to: "/transactions", label: "Transactions", icon: "tx" }, { to: "/analytics", label: "Analytics", icon: "analytics" }, { to: "/goals", label: "My Goals", icon: "goals" }, { to: "/budgets", label: "My Budgets", icon: "budget" }] },
  { label: "Auto Features", items: [{ to: "/detected-transactions", label: "SMS Detected", icon: "detect" }, { to: "/reminders", label: "Reminders", icon: "reminder" }] },
  { label: "Account", items: [{ to: "/settings", label: "Settings", icon: "home" }] },
];

function Sidebar({ onLogout }) {
  const location = useLocation();
  const path = location.pathname;
  return (
    <aside className="sidebar">
      <div style={{ padding: "22px 18px 16px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", boxShadow: "0 4px 12px rgba(99,102,241,.4)" }}>S</div>
        <div>
          {/* <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-.3px" }}>SmartSpend</div> */}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 1, letterSpacing: ".5px", textTransform: "uppercase" }}>Finance Platform</div>
        </div>
      </div>
      <nav style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
        {NAV_SECTIONS.map((sec, si) => (
          <div key={si} style={{ marginBottom: 8 }}>
            {sec.label && <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.22)", letterSpacing: "1.2px", textTransform: "uppercase", padding: "10px 10px 5px" }}>{sec.label}</div>}
            {sec.items.map(item => (
              <Link key={item.to} to={item.to} className={`slink${path === item.to ? " active" : ""}`}
                style={{ alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 9, color: path === item.to ? "#a5b4fc" : "rgba(255,255,255,.55)", fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
                <Icon d={ICONS[item.icon]} size={14} />{item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <button onClick={onLogout} className="slink"
          style={{ width: "100%", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 9, background: "transparent", border: "none", color: "rgba(255,255,255,.45)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font)" }}>
          <Icon d={ICONS.logout} size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ─── Toggle Switch ──────────────────────────────────────────────────────── */
function Toggle({ value, onChange, color = "var(--accent)" }) {
  return (
    <button className={`toggle-track${value ? " on" : ""}`}
      style={{ background: value ? color : "var(--border2)" }}
      onClick={() => onChange(!value)}>
      <div className="toggle-thumb" />
    </button>
  );
}

/* ─── Section Header ─────────────────────────────────────────────────────── */
function SectionHeader({ title }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, marginTop: 4, paddingLeft: 2 }}>
      {title}
    </div>
  );
}

/* ─── Mode Option ────────────────────────────────────────────────────────── */
function ModeOption({ title, description, badge, badgeColor, badgeBg, isSelected, selectedClass, onClick }) {
  return (
    <div className={`mode-option${isSelected ? " " + selectedClass : ""}`} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Radio */}
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isSelected ? badgeColor : "var(--border2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
          {isSelected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: badgeColor }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{title}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: badgeColor, background: badgeBg, padding: "2px 8px", borderRadius: 6 }}>{badge}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink3)", lineHeight: 1.5 }}>{description}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Notification Row ───────────────────────────────────────────────────── */
function NotificationRow({ emoji, title, subtitle, value, onChange, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--ink4)" }}>{subtitle}</div>
      </div>
      <Toggle value={value} onChange={onChange} color={color || "var(--accent)"} />
    </div>
  );
}

/* ─── About Row ──────────────────────────────────────────────────────────── */
function AboutRow({ label, value, isLast }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: isLast ? "none" : "1px solid var(--border)" }}>
      <span style={{ fontSize: 14, color: "var(--ink2)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, color: "var(--ink4)", fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}

/* ─── Main Settings Page ─────────────────────────────────────────────────── */
export default function Settings() {
  injectCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Transaction Mode — saved in localStorage so it persists
  const [txMode, setTxMode] = useState(() => localStorage.getItem("tx_mode") || "auto");

  // Notification toggles
  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("notif_settings") || "{}"); }
    catch { return {}; }
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!token) { navigate("/", { replace: true }); } }, []);

  function setMode(mode) {
    setTxMode(mode);
    localStorage.setItem("tx_mode", mode);
    showSaved();
  }

  function toggleNotif(key) {
    const updated = { ...notifs, [key]: !(notifs[key] !== false) };
    setNotifs(updated);
    localStorage.setItem("notif_settings", JSON.stringify(updated));
    showSaved();
  }

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function logout() { localStorage.removeItem("token"); navigate("/", { replace: true }); }

  const getNotif = (key, defaultVal = true) => notifs[key] !== undefined ? notifs[key] : defaultVal;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onLogout={logout} />
      <BottomNav />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Desktop Header */}
        <div className="desk-hdr" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "18px 28px", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-display)", letterSpacing: "-.5px" }}>Settings</div>
            <div style={{ fontSize: 13, color: "var(--ink4)", marginTop: 3 }}>Customise how SmartSpend works for you</div>
          </div>
          {saved && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, background: "var(--gbg)", border: "1px solid var(--gborder)", fontSize: 13, fontWeight: 600, color: "var(--green)", animation: "fadeUp .3s ease" }}>
              ✓ Saved
            </div>
          )}
        </div>

        {/* Mobile Header */}
        <div className="mob-only" style={{ background: "var(--sb)", padding: "18px 16px 16px", flexDirection: "column", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-.4px" }}>Settings</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 3 }}>Customise SmartSpend</div>
            </div>
            {saved && (
              <div style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(5,150,105,.25)", border: "1px solid rgba(5,150,105,.4)", fontSize: 12, fontWeight: 700, color: "#6ee7b7" }}>
                ✓ Saved
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="settings-content" style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px", background: "var(--bg)", maxWidth: 720 }}>

          {/* ── Transaction Mode ── */}
          <div className="fade">
            <SectionHeader title="Transaction Mode" />
            <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 16, lineHeight: 1.6 }}>
                How should SmartSpend handle SMS-detected transactions?
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <ModeOption
                  title="⚡ Auto detect"
                  description="Transactions are saved automatically from SMS. No tapping needed. Edit or delete from history if something is wrong."
                  badge="Recommended"
                  badgeColor="var(--green)"
                  badgeBg="var(--gbg)"
                  isSelected={txMode === "auto"}
                  selectedClass="selected-green"
                  onClick={() => setMode("auto")}
                />
                <ModeOption
                  title="✋ Ask confirmation"
                  description="Transactions go to the SMS Detected queue. You Accept or Ignore each one manually before they're saved."
                  badge="More control"
                  badgeColor="var(--accent)"
                  badgeBg="var(--accent3)"
                  isSelected={txMode === "confirm"}
                  selectedClass="selected-purple"
                  onClick={() => setMode("confirm")}
                />
              </div>

              {/* Status indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "10px 14px", borderRadius: 9, background: "var(--surface2)", border: "1px solid var(--border)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: txMode === "auto" ? "var(--green)" : "var(--accent)", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "var(--ink2)", fontWeight: 500 }}>
                  {txMode === "auto"
                    ? "⚡ Auto detect is active — transactions save silently"
                    : "✋ Ask confirmation is active — transactions go to pending queue"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Notifications ── */}
          <div className="f1">
            <SectionHeader title="Notifications" />
            <div className="card" style={{ padding: "4px 20px", marginBottom: 20 }}>
              <NotificationRow
                emoji="💸"
                title="Daily spending summary"
                subtitle="Sent at 9 PM every day"
                value={getNotif("daily")}
                onChange={() => toggleNotif("daily")}
                color="var(--accent)"
              />
              <div style={{ borderTop: "1px solid var(--border)" }} />
              <NotificationRow
                emoji="📊"
                title="Weekly report"
                subtitle="Sent every Sunday at 9 PM"
                value={getNotif("weekly")}
                onChange={() => toggleNotif("weekly")}
                color="var(--accent)"
              />
              <div style={{ borderTop: "1px solid var(--border)" }} />
              <NotificationRow
                emoji="⏳"
                title="Pending transaction reminders"
                subtitle="Remind if transactions wait over 24 hrs"
                value={getNotif("pending")}
                onChange={() => toggleNotif("pending")}
                color="var(--accent)"
              />
              <div style={{ borderTop: "1px solid var(--border)" }} />
              <NotificationRow
                emoji="🎯"
                title="Budget alerts"
                subtitle="Alert when you exceed category budget"
                value={getNotif("budget")}
                onChange={() => toggleNotif("budget")}
                color="var(--red)"
              />
              <div style={{ borderTop: "1px solid var(--border)" }} />
              <NotificationRow
                emoji="🏆"
                title="Goal progress"
                subtitle="Updates on your savings goals"
                value={getNotif("goals")}
                onChange={() => toggleNotif("goals")}
                color="var(--green)"
              />
            </div>
          </div>

          {/* ── App Preferences ── */}
          <div className="f2">
            <SectionHeader title="App Preferences" />
            <div className="card" style={{ padding: "4px 20px", marginBottom: 20 }}>
              <NotificationRow
                emoji="🔄"
                title="Auto-sync transactions"
                subtitle="Sync every 5 seconds when app is open"
                value={getNotif("autosync", true)}
                onChange={() => toggleNotif("autosync")}
                color="var(--blue)"
              />
              <div style={{ borderTop: "1px solid var(--border)" }} />
              <NotificationRow
                emoji="📱"
                title="SMS detection"
                subtitle="Detect transactions from bank SMS"
                value={getNotif("smsdetect", true)}
                onChange={() => toggleNotif("smsdetect")}
                color="var(--green)"
              />
            </div>
          </div>

          {/* ── About ── */}
          <div className="f3">
            <SectionHeader title="About" />
            <div className="card" style={{ padding: "0 20px", marginBottom: 20 }}>
              <AboutRow label="Version" value="1.0.0" />
              <AboutRow label="SMS Detection" value="All major Indian banks" />
              <AboutRow label="Backend" value="SmartSpend Cloud" />
              <AboutRow label="Platform" value="Web + Android" isLast />
            </div>
          </div>

          {/* ── Danger Zone ── */}
          <div className="f4">
            <SectionHeader title="Account" />
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 3 }}>Sign out</div>
                  <div style={{ fontSize: 12, color: "var(--ink4)" }}>Sign out of your SmartSpend account</div>
                </div>
                <button onClick={logout}
                  style={{ padding: "8px 18px", borderRadius: 9, background: "var(--rbg)", border: "1.5px solid var(--rborder)", color: "var(--red)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon d={ICONS.logout} size={14} color="var(--red)" /> Sign Out
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}