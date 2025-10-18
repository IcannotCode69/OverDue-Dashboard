import React from 'react';

export default function Chip({children, tone='neutral'}) {
  const tones = {
    positive: { bg:'rgba(30,200,165,0.12)', fg:'#1ec8a5' },
    negative: { bg:'rgba(255,93,122,0.12)', fg:'#ff5d7a' },
    neutral:  { bg:'rgba(255,255,255,0.08)', fg:'rgba(255,255,255,0.72)' }
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display:'inline-flex', 
      alignItems:'center', 
      gap:8,
      padding:'4px 8px', 
      borderRadius:999, 
      background:t.bg, 
      color:t.fg,
      fontSize:12, 
      lineHeight:1,
      fontWeight: 500
    }}>
      {children}
    </span>
  );
}

export function IconPill({children}) {
  return (
    <span style={{
      width:36,
      height:36,
      display:'inline-flex',
      alignItems:'center',
      justifyContent:'center',
      borderRadius:999, 
      background:'linear-gradient(180deg, rgba(74,168,255,0.25), rgba(74,168,255,0.10))',
      boxShadow:'var(--glow-acc)', 
      color:'var(--ink-0)'
    }}>
      {children}
    </span>
  );
}