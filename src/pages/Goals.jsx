import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Goals() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savings, setSavings] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    } else {
      loadGoals();
      loadSavings();
    }
    // eslint-disable-next-line
  }, []);

  async function loadGoals() {
    try {
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/goals/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (err) {
      console.error("Failed to load goals", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSavings() {
    try {
      // ✅ Fixed: Use /api/summary/ to get savings
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/summary/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavings(data.savings || 0);
      }
    } catch (err) {
      console.error("Failed to load savings", err);
    }
  }

  async function createGoal(e) {
    e.preventDefault();

    try {
      // ✅ Fixed: Removed double slash
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/goals/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || null,
          target_amount: parseFloat(targetAmount),
          target_date: targetDate || null,
        }),
      });

      if (!res.ok) {
        setMessage("Failed to create goal ❌");
        return;
      }

      setMessage("Goal created successfully 🎯");
      setTitle("");
      setDescription("");
      setTargetAmount("");
      setTargetDate("");
      loadGoals();
    } catch (err) {
      console.error(err);
      setMessage("Server error ❌");
    }
  }

  async function deleteGoal(id) {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      // ✅ Fixed: Added full URL
      const res = await fetch(`https://smartspend-backend-aupt.onrender.com/api/goals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        loadGoals();
      }
    } catch (err) {
      console.error("Failed to delete goal", err);
    }
  }

  async function addAmountToGoal(goalId, amount) {
    try {
      // ✅ Fixed: Added full URL
      const res = await fetch(`https://smartspend-backend-aupt.onrender.com/api/goals/${goalId}/add-amount?amount=${amount}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail || "Failed to add amount to goal");
        return;
      }

      // Success - reload goals and savings
      loadGoals();
      loadSavings();
      alert(`₹${amount.toLocaleString('en-IN')} allocated to goal. Savings updated!`);
    } catch (err) {
      console.error("Failed to add amount", err);
      alert("Failed to add amount to goal");
    }
  }

  function getProgress(goal) {
    return Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
  }

  function getRemaining(goal) {
    return Math.max(0, goal.target_amount - goal.current_amount);
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <p style={{ textAlign: "center", marginTop: 100 }}>Loading goals…</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "auto", padding: "25px" }}>
        <h2>🎯 Financial Goals</h2>

        {/* SAVINGS INFO */}
        <div style={savingsBox}>
          <h3>💰 Available Savings</h3>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: savings >= 0 ? "#4caf50" : "#f44336" }}>
            ₹{savings.toLocaleString('en-IN')}
          </div>
          <p style={{ color: "#666", marginTop: "10px" }}>
            Use this to fund your goals!
          </p>
        </div>

        {/* CREATE GOAL FORM */}
        <div style={formBox}>
          <h3>➕ Create New Goal</h3>
          <form onSubmit={createGoal}>
            <label>Goal Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Buy a House"
              style={input}
            />

            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              style={{ ...input, minHeight: "60px" }}
            />

            <label>Target Amount (₹) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="500000"
              style={input}
            />

            <label>Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={input}
            />

            <button type="submit" style={btn}>
              Create Goal
            </button>
          </form>

          {message && (
            <p style={{ color: message.includes("successfully") ? "green" : "red", marginTop: "10px" }}>
              {message}
            </p>
          )}
        </div>

        {/* GOALS LIST */}
        <div style={{ marginTop: "30px" }}>
          <h3>📋 Your Goals</h3>
          {goals.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>
              No goals yet. Create your first goal above!
            </p>
          ) : (
            <div style={goalsGrid}>
              {goals.map((goal) => {
                const progress = getProgress(goal);
                const remaining = getRemaining(goal);
                const canFund = savings >= remaining && goal.status === "active";

                return (
                  <div key={goal.id} style={goalCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                      <div>
                        <h4 style={{ margin: 0 }}>{goal.title}</h4>
                        {goal.description && (
                          <p style={{ color: "#666", fontSize: "14px", margin: "5px 0 0 0" }}>
                            {goal.description}
                          </p>
                        )}
                      </div>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "4px",
                        background: goal.status === "completed" ? "#4caf50" : "#6a11cb",
                        color: "white",
                        fontSize: "12px",
                        textTransform: "uppercase"
                      }}>
                        {goal.status}
                      </span>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span>Progress</span>
                        <span style={{ fontWeight: "bold" }}>{progress}%</span>
                      </div>
                      <div style={progressBar}>
                        <div
                          style={{
                            ...progressFill,
                            width: `${progress}%`,
                            background: progress === 100 ? "#4caf50" : "#6a11cb"
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
                      <div>Current: ₹{goal.current_amount.toLocaleString('en-IN')}</div>
                      <div>Target: ₹{goal.target_amount.toLocaleString('en-IN')}</div>
                      <div style={{ fontWeight: "bold", marginTop: "5px" }}>
                        Remaining: ₹{remaining.toLocaleString('en-IN')}
                      </div>
                      {goal.target_date && (
                        <div style={{ marginTop: "5px" }}>
                          Target Date: {new Date(goal.target_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                      {goal.status === "active" && (
                        <>
                          {canFund && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Allocate ₹${remaining.toLocaleString('en-IN')} to this goal? This will deduct from your savings.`)) {
                                  addAmountToGoal(goal.id, remaining);
                                }
                              }}
                              style={fundBtn}
                            >
                              💰 Fund Full Amount
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const amountStr = prompt(`How much to add? (Available: ₹${savings.toLocaleString('en-IN')})`);
                              if (amountStr) {
                                const amount = parseFloat(amountStr);
                                if (isNaN(amount) || amount <= 0) {
                                  alert("Please enter a valid amount");
                                  return;
                                }
                                if (amount > savings) {
                                  alert(`Insufficient savings! Available: ₹${savings.toLocaleString('en-IN')}`);
                                  return;
                                }
                                if (window.confirm(`Allocate ₹${amount.toLocaleString('en-IN')} to this goal? This will deduct from your savings.`)) {
                                  addAmountToGoal(goal.id, amount);
                                }
                              }
                            }}
                            style={addBtn}
                          >
                            ➕ Add Amount
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        style={deleteBtn}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// STYLES (unchanged)
const savingsBox = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "25px",
  borderRadius: "12px",
  marginBottom: "25px",
  color: "white",
  textAlign: "center"
};

const formBox = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 18px rgba(0,0,0,.08)",
  marginBottom: "25px"
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

const btn = {
  padding: "12px",
  width: "100%",
  borderRadius: "10px",
  border: "none",
  background: "#6a11cb",
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold"
};

const goalsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px",
  marginTop: "20px"
};

const goalCard = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 18px rgba(0,0,0,.08)"
};

const progressBar = {
  width: "100%",
  height: "10px",
  background: "#eee",
  borderRadius: "5px",
  overflow: "hidden"
};

const progressFill = {
  height: "100%",
  borderRadius: "5px",
  transition: "width 0.3s ease"
};

const fundBtn = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#4caf50",
  color: "white",
  cursor: "pointer",
  fontSize: "12px"
};

const addBtn = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#6a11cb",
  color: "white",
  cursor: "pointer",
  fontSize: "12px"
};

const deleteBtn = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#f44336",
  color: "white",
  cursor: "pointer",
  fontSize: "12px"
};