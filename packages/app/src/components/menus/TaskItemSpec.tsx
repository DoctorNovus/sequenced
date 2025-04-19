import edit_icon from "@/assets/edit.svg";
import { useUpdateTask } from "@/hooks/tasks";
import { formatDateClean, formatDateTime } from "@/utils/date";
import { useState } from "react";

export default function TaskItemSpec({
  task: baseTask,
  type,
  text,
  value,
  backup,
  immediateSave,
  disabled,
}) {
  const [editMode, setEditMode] = useState(false);
  const [task, setTask] = useState(baseTask);
  const { mutate: editTask } = useUpdateTask();
  const [saved, setSaved] = useState(false);

  const save = () => {
    editTask({ id: task.data.id, data: task.data });

    setSaved(true);
  };

  const flipEdit = () => {
    if (editMode) save();

    setEditMode(!editMode);
  };

  const handleEdit = (e) => {
    let partialTask = {
      ...task,
    };

    partialTask.data[value] = e.target.value;

    setTask(partialTask);
  };

  if (immediateSave && !saved) save();

  let faceValue = task.data[value];

  if (type == "date") faceValue = formatDateClean(new Date(task.data[value]));

  if (type == "bool") faceValue = faceValue ? "Yes" : "No";

  return (
    <div className="flex flex-col w-full h-full items-center gap-1">
      <div className="w-full flex justify-start">
        <h1 className="text-xl text-accent-white mt-4">{text}</h1>
      </div>
      <div className="w-full h-full flex flex-row items-center">
        <div className="flex  items-center w-full h-8 bg-accent-black-800 text-center px-2 rounded-lg">
          {editMode && (
            <input
              value={
                type == "date"
                  ? formatDateTime(new Date(task.data[value]))
                  : faceValue
              }
              type={type == "date" ? "datetime-local" : "text"}
              className="text-center w-full h-8 bg-transparent border border-white px-2"
              onChange={handleEdit}
            ></input>
          )}
          {!editMode && (
            <span className="text-left text-lg text-accent-white">
              {faceValue || backup}
            </span>
          )}
        </div>
        <div
          className={`${disabled ? "hidden" : ""} absolute right-14`}
          onClick={flipEdit}
        >
          <img src={edit_icon} className="w-6 h-6 invert" />
        </div>
      </div>
    </div>
  );
}
