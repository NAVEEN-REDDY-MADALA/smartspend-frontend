import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  injectMobileCSS, fmt,
  Icon, ICONS, BottomNav, MobileHeader, LoadingScreen
} from "./MobileLayout";

ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,BarElement,ArcElement,Tooltip,Legend,Filler);

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --sb:#2d1b69; --accent:#7c5cbf; --accent2:#a78bfa;
    --bg:#f4f3f8; --surface:#fff; --border:#e5e7eb;
    --ink:#111827; --ink2:#374151; --ink3:#6b7280; --ink4:#9ca3af;
    --green:#059669; --gbg:#ecfdf5;
    --red:#dc2626;   --rbg:#fef2f2;
    --amber:#d97706; --abg:#fffbeb;
    --blue:#2563eb;  --bbg:#eff6ff;
    --nav-h:64px;
  }
  html,body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fu0{animation:fadeUp .4s ease both}
  .fu1{animation:fadeUp .4s .06s ease both}
  .fu2{animation:fadeUp .4s .12s ease both}
  .fu3{animation:fadeUp .4s .18s ease both}
  .fu4{animation:fadeUp .4s .24s ease both}
  .slink{transition:background .15s,color .15s;cursor:pointer}
  .slink:hover{background:rgba(255,255,255,.09)!important;color:#fff!important}
  .slink.active{background:rgba(255,255,255,.16)!important;color:#fff!important}
  .kcard{transition:transform .18s,box-shadow .18s;}
  .kcard:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,92,191,.13)!important}
  .ins-card{transition:transform .18s,box-shadow .18s}
  .ins-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.09)!important}
  .tab-btn{transition:all .15s;cursor:pointer;border:none;background:transparent;font-family:inherit;}
  .catrow{transition:background .1s;border-radius:8px}
  .catrow:hover{background:#f3f0fa!important}
  .tip-badge{transition:all .15s;cursor:pointer}
  .tip-badge:hover{transform:scale(1.02);box-shadow:0 2px 8px rgba(0,0,0,.1)!important}

  .sidebar{width:210px;flex-shrink:0;background:var(--sb);display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow:hidden;}

  @media(max-width:900px){
    .sidebar{display:none!important;}
    .desk-hdr{display:none!important;}
    .mob-only{display:flex!important;}
    .analytics-content{padding:10px 12px calc(var(--nav-h) + 16px)!important;}
    .stats-grid{grid-template-columns:1fr 1fr!important;gap:8px!important;}
    .charts-grid{grid-template-columns:1fr!important;}
  }
  @media(min-width:901px){
    .mob-only{display:none!important;}
    .desk-hdr{display:flex!important;}
  }
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__analytics_mob__")) return;
  const s=document.createElement("style"); s.id="__analytics_mob__"; s.textContent=CSS;
  document.head.appendChild(s);
  injectMobileCSS();
}

const fmtK=n=>n>=1000?`${(n/1000).toFixed(1)}k`:fmt(n);
const MON=["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtM=m=>{if(!m)return "";const[y,mo]=m.split("-");return `${MON[+mo]} '${y.slice(2)}`;};

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
  {label:"Account",items:[{to:"/settings",label:"Settings",icon:"home"}]},
];

