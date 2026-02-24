import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  injectMobileCSS, fmt, Icon, ICONS,
  MobilePage, MobileHeader, LoadingScreen, Toast,
} from "./MobileLayout";

const CAT_ICONS = {Bills:"📄",Subscription:"📺",EMI:"💳",Insurance:"🛡️",Rent:"🏠",Other:"💰"};
const MODAL_CATEGORIES = ["Bills","Subscription","EMI","Insurance","Rent","Other"];

function ordinal(d){
  if(d>3&&d<21) return `${d}th`;
  switch(d%10){case 1:return`${d}st`;case 2:return`${d}nd`;case 3:return`${d}rd`;default:return`${d}th`;}
}

function daysUntil(dateStr){
  const today=new Date();today.setHours(0,0,0,0);
  const due=new Date(dateStr);due.setHours(0,0,0,0);
  return Math.ceil((due-today)/86400000);
}

export default function Reminders() {
  injectMobileCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [reminders, setReminders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [paying,    setPaying]    = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [toast,     setToast]     = useState(null);

  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(()=>{ if(!token){navigate("/");return;} load(); },[]);

  async function load() {
    setLoading(true);
    try {
      const r=await fetch(`${API}/api/reminders/`,{headers:{Authorization:`Bearer ${token}`}});
      if(r.ok) setReminders(await r.json());
    } finally { setLoading(false); }
  }

  function showToast(text,ok=true){setToast({text,ok});setTimeout(()=>setToast(null),3500);}

  async function markPaid(id) {
    setPaying(id);
    try {
      const r=await fetch(`${API}/api/reminders/${id}/mark-paid`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});
      if(r.ok){showToast("Marked as paid ✓");load();}
      else showToast("Couldn't mark as paid",false);
    } finally { setPaying(null); }
  }

  async function deleteReminder(id) {
    setDeleting(id);
    try {
      const r=await fetch(`${API}/api/reminders/${id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
      if(r.ok){showToast("Reminder deleted");load();}
      else showToast("Couldn't delete",false);
    } finally { setDeleting(null); }
  }

  const sorted   = [...reminders].sort((a,b)=>daysUntil(a.next_payment_date)-daysUntil(b.next_payment_date));
  const overdue  = sorted.filter(r=>daysUntil(r.next_payment_date)<0);
  const upcoming = sorted.filter(r=>daysUntil(r.next_payment_date)>=0);

  const totalMonthly = reminders.reduce((s,r)=>s+r.amount,0);

  if(loading) return <LoadingScreen text="Loading reminders…" />;

  return (
    <MobilePage>
      {toast && <Toast text={toast.text} ok={toast.ok} />}
      {showModal && <AddModal token={token} onClose={()=>setShowModal(false)} onSuccess={()=>{setShowModal(false);load();showToast("Reminder saved! 🔔");}} />}

      <MobileHeader
        title="Reminders 🔔"
        subtitle="Never miss a bill again"
        right={
          <button onClick={()=>setShowModal(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:11,background:"var(--brand)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            <Icon d={ICONS.plus} size={14} color="#fff" /> Add
          </button>
        }
      />

      <div style={{padding:"12px 16px 0"}}>
        {/* Monthly total */}
        {reminders.length>0 && (
          <div className="fu0" style={{background:"linear-gradient(135deg,#1a0a4e,#3b1fa8)",borderRadius:16,padding:"14px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.55)",marginBottom:2}}>Monthly Recurring</div>
              <div style={{fontSize:24,fontWeight:800,color:"#fff",fontFamily:"'Sora',sans-serif"}}>₹{fmt(totalMonthly)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,.55)",marginBottom:2}}>Active</div>
              <div style={{fontSize:22,fontWeight:700,color:"#a78bfa",fontFamily:"'Sora',sans-serif"}}>{reminders.length}</div>
            </div>
          </div>
        )}

        {reminders.length===0 ? (
          <div className="fu0 card" style={{padding:"56px 20px",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>📭</div>
            <div style={{fontSize:16,fontWeight:700,color:"var(--ink2)",fontFamily:"'Sora',sans-serif",marginBottom:6}}>No reminders yet</div>
            <div style={{fontSize:13,color:"var(--ink4)",marginBottom:18}}>Add your bills — rent, Netflix, phone — and we'll remind you before they're due.</div>
            <button onClick={()=>setShowModal(true)} className="btn-primary" style={{maxWidth:220}}>+ Add First Reminder</button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {overdue.length>0 && (
              <div className="fu0">
                <div className="section-label" style={{color:"var(--red)"}}>⚠️ Overdue ({overdue.length})</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {overdue.map(r=><ReminderCard key={r.id} r={r} onPaid={markPaid} onDelete={deleteReminder} paying={paying===r.id} deleting={deleting===r.id} />)}
                </div>
              </div>
            )}
            {upcoming.length>0 && (
              <div className="fu1">
                <div className="section-label">Upcoming ({upcoming.length})</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {upcoming.map(r=><ReminderCard key={r.id} r={r} onPaid={markPaid} onDelete={deleteReminder} paying={paying===r.id} deleting={deleting===r.id} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MobilePage>
  );
}

function ReminderCard({r, onPaid, onDelete, paying, deleting}) {
  const days=daysUntil(r.next_payment_date);
  const overdue=days<0; const urgent=days>=0&&days<=1; const warn=days>1&&days<=7;
  const col=overdue||urgent?"var(--red)":warn?"var(--amber)":"var(--green)";
  const bg=overdue||urgent?"var(--red-bg)":warn?"var(--amber-bg)":"var(--green-bg)";
  const urgencyLabel=overdue?`⚠️ ${Math.abs(days)}d overdue`:days===0?"⚠️ Due today!":days===1?"Due tomorrow":`${days} days left`;
  const busy=paying||deleting;

  return (
    <div className="card" style={{overflow:"hidden",borderTop:`3px solid ${col}`}}>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:42,height:42,borderRadius:12,background:"var(--surface2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:21}}>
              {CAT_ICONS[r.category]||"💰"}
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--ink)"}}>{r.name}</div>
              <div style={{fontSize:11,color:"var(--ink4)"}}>{r.category}</div>
            </div>
          </div>
          <div style={{fontSize:22,fontWeight:800,color:"var(--brand)",fontFamily:"'Sora',sans-serif"}}>₹{fmt(r.amount)}</div>
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:r.auto_pay?10:12}}>
          <div style={{fontSize:12,color:"var(--ink3)"}}>
            Next: <strong style={{color:"var(--ink)"}}>{new Date(r.next_payment_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</strong>
          </div>
          <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:99,background:bg,color:col}}>{urgencyLabel}</span>
        </div>

        {r.auto_pay && (
          <div style={{fontSize:11,fontWeight:600,color:"var(--blue)",background:"var(--blue-bg)",padding:"4px 10px",borderRadius:7,marginBottom:10,display:"inline-block"}}>⚡ Auto-Pay on</div>
        )}

        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>onPaid(r.id)} disabled={busy}
            style={{flex:1,padding:"10px",borderRadius:11,border:"none",background:busy?"#f3f4f6":"var(--green)",color:busy?"var(--ink4)":"#fff",fontSize:13,fontWeight:700,cursor:busy?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {paying?"Marking…":"✓ Paid"}
          </button>
          <button onClick={()=>onDelete(r.id)} disabled={busy}
            style={{padding:"10px 14px",borderRadius:11,border:"1.5px solid var(--border)",background:busy?"#f3f4f6":"var(--red-bg)",color:busy?"var(--ink4)":"var(--red)",fontSize:12,cursor:busy?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
            <Icon d={ICONS.trash} size={13} color={busy?"var(--ink4)":"var(--red)"} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddModal({token, onClose, onSuccess}) {
  const [form,setForm]=useState({
    name:"",amount:"",category:"Bills",day_of_month:"1",
    notify_7_days:true,notify_3_days:false,notify_1_day:true,notify_same_day:true,auto_pay:false,
  });
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  function set(k,v){setForm(f=>({...f,[k]:v}));}

  async function submit(e){
    e.preventDefault();setLoading(true);setError("");
    try {
      const r=await fetch("https://smartspend-backend-aupt.onrender.com/api/reminders/",{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({...form,amount:parseFloat(form.amount),day_of_month:parseInt(form.day_of_month),frequency:"monthly"}),
      });
      const data=await r.json();
      if(r.ok){onSuccess();}
      else{setError(data.detail||"Something went wrong.");}
    } catch{setError("Network error.");}
    finally{setLoading(false);}
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-sheet" style={{maxHeight:"95vh"}}>
          <div className="drawer-handle" />
          <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:16,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>Add Reminder</div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",border:"none",background:"var(--surface2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon d={ICONS.x} size={14} color="var(--ink3)" />
            </button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
            <form id="reminder-form" onSubmit={submit}>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:13,fontWeight:600,color:"var(--ink2)",display:"block",marginBottom:6}}>What's the payment for? *</label>
                <input required placeholder="e.g. Netflix, Hostel rent, Phone EMI…" value={form.name} onChange={e=>set("name",e.target.value)} className="inp" />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:10,marginBottom:14}}>
                <div>
                  <label style={{fontSize:13,fontWeight:600,color:"var(--ink2)",display:"block",marginBottom:6}}>Amount (₹) *</label>
                  <input required type="number" min="0" step="0.01" placeholder="499" value={form.amount} onChange={e=>set("amount",e.target.value)} className="inp" inputMode="decimal" />
                </div>
                <div>
                  <label style={{fontSize:13,fontWeight:600,color:"var(--ink2)",display:"block",marginBottom:6}}>Day of month</label>
                  <select value={form.day_of_month} onChange={e=>set("day_of_month",e.target.value)} className="inp">
                    {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{ordinal(d)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:13,fontWeight:600,color:"var(--ink2)",display:"block",marginBottom:6}}>Category</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {MODAL_CATEGORIES.map(c=>(
                    <button key={c} type="button" className={`chip${form.category===c?" active":""}`} onClick={()=>set("category",c)}>{c}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--ink2)",marginBottom:8}}>Remind me before due</div>
                <div style={{background:"var(--surface2)",borderRadius:12,padding:"10px 12px",display:"flex",flexDirection:"column",gap:10}}>
                  {[{key:"notify_7_days",label:"7 days before"},{key:"notify_3_days",label:"3 days before"},{key:"notify_1_day",label:"1 day before"},{key:"notify_same_day",label:"On the same day"}].map(n=>(
                    <label key={n.key} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:"var(--ink2)",cursor:"pointer"}}>
                      <input type="checkbox" checked={form[n.key]} onChange={e=>set(n.key,e.target.checked)} style={{accentColor:"var(--brand)",width:16,height:16}} />
                      {n.label}
                    </label>
                  ))}
                </div>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:"var(--ink2)",cursor:"pointer",marginBottom:14}}>
                <input type="checkbox" checked={form.auto_pay} onChange={e=>set("auto_pay",e.target.checked)} style={{accentColor:"var(--brand)",width:16,height:16}} />
                ⚡ Auto-pay is on (tracking only)
              </label>
              {error && <div style={{padding:"10px 12px",borderRadius:10,background:"var(--red-bg)",color:"var(--red)",fontSize:12,marginBottom:14}}>⚠️ {error}</div>}
            </form>
          </div>
          <div style={{padding:"14px 20px",paddingBottom:"max(14px, env(safe-area-inset-bottom))"}}>
            <button form="reminder-form" type="submit" className="btn-primary" disabled={loading}>{loading?"Saving…":"Save Reminder"}</button>
          </div>
        </div>
      </div>
    </>
  );
}