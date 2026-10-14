import type { RouteObject } from "react-router";
import App from "./index";
import Dashboard from "./dashboard";
import { ProtectedRoute } from "./protected";
import { LoginForm } from "@/features/LoginForm";

import { isRouteErrorResponse, useRouteError, Link } from "react-router";
import { SignUpForm } from "@/features/SignUp";

// eslint-disable-next-line
function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown error";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground text-sm">{message}</p>
      <Link to="/" className="underline">
        Go home
      </Link>
    </div>
  );
}

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    errorElement: <RouteError />,
  },
  {
    path: "/sign-up",
    element: <SignUpForm />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "*",
    element: (
      <div className="flex min-h-screen w-full items-center justify-center text-2xl font-bold">
        (404) Page Not Found
      </div>
    ),
  },
];
