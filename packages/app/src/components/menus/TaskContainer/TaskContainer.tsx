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
import { useUpdateTask } from "@/hooks/tasks";

interface ContainerSettings {
  skeleton?: boolean | string;
  identifier: string;
  title: string;
  tasks: UseQueryResult<Task[]> | Task[];
  activeFilter?: string;
  setIsInspecting?: (value: boolean) => void;
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [animatingIds, setAnimatingIds] = useState<string[]>([]);
  const { mutate: setSettings } = useUpdateSettings();
  const settings = useSettings();
  const { mutateAsync: updateTask } = useUpdateTask();

  if (skeleton) {
    return (
      <div className="group flex flex-col items-center w-full h-full my-2">
        <div className="w-full flex flex-row items-center rounded-2xl bg-white/90 px-3 py-3 text-slate-900 shadow-md ring-1 ring-accent-blue/10 [&:has(.task-container-accordian:hover)]:ring-accent-blue/30">
          <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="flex flex-row items-center sm:justify-end">
              <div className="flex w-full justify-start sm:justify-end">
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

  baseTasks = baseTasks.filter(Boolean);

  baseTasks = sortByPriority(baseTasks);

  const activeTags = appData.activeTags ?? [];

  const matchesTags = (task: Task) => {
    if (activeTags.length === 0) return true;

    const ownTags = Array.isArray(task.tags)
      ? task.tags
        .map((tag) => {
          if (typeof tag === "string") return tag.toLowerCase();
          if (tag && typeof (tag as any).title === "string") return (tag as any).title.toLowerCase();
          return "";
        })
        .filter(Boolean)
      : [];
    const subtaskTags = Array.isArray(task.subtasks)
      ? task.subtasks.flatMap((subtask) =>
        Array.isArray(subtask.tags)
          ? subtask.tags
            .map((tag) => {
              if (typeof tag === "string") return tag.toLowerCase();
              if (tag && typeof (tag as any).title === "string") return (tag as any).title.toLowerCase();
              return "";
            })
            .filter(Boolean)
          : []
      )
      : [];

    const combined = [...ownTags, ...subtaskTags];
    return activeTags.every((tag) => combined.includes(tag));
  };

  if (activeTags.length > 0) {
    baseTasks = baseTasks.filter(matchesTags);
  }

  const toggleSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedTaskIds([]);
  };

  const completeSelected = async () => {
    if (selectedTaskIds.length === 0) return;

    setAnimatingIds(selectedTaskIds);

    setTimeout(async () => {
      const activeDay = new Date(appData.activeDate ?? new Date());
      activeDay.setHours(0, 0, 0, 0);

      const toUpdate = baseTasks.filter((task) => selectedTaskIds.includes(task.id));

      const updates = toUpdate.map((task) => {
        if (task.repeater && task.repeater.length > 0) {
          const doneList = Array.isArray(task.done) ? [...task.done] : [];
          const alreadyMarked = doneList.find((d) => matchDate(new Date(d), activeDay));
          if (!alreadyMarked) doneList.push(activeDay);

          return { id: task.id, data: { ...task, done: doneList } };
        }

        return { id: task.id, data: { ...task, done: true } };
      });

      await Promise.all(updates.map((payload) => updateTask(payload)));

      setAnimatingIds([]);
      exitSelection();
    }, 240);
  };

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

  return (
    <div className="group flex flex-col items-center w-full h-full my-2 px-0 md:px-0">
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
                <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  <div className="flex flex-row items-center sm:justify-end">
                    <div className="flex w-full flex-wrap items-center justify-start sm:justify-end gap-2">
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
                      {!selectionMode && (
                        <button
                          type="button"
                          className="rounded-lg border border-accent-blue/30 bg-white px-3 py-1.5 text-xs font-semibold text-accent-blue shadow-sm hover:-translate-y-px transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectionMode(true);
                          }}
                        >
                          Select
                        </button>
                      )}
                      {selectionMode && (
                        <>
                          <button
                            type="button"
                            className="rounded-lg border border-emerald-300 bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:-translate-y-px transition disabled:opacity-60"
                            disabled={selectedTaskIds.length === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              completeSelected();
                            }}
                          >
                            Complete ({selectedTaskIds.length})
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:-translate-y-px transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              exitSelection();
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
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
                  selectionMode={selectionMode}
                  selectedTaskIds={selectedTaskIds}
                  toggleSelection={toggleSelection}
                  animatingIds={animatingIds}
                  activeDate={appData.activeDate}
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
