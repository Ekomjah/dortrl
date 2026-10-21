const rawHost =
  import.meta.env.VITE_SHORT_DOMAIN?.trim() || "http://localhost:5173";

export const SHORT_HOST = rawHost
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL?.trim() || "http://localhost:8787";

export function shortLabel(code: string): string {
  return `${SHORT_HOST}/${code}`;
}

export function fullURL(code: string): string {
  return `${rawHost}/${code}`;
}

export function shortHref(code: string): string {
  return `https://${SHORT_HOST}/${code}`;
}

export function redirectHref(code: string): string {
  return `${SERVER_URL.replace(/\/$/, "")}/${code}`;
}
