import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { injectMobileCSS, BottomNav } from "./MobileLayout"
import "./Sidebar-patch.css";

// pages
import Login from "./Login";
import Dashboard from "./Dashboard";
import Budgets from "./Budgets";
import Transactions from "./Transactions";
import Goals from "./Goals";
import Reminders from "./Reminders";
import AddIncome from "./AddIncome";
import AddExpense from "./AddExpense";
import DetectedTransactions from "./DetectedTransactions";
import Analytics from "./Analytics";

// Global responsive CSS — hides desktop sidebar on mobile, shows bottom nav
const GLOBAL_RESPONSIVE_CSS = `
  /* ── Hide desktop sidebar on mobile ── */
  @media (max-width: 900px) {
    aside[data-sidebar="desktop"] {
      display: none !important;
    }
    /* Add bottom padding so content isn't hidden behind bottom nav */
    [data-main-content] {
      padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
    }
  }

  /* ── Hide bottom nav on desktop ── */
  @media (min-width: 901px) {
    nav[data-bottom-nav] {
      display: none !important;
    }
  }

  /* ── Mobile page scroll fix ── */
  @media (max-width: 900px) {
    .page-scroll {
      padding-bottom: calc(64px + 20px + env(safe-area-inset-bottom, 0px)) !important;
    }
  }
`;

function injectGlobalCSS() {
  if (document.getElementById("__global_responsive__")) return;
  const s = document.createElement("style");
  s.id = "__global_responsive__";
  s.textContent = GLOBAL_RESPONSIVE_CSS;
  document.head.appendChild(s);
}

function AppInner() {
  const location = useLocation();
  const isLogin = location.pathname === "/";

  return (
    <>
      <Routes>
        <Route path="/"                        element={<Login />} />
        <Route path="/dashboard"               element={<Dashboard />} />
        <Route path="/budgets"                 element={<Budgets />} />
        <Route path="/transactions"            element={<Transactions />} />
        <Route path="/goals"                   element={<Goals />} />
        <Route path="/reminders"               element={<Reminders />} />
        <Route path="/add-income"              element={<AddIncome />} />
        <Route path="/add-expense"             element={<AddExpense />} />
        <Route path="/detected-transactions"   element={<DetectedTransactions />} />
        <Route path="/analytics"               element={<Analytics />} />
      </Routes>

      {/* Bottom nav shown on all pages except login */}
      {!isLogin && <BottomNav />}
    </>
  );
}

function App() {
  useEffect(() => {
    injectMobileCSS();
    injectGlobalCSS();
  }, []);

  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

export default App;