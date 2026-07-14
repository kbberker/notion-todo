export type HonoBindings = CloudflareBindings;

/**
 * Notion OAuth session stored in KV
 */
export type NotionSession = {
  sessionId: string; // uuid
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms

  // Notion OAuth tokens
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number; // epoch ms (set by our app: Date.now() +30 days)

  // Notion integration metadata
  workspaceId?: string;
  workspaceName: string | null;
  workspaceIcon: string | null;
  botId?: string;
  owner?: {
    type: string; // "user" etc.
    userId?: string;
  };

  // Optional: app metadata
  lastUsedAt?: number; // epoch ms
};