function Sidebar({onLogout, pendingCount = 0}) {
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
                {it.to==="/detected-transactions" && pendingCount > 0 && (
                  <span style={{background:"#ef4444",color:"#fff",fontSize:9,fontWeight:700,borderRadius:99,padding:"1px 6px",marginLeft:"auto"}}>{pendingCount}</span>
                )}
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

/**
 * Predict next month's spending using weighted moving average and trend analysis
 * Includes seasonal adjustment for students (exam months, vacation months)
 */
function predictNextMonth(history) {
  const months=Object.keys(history).sort();
  const n=months.length;
  if(n===0) return {value:0,confidence:"Low",method:"No data",factors:[],trendAmt:0};
  
  const vals=months.map(m=>history[m]);
  const wts=[0.50,0.30,0.15,0.05];
  let wSum=0,wTot=0;
  for(let i=0;i<Math.min(4,n);i++){wSum+=vals[n-1-i]*wts[i];wTot+=wts[i];}
  const wma=wSum/wTot;
  
  let slope=0;
  if(n>=2){
    const slice=vals.slice(-Math.min(4,n));
    const xm=(slice.length-1)/2;
    const ym=slice.reduce((a,b)=>a+b,0)/slice.length;
    let num=0,den=0;
    slice.forEach((y,x)=>{num+=(x-xm)*(y-ym);den+=(x-xm)**2;});
    slope=den!==0?num/den:0;
  }
  const trendProjection=wma+slope;
  const now=new Date();
  const curKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  
  let paceProjection=null;
  let daysElapsed=0;
  if(months[n-1]===curKey&&history[curKey]){
    daysElapsed=now.getDate();
    const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
    if(daysElapsed>=4) paceProjection=(history[curKey]/daysElapsed)*daysInMonth;
  }
  
  // ✅ Seasonal adjustment for students
  const nextDate=new Date(now.getFullYear(),now.getMonth()+1,1);
  const nextMonth = nextDate.getMonth() + 1;
  const sameLastYear=`${nextDate.getFullYear()-1}-${String(nextMonth).padStart(2,"0")}`;
  let seasonal=history[sameLastYear]||null;
  
  // Student-specific seasonal factors
  const studentSeasonalFactors = {
    5: 0.7,   // May - Exams, lower spending
    6: 0.6,   // June - Summer break, lowest spending
    7: 0.7,   // July - Summer break continues
    11: 1.2,  // November - Diwali/sales, higher spending
    12: 1.3,  // December - Holidays, highest spending
    1: 1.15,  // January - New year sales
    3: 1.1    // March - Holi/events
  };
  
  const seasonalFactor = studentSeasonalFactors[nextMonth] || 1.0;
  if(seasonal) seasonal = seasonal * seasonalFactor;
  
  let prediction=0;
  if(paceProjection&&months[n-1]===curKey){
    prediction=paceProjection*0.50+trendProjection*0.35+(seasonal?seasonal*0.15:trendProjection*0.15);
  } else if(n>=3){
    prediction=trendProjection*0.60+wma*0.30+(seasonal?seasonal*0.10:trendProjection*0.10);
  } else if(n===2){
    prediction=trendProjection*0.70+wma*0.30;
  } else {
    prediction=wma;
  }
  
  const maxVal=Math.max(...vals);
  const minVal=Math.min(...vals);
  prediction=Math.max(minVal*0.2,Math.min(prediction,maxVal*3));
  prediction=Math.max(0,Math.round(prediction));
  const confidence=n>=4?"High":n>=2?"Medium":"Low";
  
  return {value:prediction,confidence,method:"",factors:[],trendAmt:Math.round(slope)};
}

const COLORS=["#7c5cbf","#a78bfa","#34d399","#60a5fa","#fb923c","#f472b6","#facc15","#38bdf8","#4ade80","#f87171"];
const CAT_EMOJI={
  Food:"🍜", Groceries:"🛒", Transport:"🚗", Shopping:"🛍️", 
  Entertainment:"🎬", Bills:"💡", Medicine:"💊", Travel:"✈️", 
  Coffee:"☕", Books:"📚", Rent:"🏠", Other:"💳", Finance:"💳",
  Education:"📚", Hostel:"🏠", Mess:"🍜", Stationery:"✏️",
  Laundry:"🧺", Gym:"💪", Subscriptions:"📺"
};

/**
 * Calculate financial health score based on multiple factors
 */
function healthScore(avgPerMonth,trend,catLabels,catTotals,totalSpent) {
  let s=100;
  
  // Base on average monthly spend
  if(avgPerMonth>20000) s-=15;
  if(avgPerMonth>40000) s-=15;
  if(avgPerMonth<8000) s+=10; // Bonus for low spending
  
  // Trend impact
  if(trend>20) s-=20; 
  else if(trend>10) s-=10;
  else if(trend<-10) s+=10; // Bonus for reducing spending
  
  // Category diversification
  if(catLabels.length<3) s-=10;
  if(catLabels.length>6) s+=5;
  
  // Check for over-concentration
  const topPct=totalSpent>0&&catLabels[0]?catTotals[catLabels[0]]/totalSpent*100:0;
  if(topPct>60) s-=15;
  if(topPct<30 && catLabels.length>3) s+=5;
  
  // Emergency fund check (simulated)
  const hasSavings = catLabels.includes("Savings") || catLabels.includes("Investment");
  if(hasSavings) s+=10;
  
  return Math.max(10,Math.min(100,s));
}

/**
 * ✅ ENHANCED: Generate student-specific insights with actionable tips
 */
function getStudentInsights(catTotals, catLabels, avgPerMonth, trend, totalSpent, monthlyData, expenses) {
  const ins=[];
  const daily=avgPerMonth/30;
  const now=new Date();
  const currentMonth = now.getMonth() + 1;
  
  // Insight 1: Spending trend alert
  if(trend>20) {
    ins.push({
      icon:"⚠️",
      title:"Spending jumped " + trend.toFixed(0) + "%!",
      body:"Your spending rose sharply vs last month. Check what changed in your top categories and set a limit.",
      action:"Set Budget",
      actionLink:"/budgets",
      color:"var(--red)",
      bg:"var(--rbg)",
      type:"alert"
    });
  } else if(trend<-10) {
    ins.push({
      icon:"🎉",
      title:"You saved more this month!",
      body:`Spending dropped ${Math.abs(trend).toFixed(0)}% vs last month. Great discipline — keep it up!`,
      action:"View Savings",
      actionLink:"/goals",
      color:"var(--green)",
      bg:"var(--gbg)",
      type:"positive"
    });
  }
  
  // Insight 2: Food spending analysis
  const food=(catTotals["Food"]||0)+(catTotals["Groceries"]||0)+(catTotals["Mess"]||0);
  const foodPct=totalSpent>0?food/totalSpent*100:0;
  if(foodPct>45) {
    const potentialSave = Math.round(food * 0.25);
    ins.push({
      icon:"🍜",
      title:"Food is your biggest expense",
      body:`₹${fmt(food)} (${foodPct.toFixed(0)}%) on food. Cooking at home 3x/week could save ₹${fmt(potentialSave)} monthly.`,
      action:"Mess vs Home",
      actionLink:"/tips/food",
      color:"var(--amber)",
      bg:"var(--abg)",
      type:"saving"
    });
  } else if(foodPct<20 && foodPct>0) {
    ins.push({
      icon:"🥗",
      title:"Great food spending balance!",
      body:`Only ${foodPct.toFixed(0)}% of your budget goes to food. This leaves more for other priorities.`,
      action:"Share Tip",
      actionLink:"/tips",
      color:"var(--green)",
      bg:"var(--gbg)",
      type:"positive"
    });
  }
  
  // Insight 3: Daily spend analysis
  if(daily<150) {
    ins.push({
      icon:"🌟",
      title:`Daily spend: ₹${fmt(Math.round(daily))}`,
      body:"Excellent! Under ₹150/day is exceptional for a student budget. You're on track for great savings!",
      action:"Set Savings Goal",
      actionLink:"/goals",
      color:"var(--green)",
      bg:"var(--gbg)",
      type:"positive"
    });
  } else if(daily<250) {
    ins.push({
      icon:"👍",
      title:`Daily spend: ₹${fmt(Math.round(daily))}`,
      body:"Good job! Under ₹250/day is solid for a student. Try to keep this consistent.",
      action:"Track Daily",
      actionLink:"/transactions",
      color:"var(--blue)",
      bg:"var(--bbg)",
      type:"info"
    });
  } else if(daily<400) {
    const potentialSave = Math.round((daily - 250) * 30);
    ins.push({
      icon:"📈",
      title:`Daily spend: ₹${fmt(Math.round(daily))}`,
      body:`Your daily spend is high. Cutting to ₹250/day would save ₹${fmt(potentialSave)}/month — that's a new phone in 6 months!`,
      action:"Reduce Spending",
      actionLink:"/tips",
      color:"var(--amber)",
      bg:"var(--abg)",
      type:"warning"
    });
  } else {
    const potentialSave = Math.round((daily - 250) * 30);
    ins.push({
      icon:"🚨",
      title:`Daily spend: ₹${fmt(Math.round(daily))}`,
      body:`Critical: ₹${fmt(Math.round(daily))}/day is very high. Reducing to ₹250/day saves ₹${fmt(potentialSave)}/month — enough for rent or EMI!`,
      action:"Create Budget",
      actionLink:"/budgets",
      color:"var(--red)",
      bg:"var(--rbg)",
      type:"critical"
    });
  }
  
  // Insight 4: Entertainment spending
  const ent=catTotals["Entertainment"]||0;
  const entPct=totalSpent>0?ent/totalSpent*100:0;
  if(entPct>15) {
    const ottSave = Math.round(ent * 0.4);
    ins.push({
      icon:"🎬",
      title:"Entertainment spending is high",
      body:`₹${fmt(ent)} (${entPct.toFixed(0)}%) on entertainment. Share OTT accounts (save ₹${fmt(ottSave)}/year) or use student discounts.`,
      action:"Student Discounts",
      actionLink:"/tips/entertainment",
      color:"var(--accent)",
      bg:"#f5f3ff",
      type:"saving"
    });
  }
  
  // Insight 5: Travel spending
  const travel=catTotals["Travel"]||0;
  const travelPct=totalSpent>0?travel/totalSpent*100:0;
  if(travelPct>20) {
    ins.push({
      icon:"✈️",
      title:"Travel spending is significant",
      body:`${travelPct.toFixed(0)}% of your budget goes to travel. Consider student train passes or carpooling to save up to 40%.`,
      action:"Travel Tips",
      actionLink:"/tips/travel",
      color:"var(--blue)",
      bg:"var(--bbg)",
      type:"saving"
    });
  }
  
  // Insight 6: Subscription analysis
  const subscriptions=catTotals["Subscriptions"]||0;
  if(subscriptions>500) {
    ins.push({
      icon:"📺",
      title:"Subscription costs adding up",
      body:`₹${fmt(subscriptions)} on subscriptions. Do you use all of them? Cancelling one could save ₹${fmt(Math.round(subscriptions/3))}/month.`,
      action:"Review Subs",
      actionLink:"/reminders",
      color:"var(--amber)",
      bg:"var(--abg)",
      type:"saving"
    });
  }
  
  // Insight 7: Exam season adjustment (April-May, November-December)
  const examMonths = [4, 5, 11, 12];
  if(examMonths.includes(currentMonth)) {
    ins.push({
      icon:"📚",
      title:"Exam season is here!",
      body:"Your spending typically drops during exams. Use this time to save extra for the next semester.",
      action:"Set Exam Goal",
      actionLink:"/goals",
      color:"var(--blue)",
      bg:"var(--bbg)",
      type:"info"
    });
  }
  
  // Insight 8: Summer break (June-July)
  if(currentMonth === 6 || currentMonth === 7) {
    ins.push({
      icon:"☀️",
      title:"Summer break saving opportunity",
      body:"Less college expenses means more savings. Consider an internship or summer job to boost your income!",
      action:"Find Internships",
      actionLink:"/tips/summer",
      color:"var(--green)",
      bg:"var(--gbg)",
      type:"positive"
    });
  }
  
  // Insight 9: Festival season (October-December)
  if(currentMonth >= 10 && currentMonth <= 12) {
    ins.push({
      icon:"🎊",
      title:"Festival season spending alert",
      body:"Spending tends to increase during festivals. Set a strict budget and track every expense.",
      action:"Set Festival Budget",
      actionLink:"/budgets",
      color:"var(--amber)",
      bg:"var(--abg)",
      type:"warning"
    });
  }
  
  // Insight 10: Saving potential based on top category
  const topCategory = catLabels[0];
  if(topCategory && totalSpent > 0) {
    const topAmount = catTotals[topCategory];
    const savePotential = Math.round(topAmount * 0.15);
    const yearlySave = savePotential * 12;
    
    ins.push({
      icon:"💰",
      title:`Save ₹${fmt(savePotential)}/month potential`,
      body:`Cutting 15% from "${topCategory}" = ₹${fmt(yearlySave)}/year. That's a new laptop, a trip to Goa, or 6 months of groceries!`,
      action:`Save for ${topCategory === "Food" ? "Laptop" : topCategory === "Entertainment" ? "Trip" : "Emergency Fund"}`,
      actionLink:"/goals",
      color:"var(--green)",
      bg:"var(--gbg)",
      type:"saving"
    });
  }
  
  // Insight 11: Peer comparison (simulated)
  const peerAvg = 12000; // Simulated average student spending
  if(avgPerMonth < peerAvg - 3000) {
    ins.push({
      icon:"🏆",
      title:"You're spending less than most students!",
      body:`₹${fmt(Math.round(avgPerMonth))}/month vs ₹${fmt(peerAvg)} average. Great financial discipline!`,
      action:"Celebrate 🎉",
      actionLink:"/goals",
      color:"var(--green)",
      bg:"var(--gbg)",
      type:"positive"
    });
  } else if(avgPerMonth > peerAvg + 5000) {
    ins.push({
      icon:"📊",
      title:"You're spending above average",
      body:`₹${fmt(Math.round(avgPerMonth))}/month vs ₹${fmt(peerAvg)} average for students. Review your top expenses.`,
      action:"See Breakdown",
      actionLink:"#",
      color:"var(--amber)",
      bg:"var(--abg)",
      type:"warning"
    });
  }
  
  // Insight 12: Weekend vs weekday spending analysis
  const weekdayTotal = 0;
  const weekendTotal = 0;
  expenses.forEach(e => {
    if(e.date) {
      const day = new Date(e.date).getDay();
      if(day === 0 || day === 6) {
        // weekend spending logic would go here
      }
    }
  });
  
  // Return top 6 insights
  return ins.slice(0,6);
}

/**
 * Generate quick saving tips for students
 */
function getSavingTips(monthlySpend, topCategory) {
  const tips = [
    { emoji: "☕", text: "Skip 2 coffees/week → Save ₹800/month", link: "/tips/coffee" },
    { emoji: "🍕", text: "Cook dinner 3x/week → Save ₹1500/month", link: "/tips/cooking" },
    { emoji: "🚗", text: "Share cabs/walk short distances → Save ₹1000/month", link: "/tips/transport" },
    { emoji: "📱", text: "Use student OTT plans → Save ₹500/month", link: "/tips/ott" },
    { emoji: "🛍️", text: "Wait 24h before impulse buys → Save ₹2000/month", link: "/tips/shopping" },
    { emoji: "📚", text: "Buy used textbooks → Save ₹5000/semester", link: "/tips/books" },
    { emoji: "🍽️", text: "Mess vs outside food → Save ₹3000/month", link: "/tips/food" },
    { emoji: "💳", text: "Use student ID for discounts → Save 10-30%", link: "/tips/discounts" },
  ];
  
  // Return random 3 tips
  return [...tips].sort(() => 0.5 - Math.random()).slice(0, 3);
}

function Empty({msg}) {
  return <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"var(--ink4)",gap:8}}><div style={{fontSize:32,opacity:.3}}>📊</div><div style={{fontSize:12}}>{msg}</div></div>;
}

