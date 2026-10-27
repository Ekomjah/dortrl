import { Link } from "react-router";

export function GuestNotice() {
  return (
    <div className="border-border flex flex-wrap items-baseline gap-x-2 gap-y-1 border-y py-3 text-sm">
      <span className="font-medium">Guest account.</span>
      <span className="text-muted-foreground">
        Up to 2 links, saved in this browser. Create an account to keep them,
        edit them, and see clicks.
      </span>
      <Link
        to="/sign-up"
        className="font-medium text-[#1f6fe0] hover:underline dark:text-[#6ba4f5]"
      >
        Create account
      </Link>
    </div>
  );
}
