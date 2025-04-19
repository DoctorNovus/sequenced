import { useApp } from "@/hooks/app";
import { Task } from "@/hooks/tasks";

export interface TaskInfoMenuSubtaskParams {
  task: Task;
  parent: Task;
  deleteSubtask: CallableFunction;
}

export default function TaskInfoMenuSubtask({
  task,
  parent,
  deleteSubtask,
  setIsOpen,
}: TaskInfoMenuSubtaskParams) {
  const [appData, setAppData] = useApp();

  const openSubtaskMenu = () => {
    setAppData({
      ...appData,
      activeParent: parent,
      activeTask: task,
    });
  };

  return (
    <div
      className="flex flex-row items-center gap-2"
      onClick={(e) => openSubtaskMenu()}
    >
      <div className="w-full text-base px-2 py-2 bg-white border border-accent-black-500 rounded-md text-accent-black overflow-x-hidden overflow-y-scroll hover:bg-accent-black-600">
        {task.title || "No Title"}
      </div>
      <div>
        <span
          className="px-5 py-2 bg-accent-red-500 rounded-lg text-lg"
          onClick={(e) => deleteSubtask(task)}
        >
          -
        </span>
      </div>
    </div>
  );
}
