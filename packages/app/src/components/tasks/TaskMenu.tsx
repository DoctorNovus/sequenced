import { TaskItem } from "../task/TaskItem";
import { isTaskDone } from "@/utils/data";

export default function TaskMenu({
  skeleton,
  tasks,
  setIsInspecting,
  taskFilter,
  selectionMode = false,
  selectedTaskIds = [],
  toggleSelection,
  animatingIds = [],
  activeDate
}) {

  if (skeleton) {
    return (
      <div className="w-full h-full flex flex-col items-center ">
        <ul className="w-full h-full pb-4 gap-2 flex flex-col items-center justify-start py-0">
          <li className="w-full h-full">
            <TaskItem skeleton="true" />
          </li>
        </ul>
      </div>
    )
  }

  const visibleTasks = (tasks || [])
    .filter(Boolean)
    .filter((task) =>
      taskFilter === "incomplete"
        ? isTaskDone(task, activeDate)
        : true
    );

  return (
    <div className="w-full h-full flex flex-col items-center ">
      <ul className="w-full h-full pb-4 gap-2 flex flex-col items-center justify-start py-4">
        {visibleTasks.length > 0 &&
          visibleTasks.map((task, key) => (
            <li key={key} className="w-full">
              <TaskItem
                item={task}
                setIsInspecting={setIsInspecting}
                taskFilter={taskFilter}
                selectionMode={selectionMode}
                isSelected={selectedTaskIds.includes(task.id)}
                onToggleSelect={toggleSelection}
                isAnimating={animatingIds.includes(task.id)}
              />
            </li>
          ))}
        {visibleTasks.length === 0 && (
          <h1 className="text-lg text-accent-blue">No Tasks</h1>
        )}
      </ul>
    </div>
  );
}
