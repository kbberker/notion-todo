import { PageObjectResponse } from "@notionhq/client";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";

export type ApiDatabaseResponse = Omit<QueryDatabaseResponse, "results"> & {
  results: PageObjectResponse[];
};
