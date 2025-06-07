import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TodoList } from "./features/TodoList";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoList />
    </QueryClientProvider>
  );
}

export default App;
