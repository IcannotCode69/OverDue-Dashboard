import React from 'react';
import CalendarCardWidget from './CalendarCardWidget';
import DemoStatsWidget from './DemoStatsWidget';
import DemoTimelineWidget from './DemoTimelineWidget';
import DemoFocusWidget from './DemoFocusWidget';
import DemoHighlightsWidget from './DemoHighlightsWidget';

// Widget registry with curated default widgets
export const widgetDefaults = {
  calendarCard: {
    lg: { w: 2, h: 6 },
    md: { w: 2, h: 6 },
    sm: { w: 2, h: 7 },
    xs: { w: 3, h: 8 },
    xxs: { w: 2, h: 9 }
  },
  demoStats: { lg:{w:6,h:4}, md:{w:6,h:4}, sm:{w:6,h:4}, xs:{w:4,h:4}, xxs:{w:2,h:3} },
  demoTimeline: { lg:{w:4,h:5}, md:{w:4,h:5}, sm:{w:4,h:5}, xs:{w:4,h:5}, xxs:{w:2,h:3} },
  demoFocus: { lg:{w:3,h:5}, md:{w:3,h:5}, sm:{w:3,h:5}, xs:{w:4,h:4}, xxs:{w:2,h:3} },
  demoHighlights: { lg:{w:5,h:3}, md:{w:5,h:3}, sm:{w:5,h:3}, xs:{w:4,h:3}, xxs:{w:2,h:2} }
};

export const WIDGET_KINDS = ['calendarCard','demoStats','demoTimeline','demoFocus','demoHighlights'];

export function renderWidget(kind, id, onRemove) {
  switch (kind) {
    case 'calendarCard':
      return <CalendarCardWidget key={id} onRemove={onRemove} />;
    case 'demoStats':
      return <DemoStatsWidget key={id} onRemove={onRemove} />;
    case 'demoTimeline':
      return <DemoTimelineWidget key={id} onRemove={onRemove} />;
    case 'demoFocus':
      return <DemoFocusWidget key={id} onRemove={onRemove} />;
    case 'demoHighlights':
      return <DemoHighlightsWidget key={id} onRemove={onRemove} />;
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
  },
  demoStats: { minW:3, minH:3, maxW:12, maxH:10 },
  demoTimeline: { minW:3, minH:3, maxW:12, maxH:10 },
  demoFocus: { minW:3, minH:3, maxW:12, maxH:10 },
  demoHighlights: { minW:3, minH:3, maxW:12, maxH:10 }
};

// Widget metadata for UI
export const widgetMetadata = {
  calendarCard: {
    name: 'Calendar Card',
    description: 'Daily schedule at a glance',
    icon: 'dY".'
  },
  demoStats: { name:'Demo • Stats', description:'Static stat blocks', icon:'📊' },
  demoTimeline: { name:'Demo • Timeline', description:'Static timeline preview', icon:'🗓️' },
  demoFocus: { name:'Demo • Focus', description:'Focus list placeholder', icon:'🎯' },
  demoHighlights: { name:'Demo • Highlights', description:'KPI highlights', icon:'✨' }
};

// Deterministic IDs for demo widgets used by DashboardGrid when toggling
export const DEMO_WIDGETS = [
  { i:'demo:stats', kind:'demoStats' },
  { i:'demo:timeline', kind:'demoTimeline' },
  { i:'demo:focus', kind:'demoFocus' },
  { i:'demo:highlights', kind:'demoHighlights' },
];
export const DEMO_WIDGET_IDS = DEMO_WIDGETS.map(w=>w.i);
