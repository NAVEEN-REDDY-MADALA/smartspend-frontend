import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  injectMobileCSS, fmt, fmtK, Icon, ICONS,
  MobilePage, MobileHeader, LoadingScreen,
} from "./MobileLayout";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

// ── Prediction engine (unchanged from desktop) ────────────────────────────────
function predictNextMonth(history) {
  const months = Object.keys(history).sort();
  const n = months.length;
  if (n === 0) return { value:0, confidence:"Low", method:"No data", factors:[], trendAmt:0 };
  const vals = months.map(m => history[m]);
  const wts = [0.50,0.30,0.15,0.05];
  let wSum=0, wTot=0;
  for (let i=0; i<Math.min(4,n); i++) { wSum+=vals[n-1-i]*wts[i]; wTot+=wts[i]; }
  const wma = wSum/wTot;
  let slope=0;
  if (n>=2) {
    const slice=vals.slice(-Math.min(4,n));
    const xm=(slice.length-1)/2, ym=slice.reduce((a,b)=>a+b,0)/slice.length;
    let num=0,den=0;
    slice.forEach((y,x)=>{num+=(x-xm)*(y-ym);den+=(x-xm)**2;});
    slope=den!==0?num/den:0;
  }
  const trendProjection=wma+slope;
  const now=new Date();
  const curKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  let paceProjection=null, daysElapsed=0;
  if (months[n-1]===curKey&&history[curKey]) {
    daysElapsed=now.getDate();
    const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
    if (daysElapsed>=4) paceProjection=(history[curKey]/daysElapsed)*daysInMonth;
  }
  const nextDate=new Date(now.getFullYear(),now.getMonth()+1,1);
  const sameLastYear=`${nextDate.getFullYear()-1}-${String(nextDate.getMonth()+1).padStart(2,"0")}`;
  const seasonal=history[sameLastYear]||null;
  let prediction=0;
  const factors=[];
  if (paceProjection&&months[n-1]===curKey) {
    prediction=paceProjection*0.50+trendProjection*0.35+(seasonal?seasonal*0.15:trendProjection*0.15);
    factors.push({label:"Current month pace",value:Math.round(paceProjection),weight:"50%"});
    factors.push({label:"Trend projection",value:Math.round(trendProjection),weight:"35%"});
    factors.push({label:seasonal?"Same month last year":"Trend fallback",value:Math.round(seasonal||trendProjection),weight:"15%"});
  } else if (n>=3) {
    prediction=trendProjection*0.60+wma*0.30+(seasonal?seasonal*0.10:trendProjection*0.10);
    factors.push({label:"Trend projection",value:Math.round(trendProjection),weight:"60%"});
    factors.push({label:"Weighted avg (last 4mo)",value:Math.round(wma),weight:"30%"});
    if (seasonal) factors.push({label:"Seasonal pattern",value:Math.round(seasonal),weight:"10%"});
  } else if (n===2) {
    prediction=trendProjection*0.70+wma*0.30;
    factors.push({label:"Trend projection",value:Math.round(trendProjection),weight:"70%"});
    factors.push({label:"Weighted average",value:Math.round(wma),weight:"30%"});
  } else {
    prediction=wma;
    factors.push({label:"Single month baseline",value:Math.round(wma),weight:"100%"});
  }
  const maxVal=Math.max(...vals), minVal=Math.min(...vals);
  prediction=Math.max(minVal*0.2,Math.min(prediction,maxVal*3));
  prediction=Math.max(0,Math.round(prediction));
  const confidence=n>=4?"High":n>=2?"Medium":"Low";
  const method=paceProjection?"Pace + Trend + Seasonal":n>=3?"Trend + Weighted Avg":"Weighted Average";
  return {value:prediction,confidence,method,factors,trendAmt:Math.round(slope)};
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

function getInsights(catTotals,catLabels,avgPerMonth,trend,totalSpent) {
  const ins=[];
  const daily=avgPerMonth/30;
  const food=(catTotals["Food"]||0)+(catTotals["Groceries"]||0);
  const foodPct=totalSpent>0?food/totalSpent*100:0;
  if(trend>20) ins.push({icon:"⚠️",title:`Spending jumped ${trend.toFixed(0)}%!`,body:"Your spending rose sharply vs last month. Check what changed.",color:"var(--red)",bg:"var(--red-bg)"});
  else if(trend<-10) ins.push({icon:"🎉",title:"You saved more this month!",body:`Spending dropped ${Math.abs(trend).toFixed(0)}% vs last month. Keep it up!`,color:"var(--green)",bg:"var(--green-bg)"});
  if(foodPct>45) ins.push({icon:"🍜",title:"Food is your biggest drain",body:`₹${fmt(food)} (${foodPct.toFixed(0)}%) on food. Cooking at home could save ₹${fmt(Math.round(food*0.25))}/month.`,color:"var(--amber)",bg:"var(--amber-bg)"});
  ins.push({icon:"☀️",title:`Daily spend: ₹${fmt(Math.round(daily))}`,body:daily<200?"Under ₹200/day is great!":daily<400?"Try to keep under ₹300/day.":`Targeting ₹300/day saves ₹${fmt(Math.round((daily-300)*30))}/month.`,color:"var(--blue)",bg:"var(--blue-bg)"});
  const saving=Math.round(avgPerMonth*0.15);
  ins.push({icon:"💰",title:`Save ₹${fmt(saving)}/month potential`,body:`Cutting 15% from "${catLabels[0]||"top category"}" = ₹${fmt(saving*12)}/year!`,color:"var(--green)",bg:"var(--green-bg)"});
  return ins.slice(0,4);
}

const MON=["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtM=m=>{if(!m)return"";const[y,mo]=m.split("-");return`${MON[+mo]} '${y.slice(2)}`;};
const COLORS=["#5b3ff8","#a78bfa","#34d399","#60a5fa","#fb923c","#f472b6","#facc15","#38bdf8"];
const CAT_EMOJI={Food:"🍜",Groceries:"🛒",Transport:"🚗",Shopping:"🛍️",Entertainment:"🎬",Bills:"💡",Medicine:"💊",Travel:"✈️",Coffee:"☕",Books:"📚",Rent:"🏠",Other:"💳"};

const tooltipOpts={backgroundColor:"rgba(15,14,23,.92)",padding:10,cornerRadius:8,titleFont:{family:"DM Sans"},bodyFont:{family:"DM Sans",size:12}};
const scaleStyle={grid:{color:"rgba(0,0,0,.04)"},ticks:{font:{size:11,family:"DM Sans"}},border:{display:false}};

function Empty({msg}) {
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"var(--ink4)",gap:8}}>
      <div style={{fontSize:28,opacity:.3}}>📊</div>
      <div style={{fontSize:12}}>{msg}</div>
    </div>
  );
}

