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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = event.currentTarget;
    const select = target.elements.namedItem(
      "database-select"
    ) as HTMLSelectElement | null;
    const value = select?.value;
    console.log({ value });
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label htmlFor="database-select">Select a database:</label>
        <select id="database-select">
          <option value="" disabled selected>
            -- Select a database --
          </option>
          {data.results.map((database) => (
            <option key={database.id} value={database.id}>
              {database.title[0]?.plain_text || "Untitled Database"}
            </option>
          ))}
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
