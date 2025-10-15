const KEY = "od:gcal:embed";

function appendParam(url, key, value) {
  try {
    const u = new URL(url, window.location.origin);
    u.searchParams.set(key, value);
    return u.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
}

function ensureTimezone(url) {
  if (!url) return url;
  if (/[?&]ctz=/.test(url)) return url;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return appendParam(url, "ctz", tz);
}

const DEFAULT_FALLBACK = "https://calendar.google.com/calendar/embed?src=axa51310%40ucmo.edu&ctz=America%2FChicago";

export function getEmbedUrl() {
  const env = (process.env.REACT_APP_GCAL_EMBED_URL || process.env.VITE_GCAL_EMBED_URL);
  const stored = localStorage.getItem(KEY);
  const raw = stored || env || DEFAULT_FALLBACK || undefined;
  return raw ? ensureTimezone(raw) : undefined;
}

export function setEmbedUrl(url) {
  if (url) localStorage.setItem(KEY, url);
}

export function withParam(url, key, value) {
  const next = appendParam(url, key, value);
  return ensureTimezone(next);
}

export default { getEmbedUrl, setEmbedUrl, withParam };