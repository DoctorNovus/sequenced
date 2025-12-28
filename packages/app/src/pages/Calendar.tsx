import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTasks, Task } from "@/hooks/tasks";
import { occursOnDate, isTaskDone } from "@/utils/data";

type Scope = "today" | "tomorrow" | "week" | "month" | "overdue" | "all";
type ViewMode = "week" | "month";

const startOfWeek = (reference: Date) => {
  const day = reference.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);
  start.setDate(reference.getDate() + diff);
  return start;
};

const normalizeDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isPendingOnDate = (task: Task, day: Date) => {
  // Leverage existing helper that returns true when still pending.
  return isTaskDone(task, day) && occursOnDate(task, day);
};

const isOverdue = (task: Task, today: Date) => {
  const taskDate = normalizeDay(new Date(task.date));
  return isPendingOnDate(task, taskDate) && taskDate < today;
};

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

const formatLabel = (date: Date, options: Intl.DateTimeFormatOptions) =>
  date.toLocaleDateString(undefined, options);

function buildWeekDays(anchor: Date) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }).map((_, idx) => {
    const day = new Date(start);
    day.setDate(start.getDate() + idx);
    return day;
  });
}

function buildMonthDays(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const days = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

const scopeToDates = (scope: Scope, today: Date) => {
  const start = normalizeDay(today);
  const tomorrow = new Date(start);
  tomorrow.setDate(start.getDate() + 1);
  const endOfWeek = new Date(startOfWeek(today));
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  switch (scope) {
    case "today":
      return { start, end: start };
    case "tomorrow":
      return { start: tomorrow, end: tomorrow };
    case "week":
      return { start: startOfWeek(today), end: endOfWeek };
    case "month":
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      };
    case "overdue":
      return { start: new Date(0), end: new Date(today.getTime() - 1) };
    default:
      return { start: new Date(0), end: new Date(8640000000000000) }; // all dates
  }
};

