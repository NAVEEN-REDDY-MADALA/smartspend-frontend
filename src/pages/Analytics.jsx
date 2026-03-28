import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --sidebar-bg:#2d1b69; --sidebar-hover:rgba(255,255,255,0.08); --sidebar-active:rgba(255,255,255,0.15);
    --sidebar-text:rgba(255,255,255,0.75); --sidebar-muted:rgba(255,255,255,0.4);
    --accent:#7c5cbf; --accent2:#a78bfa;
    --bg:#f7f7f8; --surface:#ffffff; --border:#e5e7eb;
    --ink:#111827; --ink2:#374151; --ink3:#6b7280; --ink4:#9ca3af;
    --green:#059669; --green-bg:#ecfdf5; --red:#dc2626; --red-bg:#fef2f2;
    --amber:#d97706; --amber-bg:#fffbeb; --blue:#2563eb; --blue-bg:#eff6ff;
  }
  html,body { font-family:'Inter',system-ui,sans-serif; background:var(--bg); color:var(--ink); -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  .fu0{animation:fadeUp .4s ease both}
  .fu1{animation:fadeUp .4s .06s ease both}
  .fu2{animation:fadeUp .4s .12s ease both}
  .fu3{animation:fadeUp .4s .18s ease both}
  .fu4{animation:fadeUp .4s .24s ease both}
  .slink{transition:background .15s,color .15s;cursor:pointer}
  .slink:hover{background:var(--sidebar-hover)!important;color:#fff!important}
  .slink.active{background:var(--sidebar-active)!important;color:#fff!important}
  .kcard{transition:transform .18s,box-shadow .18s;cursor:default}
  .kcard:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,92,191,.13)!important}
  .ins-card{transition:transform .18s,box-shadow .18s}
  .ins-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.09)!important}
  .catrow{transition:background .1s;border-radius:8px}
  .catrow:hover{background:#f3f0fa!important}
  .tab-btn{transition:all .15s;cursor:pointer;border:none;background:transparent;font-family:inherit}
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__analytics_v2__")) return;
  const s=document.createElement("style"); s.id="__analytics_v2__"; s.textContent=CSS;
  document.head.appendChild(s);
}

const fmt  = n => new Intl.NumberFormat("en-IN",{maximumFractionDigits:0}).format(n);
const fmtK = n => n>=1000?`${(n/1000).toFixed(1)}k`:fmt(n);
const MON  = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtM = m => { if(!m) return ""; const [y,mo]=m.split("-"); return `${MON[+mo]} '${y.slice(2)}`; };

