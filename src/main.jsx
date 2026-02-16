import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

// Add this route

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add-income" element={<AddIncome />} />
      <Route path="/add-expense" element={<AddExpense />} />
      <Route path="/budgets" element={<Budgets />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/analytics" element={<Analytics/>}/>
      <Route path="/goals" element={<Goals />} />
      <Route path="/detected-transactions" element={<DetectedTransactions />} />
      <Route path="/reminders" element={<Reminders />} />



    </Routes>
  </BrowserRouter>
);

