import { useEffect } from "react";
import { useParams } from "react-router";
import { REDIRECT_BASE } from "@/lib/api/config";

export function RedirectPage() {
  const { code } = useParams();

  useEffect(() => {
    if (code) window.location.replace(`${REDIRECT_BASE}/${code}`);
  }, [code]);

  return <p>Redirecting...</p>;
}
