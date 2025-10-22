import React from 'react';
import CalendarCardWidget from './CalendarCardWidget';

// Widget registry with curated default widgets
export const widgetDefaults = {
  calendarCard: {
    lg: { w: 2, h: 6 },
    md: { w: 2, h: 6 },
    sm: { w: 2, h: 7 },
    xs: { w: 3, h: 8 },
    xxs: { w: 2, h: 9 }
  }
};

export const WIDGET_KINDS = ['calendarCard'];

export function renderWidget(kind, id, onRemove) {
  switch (kind) {
    case 'calendarCard':
      return <CalendarCardWidget key={id} onRemove={onRemove} />;
    default:
      return null;
  }
}

// Size constraints for widgets
export const widgetSizeConstraints = {
  calendarCard: {
    minW: 3,
    minH: 5,
    maxW: 6,
    maxH: 10
  }
};

// Widget metadata for UI
export const widgetMetadata = {
  calendarCard: {
    name: 'Calendar Card',
    description: 'Daily schedule at a glance',
    icon: 'dY".'
  }
};
