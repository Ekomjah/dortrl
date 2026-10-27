import { Link } from "react-router";

import {
  ActionRow,
  GUEST_ACTION,
  LANDING_ACTIONS,
} from "@/features/landing/ActionRow";
import {
  CAPABILITIES,
  CapabilityList,
} from "@/features/landing/CapabilityList";
import { ShortenConsole } from "@/features/landing/ShortenConsole";
import { Cable } from "lucide-react";

const HOME_ACTIONS = [...LANDING_ACTIONS, GUEST_ACTION];

function App() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="border-border relative overflow-hidden border-b bg-[radial-gradient(90%_60%_at_50%_-10%,rgba(31,111,224/0.12),transparent)]">
        <header className="fixed top-0 right-0 left-0 z-100 w-full bg-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5">
            <Link
              to="/"
              className="flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-[#1f6fe0]/40 focus-visible:outline-none"
            >
              <Cable className="text-[#1010107e]" />
              <span className="text-lg font-black tracking-tight max-[359px]:hidden">
                Dortrl
              </span>
            </Link>
            <ActionRow />
          </div>
        </header>

        <div
          id="landing"
          className="mx-auto mt-20 grid w-full max-w-6xl gap-x-10 px-5 pb-16 sm:px-6 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center"
        >
          <div className="max-w-xl">
            <h1 className="text-[clamp(2.5rem,7.5vw,4.5rem)] leading-[0.95] font-black tracking-[-0.04em] text-balance">
              Short links you can{" "}
              <span className="whitespace-nowrap text-[#1f6fe0] decoration-[#1f6fe0]/35 decoration-[0.07em] underline-offset-[0.12em]">
                say out loud
              </span>
              .
            </h1>

            <p className="text-foreground/70 mt-5 max-w-md text-base leading-relaxed text-pretty sm:mt-6 sm:text-lg">
              Dortrl turns a long URL into a six-character alias, then tells you
              who clicked it, when, and from where.
            </p>

            <div className="mt-8 sm:mt-10">
              <ActionRow actions={HOME_ACTIONS} />
            </div>
          </div>

          <div className="group relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="overflow-clip mask-[linear-gradient(to_bottom,#000_60%,transparent)]">
              <img
                src="/world.png"
                alt=""
                aria-hidden="true"
                width={1920}
                height={1920}
                draggable={false}
                className="pointer-events-none mx-auto aspect-square w-56 animate-[spin_60s_linear_infinite] object-contain select-none group-focus-within:[animation-play-state:paused] motion-reduce:animate-none sm:w-72 lg:w-full"
              />
            </div>
            <div className="relative z-10 -mt-12 sm:-mt-16 lg:-mt-20">
              <ShortenConsole />
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="mb-8 sm:mb-10">
          <p className="text-[11px] font-medium tracking-[0.18em] text-[#0a54c4] uppercase">
            what you get
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Three things, done properly.
          </h2>
        </div>
        <CapabilityList items={CAPABILITIES} />
      </section>

      <section className="relative overflow-hidden bg-linear-to-b from-[#1f6fe0] to-[#0a3f96]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-7 px-5 py-16 text-center sm:px-6 sm:py-20 md:flex-row md:items-center md:justify-between md:gap-12 md:text-left lg:py-24">
          <div className="max-w-xl">
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.05] font-black tracking-[-0.03em] text-white">
              Shorten your first link in under a minute.
            </h2>
            <p className="mt-3 text-sm text-white/70 sm:text-base">
              Create an account, paste a URL, and watch the clicks arrive.
            </p>
          </div>
          <ActionRow actions={HOME_ACTIONS} tone="onBlue" />
        </div>
      </section>
    </div>
  );
}

export default App;
