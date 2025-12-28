import { useTasks } from "@/hooks/tasks";
import DueCapsule from "./DueCapsule";
import { useNavigate } from "react-router-dom";
import { occursOnDate, isTaskDone, normalizeDay } from "@/utils/data";
import { useMemo } from "react";

type AgendaProps = {
    skeleton?: boolean;
};

export default function HomeAgenda({ skeleton }: AgendaProps) {
    const navigate = useNavigate();
    const tasks = useTasks();

    const today = normalizeDay(new Date());
    const tomorrow = normalizeDay(new Date(Date.now() + 24 * 60 * 60 * 1000));

    const isPendingOnDate = (task, day) => occursOnDate(task, day) && isTaskDone(task, day);
    const hasPendingWithinDays = (task, startDay: Date, days: number) => {
        for (let i = 0; i < days; i++) {
            const check = new Date(startDay);
            check.setDate(startDay.getDate() + i);
            if (isPendingOnDate(task, check)) return true;
        }
        return false;
    };
    const hasPendingBefore = (task, target: Date) => {
        const startDay = normalizeDay(task.date as any);
        if (Number.isNaN(startDay.getTime()) || startDay > target) return false;

        const totalDays = Math.floor((target.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000));
        for (let i = 0; i <= totalDays; i++) {
            const check = new Date(startDay);
            check.setDate(startDay.getDate() + i);
            if (isPendingOnDate(task, check) && check < target) return true;
        }
        return false;
    };

    const counts = useMemo(() => {
        if (!tasks.data) return { today: 0, tomorrow: 0, week: 0, overdue: 0 };
        const base = { today: 0, tomorrow: 0, week: 0, overdue: 0 };
        for (const task of tasks.data) {
            if (isPendingOnDate(task, today)) base.today += 1;
            if (isPendingOnDate(task, tomorrow)) base.tomorrow += 1;
            if (hasPendingWithinDays(task, today, 7)) base.week += 1;
            if (hasPendingBefore(task, today)) base.overdue += 1;
        }
        return base;
    }, [tasks.data, today, tomorrow]);

    if (skeleton)
        return (
            <div className="rounded-3xl surface-card border p-5 shadow-xl ring-1 ring-accent-blue/10">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xl font-semibold text-primary">Your Agenda</span>
                    </div>
                    <div className="rounded-full bg-accent-blue-50 px-3 py-1 text-xs font-semibold text-accent-blue-700">
                        Updating...
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <DueCapsule skeleton category="Due Today" />
                    <DueCapsule skeleton category="Due Tomorrow" />
                    <DueCapsule skeleton category="Due This Week" />
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-4 py-3 text-red-600 dark:border-red-400/40 dark:bg-[rgba(248,113,113,0.12)] dark:text-red-200">
                    <span className="text-base font-semibold">Overdue Tasks</span>
                    <span className="text-3xl font-semibold">0</span>
                </div>
            </div>
        )

    return (
        <div className="rounded-3xl surface-card border p-5 shadow-xl ring-1 ring-accent-blue/10">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-semibold text-primary">Your Agenda</span>
                </div>
                <div className="rounded-full bg-accent-blue-50 px-3 py-1 text-xs font-semibold text-accent-blue-700 dark:bg-[rgba(99,102,241,0.12)] dark:text-primary">
                    Live sync
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {
                    tasks.isSuccess && (
                        <DueCapsule
                            count={counts.today}
                            category="today"
                            important
                            onClick={() => navigate("/calendar?scope=today&view=week")}
                        />
                    )
                }
                {
                    tasks.isSuccess && (
                        <DueCapsule
                            count={counts.tomorrow}
                            category="tomorrow"
                            important
                            onClick={() => navigate("/calendar?scope=tomorrow&view=week")}
                        />
                    )
                }
                {
                    tasks.isSuccess && (
                        <DueCapsule
                            count={counts.week}
                            category="this week"
                            important
                            onClick={() => navigate("/calendar?scope=week&view=week")}
                        />
                    )
                }
            </div>
            <div
                role="button"
                tabIndex={0}
                onClick={() => navigate("/calendar?scope=overdue&view=week")}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate("/calendar?scope=overdue&view=week");
                    }
                }}
                className={`group mt-4 flex items-center justify-between rounded-2xl border px-4 py-3 cursor-pointer transition hover:border-accent-blue/40 hover:ring-1 hover:ring-accent-blue/25 ${
                    tasks.isSuccess && counts.overdue > 0
                        ? "border-red-300/70 bg-red-50/70 text-red-700 dark:border-red-400/50 dark:bg-[rgba(248,113,113,0.12)] dark:text-red-200"
                        : "border-emerald-200/70 bg-emerald-50/80 text-emerald-700 dark:border-emerald-300/40 dark:bg-[rgba(52,211,153,0.12)] dark:text-emerald-200"
                }`}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-primary">Overdue Tasks</span>
                </div>
                <span className="text-3xl font-semibold text-left">
                    {tasks.isSuccess ? counts.overdue : "—"}
                </span>
            </div>
        </div>
    )
}
