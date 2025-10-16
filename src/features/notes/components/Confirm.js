import * as Dialog from "@radix-ui/react-dialog";
import React from "react";

export default function Confirm({ open, title, body, confirmLabel = "Confirm", onConfirm, onOpenChange }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:49 }} />
        <Dialog.Content style={{ position:"fixed", inset:"0", display:"grid", placeItems:"center", zIndex:50 }}>
          <div style={{ background:"rgba(2,6,23,0.98)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, padding:16, width:420 }}>
            <Dialog.Title style={{ color:"#fff", fontWeight:700, marginBottom:8 }}>{title}</Dialog.Title>
            <div style={{ color:"rgba(255,255,255,0.85)", marginBottom:12 }}>{body}</div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <button aria-label="Cancel" onClick={()=> onOpenChange?.(false)} style={{ padding:"6px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.2)", background:"transparent", color:"#fff" }}>Cancel</button>
              <button aria-label={confirmLabel} onClick={()=> { onConfirm?.(); onOpenChange?.(false); }} style={{ padding:"6px 10px", borderRadius:8, border:"1px solid rgba(239,68,68,0.4)", background:"rgba(239,68,68,0.15)", color:"#fecaca" }}>{confirmLabel}</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
