// @ts-nocheck
import React from "react";

const base = {
  height: 32,
  width: 32,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  color: 'rgba(255,255,255,0.7)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer'
};

export default function IconGhostButton({ children, title, ...rest }){
  return (
    <button
      {...rest}
      title={title}
      style={base}
      onMouseEnter={(e)=> { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={(e)=> { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
    >
      {children}
    </button>
  );
}
