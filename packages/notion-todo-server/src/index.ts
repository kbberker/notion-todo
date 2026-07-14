import { Hono } from "hono";
import { auth } from "./routes/auth";
import { databases } from "./routes/databases";
import { oauth } from "./routes/oauth";
import type { HonoBindings } from "./types";

const app = new Hono<{ Bindings: HonoBindings }>();

app.route("/api/databases", databases);
app.route("/api/oauth", oauth);
app.route("/api/auth", auth);

export default app;
