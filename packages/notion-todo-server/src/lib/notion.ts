import type { NotionOauthTokenResponse } from "nt-types";

export const exchangeCodeForToken = async (
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  code: string,
): Promise<NotionOauthTokenResponse> => {
  const encoded = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${encoded}`,
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notion OAuth error: ${response.status} ${errorText}`);
  }

  return (await response.json()) as NotionOauthTokenResponse;
};

export const refreshAccessToken = async (
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<NotionOauthTokenResponse> => {
  const encoded = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${encoded}`,
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Notion Token Refresh error: ${response.status} ${errorText}`,
    );
  }

  return (await response.json()) as NotionOauthTokenResponse;
};
