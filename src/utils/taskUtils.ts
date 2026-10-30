import type { TaskFormData, TaskFormErrors } from "../types";

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
