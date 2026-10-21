import { Link, useSearchParams } from "react-router";

export function LinkNotFoundPage() {
  const [params] = useSearchParams();
  const code = params.get("code");

  return (
    <main className="mx-auto grid min-h-svh max-w-xl place-content-center gap-5 px-5 text-center sm:px-6">
      <h1 className="text-[clamp(2.5rem,7.5vw,4.25rem)] leading-[0.95] font-black tracking-[-0.04em] text-balance">
        That link doesn’t{" "}
        <span className="whitespace-nowrap text-[#1f6fe0] underline decoration-[#1f6fe0]/35 decoration-[0.07em] underline-offset-[0.12em]">
          go anywhere
        </span>
        .
      </h1>
      <p className="text-foreground/70 text-base leading-relaxed text-pretty sm:text-lg">
        {code ? (
          <>
            <code className="font-mono">/{code}</code> doesn’t exist or has
            expired.
          </>
        ) : (
          "This link doesn’t exist or has expired."
        )}{" "}
        Check the address, or make a new one.
      </p>
      <div>
        <Link
          to="/"
          className="inline-flex rounded-md px-4 py-2 font-semibold text-[#1f6fe0] underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-[#1f6fe0]/40 focus-visible:outline-none"
        >
          Shorten a link
        </Link>
      </div>
    </main>
  );
}