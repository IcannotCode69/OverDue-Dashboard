import React from "react";
import WidgetFrame from "../WidgetFrame";
import TasksWidget from "./TasksWidget";
import QuickNoteWidget from "./QuickNoteWidget";
import GpaWidget from "./GpaWidget";
import AiQueueWidget from "./AiQueueWidget";
import GCalWidget from "./GCalWidget";

export const widgetDefaults = {
  // existing (updated defaults)
  quick: { w: 3, h: 3, title: "Quick Stats", sizes: { lg: 3, md: 3, sm: 3, xs: 4, xxs: 2 } },
  upcoming: { w: 4, h: 4, title: "Upcoming" },
  scratch: { w: 4, h: 5, title: "Scratch Pad" },
  // new widgets (updated defaults)
  tasks: { w: 6, h: 6, title: "Tasks", sizes: { lg: 6, md: 6, sm: 4, xs: 4, xxs: 2 } },
  quickNote: { w: 3, h: 4, title: "Quick Note", sizes: { lg: 3, md: 3, sm: 3, xs: 4, xxs: 2 } },
  gpa: { w: 3, h: 3, title: "GPA", sizes: { lg: 3, md: 3, sm: 3, xs: 4, xxs: 2 } },
  aiQueue: { w: 6, h: 4, title: "AI Queue", sizes: { lg: 6, md: 6, sm: 4, xs: 4, xxs: 2 } },
  gcal: { w: 6, h: 6, title: "Google Calendar (Week)", sizes: { lg: 6, md: 6, sm: 4, xs: 4, xxs: 2 } },
};

export const WIDGET_KINDS = [
  "tasks",
  "quickNote",
  "gpa",
  "aiQueue",
  "gcal",
];

export function renderWidget(kind, id, onRemove) {
  switch (kind) {
    case "quick":
      return (
        <WidgetFrame title="Quick Stats" onRemove={onRemove}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>No stats yet.</div>
        </WidgetFrame>
      );
    case "upcoming":
      return (
        <WidgetFrame title="Upcoming" onRemove={onRemove}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Nothing scheduled.</div>
        </WidgetFrame>
      );
    case "scratch":
      return (
        <WidgetFrame title="Scratch Pad" onRemove={onRemove}>
          <textarea
            className="nice-scroll"
            style={{
              width: "100%",
              height: 192,
              backgroundColor: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              padding: 8,
              color: "rgba(255,255,255,0.9)",
              fontSize: 14,
              resize: "vertical",
              outline: "none",
            }}
            placeholder="Jot something…"
          />
        </WidgetFrame>
      );
    case "tasks":
      return (
        <WidgetFrame title="Tasks" onRemove={onRemove}>
          <TasksWidget widgetId={id} />
        </WidgetFrame>
      );
    case "gcal":
      return <GCalWidget onRemove={onRemove} />;
    case "quickNote":
      return (
        <WidgetFrame title="Quick Note" onRemove={onRemove}>
          <QuickNoteWidget />
        </WidgetFrame>
      );
    case "gpa":
      return (
        <WidgetFrame title="GPA" onRemove={onRemove}>
          <GpaWidget />
        </WidgetFrame>
      );
    case "aiQueue":
      return (
        <WidgetFrame title="AI Queue" onRemove={onRemove}>
          <AiQueueWidget />
        </WidgetFrame>
      );
    default:
      return null;
  }
}
