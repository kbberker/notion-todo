import { useQuery } from "@tanstack/react-query";
import type { DatabaseSearchResponse } from "nt-types";

export const useGetDatabases = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["databases"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8787/api/databases");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json() as Promise<DatabaseSearchResponse>;
    },
  });

  return { data, isLoading };
};
