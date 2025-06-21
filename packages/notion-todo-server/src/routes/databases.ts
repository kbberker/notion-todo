import { Hono } from "hono";
import type { HonoBindings } from "../types";
import type {
  QueryDatabaseResponse,
  SearchParameters,
  SearchResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { DatabaseSearchResponse } from "nt-types";

export const databases = new Hono<{ Bindings: HonoBindings }>();

databases.get("", async (c) => {
  const searchParams: SearchParameters = {
    filter: {
      property: "object",
      value: "database",
    },
    sort: {
      direction: "descending",
      timestamp: "last_edited_time",
    },
  };

  const response = await fetch(`https://api.notion.com/v1/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searchParams),
  });

  const responseJSON = (await response.json()) as DatabaseSearchResponse;

  return c.json(responseJSON);
});

databases.get("/:id/tasks", async (c) => {
  const id = c.req.param("id");

  const response = await fetch(
    `https://api.notion.com/v1/databases/${id}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    }
  );

  const databaseQueryResponse =
    (await response.json()) as QueryDatabaseResponse;

  return c.json(databaseQueryResponse);
});
