import { Client } from "@notionhq/client";
import { Hono } from "hono";

type Bindings = {
  SECRET_KEY: string;
  NOTION_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  // Initializing a client
  const notion = new Client({
    auth: c.env.NOTION_TOKEN,
  });

  console.log(c.env.NOTION_TOKEN);
  return c.text("Hello Hono!");
});

export default app;
