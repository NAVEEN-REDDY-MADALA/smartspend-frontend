// MobileLayout.jsx — Shared mobile shell with bottom navigation
// Matches Dashboard.jsx mobile design: dark purple header + bottom nav

import { useState, useEffect } from "react";

const MOBILE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand:       #5b3ff8;
    --brand2:      #7c5cfc;
    --brand-soft:  rgba(91,63,248,0.10);
    --brand-glow:  rgba(91,63,248,0.25);
    --bg:          #f2f3f7;
    --surface:     #ffffff;
    --surface2:    #f8f8fc;
    --border:      #e8e9f0;
    --ink:         #0f0e17;
    --ink2:        #2d2b3d;
    --ink3:        #6b6884;
    --ink4:        #a8a5be;
    --green:       #00c07a;
    --green-bg:    #e6faf3;
    --green-border:#a7f3d0;
    --red:         #f03e3e;
    --red-bg:      #fff0f0;
    --red-border:  #fecaca;
    --amber:       #f59f00;
    --amber-bg:    #fff9e6;
    --amber-border:#fde68a;
    --blue:        #3b82f6;
    --blue-bg:     #eff6ff;
    --blue-border: #bfdbfe;

    /* ── Dashboard shell colours ── */
    --sb:          #2d1b69;
    --sb-muted:    rgba(255,255,255,0.38);

    --nav-h:        60px;
    --header-h:     56px;
    --safe-bottom:  env(safe-area-inset-bottom, 0px);
  }

  html, body {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: var(--bg);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
    overscroll-behavior: none;
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* ── Animations ── */
  @keyframes fadeUp    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pop       { 0%{transform:scale(.9);opacity:0} 100%{transform:scale(1);opacity:1} }
  @keyframes slideUp   { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes slideRight{ from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.35} }

  .fu0 { animation: fadeUp .35s ease both; }
  .fu1 { animation: fadeUp .35s .06s ease both; }
  .fu2 { animation: fadeUp .35s .12s ease both; }
  .fu3 { animation: fadeUp .35s .18s ease both; }
  .fu4 { animation: fadeUp .35s .24s ease both; }
  .fade { animation: fadeIn .25s ease both; }

  /* ── Inputs ── */
  .inp {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    font-size: 15px;
    font-family: 'DM Sans', inherit;
    color: var(--ink);
    outline: none;
    background: var(--surface);
    transition: border-color .15s, box-shadow .15s;
    -webkit-appearance: none;
  }
  .inp:focus { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-glow); }
  .inp::placeholder { color: var(--ink4); }

  /* ── Buttons ── */
  .btn-primary {
    width: 100%;
    padding: 14px;
    border-radius: 14px;
    border: none;
    background: var(--brand);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: transform .12s, opacity .12s;
    -webkit-tap-highlight-color: transparent;
  }
  .btn-primary:active  { transform: scale(.97); }
  .btn-primary:disabled{ opacity: .5; cursor: not-allowed; transform: none; }

  /* ── Cards ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: 0 1px 6px rgba(0,0,0,.05);
  }

  /* ── Stat pill ── */
  .stat-pill {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 14px;
  }

  /* ── Bottom nav — dark purple, matches Dashboard ── */
  .bottom-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 300;
    height: var(--nav-h);
    background: var(--sb);
    border-top: 1px solid rgba(255,255,255,.1);
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
    padding-bottom: var(--safe-bottom);
    overflow: hidden;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 6px 4px;
    border-radius: 10px;
    text-decoration: none;
    color: rgba(255,255,255,.45);
    font-size: 9px;
    font-weight: 600;
    transition: all .18s;
    min-width: 0;
    flex: 1;
    -webkit-tap-highlight-color: transparent;
    position: relative;
  }
  .nav-item.active {
    color: #fff;
    background: rgba(255,255,255,.16);
  }
  .nav-item .nav-label { font-size: 9px; font-weight: 600; color: inherit; line-height: 1; }

  /* ── Mobile header — dark purple sticky bar, matches Dashboard ── */
  .mobile-header {
    display: none;
    background: var(--sb);
    padding: 12px 16px;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    flex-shrink: 0;
    border-bottom: 1px solid rgba(255,255,255,.08);
  }

  /* ── Responsive: show mobile chrome on small screens ── */
  @media (max-width: 900px) {
    .bottom-nav    { display: flex !important; }
    .mobile-header { display: flex !important; }
    .page-scroll   { padding-bottom: calc(var(--nav-h) + 20px + var(--safe-bottom)) !important; }
  }

  /* ── Page scroll ── */
  .page-scroll {
    padding: 16px 16px 28px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    flex: 1;
  }

  /* ── Badge ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 8px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 600;
  }

  /* ── Toast — sits above bottom nav ── */
  .toast {
    position: fixed;
    bottom: calc(var(--nav-h) + 12px + var(--safe-bottom));
    left: 16px; right: 16px;
    padding: 14px 16px;
    border-radius: 14px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 8px 28px rgba(0,0,0,.2);
    animation: slideUp .25s ease;
    z-index: 200;
  }

  /* ── Loading spinner ── */
  .spinner {
    width: 28px; height: 28px;
    border: 2.5px solid var(--border);
    border-top-color: var(--brand);
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }

  /* ── Drawer / Sheet ── */
  .drawer-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.45);
    z-index: 150;
    animation: fadeIn .2s ease;
    backdrop-filter: blur(2px);
  }
  .drawer {
    position: fixed; inset: 0;
    z-index: 151;
    display: flex;
    align-items: flex-end;
  }
  .drawer-sheet {
    width: 100%;
    max-height: 90vh;
    background: var(--surface);
    border-radius: 20px 20px 0 0;
    animation: slideUp .28s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .drawer-handle {
    width: 36px; height: 4px;
    background: var(--border);
    border-radius: 99px;
    margin: 10px auto 0;
    flex-shrink: 0;
  }

  /* ── Progress bar ── */
  .prog-track {
    height: 7px;
    background: var(--border);
    border-radius: 99px;
    overflow: hidden;
  }
  .prog-fill {
    height: 100%;
    border-radius: 99px;
    transition: width .9s ease;
  }

  /* ── Section label ── */
  .section-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--ink4);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  /* ── Chip (pill button) ── */
  .chip {
    padding: 6px 14px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 600;
    border: 1.5px solid var(--border);
    background: var(--surface);
    color: var(--ink3);
    cursor: pointer;
    transition: all .12s;
    -webkit-tap-highlight-color: transparent;
    font-family: inherit;
  }
  .chip.active {
    border-color: var(--brand);
    background: var(--brand-soft);
    color: var(--brand);
  }

  .tap { -webkit-tap-highlight-color: transparent; }
  .num { font-family: 'Sora', monospace; }
