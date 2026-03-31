import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  injectMobileCSS, fmt,
  Icon, ICONS, BottomNav
} from "./MobileLayout";

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --sb:#2d1b69; --accent:#7c5cbf; --accent2:#a78bfa;
    --bg:#f0eff6; --surface:#fff; --border:#e5e7eb;
    --ink:#111827; --ink2:#374151; --ink3:#6b7280; --ink4:#9ca3af;
    --green:#059669; --gbg:#ecfdf5; --gborder:#a7f3d0;
    --red:#dc2626;   --rbg:#fef2f2; --rborder:#fecaca;
    --amber:#d97706; --abg:#fffbeb; --aborder:#fde68a;
    --blue:#2563eb;  --bbg:#eff6ff; --bborder:#bfdbfe;
    --purple:#7c3aed;--pbg:#f5f3ff; --pborder:#ddd6fe;
    --font:'Plus Jakarta Sans',system-ui,sans-serif;
    --nav-h:64px;
    --hdr-h:0px;
  }
  html,body{font-family:var(--font);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;overscroll-behavior:none;}
  ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}

  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
  @keyframes fadeBack{from{opacity:0}to{opacity:1}}
  @keyframes cardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

  .fade{animation:fadeIn .3s ease both}
  .slink{transition:background .15s,color .15s;cursor:pointer;text-decoration:none;display:flex;}
  .slink:hover{background:rgba(255,255,255,.09)!important;color:#fff!important}
  .slink.active{background:rgba(255,255,255,.16)!important;color:#fff!important}
  .inp{padding:8px 12px;border-radius:7px;border:1px solid var(--border);font-size:13px;font-family:inherit;color:var(--ink);outline:none;background:var(--surface);transition:border-color .15s;}
  .inp:focus{border-color:var(--accent);}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;}
  .pulse{animation:pulse 2s infinite;}
  .drawer{animation:slideRight .22s ease both;}
  .overlay{animation:fadeBack .2s ease both;}

  /* Sidebar */
  .sidebar{width:210px;flex-shrink:0;background:var(--sb);display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow:hidden;}

  /* Chips scroll */
  .chips-scroll{display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px;}
  .chips-scroll::-webkit-scrollbar{display:none;}

  /* Type tab pills */
  .type-tab{
    flex:1;padding:8px 4px;border-radius:9px;font-size:12px;font-weight:700;
    cursor:pointer;font-family:var(--font);border:none;
    background:transparent;color:rgba(255,255,255,.55);
    transition:all .18s;white-space:nowrap;text-align:center;
  }
  .type-tab.active{background:rgba(255,255,255,.18);color:#fff;box-shadow:0 1px 6px rgba(0,0,0,.18);}

  /* Date preset chips */
  .date-chip{
    flex-shrink:0;padding:5px 13px;border-radius:99px;font-size:11px;font-weight:600;
    cursor:pointer;font-family:var(--font);
    background:rgba(255,255,255,.1);color:rgba(255,255,255,.6);
    border:1.5px solid rgba(255,255,255,.15);
    transition:all .15s;white-space:nowrap;
  }
  .date-chip.active{background:rgba(255,255,255,.22);color:#fff;border-color:rgba(255,255,255,.4);}

  /* Tx card */
  .tx-card{
    background:var(--surface);border-radius:14px;
    border:1px solid var(--border);
    display:flex;align-items:center;gap:13px;
    padding:13px 14px;
    box-shadow:0 1px 3px rgba(0,0,0,.05);
    cursor:pointer;
    transition:transform .12s,box-shadow .15s;
    animation:cardIn .25s ease both;
  }
  .tx-card:active{transform:scale(.985);box-shadow:0 0 0 rgba(0,0,0,0);}

  /* Sheet */
  .sheet-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.45);backdrop-filter:blur(3px);}
  .sheet-panel{position:fixed;bottom:0;left:0;right:0;z-index:201;background:var(--surface);border-radius:22px 22px 0 0;max-height:85vh;overflow:hidden;animation:slideUp .3s cubic-bezier(.34,1.1,.64,1) both;}
  .sheet-handle{width:36px;height:4px;background:#e5e7eb;border-radius:99px;margin:12px auto 0;}

  @media(max-width:768px){
    .sidebar{display:none!important;}
    .desk-hdr{display:none!important;}
    .desk-only{display:none!important;}
    .mob-only{display:flex!important;}
    .main-scroll{padding:10px 12px calc(var(--nav-h) + 20px)!important;}
    .summary-grid{display:none!important;}
  }
  @media(min-width:769px){
    .mob-only{display:none!important;}
    .desk-hdr{display:flex!important;}
    .desk-only{display:block!important;}
    .summary-grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;}
  }
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__tx_v2__")) return;
  const s=document.createElement("style"); s.id="__tx_v2__"; s.textContent=CSS;
  document.head.appendChild(s);
  injectMobileCSS();
}

const CAT_EMOJI={
  Food:"🍜",Transport:"🚗",Shopping:"🛍️",Entertainment:"🎬",
  Health:"💊",Utilities:"⚡",Groceries:"🛒",Coffee:"☕",
  Books:"📚",Bills:"💡",Travel:"✈️",Medicine:"💊",
  Income:"💰",Salary:"💼",Refund:"↩️",Cashback:"🎁",
  Transfer:"🔁",Finance:"💳",Education:"📚",Other:"💳",
};

