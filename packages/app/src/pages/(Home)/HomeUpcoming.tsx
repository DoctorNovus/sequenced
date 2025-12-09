import { TaskItem } from "@/components/task/TaskItem"
import { useTasksIncomplete } from "@/hooks/tasks";

interface UpcomingParams {
    skeleton?: boolean;
}

export default function HomeUpcoming({ skeleton }: UpcomingParams) {
    const incomplete = useTasksIncomplete();

    if (skeleton)
        return (
            <div className="w-full flex flex-col gap-2 pb-32 rounded-3xl bg-white/80 p-5 shadow-xl ring-1 ring-accent-blue/10">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xl font-semibold text-slate-900">Upcoming Tasks</span>
                    </div>
                    <div className="rounded-full bg-accent-blue-50 px-3 py-1 text-xs font-semibold text-accent-blue-700">
                        Loading
                    </div>
                </div>
                <ul className="w-full flex flex-col gap-3">
                    <li className="w-full h-full">
                        <TaskItem skeleton="true" />
                    </li>
                </ul>
            </div>
        )

    return (
        <div className="w-full flex flex-col gap-2 pb-32 rounded-3xl bg-white/80 p-5 shadow-xl ring-1 ring-accent-blue/10">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-semibold text-slate-900">Upcoming Tasks</span>
                </div>
                <div className="rounded-full bg-accent-blue-50 px-3 py-1 text-xs font-semibold text-accent-blue-700">
                    Focus mode
                </div>
            </div>
            <ul className="w-full flex flex-col gap-3">
                {incomplete.isSuccess && incomplete.data.map((task, key) => {
                    return (
                        <li key={key} className="w-full h-full">
                            <TaskItem item={task} taskFilter="all" />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
