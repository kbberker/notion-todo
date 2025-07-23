import type { GroupedTasks } from "./types";

type GroupedTasksProps = {
	groupedTasks: GroupedTasks;
};

export const GroupedTasksDisplay = ({ groupedTasks }: GroupedTasksProps) => {
	return (
		<div className="p-4 space-y-6 bg-gray-50 min-h-screen">
			{Object.values(groupedTasks).map((group) => (
				<div
					key={group.groupName}
					className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200"
				>
					<h2 className="text-xl font-semibold text-gray-800 mb-4">
						{group.groupName}
					</h2>
					<div className="space-y-4">
						{Object.values(group.options).map((option) => (
							<div
								key={option.optionName}
								className="bg-gray-50 rounded-md p-4 border border-gray-100"
							>
								<h3 className="text-lg font-medium text-gray-700 mb-2">
									{option.optionName}
								</h3>
								<div className="space-y-2">
									{option.tasks.map((task) => {
										const name = Object.values(
											task.properties,
										).find(
											(property) =>
												property.type === "title",
										)?.title[0]?.plain_text;
										return (
											<p
												key={task.id}
												className="text-gray-600 text-sm"
											>
												{name}
											</p>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
};
