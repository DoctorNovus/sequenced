import { isTaskDone } from "@/utils/data";

interface ShellParams {
  skeleton: boolean;
  className?: string;
}

export default function TaskItemShell({ skeleton, children, task, activeDate, className = "", ...props }: ShellParams) {
  if (skeleton) {
    return (
      <div className="group flex flex-col w-full rounded-2xl surface-card border px-4 py-3 shadow-md ring-1 ring-accent-blue/10 backdrop-blur-sm transition duration-200 ease-out hover:shadow-lg hover:ring-2 hover:ring-accent-blue/40 text-primary">
        {children}
      </div>
    )
  }

  const isCompleted = !isTaskDone(task, activeDate);

  return (
    <div
      {...props}
      data-completed={isCompleted}
      className={`group flex flex-col w-full rounded-2xl surface-card border px-3.5 py-3 shadow-md ring-1 ring-accent-blue/10 backdrop-blur-sm transition-all duration-300 ease-out hover:shadow-lg hover:ring-2 hover:ring-accent-blue/40 text-primary ${isCompleted ? "opacity-30 translate-y-1 scale-[0.99]" : "opacity-100"} ${className}`}
    >
      {children}
    </div>
  );
}
