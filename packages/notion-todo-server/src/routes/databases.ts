import type { SearchParameters } from "@notionhq/client/build/src/api-endpoints";
import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type {
	ApiErrorCode,
	ApiErrorResponse,
	ApiSuccessResponse,
	DatabaseSearchResponse,
	NotionDatabaseResponse,
} from "nt-types";
import type { HonoBindings } from "../types";

// Error handling utilities
const createErrorResponse = (
	code: ApiErrorCode,
	message: string,
	status: ContentfulStatusCode,
	details?: string,
): ApiErrorResponse => ({
	success: false,
	error: { code, message, status, details },
});

const handleNotionApiError = (response: Response): ApiErrorResponse => {
	switch (response.status) {
		case 401:
			return createErrorResponse(
				"NOTION_AUTH_ERROR",
				"Invalid or expired Notion API token",
				401,
			);
		case 403:
			return createErrorResponse(
				"NOTION_PERMISSION_ERROR",
				"Insufficient permissions to access this resource",
				403,
			);
		case 404:
			return createErrorResponse(
				"DATABASE_NOT_FOUND",
				"Database not found or not accessible",
				404,
			);
		case 429:
			return createErrorResponse(
				"RATE_LIMIT_EXCEEDED",
				"Rate limit exceeded. Please try again later",
				429,
			);
		default:
			return createErrorResponse(
				"EXTERNAL_SERVICE_ERROR",
				"Notion API returned an error",
				502,
				`HTTP ${response.status}: ${response.statusText}`,
			);
	}
};

export const databases = new Hono<{ Bindings: HonoBindings }>();

databases.get("", async (c) => {
	try {
		const searchParams: SearchParameters = {
			filter: {
				property: "object",
				value: "database",
			},
			sort: {
				direction: "descending",
				timestamp: "last_edited_time",
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

		// Check if the response is ok
		if (!response.ok) {
			const errorResponse = handleNotionApiError(response);
			return c.json(errorResponse, errorResponse.error.status);
		}

		// Parse JSON with error handling
		let responseJSON: DatabaseSearchResponse;
		try {
			responseJSON = (await response.json()) as DatabaseSearchResponse;
		} catch (parseError) {
			const errorResponse = createErrorResponse(
				"INVALID_RESPONSE",
				"Failed to parse response from Notion API",
				502,
				parseError instanceof Error
					? parseError.message
					: "Unknown parsing error",
			);
			return c.json(errorResponse, 502);
		}

		// Return success response
		const successResponse: ApiSuccessResponse<DatabaseSearchResponse> = {
			success: true,
			data: responseJSON,
		};
		return c.json(successResponse);
	} catch (networkError) {
		// Handle network/fetch errors
		const errorResponse = createErrorResponse(
			"SERVICE_UNAVAILABLE",
			"Unable to connect to Notion API",
			503,
			networkError instanceof Error
				? networkError.message
				: "Unknown network error",
		);
		return c.json(errorResponse, 503);
	}
});

databases.get("/:id/tasks", async (c) => {
	try {
		const id = c.req.param("id");

		const response = await fetch(
			`https://api.notion.com/v1/databases/${id}/query`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${c.env.NOTION_TOKEN}`,
					"Notion-Version": "2022-06-28",
					"Content-Type": "application/json",
				},
			},
		);

		// Check if the response is ok
		if (!response.ok) {
			const errorResponse = handleNotionApiError(response);
			return c.json(errorResponse, errorResponse.error.status);
		}

		// Parse JSON with error handling
		let databaseQueryResponse: NotionDatabaseResponse;
		try {
			databaseQueryResponse =
				(await response.json()) as NotionDatabaseResponse;
		} catch (parseError) {
			const errorResponse = createErrorResponse(
				"INVALID_RESPONSE",
				"Failed to parse response from Notion API",
				502,
				parseError instanceof Error
					? parseError.message
					: "Unknown parsing error",
			);
			return c.json(errorResponse, 502);
		}

		// Return success response
		const successResponse: ApiSuccessResponse<NotionDatabaseResponse> = {
			success: true,
			data: databaseQueryResponse,
		};
		return c.json(successResponse);
	} catch (networkError) {
		// Handle network/fetch errors
		const errorResponse = createErrorResponse(
			"SERVICE_UNAVAILABLE",
			"Unable to connect to Notion API",
			503,
			networkError instanceof Error
				? networkError.message
				: "Unknown network error",
		);
		return c.json(errorResponse, 503);
	}
});
