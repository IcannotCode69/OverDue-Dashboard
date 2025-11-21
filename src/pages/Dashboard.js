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
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 600,
            margin: 0,
            color: "white",
          }}
        >
          Dashboard
        </h1>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <DashboardGrid />
      </div>
    </div>
  );
}
