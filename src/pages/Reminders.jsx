import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  .rcard{transition:box-shadow .2s,transform .15s;}
  .rcard:hover{box-shadow:0 6px 24px rgba(0,0,0,.08)!important;transform:translateY(-2px);}
  .abtn{transition:opacity .15s;cursor:pointer;}
  .abtn:hover{opacity:.85;}
  .inp{width:100%;padding:10px 13px;border-radius:8px;border:1.5px solid var(--border);font-size:14px;font-family:inherit;color:var(--ink);outline:none;background:var(--surface);transition:border-color .15s;}
  .inp:focus{border-color:var(--accent);}

  .sidebar{width:210px;flex-shrink:0;background:var(--sb);display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow:hidden;}

  @media(max-width:900px){
    .sidebar{display:none!important;}
    .desk-hdr{display:none!important;}
    .desk-only{display:none!important;}
    .mob-only{display:flex!important;}
    .rem-content{padding:10px 12px calc(var(--nav-h) + 16px)!important;}
  }
  @media(min-width:901px){
    .mob-only{display:none!important;}
    .desk-hdr{display:flex!important;}
    .desk-only{display:grid!important;}
  }
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__rem_mob__")) return;
  const s=document.createElement("style"); s.id="__rem_mob__"; s.textContent=CSS;
  document.head.appendChild(s);
  injectMobileCSS();
}

const CAT_ICONS={Bills:"📄",Subscription:"📺",EMI:"💳",Insurance:"🛡️",Rent:"🏠",Other:"💰"};
const MODAL_CATEGORIES=["Bills","Subscription","EMI","Insurance","Rent","Other"];

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

function daysUntil(dateStr) {
  const today=new Date(); today.setHours(0,0,0,0);
  const due=new Date(dateStr); due.setHours(0,0,0,0);
  return Math.ceil((due-today)/86400000);
}

function ordinal(d) {
  if(d>3&&d<21) return `${d}th`;
  switch(d%10){case 1:return `${d}st`;case 2:return `${d}nd`;case 3:return `${d}rd`;default:return `${d}th`;}
}

/* ─── Mobile Reminder Card ────────────────────────────────────────────────── */
function ReminderCardMobile({r,onPaid,onDelete,paying,deleting}) {
  const days=daysUntil(r.next_payment_date);
  const overdue=days<0;
  const urgent=days>=0&&days<=1;
  const warn=days>1&&days<=7;
  const urgencyColor=overdue||urgent?"var(--red)":warn?"var(--amber)":"var(--green)";
  const urgencyBg=overdue||urgent?"var(--rbg)":warn?"var(--abg)":"var(--gbg)";
  const urgencyBorder=overdue||urgent?"#fecaca":warn?"#fde68a":"#bbf7d0";
  const urgencyLabel=overdue?`⚠️ ${Math.abs(days)}d overdue!`:days===0?"⚠️ Due today!":days===1?"Due tomorrow":`${days} days left`;
  const busy=paying||deleting;

  return (
    <div className="fade" style={{background:"var(--surface)",borderRadius:14,padding:"14px",border:"1px solid var(--border)",borderLeft:`4px solid ${urgencyColor}`,boxShadow:"0 1px 6px rgba(0,0,0,.04)",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{width:40,height:40,borderRadius:10,background:"#faf5ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
          {CAT_ICONS[r.category]||"💰"}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:700,color:"var(--ink)",lineHeight:1.2}}>{r.name}</div>
          <div style={{fontSize:11,color:"var(--ink3)",marginTop:2}}>{r.category}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:800,color:"var(--accent)",fontFamily:"'Sora',sans-serif"}}>₹{fmt(r.amount)}</div>
          <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:99,background:urgencyBg,color:urgencyColor,border:`1px solid ${urgencyBorder}`,display:"inline-block",marginTop:3}}>
            {urgencyLabel}
          </span>
        </div>
      </div>

      <div style={{fontSize:12,color:"var(--ink3)",marginBottom:10}}>
        Next: <strong style={{color:"var(--ink)"}}>
          {new Date(r.next_payment_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
        </strong>
        {r.auto_pay&&<span style={{marginLeft:8,fontSize:10,fontWeight:600,color:"var(--blue)",background:"var(--bbg)",padding:"1px 7px",borderRadius:99,border:"1px solid var(--bborder)"}}>⚡ Auto-Pay</span>}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8}}>
        <button className="abtn" onClick={()=>onPaid(r.id)} disabled={busy}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"10px",borderRadius:9,border:"none",background:busy?"#f3f4f6":"var(--green)",color:busy?"var(--ink4)":"#fff",fontSize:12,fontWeight:600,cursor:busy?"not-allowed":"pointer",fontFamily:"inherit"}}>
          {paying?<span style={{animation:"spin .7s linear infinite",display:"inline-block"}}>⟳</span>:<Icon d={ICONS.check} size={12}/>}
          {paying?"Marking…":"I've paid this"}
        </button>
        <button className="abtn" onClick={()=>onDelete(r.id)} disabled={busy}
          style={{padding:"10px 13px",borderRadius:9,border:"1px solid var(--border)",background:busy?"#f3f4f6":"var(--rbg)",color:busy?"var(--ink4)":"var(--red)",fontSize:12,cursor:busy?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
          <Icon d={ICONS.trash} size={12}/>
          {deleting?"…":"Delete"}
        </button>
      </div>
    </div>
  );
}

