import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";


export default function AddExpense() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [payment, setPayment] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  // 🔐 Auth check
  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  const categories = [
    "Food",
    "Bills",
    "Shopping",
    "Entertainment",
    "Travel",
    "Medicine",
    "Groceries",
    "Other"
  ];

  const paymentMethods = ["UPI", "Card", "Cash", "Net Banking"];

  async function saveExpense(e) {
    e.preventDefault();

    try {
 const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/expenses/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          payment_method: payment,
          date
        })
      });

      if (!res.ok) {
        setMessage("Failed to save expense ❌");
        return;
      }

      setMessage("Expense saved successfully 🎉");

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
        <h2>➕ Add New Expense</h2>

        <form onSubmit={saveExpense} style={{ marginTop: "20px" }}>
          <label>Amount (₹)</label>
          <input type="number" required value={amount}
            onChange={(e) => setAmount(e.target.value)} style={input} />

          <label>Category</label>
          <select required value={category}
            onChange={(e) => setCategory(e.target.value)} style={input}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>

          <label>Payment Method</label>
          <select required value={payment}
            onChange={(e) => setPayment(e.target.value)} style={input}>
            <option value="">Select method</option>
            {paymentMethods.map(p => <option key={p}>{p}</option>)}
          </select>

          <label>Date</label>
          <input type="date" required value={date}
            onChange={(e) => setDate(e.target.value)} style={input} />

          <button style={btn}>Save Expense</button>
        </form>

        {message && <p style={{ color: "green" }}>{message}</p>}
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
  cursor: "pointer"
};
