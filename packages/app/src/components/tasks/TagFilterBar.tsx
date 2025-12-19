import { useMemo } from "react";
import { useApp } from "@/hooks/app";
import { Task } from "@/hooks/tasks";

interface TagFilterBarProps {
  tasks: Task[];
}

export default function TagFilterBar({ tasks }: TagFilterBarProps) {
  const [appData, setAppData] = useApp();
  const activeTags = appData.activeTags ?? [];

  const availableTags = useMemo(() => {
    const counts = new Map<string, number>();

    tasks?.forEach((task) => {
      const tags = Array.isArray(task?.tags) ? task.tags : [];
      const subtaskTags = Array.isArray(task?.subtasks)
        ? task.subtasks.flatMap((subtask) =>
          Array.isArray(subtask.tags) ? subtask.tags : []
        )
        : [];

      [...tags, ...subtaskTags].forEach((tag) => {
        const normalized = typeof tag === "string"
          ? tag.toLowerCase()
          : tag && typeof (tag as any).title === "string"
            ? (tag as any).title.toLowerCase()
            : "";
        if (!normalized) return;
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  const toggleTag = (tag: string) => {
    const next = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag];

    setAppData({ ...appData, activeTags: next });
  };

  if (availableTags.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl bg-white/90 px-4 py-3 shadow ring-1 ring-accent-blue/10 dark:bg-slate-900/70">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">Filter by tags</span>
          {activeTags.length > 0 && (
            <span className="rounded-full bg-accent-blue/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-blue-800 ring-1 ring-accent-blue/20">
              {activeTags.length} active
            </span>
          )}
        </div>
        {activeTags.length > 0 && (
          <button
            type="button"
            className="text-xs font-semibold text-accent-blue hover:text-accent-blue-700"
            onClick={() => setAppData({ ...appData, activeTags: [] })}
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {availableTags.map(({ name, count }) => {
          const isActive = activeTags.includes(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggleTag(name)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                isActive
                  ? "bg-accent-blue text-white shadow-sm shadow-accent-blue/30"
                  : "bg-white text-primary ring-1 ring-accent-blue/20 hover:ring-accent-blue/40"
              }`}
            >
              <span>#{name}</span>
              <span className={isActive ? "text-white/90" : "text-muted"}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
