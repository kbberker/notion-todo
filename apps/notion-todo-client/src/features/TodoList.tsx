import { useQuery } from "@tanstack/react-query";
import type { ApiDatabaseResponse } from "nt-types";
import { Route } from "../routes/tasks.$dbId";

export const TodoList = () => {
  const { dbId } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:8787/api/databases/${dbId}/tasks`
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!tasks || tasks.length === 0) {
    return <div>No tasks found.</div>;
  }

  return (
    <div>
      <h1>Todo List</h1>

      {tasks.map((task) => {
        return (
          <div key={Math.random()}>
            <p>{task}</p>
          </div>
        );
      })}
    </div>
  );
};
