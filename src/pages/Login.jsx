import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --accent:   #7c5cbf;
    --accent2:  #a78bfa;
    --bg:       #f7f7f8;
    --surface:  #ffffff;
    --border:   #e5e7eb;
    --ink:      #111827;
    --ink2:     #374151;
    --ink3:     #6b7280;
    --red:      #dc2626;
    --red-bg:   #fef2f2;
    --green:    #059669;
  }
  html, body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; height: 100%; }
  #root { height: 100%; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  .card { animation: fadeIn .4s ease both; }
  .inp { width:100%; padding:10px 13px; border-radius:8px; border:1.5px solid var(--border); font-size:14px; font-family:inherit; color:var(--ink); outline:none; background:var(--surface); transition:border-color .15s, box-shadow .15s; }
  .inp:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(124,92,191,.1); }
  .inp::placeholder { color: #c4c4c4; }
  .btn { transition: opacity .15s, transform .1s; }
  .btn:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
  .btn:active:not(:disabled) { transform:translateY(0); }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__login__")) return;
  const s = document.createElement("style"); s.id = "__login__"; s.textContent = CSS;
  document.head.appendChild(s);
}

export default function Login() {
  injectCSS();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  // ── If already logged in, go straight to dashboard ──────────────────────────
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("https://smartspend-backend-aupt.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Wrong email or password. Try again.");
        return;
      }

      // Persist token — stays until explicit logout
      localStorage.setItem("token", data.access_token);
      navigate("/dashboard", { replace: true });

    } catch {
      setMessage("Can't reach the server. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #2d1b69 0%, #1e1145 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div className="card" style={{
        width: "100%",
        maxWidth: 400,
        background: "var(--surface)",
        borderRadius: 16,
        boxShadow: "0 24px 64px rgba(0,0,0,.25)",
        overflow: "hidden",
      }}>

        {/* Top accent bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #7c5cbf, #a78bfa)" }} />

        <div style={{ padding: "36px 32px 32px" }}>

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "linear-gradient(135deg,#7c5cbf,#a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, color: "#fff",
              margin: "0 auto 14px",
            }}>S</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
              Welcome back 👋
            </div>
            <div style={{ fontSize: 13, color: "var(--ink3)" }}>
              Log in to SmartSpend — your student finance tracker
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--ink2)", display: "block", marginBottom: 5 }}>
                Your email address
              </label>
              <input
                type="email" required
                placeholder="you@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="inp"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--ink2)", display: "block", marginBottom: 5 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"} required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="inp"
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 15, color: "var(--ink3)", padding: 2,
                  }}
                  title={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {message && (
              <div style={{
                marginBottom: 16, padding: "10px 13px", borderRadius: 8,
                background: "var(--red-bg)", color: "var(--red)",
                border: "1px solid #fecaca", fontSize: 13,
              }}>
                ⚠️ {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="btn"
              style={{
                width: "100%", padding: "11px", borderRadius: 8,
                background: loading ? "#e5e7eb" : "linear-gradient(135deg,#7c5cbf,#a78bfa)",
                border: "none",
                color: loading ? "var(--ink3)" : "#fff",
                fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading && (
                <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
              )}
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          {/* Footer note */}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--ink3)" }}>
            You'll stay logged in until you sign out.<br />
            Don't have an account? Ask your admin to create one.
          </div>
        </div>
      </div>
    </div>
  );
}