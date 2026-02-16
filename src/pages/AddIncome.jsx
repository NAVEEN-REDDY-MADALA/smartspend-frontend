import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AddIncome() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // ✅ Set initial value
  const [message, setMessage] = useState("");

  // 🔐 Auth check
  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  const incomeSources = [
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Rental",
    "Bonus",
    "Other"
  ];

  async function saveIncome(e) {
    e.preventDefault();

    try {
      // ✅ Changed to /api/income/ (singular)
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/income/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          source,
          date: date || new Date().toISOString().split('T')[0]
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error:", errorData);
        setMessage("Failed to save income ❌");
        return;
      }

      setMessage("Income saved successfully 🎉");

      setTimeout(() => navigate("/dashboard", { replace: true }), 800);

    } catch (err) {
      console.error(err);
      setMessage("Server error ❌");
    }
  }

  return (
    <div>
      <Navbar />

      <div style={container}>
        <h2>💰 Add New Income</h2>

        <form onSubmit={saveIncome} style={{ marginTop: "20px" }}>
          <label>Amount (₹)</label>
          <input 
            type="number" 
            required 
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)} 
            style={input}
            placeholder="Enter income amount"
          />

          <label>Source</label>
          <select 
            required 
            value={source}
            onChange={(e) => setSource(e.target.value)} 
            style={input}
          >
            <option value="">Select source</option>
            {incomeSources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <label>Date</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)} 
            style={input}
            // ✅ Removed defaultValue prop
          />

          <button style={btn}>Save Income</button>
        </form>

        {message && (
          <p style={{ color: message.includes("successfully") ? "green" : "red", marginTop: "10px" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

const container = {
  maxWidth: "600px",
  margin: "30px auto",
  background: "white",
  padding: "25px",
  borderRadius: "15px",
  boxShadow: "0 5px 25px rgba(0,0,0,0.1)"
};

const input = {
  display: "block",
  width: "100%",
  padding: "10px",
  margin: "10px 0 20px 0",
  borderRadius: "8px",
  border: "1px solid #ccc"
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