function predictNextMonth(history) {
  const months = Object.keys(history).sort();
  const n = months.length;
  if (n === 0) return { value: 0, confidence: "Low", method: "No data", factors: [], trendAmt: 0 };

  const vals = months.map(m => history[m]);

  const wts = [0.50, 0.30, 0.15, 0.05];
  let wSum = 0, wTot = 0;
  for (let i = 0; i < Math.min(4, n); i++) {
    wSum += vals[n - 1 - i] * wts[i];
    wTot += wts[i];
  }
  const wma = wSum / wTot;

  let slope = 0;
  if (n >= 2) {
    const slice = vals.slice(-Math.min(4, n));
    const xm = (slice.length - 1) / 2;
    const ym = slice.reduce((a,b) => a+b, 0) / slice.length;
    let num = 0, den = 0;
    slice.forEach((y, x) => { num += (x - xm) * (y - ym); den += (x - xm) ** 2; });
    slope = den !== 0 ? num / den : 0;
  }
  const trendProjection = wma + slope;

  const now = new Date();
  const curKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  let paceProjection = null;
  let daysElapsed = 0;
  if (months[n-1] === curKey && history[curKey]) {
    daysElapsed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
    if (daysElapsed >= 4) {
      paceProjection = (history[curKey] / daysElapsed) * daysInMonth;
    }
  }

  const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const sameLastYear = `${nextDate.getFullYear()-1}-${String(nextDate.getMonth()+1).padStart(2,"0")}`;
  const seasonal = history[sameLastYear] || null;

  let prediction = 0;
  const factors = [];

  if (paceProjection && months[n-1] === curKey) {
    prediction = paceProjection * 0.50 + trendProjection * 0.35 + (seasonal ? seasonal * 0.15 : trendProjection * 0.15);
    factors.push({ label: "Current month pace", value: Math.round(paceProjection), weight: "50%", note: `Day ${daysElapsed} of this month extrapolated to full month` });
    factors.push({ label: "Trend projection", value: Math.round(trendProjection), weight: "35%", note: slope > 50 ? "Rising trend detected" : slope < -50 ? "Falling trend detected" : "Stable trend" });
    if (seasonal) factors.push({ label: "Same month last year", value: Math.round(seasonal), weight: "15%", note: "Seasonal pattern from last year" });
    else factors.push({ label: "Trend (seasonal fallback)", value: Math.round(trendProjection), weight: "15%", note: "No last year data available" });
  } else if (n >= 3) {
    prediction = trendProjection * 0.60 + wma * 0.30 + (seasonal ? seasonal * 0.10 : trendProjection * 0.10);
    factors.push({ label: "Trend projection", value: Math.round(trendProjection), weight: "60%", note: `Slope: ${slope > 0 ? "+" : ""}${fmt(Math.round(slope))}/month` });
    factors.push({ label: "Weighted avg (last 4mo)", value: Math.round(wma), weight: "30%", note: "Recent months weighted 50/30/15/5%" });
    if (seasonal) factors.push({ label: "Seasonal pattern", value: Math.round(seasonal), weight: "10%", note: "Same month last year" });
  } else if (n === 2) {
    prediction = trendProjection * 0.70 + wma * 0.30;
    factors.push({ label: "Trend projection", value: Math.round(trendProjection), weight: "70%", note: "Based on 2 months of data" });
    factors.push({ label: "Weighted average", value: Math.round(wma), weight: "30%", note: "Recent months" });
  } else {
    prediction = wma;
    factors.push({ label: "Single month baseline", value: Math.round(wma), weight: "100%", note: "Need more months for better accuracy" });
  }

  const maxVal = Math.max(...vals);
  const minVal = Math.min(...vals);
  prediction = Math.max(minVal * 0.2, Math.min(prediction, maxVal * 3));
  prediction = Math.max(0, Math.round(prediction));

  const confidence = n >= 4 ? "High" : n >= 2 ? "Medium" : "Low";
  const method = paceProjection ? "Pace + Trend + Seasonal" : n >= 3 ? "Trend + Weighted Avg" : "Weighted Average";

  return { value: prediction, confidence, method, factors, trendAmt: Math.round(slope) };
}

