export type HonoBindings = {
  SECRET_KEY: string;
  NOTION_TOKEN: string;
  NOTION_OAUTH_CLIENT_ID: string;
  NOTION_OAUTH_CLIENT_SECRET: string;
  NOTION_AUTH_URL: string;
  NOTION_REDIRECT_URI: string;
  USER_SESSION: KVNamespace;
  ENVIRONMENT: "development" | "production";
};
