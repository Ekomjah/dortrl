import { useQuery } from "@tanstack/react-query";
import { getLinks } from "../api";
import { getApiError } from "../getAPIError";
import { queryKeys } from "../queryKeys";

export const useLinksQuery = () => {
  const { isPending, isError, error, data, isFetching } = useQuery({
    queryKey: queryKeys.links,
    queryFn: getLinks,
  });

  return {
    isPending,
    isError,
    error: isError ? getApiError(error) : null,
    data,
    isFetching,
  };
};
