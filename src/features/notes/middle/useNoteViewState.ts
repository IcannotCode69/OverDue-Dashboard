// @ts-nocheck
import React from "react";

export type ViewState = { mode: "preview" | "editor"; noteId?: string };

export function useNoteViewState(classKey: string){
  const key = `od:notes:view:${classKey||'__unsorted__'}`;
  const [state, setState] = React.useState<ViewState>(()=>{
    try{ return JSON.parse(localStorage.getItem(key)||'{"mode":"preview"}'); }catch{ return { mode:'preview' }; }
  });
  React.useEffect(()=>{ localStorage.setItem(key, JSON.stringify(state)); }, [state, key]);

  return {
    mode: state.mode,
    noteId: state.noteId,
    openPreview: ()=> setState({ mode:'preview' }),
    openEditor: (noteId: string)=> setState({ mode:'editor', noteId }),
    goBack: ()=> setState({ mode:'preview' }),
  };
}
