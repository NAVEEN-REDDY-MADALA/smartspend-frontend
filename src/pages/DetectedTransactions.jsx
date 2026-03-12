import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  injectMobileCSS, fmt, CAT_EMOJI,
  Icon, ICONS, BottomNav, MobileHeader, LoadingScreen
} from "./MobileLayout";

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --sb:#2d1b69; --accent:#7c5cbf; --accent2:#a78bfa;
    --bg:#f4f3f8; --surface:#fff; --border:#e5e7eb;
    --ink:#111827; --ink2:#374151; --ink3:#6b7280; --ink4:#9ca3af;
    --green:#059669; --gbg:#ecfdf5; --gborder:#a7f3d0;
    --red:#dc2626;   --rbg:#fef2f2; --rborder:#fecaca;
    --amber:#d97706; --abg:#fffbeb; --aborder:#fde68a;
    --blue:#2563eb;  --bbg:#eff6ff; --bborder:#bfdbfe;
    --purple:#7c3aed;--pbg:#f5f3ff; --pborder:#ddd6fe;
    --nav-h:64px;
  }
  html,body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .fade{animation:fadeUp .25s ease both;}
  .slink{transition:background .15s,color .15s;cursor:pointer}
  .slink:hover{background:rgba(255,255,255,.09)!important;color:#fff!important}
  .slink.active{background:rgba(255,255,255,.16)!important;color:#fff!important}
  .chip-btn{transition:all .15s;cursor:pointer;border:none;font-family:inherit;}
  .pulse{animation:pulse 2s infinite;}

  /* ── Sidebar (desktop) ── */
  .sidebar{width:210px;flex-shrink:0;background:var(--sb);display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow:hidden;}

  /* ── Responsive ── */
  @media(max-width:900px){
    .sidebar{display:none!important;}
    .desk-hdr{display:none!important;}
    .mob-only{display:flex!important;}
    .det-page{padding:10px 12px calc(var(--nav-h) + 12px)!important;}
    .summary-row{grid-template-columns:1fr 1fr 1fr!important;}
    .txn-card{padding:10px 12px!important;}
    .filter-grid{grid-template-columns:1fr!important;}
  }
  @media(min-width:901px){
    .mob-only{display:none!important;}
    .desk-hdr{display:flex!important;}
  }
`;

function injectCSS() {
  if (typeof document==="undefined"||document.getElementById("__det3__")) return;
  const s=document.createElement("style"); s.id="__det3__"; s.textContent=CSS;
  document.head.appendChild(s);
  injectMobileCSS();
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmtDate = ds => {
  const s = ds.endsWith("Z")||ds.includes("+") ? ds : ds+"Z";
  return new Date(s).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hour12:true});
};

const CREDIT_SOURCE_EMOJI={Salary:"💼",Refund:"↩️",Cashback:"🎁","UPI Received":"📲",Other:"💰"};

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

/* ─── Desktop Sidebar ─────────────────────────────────────────────────────── */
function Sidebar({onLogout,pendingCount}) {
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
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:7,color:"rgba(255,255,255,.65)",fontSize:13,textDecoration:"none",marginBottom:1}}>
                <span style={{display:"flex",alignItems:"center",gap:9}}><Icon d={ICONS[it.icon]} size={14}/>{it.label}</span>
                {it.to==="/detected-transactions"&&pendingCount>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,borderRadius:99,padding:"1px 6px"}}>{pendingCount}</span>}
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

/* ─── Compact Summary Bar ─────────────────────────────────────────────────── */
function SummaryBar({pending}) {
  const totalDebit  = pending.filter(t=>t.transaction_type!=="credit").reduce((s,t)=>s+t.amount,0);
  const totalCredit = pending.filter(t=>t.transaction_type==="credit").reduce((s,t)=>s+t.amount,0);
  const debitCount  = pending.filter(t=>t.transaction_type!=="credit").length;
  const creditCount = pending.filter(t=>t.transaction_type==="credit").length;

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}} className="summary-row">
      {[
        {label:"Pending",   value:pending.length,          sub:"total",             bg:"var(--pbg)",  color:"var(--purple)", bdr:"var(--pborder)"},
        {label:"Expenses",  value:`₹${fmt(totalDebit)}`,   sub:`${debitCount} debits`,   bg:"var(--rbg)",  color:"var(--red)",    bdr:"var(--rborder)"},
        {label:"Income",    value:`₹${fmt(totalCredit)}`,  sub:`${creditCount} credits`, bg:"var(--gbg)",  color:"var(--green)",  bdr:"var(--gborder)"},
      ].map((s,i)=>(
        <div key={i} style={{background:s.bg,border:`1px solid ${s.bdr}`,borderRadius:10,padding:"9px 11px"}}>
          <div style={{fontSize:10,fontWeight:700,color:s.color,textTransform:"uppercase",letterSpacing:".4px",marginBottom:2}}>{s.label}</div>
          <div style={{fontSize:15,fontWeight:800,color:s.color,lineHeight:1.1,fontFamily:"'Sora',sans-serif"}}>{s.value}</div>
          <div style={{fontSize:10,color:s.color,opacity:.65,marginTop:2}}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Compact Transaction Card (mobile-first) ─────────────────────────────── */
function TxnCard({txn,onAccept,onIgnore,accepting,ignoring}) {
  const isCredit = txn.transaction_type==="credit";
  const busy     = accepting||ignoring;
  const isTransfer = isCredit && (txn.category_guess==="Transfer");
  const isRefund   = isCredit && (txn.category_guess==="Refund" || txn.credit_source==="Refund");
  const isCashback = isCredit && (txn.category_guess==="Cashback" || txn.credit_source==="Cashback");
  const col = !isCredit?"var(--red)":isTransfer?"var(--blue)":isRefund||isCashback?"var(--amber)":"var(--green)";
  const bg  = !isCredit?"var(--rbg)":isTransfer?"var(--bbg)":isRefund||isCashback?"var(--abg)":"var(--gbg)";
  const bdr = !isCredit?"var(--rborder)":isTransfer?"var(--bborder)":isRefund||isCashback?"var(--aborder)":"var(--gborder)";
  // For credits: if category_guess is Transfer/Refund/Cashback, use that emoji; else use credit_source emoji
  const resolvedCreditCat = txn.category_guess && ["Transfer","Refund","Cashback","Salary","Income"].includes(txn.category_guess)
    ? txn.category_guess : null;
  const emoji = isCredit
    ? (CAT_EMOJI[resolvedCreditCat] || CREDIT_SOURCE_EMOJI[txn.credit_source] || "💰")
    : (CAT_EMOJI[txn.category_guess] || "💸");

  return (
    <div className="fade txn-card" style={{
      background:"var(--surface)",borderRadius:12,
      padding:"12px 14px",
      border:`1px solid var(--border)`,
      borderLeft:`3px solid ${col}`,
      boxShadow:"0 1px 4px rgba(0,0,0,.04)",
      marginBottom:8,
    }}>
      {/* Top row: emoji + amount + type badge + date */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
        {/* Small icon */}
        <div style={{width:34,height:34,borderRadius:9,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
          {emoji}
        </div>

        <div style={{flex:1,minWidth:0}}>
          {/* Amount + badge on one line */}
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontSize:15,fontWeight:800,color:col,fontFamily:"'Sora',sans-serif",letterSpacing:"-.3px"}}>
              {isCredit?"+":"-"}₹{fmt(txn.amount)}
            </span>
            <span style={{padding:"1px 6px",borderRadius:99,fontSize:10,fontWeight:700,background:bg,color:col,border:`1px solid ${bdr}`,lineHeight:1.5}}>
              {isCredit?"CREDIT":"DEBIT"}
            </span>
            {isCredit&&txn.credit_source&&(
              <span style={{padding:"1px 6px",borderRadius:99,fontSize:10,fontWeight:600,background:"var(--pbg)",color:"var(--purple)",border:"1px solid var(--pborder)",lineHeight:1.5}}>
                {txn.credit_source}
              </span>
            )}
          </div>
          {/* Merchant + category + date on one compact line */}
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:600,color:"var(--ink2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:140}}>
              {isCredit?txn.merchant||"Unknown":(txn.merchant||"Unknown")}
            </span>
            <span style={{fontSize:10,color:"var(--ink4)"}}>·</span>
            <span style={{fontSize:10,color:"var(--ink4)"}}>
              {isCredit
                ?(txn.category_guess&&txn.category_guess!=="Income"
                  ?txn.category_guess
                  :(txn.credit_source||"Income"))
                :(txn.category_guess||"Other")}
            </span>
            <span style={{fontSize:10,color:"var(--ink4)"}}>·</span>
            <span style={{fontSize:10,color:"var(--ink4)"}}>{fmtDate(txn.transaction_date)}</span>
          </div>
        </div>
      </div>

      {/* Bottom row: action buttons — compact side by side */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        <button
          onClick={()=>onAccept(txn.sms_hash,txn)}
          disabled={busy}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,
            padding:"8px 0",borderRadius:8,border:"none",
            background:busy?"#f3f4f6":"var(--green)",
            color:busy?"var(--ink4)":"#fff",
            fontSize:12,fontWeight:700,cursor:busy?"not-allowed":"pointer",
            fontFamily:"inherit",transition:"opacity .15s"}}>
          {accepting
            ? <span style={{display:"inline-block",animation:"spin .7s linear infinite",width:12,height:12}}><Icon d={ICONS.refresh} size={12}/></span>
            : <Icon d={ICONS.check} size={12}/>}
          {accepting?"Adding…":isCredit?"Add Income":"Add Expense"}
        </button>
        <button
          onClick={()=>onIgnore(txn.sms_hash)}
          disabled={busy}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,
            padding:"8px 0",borderRadius:8,
            border:"1px solid var(--border)",
            background:busy?"#f3f4f6":"var(--surface)",
            color:busy?"var(--ink4)":"var(--ink3)",
            fontSize:12,fontWeight:600,cursor:busy?"not-allowed":"pointer",
            fontFamily:"inherit",transition:"opacity .15s"}}>
          {ignoring
            ? <span style={{display:"inline-block",animation:"spin .7s linear infinite"}}><Icon d={ICONS.refresh} size={12}/></span>
            : <Icon d={ICONS.x} size={12}/>}
          {ignoring?"Ignoring…":"Ignore"}
        </button>
      </div>
    </div>
  );
}

/* ─── Desktop Transaction Row (unchanged) ────────────────────────────────── */
function TxnRow({txn,onAccept,onIgnore,accepting,ignoring}) {
  const isCredit = txn.transaction_type==="credit";
  const busy     = accepting||ignoring;
  const isTransferR = isCredit && (txn.category_guess==="Transfer");
  const isRefundR   = isCredit && (txn.category_guess==="Refund"   || txn.credit_source==="Refund");
  const isCashbackR = isCredit && (txn.category_guess==="Cashback" || txn.credit_source==="Cashback");
  const col = !isCredit?"var(--red)":isTransferR?"var(--blue)":isRefundR||isCashbackR?"var(--amber)":"var(--green)";
  const bg  = !isCredit?"var(--rbg)":isTransferR?"var(--bbg)":isRefundR||isCashbackR?"var(--abg)":"var(--gbg)";
  const bdr = !isCredit?"var(--rborder)":isTransferR?"var(--bborder)":isRefundR||isCashbackR?"var(--aborder)":"var(--gborder)";
  const resolvedCreditCatR = txn.category_guess && ["Transfer","Refund","Cashback","Salary","Income"].includes(txn.category_guess)
    ? txn.category_guess : null;
  const emoji = isCredit
    ? (CAT_EMOJI[resolvedCreditCatR] || CREDIT_SOURCE_EMOJI[txn.credit_source] || "💰")
    : (CAT_EMOJI[txn.category_guess] || "💸");

  return (
    <div className="fade" style={{display:"flex",alignItems:"center",gap:14,background:"var(--surface)",borderRadius:10,padding:"14px 18px",border:`1px solid var(--border)`,borderLeft:`4px solid ${col}`,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
      <div style={{width:42,height:42,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{emoji}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
          <span style={{fontSize:16,fontWeight:700,color:"var(--ink)",fontFamily:"'Sora',sans-serif"}}>{isCredit?"+":"-"}₹{fmt(txn.amount)}</span>
          <span style={{padding:"2px 7px",borderRadius:99,fontSize:10,fontWeight:700,background:bg,color:col,border:`1px solid ${bdr}`}}>{isCredit?"CREDIT":"DEBIT"}</span>
          {isCredit&&txn.credit_source&&<span style={{padding:"2px 7px",borderRadius:99,fontSize:10,fontWeight:600,background:"var(--pbg)",color:"var(--purple)",border:"1px solid var(--pborder)"}}>{txn.credit_source}</span>}
        </div>
        <div style={{fontSize:13,color:"var(--ink2)",fontWeight:500}}>{isCredit?`From: ${txn.merchant||"Unknown"}`:(txn.merchant||"Unknown merchant")}</div>
        <div style={{display:"flex",gap:12,marginTop:3}}>
          <span style={{fontSize:11,color:"var(--ink4)"}}>
            {isCredit
              ?(txn.category_guess&&txn.category_guess!=="Income"
                ?txn.category_guess
                :(txn.credit_source||"Income"))
              :(txn.category_guess||"Other")}
          </span>
          <span style={{fontSize:11,color:"var(--ink4)"}}>{fmtDate(txn.transaction_date)}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:7,flexShrink:0}}>
        <button onClick={()=>onAccept(txn.sms_hash,txn)} disabled={busy}
          style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:7,border:"none",background:busy?"#f3f4f6":"var(--green)",color:busy?"var(--ink4)":"#fff",fontSize:12,fontWeight:600,cursor:busy?"not-allowed":"pointer",fontFamily:"inherit"}}>
          {accepting?<span style={{display:"inline-block",animation:"spin .7s linear infinite",width:13,height:13}}><Icon d={ICONS.refresh} size={12}/></span>:<Icon d={ICONS.check} size={12}/>}
          {accepting?"…":isCredit?"Add to Income":"Add Expense"}
        </button>
        <button onClick={()=>onIgnore(txn.sms_hash)} disabled={busy}
          style={{display:"flex",alignItems:"center",gap:5,padding:"7px 11px",borderRadius:7,border:"1px solid var(--border)",background:busy?"#f3f4f6":"var(--surface)",color:busy?"var(--ink4)":"var(--ink3)",fontSize:12,fontWeight:600,cursor:busy?"not-allowed":"pointer",fontFamily:"inherit"}}>
          {ignoring?<span style={{display:"inline-block",animation:"spin .7s linear infinite"}}><Icon d={ICONS.refresh} size={12}/></span>:<Icon d={ICONS.x} size={12}/>}
          {ignoring?"…":"Ignore"}
        </button>
      </div>
    </div>
  );
}

/* ─── Compact Filter Bar ──────────────────────────────────────────────────── */
function FilterBar({filters,onChange,counts}) {
  const chip=(active)=>({
    padding:"5px 11px",borderRadius:99,fontSize:11,fontWeight:600,
    background:active?"var(--accent)":"var(--surface)",
    color:active?"#fff":"var(--ink3)",
    border:active?"none":"1px solid var(--border)",
    cursor:"pointer",fontFamily:"inherit",
  });

  const typeOpts=[
    {value:"all",   label:"All",       count:counts.all},
    {value:"debit", label:"💸 Debits",  count:counts.debit},
    {value:"credit",label:"💰 Credits", count:counts.credit},
  ];
  const amtOpts=[
    {value:"all",   label:"Any"},
    {value:"small", label:"<₹500"},
    {value:"medium",label:"₹500–2K"},
    {value:"large", label:">₹2K"},
  ];
  const dateOpts=[
    {value:"all",  label:"All time"},
    {value:"today",label:"Today"},
    {value:"week", label:"This week"},
    {value:"month",label:"This month"},
  ];
  const catOpts=["All","Food","Groceries","Shopping","Travel","Entertainment","Bills","Medicine","Education","Finance","Transfer","Income","Refund","Cashback","Salary","Other"];

  return (
    <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
        <Icon d={ICONS.filter} size={13} color="var(--ink3)"/>
        <span style={{fontSize:12,fontWeight:700,color:"var(--ink2)"}}>Filters</span>
        {(filters.type!=="all"||filters.amount!=="all"||filters.category!=="All"||filters.date!=="all")&&(
          <button onClick={()=>onChange({type:"all",amount:"all",category:"All",date:"all"})}
            style={{marginLeft:"auto",fontSize:11,color:"var(--accent)",background:"none",border:"none",cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>
            Clear ✕
          </button>
        )}
      </div>

      {/* Type */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:5}}>Type</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {typeOpts.map(o=>(
            <button key={o.value} className="chip-btn" style={chip(filters.type===o.value)} onClick={()=>onChange({...filters,type:o.value})}>
              {o.label}{o.count>0&&<span style={{marginLeft:4,opacity:.7}}>({o.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Amount + Date on one row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8}} className="filter-grid">
        <div>
          <div style={{fontSize:10,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:5}}>Amount</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {amtOpts.map(o=>(
              <button key={o.value} className="chip-btn" style={chip(filters.amount===o.value)} onClick={()=>onChange({...filters,amount:o.value})}>{o.label}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:5}}>Date</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {dateOpts.map(o=>(
              <button key={o.value} className="chip-btn" style={chip(filters.date===o.value)} onClick={()=>onChange({...filters,date:o.value})}>{o.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Category */}
      {filters.type!=="credit"&&(
        <div>
          <div style={{fontSize:10,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:5}}>Category</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {catOpts.map(c=>(
              <button key={c} className="chip-btn" style={chip(filters.category===c)} onClick={()=>onChange({...filters,category:c})}>
                {CAT_EMOJI[c]||""} {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Re-scan Banner ──────────────────────────────────────────────────────── */
function RescanBanner({unknownCount, onRescan, rescanState}) {
  const {running, pct, fixed, newCount, statusMsg, done} = rescanState;
  if (unknownCount===0 && !running && !done) return null;

  return (
    <div className="fade" style={{
      marginBottom:10, padding:"12px 14px", borderRadius:10,
      background:done?"var(--gbg)":running?"var(--bbg)":"var(--abg)",
      border:`1px solid ${done?"var(--gborder)":running?"var(--bborder)":"var(--aborder)"}`,
    }}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
        <div style={{flex:1,minWidth:0}}>
          {!running && !done && (
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--amber)",marginBottom:2}}>
                ⚠️ {unknownCount} transaction{unknownCount!==1?"s":""} have UNKNOWN merchant
              </div>
              <div style={{fontSize:11,color:"var(--ink3)"}}>
                These were saved by old code. Tap Re-parse to fix them automatically using the new parser.
              </div>
            </div>
          )}
          {running && (
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--blue)",marginBottom:4}}>
                🔄 Re-parsing SMS history…
              </div>
              <div style={{fontSize:11,color:"var(--ink3)",marginBottom:6}}>{statusMsg||"Working…"}</div>
              <div style={{height:6,borderRadius:99,background:"rgba(37,99,235,.12)",overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,background:"var(--blue)",width:`${pct}%`,transition:"width .4s ease"}}/>
              </div>
            </div>
          )}
          {done && (
            <div style={{fontSize:13,fontWeight:700,color:"var(--green)"}}>
              ✅ Done! Fixed <strong>{fixed}</strong> UNKNOWN records{newCount>0?`, added ${newCount} new`:""}. Pull to refresh.
            </div>
          )}
        </div>
        {!running && !done && (
          <button onClick={onRescan} style={{
            flexShrink:0,padding:"8px 14px",borderRadius:8,background:"var(--amber)",
            border:"none",color:"#fff",fontSize:12,fontWeight:700,
            cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"
          }}>🔧 Re-parse All</button>
        )}
        {running && (
          <div style={{flexShrink:0,fontSize:20,fontWeight:800,color:"var(--blue)",
            fontFamily:"'Sora',sans-serif",minWidth:40,textAlign:"right"}}>
            {pct}%
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function DetectedTransactions() {
  injectCSS();
  const navigate=useNavigate();
  const [pending,    setPending]   =useState([]);
  const [loading,    setLoading]   =useState(true);
  const [error,      setError]     =useState(null);
  const [spinning,   setSpinning]  =useState(false);
  const [accepting,  setAccepting] =useState(null);
  const [ignoring,   setIgnoring]  =useState(null);
  const [toast,      setToast]     =useState(null);
  const [showFilter, setShowFilter]=useState(false);
  const [filters,    setFilters]   =useState({type:"all",amount:"all",category:"All",date:"all"});
  const [rescanState,setRescanState]=useState({running:false,pct:0,fixed:0,newCount:0,statusMsg:"",done:false});

  const API="https://smartspend-backend-aupt.onrender.com";

  useEffect(()=>{load();const iv=setInterval(load,5000);return()=>clearInterval(iv);},[]);

  async function load() {
    const token=localStorage.getItem("token");
    if(!token){navigate("/");return;}
    try {
      const r=await fetch(`${API}/api/detected/pending`,{headers:{Authorization:`Bearer ${token}`}});
      if(r.status===401){localStorage.removeItem("token");navigate("/");return;}
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      setPending(await r.json()); setError(null);
    } catch { setError("Couldn't load. Check your connection."); }
    finally { setLoading(false); setSpinning(false); }
  }

  const filtered=useMemo(()=>{
    let r=[...pending];
    if(filters.type==="debit")  r=r.filter(t=>t.transaction_type!=="credit");
    if(filters.type==="credit") r=r.filter(t=>t.transaction_type==="credit");
    if(filters.amount==="small")  r=r.filter(t=>t.amount<500);
    if(filters.amount==="medium") r=r.filter(t=>t.amount>=500&&t.amount<=2000);
    if(filters.amount==="large")  r=r.filter(t=>t.amount>2000);
    if(filters.category!=="All") r=r.filter(t=>{
      if(t.transaction_type==="credit"){
        const cat = t.category_guess || t.credit_source || "Income";
        return cat === filters.category;
      }
      return (t.category_guess||"Other") === filters.category;
    });
    const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const week=new Date(today);week.setDate(today.getDate()-7);
    const month=new Date(today.getFullYear(),today.getMonth(),1);
    if(filters.date==="today") r=r.filter(t=>new Date(t.transaction_date+"Z")>=today);
    if(filters.date==="week")  r=r.filter(t=>new Date(t.transaction_date+"Z")>=week);
    if(filters.date==="month") r=r.filter(t=>new Date(t.transaction_date+"Z")>=month);
    return r;
  },[pending,filters]);

  const counts=useMemo(()=>({
    all:pending.length,
    debit:pending.filter(t=>t.transaction_type!=="credit").length,
    credit:pending.filter(t=>t.transaction_type==="credit").length,
  }),[pending]);

  const activeFilterCount=[filters.type!=="all",filters.amount!=="all",filters.category!=="All",filters.date!=="all"].filter(Boolean).length;

  function showToast(text,ok){setToast({text,ok});setTimeout(()=>setToast(null),3500);}

  async function handleAccept(smsHash,originalTxn) {
    const token=localStorage.getItem("token");
    const isCredit=originalTxn.transaction_type==="credit";
    setAccepting(smsHash);
    try {
      const r=await fetch(`${API}/api/detected/accept/${smsHash}`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});
      if(!r.ok) throw new Error();
      const result=await r.json();
      const amount=result.amount??originalTxn.amount;
      showToast(isCredit?`₹${fmt(amount)} added to Income 💰`:`₹${fmt(amount)} added as Expense ✓`,true);
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
      showToast("Transaction ignored.",true);
      await load();
    } catch { showToast("Something went wrong. Try again.",false); }
    finally { setIgnoring(null); }
  }

  function logout(){localStorage.removeItem("token");navigate("/");}

  // Count how many pending records have UNKNOWN merchant or Other category
  const unknownCount = useMemo(()=>
    pending.filter(t=>t.merchant==="UNKNOWN"||t.merchant===""||!t.merchant||t.category_guess==="Other"||!t.category_guess).length
  ,[pending]);

  // Re-parse: calls the backend endpoint which triggers FullRescanWorker on the device.
  // Since Android runs the actual worker, we simulate progress on the frontend
  // and poll for changes — the real fix happens on-device via WorkManager.
  async function handleRescan() {
    const token=localStorage.getItem("token");
    if (!token) return;

    setRescanState({running:true,pct:0,fixed:0,newCount:0,statusMsg:"Sending rescan request to device…",done:false});
    showToast("🔄 Re-parse started — check your Android device notifications",true);

    try {
      // Tell the backend to mark all UNKNOWN records for reprocessing
      // The Android app's next WorkManager run will pick these up via the rescan endpoint
      await fetch(`${API}/api/detected/rescan`,{
        method:"POST",
        headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"}
      });
    } catch(_) {}

    // Simulate progress while we wait for the Android worker to fix records
    // We poll the pending list every 3 seconds and compare UNKNOWN counts
    let polls = 0;
    const maxPolls = 40; // 2 min max
    let lastUnknown = unknownCount;
    let totalFixed = 0;

    const pollInterval = setInterval(async ()=>{
      polls++;
      const pct = Math.min(95, Math.round((polls/maxPolls)*95));

      // Reload data
      try {
        const r=await fetch(`${API}/api/detected/pending`,{headers:{Authorization:`Bearer ${token}`}});
        if(r.ok){
          const data=await r.json();
          const nowUnknown=data.filter(t=>t.merchant==="UNKNOWN"||t.merchant===""||!t.merchant).length;
          const fixed=Math.max(0,lastUnknown-nowUnknown);
          totalFixed+=fixed;
          lastUnknown=nowUnknown;
          setPending(data);
          setRescanState(s=>({...s,pct,fixed:totalFixed,
            statusMsg:`Scanning… ${nowUnknown} UNKNOWN remaining · ${totalFixed} fixed so far`}));
        }
      } catch(_){}

      if(polls>=maxPolls){
        clearInterval(pollInterval);
        setRescanState(s=>({...s,running:false,pct:100,done:true,
          statusMsg:"Complete",fixed:totalFixed}));
      }
    },3000);
  }

  if(loading) return <LoadingScreen text="Checking your SMS…"/>;

  /* ── Mobile header right slot ── */
  const MobHeaderRight = (
    <div style={{display:"flex",gap:7,alignItems:"center"}}>
      <button onClick={()=>setShowFilter(f=>!f)}
        style={{width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,.3)",
          background:showFilter?"rgba(255,255,255,.25)":"rgba(255,255,255,.15)",
          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative"}}>
        <Icon d={ICONS.filter} size={16} color="#fff"/>
        {activeFilterCount>0&&<span style={{position:"absolute",top:-3,right:-3,width:14,height:14,borderRadius:"50%",background:"#ef4444",color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{activeFilterCount}</span>}
      </button>
      <button onClick={()=>{setSpinning(true);load();}}
        style={{width:34,height:34,borderRadius:9,border:"1px solid rgba(255,255,255,.3)",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
        <span style={{display:"inline-block",animation:spinning?"spin .7s linear infinite":"none"}}>
          <Icon d={ICONS.refresh} size={16} color="#fff"/>
        </span>
      </button>
    </div>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar onLogout={logout} pendingCount={pending.length}/>
      <BottomNav pendingCount={pending.length}/>

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",bottom:80,left:12,right:12,zIndex:9999,padding:"11px 16px",borderRadius:10,background:toast.ok?"var(--green)":"var(--red)",color:"#fff",fontSize:13,fontWeight:500,boxShadow:"0 8px 24px rgba(0,0,0,.15)",animation:"slideIn .25s ease",textAlign:"center"}}>
          {toast.text}
        </div>
      )}

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>

        {/* Mobile header */}
        <MobileHeader
          title="SMS Detected 📱"
          subtitle={`${pending.length} pending review`}
          right={MobHeaderRight}
        />

        {/* Desktop header */}
        <div className="desk-hdr" style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 28px",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--ink)"}}>SMS Detected 📱</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginTop:2}}>Expenses & income spotted in your SMS — review and confirm</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:11,color:"var(--ink4)",display:"flex",alignItems:"center",gap:5}}>
              <span className="pulse" style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"var(--green)"}}/>Auto-refreshing
            </div>
            <button onClick={()=>setShowFilter(f=>!f)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:7,border:"1px solid var(--border)",background:showFilter?"var(--pbg)":"var(--surface)",color:showFilter?"var(--purple)":"var(--ink2)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",position:"relative"}}>
              <Icon d={ICONS.filter} size={13}/>Filters
              {activeFilterCount>0&&<span style={{position:"absolute",top:-5,right:-5,width:16,height:16,borderRadius:"50%",background:"var(--accent)",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{activeFilterCount}</span>}
            </button>
            <button onClick={()=>{setSpinning(true);load();}}
              style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:7,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--ink2)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
              <span style={{display:"inline-block",animation:spinning?"spin .7s linear infinite":"none"}}><Icon d={ICONS.refresh} size={13}/></span>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Page content ── */}
        <div className="det-page" style={{flex:1,overflowY:"auto",padding:"16px 20px 28px",background:"var(--bg)"}}>

          {error&&(
            <div className="fade" style={{marginBottom:10,padding:"10px 14px",borderRadius:8,background:"var(--rbg)",border:"1px solid var(--rborder)",color:"var(--red)",fontSize:13}}>
              ⚠️ {error}
            </div>
          )}

          <RescanBanner
            unknownCount={unknownCount}
            onRescan={handleRescan}
            rescanState={rescanState}
          />

          {pending.length>0&&<SummaryBar pending={pending}/>}

          {/* Info banner — compact single line */}
          {pending.length>0&&(
            <div className="fade" style={{marginBottom:10,padding:"8px 12px",borderRadius:9,background:"var(--bbg)",border:"1px solid var(--bborder)",display:"flex",alignItems:"center",gap:8}}>
              <Icon d={ICONS.sms} size={14} color="var(--blue)"/>
              <span style={{fontSize:12,color:"var(--blue)"}}>
                <strong>{pending.length} transaction{pending.length>1?"s":""}</strong> detected · 💸 Debits → Expenses · 💰 Credits → Income
              </span>
            </div>
          )}

          {/* Filter panel */}
          {showFilter&&(
            <div className="fade">
              <FilterBar filters={filters} onChange={setFilters} counts={counts}/>
            </div>
          )}

          {/* Filter result count */}
          {showFilter&&filtered.length!==pending.length&&(
            <div style={{marginBottom:8,fontSize:11,color:"var(--ink3)"}}>
              Showing {filtered.length} of {pending.length} transactions
            </div>
          )}

          {/* Empty: all caught up */}
          {pending.length===0&&!error&&(
            <div className="fade" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"48px 20px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{fontSize:36,marginBottom:10}}>✅</div>
              <div style={{fontSize:15,fontWeight:600,color:"var(--ink2)",marginBottom:6}}>You're all caught up!</div>
              <div style={{fontSize:13,color:"var(--ink3)"}}>No SMS payments waiting for review.<br/>New ones appear here automatically.</div>
            </div>
          )}

          {/* Empty filter match */}
          {pending.length>0&&filtered.length===0&&(
            <div className="fade" style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"32px 20px",textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>🔍</div>
              <div style={{fontSize:13,fontWeight:600,color:"var(--ink2)",marginBottom:8}}>No matches for these filters</div>
              <button onClick={()=>setFilters({type:"all",amount:"all",category:"All",date:"all"})}
                style={{padding:"7px 16px",borderRadius:7,background:"var(--accent)",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                Clear filters
              </button>
            </div>
          )}

          {/* ── Mobile card list ── */}
          {filtered.length>0&&(
            <>
              {/* Mobile */}
              <div className="mob-only" style={{flexDirection:"column",gap:0}}>
                {filtered.map(txn=>(
                  <TxnCard
                    key={txn.id}
                    txn={txn}
                    onAccept={handleAccept}
                    onIgnore={handleIgnore}
                    accepting={accepting===txn.sms_hash}
                    ignoring={ignoring===txn.sms_hash}
                  />
                ))}
              </div>

              {/* Desktop */}
              <div style={{display:"flex",flexDirection:"column",gap:10}} className="desk-hdr">
                {filtered.map(txn=>(
                  <TxnRow
                    key={txn.id}
                    txn={txn}
                    onAccept={handleAccept}
                    onIgnore={handleIgnore}
                    accepting={accepting===txn.sms_hash}
                    ignoring={ignoring===txn.sms_hash}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}