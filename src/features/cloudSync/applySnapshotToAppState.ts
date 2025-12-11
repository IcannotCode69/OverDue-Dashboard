import * as React from "react";
import { applySnapshotToLocal } from "../sync/snapshot";
import type { DashboardSnapshot } from "../sync/snapshot";

export function useApplySnapshotToAppState() {
  const applySnapshotToAppState = React.useCallback((snapshot: DashboardSnapshot | null) => {
    if (!snapshot) return;
    applySnapshotToLocal(snapshot);
  }, []);

  return { applySnapshotToAppState };
}
