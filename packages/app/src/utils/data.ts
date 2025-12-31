import { Task } from "@/hooks/tasks";
import { matchDate } from "./date";
import { SERVER_IP } from "@/hooks/app";

const DAY_MS = 1000 * 60 * 60 * 24;

export const normalizeDay = (value: Date | string | number | undefined) => {
  const date = new Date(value as any);
  date.setHours(0, 0, 0, 0);
  return date;
};

export async function fetchData(url: string, options: any) {
  const payload = {
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    ...options
  };

  if(options.body) payload.body = JSON.stringify(options.body);

  return fetch(`${SERVER_IP}${url}`, payload);
}

/**
 * Sorts array by dates in order from soonest to farthest
 * @param {Array} arr array to sort
 * @returns sorted array
 */
export function sortByDate(arr: Task[]) {
  return arr.sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** Checks if one date is greater than the other */
export function isDateGreater(a: Date, b: Date): boolean {
  if (a.getMonth() == b.getMonth()) {
    if (a.getDate() <= b.getDate()) return true;
  } else if (a.getMonth() < b.getMonth()) return true;

  return false;
}

/** Checks if the first date is within the second based on mode */
export function isDateWithinProximity(mode: "daily" | "weekly" | "bi-weekly" | "monthly", a: Task, b: Date): boolean {
  return occursOnDate({ ...a, repeater: mode }, b);
}

export function occursOnDate(task: Task, target: Date): boolean {
  if (!task?.date) return false;

  const start = normalizeDay(task.date);
  const day = normalizeDay(target);

  if (Number.isNaN(start.getTime()) || Number.isNaN(day.getTime())) return false;
  if (day < start) return false;

  switch (task.repeater) {
    case "daily":
      return true;
    case "weekly":
      return start.getDay() === day.getDay();
    case "bi-weekly": {
      const diffDays = Math.floor(Math.abs(day.getTime() - start.getTime()) / DAY_MS);
      return diffDays % 14 === 0;
    }
    case "monthly":
      return start.getDate() === day.getDate();
    default:
      return start.getTime() === day.getTime();
  }
}

export function isTaskDone(task: Task, activeDate: Date): boolean {
  const day = normalizeDay(activeDate ?? new Date());

  // Non-repeating tasks: show as pending until explicitly marked done, regardless of date.
  if (!task?.repeater) {
    return task?.done === false || typeof task?.done === "undefined";
  }

  // Repeating tasks only count on their active occurrence day(s).
  if (!occursOnDate(task, day)) return false;

  const isCompletedForDay = Array.isArray(task.done)
    ? task.done.some((entry) => matchDate(new Date(entry), day))
    : (!task.repeater && Boolean(task.done));

  // Return true when the task is still pending for the selected day.
  return !isCompletedForDay;
}

export function sortByPriority(tasks: Task[]) {
  return tasks.sort((a: Task, b: Task) => { return (b.priority || 0) > (a.priority || 0) ? 1 : -1; });
}
