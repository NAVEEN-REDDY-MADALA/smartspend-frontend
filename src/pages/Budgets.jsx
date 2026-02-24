// ══════════════════════════════════════════════════════
// Budgets.jsx
// ══════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  injectMobileCSS, fmt, Icon, ICONS,
  MobilePage, MobileHeader, LoadingScreen, Toast,
} from "./MobileLayout";

const CATEGORIES = ["Food","Bills","Shopping","Entertainment","Travel","Medicine","Groceries","Other"];

export function Budgets() {
  injectMobileCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [expenses,    setExpenses]    = useState([]);
  const [budgetRisks, setBudgetRisks] = useState([]);
  const [budgets,     setBudgets]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [category,    setCategory]    = useState("");
  const [limit,       setLimit]       = useState("");
  const [toast,       setToast]       = useState(null);

  const now = new Date();
  const currentMonth = now.getMonth()+1;
  const currentYear  = now.getFullYear();
  const monthLabel   = now.toLocaleString("default",{month:"long",year:"numeric"});

  useEffect(()=>{
    if(!token){navigate("/",{replace:true});return;}
    loadData();
  },[]);

  async function loadData() {
    try {
      const r=await fetch("https://smartspend-backend-aupt.onrender.com/api/expenses/",{headers:{Authorization:`Bearer ${token}`}});
      setExpenses(await r.json());
      const saved=JSON.parse(localStorage.getItem("budgets")||"[]");
      const active=saved.filter(b=>b.month===currentMonth&&b.year===currentYear);
      localStorage.setItem("budgets",JSON.stringify(active));
      setBudgets(active);
      const rr=await fetch("https://smartspend-backend-aupt.onrender.com/api/ai/risk",{headers:{Authorization:`Bearer ${token}`}});
      if(rr.ok) setBudgetRisks(await rr.json());
    } finally { setLoading(false); }
  }

  function saveBudget(e) {
    e.preventDefault();
    if(budgets.find(b=>b.category===category)){showToast(`Budget for ${category} already exists`,"error");return;}
    const updated=[...budgets,{category,limit:parseFloat(limit),month:currentMonth,year:currentYear}];
    localStorage.setItem("budgets",JSON.stringify(updated));
    setBudgets(updated);
    setCategory("");setLimit("");setShowForm(false);
    showToast(`Budget set for ${category} 🎯`);
  }

  function deleteBudget(cat) {
    const updated=budgets.filter(b=>b.category!==cat);
    localStorage.setItem("budgets",JSON.stringify(updated));
    setBudgets(updated);
    showToast("Budget removed");
  }

  function spentOn(cat) { return expenses.filter(e=>e.category===cat).reduce((s,e)=>s+e.amount,0); }

  function showToast(text,type="ok"){setToast({text,ok:type==="ok"});setTimeout(()=>setToast(null),3000);}

  if(loading) return <LoadingScreen text="Loading budgets…" />;

  return (
    <MobilePage>
      {toast && <Toast text={toast.text} ok={toast.ok} />}

      {/* Add budget sheet */}
      {showForm && (
        <>
          <div className="drawer-overlay" onClick={()=>setShowForm(false)} />
          <div className="drawer">
            <div className="drawer-sheet">
              <div className="drawer-handle" />
              <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)"}}>
                <div style={{fontSize:16,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>Set Spending Limit</div>
                <div style={{fontSize:12,color:"var(--ink4)",marginTop:2}}>{monthLabel}</div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
                <form id="budget-form" onSubmit={saveBudget}>
                  <div style={{marginBottom:14}}>
                    <label style={{fontSize:13,fontWeight:600,color:"var(--ink2)",display:"block",marginBottom:6}}>Category *</label>
                    <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                      {CATEGORIES.map(c=>(
                        <button key={c} type="button" className={`chip${category===c?" active":""}`} onClick={()=>setCategory(c)}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:13,fontWeight:600,color:"var(--ink2)",display:"block",marginBottom:6}}>Max I want to spend this month (₹) *</label>
                    <input required type="number" min="1" placeholder="e.g. 2000" value={limit} onChange={e=>setLimit(e.target.value)} className="inp" inputMode="decimal" />
                    <div style={{fontSize:11,color:"var(--ink4)",marginTop:4}}>Your limit for the whole month</div>
                  </div>
                </form>
              </div>
              <div style={{padding:"14px 20px",paddingBottom:"max(14px, env(safe-area-inset-bottom))",display:"flex",gap:10}}>
                <button form="budget-form" type="submit" disabled={!category} className="btn-primary">Save Budget</button>
                <button onClick={()=>setShowForm(false)} style={{flex:1,padding:"14px",borderRadius:14,border:"1.5px solid var(--border)",background:"transparent",color:"var(--ink3)",fontSize:15,fontWeight:600,fontFamily:"inherit",cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}

      <MobileHeader
        title="My Budgets 📋"
        subtitle={monthLabel}
        right={
          <button onClick={()=>setShowForm(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:11,background:"var(--brand)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            <Icon d={ICONS.plus} size={14} color="#fff" /> New
          </button>
        }
      />

      <div style={{padding:"12px 16px 0"}}>
        {/* AI risks */}
        {budgetRisks.filter(r=>budgets.find(b=>b.category===r.category)).length>0 && (
          <div className="fu0 card" style={{padding:"14px 16px",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:10}}>🤖 AI Risk Alerts</div>
            {budgetRisks.filter(r=>budgets.find(b=>b.category===r.category)).map((risk,i)=>{
              const high=risk.risk_level==="HIGH";
              const med=risk.risk_level==="MEDIUM";
              const col=high?"var(--red)":med?"var(--amber)":"var(--green)";
              const bg=high?"var(--red-bg)":med?"var(--amber-bg)":"var(--green-bg)";
              return (
                <div key={i} style={{padding:"10px 12px",borderRadius:10,background:bg,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:13,fontWeight:700,color:col}}>{risk.category}</span>
                    <span style={{fontSize:10,fontWeight:700,color:col}}>{risk.risk_level}</span>
                  </div>
                  <div style={{fontSize:11,color:"var(--ink3)"}}>
                    Expected: ₹{fmt(risk.expected_spend)} · Limit: ₹{fmt(risk.budget_limit)} · {Math.round(risk.probability*100)}% chance
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {budgets.length===0 ? (
          <div className="card" style={{padding:"48px 20px",textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:12}}>📋</div>
            <div style={{fontSize:15,fontWeight:700,color:"var(--ink2)",marginBottom:6}}>No budgets set</div>
            <div style={{fontSize:13,color:"var(--ink4)",marginBottom:18}}>Set spending limits so you don't overspend!</div>
            <button onClick={()=>setShowForm(true)} className="btn-primary" style={{maxWidth:200}}>+ Set Budget</button>
          </div>
        ) : (
          <div className="fu1" style={{display:"flex",flexDirection:"column",gap:10}}>
            {budgets.map((b,i)=>{
              const used=spentOn(b.category);
              const pct=Math.min(100,Math.round((used/b.limit)*100));
              const over=pct>=90; const warn=pct>=70&&pct<90;
              const col=over?"var(--red)":warn?"var(--amber)":"var(--brand)";
              return (
                <div key={i} className="card" style={{padding:"14px 16px",borderLeft:`3px solid ${col}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:"var(--ink)"}}>{b.category}</div>
                      {over && <div style={{fontSize:11,color:"var(--red)",fontWeight:600}}>⚠️ Almost at limit!</div>}
                      {warn && <div style={{fontSize:11,color:"var(--amber)",fontWeight:600}}>🔔 Getting close</div>}
                    </div>
                    <button onClick={()=>deleteBudget(b.category)} style={{width:32,height:32,borderRadius:9,border:"1px solid var(--border)",background:"var(--red-bg)",color:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                      <Icon d={ICONS.trash} size={13} color="var(--red)" />
                    </button>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:12,color:"var(--ink4)"}}>Spent: <strong style={{color:col,fontFamily:"'Sora',sans-serif"}}>₹{fmt(used)}</strong></span>
                    <span style={{fontSize:12,color:"var(--ink4)"}}>Limit: <strong style={{color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>₹{fmt(b.limit)}</strong></span>
                  </div>
                  <div className="prog-track">
                    <div className="prog-fill" style={{width:`${pct}%`,background:col}}/>
                  </div>
                  <div style={{fontSize:11,color:"var(--ink4)",marginTop:4}}>{pct}% used</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobilePage>
  );
}

export default Budgets;