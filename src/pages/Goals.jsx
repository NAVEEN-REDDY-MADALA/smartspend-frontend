import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  injectMobileCSS, fmt, Icon, ICONS,
  MobilePage, MobileHeader, LoadingScreen, Toast,
} from "./MobileLayout";

export default function Goals() {
  injectMobileCSS();
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");

  const [goals,    setGoals]    = useState([]);
  const [savings,  setSavings]  = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [modalGoal,setModalGoal]= useState(null);
  const [message,  setMessage]  = useState(null);
  const [toast,    setToast]    = useState(null);

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount,setTargetAmount]= useState("");
  const [targetDate,  setTargetDate]  = useState("");

  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(()=>{ if(!token){navigate("/",{replace:true});return;} loadAll(); },[]);

  async function loadAll() {
    try { await Promise.all([loadGoals(), loadSavings()]); }
    finally { setLoading(false); }
  }
  async function loadGoals() {
    const r=await fetch(`${API}/api/goals/`,{headers:{Authorization:`Bearer ${token}`}});
    if(r.ok) setGoals(await r.json());
  }
  async function loadSavings() {
    const r=await fetch(`${API}/api/summary/`,{headers:{Authorization:`Bearer ${token}`}});
    if(r.ok){ const d=await r.json(); setSavings(d.savings||0); }
  }

  async function createGoal(e) {
    e.preventDefault();
    const r=await fetch(`${API}/api/goals/`,{
      method:"POST",
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
      body:JSON.stringify({title,description:description||null,target_amount:parseFloat(targetAmount),target_date:targetDate||null}),
    });
    if(!r.ok){showToast("Something went wrong","error");return;}
    showToast(`"${title}" created! 🎯`);
    setTitle("");setDescription("");setTargetAmount("");setTargetDate("");
    setShowForm(false);
    loadGoals();
  }

  async function deleteGoal(id) {
    const r=await fetch(`${API}/api/goals/${id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
    if(r.ok){loadGoals();showToast("Goal deleted");}
  }

  async function addAmountToGoal(goalId, amount) {
    const r=await fetch(`${API}/api/goals/${goalId}/add-amount?amount=${amount}`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});
    if(!r.ok){const err=await r.json().catch(()=>{});showToast(err?.detail||"Failed","error");return;}
    setModalGoal(null);
    loadAll();
    showToast("Money added! 💰");
  }

  function showToast(text, type="ok") {
    setToast({text, ok:type==="ok"});
    setTimeout(()=>setToast(null),3000);
  }

  const active    = goals.filter(g=>g.status!=="completed");
  const completed = goals.filter(g=>g.status==="completed");
  const totalNeeded = active.reduce((s,g)=>s+Math.max(0,g.target_amount-g.current_amount),0);

  if(loading) return <LoadingScreen text="Loading goals…" />;

  return (
    <MobilePage>
      {toast && <Toast text={toast.text} ok={toast.ok} />}

      {/* Add Money Sheet */}
      {modalGoal && <AddMoneySheet goal={modalGoal} savings={savings} onConfirm={addAmountToGoal} onClose={()=>setModalGoal(null)} />}

      {/* Create Goal Sheet */}
      {showForm && (
        <>
          <div className="drawer-overlay" onClick={()=>setShowForm(false)} />
          <div className="drawer">
            <div className="drawer-sheet">
              <div className="drawer-handle" />
              <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)" }}>
                <div style={{ fontSize:16, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>Create New Goal</div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
                <form id="goal-form" onSubmit={createGoal}>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:13, fontWeight:600, color:"var(--ink2)", display:"block", marginBottom:6 }}>What are you saving for? *</label>
                    <input required placeholder="e.g. New laptop, Trip to Goa…" value={title} onChange={e=>setTitle(e.target.value)} className="inp" />
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:13, fontWeight:600, color:"var(--ink2)", display:"block", marginBottom:6 }}>A bit more detail (optional)</label>
                    <textarea placeholder="Why is this goal important?" value={description} onChange={e=>setDescription(e.target.value)} className="inp" style={{ minHeight:60, resize:"vertical" }} />
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:13, fontWeight:600, color:"var(--ink2)", display:"block", marginBottom:6 }}>Target amount (₹) *</label>
                    <input required type="number" min="1" placeholder="e.g. 15000" value={targetAmount} onChange={e=>setTargetAmount(e.target.value)} className="inp" inputMode="decimal" />
                  </div>
                  <div style={{ marginBottom:6 }}>
                    <label style={{ fontSize:13, fontWeight:600, color:"var(--ink2)", display:"block", marginBottom:6 }}>Target date (optional)</label>
                    <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} className="inp" />
                    <div style={{ fontSize:11, color:"var(--ink4)", marginTop:4 }}>💡 Set a date to see daily saving plan</div>
                  </div>
                </form>
              </div>
              <div style={{ padding:"14px 20px", paddingBottom:"max(14px, env(safe-area-inset-bottom))", display:"flex", gap:10 }}>
                <button form="goal-form" type="submit" className="btn-primary">Create Goal</button>
                <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:"14px", borderRadius:14, border:"1.5px solid var(--border)", background:"transparent", color:"var(--ink3)", fontSize:15, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}

      <MobileHeader
        title="My Goals 🎯"
        subtitle="Save for what matters"
        right={
          <button onClick={()=>setShowForm(true)}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", borderRadius:11, background:"var(--brand)", border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            <Icon d={ICONS.plus} size={14} color="#fff" /> New
          </button>
        }
      />

      <div style={{ padding:"12px 16px 0" }}>
        {/* Savings strip */}
        <div className="fu0" style={{ background:"linear-gradient(135deg,#1a0a4e,#3b1fa8)", borderRadius:16, padding:"14px 16px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.55)", marginBottom:2 }}>Available to invest</div>
            <div style={{ fontSize:22, fontWeight:800, color:savings>=0?"#fff":"#ff8fa3", fontFamily:"'Sora',sans-serif" }}>
              {savings<0?"-":""}₹{Math.abs(savings).toLocaleString("en-IN",{maximumFractionDigits:0})}
            </div>
          </div>
          {totalNeeded > 0 && (
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.55)", marginBottom:2 }}>Still needed</div>
              <div style={{ fontSize:18, fontWeight:700, color:"#a78bfa", fontFamily:"'Sora',sans-serif" }}>₹{totalNeeded.toLocaleString("en-IN",{maximumFractionDigits:0})}</div>
            </div>
          )}
        </div>

        {goals.length === 0 ? (
          <div className="card" style={{ padding:"48px 20px", textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🎯</div>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--ink2)", marginBottom:6 }}>No goals yet</div>
            <div style={{ fontSize:13, color:"var(--ink4)", marginBottom:18 }}>Create your first goal and start saving for it!</div>
            <button onClick={()=>setShowForm(true)} className="btn-primary" style={{ maxWidth:200 }}>+ Create Goal</button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="fu1" style={{ marginBottom:16 }}>
                <div className="section-label">In Progress ({active.length})</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {active.map(g=><GoalCard key={g.id} goal={g} savings={savings} onDelete={deleteGoal} onAddAmount={setModalGoal} />)}
                </div>
              </div>
            )}
            {completed.length > 0 && (
              <div className="fu2" style={{ marginBottom:16 }}>
                <div className="section-label" style={{ color:"var(--green)" }}>Completed 🎉 ({completed.length})</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {completed.map(g=><GoalCard key={g.id} goal={g} savings={savings} onDelete={deleteGoal} onAddAmount={setModalGoal} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MobilePage>
  );
}

function GoalCard({ goal, savings, onDelete, onAddAmount }) {
  const pct       = Math.min(100,Math.round((goal.current_amount/goal.target_amount)*100));
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const done      = goal.status==="completed" || pct===100;

  const today    = new Date(); today.setHours(0,0,0,0);
  const daysLeft = goal.target_date ? Math.ceil((new Date(goal.target_date)-today)/86400000) : null;
  const dailyNeeded = daysLeft>0&&remaining>0 ? Math.ceil(remaining/daysLeft) : null;

  let paceColor = "var(--green)";
  let paceBg    = "var(--green-bg)";
  let paceText  = "Easy pace 🎉";
  if (dailyNeeded) {
    if (dailyNeeded>500){paceColor="var(--red)";paceBg="var(--red-bg)";paceText="Very ambitious ⚡";}
    else if(dailyNeeded>150){paceColor="var(--amber)";paceBg="var(--amber-bg)";paceText="Stretch goal 💪";}
    else if(dailyNeeded>50){paceColor="var(--amber)";paceBg="var(--amber-bg)";paceText="Moderate pace ☕";}
  }

  const barColor = done?"var(--green)":pct>=75?"var(--brand)":"var(--brand)";

  return (
    <div className="card" style={{ overflow:"hidden", borderTop:`3px solid ${done?"var(--green)":"var(--brand)"}` }}>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>{goal.title}</div>
            {goal.description && <div style={{ fontSize:12, color:"var(--ink4)", marginTop:2, lineHeight:1.4 }}>{goal.description}</div>}
          </div>
          <span style={{ marginLeft:8, padding:"3px 9px", borderRadius:99, fontSize:10, fontWeight:700, background:done?"var(--green-bg)":"var(--brand-soft)", color:done?"var(--green)":"var(--brand)", flexShrink:0 }}>
            {done?"✓ Done":"Active"}
          </span>
        </div>

        {/* Progress */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:12, color:"var(--ink4)" }}>Progress</span>
          <span style={{ fontSize:12, fontWeight:700, color:done?"var(--green)":"var(--ink)", fontFamily:"'Sora',sans-serif" }}>{pct}%</span>
        </div>
        <div className="prog-track" style={{ marginBottom:12 }}>
          <div className="prog-fill" style={{ width:`${pct}%`, background:barColor }}/>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
          {[
            {label:"Saved",  val:`₹${fmt(goal.current_amount)}`, col:"var(--ink)"},
            {label:"Target", val:`₹${fmt(goal.target_amount)}`,  col:"var(--ink)"},
            {label:"Needed", val:done?"🎉":`₹${fmt(remaining)}`, col:remaining>0&&!done?"var(--amber)":"var(--green)"},
          ].map(s=>(
            <div key={s.label} style={{ background:"var(--surface2)", borderRadius:10, padding:"9px 10px", textAlign:"center" }}>
              <div style={{ fontSize:10, color:"var(--ink4)", marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:12, fontWeight:700, color:s.col, fontFamily:"'Sora',sans-serif" }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Daily savings plan */}
        {dailyNeeded && !done && (
          <div style={{ background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", borderRadius:12, padding:"12px 14px", marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--brand)", textTransform:"uppercase", letterSpacing:".5px", marginBottom:8 }}>To reach this on time</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>₹{fmt(dailyNeeded)}</div>
                <div style={{ fontSize:11, color:"var(--ink4)" }}>/ day</div>
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>₹{fmt(Math.ceil(dailyNeeded*30))}</div>
                <div style={{ fontSize:11, color:"var(--ink4)" }}>/ month</div>
              </div>
            </div>
            <div style={{ padding:"5px 9px", borderRadius:8, background:paceBg, color:paceColor, fontSize:11, fontWeight:600 }}>{paceText}</div>
          </div>
        )}

        {/* Days left */}
        {daysLeft !== null && (
          <div style={{ marginBottom:12, padding:"6px 10px", borderRadius:8, display:"inline-block", fontSize:11, fontWeight:600,
            background:daysLeft<0?"var(--red-bg)":daysLeft<30?"var(--amber-bg)":"var(--surface2)",
            color:daysLeft<0?"var(--red)":daysLeft<30?"var(--amber)":"var(--ink4)",
          }}>
            {daysLeft<0?`⚠️ Overdue by ${Math.abs(daysLeft)} days`:daysLeft===0?"⏰ Due today!":`📅 ${daysLeft} days left`}
          </div>
        )}

        {/* Actions */}
        {!done ? (
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>onAddAmount(goal)}
              style={{ flex:1, padding:"10px", borderRadius:12, background:"var(--brand)", border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              + Add Money
            </button>
            <button onClick={()=>onDelete(goal.id)}
              style={{ padding:"10px 14px", borderRadius:12, background:"var(--red-bg)", border:"1px solid #fecaca", color:"var(--red)", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              Delete
            </button>
          </div>
        ) : (
          <button onClick={()=>onDelete(goal.id)}
            style={{ width:"100%", padding:"10px", borderRadius:12, background:"var(--red-bg)", border:"1px solid #fecaca", color:"var(--red)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            Remove Goal
          </button>
        )}
      </div>
    </div>
  );
}

function AddMoneySheet({ goal, savings, onConfirm, onClose }) {
  const [amount, setAmount] = useState("");
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const QUICK = [100,200,500,1000].filter(q=>q<=Math.min(remaining,savings));

  function submit(e) {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val)||val<=0||val>savings) return;
    onConfirm(goal.id, val);
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-sheet">
          <div className="drawer-handle" />
          <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)" }}>
            <div style={{ fontSize:16, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>Add money to goal</div>
            <div style={{ fontSize:12, color:"var(--ink4)", marginTop:2 }}>
              <strong style={{ color:"var(--green)" }}>₹{fmt(savings)}</strong> available · Goal needs <strong>₹{fmt(remaining)}</strong> more
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
            {QUICK.length > 0 && (
              <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:12 }}>
                {QUICK.map(q=>(
                  <button key={q} className={`chip${amount===q.toString()?" active":""}`} onClick={()=>setAmount(q.toString())}>₹{q}</button>
                ))}
              </div>
            )}
            <form id="addmoney-form" onSubmit={submit}>
              <label style={{ fontSize:13, fontWeight:600, color:"var(--ink2)", display:"block", marginBottom:6 }}>Custom amount (₹)</label>
              <input type="number" required min="1" max={savings}
                placeholder={`Up to ₹${fmt(savings)}`}
                value={amount} onChange={e=>setAmount(e.target.value)}
                className="inp" inputMode="decimal" />
              {remaining>0&&savings>0&&(
                <button type="button" onClick={()=>setAmount(Math.min(remaining,savings).toString())}
                  style={{ fontSize:11, color:"var(--brand)", background:"none", border:"none", cursor:"pointer", marginTop:8, fontFamily:"inherit", textDecoration:"underline", padding:0 }}>
                  Fill remaining ₹{fmt(Math.min(remaining,savings))}
                </button>
              )}
            </form>
          </div>
          <div style={{ padding:"14px 20px", paddingBottom:"max(14px, env(safe-area-inset-bottom))", display:"flex", gap:10 }}>
            <button form="addmoney-form" type="submit" className="btn-primary">Add Money ✓</button>
            <button onClick={onClose} style={{ flex:1, padding:"14px", borderRadius:14, border:"1.5px solid var(--border)", background:"transparent", color:"var(--ink3)", fontSize:15, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}