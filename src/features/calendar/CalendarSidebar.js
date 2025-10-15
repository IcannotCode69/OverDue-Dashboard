// Deprecated file, replaced by Google Calendar embed
export default function DeprecatedCalendarSidebar(){ return null; }
import { suggestSlot, add, update, remove } from "./useCalendarStore";
import { TYPE_COLORS } from "./types";
import { listTasks, tasksDueWithin } from "../data/local";

export default function CalendarSidebar({ date, onCreateBlock, filters, setFilters }){
  const [tasks, setTasks] = React.useState([]);

  React.useEffect(()=>{
    try{ setTasks(tasksDueWithin(7)); } catch { setTasks([]); }
  },[date]);

  const schedule = async (minutes) => {
    const slot = suggestSlot(minutes, new Date(date), 7);
    if(!slot){ console.info("No free slot available"); return; }
    onCreateBlock({ title: `Focus ${minutes}m`, type: 'study', start: slot.start, end: slot.end });
  };

  return (
    <div className="nice-scroll" style={{ overflow:'auto', padding:12, border:'1px solid rgba(255,255,255,0.1)', borderRadius:12 }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ color:'#fff', fontWeight:600, marginBottom:6 }}>Today</div>
        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>{new Date().toLocaleString()}</div>
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          <button aria-label="Add 25 minute focus block" onClick={()=> schedule(25)} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>+ 25m Focus</button>
          <button aria-label="Add 50 minute focus block" onClick={()=> schedule(50)} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>+ 50m Focus</button>
        </div>
      </div>

      <div style={{ marginTop:12 }}>
        <div style={{ color:'#fff', fontWeight:600, marginBottom:6 }}>Tasks to Schedule</div>
        <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:8 }}>
          {tasks.map(t => (
            <li key={t.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ color:'#fff', fontSize:14 }}>{t.title}</div>
                <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12 }}>{new Date(t.due).toDateString()}</div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button aria-label="Schedule 25 minutes" onClick={()=>{ const slot = suggestSlot(25, date); if(slot) onCreateBlock({ title: t.title, type:'task', start: slot.start, end: slot.end }); }} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>25m</button>
                <button aria-label="Schedule 50 minutes" onClick={()=>{ const slot = suggestSlot(50, date); if(slot) onCreateBlock({ title: t.title, type:'task', start: slot.start, end: slot.end }); }} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>50m</button>
                <button aria-label="Schedule 90 minutes" onClick={()=>{ const slot = suggestSlot(90, date); if(slot) onCreateBlock({ title: t.title, type:'task', start: slot.start, end: slot.end }); }} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>90m</button>
              </div>
            </li>
          ))}
          {tasks.length===0 && <li style={{ color:'rgba(255,255,255,0.7)' }}>No upcoming tasks.</li>}
        </ul>
      </div>

      <div style={{ marginTop:16 }}>
        <div style={{ color:'#fff', fontWeight:600, marginBottom:6 }}>Filters & Legend</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:12 }}>
          {Object.entries({task:'#60A5FA',event:'#2DD4BF',study:'#A78BFA',class:'#F59E0B',ai_suggested:'#A78BFA'}).map(([label,color])=> (
            <label key={label} style={{ display:'flex', alignItems:'center', gap:8, color:'#fff', cursor:'pointer' }}>
              <input type="checkbox" checked={filters[label] !== false} onChange={(e)=> setFilters({ ...filters, [label]: e.target.checked })} />
              <span style={{ width:10, height:10, background: color+'66', border:'1px solid '+color, borderRadius:2 }} /> {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
