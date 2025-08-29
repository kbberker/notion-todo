import { createFileRoute } from "@tanstack/react-router";
import { DatabaseSelector } from "../features/DatabaseSelector";

export const Route = createFileRoute("/")({
	component: DatabaseSelector,
});
