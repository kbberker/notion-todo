import { parse, serialize } from "cookie";

export type SessionCookieAttributes = {
  maxAge?: number;
};

const SESSION_COOKIE_NAME = "session_id";

export const defaultSessionCookieMaxAge = 60 * 60 * 24 * 30; // 30 days

export const createSessionCookie = (
  sessionId: string,
  { maxAge = defaultSessionCookieMaxAge }: SessionCookieAttributes = {},
): string => {
  return serialize(SESSION_COOKIE_NAME, sessionId, {
    maxAge,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
};

export const clearSessionCookie = (): string => {
  return serialize(SESSION_COOKIE_NAME, "", {
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
};

export const getSessionIdFromRequest = (
  cookieHeader?: string | null,
): string | null => {
  if (!cookieHeader) {
    return null;
  }

  const cookies = parse(cookieHeader);
  const sessionId = cookies[SESSION_COOKIE_NAME];

  if (!sessionId || typeof sessionId !== "string") {
    return null;
  }

  return sessionId;
};
