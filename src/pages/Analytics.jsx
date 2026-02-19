import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Recommended student budget %
const BUDGET_GUIDE=[
  {cat:"Food & Groceries",rec:35,keys:["Food","Groceries"],tip:"Cook at home, use college mess/canteen"},
  {cat:"Transport",rec:15,keys:["Transport","Travel"],tip:"Student bus pass, cycle for short distances"},
  {cat:"Entertainment",rec:10,keys:["Entertainment","Coffee"],tip:"Student discounts on Netflix, Spotify, events"},
  {cat:"Books & Study",rec:10,keys:["Books"],tip:"Use college library, share textbooks"},
  {cat:"Bills & Utilities",rec:10,keys:["Bills"],tip:"Track recharges, OTT subscriptions"},
  {cat:"Other",rec:20,keys:["Other","Shopping","Medicine","Finance"],tip:"Keep a buffer for unexpected expenses"},
];

function getInsights(catTotals,catLabels,avgPerMonth,trend,totalSpent,months) {
  const ins=[];
  const daily=avgPerMonth/30;
  const food=(catTotals["Food"]||0)+(catTotals["Groceries"]||0);
  const foodPct=totalSpent>0?food/totalSpent*100:0;
  const ent=catTotals["Entertainment"]||0;
  const entPct=totalSpent>0?ent/totalSpent*100:0;
  const top=catLabels[0];

  if(trend>20) ins.push({icon:"⚠️",title:"Spending jumped "+trend.toFixed(0)+"%!",body:"Your spending rose sharply vs last month. Check what changed in your top categories and set a limit.",color:"var(--red)",bg:"var(--red-bg)"});
  else if(trend<-10) ins.push({icon:"🎉",title:"You saved more this month!",body:`Spending dropped ${Math.abs(trend).toFixed(0)}% vs last month. Great discipline — keep it up!`,color:"var(--green)",bg:"var(--green-bg)"});

  if(foodPct>45) ins.push({icon:"🍜",title:"Food is your biggest drain",body:`₹${fmt(food)} (${foodPct.toFixed(0)}%) on food. Cooking at home 3x/week could save ₹${fmt(Math.round(food*0.25))} monthly.`,color:"var(--amber)",bg:"var(--amber-bg)"});

  ins.push({icon:"☀️",title:`Daily spend: ₹${fmt(Math.round(daily))}`,body:daily<200?"Excellent! Under ₹200/day is great for a student budget. 🌟":daily<400?"Decent! Try to keep under ₹300/day to save more.":"High daily spend. Targeting ₹300/day saves ₹"+(fmt(Math.round((daily-300)*30)))+"/month.",color:"var(--blue)",bg:"var(--blue-bg)"});

  if(entPct>15) ins.push({icon:"🎬",title:"Entertainment spending high",body:`₹${fmt(ent)} (${entPct.toFixed(0)}%) on entertainment. Look for student discount codes, share OTT accounts with roommates.`,color:"var(--accent)",bg:"#f5f3ff"});

  const saving=Math.round(avgPerMonth*0.15);
  ins.push({icon:"💰",title:`Save ₹${fmt(saving)}/month potential`,body:`Cutting just 15% from "${top||"top category"}" = ₹${fmt(saving*12)}/year. That's a trip, laptop upgrade, or solid emergency fund!`,color:"var(--green)",bg:"var(--green-bg)"});

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

  useEffect(()=>{ if(!token){navigate("/",{replace:true});return;} load(); },[]);

  async function load() {
    try {
      const r=await fetch("https://smartspend-backend-aupt.onrender.com/api/expenses/",{headers:{Authorization:`Bearer ${token}`}});
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

  // Data prep
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
  const insights=getInsights(catTotals,catLabels,avgPerMonth,trend,totalSpent,months);
  const dailyAvg=avgPerMonth/30;
  const prediction=avgPerMonth*(1+(trend/200));

  // Weekday
  const wdTotals=Array(7).fill(0);
  expenses.forEach(e=>{if(!e.date)return;wdTotals[new Date(e.date).getDay()]+=e.amount;});
  const wdLabels=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const peakDay=wdLabels[wdTotals.indexOf(Math.max(...wdTotals))];

  // Chart defaults
  const scaleStyle={grid:{color:"rgba(0,0,0,.04)"},ticks:{font:{size:11,family:"Inter"}},border:{display:false}};

  const lineData={
    labels:months.map(fmtM),
    datasets:[{label:"Spend",data:monthVals,borderColor:"#7c5cbf",backgroundColor:"rgba(124,92,191,.07)",fill:true,tension:.4,borderWidth:2.5,pointRadius:5,pointBackgroundColor:"#7c5cbf",pointBorderColor:"#fff",pointBorderWidth:2,pointHoverRadius:7}]
  };
  const lineOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>`  ₹${fmt(ctx.parsed.y)}`}}},scales:{y:{...scaleStyle,beginAtZero:true,ticks:{...scaleStyle.ticks,callback:v=>`₹${fmtK(v)}`}},x:{...scaleStyle,grid:{display:false}}}};

  const donutData={labels:catLabels,datasets:[{data:catData,backgroundColor:catLabels.map((_,i)=>COLORS[i%COLORS.length]),borderWidth:0,hoverOffset:10}]};
  const donutOpts={responsive:true,maintainAspectRatio:false,cutout:"65%",plugins:{legend:{position:"right",labels:{padding:12,font:{size:11,family:"Inter"},usePointStyle:true,pointStyle:"circle",boxWidth:8}},tooltip:{...tooltipOpts,callbacks:{label:ctx=>{const t=catData.reduce((a,b)=>a+b,0);const pct=(ctx.parsed/t*100).toFixed(1);return `  ${ctx.label}: ₹${fmt(ctx.parsed)} (${pct}%)`;}}}}};

  const wdBarData={labels:wdLabels,datasets:[{data:wdTotals,backgroundColor:wdTotals.map((v,i)=>i===wdTotals.indexOf(Math.max(...wdTotals))?"#7c5cbf":"rgba(124,92,191,.28)"),borderRadius:6,borderWidth:0}]};
  const wdBarOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>`  ₹${fmt(ctx.parsed.y)}`}}},scales:{y:{...scaleStyle,beginAtZero:true,ticks:{...scaleStyle.ticks,callback:v=>`₹${fmtK(v)}`}},x:{...scaleStyle,grid:{display:false}}}};

  const cmpData={labels:[prevMonth,curMonth].filter(Boolean).map(fmtM),datasets:[{data:[prevVal,curVal],backgroundColor:["rgba(124,92,191,.3)","#7c5cbf"],borderRadius:8,borderWidth:0}]};
  const cmpOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>`  ₹${fmt(ctx.parsed.y)}`}}},scales:{y:{...scaleStyle,beginAtZero:true,ticks:{...scaleStyle.ticks,callback:v=>`₹${fmtK(v)}`}},x:{...scaleStyle,grid:{display:false},ticks:{...scaleStyle.ticks,font:{size:12,family:"Inter",weight:"600"}}}}};

  if(loading) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:28,height:28,border:"2.5px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px"}}/>
        <div style={{fontSize:12,color:"var(--ink3)"}}>Crunching numbers…</div>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Header */}
        <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)"}}>Analytics 📊</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>Understand your money, make smarter decisions</div>
          </div>
          {/* Health score pill */}
          <div style={{display:"flex",alignItems:"center",gap:10,background:"#f5f3ff",border:"1px solid #e0d9f7",borderRadius:12,padding:"10px 16px"}}>
            <div style={{fontSize:26,fontWeight:700,color:scoreColor,fontVariantNumeric:"tabular-nums"}}>{score}</div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:"1px"}}>Budget Health</div>
              <div style={{fontSize:12,fontWeight:600,color:scoreColor}}>{scoreLabel}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"0 28px",display:"flex"}}>
          {[
            {id:"overview",label:"📊 Overview"},
            {id:"insights",label:"💡 Student Insights"},
            {id:"breakdown",label:"🗂️ Full Breakdown"},
          ].map(t=>(
            <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}
              style={{padding:"12px 16px",borderBottom:tab===t.id?"2px solid var(--accent)":"2px solid transparent",fontSize:13,fontWeight:tab===t.id?600:500,color:tab===t.id?"var(--accent)":"var(--ink3)"}}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"24px 28px",background:"var(--bg)"}}>

          {/* ═══════════════ OVERVIEW ═══════════════ */}
          {tab==="overview" && <>

            {/* KPI row */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
              {[
                {label:"Total Spent",val:totalSpent,icon:"💸",bg:"#faf5ff",sub:"all time"},
                {label:"This Month",val:curVal,icon:"📅",bg:"#eff6ff",sub:"vs last month",trend},
                {label:"Daily Average",val:Math.round(dailyAvg),icon:"☀️",bg:"#ecfdf5",sub:"per day"},
                {label:"Next Month Est.",val:Math.round(prediction),icon:"🔮",bg:"#fffbeb",sub:"projection"},
              ].map((k,i)=>(
                <div key={i} className={`kcard fu${i}`} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".6px"}}>{k.label}</div>
                    <div style={{width:34,height:34,borderRadius:9,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{k.icon}</div>
                  </div>
                  <div style={{fontSize:22,fontWeight:700,color:"var(--ink)",marginBottom:6,fontVariantNumeric:"tabular-nums"}}>₹{fmtK(k.val)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {k.trend!==undefined&&(
                      <span style={{fontSize:11,fontWeight:700,color:k.trend>=0?"var(--red)":"var(--green)",background:k.trend>=0?"var(--red-bg)":"var(--green-bg)",padding:"2px 7px",borderRadius:99}}>
                        {k.trend>=0?"↑":"↓"}{Math.abs(k.trend).toFixed(1)}%
                      </span>
                    )}
                    <span style={{fontSize:11,color:"var(--ink4)"}}>{k.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trend line - full width */}
            <div className="fu2" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"20px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--ink)"}}>Monthly Spending Trend</div>
                  <div style={{fontSize:12,color:"var(--ink3)",marginTop:2}}>How your spending has changed over time</div>
                </div>
                {months.length>1&&<span style={{fontSize:12,fontWeight:700,color:trend>0?"var(--red)":"var(--green)",background:trend>0?"var(--red-bg)":"var(--green-bg)",padding:"4px 12px",borderRadius:99}}>{trend>0?"↑":"↓"} {Math.abs(trend).toFixed(1)}% this month</span>}
              </div>
              <div style={{height:220}}>{months.length>0?<Line data={lineData} options={lineOpts}/>:<Empty msg="Add expenses to see your trend"/>}</div>
            </div>

            {/* 2-col charts */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div className="fu3" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",marginBottom:4}}>Spend by Category</div>
                <div style={{fontSize:12,color:"var(--ink3)",marginBottom:14}}>Where does your money go?</div>
                <div style={{height:210}}>{catLabels.length>0?<Doughnut data={donutData} options={donutOpts}/>:<Empty msg="No categories yet"/>}</div>
              </div>

              <div className="fu3" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",marginBottom:4}}>Spending by Day of Week</div>
                <div style={{fontSize:12,color:"var(--ink3)",marginBottom:14}}>{wdTotals.some(v=>v>0)?`You spend most on ${peakDay}s`:"Track expenses to see your pattern"}</div>
                <div style={{height:210}}>{wdTotals.some(v=>v>0)?<Bar data={wdBarData} options={wdBarOpts}/>:<Empty msg="No data yet"/>}</div>
              </div>
            </div>

            {/* Month comparison */}
            {prevMonth&&curMonth&&(
              <div className="fu4" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",marginBottom:4}}>This Month vs Last Month</div>
                <div style={{fontSize:12,color:"var(--ink3)",marginBottom:14}}>{curVal>prevVal?`You spent ₹${fmt(curVal-prevVal)} more than last month`:`You saved ₹${fmt(prevVal-curVal)} compared to last month 🎉`}</div>
                <div style={{height:180}}><Bar data={cmpData} options={cmpOpts}/></div>
              </div>
            )}
          </>}

          {/* ═══════════════ INSIGHTS ═══════════════ */}
          {tab==="insights" && <>

            {/* Score breakdown */}
            <div className="fu0" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"24px",marginBottom:18,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{textAlign:"center",minWidth:100}}>
                  <div style={{fontSize:52,fontWeight:700,color:scoreColor,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{score}</div>
                  <div style={{fontSize:12,fontWeight:700,color:scoreColor,marginTop:4}}>{scoreLabel}</div>
                  <div style={{fontSize:11,color:"var(--ink3)",marginTop:2}}>Budget Health Score</div>
                </div>
                <div style={{flex:1,minWidth:280}}>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:10}}>Score breakdown</div>
                  {[
                    {label:"Monthly spend level",ok:avgPerMonth<20000,msg:avgPerMonth<20000?"Under ₹20k — great for a student!":"Above ₹20k — consider reducing"},
                    {label:"Spending trend",ok:trend<=5,msg:trend<=5?"Stable or falling ✓":"Rising fast — needs attention"},
                    {label:"Category diversity",ok:catLabels.length>=3,msg:catLabels.length>=3?"Tracking multiple categories":"Track more categories for better insights"},
                    {label:"Top category share",ok:catLabels.length===0||(catTotals[catLabels[0]]||0)/Math.max(totalSpent,1)<0.6,msg:catLabels.length===0||(catTotals[catLabels[0]]||0)/Math.max(totalSpent,1)<0.6?"Spend spread across categories":`${catLabels[0]||"One category"} taking >60% of budget`},
                  ].map((row,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                      <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:row.ok?"var(--green-bg)":"var(--red-bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:row.ok?"var(--green)":"var(--red)"}}>
                        {row.ok?"✓":"✗"}
                      </div>
                      <div style={{fontSize:12}}><span style={{fontWeight:600,color:"var(--ink2)"}}>{row.label}: </span><span style={{color:row.ok?"var(--green)":"var(--red)"}}>{row.msg}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insight cards 2×2 */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:18}}>
              {insights.map((ins,i)=>(
                <div key={i} className={`ins-card fu${i}`} style={{background:ins.bg,border:`1.5px solid ${ins.color}30`,borderRadius:12,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                  <div style={{fontSize:26,marginBottom:10}}>{ins.icon}</div>
                  <div style={{fontSize:14,fontWeight:700,color:ins.color,marginBottom:6}}>{ins.title}</div>
                  <div style={{fontSize:12,color:"var(--ink2)",lineHeight:1.7}}>{ins.body}</div>
                </div>
              ))}
            </div>

            {/* Budget guide */}
            <div className="fu3" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--ink)",marginBottom:4}}>📚 Recommended Student Budget</div>
              <div style={{fontSize:12,color:"var(--ink3)",marginBottom:18}}>How your spending compares to what financial advisors recommend for students</div>
              {BUDGET_GUIDE.map((row,i)=>{
                const actual=totalSpent>0?row.keys.reduce((s,k)=>s+(catTotals[k]||0),0)/totalSpent*100:0;
                const over=actual>row.rec+5;
                const under=actual<row.rec-5&&actual>0;
                return (
                  <div key={i} style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{fontSize:13,fontWeight:500,color:"var(--ink2)"}}>{row.cat}</div>
                      <div style={{display:"flex",gap:14,alignItems:"center"}}>
                        <span style={{fontSize:11,color:"var(--ink4)"}}>Rec: {row.rec}%</span>
                        <span style={{fontSize:12,fontWeight:700,color:over?"var(--red)":under?"var(--blue)":"var(--green)",background:over?"var(--red-bg)":under?"var(--blue-bg)":"var(--green-bg)",padding:"1px 8px",borderRadius:99}}>
                          You: {actual.toFixed(0)}%{over?" ↑":under?" ↓":""}
                        </span>
                      </div>
                    </div>
                    <div style={{position:"relative",height:7,background:"#f0edf8",borderRadius:99,overflow:"hidden"}}>
                      {/* recommended marker */}
                      <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${row.rec}%`,background:"rgba(124,92,191,.15)",borderRadius:99}}/>
                      {/* actual */}
                      <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${Math.min(actual,100)}%`,background:over?"var(--red)":"var(--accent)",borderRadius:99,transition:"width .8s ease"}}/>
                    </div>
                    <div style={{fontSize:11,color:"var(--ink4)",marginTop:3}}>💡 {row.tip}</div>
                  </div>
                );
              })}
            </div>
          </>}

          {/* ═══════════════ BREAKDOWN ═══════════════ */}
          {tab==="breakdown" && <>

            {/* Category table */}
            {catLabels.length>0?(
              <div className="fu0" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)"}}>
                  <div style={{fontSize:14,fontWeight:700,color:"var(--ink)"}}>Spending by Category — Ranked</div>
                  <div style={{fontSize:12,color:"var(--ink3)",marginTop:2}}>Total all-time spend per category</div>
                </div>
                <div style={{padding:"8px 20px",background:"#faf9fd",borderBottom:"1px solid var(--border)",display:"grid",gridTemplateColumns:"36px 1fr 100px 70px 1fr 90px"}}>
                  {["#","Category","Amount","Share","Bar","Avg/day"].map(h=>(
                    <div key={h} style={{fontSize:10,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".6px",padding:"4px 0"}}>{h}</div>
                  ))}
                </div>
                {catLabels.map((cat,i)=>{
                  const pct=totalSpent>0?catTotals[cat]/totalSpent*100:0;
                  const avg=catTotals[cat]/Math.max(1,months.length*30);
                  return (
                    <div key={cat} className="catrow" style={{display:"grid",gridTemplateColumns:"36px 1fr 100px 70px 1fr 90px",padding:"13px 20px",borderBottom:i<catLabels.length-1?"1px solid var(--border)":"none",alignItems:"center"}}>
                      <div style={{width:26,height:26,borderRadius:7,background:COLORS[i%COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff"}}>{i+1}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:17}}>{CAT_EMOJI[cat]||"💳"}</span>
                        <span style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>{cat}</span>
                      </div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",fontVariantNumeric:"tabular-nums"}}>₹{fmt(catTotals[cat])}</div>
                      <div style={{fontSize:12,color:"var(--ink3)"}}>{pct.toFixed(1)}%</div>
                      <div style={{height:6,background:"#f0edf8",borderRadius:99,overflow:"hidden",marginRight:12}}>
                        <div style={{height:"100%",width:`${pct}%`,borderRadius:99,background:COLORS[i%COLORS.length]}}/>
                      </div>
                      <div style={{fontSize:11,color:"var(--ink4)"}}>₹{fmt(Math.round(avg))}/day</div>
                    </div>
                  );
                })}
              </div>
            ):(
              <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"48px",textAlign:"center",color:"var(--ink4)"}}>
                <div style={{fontSize:40,marginBottom:12}}>📊</div>
                <div style={{fontSize:14,fontWeight:600,color:"var(--ink2)"}}>No expenses yet</div>
                <div style={{fontSize:12,marginTop:4}}>Add some expenses to see the breakdown</div>
              </div>
            )}

            {/* Monthly history */}
            {months.length>0&&(
              <div className="fu1" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)"}}>
                  <div style={{fontSize:14,fontWeight:700,color:"var(--ink)"}}>Month-by-Month History</div>
                  <div style={{fontSize:12,color:"var(--ink3)",marginTop:2}}>All your spending months with trend</div>
                </div>
                {[...months].reverse().map((m,i)=>{
                  const val=history[m];
                  const idx=months.indexOf(m);
                  const prev2=idx>0?history[months[idx-1]]:null;
                  const mTrend=prev2?((val-prev2)/prev2*100):null;
                  const maxVal=Math.max(...monthVals);
                  return (
                    <div key={m} style={{padding:"14px 20px",borderBottom:i<months.length-1?"1px solid var(--border)":"none",display:"flex",alignItems:"center",gap:14}}>
                      <div style={{width:72,fontSize:12,fontWeight:600,color:"var(--ink2)",flexShrink:0}}>{fmtM(m)}</div>
                      <div style={{flex:1,height:7,background:"#f0edf8",borderRadius:99,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${(val/maxVal)*100}%`,background:"var(--accent)",borderRadius:99,transition:"width .8s"}}/>
                      </div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",width:90,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>₹{fmt(val)}</div>
                      {mTrend!==null&&(
                        <div style={{fontSize:11,fontWeight:700,color:mTrend>0?"var(--red)":"var(--green)",background:mTrend>0?"var(--red-bg)":"var(--green-bg)",padding:"2px 8px",borderRadius:99,width:56,textAlign:"center"}}>
                          {mTrend>0?"↑":"↓"}{Math.abs(mTrend).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>}

        </div>
      </div>
    </div>
  );
}