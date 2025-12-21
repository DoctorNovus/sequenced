import { useMemo, useState } from "react";
import { Task, createInitialTaskData } from "@/hooks/tasks";
import TaskInfoMenuSubtask from "./TaskInfoMenuSubtask";
import { createID } from "@/utils/id";

export interface TaskInfoMenuSubtaskMenuParams {
  subtasks: Task[];
  tempData: Task;
  setTempData: CallableFunction;
}

export default function TaskInfoMenuSubtaskMenu({
  subtasks,
  tempData,
  setTempData,
}: TaskInfoMenuSubtaskMenuParams) {
  const [newTitle, setNewTitle] = useState("");

  const normalizedSubtasks = useMemo(
    () => subtasks?.map((task) => ({ ...task, title: task.title ?? "" })) ?? [],
    [subtasks]
  );

  const createNewSubtask = () => {
    const title = newTitle.trim();
    if (!title) return;

    const tempSubtasks = [...(tempData.subtasks || [])];

    const newTask: Task = {
      ...createInitialTaskData(),
      id: createID(20),
      title,
    };

    tempSubtasks.push(newTask);

    setTempData({
      subtasks: tempSubtasks,
    });
    setNewTitle("");
  };

  const deleteSubtask = (id: string | undefined) => {
    const tempSubtasks = (tempData.subtasks ?? []).filter((sub) => sub.id !== id);

    setTempData({ subtasks: tempSubtasks });
  };

  const updateSubtaskTitle = (id: string | undefined, title: string) => {
    const tempSubtasks = (tempData.subtasks ?? []).map((task) =>
      task.id === id ? { ...task, title } : task
    );

    setTempData({ subtasks: tempSubtasks });
  };

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-sm font-semibold text-primary">Subtasks</h2>
      </div>
      <div className="flex flex-col gap-2 px-1">
        {normalizedSubtasks?.map((task: Task, key: number) => (
          <TaskInfoMenuSubtask
            task={task}
            key={task.id || key}
            onChangeTitle={updateSubtaskTitle}
            onDelete={deleteSubtask}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-xl border border-accent-blue/20 bg-white px-3 py-2 text-sm text-primary shadow-inner focus:border-accent-blue focus:outline-none dark:bg-[rgba(15,23,42,0.7)]"
          placeholder="Add a subtask and press Enter"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              createNewSubtask();
            }
          }}
        />
        <button
          type="button"
          onClick={createNewSubtask}
          className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-px transition disabled:opacity-60"
          disabled={!newTitle.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
}
