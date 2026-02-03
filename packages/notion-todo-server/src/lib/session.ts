import type { NotionSession } from "../types";

/**
 * Session management using Cloudflare Workers KV
 */

const SESSION_PREFIX = "session:";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

const getSessionKey = (sessionId: string) => `${SESSION_PREFIX}${sessionId}`;

export const createSession = async (
  kv: KVNamespace,
  data: Omit<NotionSession, "sessionId" | "createdAt" | "updatedAt">,
): Promise<NotionSession> => {
  const sessionId = crypto.randomUUID();
  const now = Date.now();

  const session: NotionSession = {
    ...data,
    sessionId,
    createdAt: now,
    updatedAt: now,
  };

  await kv.put(getSessionKey(sessionId), JSON.stringify(session), {
    expirationTtl: SESSION_TTL_SECONDS,
  });

  return session;
};

export const getSession = async (
  kv: KVNamespace,
  sessionId: string,
): Promise<NotionSession | null> => {
  const sessionData = await kv.get(getSessionKey(sessionId));
  if (!sessionData) {
    return null;
  }

  try {
    return JSON.parse(sessionData) as NotionSession;
  } catch (e) {
    console.error("Failed to parse session data", e);
    return null;
  }
};

export const updateSession = async (
  kv: KVNamespace,
  sessionId: string,
  updates: Partial<Omit<NotionSession, "sessionId" | "createdAt">>,
): Promise<NotionSession | null> => {
  const existingSession = await getSession(kv, sessionId);
  if (!existingSession) {
    return null;
  }

  const updatedSession: NotionSession = {
    ...existingSession,
    ...updates,
    updatedAt: Date.now(),
  };

  await kv.put(getSessionKey(sessionId), JSON.stringify(updatedSession), {
    expirationTtl: SESSION_TTL_SECONDS,
  });

  return updatedSession;
};

export const deleteSession = async (
  kv: KVNamespace,
  sessionId: string,
): Promise<void> => {
  await kv.delete(getSessionKey(sessionId));
};
