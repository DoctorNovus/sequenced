import { isTaskDone } from "@/utils/data";

interface ShellParams {
  skeleton: boolean;
}

export default function TaskItemShell({ skeleton, children, task, activeDate, ...props }: ShellParams) {
  if (skeleton) {
    return (
      <div className="flex flex-col w-full border border-solid border-accent-blue shadow-sm px-3 py-2 rounded-md items-center justify-center gap-2 hover:bg-accent-white-100">
        {children}
      </div>
    )
  }

  return (
    <div {...props} className={`flex flex-col w-full border border-solid border-accent-blue shadow-sm px-3 py-2 rounded-md items-center justify-center gap-2 ${!isTaskDone(task, activeDate) && "opacity-60"} hover:bg-accent-white-100`}>
      {children}
    </div>
  );
}
