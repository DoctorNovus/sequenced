import { Preferences } from "@capacitor/preferences";
import {
  useQueryClient,
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";

import { getSync } from "./settings";
import { getToken } from "./user";
import { fetchServer } from "./auth";

// TODO - a task likely should always have these properties when you create it, optional on id is especially bad.
export interface Task {
  title?: string;
  description?: string;
  date?: Date;
  id?: string;
  done?: boolean;
  repeater?: string;
  reminder?: string;
  subtasks?: Task[];
}

export function createInitialTaskData(): Task {
  return {
    title: "",
    description: "",
    date: new Date(),
    done: false,
    repeater: "",
    reminder: "",
    subtasks: [],
  };
}

export async function checkMigration() {
  const synced = await getSync();
  if (!synced)
    await migrateTasks();
}

export async function migrateTasks() {
  const { value } = await Preferences.get({ key: "tasks" });
  const tasks = JSON.parse(value ?? "[]");
  const token = await getToken();

  console.log("Migrating to cloud");

  const migration = await fetchServer({
    path: "/task/migrate",
    method: "POST",
    body: tasks,
    token
  });

  if (migration.isSynced) {
    console.log("Loading cloud data");
    await Preferences.set({ key: "sync", value: "true" });
    await Preferences.set({ key: "tasks", value: JSON.stringify(migration.tasks) });
    return null;
  }

  if (migration.sync) {
    console.log("Synced with Cloud");
    await Preferences.set({ key: "sync", value: "true" });
    return null;
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
  const synced = await getSync();

  if (synced) {
    const tasks = await fetchServer({
      path: "/task",
      token: await getToken()
    });

    console.log("TASKS", tasks);

    return tasks;
  } else {

    migrateTasks();

  }

  return [];
}

/* Loads tasks and finds the task with given id */
export async function loadTaskById(id: string): Promise<Task> {
  const tasks = await loadTasks();
  return tasks.find((task) => task.id == id) || {};
}

/* returns query data */
export function useTasks(): UseQueryResult {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: loadTasks,
    staleTime: Infinity,
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
    // await Preferences.set({ key: "tasks", value: JSON.stringify(tasks) });
    const token = await getToken();

    await fetchServer({
      path: "/task",
      method: "POST",
      body: task,
      token
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
    await fetchServer({
      path: "/task",
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
    await fetchServer({
      path: "/task",
      method: "DELETE",
      body: task
    })
  };

  const onSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  return useMutation({ mutationFn, onSuccess });
}
