import { Hono } from "hono";

type Bindings = {
  SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  console.log(c.env.SECRET_KEY);
  return c.text("Hello Hono!");
});

export default app;
