// Deprecated file, replaced by Google Calendar embed
// Keeping stub to avoid accidental imports
export default function DeprecatedCalendarHeader(){ return null; }

export default function CalendarHeader({ date, setDate, focusMode, setFocusMode, onQuickAdd, onExport, view, setView }){
  const [input, setInput] = React.useState("");

  const nav = (delta) => { const d = new Date(date); d.setDate(d.getDate()+delta); setDate(d); };

  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <button aria-label="Today" onClick={()=> setDate(new Date())} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>Today</button>
        <button aria-label="Previous" onClick={()=> nav(-1)} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>◀</button>
        <button aria-label="Next" onClick={()=> nav(1)} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>▶</button>
        <div style={{ color:'#fff', fontWeight:700, marginLeft:8 }}>{date.toLocaleDateString(undefined,{ month:'long', year:'numeric' })}</div>
        <div style={{ display:'flex', gap:6, marginLeft:12 }}>
          {['Week','Month','Agenda'].map(v=> (
            <button key={v} aria-label={`Switch to ${v}`} onClick={()=> setView(v.toLowerCase())} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background: view===v.toLowerCase()? 'rgba(255,255,255,0.08)':'transparent', color:'#fff', cursor:'pointer' }}>{v}</button>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <input aria-label="Quick add" value={input} onChange={(e)=> setInput(e.target.value)} placeholder="Study CS4920 tomorrow 2–4p" style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'6px 8px', width:280 }} />
        <button aria-label="Add quick" onClick={()=> { onQuickAdd(input); setInput(""); }} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(59,130,246,0.6)', background:'rgba(59,130,246,0.15)', color:'#fff', cursor:'pointer' }}>Add</button>
        <label style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#fff' }}>
          <input aria-label="Toggle focus mode" type="checkbox" checked={focusMode} onChange={(e)=> setFocusMode(e.target.checked)} /> Focus mode
        </label>
        <button aria-label="Export calendar" title="Coming soon" disabled style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.6)', cursor:'not-allowed' }}>Export .ics</button>
      </div>
    </div>
  );
}
