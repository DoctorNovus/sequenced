import { getNameByDate, matchDate } from "@/utils/date";
import TaskContainer from "../menus/TaskContainer/TaskContainer";
import { isDateWithinProximity, sortByDate } from "@/utils/data";
import { useApp } from "@/hooks/app";

export default function DayTasks({ skeleton, tasks, setIsInspecting }) {
  const [appData, setAppData] = useApp();

  if (skeleton) {
    return (
      <TaskContainer
        skeleton="true"
        identifier="daily"
        activeFilter="generalTasks"
        title="Today's Tasks"
      />
    );
  }

  const getDayTasks = () => {
    if (!tasks.isSuccess)
      return [];

    tasks = sortByDate(tasks.data);

    const dayTasks = [];

    for (let task of tasks) {
      if (task.repeater) {
        let isProxim = isDateWithinProximity(task.repeater, task, appData.activeDate);
        if (isProxim) {
          dayTasks.push(task);
        }
      } else {
        if (matchDate(new Date(task.date), appData.activeDate)) {
          dayTasks.push(task);
        }
      }
    }

    return dayTasks;
  };

  return (
    <TaskContainer
      identifier="daily"
      activeFilter="generalTasks"
      title={`${getNameByDate(appData.activeDate.getDay())}'s Tasks`}
      tasks={getDayTasks()}
      setIsInspecting={setIsInspecting}
    />
  );
}
