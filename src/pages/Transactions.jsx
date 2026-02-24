import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  injectMobileCSS, fmt, CAT_EMOJI, Icon, ICONS,
  MobilePage, MobileHeader, LoadingScreen, Toast,
} from "./MobileLayout";

const isAutoTx = t => t.is_auto===true||t.is_auto===1||t.is_auto==="true"||t.is_auto==="1";

function fmtDateTime(raw) {
  if (!raw) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    const [y,m,d]=raw.split("-");
    return new Date(+y,+m-1,+d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
  }
  const utc=(raw.endsWith("Z")||raw.includes("+"))?raw:raw.replace(" ","T")+"Z";
  return new Date(utc).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true});
}

function txDate(t) {
  const raw = t.date||(t.created_at||"").slice(0,10);
  return raw?raw.slice(0,10):null;
}

// ── Detail Bottom Sheet ───────────────────────────────────────────────────────
function DetailSheet({ txn, onClose }) {
  if (!txn) return null;
  const auto = isAutoTx(txn);
  const merchant = txn.merchant||txn.merchant_name||txn.description||null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-sheet">
          <div className="drawer-handle" />
          {/* Hero */}
          <div style={{ padding:"16px 20px 14px", textAlign:"center", background:auto?"linear-gradient(135deg,#eff6ff,#dbeafe)":"linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
            <div style={{ fontSize:44, marginBottom:8 }}>{CAT_EMOJI[txn.category]||"💳"}</div>
            <div style={{ fontSize:34, fontWeight:800, color:"var(--ink)", fontFamily:"'Sora',sans-serif", marginBottom:4 }}>₹{fmt(txn.amount)}</div>
            <div style={{ fontSize:13, color:"var(--ink3)" }}>{txn.category}{merchant?` · ${merchant}`:""}</div>
            <span style={{ display:"inline-block", marginTop:8, padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:600, background:auto?"var(--blue-bg)":"var(--amber-bg)", color:auto?"var(--blue)":"var(--amber)" }}>
              {auto?"Auto from SMS":"Manual entry"}
            </span>
          </div>
          {/* Rows */}
          <div style={{ flex:1, overflowY:"auto", padding:"0 20px 20px" }}>
            {[
              ["🏷️","Category", txn.category||"—"],
              ["🏪","Merchant", merchant||"—"],
              ["📅","Date", fmtDateTime(txn.created_at||txn.date)],
              ["🔢","Transaction ID", `#${txn.id}`],
            ].map(([emoji,label,val]) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", borderBottom:"1px solid var(--border)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:18 }}>{emoji}</span>
                  <span style={{ fontSize:13, color:"var(--ink3)" }}>{label}</span>
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:"var(--ink)", maxWidth:180, textAlign:"right", wordBreak:"break-word" }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ padding:"14px 20px", paddingBottom:"max(14px, env(safe-area-inset-bottom))" }}>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Filter Sheet ──────────────────────────────────────────────────────────────
function FilterSheet({ search, setSearch, category, setCategory, dateFrom, setDateFrom, dateTo, setDateTo, onClose, onClear }) {
  const CATEGORIES = ["Food","Bills","Shopping","Entertainment","Travel","Medicine","Groceries","Other"];
  const today = () => new Date().toISOString().slice(0,10);
  const offset = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };

  const PRESETS = [
    {label:"Today",      f:today,      t:today},
    {label:"Last 7d",   f:()=>offset(-6), t:today},
    {label:"This month",f:()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;}, t:today},
  ];

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-sheet">
          <div className="drawer-handle" />
          <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:16, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>Filter Transactions</div>
            <button onClick={onClear} style={{ fontSize:12, color:"var(--red)", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Clear all</button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--ink3)", marginBottom:8 }}>Search</div>
              <input placeholder="Category or merchant…" value={search} onChange={e=>setSearch(e.target.value)} className="inp" style={{ fontSize:14 }} />
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--ink3)", marginBottom:8 }}>Category</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                <button className={`chip${category===""?" active":""}`} onClick={()=>setCategory("")}>All</button>
                {CATEGORIES.map(c=>(
                  <button key={c} className={`chip${category===c?" active":""}`} onClick={()=>setCategory(c)}>{c}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--ink3)", marginBottom:8 }}>Quick Date Range</div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {PRESETS.map(p => (
                  <button key={p.label} className="chip" onClick={()=>{setDateFrom(p.f());setDateTo(p.t());}}>{p.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <div style={{ fontSize:11, color:"var(--ink4)", marginBottom:5, fontWeight:600 }}>FROM</div>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="inp" style={{ fontSize:13 }} />
              </div>
              <div>
                <div style={{ fontSize:11, color:"var(--ink4)", marginBottom:5, fontWeight:600 }}>TO</div>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="inp" style={{ fontSize:13 }} />
              </div>
            </div>
          </div>
          <div style={{ padding:"14px 20px", paddingBottom:"max(14px, env(safe-area-inset-bottom))" }}>
            <button className="btn-primary" onClick={onClose}>Apply Filters</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Transactions() {
  injectMobileCSS();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [all,        setAll]        = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("");
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [lastSync,   setLastSync]   = useState(null);

  const API = "https://smartspend-backend-aupt.onrender.com";

  useEffect(()=>{
    if (!token){navigate("/",{replace:true});return;}
    load();
    const iv=setInterval(load,8000);
    return ()=>clearInterval(iv);
  },[]);

  useEffect(()=>{ applyFilters(); },[search,category,dateFrom,dateTo,all]);

  async function load() {
    try {
      const r=await fetch(`${API}/api/expenses/`,{headers:{Authorization:`Bearer ${token}`}});
      if(!r.ok){localStorage.removeItem("token");navigate("/",{replace:true});return;}
      const data=await r.json();
      data.sort((a,b)=>{
        if(b.id&&a.id&&b.id!==a.id) return b.id-a.id;
        const da=new Date((a.created_at||a.date||"").replace(" ","T")+"Z");
        const db=new Date((b.created_at||b.date||"").replace(" ","T")+"Z");
        return db-da;
      });
      setAll(data);
      setLastSync(new Date());
    } finally { setLoading(false); }
  }

  function applyFilters() {
    let list=[...all];
    if(search) list=list.filter(t=>t.category?.toLowerCase().includes(search.toLowerCase())||t.merchant?.toLowerCase().includes(search.toLowerCase()));
    if(category) list=list.filter(t=>t.category===category);
    if(dateFrom) list=list.filter(t=>{const d=txDate(t);return d&&d>=dateFrom;});
    if(dateTo)   list=list.filter(t=>{const d=txDate(t);return d&&d<=dateTo;});
    setFiltered(list);
  }

  function clearFilters(){setSearch("");setCategory("");setDateFrom("");setDateTo("");}
  function logout(){localStorage.removeItem("token");navigate("/",{replace:true});}

  const hasFilters = search||category||dateFrom||dateTo;
  const totalAmt   = filtered.reduce((s,t)=>s+t.amount,0);
  const autoCount  = filtered.filter(isAutoTx).length;

  if (loading) return <LoadingScreen text="Loading transactions…" />;

  return (
    <MobilePage>
      {selected && <DetailSheet txn={selected} onClose={()=>setSelected(null)} />}
      {showFilter && (
        <FilterSheet
          search={search} setSearch={setSearch}
          category={category} setCategory={setCategory}
          dateFrom={dateFrom} setDateFrom={setDateFrom}
          dateTo={dateTo} setDateTo={setDateTo}
          onClose={()=>setShowFilter(false)}
          onClear={()=>{clearFilters();setShowFilter(false);}}
        />
      )}

      <MobileHeader
        title="Transactions"
        subtitle={`${filtered.length} shown · ₹${fmt(totalAmt)}`}
        right={
          <button onClick={()=>setShowFilter(true)}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:10, border:`1.5px solid ${hasFilters?"var(--brand)":"var(--border)"}`, background:hasFilters?"var(--brand-soft)":"transparent", color:hasFilters?"var(--brand)":"var(--ink3)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            <Icon d={ICONS.cal} size={13} color={hasFilters?"var(--brand)":"var(--ink3)"} />
            {hasFilters?"Filtered":"Filter"}
          </button>
        }
      />

      <div style={{ padding:"12px 16px 0" }}>
        {/* Summary strip */}
        <div className="fu0" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
          {[
            { label:"Total", val:`₹${fmt(totalAmt)}`, col:"var(--brand)" },
            { label:"Auto SMS", val:autoCount, col:"var(--blue)" },
            { label:"Manual", val:filtered.length-autoCount, col:"var(--amber)" },
          ].map(s => (
            <div key={s.label} className="stat-pill" style={{ textAlign:"center", padding:"10px 8px" }}>
              <div style={{ fontSize:15, fontWeight:800, color:s.col, fontFamily:"'Sora',sans-serif" }}>{s.val}</div>
              <div style={{ fontSize:10, color:"var(--ink4)", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Live sync dot */}
        {lastSync && (
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--ink4)", marginBottom:10 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)", display:"inline-block", animation:"pulse 2s infinite" }}/>
            Synced {lastSync.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
          </div>
        )}

        {/* Transactions list */}
        {filtered.length === 0 ? (
          <div className="card" style={{ padding:"40px 16px", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🔍</div>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--ink2)", marginBottom:4 }}>No transactions found</div>
            <div style={{ fontSize:12, color:"var(--ink4)" }}>{hasFilters?"Try changing the filters":"Log your first expense!"}</div>
            {hasFilters && <button onClick={clearFilters} style={{ marginTop:12, padding:"8px 18px", borderRadius:10, background:"var(--brand)", border:"none", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>Clear filters</button>}
          </div>
        ) : (
          <div className="card fu1" style={{ overflow:"hidden" }}>
            {filtered.map((t,i) => {
              const auto     = isAutoTx(t);
              const merchant = t.merchant||t.merchant_name||t.description||null;
              const dateStr  = fmtDateTime(t.created_at||t.date);
              return (
                <div key={t.id||i}
                  onClick={()=>setSelected(t)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderBottom:i<filtered.length-1?"1px solid var(--border)":"none", cursor:"pointer", borderLeft:`3px solid ${auto?"var(--blue)":"transparent"}`, background:"var(--surface)" }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:auto?"var(--blue-bg)":"var(--surface2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:21, flexShrink:0 }}>
                    {CAT_EMOJI[t.category]||"💳"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)" }}>{t.category||"—"}</div>
                    <div style={{ fontSize:11, color:"var(--ink4)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {merchant || dateStr}
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:"var(--ink)", fontFamily:"'Sora',sans-serif" }}>₹{fmt(t.amount)}</div>
                    <div style={{ fontSize:10, marginTop:1 }}>
                      <span className="badge" style={{ background:auto?"var(--blue-bg)":"var(--amber-bg)", color:auto?"var(--blue)":"var(--amber)", fontSize:9 }}>
                        {auto?"Auto":"Manual"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign:"center", marginTop:12, marginBottom:4, fontSize:11, color:"var(--ink4)" }}>
          Tap any transaction for full details
        </div>
      </div>
    </MobilePage>
  );
}