import { useState } from "react";
import TaskMenu from "../../tasks/TaskMenu";

import dropdown_icon from "@/assets/dropdown.svg";
import dropup_icon from "@/assets/dropup.svg";

import visible_icon from "@/assets/visible.svg";
import invisible_icon from "@/assets/invisible.svg";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";

import { Disclosure } from "@headlessui/react";
import { matchDate } from "@/utils/date";
import { isTaskDone, sortByDate, sortByPriority } from "@/utils/data";
import { Task } from "@/hooks/tasks";
import { useUpdateSettings, useSettings } from "@/hooks/settings";
import { useApp, useAppReducer } from "@/hooks/app";
import { UseQueryResult } from "@tanstack/react-query";

interface ContainerSettings {
  identifier: string;
  title: string;
  tasks: UseQueryResult<Task>;
}

export default function TaskContainer({
  skeleton,
  identifier,
  title,
  tasks,
  activeFilter,
  setIsInspecting,
}: ContainerSettings) {
  const [appData, setAppData] = useApp();
  const [taskFilter, setTaskFilter] = useState("incomplete");
  const { mutate: setSettings } = useUpdateSettings();
  const settings = useSettings();

  if (skeleton) {
    return (
      <div className="group flex flex-col items-center w-full h-full my-2">
        <div className="w-full flex flex-row items-center rounded-2xl bg-white/90 px-3 py-3 text-slate-900 shadow-md ring-1 ring-accent-blue/10 [&:has(.task-container-accordian:hover)]:ring-accent-blue/30">
          <div className="w-full flex flex-row justify-between">
            <div className="flex flex-row items-center py-1">
              <ChevronRightIcon
                className=""
                width="32"
              />
              <div className="flex flex-row gap-2">
                <h1 className="text-xl font-semibold">{title}</h1>
                <h1 className="text-xl text-accent-blue-700">(0/0)</h1>
              </div>
            </div>
            <div className="flex flex-row items-center">
              <div className="flex items-center gap-2 rounded-full px-2 py-1">
                <div className="flex rounded-full bg-white/70 border border-accent-blue/20 overflow-hidden">
                  <span className="px-2 py-1 text-xs text-accent-blue-700">All</span>
                  <span className="px-2 py-1 text-xs text-slate-500">Incomplete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-full">
          <TaskMenu skeleton="true" />
        </div>
      </div>
    )
  }

  let baseTasks: Task[];

  if (Array.isArray(tasks))
    baseTasks = tasks;
  else
    baseTasks = tasks?.isSuccess ? sortByDate(tasks?.data) : [];

  baseTasks = sortByPriority(baseTasks);

  const handleClick = async (open: boolean) => {
    let groupsActive = settings.data?.groupsActive;

    if (typeof groupsActive == "undefined") groupsActive = [];

    if (open) {
      groupsActive?.splice(groupsActive.indexOf(identifier), 1);
    } else {
      groupsActive?.push(identifier);
    }

    setSettings({ groupsActive });
  };

  // TODO: Fix this bandaid
  baseTasks = baseTasks.map((task) => {
    if (typeof task.done == "undefined") task.done = false;

    return task;
  });

  // TODO: Migrate to query fetch
  if (taskFilter == "incomplete") {
    baseTasks = baseTasks.filter((task) => isTaskDone(task, appData.activeDate));
  }

  return (
    <div className="group flex flex-col items-center w-full h-full my-2">
      {/* Migrate to dynamic loading content */}
      {settings.isLoading && <span>Loading...</span>}
      {settings.isError && <span>Error: {settings.error.message}</span>}
      {settings.isSuccess && (
        <Disclosure
          defaultOpen={settings.data.groupsActive?.includes(identifier)}
        >
          {({ open }) => (
            <>
              <Disclosure.Button
                onClick={async () => await handleClick(open)}
                as="div"
                className="w-full flex flex-row items-center rounded-2xl bg-white/90 px-3 py-3 text-slate-900 shadow-md ring-1 ring-accent-blue/10 transition hover:-translate-y-0.5 hover:ring-accent-blue/30 [&:has(.task-container-accordian:hover)]:ring-accent-blue/30"
              >
                <div className="w-full flex flex-row justify-between">
                  <div className="flex flex-row items-center py-1">
                    <ChevronRightIcon
                      className={open ? "rotate-90 transform" : ""}
                      width="32"
                    />
                    <div className="flex flex-row gap-2">
                      <h1 className="text-xl font-semibold">{title}</h1>
                      {baseTasks.filter((task) => !task.done).length > 0 && (
                        <h1 className="text-xl text-accent-blue-700">
                          ({baseTasks.filter((task) => !task.done).length}/
                          {baseTasks.length})
                        </h1>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row items-center">
                    <div className="flex items-center gap-2 rounded-full px-2 py-1">
                      <div className="flex rounded-full bg-white/70 border border-accent-blue/20 overflow-hidden">
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs font-semibold transition ${taskFilter === "all"
                            ? "bg-accent-blue text-white"
                            : "text-slate-600"
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskFilter("all");
                          }}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 text-xs font-semibold transition ${taskFilter === "incomplete"
                            ? "bg-accent-blue text-white"
                            : "text-slate-600"
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskFilter("incomplete");
                          }}
                        >
                          Incomplete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Disclosure.Button>
              <Disclosure.Panel className="w-full h-full">
                {/* {!settings.data.groupsActive?.includes(identifier) && ( */}
                <TaskMenu
                  tasks={baseTasks}
                  setIsInspecting={setIsInspecting}
                  taskFilter={taskFilter}
                />
                {/* )} */}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )}
    </div>
  );
}
