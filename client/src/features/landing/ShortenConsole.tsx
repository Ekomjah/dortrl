import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import CustomBtn from "@/features/Button";
import { SHORT_HOST } from "@/lib/api/links";

const ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";
const HOST = SHORT_HOST;
const CODE_LENGTH = 6;

const SAMPLE =
  "https://github.com/stevedylandev/bhvr/releases/tag/v0.4.0?utm_source=newsletter&utm_medium=email";

function shortCode(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  let out = "";
  h >>>= 0;
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    out += ALPHABET[h % ALPHABET.length];
    h = Math.imul(h, 2654435761) >>> 0;
  }
  return out;
}

export function ShortenConsole() {
  const [draft, setDraft] = useState(SAMPLE);
  const [target, setTarget] = useState(SAMPLE);
  const [resolving, setResolving] = useState(false);

  const code = useMemo(() => shortCode(target), [target]);
  const alias = `${HOST}/${code}`;
  const trimmed = target.trim();
  const empty = trimmed.length === 0;

  function shorten(event: React.FormEvent) {
    event.preventDefault();
    setResolving(true);
    window.setTimeout(() => {
      setTarget(draft);
      setResolving(false);
    }, 160);
  }

  return (
    <form
      onSubmit={shorten}
      className="border-border bg-card rounded-2xl border p-4 shadow-[0_24px_70px_-36px_rgb(10_84_196/0.5)] sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-[11px] font-medium tracking-[0.16em] uppercase">
          preview
        </span>
        <span className="text-muted-foreground text-[11px]">
          nothing is created
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="https://"
          aria-label="Long URL"
          spellCheck={false}
          className="text-sm tabular-nums"
        />
        <CustomBtn
          text={resolving ? "Resolving" : "Shorten"}
          type="submit"
          className="shrink-0"
        />
      </div>

      <div className="border-border mt-4 border-t pt-4">
        <span className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
          alias
        </span>
        <p
          className={`mt-1.5 text-lg font-semibold tracking-tight tabular-nums transition-opacity motion-reduce:transition-none ${
            empty
              ? "text-muted-foreground"
              : "text-[#1f6fe0] dark:text-[#6ba4f5]"
          }`}
          aria-live="polite"
        >
          {empty ? `${HOST}/······` : alias}
        </p>
        <p className="text-muted-foreground mt-1.5 text-[11px] tabular-nums">
          {empty
            ? "Paste a link to see its alias"
            : `${trimmed.length} → ${alias.length} characters · no expiry`}
        </p>
      </div>
    </form>
  );
}
