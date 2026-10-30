export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type Theme = 'light' | 'dark';
export type SortOption = 'none' | 'dueDate' | 'priority' | 'title';
export type MoveDirection = 'up' | 'down';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

// What the user fills in on the TaskForm. The id is added when the task is created.
export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

// Error messages for the TaskForm. An empty string means that field is fine.
export interface TaskFormErrors {
  title: string;
  description: string;
  dueDate: string;
}

// 'all' means "don't filter by this".
export interface FilterOptions {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  search: string;
}

export interface TaskItemProps {
  task: Task;
  theme: Theme;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onMove: (taskId: number, direction: MoveDirection) => void;
}

export interface TaskListProps {
  tasks: Task[];
  theme: Theme;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onMove: (taskId: number, direction: MoveDirection) => void;
}

export interface TaskFilterProps {
  filters: FilterOptions;
  theme: Theme;
  onFilterChange: (filters: FilterOptions) => void;
}

export interface TaskFormProps {
  theme: Theme;
  // When set, the form edits this task instead of creating a new one.
  initialTask?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}
