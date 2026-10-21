export interface Capability {
  label: string;
  title: string;
  body: string;
}

export const CAPABILITIES: Capability[] = [
  {
    label: "shorten",
    title: "Six characters, every time.",
    body: "Paste a URL and get an alias fixed at six characters. Same destination every time, so there is nothing to remember.",
  },
  {
    label: "trace",
    title: "Every click, accounted for.",
    body: "Dortrl logs the time, the country, and the referrer behind each visit, so you can tell what a link is actually doing.",
  },
  {
    label: "expire",
    title: "Links that retire themselves.",
    body: "Give a link an end date and it stops resolving on its own. No cleanup job left behind.",
  },
];

export function CapabilityList({
  items = CAPABILITIES,
}: {
  items?: Capability[];
}) {
  return (
    <dl className="divide-border border-border divide-y border-y">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid gap-x-10 gap-y-2 py-8 md:grid-cols-[8rem_minmax(0,1fr)]"
        >
          <dt className="text-muted-foreground text-lg font-medium tracking-tight">
            {item.label}
          </dt>
          <dd>
            <h3 className="text-lg font-medium tracking-tight">{item.title}</h3>
            <p className="text-foreground/70 mt-2 max-w-prose">{item.body}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
