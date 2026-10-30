# Task Dashboard

A task management dashboard built with React and TypeScript. You can add, edit, delete, filter, search, sort and reorder tasks. It shows progress statistics, saves to your browser, exports and imports tasks as JSON, and has a light and dark theme.

## Setup

You need [Node.js](https://nodejs.org/) (version 20 or newer) and npm.

```bash
cd sba-task-dashboard
npm install
npm run dev
```

Then open the address Vite prints, usually <http://localhost:5173>.

| Command           | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Starts the dev server with hot reload             |
| `npm run build`   | Type-checks with `tsc`, then builds to `dist/`    |
| `npm run preview` | Serves the built `dist/` folder                   |
| `npm run lint`    | Runs oxlint on the source                         |

Styling uses Tailwind CSS, loaded from a CDN in `index.html`, so you need an internet connection for the page to be styled. The only npm dependencies are React and React DOM.

## Features

- **Add and edit tasks** through one form, with validation messages under each field.
- **Change status** (Pending, In Progress, Completed) from each task card. Completed tasks are crossed out.
- **Delete tasks.**
- **Filter** by status and priority, and **search** titles and descriptions. Active filters show as chips. Click a chip to remove that filter, or use "Clear all".
- **Sort** by due date, priority (high first) or title, or keep your own order.
- **Reorder** tasks with the ↑ and ↓ buttons while sorting is set to "My order".
- **Statistics:** a progress bar and counts of pending, in-progress, completed and overdue tasks.
- **Saves automatically** to `localStorage`, so tasks and theme survive a page reload.
- **Export / Import** all tasks as a `.json` file. An import is checked before it replaces your current tasks.
- **Light and dark mode** with a toggle switch in the header.
- **Responsive:** the form sits beside the list on screens 1024px and wider, and everything stacks on smaller screens.
- **Transitions:** new tasks fade in, and colours, the progress bar and the theme switch animate. Animation is turned off for users whose system asks for reduced motion.

## Project structure

```
src/
├── App.tsx                         Renders the Dashboard
├── main.tsx                        React entry point
├── types/index.tsx                 All TypeScript types and prop interfaces
├── utils/taskUtils.ts              Filtering, sorting, validation and date helpers
└── components/
    ├── Dashboard/Dashboard.tsx     Holds all state; header, stats, layout
    ├── TaskForm/TaskForm.tsx       Add / edit form with validation
    ├── TaskFilter/TaskFilter.tsx   Search, status and priority filters
    └── TaskList/
        ├── TaskList.tsx            Sort dropdown and the list of tasks
        └── TaskItem.tsx            One task card
```

## How state is managed

`Dashboard` is the only component with app-level state:

| State         | Type                  | Purpose                                         |
| ------------- | --------------------- | ----------------------------------------------- |
| `tasks`       | `Task[]`              | Every task, in the user's own order             |
| `theme`       | `Theme`               | `"light"` or `"dark"`                           |
| `editingTask` | `Task \| undefined`   | The task loaded into the form, if editing       |
| `sortBy`      | `SortOption`          | Current sort                                    |
| `filters`     | `FilterOptions`       | Current status, priority and search filters     |
| `message`     | `string`              | Result of the last import                       |

Data flows **down** as props and changes flow **up** through callback props (`onSubmit`, `onFilterChange`, `onDelete`, …). The list on screen and the statistics are worked out from `tasks` on every render instead of being stored as separate state, so they can never get out of sync:

```ts
const visibleTasks = sortTasks(filterTasks(tasks, filters), sortBy);
```

`TaskForm` keeps its own state for the fields being typed. The Dashboard renders it with `key={editingTask?.id ?? "new"}`, so React starts a fresh form whenever you switch which task you're editing.

New task ids are numbers that count up: each new task gets the highest existing id plus one. Ids stay unique after deleting tasks or reloading the page.

## Components and props

All prop types are in [`src/types/index.tsx`](src/types/index.tsx).

### `Dashboard`

No props. Render it once, from `App`.

### `TaskForm`

| Prop          | Type                           | Description                                              |
| ------------- | ------------------------------ | -------------------------------------------------------- |
| `theme`       | `Theme`                        | Light or dark styling                                    |
| `initialTask` | `Task` (optional)              | If given, the form edits this task instead of adding one |
| `onSubmit`    | `(data: TaskFormData) => void` | Called with trimmed, valid data                          |
| `onCancel`    | `() => void`                   | Called by the Cancel button (shown only when editing)    |

Validation rules: the title is required and 3–80 characters, the description is optional and up to 200 characters, and the due date is required and can't be in the past. An edited task may keep a due date that has already passed.

```tsx
<TaskForm theme="light" onSubmit={(data) => console.log(data)} onCancel={() => {}} />
```

### `TaskFilter`

| Prop             | Type                               | Description                              |
| ---------------- | ---------------------------------- | ---------------------------------------- |
| `filters`        | `FilterOptions`                    | Current filter values                    |
| `theme`          | `Theme`                            | Light or dark styling                    |
| `onFilterChange` | `(filters: FilterOptions) => void` | Called with the full, updated filter set |

`"all"` means "don't filter by this". Search matches the title or description and ignores capitalisation.

### `TaskList`

| Prop             | Type                                               | Description                               |
| ---------------- | -------------------------------------------------- | ----------------------------------------- |
| `tasks`          | `Task[]`                                           | Tasks to show (already filtered/sorted)   |
| `theme`          | `Theme`                                            | Light or dark styling                     |
| `sortBy`         | `SortOption`                                       | Value of the sort dropdown                |
| `onSortChange`   | `(sortBy: SortOption) => void`                     | Called when the sort dropdown changes     |
| `onStatusChange` | `(taskId: number, newStatus: TaskStatus) => void`  | Passed to each `TaskItem`                 |
| `onEdit`         | `(task: Task) => void`                             | Passed to each `TaskItem`                 |
| `onDelete`       | `(taskId: number) => void`                         | Passed to each `TaskItem`                 |
| `onMove`         | `(taskId: number, direction: MoveDirection) => void` | Passed to each `TaskItem`               |

Each task is rendered with `key={task.id}`. When `tasks` is empty, it shows a message instead.

### `TaskItem`

| Prop             | Type                                                 | Description                    |
| ---------------- | ---------------------------------------------------- | ------------------------------ |
| `task`           | `Task`                                               | The task to show               |
| `theme`          | `Theme`                                              | Light or dark styling          |
| `onStatusChange` | `(taskId: number, newStatus: TaskStatus) => void`    | Status dropdown changed        |
| `onEdit`         | `(task: Task) => void`                               | Edit button clicked            |
| `onDelete`       | `(taskId: number) => void`                           | Delete button clicked          |
| `onMove`         | `(taskId: number, direction: MoveDirection) => void` | ↑ or ↓ clicked                 |

## Utility functions (`src/utils/taskUtils.ts`)

| Function                              | Purpose                                                        |
| ------------------------------------- | -------------------------------------------------------------- |
| `getToday()`                          | Today as `YYYY-MM-DD` in the user's own timezone               |
| `formatDate(date)`                    | `"2026-10-31"` → `"Oct 31, 2026"`                              |
| `validateTaskForm(data, originalDue?)`| Returns an error message for each invalid field                |
| `isFormValid(errors)`                 | `true` when there are no error messages                        |
| `isValidTaskList(data)`               | Checks imported or saved data really is a list of tasks        |
| `filterTasks(tasks, filters)`         | Tasks matching status, priority and search                     |
| `sortTasks(tasks, sortBy)`            | Sorted copy of the tasks (the original isn't changed)          |

## Notes on the assignment checklist

- **Search bar:** the search box is part of `TaskFilter`, because search is one of the `FilterOptions`. Keeping it there means one piece of state controls all filtering. The list it filters is the one `TaskList` shows.
- **Task addition** goes through `TaskForm`. The Dashboard adds the new task to the list that `TaskList` renders.
- **Reordering** uses ↑ and ↓ buttons instead of a drag-and-drop library. No extra packages are needed, and the buttons work with a keyboard and on touch screens. Moving works with filters on: a task swaps with the task shown next to it.

## Manual test checklist

Checks to run in the browser before submitting:

**Form validation**
- [ ] Submitting the empty form shows "Title is required." and "Due date is required."
- [ ] A 1–2 character title shows the minimum-length message; 81+ characters shows the maximum.
- [ ] A description over 200 characters shows an error.
- [ ] A past due date is rejected for a new task.
- [ ] After a failed submit, fixing a field clears its error as you type.
- [ ] A successful add clears the form.

**Filtering, search and sorting**
- [ ] Each status and priority filter shows only matching tasks; combined filters work together.
- [ ] Search finds words in the description as well as the title, regardless of case.
- [ ] Each active filter shows a chip; clicking it removes only that filter; "Clear all" removes all.
- [ ] Sorting by due date, priority and title orders the list correctly; "My order" restores manual order.

**Component interactions**
- [ ] Changing status updates the card and the statistics.
- [ ] Edit loads the task into the form; switching to another task's Edit reloads the form; Cancel returns to "Add a task".
- [ ] Delete removes the task (and closes the form if that task was being edited).
- [ ] ↑ / ↓ move tasks, including while a filter is on, and do nothing while a sort is applied.
- [ ] Tasks and theme are still there after reloading the page.
- [ ] Export downloads a `.json` file; importing it restores the tasks; importing a non-task file shows an error and changes nothing.

**Responsive design and theme**
- [ ] At phone width (375px) everything stacks with no sideways scrolling.
- [ ] At tablet width (768px) the layout still stacks, and filter controls sit side by side.
- [ ] At 1024px and wider the form sits beside the list and stays in view while scrolling.
- [ ] The dark mode switch changes every component, including the date picker.
