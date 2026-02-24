// ══════════════════════════════════════════════════════
// AddExpense.jsx (mobile)
// ══════════════════════════════════════════════════════
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  injectMobileCSS, Icon, ICONS,
  MobilePage, MobileHeader, LoadingScreen,
} from "./MobileLayout";

const fmt = n => new Intl.NumberFormat("en-IN",{maximumFractionDigits:0}).format(n);

function nowIST(){const now=new Date();const off=5.5*60*60*1000;const utc=now.getTime()+(now.getTimezoneOffset()*60*1000);return new Date(utc+off);}
function todayIST(){const d=nowIST();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function currentTimeIST(){const d=nowIST();return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;}

const CATEGORIES = [
  {label:"Food",emoji:"🍜"},{label:"Groceries",emoji:"🛒"},{label:"Transport",emoji:"🚗"},
  {label:"Shopping",emoji:"🛍️"},{label:"Entertainment",emoji:"🎬"},{label:"Bills",emoji:"💡"},
  {label:"Medicine",emoji:"💊"},{label:"Travel",emoji:"✈️"},{label:"Coffee",emoji:"☕"},
  {label:"Books",emoji:"📚"},{label:"Rent",emoji:"🏠"},{label:"Other",emoji:"💳"},
];

const PAYMENTS = [{label:"UPI",emoji:"📱"},{label:"Card",emoji:"💳"},{label:"Cash",emoji:"💵"},{label:"Net Banking",emoji:"🏦"}];
const QUICK_AMOUNTS = [50,100,200,500,1000];

const MERCHANT_SUGGESTIONS = {
  Food:["Zomato","Swiggy","Mess","Canteen","Domino's"],
  Groceries:["D-Mart","Big Basket","Blinkit","Zepto"],
  Transport:["Uber","Ola","Rapido","Metro","IRCTC"],
  Shopping:["Amazon","Flipkart","Myntra","Meesho"],
  Entertainment:["Netflix","Hotstar","BookMyShow","Spotify"],
  Bills:["Jio","Airtel","Vi","Electricity Board"],
  Medicine:["Apollo Pharmacy","1mg","PharmEasy","Netmeds"],
  Travel:["IRCTC","MakeMyTrip","Goibibo","RedBus"],
  Coffee:["Starbucks","CCD","Third Wave"],
  Books:["Amazon","Flipkart","College Bookshop"],
  Rent:["Landlord","PG Owner","Hostel"],
  Other:[],
};

const STUDENT_TIPS = {
  Food:"Cooking at home 3x a week saves ~₹800/month 🍲",
  Groceries:"Buy weekly in bulk — saves 20-30% vs daily shopping 🛒",
  Transport:"A monthly bus pass pays off in just 3 rides 🚌",
  Shopping:"Wait 48 hours before buying anything over ₹500 🛍️",
  Entertainment:"Share OTT with 3 friends — pay just ₹50/month 🎬",
  Bills:"Set auto-pay reminders 3 days before due dates 📅",
  Medicine:"Generic medicines are 50-80% cheaper 💊",
  Travel:"Book trains 90+ days ahead for big savings ✈️",
  Coffee:"₹80/day coffee = ₹2,400/month ☕ Make it at home!",
  Books:"Check your college library first 📚",
  Rent:"Split Wi-Fi & electricity bills clearly with flatmates 🏠",
  Other:"Log every spend — small amounts add up fast! 💡",
};

export function AddExpense() {
  injectMobileCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [amount,   setAmount]   = useState("");
  const [category, setCategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [payment,  setPayment]  = useState("");
  const [date,     setDate]     = useState(todayIST);
  const [time,     setTime]     = useState(currentTimeIST);
  const [loading,  setLoading]  = useState(false);
  const [status,   setStatus]   = useState(null);
  const [errMsg,   setErrMsg]   = useState("");
  const [step,     setStep]     = useState(1); // 1=amount, 2=details, 3=confirm

  useEffect(()=>{ if(!token) navigate("/",{replace:true}); },[]);

  const suggestions = category?(MERCHANT_SUGGESTIONS[category]||[]):[];
  const tip = category?STUDENT_TIPS[category]:null;
  const canSubmit = amount&&category&&payment&&date&&!loading;

  async function save(e) {
    e.preventDefault();
    if(loading) return;
    setLoading(true); setStatus(null);
    const createdAt=`${date}T${time}:00+05:30`;
    try {
      const res=await fetch("https://smartspend-backend-aupt.onrender.com/api/expenses/",{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({amount:parseFloat(amount),category,merchant:merchant.trim()||null,payment_method:payment,date,created_at:createdAt}),
      });
      if(!res.ok){const d=await res.json().catch(()=>({}));setErrMsg(d.detail||"Something went wrong.");setStatus("error");return;}
      setStatus("success");
      setTimeout(()=>navigate("/dashboard",{replace:true}),1300);
    } catch { setErrMsg("Can't reach the server."); setStatus("error"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <MobileHeader
        title="Add Expense 💸"
        subtitle="Record what you just spent"
        back
        onBack={()=>navigate(-1)}
      />

      <div style={{padding:"16px"}}>
        {status==="success" ? (
          <div className="card fade" style={{padding:"48px 20px",textAlign:"center"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:"var(--brand-soft)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",animation:"pop .4s ease"}}>
              <Icon d={ICONS.check} size={28} color="var(--brand)" />
            </div>
            <div style={{fontSize:18,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:6}}>Expense saved!</div>
            <div style={{fontSize:13,color:"var(--ink4)"}}>
              ₹{fmt(parseFloat(amount)||0)} on {category}{merchant?` at ${merchant}`:""} — logged.<br />
              Going back to dashboard…
            </div>
          </div>
        ) : (
          <form onSubmit={save}>
            {/* Amount */}
            <div className="fu0 card" style={{padding:"16px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:12}}>How much? 💰</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}>
                {QUICK_AMOUNTS.map(q=>(
                  <button key={q} type="button" className={`chip${amount===q.toString()?" active":""}`} onClick={()=>setAmount(q.toString())}>₹{q}</button>
                ))}
              </div>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:18,color:"var(--ink3)",fontWeight:600}}>₹</span>
                <input type="number" required min="1" step="0.01" placeholder="0"
                  value={amount} onChange={e=>setAmount(e.target.value)}
                  className="inp" inputMode="decimal"
                  style={{paddingLeft:32,fontSize:24,fontWeight:700,fontFamily:"'Sora',sans-serif"}} />
              </div>
            </div>

            {/* Category */}
            <div className="fu1 card" style={{padding:"16px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:12}}>What did you spend on?</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {CATEGORIES.map(c=>(
                  <button key={c.label} type="button" onClick={()=>{setCategory(c.label);setMerchant("");}}
                    style={{padding:"10px 4px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:category===c.label?"2px solid var(--brand)":"1.5px solid var(--border)",background:category===c.label?"var(--brand-soft)":"var(--surface)",color:category===c.label?"var(--brand)":"var(--ink2)",fontSize:10,fontWeight:600,textAlign:"center",transition:"all .1s"}}>
                    <div style={{fontSize:20,marginBottom:3}}>{c.emoji}</div>
                    {c.label}
                  </button>
                ))}
              </div>
              {tip && (
                <div className="fade" style={{marginTop:10,padding:"10px 12px",borderRadius:10,background:"var(--amber-bg)",border:"1px solid #fde68a",fontSize:12,color:"var(--ink2)"}}>
                  💡 {tip}
                </div>
              )}
            </div>

            {/* Merchant */}
            <div className="fu2 card" style={{padding:"16px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:10}}>Where did you pay? <span style={{fontSize:11,fontWeight:400,color:"var(--ink4)"}}>(optional)</span></div>
              {suggestions.length>0 && (
                <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:8}}>
                  {suggestions.map(s=>(
                    <button key={s} type="button" className={`chip${merchant===s?" active":""}`} onClick={()=>setMerchant(s)}>{s}</button>
                  ))}
                </div>
              )}
              <input type="text" placeholder={category?`e.g. ${suggestions[0]||"Merchant name"}`:"Pick a category first"}
                value={merchant} onChange={e=>setMerchant(e.target.value)}
                className="inp" disabled={!category} style={{opacity:category?1:.5}} />
            </div>

            {/* Payment */}
            <div className="fu3 card" style={{padding:"16px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:10}}>How did you pay?</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {PAYMENTS.map(p=>(
                  <button key={p.label} type="button" onClick={()=>setPayment(p.label)}
                    style={{padding:"10px 4px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:payment===p.label?"2px solid var(--brand)":"1.5px solid var(--border)",background:payment===p.label?"var(--brand-soft)":"var(--surface)",color:payment===p.label?"var(--brand)":"var(--ink2)",fontSize:10,fontWeight:600,textAlign:"center"}}>
                    <div style={{fontSize:20,marginBottom:3}}>{p.emoji}</div>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date / time */}
            <div className="fu4 card" style={{padding:"16px",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:10}}>When? <span style={{fontSize:11,fontWeight:400,color:"var(--ink4)"}}>Defaults to now (IST)</span></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="inp" style={{fontSize:14}} />
                <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="inp" style={{fontSize:14}} />
              </div>
            </div>

            {status==="error" && (
              <div style={{marginBottom:12,padding:"10px 13px",borderRadius:10,background:"var(--red-bg)",color:"var(--red)",fontSize:13}}>
                ⚠️ {errMsg}
              </div>
            )}

            <button type="submit" disabled={!canSubmit}
              style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:!canSubmit?"#e5e7eb":"var(--brand)",color:!canSubmit?"var(--ink4)":"#fff",fontSize:16,fontWeight:700,cursor:!canSubmit?"not-allowed":"pointer",fontFamily:"inherit",marginBottom:"env(safe-area-inset-bottom, 16px)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading&&<span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>}
              {loading?"Saving…":`Save ₹${amount||"0"} Expense`}
            </button>

            {(!category||!payment) && (
              <div style={{textAlign:"center",marginBottom:12,fontSize:12,color:"var(--ink4)"}}>
                {!category&&!payment?"Pick a category and payment method above":!category?"Pick what you spent on above":"Pick how you paid above"}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// AddIncome.jsx (mobile)
// ══════════════════════════════════════════════════════
const SOURCES = [
  {label:"Pocket money",emoji:"👛"},{label:"Part-time job",emoji:"💼"},{label:"Scholarship",emoji:"🎓"},
  {label:"Freelance",emoji:"💻"},{label:"Family",emoji:"🏠"},{label:"Internship",emoji:"🏢"},
  {label:"Salary",emoji:"💰"},{label:"Other",emoji:"✨"},
];

export function AddIncome() {
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

  useEffect(()=>{ if(!token) navigate("/",{replace:true}); },[]);

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
