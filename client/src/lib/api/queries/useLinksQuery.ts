import { useQuery } from "@tanstack/react-query";
import { getLinks } from "../api";
import { getApiError } from "../getAPIError";

export const useLinksQuery = () => {
  const { isPending, isError, error, data, isFetching } = useQuery({
    queryKey: ["links"],
    queryFn: getLinks,
  });
  return {
    isPending,
    isError,
    error: getApiError(error),
    data,
    isFetching,
  };
};
