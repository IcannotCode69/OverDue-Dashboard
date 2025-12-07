import type { DashboardSnapshot } from './snapshot';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

/**
 * Normalize the base URL so we don't accidentally get double slashes.
 */
function getBaseUrl(): string | null {
  if (!API_BASE) return null;
  return API_BASE.replace(/\/+$/, '');
}

export async function loadSnapshot(userId: string): Promise<DashboardSnapshot | null> {
  const base = getBaseUrl();
  if (!base) {
    // No backend configured yet; treat as "no cloud data"
    console.warn('[sync] REACT_APP_API_BASE_URL not set; loadSnapshot is a no-op.');
    return null;
  }

  const url = `${base}/snapshot?userId=${encodeURIComponent(userId)}`;
  const res = await fetch(url);

  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to load snapshot (${res.status})`);
  }

  const json = (await res.json()) as DashboardSnapshot;
  return json;
}

export async function saveSnapshot(userId: string, snapshot: DashboardSnapshot): Promise<void> {
  const base = getBaseUrl();
  if (!base) {
    // No backend configured yet; log and exit successfully
    console.log('[sync] Would save snapshot (no API configured):', { userId, snapshot });
    return;
  }

  const url = `${base}/snapshot`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({
      userId,
      snapshot,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to save snapshot (${res.status})`);
  }
}
