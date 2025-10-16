function NoteRow({ note, active, onSelect }){
  const [renaming, setRenaming] = React.useState(false);
  const [title, setTitle] = React.useState(note.title);
  const save = ()=> { updateNote(note.id,{ title }); setRenaming(false); };
  const del = ()=> { if(confirm(`Delete '${note.title}' permanently? This cannot be undone.`)){ deleteNote(note.id); window.location.href='/notes'; } };
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <button onClick={onSelect} style={{ flex:1, textAlign:'left', padding:'8px 10px', borderRadius:10, border: active? '1px solid rgba(99,102,241,0.5)':'1px solid transparent', background: active? 'rgba(99,102,241,0.15)':'transparent', color: active? '#c7d2fe':'rgba(255,255,255,0.9)', cursor:'pointer' }}>
        {renaming ? (
          <input value={title} onChange={(e)=> setTitle(e.target.value)} onKeyDown={(e)=> { if(e.key==='Enter') save(); if(e.key==='Escape'){ setRenaming(false); setTitle(note.title);} }} style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'4px 6px', color:'#fff' }} />
        ) : (
          <div style={{ fontWeight: active? 700:500 }}>{note.title}</div>
        )}
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>{new Date(note.updatedAt).toLocaleString()}</div>
      </button>
      <button aria-label="Rename note" onClick={()=> setRenaming(v=>!v)} style={{ fontSize:12, padding:'4px 6px', borderRadius:6, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'#fff' }}>✎</button>
      <button aria-label="Delete note" onClick={del} style={{ fontSize:12, padding:'4px 6px', borderRadius:6, border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.15)', color:'#fecaca' }}>🗑</button>
    </div>
  );
}

import React from "react";
import { listClasses, listChapters, listNotesByClass, listNotesByChapter, createClass, renameClass, deleteClass, createChapter, renameChapter, deleteChapter, createNote, updateNote, deleteNote, moveNote } from "./store";

const COLLAPSE_KEY = 'od:notes:courses:collapsed';
function loadCollapsed(){ try{ return JSON.parse(localStorage.getItem(COLLAPSE_KEY)||'[]'); }catch{ return []; } }
function saveCollapsed(v){ localStorage.setItem(COLLAPSE_KEY, JSON.stringify(v)); }

export default function NoteList({ selectedId, onSelect, onCreate, onFilterChange }){
  const [query, setQuery] = React.useState("");
  const [collapsed, setCollapsed] = React.useState(()=> new Set(loadCollapsed()));
  const [classes, setClasses] = React.useState(()=> listClasses());

  const refresh = ()=> setClasses(listClasses());

  const toggle = (course)=>{
    const next = new Set(collapsed);
    if (next.has(course)) next.delete(course); else next.add(course);
    setCollapsed(next); saveCollapsed([...next]);
  };

  const handleCreate = ()=>{ const n = createNote({ title: "Untitled" }); onCreate?.(n); };

  const focusSearchRef = React.useRef(null);
  const focusSearch = ()=> focusSearchRef.current?.focus();

  const containerStyle = { border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, background:'rgba(15,23,42,0.6)', padding:8 };
  const headerStyle = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 };
  const sectionTitle = { color:'#fff', fontWeight:600 };
  const searchStyle = { width:'100%', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'6px 8px' };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={sectionTitle}>My Classes</div>
        <button aria-label="New note" onClick={handleCreate} style={{ padding:'6px 10px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, background:'transparent', color:'#93c5fd', cursor:'pointer' }}>+ New Note</button>
      </div>
      <input ref={focusSearchRef} aria-label="Search notes" placeholder="Search notes..." value={query} onChange={(e)=> setQuery(e.target.value)} style={searchStyle} />
      <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ display:'flex', gap:8, margin:'4px 0' }}>
          <button aria-label="New class" onClick={()=> { const name=prompt('New class name'); if(name){ createClass(name); refresh(); } }} style={{ padding:'6px 10px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, background:'transparent', color:'#fff' }}>+ New Class</button>
          <button aria-label="New note" onClick={handleCreate} style={{ padding:'6px 10px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, background:'transparent', color:'#fff' }}>+ New Note</button>
        </div>
        {classes.map(cls=>{
          const isCollapsed = collapsed.has(cls.id);
          const classNotes = listNotesByClass(cls.id).filter(n=> n.title.toLowerCase().includes(query.toLowerCase()));
          const chapters = listChapters(cls.id);
          return (
            <div key={cls.id}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 6px', cursor:'pointer', color:'#fff', fontWeight:600, borderLeft:'3px solid rgba(255,255,255,0.08)' }}>
                <div onClick={()=> { toggle(cls.id); onFilterChange?.({ classId: cls.id }); }}>
                  {cls.name} <span style={{ color:'rgba(255,255,255,0.6)', fontWeight:400 }}>({classNotes.length})</span> {isCollapsed? '▸':'▾'}
                </div>
                <div style={{ display:'inline-flex', gap:6 }}>
                  <button aria-label="Add chapter" onClick={()=> { const n=prompt('Chapter name'); if(n){ createChapter(cls.id,n); refresh(); } }} style={{ fontSize:12, padding:'2px 6px', borderRadius:6, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'#fff' }}>+ Chapter</button>
                  <button aria-label="Rename class" onClick={()=> { const n=prompt('Rename class', cls.name); if(n){ renameClass(cls.id,n); refresh(); } }} style={{ fontSize:12, padding:'2px 6px', borderRadius:6, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'#fff' }}>Rename</button>
                  <button aria-label="Delete class" onClick={()=> { if(confirm(`Delete '${cls.name}'? Move notes to Unsorted (OK) or delete notes (Cancel then confirm delete again).`)){ deleteClass(cls.id,{ moveNotesToUnsorted:true }); refresh(); } }} style={{ fontSize:12, padding:'2px 6px', borderRadius:6, border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.15)', color:'#fecaca' }}>Delete</button>
                </div>
              </div>
              {!isCollapsed && (
                <div style={{ display:'flex', flexDirection:'column', gap:6, paddingLeft:6 }}>
                  {chapters.map(ch=>{
                    const chNotes = listNotesByChapter(ch.id).filter(n=> n.title.toLowerCase().includes(query.toLowerCase()));
                    return (
                      <div key={ch.id}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', color:'#cbd5e1', padding:'6px 6px' }}>
                          <div onClick={()=> onFilterChange?.({ classId: cls.id, chapterId: ch.id })} style={{ cursor:'pointer' }}>{ch.name}</div>
                          <div style={{ display:'inline-flex', gap:6 }}>
                            <button aria-label="Rename chapter" onClick={()=> { const n=prompt('Rename chapter', ch.name); if(n){ renameChapter(ch.id,n); refresh(); } }} style={{ fontSize:12, padding:'2px 6px', borderRadius:6, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'#fff' }}>Rename</button>
                            <button aria-label="Delete chapter" onClick={()=> { const move=confirm('Move notes in this chapter to its class? Click OK to move, Cancel to delete notes.'); deleteChapter(ch.id, move? { moveNotesToClass: cls.id }: undefined); refresh(); }} style={{ fontSize:12, padding:'2px 6px', borderRadius:6, border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.15)', color:'#fecaca' }}>Delete</button>
                          </div>
                        </div>
                        {chNotes.map(it=> (
                          <NoteRow key={it.id} note={it} active={it.id===selectedId} onSelect={()=> onSelect(it)} />
                        ))}
                      </div>
                    );
                  })}
                  {classNotes.filter(n=> !n.chapterId).map(it=> (
                    <NoteRow key={it.id} note={it} active={it.id===selectedId} onSelect={()=> onSelect(it)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}