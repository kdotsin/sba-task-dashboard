import type { TaskFilterProps, TaskPriority, TaskStatus } from "../../types";

// Filter controls: status, priority, and a search box.
// Shows a chip for each active filter so the user can see (and remove) them.
export default function TaskFilter({ filters, theme, onFilterChange }: TaskFilterProps) {
  const isDark = theme === "dark";

  const cardStyle = isDark ? "border-stone-700 bg-stone-800" : "border-stone-200 bg-white";
  const labelStyle = isDark ? "text-stone-300" : "text-stone-700";
  const inputStyle = isDark
    ? "border-stone-600 bg-stone-900 text-stone-100"
    : "border-stone-300 bg-white text-stone-800";
  const chipStyle = isDark
    ? "bg-orange-900/40 text-orange-200 hover:bg-orange-900/70"
    : "bg-orange-100 text-orange-900 hover:bg-orange-200";

  const hasActiveFilters =
    filters.status !== "all" || filters.priority !== "all" || filters.search !== "";

  return (
    <section className={`flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition-colors ${cardStyle}`}>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="search" className={`text-sm font-medium ${labelStyle}`}>
            Search
          </label>
          <input
            id="search"
            type="search"
            placeholder="Title or description"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className={`rounded border px-3 py-2 ${inputStyle}`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status-filter" className={`text-sm font-medium ${labelStyle}`}>
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ ...filters, status: e.target.value as TaskStatus | "all" })
            }
            className={`rounded border px-3 py-2 ${inputStyle}`}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="priority-filter" className={`text-sm font-medium ${labelStyle}`}>
            Priority
          </label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) =>
              onFilterChange({ ...filters, priority: e.target.value as TaskPriority | "all" })
            }
            className={`rounded border px-3 py-2 ${inputStyle}`}
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Active filter indicators. Clicking a chip removes that filter. */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className={labelStyle}>Active filters:</span>

          {filters.search !== "" && (
            <button
              className={`rounded-full px-3 py-1 ${chipStyle}`}
              onClick={() => onFilterChange({ ...filters, search: "" })}
            >
              Search: "{filters.search}" ×
            </button>
          )}
          {filters.status !== "all" && (
            <button
              className={`rounded-full px-3 py-1 ${chipStyle}`}
              onClick={() => onFilterChange({ ...filters, status: "all" })}
            >
              Status: {filters.status} ×
            </button>
          )}
          {filters.priority !== "all" && (
            <button
              className={`rounded-full px-3 py-1 ${chipStyle}`}
              onClick={() => onFilterChange({ ...filters, priority: "all" })}
            >
              Priority: {filters.priority} ×
            </button>
          )}

          <button
            className={`px-2 py-1 underline ${labelStyle}`}
            onClick={() => onFilterChange({ status: "all", priority: "all", search: "" })}
          >
            Clear all
          </button>
        </div>
      )}
    </section>
  );
}
