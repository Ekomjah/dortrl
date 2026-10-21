import { Link } from "react-router";
import { useState, useEffect } from "react";
import { ActionRow, LANDING_ACTIONS } from "@/features/landing/ActionRow";
import { Button } from "@/components/ui/button";
import {
  CAPABILITIES,
  CapabilityList,
} from "@/features/landing/CapabilityList";
import { ShortenConsole } from "@/features/landing/ShortenConsole";
import CustomBtn from "@/features/Button";
import { authClient } from "@/lib/auth/auth-client";
import { Cable, House } from "lucide-react";

function App() {
  const [session, setSession] = useState<
    Awaited<ReturnType<typeof authClient.getSession>>["data"] | null
  >(null);

  useEffect(() => {
    async function getAuth() {
      const { data: clientSession } = await authClient.getSession();
      setSession(clientSession);
    }
    getAuth();
  }, []);
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="border-border border-b bg-[radial-gradient(70%_55%_at_50%_-10%,rgba(31,111,224/0.10),transparent)]">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="flex items-center gap-2.5">
            <Cable />
            <span className="text-lg font-black tracking-tight">Dortrl</span>
          </span>
          <div>
            {session ? (
              <div>
                <CustomBtn
                  text="Go to dashboard"
                  to="/dashboard"
                  icon={<House />}
                />
              </div>
            ) : (
              <div className="flex gap-x-4">
                <Link
                  to="/sign-up"
                  className="text-foreground/70 hover:text-foreground text-sm font-medium transition-colors"
                >
                  <CustomBtn type="button" text="Create an Account" />
                </Link>
                <Link
                  to="/login"
                  className="text-foreground/70 hover:text-foreground text-sm font-medium transition-colors"
                >
                  <Button variant="outline" type="button">
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-14 px-6 pt-12 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-center lg:gap-16 lg:pb-32">
          <div>
            <h1 className="mt-5 text-5xl leading-[0.95] font-black tracking-[-0.035em] sm:text-6xl">
              Short links you can say out loud.
            </h1>
            <p className="text-foreground/70 mt-5 max-w-lg text-lg">
              Dortrl turns a long URL into a six-character alias, then tells you
              who clicked it, when, and from where.
            </p>
            <div className="mt-8">
              <ActionRow actions={LANDING_ACTIONS} />
            </div>
          </div>

          <ShortenConsole />
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <CapabilityList items={CAPABILITIES} />
      </section>

      <section className="bg-linear-to-b from-[#1f6fe0] to-[#0a3f96]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center">
          <h2 className="max-w-2xl text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
            Shorten your first link in under a minute.
          </h2>
          <ActionRow actions={LANDING_ACTIONS} tone="onBlue" />
        </div>
      </section>
    </div>
  );
}

export default App;
