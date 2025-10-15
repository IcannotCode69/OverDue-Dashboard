// Deprecated store; Calendar now uses Google Calendar embed. Keeping stub to avoid accidental imports.
export default {};
export function list(){ return []; }
// Key: od:cal:events

const KEY = 'od:cal:events';

function read() { try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } }
function write(v) { localStorage.setItem(KEY, JSON.stringify(v)); }
function uuid() { return (window.crypto?.randomUUID?.() || ('id-' + Math.random().toString(36).slice(2,10))); }

const MIN_GAP = 30; // minutes

function toDate(x){ return (x instanceof Date)? x : new Date(x); }
function iso(d){ return new Date(d).toISOString(); }
function addMinutes(d, m){ const t = new Date(d); t.setMinutes(t.getMinutes()+m); return t; }
function overlaps(aStart,aEnd,bStart,bEnd){ return toDate(aStart) < toDate(bEnd) && toDate(bStart) < toDate(aEnd); }

// Very small RRULE support: FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=YYYYMMDD
function expandRecurrence(rrule, dtStart, range){
  try {
    const parts = Object.fromEntries(rrule.split(';').map(s=>s.split('=')));
    if(parts.FREQ !== 'WEEKLY') return [];
    const byday = (parts.BYDAY || '').split(',');
    const until = parts.UNTIL ? new Date(parts.UNTIL.slice(0,4)+'-'+parts.UNTIL.slice(4,6)+'-'+parts.UNTIL.slice(6,8)+'T23:59:59') : addMinutes(range.end,0);
    const base = new Date(dtStart);
    const dur = (new Date(range.start).getTimezoneOffset(),0) || 0;
    const startHour = base.getHours(), startMin = base.getMinutes();
    const endBase = null;
    const duration = (new Date(base).getTime());
  } catch(e){
    // fallback - no expansion
  }
  const results = [];
  const base = new Date(dtStart);
  const durMs = (new Date(dtStart).getTime());
  const durationMs = 0; // compute below when event given
  // We can't compute without end, so caller provides both start+end event.
  return results;
}

// Range list with basic filtering and simple weekly expansion
export function list(rangeStart, rangeEnd){
  const items = read();
  const rs = toDate(rangeStart), re = toDate(rangeEnd);
  const out = [];
  for(const ev of items){
    const s = toDate(ev.start), e = toDate(ev.end);
    if(!ev.rrule){
      if(overlaps(s,e,rs,re)) out.push(ev);
    } else {
      // Handle simple WEEKLY BYDAY expansion using event's time window
      const parts = Object.fromEntries(ev.rrule.split(';').map(s=>s.split('=')));
      if(parts.FREQ === 'WEEKLY'){
        const by = (parts.BYDAY || '').split(',').filter(Boolean);
        const until = parts.UNTIL ? new Date(parts.UNTIL.slice(0,4)+'-'+parts.UNTIL.slice(4,6)+'-'+parts.UNTIL.slice(6,8)+'T23:59:59') : re;
        const dayMap = {SU:0, MO:1, TU:2, WE:3, TH:4, FR:5, SA:6};
        const dur = toDate(ev.end).getTime() - toDate(ev.start).getTime();
        let cur = new Date(rs);
        cur.setHours(0,0,0,0);
        while(cur <= re && cur <= until){
          const dow = cur.getDay();
          const dowKey = Object.keys(dayMap).find(k=>dayMap[k]===dow);
          if(by.includes(dowKey)){
            const start = new Date(cur); start.setHours(s.getHours(), s.getMinutes(), 0, 0);
            const end = new Date(start.getTime()+dur);
            if(overlaps(start,end,rs,re)) out.push({ ...ev, start: iso(start), end: iso(end) });
          }
          cur.setDate(cur.getDate()+1);
        }
      }
    }
  }
  return out.sort((a,b)=> new Date(a.start)-new Date(b.start));
}

export function add(ev){ const items = read(); const id = uuid(); const withId = { id, userId: 'local', source: ev.source||'local', ...ev }; items.push(withId); write(items); return withId; }
export function update(id, patch){ const items = read().map(e=> e.id===id? { ...e, ...patch }: e); write(items); return items.find(e=>e.id===id); }
export function remove(id){ write(read().filter(e=> e.id!==id)); }

// Convert a task into a scheduled block
export function upsertTaskBlock(taskId, start, end){
  const ev = { id: uuid(), userId:'local', type:'task', title:'Task', start: iso(start), end: iso(end), taskId };
  const items = read(); items.push(ev); write(items); return ev;
}

function dayRange(date){ const d0 = new Date(date); d0.setHours(8,0,0,0); const d1 = new Date(date); d1.setHours(22,0,0,0); return [d0,d1]; }

export function suggestSlot(durationMin, startDate = new Date(), days=7){
  const dur = durationMin;
  const start = new Date(startDate); start.setHours(8,0,0,0);
  for(let day=0; day<days; day++){
    const [d0,d1] = dayRange(addMinutes(start, day*24*60));
    // gather that day's events
    const evs = list(d0,d1).map(e=>({ start: new Date(e.start), end: new Date(e.end) })).sort((a,b)=> a.start-b.start);
    let cursor = new Date(d0);
    for(const ev of evs){
      if((ev.start - cursor)/60000 >= dur && (ev.start - cursor)/60000 >= MIN_GAP){
        return { start: cursor, end: addMinutes(cursor, dur) };
      }
      cursor = new Date(Math.max(cursor, addMinutes(ev.end, MIN_GAP)));
    }
    if(((d1 - cursor)/60000) >= dur) return { start: cursor, end: addMinutes(cursor, dur) };
  }
  return null;
}

export function getAll(){ return read(); }
export function setAll(events){ write(events); }

export default {
  list, add, update, remove, upsertTaskBlock, suggestSlot, getAll, setAll
};
