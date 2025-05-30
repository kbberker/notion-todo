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

export default app;
