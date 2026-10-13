import CustomBtn from "@/features/Button";

export interface LandingAction {
  label: string;
  to?: string;
  type?: "submit" | "button" | "reset";
  variant?: "solid" | "outline";
  badge?: string;
}

export const LANDING_ACTIONS: LandingAction[] = [
  { label: "Create an account", to: "/sign-up", variant: "solid" },
  { label: "Log in", to: "/login", variant: "outline" },
  { label: "Continue as guest", type: "button", variant: "outline", badge: "soon" },
];

export function ActionRow({
  actions = LANDING_ACTIONS,
  tone = "light",
}: {
  actions?: LandingAction[];
  tone?: "light" | "onBlue";
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 ${
        tone === "onBlue" ? "justify-center" : "justify-start"
      }`}
    >
      {actions.map((action) => (
        <span key={action.label} className="inline-flex items-center gap-2">
          <CustomBtn
            text={action.label}
            to={action.to}
            type={action.type ?? "button"}
            variant={action.variant}
            tone={tone}
          />
          {action.badge ? (
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
                tone === "onBlue" ? "text-white/70" : "text-muted-foreground"
              }`}
            >
              {action.badge}
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}