import type { FilterOptions, SortOption, Task, TaskFormData, TaskFormErrors } from "../types";

// Today's date as "YYYY-MM-DD" in the user's own timezone.
// ("en-CA" happens to format dates as YYYY-MM-DD, the same as <input type="date">.)
export function getToday(): string {
  return new Date().toLocaleDateString("en-CA");
}

// Checks the form fields and returns an error message for each bad field.
// originalDueDate is the date the task already had (when editing), so an old
// task can still be saved even though its due date has passed.
export function validateTaskForm(data: TaskFormData, originalDueDate?: string): TaskFormErrors {
  const errors: TaskFormErrors = { title: "", description: "", dueDate: "" };
  const title = data.title.trim();

  if (title === "") {
    errors.title = "Title is required.";
  } else if (title.length < 3) {
    errors.title = "Title must be at least 3 characters.";
  } else if (title.length > 80) {
    errors.title = "Title must be 80 characters or less.";
  }

  if (data.description.trim().length > 200) {
    errors.description = "Description must be 200 characters or less.";
  }

  // Dates in YYYY-MM-DD form can be compared as plain strings.
  if (data.dueDate === "") {
    errors.dueDate = "Due date is required.";
  } else if (data.dueDate < getToday() && data.dueDate !== originalDueDate) {
    errors.dueDate = "Due date can't be in the past.";
  }

  return errors;
}

// True when every error message is empty.
export function isFormValid(errors: TaskFormErrors): boolean {
  return errors.title === "" && errors.description === "" && errors.dueDate === "";
}

// Checks data loaded from an imported file. TypeScript types don't exist
// once the app is running, so we have to check each field ourselves.
// `data is Task[]` tells TypeScript the data is safe to use as tasks if this returns true.
export function isValidTaskList(data: unknown): data is Task[] {
  if (!Array.isArray(data)) return false;

  const statuses = ["pending", "in-progress", "completed"];
  const priorities = ["low", "medium", "high"];
  const allValid = data.every(
    (t) =>
      typeof t === "object" &&
      t !== null &&
      typeof t.id === "number" &&
      typeof t.title === "string" &&
      typeof t.description === "string" &&
      typeof t.dueDate === "string" &&
      statuses.includes(t.status) &&
      priorities.includes(t.priority),
  );
  if (!allValid) return false;

  // Two tasks with the same id would break React's keys.
  const ids = data.map((t) => t.id);
  return new Set(ids).size === ids.length;
}

// Returns only the tasks that match the filters.
// Search looks at the title and description and ignores upper/lower case.
export function filterTasks(tasks: Task[], filters: FilterOptions): Task[] {
  const search = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesStatus = filters.status === "all" || task.status === filters.status;
    const matchesPriority = filters.priority === "all" || task.priority === filters.priority;
    const matchesSearch =
      search === "" ||
      task.title.toLowerCase().includes(search) ||
      task.description.toLowerCase().includes(search);

    return matchesStatus && matchesPriority && matchesSearch;
  });
}

// Returns a sorted copy of the tasks. 'none' keeps the order the user set.
export function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  const sorted = [...tasks];
  const priorityRank = { high: 0, medium: 1, low: 2 };

  if (sortBy === "dueDate") {
    sorted.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  } else if (sortBy === "priority") {
    sorted.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  } else if (sortBy === "title") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  }

  return sorted;
}

// "2026-10-31" -> "Oct 31, 2026"
// The date is built from its parts so it stays in the user's timezone
// (new Date("2026-10-31") would be read as UTC and can show the day before).
export function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
