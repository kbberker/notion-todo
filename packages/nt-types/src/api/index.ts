import { PageObjectResponse } from "@notionhq/client";
import {
  DatabaseObjectResponse,
  QueryDatabaseResponse,
  SearchResponse,
} from "@notionhq/client/build/src/api-endpoints";

export type ApiDatabaseResponse = Omit<QueryDatabaseResponse, "results"> & {
  results: PageObjectResponse[];
};

export type DatabaseSearchResponse = Omit<SearchResponse, "results"> & {
  results: DatabaseObjectResponse[];
};
