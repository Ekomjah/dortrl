import type { RouteObject } from "react-router";
import App from "./index";
import { LoginForm } from "@/features/LoginForm";

import {
  isRouteErrorResponse,
  useRouteError,
  Link,
} from "react-router";

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
      <p className="text-sm text-muted-foreground">{message}</p>
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
    path: "/login",
    element: <LoginForm />,
  },
  //   {
  //     path: "/dashboard",
  //     element: <ProtectedRoute />,
  //     children: [
  //       {
  //         element: <AppShell />,
  //         children: [
  //           {
  //             index: true,
  //             element: <Navigate to="history" replace />,
  //           },
  //           {
  //             path: "history",
  //             element: <HistoryPage />,
  //           },
  //           {
  //             path: "search",
  //             element: <SearchPage />,
  //           },
  //           {
  //             path: "settings",
  //             element: <SettingsPage />,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  {
    path: "*",
    element: (
      <div className="text-2xl font-bold min-h-screen w-full flex items-center justify-center">
        (404) Page Not Found
      </div>
    ),
  },
];
