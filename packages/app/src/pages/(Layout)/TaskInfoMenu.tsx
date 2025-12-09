import { useApp } from "@/hooks/app";

import {
  Task,
  createInitialTaskData,
  useAddTask,
  useTaskById,
  useUpdateTask,
} from "@/hooks/tasks";

import { createID } from "@/utils/id";
import { scheduleNotification } from "@/utils/notifs";

import {
  Dialog,
  DialogPanel,
  Transition,
} from "@headlessui/react";

import { Dispatch, SetStateAction, useReducer, useRef, useState } from "react";

import MenuHeader from "./(TaskInfoMenu)/MenuHeader";
import MenuFields from "./(TaskInfoMenu)/MenuFields";
import MenuEdit from "./(TaskInfoMenu)/MenuEdit";
import MenuFooter from "./(TaskInfoMenu)/MenuFooter";
import { Logger } from "@/utils/logger";

interface TaskInfoMenuSettings {
  type?: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function TaskInfoMenu({
  type,
  isOpen,
  setIsOpen,
}: TaskInfoMenuSettings) {
  const [appData, setAppData] = useApp();

  const [isDeleting, setIsDeleting] = useState(false);

  const reducer = (
    data: Record<string, any>,
    payload: Record<string, any>
  ) => ({ ...data, ...payload });

  const { mutate: addTask } = useAddTask();
  const { mutate: updateTask } = useUpdateTask();

  const initialData: Task = {
    ...createInitialTaskData(),
    id: createID(20),
    date: new Date(appData.activeDate),
  };

  const [tempData, setTempData] = useReducer(reducer, initialData);

  if (type == "edit") {
    if (
      appData.activeTask?.id != undefined &&
      tempData.id != appData.activeTask?.id
    ) {
      setTempData({
        ...appData.activeTask,
        date: new Date(appData.activeTask?.date),
      });

      Logger.log("SET TEMP DATA", appData.activeTask);
    }
  }

  const changeAppDate = (date: Date) => {
    setTempData({
      ...tempData,
      date
    });

    setAppData({
      ...appData,
      activeDate: date,
    });
  };

  const changeTempAppDate = (date: Date) => {
    setAppData({
      ...appData,
      tempActiveDate: date,
    });
  };

  const createNotification = async (task: Task) => {
    if (!task || task.reminder == "") return;

    const setDate: Date = task.date || new Date();

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    switch (task.reminder) {
      case "15":
        setDate.setTime(setDate.getTime() - 15 * minute);
        break;

      case "30":
        setDate.setTime(setDate.getTime() - 30 * minute);
        break;

      case "45":
        setDate.setTime(setDate.getTime() - 45 * minute);
        break;

      case "60":
        setDate.setTime(setDate.getTime() - 1 * hour);
        break;

      case "120":
        setDate.setTime(setDate.getTime() - 2 * hour);
        break;

      case "720":
        setDate.setTime(setDate.getTime() - 12 * hour);
        break;

      case "1440":
        setDate.setTime(setDate.getTime() - 1 * day);
        break;
    }

    const notif = await scheduleNotification({
      id: Math.floor(Math.random() * 2147483647),
      title: "Sequenced: Do Your Task",
      body: `Task: ${task.title}`,
      schedule: {
        at: setDate,
      },
    });

    Logger.log("NOTIFI", notif);
  };

  const resetForm = () => {
    setTempData({ ...createInitialTaskData(), id: undefined });
    setAppData({ ...appData, activeTask: undefined });
    setIsOpen(false);
  };

  const oldTask = useTaskById(tempData.id);

  const saveAll = () => {
    if (appData.activeParent) {
      const subTaskData = tempData;

      Logger.log("Sub Task Data", subTaskData);

      const parentData = appData.activeParent;

      Logger.log("Parent Data", parentData);

      const newSubs = appData.activeParent.subtasks;

      Logger.log("Old Subtasks", newSubs);

      for (let i = 0; i < newSubs.length; i++) {
        if (newSubs[i].id == subTaskData.id) newSubs[i] = subTaskData;
      }

      Logger.log("New Subtasks", newSubs);

      updateTask({
        id: parentData.id,
        data: {
          ...parentData,
          subtasks: newSubs,
        },
      });

      return;
    }

    const taskData = oldTask.data;

    updateTask({
      id: tempData.id,
      data: {
        ...tempData,
      },
    });

    Logger.log("Data To Add", {
      tempData
    });
  };

  const submitForm = () => {
    if (type == "edit") {
      saveAll();
      resetForm();
      return;
    }

    if (!tempData.id) tempData.id = createID(20);

    if (appData.storedDate) {
      setAppData({
        ...appData,
        activeDate: appData.storedDate,
        storedDate: null
      });
    }

    addTask(tempData);
    createNotification(tempData);

    resetForm();
  };

  const ref = useRef(null);

  return (
    <Transition
      show={isOpen}
      enter="transition duration-500"
    >
      <Dialog
        onClose={() => resetForm()}
        initialFocus={ref}
        ref={ref}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 flex w-full h-full items-end justify-center bg-accent-blue/10 backdrop-blur-sm px-3 pb-4 pt-10 md:items-center"
        >
          <DialogPanel className="flex w-full max-w-xl max-h-screen flex-col overflow-y-auto rounded-3xl bg-gradient-to-b from-white/95 via-white to-accent-blue-50/60 text-accent-black shadow-2xl ring-1 ring-accent-blue/15 p-4 md:p-6">
            <div className="flex flex-col gap-5">
              <MenuHeader
                type={type}
                isDeleting={isDeleting}
              />
              <MenuFields
                type={type}
                isDeleting={isDeleting}

                tempData={tempData}
                setTempData={setTempData}

                setIsOpen={setIsOpen}

                changeAppDate={changeAppDate}
                changeTempAppDate={changeTempAppDate}

                appData={appData}
                setAppData={setAppData}
              />
              <MenuEdit
                type={type}

                isDeleting={isDeleting}
                setIsDeleting={setIsDeleting}

                appData={appData}
                tempData={tempData}

                setIsOpen={setIsOpen}
              />
              <MenuFooter
                type={type}
                isDeleting={isDeleting}

                resetForm={resetForm}
                submitForm={submitForm}
              />
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
}
