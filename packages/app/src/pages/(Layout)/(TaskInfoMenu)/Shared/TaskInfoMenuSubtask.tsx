import { Task } from "@/hooks/tasks";

export interface TaskInfoMenuSubtaskParams {
  task: Task;
  onChangeTitle: (id: string | undefined, title: string) => void;
  onDelete: (id: string | undefined) => void;
}

export default function TaskInfoMenuSubtask({
  task,
  onChangeTitle,
  onDelete,
}: TaskInfoMenuSubtaskParams) {
  return (
    <div className="flex items-center gap-2">
      <input
        className="w-full rounded-xl border border-accent-blue/20 bg-white px-3 py-2 text-sm text-primary shadow-inner focus:border-accent-blue focus:outline-none dark:bg-[rgba(15,23,42,0.7)]"
        value={task.title ?? ""}
        onChange={(e) => onChangeTitle(task.id, e.target.value)}
        placeholder="Subtask title"
      />
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="rounded-lg border border-accent-red-100 bg-accent-red-500/90 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:-translate-y-px transition"
      >
        Remove
      </button>
    </div>
  );
}
