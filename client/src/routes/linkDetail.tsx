import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Loader2Icon } from "lucide-react";

import {
  actionClass,
  destructiveActionClass,
} from "@/features/links/actionStyles";
import { DeleteConfirm } from "@/features/links/DeleteConfirm";
import { EditLinkForm } from "@/features/links/EditLinkForm";
import { StatsSummary } from "@/features/links/StatsSummary";
import { createdAgo, linkStatus } from "@/features/links/linkUtils";
import { redirectHref, shortHref, shortLabel } from "@/lib/api/links";
import { useLinkStatsQuery } from "@/lib/api/queries/useLinkStatsQuery";

export default function LinkDetail() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useLinkStatsQuery(code);
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shortHref(code));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard is unavailable in insecure contexts.
    }
  }

  if (isPending) {
    return (
      <div role="status" className="flex min-h-48 items-center justify-center">
        <Loader2Icon className="text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-lg font-semibold">Link not found</p>
        <p className="text-muted-foreground text-sm">
          {error?.message ?? "This link doesn't exist or isn't yours."}
        </p>
        <Link
          to="/links"
          className="text-sm text-[#1f6fe0] hover:underline dark:text-[#6ba4f5]"
        >
          Back to links
        </Link>
      </div>
    );
  }

  const status = linkStatus(data.expires_at);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link to="/links" className={actionClass}>
          ← Links
        </Link>
      </div>

      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h1 className="text-2xl font-bold tracking-tight tabular-nums">
            {shortLabel(data.short_code)}
          </h1>
          {data.link_text ? (
            <span className="text-muted-foreground text-lg">
              {data.link_text}
            </span>
          ) : null}
        </div>
        <p className="text-muted-foreground text-sm">
          <span className={status.expired ? "text-destructive" : undefined}>
            {status.label}
          </span>{" "}
          · created {createdAgo(data.created_at)}
        </p>
      </header>

      {mode === "edit" ? (
        <EditLinkForm link={data} onDone={() => setMode("view")} />
      ) : mode === "delete" ? (
        <DeleteConfirm
          code={data.short_code}
          label={shortLabel(data.short_code)}
          onCancel={() => setMode("view")}
          onDeleted={() => navigate("/links")}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href={redirectHref(data.short_code)}
            target="_blank"
            rel="noopener noreferrer"
            className={actionClass}
          >
            open
          </a>
          <button type="button" className={actionClass} onClick={copy}>
            {copied ? "copied" : "copy"}
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={() => setMode("edit")}
          >
            edit
          </button>
          <button
            type="button"
            className={destructiveActionClass}
            onClick={() => setMode("delete")}
          >
            delete
          </button>
        </div>
      )}

      <div className="border-border rounded-xl border p-4">
        <p className="text-muted-foreground text-xs">Destination</p>
        <a
          href={data.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-sm break-all hover:underline"
        >
          {data.original_url}
        </a>
      </div>

      <StatsSummary link={data} />
    </div>
  );
}
