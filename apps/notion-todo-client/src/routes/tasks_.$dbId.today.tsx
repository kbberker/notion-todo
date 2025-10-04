import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tasks_/$dbId/today')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tasks_/$dbId/today"!</div>
}
