import React from "react";

export default function Menu({ trigger, children, align='right' }){
  const [open,setOpen]=React.useState(false);
  const ref=React.useRef(null);
  React.useEffect(()=>{
    const onDoc=(e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown',onDoc); return ()=> document.removeEventListener('mousedown',onDoc);
  },[]);
  return (
    <div ref={ref} style={{ position:'relative', display:'inline-block' }}>
      <div onClick={()=> setOpen(v=>!v)} aria-haspopup="menu" aria-expanded={open} style={{ display:'inline-flex' }}>{trigger}</div>
      {open && (
        <div role="menu" style={{ position:'absolute', zIndex:20, top:'100%', [align]:'0px', marginTop:6, minWidth:180, background:'rgba(2,6,23,0.98)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, boxShadow:'0 10px 20px rgba(0,0,0,0.35)', padding:6 }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ onClick, children, danger }){
  return (
    <button onClick={onClick} role="menuitem" style={{ width:'100%', textAlign:'left', padding:'6px 8px', borderRadius:6, color: danger? '#fecaca':'#fff', background:'transparent', border:'none', cursor:'pointer' }}>{children}</button>
  );
}