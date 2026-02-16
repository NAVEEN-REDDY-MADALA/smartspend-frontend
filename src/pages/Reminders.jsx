import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { colors, shadows, borderRadius, spacing, typography } from "../styles/theme";

export default function Reminders() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return null;
  }

  const [reminders, setReminders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  async function loadReminders() {
    setLoading(true);
    try {
      console.log("📊 Loading reminders..."); // Debug log
      
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/reminders/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Response status:", res.status); // Debug log

      if (res.ok) {
        const data = await res.json();
        console.log("Reminders loaded:", data); // Debug log
        setReminders(data);
      } else {
        console.error("Failed to load reminders:", res.status);
      }
    } catch (error) {
      console.error("Error loading reminders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsPaid(reminderId) {
    try {
      const res = await fetch(`https://smartspend-backend-aupt.onrender.com/api/reminders/${reminderId}/mark-paid`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("✅ Marked as paid and expense added!");
        loadReminders(); // Reload to show updated date
      }
    } catch (error) {
      console.error("Error marking as paid:", error);
      alert("❌ Failed to mark as paid");
    }
  }

  async function deleteReminder(reminderId) {
    if (!confirm("Are you sure you want to delete this reminder?")) return;

    try {
      const res = await fetch(`https://smartspend-backend-aupt.onrender.com/api/reminders/${reminderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("✅ Reminder deleted");
        loadReminders();
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
      alert("❌ Failed to delete reminder");
    }
  }

  const getDaysUntil = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const paymentDate = new Date(dateString);
    paymentDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const diffTime = paymentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getStatusColor = (daysUntil) => {
    if (daysUntil < 0) return colors.danger.main; // Overdue
    if (daysUntil === 0) return colors.danger.main; // Due today
    if (daysUntil <= 1) return colors.warning.main; // Due tomorrow
    if (daysUntil <= 7) return colors.warning.main; // Due within a week
    return colors.success.main; // More than a week away
  };

  if (loading) {
    return (
      <div style={pageWrapper}>
        <Navbar />
        <div style={loadingContainer}>
          <div style={spinner}>⏳</div>
          <p style={loadingText}>Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrapper}>
      <Navbar />

      <div style={container}>
        {/* Header */}
        <div style={header}>
          <div>
            <h1 style={title}>🔔 Payment Reminders</h1>
            <p style={subtitle}>Never miss a bill or subscription payment</p>
          </div>
          <button style={addButton} onClick={() => setShowAddModal(true)}>
            + Add Reminder
          </button>
        </div>

        {/* Reminders Grid */}
        <div style={remindersGrid}>
          {reminders.length === 0 ? (
            <div style={emptyState}>
              <span style={emptyIcon}>📭</span>
              <h3 style={emptyTitle}>No reminders yet</h3>
              <p style={emptyText}>
                Add your first recurring payment reminder
              </p>
              <button style={emptyButton} onClick={() => setShowAddModal(true)}>
                + Add Reminder
              </button>
            </div>
          ) : (
            reminders.map((reminder) => {
              const daysUntil = getDaysUntil(reminder.next_payment_date);
              const statusColor = getStatusColor(daysUntil);

              return (
                <div key={reminder.id} style={reminderCard}>
                  <div style={cardHeader}>
                    <div style={cardTitle}>
                      <span style={cardIcon}>
                        {getCategoryIcon(reminder.category)}
                      </span>
                      <div>
                        <div style={cardName}>{reminder.name}</div>
                        <div style={cardCategory}>{reminder.category}</div>
                      </div>
                    </div>
                    <div style={cardAmount}>₹{reminder.amount}</div>
                  </div>

                  <div style={cardBody}>
                    <div style={dateSection}>
                      <span style={dateLabel}>Next Payment:</span>
                      <span style={dateValue}>
                        {new Date(reminder.next_payment_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div style={{
                      ...daysUntilBadge,
                      backgroundColor: `${statusColor}20`,
                      color: statusColor,
                      border: `2px solid ${statusColor}`
                    }}>
                      {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue!` :
                       daysUntil === 0 ? "⚠️ Due Today!" : 
                       daysUntil === 1 ? "Due Tomorrow" :
                       `${daysUntil} days left`}
                    </div>

                    <div style={notificationSettings}>
                      <span style={settingsLabel}>Notifications:</span>
                      <div style={notifChips}>
                        {reminder.notify_7_days && <span style={notifChip}>📅 7 days</span>}
                        {reminder.notify_3_days && <span style={notifChip}>📅 3 days</span>}
                        {reminder.notify_1_day && <span style={notifChip}>📅 1 day</span>}
                        {reminder.notify_same_day && <span style={notifChip}>📅 Same day</span>}
                      </div>
                    </div>

                    {reminder.auto_pay && (
                      <div style={autoPayBadge}>
                        ⚡ Auto-Pay Enabled
                      </div>
                    )}
                  </div>

                  <div style={cardActions}>
                    <button
                      style={markPaidButton}
                      onClick={() => markAsPaid(reminder.id)}
                    >
                      ✓ Mark as Paid
                    </button>
                    <button
                      style={deleteButton}
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <AddReminderModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadReminders(); // Reload reminders after adding
          }}
          token={token}
        />
      )}
    </div>
  );
}

