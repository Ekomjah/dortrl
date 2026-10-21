import { useQuery } from "@tanstack/react-query";
import { getLinkStats } from "../api";
import { getApiError } from "../getAPIError";
import { queryKeys } from "../queryKeys";

export const useLinkStatsQuery = (code: string) => {
  const { isPending, isError, error, data, isFetching } = useQuery({
    queryKey: queryKeys.linkStats(code),
    queryFn: () => getLinkStats(code),
    enabled: Boolean(code),
    retry: false,
  });

  return {
    isPending,
    isError,
    error: isError ? getApiError(error) : null,
    data,
    isFetching,
  };
};
