import React from 'react';
import CalendarCardWidget from './CalendarCardWidget';
import SmartSuggestionsWidget from './SmartSuggestionsWidget';
import StreakWidget from './StreakWidget';

// Widget registry with curated default widgets
export const widgetDefaults = {
  calendarCard: {
    lg: { w: 2, h: 6 },
    md: { w: 2, h: 6 },
    sm: { w: 2, h: 7 },
    xs: { w: 3, h: 8 },
    xxs: { w: 2, h: 9 }
  },
  smartSuggestions: {
    lg: { w: 3, h: 6 },
    md: { w: 3, h: 6 },
    sm: { w: 4, h: 7 },
    xs: { w: 4, h: 8 },
    xxs: { w: 2, h: 9 }
  },
  streak: {
    lg: { w: 2, h: 4 },
    md: { w: 2, h: 4 },
    sm: { w: 3, h: 4 },
    xs: { w: 4, h: 4 },
    xxs: { w: 2, h: 4 }
  }
};

export const WIDGET_KINDS = ['calendarCard', 'smartSuggestions', 'streak'];

export function renderWidget(kind, id, onRemove) {
  switch (kind) {
    case 'calendarCard':
      return <CalendarCardWidget key={id} onRemove={onRemove} />;
    case 'smartSuggestions':
      return <SmartSuggestionsWidget key={id} onRemove={onRemove} />;
    case 'streak':
      return <StreakWidget key={id} onRemove={onRemove} />;
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
  smartSuggestions: {
    minW: 3,
    minH: 4,
    maxW: 8,
    maxH: 12
  },
  streak: {
    minW: 2,
    minH: 3,
    maxW: 4,
    maxH: 6
  }
};

// Widget metadata for UI
export const widgetMetadata = {
  calendarCard: {
    name: 'Calendar Card',
    description: 'Daily schedule at a glance',
    icon: 'dY".'
  },
  smartSuggestions: {
    name: 'Smart Suggestions',
    description: 'AI-powered study tips based on your data',
    icon: '✨'
  },
  streak: {
    name: 'Streak',
    description: 'Track how many days in a row you showed up.',
    icon: '🔥'
  }
};
