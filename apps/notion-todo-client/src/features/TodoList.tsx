import { useQuery } from "@tanstack/react-query";
import type {
  ApiResponse,
  NotionDatabaseResponse,
  StatusDatabasePropertyConfigResponse,
} from "nt-types";
import { useGetDataSources } from "../hooks/useGetDatabses";
import { Route } from "../routes/tasks.$dbId";
import { GroupedTasksDisplay } from "./GroupedTasksDisplay";
import type { GroupedByStatusTasks } from "./types";

function groupTasksByStatus(
  tasks: NotionDatabaseResponse["results"],
  statusProperties: StatusDatabasePropertyConfigResponse,
) {
  const groupedTasks = tasks.reduce((acc: GroupedByStatusTasks, task) => {
    const taskStatusObj = Object.values(task.properties).find(
      (property) => property.type === "status",
    );

    const taskStatus = taskStatusObj?.status;

    if (!taskStatusObj || !taskStatus) {
      return acc; // Skip tasks without a status
    }

    // Each task's status' ID will belong to one of the status groups
    // `statusProperties` seems to be an array
    const taskStatusGroup = statusProperties.status.groups.find((group) =>
      group.option_ids.includes(taskStatus.id),
    );

    if (taskStatusGroup?.id) {
      if (!acc[taskStatusGroup.id]) {
        acc[taskStatusGroup.id] = {
          statusGroupName: taskStatusGroup.name,
          subStatuses: {},
        };
      }
      const taskStatusId = taskStatus.id;
      const taskStatusName = taskStatus.name;
      if (!acc[taskStatusGroup.id].subStatuses[taskStatusId]) {
        acc[taskStatusGroup.id].subStatuses[taskStatusId] = {
          subStatusName: taskStatusName,
          tasks: [],
        };
      }

      acc[taskStatusGroup.id].subStatuses[taskStatusId].tasks.push(task);
    }

    return acc;
  }, {} as GroupedByStatusTasks);

  return groupedTasks;
}

export const TodoList = () => {
  const { dbId } = Route.useParams();
  const { data: databases } = useGetDataSources();
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ["tasks", dbId],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:8787/api/databases/${dbId}/tasks`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json() as Promise<ApiResponse<NotionDatabaseResponse>>;
    },
  });

  const matchedDatabase = databases?.results.find((db) => db.id === dbId);

  if (!matchedDatabase) {
    return <div>Database not found.</div>;
  }

  const properties = matchedDatabase.properties;

  // TODO: Handle multiple status properties or none
  // Ideally there should be one, but we should handle edge cases
  const statusProperties = Object.values(properties || {}).filter(
    (property) => property.type === "status",
  );

  console.log({ statusProperties });

  console.log({ data: tasksData });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!tasksData) {
    return <div>No tasks found.</div>;
  }

  if (!tasksData.success) {
    return (
      <div>
        Error: {tasksData.error.message} (Code: {tasksData.error.code})
      </div>
    );
  }

  if (tasksData.data.results.length === 0) {
    return <div>No tasks found.</div>;
  }

  const groupedTasks = groupTasksByStatus(
    tasksData.data.results,
    statusProperties[0],
  );
  console.log({ groupedTasks });

  return <GroupedTasksDisplay groupedTasks={groupedTasks} />;
};
