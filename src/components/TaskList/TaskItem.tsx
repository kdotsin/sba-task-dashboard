import type { TaskItemProps, TaskStatus } from "../../types";

// One task card. Shows the task and lets the user change its status,
// move it up or down, edit it, or delete it.
export default function TaskItem({
  task,
  theme,
  onStatusChange,
  onEdit,
  onDelete,
  onMove,
}: TaskItemProps) {
  const isDark = theme === "dark";

  const cardStyle = isDark
    ? "border-stone-700 bg-stone-800"
    : "border-stone-200 bg-white";
  const titleStyle = isDark ? "text-stone-100" : "text-stone-800";
  const textStyle = isDark ? "text-stone-400" : "text-stone-500";
  const buttonStyle = isDark
    ? "border-stone-600 bg-stone-800 text-stone-200 hover:bg-stone-700"
    : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100";

  let priorityStyle = isDark ? "text-green-400" : "text-green-700";
  if (task.priority === "medium") priorityStyle = isDark ? "text-amber-400" : "text-amber-700";
  if (task.priority === "high") priorityStyle = isDark ? "text-red-400" : "text-red-700";

  // Completed tasks get crossed out
  const doneStyle = task.status === "completed" ? "line-through opacity-60" : "";

  return (
    <li
      className={`flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition-colors sm:flex-row sm:justify-between ${cardStyle}`}
    >
      <section className="flex flex-col gap-2">
        <h3 className={`text-lg font-semibold ${titleStyle} ${doneStyle}`}>
          {task.title}
        </h3>
        <p className={textStyle}>{task.description}</p>
        <div className="mt-1 flex gap-3 text-sm">
          <span className={priorityStyle}>Priority: {task.priority}</span>
          <span className={textStyle}>Due: {task.dueDate}</span>
        </div>
      </section>

      <section className="flex flex-wrap items-start gap-2 sm:justify-end">
        <select
          aria-label="Task status"
          className={`rounded border px-3 py-2 text-sm ${buttonStyle}`}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <button
          aria-label="Move up"
          className={`rounded border px-3 py-2 text-sm ${buttonStyle}`}
          onClick={() => onMove(task.id, "up")}
        >
          ↑
        </button>
        <button
          aria-label="Move down"
          className={`rounded border px-3 py-2 text-sm ${buttonStyle}`}
          onClick={() => onMove(task.id, "down")}
        >
          ↓
        </button>

        <button
          className={`rounded border px-3 py-2 text-sm ${buttonStyle}`}
          onClick={() => onEdit(task)}
        >
          Edit
        </button>
        <button
          className={`rounded px-3 py-2 text-sm ${isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-800"}`}
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </section>
    </li>
  );
}
