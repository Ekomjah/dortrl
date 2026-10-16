import { Navigate, Outlet } from "react-router";

import { authClient } from "@/lib/auth/auth-client";
import { Loader2Icon } from "lucide-react";

export function ProtectedRoute() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
