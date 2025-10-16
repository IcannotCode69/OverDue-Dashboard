import { useEffect } from "react";

export default function useNotesHotkeys({ onSave, focusSearch, wrapBold, wrapItalic }){
  useEffect(()=>{
    const onKey = (e)=>{
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase()==='s') { e.preventDefault(); onSave?.(); }
      if (mod && e.key.toLowerCase()==='k') { e.preventDefault(); focusSearch?.(); }
      if (mod && e.key.toLowerCase()==='b') { e.preventDefault(); wrapBold?.(); }
      if (mod && e.key.toLowerCase()==='i') { e.preventDefault(); wrapItalic?.(); }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[onSave, focusSearch, wrapBold, wrapItalic]);
}