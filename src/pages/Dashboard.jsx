import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [prediction, setPrediction] = useState(0);
  
  // 💰 Financial Summary State
  const [totalIncome, setTotalIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  
  // 📱 Detected Transactions State
  const [pendingCount, setPendingCount] = useState(0);
  
  // 🤖 AI Insights State
  const [budgetRisks, setBudgetRisks] = useState([]);

  // 🔐 Auth check
  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    } else {
      loadAll();
    }
    // eslint-disable-next-line
  }, []);

  async function loadAll() {
    try {
      await Promise.all([
        loadExpenses(), 
        loadSuggestions(),
        loadBudgetRisks(),
        loadSummary(),
        loadPendingCount()
      ]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ EXPENSES
  async function loadExpenses() {
    const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/expenses/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      logout();
      return;
    }

    const data = await res.json();
    setTransactions(data);

    const total = data.reduce((sum, e) => sum + e.amount, 0);
    setTotalExpense(Math.round(total));
    setPrediction(total * 1.12);
  }

  // ✅ SUGGESTIONS
  async function loadSuggestions() {
    const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/suggestions/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setSuggestions(data);
    }
  }

  // 💰 FINANCIAL SUMMARY
  async function loadSummary() {
    try {
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/summary/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTotalIncome(Math.round(data.total_income || 0));
        setSavings(Math.round(data.savings || 0));
      }
    } catch (err) {
      console.error("Failed to load summary", err);
    }
  }

  // 📱 PENDING TRANSACTIONS COUNT
  async function loadPendingCount() {
    try {
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/detected/pending/count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.count || 0);
      }
    } catch (err) {
      console.error("Failed to load pending count", err);
    }
  }

  // 🤖 BUDGET RISKS
  async function loadBudgetRisks() {
    try {
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/ai/risk", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBudgetRisks(data);
      }
    } catch (err) {
      console.error("Failed to load budget risks", err);
    }
  }

  // Listen for transaction confirmations
  useEffect(() => {
    const handleTransactionConfirmed = () => {
      loadAll();
    };
    window.addEventListener("transaction-confirmed", handleTransactionConfirmed);
    return () => window.removeEventListener("transaction-confirmed", handleTransactionConfirmed);
  }, []);

  // ✅ CONFIRM
  async function confirmSuggestion(id) {
    await fetch(`/api/suggestions/${id}/confirm`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAll();
  }

  // ❌ REJECT
  async function rejectSuggestion(id) {
    await fetch(`https://smartspend-backend-aupt.onrender.com/api/suggestions/${id}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setSuggestions(suggestions.filter(s => s.id !== id));
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  }

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 100 }}>Loading dashboard…</p>;
  }

  // ---- Alerts ----
  const budgets = JSON.parse(localStorage.getItem("budgets") || "[]");

  const alerts = budgets
    .map(b => {
      const spent = transactions
        .filter(e => e.category === b.category)
        .reduce((sum, e) => sum + e.amount, 0);

      const percent = Math.round((spent / b.limit) * 100);
      if (percent >= 90) return `🚨 ${b.category} budget exceeded`;
      if (percent >= 70) return `⚠ ${b.category} budget nearly full`;
      return null;
    })
    .filter(Boolean);

  const recent = transactions.slice(0,5).reverse();

  return (
    <div>
      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "auto", padding: "25px" }}>
        <h2>🏦 SmartSpend — Overview</h2>

        {/* SUMMARY */}
        <div style={row}>
          <Card title="Total Income">
            ₹{totalIncome.toLocaleString('en-IN')}
          </Card>
          <Card title="Total Expenses">
            ₹{totalExpense.toLocaleString('en-IN')}
          </Card>
          <Card title="Savings Left">
            <span style={{ color: savings >= 0 ? "#4caf50" : "#f44336" }}>
              ₹{savings.toLocaleString('en-IN')}
            </span>
          </Card>
        </div>

        {/* PENDING TRANSACTIONS ALERT */}
        {pendingCount > 0 && (
          <div style={pendingAlertBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>📱 You have {pendingCount} unconfirmed transaction{pendingCount > 1 ? 's' : ''} today</strong>
                <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
                  Review transactions detected from your SMS
                </p>
              </div>
              <a href="/detected-transactions" style={reviewBtn}>
                Review Now
              </a>
            </div>
          </div>
        )}

        {/* 🤖 BUDGET RISKS */}
        {budgetRisks.length > 0 && (
          <div style={riskBox}>
            <h3>⚠️ Budget Risk Analysis</h3>
            {budgetRisks.slice(0, 3).map((risk, i) => (
              <div key={i} style={riskItem}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span><strong>{risk.category}</strong></span>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: risk.risk_level === "HIGH" ? "#f44336" : risk.risk_level === "MEDIUM" ? "#ff9800" : "#4caf50",
                    color: "white",
                    fontSize: "12px"
                  }}>
                    {risk.risk_level} RISK
                  </span>
                </div>
                <div style={{ fontSize: "14px", marginTop: "5px", color: "#666" }}>
                  Expected: ₹{risk.expected_spend} / Limit: ₹{risk.budget_limit}
                  <span style={{ marginLeft: "10px", color: risk.risk_level === "HIGH" ? "#f44336" : "#666" }}>
                    ({Math.round(risk.probability * 100)}% probability)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🤖 SMART SUGGESTIONS */}
        {suggestions.length > 0 && (
          <div style={suggestBox}>
            <h3>🤖 Smart Suggestions</h3>

            {suggestions.map(s => (
              <div key={s.id} style={suggestRow}>
                <span>
                  Add <b>₹{s.suggested_amount}</b> for <b>{s.category}</b>?
                </span>
                <div>
                  <button style={okBtn} onClick={() => confirmSuggestion(s.id)}>
                    ✓ Add
                  </button>
                  <button style={noBtn} onClick={() => rejectSuggestion(s.id)}>
                    ✕ Ignore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div style={actionBar}>
          <a href="/add-income" style={btn}>💰 Add Income</a>
          <a href="/add-expense" style={btn}>➕ Add Expense</a>
          <a href="/transactions" style={btnOutline}>📄 View Transactions</a>
          <a href="/analytics" style={btnOutline}>📊 View Analytics</a>
          <a href="/budgets" style={btnOutline}>🎯 Budgets</a>
          <a href="/goals" style={btnOutline}>🎯 Goals</a>
        </div>

        {/* ALERTS */}
        {alerts.length > 0 && (
          <div style={alertBox}>
            <h3>🔔 Alerts</h3>
            {alerts.map((a, i) => (
              <p key={i} style={{ color: "crimson" }}>{a}</p>
            ))}
          </div>
        )}

        {/* RECENT */}
        <div style={panel}>
          <h3>🧾 Recent Transactions</h3>
          {recent.length === 0 && <p>No transactions yet.</p>}
          {recent.map((t, i) => (
            <div key={i} style={tx}>
              <span>₹{t.amount}</span>
              <span>{t.category}</span>
              <span>{t.date?.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* UI COMPONENTS */
function Card({ title, children }) {
  return (
    <div style={card}>
      <h4>{title}</h4>
      <h2 style={{ color: "#6a11cb" }}>{children}</h2>
    </div>
  );
}

/* STYLES */
const row = { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"15px" };
const card = { background:"white", padding:"18px", borderRadius:"12px", boxShadow:"0 4px 18px rgba(0,0,0,.08)", textAlign:"center" };
const actionBar = { display:"flex", gap:"12px", marginTop:"20px" };
const btn = { background:"#6a11cb", color:"white", padding:"10px 16px", borderRadius:"10px", textDecoration:"none" };
const btnOutline = { border:"1px solid #6a11cb", color:"#6a11cb", padding:"10px 16px", borderRadius:"10px", textDecoration:"none" };
const panel = { background:"white", padding:"20px", borderRadius:"12px", marginTop:"20px" };
const alertBox = { background:"#fff6f6", padding:"15px", borderRadius:"10px", marginTop:"20px" };
const tx = { display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #eee" };

const suggestBox = { background:"#f9f5ff", padding:"20px", borderRadius:"12px", marginTop:"25px" };
const suggestRow = { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"10px" };
const okBtn = { background:"#6a11cb", color:"white", border:"none", padding:"6px 12px", borderRadius:"6px", marginRight:"8px" };
const noBtn = { background:"#eee", border:"none", padding:"6px 12px", borderRadius:"6px" };

// AI Insights Styles
const riskBox = { background:"#fff9e6", padding:"20px", borderRadius:"12px", marginTop:"20px" };
const riskItem = { padding:"12px", marginBottom:"8px", background:"white", borderRadius:"8px" };

// Pending Transactions Alert
const pendingAlertBox = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "20px",
  borderRadius: "12px",
  marginTop: "20px",
  color: "white"
};
const reviewBtn = {
  padding: "10px 20px",
  borderRadius: "8px",
  background: "white",
  color: "#6a11cb",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px"
};
