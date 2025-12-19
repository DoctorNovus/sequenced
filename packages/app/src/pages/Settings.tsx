import {
  cancelNotification,
  getPending,
  setDailyReminders,
  scheduleNotification,
} from "@/utils/notifs";
import { Capacitor } from "@capacitor/core";

import { Settings, getSettings, setSettings } from "@/hooks/settings";
import { PendingLocalNotificationSchema } from "@capacitor/local-notifications";
import { useEffect, useState } from "react";
import DailyNotifications from "./(Settings)/DailyNotifications";
import UserLogin from "./(Settings)/UserLogin";
import { Logger } from "@/utils/logger";
import DeveloperSettings from "./(Settings)/DeveloperSettings";
import ControllerUser from "./(Settings)/ControlledUser";
import { useTasks, useDeleteTask } from "@/hooks/tasks";
import xIcon from "@/assets/social_icons/x.svg";
import instagramIcon from "@/assets/social_icons/instagram.svg";
import facebookIcon from "@/assets/social_icons/facebook.svg";
import { useApp } from "@/hooks/app";

export default function SettingsPage() {
  const [tempSettings, setTempSettings] = useState<Settings>({});
  const tasks = useTasks();
  const { mutateAsync: deleteTask } = useDeleteTask();
  const [cleanupInterval, setCleanupInterval] = useState<string>("30");
  const [cleanupStatus, setCleanupStatus] = useState<string>("");
  const [appState, setAppState] = useApp();

  useEffect(() => {
    getSettings().then(async (tempSettings) => {
      setTempSettings(tempSettings);
    });
  }, []);

  const UpdateSettings = async (newValue: object) => {
    const settings: Settings = { ...tempSettings, ...newValue };

    setTempSettings(settings);
    setSettings(settings);

    if (tempSettings.sendDailyReminders && !settings.sendDailyReminders)
      HandleDailyChange(false);

    if (!tempSettings.sendDailyReminders && settings.sendDailyReminders)
      HandleDailyChange(true);
  };

  const FindDailyTask = async (): Promise<
    PendingLocalNotificationSchema | undefined
  > => {
    const pendingNotifications = (await getPending()).notifications;
    for (let i = 0; i < pendingNotifications.length; i++) {
      const pendingItem = pendingNotifications[i];
      if (pendingItem.schedule && pendingItem.schedule.every == "day")
        return pendingItem;
    }

    return undefined;
  };

  const getCompletedTasks = () => {
    if (!tasks.isSuccess) return [];
    const now = new Date();
    const thresholdDays = parseInt(cleanupInterval);
    const cutoff =
      isNaN(thresholdDays) || cleanupInterval === "all"
        ? null
        : new Date(now.getTime() - thresholdDays * 24 * 60 * 60 * 1000);

    return tasks.data.filter((task) => {
      const isCompleted =
        task.done === true ||
        (Array.isArray(task.done) && task.done.length > 0);

      if (!isCompleted) return false;

      if (!cutoff) return true;

      const taskDate = new Date(task.date);
      return !isNaN(taskDate.getTime()) && taskDate < cutoff;
    });
  };

  const handleCleanup = async () => {
    const toDelete = getCompletedTasks();
    if (toDelete.length === 0) {
      setCleanupStatus("No completed tasks to delete.");
      return;
    }

    setCleanupStatus(`Deleting ${toDelete.length} tasks...`);
    for (const task of toDelete) {
      await deleteTask(task);
    }
    setCleanupStatus(`Deleted ${toDelete.length} tasks.`);
  };

  const UpdateTime = async (newTime: string) => {
    const timeParts = newTime.split(":");
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);

    await cancelNotification(await FindDailyTask());
    const newReminder = await setDailyReminders(hour, minute);

    Logger.log(`Set Daily Reminders!`);
  };

  const HandleDailyChange = async (newValue: boolean) => {
    if (!newValue) {
      const pendingNotifications = (await getPending()).notifications;
      for (let i = 0; i < pendingNotifications.length; i++) {
        const pendingItem = pendingNotifications[i];
        if (pendingItem.schedule && pendingItem.schedule.every == "day")
          cancelNotification(pendingItem);
      }
    }

    if (newValue) {
      let setTime = tempSettings.sendDailyRemindersTime;
      if (!setTime) {
        setTempSettings({ ...tempSettings, sendDailyRemindersTime: "08:00" });
        setTime = "08:00";
      }

      const timeParts = setTime.split(":");
      const hour = parseInt(timeParts[0]);
      const minute = parseInt(timeParts[1]);

      const newReminder = await setDailyReminders(hour, minute);

      Logger.log(`Set Daily Reminders!`);
    }
  };

  const toggleTheme = () => {
    const next = (appState?.theme ?? "light") === "dark" ? "light" : "dark";
    setAppState({ ...appState, theme: next });
  };

  const TestDaily = async () => {
    const fireAt = new Date(Date.now() + 3000);
    await scheduleNotification({
      id: Math.floor(Math.random() * 2147483647),
      title: "Sequenced: Test Reminder",
      body: "This is a test daily notification.",
      schedule: { at: fireAt },
    });
    Logger.log("Scheduled test notification for", fireAt.toISOString());
  };

  const openStoreReview = () => {
    const APP_STORE_ID = "6478198104";
    const PLAY_STORE_ID = "com.ottegi.sequenced";
    const platform = Capacitor.getPlatform();

    if (platform === "ios") {
      window.open(`itms-apps://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`, "_system");
      return;
    }

    if (platform === "android") {
      window.open(`market://details?id=${PLAY_STORE_ID}`, "_system");
      return;
    }

    window.open(`https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`, "_blank");
  };

  return (
    <div className="flex flex-col w-full h-full px-3 md:px-6 lg:px-10 py-4 pb-28 gap-4 items-center overflow-y-auto">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-600">Control reminders, account status, and other settings.</p>
        </div>
      </div>
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <div className="rounded-2xl surface-card border ring-1 ring-accent-blue/10 p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-primary">Appearance</h2>
            <p className="text-sm text-muted">Switch between light and dark mode.</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-xl border border-accent-blue/25 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-px dark:bg-transparent"
          >
            <span>{(appState?.theme ?? "light") === "dark" ? "Dark" : "Light"} mode</span>
            <span
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                (appState?.theme ?? "light") === "dark" ? "bg-accent-blue-600" : "bg-slate-300"
              } transition`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  (appState?.theme ?? "light") === "dark" ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </span>
          </button>
        </div>
        <div className="rounded-2xl surface-card border shadow-md ring-1 ring-accent-blue/10 p-4">
          <div className="flex flex-col gap-2">
            <DailyNotifications tempSettings={tempSettings} UpdateSettings={UpdateSettings} />
            {tempSettings.sendDailyReminders && (
              <div className="flex flex-col gap-2 rounded-xl border border-accent-blue/15 bg-accent-blue-50/40 px-3 py-3">
                <label className="text-sm font-semibold text-slate-700">Send Daily Time</label>
                <input
                  type="time"
                  value={tempSettings.sendDailyRemindersTime || "08:00"}
                  onChange={(e) => {
                    const newTime: string = e.target.value;
                    UpdateSettings({ sendDailyRemindersTime: newTime });
                    UpdateTime(newTime);
                  }}
                  className="w-fit rounded-lg border border-accent-blue/30 bg-white px-2 py-1 text-sm text-slate-800 shadow-inner focus:border-accent-blue focus:outline-none dark:[color-scheme:dark]"
                />
              </div>
            )}
            <div className="flex justify-start">
              <button
                type="button"
                className="rounded-lg bg-accent-blue text-white px-3 py-2 text-sm font-semibold shadow-sm shadow-accent-blue/30 hover:-translate-y-px transition"
                onClick={TestDaily}
              >
                Test
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl surface-card border shadow-md ring-1 ring-accent-blue/10 p-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Feedback</h2>
            <p className="text-sm text-slate-600">Spot an issue or have an idea? Drop us a note.</p>
            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-accent-blue/30 bg-white px-3 py-2 text-sm font-semibold text-accent-blue shadow-sm hover:-translate-y-px transition"
              onClick={() => window.open("mailto:sequenced@ottegi.com?subject=Sequenced%20Feedback", "_self")}
            >
              <span className="text-lg">✉️</span>
              Email sequenced@ottegi.com
            </button>
          </div>
        </div>

        <div className="rounded-2xl surface-card border shadow-md ring-1 ring-accent-blue/10 p-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Delete Completed Tasks</h2>
            <p className="text-sm text-slate-600">
              Remove completed tasks older than a selected window.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold text-slate-700">Interval</label>
              <select
                className="rounded-lg border border-accent-blue/30 bg-white px-2 py-1 text-sm shadow-inner focus:border-accent-blue focus:outline-none"
                value={cleanupInterval}
                onChange={(e) => setCleanupInterval(e.target.value)}
              >
                <option value="7">Older than 7 days</option>
                <option value="30">Older than 30 days</option>
                <option value="90">Older than 90 days</option>
                <option value="all">All completed tasks</option>
              </select>
              <span className="text-sm text-slate-600">
                {getCompletedTasks().length} ready to delete
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-red-500 text-white px-3 py-2 text-sm font-semibold shadow-sm hover:-translate-y-px transition disabled:opacity-60"
                onClick={handleCleanup}
                disabled={tasks.isLoading || tasks.isFetching}
              >
                Delete completed tasks
              </button>
              {tasks.isLoading && <span className="text-sm text-slate-500">Loading tasks...</span>}
            </div>
            {cleanupStatus && <span className="text-sm text-slate-600">{cleanupStatus}</span>}
          </div>
        </div>

        <div className="rounded-2xl surface-card border shadow-md ring-1 ring-accent-blue/10 p-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Support Sequenced</h2>
            <div className="flex flex-wrap gap-2">
              <a
                href="#review"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-accent-blue/30 bg-white px-3 py-2 text-sm font-semibold text-accent-blue shadow-sm hover:-translate-y-px transition"
                onClick={(e) => {
                  e.preventDefault();
                  openStoreReview();
                }}
              >
                <span className="text-lg"></span>
                Review on App Store
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl surface-card border shadow-md ring-1 ring-accent-blue/10 p-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Follow Ottegi</h2>
            <p className="text-sm text-slate-600">Stay up to date with releases and progress.</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://twitter.com/OttegiLLC"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-white px-3 py-2 text-sm font-semibold text-accent-blue shadow-sm hover:-translate-y-px transition"
                aria-label="Ottegi on X"
              >
                <img src={xIcon} alt="X logo" className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/OttegiLLC"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-white px-3 py-2 text-sm font-semibold text-accent-blue shadow-sm hover:-translate-y-px transition"
                aria-label="Ottegi on Instagram"
              >
                <img src={instagramIcon} alt="Instagram logo" className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/ottegi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-white px-3 py-2 text-sm font-semibold text-accent-blue shadow-sm hover:-translate-y-px transition"
                aria-label="Ottegi on LinkedIn"
              >
                <span className="text-sm font-semibold">in</span>
              </a>
              <a
                href="https://www.facebook.com/OttegiLLC"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-white px-3 py-2 text-sm font-semibold text-accent-blue shadow-sm hover:-translate-y-px transition"
                aria-label="Ottegi on Facebook"
              >
                <img src={facebookIcon} alt="Facebook logo" className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl surface-card border shadow-md ring-1 ring-accent-blue/10 p-4">
          <UserLogin />
        </div>

        <DeveloperSettings>
          <div className="rounded-2xl surface-card border shadow-md ring-1 ring-accent-blue/10 p-4">
            <ControllerUser />
          </div>
        </DeveloperSettings>
      </div>
    </div>
  );
}
