import { useState } from "react";
import { Link } from "react-router";

import { type Link as LinkRecord } from "@/lib/api/api";
import { fullURL, redirectHref, shortHref, shortLabel } from "@/lib/api/links";
import { actionClass, destructiveActionClass } from "./actionStyles";
import { DeleteConfirm } from "./DeleteConfirm";
import { EditLinkForm } from "./EditLinkForm";
import { createdAgo, linkStatus } from "./linkUtils";

export function LinkRow({ link }: { link: LinkRecord }) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [copied, setCopied] = useState(false);

  const status = linkStatus(link.expires_at);
  const created = createdAgo(link.created_at);
  const label = shortLabel(link.link_text ? link.link_text : link.short_code);
  const url = fullURL(link.link_text ? link.link_text : link.short_code);
  async function copy() {
    try {
      await navigator.clipboard.writeText(shortHref(link.short_code));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard is unavailable in insecure contexts.
    }
  }

  if (mode === "edit") {
    return (
      <li className="py-4">
        <EditLinkForm link={link} onDone={() => setMode("view")} />
      </li>
    );
  }

  if (mode === "delete") {
    return (
      <li className="py-4">
        <DeleteConfirm
          code={link.short_code}
          label={label}
          onCancel={() => setMode("view")}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="grid gap-x-6 gap-y-1.5 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Link
              to={url}
              className="text-[15px] font-semibold tracking-tight text-[#1f6fe0] tabular-nums hover:underline dark:text-[#6ba4f5]"
            >
              {label}
            </Link>
            {link.link_text ? (
              <span className="text-foreground/80 truncate text-sm">
                {link.link_text}
              </span>
            ) : null}
          </div>
          <p
            className="text-muted-foreground mt-1 truncate text-sm"
            title={link.original_url}
          >
            {link.original_url}
          </p>
        </div>
        <p className="text-muted-foreground text-xs whitespace-nowrap tabular-nums md:text-right">
          <span className={status.expired ? "text-destructive" : undefined}>
            {status.label}
          </span>
          {created ? ` · created ${created}` : null}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <a
          href={redirectHref(link.short_code)}
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
        <Link to={`/links/${link.short_code}`} className={actionClass}>
          stats
        </Link>
        <button
          type="button"
          className={destructiveActionClass}
          onClick={() => setMode("delete")}
        >
          delete
        </button>
      </div>
    </li>
  );
}
