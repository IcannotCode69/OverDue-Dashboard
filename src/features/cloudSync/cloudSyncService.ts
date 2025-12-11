import { buildSnapshotFromLocal, applySnapshotToLocal, type DashboardSnapshot } from "../sync/snapshot";
import { loadSnapshot, saveSnapshot } from "../sync/apiClient";

export type AppSnapshot = DashboardSnapshot;

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export function isCloudSyncEnabled(): boolean {
  return Boolean(API_BASE);
}

/**
 * Build the current app snapshot from local state / localStorage.
 * Reuses the same logic as manual Cloud Sync.
 */
export function buildLocalSnapshot(): AppSnapshot {
  return buildSnapshotFromLocal();
}

/**
 * Apply a snapshot loaded from the cloud back into local state / localStorage.
 */
export function applySnapshotToLocalApp(snapshot: AppSnapshot | null): void {
  if (!snapshot) return;
  applySnapshotToLocal(snapshot);
}

export async function fetchSnapshotFromCloud(userId: string): Promise<AppSnapshot | null> {
  if (!isCloudSyncEnabled()) return null;
  return loadSnapshot(userId);
}

export async function saveSnapshotToCloud(userId: string, snapshot: AppSnapshot): Promise<void> {
  if (!isCloudSyncEnabled()) return;
  return saveSnapshot(userId, snapshot);
}
