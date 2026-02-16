import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Transactions() {

  const token = localStorage.getItem("token");
  if (!token) window.location.href = "/";

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  // ✅ Load on mount
  useEffect(() => { 
    load(); 
  }, []);

  // ✅ Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      load();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  async function load() {
    try {
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/expenses/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error("Failed to fetch expenses:", res.status);
        return;
      }

      const data = await res.json();
      
      console.log("📊 Expenses loaded:", data.length, "at", new Date().toLocaleTimeString());
      
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  }

  function applyFilters() {
    let list = [...transactions];

    if (search) {
      list = list.filter(t =>
        t.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      list = list.filter(t => t.category === category);
    }

    if (date) {
      list = list.filter(
        t => new Date(t.date).toLocaleDateString("en-CA") === date
      );
    }

    setFiltered(list);
  }

  useEffect(() => { 
    applyFilters(); 
  }, [search, category, date, transactions]);

  const categories = [
    "Food", "Bills", "Shopping", "Entertainment", "Travel",
    "Medicine", "Groceries", "Other"
  ];

  return (
    <div>
      <Navbar />

      <div style={{ maxWidth: "1100px", margin: "auto", padding: "25px" }}>
        <h2>📄 Transactions</h2>

        {/* FILTER BAR */}
        <div style={filterBar}>
          <input
            placeholder="Search category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={input}
          />

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={input}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={input}
          />

          {/* ✅ MANUAL REFRESH BUTTON */}
          <button
            onClick={() => load()}
            style={{...clearBtn, background: "#2196F3"}}
            title="Refresh data"
          >
            🔄 Refresh
          </button>

          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              setDate("");
            }}
            style={clearBtn}
          >
            Reset
          </button>
        </div>

        {/* TABLE */}
        <div style={tableBox}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={headerRow}>
                <th style={th}>Amount</th>
                <th style={th}>Category</th>
                <th style={th}>Payment</th>
                <th style={th}>Date</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((t, i) => {
                // ✅ Handle different boolean representations
                const isAuto = t.is_auto === true || 
                               t.is_auto === 1 || 
                               t.is_auto === "true" ||
                               t.is_auto === "1";
                
                return (
                  <tr
                    key={t.id || i}
                    style={{
                      ...tableRow,
                      background: isAuto ? "#e8f4ff" : "white",
                      borderLeft: isAuto ? "4px solid #2196F3" : "4px solid transparent"
                    }}
                  >
                    <td style={td}>₹{t.amount}</td>
                    <td style={td}>
                      <span style={categoryBadge}>{t.category}</span>
                    </td>
                    <td style={td}>
                      {isAuto ? (
                        <span style={{...badge, ...autoBadge}}>
                          🤖 Auto
                        </span>
                      ) : (
                        <span style={{...badge, ...manualBadge}}>
                          ✍️ Manual
                        </span>
                      )}
                    </td>
                    <td style={td}>{t.date.slice(0, 10)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p style={{ textAlign: "center", padding: "20px", color: "#888" }}>
              No records found 😐
            </p>
          )}
        </div>

        {/* ✅ STATS SUMMARY */}
        <div style={statsBox}>
          <div style={statItem}>
            <span style={statLabel}>Total Transactions:</span>
            <span style={statValue}>{filtered.length}</span>
          </div>
          <div style={statItem}>
            <span style={statLabel}>🤖 Auto Expenses:</span>
            <span style={{...statValue, color: "#2196F3"}}>
              {filtered.filter(t => 
                t.is_auto === true || 
                t.is_auto === 1 || 
                t.is_auto === "true" ||
                t.is_auto === "1"
              ).length}
            </span>
          </div>
          <div style={statItem}>
            <span style={statLabel}>✍️ Manual Expenses:</span>
            <span style={{...statValue, color: "#f57c00"}}>
              {filtered.filter(t => 
                !(t.is_auto === true || 
                  t.is_auto === 1 || 
                  t.is_auto === "true" ||
                  t.is_auto === "1")
              ).length}
            </span>
          </div>
        </div>

        {/* ✅ AUTO-REFRESH INDICATOR */}
        <div style={refreshIndicator}>
          <span style={{fontSize: "12px", color: "#888"}}>
            🔄 Auto-refreshing every 5 seconds
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const filterBar = {
  display: "flex",
  gap: "10px",
  marginTop: "15px",
  marginBottom: "15px",
  flexWrap: "wrap"
};

const input = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

const clearBtn = {
  padding: "10px 15px",
  borderRadius: "8px",
  border: "none",
  background: "#6a11cb",
  color: "white",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  transition: "background 0.3s"
};

const tableBox = {
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 5px 20px rgba(0,0,0,.08)",
  overflowX: "auto"
};

const headerRow = {
  background: "#f5f5f5",
  borderBottom: "2px solid #ddd"
};

const th = {
  padding: "12px",
  textAlign: "left",
  fontWeight: "600",
  color: "#333"
};

const tableRow = {
  borderBottom: "1px solid #eee",
  transition: "background 0.2s"
};

const td = {
  padding: "12px",
  color: "#555"
};

const badge = {
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "500",
  display: "inline-block"
};

const autoBadge = {
  background: "#e3f2fd",
  color: "#1976d2"
};

const manualBadge = {
  background: "#fff3e0",
  color: "#f57c00"
};

const categoryBadge = {
  padding: "4px 8px",
  borderRadius: "6px",
  background: "#f5f5f5",
  fontSize: "13px",
  fontWeight: "500"
};

const statsBox = {
  display: "flex",
  gap: "15px",
  marginTop: "20px",
  flexWrap: "wrap"
};

const statItem = {
  background: "white",
  padding: "15px 20px",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,.05)",
  flex: "1",
  minWidth: "200px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const statLabel = {
  color: "#666",
  fontSize: "14px",
  fontWeight: "500"
};

const statValue = {
  color: "#6a11cb",
  fontSize: "24px",
  fontWeight: "700"
};

const refreshIndicator = {
  textAlign: "center",
  marginTop: "15px",
  padding: "10px",
  background: "#f9f9f9",
  borderRadius: "8px"
};
