import { authClient } from "./auth-client";

export function isGuestUser(user: unknown): boolean {
  return Boolean(
    user &&
      typeof user === "object" &&
      "isAnonymous" in user &&
      (user as { isAnonymous?: boolean | null }).isAnonymous,
  );
}

export function useIsGuest(): boolean {
  const { data } = authClient.useSession();
  return isGuestUser(data?.user);
}
