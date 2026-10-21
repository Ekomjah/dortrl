import { useState } from "react";

import { Input } from "@/components/ui/input";
import CustomBtn from "@/features/Button";
import type { Link } from "@/lib/api/api";
import { getApiError } from "@/lib/api/getAPIError";
import { useUpdateLink } from "@/lib/api/mutations/useLinkMutations";
import { actionClass } from "./actionStyles";
import {
  fromDateInputValue,
  toDateInputValue,
  tomorrowInputValue,
} from "./linkUtils";

export function EditLinkForm({
  link,
  onDone,
}: {
  link: Link;
  onDone: () => void;
}) {
  const [url, setUrl] = useState(link.original_url);
  const [slug, setSlug] = useState(link.link_text ?? "");
  const [expiry, setExpiry] = useState(toDateInputValue(link.expires_at));
  const update = useUpdateLink();
  const error = update.isError ? getApiError(update.error) : null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update.mutate(
      {
        code: link.short_code,
        input: {
          original_url: url.trim(),
          link_text: slug.trim() || undefined,
          expires_at: fromDateInputValue(expiry),
        },
      },
      { onSuccess: onDone },
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          type="url"
          required
          aria-label="Destination URL"
          placeholder="https://example.com"
        />
        <Input
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          aria-label="Custom slug"
          placeholder="custom slug"
          minLength={5}
          maxLength={15}
        />
      </div>
      <div className="grid items-center gap-2 sm:grid-cols-[11rem_auto_auto]">
        <Input
          value={expiry}
          onChange={(event) => setExpiry(event.target.value)}
          type="date"
          min={tomorrowInputValue()}
          aria-label="Expiry date"
        />
        <CustomBtn
          text={update.isPending ? "Saving" : "Save"}
          type="submit"
          disabled={update.isPending}
        />
        <button type="button" className={actionClass} onClick={onDone}>
          Cancel
        </button>
      </div>
      <p className="text-muted-foreground text-xs tabular-nums">
        {link.short_code} · slug is optional, 5–15 characters
        {link.expires_at ? " · expiry can be changed but not removed" : ""}
      </p>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error.message}
        </p>
      ) : null}
    </form>
  );
}
