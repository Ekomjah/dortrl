import { useNavigate } from "react-router";
import { authClient } from "./auth-client";

export const useSignOut = () => {
  const navigate = useNavigate();
  return async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/");
        },
      },
    });
  };
};
