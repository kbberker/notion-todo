import { createFileRoute } from "@tanstack/react-router";
import { TodoList } from "../features/TodoList";

export const Route = createFileRoute("/tasks")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TodoList />;
}
