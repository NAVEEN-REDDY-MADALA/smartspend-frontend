import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MobilePage, MobileHeader, injectMobileCSS, fmt, ICONS, Icon } from "./MobileLayout";

// IST time — always correct regardless of device timezone
function nowIST() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  return new Date(utc + istOffset);
}
function todayIST() {
  const d = nowIST();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function currentTimeIST() {
  const d = nowIST();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// Student tips per category
const STUDENT_TIPS = {
  Food:          "Cooking at home 3x a week saves ~₹800/month. Mess is ₹1500–2500/month, canteen ~₹300/meal.",
  Groceries:     "Buy weekly in bulk from D-Mart or local market — saves 20–30% vs daily shopping.",
  Transport:     "Monthly bus pass = ₹200–400. If you travel daily, it pays off in 3 rides.",
  Shopping:      "Wait 48 hours before buying anything over ₹500 — you'll skip 60% of impulse buys.",
  Entertainment: "Share OTT subscriptions with 3 friends — pay just ₹50/month each instead of ₹200.",
  Bills:         "Set auto-pay reminders 3 days before due dates to avoid late fees.",
  Medicine:      "Generic medicines are 50–80% cheaper and just as effective. Ask your pharmacist.",
  Travel:        "Book train tickets 90+ days ahead. Student IRCTC concession saves 40%.",
  Coffee:        "₹80 coffee daily = ₹2,400/month. A decent French press costs ₹400 one-time.",
  Books:         "Check your college library first. Z-Library & Anna's Archive have textbooks free.",
  Rent:          "Split Wi-Fi, LPG, electricity clearly with flatmates to avoid disputes.",
  Other:         "Log even small spends — ₹20 here and ₹50 there add up to ₹1,500+/month.",
};

// Merchant suggestions per category
const MERCHANT_SUGGESTIONS = {
  Food:          ["Zomato", "Swiggy", "Mess", "Canteen", "Domino's"],
  Groceries:     ["D-Mart", "Blinkit", "Zepto", "Local Market"],
  Transport:     ["Uber", "Ola", "Rapido", "Metro", "IRCTC"],
  Shopping:      ["Amazon", "Flipkart", "Myntra", "Meesho"],
  Entertainment: ["Netflix", "Hotstar", "BookMyShow", "Spotify"],
  Bills:         ["Jio", "Airtel", "Vi", "College Fees"],
  Medicine:      ["MedLife", "Apollo", "1mg", "PharmEasy"],
  Travel:        ["IRCTC", "MakeMyTrip", "Goibibo", "RedBus"],
  Coffee:        ["Starbucks", "CCD", "Third Wave"],
  Books:         ["Amazon", "Flipkart", "Local Store"],
  Rent:          ["Landlord", "PG Owner"],
  Other:         [],
};

const CATEGORIES = [
  { label:"Food",          emoji:"🍜" },
  { label:"Groceries",     emoji:"🛒" },
  { label:"Transport",     emoji:"🚗" },
  { label:"Shopping",      emoji:"🛍️" },
  { label:"Entertainment", emoji:"🎬" },
  { label:"Bills",         emoji:"💡" },
  { label:"Medicine",      emoji:"💊" },
  { label:"Travel",        emoji:"✈️" },
  { label:"Coffee",        emoji:"☕" },
  { label:"Books",         emoji:"📚" },
  { label:"Rent",          emoji:"🏠" },
  { label:"Other",         emoji:"💳" },
];

const PAYMENTS = [
  { label:"UPI",         emoji:"📱" },
  { label:"Card",        emoji:"💳" },
  { label:"Cash",        emoji:"💵" },
  { label:"Net Banking", emoji:"🏦" },
];

const QUICK_AMOUNTS = [50, 100, 150, 200, 500, 1000];

// Chip button for categories and payments
function Chip({ label, emoji, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`chip${selected?" active":""}`}
      style={{
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 13,
      }}>
      <span style={{ fontSize: 16 }}>{emoji}</span>
      {label}
    </button>
  );
}

// Input field wrapper
function InputField({ label, hint, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink2)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>
        {label}
      </label>
      {hint && <div style={{ fontSize: 11, color: "var(--ink4)", marginBottom: 4 }}>{hint}</div>}
      {children}
      {error && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>⚠️ {error}</div>}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════
export default function AddExpense() {
  injectMobileCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const amountRef = useRef(null);

  const [amount,   setAmount]   = useState("");
  const [category, setCategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [payment,  setPayment]  = useState("");
  const [date,     setDate]     = useState(todayIST());
  const [time,     setTime]     = useState(currentTimeIST());
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!token) navigate("/", { replace: true });
    if (amountRef.current) amountRef.current.focus();
  }, [token, navigate]);

  const suggestions = category ? (MERCHANT_SUGGESTIONS[category] || []) : [];
  const tip = category ? STUDENT_TIPS[category] : null;
  const canSubmit = amount && category && payment && !loading;

  async function handleSave(e) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError("");

    const createdAt = `${date}T${time}:00+05:30`;

    try {
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/expenses/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          merchant: merchant.trim() || null,
          payment_method: payment,
          date,
          created_at: createdAt,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || "Failed to save expense. Try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
    } catch {
      setError("Can't reach the server. Check your internet.");
      setLoading(false);
    }
  }

  return (
    <MobilePage>
      <MobileHeader
        title="Add Expense 💸"
        subtitle="What did you spend?"
        back
        onBack={() => navigate(-1)}
      />

      <div className="page-scroll">
        {success ? (
          // Success state
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "40px 20px",
            textAlign: "center",
          }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "var(--green-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pop .5s ease",
            }}>
              <Icon d={ICONS.check} size={28} color="var(--green)" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Expense saved! 🎉
              </div>
              <div style={{ fontSize: 13, color: "var(--ink3)", lineHeight: 1.6 }}>
                ₹{fmt(parseFloat(amount))} on {category}
                {merchant ? ` at ${merchant}` : ""}<br />
                <span style={{ fontSize: 11, color: "var(--ink4)", marginTop: 4, display: "block" }}>
                  📅 {date} • 🕐 {time}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Form
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            {/* Amount */}
            <InputField label="Amount (₹)">
              <div style={{
                display: "flex",
                gap: 6,
                marginBottom: 10,
                flexWrap: "wrap",
              }}>
                {QUICK_AMOUNTS.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q.toString())}
                    className="chip"
                    style={{
                      padding: "6px 12px",
                      background: amount === q.toString() ? "var(--brand-soft)" : "var(--surface)",
                    }}
                  >
                    ₹{q}
                  </button>
                ))}
              </div>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 16,
                  color: "var(--ink3)",
                  fontWeight: 600,
                }}>
                  ₹
                </span>
                <input
                  ref={amountRef}
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="inp"
                  inputMode="decimal"
                  style={{
                    paddingLeft: 28,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                />
              </div>
            </InputField>

            {/* Category */}
            <InputField label="Category" hint="What did you spend on?">
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}>
                {CATEGORIES.map(cat => (
                  <Chip
                    key={cat.label}
                    emoji={cat.emoji}
                    label={cat.label}
                    selected={category === cat.label}
                    onClick={() => {
                      setCategory(cat.label);
                      setMerchant("");
                    }}
                  />
                ))}
              </div>
            </InputField>

            {/* Student Tip */}
            {tip && (
              <div style={{
                padding: 12,
                background: "var(--amber-bg)",
                border: "1px solid #fde68a",
                borderRadius: 12,
                marginBottom: 16,
                animation: "pop .3s ease",
              }}>
                <div style={{
                  display: "flex",
                  gap: 8,
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                  <div style={{
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: "var(--ink2)",
                  }}>
                    <strong style={{ color: "var(--amber)" }}>Tip:</strong> {tip}
                  </div>
                </div>
              </div>
            )}

            {/* Merchant */}
            <InputField
              label="Where? (optional)"
              hint="Store or merchant name"
            >
              {suggestions.length > 0 && (
                <div style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}>
                  {suggestions.slice(0, 4).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMerchant(s)}
                      className="chip"
                      style={{
                        padding: "4px 10px",
                        fontSize: 11,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <input
                type="text"
                placeholder={category ? `e.g. ${suggestions[0] || "Store name"}` : "Pick a category first"}
                value={merchant}
                onChange={e => setMerchant(e.target.value)}
                className="inp"
                maxLength={60}
                disabled={!category}
              />
            </InputField>

            {/* Payment Method */}
            <InputField label="How did you pay?">
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
              }}>
                {PAYMENTS.map(p => (
                  <Chip
                    key={p.label}
                    emoji={p.emoji}
                    label={p.label}
                    selected={payment === p.label}
                    onClick={() => setPayment(p.label)}
                  />
                ))}
              </div>
            </InputField>

            {/* Date & Time */}
            <InputField label="When? (IST)" hint="Defaults to now">
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}>
                <div>
                  <label style={{ fontSize: 10, color: "var(--ink4)", display: "block", marginBottom: 4 }}>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="inp"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--ink4)", display: "block", marginBottom: 4 }}>Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="inp"
                  />
                </div>
              </div>
            </InputField>

            {/* Error */}
            {error && (
              <div style={{
                padding: 12,
                background: "var(--red-bg)",
                border: "1px solid #fecaca",
                borderRadius: 10,
                color: "var(--red)",
                fontSize: 12,
                marginBottom: 16,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary"
              style={{
                marginBottom: 8,
                background: !canSubmit ? "var(--ink4)" : "var(--brand)",
                cursor: !canSubmit ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div className="spinner" style={{ width: 16, height: 16 }} />
                  Saving…
                </div>
              ) : (
                `Save ₹${amount || "0"}`
              )}
            </button>

            {(!category || !payment) && (
              <div style={{ textAlign: "center", fontSize: 11, color: "var(--ink4)" }}>
                {!category && !payment ? "Please fill all fields" : !category ? "Pick a category" : "Pick a payment method"}
              </div>
            )}

          </form>
        )}
      </div>
    </MobilePage>
  );
}