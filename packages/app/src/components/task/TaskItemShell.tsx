import { isTaskDone } from "@/utils/data";

interface ShellParams {
  skeleton: boolean;
}

export default function TaskItemShell({ skeleton, children, task, activeDate, ...props }: ShellParams) {
  if (skeleton) {
    return (
      <div className="flex flex-col w-full rounded-2xl bg-white/80 px-4 py-3 shadow-md ring-1 ring-accent-blue/10 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg">
        {children}
      </div>
    )
  }

  return (
    <div
      {...props}
      className={`flex flex-col w-full rounded-2xl bg-white/90 px-4 py-3 shadow-md ring-1 ring-accent-blue/10 backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg ${!isTaskDone(task, activeDate) && "opacity-60"
        }`}
    >
      {children}
    </div>
  );
}
