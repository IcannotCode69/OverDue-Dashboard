import * as React from "react";
import { useAuth } from "../auth/AuthContext";
import { getUserIdFromAuth } from "../sync/userId";
import { loadSnapshot } from "../sync/apiClient";
import { useApplySnapshotToAppState } from "./applySnapshotToAppState";
import type { DashboardSnapshot } from "../sync/snapshot";

interface CloudBootstrapState {
  hasSnapshot: boolean;
  lastUpdatedAt: string | null;
  isChecking: boolean;
  isLoadingSnapshot: boolean;
  loadNow: () => Promise<void>;
  dismiss: () => void;
}

const SESSION_FLAG_KEY = "od:cloud-bootstrap-dismissed";

export function useCloudSnapshotBootstrap(): CloudBootstrapState {
  const { user } = useAuth();
  const userId = getUserIdFromAuth(user);
  const { applySnapshotToAppState } = useApplySnapshotToAppState();

  const [hasSnapshot, setHasSnapshot] = React.useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState<string | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);
  const [isLoadingSnapshot, setIsLoadingSnapshot] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(SESSION_FLAG_KEY);
    setDismissed(raw === "true");
  }, []);

  React.useEffect(() => {
    if (!userId) return;
    if (dismissed) return;

    let cancelled = false;

    async function checkSnapshot() {
      setIsChecking(true);
      try {
        const result = await loadSnapshot(userId);
        if (cancelled) return;

        const snapshot = result as DashboardSnapshot | null;
        if (snapshot) {
          setHasSnapshot(true);
          setLastUpdatedAt(snapshot.updatedAt ?? null);
        } else {
          setHasSnapshot(false);
        }
      } catch {
        setHasSnapshot(false);
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }

    checkSnapshot();

    return () => {
      cancelled = true;
    };
  }, [userId, dismissed]);

  const loadNow = React.useCallback(async () => {
    if (!userId) return;
    setIsLoadingSnapshot(true);
    try {
      const result = await loadSnapshot(userId);
      if (result) {
        applySnapshotToAppState(result as DashboardSnapshot);
        setHasSnapshot(false);
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(SESSION_FLAG_KEY, "true");
        }
      }
    } finally {
      setIsLoadingSnapshot(false);
    }
  }, [userId, applySnapshotToAppState]);

  const dismiss = React.useCallback(() => {
    setHasSnapshot(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_FLAG_KEY, "true");
    }
  }, []);

  return {
    hasSnapshot: !!hasSnapshot,
    lastUpdatedAt,
    isChecking,
    isLoadingSnapshot,
    loadNow,
    dismiss,
  };
}
