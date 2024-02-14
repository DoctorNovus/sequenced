import { useContext, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddTask } from "@/hooks/tasks";

import FormItem from "./FormItem";
import { formatDateTime } from "@/utils/date";
import { createID } from "@/utils/id";
import { ToDoContext } from "@/hooks/contexts";

const reducer = (data, payload) => ({ ...data, ...payload });
const initialData = {
  title: "",
  description: "",
  date: new Date(),
  id: createID(24),
};

export default function ToDoAddMenu() {
  const navigate = useNavigate();
  initialData.date.setHours(0, 0, 0, 0);
  const [task, setTask] = useReducer(reducer, initialData);
  const { mutate: addTask } = useAddTask();

  const [context, setContext] = useContext(ToDoContext);

  const resetBox = () => {
    setTask(initialData);
    navigate(-1);
  };

  const addTo = async (e) => {
    e.preventDefault();

    addTask(task);
    resetBox();
  };

  const cancelForm = (e) => {
    e.preventDefault();

    resetBox();
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);

    let tempContext = { ...context };
    tempContext.todo.active.date = newDate;

    Object.assign(tempContext.todo.active, {
      date: newDate,
      month: newDate.getMonth(),
      year: newDate.getFullYear(),
    });

    setContext(tempContext);

    const tempTask = { ...task };
    tempTask.date = newDate;
    setTask(tempTask);
  };

  return (
    <div id="todo-addmenu" className="flex bg-accent-black">
      <form id="tdam-form" onReset={cancelForm} onSubmit={addTo}>
        <div className="flex flex-col text-left">
          <div className="flex flex-col">
            <FormItem
              title="Title"
              value={task.title}
              onChange={(e) => setTask({ title: e.target.value })}
            />
            <FormItem
              title="Description"
              value={task.description}
              onChange={(e) => setTask({ description: e.target.value })}
            />
            <FormItem
              title="Due Date"
              type="datetime-local"
              value={formatDateTime(context.todo.active.date)}
              onChange={handleDateChange}
            />
          </div>
          <div className="flex flex-row justify-evenly my-4">
            <button
              id="tdam-reset"
              type="reset"
              className="text-lg w-20 h-8 bg-red-500 text-white rounded-lg"
              onClick={cancelForm}
            >
              Cancel
            </button>
            <button
              id="tdam-submit"
              type="submit"
              className="text-lg w-20 h-8 bg-accent-blue text-white rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}