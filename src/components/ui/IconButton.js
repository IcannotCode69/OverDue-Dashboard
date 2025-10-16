import React from "react";

export default function IconButton({ title, children, className='', ...props }){
  const style={ padding:'4px 6px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.06)', color:'#fff', cursor:'pointer' };
  return <button title={title} style={style} {...props}>{children}</button>;
}