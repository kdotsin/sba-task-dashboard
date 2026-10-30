export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type Theme = 'light' | 'dark';
export type SortOption = 'none' | 'dueDate' | 'priority' | 'title';
export type MoveDirection = 'up' | 'down';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

// Everything the user fills in on the TaskForm. The id is generated on submit.
export type TaskFormData = Omit<Task, 'id'>;

// One optional error message per form field.
export type TaskFormErrors = Partial<Record<keyof TaskFormData, string>>;

// An undefined status or priority means "show all".
export interface FilterOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  search: string;
}

export interface TaskItemProps {
  task: Task;
  theme: Theme;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMove: (taskId: string, direction: MoveDirection) => void;
}

export interface TaskListProps {
  tasks: Task[];
  theme: Theme;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  // Moves a task one spot up or down in the list (used when sortBy is 'none').
  onMove: (taskId: string, direction: MoveDirection) => void;
}

export interface TaskFilterProps {
  filters: FilterOptions;
  theme: Theme;
  onFilterChange: (changes: Partial<FilterOptions>) => void;
}

export interface TaskFormProps {
  theme: Theme;
  // When set, the form edits this task instead of creating a new one.
  initialTask?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
}
