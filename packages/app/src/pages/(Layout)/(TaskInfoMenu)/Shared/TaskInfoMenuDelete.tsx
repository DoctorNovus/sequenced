import { useDeleteTask } from "@/hooks/tasks";

export function TaskInfoMenuDelete({
  task,
  closeMenu,
  isDeleting,
  setIsDeleting,
  parent
}) {
  const { mutate: deleteTask } = useDeleteTask();

  const setDeleteTask = () => {
    deleteTask(task);

    setIsDeleting(false);

    closeMenu();
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full h-11 rounded-xl border border-accent-red-200 bg-white text-base font-semibold text-accent-red-700 shadow-sm transition hover:-translate-y-px hover:bg-accent-red-50 disabled:opacity-60"
        onClick={() => setIsDeleting(true)}
        disabled={isDeleting}
      >
        Delete task
      </button>

      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-12 md:items-center md:pb-0">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsDeleting(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/95 p-5 text-center text-slate-900 shadow-2xl ring-1 ring-accent-blue/15">
            <div className="mb-3 flex flex-col gap-1">
              <h1 className="text-lg font-semibold">Delete this task?</h1>
              <p className="text-sm text-slate-600">
                This will permanently remove the task and any subtasks.
              </p>
            </div>

            <div className="flex flex-row gap-3">
              <button
                type="button"
                className="h-11 w-full rounded-xl border border-accent-blue/20 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                onClick={() => setIsDeleting(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-11 w-full rounded-xl bg-gradient-to-r from-accent-red-600 to-accent-red-500 text-sm font-semibold text-white shadow-md shadow-red-200/80 ring-1 ring-red-200 transition hover:-translate-y-px"
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
