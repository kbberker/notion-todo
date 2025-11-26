import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, DataSourceSearchResponse } from "nt-types";

export const useGetDataSources = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["data-sources"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8787/api/databases");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result =
        (await response.json()) as ApiResponse<DataSourceSearchResponse>;

      if (!result.success) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
  });

  return { data, isLoading, error };
};
