import React from "react";

export default function Button({ children, variant='subtle', size='sm', className='', ...props }){
  const base = {
    display:'inline-flex', alignItems:'center', gap:4,
    borderRadius:6, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#fff', cursor:'pointer', padding: size==='xs'? '4px 8px':'6px 10px', fontSize: size==='xs'? 12: 14
  };
  if (variant==='primary') { base.border='1px solid rgba(99,102,241,0.3)'; base.background='rgba(99,102,241,0.15)'; base.color='#c7d2fe'; }
  if (variant==='danger') { base.border='1px solid rgba(239,68,68,0.4)'; base.background='rgba(239,68,68,0.15)'; base.color='#fecaca'; }
  if (variant==='ghost') { base.border='1px solid rgba(255,255,255,0.1)'; base.background='transparent'; base.color='#fff'; }
  return <button style={base} {...props}>{children}</button>;
}