import { useTasksOverdue, useTasksToday, useTasksTomorrow, useTasksWeek } from "@/hooks/tasks";
import DueCapsule from "./DueCapsule";

type AgendaProps = {
    skeleton?: boolean;
};

export default function HomeAgenda({ skeleton }: AgendaProps) {
    const dueToday = useTasksToday();
    const dueTomorrow = useTasksTomorrow();
    const dueWeek = useTasksWeek();
    const overdueTasks = useTasksOverdue();

    if (skeleton)
        return (
            <div className="rounded-3xl bg-white/80 p-5 shadow-xl ring-1 ring-accent-blue/10">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xl font-semibold text-slate-900">Your Agenda</span>
                    </div>
                    <div className="rounded-full bg-accent-blue-50 px-3 py-1 text-xs font-semibold text-accent-blue-700">
                        Updating...
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <DueCapsule skeleton category="Due Today" />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <DueCapsule skeleton category="Due Tomorrow" />
                        <DueCapsule skeleton category="Due This Week" />
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-4 py-3 text-red-600">
                    <span className="text-base font-semibold">Overdue Tasks</span>
                    <span className="text-3xl font-semibold">0</span>
                </div>
            </div>
        )

    return (
        <div className="rounded-3xl bg-white/80 p-5 shadow-xl ring-1 ring-accent-blue/10">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-semibold text-slate-900">Your Agenda</span>
                </div>
                <div className="rounded-full bg-accent-blue-50 px-3 py-1 text-xs font-semibold text-accent-blue-700">
                    Live sync
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-1">
                    {
                        dueToday.isSuccess && (
                            <DueCapsule count={dueToday.data.count} category="Due Today" important />
                        )
                    }
                </div>
                <div className="md:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-4 py-3 text-red-600">
                {
                    overdueTasks.isSuccess && (
                        <>
                            <span className="text-base font-semibold">Overdue Tasks</span>
                            <span className="text-3xl font-semibold">{overdueTasks.data.count}</span>
                        </>
                    )
                }
            </div>
        </div>
    )
}
