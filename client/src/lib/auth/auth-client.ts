import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";
import { API_BASE } from "@/lib/api/config";
export const authClient = createAuthClient({
  baseURL: API_BASE || undefined,
  plugins: [anonymousClient()],
});
