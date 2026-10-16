import { format, formatDistanceToNow, isValid } from "date-fns";
import { useLinksQuery } from "@/lib/api/queries/useLinksQuery";
import { Loader2Icon } from "lucide-react";

const HOST = "dortrl.dev";

function createdAgo(iso: string): string {
  const date = new Date(iso);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "";
}

function expiryDate(iso: string): string {
  const date = new Date(iso);
  if (!isValid(date)) return "";
  const thisYear = new Date().getFullYear() === date.getFullYear();
  return format(date, thisYear ? "MMM d" : "MMM d, yyyy");
}

function statusOf(expiresAt: string | null): { text: string; dead: boolean } {
  if (!expiresAt) return { text: "no expiry", dead: false };
  const then = new Date(expiresAt).getTime();
  if (Number.isNaN(then)) return { text: "no expiry", dead: false };
  if (then <= Date.now()) return { text: "expired", dead: true };
  return { text: `expires ${expiryDate(expiresAt)}`, dead: false };
}

export default function LinksView() {
  const { isPending, isError, error, data, isFetching } = useLinksQuery();

  if (isPending) {
    return (
      <div
        role="status"
        className="flex min-h-48 w-full max-w-2xl items-center justify-center"
      >
        <Loader2Icon className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-2xl rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
        <p className="text-sm font-medium">Couldn't load your links</p>
        {error?.message ? (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {error.message}
          </p>
        ) : null}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex w-full max-w-2xl flex-col items-center gap-1 py-10 text-center">
        <p className="font-label text-sm text-muted-foreground">no links yet</p>
        <p className="text-sm text-muted-foreground">
          Shorten your first link and it will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="font-label text-xs text-muted-foreground">
          links · {data.length}
        </p>
        {isFetching ? (
          <p className="font-label text-xs text-muted-foreground">refreshing</p>
        ) : null}
      </div>
      <ol className="divide-y divide-border border-y border-border">
        {data.map((link) => {
          const status = statusOf(link.expires_at);
          const created = createdAgo(link.created_at);
          return (
            <li
              key={link.id}
              className="grid gap-x-6 gap-y-1 py-4 md:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium tracking-tight">
                  {link.link_text}
                </p>
                <p className="mt-1 truncate font-label text-xs text-muted-foreground">
                  <span className="font-semibold text-[#1f6fe0] dark:text-[#6ba4f5]">
                    {HOST}/{link.short_code}
                  </span>
                  <span title={link.original_url}> · {link.original_url}</span>
                </p>
              </div>
              <p className="font-label text-xs whitespace-nowrap text-muted-foreground md:pt-1 md:text-right">
                <span
                  className={status.dead ? "text-destructive" : undefined}
                >
                  {status.text}
                </span>
                {created ? ` · ${created}` : null}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}