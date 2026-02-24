// ══════════════════════════════════════════════════════
// AddIncome.jsx (mobile)
// ══════════════════════════════════════════════════════
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  injectMobileCSS, Icon, ICONS,
  MobilePage, MobileHeader, LoadingScreen,
} from "./MobileLayout";

const SOURCES = [
  {label:"Pocket money",emoji:"👛"},{label:"Part-time job",emoji:"💼"},{label:"Scholarship",emoji:"🎓"},
  {label:"Freelance",emoji:"💻"},{label:"Family",emoji:"🏠"},{label:"Internship",emoji:"🏢"},
  {label:"Salary",emoji:"💰"},{label:"Other",emoji:"✨"},
];

export default function AddIncome() {
  injectMobileCSS();
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");
  const amountRef = useRef(null);

  const [amount,  setAmount]  = useState("");
  const [source,  setSource]  = useState("");
  const [date,    setDate]    = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState(null);
  const [errMsg,  setErrMsg]  = useState("");

  useEffect(()=>{ if(!token) navigate("/",{replace:true}); },[token,navigate]);

  function handleSourceSelect(e, label) {
    e.preventDefault();
    setSource(label);
    amountRef.current?.focus();
  }

  async function save(e) {
    e.preventDefault();
    if(loading) return;
    setLoading(true); setStatus(null);
    try {
      const res=await fetch("https://smartspend-backend-aupt.onrender.com/api/income/",{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({amount:parseFloat(amount),source,date}),
      });
      if(!res.ok){const d=await res.json();setErrMsg(d.detail||"Something went wrong.");setStatus("error");return;}
      setStatus("success");
      setTimeout(()=>navigate("/dashboard",{replace:true}),1200);
    } catch { setErrMsg("Can't reach the server."); setStatus("error"); }
    finally { setLoading(false); }
  }

  const fmtIncome = n => new Intl.NumberFormat("en-IN",{maximumFractionDigits:0}).format(parseFloat(n)||0);

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <MobileHeader
        title="Add Income 💰"
        subtitle="Record money you received"
        back
        onBack={()=>navigate(-1)}
      />

      <div style={{padding:"16px"}}>
        {status==="success" ? (
          <div className="card fade" style={{padding:"48px 20px",textAlign:"center"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:"var(--green-bg)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",animation:"pop .4s ease"}}>
              <Icon d={ICONS.check} size={28} color="var(--green)" />
            </div>
            <div style={{fontSize:18,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:6}}>Income saved!</div>
            <div style={{fontSize:13,color:"var(--ink4)"}}>₹{fmtIncome(amount)} from {source} added. Going back…</div>
          </div>
        ) : (
          <form onSubmit={save}>
            {/* Amount */}
            <div className="fu0 card" style={{padding:"16px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:10}}>How much did you receive? 💸</div>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:18,color:"var(--ink3)",fontWeight:600}}>₹</span>
                <input
                  ref={amountRef}
                  type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*" required
                  placeholder="0" autoComplete="off" autoCorrect="off"
                  value={amount}
                  onChange={e=>{const v=e.target.value.replace(/[^0-9.]/g,"").replace(/(\..*)\./g,"$1");setAmount(v);}}
                  className="inp"
                  style={{paddingLeft:32,fontSize:26,fontWeight:800,fontFamily:"'Sora',sans-serif"}}
                />
              </div>
            </div>

            {/* Source */}
            <div className="fu1 card" style={{padding:"16px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:12}}>Where did it come from?</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {SOURCES.map(s=>(
                  <button key={s.label} type="button"
                    onMouseDown={e=>handleSourceSelect(e,s.label)}
                    onTouchStart={e=>handleSourceSelect(e,s.label)}
                    style={{padding:"10px 4px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:source===s.label?"2px solid var(--brand)":"1.5px solid var(--border)",background:source===s.label?"var(--brand-soft)":"var(--surface)",color:source===s.label?"var(--brand)":"var(--ink2)",fontSize:10,fontWeight:600,textAlign:"center",transition:"all .1s",WebkitTapHighlightColor:"transparent"}}>
                    <div style={{fontSize:20,marginBottom:3}}>{s.emoji}</div>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="fu2 card" style={{padding:"16px",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:8}}>When? <span style={{fontSize:11,fontWeight:400,color:"var(--ink4)"}}>Defaults to today</span></div>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="inp" />
            </div>

            {status==="error" && (
              <div style={{marginBottom:12,padding:"10px 13px",borderRadius:10,background:"var(--red-bg)",color:"var(--red)",fontSize:13}}>⚠️ {errMsg}</div>
            )}

            <button type="submit" disabled={loading||!source}
              style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:(loading||!source)?"#e5e7eb":"var(--green)",color:(loading||!source)?"var(--ink4)":"#fff",fontSize:16,fontWeight:700,cursor:(loading||!source)?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading&&<span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>}
              {loading?"Saving…":"Save Income"}
            </button>
            {!source&&<div style={{textAlign:"center",marginTop:8,fontSize:12,color:"var(--ink4)"}}>Pick where it came from first ↑</div>}
          </form>
        )}
      </div>
    </div>
  );
}
