import { TaskItem } from "../task/TaskItem";

export default function TaskMenu({ skeleton, tasks, setIsInspecting, taskFilter }) {

  if (skeleton) {
    return (
      <div className="w-full h-full flex flex-col items-center ">
        <ul className="w-full h-full pb-20 gap-3 flex flex-col items-center justify-start py-4">
          <li className="w-full h-full">
            <TaskItem skeleton="true" />
          </li>
        </ul>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center ">
      <ul className="w-full h-full pb-20 gap-3 flex flex-col items-center justify-start py-4">
        {tasks.length > 0 &&
          tasks.map((task, key) => (
            <li key={key} className="w-full h-full">
              <TaskItem item={task} setIsInspecting={setIsInspecting} taskFilter={taskFilter} />
            </li>
          ))}
        {tasks.length == 0 && (
          <h1 className="text-lg text-accent-blue">No Tasks</h1>
        )}
      </ul>
    </div>
  );
}
