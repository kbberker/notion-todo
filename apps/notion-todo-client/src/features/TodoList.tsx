import { useQuery } from "@tanstack/react-query";
import type {
	ApiResponse,
	NotionDatabaseResponse,
	StatusDatabasePropertyConfigResponse,
} from "nt-types";
import { useGetDatabases } from "../hooks/useGetDatabses";
import { Route } from "../routes/tasks.$dbId";

type GroupedTasks = {
	[groupId: string]: {
		groupName: string;
		options: {
			[optionId: string]: {
				optionName: string;
				tasks: NotionDatabaseResponse["results"];
			};
		};
	};
};

function groupTasksByStatus(
	tasks: NotionDatabaseResponse["results"],
	statusProperties: StatusDatabasePropertyConfigResponse,
) {
	const groupedTasks = tasks.reduce((acc: GroupedTasks, task) => {
		const taskStatusObj = Object.values(task.properties).find(
			(property) => property.type === "status",
		);

		const taskStatus = taskStatusObj?.status;

		if (!taskStatusObj || !taskStatus) {
			return acc; // Skip tasks without a status
		}

		// Each task's status' ID will belong to one of the status groups
		const taskStatusGroup = statusProperties.status.groups.find((group) =>
			group.option_ids.includes(taskStatus.id),
		);

		if (taskStatusGroup?.id) {
			if (!acc[taskStatusGroup.id]) {
				acc[taskStatusGroup.id] = {
					groupName: taskStatusGroup.name,
					options: {},
				};
			}
			const optionId = taskStatus.id;
			const optionName = taskStatus.name;
			if (!acc[taskStatusGroup.id].options[optionId]) {
				acc[taskStatusGroup.id].options[optionId] = {
					optionName,
					tasks: [],
				};
			}

			acc[taskStatusGroup.id].options[optionId].tasks.push(task);
		}

		return acc;
	}, {} as GroupedTasks);

	return groupedTasks;
}

export const TodoList = () => {
	const { dbId } = Route.useParams();
	const { data: databases } = useGetDatabases();
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

	const properties = databases?.results.find(
		(db) => db.id === dbId,
	)?.properties;

	const statusProperties = Object.values(properties || {}).filter(
		(property) => property.type === "status",
	);

	console.log({ statusProperty: statusProperties });

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

	const tasks = tasksData.data.results.map((task) => {
		const name = Object.values(task.properties).find(
			(property) => property.type === "title",
		)?.title[0]?.plain_text;

		return name;
	});

	const groupedTasks = groupTasksByStatus(
		tasksData.data.results,
		statusProperties[0],
	);
	console.log({ groupedTasks });

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
