import { useNavigate } from "@tanstack/react-router";
import { useGetDatabases } from "../hooks/useGetDatabses";

export function DatabaseSelector() {
  const navigate = useNavigate();

  const { data, isLoading } = useGetDatabases();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log({ data });
  if (!data) {
    return <div>No databases found</div>;
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = event.currentTarget;
    const select = target.elements.namedItem(
      "database-select",
    ) as HTMLSelectElement | null;
    const value = select?.value;
    console.log({ value });
    if (value) {
      navigate({ to: `/tasks/${value}` });
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label htmlFor="database-select">Select a database:</label>
        <select id="database-select" defaultValue="" name="database-select">
          <option value="" disabled>
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
