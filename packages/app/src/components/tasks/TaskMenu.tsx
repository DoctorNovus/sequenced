import { useEffect, useMemo, useRef, useState } from "react";
import { TaskItem } from "../task/TaskItem";
import { isTaskDone } from "@/utils/data";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useUpdateTask } from "@/hooks/tasks";

export default function TaskMenu({
  skeleton,
  tasks,
  setIsInspecting,
  taskFilter,
  selectionMode = false,
  selectedTaskIds = [],
  toggleSelection,
  animatingIds = [],
  activeDate
}) {
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [orderedTasks, setOrderedTasks] = useState<any[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastHoverIdRef = useRef<string | null>(null);
  const { mutateAsync: updateTask } = useUpdateTask();

  if (skeleton) {
    return (
      <div className="w-full h-full flex flex-col items-center ">
        <ul className="w-full h-full pb-4 gap-2 flex flex-col items-center justify-start py-0">
          <li className="w-full h-full">
            <TaskItem skeleton="true" />
          </li>
        </ul>
      </div>
    )
  }

  const visibleTasks = (tasks || [])
    .filter(Boolean)
    .filter((task) =>
      taskFilter === "incomplete"
        ? isTaskDone(task, activeDate)
        : true
    );

  useEffect(() => {
    setOrderedTasks(visibleTasks);
  }, [tasks, taskFilter, activeDate]);

  const handleReorder = (sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const current = [...orderedTasks];
    const fromIndex = current.findIndex((t) => t.id === sourceId);
    const toIndex = current.findIndex((t) => t.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setOrderedTasks(current);
  };

  const persistOrder = async (list: any[]) => {
    const total = list.length;
    const updates = list.map((task, idx) => ({
      id: task.id,
      data: { ...task, priority: total - idx }
    }));
    await Promise.all(updates.map((payload) => updateTask(payload)));
  };

  const { grouped, ungrouped } = useMemo(() => {
    const groupedTasks: Record<string, any[]> = {};
    const ungroupedTasks: any[] = [];

    orderedTasks.forEach((task) => {
      const groupName = (task.group || "").trim();
      if (groupName.length === 0) {
        ungroupedTasks.push(task);
        return;
      }

      if (!groupedTasks[groupName]) groupedTasks[groupName] = [];
      groupedTasks[groupName].push(task);
    });

    return { grouped: groupedTasks, ungrouped: ungroupedTasks };
  }, [visibleTasks]);

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const findTaskIdFromPoint = (clientX: number, clientY: number): string | null => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const taskNode = el.closest("[data-task-id]");
    if (!taskNode) return null;
    return (taskNode as HTMLElement).dataset.taskId || null;
  };

  const renderTask = (task: any) => (
    <div
      key={task.id || task.title}
      className={`w-full ${draggingId === task.id ? "opacity-60 scale-[0.99] ring-2 ring-accent-blue/50 shadow-lg" : ""}`}
      draggable={false}
      data-task-id={task.id}
      onPointerDown={(e) => {
        e.preventDefault();
        setDraggingId(task.id);
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!draggingId) return;
        e.preventDefault();
        const targetId = findTaskIdFromPoint(e.clientX, e.clientY);
        if (targetId && targetId !== lastHoverIdRef.current) {
          lastHoverIdRef.current = targetId;
          handleReorder(draggingId, targetId);
        }
      }}
      onPointerUp={() => {
        if (draggingId) {
          const current = [...orderedTasks];
          setDraggingId(null);
          persistOrder(current);
          lastHoverIdRef.current = null;
        }
      }}
      onPointerEnter={() => {
        if (draggingId && draggingId !== task.id) {
          lastHoverIdRef.current = task.id;
          handleReorder(draggingId, task.id);
        }
      }}
      onPointerCancel={() => setDraggingId(null)}
      style={{
        touchAction: "none",
        transition: draggingId === task.id ? "none" : "transform 120ms ease, opacity 120ms ease",
      }}
    >
      <TaskItem
        item={task}
        setIsInspecting={setIsInspecting}
        taskFilter={taskFilter}
        selectionMode={selectionMode}
        isSelected={selectedTaskIds.includes(task.id)}
        onToggleSelect={toggleSelection}
        isAnimating={animatingIds.includes(task.id)}
      />
    </div>
  );

  const groupedEntries = Object.entries(grouped).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="w-full h-full flex flex-col items-center ">
      <div className="w-full h-full pb-4 flex flex-col gap-3 justify-start py-4">
        {ungrouped.length > 0 && ungrouped.map(renderTask)}

        {groupedEntries.map(([groupName, list]) => {
          const isCollapsed = collapsedGroups.includes(groupName);
          return (
            <div
              key={groupName}
              className="w-full rounded-2xl border bg-white/90 px-3 py-2 shadow-sm ring-1 ring-accent-blue/10 dark:bg-slate-900/70"
            >
              <button
                type="button"
                onClick={() => toggleGroup(groupName)}
                className="flex w-full items-center justify-between gap-2 px-1 py-1 text-left"
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRightIcon className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-primary" />
                  )}
                  <span className="text-sm font-semibold text-primary">{groupName}</span>
                </div>
                <span className="text-xs font-semibold text-muted">{list.length}</span>
              </button>
              {!isCollapsed && (
                <div className="mt-2 flex flex-col gap-2">
                  {list.map((task: any) => renderTask(task))}
                </div>
              )}
            </div>
          );
        })}

        {visibleTasks.length === 0 && (
          <h1 className="text-lg text-accent-blue text-center">No Tasks</h1>
        )}
      </div>
    </div>
  );
}
