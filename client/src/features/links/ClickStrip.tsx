import { format, startOfDay, subDays } from "date-fns";

export function ClickStrip({
  clicks,
  days = 14,
}: {
  clicks: { clicked_at: string }[];
  days?: number;
}) {
  const today = startOfDay(new Date());

  const buckets = Array.from({ length: days }, (_, index) => {
    const day = subDays(today, days - 1 - index);
    const nextDay = subDays(day, -1);
    const count = clicks.filter((click) => {
      const at = new Date(click.clicked_at).getTime();
      return at >= day.getTime() && at < nextDay.getTime();
    }).length;
    return { day, count };
  });

  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));

  return (
    <div>
      <div className="flex h-16 items-end gap-1">
        {buckets.map(({ day, count }) => (
          <div
            key={day.toISOString()}
            title={`${format(day, "MMM d")}: ${count} ${
              count === 1 ? "click" : "clicks"
            }`}
            className={`flex-1 rounded-sm ${
              count === 0 ? "bg-border" : "bg-[#1f6fe0]"
            }`}
            style={{
              height:
                count === 0 ? "3px" : `${Math.max(12, (count / max) * 100)}%`,
            }}
          />
        ))}
      </div>
      <div className="text-muted-foreground mt-1.5 flex justify-between text-[11px] tabular-nums">
        <span>{format(buckets[0].day, "MMM d")}</span>
        <span>last {days} days</span>
        <span>{format(buckets[days - 1].day, "MMM d")}</span>
      </div>
    </div>
  );
}
