import React from "react";
import {
  listClasses,
  listChapters,
  listNotesByClass,
  listNotesByChapter,
  createClass,
  renameClass,
  deleteClass,
  createChapter,
  renameChapter,
  deleteChapter,
  createNote,
  updateNote,
  deleteNote,
  getNote,
} from "./store";
import Kebab from "./components/Kebab";
import InlineRename from "./components/InlineRename";
import Confirm from "./components/Confirm";
import MoveNote from "./components/MoveNote";

const COLLAPSE_KEY = "od:notes:collapsed";
const loadCollapsed = () => {
  try { return new Set(JSON.parse(localStorage.getItem(COLLAPSE_KEY) || "[]")); } catch { return new Set(); }
};
const saveCollapsed = (set) => localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...set]));

export default function SidebarTree({ selectedId, onSelect, onCreate, onFilterChange }) {
  const [q, setQ] = React.useState("");
  const [collapsed, setCollapsed] = React.useState(loadCollapsed);
  const [classes, setClasses] = React.useState(listClasses);
  const [confirm, setConfirm] = React.useState({ open:false });
  const [moveNote, setMoveNote] = React.useState({ open:false, noteId:null });
  const refresh = () => setClasses(listClasses());

  const toggle = (id) => {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCollapsed(next); saveCollapsed(next);
  };

  const handleNewClass = () => {
    const name = prompt("New class name");
    if (name) { createClass(name); refresh(); }
  };
  const handleNewNote = () => {
    const n = createNote({ title: "Untitled" });
    onCreate?.(n);
  };

  const container = { border:`1px solid rgba(var(--notes-border))`, borderRadius:"var(--notes-radius)", background:`rgba(var(--notes-panel))`, boxShadow:"var(--notes-shadow)", padding:8, height:"100%", overflow:"hidden", display:"flex", flexDirection:"column" };

  // Build pseudo Unsorted class if needed
  const unsorted = listNotesByClass(undefined).filter(n => n.title.toLowerCase().includes(q.toLowerCase()));
  const allClasses = [ ...(unsorted.length? [{ id:"__unsorted__", name:"Unsorted", order:-1 }]: []), ...classes ];

  // Keyboard navigation state (flat list of focusable row keys)
  const rowKeys = [];
  allClasses.forEach(cls => {
    rowKeys.push(`class:${cls.id}`);
    const isCollapsed = collapsed.has(cls.id);
    if (!isCollapsed) {
      // Chapters
      if (cls.id !== "__unsorted__") {
        const chapters = listChapters(cls.id);
        chapters.forEach(ch => {
          rowKeys.push(`chapter:${ch.id}`);
          const chNotes = listNotesByChapter(ch.id).filter(n => n.title.toLowerCase().includes(q.toLowerCase()));
          chNotes.forEach(n => rowKeys.push(`note:${n.id}`));
        });
        const direct = listNotesByClass(cls.id).filter(n => !n.chapterId && n.title.toLowerCase().includes(q.toLowerCase()));
        direct.forEach(n => rowKeys.push(`note:${n.id}`));
      } else {
        unsorted.forEach(n => rowKeys.push(`note:${n.id}`));
      }
    }
  });
  const [focusKey, setFocusKey] = React.useState(rowKeys[0]);
  React.useEffect(()=> { setFocusKey(prev => rowKeys.includes(prev)? prev : rowKeys[0]); /* keep focus valid */ }, [q, classes, collapsed, selectedId]);

  const onKeyDown = (e) => {
    if (!rowKeys.length) return;
    const idx = rowKeys.indexOf(focusKey);
    if (e.key === "ArrowDown") { e.preventDefault(); setFocusKey(rowKeys[Math.min(rowKeys.length-1, idx+1)]); }
    if (e.key === "ArrowUp") { e.preventDefault(); setFocusKey(rowKeys[Math.max(0, idx-1)]); }
    if (e.key === "Enter") {
      if (focusKey?.startsWith("note:")) {
        const id = focusKey.split(":")[1];
        const n = getNote(id);
        if (n) onSelect?.(n);
      }
    }
    if (e.key === "F2") {
      // Start rename by toggling a local state flag via a custom event
      e.preventDefault();
      const ev = new CustomEvent("od:rename", { detail: { key: focusKey }});
      window.dispatchEvent(ev);
    }
    if (e.key === "Delete") {
      e.preventDefault();
      const [kind, id] = focusKey.split(":");
      if (kind === "note") setConfirm({ open:true, title:"Delete note?", body:"This cannot be undone.", onConfirm: ()=> { deleteNote(id); onSelect?.(null); }});
      if (kind === "chapter") setConfirm({ open:true, title:"Delete chapter?", body:"Move notes to its class? Click Confirm to move, or cancel and use menu to remove notes.", onConfirm: ()=> { deleteChapter(id, { moveNotesToClass: getClassIdByChapter(id) }); refresh(); }});
      if (kind === "class") setConfirm({ open:true, title:"Delete class?", body:"Click Confirm to move its notes to Unsorted.", onConfirm: ()=> { deleteClass(id, { moveNotesToUnsorted:true }); refresh(); }});
    }
    if (e.key === "ArrowLeft") {
      const [kind, id] = focusKey.split(":");
      if (kind === "class" && !collapsed.has(id)) toggle(id);
    }
    if (e.key === "ArrowRight") {
      const [kind, id] = focusKey.split(":");
      if (kind === "class" && collapsed.has(id)) toggle(id);
    }
  };

  const getClassIdByChapter = (chapterId) => {
    const all = classes;
    for (const c of all) {
      const ch = listChapters(c.id).find(x=> x.id===chapterId);
      if (ch) return c.id;
    }
    return undefined;
  };

  return (
    <div style={container} onKeyDown={onKeyDown} tabIndex={0} aria-label="Notes sidebar" className="nice-scroll">
      {/* Top actions */}
      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
        <button aria-label="New class" onClick={handleNewClass} style={{ padding:"6px 10px", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, background:"transparent", color:"#fff" }}>+ New Class</button>
        <button aria-label="New note" onClick={handleNewNote} style={{ padding:"6px 10px", border:"1px solid rgba(99,102,241,0.4)", borderRadius:8, background:"rgba(99,102,241,0.15)", color:"#c7d2fe" }}>+ New Note</button>
      </div>
      <input aria-label="Search notes" placeholder="Search…" value={q} onChange={(e)=> setQ(e.target.value)}
        style={{ width:"100%", background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"6px 8px", marginBottom:8 }} />

      <div style={{ overflow:"auto", paddingRight:4 }} className="nice-scroll">
        {allClasses.map((cls) => {
          const isUnsorted = cls.id === "__unsorted__";
          const isCollapsed = collapsed.has(cls.id);
          const classNotes = isUnsorted
            ? unsorted
            : listNotesByClass(cls.id).filter(n=> n.title.toLowerCase().includes(q.toLowerCase()));
          const chapters = isUnsorted ? [] : listChapters(cls.id);
          const classKey = `class:${cls.id}`;
          const isFocused = focusKey === classKey;
          return (
            <div key={cls.id} style={{ position:"relative", marginBottom:4 }}>
              <div onClick={()=> { toggle(cls.id); onFilterChange?.({ classId: isUnsorted? undefined : cls.id }); }}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 8px", borderRadius:10, cursor:"pointer", color:"#fff", background: isFocused? "rgba(99,102,241,0.12)":"transparent" }}
                onMouseEnter={()=> setFocusKey(classKey)}>
                <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
                  <span style={{ opacity:.8 }}>{isCollapsed? "▸" : "▾"}</span>
                  <strong style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cls.name}</strong>
                  <span style={{ color:"rgba(255,255,255,0.6)", fontWeight:400 }}>({classNotes.length})</span>
                </div>
                {!isUnsorted && (
                  <Kebab items={[
                    { label:"Add chapter", onSelect:()=> { const n=prompt("Chapter name"); if(n){ createChapter(cls.id, n); refresh(); } } },
                    { label:"Rename", kbd:"F2", onSelect:()=> { const n=prompt("Rename class", cls.name); if(n){ renameClass(cls.id, n); refresh(); } } },
                    { label:"Delete", onSelect:()=> setConfirm({ open:true, title:"Delete class?", body:"Click Confirm to move its notes to Unsorted.", onConfirm:()=> { deleteClass(cls.id, { moveNotesToUnsorted:true }); refresh(); } }) },
                  ]} />
                )}
              </div>
              {!isCollapsed && (
                <div style={{ paddingLeft:12 }}>
                  {!isUnsorted && chapters.map((ch) => {
                    const chKey = `chapter:${ch.id}`;
                    const isFocusedCh = focusKey === chKey;
                    const chNotes = listNotesByChapter(ch.id).filter(n=> n.title.toLowerCase().includes(q.toLowerCase()));
                    return (
                      <div key={ch.id} style={{ marginBottom:2 }} onMouseEnter={()=> setFocusKey(chKey)}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 6px", color:"#cbd5e1", background: isFocusedCh? "rgba(99,102,241,0.12)":"transparent", borderRadius:8 }}>
                          <div onClick={()=> onFilterChange?.({ classId: cls.id, chapterId: ch.id })} style={{ cursor:"pointer" }}>
                            {ch.name} <span style={{ color:"rgba(255,255,255,0.6)" }}>({chNotes.length})</span>
                          </div>
                          <Kebab items={[
                            { label:"Rename", kbd:"F2", onSelect:()=> { const n=prompt("Rename chapter", ch.name); if(n){ renameChapter(ch.id, n); refresh(); } } },
                            { label:"Delete", onSelect:()=> setConfirm({ open:true, title:"Delete chapter?", body:"Click Confirm to move notes to its class.", onConfirm:()=> { deleteChapter(ch.id, { moveNotesToClass: cls.id }); refresh(); } }) },
                          ]} />
                        </div>
                        {chNotes.map((n) => (
                          <NoteRow key={n.id} note={n} active={n.id===selectedId} onSelect={()=> onSelect?.(n)} setMoveNote={setMoveNote} />
                        ))}
                      </div>
                    );
                  })}
                  {/* Direct notes under class */}
                  {!isUnsorted && listNotesByClass(cls.id).filter(n=> !n.chapterId && n.title.toLowerCase().includes(q.toLowerCase())).map(n => (
                    <NoteRow key={n.id} note={n} active={n.id===selectedId} onSelect={()=> onSelect?.(n)} setMoveNote={setMoveNote} />
                  ))}
                  {/* Unsorted notes */}
                  {isUnsorted && unsorted.map(n => (
                    <NoteRow key={n.id} note={n} active={n.id===selectedId} onSelect={()=> onSelect?.(n)} setMoveNote={setMoveNote} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Confirm open={!!confirm.open} title={confirm.title} body={confirm.body} onConfirm={()=> { confirm.onConfirm?.(); setConfirm({ open:false }); }} onOpenChange={(v)=> setConfirm(s=> ({ ...s, open:v }))} />
      <MoveNote noteId={moveNote.noteId} open={moveNote.open} onOpenChange={(v)=> setMoveNote(s=> ({ ...s, open:v }))} />
    </div>
  );
}

function NoteRow({ note, active, onSelect, setMoveNote }){
  const [renaming, setRenaming] = React.useState(false);
  React.useEffect(()=>{
    const onRename = (e)=> {
      if (e.detail?.key === `note:${note.id}`) setRenaming(true);
    };
    window.addEventListener("od:rename", onRename); return ()=> window.removeEventListener("od:rename", onRename);
  },[note.id]);
  const save = (title)=> { updateNote(note.id, { title }); setRenaming(false); };
  const del = ()=> setConfirmGlobal({ title:"Delete note?", body:"This cannot be undone.", onConfirm:()=> deleteNote(note.id) });

  const [confirm, setConfirmLocal] = React.useState(false);
  const setConfirmGlobal = ({ title, body, onConfirm }) => setConfirmLocal({ open:true, title, body, onConfirm });

  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center", gap:8, padding:"6px 6px", borderRadius:10, background: active? "rgba(99,102,241,0.12)":"transparent" }}>
      <div style={{ position:"absolute", left:0, top:6, bottom:6, width:3, background: active? `rgb(var(--notes-rail))` : "transparent", borderRadius:2 }} />
      <button onClick={onSelect} style={{ flex:1, textAlign:"left", background:"transparent", color: active? "#c7d2fe" : "rgba(255,255,255,0.9)", border:"none", cursor:"pointer" }}>
        {renaming ? (
          <InlineRename initial={note.title} onSave={save} onCancel={()=> setRenaming(false)} />
        ) : (
          <div style={{ display:"flex", flexDirection:"column" }}>
            <div style={{ fontWeight: active? 700:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{note.title}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{new Date(note.updatedAt).toLocaleString()}</div>
          </div>
        )}
      </button>
      <div style={{ display:"flex", gap:6, visibility:"visible" }}>
        <button aria-label="Rename" onClick={()=> setRenaming(true)} style={{ fontSize:12, padding:"4px 6px", borderRadius:6, border:"1px solid rgba(255,255,255,0.2)", background:"transparent", color:"#fff" }}>✎</button>
        <button aria-label="Move" onClick={()=> setMoveNote({ open:true, noteId: note.id })} style={{ fontSize:12, padding:"4px 6px", borderRadius:6, border:"1px solid rgba(255,255,255,0.2)", background:"transparent", color:"#fff" }}>⇄</button>
        <button aria-label="Delete" onClick={()=> setConfirmLocal(true)} style={{ fontSize:12, padding:"4px 6px", borderRadius:6, border:"1px solid rgba(239,68,68,0.4)", background:"rgba(239,68,68,0.15)", color:"#fecaca" }}>🗑</button>
      </div>
      <Confirm open={!!confirm.open} title={confirm.title||"Delete note?"} body={confirm.body||"This cannot be undone."} onConfirm={()=> { deleteNote(note.id); }} onOpenChange={(v)=> setConfirmLocal(s=> ({ ...s, open:v }))} />
    </div>
  );
}
