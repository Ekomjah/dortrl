import { Link } from "react-router";

import { AddLinkForm } from "@/features/links/AddLinkForm";
import { LinkList } from "@/features/links/LinkList";
import { useLinksQuery } from "@/lib/api/queries/useLinksQuery";

const RECENT_LIMIT = 6;

export default function Dashboard() {
  const { data, isPending, isError, error, isFetching } = useLinksQuery();

  const total = data?.length ?? 0;
  const recent = data?.slice(0, RECENT_LIMIT);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm">you're our user now</p>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Recent links</h1>
          {total > 0 ? (
            <span className="text-muted-foreground text-sm tabular-nums">
              {total} total
            </span>
          ) : null}
        </div>
      </header>

      <AddLinkForm />

      <LinkList
        links={recent}
        isPending={isPending}
        isError={isError}
        error={error}
        isFetching={isFetching}
      />

      {total > RECENT_LIMIT ? (
        <Link
          to="/links"
          className="self-start text-sm text-[#1f6fe0] hover:underline dark:text-[#6ba4f5]"
        >
          All {total} links →
        </Link>
      ) : null}
    </div>
  );
}
