import { createFileRoute } from "@tanstack/react-router";
import { TodoList } from "../features/TodoList";

export const Route = createFileRoute("/tasks/$dbId")({
	component: RouteComponent,
});

function RouteComponent() {
	return <TodoList />;
}
