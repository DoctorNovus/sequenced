import { formatDateTime } from "@/utils/date";
import TaskInfoMenuItem from "./Shared/TaskInfoMenuItem";
import TaskInfoMenuSubtaskMenu from "./Shared/TaskInfoMenuSubtaskMenu";
import TaskInfoMenuSelect from "./Shared/TaskInfoMenuSelect";
import TaskInfoMenuUser from "./Shared/TaskInfoUser/TaskInfoMenuUser";

interface MenuFieldsProps {
    type: string | undefined;
    isDeleting: boolean;
    tempData: any;
    setTempData: any;
    setIsOpen: any;
    changeAppDate: any;
    changeTempAppDate: any;
    appData: any;
    setAppData: any;
    quickTasksInput: string;
    setQuickTasksInput: any;
    isQuickAdd: boolean;
    setIsQuickAdd: any;
    validationError: string | null;
}

export default function MenuFields({
    type,
    isDeleting,
    tempData,
    setTempData,
    setIsOpen,
    changeAppDate,
    changeTempAppDate,
    appData,
    setAppData,
    quickTasksInput,
    setQuickTasksInput,
    isQuickAdd,
    setIsQuickAdd,
    validationError
}: MenuFieldsProps) {
    return (
        <div className={`flex flex-col gap-4 ${isDeleting && "blur-sm"}`}>
            {type === "add" && (
                <div className="flex flex-col gap-2 rounded-xl border border-accent-blue/15 bg-accent-blue-50/40 px-3 py-3 dark:bg-[rgba(99,102,241,0.12)]">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-primary">Quick add</span>
                            <span className="text-xs text-muted">Create multiple tasks at once.</span>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-muted">
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={isQuickAdd}
                                onChange={(e) => setIsQuickAdd(e.target.checked)}
                            />
                            Enable
                        </label>
                    </div>
                    {isQuickAdd && (
                        <TaskInfoMenuItem
                            name="Tasks (one per line)"
                            type="textarea"
                            placeholder="Pick up meds&#10;Email client&#10;Water plants"
                            value={quickTasksInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setQuickTasksInput(e.target.value)
                            }
                        />
                    )}
                    {isQuickAdd && validationError && (
                        <span className="px-1 text-sm font-semibold text-accent-red-500">
                            {validationError}
                        </span>
                    )}
                </div>
            )}
            {!isQuickAdd && (
                <>
                    <TaskInfoMenuItem
                        name="Name"
                        value={tempData?.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTempData({ ...tempData, title: e.target.value })
                        }
                    />
                    {!isQuickAdd && validationError && (
                        <span className="px-1 text-sm font-semibold text-accent-red-500">
                            {validationError}
                        </span>
                    )}

            {/* <TaskInfoMenuSelect
          name="Task Type"
          value={tempData.type}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempData({ type: e.target.value });
          }}
          options={[
            { name: "Standard", value: "" },
            { name: "Group", value: "group" },
          ]}
        /> */}

                    {tempData.type == "group" && (
                        <TaskInfoMenuSubtaskMenu
                            subtasks={tempData.subtasks}
                            tempData={tempData}
                            setTempData={setTempData}
                            setIsOpen={setIsOpen}
                        />
                    )}

                    <TaskInfoMenuItem
                        name="Description"
                        type="textarea"
                        value={tempData.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTempData({ ...tempData, description: e.target.value })
                        }
                    />

                    {tempData.date.getTime() != 0 && (
                        <TaskInfoMenuItem
                            name="Due Date"
                            type="datetime-local"
                            value={formatDateTime(tempData.date)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                changeAppDate(new Date(e.target.value));

                                setAppData({
                                    ...appData,
                                    activeDate: new Date(e.target.value)
                                });

                                setTempData({
                                    ...tempData,
                                    date: new Date(e.target.value),
                                });
                            }}
                        />
                    )}

                    {/* TODO: Make Component [DELETE DUE DATE] */}
                    <div className="my-2 flex">
                        <button
                            onClick={() => {
                                const noDate = new Date(0);
                                const isRemoving = tempData.date.getTime() != 0;

                                if (isRemoving) {
                                    setAppData({
                                        ...appData,
                                        storedDate: tempData.date,
                                    });

                                    setTempData({
                                        ...tempData,
                                        date: noDate
                                    });
                                } else {
                                    const restoredDate = appData.storedDate ?? new Date();

                                    setAppData({
                                        ...appData,
                                        activeDate: restoredDate,
                                        storedDate: undefined
                                    });

                                    setTempData({
                                        ...tempData,
                                        date: restoredDate
                                    });
                                }
                            }}
                            className={`w-40 text-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition ${tempData.date.getTime() != 0
                                ? "bg-accent-red-500 text-white hover:-translate-y-px"
                                : "bg-accent-blue text-white hover:-translate-y-px"
                                }`}
                        >
                            {tempData.date.getTime() != 0 && "Remove Due Date"}
                            {tempData.date.getTime() == 0 && "Add Due Date"}
                        </button>
                    </div>

                    {type == "edit" && <TaskInfoMenuUser data={tempData} />}

            {/* <TaskInfoMenuSelect
                name="Remind Me"
                value={tempData.reminder}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setTempData({ reminder: e.target.value });
                }}
                options={[
                    { name: "Do not remind", value: "" },
                    { name: "0min before", value: "0" },
                    { name: "15min before", value: "15" },
                    { name: "30min before", value: "30" },
                    { name: "45min before", value: "45" },
                    { name: "1hr Before", value: "60" },
                    { name: "2hr Before", value: "120" },
                    { name: "12hr before", value: "720" },
                    { name: "1 day before", value: "1440" },
                ]}
            />

            <TaskInfoMenuSelect
                name="Repeating"
                value={tempData.repeater}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setTempData({ repeater: e.target.value });
                }}
                options={[
                    { name: "Do Not Repeat", value: "" },
                    { name: "Every Day", value: "daily" },
                    { name: "Every Week", value: "weekly" },
                    { name: "Every 2 Weeks", value: "bi-weekly" },
                    { name: "Every Month", value: "monthly" },
                ]}
            /> */}

                    <TaskInfoMenuItem
                        name="Priority"
                        type="number"
                        value={tempData.priority}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTempData({ ...tempData, priority: e.target.value })
                        }
                    />
                </>
            )}
        </div>
    )
}
