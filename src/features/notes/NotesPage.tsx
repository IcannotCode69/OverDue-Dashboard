// @ts-nocheck
import React from "react";
import { useNoteViewState } from "./middle/useNoteViewState";
import SidebarTree from "./SidebarTree";
import ChatPanel from "./ChatPanel";
import NotePreviewList from "./middle/NotePreviewList";
import FocusEditor from "./middle/FocusEditor";
import "../../styles/notes.tokens.css";

export default function NotesPage(){
  const [chatOpen, setChatOpen] = React.useState(()=> localStorage.getItem('od:notes:chatOpen') !== '0');
  const url = new URL(window.location.href);
  const classParam = url.searchParams.get('class');
  const classId = classParam === "" ? undefined : classParam || undefined;

  const { mode, noteId, openPreview, openEditor, goBack } = useNoteViewState(classId || "__unsorted__");

  React.useEffect(()=>{
    // ensure sidebar width var is applied
    const saved = localStorage.getItem('od:notes:sidebarW');
    document.documentElement.style.setProperty('--notesSidebar', saved? saved+"px" : '320px');
  },[]);

  React.useEffect(()=>{
    // whenever class changes, default to preview
    if (classId !== undefined) openPreview();
  }, [classId]);

  const chatW = mode === 'editor' ? 0 : (chatOpen ? 360 : 0);

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

  const onSelectFromSidebar = (n)=>{
    if (!n) return;
    // update URL param for note id
    const u = new URL(window.location.href);
    u.searchParams.set('id', n.id); window.history.replaceState(null,'',u.toString());
    openEditor(n.id);
  };

  return (
    <div style={{ padding:'16px', fontFamily:'var(--notes-font-sans)', fontSize:'var(--notes-body)' }}>
      <div style={{ display:'grid', gap:16, alignItems:'stretch', height: 'calc(100vh - 80px)', gridTemplateColumns: `var(--notesSidebar,320px) 1fr ${chatW}px` }}>
        {/* Left: unchanged */}
        <aside style={{ position:'relative' }}>
          <SidebarTree selectedId={noteId || undefined} onSelect={onSelectFromSidebar} onCreate={(n)=> openEditor(n.id)} onFilterChange={({ classId, chapterId })=> { const u=new URL(window.location.href); if(classId!==undefined){ u.searchParams.set('class', classId||''); } if(chapterId!==undefined){ u.searchParams.set('chapter', chapterId||''); } window.history.replaceState(null,'',u.toString()); }} />
          <div role="separator" aria-label="Resize sidebar" onMouseDown={startSidebarResize} style={{ position:'absolute', top:0, right:0, height:'100%', width:4, cursor:'col-resize', background:'rgba(255,255,255,0.05)' }} />
        </aside>

        {/* Middle: preview list or focus editor */}
        <div style={{ minWidth:0 }}>
          {mode === 'preview' ? (
            <NotePreviewList classId={classId} onOpenNote={openEditor} />
          ) : (
            <FocusEditor noteId={noteId} classId={classId} onBack={()=> { goBack(); }} onToggleChat={()=> { const v=!chatOpen; setChatOpen(v); localStorage.setItem('od:notes:chatOpen', v? '1':'0'); }} />
          )}
        </div>

        {/* Right chat: unchanged, auto-hidden when editor open via grid var */}
        <div style={{ display: chatW? 'block':'none' }}>
          {chatW>0 && <ChatPanel />}
        </div>
      </div>
    </div>
  );
}
