import React from "react";
import { updateNote, deleteNote, listClasses, listChapters, moveNote } from "./store";

const HISTORY_PREFIX = 'od:notes:history:';

function useDebounced(callback, delay){
  const ref = React.useRef();
  React.useEffect(()=>{ ref.current = callback; });
  return React.useCallback((...args)=>{
    if (ref.timer) clearTimeout(ref.timer);
    ref.timer = setTimeout(()=> ref.current?.(...args), delay);
  },[delay]);
}

export default function NoteEditor({ note, onChange }){
  const [title, setTitle] = React.useState(note?.title || "");
  const [body, setBody] = React.useState(note?.body || "");
  const [savedAt, setSavedAt] = React.useState(note?.updatedAt || "");
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [versions, setVersions] = React.useState([]);
  const undoStack = React.useRef([]); const redoStack = React.useRef([]);

  const [classId, setClassId] = React.useState(note?.classId);
  const [chapterId, setChapterId] = React.useState(note?.chapterId);
  const [classes, setClasses] = React.useState([]);
  const [chapters, setChapters] = React.useState([]);

  React.useEffect(()=>{
    setTitle(note?.title || "");
    setBody(note?.body || "");
    setSavedAt(note?.updatedAt || "");
    setClassId(note?.classId);
    setChapterId(note?.chapterId);
    setClasses(listClasses());
    setChapters(note?.classId? listChapters(note.classId): []);
    const h = JSON.parse(localStorage.getItem(HISTORY_PREFIX+note?.id)||'[]');
    setVersions(h);
  },[note?.id]);

  const pushHistory = (data)=>{
    if (!note) return;
    const key = HISTORY_PREFIX+note.id;
    const arr = JSON.parse(localStorage.getItem(key)||'[]');
    arr.unshift({ ts: new Date().toISOString(), title: data.title, body: data.body });
    const trimmed = arr.slice(0,10);
    localStorage.setItem(key, JSON.stringify(trimmed));
    setVersions(trimmed);
  };

  const debouncedSave = useDebounced(()=>{
    if (!note) return;
    const updated = updateNote(note.id, { title, body });
    setSavedAt(updated?.updatedAt || new Date().toISOString());
    pushHistory({ title, body });
    onChange?.(updated);
  }, 500);

  const onTitle = (v)=>{ undoStack.current.push({ title, body }); setTitle(v); debouncedSave(); };
  const onBody = (v)=>{ undoStack.current.push({ title, body }); setBody(v); debouncedSave(); };
  const doUndo = ()=>{ const prev = undoStack.current.pop(); if(prev){ redoStack.current.push({ title, body }); setTitle(prev.title); setBody(prev.body); } };
  const doRedo = ()=>{ const nxt = redoStack.current.pop(); if(nxt){ undoStack.current.push({ title, body }); setTitle(nxt.title); setBody(nxt.body); } };

  const header = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 };
  const iconBtn = { padding:'6px 8px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'#fff', cursor:'pointer' };
  const inputTitle = { width:'100%', background:'transparent', color:'#fff', border:'none', outline:'none', fontSize:22, fontWeight:700 };
  const textArea = { width:'100%', height:420, background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:12, padding:12, resize:'vertical' };

  const onClassChange = (cid)=>{
    setClassId(cid || undefined);
    const chs = cid? listChapters(cid): [];
    setChapters(chs);
    const newChapter = chs.find(c=> c.id===chapterId) ? chapterId : undefined;
    setChapterId(newChapter);
    if (note) moveNote(note.id, { classId: cid || undefined, chapterId: newChapter });
  };
  const onChapterChange = (chid)=>{
    setChapterId(chid || undefined);
    if (note) moveNote(note.id, { classId, chapterId: chid || undefined });
  };

  return (
    <div style={{ border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, background:'rgba(15,23,42,0.6)', padding:0, height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ ...header, position:'sticky', top:0, zIndex:10, backdropFilter:'blur(6px)', background:'rgba(15,23,42,0.6)', padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <input aria-label="Title" value={title} onChange={(e)=> onTitle(e.target.value)} placeholder="Title" style={inputTitle} />
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <select aria-label="Select class" value={classId||''} onChange={(e)=> onClassChange(e.target.value||undefined)} style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'6px 8px' }}>
            <option value="" style={{ color:'#000' }}>Unsorted</option>
            {classes.map(c=> <option key={c.id} value={c.id} style={{ color:'#000' }}>{c.name}</option>)}
          </select>
          <select aria-label="Select chapter" value={chapterId||''} onChange={(e)=> onChapterChange(e.target.value||undefined)} style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'6px 8px' }}>
            <option value="" style={{ color:'#000' }}>No chapter</option>
            {chapters.map(ch=> <option key={ch.id} value={ch.id} style={{ color:'#000' }}>{ch.name}</option>)}
          </select>
          <button aria-label="Undo" onClick={doUndo} style={iconBtn}>↶</button>
          <button aria-label="Redo" onClick={doRedo} style={iconBtn}>↷</button>
          <button aria-label="History" onClick={()=> setHistoryOpen(true)} style={iconBtn}>🕘</button>
          <button aria-label="Save" onClick={()=> note && updateNote(note.id, { title, body })} style={iconBtn}>💾</button>
          <button aria-label="Delete note" onClick={()=> { if(note && confirm(`Delete '${note.title}' permanently? This cannot be undone.`)){ deleteNote(note.id); window.location.href='/notes'; } }} style={{ ...iconBtn, border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.15)', color:'#fecaca' }}>🗑</button>
        </div>
      </div>
      <div style={{ padding:12, flex:1, display:'flex', flexDirection:'column' }}>
        <textarea aria-label="Note body" value={body} onChange={(e)=> onBody(e.target.value)} placeholder="Write in markdown..." style={{ ...textArea, height:'auto', flex:1 }} />
        <div style={{ marginTop:8, fontSize:12, color:'rgba(255,255,255,0.6)' }}>Last saved: {savedAt? new Date(savedAt).toLocaleString(): '—'}</div>
      </div>

      {historyOpen && (
        <div role="dialog" aria-modal style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'rgba(2,6,23,0.98)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, width:420, padding:12 }}>
            <div style={{ color:'#fff', fontWeight:700, marginBottom:8, display:'flex', justifyContent:'space-between' }}>
              <span>History</span>
              <button aria-label="Close history" onClick={()=> setHistoryOpen(false)} style={iconBtn}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:360, overflow:'auto' }}>
              {versions.map((v,idx)=> (
                <button key={idx} onClick={()=> { setTitle(v.title); setBody(v.body); setHistoryOpen(false); }} style={{ textAlign:'left', padding:8, border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, background:'transparent', color:'#fff', cursor:'pointer' }}>
                  {new Date(v.ts).toLocaleString()}
                </button>
              ))}
              {versions.length===0 && <div style={{ color:'rgba(255,255,255,0.6)' }}>No history yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}