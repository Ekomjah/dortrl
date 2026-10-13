import { Link } from "react-router";

import beaver from "@/assets/beaver.svg";
import { ActionRow, LANDING_ACTIONS } from "@/features/landing/ActionRow";
import {
  CAPABILITIES,
  CapabilityList,
} from "@/features/landing/CapabilityList";
import { ShortenConsole } from "@/features/landing/ShortenConsole";
import CustomBtn from "@/features/Button";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-[radial-gradient(70%_55%_at_50%_-10%,rgba(31,111,224/0.10),transparent)]">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="flex items-center gap-2.5">
            <img src={beaver} alt="" className="size-7" />
            <span className="text-lg font-black tracking-tight">Dortrl</span>
          </span>
          <Link
            to="/login"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            <CustomBtn type="button" text="Login" />
          </Link>
        </header>

        <div className="mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-center lg:gap-16 lg:pb-32">
          <div>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.035em] sm:text-6xl">
              Short links you can say out loud.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-foreground/70">
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
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/70">
            free · no credit card
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
