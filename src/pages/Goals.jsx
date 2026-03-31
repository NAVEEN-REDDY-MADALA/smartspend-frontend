import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  injectMobileCSS, fmt,
  Icon, ICONS, BottomNav, MobileHeader, LoadingScreen
} from "./MobileLayout";
import Settings from "./Settings";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --sb:#2d1b69; --accent:#7c5cbf; --accent2:#a78bfa;
    --bg:#f4f3f8; --surface:#fff; --border:#e5e7eb;
    --ink:#111827; --ink2:#374151; --ink3:#6b7280; --ink4:#9ca3af;
    --green:#059669; --gbg:#ecfdf5; --gborder:#a7f3d0;
    --red:#dc2626;   --rbg:#fef2f2; --rborder:#fecaca;
    --amber:#d97706; --abg:#fffbeb; --aborder:#fde68a;
    --blue:#2563eb;  --bbg:#eff6ff; --bborder:#bfdbfe;
    --purple:#7c3aed;--pbg:#f5f3ff; --pborder:#ddd6fe;
    --nav-h:64px;
  }
  html,body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pop{0%{transform:scale(.92);opacity:0}100%{transform:scale(1);opacity:1}}
  .fade{animation:fadeUp .25s ease both;}
  .slink{transition:background .15s,color .15s;cursor:pointer}
  .slink:hover{background:rgba(255,255,255,.09)!important;color:#fff!important}
  .slink.active{background:rgba(255,255,255,.16)!important;color:#fff!important}
  .gcard{transition:box-shadow .2s,transform .15s;}
  .gcard:hover{box-shadow:0 6px 24px rgba(0,0,0,.08)!important;transform:translateY(-2px);}
  .modal-overlay{animation:pop .2s ease both;}
  .inp{width:100%;padding:10px 13px;border-radius:8px;border:1.5px solid var(--border);font-size:14px;font-family:inherit;color:var(--ink);outline:none;background:var(--surface);transition:border-color .15s;}
  .inp:focus{border-color:var(--accent);}

  /* Sidebar (desktop) */
  .sidebar{width:210px;flex-shrink:0;background:var(--sb);display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow:hidden;}

  @media(max-width:900px){
    .sidebar{display:none!important;}
    .desk-hdr{display:none!important;}
    .desk-only{display:none!important;}
    .mob-only{display:flex!important;}
    .goals-content{padding:10px 12px calc(var(--nav-h) + 16px)!important;}
    .goals-grid{grid-template-columns:1fr!important;}
    .goal-stats-row{grid-template-columns:1fr 1fr!important;}
  }
  @media(min-width:901px){
    .mob-only{display:none!important;}
    .desk-hdr{display:flex!important;}
    .desk-only{display:grid!important;}
  }
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__goals_mob__")) return;
  const s=document.createElement("style"); s.id="__goals_mob__"; s.textContent=CSS;
  document.head.appendChild(s);
  injectMobileCSS();
}

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
const NAV_SECTIONS=[
  {label:null,items:[{to:"/dashboard",label:"Home",icon:"home"}]},
  {label:"Track Money",items:[
    {to:"/transactions",label:"Transactions",icon:"tx"},
    {to:"/analytics",label:"Analytics",icon:"analytics"},
    {to:"/goals",label:"My Goals",icon:"goals"},
    {to:"/budgets",label:"My Budgets",icon:"budget"},
  ]},
  {label:"Auto Features",items:[
    // {to:"/detected-transactions",label:"SMS Detected",icon:"detect"},
    {to:"/reminders",label:"Reminders",icon:"reminder"},
  ]},
  {label:"Account",items:[{to:"/settings",label:"Settings",icon:"home"}]},
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

/* ─── Add Amount Modal ────────────────────────────────────────────────────── */
function AddAmountModal({goal,savings,onConfirm,onClose}) {
  const [amount,setAmount]=useState("");
  const remaining=Math.max(0,goal.target_amount-goal.current_amount);
  const QUICK=[100,200,500,1000].filter(q=>q<=Math.min(remaining,savings));

  function submit(e) {
    e.preventDefault();
    const val=parseFloat(amount);
    if(isNaN(val)||val<=0||val>savings) return;
    onConfirm(goal.id,val);
    onClose();
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999,padding:"0"}}>
      <div className="modal-overlay" style={{background:"var(--surface)",borderRadius:"20px 20px 0 0",padding:"20px 20px 32px",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px rgba(0,0,0,.2)"}}>
        <div style={{width:36,height:4,background:"var(--border)",borderRadius:99,margin:"0 auto 16px"}}/>
        <div style={{fontSize:16,fontWeight:700,color:"var(--ink)",marginBottom:4}}>Add money to goal</div>
        <div style={{fontSize:13,color:"var(--ink3)",marginBottom:16}}>
          <strong style={{color:"var(--green)"}}>₹{fmt(savings)}</strong> available · Need <strong>₹{fmt(remaining)}</strong> more
        </div>
        {QUICK.length>0&&(
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            {QUICK.map(q=>(
              <button key={q} type="button" onClick={()=>setAmount(q.toString())}
                style={{padding:"6px 14px",borderRadius:99,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",
                  border:amount===q.toString()?"1.5px solid var(--accent)":"1.5px solid var(--border)",
                  background:amount===q.toString()?"rgba(124,92,191,.08)":"var(--surface)",
                  color:amount===q.toString()?"var(--accent)":"var(--ink3)"}}>₹{q}</button>
            ))}
          </div>
        )}
        <form onSubmit={submit}>
          <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>Custom amount (₹)</label>
          <input type="number" required min="1" max={savings} placeholder={`Up to ₹${fmt(savings)}`}
            value={amount} onChange={e=>setAmount(e.target.value)} className="inp" style={{marginBottom:8}}/>
          {remaining>0&&savings>0&&(
            <button type="button" onClick={()=>setAmount(Math.min(remaining,savings).toString())}
              style={{fontSize:12,color:"var(--accent)",background:"none",border:"none",cursor:"pointer",padding:0,marginBottom:14,fontFamily:"inherit",textDecoration:"underline"}}>
              Fill remaining ₹{fmt(Math.min(remaining,savings))}
            </button>
          )}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button type="submit" style={{flex:1,padding:"12px",borderRadius:10,background:"var(--accent)",border:"none",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Add Money ✓</button>
            <button type="button" onClick={onClose} style={{flex:1,padding:"12px",borderRadius:10,background:"transparent",border:"1px solid var(--border)",color:"var(--ink3)",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Mobile Goal Card ────────────────────────────────────────────────────── */
function GoalCardMobile({goal,savings,onDelete,onAddAmount}) {
  const pct=Math.min(100,Math.round((goal.current_amount/goal.target_amount)*100));
  const remaining=Math.max(0,goal.target_amount-goal.current_amount);
  const done=goal.status==="completed"||pct===100;
  const today=new Date(); today.setHours(0,0,0,0);
  const daysLeft=goal.target_date?Math.ceil((new Date(goal.target_date)-today)/86400000):null;
  const dailyNeeded=daysLeft!==null&&daysLeft>0&&remaining>0?Math.ceil(remaining/daysLeft):null;
  const monthlyNeeded=dailyNeeded?Math.ceil(dailyNeeded*30):null;

  let paceMsg=null;
  if(dailyNeeded!==null&&!done){
    if(dailyNeeded<=50) paceMsg={text:"Easy pace — totally doable!",color:"var(--green)",bg:"var(--gbg)"};
    else if(dailyNeeded<=150) paceMsg={text:"Moderate — skip a few coffees ☕",color:"var(--amber)",bg:"var(--abg)"};
    else if(dailyNeeded<=500) paceMsg={text:"Stretch — needs discipline 💪",color:"var(--amber)",bg:"var(--abg)"};
    else paceMsg={text:"Very ambitious — extend deadline?",color:"var(--red)",bg:"var(--rbg)"};
  }
  const milestone=pct>=75?"🏁 Almost there!":pct>=50?"⚡ Halfway!":pct>=25?"📈 Good start!":null;
  const accentColor=done?"var(--green)":"var(--accent)";

  return (
    <div className="fade gcard" style={{background:"var(--surface)",borderRadius:14,padding:"16px",border:"1px solid var(--border)",borderTop:`3px solid ${accentColor}`,boxShadow:"0 1px 6px rgba(0,0,0,.05)",marginBottom:10}}>
      {/* Title row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--ink)"}}>{goal.title}</div>
          {goal.description&&<div style={{fontSize:12,color:"var(--ink3)",marginTop:2,lineHeight:1.4}}>{goal.description}</div>}
        </div>
        <span style={{marginLeft:8,flexShrink:0,padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:600,background:done?"var(--gbg)":"rgba(124,92,191,.1)",color:done?"var(--green)":"var(--accent)"}}>
          {done?"✓ Done":"Active"}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:11,color:"var(--ink3)"}}>Progress</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {milestone&&<span style={{fontSize:10,color:"var(--accent)",fontWeight:600}}>{milestone}</span>}
            <span style={{fontSize:12,fontWeight:700,color:done?"var(--green)":"var(--ink)"}}>{pct}%</span>
          </div>
        </div>
        <div style={{height:7,background:"#f3f4f6",borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,borderRadius:99,transition:"width 1s ease",background:done?"var(--green)":pct>=75?"#7c5cbf":"var(--accent)"}}/>
        </div>
      </div>

      {/* Stats */}
      <div className="goal-stats-row" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
        {[
          {label:"Saved",value:`₹${fmt(goal.current_amount)}`,h:false},
          {label:"Target",value:`₹${fmt(goal.target_amount)}`,h:false},
          {label:"Needed",value:done?"Done 🎉":`₹${fmt(remaining)}`,h:!done&&remaining>0},
        ].map(s=>(
          <div key={s.label} style={{background:s.h?"var(--abg)":"#f9fafb",borderRadius:8,padding:"7px 8px",border:s.h?"1px solid var(--aborder)":"none"}}>
            <div style={{fontSize:10,color:"var(--ink4)",marginBottom:2}}>{s.label}</div>
            <div style={{fontSize:12,fontWeight:700,color:s.h?"var(--amber)":"var(--ink)"}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Daily/monthly insight */}
      {dailyNeeded!==null&&!done&&(
        <div style={{marginBottom:10,padding:"10px 12px",borderRadius:9,background:"linear-gradient(135deg,#faf5ff,#f0ebff)",border:"1px solid #ddd6fe"}}>
          <div style={{fontSize:10,fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>💰 To hit this goal on time</div>
          <div style={{display:"flex",gap:16}}>
            <div><div style={{fontSize:18,fontWeight:800,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>₹{fmt(dailyNeeded)}</div><div style={{fontSize:10,color:"var(--ink3)"}}>per day</div></div>
            <div><div style={{fontSize:18,fontWeight:800,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>₹{fmt(monthlyNeeded)}</div><div style={{fontSize:10,color:"var(--ink3)"}}>per month</div></div>
          </div>
          {paceMsg&&<div style={{marginTop:7,padding:"4px 8px",borderRadius:6,background:paceMsg.bg,color:paceMsg.color,fontSize:11,fontWeight:500}}>{paceMsg.text}</div>}
        </div>
      )}

      {/* Date badge */}
      {daysLeft!==null&&(
        <div style={{fontSize:11,marginBottom:10,padding:"4px 9px",borderRadius:6,display:"inline-block",
          background:daysLeft<0?"var(--rbg)":daysLeft<30?"var(--abg)":"#f3f4f6",
          color:daysLeft<0?"var(--red)":daysLeft<30?"var(--amber)":"var(--ink3)"}}>
          {daysLeft<0?`⚠️ Overdue by ${Math.abs(daysLeft)} days`:daysLeft===0?"⏰ Due today!":`📅 ${daysLeft} days left`}
        </div>
      )}

      {/* Actions */}
      {!done?(
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8}}>
          <button onClick={()=>onAddAmount(goal)}
            style={{padding:"10px",borderRadius:9,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            + Add Money
          </button>
          <button onClick={()=>onDelete(goal.id)}
            style={{padding:"10px 14px",borderRadius:9,background:"var(--rbg)",border:"1px solid var(--rborder)",color:"var(--red)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
            Delete
          </button>
        </div>
      ):(
        <button onClick={()=>onDelete(goal.id)}
          style={{width:"100%",padding:"10px",borderRadius:9,background:"var(--rbg)",border:"1px solid var(--rborder)",color:"var(--red)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
          Remove Goal
        </button>
      )}
    </div>
  );
}

/* ─── Desktop Goal Card (original style) ─────────────────────────────────── */
function GoalCardDesktop({goal,savings,onDelete,onAddAmount}) {
  const pct=Math.min(100,Math.round((goal.current_amount/goal.target_amount)*100));
  const remaining=Math.max(0,goal.target_amount-goal.current_amount);
  const done=goal.status==="completed"||pct===100;
  const today=new Date(); today.setHours(0,0,0,0);
  const daysLeft=goal.target_date?Math.ceil((new Date(goal.target_date)-today)/86400000):null;
  const dailyNeeded=daysLeft!==null&&daysLeft>0&&remaining>0?Math.ceil(remaining/daysLeft):null;
  const monthlyNeeded=dailyNeeded?Math.ceil(dailyNeeded*30):null;
  let paceMsg=null;
  if(dailyNeeded!==null&&!done){
    if(dailyNeeded<=50) paceMsg={text:"Easy pace — totally doable!",color:"var(--green)",bg:"var(--gbg)"};
    else if(dailyNeeded<=150) paceMsg={text:"Moderate — skip a few coffees a day ☕",color:"var(--amber)",bg:"var(--abg)"};
    else if(dailyNeeded<=500) paceMsg={text:"Stretch goal — needs discipline 💪",color:"var(--amber)",bg:"var(--abg)"};
    else paceMsg={text:"Very ambitious — consider extending deadline",color:"var(--red)",bg:"var(--rbg)"};
  }
  const milestone=pct>=75?"🏁 Almost there!":pct>=50?"⚡ Halfway!":pct>=25?"📈 Good start!":null;
  return (
    <div className="gcard" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)",borderTop:`3px solid ${done?"var(--green)":"var(--accent)"}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--ink)",marginBottom:2}}>{goal.title}</div>
          {goal.description&&<div style={{fontSize:12,color:"var(--ink3)",lineHeight:1.5}}>{goal.description}</div>}
        </div>
        <span style={{marginLeft:10,flexShrink:0,padding:"3px 9px",borderRadius:99,fontSize:10,fontWeight:600,background:done?"var(--gbg)":"rgba(124,92,191,.1)",color:done?"var(--green)":"var(--accent)"}}>
          {done?"✓ Completed":"Active"}
        </span>
      </div>
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:12,color:"var(--ink3)"}}>Progress</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {milestone&&<span style={{fontSize:10,color:"var(--accent)",fontWeight:600}}>{milestone}</span>}
            <span style={{fontSize:12,fontWeight:700,color:done?"var(--green)":"var(--ink)"}}>{pct}%</span>
          </div>
        </div>
        <div style={{height:8,background:"#f3f4f6",borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,borderRadius:99,transition:"width 1s ease",background:done?"var(--green)":pct>=75?"#7c5cbf":"var(--accent)"}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[{label:"Saved so far",value:`₹${fmt(goal.current_amount)}`,h:false},{label:"Target",value:`₹${fmt(goal.target_amount)}`,h:false},{label:"Still needed",value:done?"Done! 🎉":`₹${fmt(remaining)}`,h:!done&&remaining>0}].map(s=>(
          <div key={s.label} style={{background:s.h?"var(--abg)":"#f9fafb",borderRadius:7,padding:"8px 10px",border:s.h?"1px solid #fde68a":"none"}}>
            <div style={{fontSize:10,color:"var(--ink4)",marginBottom:3}}>{s.label}</div>
            <div style={{fontSize:12,fontWeight:700,color:s.h?"var(--amber)":"var(--ink)"}}>{s.value}</div>
          </div>
        ))}
      </div>
      {dailyNeeded!==null&&!done&&(
        <div style={{marginBottom:12,padding:"12px 14px",borderRadius:9,background:"linear-gradient(135deg,#faf5ff,#f0ebff)",border:"1px solid #ddd6fe"}}>
          <div style={{fontSize:10,fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>💰 To reach this goal on time</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><div style={{fontSize:20,fontWeight:800,color:"var(--ink)"}}>₹{fmt(dailyNeeded)}</div><div style={{fontSize:11,color:"var(--ink3)"}}>per day</div></div>
            <div><div style={{fontSize:20,fontWeight:800,color:"var(--ink)"}}>₹{fmt(monthlyNeeded)}</div><div style={{fontSize:11,color:"var(--ink3)"}}>per month</div></div>
          </div>
          {paceMsg&&<div style={{marginTop:8,padding:"5px 9px",borderRadius:6,background:paceMsg.bg,color:paceMsg.color,fontSize:11,fontWeight:500}}>{paceMsg.text}</div>}
        </div>
      )}
      {daysLeft===null&&!done&&remaining>0&&(
        <div style={{marginBottom:12,padding:"10px 12px",borderRadius:8,background:"var(--bbg)",border:"1px solid #bfdbfe",fontSize:12,color:"var(--blue)"}}>
          💡 Set a target date to see how much you need to save per day!
        </div>
      )}
      {daysLeft!==null&&(
        <div style={{fontSize:11,marginBottom:14,padding:"5px 10px",borderRadius:6,display:"inline-block",background:daysLeft<0?"var(--rbg)":daysLeft<30?"var(--abg)":"#f3f4f6",color:daysLeft<0?"var(--red)":daysLeft<30?"var(--amber)":"var(--ink3)"}}>
          {daysLeft<0?`⚠️ Overdue by ${Math.abs(daysLeft)} days — extend deadline?`:daysLeft===0?"⏰ Due today!":`📅 ${daysLeft} days left — ${new Date(goal.target_date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}`}
        </div>
      )}
      {!done?(
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>onAddAmount(goal)} style={{flex:1,padding:"9px",borderRadius:8,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ Add Money</button>
          <button onClick={()=>onDelete(goal.id)} style={{padding:"9px 14px",borderRadius:8,background:"var(--rbg)",border:"1px solid #fecaca",color:"var(--red)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
        </div>
      ):(
        <button onClick={()=>onDelete(goal.id)} style={{width:"100%",padding:"9px",borderRadius:8,background:"var(--rbg)",border:"1px solid #fecaca",color:"var(--red)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Remove Goal</button>
      )}
    </div>
  );
}

/* ─── Mobile Create Goal Sheet ────────────────────────────────────────────── */
function CreateGoalSheet({onClose,onSubmit,message}) {
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [targetAmount,setTargetAmount]=useState("");
  const [targetDate,setTargetDate]=useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({title,description:description||null,target_amount:parseFloat(targetAmount),target_date:targetDate||null});
    setTitle(""); setDescription(""); setTargetAmount(""); setTargetDate("");
  }

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:200}}/>
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:201,background:"var(--surface)",borderRadius:"20px 20px 0 0",maxHeight:"85vh",overflowY:"auto",paddingBottom:"env(safe-area-inset-bottom,16px)"}}>
        <div style={{width:36,height:4,background:"var(--border)",borderRadius:99,margin:"10px auto 0"}}/>
        <div style={{padding:"16px 20px"}}>
          <div style={{fontSize:16,fontWeight:700,color:"var(--ink)",marginBottom:16}}>+ Create a new goal</div>
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:13}}>
              <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>What are you saving for? *</label>
              <input type="text" required placeholder="e.g. New laptop, Trip to Goa…" value={title} onChange={e=>setTitle(e.target.value)} className="inp"/>
            </div>
            <div style={{marginBottom:13}}>
              <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>A bit more detail (optional)</label>
              <textarea placeholder="Why is this goal important to you?" value={description} onChange={e=>setDescription(e.target.value)} className="inp" style={{minHeight:56,resize:"vertical"}}/>
            </div>
            <div style={{marginBottom:13}}>
              <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>How much do you need? (₹) *</label>
              <input type="number" required min="1" step="1" placeholder="e.g. 15000" value={targetAmount} onChange={e=>setTargetAmount(e.target.value)} className="inp"/>
            </div>
            <div style={{marginBottom:6}}>
              <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>When do you want to reach it?</label>
              <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} className="inp"/>
              <div style={{fontSize:11,color:"var(--ink4)",marginTop:4}}>💡 Set a date to see your daily savings plan</div>
            </div>
            {message&&(
              <div style={{marginTop:10,marginBottom:10,padding:"10px 13px",borderRadius:7,fontSize:12,background:message.ok?"var(--gbg)":"var(--rbg)",color:message.ok?"var(--green)":"var(--red)",border:`1px solid ${message.ok?"#bbf7d0":"#fecaca"}`}}>
                {message.text}
              </div>
            )}
            <button type="submit" style={{width:"100%",marginTop:14,padding:"12px",borderRadius:10,background:"var(--accent)",border:"none",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Create Goal</button>
          </form>
        </div>
      </div>
    </>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function Goals() {
  injectCSS();
  const navigate=useNavigate();
  const token=localStorage.getItem("token");
  const API="https://smartspend-backend-production-6f21.up.railway.app";

  const [goals,setGoals]=useState([]);
  const [savings,setSavings]=useState(0);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState(null);
  const [modalGoal,setModalGoal]=useState(null);
  const [showCreateSheet,setShowCreateSheet]=useState(false);

  // Desktop form state
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [targetAmount,setTargetAmount]=useState("");
  const [targetDate,setTargetDate]=useState("");

  useEffect(()=>{
    if(!token){navigate("/",{replace:true});return;}
    loadAll();
  },[]);

  async function loadAll() {
    try{await Promise.all([loadGoals(),loadSavings()]);}
    finally{setLoading(false);}
  }
  async function loadGoals() {
    const r=await fetch(`${API}/api/goals/`,{headers:{Authorization:`Bearer ${token}`}});
    if(r.ok) setGoals(await r.json());
  }
  async function loadSavings() {
    const r=await fetch(`${API}/api/summary/`,{headers:{Authorization:`Bearer ${token}`}});
    if(r.ok){const d=await r.json();setSavings(d.savings||0);}
  }

  async function createGoal(data) {
    const r=await fetch(`${API}/api/goals/`,{
      method:"POST",
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
      body:JSON.stringify(data),
    });
    if(!r.ok){setMessage({text:"Something went wrong. Try again.",ok:false});return;}
    setMessage({text:`"${data.title}" created! 🎯`,ok:true});
    loadGoals();
    setTimeout(()=>setMessage(null),4000);
  }

  async function createGoalDesktop(e) {
    e.preventDefault();
    await createGoal({title,description:description||null,target_amount:parseFloat(targetAmount),target_date:targetDate||null});
    setTitle(""); setDescription(""); setTargetAmount(""); setTargetDate("");
  }

  async function deleteGoal(id) {
    const r=await fetch(`${API}/api/goals/${id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
    if(r.ok) loadGoals();
  }
  async function addAmountToGoal(goalId,amount) {
    const r=await fetch(`${API}/api/goals/${goalId}/add-amount?amount=${amount}`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});
    if(!r.ok){const err=await r.json().catch(()=>{});alert(err?.detail||"Failed to add amount");return;}
    loadAll();
  }
  function logout(){localStorage.removeItem("token");navigate("/",{replace:true});}

  const active=goals.filter(g=>g.status!=="completed");
  const completed=goals.filter(g=>g.status==="completed");
  const totalNeeded=active.reduce((s,g)=>s+Math.max(0,g.target_amount-g.current_amount),0);

  if(loading) return <LoadingScreen text="Loading your goals…"/>;

  const MobHeaderRight=(
    <button onClick={()=>setShowCreateSheet(true)}
      style={{width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,.3)",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
      <Icon d={ICONS.plus} size={16} color="#fff"/>
    </button>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout}/>
      <BottomNav/>

      {/* Modals */}
      {modalGoal&&(
        <AddAmountModal goal={modalGoal} savings={savings} onConfirm={addAmountToGoal} onClose={()=>setModalGoal(null)}/>
      )}
      {showCreateSheet&&(
        <CreateGoalSheet
          onClose={()=>setShowCreateSheet(false)}
          onSubmit={async(data)=>{await createGoal(data);setShowCreateSheet(false);}}
          message={message}
        />
      )}

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Mobile header */}
        <MobileHeader
          title="My Goals 🎯"
          subtitle={`${active.length} active · ₹${savings>=0?fmt(savings):"0"} available`}
          right={MobHeaderRight}
        />

        {/* Desktop header */}
        <div className="desk-hdr" style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)"}}>My Goals 🎯</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>Save up for things that matter — one goal at a time</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <div style={{padding:"10px 16px",borderRadius:8,background:savings>=0?"var(--gbg)":"var(--rbg)",border:`1px solid ${savings>=0?"#bbf7d0":"#fecaca"}`}}>
              <div style={{fontSize:10,color:savings>=0?"var(--green)":"var(--red)",fontWeight:600,marginBottom:1}}>Available to invest</div>
              <div style={{fontSize:17,fontWeight:700,color:savings>=0?"var(--green)":"var(--red)"}}>₹{fmt(Math.abs(savings))}{savings<0&&<span style={{fontSize:11}}> (overspent)</span>}</div>
            </div>
            {active.length>0&&totalNeeded>0&&(
              <div style={{padding:"10px 16px",borderRadius:8,background:"#faf5ff",border:"1px solid #ddd6fe"}}>
                <div style={{fontSize:10,color:"var(--accent)",fontWeight:600,marginBottom:1}}>Total still needed</div>
                <div style={{fontSize:17,fontWeight:700,color:"var(--accent)"}}>₹{fmt(totalNeeded)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="goals-content" style={{flex:1,overflowY:"auto",padding:"16px 20px 28px",background:"var(--bg)"}}>

          {/* Mobile: goals list */}
          <div className="mob-only" style={{flexDirection:"column"}}>
            {/* Savings summary bar */}
            <div className="fade" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <div style={{background:savings>=0?"var(--gbg)":"var(--rbg)",border:`1px solid ${savings>=0?"var(--gborder)":"var(--rborder)"}`,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:10,fontWeight:700,color:savings>=0?"var(--green)":"var(--red)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:2}}>Available</div>
                <div style={{fontSize:16,fontWeight:800,color:savings>=0?"var(--green)":"var(--red)",fontFamily:"'Sora',sans-serif"}}>₹{fmt(Math.abs(savings))}</div>
              </div>
              <div style={{background:"var(--pbg)",border:"1px solid var(--pborder)",borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--purple)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:2}}>Goals</div>
                <div style={{fontSize:16,fontWeight:800,color:"var(--purple)",fontFamily:"'Sora',sans-serif"}}>{active.length} active</div>
              </div>
            </div>

            {goals.length===0?(
              <div className="fade" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"48px 20px",textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:10}}>🎯</div>
                <div style={{fontSize:15,fontWeight:600,color:"var(--ink2)",marginBottom:6}}>No goals yet</div>
                <div style={{fontSize:13,color:"var(--ink3)",marginBottom:16}}>Tap + to create your first goal!</div>
                <button onClick={()=>setShowCreateSheet(true)} style={{padding:"10px 24px",borderRadius:9,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ Create Goal</button>
              </div>
            ):(
              <>
                {active.length>0&&(
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>In Progress ({active.length})</div>
                    {active.map(g=><GoalCardMobile key={g.id} goal={g} savings={savings} onDelete={deleteGoal} onAddAmount={setModalGoal}/>)}
                  </div>
                )}
                {completed.length>0&&(
                  <div style={{marginTop:8}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Completed 🎉 ({completed.length})</div>
                    {completed.map(g=><GoalCardMobile key={g.id} goal={g} savings={savings} onDelete={deleteGoal} onAddAmount={setModalGoal}/>)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Desktop: two-column layout */}
          <div className="desk-only goals-grid" style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:20,alignItems:"start"}}>
            {/* Create form */}
            <div className="fade" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",fontWeight:600,fontSize:13,color:"var(--ink)"}}>+ Create a new goal</div>
              <div style={{padding:"20px"}}>
                <form onSubmit={createGoalDesktop}>
                  <div style={{marginBottom:13}}>
                    <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>What are you saving for? *</label>
                    <input type="text" required placeholder="e.g. New laptop, Trip to Goa…" value={title} onChange={e=>setTitle(e.target.value)} className="inp"/>
                  </div>
                  <div style={{marginBottom:13}}>
                    <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>A bit more detail (optional)</label>
                    <textarea placeholder="Why is this goal important to you?" value={description} onChange={e=>setDescription(e.target.value)} className="inp" style={{minHeight:56,resize:"vertical"}}/>
                  </div>
                  <div style={{marginBottom:13}}>
                    <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>How much do you need? (₹) *</label>
                    <input type="number" required min="1" step="1" placeholder="e.g. 15000" value={targetAmount} onChange={e=>setTargetAmount(e.target.value)} className="inp"/>
                  </div>
                  <div style={{marginBottom:6}}>
                    <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>When do you want to reach it?</label>
                    <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} className="inp"/>
                    <div style={{fontSize:11,color:"var(--ink4)",marginTop:4}}>💡 Set a date to see your daily savings plan</div>
                  </div>
                  <button type="submit" style={{width:"100%",marginTop:16,padding:"10px",borderRadius:8,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Create Goal</button>
                </form>
                {message&&(
                  <div style={{marginTop:12,padding:"10px 13px",borderRadius:7,fontSize:12,background:message.ok?"var(--gbg)":"var(--rbg)",color:message.ok?"var(--green)":"var(--red)",border:`1px solid ${message.ok?"#bbf7d0":"#fecaca"}`}}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>

            {/* Goals list (desktop) */}
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {goals.length===0?(
                <div className="fade" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"56px 20px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:12}}>🎯</div>
                  <div style={{fontSize:15,fontWeight:600,color:"var(--ink2)",marginBottom:6}}>No goals yet</div>
                  <div style={{fontSize:13,color:"var(--ink3)"}}>Create your first goal and start saving!</div>
                </div>
              ):(
                <>
                  {active.length>0&&(
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>In Progress ({active.length})</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
                        {active.map(g=><GoalCardDesktop key={g.id} goal={g} savings={savings} onDelete={deleteGoal} onAddAmount={setModalGoal}/>)}
                      </div>
                    </div>
                  )}
                  {completed.length>0&&(
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--green)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Completed 🎉 ({completed.length})</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
                        {completed.map(g=><GoalCardDesktop key={g.id} goal={g} savings={savings} onDelete={deleteGoal} onAddAmount={setModalGoal}/>)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}