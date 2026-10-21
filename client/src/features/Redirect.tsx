import { useEffect } from "react";
import { useParams } from "react-router";

export function RedirectPage() {
  const { code } = useParams();

  useEffect(() => {
    if (code)
      window.location.replace(`${import.meta.env.VITE_SERVER_URL}/${code}`);
  }, [code]);

  return <p>Redirecting...</p>;
}
