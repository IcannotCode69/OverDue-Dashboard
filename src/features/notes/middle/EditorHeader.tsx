// @ts-nocheck
import React from "react";
import { ArrowLeftIcon, PlusIcon, Pencil2Icon, TrashIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import IconGhostButton from "../../../components/ui/IconGhostButton";

export default function EditorHeader({ title, setTitle, onBack, onAdd, onDelete, onSave }){
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(()=>{ /* focus title when rename triggered from menu if needed */ },[]);

  const bar = { position:'sticky', top:0, zIndex:20, backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px' };
  const titleStyle = { fontSize:'1.25rem', fontWeight:600, color:'#fff', background:'transparent', border:'none', outline:'none', width:'100%' };

  return (
    <div style={bar}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <IconGhostButton aria-label="Back" title="Back" onClick={onBack}><ArrowLeftIcon /></IconGhostButton>
        <input ref={ref} value={title} onChange={(e)=> setTitle(e.target.value)} placeholder="Title" style={titleStyle} />
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        <IconGhostButton aria-label="Add note" title="New note" onClick={onAdd}><PlusIcon /></IconGhostButton>
        <IconGhostButton aria-label="Rename" title="Rename" onClick={()=> ref.current?.focus()}><Pencil2Icon /></IconGhostButton>
        <IconGhostButton aria-label="Delete" title="Delete" onClick={()=> setConfirmOpen(true)}><TrashIcon /></IconGhostButton>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <IconGhostButton aria-label="More" title="More"><DotsHorizontalIcon /></IconGhostButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content sideOffset={6} align="end" style={{ zIndex:50, background:'rgba(2,6,23,0.98)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, padding:6, minWidth:180 }}>
              <DropdownMenu.Item style={itemStyle} onSelect={(e)=> e.preventDefault()}>Move to class/chapter…</DropdownMenu.Item>
              <DropdownMenu.Item style={itemStyle} onSelect={(e)=> e.preventDefault()}>Duplicate</DropdownMenu.Item>
              <DropdownMenu.Item style={itemStyle} onSelect={(e)=> e.preventDefault()}>Open preview</DropdownMenu.Item>
              <DropdownMenu.Item style={itemStyle} onSelect={(e)=> e.preventDefault()}>Export .md</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:49 }} />
          <Dialog.Content style={{ position:'fixed', inset:0, display:'grid', placeItems:'center', zIndex:50 }}>
            <div style={{ background:'rgba(2,6,23,0.98)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:12, padding:16, width:420 }}>
              <Dialog.Title style={{ color:'#fff', fontWeight:700, marginBottom:8 }}>Delete note?</Dialog.Title>
              <div style={{ color:'rgba(255,255,255,0.85)', marginBottom:12 }}>This action cannot be undone.</div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                <button onClick={()=> setConfirmOpen(false)} style={btnGhost}>Cancel</button>
                <button onClick={()=> { onDelete?.(); setConfirmOpen(false); }} style={btnDanger}>Delete</button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

const itemStyle = { display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:8, cursor:'pointer', color:'#fff' };
const btnGhost = { padding:'6px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'#fff' };
const btnDanger = { padding:'6px 10px', borderRadius:8, border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.15)', color:'#fecaca' };
