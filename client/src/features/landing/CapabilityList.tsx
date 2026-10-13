export interface Capability {
  label: string;
  title: string;
  body: string;
}

export const CAPABILITIES: Capability[] = [
  {
    label: "Shorten",
    title: "Six characters, every time.",
    body: "Paste a URL and get an alias fixed at six characters. Same destination every time, so there is nothing to remember.",
  },
  {
    label: "Trace",
    title: "Every click, accounted for.",
    body: "Dortrl logs the time, the country, and the referrer behind each visit, so you can tell what a link is actually doing.",
  },
  {
    label: "Expire",
    title: "Links that retire themselves.",
    body: "Give a link an end date and it stops resolving on its own. No cleanup job left behind.",
  },
];

export function CapabilityList({ items = CAPABILITIES }: { items?: Capability[] }) {
  return (
    <dl className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid gap-x-10 gap-y-2 py-8 md:grid-cols-[9rem_minmax(0,1fr)]"
        >
          <dt className="pt-1 font-mono text-xs uppercase tracking-[0.16em] text-[#1f6fe0] dark:text-[#6ba4f5]">
            {item.label}
          </dt>
          <dd>
            <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
            <p className="mt-2 max-w-prose text-foreground/70">{item.body}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}