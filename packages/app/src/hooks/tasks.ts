import { Preferences } from "@capacitor/preferences";
import {
  useQueryClient,
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";

import { Logger } from "@/utils/logger";
import { Task } from "@backend/task/task.entity";
import { CountData } from "@backend/metrics/metrics.service";

import { getSync } from "./settings";
import { fetchData } from "@/utils/data";

export function createInitialTaskData(): Task {
  return {
    title: "",
    description: "",
    date: new Date(),
    done: false,
    repeater: "",
    reminder: "",
    subtasks: [],
    priority: 0
  };
}

export async function checkMigration(): Promise<void> {
  const synced = await getSync();
  if (!synced) await migrateTasks();
}

export async function migrateTasks(): Promise<void> {
  const { value } = await Preferences.get({ key: "tasks" });
  const tasks = JSON.parse(value ?? "[]");

  const response = await fetchData("/task/migrate", {
    method: "POST",
    body: tasks
  });

  const migration = await response.json();

  if (migration.isSynced) {
    Logger.log("Louding cloud data...");
    await Preferences.set({ key: "sync", value: "true" });
    await Preferences.set({ key: "tasks", value: JSON.stringify(migration.tasks) });
  }

  if (migration.sync) {
    Logger.log("Synced with the cloud.");
    await Preferences.set({ key: "sync", value: "true" });
  }
}

export function useMigrate() {
  return useMutation({
    mutationFn: checkMigration
  });
}

/* Filters out ghost tasks */
export function filterBroken(tasks: Task[]): Task[] {
  return tasks?.filter((task) => task.id != undefined);
}

/* Loads task array from Preferences database */
export async function loadTasks(): Promise<Task[]> {
  const response = await fetchData(`/task`, {});

  return await response.json();
}

/* Loads tasks and finds the task with given id */
export async function loadTaskById(id: string): Promise<Task | undefined> {
  const tasks = await loadTasks();
  return tasks.find((task) => task.id == id);
}

/* returns query data */
export function useTasks(): UseQueryResult<Task[]> {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: loadTasks,
    staleTime: 1000 * 60 * 60,
  });
}

export async function getTasksToday(): Promise<CountData> {
  return await (await fetchData("/metrics/tasks/today", {})).json();
}

export function useTasksToday(): UseQueryResult<Task[]> {
  return useQuery({
    queryKey: ["tasks", "today"],
    queryFn: getTasksToday,
    staleTime: 1000 * 60 * 60
  });
}

export async function getTasksTomorrow(): Promise<CountData> {
  return await (await fetchData("/metrics/tasks/tomorrow", {})).json();
}

export function useTasksTomorrow(): UseQueryResult<CountData> {
  return useQuery({
    queryKey: ["tasks", "tomorrow"],
    queryFn: getTasksTomorrow,
    staleTime: 1000 * 60 * 60
  });
}

export async function getTasksWeek(): Promise<CountData> {
  return await (await fetchData("/metrics/tasks/week", {})).json();
}

export function useTasksWeek(): UseQueryResult<CountData> {
  return useQuery({
    queryKey: ["tasks", "week"],
    queryFn: getTasksWeek,
    staleTime: 1000 * 60 * 60
  });
}

export async function getTasksOverdue(): Promise<CountData> {
  return await (await fetchData("/metrics/tasks/overdue", {})).json();
}

export function useTasksOverdue(): UseQueryResult<CountData> {
  return useQuery({
    queryKey: ["tasks", "overdue"],
    queryFn: getTasksOverdue,
    staleTime: 1000 * 60 * 60
  });
}

export async function getTasksIncomplete(): Promise<CountData> {
  return await (await fetchData("/task/incomplete", {})).json();
}

export function useTasksIncomplete(): UseQueryResult<CountData> {
  return useQuery({
    queryKey: ["tasks", "incomplete"],
    queryFn: getTasksIncomplete,
    staleTime: 1000 * 60 * 60
  });
}

/* Return query data of tasks, and finds specific task from given id */
export function useTaskById(id: string): UseQueryResult {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: () => loadTaskById(id),
    staleTime: Infinity,
  });
}

/* Adds a task to the tasks database */
export function useAddTask(): UseMutationResult<void, Error, Task, unknown> {
  const queryClient = useQueryClient();

  const mutationFn = async (task: Task) => {
    await fetchData("/task", {
      method: "POST",
      body: task
    });
  };

  const onSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  return useMutation({ mutationFn, onSuccess });
}

/* Updates specific task */
export function useUpdateTask(): UseMutationResult<
  void,
  Error,
  { id: string; data: Object },
  unknown
> {
  const queryClient = useQueryClient();

  const mutationFn = async ({ id, data }: { id: string; data: Object }) => {
    await fetchData("/task", {
      method: "PATCH",
      body: data
    });
  };

  const onSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  return useMutation({ mutationFn, onSuccess });
}

/* Delete specific task */
export function useDeleteTask(): UseMutationResult<void, Error, Task, unknown> {
  const queryClient = useQueryClient();

  const mutationFn = async (task: Task) => {
    await fetchData("/task", {
      method: "DELETE",
      body: task
    });
  };

  const onSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  return useMutation({ mutationFn, onSuccess });
}

export async function getTaskUsers(id: string) {
  const resp = await fetchData(`/task/${id}/users`, {});

  if (resp.ok)
    return await resp.json();

  Logger.logError(await resp.text());
}

export function useTaskUsers(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId, "users"],
    queryFn: () => getTaskUsers(taskId),
    staleTime: 1000 * 60 * 60
  });
}

export async function removeUser({ taskId, userEmail }: { taskId: string, userEmail: string }) {
  return await fetchData(`/task/${taskId}/users/${userEmail}/remove`, {
    method: "DELETE"
  });
}

export function useRemoveUser() {
  return useMutation({
    mutationFn: removeUser
  });
}