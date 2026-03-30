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
  const nextDate=new Date(now.getFullYear(),now.getMonth()+1,1);
  const sameLastYear=`${nextDate.getFullYear()-1}-${String(nextDate.getMonth()+1).padStart(2,"0")}`;
  const seasonal=history[sameLastYear]||null;
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
const CAT_EMOJI={Food:"🍜",Groceries:"🛒",Transport:"🚗",Shopping:"🛍️",Entertainment:"🎬",Bills:"💡",Medicine:"💊",Travel:"✈️",Coffee:"☕",Books:"📚",Rent:"🏠",Other:"💳",Finance:"💳"};

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

function getInsights(catTotals,catLabels,avgPerMonth,trend,totalSpent) {
  const ins=[];
  const daily=avgPerMonth/30;
  const food=(catTotals["Food"]||0)+(catTotals["Groceries"]||0);
  const foodPct=totalSpent>0?food/totalSpent*100:0;
  const ent=catTotals["Entertainment"]||0;
  const entPct=totalSpent>0?ent/totalSpent*100:0;
  const top=catLabels[0];
  if(trend>20) ins.push({icon:"⚠️",title:"Spending jumped "+trend.toFixed(0)+"%!",body:"Your spending rose sharply vs last month. Check what changed in your top categories and set a limit.",color:"var(--red)",bg:"var(--rbg)"});
  else if(trend<-10) ins.push({icon:"🎉",title:"You saved more this month!",body:`Spending dropped ${Math.abs(trend).toFixed(0)}% vs last month. Great discipline — keep it up!`,color:"var(--green)",bg:"var(--gbg)"});
  if(foodPct>45) ins.push({icon:"🍜",title:"Food is your biggest drain",body:`₹${fmt(food)} (${foodPct.toFixed(0)}%) on food. Cooking at home 3x/week could save ₹${fmt(Math.round(food*0.25))} monthly.`,color:"var(--amber)",bg:"var(--abg)"});
  ins.push({icon:"☀️",title:`Daily spend: ₹${fmt(Math.round(daily))}`,body:daily<200?"Excellent! Under ₹200/day is great for a student budget.":daily<400?"Decent! Try to keep under ₹300/day to save more.":`High daily spend. Targeting ₹300/day saves ₹${fmt(Math.round((daily-300)*30))}/month.`,color:"var(--blue)",bg:"var(--bbg)"});
  if(entPct>15) ins.push({icon:"🎬",title:"Entertainment spending high",body:`₹${fmt(ent)} (${entPct.toFixed(0)}%) on entertainment. Look for student discounts, share OTT accounts with roommates.`,color:"var(--accent)",bg:"#f5f3ff"});
  const saving=Math.round(avgPerMonth*0.15);
  ins.push({icon:"💰",title:`Save ₹${fmt(saving)}/month potential`,body:`Cutting 15% from "${top||"top category"}" = ₹${fmt(saving*12)}/year. That's a trip, laptop, or emergency fund!`,color:"var(--green)",bg:"var(--gbg)"});
  return ins.slice(0,4);
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

  useEffect(()=>{if(!token){navigate("/",{replace:true});return;}load();},[]);

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
      <Sidebar onLogout={logout}/>
      <BottomNav/>

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
                      {/* Compact legend below chart */}
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
            </>
          )}

          {tab==="insights"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>Personalized for You 🎓</div>
              {insights.length===0?(
                <div style={{background:"var(--surface)",borderRadius:12,padding:"40px 20px",textAlign:"center",border:"1px solid var(--border)"}}>
                  <div style={{fontSize:28,marginBottom:8}}>📊</div>
                  <div style={{fontSize:13,color:"var(--ink3)"}}>Add more expenses to get personalized insights!</div>
                </div>
              ):insights.map((ins,i)=>(
                <div key={i} className="ins-card" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px",borderLeft:`4px solid ${ins.color}`,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <span style={{fontSize:22,flexShrink:0}}>{ins.icon}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",marginBottom:4}}>{ins.title}</div>
                      <div style={{fontSize:12,color:"var(--ink3)",lineHeight:1.5}}>{ins.body}</div>
                    </div>
                  </div>
                </div>
              ))}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}