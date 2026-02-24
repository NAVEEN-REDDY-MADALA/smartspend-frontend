import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
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
    --green-bg: #f0fdf4;
    --yellow-bg:#fffbeb;
    --yellow:   #d97706;
  }
  html, body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; height: 100%; }
  #root { height: 100%; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  .card      { animation: fadeIn .45s cubic-bezier(.22,1,.36,1) both; }
  .slide-in  { animation: fadeIn .3s cubic-bezier(.22,1,.36,1) both; }
  .inp { width:100%; padding:11px 14px; border-radius:10px; border:1.5px solid var(--border); font-size:14px; font-family:inherit; color:var(--ink); outline:none; background:var(--surface); transition:border-color .15s, box-shadow .15s; }
  .inp:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(124,92,191,.12); }
  .inp::placeholder { color:#c4c4c4; }
  .inp.error { border-color:var(--red); box-shadow:0 0 0 3px rgba(220,38,38,.08); }
  .btn { transition: opacity .15s, transform .1s, box-shadow .15s; cursor:pointer; }
  .btn:hover:not(:disabled) { opacity:.92; transform:translateY(-1px); box-shadow:0 6px 20px rgba(124,92,191,.3); }
  .btn:active:not(:disabled) { transform:translateY(0); box-shadow:none; }
  .btn:disabled { cursor:not-allowed; }
  .tab-btn { flex:1; padding:9px; border:none; background:transparent; font-family:inherit; font-size:13px; font-weight:600; color:var(--ink3); cursor:pointer; border-radius:8px; transition:all .2s; }
  .tab-btn.active { background:white; color:var(--accent); box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .link-btn { background:none; border:none; font-family:inherit; font-size:13px; color:var(--accent); cursor:pointer; font-weight:600; padding:0; text-decoration:underline; text-underline-offset:2px; transition:opacity .15s; }
  .link-btn:hover { opacity:.7; }
  .alert { padding:10px 13px; border-radius:9px; font-size:13px; line-height:1.5; animation:fadeIn .25s ease both; }
  .alert.error   { background:var(--red-bg);    color:var(--red);    border:1px solid #fecaca; }
  .alert.success { background:var(--green-bg);  color:var(--green);  border:1px solid #bbf7d0; }
  .alert.info    { background:var(--yellow-bg); color:var(--yellow); border:1px solid #fde68a; }
  .otp-box { width:100%; text-align:center; font-size:28px; font-weight:800; letter-spacing:8px; padding:14px; border-radius:10px; border:2px dashed var(--accent); background:#faf5ff; color:var(--accent); font-family:monospace; }
  .strength-bar { height:3px; border-radius:99px; transition:width .3s, background .3s; }
`;

function injectCSS() {
  if (typeof document === "undefined" || document.getElementById("__auth__")) return;
  const s = document.createElement("style"); s.id = "__auth__"; s.textContent = CSS;
  document.head.appendChild(s);
}

const API = "https://smartspend-backend-aupt.onrender.com/api/auth";
const lbl = { fontSize:12, fontWeight:600, color:"var(--ink2)", display:"block", marginBottom:5 };

function primaryBtn(loading, disabled) {
  return {
    width:"100%", padding:"12px", borderRadius:10,
    background: (loading || disabled) ? "#e5e7eb" : "linear-gradient(135deg,#7c5cbf,#a78bfa)",
    border:"none", color: (loading || disabled) ? "var(--ink3)" : "#fff",
    fontSize:14, fontWeight:700, fontFamily:"inherit",
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
  };
}

function Spinner() {
  return <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }} />;
}

function PasswordInput({ value, onChange, placeholder="••••••••", autoComplete, hasError }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <input type={show?"text":"password"} required placeholder={placeholder}
        value={value} onChange={onChange} className={`inp${hasError?" error":""}`}
        autoComplete={autoComplete} style={{ paddingRight:44 }} />
      <button type="button" onClick={() => setShow(v=>!v)} style={{
        position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
        background:"none", border:"none", cursor:"pointer", fontSize:15, color:"var(--ink3)", padding:2,
      }}>{show?"🙈":"👁️"}</button>
    </div>
  );
}

function getStrength(pw) {
  if (!pw) return { label:"", color:"transparent", w:"0%" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return [
    { label:"",       color:"transparent", w:"0%"   },
    { label:"Weak",   color:"#ef4444",     w:"25%"  },
    { label:"Fair",   color:"#f97316",     w:"50%"  },
    { label:"Good",   color:"#eab308",     w:"75%"  },
    { label:"Strong", color:"#22c55e",     w:"100%" },
  ][s];
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════════════
function LoginForm({ onForgot }) {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg]           = useState("");
  const [loading, setLoading]   = useState(false);

  async function handle(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setMsg("");
    try {
      const res  = await fetch(`${API}/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password}) });
      const data = await res.json();
      if (!res.ok) { setMsg(data.detail || "Wrong email or password."); return; }
      localStorage.setItem("token", data.access_token);
      navigate("/dashboard", { replace:true });
    } catch { setMsg("Can't reach the server. Check your internet."); }
    finally  { setLoading(false); }
  }

  return (
    <form onSubmit={handle} className="slide-in">
      <div style={{marginBottom:14}}>
        <label style={lbl}>Email address</label>
        <input type="email" required placeholder="you@college.edu" value={email} onChange={e=>setEmail(e.target.value)} className="inp" autoComplete="email" />
      </div>
      <div style={{marginBottom:6}}>
        <label style={lbl}>Password</label>
        <PasswordInput value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" />
      </div>
      <div style={{textAlign:"right", marginBottom:18}}>
        <button type="button" className="link-btn" onClick={onForgot}>Forgot password?</button>
      </div>
      {msg && <div className="alert error" style={{marginBottom:14}}>⚠️ {msg}</div>}
      <button type="submit" disabled={loading} className="btn" style={primaryBtn(loading)}>
        {loading && <Spinner />}{loading ? "Logging in…" : "Log in →"}
      </button>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REGISTER
// ══════════════════════════════════════════════════════════════════════════════
function RegisterForm({ onSuccess }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [msg, setMsg]           = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  const strength = getStrength(password);
  const mismatch = confirm && password !== confirm;

  async function handle(e) {
    e.preventDefault();
    if (loading) return;
    if (password !== confirm) { setMsg("Passwords don't match."); return; }
    if (password.length < 6)  { setMsg("Password must be at least 6 characters."); return; }
    setLoading(true); setMsg(""); setSuccess("");
    try {
      const res  = await fetch(`${API}/register`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name,email,password}) });
      const data = await res.json();
      if (!res.ok) { setMsg(data.detail || "Registration failed."); return; }
      setSuccess("🎉 Account created! You can now log in.");
      setTimeout(() => onSuccess(), 1800);
    } catch { setMsg("Can't reach the server. Check your internet."); }
    finally  { setLoading(false); }
  }

  return (
    <form onSubmit={handle} className="slide-in">
      <div style={{marginBottom:13}}>
        <label style={lbl}>Full name</label>
        <input type="text" required placeholder="Rahul Kumar" value={name} onChange={e=>setName(e.target.value)} className="inp" autoComplete="name" />
      </div>
      <div style={{marginBottom:13}}>
        <label style={lbl}>College email</label>
        <input type="email" required placeholder="you@college.edu" value={email} onChange={e=>setEmail(e.target.value)} className="inp" autoComplete="email" />
      </div>
      <div style={{marginBottom:6}}>
        <label style={lbl}>Create password</label>
        <PasswordInput value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" />
        {password && (
          <div style={{marginTop:6}}>
            <div style={{height:3, background:"#f3f4f6", borderRadius:99, overflow:"hidden"}}>
              <div className="strength-bar" style={{width:strength.w, background:strength.color}} />
            </div>
            <span style={{fontSize:11, color:strength.color, fontWeight:600}}>{strength.label}</span>
          </div>
        )}
      </div>
      <div style={{marginBottom:18}}>
        <label style={lbl}>Confirm password</label>
        <PasswordInput value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter password" autoComplete="new-password" hasError={mismatch} />
        {mismatch && <span style={{fontSize:11, color:"var(--red)", marginTop:3, display:"block"}}>Passwords don't match</span>}
      </div>
      {msg     && <div className="alert error"   style={{marginBottom:14}}>⚠️ {msg}</div>}
      {success && <div className="alert success" style={{marginBottom:14}}>{success}</div>}
      <button type="submit" disabled={loading || !!mismatch} className="btn" style={primaryBtn(loading, !!mismatch)}>
        {loading && <Spinner />}{loading ? "Creating account…" : "Create account →"}
      </button>
      <p style={{fontSize:11, color:"var(--ink3)", textAlign:"center", marginTop:12, lineHeight:1.6}}>
        🔒 Your data is private & secure. We never share your info.
      </p>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD — 3 steps: Email → OTP → New Password
// ══════════════════════════════════════════════════════════════════════════════
function ForgotForm({ onBack }) {
  const [step, setStep]         = useState(1); // 1=email, 2=otp, 3=newpass
  const [email, setEmail]       = useState("");
  const [otpDisplay, setOtpDisplay] = useState(""); // OTP shown from API
  const [otpInput, setOtpInput] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPass, setNewPass]   = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg]           = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  const mismatch = confirmPass && newPass !== confirmPass;

  // ── Step 1: Request OTP ────────────────────────────────────────────────────
  async function handleRequestOTP(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setMsg(""); setSuccess("");
    try {
      const res  = await fetch(`${API}/forgot-password`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email}) });
      const data = await res.json();
      if (!res.ok) { setMsg(data.detail || "Email not found."); return; }
      setOtpDisplay(data.otp); // Show OTP in UI since no email service
      setStep(2);
    } catch { setMsg("Can't reach the server. Check your internet."); }
    finally  { setLoading(false); }
  }

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  async function handleVerifyOTP(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setMsg("");
    try {
      const res  = await fetch(`${API}/verify-otp`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email, otp:otpInput}) });
      const data = await res.json();
      if (!res.ok) { setMsg(data.detail || "Invalid or expired OTP."); return; }
      setResetToken(data.reset_token);
      setStep(3);
    } catch { setMsg("Can't reach the server."); }
    finally  { setLoading(false); }
  }

  // ── Step 3: Reset Password ─────────────────────────────────────────────────
  async function handleReset(e) {
    e.preventDefault();
    if (loading) return;
    if (newPass !== confirmPass) { setMsg("Passwords don't match."); return; }
    if (newPass.length < 6)     { setMsg("Password must be at least 6 characters."); return; }
    setLoading(true); setMsg(""); setSuccess("");
    try {
      const res  = await fetch(`${API}/reset-password`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({reset_token:resetToken, new_password:newPass}) });
      const data = await res.json();
      if (!res.ok) { setMsg(data.detail || "Reset failed. Try again."); return; }
      setSuccess("✅ Password changed! Redirecting to login…");
      setTimeout(() => onBack(), 2000);
    } catch { setMsg("Can't reach the server."); }
    finally  { setLoading(false); }
  }

  const stepLabels = ["Enter Email", "Verify OTP", "New Password"];

  return (
    <div className="slide-in">
      {/* Back */}
      <button type="button" onClick={onBack} style={{
        background:"none", border:"none", cursor:"pointer", color:"var(--ink3)",
        fontSize:13, fontWeight:500, display:"flex", alignItems:"center",
        gap:4, marginBottom:18, padding:0, fontFamily:"inherit",
      }}>← Back to login</button>

      {/* Step indicator */}
      <div style={{ display:"flex", gap:6, marginBottom:22, alignItems:"center" }}>
        {stepLabels.map((label, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:6, flex: i<2 ? "1" : "none" }}>
            <div style={{
              width:24, height:24, borderRadius:"50%", fontSize:11, fontWeight:700,
              display:"flex", alignItems:"center", justifyContent:"center",
              background: step > i+1 ? "var(--green)" : step === i+1 ? "var(--accent)" : "#e5e7eb",
              color: step >= i+1 ? "#fff" : "var(--ink3)",
              transition:"all .3s", flexShrink:0,
            }}>
              {step > i+1 ? "✓" : i+1}
            </div>
            <span style={{ fontSize:11, fontWeight:600, color: step === i+1 ? "var(--accent)" : "var(--ink3)" }}>
              {label}
            </span>
            {i < 2 && <div style={{ flex:1, height:2, background: step > i+1 ? "var(--green)" : "#e5e7eb", borderRadius:99, transition:"background .3s" }} />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Email ── */}
      {step === 1 && (
        <form onSubmit={handleRequestOTP}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Forgot your password? 🔑</div>
          <p style={{ fontSize:13, color:"var(--ink3)", marginBottom:18, lineHeight:1.6 }}>
            Enter your registered email. We'll generate a 6-digit OTP for you.
          </p>
          <div style={{marginBottom:18}}>
            <label style={lbl}>Registered email</label>
            <input type="email" required placeholder="you@college.edu" value={email} onChange={e=>setEmail(e.target.value)} className="inp" autoComplete="email" />
          </div>
          {msg && <div className="alert error" style={{marginBottom:14}}>⚠️ {msg}</div>}
          <button type="submit" disabled={loading} className="btn" style={primaryBtn(loading)}>
            {loading && <Spinner />}{loading ? "Checking…" : "Get OTP →"}
          </button>
        </form>
      )}

      {/* ── STEP 2: OTP ── */}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Enter your OTP 🔢</div>
          <p style={{ fontSize:13, color:"var(--ink3)", marginBottom:16, lineHeight:1.6 }}>
            Your one-time password for <strong>{email}</strong>:
          </p>

          {/* Show OTP clearly since no email service */}
          <div style={{ marginBottom:18, textAlign:"center" }}>
            <p style={{ fontSize:11, color:"var(--ink3)", marginBottom:8, fontWeight:600 }}>YOUR OTP CODE</p>
            <div className="otp-box">{otpDisplay}</div>
            <p style={{ fontSize:11, color:"var(--ink3)", marginTop:6 }}>⏱ Valid for 10 minutes</p>
          </div>

          <div style={{marginBottom:18}}>
            <label style={lbl}>Enter OTP above</label>
            <input type="text" required placeholder="______" value={otpInput}
              onChange={e=>setOtpInput(e.target.value.replace(/\D/g,"").slice(0,6))}
              className="inp" maxLength={6} inputMode="numeric"
              style={{ textAlign:"center", fontSize:20, fontWeight:700, letterSpacing:6 }} />
          </div>

          {msg && <div className="alert error" style={{marginBottom:14}}>⚠️ {msg}</div>}

          <button type="submit" disabled={loading || otpInput.length < 6} className="btn" style={primaryBtn(loading, otpInput.length < 6)}>
            {loading && <Spinner />}{loading ? "Verifying…" : "Verify OTP →"}
          </button>

          <div style={{ textAlign:"center", marginTop:12 }}>
            <button type="button" className="link-btn" style={{fontSize:12}} onClick={() => { setStep(1); setMsg(""); setOtpInput(""); }}>
              Resend OTP
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 3: New Password ── */}
      {step === 3 && (
        <form onSubmit={handleReset}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Set new password 🔐</div>
          <p style={{ fontSize:13, color:"var(--ink3)", marginBottom:18, lineHeight:1.6 }}>
            Choose a strong password for your account.
          </p>
          <div style={{marginBottom:13}}>
            <label style={lbl}>New password</label>
            <PasswordInput value={newPass} onChange={e=>setNewPass(e.target.value)} autoComplete="new-password" />
            {newPass && (
              <div style={{marginTop:6}}>
                <div style={{height:3, background:"#f3f4f6", borderRadius:99, overflow:"hidden"}}>
                  <div className="strength-bar" style={{width:getStrength(newPass).w, background:getStrength(newPass).color}} />
                </div>
                <span style={{fontSize:11, color:getStrength(newPass).color, fontWeight:600}}>{getStrength(newPass).label}</span>
              </div>
            )}
          </div>
          <div style={{marginBottom:18}}>
            <label style={lbl}>Confirm new password</label>
            <PasswordInput value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} placeholder="Re-enter password" autoComplete="new-password" hasError={mismatch} />
            {mismatch && <span style={{fontSize:11, color:"var(--red)", marginTop:3, display:"block"}}>Passwords don't match</span>}
          </div>
          {msg     && <div className="alert error"   style={{marginBottom:14}}>⚠️ {msg}</div>}
          {success && <div className="alert success" style={{marginBottom:14}}>{success}</div>}
          <button type="submit" disabled={loading || !!mismatch} className="btn" style={primaryBtn(loading, !!mismatch)}>
            {loading && <Spinner />}{loading ? "Saving…" : "Save new password →"}
          </button>
        </form>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export default function Login() {
  injectCSS();
  const navigate = useNavigate();
  const [tab, setTab]           = useState("login");
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard", { replace:true });
  }, []);

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg, #2d1b69 0%, #1e1145 100%)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div className="card" style={{
        width:"100%", maxWidth:420, background:"var(--surface)",
        borderRadius:18, boxShadow:"0 32px 80px rgba(0,0,0,.3)", overflow:"hidden",
      }}>
        <div style={{ height:4, background:"linear-gradient(90deg,#7c5cbf,#a78bfa)" }} />

        <div style={{ padding:"32px 30px 28px" }}>
          {/* Brand */}
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{
              width:50, height:50, borderRadius:14,
              background:"linear-gradient(135deg,#7c5cbf,#a78bfa)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, fontWeight:800, color:"#fff",
              margin:"0 auto 12px", boxShadow:"0 8px 20px rgba(124,92,191,.35)",
            }}>S</div>
            <div style={{ fontSize:20, fontWeight:800, color:"var(--ink)", marginBottom:3 }}>
              {showForgot ? "SmartSpend" : tab==="login" ? "Welcome back 👋" : "Join SmartSpend 🎓"}
            </div>
            <div style={{ fontSize:12.5, color:"var(--ink3)" }}>
              {showForgot ? "Student expense tracker"
                : tab==="login" ? "Your student finance tracker"
                : "Start tracking your expenses for free"}
            </div>
          </div>

          {/* Tab switcher */}
          {!showForgot && (
            <div style={{ display:"flex", background:"#f3f4f6", borderRadius:10, padding:3, marginBottom:22, gap:3 }}>
              <button className={`tab-btn${tab==="login"?" active":""}`} onClick={()=>setTab("login")}>Log in</button>
              <button className={`tab-btn${tab==="register"?" active":""}`} onClick={()=>setTab("register")}>Sign up</button>
            </div>
          )}

          {/* Content */}
          {showForgot
            ? <ForgotForm onBack={() => setShowForgot(false)} />
            : tab==="login"
              ? <LoginForm onForgot={() => setShowForgot(true)} />
              : <RegisterForm onSuccess={() => setTab("login")} />
          }

          {/* Footer */}
          {!showForgot && (
            <div style={{ textAlign:"center", marginTop:16, fontSize:11.5, color:"var(--ink3)", lineHeight:1.7 }}>
              {tab==="login"
                ? <>New here? <button className="link-btn" style={{fontSize:11.5}} onClick={()=>setTab("register")}>Create a free account</button></>
                : <>Already have an account? <button className="link-btn" style={{fontSize:11.5}} onClick={()=>setTab("login")}>Log in</button></>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}