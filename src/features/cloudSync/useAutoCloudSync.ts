import { useEffect, useRef, useState } from "react";
import {
  isCloudSyncEnabled,
  buildLocalSnapshot,
  applySnapshotToLocalApp,
  fetchSnapshotFromCloud,
  saveSnapshotToCloud,
  AppSnapshot,
} from "./cloudSyncService";

const AUTO_SAVE_INTERVAL_MS = 60_000;

/**
 * Automatically loads the user's snapshot on first mount,
 * then periodically saves changes back to the cloud.
 */
export function useAutoCloudSync(userId: string | null | undefined) {
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);

  // Auto-load on first mount when we have a user
  useEffect(() => {
    if (!userId || !isCloudSyncEnabled()) return;
    if (hasLoadedOnce) return;

    let cancelled = false;

    async function loadOnce() {
      try {
        const snapshot = await fetchSnapshotFromCloud(userId);
        if (!cancelled && snapshot) {
          applySnapshotToLocalApp(snapshot);
          const str = JSON.stringify(snapshot);
          lastSavedSnapshotRef.current = str;
        }
      } catch (err) {
        console.error("Auto cloud sync: load snapshot failed", err);
      } finally {
        if (!cancelled) {
          setHasLoadedOnce(true);
        }
      }
    }

    loadOnce();

    return () => {
      cancelled = true;
    };
  }, [userId, hasLoadedOnce]);

  // Auto-save periodically
  useEffect(() => {
    if (!userId || !isCloudSyncEnabled()) return;
    if (!hasLoadedOnce) return;

    let cancelled = false;

    async function maybeSaveSnapshot() {
      try {
        const localSnapshot: AppSnapshot = buildLocalSnapshot();
        const str = JSON.stringify(localSnapshot);
        if (lastSavedSnapshotRef.current === str) {
          return;
        }
        await saveSnapshotToCloud(userId, localSnapshot);
        lastSavedSnapshotRef.current = str;
      } catch (err) {
        console.error("Auto cloud sync: save snapshot failed", err);
      }
    }

    const timerId = window.setInterval(() => {
      if (!cancelled) {
        void maybeSaveSnapshot();
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timerId);
    };
  }, [userId, hasLoadedOnce]);
}
