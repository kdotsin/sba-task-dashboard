import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import TaskForm from "../TaskForm/TaskForm";
import TaskFilter from "../TaskFilter/TaskFilter";
import TaskList from "../TaskList/TaskList";
import {
  filterTasks,
  formatDate,
  getToday,
  isValidTaskList,
  sortTasks,
} from "../../utils/taskUtils";
import type {
  FilterOptions,
  MoveDirection,
  SortOption,
  Task,
  TaskFormData,
  TaskStatus,
  Theme,
} from "../../types";

// localStorage can throw an error (for example in some private browsing
// modes, or when storage is full), so every use of it is wrapped in try/catch.
// If it fails, the app still works; it just won't remember anything.

// Reads saved tasks. Returns an empty list if there are none yet
// or the saved data is broken.
function loadTasks(): Task[] {
  try {
    const data = JSON.parse(localStorage.getItem("tasks") ?? "[]");
    return isValidTaskList(data) ? data : [];
  } catch {
    return [];
  }
}

function loadTheme(): Theme {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage isn't available; nothing else to do.
  }
}

// The main page. Holds all the app's state and passes it down to the
// form, filter, and list as props. The children report changes back up
// through the callback props (onSubmit, onFilterChange, onDelete, ...).
export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>("none");
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    priority: "all",
    search: "",
  });
  const [message, setMessage] = useState("");

  // Save to localStorage whenever tasks or theme change.
  useEffect(() => {
    save("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    save("theme", theme);
  }, [theme]);

  // The tasks actually shown: filtered first, then sorted.
  const visibleTasks = sortTasks(filterTasks(tasks, filters), sortBy);

  // Statistics are counted from all tasks, not just the filtered ones.
  const today = getToday();
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const overdueCount = tasks.filter((t) => t.status !== "completed" && t.dueDate < today).length;
  const percentDone = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

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

  // Swaps a task with the task next to it *on screen*, so moving still
  // works when some tasks are hidden by a filter. Only works in "My order".
  function handleMove(id: number, direction: MoveDirection) {
    if (sortBy !== "none") return;

    const index = visibleTasks.findIndex((task) => task.id === id);
    const neighbor = visibleTasks[direction === "up" ? index - 1 : index + 1];
    if (!neighbor) return;

    setTasks((prev) => {
      const a = prev.findIndex((task) => task.id === id);
      const b = prev.findIndex((task) => task.id === neighbor.id);
      const copy = [...prev];
      [copy[a], copy[b]] = [copy[b], copy[a]];
      return copy;
    });
  }

  // Downloads all tasks as a .json file.
  function handleExport() {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tasks-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Reads a .json file exported earlier and replaces the current tasks.
  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again later
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());
      if (!isValidTaskList(data)) {
        setMessage("That file doesn't look like a task export.");
        return;
      }
      setTasks(data);
      setEditingTask(undefined);
      setMessage(`Imported ${data.length} ${data.length === 1 ? "task" : "tasks"}.`);
    } catch {
      setMessage("Couldn't read that file. Is it a .json export?");
    }
  }

  const isDark = theme === "dark";
  const pageStyle = isDark ? "bg-stone-900 text-stone-100" : "bg-stone-100 text-stone-800";
  const cardStyle = isDark ? "border-stone-700 bg-stone-800" : "border-stone-200 bg-white";
  const mutedStyle = isDark ? "text-stone-400" : "text-stone-500";
  const buttonStyle = isDark
    ? "border-stone-600 bg-stone-800 text-stone-200 hover:bg-stone-700"
    : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100";

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 sm:p-8 ${pageStyle}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Header: title, export/import, theme switch */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`text-sm ${mutedStyle}`}>{formatDate(today)}</p>
            <h1 className="text-3xl font-bold tracking-tight">Task Dashboard</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className={`rounded border px-3 py-2 text-sm ${buttonStyle}`} onClick={handleExport}>
              Export
            </button>
            <label className={`cursor-pointer rounded border px-3 py-2 text-sm ${buttonStyle}`}>
              Import
              <input type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
            </label>

            {/* Theme toggle switch */}
            <button
              role="switch"
              aria-checked={isDark}
              aria-label="Dark mode"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex items-center gap-2 px-2 py-2 text-sm"
            >
              <span className={mutedStyle}>Dark mode</span>
              <span
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isDark ? "bg-orange-600" : "bg-stone-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    isDark ? "translate-x-5" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </header>

        {message && (
          <p role="status" className={`flex justify-between rounded-xl border p-3 text-sm ${cardStyle}`}>
            {message}
            <button className="underline" onClick={() => setMessage("")}>
              Dismiss
            </button>
          </p>
        )}

        {/* Task statistics */}
        <section className={`rounded-xl border p-4 shadow-sm ${cardStyle}`}>
          <div className="flex flex-wrap justify-between gap-2">
            <h2 className="text-lg font-semibold">Progress</h2>
            <p className={`text-sm ${mutedStyle}`}>
              {completedCount} of {tasks.length} done ({percentDone}%)
            </p>
          </div>
          <div className={`mt-3 h-2 overflow-hidden rounded-full ${isDark ? "bg-stone-700" : "bg-stone-200"}`}>
            <div
              className="h-full rounded-full bg-orange-600 transition-all duration-500"
              style={{ width: `${percentDone}%` }}
            />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className={mutedStyle}>Pending</dt>
              <dd className="text-xl font-semibold">{pendingCount}</dd>
            </div>
            <div>
              <dt className={mutedStyle}>In progress</dt>
              <dd className="text-xl font-semibold">{inProgressCount}</dd>
            </div>
            <div>
              <dt className={mutedStyle}>Completed</dt>
              <dd className="text-xl font-semibold">{completedCount}</dd>
            </div>
            <div>
              <dt className={mutedStyle}>Overdue</dt>
              <dd className={`text-xl font-semibold ${overdueCount > 0 ? (isDark ? "text-red-400" : "text-red-700") : ""}`}>
                {overdueCount}
              </dd>
            </div>
          </dl>
        </section>

        {/* Form on the left on large screens; everything stacks on small screens */}
        <div className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
          <div className="lg:sticky lg:top-8">
            <TaskForm
              key={editingTask?.id ?? "new"}
              theme={theme}
              initialTask={editingTask}
              onSubmit={handleSubmit}
              onCancel={() => setEditingTask(undefined)}
            />
          </div>

          <div className="flex flex-col gap-6">
            <TaskFilter filters={filters} theme={theme} onFilterChange={setFilters} />
            {sortBy !== "none" && (
              <p className={`-mb-3 text-sm ${mutedStyle}`}>
                Switch sorting to "My order" to move tasks with the arrows.
              </p>
            )}
            <TaskList
              tasks={visibleTasks}
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
      </div>
    </div>
  );
}
