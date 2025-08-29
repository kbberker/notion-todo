import type { NotionDatabaseResponse } from "nt-types";

export type GroupedByStatusTasks = {
  [statusGroupId: string]: {
    statusGroupName: string;
    subStatuses: {
      [subStatusId: string]: {
        subStatusName: string;
        tasks: NotionDatabaseResponse["results"];
      };
    };
  };
};