`;

export function injectMobileCSS() {
  if (typeof document === "undefined" || document.getElementById("__mobile_v1__")) return;
  const s = document.createElement("style");
  s.id = "__mobile_v1__";
  s.textContent = MOBILE_CSS;
  document.head.appendChild(s);
}

export const fmt  = n => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
export const fmtK = n => n >= 100000 ? `${(n/100000).toFixed(1)}L` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : fmt(n);

export const CAT_EMOJI = {
  // Expenses
  Food:"🍜", Groceries:"🛒", Transport:"🚗", Travel:"✈️",
  Shopping:"🛍️", Entertainment:"🎬", Bills:"💡", Medicine:"💊",
  Education:"📚", Finance:"💳", Coffee:"☕", Books:"📖",
  Rent:"🏠", Health:"💊", Utilities:"⚡", Other:"💳",
  // Credits
  Income:"💰", Salary:"💼", Refund:"↩️", Cashback:"🎁",
  // Transfers
  Transfer:"🔁",
  // Unknown
  Unknown:"❓",
};

export const Icon = ({ d, size = 18, color = "currentColor", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 23" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const ICONS = {
  home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  tx:       "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  analytics:"M18 20V10M12 20V4M6 20v-6",
  goals:    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  budget:   "M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
  detect:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  reminder: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  logout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  plus:     "M12 5v14M5 12h14",
  back:     "M19 12H5M12 19l-7-7 7-7",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  refresh:  "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  warning:  "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  up:       "M18 15l-6-6-6 6",
  down:     "M6 9l6 6 6-6",
  cal:      "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  sms:      "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  income:   "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
};

// ── Nav items — SVG icons, matches screenshot exactly ─────────────────────────
const NAV_ITEMS = [
  { to: "/dashboard",             label: "Home",      icon: "home"     },
  { to: "/transactions",          label: "Spends",    icon: "tx"       },
  { to: "/analytics",             label: "Analytics", icon: "analytics"},
  { to: "/budgets",               label: "Budgets",   icon: "budget"   },
  { to: "/goals",                 label: "Goals",     icon: "goals"    },
  { to: "/detected-transactions", label: "SMS",       icon: "detect"   },
  { to: "/reminders",             label: "Reminders", icon: "reminder" },
  // { to: "/settings",              label: "Settings",  icon: "home" }
  { to: "/Settings", label: "Settings", icon: "home" }
];

// ── Bottom Navigation — dark purple + SVG icons, matches screenshot ───────────
export function BottomNav({ pendingCount = 0 }) {
  const path = window.location.pathname;
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => {
        const active = path === item.to;
        return (
          <a key={item.to} href={item.to}
            className={`nav-item tap${active ? " active" : ""}`}>
            <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon
                d={ICONS[item.icon]}
                size={20}
                color={active ? "#fff" : "rgba(255,255,255,.45)"}
                strokeWidth={active ? 2.5 : 1.8}
              />
              {item.to === "/detected-transactions" && pendingCount > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -7,
                  background: "#ef4444", color: "#fff",
                  fontSize: 8, fontWeight: 700, borderRadius: 99,
                  padding: "1px 4px", lineHeight: 1,
                }}>{pendingCount}</span>
              )}
            </span>
            <span className="nav-label">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

// ── Mobile Header — dark purple sticky bar, matches Dashboard.jsx ─────────────
export function MobileHeader({ title, subtitle, right, back, onBack }) {
  return (
    <div className="mobile-header">
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {back && (
          <button
            onClick={onBack || (() => window.history.back())}
            style={{
              width: 34, height: 34, borderRadius: 9,
              border: "1px solid rgba(255,255,255,.25)",
              background: "rgba(255,255,255,.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}>
            <Icon d={ICONS.back} size={16} color="rgba(255,255,255,.9)" />
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 16, fontWeight: 800, color: "#fff",
            lineHeight: 1.1, letterSpacing: "-.3px",
            fontFamily: "'Sora', sans-serif",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 1 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

// ── Page Shell ────────────────────────────────────────────────────────────────
export function MobilePage({ children, pendingCount = 0, noPad }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
      <BottomNav pendingCount={pendingCount} />
    </div>
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────────
export function LoadingScreen({ text = "Loading…" }) {
  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg)", flexDirection: "column", gap: 14 }}>
      <div className="spinner" />
      <div style={{ fontSize: 13, color: "var(--ink3)" }}>{text}</div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ text, ok }) {
  return (
    <div className="toast" style={{ background: ok ? "var(--green)" : "var(--red)" }}>
      {text}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, iconBg, sub, change, ani = "fu0", small }) {
  const pos = change >= 0;
  return (
    <div className={`card ${ani}`} style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</div>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: iconBg || "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{icon}</div>
      </div>
      <div className="num" style={{ fontSize: small ? 18 : 22, fontWeight: 700, color: "var(--ink)", lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--ink4)" }}>{sub}</div>}
      {change !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 6, fontSize: 11, fontWeight: 600, color: pos ? "var(--green)" : "var(--red)" }}>
          {pos ? "↑" : "↓"} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}