const BUDGET_GUIDE=[
  {cat:"Food & Groceries",rec:35,keys:["Food","Groceries"],tip:"Cook at home, use college mess/canteen"},
  {cat:"Transport",rec:15,keys:["Transport","Travel"],tip:"Student bus pass, cycle for short distances"},
  {cat:"Entertainment",rec:10,keys:["Entertainment","Coffee"],tip:"Student discounts on Netflix, Spotify"},
  {cat:"Books & Study",rec:10,keys:["Books"],tip:"Use college library, share textbooks"},
  {cat:"Bills & Utilities",rec:10,keys:["Bills"],tip:"Track recharges, OTT subscriptions"},
  {cat:"Other",rec:20,keys:["Other","Shopping","Medicine"],tip:"Keep a buffer for unexpected expenses"},
];

export default function Analytics() {
  injectMobileCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [expenses,      setExpenses]      = useState([]);
  const [history,       setHistory]       = useState({});
  const [loading,       setLoading]       = useState(true);
  const [tab,           setTab]           = useState("overview");
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(()=>{if(!token){navigate("/",{replace:true});return;}load();},[]);

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
  const pred=predictNextMonth(history);
  const confColor=pred.confidence==="High"?"var(--green)":pred.confidence==="Medium"?"var(--amber)":"var(--red)";
  const confBg=pred.confidence==="High"?"var(--green-bg)":pred.confidence==="Medium"?"var(--amber-bg)":"var(--red-bg)";

  const wdTotals=Array(7).fill(0);
  expenses.forEach(e=>{if(!e.date)return;wdTotals[new Date(e.date).getDay()]+=e.amount;});
  const wdLabels=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const peakDay=wdLabels[wdTotals.indexOf(Math.max(...wdTotals))];

  const lineData={labels:months.map(fmtM),datasets:[{label:"Spend",data:monthVals,borderColor:"#5b3ff8",backgroundColor:"rgba(91,63,248,.08)",fill:true,tension:.4,borderWidth:2.5,pointRadius:5,pointBackgroundColor:"#5b3ff8",pointBorderColor:"#fff",pointBorderWidth:2,pointHoverRadius:7}]};
  const lineOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>`  ₹${fmt(ctx.parsed.y)}`}}},scales:{y:{...scaleStyle,beginAtZero:true,ticks:{...scaleStyle.ticks,callback:v=>`₹${fmtK(v)}`}},x:{...scaleStyle,grid:{display:false}}}};

  const donutData={labels:catLabels,datasets:[{data:catData,backgroundColor:catLabels.map((_,i)=>COLORS[i%COLORS.length]),borderWidth:0,hoverOffset:8}]};
  const donutOpts={responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:{padding:10,font:{size:11,family:"DM Sans"},usePointStyle:true,pointStyle:"circle",boxWidth:7}},tooltip:{...tooltipOpts,callbacks:{label:ctx=>{const t=catData.reduce((a,b)=>a+b,0);const pct=(ctx.parsed/t*100).toFixed(1);return`  ${ctx.label}: ₹${fmt(ctx.parsed)} (${pct}%)`;}}}}};

  const wdBarData={labels:wdLabels,datasets:[{data:wdTotals,backgroundColor:wdTotals.map((v,i)=>i===wdTotals.indexOf(Math.max(...wdTotals))?"#5b3ff8":"rgba(91,63,248,.25)"),borderRadius:6,borderWidth:0}]};
  const wdBarOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>`  ₹${fmt(ctx.parsed.y)}`}}},scales:{y:{...scaleStyle,beginAtZero:true,ticks:{...scaleStyle.ticks,callback:v=>`₹${fmtK(v)}`}},x:{...scaleStyle,grid:{display:false}}}};

  const cmpData={labels:[prevMonth,curMonth].filter(Boolean).map(fmtM),datasets:[{data:[prevVal,curVal],backgroundColor:["rgba(91,63,248,.3)","#5b3ff8"],borderRadius:8,borderWidth:0}]};
  const cmpOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{...tooltipOpts,callbacks:{label:ctx=>`  ₹${fmt(ctx.parsed.y)}`}}},scales:{y:{...scaleStyle,beginAtZero:true,ticks:{...scaleStyle.ticks,callback:v=>`₹${fmtK(v)}`}},x:{...scaleStyle,grid:{display:false}}}};

  if(loading) return <LoadingScreen text="Crunching numbers…" />;

  const TABS=[{id:"overview",label:"Overview"},{id:"insights",label:"Insights"},{id:"breakdown",label:"Breakdown"}];

  return (
    <MobilePage>
      {/* Header with health score */}
      <div className="mobile-header" style={{flexDirection:"column",height:"auto",padding:"12px 18px",alignItems:"stretch",gap:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>Analytics 📊</div>
            <div style={{fontSize:12,color:"var(--ink4)",marginTop:1}}>Understand your money</div>
          </div>
          {/* Health score pill */}
          <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--brand-soft)",borderRadius:12,padding:"8px 14px"}}>
            <div style={{fontSize:22,fontWeight:800,color:scoreColor,fontFamily:"'Sora',sans-serif"}}>{score}</div>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:"1px"}}>Health</div>
              <div style={{fontSize:11,fontWeight:700,color:scoreColor}}>{scoreLabel}</div>
            </div>
          </div>
        </div>
        {/* Tab bar */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{padding:"7px 16px",borderRadius:99,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,whiteSpace:"nowrap",transition:"all .15s",
                background:tab===t.id?"var(--brand)":"transparent",
                color:tab===t.id?"#fff":"var(--ink4)"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"12px 16px 0"}}>

        {/* ── OVERVIEW TAB ── */}
        {tab==="overview" && <>
          {/* KPI row - 2x2 grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {[
              {label:"Total Spent",    val:`₹${fmtK(totalSpent)}`,      icon:"💸", bg:"#f5f3ff"},
              {label:"This Month",     val:`₹${fmtK(curVal)}`,           icon:"📅", bg:"var(--blue-bg)", extra:"trend"},
              {label:"Daily Average",  val:`₹${fmtK(Math.round(avgPerMonth/30))}`, icon:"☀️", bg:"var(--green-bg)"},
              {label:"Next Month Est.",val:`₹${fmtK(pred.value)}`,      icon:"🔮", bg:"var(--amber-bg)", extra:"pred"},
            ].map((k,i)=>(
              <div key={i} className={`fu${i} card`} style={{padding:"14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".5px",lineHeight:1.3,flex:1,paddingRight:4}}>{k.label}</div>
                  <div style={{width:30,height:30,borderRadius:9,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{k.icon}</div>
                </div>
                <div style={{fontSize:20,fontWeight:800,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:4}}>{k.val}</div>
                {k.extra==="trend"&&(
                  <span style={{fontSize:10,fontWeight:700,color:trend>=0?"var(--red)":"var(--green)",background:trend>=0?"var(--red-bg)":"var(--green-bg)",padding:"2px 7px",borderRadius:99}}>
                    {trend>=0?"↑":"↓"}{Math.abs(trend).toFixed(1)}%
                  </span>
                )}
                {k.extra==="pred"&&(
                  <span style={{fontSize:10,fontWeight:700,color:confColor,background:confBg,padding:"2px 7px",borderRadius:99}}>{pred.confidence} conf.</span>
                )}
              </div>
            ))}
          </div>

          {/* Prediction breakdown toggle */}
          <button onClick={()=>setShowBreakdown(!showBreakdown)}
            style={{width:"100%",marginBottom:12,padding:"10px",borderRadius:12,border:"1.5px solid var(--brand)",background:"var(--brand-soft)",color:"var(--brand)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            {showBreakdown?"Hide":"How is the prediction calculated? 🔮"}
          </button>

          {showBreakdown&&pred.factors.length>0&&(
            <div className="fade card" style={{padding:"14px",marginBottom:12,borderTop:"3px solid var(--brand)"}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--brand)",marginBottom:3,fontFamily:"'Sora',sans-serif"}}>{pred.method}</div>
              <div style={{fontSize:11,color:"var(--ink4)",marginBottom:10}}>Multiple signals combined by reliability:</div>
              {pred.factors.map((f,i)=>(
                <div key={i} style={{padding:"10px",borderRadius:10,background:"var(--surface2)",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--ink2)"}}>{f.label}</div>
                    <div style={{fontSize:15,fontWeight:800,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>₹{fmt(f.value)}</div>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:"var(--brand)",background:"var(--brand-soft)",padding:"3px 10px",borderRadius:99}}>{f.weight}</span>
                </div>
              ))}
              <div style={{fontSize:11,color:"var(--ink4)",marginTop:4}}>
                Method: {pred.method} · Data: {months.length} month{months.length!==1?"s":""}
              </div>
            </div>
          )}

          {/* Trend chart */}
          <div className="fu2 card" style={{padding:"16px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>Monthly Trend</div>
              {months.length>1&&<span style={{fontSize:11,fontWeight:700,color:trend>0?"var(--red)":"var(--green)",background:trend>0?"var(--red-bg)":"var(--green-bg)",padding:"3px 9px",borderRadius:99}}>{trend>0?"↑":"↓"}{Math.abs(trend).toFixed(1)}%</span>}
            </div>
            <div style={{height:180}}>{months.length>0?<Line data={lineData} options={lineOpts}/>:<Empty msg="Add expenses to see trend"/>}</div>
          </div>

          {/* Donut */}
          <div className="fu3 card" style={{padding:"16px",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:4}}>Spend by Category</div>
            <div style={{fontSize:12,color:"var(--ink4)",marginBottom:12}}>Where does your money go?</div>
            <div style={{height:220}}>{catLabels.length>0?<Doughnut data={donutData} options={donutOpts}/>:<Empty msg="No categories yet"/>}</div>
          </div>

          {/* Day of week */}
          <div className="fu4 card" style={{padding:"16px",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:4}}>By Day of Week</div>
            <div style={{fontSize:12,color:"var(--ink4)",marginBottom:12}}>{wdTotals.some(v=>v>0)?`You spend most on ${peakDay}s`:"Track expenses to see"}</div>
            <div style={{height:160}}>{wdTotals.some(v=>v>0)?<Bar data={wdBarData} options={wdBarOpts}/>:<Empty msg="No data yet"/>}</div>
          </div>

          {/* Month comparison */}
          {prevMonth&&curMonth&&(
            <div className="card" style={{padding:"16px",marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:4}}>This vs Last Month</div>
              <div style={{fontSize:12,color:"var(--ink4)",marginBottom:12}}>{curVal>prevVal?`₹${fmt(curVal-prevVal)} more than last month`:`₹${fmt(prevVal-curVal)} saved vs last month!`}</div>
              <div style={{height:140}}><Bar data={cmpData} options={cmpOpts}/></div>
            </div>
          )}
        </>}

        {/* ── INSIGHTS TAB ── */}
        {tab==="insights" && <>
          {/* Score card */}
          <div className="fu0 card" style={{padding:"16px",marginBottom:12}}>
            <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:12}}>
              <div style={{textAlign:"center",minWidth:70}}>
                <div style={{fontSize:42,fontWeight:800,color:scoreColor,lineHeight:1,fontFamily:"'Sora',sans-serif"}}>{score}</div>
                <div style={{fontSize:11,fontWeight:700,color:scoreColor,marginTop:3}}>{scoreLabel}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",marginBottom:8}}>Budget Health Score</div>
                {[
                  {label:"Monthly level",ok:avgPerMonth<20000,msg:avgPerMonth<20000?"Under ₹20k ✓":"Above ₹20k"},
                  {label:"Spending trend",ok:trend<=5,msg:trend<=5?"Stable or falling":"Rising fast"},
                  {label:"Category diversity",ok:catLabels.length>=3,msg:catLabels.length>=3?"Tracking multiple cats":"Track more categories"},
                ].map((row,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,background:row.ok?"var(--green-bg)":"var(--red-bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:row.ok?"var(--green)":"var(--red)"}}>
                      {row.ok?"✓":"✗"}
                    </div>
                    <div style={{fontSize:12}}><span style={{fontWeight:600,color:"var(--ink2)"}}>{row.label}: </span><span style={{color:row.ok?"var(--green)":"var(--red)"}}>{row.msg}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insight cards */}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            {insights.map((ins,i)=>(
              <div key={i} className={`fu${i} card`} style={{padding:"14px",background:ins.bg,borderLeft:`3px solid ${ins.color}`}}>
                <div style={{fontSize:24,marginBottom:8}}>{ins.icon}</div>
                <div style={{fontSize:14,fontWeight:700,color:ins.color,marginBottom:5,fontFamily:"'Sora',sans-serif"}}>{ins.title}</div>
                <div style={{fontSize:13,color:"var(--ink2)",lineHeight:1.6}}>{ins.body}</div>
              </div>
            ))}
          </div>

          {/* Budget guide */}
          <div className="card" style={{padding:"16px",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif",marginBottom:4}}>Recommended Budget</div>
            <div style={{fontSize:12,color:"var(--ink4)",marginBottom:14}}>How your spending compares to student guidelines</div>
            {BUDGET_GUIDE.map((row,i)=>{
              const actual=totalSpent>0?row.keys.reduce((s,k)=>s+(catTotals[k]||0),0)/totalSpent*100:0;
              const over=actual>row.rec+5;
              const under=actual<row.rec-5&&actual>0;
              return (
                <div key={i} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div style={{fontSize:13,fontWeight:500,color:"var(--ink2)"}}>{row.cat}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:10,color:"var(--ink4)"}}>Rec: {row.rec}%</span>
                      <span style={{fontSize:11,fontWeight:700,color:over?"var(--red)":under?"var(--blue)":"var(--green)",background:over?"var(--red-bg)":under?"var(--blue-bg)":"var(--green-bg)",padding:"1px 7px",borderRadius:99}}>
                        {actual.toFixed(0)}%{over?" ↑":under?" ↓":""}
                      </span>
                    </div>
                  </div>
                  <div style={{position:"relative",height:6,background:"var(--border)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${row.rec}%`,background:"rgba(91,63,248,.15)",borderRadius:99}}/>
                    <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${Math.min(actual,100)}%`,background:over?"var(--red)":"var(--brand)",borderRadius:99,transition:"width .8s"}}/>
                  </div>
                  <div style={{fontSize:10,color:"var(--ink4)",marginTop:3}}>💡 {row.tip}</div>
                </div>
              );
            })}
          </div>
        </>}

        {/* ── BREAKDOWN TAB ── */}
        {tab==="breakdown" && <>
          {catLabels.length>0 ? (
            <div className="fu0 card" style={{overflow:"hidden",marginBottom:12}}>
              <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)"}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>By Category — Ranked</div>
                <div style={{fontSize:12,color:"var(--ink4)",marginTop:2}}>All-time spend per category</div>
              </div>
              {catLabels.map((cat,i)=>{
                const pct=totalSpent>0?catTotals[cat]/totalSpent*100:0;
                const avg=catTotals[cat]/Math.max(1,months.length*30);
                return (
                  <div key={cat} style={{padding:"13px 16px",borderBottom:i<catLabels.length-1?"1px solid var(--border)":"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{width:28,height:28,borderRadius:8,background:COLORS[i%COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0}}>{i+1}</div>
                      <span style={{fontSize:18}}>{CAT_EMOJI[cat]||"💳"}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:700,color:"var(--ink)"}}>{cat}</div>
                        <div style={{fontSize:11,color:"var(--ink4)"}}>₹{fmt(Math.round(avg))}/day avg</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:15,fontWeight:800,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>₹{fmt(catTotals[cat])}</div>
                        <div style={{fontSize:11,color:"var(--ink4)"}}>{pct.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div style={{height:5,background:"var(--border)",borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:COLORS[i%COLORS.length],borderRadius:99}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{padding:"48px 20px",textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>📊</div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--ink2)"}}>No expenses yet</div>
            </div>
          )}

          {months.length>0&&(
            <div className="fu1 card" style={{overflow:"hidden",marginBottom:12}}>
              <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)"}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>Month-by-Month</div>
              </div>
              {[...months].reverse().map((m,i)=>{
                const val=history[m];
                const idx=months.indexOf(m);
                const prev2=idx>0?history[months[idx-1]]:null;
                const mTrend=prev2?((val-prev2)/prev2*100):null;
                const maxVal=Math.max(...monthVals);
                return (
                  <div key={m} style={{padding:"12px 16px",borderBottom:i<months.length-1?"1px solid var(--border)":"none",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:52,fontSize:12,fontWeight:700,color:"var(--ink2)",flexShrink:0,fontFamily:"'Sora',sans-serif"}}>{fmtM(m)}</div>
                    <div style={{flex:1,height:6,background:"var(--border)",borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${(val/maxVal)*100}%`,background:"var(--brand)",borderRadius:99,transition:"width .8s"}}/>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",width:76,textAlign:"right",fontFamily:"'Sora',sans-serif"}}>₹{fmtK(val)}</div>
                    {mTrend!==null&&(
                      <div style={{fontSize:10,fontWeight:700,color:mTrend>0?"var(--red)":"var(--green)",background:mTrend>0?"var(--red-bg)":"var(--green-bg)",padding:"2px 7px",borderRadius:99,width:42,textAlign:"center",flexShrink:0}}>
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
    </MobilePage>
  );
}