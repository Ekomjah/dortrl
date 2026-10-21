import { format, formatDistanceToNow, isValid, subDays } from "date-fns";

export interface LinkStatus {
  label: string;
  expired: boolean;
}

export function createdAgo(iso: string): string {
  const date = new Date(iso);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "";
}

export function dateLabel(iso: string): string {
  const date = new Date(iso);
  if (!isValid(date)) return "";
  const sameYear = new Date().getFullYear() === date.getFullYear();
  return format(date, sameYear ? "MMM d" : "MMM d, yyyy");
}

export function linkStatus(expiresAt: string | null): LinkStatus {
  if (!expiresAt) return { label: "no expiry", expired: false };

  const expiry = new Date(expiresAt);
  if (!isValid(expiry)) return { label: "no expiry", expired: false };
  if (expiry.getTime() <= Date.now())
    return { label: "expired", expired: true };

  return { label: `expires ${dateLabel(expiresAt)}`, expired: false };
}

export function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return isValid(date) ? format(date, "yyyy-MM-dd") : "";
}

export function fromDateInputValue(value: string): string | undefined {
  if (!value) return undefined;
  const endOfDay = new Date(`${value}T23:59:59`);
  return isValid(endOfDay) ? endOfDay.toISOString() : undefined;
}

export function tomorrowInputValue(): string {
  return format(subDays(new Date(), -1), "yyyy-MM-dd");
}

export function countSince(
  clicks: { clicked_at: string }[],
  days: number,
): number {
  const cutoff = subDays(new Date(), days).getTime();
  return clicks.filter((click) => {
    const at = new Date(click.clicked_at).getTime();
    return Number.isFinite(at) && at >= cutoff;
  }).length;
}

export function referrerHost(referrer: string | null): string {
  if (!referrer) return "direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

export function describeUserAgent(userAgent: string | null): string {
  if (!userAgent) return "unknown";

  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "Other";

  const platform = /iPhone|iPad|iPod/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Mac OS X/.test(userAgent)
        ? "macOS"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "Unknown";

  return `${browser} · ${platform}`;
}

export function maskIp(ip: string | null): string {
  if (!ip) return "unknown";
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return `${parts.slice(0, 3).join(":")}:…`;
  }
  const parts = ip.split(".");
  if (parts.length !== 4) return "unknown";
  return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
}

export function topReferrers(
  clicks: { referrer: string | null }[],
  limit = 5,
): [string, number][] {
  const counts = new Map<string, number>();

  for (const click of clicks) {
    const host = referrerHost(click.referrer);
    counts.set(host, (counts.get(host) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export function sortByClickedAt<T extends { clicked_at: string }>(
  clicks: T[],
): T[] {
  return [...clicks].sort(
    (a, b) =>
      new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime(),
  );
}
