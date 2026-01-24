import { VoiceCommands } from "@/plugins/voiceCommands";
import { fetchData } from "@/utils/data";

type ListenerHandle = { remove: () => void };

let finalListener: ListenerHandle | null = null;

function normalizeCommand(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

async function addTaskFromCommand(text: string): Promise<string | null> {
  const normalized = normalizeCommand(text);
  const lower = normalized.toLowerCase();
  const addPrefix = lower.startsWith("add task ") ? "add task " : lower.startsWith("add ") ? "add " : "";
  if (!addPrefix) return null;

  const title = normalized.slice(addPrefix.length).trim();
  if (!title) return "Say the task title after add.";

  const response = await fetchData("/task", {
    method: "POST",
    body: { title, date: new Date().toISOString(), done: false }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return err?.message || "Unable to add the task.";
  }

  return `Added task: ${title}.`;
}

async function dueTasksFromCommand(text: string): Promise<string | null> {
  const lower = normalizeCommand(text).toLowerCase();
  if (
    !lower.includes("tasks are due") &&
    !lower.includes("tasks due") &&
    !lower.includes("due tasks")
  ) {
    return null;
  }

  const response = await fetchData("/task/overdue", {});
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return err?.message || "Unable to fetch due tasks.";
  }

  const tasks = (await response.json().catch(() => [])) as Array<{ title?: string }>;
  if (!tasks.length) return "No tasks are due.";

  const preview = tasks.slice(0, 3).map((task) => task.title).filter(Boolean).join(", ");
  if (!preview) return `${tasks.length} tasks are due.`;
  return `${tasks.length} tasks are due. ${preview}.`;
}

export async function handleVoiceCommand(text: string): Promise<string> {
  const addResult = await addTaskFromCommand(text);
  if (addResult) return addResult;

  const dueResult = await dueTasksFromCommand(text);
  if (dueResult) return dueResult;

  return "Sorry, I can add a task or list due tasks.";
}

export async function startVoiceAssistant() {
  const permissions = await VoiceCommands.requestSpeechPermission();
  if (permissions.speech !== "authorized" || permissions.microphone !== "granted") {
    throw new Error("Speech permissions are required.");
  }

  if (!finalListener) {
    finalListener = await VoiceCommands.addListener("finalResult", async (event) => {
      if (!event?.text) return;
      const response = await handleVoiceCommand(event.text);
      await VoiceCommands.speak({ text: response });
    });
  }

  await VoiceCommands.startListening();
}

export async function stopVoiceAssistant() {
  if (finalListener) {
    finalListener.remove();
    finalListener = null;
  }
  await VoiceCommands.stopListening();
}
