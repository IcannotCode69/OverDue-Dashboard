import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React from "react";

export default function Kebab({ label = "Actions", items = [], align = "end", onOpenChange }) {
  return (
    <DropdownMenu.Root onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button aria-label={label} style={{ padding:4, borderRadius:6, border:"1px solid rgba(255,255,255,0.2)", background:"transparent", color:"#fff", cursor:"pointer" }}>⋮</button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={6} align={align} style={{ zIndex:50, background:"rgba(2,6,23,0.98)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:6, minWidth:180 }}>
          {items.map((it, idx) => (
            <DropdownMenu.Item key={idx} onSelect={(e)=>{ e.preventDefault(); it.onSelect?.(); }}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, padding:"6px 8px", borderRadius:8, cursor:"pointer", color:"#fff" }}>
              <span>{it.label}</span>
              {it.kbd && <kbd style={{ fontSize:10, opacity:.6 }}>{it.kbd}</kbd>}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
