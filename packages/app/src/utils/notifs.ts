import {
  LocalNotificationSchema,
  LocalNotifications,
  PendingLocalNotificationSchema,
  PendingResult,
  PermissionStatus,
  ScheduleResult,
} from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { getSettings, setSettings } from "@/hooks/settings";
import { Logger } from "./logger";
import { fetchData } from "./data";
import { acknowledgeDeliveredNotifications, pullPendingServerNotifications } from "@/hooks/notifications";

const FALLBACK_BODY = "Stay on track—open TidalTask to see what's due today.";

const isWeb = () => Capacitor.getPlatform() === "web";
const supportsWebNotifications = () => typeof Notification !== "undefined";

export async function getTodayNotificationBody(): Promise<string> {
  try {
    const response = await fetchData("/task/today", {});
    if (!response.ok) throw new Error("Failed to fetch tasks");
    const tasks = await response.json();
    const titles: string[] = Array.isArray(tasks)
      ? tasks
          .map((t) => (typeof t?.title === "string" ? t.title.trim() : ""))
          .filter((t) => t.length > 0)
      : [];

    if (titles.length === 0) {
      return "Nothing due today. Set a plan and stay ahead.";
    }

    const preview = titles.slice(0, 3).join(", ");
    const more = titles.length - 3;
    const suffix = more > 0 ? ` (+${more} more)` : "";
    return `Due today: ${preview}${suffix}`;
  } catch (err) {
    Logger.logWarning(`Unable to build daily notification: ${String(err)}`);
    return FALLBACK_BODY;
  }
}

/* Checks if a user has been reminded */
export async function hasRemindedToday(): Promise<boolean> {
  const settings = await getSettings();

  if (settings.lastNotification) {
    const last = new Date(settings.lastNotification);
    const current = new Date();

    if (last.getDate() == current.getDate()) return true;
    else return false;
  }

  return false;
}

/* Runs all the checks for the notifications */
export async function initializeNotifications() {
  let checked = await checkPermissions();
  if (checked.display == "prompt" || checked.display == "prompt-with-rationale")
    await requestPermissions();

  const sendingDaily: boolean = await checkSendingDaily();
  if (!sendingDaily) setDailyReminders();

  await syncServerNotifications();
}

/* Sets daily reminders */
export async function setDailyReminders(hour?: number, minute?: number) {
  const timeBuilder = new Date();

  timeBuilder.setDate(timeBuilder.getDate() + 1);
  
  if (!hour || !minute) timeBuilder.setHours(8, 0, 0, 0);

  if (hour) timeBuilder.setHours(hour);

  if (minute) timeBuilder.setMinutes(minute);

  const id = new Date().getTime();

  const body = await getTodayNotificationBody();

  await scheduleNotification({
    title: "TidalTask: ADHD Manager",
    id,
    body,
    schedule: {
      at: timeBuilder,
      every: "day",
    },
  });

  return await getPendingById(id);
}

/* Checks if the system is sending daily notifications */
export async function checkSendingDaily(): Promise<boolean> {
  const { notifications: pending } = await getPending();
  const isPending = pending.filter((notif) => notif?.schedule?.every == "day");
  if (isPending.length > 0) return true;

  return false;
}

/* Gets pending notifications */
export async function getPending(): Promise<PendingResult> {
  return await LocalNotifications.getPending();
}

export async function getPendingById(
  id: number
): Promise<PendingLocalNotificationSchema | undefined> {
  const pending = await getPending();
  return pending.notifications.find((notif) => notif.id == id);
}

/* Sets the state of the daily reminder checker */
export async function setHasRemindedToday(state: boolean): Promise<Boolean> {
  const settings = await getSettings();
  settings.hasRemindedToday = state || true;
  await setSettings(settings);

  return settings.hasRemindedToday;
}

/* Sets the notification settings into the config */
export async function setNotificationConfig() {
  const settings = await getSettings();
  settings.lastNotification = new Date().getTime();

  await setHasRemindedToday(true);
  await setSettings(settings);
}

/* Checks if system can send notifications */
export async function checkPermissions(): Promise<PermissionStatus> {
  if (isWeb() && supportsWebNotifications()) {
    const state = Notification.permission;
    return { display: state } as PermissionStatus;
  }
  return await LocalNotifications.checkPermissions();
}

/* Requests the ability to request permissions from the user */
export async function requestPermissions(): Promise<PermissionStatus> {
  if (isWeb() && supportsWebNotifications()) {
    const state = await Notification.requestPermission();
    return { display: state } as PermissionStatus;
  }
  return await LocalNotifications.requestPermissions();
}

/* Schedules many notifications */
export async function scheduleNotification(
  ...options: LocalNotificationSchema[]
): Promise<ScheduleResult | undefined> {
  await setNotificationConfig();

  const checked = await checkPermissions();

  if (checked.display !== "granted") {
    Logger.logWarning(`Unable to send notification: Missing Permissions`);
    return undefined;
  }

  if (isWeb() && supportsWebNotifications()) {
    options.forEach((opt) => {
      const delay =
        opt.schedule?.at instanceof Date
          ? Math.max(0, opt.schedule.at.getTime() - Date.now())
          : 0;
      window.setTimeout(() => {
        try {
          new Notification(opt.title || "TidalTask", { body: opt.body });
        } catch (err) {
          Logger.logWarning(`Web notification failed: ${String(err)}`);
        }
      }, delay);
    });
    return undefined;
  }

  const notif = await LocalNotifications.schedule({
    notifications: [...options],
  });

  return notif;
}

export async function cancelNotifications(
  notifications: LocalNotificationSchema[]
) {
  LocalNotifications.cancel({ notifications });
}

export async function cancelNotification(
  notification: LocalNotificationSchema | undefined
) {
  if (notification)
    LocalNotifications.cancel({ notifications: [notification] });
}

function hashNotificationId(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }

  const normalized = Math.abs(hash);
  return (normalized % 2147483646) + 1;
}

export async function syncServerNotifications(): Promise<number> {
  const result = await syncServerNotificationsDetailed();
  return result.delivered;
}

export async function syncServerNotificationsDetailed(): Promise<{
  pending: number;
  delivered: number;
  permission: PermissionStatus["display"];
}> {
  try {
    const pending = await pullPendingServerNotifications();
    if (!pending.length) {
      const permission = await checkPermissions();
      return { pending: 0, delivered: 0, permission: permission.display };
    }

    const permission = await checkPermissions();
    if (permission.display !== "granted") {
      Logger.logWarning("Notification permission is not granted; pending notifications were not acknowledged.");
      return { pending: pending.length, delivered: 0, permission: permission.display };
    }

    const deliveredIds: string[] = [];
    for (const item of pending) {
      const scheduled = await scheduleNotification({
        id: hashNotificationId(item.id),
        title: item.title || "TidalTask",
        body: item.body || FALLBACK_BODY,
        schedule: { at: new Date() }
      });

      if (scheduled !== undefined || isWeb()) {
        deliveredIds.push(item.id);
      }
    }

    if (deliveredIds.length > 0) {
      await acknowledgeDeliveredNotifications(deliveredIds);
    }

    return { pending: pending.length, delivered: deliveredIds.length, permission: permission.display };
  } catch (err) {
    Logger.logWarning(`Unable to sync server notifications: ${String(err)}`);
    return { pending: 0, delivered: 0, permission: "denied" };
  }
}
