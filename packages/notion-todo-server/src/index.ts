import type {
  QueryDatabaseResponse,
  SearchParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { Hono } from "hono";

type Bindings = {
  SECRET_KEY: string;
  NOTION_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  const response = await fetch("https://api.notion.com/v1/users", {
    headers: {
      Authorization: `Bearer ${c.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
  });
  const listUsersResponse = await response.json();

  console.log(listUsersResponse);

  return c.text("Hello Hono!");
});

app.get("/databases/:id/tasks", async (c) => {
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
  // return c.text("Hello Hono!");
});

app.get("/search", async (c) => {
  const id = c.req.param("id");

  const searchParams: SearchParameters = {
    filter: {
      property: "object",
      value: "database",
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

  const listUsersResponse = await response.json();

  console.log(listUsersResponse);

  return c.text("Hello Hono!");
});

export default app;
