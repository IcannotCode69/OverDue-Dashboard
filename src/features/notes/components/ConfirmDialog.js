import React from "react";
import Button from "../../../components/ui/Button";

export default function ConfirmDialog({ open, title, body, confirmLabel='Confirm', onConfirm, onClose, variant='danger' }){
  if(!open) return null;
  return (
    <div role="dialog" aria-modal style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:40 }}>
      <div style={{ background:'rgba(2,6,23,0.98)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:12, padding:16, width:480 }}>
        <div style={{ color:'#fff', fontWeight:700, fontSize:18, marginBottom:8 }}>{title}</div>
        <div style={{ color:'rgba(255,255,255,0.8)', marginBottom:12 }}>{body}</div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={variant} onClick={()=> { onConfirm?.(); onClose?.(); }}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}