const tooltipOpts={backgroundColor:"rgba(17,24,39,.92)",padding:10,cornerRadius:8,titleFont:{family:"Inter"},bodyFont:{family:"Inter",size:12}};

export default function Analytics() {
  injectCSS();
  const navigate=useNavigate();
  const token=localStorage.getItem("token");
  const [expenses,setExpenses]=useState([]);
  const [history,setHistory]=useState({});
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("overview");
  const [showBreakdown,setShowBreakdown]=useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(()=>{
    if(!token){navigate("/",{replace:true});return;}
    load();
    loadPendingCount();
  },[]);
  
  async function loadPendingCount() {
    try {
      const res = await fetch(`${BASE_URL}/api/detected/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.ok) {
        const data = await res.json();
        setPendingCount(data.count || 0);
      }
    } catch(e) { console.error("Failed to load pending count:", e); }
  }

  async function load() {
    try {
      const r=await fetch(`${BASE_URL}/api/expenses/`,{headers:{Authorization:`Bearer ${token}`}});
      if(!r.ok){localStorage.removeItem("token");navigate("/",{replace:true});return;}
      const data=await r.json();
      const arr=Array.isArray(data)?data:[];
      setExpenses(arr);
      const monthly={};
      arr.forEach(e=>{if(!e.date)return;const m=e.date.slice(0,7);monthly[m]=(monthly[m]||0)+e.amount;});
      setHistory(monthly);
    } finally{setLoading(false);}
  }

  function logout(){localStorage.removeItem("token");navigate("/",{replace:true});}

  const months=Object.keys(history).sort();
  const monthVals=months.map(m=>history[m]);
  const catTotals={};
  expenses.forEach(e=>{if(!e.category)return;const k=e.category.charAt(0).toUpperCase()+e.category.slice(1).toLowerCase();catTotals[k]=(catTotals[k]||0)+e.amount;});
  const catLabels=Object.keys(catTotals).sort((a,b)=>catTotals[b]-catTotals[a]);
  const catData=catLabels.map(l=>catTotals[l]);
  const totalSpent=expenses.reduce((s,e)=>s+e.amount,0);
  const avgPerMonth=months.length>0?totalSpent/months.length:0;
  const curMonth=months[months.length-1]||null;
  const prevMonth=months[months.length-2]||null;
  const curVal=curMonth?history[curMonth]:0;
  const prevVal=prevMonth?history[prevMonth]:0;
  const trend=prevVal>0?((curVal-prevVal)/prevVal*100):0;
  const score=healthScore(avgPerMonth,trend,catLabels,catTotals,totalSpent);
  const scoreColor=score>=75?"var(--green)":score>=50?"var(--amber)":"var(--red)";
  const scoreLabel=score>=75?"Excellent! 🌟":score>=50?"Needs Attention ⚡":"At Risk ⚠️";
  const insights=getStudentInsights(catTotals,catLabels,avgPerMonth,trend,totalSpent,history,expenses);
  const savingTips = getSavingTips(avgPerMonth, catLabels[0]);
  const dailyAvg=avgPerMonth/30;
  const pred=predictNextMonth(history);
  const confColor=pred.confidence==="High"?"var(--green)":pred.confidence==="Medium"?"var(--amber)":"var(--red)";
  const confBg=pred.confidence==="High"?"var(--gbg)":pred.confidence==="Medium"?"var(--abg)":"var(--rbg)";

  const wdTotals=Array(7).fill(0);
  expenses.forEach(e=>{if(!e.date)return;wdTotals[new Date(e.date).getDay()]+=e.amount;});
  const wdLabels=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const peakDay=wdLabels[wdTotals.indexOf(Math.max(...wdTotals))];
  const scaleStyle={grid:{color:"rgba(0,0,0,.04)"},ticks:{font:{size:11,family:"Inter"}},border:{display:false}};

  const lineData={labels:months.map(fmtM),datasets:[{label:"Spend",data:monthVals,borderColor:"#7c5cbf",backgroundColor:"rgba(124,92,191,.07)",fill:true,tension:.4,borderWidth:2.5,pointRadius:5,pointBackgroundColor:"#7c5cbf",pointBorderColor:"#fff",pointBorderWidth:2,pointHoverRadius:7}]};
  const lineOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>`  ₹${fmt(ctx.parsed.y)}`}}},scales:{y:{...scaleStyle,beginAtZero:true,ticks:{...scaleStyle.ticks,callback:v=>`₹${fmtK(v)}`}},x:{...scaleStyle,grid:{display:false}}}};
  const donutData={labels:catLabels,datasets:[{data:catData,backgroundColor:catLabels.map((_,i)=>COLORS[i%COLORS.length]),borderWidth:0,hoverOffset:10}]};
  const donutOpts={responsive:true,maintainAspectRatio:false,cutout:"68%",plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>{const t=catData.reduce((a,b)=>a+b,0);const pct=(ctx.parsed/t*100).toFixed(1);return `  ${ctx.label}: ₹${fmt(ctx.parsed)} (${pct}%)`;}}}}};
  const wdBarData={labels:wdLabels,datasets:[{data:wdTotals,backgroundColor:wdTotals.map((v,i)=>i===wdTotals.indexOf(Math.max(...wdTotals))?"#7c5cbf":"rgba(124,92,191,.28)"),borderRadius:6,borderWidth:0}]};
  const wdBarOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>`  ₹${fmt(ctx.parsed.y)}`}}},scales:{y:{...scaleStyle,beginAtZero:true,ticks:{...scaleStyle.ticks,callback:v=>`₹${fmtK(v)}`}},x:{...scaleStyle,grid:{display:false}}}};

  if(loading) return <LoadingScreen text="Crunching numbers…"/>;

  const TABS=[{id:"overview",label:"Overview"},{id:"insights",label:"Student Insights"},{id:"breakdown",label:"Full Breakdown"}];

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout} pendingCount={pendingCount}/>
      <BottomNav pendingCount={pendingCount}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Mobile header */}
        <MobileHeader
          title="Analytics 📊"
          subtitle={`Score: ${score} · ${scoreLabel}`}
        />

        {/* Desktop header */}
        <div className="desk-hdr" style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)"}}>Analytics</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>Understand your money, make smarter decisions</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"#f5f3ff",border:"1px solid #e0d9f7",borderRadius:12,padding:"10px 16px"}}>
            <div style={{fontSize:26,fontWeight:700,color:scoreColor}}>{score}</div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:"1px"}}>Budget Health</div>
              <div style={{fontSize:12,fontWeight:600,color:scoreColor}}>{scoreLabel}</div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"0 16px",display:"flex",overflowX:"auto",flexShrink:0}}>
          {TABS.map(t=>(
            <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}
              style={{padding:"12px 14px",borderBottom:tab===t.id?"2px solid var(--accent)":"2px solid transparent",fontSize:13,fontWeight:tab===t.id?600:500,color:tab===t.id?"var(--accent)":"var(--ink3)",whiteSpace:"nowrap"}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="analytics-content" style={{flex:1,overflowY:"auto",padding:"16px 16px 28px",background:"var(--bg)"}}>

          {tab==="overview"&&(
            <>
              {/* Mobile health score bar */}
              <div className="mob-only fu0" style={{marginBottom:12,padding:"12px 14px",borderRadius:12,background:"#f5f3ff",border:"1px solid #e0d9f7",flexDirection:"row",alignItems:"center",gap:12}}>
                <div style={{fontSize:32,fontWeight:800,color:scoreColor,fontFamily:"'Sora',sans-serif"}}>{score}</div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".8px"}}>Budget Health</div>
                  <div style={{fontSize:14,fontWeight:700,color:scoreColor}}>{scoreLabel}</div>
                </div>
              </div>

              {/* KPI grid */}
              <div className="stats-grid fu0" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:16}}>
                {[
                  {label:"Total Spent",val:totalSpent,icon:"💸",bg:"#faf5ff",extra:null},
                  {label:"This Month",val:curVal,icon:"📅",bg:"#eff6ff",extra:"trend"},
                  {label:"Daily Avg",val:Math.round(dailyAvg),icon:"☀️",bg:"#ecfdf5",extra:null},
                  {label:"Next Month Est.",val:pred.value,icon:"🔮",bg:"#fffbeb",extra:"pred"},
                ].map((k,i)=>(
                  <div key={i} className="kcard fu0" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:600,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".6px",lineHeight:1.4}}>{k.label}</div>
                      <div style={{width:30,height:30,borderRadius:8,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{k.icon}</div>
                    </div>
                    <div style={{fontSize:18,fontWeight:700,color:"var(--ink)",marginBottom:4,fontFamily:"'Sora',sans-serif"}}>₹{fmtK(k.val)}</div>
                    {k.extra==="trend"&&(
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:10,fontWeight:700,color:trend>=0?"var(--red)":"var(--green)",background:trend>=0?"var(--rbg)":"var(--gbg)",padding:"2px 7px",borderRadius:99}}>
                          {trend>=0?"↑":"↓"}{Math.abs(trend).toFixed(1)}%
                        </span>
                        <span style={{fontSize:10,color:"var(--ink4)"}}>vs last</span>
                      </div>
                    )}
                    {k.extra==="pred"&&(
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:10,fontWeight:700,color:confColor,background:confBg,padding:"2px 7px",borderRadius:99}}>{pred.confidence}</span>
                      </div>
                    )}
                    {!k.extra&&<span style={{fontSize:10,color:"var(--ink4)"}}>all time</span>}
                  </div>
                ))}
              </div>

              {/* Trend chart */}
              <div className="fu1" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:12}}>Monthly Spending Trend</div>
                <div style={{height:200}}>{months.length>0?<Line data={lineData} options={lineOpts}/>:<Empty msg="Add expenses to see your trend"/>}</div>
              </div>

              {/* Charts grid */}
              <div className="charts-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div className="fu2" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:12}}>Spend by Category</div>
                  {catLabels.length>0?(
                    <>
                      <div style={{height:160}}><Doughnut data={donutData} options={donutOpts}/></div>
                      <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:"4px 12px"}}>
                        {catLabels.slice(0,6).map((cat,i)=>(
                          <div key={cat} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--ink3)"}}>
                            <span style={{width:8,height:8,borderRadius:"50%",background:COLORS[i%COLORS.length],flexShrink:0,display:"inline-block"}}/>
                            {cat} · ₹{fmtK(catTotals[cat])}
                          </div>
                        ))}
                      </div>
                    </>
                  ):<Empty msg="No categories yet"/>}
                </div>
                <div className="fu2" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:12}}>Spending by Day of Week</div>
                  <div style={{height:160}}>{wdTotals.some(v=>v>0)?<Bar data={wdBarData} options={wdBarOpts}/>:<Empty msg="No data yet"/>}</div>
                  {wdTotals.some(v=>v>0)&&<div style={{fontSize:11,color:"var(--ink3)",marginTop:8,textAlign:"center"}}>📌 You spend most on <strong>{peakDay}s</strong></div>}
                </div>
              </div>

              {/* Quick Saving Tips Section */}
              <div className="fu3" style={{marginTop:8}}>
                <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>💡 Quick Saving Tips for Students</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {savingTips.map((tip, idx) => (
                    <div key={idx} className="tip-badge" style={{
                      display:"flex",alignItems:"center",gap:10,
                      background:"var(--surface)",border:"1px solid var(--border)",
                      borderRadius:10,padding:"10px 14px",
                      cursor:"pointer"
                    }}>
                      <span style={{fontSize:20}}>{tip.emoji}</span>
                      <span style={{fontSize:12,color:"var(--ink2)",flex:1}}>{tip.text}</span>
                      <Icon d={ICONS.chevronRight} size={14} color="var(--ink4)"/>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab==="insights"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>🎓 Personalized for You — Student Edition</div>
              
              {/* Score summary card */}
              <div style={{
                background:"linear-gradient(135deg, var(--sb), #4c1d95)",
                borderRadius:16,padding:"18px 20px",marginBottom:4,
                color:"#fff",boxShadow:"0 4px 20px rgba(45,27,105,.25)"
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:12,opacity:.7,letterSpacing:"1px"}}>YOUR FINANCIAL HEALTH SCORE</div>
                    <div style={{fontSize:42,fontWeight:800,fontFamily:"'Sora',sans-serif",marginTop:4}}>{score}</div>
                  </div>
                  <div style={{
                    background:"rgba(255,255,255,.15)",borderRadius:99,
                    padding:"8px 16px",fontSize:14,fontWeight:600
                  }}>{scoreLabel}</div>
                </div>
                <div style={{height:6,background:"rgba(255,255,255,.2)",borderRadius:99,overflow:"hidden"}}>
                  <div style={{width:`${score}%`,height:"100%",background:"#a78bfa",borderRadius:99}}/>
                </div>
                <div style={{fontSize:11,opacity:.7,marginTop:10}}>
                  Based on spending patterns, category diversification, and saving habits
                </div>
              </div>
              
              {insights.length===0?(
                <div style={{background:"var(--surface)",borderRadius:12,padding:"40px 20px",textAlign:"center",border:"1px solid var(--border)"}}>
                  <div style={{fontSize:28,marginBottom:8}}>📊</div>
                  <div style={{fontSize:13,color:"var(--ink3)"}}>Add more expenses to get personalized insights!</div>
                </div>
              ):insights.map((ins,i)=>(
                <div key={i} className="ins-card" style={{
                  background:"var(--surface)",
                  border:"1px solid var(--border)",
                  borderRadius:12,
                  padding:"14px 16px",
                  borderLeft:`4px solid ${ins.color}`,
                  boxShadow:"0 1px 4px rgba(0,0,0,.04)"
                }}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <span style={{fontSize:22,flexShrink:0}}>{ins.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",marginBottom:4}}>{ins.title}</div>
                      <div style={{fontSize:12,color:"var(--ink3)",lineHeight:1.5,marginBottom:ins.action ? 10 : 0}}>{ins.body}</div>
                      {ins.action && (
                        <a href={ins.actionLink} style={{
                          display:"inline-flex",alignItems:"center",gap:4,
                          fontSize:11,fontWeight:600,color:ins.color,
                          textDecoration:"none"
                        }}>
                          {ins.action} →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Motivational quote for students */}
              <div style={{
                background:"linear-gradient(135deg, #fef3c7, #fde68a)",
                borderRadius:12,padding:"14px 16px",marginTop:8,
                border:"1px solid #fcd34d",textAlign:"center"
              }}>
                <span style={{fontSize:16,marginRight:8}}>💪</span>
                <span style={{fontSize:12,color:"#92400e",fontWeight:500}}>
                  "Small savings today = Big opportunities tomorrow. Every ₹100 saved is a step towards your dream!"
                </span>
              </div>
            </div>
          )}

          {tab==="breakdown"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>All Categories</div>
              {catLabels.length===0?(
                <div style={{background:"var(--surface)",borderRadius:12,padding:"40px 20px",textAlign:"center",border:"1px solid var(--border)"}}>
                  <div style={{fontSize:28,marginBottom:8}}>📋</div>
                  <div style={{fontSize:13,color:"var(--ink3)"}}>No expense data yet.</div>
                </div>
              ):catLabels.map((cat,i)=>{
                const amt=catTotals[cat];
                const pct=totalSpent>0?(amt/totalSpent*100).toFixed(1):0;
                return (
                  <div key={cat} className="catrow" style={{background:"var(--surface)",borderRadius:12,padding:"12px 14px",border:"1px solid var(--border)",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:18}}>{CAT_EMOJI[cat]||"💳"}</span>
                        <span style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>{cat}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>₹{fmt(amt)}</div>
                        <div style={{fontSize:10,color:"var(--ink4)"}}>{pct}%</div>
                      </div>
                    </div>
                    <div style={{height:5,background:"#f3f4f6",borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,borderRadius:99,background:COLORS[i%COLORS.length],transition:"width .9s ease"}}/>
                    </div>
                  </div>
                );
              })}
              
              {/* Summary footer */}
              <div style={{
                background:"var(--surface)",borderRadius:12,padding:"14px 16px",
                border:"1px solid var(--border)",marginTop:8,textAlign:"center"
              }}>
                <div style={{fontSize:12,color:"var(--ink3)"}}>
                  Total spent across all time: <strong style={{color:"var(--ink)"}}>₹{fmt(totalSpent)}</strong>
                </div>
                <div style={{fontSize:11,color:"var(--ink4)",marginTop:4}}>
                  Average monthly: ₹{fmt(Math.round(avgPerMonth))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}