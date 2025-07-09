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

type SelectColor =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";

type StatusPropertyResponse = {
  id: string;
  name: string;
  color: SelectColor;
  description: string | null;
};

export type StatusDatabasePropertyConfigResponse = {
  type: "status";
  status: {
    options: Array<StatusPropertyResponse>;
    groups: Array<{
      id: string;
      name: string;
      color: SelectColor;
      option_ids: Array<string>;
    }>;
  };
  id: string;
  name: string;
  description: string | null;
};
