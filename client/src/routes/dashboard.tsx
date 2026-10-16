import CustomBtn from "@/features/Button";
import LinksView from "@/features/links/linksView";
import { authClient } from "@/lib/auth/auth-client";
import { useSignOut } from "@/lib/auth/useSignOut";

export default function Dashboard() {
  const { data: session } = authClient.useSession();
  const signOut = useSignOut();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-bold">you're our user now</h1>
      {session?.user?.email ? (
        <p className="text-muted-foreground text-sm">{session.user.email}</p>
      ) : null}
      <CustomBtn text="Logout" onClick={signOut} />
      <LinksView />
    </div>
  );
}
