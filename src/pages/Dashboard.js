import React from "react";
import DashboardGrid from "../features/dashboard/DashboardGrid";

export default function DashboardPage() {
  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 600,
          marginBottom: "16px",
          color: "white",
        }}
      >
        Dashboard
      </h1>
      <div style={{ flex: 1, minHeight: 0 }}>
        <DashboardGrid />
      </div>
    </div>
  );
}