const NAV_SECTIONS=[
  {label:null,items:[{to:"/dashboard",label:"Home",icon:"home"}]},
  {label:"Track Money",items:[
    {to:"/transactions",label:"Transactions",icon:"tx"},
    {to:"/analytics",label:"Analytics",icon:"analytics"},
    {to:"/goals",label:"My Goals",icon:"goals"},
    {to:"/budgets",label:"My Budgets",icon:"budget"},
  ]},
  {label:"Auto Features",items:[
    // {to:"/detected-transactions",label:"SMS Detected",icon:"detect"},
    {to:"/reminders",label:"Reminders",icon:"reminder"},
  ]},
  {label:"Account",items:[{to:"/settings",label:"Settings",icon:"home"}]},
];

function Sidebar({onLogout}) {
  const location=useLocation();
  const path=location.pathname;
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
            {sec.items.map(item=>(
              <Link key={item.to} to={item.to}
                className={`slink${path===item.to?" active":""}`}
                style={{alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,color:"rgba(255,255,255,.65)",fontSize:13,marginBottom:1}}>
                <Icon d={ICONS[item.icon]} size={14}/>{item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <button onClick={onLogout} className="slink"
          style={{width:"100%",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,background:"transparent",border:"none",color:"rgba(255,255,255,.65)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          <Icon d={ICONS.logout} size={14}/> Sign Out
        </button>
      </div>
    </aside>
  );
}

function fmtDateTime(raw) {
  if(!raw) return "—";
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())){
    const[y,m,d]=raw.split("-");
    return new Date(+y,+m-1,+d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  }
  const utc=(raw.endsWith("Z")||raw.includes("+"))?raw:raw.replace(" ","T")+"Z";
  return new Date(utc).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true});
}

function txDate(t) {
  const raw=t.date||(t.created_at||"").slice(0,10);
  return raw?raw.slice(0,10):null;
}

function looksLikeDebitMerchant(t) {
  const merch=(t.merchant||t.merchant_name||t.source||t.description||"").toUpperCase().trim();
  if(/^[A-Z][A-Z ]+\s[A-Z]$/.test(merch)) return true;
  const debitKeywords=["UPITRANSFER","UPI TRANSFER","NEFT TRANSFER","IMPS TRANSFER","SENT TO","PAID TO","TRF TO","MONEY SENT","TRANSFER SENT"];
  if(debitKeywords.some(k=>merch.includes(k))) return true;
  return false;
}

function detectType(t, apiDefault) {
  const tt = (t.transaction_type || t.type || "").toLowerCase();
  if(tt === "debit" || tt === "expense") return "debit";
  if(tt === "credit" || tt === "income") return "credit";
  if(typeof t.amount === "number" && t.amount < 0) return "debit";
  return apiDefault; // ✅ Trust the API, remove looksLikeDebitMerchant override
}



function resolveCategory(t) {
  const isCredit=t._type==="credit";
  if(isCredit){
    // ✅ Trust API category first
    const stored=t.category||t.category_guess||"";
    const validCreditCats=["Income","Transfer","Refund","Cashback","Salary"];
    if(stored&&validCreditCats.includes(stored)) return stored;
    const src=t.credit_source||t.source||"";
    if(src==="Salary") return "Salary";
    if(src==="Refund") return "Refund";
    if(src==="Cashback") return "Cashback";
    if(src==="UPI Received") return "Transfer";
    if(src==="Transfer") return "Transfer";
    // Keyword fallback only on description, NOT merchant name
    const desc=(t.description||"").toLowerCase();
    if(desc.includes("salary")||desc.includes("stipend")) return "Salary";
    if(desc.includes("refund")||desc.includes("reversal")) return "Refund";
    if(desc.includes("cashback")) return "Cashback";
    return "Income";
  }
  // ✅ For debits: trust API category completely
  const cat=t.category||t.category_guess||"";
  if(cat) return cat;
  // Only fall back to keyword matching if NO category from API at all
  const desc=(t.description||"").toLowerCase();
  if(desc.includes("transfer")&&desc.includes("sent")) return "Transfer";
  return "Other";
}

function getCategoryColors(category,isCredit) {
  if(category==="Transfer") return {accentColor:"var(--blue)",accentBg:"var(--bbg)",accentBorder:"var(--bborder)"};
  if(!isCredit) return {accentColor:"var(--red)",accentBg:"var(--rbg)",accentBorder:"var(--rborder)"};
  switch(category){
    case "Refund": return {accentColor:"var(--amber)",accentBg:"var(--abg)",accentBorder:"var(--aborder)"};
    case "Cashback": return {accentColor:"var(--amber)",accentBg:"var(--abg)",accentBorder:"var(--aborder)"};
    default: return {accentColor:"var(--green)",accentBg:"var(--gbg)",accentBorder:"var(--gborder)"};
  }
}

function typeBadgeLabel(isCredit,category) {
  if(category==="Transfer") return "🔁 Transfer";
  if(!isCredit) return "💸 Expense";
  if(category==="Refund") return "↩️ Refund";
  if(category==="Cashback") return "🎁 Cashback";
  if(category==="Salary") return "💼 Salary";
  return "💰 Income";
}

function getTxDisplay(t) {
  const isCredit=t._type==="credit";
  const auto=t.is_auto===true||t.is_auto===1||t.is_auto==="true"||t.is_auto==="1";
  const category=resolveCategory(t);
  const merchant=isCredit?(t.source||t.merchant||t.merchant_name||t.description||null):(t.merchant||t.merchant_name||t.description||null);
  const absAmount=Math.abs(t.amount);
  const dateStr=fmtDateTime(t.created_at||t.date);
  const{accentColor,accentBg,accentBorder}=getCategoryColors(category,isCredit);
  const borderColor=category==="Transfer"?"var(--blue)":isCredit?"var(--green)":auto?"var(--blue)":"transparent";
  return{isCredit,auto,merchant,category,dateStr,accentColor,accentBg,accentBorder,borderColor,absAmount};
}

/* ─── Detail Sheet (mobile-style bottom sheet) ───────────────────────────── */
function DetailDrawer({txn,onClose}) {
  if(!txn) return null;
  const{isCredit,auto,merchant,category,dateStr,accentColor,accentBg,accentBorder,absAmount}=getTxDisplay(txn);
  const rows=[
    {emoji:"🏷️",label:"Type",value:typeBadgeLabel(isCredit,category)},
    {emoji:"📂",label:"Category",value:category},
    {emoji:"🏪",label:"Merchant / From",value:merchant||"—"},
    {emoji:"💵",label:"Amount",value:(isCredit?"+":"−")+" ₹"+fmt(absAmount)},
    {emoji:"📅",label:"Date & Time",value:dateStr},
    {emoji:"📲",label:"Source",value:auto?"Auto-detected from SMS":"Added manually"},
    {emoji:"🔢",label:"Transaction ID",value:"#"+txn.id},
  ];
  return (
    <>
      <div className="sheet-overlay" onClick={onClose}/>
      <div className="sheet-panel">
        <div className="sheet-handle"/>
        <div style={{padding:"20px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--ink)"}}>Transaction Details</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:7,border:"1px solid var(--border)",background:"var(--bg)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon d={ICONS.x} size={13} color="var(--ink3)"/>
          </button>
        </div>
        <div style={{margin:"16px 22px 0",padding:"20px",borderRadius:14,textAlign:"center",background:accentBg,border:`1px solid ${accentBorder}`}}>
          <div style={{fontSize:34,marginBottom:8}}>{CAT_EMOJI[category]||(isCredit?"💰":"💳")}</div>
          <div style={{fontSize:28,fontWeight:800,color:accentColor,marginBottom:4,fontFamily:"'Sora',sans-serif"}}>
            {isCredit?"+":"−"}₹{fmt(absAmount)}
          </div>
          <div style={{fontSize:12,color:"var(--ink3)",marginBottom:10}}>{category}{merchant?" · "+merchant:""}</div>
          <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:600,background:accentBg,color:accentColor,border:`1px solid ${accentBorder}`}}>
              {typeBadgeLabel(isCredit,category)}
            </span>
            <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:600,background:auto?"var(--bbg)":"var(--abg)",color:auto?"var(--blue)":"var(--amber)",border:`1px solid ${auto?"var(--bborder)":"var(--aborder)"}`}}>
              {auto?"🤖 Auto SMS":"✍️ Manual"}
            </span>
          </div>
        </div>
        <div style={{padding:"8px 22px 0"}}>
          {rows.map((row,i)=>(
            <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:i<rows.length-1?"1px solid var(--border)":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>{row.emoji}</span>
                <span style={{fontSize:12,color:"var(--ink3)",fontWeight:500}}>{row.label}</span>
              </div>
              <span style={{fontSize:13,fontWeight:600,color:"var(--ink)",textAlign:"right",maxWidth:200,wordBreak:"break-word"}}>{row.value}</span>
            </div>
          ))}
        </div>
        <div style={{padding:"16px 22px 0"}}>
          <button onClick={onClose} style={{width:"100%",padding:"13px",borderRadius:12,background:"var(--accent)",border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Done</button>
        </div>
      </div>
    </>
  );
}

