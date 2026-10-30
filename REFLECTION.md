# Reflection: Task Management Dashboard

## How I implemented React and TypeScript features

I started with the types before writing any components. Everything lives in `src/types/index.tsx`: the `Task` interface, union types like `TaskStatus` (`'pending' | 'in-progress' | 'completed'`) and `TaskPriority`, the form data, the form errors, the filter options, and a props interface for every component. Writing the props first meant that when I built each component, TypeScript already knew what it should receive. If I passed the wrong thing from the Dashboard, the editor told me straight away.

I kept the types simple on purpose. My first version used utility types like `Omit<Task, 'id'>` and `Partial<Record<...>>`. They worked, but they were harder to read than they needed to be, so I replaced them with plain interfaces that list each field. I also switched task ids from random strings to numbers that count up. Each new task gets the highest existing id plus one, so ids stay unique even after deleting tasks or reloading the page.

On the React side, the app uses:

- **`useState`** for all state, with functional updates (`setTasks(prev => ...)`) so each change builds on the latest list.
- **`useEffect`** to save tasks and the theme to `localStorage` whenever they change, and lazy initial state (`useState(loadTasks)`) to read them back once when the page loads.
- **Controlled form inputs** in `TaskForm`. Every input's value comes from state, and one `handleChange` updates the right field using the input's `name`.
- **List rendering with `key={task.id}`**, so React can keep track of each card when tasks are added, deleted, sorted or moved.
- **Typed events**, like `ChangeEvent<HTMLInputElement>` and `FormEvent<HTMLFormElement>`.

One TypeScript lesson stood out: types only exist while you're writing code. When I added JSON import, I realised a file could contain anything, and TypeScript can't check it at runtime. So I wrote `isValidTaskList`, which checks every field by hand. It returns `data is Task[]`, which tells TypeScript the data is safe to use once the check passes.

## Challenges and how I overcame them

**Keeping the project simple.** My first plan added a drag-and-drop library and several extra files. I decided that was more than the project needed and stuck to the file layout I had planned. For reordering, I replaced drag-and-drop with ↑ and ↓ buttons. They need no extra package and also work with a keyboard and on touch screens.

**Moving tasks while filtered or sorted.** The first version of moving swapped a task with its neighbour in the *full* list. With a filter on, that neighbour could be hidden, so clicking ↑ looked like it did nothing. I changed it to find the neighbour in the *visible* list, then swap those two tasks in the full list. While a sort is applied, moving doesn't make sense, so the buttons do nothing and a note explains why.

**The edit form not updating.** `useState` only reads its starting value the first time a component appears. When I clicked Edit on one task and then on another, the form kept showing the first one. Giving the form a `key` based on the task being edited fixed it, because React starts a fresh form whenever the key changes.

**Dates and timezones.** `new Date("2026-10-31")` is read as midnight UTC, which in US timezones shows as the day before. I wrote `formatDate` to build the date from its year, month and day in local time, and `getToday` uses the local date too. That way "overdue" and "can't be in the past" are based on the user's own calendar.

**Editing overdue tasks.** Applied as-is, the "due date can't be in the past" rule would block saving *any* change to a task that was already overdue, even fixing a typo in its title. So the validator also receives the task's original due date, and the rule only applies when the date is changed to something new.

**Bad data.** `localStorage` can throw errors in some private-browsing modes or when it's full, so every read and write is wrapped in `try/catch`, and the app keeps working without saving. While testing the import check, I found it crashed on a file containing `null` because it kept checking ids after an item had already failed. Returning early fixed that.

## Component composition and state management

The structure is one "smart" parent with simple children:

```
App
└── Dashboard          (all state lives here)
    ├── TaskForm       (add / edit)
    ├── TaskFilter     (search, status, priority)
    └── TaskList       (sort + list)
        └── TaskItem   (one card)
```

`Dashboard` owns the tasks, theme, filters, sort, the task being edited, and the import message. The children receive data through props and report changes through callback props like `onSubmit`, `onFilterChange` and `onDelete`. None of them change the task list directly. Because all the changes happen in one place, it's easy to follow what happens when you click something.

I avoided storing anything that can be worked out from other state. The visible list is `sortTasks(filterTasks(tasks, filters), sortBy)`, and the statistics are counted from `tasks`, both on every render. If I had stored the filtered list as its own state, I'd have had to remember to update it every time a task changed, and it could easily get out of sync.

The theme is passed down as a prop to every component that needs different colours, as the assignment asked. Each component checks `theme === "dark"` and picks its classes. For an app this size, passing props down one or two levels was easy to follow, so I didn't need React Context.

The only component with its own state is `TaskForm`, because what you're typing doesn't belong to the rest of the app until you submit. The pure logic (filtering, sorting, validation, date formatting) lives in `taskUtils.ts`, outside any component. That kept the components focused on what they show, and let me test those functions on their own.

If I continued this project, I would add automated tests for `taskUtils.ts`, and an "undo" for deleting a task.
