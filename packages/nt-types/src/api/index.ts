import type { PageObjectResponse } from "@notionhq/client";
import type {
  DataSourceObjectResponse,
  GetDatabaseResponse,
  SearchResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type NotionDatabaseResponse = Omit<GetDatabaseResponse, "results"> & {
  results: PageObjectResponse[];
};

export type DataSourceSearchResponse = Omit<SearchResponse, "results"> & {
  results: DataSourceObjectResponse[];
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

// Error handling types
export type ApiErrorCode =
  | "NOTION_AUTH_ERROR"
  | "NOTION_PERMISSION_ERROR"
  | "DATABASE_NOT_FOUND"
  | "RATE_LIMIT_EXCEEDED"
  | "EXTERNAL_SERVICE_ERROR"
  | "INVALID_RESPONSE"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN_ERROR";

export type ApiErrorResponse = {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    status: ContentfulStatusCode;
    details?: string;
  };
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
