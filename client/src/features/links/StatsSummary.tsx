import { format } from "date-fns";

import type { LinkStats } from "@/lib/api/api";
import { ClickStrip } from "./ClickStrip";
import {
  countSince,
  createdAgo,
  describeUserAgent,
  maskIp,
  referrerHost,
  sortByClickedAt,
  topReferrers,
} from "./linkUtils";

export function StatsSummary({ link }: { link: LinkStats }) {
  const clicks = sortByClickedAt(link.clicks);

  if (clicks.length === 0) {
    return (
      <div className="border-border rounded-xl border border-dashed px-4 py-10 text-center">
        <p className="text-sm font-medium">No clicks yet</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Share the link and the first click will show up here.
        </p>
      </div>
    );
  }

  const last7 = countSince(clicks, 7);
  const last30 = countSince(clicks, 30);
  const referrers = topReferrers(clicks);
  const recent = clicks.slice(0, 20);
  const lastClick = clicks[0];

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight tabular-nums">
            {clicks.length}
          </span>
          <span className="text-muted-foreground text-sm">
            {clicks.length === 1 ? "click" : "clicks"}
          </span>
        </div>
        <span className="text-muted-foreground text-sm tabular-nums">
          {last7} in the last 7 days
        </span>
        <span className="text-muted-foreground text-sm tabular-nums">
          {last30} in the last 30 days
        </span>
        {lastClick ? (
          <span className="text-muted-foreground text-sm">
            last click {createdAgo(lastClick.clicked_at)}
          </span>
        ) : null}
      </div>

      <ClickStrip clicks={clicks} />

      <div>
        <h2 className="text-sm font-semibold">Referrers</h2>
        <ul className="divide-border border-border mt-2 divide-y border-y">
          {referrers.map(([host, count]) => (
            <li
              key={host}
              className="flex items-baseline justify-between gap-4 py-2 text-sm"
            >
              <span className="truncate">{host}</span>
              <span className="text-muted-foreground shrink-0 tabular-nums">
                {count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold">Recent clicks</h2>
        <ul className="divide-border border-border mt-2 divide-y border-y">
          {recent.map((click, index) => (
            <li key={`${click.clicked_at}-${index}`} className="py-2">
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="truncate">{referrerHost(click.referrer)}</span>
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {format(new Date(click.clicked_at), "MMM d, HH:mm")}
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {describeUserAgent(click.user_agent)} ·{" "}
                {maskIp(click.ip_address)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
