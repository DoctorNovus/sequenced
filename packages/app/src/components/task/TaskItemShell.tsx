import { isTaskDone } from "@/utils/data";

interface ShellParams {
  skeleton: boolean;
  className?: string;
}

export default function TaskItemShell({ skeleton, children, task, activeDate, className = "", ...props }: ShellParams) {
  if (skeleton) {
    return (
      <div className="flex flex-col w-full rounded-2xl bg-white/80 px-4 py-3 shadow-md ring-1 ring-accent-blue/10 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg">
        {children}
      </div>
    )
  }

  const isCompleted = !isTaskDone(task, activeDate);

  return (
    <div
      {...props}
      data-completed={isCompleted}
      className={`flex flex-col w-full rounded-2xl bg-white/90 px-3.5 py-3 shadow-md ring-1 ring-accent-blue/10 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-lg ${isCompleted ? "opacity-30 translate-y-1 scale-[0.99]" : "opacity-100"} ${className}`}
    >
      {children}
    </div>
  );
}
