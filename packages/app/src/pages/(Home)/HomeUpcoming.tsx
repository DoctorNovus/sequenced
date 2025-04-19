import { TaskItem } from "@/components/task/TaskItem"
import { useTasksIncomplete } from "@/hooks/tasks";

interface UpcomingParams {
    skeleton: boolean;
}

export default function HomeUpcoming({ skeleton }: UpcomingParams) {
    const incomplete = useTasksIncomplete();

    if (skeleton)
        return (
            <div className="w-full flex flex-col gap-2 pb-32">
                <span className="text-xl">Upcoming Tasks</span>
                <ul className="w-full flex flex-col">
                    <li className="w-full h-full">
                        <TaskItem skeleton="true" />
                    </li>
                </ul>
            </div>
        )

    return (
        <div className="w-full flex flex-col gap-2 pb-32">
            <span className="text-xl">Upcoming Tasks</span>
            <ul className="w-full flex flex-col">
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