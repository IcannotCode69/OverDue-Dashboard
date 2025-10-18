import React from 'react';
import './card.css';

export default function Card({children, className='', header, style}) {
  return (
    <div className={`od-card ${className}`} style={style}>
      {header ? <div className="od-card__header">{header}</div> : null}
      <div className="od-card__body">{children}</div>
    </div>
  );
}