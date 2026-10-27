import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

const providers = [
  {
    id: "google",
    label: "Continue with Google",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@2.18.0/icons/google/google-original.svg",
  },
  {
    id: "github",
    label: "Continue with GitHub",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@2.18.0/icons/github/github-original.svg",
  },
] as const;

type SocialProvider = (typeof providers)[number]["id"];

const socialButtonClass =
  "h-10 w-full justify-center rounded-lg border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 active:translate-y-px";

const oauthErrorMessages: Record<string, string> = {
  access_denied: "Sign-in was cancelled.",
  account_not_linked:
    "An account with this email already exists. Verify your email or sign in, then try again.",
};

export function SocialAuthButtons() {
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (!oauthError) return;
    const description = searchParams.get("error_description");
    setError(
      oauthErrorMessages[oauthError] ??
        description ??
        "Could not sign you in. Please try again.",
    );
    const next = new URLSearchParams(searchParams);
    next.delete("error");
    next.delete("error_description");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSocial = async (provider: SocialProvider) => {
    if (pending) return;
    setError(null);
    setPending(provider);
    try {
      const { error: signInError } = await authClient.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/dashboard`,
        errorCallbackURL: `${window.location.origin}${window.location.pathname}`,
      });
      if (signInError) {
        setError(
          signInError.message ?? "Could not sign you in. Please try again.",
        );
        setPending(null);
      }
    } catch (err) {
      console.error("Social sign-in failed:", err);
      setError("Network error. Please try again.");
      setPending(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            type="button"
            variant="outline"
            className={socialButtonClass}
            disabled={pending !== null}
            onClick={() => handleSocial(provider.id)}
          >
            {pending === provider.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <img src={provider.icon} alt="" className="size-[18px]" />
            )}
            {provider.label}
          </Button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-300" />
        <span className="text-xs font-medium tracking-wide text-gray-500">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-gray-300" />
      </div>
    </div>
  );
}
