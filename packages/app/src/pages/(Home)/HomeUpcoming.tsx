import { TaskItem } from "@/components/task/TaskItem"
import { Task, useTasksIncomplete } from "@/hooks/tasks";
import { useNavigate } from "react-router";
import { useApp } from "@/hooks/app";

interface UpcomingParams {
    skeleton?: boolean;
}

export default function HomeUpcoming({ skeleton }: UpcomingParams) {
    const incomplete = useTasksIncomplete();
    const navigate = useNavigate();
    const [appData, setAppData] = useApp();

    const openTaskInTasks = (task: Task) => {
        setAppData({
            ...appData,
            activeTask: task,
            activeDate: task?.date ? new Date(task.date) : appData.activeDate,
        });
        navigate("/tasks");
    };

    if (skeleton)
        return (
            <div className="w-full flex flex-col gap-2 rounded-3xl surface-card border p-5 shadow-xl ring-1 ring-accent-blue/10">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xl font-semibold text-primary">Upcoming Tasks</span>
                    </div>
                    <div className="rounded-full bg-accent-blue-50 px-3 py-1 text-xs font-semibold text-accent-blue-700 dark:bg-[rgba(99,102,241,0.12)] dark:text-primary">
                        Loading
                    </div>
                </div>
                <ul className="w-full flex flex-col gap-3">
                    <li className="w-full h-full">
                        <TaskItem skeleton={true} />
                    </li>
                </ul>
            </div>
        )

    return (
        <div className="w-full flex flex-col gap-2 rounded-3xl surface-card border p-5 shadow-xl ring-1 ring-accent-blue/10">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-semibold text-primary">Upcoming Tasks</span>
                </div>
            </div>
            <ul className="w-full flex flex-col gap-3">
                {incomplete.isSuccess && incomplete.data.map((task, key) => {
                    return (
                        <li key={key} className="w-full h-full">
                            <TaskItem
                                item={task}
                                taskFilter="all"
                                setIsInspecting={() => openTaskInTasks(task)}
                            />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
