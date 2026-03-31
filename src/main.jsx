import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import "./Sidebar-patch.css";
import "./index.css";       
// import "./mobileFix.js"; 
// import "./injectMobilePageCSS.js";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddIncome from "./pages/AddIncome.jsx";
import AddExpense from "./pages/AddExpense.jsx";
import Budgets from "./pages/Budgets.jsx";
import Transactions from "./pages/Transactions.jsx";
import Analytics from "./pages/Analytics.jsx";
import Goals from "./pages/Goals.jsx";
import DetectedTransactions from "./pages/DetectedTransactions.jsx";
import Reminders from "./pages/Reminders.jsx";
import Settings from "./pages/Settings.jsx";
import { injectMobileCSS } from "./pages/MobileLayout.jsx";

// Call injectMobileCSS to apply mobile styles
injectMobileCSS();

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add-income" element={<AddIncome />} />
      <Route path="/add-expense" element={<AddExpense />} />
      <Route path="/budgets" element={<Budgets />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/detected-transactions" element={<DetectedTransactions />} />
      <Route path="/reminders" element={<Reminders />} />
      {/* <Route path="/settings" element={<Settings />} />  */}
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </BrowserRouter>
);