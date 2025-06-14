import { useQuery } from "@tanstack/react-query";
import type { ApiDatabaseResponse } from "nt-types";

export const TodoList = () => {
  const { data } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await fetch(
        "http://localhost:8787/databases/1f87b593-584a-8050-b7fb-f59ed6e0abf6/tasks"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json() as Promise<ApiDatabaseResponse>;
    },
  });

  console.log({ data });

  const tasks = data?.results.map((task) => {
    const name = Object.values(task.properties).find(
      (property) => property.type === "title"
    )?.title[0]?.plain_text;

    return name;
  });

  console.log({ tasks });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Todo List</h1>
      <p className="text-gray-600">
        This is a placeholder for the Todo List feature.
      </p>
    </div>
  );
};
