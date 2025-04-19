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
}

export function TaskItem({ skeleton, item, setIsInspecting, type, parent, taskFilter }: TaskItemParams) {

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
              <div className="w-fit flex flex-row flex-end items-center justify-start px-3">
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

  const [isAccordion, setAccordion] = useState(item.accordion || false);


  const handleMarkComplete = (e) => {
    e.stopPropagation();

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
  };

  const handleInteractive = (e) => {
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

  return (
    <div
      className={`${taskFilter == "all" || (taskFilter == "incomplete" && !item.done)
        ? "flex"
        : "hidden"
        } w-full flex-col gap-2`}
    >
      <TaskItemShell
        task={item}
        activeDate={appData.activeDate}
        onClick={(e) => handleInteractive(e)}
      >
        <div className="w-full h-full flex flex-row items-center">
          <TaskItemCheckBox
            checked={!isTaskDone(item, appData.activeDate)}
            onChange={handleMarkComplete}
            onClick={(e) => e.stopPropagation()}
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
            <div className="w-fit flex flex-row flex-end items-center justify-start px-3">
              <div className="w-full h-full flex items-center justify-evenly">
                <TaskItemDate task={item} />
              </div>
            </div>
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
