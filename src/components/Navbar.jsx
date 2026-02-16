// src/components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";
import { colors, shadows, borderRadius, spacing } from "../styles/theme";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav style={navContainer}>
      <div style={navContent}>
        {/* Logo */}
        <div style={logo} onClick={() => navigate("/dashboard")}>
          <span style={logoIcon}>💰</span>
          <span style={logoText}>SmartSpend</span>
        </div>

        {/* Navigation Links */}
        <div style={navLinks}>
          <Link to="/dashboard" style={navLink}>
            <span style={navLinkIcon}>📊</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/transactions" style={navLink}>
            {/* <span style={navLinkIcon}>💸</span> */}
            {/* <span>Transactions</span> */}
          </Link>
          <Link to="/reminders" style={navLink}>
            <span style={navLinkIcon}>🔔</span>
            <span>Reminders</span>
          </Link>
          <Link to="/goals" style={navLink}>
            {/* <span style={navLinkIcon}>🎯</span> */}
            {/* <span>Goals</span> */}
          </Link>
          <Link to="/analytics" style={navLink}>
            {/* <span style={navLinkIcon}>📈</span> */}
            {/* <span>Analytics</span> */}
          </Link>
          <Link to="/detected-transactions" style={navLink}>
            <span style={navLinkIcon}>🔍</span>
            <span>Detected</span>
          </Link>
        </div>

        {/* Right Section */}
        <div style={navRight}>
          {/* <button style={addButton} onClick={() => navigate("/add-expense")}> */}
            {/* <span style={addIcon}>+</span> Add Expense */}
          {/* </button> */}
          <button style={logoutButton} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ============= STYLES ============= */

const navContainer = {
  background: colors.white,
  boxShadow: shadows.md,
  position: "sticky",
  top: 0,
  zIndex: 1000,
  borderBottom: "1px solid rgba(0,0,0,0.05)",
};

const navContent = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "16px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.lg,
};

const logo = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  transition: "transform 0.2s",
};

const logoIcon = {
  fontSize: "28px",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "800",
  background: colors.primary.gradient,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const navLinks = {
  display: "flex",
  gap: spacing.sm,
  flex: 1,
  justifyContent: "center",
};

const navLink = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 18px",
  borderRadius: borderRadius.lg,
  cursor: "pointer",
  transition: "all 0.3s",
  color: colors.text.secondary,
  fontWeight: "500",
  fontSize: "14px",
  textDecoration: "none",
};

const navLinkIcon = {
  fontSize: "18px",
};

const navRight = {
  display: "flex",
  gap: spacing.sm,
  alignItems: "center",
};

const addButton = {
  padding: "10px 20px",
  background: colors.success.gradient,
  color: colors.white,
  border: "none",
  borderRadius: borderRadius.lg,
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  boxShadow: shadows.sm,
  transition: "all 0.3s",
};

// const addIcon = {
//   fontSize: "20px",
//   fontWeight: "700",
// };

const logoutButton = {
  padding: "10px 20px",
  background: "transparent",
  color: colors.text.secondary,
  border: `2px solid ${colors.light.main}`,
  borderRadius: borderRadius.lg,
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s",
};