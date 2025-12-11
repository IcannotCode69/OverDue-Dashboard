import React from "react";
import DashboardGrid from "../features/dashboard/DashboardGrid";
import { useCloudSnapshotBootstrap } from "../features/cloudSync/useCloudSnapshotBootstrap";

export default function DashboardPage() {
  const {
    hasSnapshot,
    lastUpdatedAt,
    isLoadingSnapshot,
    loadNow,
    dismiss,
  } = useCloudSnapshotBootstrap();

  return (
    <div className="dashboard-page">
      {hasSnapshot && !isLoadingSnapshot && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(148, 163, 184, 0.6)",
            background:
              "linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.8))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 13,
          }}
        >
          <div>
            <div style={{ fontWeight: 500 }}>Cloud snapshot available</div>
            <div style={{ opacity: 0.8 }}>
              {lastUpdatedAt
                ? `We found a saved dashboard snapshot from ${new Date(lastUpdatedAt).toLocaleString()}.`
                : "We found a saved dashboard snapshot for your account."}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={dismiss}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(148, 163, 184, 0.6)",
                background: "transparent",
                color: "var(--ink-2, #e5e7eb)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={loadNow}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(to right, #4f46e5, #6366f1)",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Load from cloud
            </button>
          </div>
        </div>
      )}
      {isLoadingSnapshot && (
        <div
          style={{
            marginBottom: 16,
            fontSize: 13,
            opacity: 0.8,
          }}
        >
          Loading snapshot from cloud...
        </div>
      )}
      <DashboardGrid />
    </div>
  );
}