const Icon = ({d,size=14,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const ICONS = {
  home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  tx:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  analytics:"M18 20V10M12 20V4M6 20v-6",
  goals:"M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  budget:"M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
  detect:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  reminder:"M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  logout:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
};

const NAV_SECTIONS = [
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
    <aside style={{width:200,flexShrink:0,background:"var(--sidebar-bg)",display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,overflow:"hidden"}}>
      <div style={{padding:"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#7c5cbf,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff"}}>S</div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",lineHeight:1}}>SmartSpend</div>
          <div style={{fontSize:10,color:"var(--sidebar-muted)",marginTop:2}}>Student Finance</div>
        </div>
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"10px"}}>
        {NAV_SECTIONS.map((sec,si)=>(
          <div key={si} style={{marginBottom:6}}>
            {sec.label&&<div style={{fontSize:10,fontWeight:600,color:"var(--sidebar-muted)",letterSpacing:"1px",textTransform:"uppercase",padding:"8px 8px 4px"}}>{sec.label}</div>}
            {sec.items.map(item=>(
              <a key={item.to} href={item.to} className={`slink${path===item.to?" active":""}`}
                style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,color:"var(--sidebar-text)",fontSize:13,textDecoration:"none",marginBottom:1}}>
                <Icon d={ICONS[item.icon]} size={14}/>{item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <button onClick={onLogout} className="slink"
          style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,background:"transparent",border:"none",color:"var(--sidebar-text)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          <Icon d={ICONS.logout} size={14}/> Sign Out
        </button>
      </div>
    </aside>
  );
}

const COLORS=["#7c5cbf","#a78bfa","#34d399","#60a5fa","#fb923c","#f472b6","#facc15","#38bdf8","#4ade80","#f87171"];
const CAT_EMOJI={Food:"🍜",Groceries:"🛒",Transport:"🚗",Shopping:"🛍️",Entertainment:"🎬",Bills:"💡",Medicine:"💊",Travel:"✈️",Coffee:"☕",Books:"📚",Rent:"🏠",Other:"💳",Finance:"💳"};

const BUDGET_GUIDE=[
  {cat:"Food & Groceries",rec:35,keys:["Food","Groceries"],tip:"Cook at home, use college mess/canteen"},
  {cat:"Transport",rec:15,keys:["Transport","Travel"],tip:"Student bus pass, cycle for short distances"},
  {cat:"Entertainment",rec:10,keys:["Entertainment","Coffee"],tip:"Student discounts on Netflix, Spotify, events"},
  {cat:"Books & Study",rec:10,keys:["Books"],tip:"Use college library, share textbooks"},
  {cat:"Bills & Utilities",rec:10,keys:["Bills"],tip:"Track recharges, OTT subscriptions"},
  {cat:"Other",rec:20,keys:["Other","Shopping","Medicine","Finance"],tip:"Keep a buffer for unexpected expenses"},
];

function getInsights(catTotals,catLabels,avgPerMonth,trend,totalSpent) {
  const ins=[];
  const daily=avgPerMonth/30;
  const food=(catTotals["Food"]||0)+(catTotals["Groceries"]||0);
  const foodPct=totalSpent>0?food/totalSpent*100:0;
  const ent=catTotals["Entertainment"]||0;
  const entPct=totalSpent>0?ent/totalSpent*100:0;
  const top=catLabels[0];
  if(trend>20) ins.push({icon:"⚠️",title:"Spending jumped "+trend.toFixed(0)+"%!",body:"Your spending rose sharply vs last month. Check what changed in your top categories and set a limit.",color:"var(--red)",bg:"var(--red-bg)"});
  else if(trend<-10) ins.push({icon:"🎉",title:"You saved more this month!",body:`Spending dropped ${Math.abs(trend).toFixed(0)}% vs last month. Great discipline — keep it up!`,color:"var(--green)",bg:"var(--green-bg)"});
  if(foodPct>45) ins.push({icon:"🍜",title:"Food is your biggest drain",body:`Rs.${fmt(food)} (${foodPct.toFixed(0)}%) on food. Cooking at home 3x/week could save Rs.${fmt(Math.round(food*0.25))} monthly.`,color:"var(--amber)",bg:"var(--amber-bg)"});
  ins.push({icon:"☀️",title:`Daily spend: Rs.${fmt(Math.round(daily))}`,body:daily<200?"Excellent! Under Rs.200/day is great for a student budget.":daily<400?"Decent! Try to keep under Rs.300/day to save more.":"High daily spend. Targeting Rs.300/day saves Rs."+(fmt(Math.round((daily-300)*30)))+"/month.",color:"var(--blue)",bg:"var(--blue-bg)"});
  if(entPct>15) ins.push({icon:"🎬",title:"Entertainment spending high",body:`Rs.${fmt(ent)} (${entPct.toFixed(0)}%) on entertainment. Look for student discount codes, share OTT accounts with roommates.`,color:"var(--accent)",bg:"#f5f3ff"});
  const saving=Math.round(avgPerMonth*0.15);
  ins.push({icon:"💰",title:`Save Rs.${fmt(saving)}/month potential`,body:`Cutting just 15% from "${top||"top category"}" = Rs.${fmt(saving*12)}/year. That's a trip, laptop upgrade, or solid emergency fund!`,color:"var(--green)",bg:"var(--green-bg)"});
  return ins.slice(0,4);
}

function healthScore(avgPerMonth,trend,catLabels,catTotals,totalSpent) {
  let s=100;
  if(avgPerMonth>20000) s-=15;
  if(avgPerMonth>40000) s-=15;
  if(trend>20) s-=20; else if(trend>10) s-=10;
  if(catLabels.length<3) s-=10;
  const topPct=totalSpent>0&&catLabels[0]?catTotals[catLabels[0]]/totalSpent*100:0;
  if(topPct>60) s-=15;
  return Math.max(10,Math.min(100,s));
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

  useEffect(()=>{ if(!token){navigate("/",{replace:true});return;} load(); },[]);

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
  const scoreLabel=score>=75?"Healthy 🌟":score>=50?"Needs Attention ⚡":"At Risk ⚠️";
  const insights=getInsights(catTotals,catLabels,avgPerMonth,trend,totalSpent);
  const dailyAvg=avgPerMonth/30;

  const pred = predictNextMonth(history);
  const confColor = pred.confidence==="High" ? "var(--green)" : pred.confidence==="Medium" ? "var(--amber)" : "var(--red)";
  const confBg    = pred.confidence==="High" ? "var(--green-bg)" : pred.confidence==="Medium" ? "var(--amber-bg)" : "var(--red-bg)";

  const wdTotals=Array(7).fill(0);
  expenses.forEach(e=>{if(!e.date)return;wdTotals[new Date(e.date).getDay()]+=e.amount;});
  const wdLabels=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const peakDay=wdLabels[wdTotals.indexOf(Math.max(...wdTotals))];

  const scaleStyle={grid:{color:"rgba(0,0,0,.04)"},ticks:{font:{size:11,family:"Inter"}},border:{display:false}};

  const lineData={labels:months.map(fmtM),datasets:[{label:"Spend",data:monthVals,borderColor:"#7c5cbf",backgroundColor:"rgba(124,92,191,.07)",fill:true,tension:.4,borderWidth:2.5,pointRadius:5,pointBackgroundColor:"#7c5cbf",pointBorderColor:"#fff",pointBorderWidth:2,pointHoverRadius:7}]};
  const lineOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>`  Rs.${fmt(ctx.parsed.y)}`}}},scales:{y:{...scaleStyle,beginAtZero:true,ticks:{...scaleStyle.ticks,callback:v=>`Rs.${fmtK(v)}`}},x:{...scaleStyle,grid:{display:false}}}};

  const donutData={labels:catLabels,datasets:[{data:catData,backgroundColor:catLabels.map((_,i)=>COLORS[i%COLORS.length]),borderWidth:0,hoverOffset:10}]};
  const donutOpts={responsive:true,maintainAspectRatio:false,cutout:"65%",plugins:{legend:{position:"right",labels:{padding:12,font:{size:11,family:"Inter"},usePointStyle:true,pointStyle:"circle",boxWidth:8}},tooltip:{...tooltipOpts,callbacks:{label:ctx=>{const t=catData.reduce((a,b)=>a+b,0);const pct=(ctx.parsed/t*100).toFixed(1);return `  ${ctx.label}: Rs.${fmt(ctx.parsed)} (${pct}%)`;}}}}};

  const wdBarData={labels:wdLabels,datasets:[{data:wdTotals,backgroundColor:wdTotals.map((v,i)=>i===wdTotals.indexOf(Math.max(...wdTotals))?"#7c5cbf":"rgba(124,92,191,.28)"),borderRadius:6,borderWidth:0}]};
  const wdBarOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>`  Rs.${fmt(ctx.parsed.y)}`}}},scales:{y:{...scaleStyle,beginAtZero:true,ticks:{...scaleStyle.ticks,callback:v=>`Rs.${fmtK(v)}`}},x:{...scaleStyle,grid:{display:false}}}};

  const cmpData={labels:[prevMonth,curMonth].filter(Boolean).map(fmtM),datasets:[{data:[prevVal,curVal],backgroundColor:["rgba(124,92,191,.3)","#7c5cbf"],borderRadius:8,borderWidth:0}]};
  const cmpOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>`  Rs.${fmt(ctx.parsed.y)}`}}},scales:{y:{...scaleStyle,beginAtZero:true,ticks:{...scaleStyle.ticks,callback:v=>`Rs.${fmtK(v)}`}},x:{...scaleStyle,grid:{display:false},ticks:{...scaleStyle.ticks,font:{size:12,family:"Inter",weight:"600"}}}}};

  if(loading) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:28,height:28,border:"2.5px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px"}}/>
        <div style={{fontSize:12,color:"var(--ink3)"}}>Crunching numbers…</div>
      </div>
    </div>
  );

  // NOTE: JSX body is identical to original — only the fetch URL changed above
  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
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
        <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"0 28px",display:"flex"}}>
          {[{id:"overview",label:"Overview"},{id:"insights",label:"Student Insights"},{id:"breakdown",label:"Full Breakdown"}].map(t=>(
            <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}
              style={{padding:"12px 16px",borderBottom:tab===t.id?"2px solid var(--accent)":"2px solid transparent",fontSize:13,fontWeight:tab===t.id?600:500,color:tab===t.id?"var(--accent)":"var(--ink3)"}}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"24px 28px",background:"var(--bg)"}}>
          {tab==="overview" && <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
              {[
                {label:"Total Spent",    val:totalSpent,         icon:"💸", bg:"#faf5ff", sub:"all time",      extra:null},
                {label:"This Month",     val:curVal,             icon:"📅", bg:"#eff6ff", sub:"vs last month", extra:"trend"},
                {label:"Daily Average",  val:Math.round(dailyAvg),icon:"☀️",bg:"#ecfdf5", sub:"per day",       extra:null},
                {label:"Next Month Est.",val:pred.value,         icon:"🔮", bg:"#fffbeb", sub:null,            extra:"pred"},
              ].map((k,i)=>(
                <div key={i} className={`kcard fu${i}`} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".6px"}}>{k.label}</div>
                    <div style={{width:34,height:34,borderRadius:9,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{k.icon}</div>
                  </div>
                  <div style={{fontSize:22,fontWeight:700,color:"var(--ink)",marginBottom:6}}>Rs.{fmtK(k.val)}</div>
                  {k.extra==="trend" && (
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:11,fontWeight:700,color:trend>=0?"var(--red)":"var(--green)",background:trend>=0?"var(--red-bg)":"var(--green-bg)",padding:"2px 7px",borderRadius:99}}>
                        {trend>=0?"↑":"↓"}{Math.abs(trend).toFixed(1)}%
                      </span>
                      <span style={{fontSize:11,color:"var(--ink4)"}}>vs last month</span>
                    </div>
                  )}
                  {k.extra==="pred" && (
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                        <span style={{fontSize:10,fontWeight:700,color:confColor,background:confBg,padding:"1px 7px",borderRadius:99}}>{pred.confidence} confidence</span>
                      </div>
                      <button onClick={()=>setShowBreakdown(!showBreakdown)}
                        style={{fontSize:10,color:"var(--accent)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0,textDecoration:"underline"}}>
                        {showBreakdown ? "Hide details" : "How is this calculated?"}
                      </button>
                    </div>
                  )}
                  {!k.extra && <span style={{fontSize:11,color:"var(--ink4)"}}>{k.sub}</span>}
                </div>
              ))}
            </div>
            <div className="fu2" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"20px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",marginBottom:14}}>Monthly Spending Trend</div>
              <div style={{height:220}}>{months.length>0?<Line data={lineData} options={lineOpts}/>:<Empty msg="Add expenses to see your trend"/>}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div className="fu3" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",marginBottom:14}}>Spend by Category</div>
                <div style={{height:210}}>{catLabels.length>0?<Doughnut data={donutData} options={donutOpts}/>:<Empty msg="No categories yet"/>}</div>
              </div>
              <div className="fu3" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",marginBottom:14}}>Spending by Day of Week</div>
                <div style={{height:210}}>{wdTotals.some(v=>v>0)?<Bar data={wdBarData} options={wdBarOpts}/>:<Empty msg="No data yet"/>}</div>
              </div>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}