/* ─── Mobile Filter Sheet ────────────────────────────────────────────────── */
function FilterSheet({category,setCategory,dateFrom,setDateFrom,dateTo,setDateTo,onClose,onClear}) {
  const CATEGORIES=["Food","Groceries","Shopping","Travel","Entertainment","Bills","Medicine","Education","Finance","Transfer","Income","Salary","Refund","Cashback","Other"];
  // Button height + padding so content doesn't hide behind it
  const BTN_H = 80;
  return (
    <>
      <div className="sheet-overlay" onClick={onClose}/>

      {/* Sheet panel — auto height, scrollable, no overflow:hidden */}
      <div style={{
        position:"fixed",bottom:0,left:0,right:0,zIndex:201,
        background:"var(--surface)",borderRadius:"22px 22px 0 0",
        maxHeight:"78vh",overflowY:"auto",
        animation:"slideUp .3s cubic-bezier(.34,1.1,.64,1) both",
        paddingBottom:BTN_H
      }}>
        <div className="sheet-handle"/>

        {/* Header */}
        <div style={{padding:"12px 20px 16px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"var(--surface)",zIndex:1}}>
          <span style={{fontSize:16,fontWeight:700,color:"var(--ink)"}}>Filters</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={onClear} style={{fontSize:12,color:"var(--accent)",fontWeight:700,fontFamily:"inherit",padding:"5px 12px",borderRadius:99,border:"1px solid var(--pborder)",background:"var(--pbg)",cursor:"pointer"}}>Clear all</button>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:99,border:"1px solid var(--border)",background:"var(--bg)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon d={ICONS.x} size={13} color="var(--ink3)"/>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{padding:"20px 20px 8px"}}>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:10}}>Category</div>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="inp" style={{width:"100%",padding:"13px",fontSize:14}}>
              <option value="">All categories</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:10}}>Date Range</div>
            <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"var(--ink4)",marginBottom:5,fontWeight:600}}>FROM</div>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="inp" style={{width:"100%",padding:"10px"}}/>
              </div>
              <div style={{color:"var(--ink4)",paddingBottom:10,fontSize:18}}>→</div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"var(--ink4)",marginBottom:5,fontWeight:600}}>TO</div>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="inp" style={{width:"100%",padding:"10px"}}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply button — position:fixed, ALWAYS visible at screen bottom */}
      <div style={{
        position:"fixed",bottom:0,left:0,right:0,
        zIndex:202,
        padding:"12px 20px",
        paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))",
        background:"var(--surface)",
        borderTop:"1px solid var(--border)",
      }}>
        <button onClick={onClose} style={{
          width:"100%",padding:"15px",borderRadius:13,
          background:"linear-gradient(135deg,#7c5cbf,#a78bfa)",
          border:"none",color:"#fff",fontSize:15,fontWeight:700,
          cursor:"pointer",fontFamily:"inherit",
          boxShadow:"0 4px 16px rgba(124,92,191,.35)",
        }}>
          ✓ Apply Filters
        </button>
      </div>
    </>
  );
}