/* ─── Desktop Reminder Card ───────────────────────────────────────────────── */
function ReminderCardDesktop({r,onPaid,onDelete,paying,deleting}) {
  const days=daysUntil(r.next_payment_date);
  const overdue=days<0;
  const urgent=days>=0&&days<=1;
  const warn=days>1&&days<=7;
  const urgencyColor=overdue||urgent?"var(--red)":warn?"var(--amber)":"var(--green)";
  const urgencyBg=overdue||urgent?"var(--rbg)":warn?"var(--abg)":"var(--gbg)";
  const urgencyBorder=overdue||urgent?"#fecaca":warn?"#fde68a":"#bbf7d0";
  const urgencyLabel=overdue?`⚠️ ${Math.abs(days)} day${Math.abs(days)!==1?"s":""} overdue!`:days===0?"⚠️ Due today!":days===1?"Due tomorrow":`${days} days left`;
  const notifChips=[r.notify_7_days&&"7 days before",r.notify_3_days&&"3 days before",r.notify_1_day&&"1 day before",r.notify_same_day&&"On the day"].filter(Boolean);
  return (
    <div className="rcard" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)",borderTop:`3px solid ${urgencyColor}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:9,background:"#faf5ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{CAT_ICONS[r.category]||"💰"}</div>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:"var(--ink)"}}>{r.name}</div>
            <div style={{fontSize:11,color:"var(--ink3)",marginTop:1}}>{r.category}</div>
          </div>
        </div>
        <div style={{fontSize:20,fontWeight:700,color:"var(--accent)"}}>₹{fmt(r.amount)}</div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,color:"var(--ink3)"}}>Next: <strong style={{color:"var(--ink)"}}>{new Date(r.next_payment_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</strong></div>
        <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:99,background:urgencyBg,color:urgencyColor,border:`1px solid ${urgencyBorder}`}}>{urgencyLabel}</span>
      </div>
      {notifChips.length>0&&(
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,color:"var(--ink4)",marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Remind me</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {notifChips.map(c=><span key={c} style={{fontSize:10,fontWeight:500,padding:"2px 8px",borderRadius:99,background:"var(--gbg)",color:"var(--green)",border:"1px solid #bbf7d0"}}>📅 {c}</span>)}
          </div>
        </div>
      )}
      {r.auto_pay&&<div style={{fontSize:11,fontWeight:600,color:"var(--blue)",background:"var(--bbg)",padding:"5px 10px",borderRadius:6,marginBottom:10,border:"1px solid #bfdbfe",display:"inline-block"}}>⚡ Auto-Pay on</div>}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button className="abtn" onClick={()=>onPaid(r.id)} disabled={paying||deleting}
          style={{flex:1,padding:"9px",borderRadius:7,border:"none",background:paying?"#f3f4f6":"var(--green)",color:paying?"var(--ink4)":"#fff",fontSize:12,fontWeight:600,fontFamily:"inherit",cursor:paying?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
          {paying?<span style={{animation:"spin .7s linear infinite",display:"inline-block"}}>⟳</span>:<Icon d={ICONS.check} size={12}/>}
          {paying?"Marking…":"I've paid this"}
        </button>
        <button className="abtn" onClick={()=>onDelete(r.id)} disabled={paying||deleting}
          style={{padding:"9px 13px",borderRadius:7,border:"1px solid var(--border)",background:deleting?"#f3f4f6":"var(--rbg)",color:deleting?"var(--ink4)":"var(--red)",fontSize:12,fontFamily:"inherit",cursor:deleting?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:4}}>
          <Icon d={ICONS.trash} size={12}/>{deleting?"…":"Delete"}
        </button>
      </div>
    </div>
  );
}

