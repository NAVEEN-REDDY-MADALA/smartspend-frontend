import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api";
import { injectMobileCSS, fmt, Icon, ICONS } from "./MobileLayout";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --sb:#2d1b69; --accent:#7c5cbf; --accent2:#a78bfa;
    --bg:#f4f3f8; --surface:#fff; --border:#e5e7eb;
    --ink:#111827; --ink2:#374151; --ink3:#6b7280; --ink4:#9ca3af;
    --green:#059669; --gbg:#ecfdf5;
    --red:#dc2626;   --rbg:#fef2f2;
    --nav-h:64px;
  }
  html,body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes check{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
  .fade{animation:fadeIn .3s ease both;}
  .slink{transition:background .15s,color .15s;cursor:pointer}
  .slink:hover{background:rgba(255,255,255,.09)!important;color:#fff!important}
  .slink.active{background:rgba(255,255,255,.16)!important;color:#fff!important}
  .inp{width:100%;padding:10px 13px;border-radius:8px;border:1.5px solid var(--border);font-size:14px;font-family:inherit;color:var(--ink);outline:none;background:var(--surface);transition:border-color .15s,box-shadow .15s;}
  .inp:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(124,92,191,.1);}
  .inp::placeholder{color:#c4c4c4;}
  .sbtn{transition:opacity .15s,transform .1s;}
  .sbtn:hover:not(:disabled){opacity:.9;transform:translateY(-1px);}
  .src-btn{-webkit-tap-highlight-color:transparent;touch-action:manipulation;user-select:none;}

  .sidebar{width:210px;flex-shrink:0;background:var(--sb);display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow:hidden;}

  .desk-hdr{display:flex;}

  @media(max-width:900px){
    .sidebar{display:none!important;}
    .desk-hdr{display:none!important;}
    .form-container{padding:12px 14px 32px!important;max-width:100%!important;}
  }
  @media(min-width:901px){
    .mob-header{display:none!important;}
  }
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__addinc_mob__")) return;
  const s=document.createElement("style"); s.id="__addinc_mob__"; s.textContent=CSS;
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

const SOURCES=[
  {label:"Pocket money",emoji:"👛"},{label:"Part-time job",emoji:"💼"},
  {label:"Scholarship",emoji:"🎓"},{label:"Freelance",emoji:"💻"},
  {label:"Family",emoji:"🏠"},{label:"Internship",emoji:"🏢"},
  {label:"Salary",emoji:"💰"},{label:"Other",emoji:"✨"},
];

const F=({label,hint,children})=>(
  <div style={{marginBottom:18}}>
    <label style={{fontSize:13,fontWeight:500,color:"var(--ink2)",display:"block",marginBottom:6}}>{label}</label>
    {hint&&<div style={{fontSize:11,color:"var(--ink4)",marginBottom:6}}>{hint}</div>}
    {children}
  </div>
);

export default function AddIncome() {
  injectCSS();
  const navigate=useNavigate();
  const token=localStorage.getItem("token");

  const [amount,setAmount]=useState("");
  const [source,setSource]=useState("");
  const [date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const [loading,setLoading]=useState(false);
  const [status,setStatus]=useState(null);
  const [errMsg,setErrMsg]=useState("");

  const amountRef=useRef(null);

  useEffect(()=>{if(!token) navigate("/",{replace:true});},[]);

  function logout(){localStorage.removeItem("token");navigate("/");}

  function handleSourceTouchStart(e,label) {
    e.preventDefault();
    setSource(label);
    amountRef.current?.focus();
  }

  async function save(e) {
    e.preventDefault();
    if(loading) return;
    setLoading(true); setStatus(null);
    try {
      const res=await fetch(`${BASE_URL}/api/income/`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({amount:parseFloat(amount),source,date}),
      });
      const data=await res.json();
      if(!res.ok){setErrMsg(data.detail||"Something went wrong.");setStatus("error");return;}
      setStatus("success");
      setTimeout(()=>navigate("/dashboard",{replace:true}),1200);
    } catch(err){setErrMsg("Server error. Try again.");setStatus("error");}
    finally{setLoading(false);}
  }

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Mobile header */}
        <div className="mob-header" style={{background:"var(--sb)",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
          <button
            onMouseDown={e=>e.preventDefault()}
            onTouchStart={e=>{e.preventDefault();navigate(-1);}}
            onClick={()=>navigate(-1)}
            style={{width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,.3)",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Icon d={ICONS.back} size={16} color="#fff"/>
          </button>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#fff",lineHeight:1,fontFamily:"'Sora',sans-serif"}}>Add Income 💰</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.55)",marginTop:1}}>Record money you've received</div>
          </div>
        </div>

        {/* Desktop header */}
        <div className="desk-hdr" style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",alignItems:"center",gap:14,flexShrink:0}}>
          <button onMouseDown={e=>e.preventDefault()} onTouchStart={e=>{e.preventDefault();navigate(-1);}} onClick={()=>navigate(-1)}
            style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:7,border:"1px solid var(--border)",background:"transparent",color:"var(--ink3)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
            <Icon d={ICONS.back} size={13}/> Back
          </button>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)"}}>Add Income 💰</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>Record money you've received</div>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"24px 20px",background:"var(--bg)",display:"flex",justifyContent:"center"}}>
          <div className="fade form-container" style={{width:"100%",maxWidth:480}}>

            {status==="success"?(
              <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"48px 32px",textAlign:"center",margin:"20px 0",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{width:56,height:56,borderRadius:"50%",background:"var(--gbg)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",animation:"check .4s ease"}}>
                  <Icon d={ICONS.check} size={26} color="var(--green)"/>
                </div>
                <div style={{fontSize:17,fontWeight:700,color:"var(--ink)",marginBottom:6}}>Income saved!</div>
                <div style={{fontSize:13,color:"var(--ink3)",lineHeight:1.7}}>₹{fmt(parseFloat(amount)||0)} from {source} added.<br/>Taking you back to the dashboard…</div>
              </div>
            ):(
              <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <form onSubmit={save}>
                  <F label="How much did you receive? (₹)" hint="Enter the exact amount">
                    <div style={{position:"relative"}}>
                      <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"var(--ink3)",fontWeight:500}}>₹</span>
                      <input ref={amountRef} type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*" required
                        placeholder="0" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                        value={amount} onChange={e=>{const v=e.target.value.replace(/[^0-9.]/g,"").replace(/(\..*)\./g,"$1");setAmount(v);}}
                        className="inp" style={{paddingLeft:28,fontSize:20,fontWeight:600}}/>
                    </div>
                  </F>

                  <F label="Where did it come from?">
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {SOURCES.map(s=>{
                        const sel=source===s.label;
                        return (
                          <button key={s.label} type="button" className="src-btn"
                            onMouseDown={e=>handleSourceTouchStart(e,s.label)}
                            onTouchStart={e=>handleSourceTouchStart(e,s.label)}
                            style={{padding:"9px 4px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",
                              border:sel?"2px solid var(--accent)":"1.5px solid var(--border)",
                              background:sel?"rgba(124,92,191,.07)":"var(--surface)",
                              color:sel?"var(--accent)":"var(--ink2)",
                              fontSize:11,fontWeight:500,textAlign:"center",
                              transition:"border-color .12s,background .12s"}}>
                            <div style={{fontSize:18,marginBottom:3}}>{s.emoji}</div>
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </F>

                  <F label="When did you get it?" hint="Defaults to today">
                    <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="inp"/>
                  </F>

                  {status==="error"&&(
                    <div style={{marginBottom:16,padding:"10px 13px",borderRadius:8,background:"var(--rbg)",color:"var(--red)",border:"1px solid #fecaca",fontSize:13}}>⚠️ {errMsg}</div>
                  )}

                  <button type="submit" disabled={loading||!source} className="sbtn"
                    style={{width:"100%",padding:"13px",borderRadius:10,background:(loading||!source)?"#e5e7eb":"var(--green)",border:"none",color:(loading||!source)?"var(--ink4)":"#fff",fontSize:14,fontWeight:600,cursor:(loading||!source)?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    {loading&&<span style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>}
                    {loading?"Saving…":"Save Income"}
                  </button>

                  {!source&&(
                    <div style={{textAlign:"center",marginTop:8,fontSize:11,color:"var(--ink4)"}}>Pick where it came from first ↑</div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}