import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { TaskFormData, TaskFormErrors, TaskFormProps } from "../../types";
import { isFormValid, validateTaskForm } from "../../utils/taskUtils";

const emptyForm: TaskFormData = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  dueDate: "",
};

const noErrors: TaskFormErrors = { title: "", description: "", dueDate: "" };

// Controlled form for adding a new task or editing an existing one.
// If initialTask is passed in, the form starts filled with that task.
export default function TaskForm({ theme, initialTask, onSubmit, onCancel }: TaskFormProps) {
  // Copy only the form fields (not the id) when editing.
  const startingData: TaskFormData = initialTask
    ? {
        title: initialTask.title,
        description: initialTask.description,
        status: initialTask.status,
        priority: initialTask.priority,
        dueDate: initialTask.dueDate,
      }
    : emptyForm;

  const [formData, setFormData] = useState<TaskFormData>(startingData);
  const [errors, setErrors] = useState<TaskFormErrors>(noErrors);
  // After the first submit, errors update live as the user types.
  const [submitted, setSubmitted] = useState(false);

  const isEditing = initialTask !== undefined;
  const isDark = theme === "dark";

  const cardStyle = isDark ? "border-stone-700 bg-stone-800" : "border-stone-200 bg-white";
  const labelStyle = isDark ? "text-stone-300" : "text-stone-700";
  const inputStyle = isDark
    ? "border-stone-600 bg-stone-900 text-stone-100"
    : "border-stone-300 bg-white text-stone-800";
  const errorStyle = isDark ? "text-red-400" : "text-red-700";

  // One change handler for every field: the input's name matches a key in formData.
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    if (submitted) setErrors(validateTaskForm(updated, initialTask?.dueDate));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);

    const newErrors = validateTaskForm(formData, initialTask?.dueDate);
    setErrors(newErrors);
    if (!isFormValid(newErrors)) return;

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
    });

    // Clear the form after adding so the next task starts fresh.
    if (!isEditing) {
      setFormData(emptyForm);
      setSubmitted(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition-colors ${cardStyle}`}
    >
      <h2 className={`text-xl font-semibold ${labelStyle}`}>
        {isEditing ? "Edit task" : "Add a task"}
      </h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className={`text-sm font-medium ${labelStyle}`}>
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          aria-invalid={errors.title !== ""}
          className={`rounded border px-3 py-2 ${inputStyle}`}
        />
        {errors.title && <p className={`text-sm ${errorStyle}`}>{errors.title}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className={`text-sm font-medium ${labelStyle}`}>
          Description <span className="font-normal opacity-70">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          aria-invalid={errors.description !== ""}
          className={`rounded border px-3 py-2 ${inputStyle}`}
        />
        {errors.description && (
          <p className={`text-sm ${errorStyle}`}>{errors.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="priority" className={`text-sm font-medium ${labelStyle}`}>
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`rounded border px-3 py-2 ${inputStyle}`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className={`text-sm font-medium ${labelStyle}`}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`rounded border px-3 py-2 ${inputStyle}`}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="dueDate" className={`text-sm font-medium ${labelStyle}`}>
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            aria-invalid={errors.dueDate !== ""}
            className={`rounded border px-3 py-2 ${inputStyle} ${isDark ? "[color-scheme:dark]" : ""}`}
          />
          {errors.dueDate && <p className={`text-sm ${errorStyle}`}>{errors.dueDate}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-orange-700 px-4 py-2 font-medium text-white hover:bg-orange-800"
        >
          {isEditing ? "Save changes" : "Add task"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className={`rounded border px-4 py-2 ${inputStyle}`}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
