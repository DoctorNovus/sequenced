import { formatDateTime } from "@/utils/date";
import TaskInfoMenuItem from "./Shared/TaskInfoMenuItem";
import TaskInfoMenuSubtaskMenu from "./Shared/TaskInfoMenuSubtaskMenu";
import { useApp } from "@/hooks/app";
import TaskInfoMenuSelect from "./Shared/TaskInfoMenuSelect";
import TaskInfoMenuUser from "./Shared/TaskInfoUser/TaskInfoMenuUser";

export default function MenuFields({ type, isDeleting, tempData, setTempData, setIsOpen, changeAppDate, changeTempAppDate, appData, setAppData }) {
    return (
        <div className={`flex flex-col gap-3 ${isDeleting && "blur-sm"}`}>
            <TaskInfoMenuItem
                name="Name"
                value={tempData?.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTempData({ ...tempData, title: e.target.value })
                }
            />

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
            <div className={`my-2`}>
                <button
                    onClick={() => {
                        const noDate = new Date(0);

                        setAppData({
                            ...appData,
                            storedDate: appData.activeDate,
                            activeDate: noDate
                        });
                        
                        setTempData({
                            ...tempData,
                            date: noDate
                        });
                    }}
                    className={`px-2 py-2 ${tempData.date.getTime() != 0 &&
                        "bg-accent-red-500 hover:bg-accent-red-600 text-accent-white"
                        } ${tempData.date.getTime() == 0 &&
                        "bg-accent-blue hover:bg-accent-blue-600 text-accent-white"
                        } w-40 text-center rounded-md`}
                >
                    {tempData.date.getTime() != 0 && "Remove Due Date"}
                    {tempData.date.getTime() == 0 && "Add Due Date"}
                </button>
            </div>

            {type == "edit" && <TaskInfoMenuUser data={tempData} />}

            <TaskInfoMenuSelect
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
            />

            <TaskInfoMenuItem
                name="Priority"
                type="number"
                value={tempData.priority}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTempData({ ...tempData, priority: e.target.value })
                }
            />
        </div>
    )
}