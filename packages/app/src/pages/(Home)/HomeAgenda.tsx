import { useTasksOverdue, useTasksToday, useTasksTomorrow, useTasksWeek } from "@/hooks/tasks";
import DueCapsule from "./DueCapsule";

export default function HomeAgenda({ skeleton }) {
    const dueToday = useTasksToday();
    const dueTomorrow = useTasksTomorrow();
    const dueWeek = useTasksWeek();
    const overdueTasks = useTasksOverdue();

    if (skeleton)
        return (
            <div className="flex flex-col gap-2">
                <span className="text-xl">Your Agenda</span>
                <div className="w-full flex flex-col gap-2">
                    <div className="w-full h-full flex flex-row justify-evenly gap-2">
                        <div className="w-full h-full">
                            <DueCapsule skeleton category="Due Today" />
                        </div>
                        <div className="w-full h-full flex flex-col justify-evenly gap-2">
                            <DueCapsule skeleton category="Due Tomorrow" />
                            <DueCapsule skeleton category="Due This Week" />
                        </div>
                    </div>
                </div>
                <div className="w-full h-16 flex shadow-md border border-accent-blue/80 rounded-md px-4 py-2 items-center justify-between">
                        <span className="text-xl text-gray-500">Overdue Tasks</span>
                        <span className="text-red-500 text-3xl">0</span>
                </div>
            </div>
        )

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xl">Your Agenda</span>
            <div className="w-full flex flex-col gap-2">
                <div className="w-full h-full flex flex-row justify-evenly gap-2">
                    <div className="w-full h-full">
                        {
                            dueToday.isSuccess && (
                                <DueCapsule count={dueToday.data.count} category="Due Today" important />
                            )
                        }
                    </div>
                    <div className="w-full h-full flex flex-col justify-evenly gap-2">
                        {
                            dueTomorrow.isSuccess && (
                                <DueCapsule count={dueTomorrow.data.count} category="Due Tomorrow" important />
                            )
                        }
                        {
                            dueWeek.isSuccess && (
                                <DueCapsule count={dueWeek.data.count} category="Due This Week" important />
                            )
                        }
                    </div>
                </div>
                <div className="w-full h-16 flex shadow-md border border-accent-blue/80 rounded-md px-4 py-2 items-center justify-between">
                    {
                        overdueTasks.isSuccess && (
                            <>
                                <span className="text-xl text-gray-500">Overdue Tasks</span>
                                <span className="text-red-500 text-3xl">{overdueTasks.data.count}</span>
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    )
}