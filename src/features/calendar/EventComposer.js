// Deprecated file, replaced by Google Calendar embed
export default function DeprecatedEventComposer(){ return null; }
import { add, update, remove } from "./useCalendarStore";

export default function EventComposer({ open, initial, onClose, onSaved, onDeleted }){
  const [title, setTitle] = React.useState(initial?.title || "");
  const [type, setType] = React.useState(initial?.type || "event");
  const [start, setStart] = React.useState(()=> (initial? new Date(initial.start).toISOString().slice(0,16) : new Date().toISOString().slice(0,16)));
  const [end, setEnd] = React.useState(()=> (initial? new Date(initial.end).toISOString().slice(0,16) : new Date(Date.now()+50*60000).toISOString().slice(0,16)));

  React.useEffect(()=>{
    if(open){
      setTitle(initial?.title || "");
      setType(initial?.type || "event");
      setStart(initial? new Date(initial.start).toISOString().slice(0,16) : new Date().toISOString().slice(0,16));
      setEnd(initial? new Date(initial.end).toISOString().slice(0,16) : new Date(Date.now()+50*60000).toISOString().slice(0,16));
    }
  },[open, initial]);

  if(!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Compose event" style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'rgba(2,6,23,0.98)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, width:420, padding:12 }}>
        <div style={{ color:'#fff', fontWeight:700, marginBottom:8 }}>{initial? 'Edit':'New'} Item</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <input aria-label="Title" placeholder="Title" value={title} onChange={(e)=> setTitle(e.target.value)} style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'6px 8px' }} />
          <select aria-label="Type" value={type} onChange={(e)=> setType(e.target.value)} style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'6px 8px' }}>
            {['event','task','study','class','ai_suggested'].map(t=> <option key={t} value={t} style={{ color:'#000' }}>{t}</option>)}
          </select>
          <label style={{ color:'#fff', fontSize:12 }}>Start</label>
          <input aria-label="Start" type="datetime-local" value={start} onChange={(e)=> setStart(e.target.value)} style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'6px 8px' }} />
          <label style={{ color:'#fff', fontSize:12 }}>End</label>
          <input aria-label="End" type="datetime-local" value={end} onChange={(e)=> setEnd(e.target.value)} style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'6px 8px' }} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            {initial && (
              <button aria-label="Delete" onClick={()=> { remove(initial.id); onDeleted?.(initial.id); onClose(); }} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.15)', color:'#fecaca', cursor:'pointer' }}>Delete</button>
            )}
            <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
              <button aria-label="Cancel" onClick={onClose} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>Cancel</button>
              <button aria-label="Save" onClick={()=> {
                if(!title.trim()) return;
                if(initial) { update(initial.id, { title, type, start: new Date(start).toISOString(), end: new Date(end).toISOString() }); onSaved?.(); }
                else { add({ title, type, start: new Date(start).toISOString(), end: new Date(end).toISOString() }); onSaved?.(); }
                onClose();
              }} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid rgba(59,130,246,0.6)', background:'rgba(59,130,246,0.15)', color:'#fff', cursor:'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
