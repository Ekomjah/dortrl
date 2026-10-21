import { Link, NavLink, Outlet } from "react-router";

import beaver from "@/assets/beaver.svg";
import { authClient } from "@/lib/auth/auth-client";
import { useSignOut } from "@/lib/auth/useSignOut";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-2.5 py-1.5 text-sm transition-colors ${
    isActive
      ? "bg-muted text-foreground font-medium"
      : "text-muted-foreground hover:text-foreground"
  }`;

export function AppShell() {
  const { data: session } = authClient.useSession();
  const signOut = useSignOut();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-6 px-6 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={beaver} alt="" className="size-6" />
            <span className="font-semibold tracking-tight">Dortrl</span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/links" className={navLinkClass}>
              Links
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {session?.user?.email ? (
              <span className="text-muted-foreground hidden truncate text-sm sm:block">
                {session.user.email}
              </span>
            ) : null}
            <button
              type="button"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