/* ─── Add Modal / Sheet ───────────────────────────────────────────────────── */
const ModalField=({label,required,children})=>(
  <div style={{marginBottom:14}}>
    <label style={{fontSize:12,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:5}}>{label}{required&&<span style={{color:"var(--red)"}}> *</span>}</label>
    {children}
  </div>
);

function AddModal({token,onClose,onSuccess,isMobile}) {
  const [form,setForm]=useState({
    name:"",amount:"",category:"Bills",day_of_month:"1",
    notify_7_days:true,notify_3_days:false,notify_1_day:true,notify_same_day:true,auto_pay:false,
  });
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const API="https://smartspend-backend-production-6f21.up.railway.app";

  function set(k,v){setForm(f=>({...f,[k]:v}));}

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const r=await fetch(`${API}/api/reminders/`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({...form,amount:parseFloat(form.amount),day_of_month:parseInt(form.day_of_month),frequency:"monthly"}),
      });
      const data=await r.json();
      if(r.ok){onSuccess();}
      else{setError(data.detail||"Something went wrong. Try again.");}
    } catch{setError("Network error. Check your connection.");}
    finally{setLoading(false);}
  }

  const content=(
    <form onSubmit={submit} style={{padding:"20px"}}>
      <ModalField label="What's the payment for?" required>
        <input type="text" required placeholder="e.g. Netflix, Hostel rent, Phone EMI…" value={form.name} onChange={e=>set("name",e.target.value)} className="inp"/>
      </ModalField>
      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:12,marginBottom:14}}>
        <ModalField label="Amount (₹)" required>
          <input type="number" required min="0" step="0.01" placeholder="499" value={form.amount} onChange={e=>set("amount",e.target.value)} className="inp"/>
        </ModalField>
        <ModalField label="Day of month" required>
          <select value={form.day_of_month} onChange={e=>set("day_of_month",e.target.value)} className="inp">
            {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{ordinal(d)}</option>)}
          </select>
        </ModalField>
      </div>
      <ModalField label="Category">
        <select value={form.category} onChange={e=>set("category",e.target.value)} className="inp">
          {MODAL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </ModalField>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:500,color:"var(--ink2)",marginBottom:8}}>Remind me before it's due</div>
        <div style={{background:"#f9fafb",borderRadius:8,padding:"10px 12px",display:"grid",gap:8}}>
          {[{key:"notify_7_days",label:"7 days before"},{key:"notify_3_days",label:"3 days before"},{key:"notify_1_day",label:"1 day before"},{key:"notify_same_day",label:"On the same day"}].map(n=>(
            <label key={n.key} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--ink2)",cursor:"pointer"}}>
              <input type="checkbox" checked={form[n.key]} onChange={e=>set(n.key,e.target.checked)} style={{accentColor:"var(--accent)",width:14,height:14}}/>
              {n.label}
            </label>
          ))}
        </div>
      </div>
      <div style={{marginBottom:18}}>
        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--ink2)",cursor:"pointer"}}>
          <input type="checkbox" checked={form.auto_pay} onChange={e=>set("auto_pay",e.target.checked)} style={{accentColor:"var(--accent)",width:14,height:14}}/>
          ⚡ Auto-pay is on for this (tracking only)
        </label>
      </div>
      {error&&<div style={{marginBottom:14,padding:"10px 13px",borderRadius:7,background:"var(--rbg)",color:"var(--red)",border:"1px solid #fecaca",fontSize:12}}>⚠️ {error}</div>}
      <button type="submit" disabled={loading} style={{width:"100%",padding:"12px",borderRadius:9,background:loading?"#f3f4f6":"var(--accent)",border:"none",color:loading?"var(--ink4)":"#fff",fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
        {loading?"Saving…":"Save Reminder"}
      </button>
    </form>
  );

  if(isMobile) return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:200}}/>
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:201,background:"var(--surface)",borderRadius:"20px 20px 0 0",maxHeight:"88vh",overflowY:"auto",paddingBottom:"env(safe-area-inset-bottom,16px)",animation:"slideUp .3s ease"}}>
        <div style={{width:36,height:4,background:"var(--border)",borderRadius:99,margin:"10px auto 0"}}/>
        <div style={{padding:"16px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:16,fontWeight:700,color:"var(--ink)"}}>+ Add a payment reminder</div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:"50%",border:"none",background:"#f3f4f6",color:"var(--ink3)",cursor:"pointer",fontSize:14}}>✕</button>
        </div>
        {content}
      </div>
    </>
  );

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",borderRadius:12,width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--ink)"}}>+ Add a payment reminder</div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:"50%",border:"none",background:"#f3f4f6",color:"var(--ink3)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon d={ICONS.x} size={13}/>
          </button>
        </div>
        {content}
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function Reminders() {
  injectCSS();
  const navigate=useNavigate();
  const token=localStorage.getItem("token");

  const [reminders,setReminders]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showModal,setShowModal]=useState(false);
  const [paying,setPaying]=useState(null);
  const [deleting,setDeleting]=useState(null);
  const [toast,setToast]=useState(null);
  const [isMobile,setIsMobile]=useState(window.innerWidth<=900);

  const API="https://smartspend-backend-production-6f21.up.railway.app";

  useEffect(()=>{
    const onResize=()=>setIsMobile(window.innerWidth<=900);
    window.addEventListener("resize",onResize);
    return()=>window.removeEventListener("resize",onResize);
  },[]);

  useEffect(()=>{
    if(!token){navigate("/");return;}
    load();
  },[]);

  async function load() {
    setLoading(true);
    try {
      const r=await fetch(`${API}/api/reminders/`,{headers:{Authorization:`Bearer ${token}`}});
      if(r.ok) setReminders(await r.json());
    } finally{setLoading(false);}
  }

  function showToast(text,ok=true){setToast({text,ok});setTimeout(()=>setToast(null),3500);}

  async function markPaid(id) {
    setPaying(id);
    try {
      const r=await fetch(`${API}/api/reminders/${id}/mark-paid`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});
      if(r.ok){showToast("Marked as paid and added to your expenses ✓");load();}
      else showToast("Couldn't mark as paid. Try again.",false);
    } finally{setPaying(null);}
  }

  async function deleteReminder(id) {
    setDeleting(id);
    try {
      const r=await fetch(`${API}/api/reminders/${id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
      if(r.ok){showToast("Reminder deleted.");load();}
      else showToast("Couldn't delete. Try again.",false);
    } finally{setDeleting(null);}
  }

  function logout(){localStorage.removeItem("token");navigate("/");}

  const sorted=[...reminders].sort((a,b)=>daysUntil(a.next_payment_date)-daysUntil(b.next_payment_date));
  const overdue=sorted.filter(r=>daysUntil(r.next_payment_date)<0);
  const upcoming=sorted.filter(r=>daysUntil(r.next_payment_date)>=0);
  const totalMonthly=reminders.reduce((s,r)=>s+r.amount,0);

  if(loading) return <LoadingScreen text="Loading your reminders…"/>;

  const MobHeaderRight=(
    <button onClick={()=>setShowModal(true)}
      style={{width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,.3)",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
      <Icon d={ICONS.plus} size={16} color="#fff"/>
    </button>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout}/>
      <BottomNav/>

      {showModal&&<AddModal token={token} onClose={()=>setShowModal(false)} onSuccess={()=>{setShowModal(false);load();showToast("Reminder saved! We'll remind you before it's due 🔔");}} isMobile={isMobile}/>}

      {toast&&(
        <div style={{position:"fixed",bottom:isMobile?80:24,left:isMobile?12:undefined,right:isMobile?12:24,zIndex:9999,padding:"12px 18px",borderRadius:10,background:toast.ok?"var(--green)":"var(--red)",color:"#fff",fontSize:13,fontWeight:500,boxShadow:"0 8px 24px rgba(0,0,0,.15)",maxWidth:isMobile?undefined:340,textAlign:isMobile?"center":undefined}}>
          {toast.text}
        </div>
      )}

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Mobile header */}
        <MobileHeader
          title="Reminders 🔔"
          subtitle={`${reminders.length} set · ₹${fmt(totalMonthly)}/mo`}
          right={MobHeaderRight}
        />

        {/* Desktop header */}
        <div className="desk-hdr" style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)"}}>Reminders 🔔</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>Never miss a bill or subscription again</div>
          </div>
          <button onClick={()=>setShowModal(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:7,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            <Icon d={ICONS.plus} size={13}/> Add Reminder
          </button>
        </div>

        {/* Page content */}
        <div className="rem-content" style={{flex:1,overflowY:"auto",padding:"16px 20px 28px",background:"var(--bg)"}}>

          {reminders.length===0?(
            <div className="fade" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"48px 20px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{fontSize:36,marginBottom:10}}>📭</div>
              <div style={{fontSize:15,fontWeight:600,color:"var(--ink2)",marginBottom:6}}>No reminders set up yet</div>
              <div style={{fontSize:13,color:"var(--ink3)",marginBottom:18}}>Add your recurring bills — rent, Netflix, phone recharge — and we'll remind you before they're due.</div>
              <button onClick={()=>setShowModal(true)} style={{padding:"10px 24px",borderRadius:9,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ Add your first reminder</button>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {overdue.length>0&&(
                <div className="fade">
                  <div style={{fontSize:11,fontWeight:700,color:"var(--red)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>⚠️ Overdue ({overdue.length})</div>
                  {/* Mobile only */}
                  <div className="mob-only" style={{flexDirection:"column"}}>
                    {overdue.map(r=><ReminderCardMobile key={r.id} r={r} onPaid={markPaid} onDelete={deleteReminder} paying={paying===r.id} deleting={deleting===r.id}/>)}
                  </div>
                  {/* Desktop only */}
                  <div className="desk-only" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
                    {overdue.map(r=><ReminderCardDesktop key={r.id} r={r} onPaid={markPaid} onDelete={deleteReminder} paying={paying===r.id} deleting={deleting===r.id}/>)}
                  </div>
                </div>
              )}
              {upcoming.length>0&&(
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Upcoming ({upcoming.length})</div>
                  {/* Mobile only */}
                  <div className="mob-only" style={{flexDirection:"column"}}>
                    {upcoming.map(r=><ReminderCardMobile key={r.id} r={r} onPaid={markPaid} onDelete={deleteReminder} paying={paying===r.id} deleting={deleting===r.id}/>)}
                  </div>
                  {/* Desktop only */}
                  <div className="desk-only" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
                    {upcoming.map(r=><ReminderCardDesktop key={r.id} r={r} onPaid={markPaid} onDelete={deleteReminder} paying={paying===r.id} deleting={deleting===r.id}/>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}