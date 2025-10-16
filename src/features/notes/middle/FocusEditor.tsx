// @ts-nocheck
import React from "react";
import { getNote, updateNote, createNote, deleteNote, listClasses, listChapters } from "../store";
import EditorHeader from "./EditorHeader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

export default function FocusEditor({ noteId, classId, onBack, onToggleChat }){
  const [note, setNote] = React.useState(()=> getNote(noteId));
  const [title, setTitle] = React.useState(note?.title || "");
  const [body, setBody] = React.useState(note?.body || "");
  const [savedAt, setSavedAt] = React.useState(note?.updatedAt || "");
  const [preview, setPreview] = React.useState(false);

  React.useEffect(()=>{
    const n = getNote(noteId); setNote(n); setTitle(n?.title||""); setBody(n?.body||""); setSavedAt(n?.updatedAt||"");
  }, [noteId]);

  React.useEffect(()=>{
    const onKey = (e)=>{
      if (e.key === 'Escape') { onBack?.(); }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s') { e.preventDefault(); if(note) doSave(); }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='n') { e.preventDefault(); doAdd(); }
    };
    window.addEventListener('keydown', onKey); return ()=> window.removeEventListener('keydown', onKey);
  }, [note, title, body]);

  function doSave(){ if(!note) return; const u = updateNote(note.id, { title, body }); setSavedAt(u.updatedAt); setNote(u); }
  function doAdd(){ const n = createNote({ classId, title: 'Untitled' }); setNote(n); setTitle(n.title); setBody(n.body||""); const u = new URL(window.location.href); u.searchParams.set('id', n.id); window.history.replaceState(null,'',u.toString()); }
  function doDelete(){ if(!note) return; deleteNote(note.id); onBack?.(); }

  const card = { border:`1px solid rgba(var(--notes-border))`, borderRadius:"var(--notes-radius)", background:`rgba(var(--notes-panel))`, boxShadow:"var(--notes-shadow)", height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" };

  return (
    <motion.div initial={{ opacity:0, scale:.99 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} transition={{ duration:.22, ease:'easeOut' }} style={card}>
      <EditorHeader
        title={title}
        setTitle={setTitle}
        onBack={onBack}
        onAdd={doAdd}
        onDelete={doDelete}
        onSave={doSave}
      />
      <div style={{ flex:1, overflow:'auto', padding:'12px' }} className="nice-scroll">
        {!preview ? (
          <textarea aria-label="Note body" value={body} onChange={(e)=> setBody(e.target.value)} placeholder="Write in markdown…" className="mono" style={{ width:"100%", minHeight:360, background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, padding:12, lineHeight:1.75, resize:"vertical" }} />
        ) : (
          <div style={{ color:'#fff', lineHeight:1.75 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body || "_Nothing to preview yet…_"}</ReactMarkdown>
          </div>
        )}
      </div>
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", padding:"8px 12px", fontSize:12, color:"rgba(255,255,255,0.6)" }}>
        Last saved {savedAt ? new Date(savedAt).toLocaleString() : "—"}
      </div>
    </motion.div>
  );
}
