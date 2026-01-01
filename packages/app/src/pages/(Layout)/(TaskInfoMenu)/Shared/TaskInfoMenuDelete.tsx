import { Task, useDeleteTask } from "@/hooks/tasks";

interface TaskInfoMenuDeleteProps {
  task: Task;
  closeMenu?: () => void;
  isDeleting: boolean;
  setIsDeleting: (state: boolean) => void;
}

export function TaskInfoMenuDelete({ task, closeMenu, isDeleting, setIsDeleting }: TaskInfoMenuDeleteProps) {
  const { mutate: deleteTask } = useDeleteTask();

  const setDeleteTask = async () => {
    // Close the menu immediately to avoid lingering after deletion.
    closeMenu?.();
    setIsDeleting(false);
    deleteTask(task);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full h-11 rounded-xl border text-base font-semibold shadow-xs transition hover:-translate-y-px disabled:opacity-60
          border-red-300/70 bg-red-50/80 text-red-700 hover:bg-red-100
          dark:border-red-400/50 dark:bg-[rgba(248,113,113,0.12)] dark:text-red-200"
        onClick={() => setIsDeleting(true)}
        disabled={isDeleting}
      >
        Delete task
      </button>

      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-12 md:items-center md:pb-0">
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs"
            onClick={() => setIsDeleting(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl border p-5 text-center shadow-2xl ring-1 ring-red-300/60
            border-red-300/70 bg-red-50/85 text-red-700
            dark:border-red-400/50 dark:bg-[rgba(248,113,113,0.12)] dark:text-red-100">
            <div className="mb-3 flex flex-col gap-1">
              <h1 className="text-lg font-semibold">Delete this task?</h1>
              <p className="text-sm text-red-700 dark:text-red-100">
                This will permanently remove the task.
              </p>
            </div>

            <div className="flex flex-row gap-3">
              <button
                type="button"
                className="h-11 w-full rounded-xl border border-accent-blue/20 bg-white text-sm font-semibold text-primary shadow-xs transition hover:bg-slate-50 dark:bg-[rgba(15,23,42,0.7)]"
                onClick={() => setIsDeleting(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-11 w-full rounded-xl bg-linear-to-r from-accent-red-600 to-accent-red-500 text-sm font-semibold text-white shadow-md shadow-red-200/80 ring-1 ring-red-200 transition hover:-translate-y-px"
                onClick={() => setDeleteTask()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