function AddReminderModal({ onClose, onSuccess, token }) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "Bills",
    day_of_month: "1",
    notify_7_days: true,
    notify_3_days: false,
    notify_1_day: true,
    notify_same_day: true,
    auto_pay: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = ["Bills", "Subscription", "EMI", "Insurance", "Rent", "Other"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        day_of_month: parseInt(formData.day_of_month),
        frequency: "monthly",
        notify_7_days: formData.notify_7_days,
        notify_3_days: formData.notify_3_days,
        notify_1_day: formData.notify_1_day,
        notify_same_day: formData.notify_same_day,
        auto_pay: formData.auto_pay,
      };

      console.log("Creating reminder with payload:", payload);

      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/reminders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Response:", res.status, data);

      if (res.ok) {
        alert("✅ Reminder added successfully!");
        onSuccess(); // This will close modal and reload data
      } else {
        setError(data.detail || "Failed to create reminder");
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeader}>
          <h2 style={modalTitle}>Add Payment Reminder</h2>
          <button style={closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={modalForm}>
          <div style={formGroup}>
            <label style={formLabel}>Reminder Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Netflix, Credit Card EMI"
              style={formInput}
              required
            />
          </div>

          <div style={formRow}>
            <div style={formGroup}>
              <label style={formLabel}>Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="499"
                style={formInput}
                required
              />
            </div>

            <div style={formGroup}>
              <label style={formLabel}>Day of Month *</label>
              <select
                value={formData.day_of_month}
                onChange={(e) => setFormData({...formData, day_of_month: e.target.value})}
                style={formSelect}
                required
              >
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}{getOrdinalSuffix(day)}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={formGroup}>
            <label style={formLabel}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={formSelect}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={formGroup}>
            <label style={formLabel}>Notify Me Before:</label>
            <div style={checkboxGroup}>
              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.notify_7_days}
                  onChange={(e) => setFormData({...formData, notify_7_days: e.target.checked})}
                />
                <span>7 days before</span>
              </label>
              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.notify_3_days}
                  onChange={(e) => setFormData({...formData, notify_3_days: e.target.checked})}
                />
                <span>3 days before</span>
              </label>
              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.notify_1_day}
                  onChange={(e) => setFormData({...formData, notify_1_day: e.target.checked})}
                />
                <span>1 day before</span>
              </label>
              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.notify_same_day}
                  onChange={(e) => setFormData({...formData, notify_same_day: e.target.checked})}
                />
                <span>On the day</span>
              </label>
            </div>
          </div>

          <div style={formGroup}>
            <label style={checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.auto_pay}
                onChange={(e) => setFormData({...formData, auto_pay: e.target.checked})}
              />
              <span>Auto-Pay Enabled (for tracking only)</span>
            </label>
          </div>

          {error && (
            <div style={errorMessage}>
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...submitButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Reminder"}
          </button>
        </form>
      </div>
    </div>
  );
}

function getCategoryIcon(category) {
  const icons = {
    Bills: "📄",
    Subscription: "📺",
    EMI: "💳",
    Insurance: "🛡️",
    Rent: "🏠",
    Other: "💰"
  };
  return icons[category] || "💰";
}

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/* ============= STYLES ============= */
// (All styles remain the same - no changes needed)

const pageWrapper = {
  minHeight: "100vh",
  background: colors.light.bg,
};

const loadingContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "80vh",
};

const spinner = {
  fontSize: "60px",
};

const loadingText = {
  marginTop: spacing.lg,
  color: colors.text.secondary,
  fontSize: "18px",
};

const container = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: spacing.xl,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xl,
  flexWrap: "wrap",
  gap: spacing.md,
};

const title = {
  ...typography.h1,
  color: colors.text.primary,
  margin: "0 0 8px 0",
};

const subtitle = {
  color: colors.text.secondary,
  fontSize: "16px",
  margin: 0,
};

const addButton = {
  padding: "14px 28px",
  background: colors.primary.gradient,
  color: colors.white,
  border: "none",
  borderRadius: borderRadius.lg,
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: shadows.md,
  transition: "all 0.3s",
};

const remindersGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
  gap: spacing.lg,
};

const reminderCard = {
  background: colors.white,
  borderRadius: borderRadius.xl,
  padding: spacing.lg,
  boxShadow: shadows.md,
  transition: "all 0.3s",
  border: `1px solid ${colors.light.main}`,
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: spacing.md,
  paddingBottom: spacing.md,
  borderBottom: `2px solid ${colors.light.main}`,
};

const cardTitle = {
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
};

const cardIcon = {
  fontSize: "32px",
};

const cardName = {
  fontSize: "18px",
  fontWeight: "700",
  color: colors.text.primary,
  marginBottom: "4px",
  textTransform: "capitalize",
};

const cardCategory = {
  fontSize: "13px",
  color: colors.text.secondary,
  fontWeight: "500",
};

