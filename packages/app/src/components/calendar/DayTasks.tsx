import { DaysAsNumbers, getNameByDate, matchDate } from "@/utils/date";
import TaskContainer from "../menus/TaskContainer/TaskContainer";
import { isDateWithinProximity, sortByDate } from "@/utils/data";
import { useApp } from "@/hooks/app";

interface DayTasksProps {
  skeleton?: boolean;
  tasks?: any; /* this seems to come from react-query, we can likely move this query into this component */
  setIsInspecting?: (state: boolean) => void;
}

export default function DayTasks({ skeleton, tasks, setIsInspecting }: DayTasksProps) {
  const [appData] = useApp();

  if (skeleton) {
    return (
      <TaskContainer
        skeleton="true"
        identifier="daily"
        activeFilter="generalTasks"
        title="Today's Tasks"
        tasks={tasks}
      />
    );
  }

  const getDayTasks = () => {
    if (!tasks.isSuccess)
      return [];

    tasks = sortByDate(tasks.data).filter(Boolean);

    const dayTasks = [];

    for (let task of tasks) {
      if (task.repeater) {
        let isProxim = isDateWithinProximity(task.repeater, task, appData.activeDate!);
        if (isProxim) {
          dayTasks.push(task);
        }
      } else {
        if (matchDate(new Date(task.date), appData.activeDate!)) {
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
      title={`${getNameByDate(appData.activeDate?.getDay() as DaysAsNumbers)}'s Tasks`}
      tasks={getDayTasks()}
      setIsInspecting={setIsInspecting}
    />
  );
}
