// Deprecated file, replaced by Google Calendar embed
export default function DeprecatedCalendarView(){ return null; }
import { listTasks, tasksDueWithin } from "../data/local";
import store, { add, update, remove, suggestSlot } from "./useCalendarStore";
import { TYPE_COLORS } from "./types";

function hourLabel(h){ const ampm = h>=12? 'PM':'AM'; const hh = ((h+11)%12)+1; return hh+" "+ampm; }

function weekStart(date){ const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day; d.setDate(diff); d.setHours(0,0,0,0); return d; }
function startOfDay(d){ const t=new Date(d); t.setHours(0,0,0,0); return t; }
function endOfDay(d){ const t=new Date(d); t.setHours(23,59,59,999); return t; }

function EventBlock({ ev, dayIndex }){
  const s = new Date(ev.start), e = new Date(ev.end);
  const startMinutes = (s.getHours()-8)*60 + s.getMinutes();
  const dur = (e - s)/60000;
  const top = (startMinutes/ (14*60)) * 100; // 8->22
  const height = (dur / (14*60)) * 100;
  const color = ev.color || TYPE_COLORS[ev.type] || "#93c5fd";
  const dashed = ev.type === 'ai_suggested';
  return (
    <div title={ev.title}
      style={{
        position:'absolute', left:4, right:4, top:`${top}%`, height:`${Math.max(3,height)}%`,
        background: dashed? 'transparent': color+'33',
        border: dashed? `2px dashed ${color}` : `1px solid ${color}88`,
        borderRadius:8, padding:'4px 6px', color:'#fff', overflow:'hidden'
      }}
    >
      <div style={{ fontSize:12, fontWeight:600 }}>{ev.title}</div>
      <div style={{ fontSize:10, opacity:0.8 }}>{s.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} – {e.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
    </div>
  );
}

export default function CalendarView({ date, focusMode, onNewAt, onEdit, view='week', filters={ task:true, event:true, study:true, class:true, ai_suggested:true } }){
  const [events, setEvents] = React.useState(()=> store.list(startOfDay(weekStart(date)), endOfDay(new Date(weekStart(date).getTime()+6*86400000))));

  React.useEffect(()=>{
    const rs = startOfDay(weekStart(date));
    const re = endOfDay(new Date(weekStart(date).getTime()+6*86400000));
    setEvents(store.list(rs,re));
  },[date]);

  const days = Array.from({length:7}, (_,i) => new Date(weekStart(date).getTime()+i*86400000));
  const hours = Array.from({length:15}, (_,i)=> 8+i);

  return (
    <div style={{ position:'relative', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, overflow:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns:'80px repeat(7, 1fr)', background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
        <div />
        {days.map((d,i)=> (
          <div key={i} style={{ padding:'8px 6px', color:'#fff', textAlign:'center' }}>{d.toLocaleDateString(undefined,{weekday:'short', month:'short', day:'numeric'})}</div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'80px repeat(7, 1fr)', height:700, position:'relative' }}>
        {/* Hour labels */}
        <div>
          {hours.map(h=> (
            <div key={h} style={{ height: (700/15)+'px', color:'rgba(255,255,255,0.6)', fontSize:12, borderBottom:'1px dashed rgba(255,255,255,0.06)', paddingLeft:8 }}>{hourLabel(h)}</div>
          ))}
        </div>
        {days.map((d,dayIdx)=> (
          <div key={dayIdx} style={{ position:'relative', borderLeft:'1px solid rgba(255,255,255,0.06)' }}
            onDoubleClick={(e)=>{
              const rect = e.currentTarget.getBoundingClientRect();
              const y = e.clientY - rect.top; const minutes = Math.floor((y/700)* (14*60));
              const start = new Date(d); start.setHours(8,0,0,0); start.setMinutes(start.getMinutes()+minutes);
              const end = new Date(start.getTime()+50*60000);
              onNewAt(start,end);
            }}
          >
            {/* grid lines */}
            {hours.map((h,idx)=> (
              <div key={idx} style={{ position:'absolute', top:(idx*(700/15)), left:0, right:0, height:1, background:'rgba(255,255,255,0.06)' }} />
            ))}
            {/* events */}
            {events.filter(ev=> new Date(ev.start).toDateString()===d.toDateString()).map(ev=> (
              <div key={ev.id} onClick={()=> onEdit(ev)}>
                <EventBlock ev={ev} dayIndex={dayIdx} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
