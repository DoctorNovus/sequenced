import { useApp } from "@/hooks/app";

import {
  Task,
  createInitialTaskData,
  useAddTask,
  useAddTasksBulk,
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

import { Dispatch, SetStateAction, useEffect, useReducer, useRef, useState } from "react";

import MenuHeader from "./(TaskInfoMenu)/MenuHeader";
import MenuFields from "./(TaskInfoMenu)/MenuFields";
import MenuEdit from "./(TaskInfoMenu)/MenuEdit";
import MenuFooter from "./(TaskInfoMenu)/MenuFooter";
import { Logger } from "@/utils/logger";
import { CheckCircleIcon, PencilSquareIcon, SparklesIcon } from "@heroicons/react/24/solid";

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
  const { mutateAsync: addTasksBulk } = useAddTasksBulk();
  const { mutate: updateTask } = useUpdateTask();

  const getDefaultDate = () => {
    const now = new Date();
    const selected = appData.activeDate ? new Date(appData.activeDate) : null;

    if (selected) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDay = new Date(selected);
      selectedDay.setHours(0, 0, 0, 0);

      const baseDate =
        selectedDay.getTime() === today.getTime()
          ? new Date(now.getTime() + 1000 * 60 * 60 * 24) // tomorrow
          : selected;

      baseDate.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
      );

      return baseDate;
    }

    const tomorrow = new Date(now.getTime() + 1000 * 60 * 60 * 24);
    tomorrow.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );

    return tomorrow;
  };

  const initialData: Task = {
    ...createInitialTaskData(),
    id: createID(20),
    date: getDefaultDate(),
  };

  const [tempData, setTempData] = useReducer(reducer, initialData);
  const [quickTasksInput, setQuickTasksInput] = useState("");
  const [isQuickAdd, setIsQuickAdd] = useState(false);
  const [toast, setToast] = useState<{ text: string; variant: "create" | "update" | "bulk" } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const quickLines = quickTasksInput
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const hasTitle = !!tempData.title?.trim();
  const isSubmitDisabled =
    type === "add" && isQuickAdd
      ? quickLines.length === 0
      : !hasTitle;

  useEffect(() => {
    if (!validationError) return;

    if ((isQuickAdd && quickLines.length > 0) || (!isQuickAdd && hasTitle)) {
      setValidationError(null);
    }
  }, [hasTitle, isQuickAdd, quickLines.length, validationError]);

  useEffect(() => {
    if (type !== "add" || !isOpen) return;

    setTempData({
      ...createInitialTaskData(),
      id: createID(20),
      date: getDefaultDate(),
    });
    setQuickTasksInput("");
    setIsQuickAdd(false);
  }, [isOpen, appData.activeDate]);

  if (type == "edit") {
    if (
      appData.activeTask?.id != undefined &&
      tempData.id != appData.activeTask?.id
    ) {
      setTempData({
        ...appData.activeTask,
        date: new Date(appData.activeTask?.date),
        tags: appData.activeTask.tags ?? [],
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
    setTempData({
      ...createInitialTaskData(),
      id: undefined,
      date: getDefaultDate()
    });
    setQuickTasksInput("");
    setIsQuickAdd(false);
    setValidationError(null);
    setAppData({ ...appData, activeTask: undefined });
    setIsOpen(false);
  };

  const oldTask = useTaskById(tempData.id);

  const showToast = (text: string, variant: "create" | "update" | "bulk") => {
    setToast({ text, variant });
    setTimeout(() => setToast(null), 2400);
  };

  const validateBeforeSubmit = (isQuickAddMode: boolean) => {
    if (isQuickAddMode) {
      if (quickLines.length === 0) {
        setValidationError("Add at least one task title.");
        return false;
      }

      setValidationError(null);
      return true;
    }

    if (!tempData.title || tempData.title.trim().length === 0) {
      setValidationError("Title is required.");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const saveAll = () => {
    if (!validateBeforeSubmit(false)) return;

    const cleanedTask = {
      ...tempData,
      title: tempData.title.trim(),
    };

    updateTask({
      id: tempData.id,
      data: {
        ...cleanedTask,
      },
    });

    Logger.log("Data To Add", {
      tempData
    });

    showToast("Task updated", "update");
  };

  const submitForm = () => {
    if (type === "add" && isQuickAdd) {
      if (!validateBeforeSubmit(true)) return;

      const payload = quickLines.map((title) => ({
        title,
        date: getDefaultDate(),
        done: false,
        repeater: "",
        reminder: "",
        priority: 0,
        tags: tempData.tags ?? [],
        group: tempData.group ?? "",
      }));

      addTasksBulk(payload).then(() => {
        showToast("Tasks added", "bulk");
        resetForm();
      });
      return;
    }

    if (type == "edit") {
      saveAll();
      resetForm();
      return;
    }

    if (!validateBeforeSubmit(false)) return;

    if (!tempData.id) tempData.id = createID(20);

    if (appData.storedDate) {
      setAppData({
        ...appData,
        activeDate: appData.storedDate,
        storedDate: null
      });
    }

    const cleanedTask = {
      ...tempData,
      title: tempData.title.trim(),
    };

    addTask(cleanedTask);
    createNotification(cleanedTask);

    showToast("Task created", "create");
    resetForm();
  };

  const ref = useRef(null);

  return (
    <>
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
            className="fixed inset-0 flex w-full h-full items-center justify-center bg-black/25 dark:bg-black/60 backdrop-blur-sm px-3 pb-6 pt-10"
          >
            <DialogPanel
              className="flex w-full max-w-xl max-h-screen flex-col overflow-y-auto rounded-3xl surface-card border text-primary shadow-2xl ring-1 ring-accent-blue/15 p-4 md:p-6"
              style={{ background: "var(--surface-card)" }}
            >
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
                  quickTasksInput={quickTasksInput}
                  setQuickTasksInput={setQuickTasksInput}
                  isQuickAdd={isQuickAdd}
                  setIsQuickAdd={setIsQuickAdd}

                  setIsOpen={setIsOpen}

                  changeAppDate={changeAppDate}
                  changeTempAppDate={changeTempAppDate}

                  appData={appData}
                  setAppData={setAppData}
                  validationError={validationError}
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
                  isSubmitDisabled={isSubmitDisabled}
                />
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </Transition>
      <Transition
        show={!!toast}
        enter="transition duration-200 ease-out"
        enterFrom="translate-y-2 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition duration-500 ease-in"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="translate-y-2 opacity-0"
      >
        <div className="pointer-events-none fixed inset-x-0 top-6 z-[60] flex justify-center px-6">
          <div
            className={`pointer-events-auto flex items-center gap-4 w-full max-w-md rounded-2xl px-5 py-4 text-white shadow-2xl shadow-slate-900/30 ring-1 ring-slate-800/70 ${
              toast?.variant === "create"
                ? "bg-gradient-to-r from-accent-blue-700 to-accent-blue-500"
                : toast?.variant === "update"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500"
                  : "bg-gradient-to-r from-indigo-600 to-accent-blue-500"
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              {toast?.variant === "create" && <SparklesIcon className="h-5 w-5" />}
              {toast?.variant === "update" && <PencilSquareIcon className="h-5 w-5" />}
              {toast?.variant === "bulk" && <CheckCircleIcon className="h-5 w-5" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">{toast?.text}</span>
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
}
