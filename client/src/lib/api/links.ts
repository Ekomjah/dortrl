import { REDIRECT_BASE } from "./config";

const rawHost =
  import.meta.env.VITE_SHORT_DOMAIN?.trim() ||
  (import.meta.env.DEV ? "http://localhost:5173" : "dortrl.dev");

export const SHORT_HOST = rawHost
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

const shortProtocol = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(SHORT_HOST)
  ? "http"
  : "https";

export function shortLabel(code: string): string {
  return `${SHORT_HOST}/${code}`;
}

export function fullURL(code: string): string {
  return `${window.location.origin}/${code}`;
}

export function shortHref(code: string): string {
  return `${shortProtocol}://${SHORT_HOST}/${code}`;
}

export function redirectHref(code: string): string {
  return `${REDIRECT_BASE.replace(/\/$/, "")}/${code}`;
}
