import type { GroupedTasks } from "./types";

type GroupedTasksProps = {
	groupedTasks: GroupedTasks;
};

export const GroupedTasksDisplay = ({ groupedTasks }: GroupedTasksProps) => {
	return (
		<div>
			{Object.values(groupedTasks).map((group) => (
				<div key={group.groupName}>
					<h2>{group.groupName}</h2>
					{Object.values(group.options).map((option) => (
						<div key={option.optionName}>
							<h3>{option.optionName}</h3>
							{option.tasks.map((task) => {
								const name = Object.values(
									task.properties,
								).find((property) => property.type === "title")
									?.title[0]?.plain_text;
								return <p key={task.id}>{name}</p>;
							})}
						</div>
					))}
				</div>
			))}
		</div>
	);
};
