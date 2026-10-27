import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import CustomBtn from "@/features/Button";
import { authClient } from "@/lib/auth/auth-client";
import { House, Loader2Icon } from "lucide-react";

export interface LandingAction {
  label: string;
  to?: string;
  type?: "submit" | "button" | "reset";
  variant?: "solid" | "outline";
  badge?: string;
  kind?: "anonymous";
}

export const LANDING_ACTIONS: LandingAction[] = [
  { label: "Create account", to: "/sign-up", variant: "solid" },
  { label: "Log in", to: "/login", variant: "outline" },
  {
    label: "Continue as guest",
    to: "/dashboard",
    kind: "anonymous",
    variant: "outline",
  },
];

export function ActionRow({
  actions = LANDING_ACTIONS,
  tone = "light",
}: {
  actions?: LandingAction[];
  tone?: "light" | "onBlue";
}) {
  const { data: session, isPending, refetch } = authClient.useSession();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestTarget, setGuestTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!guestTarget || !session) return;
    navigate(guestTarget, { replace: true });
    setGuestTarget(null);
  }, [guestTarget, session, navigate]);

  async function startGuest(target: string) {
    if (starting) return;
    setStarting(true);
    setError(null);
    try {
      const { error } = await authClient.signIn.anonymous();
      if (
        error &&
        error.code !== "ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY"
      ) {
        setError(error.message ?? "Could not start a guest session.");
        return;
      }
      setGuestTarget(target);
      void refetch();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setStarting(false);
    }
  }

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
      {actions.map((action) =>
        action.kind === "anonymous" ? (
          <CustomBtn
            key={action.label}
            text={starting ? "Starting" : action.label}
            type="button"
            variant={action.variant}
            tone={tone}
            onClick={() => startGuest(action.to ?? "/dashboard")}
            disabled={starting}
          />
        ) : (
          <CustomBtn
            key={action.label}
            text={action.label}
            to={action.to}
            type={action.type ?? "button"}
            variant={action.variant}
            tone={tone}
          />
        ),
      )}
      {error ? (
        <p className="text-destructive basis-full text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
