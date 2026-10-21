import CustomBtn from "@/features/Button";
import { authClient } from "@/lib/auth/auth-client";
import { House, Loader2Icon } from "lucide-react";

export interface LandingAction {
  label: string;
  to?: string;
  type?: "submit" | "button" | "reset";
  variant?: "solid" | "outline";
  badge?: string;
}

export const LANDING_ACTIONS: LandingAction[] = [
  { label: "Create account", to: "/sign-up", variant: "solid" },
  { label: "Log in", to: "/login", variant: "outline" },
];

export function ActionRow({
  actions = LANDING_ACTIONS,
  tone = "light",
}: {
  actions?: LandingAction[];
  tone?: "light" | "onBlue";
}) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) {
    return (
      <Loader2Icon
        role="status"
        aria-label="Checking session"
        className="text-muted-foreground size-4 animate-spin motion-reduce:animate-none"
      />
    );
  }

  if (!isPending && session) {
    return (
      <CustomBtn text="Go to dashboard" to="/dashboard" icon={<House />} />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action) => (
        <CustomBtn
          key={action.label}
          text={action.label}
          to={action.to}
          type={action.type ?? "button"}
          variant={action.variant}
          tone={tone}
        />
      ))}
    </div>
  );
}
