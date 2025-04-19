import { Task, createInitialTaskData } from "@/hooks/tasks";
import TaskInfoMenuSubtask from "./TaskInfoMenuSubtask";
import { createID } from "@/utils/id";
import { Logger } from "@/utils/logger";

export interface TaskInfoMenuSubtaskMenuParams {
  subtasks: Task[];
  tempData: Task;
  setTempData: CallableFunction;
}

export default function TaskInfoMenuSubtaskMenu({
  subtasks,
  tempData,
  setTempData,
  setIsOpen
}: TaskInfoMenuSubtaskMenuParams) {
  const createNewSubtask = () => {
    Logger.log("Initial subtasks", tempData.subtasks);

    const tempSubtasks = [...(tempData.subtasks || [])];

    Logger.log("Temp Old Subtasks", tempSubtasks);

    const newTask: Task = {
      ...createInitialTaskData(),
      id: createID(20),
    };

    tempSubtasks.push(newTask);

    Logger.log("New Task", newTask);

    Logger.log("Temp New Subtasks", tempSubtasks);

    setTempData({
      subtasks: tempSubtasks,
    });
  };

  const deleteSubtask = (task: Task) => {
    const tempSubtasks = tempData.subtasks ?? [];

    const subtaskData = tempSubtasks.find((tempTask: Task) => tempTask == task);

    if (subtaskData) {
      tempSubtasks.splice(tempSubtasks.indexOf(subtaskData), 1);
    }

    setTempData({
      subtasks: tempSubtasks,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center">
        <h1 className="text-lg">Sub Tasks</h1>
        <button
          onClick={(e) => createNewSubtask()}
          className="text-lg bg-accent-blue w-8 h-8 rounded-lg"
        >
          +
        </button>
      </div>
      <div className="flex flex-col gap-2 px-2">
        {subtasks?.map((task: Task, key: number) => (
          <TaskInfoMenuSubtask
            parent={tempData}
            task={task}
            key={key}
            deleteSubtask={deleteSubtask}
            setIsOpen={setIsOpen}
          />
        ))}
      </div>
    </div>
  );
}