const cardAmount = {
  fontSize: "24px",
  fontWeight: "800",
  background: colors.primary.gradient,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const cardBody = {
  display: "grid",
  gap: spacing.md,
  marginBottom: spacing.md,
};

const dateSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: spacing.sm,
  background: colors.light.bg,
  borderRadius: borderRadius.md,
};

const dateLabel = {
  fontSize: "13px",
  color: colors.text.secondary,
  fontWeight: "600",
};

const dateValue = {
  fontSize: "14px",
  color: colors.text.primary,
  fontWeight: "700",
};

const daysUntilBadge = {
  padding: "10px 14px",
  borderRadius: borderRadius.md,
  fontSize: "14px",
  fontWeight: "700",
  textAlign: "center",
};

const notificationSettings = {
  display: "grid",
  gap: spacing.xs,
};

const settingsLabel = {
  fontSize: "12px",
  color: colors.text.secondary,
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const notifChips = {
  display: "flex",
  flexWrap: "wrap",
  gap: spacing.xs,
};

const notifChip = {
  padding: "5px 12px",
  background: colors.success.light,
  color: colors.success.main,
  borderRadius: borderRadius.full,
  fontSize: "11px",
  fontWeight: "600",
};

const autoPayBadge = {
  padding: "10px 14px",
  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  color: colors.white,
  borderRadius: borderRadius.md,
  fontSize: "13px",
  fontWeight: "700",
  textAlign: "center",
};

const cardActions = {
  display: "flex",
  gap: spacing.sm,
};

const markPaidButton = {
  flex: 1,
  padding: "12px",
  background: colors.success.gradient,
  color: colors.white,
  border: "none",
  borderRadius: borderRadius.md,
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.3s",
};

const deleteButton = {
  padding: "12px 16px",
  background: colors.light.bg,
  color: colors.danger.main,
  border: `2px solid ${colors.light.main}`,
  borderRadius: borderRadius.md,
  fontSize: "18px",
  cursor: "pointer",
  transition: "all 0.3s",
  fontWeight: "700",
};

const emptyState = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: spacing.xxl,
  background: colors.white,
  borderRadius: borderRadius.xl,
  boxShadow: shadows.sm,
};

const emptyIcon = {
  fontSize: "80px",
  display: "block",
  marginBottom: spacing.lg,
};

const emptyTitle = {
  ...typography.h3,
  color: colors.text.primary,
  marginBottom: spacing.sm,
};

const emptyText = {
  color: colors.text.secondary,
  fontSize: "16px",
  marginBottom: spacing.lg,
};

const emptyButton = {
  padding: "14px 28px",
  background: colors.primary.gradient,
  color: colors.white,
  border: "none",
  borderRadius: borderRadius.lg,
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: shadows.md,
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: spacing.lg,
};

const modalContent = {
  background: colors.white,
  borderRadius: borderRadius.xl,
  maxWidth: "550px",
  width: "100%",
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: shadows.xl,
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: spacing.lg,
  borderBottom: `2px solid ${colors.light.main}`,
};

const modalTitle = {
  ...typography.h3,
  color: colors.text.primary,
  margin: 0,
};

const closeButton = {
  width: "36px",
  height: "36px",
  border: "none",
  background: colors.light.bg,
  borderRadius: borderRadius.full,
  fontSize: "20px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  color: colors.text.secondary,
  transition: "all 0.3s",
};

const modalForm = {
  padding: spacing.lg,
  display: "grid",
  gap: spacing.md,
};

const formGroup = {
  display: "grid",
  gap: spacing.xs,
};

const formRow = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr",
  gap: spacing.md,
};

const formLabel = {
  fontSize: "14px",
  fontWeight: "700",
  color: colors.text.primary,
  marginBottom: "4px",
};

const formInput = {
  padding: "12px 16px",
  border: `2px solid ${colors.light.main}`,
  borderRadius: borderRadius.md,
  fontSize: "15px",
  outline: "none",
  transition: "all 0.3s",
  fontFamily: "inherit",
};

const formSelect = {
  padding: "12px 16px",
  border: `2px solid ${colors.light.main}`,
  borderRadius: borderRadius.md,
  fontSize: "15px",
  outline: "none",
  transition: "all 0.3s",
  fontFamily: "inherit",
  cursor: "pointer",
  background: colors.white,
};

const checkboxGroup = {
  display: "grid",
  gap: spacing.sm,
  padding: spacing.sm,
  background: colors.light.bg,
  borderRadius: borderRadius.md,
};

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: spacing.sm,
  fontSize: "14px",
  color: colors.text.primary,
  cursor: "pointer",
  fontWeight: "500",
};

const submitButton = {
  padding: "16px",
  background: colors.primary.gradient,
  color: colors.white,
  border: "none",
  borderRadius: borderRadius.md,
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: shadows.md,
  marginTop: spacing.sm,
  transition: "all 0.3s",
};

const errorMessage = {
  padding: spacing.md,
  background: "#fee",
  border: "2px solid #fcc",
  borderRadius: borderRadius.md,
  color: "#c33",
  fontSize: "14px",
  fontWeight: "500",
};