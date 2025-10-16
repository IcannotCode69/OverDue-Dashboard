import React from "react";
import { listClasses, listChapters, updateNote } from "./store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function useDebounced(callback, delay){
  const ref = React.useRef();
  React.useEffect(()=>{ ref.current = callback; });
  return React.useCallback((...args)=>{
    if (ref.timer) clearTimeout(ref.timer);
    ref.timer = setTimeout(()=> ref.current?.(...args), delay);
  },[delay]);
}

export default function Editor({ note, onChange, onToggleChat }){
  const [title, setTitle] = React.useState(note?.title || "");
  const [body, setBody] = React.useState(note?.body || "");
  const [savedAt, setSavedAt] = React.useState(note?.updatedAt || "");
  const [preview, setPreview] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const [classId, setClassId] = React.useState(note?.classId || "");
  const [chapterId, setChapterId] = React.useState(note?.chapterId || "");
  const [classes, setClasses] = React.useState([]);
  const [chapters, setChapters] = React.useState([]);

  React.useEffect(()=>{
    setTitle(note?.title || "");
    setBody(note?.body || "");
    setSavedAt(note?.updatedAt || "");
    setClassId(note?.classId || "");
    setChapterId(note?.chapterId || "");
    setClasses(listClasses());
    setChapters(note?.classId? listChapters(note.classId) : []);
    setSaved(false);
  }, [note?.id]);

  const debouncedSave = useDebounced(()=>{
    if (!note) return;
    const updated = updateNote(note.id, { title, body });
    setSavedAt(updated?.updatedAt || new Date().toISOString());
    setSaved(true);
    setTimeout(()=> setSaved(false), 800);
    onChange?.(updated);
  }, 500);

  const onClassChange = (cid)=>{
    setClassId(cid || "");
    const chs = cid? listChapters(cid): [];
    setChapters(chs);
    const newChapter = chs.find(c=> c.id===chapterId) ? chapterId : "";
    setChapterId(newChapter);
    if (note) updateNote(note.id, { classId: cid || undefined, chapterId: newChapter || undefined });
  };
  const onChapterChange = (chid)=>{
    setChapterId(chid || "");
    if (note) updateNote(note.id, { classId, chapterId: chid || undefined });
  };

  const card = { border:`1px solid rgba(var(--notes-border))`, borderRadius:"var(--notes-radius)", background:`rgba(var(--notes-panel))`, boxShadow:"var(--notes-shadow)", height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" };
  const toolbar = { position:"sticky", top:0, zIndex:20, backdropFilter:"blur(8px)", borderBottom:"1px solid rgba(255,255,255,0.1)", padding:"8px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 };
  const titleStyle = { fontSize:"var(--notes-h2)", fontWeight:600, color:"#fff", background:"transparent", border:"none", outline:"none", width:"100%" };
  const iconBtn = { padding:"6px 8px", borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"#fff", cursor:"pointer" };

  return (
    <div style={card}>
      <div style={toolbar}>
        <input aria-label="Title" value={title} onChange={(e)=> { setTitle(e.target.value); debouncedSave(); }} placeholder="Title" style={titleStyle} />
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <select aria-label="Class" value={classId||""} onChange={(e)=> onClassChange(e.target.value || "")} style={{ width:160, background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"6px 8px" }}>
            <option value="" style={{ color:'#000' }}>Unsorted</option>
            {classes.map(c=> <option key={c.id} value={c.id} style={{ color:'#000' }}>{c.name}</option>)}
          </select>
          <select aria-label="Chapter" value={chapterId||""} onChange={(e)=> onChapterChange(e.target.value || "")} style={{ width:160, background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"6px 8px" }}>
            <option value="" style={{ color:'#000' }}>No chapter</option>
            {chapters.map(ch=> <option key={ch.id} value={ch.id} style={{ color:'#000' }}>{ch.name}</option>)}
          </select>
          <button aria-label="Undo" disabled style={iconBtn}>↶</button>
          <button aria-label="Redo" disabled style={iconBtn}>↷</button>
          <button aria-label="History" disabled style={iconBtn}>🕘</button>
          <button aria-label="Preview" onClick={()=> setPreview(v=>!v)} style={iconBtn}>{preview? "✎ Edit" : "👁 Preview"}</button>
          <button aria-label="Save" onClick={()=> note && updateNote(note.id, { title, body })} style={{ ...iconBtn, border:"1px solid rgba(99,102,241,0.4)", background:"rgba(99,102,241,0.15)", color:"#c7d2fe" }}>Save</button>
          {saved && <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>Saved ✓</span>}
          <button aria-label="Toggle chat" onClick={()=> onToggleChat?.()} style={iconBtn}>💬</button>
        </div>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:"12px" }} className="nice-scroll">
        {!preview ? (
          <textarea aria-label="Note body" value={body} onChange={(e)=> { setBody(e.target.value); debouncedSave(); }} placeholder="Write in markdown…" className="mono" style={{ width:"100%", minHeight:360, background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, padding:12, lineHeight:1.75, resize:"vertical" }} />
        ) : (
          <div style={{ color:"#fff", lineHeight:1.75 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body || "_Nothing to preview yet…_"}</ReactMarkdown>
          </div>
        )}
      </div>
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", padding:"8px 12px", fontSize:12, color:"rgba(255,255,255,0.6)" }}>
        Last saved {savedAt ? new Date(savedAt).toLocaleString() : "—"}
      </div>
    </div>
  );
}
