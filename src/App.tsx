import { useState } from "react";
import TaskForm from "./components/TaskForm/TaskForm";
import TaskList from "./components/TaskList/TaskList";
import TaskFilter from "./components/TaskFilter/TaskFilter";
import { filterTasks } from "./utils/taskUtils";
import type {
  FilterOptions,
  MoveDirection,
  SortOption,
  Task,
  TaskFormData,
  TaskStatus,
  Theme,
} from "./types";

// Temporary test setup for TaskForm and TaskList.
// This state and these handlers will move into the Dashboard component.
function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>("none");
  const [theme, setTheme] = useState<Theme>("light");
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    priority: "all",
    search: "",
  });

  function handleSubmit(data: TaskFormData) {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((task) => (task.id === editingTask.id ? { ...task, ...data } : task)),
      );
      setEditingTask(undefined);
    } else {
      // Next id is one more than the highest id so far.
      setTasks((prev) => {
        const nextId = prev.length === 0 ? 1 : Math.max(...prev.map((t) => t.id)) + 1;
        return [...prev, { id: nextId, ...data }];
      });
    }
  }

  function handleStatusChange(id: number, status: TaskStatus) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)));
  }

  function handleDelete(id: number) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (editingTask?.id === id) setEditingTask(undefined);
  }

  function handleMove(id: number, direction: MoveDirection) {
    setTasks((prev) => {
      const index = prev.findIndex((task) => task.id === id);
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });
  }

  return (
    <div
      className={`min-h-screen p-4 transition-colors sm:p-8 ${
        theme === "dark" ? "bg-stone-900" : "bg-stone-100"
      }`}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <button
          className="self-end rounded border border-stone-400 px-3 py-1 text-sm text-stone-500"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          Switch to {theme === "dark" ? "light" : "dark"}
        </button>

        <TaskForm
          key={editingTask?.id ?? "new"}
          theme={theme}
          initialTask={editingTask}
          onSubmit={handleSubmit}
          onCancel={() => setEditingTask(undefined)}
        />

        <TaskFilter filters={filters} theme={theme} onFilterChange={setFilters} />

        <TaskList
          tasks={filterTasks(tasks, filters)}
          theme={theme}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onStatusChange={handleStatusChange}
          onEdit={setEditingTask}
          onDelete={handleDelete}
          onMove={handleMove}
        />
      </div>
    </div>
  );
}

export default App;
