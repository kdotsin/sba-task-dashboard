import type { SortOption, TaskListProps } from "../../types";
import TaskItem from "./TaskItem";

// Shows the list of tasks with a sort dropdown on top.
// The Dashboard does the actual sorting and filtering and passes in the result.
export default function TaskList({
  tasks,
  theme,
  sortBy,
  onSortChange,
  onStatusChange,
  onEdit,
  onDelete,
  onMove,
}: TaskListProps) {
  const isDark = theme === "dark";

  const labelStyle = isDark ? "text-stone-300" : "text-stone-700";
  const selectStyle = isDark
    ? "border-stone-600 bg-stone-800 text-stone-200"
    : "border-stone-300 bg-white text-stone-700";
  const emptyStyle = isDark
    ? "border-stone-700 text-stone-400"
    : "border-stone-300 text-stone-500";

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className={`text-xl font-semibold ${labelStyle}`}>
          Tasks ({tasks.length})
        </h2>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className={`text-sm ${labelStyle}`}>
            Sort by
          </label>
          <select
            id="sort-by"
            className={`rounded border px-3 py-2 text-sm ${selectStyle}`}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="none">My order</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className={`rounded-xl border border-dashed p-8 text-center ${emptyStyle}`}>
          No tasks to show. Add one with the form, or change your filters.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              theme={theme}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
