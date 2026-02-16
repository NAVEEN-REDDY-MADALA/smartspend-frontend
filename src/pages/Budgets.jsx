import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Budgets() {

  const token = localStorage.getItem("token");
  if (!token) window.location.href = "/";

  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgetRisks, setBudgetRisks] = useState([]);

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [message, setMessage] = useState("");

  const categories = [
    "Food","Bills","Shopping","Entertainment","Travel",
    "Medicine","Groceries","Other"
  ];

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    // Fetch expenses
    const e = await fetch("https://smartspend-backend-aupt.onrender.com/api/expenses/", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setExpenses(await e.json());

    // Load & CLEAN budgets (monthly)
    const saved = JSON.parse(localStorage.getItem("budgets") || "[]");

    const activeBudgets = saved.filter(
      b => b.month === currentMonth && b.year === currentYear
    );

    localStorage.setItem("budgets", JSON.stringify(activeBudgets));
    setBudgets(activeBudgets);

    // 🤖 AI Budget Risks
    try {
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/ai/risk", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBudgetRisks(await res.json());
      }
    } catch (err) {
      console.error("Failed to load budget risks", err);
    }
  }

  function saveBudget(e) {
    e.preventDefault();
    setMessage("");

    // Prevent duplicate category in same month
    const exists = budgets.find(
      b => b.category === category
    );

    if (exists) {
      setMessage("⚠ Budget already exists for this category this month");
      return;
    }

    const newBudget = {
      category,
      limit: parseFloat(limit),
      month: currentMonth,
      year: currentYear
    };

    const updated = [...budgets, newBudget];
    localStorage.setItem("budgets", JSON.stringify(updated));
    setBudgets(updated);

    setMessage("🎯 Budget added for this month");
    setCategory("");
    setLimit("");
  }

  function spent(category) {
    return expenses
      .filter(e => e.category === category)
      .reduce((a,b)=>a + b.amount,0);
  }

  return (
    <div>
      <Navbar />

      <div style={{maxWidth:"800px",margin:"20px auto"}}>

        <h2>💰 Monthly Budgets</h2>

        <form
          onSubmit={saveBudget}
          style={formBox}
        >
          <label>Category</label>
          <select
            required
            value={category}
            onChange={e=>setCategory(e.target.value)}
            style={input}
          >
            <option value="">Select</option>
            {categories.map(c=> <option key={c}>{c}</option>)}
          </select>

          <label>Monthly Limit</label>
          <input
            type="number"
            required
            value={limit}
            onChange={e=>setLimit(e.target.value)}
            style={input}
          />

          <button style={btn}>Save Budget</button>
        </form>

        {message && <p style={{color: message.includes("⚠") ? "red" : "green"}}>{message}</p>}

        {/* 🤖 AI RISK */}
        {budgetRisks.length > 0 && (
          <div style={riskAnalysisBox}>
            <h3>🤖 AI Budget Risk Analysis</h3>
            {budgetRisks.map((risk, i) => {
              const match = budgets.find(b => b.category === risk.category);
              if (!match) return null;

              return (
                <div key={i} style={riskCard(risk.risk_level)}>
                  <strong>{risk.category}</strong>
                  <div>Expected: ₹{risk.expected_spend.toFixed(2)}</div>
                  <div>Limit: ₹{risk.budget_limit.toFixed(2)}</div>
                  <div><b>{Math.round(risk.probability * 100)}%</b> chance of exceeding</div>
                </div>
              );
            })}
          </div>
        )}

        <h3 style={{marginTop:"25px"}}>
          📊 Active Budgets — {now.toLocaleString("default",{month:"long",year:"numeric"})}
        </h3>

        {budgets.map((b,i)=>{

          const used = spent(b.category);
          const percent = Math.min(100, Math.round((used/b.limit)*100));

          let alert = "";
          if(percent >= 90) alert = "⚠ You are about to exceed your budget!";
          else if(percent >= 70) alert = "🔔 You have used most of your budget.";

          return (
            <div key={i} style={card}>
              <b>{b.category}</b> — Limit: ₹{b.limit}
              <br/>
              Spent: ₹{used}

              {alert && (
                <p style={{color: percent >= 90 ? "red" : "orange"}}>{alert}</p>
              )}

              <div style={barWrap}>
                <div
                  style={{
                    ...bar,
                    width:`${percent}%`,
                    background: percent>=90 ? "red"
                              : percent>=70 ? "orange"
                              : "#6a11cb"
                  }}
                />
              </div>

              <small>{percent}% used</small>
            </div>
          );
        })}

      </div>
    </div>
  );
}

/* ---------- styles ---------- */

const input = {
  width:"100%",padding:"10px",borderRadius:"8px",border:"1px solid #ccc",
  marginBottom:"15px"
};

const btn = {
  width:"100%",padding:"12px",borderRadius:"10px",border:"none",
  background:"#6a11cb",color:"white",cursor:"pointer"
};

const formBox = {
  background:"white",
  padding:"20px",
  borderRadius:"12px",
  marginTop:"15px",
  boxShadow:"0 5px 15px rgba(0,0,0,0.1)"
};

const card = {
  background:"white",
  padding:"15px",
  borderRadius:"10px",
  marginTop:"15px",
  boxShadow:"0 5px 15px rgba(0,0,0,0.1)"
};

const barWrap = {
  width:"100%",
  height:"10px",
  background:"#eee",
  borderRadius:"5px",
  marginTop:"8px"
};

const bar = {
  height:"10px",
  borderRadius:"5px"
};

const riskAnalysisBox = {
  background: "#f5f5f5",
  padding: "20px",
  borderRadius: "12px",
  marginTop: "20px"
};

const riskCard = (level) => ({
  padding:"12px",
  marginBottom:"10px",
  borderRadius:"8px",
  background:
    level === "HIGH" ? "#ffebee" :
    level === "MEDIUM" ? "#fff3e0" :
    "#e8f5e9",
  borderLeft:`4px solid ${
    level === "HIGH" ? "#f44336" :
    level === "MEDIUM" ? "#ff9800" :
    "#4caf50"
  }`
});
