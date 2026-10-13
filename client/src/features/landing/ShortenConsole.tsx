import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import CustomBtn from "@/features/Button";

const ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";
const HOST = "dortrl.dev";
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
      className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_3px_rgb(0_0_0/0.05)]"
    >
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="https://"
          aria-label="Long URL"
          spellCheck={false}
          className="font-mono text-sm"
        />
        <CustomBtn text={resolving ? "Resolving" : "Shorten"} type="submit" />
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          alias
        </span>
        <p
          className="mt-1.5 font-mono text-lg font-semibold tracking-tight text-[#1f6fe0] transition-opacity motion-reduce:transition-none dark:text-[#6ba4f5]"
          aria-live="polite"
        >
          {empty ? `${HOST}/······` : alias}
        </p>
        <p className="mt-1.5 font-mono text-xs text-muted-foreground">
          {empty
            ? "Paste a link to see its alias"
            : `${trimmed.length} → ${alias.length} characters · no expiry`}
        </p>
      </div>
    </form>
  );
}
