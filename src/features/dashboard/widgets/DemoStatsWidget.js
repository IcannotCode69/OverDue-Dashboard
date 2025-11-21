import React from "react";
import WidgetFrame from "../WidgetFrame";

export default function DemoStatsWidget({ onRemove }) {
  return (
    <WidgetFrame title="cool widget" onRemove={onRemove}>
      <div style={{ color:'#e8ecff' }}>cool widget</div>
    </WidgetFrame>
  );
}
