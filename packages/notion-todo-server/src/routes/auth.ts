import { Hono } from "hono";
import { clearSessionCookie, getSessionIdFromRequest } from "../lib/cookies";
import { deleteSession } from "../lib/session";
import type { HonoBindings } from "../types";

export const auth = new Hono<{ Bindings: HonoBindings }>();

auth.post("/logout", async (c) => {
  const sessionId = getSessionIdFromRequest(c.req.header("Cookie"));

  if (sessionId) {
    await deleteSession(c.env.USER_SESSION, sessionId);
  }

  const cookie = clearSessionCookie();
  c.header("Set-Cookie", cookie);

  return c.json({ success: true });
});
