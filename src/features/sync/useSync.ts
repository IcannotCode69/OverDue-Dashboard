import * as React from 'react';
import type { DashboardSnapshot } from './snapshot';
import { buildSnapshotFromLocal } from './snapshot';
import { loadSnapshot, saveSnapshot } from './apiClient';
import { useApplySnapshotToAppState } from '../cloudSync/applySnapshotToAppState';

export function useSync() {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<string | null>(null);
  const [syncError, setSyncError] = React.useState<string | null>(null);
  const { applySnapshotToAppState } = useApplySnapshotToAppState();

  const syncFromCloud = React.useCallback(async (userId: string) => {
    if (!userId) {
      setSyncError('Add an email or user id before syncing.');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      const snapshot = await loadSnapshot(userId);
      if (snapshot) {
        applySnapshotToAppState(snapshot);
        setLastSyncedAt(snapshot.updatedAt);
      } else {
        setSyncError('No cloud data found for this user yet.');
      }
    } catch (err) {
      console.error(err);
      setSyncError('Failed to load your data from the cloud.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncToCloud = React.useCallback(async (userId: string) => {
    if (!userId) {
      setSyncError('Add an email or user id before syncing.');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      const snapshot: DashboardSnapshot = buildSnapshotFromLocal();
      await saveSnapshot(userId, snapshot);
      setLastSyncedAt(snapshot.updatedAt);
    } catch (err) {
      console.error(err);
      setSyncError('Failed to save your data to the cloud.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    isSyncing,
    lastSyncedAt,
    syncError,
    syncFromCloud,
    syncToCloud,
  };
}
