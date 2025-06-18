import { Hono } from "hono";
import type { HonoBindings } from "../types";
import type { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";

export const databases = new Hono<{ Bindings: HonoBindings }>();

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

  console.log(databaseQueryResponse);

  return c.json(databaseQueryResponse);
});
