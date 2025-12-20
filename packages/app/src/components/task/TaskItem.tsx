import { Task, useDeleteTask, useUpdateTask } from "@/hooks/tasks";
import { matchDate } from "@/utils/date";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskItemShell from "./TaskItemShell";
import TaskItemCheckBox from "./TaskItemCheckbox";
import TaskItemTitle from "./TaskItemTitle";
import TaskItemDate from "./TaskItemDate";
import { isTaskDone } from "@/utils/data";
import { useApp } from "@/hooks/app";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

interface TaskItemParams {
  skeleton: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isAnimating?: boolean;
}

export function TaskItem({ skeleton, item, setIsInspecting, type, parent, taskFilter, selectionMode = false, isSelected = false, onToggleSelect, isAnimating = false }: TaskItemParams) {

  if (skeleton) {
    return (
      <div className="w-full flex flex-col gap-2">
        <TaskItemShell skeleton>
          <div className="w-full h-full flex flex-row items-center">
            <TaskItemCheckBox skeleton="true" />
            <div className="w-full">
              <div className="w-full flex flex-row items-center justify-between">
                <TaskItemTitle text="Loading..." />
              </div>
              <div className="w-fit flex flex-row flex-end items-center justify-start px-2">
                <div className="w-full h-full flex items-center justify-evenly">
                  <TaskItemDate task={item} />
                </div>
              </div>
            </div>
          </div>
        </TaskItemShell>
        <div className="w-full flex justify-end">
          <div className="w-full pl-10 flex flex-col justify-end gap-1"></div>
        </div>
      </div>
    )
  }


  // TODO: Remove Later
  if (!setIsInspecting) setIsInspecting = () => { };

  if (!item) item = {};

  const navigate = useNavigate();

  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();

  const [appData, setAppData] = useApp();


  const [isDeleting, setIsDeleting] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [isAccordion, setAccordion] = useState(item.accordion || false);
  const tags = Array.isArray(item.tags)
    ? item.tags
        .map((tag) => {
          if (typeof tag === "string") return tag;
          if (tag && typeof tag.title === "string") return tag.title;
          return null;
        })
        .filter(Boolean) as string[]
    : [];

  const handleToggleSelect = () => {
    if (!onToggleSelect || !item?.id) return;
    onToggleSelect(item.id);
  };


  const handleMarkComplete = (e) => {
    e.stopPropagation();
    setIsCompleting(true);

    let newData = {};

    if (item.repeater && item.repeater.length != 0) {
      let newDone = item.done || [];
      let activeDate = appData.activeDate;

      if (!Array.isArray(item.done)) item.done = newDone;

      let rawDate = new Date(activeDate);
      rawDate.setHours(0, 0, 0, 0);

      let foundDate = [...item.done].find((ite) =>
        matchDate(new Date(ite), rawDate)
      );

      if (!foundDate) newDone.push(rawDate);
      else newDone.splice(newDone.indexOf(rawDate), 1);

      if (type == "subtask") {
        const newSubs = [...parent.subtasks];
        for (let i = 0; i < newSubs.length; i++) {
          if (newSubs[i].id == item.id) newSubs[i] = { ...item, done: newDone };
        }

        newData = {
          ...parent,
          subtasks: newSubs,
        };

        updateTask({ id: parent.id, data: newData });
      } else {
        updateTask({ id: item.id, data: { ...item, done: newDone } });
      }
    } else {
      if (type == "subtask") {
        const newSubs = [...parent.subtasks];
        for (let i = 0; i < newSubs.length; i++) {
          if (newSubs[i].id == item.id)
            newSubs[i] = { ...item, done: !item.done };
        }

        newData = {
          ...parent,
          subtasks: newSubs,
        };

        updateTask({ id: parent.id, data: newData });
      } else {
        updateTask({ id: item.id, data: { ...item, done: !item.done } });
      }
    }

    setIsManaging(false);

    // allow fade-out before hiding when filtering incomplete
    setTimeout(() => setIsCompleting(false), 600);
  };

  const handleInteractive = (e) => {
    if (selectionMode) {
      e.stopPropagation();
      handleToggleSelect();
      return;
    }

    if (type == "subtask") {
      handleInteractiveSubtask(e);
      return;
    }

    e.stopPropagation();

    setAppData({
      ...appData,
      activeTask: item,
    });

    setIsInspecting(true);
  };

  const handleInteractiveSubtask = (e: any) => {
    e.stopPropagation();

    setAppData({
      ...appData,
      activeParent: parent,
      activeTask: item,
    });

    setIsInspecting(true);
  };

  const selectionClass = selectionMode
    ? isSelected
      ? "ring-2 ring-accent-blue/40"
      : "ring-1 ring-dashed ring-accent-blue/30"
    : "";

  const fadeClass =
    isCompleting || isAnimating
      ? "opacity-0 translate-y-1 scale-[0.98] pointer-events-none"
      : "";

  const isPending = isTaskDone(item, appData.activeDate);

  return (
    <div
      className={`${taskFilter == "all" || (taskFilter == "incomplete" && (isPending || isCompleting))
        ? "flex"
        : "hidden"
        } w-full flex-col gap-2`}
    >
      <TaskItemShell
        task={item}
        activeDate={appData.activeDate}
        className={`${fadeClass} ${selectionClass}`}
        onClick={(e) => handleInteractive(e)}
      >
        <div className="w-full h-full flex flex-row items-center">
          <TaskItemCheckBox
            checked={!isTaskDone(item, appData.activeDate)}
            onChange={(e) => {
              if (selectionMode) {
                handleToggleSelect();
                return;
              }
              handleMarkComplete(e);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (selectionMode) handleToggleSelect();
            }}
          />
          <div className="w-full">
            <div className="w-full flex flex-row items-center justify-between">
              <TaskItemTitle text={item.title} />
              {item.type == "group" && item.subtasks?.length > 0 && (
                <div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      const newValue = !isAccordion;

                      setAccordion(newValue);
                      updateTask({
                        id: item.id,
                        data: {
                          ...item,
                          accordion: newValue,
                        },
                      });
                    }}
                  >
                    {!isAccordion && <ChevronDownIcon width="32" />}
                    {isAccordion && <ChevronUpIcon width="32" />}
                  </div>
                </div>
              )}
            </div>
            <div className="w-fit flex flex-row flex-end items-center justify-start px-2">
              <div className="w-full h-full flex items-center justify-evenly">
                <TaskItemDate task={item} />
              </div>
            </div>
            {tags.length > 0 && isPending && (
              <div className="mt-1 flex flex-wrap gap-2 px-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent-blue/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-blue-800 ring-1 ring-accent-blue/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </TaskItemShell>
      <div className="w-full flex justify-end">
        <div className="w-full pl-10 flex flex-col justify-end gap-1">
          {item.type == "group" &&
            !isAccordion &&
            item.subtasks?.map((subtask: Task, key: number) => (
              <div
                className="w-full flex flex-row justify-center items-center"
                key={key}
              >
                <TaskItem
                  taskFilter={taskFilter}
                  type="subtask"
                  parent={item}
                  item={subtask}
                  setIsInspecting={setIsInspecting}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
