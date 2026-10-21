import { useState } from "react";

import { Input } from "@/components/ui/input";
import CustomBtn from "@/features/Button";
import { getApiError } from "@/lib/api/getAPIError";
import { useCreateLink } from "@/lib/api/mutations/useLinkMutations";
import { fromDateInputValue, tomorrowInputValue } from "./linkUtils";

const RESERVED = new Set(["health", "links", "api", "stats"]);

function validate(url: string, slug: string, expiry: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return "Enter a full URL, including https://";
  }

  if (!/^https?:$/.test(parsed.protocol)) {
    return "Only http and https links can be shortened.";
  }

  const trimmedSlug = slug.trim();
  if (trimmedSlug) {
    if (trimmedSlug.length < 5 || trimmedSlug.length > 15) {
      return "Slug must be between 5 and 15 characters.";
    }
    if (RESERVED.has(trimmedSlug)) {
      return `"${trimmedSlug}" is reserved. Pick another slug.`;
    }
  }

  if (expiry) {
    const when = new Date(`${expiry}T23:59:59`);
    if (!Number.isFinite(when.getTime()) || when.getTime() <= Date.now()) {
      return "Expiry must be a future date.";
    }
  }

  return null;
}

export function AddLinkForm() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [expiry, setExpiry] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const create = useCreateLink();
  const serverError = create.isError ? getApiError(create.error) : null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const problem = validate(url, slug, expiry);
    setLocalError(problem);
    if (problem) return;

    create.mutate(
      {
        original_url: url.trim(),
        link_text: slug.trim() || undefined,
        expires_at: fromDateInputValue(expiry),
      },
      {
        onSuccess: () => {
          setUrl("");
          setSlug("");
          setExpiry("");
          setLocalError(null);
        },
      },
    );
  }

  const error = localError ?? serverError?.message ?? null;

  return (
    <form
      onSubmit={submit}
      className="border-border rounded-xl border p-3 sm:p-4"
    >
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_auto]">
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          type="url"
          required
          placeholder="https://example.com/a/very/long/link"
          aria-label="Destination URL"
        />
        <Input
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="custom slug"
          aria-label="Custom slug, optional"
          minLength={5}
          maxLength={15}
        />
        <Input
          value={expiry}
          onChange={(event) => setExpiry(event.target.value)}
          type="date"
          min={tomorrowInputValue()}
          aria-label="Expiry date, optional"
        />
        <CustomBtn
          text={create.isPending ? "Creating" : "Create"}
          type="submit"
          disabled={create.isPending}
        />
      </div>
      <p className="text-muted-foreground mt-2 text-xs">
        Slug is optional, 5–15 characters. Leave the date blank for a link that
        never expires.
      </p>
      {error ? (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      ) : null}
    </form>
  );
}
