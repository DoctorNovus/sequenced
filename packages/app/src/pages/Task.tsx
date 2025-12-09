import { useEffect, useState } from "react";
import { useTasks, filterBroken } from "@/hooks/tasks";
import { sortByDate } from "@/utils/data";

import DayTasks from "../components/calendar/DayTasks";
import ActiveCalendar from "../components/calendar/ActiveCalendar";
import TaskContainer from "@/components/menus/TaskContainer/TaskContainer";
import { getPending } from "@/utils/notifs";
import { SERVER_IP, useApp } from "@/hooks/app";
import TaskInfoMenu from "@/pages/(Layout)/TaskInfoMenu";
import { Logger } from "@/utils/logger";

export default function Task() {
  const [appData, setAppData] = useApp();
  const [activeDate, setActiveDate] = useState(appData.activeDate);
  const [isInspecting, setIsInspecting] = useState(false);

  const tasks = useTasks();

  if (tasks.isError)
    Logger.logError(tasks.error.message);

  useEffect(() => {
    if (appData.activeTask && !isInspecting) {
      setIsInspecting(true);

      if (appData.activeTask.date) {
        const targetDate = new Date(appData.activeTask.date);
        setAppData({
          ...appData,
          activeDate: targetDate,
        });
      }
    }
  }, [appData, isInspecting, setAppData]);

  if (tasks.isLoading) {
    return (
      <div className="w-full h-full text-accent-black">
        <div className="h-full">
          <div className="flex flex-col items-center gap-4 px-3 md:px-6">
            <ActiveCalendar skeleton="true" />
            <DayTasks skeleton="true" />
            <TaskContainer title="All Tasks" skeleton="true" />
          </div>
          <div>
            {/* <TaskInfoMenu skeleton="true" /> */}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full text-accent-black">
      <div className="h-full">
        <div className="flex w-full justify-center">
          <div className="flex w-full max-w-4xl flex-col items-center gap-4 px-3 md:px-6">
            <ActiveCalendar />
            <DayTasks
              setIsInspecting={setIsInspecting}
              tasks={tasks}
            />
            <TaskContainer
              identifier="all"
              setIsInspecting={setIsInspecting}
              title="All Tasks"
              tasks={tasks}
              activeFilter="dailyTasks"
            />
          </div>
        </div>
        <div>
          <TaskInfoMenu
            type="edit"
            isOpen={isInspecting}
            setIsOpen={setIsInspecting}
          />
        </div>
      </div>
    </div>
  );
}