/* ─── NEW: Redesigned Mobile Transaction Card ────────────────────────────── */
function MobileTxCard({t,onClick,animDelay=0}) {
  const{isCredit,auto,merchant,category,dateStr,accentColor,accentBg,accentBorder,absAmount}=getTxDisplay(t);

  // Extract date and time parts cleanly
  const parts=dateStr.split(",");
  const datePart=parts[0]?.trim()||"";
  const timePart=parts.slice(1).join(",").trim()||"";

  return (
    <div className="tx-card" onClick={onClick}
      style={{animationDelay:`${animDelay}ms`}}>

      {/* Icon */}
      <div style={{
        width:44,height:44,borderRadius:12,
        background:accentBg,
        border:`1.5px solid ${accentBorder}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:20,flexShrink:0
      }}>
        {CAT_EMOJI[category]||(isCredit?"💰":"💳")}
      </div>

      {/* Middle content */}
      <div style={{flex:1,minWidth:0}}>
        {/* Top row: category + amount */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
          <span style={{fontSize:14,fontWeight:700,color:"var(--ink)",letterSpacing:"-0.2px"}}>
            {category}
          </span>
          <span style={{
            fontSize:16,fontWeight:800,
            color:accentColor,
            fontFamily:"'Sora',sans-serif",
            letterSpacing:"-0.5px",
            flexShrink:0,marginLeft:8
          }}>
            {isCredit?"+":"−"}₹{fmt(absAmount)}
          </span>
        </div>

        {/* Merchant name */}
        <div style={{
          fontSize:12,color:"var(--ink3)",
        whiteSpace:"normal",wordBreak:"break-word",marginBottom:6,fontWeight:500
        }}>
          {merchant||<span style={{color:"var(--ink4)",fontStyle:"italic"}}>No merchant</span>}
        </div>

        {/* Bottom row: date · type badge · source badge */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
          {/* Left: date + time */}
          <div style={{display:"flex",alignItems:"center",gap:5,minWidth:0}}>
            <span style={{
              fontSize:6,color:"var(--ink4)",fontWeight:500,
              background:"var(--bg)",padding:"2px 7px",borderRadius:99,
              border:"1px solid var(--border)",flexShrink:0
            }}>
              {datePart}
            </span>
            {timePart&&(
  <span style={{fontSize:8,color:"var(--ink4)",whiteSpace:"nowrap"}}>{timePart}</span>
)}
          </div>
          {/* Right: type + source badges */}
          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            <span style={{
              display:"inline-flex",alignItems:"center",gap:3,
              padding:"2px 8px",borderRadius:99,
              fontSize:10,fontWeight:700,
              background:accentBg,color:accentColor,
              border:`1px solid ${accentBorder}`,
            }}>
              {typeBadgeLabel(isCredit,category)}
            </span>
            <span style={{
              display:"inline-flex",alignItems:"center",gap:3,
              padding:"2px 8px",borderRadius:99,
              fontSize:10,fontWeight:700,
              background:auto?"var(--bbg)":"var(--abg)",
              color:auto?"var(--blue)":"var(--amber)",
              border:`1px solid ${auto?"var(--bborder)":"var(--aborder)"}`,
            }}>
              {auto?"🤖 Auto":"✍️ Manual"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── NEW: Compact Summary Banner (horizontal scroll) ────────────────────── */
function SummaryBanner({filtered}) {
  const totalDebit=filtered.filter(t=>t._type==="debit").reduce((s,t)=>s+Math.abs(t.amount),0);
  const totalCredit=filtered.filter(t=>t._type==="credit").reduce((s,t)=>s+Math.abs(t.amount),0);
  const net=totalCredit-totalDebit;
  const netPositive=net>=0;

  const stats=[
    {label:"Transactions",value:filtered.length,sub:"total",col:"var(--accent)",bg:"var(--pbg)",border:"var(--pborder)"},
    {label:"Income",value:"₹"+fmt(totalCredit),sub:"received",col:"var(--green)",bg:"var(--gbg)",border:"var(--gborder)"},
    {label:"Expenses",value:"₹"+fmt(totalDebit),sub:"spent",col:"var(--red)",bg:"var(--rbg)",border:"var(--rborder)"},
    {label:"Net Balance",value:(netPositive?"+":"-")+"₹"+fmt(Math.abs(net)),sub:netPositive?"more in 🎉":"more out ⚠️",col:netPositive?"var(--green)":"var(--red)",bg:netPositive?"var(--gbg)":"var(--rbg)",border:netPositive?"var(--gborder)":"var(--rborder)"},
  ];

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
      {stats.map(s=>(
        <div key={s.label} style={{
          background:s.bg,border:`1px solid ${s.border}`,
          borderRadius:12,padding:"11px 13px",
        }}>
          <div style={{fontSize:10,fontWeight:600,color:"var(--ink4)",marginBottom:4,textTransform:"uppercase",letterSpacing:".5px"}}>{s.label}</div>
          <div style={{fontSize:16,fontWeight:800,color:s.col,fontFamily:"'Sora',sans-serif",letterSpacing:"-0.5px",marginBottom:1}}>{s.value}</div>
          <div style={{fontSize:10,color:"var(--ink4)"}}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Quick date presets ─────────────────────────────────────────────────── */
function todayStr(){return new Date().toISOString().slice(0,10);}
function offsetDay(n){const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10);}
function startOfMonth(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;}

const QUICK_RANGES=[
  {label:"All",from:()=>"",to:()=>""},
  {label:"Today",from:()=>todayStr(),to:()=>todayStr()},
  {label:"Yesterday",from:()=>offsetDay(-1),to:()=>offsetDay(-1)},
  {label:"Last 7d",from:()=>offsetDay(-6),to:()=>todayStr()},
  {label:"Last 30d",from:()=>offsetDay(-29),to:()=>todayStr()},
  {label:"This month",from:()=>startOfMonth(),to:()=>todayStr()},
];

/* ─── Desktop Table (unchanged) ─────────────────────────────────────────── */
const COLS="44px 110px 1fr 110px 100px 180px 90px";
const HEADERS=["","Category","Merchant / From","Amount","Type","Date & Time","Source"];

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function Transactions() {
  injectCSS();
  const navigate=useNavigate();
  const token=localStorage.getItem("token");

  const [all,setAll]=useState([]);
  const [filtered,setFiltered]=useState([]);
  const [search,setSearch]=useState("");
  const [typeFilter,setTypeFilter]=useState("all");
  const [category,setCategory]=useState("");
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");
  const [loading,setLoading]=useState(true);
  const [lastSync,setLastSync]=useState(null);
  const [spinning,setSpinning]=useState(false);
  const [selected,setSelected]=useState(null);
  const [activePreset,setActivePreset]=useState("All");
  const [showFilter,setShowFilter]=useState(false);
  const [isMobile,setIsMobile]=useState(window.innerWidth<=768);
  const searchRef=useRef(null);

  const CATEGORIES=["Food","Groceries","Shopping","Travel","Entertainment","Bills","Medicine","Education","Finance","Transfer","Income","Salary","Refund","Cashback","Other"];
  const API="https://smartspend-backend-production-6f21.up.railway.app";

  useEffect(()=>{
    const onResize=()=>setIsMobile(window.innerWidth<=768);
    window.addEventListener("resize",onResize);
    return()=>window.removeEventListener("resize",onResize);
  },[]);

  useEffect(()=>{
    if(!token){navigate("/",{replace:true});return;}
    load();
    const iv=setInterval(load,5000);
    return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{applyFilters();},[search,typeFilter,category,dateFrom,dateTo,all]);

  async function load() {
    try {
      const headers={Authorization:`Bearer ${token}`};
      const expRes=await fetch(`${API}/api/expenses/`,{headers});
      if(expRes.status===401){localStorage.removeItem("token");navigate("/",{replace:true});return;}
      const expenses=expRes.ok?await expRes.json():[];
      const incRes=await fetch(`${API}/api/income/`,{headers});
      const incomes=incRes.ok?await incRes.json():[];
      const tagged=[
        ...expenses.map(t=>({...t,_type:detectType(t,"debit")})),
        ...incomes.map(t=>({...t,_type:detectType(t,"credit")})),
      ];
      tagged.sort((a,b)=>{
        const da=new Date(((a.created_at||a.date||"").replace(" ","T"))+(a.created_at?.includes("Z")||a.created_at?.includes("+")?"":'Z'));
        const db=new Date(((b.created_at||b.date||"").replace(" ","T"))+(b.created_at?.includes("Z")||b.created_at?.includes("+")?"":'Z'));
        if(db-da!==0) return db-da;
        if(a._type!==b._type) return a._type==="credit"?-1:1;
        return(b.id||0)-(a.id||0);
      });
      setAll(tagged);
      setLastSync(new Date());
    } finally{setLoading(false);setSpinning(false);}
  }

  function applyFilters() {
    let list=[...all];
    if(typeFilter==="debit") list=list.filter(t=>t._type==="debit");
    if(typeFilter==="credit") list=list.filter(t=>t._type==="credit");
    if(search){
      const q=search.toLowerCase();
      list=list.filter(t=>{
        const cat=resolveCategory(t).toLowerCase();
        return cat.includes(q)||(t.merchant||"").toLowerCase().includes(q)||(t.source||"").toLowerCase().includes(q)||(t.description||"").toLowerCase().includes(q)||(t.credit_source||"").toLowerCase().includes(q);
      });
    }
    if(category) list=list.filter(t=>resolveCategory(t)===category);
    if(dateFrom) list=list.filter(t=>{const d=txDate(t);return d&&d>=dateFrom;});
    if(dateTo) list=list.filter(t=>{const d=txDate(t);return d&&d<=dateTo;});
    setFiltered(list);
  }

  function applyPreset(p){setDateFrom(p.from());setDateTo(p.to());setActivePreset(p.label);}

  function clearFilters(){
    setSearch("");setTypeFilter("all");setCategory("");
    setDateFrom("");setDateTo("");setActivePreset("All");
  }

  function logout(){localStorage.removeItem("token");navigate("/",{replace:true});}

  const hasFilters=search||typeFilter!=="all"||category||dateFrom||dateTo;
  const activeFilterCount=[search,typeFilter!=="all",category,dateFrom,dateTo].filter(Boolean).length;

  if(loading) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:28,height:28,border:"2.5px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px"}}/>
        <div style={{fontSize:12,color:"var(--ink3)"}}>Loading your transactions…</div>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout}/>
      <BottomNav/>

      {/* Detail sheet — mobile bottom sheet style */}
      <DetailDrawer txn={selected} onClose={()=>setSelected(null)}/>

      {/* Filter sheet */}
      {showFilter&&isMobile&&(
        <FilterSheet
          category={category} setCategory={setCategory}
          dateFrom={dateFrom} setDateFrom={setDateFrom}
          dateTo={dateTo} setDateTo={setDateTo}
          onClose={()=>setShowFilter(false)}
          onClear={clearFilters}
        />
      )}

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* ══════════════ REDESIGNED MOBILE HEADER ══════════════ */}
        <div className="mob-only" style={{
          flexDirection:"column",
          background:"var(--sb)",
          position:"sticky",top:0,zIndex:50,
          paddingBottom:0,
        }}>

          {/* Row 1: Title + action buttons */}
          <div style={{
            padding:"14px 16px 10px",
            display:"flex",alignItems:"center",justifyContent:"space-between"
          }}>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:"'Sora',sans-serif",lineHeight:1.1}}>
                Transactions
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginTop:2,fontWeight:500}}>
                {filtered.length} of {all.length} shown
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {/* Refresh */}
              <button onClick={()=>{setSpinning(true);load();}}
                style={{
                  width:36,height:36,borderRadius:10,
                  border:"1.5px solid rgba(255,255,255,.2)",
                  background:"rgba(255,255,255,.1)",
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"
                }}>
                <span style={{display:"inline-block",animation:spinning?"spin .7s linear infinite":"none"}}>
                  <Icon d={ICONS.refresh} size={16} color="#fff"/>
                </span>
              </button>
              {/* Filter with badge */}
              <button onClick={()=>setShowFilter(true)}
                style={{
                  height:36,borderRadius:10,
                  border:"1.5px solid rgba(255,255,255,.2)",
                  background:activeFilterCount>0?"rgba(255,255,255,.2)":"rgba(255,255,255,.1)",
                  cursor:"pointer",display:"flex",alignItems:"center",gap:5,
                  padding:"0 12px",position:"relative"
                }}>
                <Icon d={ICONS.filter} size={14} color="#fff"/>
                <span style={{fontSize:11,fontWeight:600,color:"#fff"}}>Filter</span>
                {activeFilterCount>0&&(
                  <span style={{
                    width:16,height:16,borderRadius:"50%",
                    background:"#ef4444",color:"#fff",
                    fontSize:8,fontWeight:800,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    marginLeft:2
                  }}>{activeFilterCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Search bar */}
          <div style={{padding:"0 16px 10px",position:"relative"}}>
            <span style={{
              position:"absolute",left:27,top:"50%",
              transform:"translateY(-55%)",pointerEvents:"none"
            }}>
              <Icon d={ICONS.search} size={14} color="rgba(255,255,255,.4)"/>
            </span>
            <input
              ref={searchRef}
              placeholder="Search category, merchant…"
              value={search}
              onChange={e=>setSearch(e.target.value)}
              style={{
                width:"100%",
                padding:"10px 36px 10px 38px",
                borderRadius:11,
                border:"1.5px solid rgba(255,255,255,.15)",
                background:"rgba(255,255,255,.1)",
                color:"#fff",fontSize:13,
                fontFamily:"inherit",outline:"none",
                letterSpacing:"-.1px"
              }}/>
            {search&&(
              <button onClick={()=>setSearch("")} style={{
                position:"absolute",right:24,top:"50%",
                transform:"translateY(-55%)",
                background:"rgba(255,255,255,.15)",border:"none",
                cursor:"pointer",padding:3,display:"flex",
                alignItems:"center",borderRadius:99
              }}>
                <Icon d={ICONS.x} size={11} color="rgba(255,255,255,.7)"/>
              </button>
            )}
          </div>

          {/* Row 3: Type tabs (pill toggle) */}
          <div style={{
            margin:"0 16px 10px",
            background:"rgba(0,0,0,.2)",
            borderRadius:11,padding:4,
            display:"flex",gap:0
          }}>
            {[
              {value:"all",label:"All"},
              {value:"debit",label:"💸 Expenses"},
              {value:"credit",label:"💰 Income"}
            ].map(tab=>(
              <button key={tab.value}
                className={`type-tab${typeFilter===tab.value?" active":""}`}
                onClick={()=>setTypeFilter(tab.value)}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Row 4: Date preset chips — scrollable */}
          <div style={{padding:"0 16px 12px"}}>
            <div className="chips-scroll">
              {QUICK_RANGES.map(p=>(
                <button key={p.label}
                  className={`date-chip${activePreset===p.label?" active":""}`}
                  onClick={()=>applyPreset(p)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Desktop Header (unchanged) ── */}
        <div className="desk-hdr" style={{
          background:"var(--surface)",borderBottom:"1px solid var(--border)",
          padding:"16px 28px",justifyContent:"space-between",alignItems:"center"
        }}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>My Transactions</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>All your expenses and income · Click any row for details</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {lastSync&&(
              <div style={{fontSize:11,color:"var(--ink4)",display:"flex",alignItems:"center",gap:5}}>
                <span className="pulse" style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"var(--green)"}}/>
                Synced {lastSync.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
              </div>
            )}
            <button onClick={()=>{setSpinning(true);load();}}
              style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:7,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--ink2)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
              <span style={{display:"inline-block",animation:spinning?"spin .7s linear infinite":"none"}}><Icon d={ICONS.refresh} size={13}/></span>
              Refresh
            </button>
          </div>
        </div>

        {/* ══════════════ PAGE CONTENT ══════════════ */}
        <div className="main-scroll" style={{
          flex:1,overflowY:"auto",
          padding:"14px 16px 28px",
          background:"var(--bg)"
        }}>

          {/* Desktop summary cards — hidden on mobile via CSS */}
          <div className="desk-only" style={{marginBottom:16}}>
          <div className="summary-grid fade" style={{
            display:"grid",gridTemplateColumns:"repeat(4,1fr)",
            gap:12
          }}>
            {[
              {label:"Total",val:filtered.length,pfx:"",sub:"transactions",col:"var(--ink)",bg:"var(--surface)"},
              {label:"Total income",val:"₹"+fmt(filtered.filter(t=>t._type==="credit").reduce((s,t)=>s+Math.abs(t.amount),0)),pfx:"",sub:filtered.filter(t=>t._type==="credit").length+" entries",col:"var(--green)",bg:"var(--gbg)"},
              {label:"Total expenses",val:"₹"+fmt(filtered.filter(t=>t._type==="debit").reduce((s,t)=>s+Math.abs(t.amount),0)),pfx:"",sub:filtered.filter(t=>t._type==="debit").length+" entries",col:"var(--red)",bg:"var(--rbg)"},
              {label:"Net balance",val:(()=>{const c=filtered.filter(t=>t._type==="credit").reduce((s,t)=>s+Math.abs(t.amount),0);const d=filtered.filter(t=>t._type==="debit").reduce((s,t)=>s+Math.abs(t.amount),0);return(c>=d?"+":"-")+"₹"+fmt(Math.abs(c-d));})(),pfx:"",sub:(()=>{const c=filtered.filter(t=>t._type==="credit").reduce((s,t)=>s+Math.abs(t.amount),0);const d=filtered.filter(t=>t._type==="debit").reduce((s,t)=>s+Math.abs(t.amount),0);return c>=d?"More in 🎉":"More out ⚠️";})(),col:(()=>{const c=filtered.filter(t=>t._type==="credit").reduce((s,t)=>s+Math.abs(t.amount),0);const d=filtered.filter(t=>t._type==="debit").reduce((s,t)=>s+Math.abs(t.amount),0);return c>=d?"var(--green)":"var(--red)";})(),bg:(()=>{const c=filtered.filter(t=>t._type==="credit").reduce((s,t)=>s+Math.abs(t.amount),0);const d=filtered.filter(t=>t._type==="debit").reduce((s,t)=>s+Math.abs(t.amount),0);return c>=d?"var(--gbg)":"var(--rbg)";})()},
            ].map(s=>(
              <div key={s.label} style={{background:s.bg,border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <div style={{fontSize:10,fontWeight:600,color:"var(--ink3)",marginBottom:5}}>{s.label}</div>
                <div style={{fontSize:15,fontWeight:700,color:s.col,marginBottom:2}}>{s.val}</div>
                <div style={{fontSize:10,color:"var(--ink4)"}}>{s.sub}</div>
              </div>
            ))}
          </div>
          </div>

          {/* Mobile Summary Banner (2×2 grid, clean) */}
          <div className="mob-only" style={{flexDirection:"column"}}>
            <SummaryBanner filtered={filtered}/>
          </div>

          {/* Desktop filter bar */}
          <div className="desk-only" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"14px 18px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
            <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{display:"flex",gap:6,background:"var(--bg)",borderRadius:8,padding:4}}>
                {[{value:"all",label:"All"},{value:"debit",label:"💸 Expenses"},{value:"credit",label:"💰 Income"}].map(opt=>(
                  <button key={opt.value} onClick={()=>setTypeFilter(opt.value)}
                    style={{padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"inherit",background:typeFilter===opt.value?"var(--accent)":"transparent",color:typeFilter===opt.value?"#fff":"var(--ink3)",transition:"all .15s"}}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div style={{position:"relative",flex:1,minWidth:160}}>
                <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d={ICONS.search} size={13} color="var(--ink4)"/></span>
                <input placeholder="Search category or merchant…" value={search} onChange={e=>setSearch(e.target.value)} className="inp" style={{paddingLeft:30,width:"100%"}}/>
              </div>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="inp" style={{minWidth:150}}>
                <option value="">All categories</option>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              {hasFilters&&(
                <button onClick={clearFilters} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",borderRadius:7,background:"var(--rbg)",border:"1px solid var(--rborder)",color:"var(--red)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                  <Icon d={ICONS.x} size={12} color="var(--red)"/> Clear all
                </button>
              )}
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <Icon d={ICONS.cal} size={14} color="var(--ink4)"/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div>
                  <div style={{fontSize:10,color:"var(--ink4)",marginBottom:3,fontWeight:600}}>FROM</div>
                  <input type="date" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setActivePreset(null);}} className="inp" style={{width:145}}/>
                </div>
                <div style={{fontSize:13,color:"var(--ink4)",marginTop:14}}>→</div>
                <div>
                  <div style={{fontSize:10,color:"var(--ink4)",marginBottom:3,fontWeight:600}}>TO</div>
                  <input type="date" value={dateTo} onChange={e=>{setDateTo(e.target.value);setActivePreset(null);}} className="inp" style={{width:145}}/>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginLeft:4}}>
                {QUICK_RANGES.slice(1).map(p=>(
                  <button key={p.label} onClick={()=>applyPreset(p)}
                    style={{padding:"5px 11px",borderRadius:99,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",border:activePreset===p.label?"1.5px solid var(--accent)":"1.5px solid var(--border)",background:activePreset===p.label?"rgba(124,92,191,.08)":"var(--surface)",color:activePreset===p.label?"var(--accent)":"var(--ink3)",transition:"all .12s"}}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div style={{fontSize:11,color:"var(--ink4)",marginLeft:"auto",whiteSpace:"nowrap"}}>{filtered.length} of {all.length} shown</div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="desk-only" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
            <div style={{display:"grid",gridTemplateColumns:COLS,padding:"8px 20px",background:"#f9fafb",borderBottom:"1px solid var(--border)"}}>
              {HEADERS.map(h=><div key={h} style={{fontSize:11,fontWeight:600,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".5px"}}>{h}</div>)}
            </div>
            {filtered.length===0?(
              <div style={{padding:"48px 20px",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                <div style={{fontSize:14,fontWeight:500,color:"var(--ink2)",marginBottom:4}}>No transactions found</div>
                {hasFilters&&<button onClick={clearFilters} style={{marginTop:12,padding:"7px 16px",borderRadius:7,background:"var(--accent)",border:"none",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Clear all filters</button>}
              </div>
            ):filtered.map((t,i)=>{
              const{isCredit,auto,merchant,category,dateStr,accentColor,accentBg,accentBorder,borderColor,absAmount}=getTxDisplay(t);
              const isSelected=selected?.id===t.id&&selected?._type===t._type;
              return (
                <div key={`${t._type}-${t.id}-${i}`}
                  className={`txrow${isSelected?" selected":""}`}
                  onClick={()=>setSelected(isSelected?null:t)}
                  style={{display:"grid",gridTemplateColumns:COLS,padding:"11px 20px",alignItems:"center",borderBottom:i<filtered.length-1?"1px solid var(--border)":"none",borderLeft:`3px solid ${borderColor}`,cursor:"pointer"}}>
                  <div style={{width:34,height:34,borderRadius:8,background:accentBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{CAT_EMOJI[category]||(isCredit?"💰":"💳")}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>{category}</div>
                  <div style={{fontSize:13,color:"var(--ink3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{merchant||<span style={{color:"var(--ink4)",fontStyle:"italic"}}>—</span>}</div>
                  <div style={{fontSize:14,fontWeight:700,color:accentColor}}>{isCredit?"+":"−"}₹{fmt(absAmount)}</div>
                  <span className="badge" style={{background:accentBg,color:accentColor,border:`1px solid ${accentBorder}`,fontSize:10,whiteSpace:"nowrap"}}>{typeBadgeLabel(isCredit,category)}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:"var(--ink2)"}}>{dateStr.split(",")[0]}</div>
                    <div style={{fontSize:11,color:"var(--ink4)",marginTop:1}}>{dateStr.split(",").slice(1).join(",").trim()}</div>
                  </div>
                  <span className="badge" style={{background:auto?"var(--bbg)":"var(--abg)",color:auto?"var(--blue)":"var(--amber)",border:`1px solid ${auto?"var(--bborder)":"var(--aborder)"}`,fontSize:10}}>
                    {auto?"🤖 Auto":"✍️ Manual"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ══ REDESIGNED Mobile Cards ══ */}
          <div className="mob-only" style={{flexDirection:"column",gap:8}}>
            {filtered.length===0?(
              <div style={{
                background:"var(--surface)",borderRadius:16,
                padding:"48px 20px",textAlign:"center",
                border:"1px solid var(--border)"
              }}>
                <div style={{fontSize:36,marginBottom:10}}>🔍</div>
                <div style={{fontSize:15,fontWeight:700,color:"var(--ink2)",marginBottom:6}}>No transactions found</div>
                <div style={{fontSize:13,color:"var(--ink4)",marginBottom:16}}>Try adjusting your filters</div>
                {hasFilters&&(
                  <button onClick={clearFilters} style={{
                    padding:"10px 22px",borderRadius:10,
                    background:"var(--accent)",border:"none",
                    color:"#fff",fontSize:13,cursor:"pointer",
                    fontFamily:"inherit",fontWeight:700
                  }}>Clear filters</button>
                )}
              </div>
            ):filtered.map((t,i)=>(
              <MobileTxCard
                key={`${t._type}-${t.id}-${i}`}
                t={t}
                animDelay={Math.min(i*30,200)}
                onClick={()=>setSelected(selected?.id===t.id&&selected?._type===t._type?null:t)}
              />
            ))}
          </div>

          {/* Live sync indicator */}
          <div style={{
            textAlign:"center",marginTop:16,
            fontSize:11,color:"var(--ink4)",
            display:"flex",alignItems:"center",
            justifyContent:"center",gap:6
          }}>
            <span className="pulse" style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"var(--green)"}}/>
            Auto-updates every 5 seconds
          </div>
        </div>
      </div>
    </div>
  );
}