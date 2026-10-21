const shortDomain = import.meta.env.VITE_SHORT_DOMAIN?.trim();

const shortHost = shortDomain
  ? shortDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")
  : typeof window === "undefined"
    ? ""
    : window.location.host;

const shortBase = shortDomain
  ? `https://${shortHost}`
  : typeof window === "undefined"
    ? ""
    : window.location.origin;

export const SHORT_HOST = shortHost;

export function shortUrl(code: string): string {
  return `${shortBase}/s/${code}`;
}

export function shortLabel(code: string): string {
  return `${SHORT_HOST}/s/${code}`;
}
