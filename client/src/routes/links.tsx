import { useMemo, useState } from "react";

import { GuestNotice } from "@/components/guest-notice";
import { Input } from "@/components/ui/input";
import { AddLinkForm } from "@/features/links/AddLinkForm";
import { LinkList } from "@/features/links/LinkList";
import { useLinksQuery } from "@/lib/api/queries/useLinksQuery";
import { useIsGuest } from "@/lib/auth/useIsGuest";

export default function LinksPage() {
  const { data, isPending, isError, error, isFetching } = useLinksQuery();
  const guest = useIsGuest();
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return data;
    return data?.filter(
      (link) =>
        link.short_code.toLowerCase().includes(query) ||
        (link.link_text ?? "").toLowerCase().includes(query) ||
        link.original_url.toLowerCase().includes(query),
    );
  }, [data, filter]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Links</h1>
        <span className="text-muted-foreground text-sm tabular-nums">
          {data?.length ?? 0} total
        </span>
      </header>

      {guest ? <GuestNotice /> : null}

      <AddLinkForm />

      <Input
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Filter by alias, slug, or URL"
        aria-label="Filter links"
      />

      <LinkList
        links={filtered}
        isPending={isPending}
        isError={isError}
        error={error}
        isFetching={isFetching}
        isGuest={guest}
        emptyMessage={
          filter
            ? "No links match that filter."
            : "No links yet. Create your first one above."
        }
      />
    </div>
  );
}
