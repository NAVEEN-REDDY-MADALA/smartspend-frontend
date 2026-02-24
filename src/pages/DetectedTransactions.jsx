import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  injectMobileCSS, fmt, CAT_EMOJI, Icon, ICONS,
  MobilePage, MobileHeader, LoadingScreen, Toast,
} from "./MobileLayout";

export default function DetectedTransactions() {
  injectMobileCSS();
  const navigate = useNavigate();

  const [pending,    setPending]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [accepting,  setAccepting]  = useState(null);
  const [ignoring,   setIgnoring]   = useState(null);
  const [toast,      setToast]      = useState(null);
  const [spinning,   setSpinning]   = useState(false);

  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(()=>{
    load();
    const iv=setInterval(load,6000);
    return ()=>clearInterval(iv);
  },[]);

  async function load() {
    const token=localStorage.getItem("token");
    if(!token){navigate("/");return;}
    try {
      const r=await fetch(`${API}/api/detected/pending`,{headers:{Authorization:`Bearer ${token}`}});
      if(r.status===401){localStorage.removeItem("token");navigate("/");return;}
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      setPending(await r.json());
      setError(null);
    } catch { setError("Couldn't load transactions. Check your connection."); }
    finally { setLoading(false); setSpinning(false); }
  }

  function showToast(text, ok=true){setToast({text,ok});setTimeout(()=>setToast(null),3500);}

  async function handleAccept(smsHash, originalTxn) {
    const token=localStorage.getItem("token");
    setAccepting(smsHash);
    try {
      const r=await fetch(`${API}/api/detected/accept/${smsHash}`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});
      if(!r.ok) throw new Error();
      const result=await r.json();
      const amount=result.amount??result.expense?.amount??originalTxn.amount;
      const merchant=result.merchant??result.expense?.merchant??originalTxn.merchant??"transaction";
      showToast(`Added ₹${fmt(amount)} — ${merchant} ✓`);
      window.dispatchEvent(new Event("transaction-confirmed"));
      await load();
    } catch { showToast("Something went wrong. Try again.",false); }
    finally { setAccepting(null); }
  }

  async function handleIgnore(smsHash) {
    const token=localStorage.getItem("token");
    setIgnoring(smsHash);
    try {
      const r=await fetch(`${API}/api/detected/ignore/${smsHash}`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});
      if(!r.ok) throw new Error();
      showToast("Transaction ignored.");
      await load();
    } catch { showToast("Something went wrong. Try again.",false); }
    finally { setIgnoring(null); }
  }

  function fmt2(ds) {
    const utcStr=ds.endsWith('Z')||ds.includes('+')?ds:ds+'Z';
    return new Date(utcStr).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:true});
  }

  if(loading) return <LoadingScreen text="Checking SMS transactions…" />;

  return (
    <MobilePage pendingCount={pending.length}>
      {toast && <Toast text={toast.text} ok={toast.ok} />}

      <MobileHeader
        title="SMS Detected 📱"
        subtitle={pending.length>0?`${pending.length} waiting for review`:"All caught up!"}
        right={
          <button onClick={()=>{setSpinning(true);load();}} style={{width:36,height:36,borderRadius:10,border:"1.5px solid var(--border)",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <span style={{display:"inline-block",animation:spinning?"spin .7s linear infinite":"none"}}>
              <Icon d={ICONS.refresh} size={16} color="var(--ink3)" />
            </span>
          </button>
        }
      />

      <div style={{padding:"12px 16px 0"}}>
        {error && (
          <div className="fu0" style={{padding:"12px 14px",borderRadius:12,background:"var(--red-bg)",border:"1px solid #fecaca",color:"var(--red)",fontSize:13,marginBottom:12}}>
            ⚠️ {error}
          </div>
        )}

        {pending.length>0 && (
          <div className="fu0" style={{padding:"12px 14px",borderRadius:12,background:"var(--blue-bg)",border:"1px solid #bfdbfe",marginBottom:12,display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:20}}>💬</span>
            <div style={{fontSize:13,color:"var(--blue)"}}>
              <strong>{pending.length}</strong> payment{pending.length>1?"s":""} found in your SMS.
              Tap <strong>Yes</strong> to log or <strong>No</strong> to ignore.
            </div>
          </div>
        )}

        {pending.length===0&&!error ? (
          <div className="fu0 card" style={{padding:"56px 20px",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>✅</div>
            <div style={{fontSize:16,fontWeight:700,color:"var(--ink2)",fontFamily:"'Sora',sans-serif",marginBottom:6}}>All caught up!</div>
            <div style={{fontSize:13,color:"var(--ink4)"}}>No SMS payments waiting for review. New ones appear here automatically.</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {pending.map(txn=>{
              const busy=accepting===txn.sms_hash||ignoring===txn.sms_hash;
              return (
                <div key={txn.id} className="fu1 card" style={{overflow:"hidden"}}>
                  {/* Card header */}
                  <div style={{padding:"14px 16px",background:"linear-gradient(135deg,var(--blue-bg),#dbeafe)",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:48,height:48,borderRadius:12,background:"rgba(255,255,255,.8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
                        {CAT_EMOJI[txn.category_guess]||"💰"}
                      </div>
                      <div>
                        <div style={{fontSize:24,fontWeight:800,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>₹{fmt(txn.amount)}</div>
                        <div style={{fontSize:13,color:"var(--ink3)"}}>{txn.merchant||"Unknown merchant"}</div>
                      </div>
                    </div>
                    <span style={{padding:"3px 9px",borderRadius:99,fontSize:10,fontWeight:700,background:"var(--brand-soft)",color:"var(--brand)"}}>PENDING</span>
                  </div>
                  {/* Details */}
                  <div style={{padding:"12px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,background:"var(--surface2)",borderBottom:"1px solid var(--border)"}}>
                    <div>
                      <div style={{fontSize:10,color:"var(--ink4)",marginBottom:2}}>CATEGORY</div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>{txn.category_guess||"Other"}</div>
                    </div>
                    <div>
                      <div style={{fontSize:10,color:"var(--ink4)",marginBottom:2}}>DETECTED ON</div>
                      <div style={{fontSize:12,fontWeight:500,color:"var(--ink2)"}}>{fmt2(txn.transaction_date)}</div>
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{padding:"10px 16px",fontSize:11,color:"var(--blue)",borderBottom:"1px solid var(--border)"}}>
                    📱 SmartSpend read this from your SMS — confirm or ignore it below.
                  </div>
                  {/* Actions */}
                  <div style={{padding:"12px 16px",display:"flex",gap:8}}>
                    <button onClick={()=>handleAccept(txn.sms_hash,txn)} disabled={busy}
                      style={{flex:1,padding:"12px",borderRadius:12,border:"none",background:busy?"#f3f4f6":"var(--green)",color:busy?"var(--ink4)":"#fff",fontSize:14,fontWeight:700,cursor:busy?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                      {accepting===txn.sms_hash ? <span style={{animation:"spin .7s linear infinite",display:"inline-block"}}>⟳</span> : "✓"}
                      {accepting===txn.sms_hash?"Adding…":"Yes, add it"}
                    </button>
                    <button onClick={()=>handleIgnore(txn.sms_hash)} disabled={busy}
                      style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid var(--border)",background:busy?"#f3f4f6":"var(--red-bg)",color:busy?"var(--ink4)":"var(--red)",fontSize:14,fontWeight:700,cursor:busy?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                      {ignoring===txn.sms_hash?"Ignoring…":"✕ Not mine"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:12,marginBottom:4,fontSize:11,color:"var(--ink4)"}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"var(--green)",display:"inline-block",animation:"pulse 2s infinite"}}/>
          Auto-refreshing every 6 seconds
        </div>
      </div>
    </MobilePage>
  );
}