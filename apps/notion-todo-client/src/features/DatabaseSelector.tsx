import { useQuery } from "@tanstack/react-query";
import type { DatabaseSearchResponse } from "nt-types";

export function DatabaseSelector() {
  const { data, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8787/api/databases");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json() as Promise<DatabaseSearchResponse>;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log({ data });
  if (!data) {
    return <div>No databases found</div>;
  }

  const databases = data.results.map((database) => {
    return database.title[0]?.plain_text || "Untitled Database";
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Choose your database to use as your task list
      </h1>
      <ul className="list-inside list-disc">
        {databases.map((database) => (
          <li key={database}>{database}</li>
        ))}
      </ul>
    </div>
  );
}
