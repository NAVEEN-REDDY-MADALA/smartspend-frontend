import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api";
import {
  injectMobileCSS, fmt,
  Icon, ICONS, BottomNav, MobileHeader, LoadingScreen
} from "./MobileLayout";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --sb:#2d1b69; --accent:#7c5cbf; --accent2:#a78bfa;
    --bg:#f4f3f8; --surface:#fff; --border:#e5e7eb;
    --ink:#111827; --ink2:#374151; --ink3:#6b7280; --ink4:#9ca3af;
    --green:#059669; --gbg:#ecfdf5; --gborder:#a7f3d0;
    --red:#dc2626;   --rbg:#fef2f2; --rborder:#fecaca;
    --amber:#d97706; --abg:#fffbeb; --aborder:#fde68a;
    --blue:#2563eb;  --bbg:#eff6ff; --bborder:#bfdbfe;
    --nav-h:64px;
  }
  html,body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  .fade{animation:fadeUp .25s ease both;}
  .slink{transition:background .15s,color .15s;cursor:pointer}
  .slink:hover{background:rgba(255,255,255,.09)!important;color:#fff!important}
  .slink.active{background:rgba(255,255,255,.16)!important;color:#fff!important}
  .bcard{transition:box-shadow .2s;}
  .bcard:hover{box-shadow:0 4px 20px rgba(0,0,0,.07)!important;}
  .inp{width:100%;padding:10px 13px;border-radius:8px;border:1.5px solid var(--border);font-size:14px;font-family:inherit;color:var(--ink);outline:none;background:var(--surface);transition:border-color .15s;}
  .inp:focus{border-color:var(--accent);}

  .sidebar{width:210px;flex-shrink:0;background:var(--sb);display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow:hidden;}

  @media(max-width:900px){
    .sidebar{display:none!important;}
    .desk-hdr{display:none!important;}
    .desk-only{display:none!important;}
    .mob-only{display:flex!important;}
    .budgets-content{padding:10px 12px calc(var(--nav-h) + 16px)!important;}
    .budgets-grid{grid-template-columns:1fr!important;}
  }
  @media(min-width:901px){
    .mob-only{display:none!important;}
    .desk-hdr{display:flex!important;}
    .desk-only{display:grid!important;}
  }
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__budgets_mob__")) return;
  const s=document.createElement("style"); s.id="__budgets_mob__"; s.textContent=CSS;
  document.head.appendChild(s);
  injectMobileCSS();
}

const NAV_SECTIONS=[
  {label:null,items:[{to:"/dashboard",label:"Home",icon:"home"}]},
  {label:"Track Money",items:[
    {to:"/transactions",label:"Transactions",icon:"tx"},
    {to:"/analytics",label:"Analytics",icon:"analytics"},
    {to:"/goals",label:"My Goals",icon:"goals"},
    {to:"/budgets",label:"My Budgets",icon:"budget"},
  ]},
  {label:"Auto Features",items:[
    {to:"/detected-transactions",label:"SMS Detected",icon:"detect"},
    {to:"/reminders",label:"Reminders",icon:"reminder"},
  ]},
];

function Sidebar({onLogout}) {
  const path=window.location.pathname;
  return (
    <aside className="sidebar">
      <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#7c5cbf,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff"}}>S</div>
        <div><div style={{fontSize:14,fontWeight:700,color:"#fff",lineHeight:1}}>SmartSpend</div><div style={{fontSize:10,color:"rgba(255,255,255,.38)",marginTop:2}}>Student Finance</div></div>
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"10px"}}>
        {NAV_SECTIONS.map((sec,si)=>(
          <div key={si} style={{marginBottom:6}}>
            {sec.label&&<div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,.32)",letterSpacing:"1px",textTransform:"uppercase",padding:"8px 8px 4px"}}>{sec.label}</div>}
            {sec.items.map(it=>(
              <a key={it.to} href={it.to} className={`slink${path===it.to?" active":""}`}
                style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,color:"rgba(255,255,255,.65)",fontSize:13,textDecoration:"none",marginBottom:1}}>
                <Icon d={ICONS[it.icon]} size={14}/>{it.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <button onClick={onLogout} className="slink" style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,background:"transparent",border:"none",color:"rgba(255,255,255,.65)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          <Icon d={ICONS.logout} size={14}/> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ─── Progress Bar ────────────────────────────────────────────────────────── */
function ProgressBar({pct}) {
  const color=pct>=90?"var(--red)":pct>=70?"var(--amber)":"var(--accent)";
  return (
    <div style={{height:7,background:"#f3f4f6",borderRadius:99,overflow:"hidden",margin:"8px 0 4px"}}>
      <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:99,transition:"width 1s ease"}}/>
    </div>
  );
}

/* ─── Mobile Budget Card ──────────────────────────────────────────────────── */
function BudgetCardMobile({b,used,onDelete}) {
  const pct=Math.min(100,Math.round((used/b.limit)*100));
  const over=pct>=90;
  const warn=pct>=70&&pct<90;
  const color=over?"var(--red)":warn?"var(--amber)":"var(--accent)";

  return (
    <div className="fade" style={{background:"var(--surface)",borderRadius:14,padding:"14px",border:"1px solid var(--border)",borderLeft:`4px solid ${color}`,boxShadow:"0 1px 6px rgba(0,0,0,.04)",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"var(--ink)"}}>
            {b.category}
            {over&&<span style={{marginLeft:6,fontSize:10,fontWeight:700,color:"var(--red)",background:"var(--rbg)",padding:"1px 6px",borderRadius:99}}>⚠️ Almost at limit!</span>}
            {warn&&<span style={{marginLeft:6,fontSize:10,fontWeight:700,color:"var(--amber)",background:"var(--abg)",padding:"1px 6px",borderRadius:99}}>🔔 Getting close</span>}
          </div>
        </div>
        <button onClick={()=>onDelete(b.category)} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--ink4)",padding:4}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div>
      <ProgressBar pct={pct}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:4}}>
        <div style={{textAlign:"center",padding:"6px 4px",background:"#f9fafb",borderRadius:7}}>
          <div style={{fontSize:10,color:"var(--ink4)",marginBottom:1}}>Limit</div>
          <div style={{fontSize:12,fontWeight:700,color:"var(--ink)"}}>₹{fmt(b.limit)}</div>
        </div>
        <div style={{textAlign:"center",padding:"6px 4px",background:over?"var(--rbg)":warn?"var(--abg)":"#f9fafb",borderRadius:7}}>
          <div style={{fontSize:10,color:"var(--ink4)",marginBottom:1}}>Spent</div>
          <div style={{fontSize:12,fontWeight:700,color}}>{pct}% · ₹{fmt(used)}</div>
        </div>
        <div style={{textAlign:"center",padding:"6px 4px",background:over?"var(--rbg)":"var(--gbg)",borderRadius:7}}>
          <div style={{fontSize:10,color:"var(--ink4)",marginBottom:1}}>Left</div>
          <div style={{fontSize:12,fontWeight:700,color:over?"var(--red)":"var(--green)"}}>₹{fmt(Math.max(0,b.limit-used))}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile Add Budget Sheet ─────────────────────────────────────────────── */
function AddBudgetSheet({onClose,onSave,budgets,message}) {
  const CATEGORIES=["Food","Bills","Shopping","Entertainment","Travel","Medicine","Groceries","Other"];
  const [category,setCategory]=useState("");
  const [limit,setLimit]=useState("");
  // NAV_H + some breathing room so button clears the bottom nav
  const BTN_ZONE = 80 + 64; // button area + nav height

  function submit(e) {
    e.preventDefault();
    onSave(category,parseFloat(limit));
    setCategory(""); setLimit("");
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,backdropFilter:"blur(2px)"}}/>

      {/* Scrollable sheet — padded at bottom so content clears the fixed button */}
      <div style={{
        position:"fixed",bottom:0,left:0,right:0,zIndex:201,
        background:"var(--surface)",borderRadius:"22px 22px 0 0",
        maxHeight:"82vh",overflowY:"auto",
        animation:"slideUp .3s cubic-bezier(.34,1.1,.64,1) both",
        paddingBottom: BTN_ZONE
      }}>
        <div style={{width:36,height:4,background:"var(--border)",borderRadius:99,margin:"12px auto 0"}}/>

        {/* Header — sticky inside the sheet */}
        <div style={{
          position:"sticky",top:0,background:"var(--surface)",zIndex:1,
          padding:"14px 20px 12px",
          borderBottom:"1px solid var(--border)",
          display:"flex",justifyContent:"space-between",alignItems:"center"
        }}>
          <div style={{fontSize:16,fontWeight:700,color:"var(--ink)"}}>Set a spending limit</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:99,border:"1px solid var(--border)",background:"var(--bg)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon d={ICONS.x} size={13} color="var(--ink3)"/>
          </button>
        </div>

        {/* Form content */}
        <div style={{padding:"20px 20px 8px"}}>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,fontWeight:600,color:"var(--ink2)",display:"block",marginBottom:6}}>Category *</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="inp" style={{padding:"12px 13px"}}>
              <option value="">Pick a category…</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{marginBottom:8}}>
            <label style={{fontSize:12,fontWeight:600,color:"var(--ink2)",display:"block",marginBottom:6}}>Monthly limit (₹) *</label>
            <input
              type="number" min="1" placeholder="e.g. 2000"
              value={limit} onChange={e=>setLimit(e.target.value)}
              className="inp" style={{padding:"12px 13px"}}
            />
            <div style={{fontSize:11,color:"var(--ink3)",marginTop:5}}>This is your spending cap for the whole month</div>
          </div>
          {message&&(
            <div style={{marginTop:14,padding:"10px 13px",borderRadius:9,fontSize:12,background:message.ok?"var(--gbg)":"var(--rbg)",color:message.ok?"var(--green)":"var(--red)",border:`1px solid ${message.ok?"#bbf7d0":"#fecaca"}`}}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* Save button — position:fixed, always above nav, never hidden */}
      <div style={{
        position:"fixed",
        bottom:"var(--nav-h, 64px)",   /* sits on top of bottom nav */
        left:0,right:0,
        zIndex:202,
        padding:"12px 20px",
        background:"var(--surface)",
        borderTop:"1px solid var(--border)",
        boxShadow:"0 -4px 20px rgba(0,0,0,.06)"
      }}>
        <button
          onClick={submit}
          disabled={!category||!limit}
          style={{
            width:"100%",padding:"15px",borderRadius:13,
            background:(!category||!limit)?"var(--border)":"linear-gradient(135deg,#7c5cbf,#a78bfa)",
            border:"none",color:(!category||!limit)?"var(--ink4)":"#fff",
            fontSize:15,fontWeight:700,cursor:(!category||!limit)?"not-allowed":"pointer",
            fontFamily:"inherit",transition:"all .2s",
            boxShadow:(!category||!limit)?"none":"0 4px 16px rgba(124,92,191,.35)"
          }}>
          {(!category||!limit)?"Fill in the fields above ↑":"💾 Save Budget"}
        </button>
      </div>
    </>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function Budgets() {
  injectCSS();
  const navigate=useNavigate();
  const token=localStorage.getItem("token");

  const [expenses,setExpenses]=useState([]);
  const [budgetRisks,setBudgetRisks]=useState([]);
  const [budgets,setBudgets]=useState([]);
  const [category,setCategory]=useState("");
  const [limit,setLimit]=useState("");
  const [message,setMessage]=useState(null);
  const [loading,setLoading]=useState(true);
  const [showAddSheet,setShowAddSheet]=useState(false);

  const CATEGORIES=["Food","Bills","Shopping","Entertainment","Travel","Medicine","Groceries","Other"];
  const now=new Date();
  const currentMonth=now.getMonth()+1;
  const currentYear=now.getFullYear();
  const monthLabel=now.toLocaleString("default",{month:"long",year:"numeric"});

  useEffect(()=>{
    if(!token){navigate("/",{replace:true});return;}
    loadData();
  },[]);

  async function loadData() {
    try {
      const r=await fetch(`${BASE_URL}/api/expenses/`,{headers:{Authorization:`Bearer ${token}`}});
      setExpenses(await r.json());
      const saved=JSON.parse(localStorage.getItem("budgets")||"[]");
      const active=saved.filter(b=>b.month===currentMonth&&b.year===currentYear);
      localStorage.setItem("budgets",JSON.stringify(active));
      setBudgets(active);
      const rr=await fetch(`${BASE_URL}/api/ai/risk`,{headers:{Authorization:`Bearer ${token}`}});
      if(rr.ok) setBudgetRisks(await rr.json());
    } catch(err){console.error("ERROR:",err);}
    finally{setLoading(false);}
  }

  function saveBudget(cat,lim) {
    if(!cat||!lim) return;
    if(budgets.find(b=>b.category===cat)){setMessage({text:`Budget for ${cat} already exists this month.`,ok:false});return;}
    const updated=[...budgets,{category:cat,limit:lim,month:currentMonth,year:currentYear}];
    localStorage.setItem("budgets",JSON.stringify(updated));
    setBudgets(updated);
    setMessage({text:`Budget set for ${cat} — you're all set! 🎯`,ok:true});
  }

  function saveBudgetDesktop(e) {
    e.preventDefault();
    saveBudget(category,parseFloat(limit));
    setCategory(""); setLimit("");
  }

  function deleteBudget(cat) {
    const updated=budgets.filter(b=>b.category!==cat);
    localStorage.setItem("budgets",JSON.stringify(updated));
    setBudgets(updated);
  }

  function spentOn(cat) {
    return expenses.filter(e=>e.category===cat).reduce((s,e)=>s+e.amount,0);
  }

  function logout(){localStorage.removeItem("token");navigate("/",{replace:true});}

  const totalBudget=budgets.reduce((s,b)=>s+b.limit,0);
  const totalSpent=budgets.reduce((s,b)=>s+spentOn(b.category),0);
  const overCount=budgets.filter(b=>spentOn(b.category)/b.limit>=0.9).length;

  if(loading) return <LoadingScreen text="Loading your budgets…"/>;

  const MobHeaderRight=(
    <button onClick={()=>setShowAddSheet(true)}
      style={{width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,.3)",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
      <Icon d={ICONS.plus} size={16} color="#fff"/>
    </button>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout}/>
      <BottomNav/>

      {showAddSheet&&(
        <AddBudgetSheet
          onClose={()=>{setShowAddSheet(false);setMessage(null);}}
          onSave={(cat,lim)=>{saveBudget(cat,lim);}}
          budgets={budgets}
          message={message}
        />
      )}

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Mobile header */}
        <MobileHeader
          title="My Budgets 📋"
          subtitle={`${budgets.length} set · ${overCount>0?`${overCount} near limit`:monthLabel}`}
          right={MobHeaderRight}
        />

        {/* Desktop header */}
        <div className="desk-hdr" style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)"}}>My Budgets 📋</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>Set spending limits so you don't overspend — {monthLabel}</div>
          </div>
        </div>

        {/* Page content */}
        <div className="budgets-content" style={{flex:1,overflowY:"auto",padding:"16px 20px 28px",background:"var(--bg)"}}>

          {/* Mobile layout */}
          <div className="mob-only" style={{flexDirection:"column"}}>
            {/* Summary */}
            <div className="fade" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <div style={{background:"var(--pbg)",border:"1px solid #ddd6fe",borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:".4px",marginBottom:2}}>Total Budget</div>
                <div style={{fontSize:16,fontWeight:800,color:"#7c3aed",fontFamily:"'Sora',sans-serif"}}>₹{fmt(totalBudget)}</div>
              </div>
              <div style={{background:totalSpent>totalBudget?"var(--rbg)":"var(--gbg)",border:`1px solid ${totalSpent>totalBudget?"var(--rborder)":"var(--gborder)"}`,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:10,fontWeight:700,color:totalSpent>totalBudget?"var(--red)":"var(--green)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:2}}>Total Spent</div>
                <div style={{fontSize:16,fontWeight:800,color:totalSpent>totalBudget?"var(--red)":"var(--green)",fontFamily:"'Sora',sans-serif"}}>₹{fmt(totalSpent)}</div>
              </div>
            </div>

            {/* AI risk alerts */}
            {budgetRisks.filter(r=>budgets.find(b=>b.category===r.category)&&r.risk_level==="HIGH").length>0&&(
              <div className="fade" style={{background:"var(--rbg)",border:"1px solid var(--rborder)",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--red)",marginBottom:8}}>🤖 AI Risk Alerts</div>
                {budgetRisks.filter(r=>budgets.find(b=>b.category===r.category)&&r.risk_level==="HIGH").map((risk,i)=>(
                  <div key={i} style={{fontSize:12,color:"var(--red)",marginBottom:4}}>
                    ⚠️ <strong>{risk.category}</strong> — {Math.round(risk.probability*100)}% chance of going over (₹{fmt(risk.expected_spend)} expected)
                  </div>
                ))}
              </div>
            )}

            {budgets.length===0?(
              <div className="fade" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"48px 20px",textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:10}}>📋</div>
                <div style={{fontSize:15,fontWeight:600,color:"var(--ink2)",marginBottom:6}}>No budgets set yet</div>
                <div style={{fontSize:13,color:"var(--ink3)",marginBottom:16}}>Tap + to set your first spending limit!</div>
                <button onClick={()=>setShowAddSheet(true)} style={{padding:"10px 24px",borderRadius:9,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ Add Budget</button>
              </div>
            ):(
              budgets.map(b=><BudgetCardMobile key={b.category} b={b} used={spentOn(b.category)} onDelete={deleteBudget}/>)
            )}
          </div>

          {/* Desktop layout */}
          <div className="desk-only budgets-grid" style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:20,alignItems:"start"}}>
            {/* Form */}
            <div className="fade" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",fontWeight:600,fontSize:13,color:"var(--ink)"}}>+ Set a new spending limit</div>
              <div style={{padding:"20px"}}>
                <form onSubmit={saveBudgetDesktop}>
                  <div style={{marginBottom:14}}>
                    <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>What category? *</label>
                    <select required value={category} onChange={e=>setCategory(e.target.value)} className="inp">
                      <option value="">Pick a category…</option>
                      {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{marginBottom:18}}>
                    <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>Max I want to spend (₹) *</label>
                    <input type="number" required min="1" placeholder="e.g. 2000" value={limit} onChange={e=>setLimit(e.target.value)} className="inp"/>
                    <div style={{fontSize:11,color:"var(--ink3)",marginTop:4}}>This is your limit for the whole month</div>
                  </div>
                  <button type="submit" style={{width:"100%",padding:"10px",borderRadius:7,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Save Budget</button>
                </form>
                {message&&(
                  <div style={{marginTop:12,padding:"10px 13px",borderRadius:7,fontSize:12,background:message.ok?"var(--gbg)":"var(--rbg)",color:message.ok?"var(--green)":"var(--red)",border:`1px solid ${message.ok?"#bbf7d0":"#fecaca"}`}}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {budgetRisks.filter(r=>budgets.find(b=>b.category===r.category)).length>0&&(
                <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                  <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",fontWeight:600,fontSize:13,color:"var(--ink)"}}>🤖 AI is predicting — will you go over budget?</div>
                  <div style={{padding:"16px 20px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                    {budgetRisks.filter(r=>budgets.find(b=>b.category===r.category)).map((risk,i)=>{
                      const high=risk.risk_level==="HIGH";
                      const med=risk.risk_level==="MEDIUM";
                      const col=high?"var(--red)":med?"var(--amber)":"var(--green)";
                      const bg=high?"var(--rbg)":med?"var(--abg)":"var(--gbg)";
                      const border=high?"#fecaca":med?"#fde68a":"#bbf7d0";
                      return (
                        <div key={i} style={{padding:"12px 14px",borderRadius:8,background:bg,border:`1px solid ${border}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <span style={{fontSize:13,fontWeight:600,color:col}}>{risk.category}</span>
                            <span style={{fontSize:10,fontWeight:700,color:col,background:"rgba(0,0,0,.05)",padding:"2px 6px",borderRadius:4}}>{risk.risk_level}</span>
                          </div>
                          <div style={{fontSize:12,color:"var(--ink3)"}}>Expected: <strong style={{color:"var(--ink)"}}>₹{fmt(risk.expected_spend)}</strong></div>
                          <div style={{fontSize:12,color:"var(--ink3)"}}>Your limit: ₹{fmt(risk.budget_limit)}</div>
                          <div style={{fontSize:12,marginTop:4,color:col,fontWeight:500}}>{Math.round(risk.probability*100)}% chance of going over</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontWeight:600,fontSize:13,color:"var(--ink)"}}>Active budgets for {monthLabel}</div>
                  <span style={{fontSize:12,color:"var(--ink3)"}}>{budgets.length} set</span>
                </div>
                {budgets.length===0?(
                  <div style={{padding:"40px 20px",textAlign:"center"}}>
                    <div style={{fontSize:32,marginBottom:8}}>📋</div>
                    <div style={{fontSize:14,fontWeight:500,color:"var(--ink2)",marginBottom:4}}>No budgets set yet</div>
                    <div style={{fontSize:12,color:"var(--ink3)"}}>Use the form on the left to set your first spending limit!</div>
                  </div>
                ):(
                  <>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 100px 100px 90px 36px",padding:"8px 20px",background:"#f9fafb",borderBottom:"1px solid var(--border)"}}>
                      {["Category","Limit","Spent","Progress",""].map(h=>(
                        <div key={h} style={{fontSize:11,fontWeight:600,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".5px"}}>{h}</div>
                      ))}
                    </div>
                    {budgets.map((b,i)=>{
                      const used=spentOn(b.category);
                      const pct=Math.min(100,Math.round((used/b.limit)*100));
                      const over=pct>=90;
                      const warn=pct>=70&&pct<90;
                      return (
                        <div key={i} className="bcard" style={{display:"grid",gridTemplateColumns:"1fr 100px 100px 90px 36px",padding:"14px 20px",alignItems:"center",borderBottom:i<budgets.length-1?"1px solid var(--border)":"none",background:over?"#fff8f8":"var(--surface)"}}>
                          <div>
                            <div style={{fontSize:13,fontWeight:500,color:"var(--ink)"}}>{b.category}</div>
                            {over&&<div style={{fontSize:11,color:"var(--red)",marginTop:2}}>⚠️ Almost at limit!</div>}
                            {warn&&<div style={{fontSize:11,color:"var(--amber)",marginTop:2}}>🔔 Getting close</div>}
                          </div>
                          <div style={{fontSize:13,color:"var(--ink2)"}}>₹{fmt(b.limit)}</div>
                          <div style={{fontSize:13,fontWeight:600,color:over?"var(--red)":warn?"var(--amber)":"var(--ink)"}}>₹{fmt(used)}</div>
                          <div>
                            <div style={{height:6,background:"#f3f4f6",borderRadius:99,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${pct}%`,borderRadius:99,transition:"width 1s ease",background:over?"var(--red)":warn?"var(--amber)":"var(--accent)"}}/>
                            </div>
                            <div style={{fontSize:10,color:"var(--ink3)",marginTop:3}}>{pct}% used</div>
                          </div>
                          <button onClick={()=>deleteBudget(b.category)} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--ink4)",padding:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// EOF