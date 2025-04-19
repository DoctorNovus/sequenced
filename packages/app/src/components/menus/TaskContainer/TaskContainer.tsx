import { useState } from "react";
import TaskMenu from "../../tasks/TaskMenu";

import dropdown_icon from "@/assets/dropdown.svg";
import dropup_icon from "@/assets/dropup.svg";

import visible_icon from "@/assets/visible.svg";
import invisible_icon from "@/assets/invisible.svg";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";

import { Disclosure, Menu } from "@headlessui/react";
import TaskMenuItem from "./TaskMenuItem";
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
      <div className="group flex flex-col items-center w-[90%] h-full my-2">
        <div className="w-full flex flex-row items-center border bg-accent-blue text-accent-white border-accent-blue rounded-lg px-2  hover:bg-accent-blue-600 [&:has(.task-container-accordian:hover)]:bg-accent-blue">
          <div className="w-full flex flex-row justify-between">
            <div className="flex flex-row items-center py-1">
              <ChevronRightIcon
                className=""
                width="32"
              />
              <div className="flex flex-row gap-2">
                <h1 className="text-xl">{title}</h1>
                <h1 className="text-xl text-accent-white">(0/0)</h1>
              </div>
            </div>
            <div className="flex flex-row items-center">
              <Menu>
                <Menu.Button>
                  <div className="group/filter task-container-accordian">
                    <AdjustmentsHorizontalIcon
                      width="32"
                      className="group-hover/filter:fill-accent-blue"
                    />
                  </div>
                </Menu.Button>
                <div className="group/filter relative inset-0 z-20">
                  <Menu.Items className="flex flex-col absolute right-4 top-4 gap-2 bg-white border border-solid shadow-md rounded-lg py-4 px-4 z-30">
                    <TaskMenuItem skeleton="true">
                      <span>All</span>
                    </TaskMenuItem>
                    <TaskMenuItem skeleton="true">
                      <span>Incomplete</span>
                    </TaskMenuItem>
                  </Menu.Items>
                </div>
              </Menu>
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
    <div className="group flex flex-col items-center w-[90%] h-full my-2">
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
                className="w-full flex flex-row items-center border bg-accent-blue text-accent-white border-accent-blue rounded-lg px-2  hover:bg-accent-blue-600 [&:has(.task-container-accordian:hover)]:bg-accent-blue"
              >
                <div className="w-full flex flex-row justify-between">
                  <div className="flex flex-row items-center py-1">
                    <ChevronRightIcon
                      className={open ? "rotate-90 transform" : ""}
                      width="32"
                    />
                    <div className="flex flex-row gap-2">
                      <h1 className="text-xl">{title}</h1>
                      {baseTasks.filter((task) => !task.done).length > 0 && (
                        <h1 className="text-xl text-accent-white">
                          ({baseTasks.filter((task) => !task.done).length}/
                          {baseTasks.length})
                        </h1>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row items-center">
                    <Menu>
                      <Menu.Button>
                        <div className="group/filter task-container-accordian">
                          <AdjustmentsHorizontalIcon
                            width="32"
                            className="group-hover/filter:fill-accent-blue"
                          />
                        </div>
                      </Menu.Button>
                      <div className="group/filter relative inset-0 z-20">
                        <Menu.Items className="flex flex-col absolute right-4 top-4 gap-2 bg-white border border-solid shadow-md rounded-lg py-4 px-4 z-30">
                          <TaskMenuItem
                            active={taskFilter == "all"}
                            handleClick={() => setTaskFilter("all")}
                          >
                            <span>All</span>
                          </TaskMenuItem>
                          <TaskMenuItem
                            active={taskFilter == "incomplete"}
                            handleClick={() => setTaskFilter("incomplete")}
                          >
                            <span>Incomplete</span>
                          </TaskMenuItem>
                        </Menu.Items>
                      </div>
                    </Menu>
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
