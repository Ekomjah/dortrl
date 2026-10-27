import { Loader2Icon } from "lucide-react";
import type { Link as LinkRecord } from "@/lib/api/api";
import type { ApiError } from "@/lib/api/getAPIError";
import { LinkRow } from "./LinkRow";

export function LinkList({
  links,
  isPending,
  isError,
  error,
  isFetching = false,
  emptyMessage = "No links yet. Create your first one above.",
  isGuest = false,
}: {
  links: LinkRecord[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: ApiError | null;
  isFetching?: boolean;
  emptyMessage?: string;
  isGuest?: boolean;
}) {
  if (isPending) {
    return (
      <div
        role="status"
        className="flex min-h-32 items-center justify-center"
        aria-label="Loading links"
      >
        <Loader2Icon className="text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-destructive/40 bg-destructive/5 rounded-lg border px-4 py-3">
        <p className="text-sm font-medium">Couldn't load your links</p>
        {error?.message ? (
          <p className="text-muted-foreground mt-1 text-sm">{error.message}</p>
        ) : null}
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {isFetching ? (
        <p className="text-muted-foreground text-xs">Refreshing…</p>
      ) : null}
      <ol className="divide-border border-border divide-y border-y">
        {links.map((link) => (
          <LinkRow key={link.id} link={link} isGuest={isGuest} />
        ))}
      </ol>
    </div>
  );
}
