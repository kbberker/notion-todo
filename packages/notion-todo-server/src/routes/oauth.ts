import { Hono } from "hono";
import { createSessionCookie } from "../lib/cookies";
import { exchangeCodeForToken } from "../lib/notion";
import { createSession } from "../lib/session";
import type { HonoBindings } from "../types";

export const oauth = new Hono<{ Bindings: HonoBindings }>();

oauth.get("/callback", async (c) => {
  const code = c.req.query("code");
  const error = c.req.query("error");

  if (error) {
    return c.json({ error: `Notion OAuth error: ${error}` }, 400);
  }

  if (!code) {
    return c.json({ error: "Missing code parameter" }, 400);
  }

  try {
    const tokenResponse = await exchangeCodeForToken(
      c.env.NOTION_OAUTH_CLIENT_ID,
      c.env.NOTION_OAUTH_CLIENT_SECRET,
      c.env.NOTION_REDIRECT_URI,
      code,
    );

    const session = await createSession(c.env.USER_SESSION, {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || "", // Should be present for public integration
      accessTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      workspaceId: tokenResponse.workspace_id,
      workspaceName: tokenResponse.workspace_name,
      workspaceIcon: tokenResponse.workspace_icon,
      botId: tokenResponse.bot_id,
      // note - email is not stored in session for privacy
      owner: tokenResponse.owner
        ? {
            type: tokenResponse.owner.type,
            userId:
              tokenResponse.owner.type === "user"
                ? tokenResponse.owner.user?.id
                : undefined,
          }
        : undefined,
    });

    const cookie = createSessionCookie(session.sessionId);
    c.header("Set-Cookie", cookie);

    // Redirect to frontend app
    // Assuming frontend is served from root or /app
    return c.redirect("/");
  } catch (e) {
    console.error("OAuth callback error:", e);
    return c.json({ error: "Failed to complete OAuth flow" }, 500);
  }
});
