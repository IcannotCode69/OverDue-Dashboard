import React from "react";

export default function InlineRename({ initial = "", onSave, onCancel }) {
  const [v, setV] = React.useState(initial);
  const onKey = (e) => {
    if (e.key === "Enter") onSave?.(v.trim());
    if (e.key === "Escape") onCancel?.();
  };
  return (
    <input autoFocus value={v} onChange={(e)=> setV(e.target.value)} onKeyDown={onKey}
      onBlur={()=> onCancel?.()}
      style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, padding:"4px 6px", color:"#fff" }} />
  );
}
