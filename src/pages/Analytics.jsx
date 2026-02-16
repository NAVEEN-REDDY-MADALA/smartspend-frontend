import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [expenses, setExpenses] = useState([]);
  const [history, setHistory] = useState({});
  const [prediction, setPrediction] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    } else {
      load();
    }
  }, []);

  async function load() {
    try {
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/expenses/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        navigate("/", { replace: true });
        return;
      }

      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setExpenses(arr);

      // Monthly aggregation
      const monthly = {};
      arr.forEach(e => {
        if (!e.date) return;
        const m = e.date.slice(0, 7);
        monthly[m] = (monthly[m] || 0) + e.amount;
      });
      setHistory(monthly);

      // Simple prediction
      const total = arr.reduce((sum, e) => sum + e.amount, 0);
      setPrediction(total * 1.12);

    } catch (err) {
      console.error("Analytics load failed", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={loadingContainer}>
          <div style={spinner}></div>
          <p>Loading analytics...</p>
        </div>
      </>
    );
  }

  /* ---------- DATA PREP ---------- */
  const months = Object.keys(history).sort();
  const monthValues = months.map(m => history[m]);

  const categoryTotals = {};
  expenses.forEach(e => {
    if (!e.category) return;
    const normalized = e.category.charAt(0).toUpperCase() + e.category.slice(1).toLowerCase();
    categoryTotals[normalized] = (categoryTotals[normalized] || 0) + e.amount;
  });

  const currentMonth = months[months.length - 1] || null;
  const previousMonth = months[months.length - 2] || null;
  const last = currentMonth ? history[currentMonth] : 0;
  const prev = previousMonth ? history[previousMonth] : 0;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgPerMonth = months.length > 0 ? totalSpent / months.length : 0;
  const trend = prev > 0 ? ((last - prev) / prev * 100) : 0;

  /* ---------- CHART CONFIGS ---------- */

  // Line Chart - Spending Trend
  const lineData = {
    labels: months,
    datasets: [{
      label: "Monthly Spend",
      data: monthValues,
      borderColor: "#667eea",
      backgroundColor: "rgba(102, 126, 234, 0.1)",
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 5,
      pointBackgroundColor: "#667eea",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointHoverRadius: 7
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => '₹' + context.parsed.y.toLocaleString()
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value) => '₹' + value.toLocaleString()
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Doughnut Chart - Category Distribution
  const categoryColors = [
    "#667eea", "#764ba2", "#f093fb", "#4facfe",
    "#43e97b", "#fa709a", "#fee140", "#30cfd0",
    "#a8edea", "#fed6e3", "#c471f5", "#12c2e9"
  ];

  const categoryLabels = Object.keys(categoryTotals).sort();
  const categoryData = categoryLabels.map(label => categoryTotals[label]);

  const doughnutData = {
    labels: categoryLabels,
    datasets: [{
      data: categoryData,
      backgroundColor: categoryLabels.map((_, i) => categoryColors[i % categoryColors.length]),
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Bar Chart - Month Comparison
  const barData = {
    labels: previousMonth ? [previousMonth, currentMonth] : currentMonth ? [currentMonth] : [],
    datasets: [{
      label: "Monthly Spend",
      data: previousMonth ? [prev, last] : currentMonth ? [last] : [],
      backgroundColor: previousMonth 
        ? ["rgba(102, 126, 234, 0.6)", "rgba(102, 126, 234, 1)"]
        : ["rgba(102, 126, 234, 1)"],
      borderRadius: 8,
      borderWidth: 0
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => '₹' + context.parsed.y.toLocaleString()
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: (value) => '₹' + value.toLocaleString()
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div>
      <Navbar />

      <div style={container}>
        {/* Header */}
        <div style={header}>
          <div>
            <h1 style={title}>📊 Analytics & Insights</h1>
            <p style={subtitle}>Smart analysis of your spending patterns</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={kpiGrid}>
          <KPICard
            icon="💰"
            title="Total Spent"
            value={`₹${totalSpent.toLocaleString()}`}
            subtitle="All time"
            color="#667eea"
          />
          <KPICard
            icon="📅"
            title="This Month"
            value={`₹${last.toLocaleString()}`}
            subtitle={trend > 0 ? `+${trend.toFixed(1)}% from last month` : trend < 0 ? `${trend.toFixed(1)}% from last month` : "No change"}
            color={trend > 0 ? "#f093fb" : trend < 0 ? "#43e97b" : "#667eea"}
          />
          <KPICard
            icon="📈"
            title="Avg/Month"
            value={`₹${Math.round(avgPerMonth).toLocaleString()}`}
            subtitle={`Over ${months.length} months`}
            color="#4facfe"
          />
          <KPICard
            icon="🔮"
            title="Next Month"
            value={`₹${Math.round(prediction).toLocaleString()}`}
            subtitle="AI Prediction"
            color="#fa709a"
          />
        </div>

        {/* Insights Cards */}
        {categoryLabels.length > 0 && (
          <div style={insightsGrid}>
            <InsightCard
              icon="🎯"
              title="Top Spending Category"
              content={
                <div>
                  <div style={insightValue}>{categoryLabels[0]}</div>
                  <div style={insightSubtext}>₹{categoryData[0].toLocaleString()} spent</div>
                </div>
              }
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
            
            <InsightCard
              icon="📊"
              title="Spending Trend"
              content={
                <div>
                  <div style={insightValue}>
                    {trend > 0 ? "Increasing" : trend < 0 ? "Decreasing" : "Stable"}
                  </div>
                  <div style={insightSubtext}>
                    {trend !== 0 ? `${Math.abs(trend).toFixed(1)}% vs last month` : "No change"}
                  </div>
                </div>
              }
              gradient={trend > 0 
                ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"}
            />

            <InsightCard
              icon="💡"
              title="Smart Tip"
              content={
                <div>
                  <div style={{...insightValue, fontSize: '16px'}}>
                    {trend > 10 
                      ? "Spending is rising quickly"
                      : avgPerMonth > 50000
                      ? "Set a monthly budget goal"
                      : "Great job managing expenses!"}
                  </div>
                </div>
              }
              gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            />
          </div>
        )}

        {/* Charts Grid */}
        <div style={chartsGrid}>
          <ChartCard title="📈 Spending Trend" span={2}>
            {months.length > 0 ? (
              <Line data={lineData} options={lineOptions} />
            ) : (
              <EmptyState message="No spending data yet" />
            )}
          </ChartCard>

          <ChartCard title="🎯 Category Breakdown">
            {categoryLabels.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <EmptyState message="No categories yet" />
            )}
          </ChartCard>

          <ChartCard title="📊 Month Comparison">
            {barData.labels.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <EmptyState message="Need 2 months of data" />
            )}
          </ChartCard>
        </div>

        {/* Top Categories List */}
        {categoryLabels.length > 0 && (
          <div style={listCard}>
            <h3 style={listTitle}>🏆 Top Spending Categories</h3>
            <div style={categoryList}>
              {categoryLabels.slice(0, 5).map((cat, i) => (
                <CategoryItem
                  key={cat}
                  rank={i + 1}
                  category={cat}
                  amount={categoryTotals[cat]}
                  percentage={(categoryTotals[cat] / totalSpent * 100).toFixed(1)}
                  color={categoryColors[i % categoryColors.length]}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function KPICard({ icon, title, value, subtitle, color }) {
  return (
    <div style={{...kpiCard, borderLeft: `4px solid ${color}`}}>
      <div style={kpiIcon}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={kpiTitle}>{title}</div>
        <div style={{...kpiValue, color}}>{value}</div>
        <div style={kpiSubtitle}>{subtitle}</div>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, content, gradient }) {
  return (
    <div style={{...insightCard, background: gradient}}>
      <div style={insightIcon}>{icon}</div>
      <div style={insightTitle}>{title}</div>
      {content}
    </div>
  );
}

function ChartCard({ title, children, span = 1 }) {
  return (
    <div style={{...chartCard, gridColumn: span > 1 ? `span ${span}` : 'auto'}}>
      <h3 style={chartTitle}>{title}</h3>
      <div style={{ height: 300 }}>{children}</div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={emptyState}>
      <div style={emptyIcon}>📊</div>
      <p>{message}</p>
    </div>
  );
}

function CategoryItem({ rank, category, amount, percentage, color }) {
  return (
    <div style={categoryItem}>
      <div style={{...rankBadge, background: color}}>{rank}</div>
      <div style={categoryInfo}>
        <div style={categoryName}>{category}</div>
        <div style={categoryBar}>
          <div style={{...categoryBarFill, width: `${percentage}%`, background: color}}></div>
        </div>
      </div>
      <div style={categoryStats}>
        <div style={categoryAmount}>₹{amount.toLocaleString()}</div>
        <div style={categoryPercent}>{percentage}%</div>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const container = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '40px 24px'
};

const header = {
  marginBottom: '32px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const title = {
  fontSize: '32px',
  fontWeight: '700',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: '8px'
};

const subtitle = {
  color: '#666',
  fontSize: '16px'
};

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '20px',
  marginBottom: '32px'
};

const kpiCard = {
  background: 'white',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  animation: 'fadeIn 0.5s ease'
};

const kpiIcon = {
  fontSize: '32px'
};

const kpiTitle = {
  fontSize: '13px',
  color: '#999',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '4px'
};

const kpiValue = {
  fontSize: '28px',
  fontWeight: '700',
  marginBottom: '4px'
};

const kpiSubtitle = {
  fontSize: '13px',
  color: '#666'
};

const insightsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  marginBottom: '32px'
};

const insightCard = {
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  color: 'white',
  animation: 'fadeIn 0.5s ease',
  transition: 'transform 0.3s ease',
  cursor: 'pointer'
};

const insightIcon = {
  fontSize: '32px',
  marginBottom: '12px'
};

const insightTitle = {
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '12px',
  opacity: 0.9,
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const insightValue = {
  fontSize: '24px',
  fontWeight: '700',
  marginBottom: '4px'
};

const insightSubtext = {
  fontSize: '14px',
  opacity: 0.9
};

const chartsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '24px',
  marginBottom: '32px'
};

const chartCard = {
  background: 'white',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  animation: 'fadeIn 0.5s ease'
};

const chartTitle = {
  fontSize: '18px',
  fontWeight: '600',
  marginBottom: '20px',
  color: '#333'
};

const emptyState = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#999'
};

const emptyIcon = {
  fontSize: '48px',
  marginBottom: '12px',
  opacity: 0.5
};

const listCard = {
  background: 'white',
  padding: '32px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  animation: 'fadeIn 0.5s ease'
};

const listTitle = {
  fontSize: '20px',
  fontWeight: '600',
  marginBottom: '24px',
  color: '#333'
};

const categoryList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const categoryItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  background: '#f8f9fa',
  borderRadius: '12px',
  transition: 'all 0.3s ease'
};

const rankBadge = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: '700',
  fontSize: '16px'
};

const categoryInfo = {
  flex: 1
};

const categoryName = {
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '8px',
  color: '#333'
};

const categoryBar = {
  height: '8px',
  background: '#e0e0e0',
  borderRadius: '4px',
  overflow: 'hidden'
};

const categoryBarFill = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 1s ease'
};

const categoryStats = {
  textAlign: 'right'
};

const categoryAmount = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#333',
  marginBottom: '4px'
};

const categoryPercent = {
  fontSize: '14px',
  color: '#666'
};

const loadingContainer = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '80vh',
  gap: '16px'
};

const spinner = {
  width: '48px',
  height: '48px',
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #667eea',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};