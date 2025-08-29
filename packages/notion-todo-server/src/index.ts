import type { SearchParameters } from "@notionhq/client/build/src/api-endpoints";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { databases } from "./routes/databases";
import type { HonoBindings } from "./types";

const app = new Hono<{ Bindings: HonoBindings }>();

// TODO: Set up CORS properly
app.use("*", cors());

app.route("/api/databases", databases);

app.get("/search", async (c) => {
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
