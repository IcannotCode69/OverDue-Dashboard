import React from "react";
import DashboardGrid from "../features/dashboard/DashboardGrid";

export default function DashboardPage() {
  const PREF_KEY = 'od:demoWidgetsEnabled';
  const [showDemo, setShowDemo] = React.useState(() => {
    try { const raw = localStorage.getItem(PREF_KEY); return raw ? JSON.parse(raw) : true; } catch { return true; }
  });
  React.useEffect(()=>{ try{ localStorage.setItem(PREF_KEY, JSON.stringify(showDemo)); }catch{} }, [showDemo]);
  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
      >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 600,
            margin: 0,
            color: "white",
          }}
        >
          Dashboard
        </h1>
        <button
          onClick={()=> setShowDemo(v=> !v)}
          style={{ height:32, borderRadius:8, padding:'0 10px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.06)', color:'#e8ecff' }}
        >
          {showDemo ? 'Hide demo widgets' : 'Show demo widgets'}
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <DashboardGrid showDemoWidgets={showDemo} />
      </div>
    </div>
  );
}
