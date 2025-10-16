// @ts-nocheck
import React from "react";
import { listClasses, listNotesByClass } from "../store";
import NotePreviewCard from "./NotePreviewCard";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";

function classNameById(id){
  if (!id) return "Unsorted";
  const c = listClasses().find(x=> x.id===id);
  return c?.name || "Unsorted";
}

export default function NotePreviewList({ classId, onOpenNote }){
  const [sort, setSort] = React.useState(()=> localStorage.getItem('od:notes:sort') || 'updated');
  const [query, setQuery] = React.useState("");

  const listRaw = listNotesByClass(classId);
  const list = listRaw
    .filter(n=> (n.title + "\n" + (n.body||"")).toLowerCase().includes(query.toLowerCase()))
    .sort((a,b)=> sort==='updated'? (new Date(b.updatedAt)-new Date(a.updatedAt)) : sort==='created' ? (new Date(b.createdAt)-new Date(a.createdAt)) : (a.title.localeCompare(b.title)));

  const container = { border:`1px solid rgba(var(--notes-border))`, borderRadius:"var(--notes-radius)", background:`rgba(var(--notes-panel))`, boxShadow:"var(--notes-shadow)", height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" };
  const header = { position:"sticky", top:0, zIndex:10, backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.1)" };

  const title = `Notes in ${classNameById(classId)}`;

  return (
    <div style={container}>
      <div style={header}>
        <div style={{ color:'#fff', fontWeight:700 }}>{title}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <input aria-label="Search notes" placeholder="Search…" value={query} onChange={(e)=> setQuery(e.target.value)}
            style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, padding:'6px 8px' }} />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button aria-label="More" title="More" style={{ width:32, height:32, display:'inline-flex', alignItems:'center', justifyContent:'center', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff' }}>
                <DotsHorizontalIcon />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content sideOffset={6} align="end" style={{ zIndex:50, background:'rgba(2,6,23,0.98)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, padding:6, minWidth:200 }}>
                <DropdownMenu.Item onSelect={()=> {/* new note handled in editor header */}} style={itemStyle}>New note</DropdownMenu.Item>
                <DropdownMenu.Separator style={{ height:1, background:'rgba(255,255,255,0.08)', margin:'4px 0' }} />
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger style={itemStyle}>Sort by…</DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent style={menuStyle} sideOffset={4} alignOffset={-4}>
                      <DropdownMenu.Item onSelect={()=> { setSort('updated'); localStorage.setItem('od:notes:sort','updated'); }} style={itemStyle}>Updated</DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={()=> { setSort('title'); localStorage.setItem('od:notes:sort','title'); }} style={itemStyle}>Title</DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={()=> { setSort('created'); localStorage.setItem('od:notes:sort','created'); }} style={itemStyle}>Created</DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
                <DropdownMenu.Item disabled style={{ ...itemStyle, opacity:.6 }}>Select… (coming soon)</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      <div style={{ padding:'16px', overflow:'auto' }} className="nice-scroll">
        <AnimatePresence initial={false}>
          {list.length === 0 ? (
            <div style={{ color:'rgba(255,255,255,0.7)', textAlign:'center', padding:'40px 0' }}>No notes yet in {classNameById(classId)}. Create one.</div>
          ) : (
            list.map(n => (
              <motion.div key={n.id} layout initial={{ opacity:0, scale:.98 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.98 }} transition={{ duration:.2, ease:'easeOut' }}>
                <NotePreviewCard note={n} onClick={()=> onOpenNote(n.id)} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const itemStyle = { display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:8, cursor:'pointer', color:'#fff' };
const menuStyle = { zIndex:50, background:'rgba(2,6,23,0.98)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, padding:6, minWidth:160 };
