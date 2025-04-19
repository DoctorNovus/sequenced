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

  if (tasks.isLoading) {
    return (
      <div className="w-full h-full bg-white text-accent-black">
        <div className="h-full pb-12">
          <div className="flex flex-col items-center gap-2">
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
    <div className="w-full h-full bg-white text-accent-black">
      <div className="h-full pb-12">
        <div className="flex flex-col items-center gap-2">
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
