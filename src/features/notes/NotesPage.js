import React from "react";
import "../../styles/notes.tokens.css";
import { seedIfEmpty, listAllNotes, getNote } from "./store";
import SidebarTree from "./SidebarTree";
import Editor from "./Editor";
import ChatPanel from "./ChatPanel";

export default function NotesPage(){
  React.useEffect(()=> seedIfEmpty(), []);
  const [notes] = React.useState(()=> listAllNotes());
  const urlId = new URL(window.location.href).searchParams.get('id');
  const initial = urlId ? getNote(urlId) : notes[0] || null;
  const [selected, setSelected] = React.useState(initial);

  const [chatOpen, setChatOpen] = React.useState(()=> localStorage.getItem('od:notes:chatOpen') !== '0');
  React.useEffect(()=>{
    const saved = localStorage.getItem('od:notes:sidebarW');
    document.documentElement.style.setProperty('--notesSidebar', saved? saved+"px" : '320px');
  },[]);
  const chatW = chatOpen ? 360 : 0;

  function startSidebarResize(e){
    const startX = e.clientX;
    const start = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--notesSidebar')) || 320;
    const onMove = (ev)=>{
      const next = Math.min(520, Math.max(240, start + (ev.clientX - startX)));
      document.documentElement.style.setProperty('--notesSidebar', `${next}px`);
      localStorage.setItem('od:notes:sidebarW', String(next));
    };
    const onUp = ()=>{ window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  const onSelect = (n)=>{ if(!n) return; setSelected(n); const u = new URL(window.location.href); u.searchParams.set('id', n.id); window.history.replaceState(null,'',u.toString()); };

  return (
    <div style={{ padding:'16px', fontFamily:'var(--notes-font-sans)', fontSize:'var(--notes-body)' }}>
      <div style={{ display:'grid', gap:16, alignItems:'stretch', height: 'calc(100vh - 80px)', gridTemplateColumns: `var(--notesSidebar,320px) 1fr ${chatW}px` }}>
        {/* Left list with resizer */}
        <aside style={{ position:'relative' }}>
          <SidebarTree selectedId={selected?.id} onSelect={onSelect} onCreate={(n)=> setSelected(n)} onFilterChange={({ classId, chapterId })=> { const u=new URL(window.location.href); if(classId!==undefined){ u.searchParams.set('class', classId||''); } if(chapterId!==undefined){ u.searchParams.set('chapter', chapterId||''); } window.history.replaceState(null,'',u.toString()); }} />
          <div role="separator" aria-label="Resize sidebar" onMouseDown={startSidebarResize} style={{ position:'absolute', top:0, right:0, height:'100%', width:4, cursor:'col-resize', background:'rgba(255,255,255,0.05)' }} />
        </aside>

        {/* Center editor */}
        <div>
          <Editor note={selected} onChange={(n)=> n && setSelected(n)} onToggleChat={()=> { const v=!chatOpen; setChatOpen(v); localStorage.setItem('od:notes:chatOpen', v? '1':'0'); }} />
        </div>

        {/* Right chat collapsible */}
        <div style={{ display: chatOpen? 'block':'none' }}>
          {chatOpen && <ChatPanel />}
        </div>
      </div>
    </div>
  );
}
