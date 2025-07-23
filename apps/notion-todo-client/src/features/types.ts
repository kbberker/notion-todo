import type { NotionDatabaseResponse } from "nt-types";

export type GroupedTasks = {
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