function groupTasksByDay(tasks: Task[], start: Date, end: Date) {
  const grouped: Record<string, Task[]> = {};

  for (const task of tasks) {
    // Include every day in range where the task is pending, regardless of start date.
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      if (isPendingOnDate(task, day)) {
        const key = dayKey(day);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(task);
      }
    }
  }

  return grouped;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tasks = useTasks();

  const today = normalizeDay(new Date());
  const initialScope = (params.get("scope") as Scope) || "week";
  const initialView = (params.get("view") as ViewMode) || "week";
  const initialWeekParam = params.get("week");

  const resolveWeekStart = (scope: Scope) => {
    if (scope === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return startOfWeek(tomorrow);
    }
    return startOfWeek(today);
  };

  const [scope, setScope] = useState<Scope>(initialScope);
  const [view, setView] = useState<ViewMode>(initialView);
  const [weekStart, setWeekStart] = useState<Date>(
    initialWeekParam ? normalizeDay(new Date(initialWeekParam)) : resolveWeekStart(initialScope)
  );
  const [monthAnchor, setMonthAnchor] = useState<Date>(today);

  const { start, end } = useMemo(() => {
    if (view === "week") {
      const s = normalizeDay(weekStart);
      const e = new Date(s);
      e.setDate(s.getDate() + 6);
      return { start: s, end: e };
    }

    if (view === "month") {
      const s = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
      const e = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0);
      return { start: s, end: e };
    }

    return scopeToDates(scope, today);
  }, [view, weekStart, monthAnchor, scope, today]);

  const grouped = useMemo(() => groupTasksByDay(tasks.data || [], start, end), [tasks.data, start, end]);

  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);
  const monthDays = useMemo(() => buildMonthDays(monthAnchor), [monthAnchor]);

  const overdueList = useMemo(() => {
    if (!tasks.data) return [];
    return tasks.data.filter((task) => isOverdue(task, today));
  }, [tasks.data, today]);

  const handleScopeChange = (next: Scope) => {
    setScope(next);
    const base = next === "tomorrow" ? new Date(today.getTime() + 86400000) : today;
    const nextWeekStart = startOfWeek(base);
    setWeekStart(nextWeekStart);
    navigate(`/calendar?scope=${next}&view=${view}&week=${dayKey(nextWeekStart)}`, { replace: true });
  };

  const handleViewChange = (next: ViewMode) => {
    setView(next);
    navigate(`/calendar?scope=${scope}&view=${next}&week=${dayKey(weekStart)}`, { replace: true });
  };

  const changeWeek = (delta: number) => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + delta * 7);
    setWeekStart(next);
    setScope("week");
    navigate(`/calendar?scope=week&view=week&week=${dayKey(next)}`, { replace: true });
  };

  const renderTask = (task: Task) => (
    <div key={task.id ?? task.title} className="flex flex-col rounded-xl border border-slate-200/60 bg-white px-3 py-2 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{task.title}</span>
        {task.priority ? <span className="text-[11px] font-semibold text-amber-600">P{task.priority}</span> : null}
      </div>
      {task.description ? (
        <p className="mt-1 text-xs text-muted line-clamp-2">{task.description}</p>
      ) : null}
      {Array.isArray(task.tags) && task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span key={String(tag)} className="rounded-full bg-accent-blue/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-blue-800 ring-1 ring-accent-blue/20">
              #{typeof tag === "string" ? tag : tag?.title ?? ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderWeek = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {weekDays.map((day) => {
        const key = dayKey(day);
        const dayTasks = grouped[key] || [];
        const isToday = dayKey(day) === dayKey(today);
        return (
          <div key={key} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm ring-1 ring-accent-blue/10 dark:border-slate-700/60 dark:bg-slate-900/70">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold ${isToday ? "bg-accent-blue text-white shadow-sm" : "bg-slate-100 text-primary dark:bg-slate-800"}`}>
                  {formatLabel(day, { weekday: "short" })}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-primary">
                    {formatLabel(day, { month: "long", day: "numeric" })}
                  </span>
                  <span className="text-xs text-muted">{dayTasks.length} pending</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {dayTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-muted dark:border-slate-700 dark:bg-slate-800/60">
                  Nothing due.
                </div>
              )}
              {dayTasks.map(renderTask)}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMonth = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {monthDays.map((day) => {
        const key = dayKey(day);
        const dayTasks = grouped[key] || [];
        const isToday = dayKey(day) === dayKey(today);
        return (
          <div key={key} className={`rounded-2xl border p-3 shadow-sm ${isToday ? "border-accent-blue/50 ring-1 ring-accent-blue/20 bg-accent-blue-50/30 dark:bg-[rgba(99,102,241,0.1)]" : "border-slate-200/70 bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/60"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-primary">
                {formatLabel(day, { month: "short", day: "numeric" })}
              </span>
              <span className="text-[11px] font-semibold text-muted">{dayTasks.length} due</span>
            </div>
            <div className="flex flex-col gap-1">
              {dayTasks.slice(0, 3).map((task) => (
                <span key={task.id ?? task.title} className="truncate rounded-lg bg-white/80 px-2 py-1 text-xs font-semibold text-primary shadow-sm ring-1 ring-slate-100 dark:bg-slate-800">
                  {task.title}
                </span>
              ))}
              {dayTasks.length > 3 && (
                <span className="text-[11px] font-semibold text-accent-blue">+{dayTasks.length - 3} more</span>
              )}
              {dayTasks.length === 0 && <span className="text-[11px] text-muted">Free day</span>}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col px-3 md:px-6 lg:px-10 py-4 pb-28 gap-4">
      <div className="flex w-full max-w-5xl flex-col gap-3 mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Calendar</h1>
            <p className="text-sm text-muted">See what is coming up this week or month.</p>
          </div>
          <div className="flex items-center gap-2">
            {(["week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleViewChange(mode)}
                className={`rounded-full px-3 py-2 text-sm font-semibold shadow-sm transition ${view === mode ? "bg-accent-blue text-white shadow-accent-blue/30" : "border border-slate-200 bg-white text-primary hover:-translate-y-px dark:border-slate-700 dark:bg-slate-900"}`}
              >
                {mode === "week" ? "Week view" : "Month view"}
              </button>
            ))}
          </div>
        </div>

        {view === "week" && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => changeWeek(-1)}
              className="rounded-full border border-transparent px-2 py-1 text-xl font-semibold text-primary hover:-translate-y-px transition"
              aria-label="Previous week"
            >
              ←
            </button>
            <span className="text-sm font-semibold text-primary">
              Week of {formatLabel(weekStart, { month: "long", day: "numeric" })}
            </span>
            <button
              type="button"
              onClick={() => changeWeek(1)}
              className="rounded-full border border-transparent px-2 py-1 text-xl font-semibold text-primary hover:-translate-y-px transition"
              aria-label="Next week"
            >
              →
            </button>
          </div>
        )}

        {scope === "overdue" && (
          <div className="rounded-2xl border border-red-200/70 bg-red-50/70 p-4 shadow-sm dark:border-red-400/50 dark:bg-[rgba(248,113,113,0.12)]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-red-700 dark:text-red-200">Overdue</span>
                <span className="text-sm text-red-700/80 dark:text-red-200/80">Pending tasks before today</span>
              </div>
              <span className="text-2xl font-bold text-red-700 dark:text-red-200">{overdueList.length}</span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {overdueList.length === 0 && (
                <div className="rounded-xl border border-dashed border-red-200 bg-white/70 px-3 py-2 text-sm text-red-700 dark:border-red-300/60 dark:bg-slate-900/60 dark:text-red-200">
                  All caught up!
                </div>
              )}
              {overdueList.map(renderTask)}
            </div>
          </div>
        )}

        <div className="w-full">
          {tasks.isLoading && (
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm text-muted shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
              Loading calendar...
            </div>
          )}
          {tasks.isSuccess && (
            <>
              {view === "week" ? renderWeek() : renderMonth()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
