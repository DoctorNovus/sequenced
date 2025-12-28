import {
  cancelNotification,
  getPending,
  setDailyReminders,
  scheduleNotification,
} from "@/utils/notifs";
import { Settings, getSettings, setSettings } from "@/hooks/settings";
import { PendingLocalNotificationSchema } from "@capacitor/local-notifications";
import { useEffect, useState, FormEvent } from "react";
import DailyNotifications from "./(Settings)/DailyNotifications";
import UserLogin from "./(Settings)/UserLogin";
import { Logger } from "@/utils/logger";
import DeveloperSettings from "./(Settings)/DeveloperSettings";
import ControllerUser from "./(Settings)/ControlledUser";
import { useTasks, useDeleteTask } from "@/hooks/tasks";
import xIcon from "@/assets/social_icons/x.svg";
import instagramIcon from "@/assets/social_icons/instagram.svg";
import facebookIcon from "@/assets/social_icons/facebook.svg";
import discordIcon from "@/assets/social_icons/discord.svg";
import { useApp } from "@/hooks/app";
import { useChangePassword, useExportUserData, useRequestUserDeletion, useUpdateProfile, useUser } from "@/hooks/user";
import { getTodayNotificationBody } from "@/utils/notifs";
import { fetchData } from "@/utils/data";
import { StarIcon } from "@heroicons/react/24/solid";

export default function SettingsPage() {
  const [tempSettings, setTempSettings] = useState<Settings>({});
  const tasks = useTasks();
  const { mutateAsync: deleteTask } = useDeleteTask();
  const [cleanupInterval, setCleanupInterval] = useState<string>("30");
  const [cleanupStatus, setCleanupStatus] = useState<string>("");
  const [appState, setAppState] = useApp();
  const user = useUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const exportUserData = useExportUserData();
  const requestUserDeletion = useRequestUserDeletion();
  const [profileForm, setProfileForm] = useState({ first: "", last: "", email: "" });
  const [profileMessage, setProfileMessage] = useState<string>("");
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [passwordMessage, setPasswordMessage] = useState<string>("");
  const [dataMessage, setDataMessage] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteInput, setDeleteInput] = useState<string>("");
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewMessage, setReviewMessage] = useState<string>("");
  const [reviewStatus, setReviewStatus] = useState<string>("");

  useEffect(() => {
    getSettings().then(async (tempSettings) => {
      setTempSettings(tempSettings);
    });
  }, []);

  useEffect(() => {
    if (user.isSuccess && user.data) {
      setProfileForm({
        first: user.data.first || "",
        last: user.data.last || "",
        email: user.data.email || ""
      });
    }
  }, [user.isSuccess, user.data]);

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

  const setTheme = (next: "light" | "dark" | "auto") => {
    setAppState({ ...appState, theme: next });
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMessage("");
    try {
      await updateProfile.mutateAsync(profileForm);
      setProfileMessage("Profile updated.");
    } catch (err: any) {
      setProfileMessage(err?.message || "Unable to update profile.");
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    setPasswordMessage("");
    try {
      await changePassword.mutateAsync({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next
      });
      setPasswordMessage("Password updated.");
      setPasswordForm({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      setPasswordMessage(err?.message || "Unable to update password.");
    }
  };

  const handleDownloadData = async () => {
    setDataMessage("");
    try {
      const data = await exportUserData.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sequenced-account-data.json";
      link.click();
      URL.revokeObjectURL(url);
      setDataMessage("Download started.");
    } catch (err: any) {
      setDataMessage(err?.message || "Unable to download data.");
    }
  };

  const handleDeleteData = async () => {
    setDataMessage("");
    if (deleteInput.trim().toUpperCase() !== "DELETE") {
      setDataMessage("Type DELETE to confirm.");
      return;
    }
    try {
      const resp = await requestUserDeletion.mutateAsync();
      setDataMessage(
        `Deletion requested. Removed from ${resp.removedFromTasks} tasks; deleted ${resp.deletedTasks} tasks. This cannot be undone.`
      );
      setShowDeleteConfirm(false);
      setDeleteInput("");
      await fetchData("/auth/logout", { method: "POST" });
      window.location.href = "/auth";
    } catch (err: any) {
      setDataMessage(err?.message || "Unable to process deletion.");
    }
  };

  const TestDaily = async () => {
    const fireAt = new Date(Date.now());
    const body = await getTodayNotificationBody();
    await scheduleNotification({
      id: Math.floor(Math.random() * 2147483647),
      title: "Sequenced: Test Reminder",
      body,
      schedule: { at: fireAt },
    });
    Logger.log("Scheduled test notification for", fireAt.toISOString());
  };

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    setReviewStatus("");
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewStatus("Please pick a rating between 1 and 5 stars.");
      return;
    }
    try {
      await fetchData("/review", {
        method: "POST",
        body: { rating: reviewRating, message: reviewMessage.trim() }
      });
      setReviewStatus("Thanks for your feedback!");
      setReviewMessage("");
      setReviewRating(5);
    } catch (err: any) {
      setReviewStatus(err?.message || "Unable to submit review right now.");
    }
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
        <div className="rounded-2xl surface-card border ring-1 ring-accent-blue/10 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-primary">Profile</h2>
              <p className="text-sm text-muted">Manage your account details and privacy.</p>
              {user.isSuccess && user.data?.lastLoggedIn && (
                <span className="text-xs font-semibold text-primary">
                  Last logged in: {new Date(user.data.lastLoggedIn).toLocaleString()}
                </span>
              )}
            </div>
            {user.isLoading && <span className="text-xs text-muted">Loading...</span>}
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleProfileSubmit}>
            <label className="flex flex-col gap-1 text-sm text-primary">
              First name
              <input
                type="text"
                value={profileForm.first}
                onChange={(e) => setProfileForm({ ...profileForm, first: e.target.value })}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-accent-blue focus:outline-none dark:border-slate-700 dark:bg-slate-900/70"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-primary">
              Last name
              <input
                type="text"
                value={profileForm.last}
                onChange={(e) => setProfileForm({ ...profileForm, last: e.target.value })}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-accent-blue focus:outline-none dark:border-slate-700 dark:bg-slate-900/70"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-primary md:col-span-2">
              Email
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-accent-blue focus:outline-none dark:border-slate-700 dark:bg-slate-900/70"
              />
            </label>
            <div className="flex items-center gap-2 md:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-accent-blue px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-accent-blue/30 hover:-translate-y-px transition disabled:opacity-70"
                disabled={updateProfile.isPending || user.isLoading}
              >
                {updateProfile.isPending ? "Saving..." : "Save changes"}
              </button>
              {profileMessage && <span className="text-sm text-muted">{profileMessage}</span>}
            </div>
          </form>
          <div className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/40">
            <button
              type="button"
              onClick={() => setShowChangePassword((prev) => !prev)}
              className="flex w-full items-center justify-between text-left"
            >
              <h3 className="text-sm font-semibold text-primary">Change password</h3>
              <span className="text-xs font-semibold text-accent-blue">
                {showChangePassword ? "Hide" : "Show"}
              </span>
            </button>

            {showChangePassword && (
              <form className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handlePasswordSubmit}>
                <label className="flex flex-col gap-1 text-sm text-primary">
                  Current
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-accent-blue focus:outline-none dark:border-slate-700 dark:bg-slate-900/70"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-primary">
                  New
                  <input
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-accent-blue focus:outline-none dark:border-slate-700 dark:bg-slate-900/70"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-primary">
                  Confirm
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-accent-blue focus:outline-none dark:border-slate-700 dark:bg-slate-900/70"
                  />
                </label>
                <div className="flex items-center gap-2 md:col-span-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-accent-blue px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-accent-blue/30 hover:-translate-y-px transition disabled:opacity-70"
                    disabled={changePassword.isPending}
                  >
                    {changePassword.isPending ? "Updating..." : "Update password"}
                  </button>
                  {passwordMessage && <span className="text-sm text-muted">{passwordMessage}</span>}
                </div>
              </form>
            )}
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/50">
            <h3 className="text-sm font-semibold text-primary mb-2 dark:text-white">Privacy</h3>
            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                onClick={handleDownloadData}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-primary shadow-sm hover:-translate-y-px transition dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                disabled={exportUserData.isPending}
              >
                {exportUserData.isPending ? "Preparing..." : "Download my data"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm((prev) => !prev);
                  setDataMessage("");
                }}
                className="rounded-lg border border-red-400 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm hover:-translate-y-px transition dark:border-red-500/60 dark:bg-red-500/15 dark:text-red-100"
              >
                {showDeleteConfirm ? "Cancel" : "Confirm deletion"}
              </button>
              {showDeleteConfirm && (
                <div className="w-full rounded-xl border border-red-200/70 bg-red-50/70 p-3 text-left shadow-sm dark:border-red-500/50 dark:bg-red-500/10">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-100">
                    This will permanently delete all of your Sequenced data (tasks, tags, account). There is no way to recover it.
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    <label className="text-xs font-semibold text-primary dark:text-white">Type DELETE to confirm</label>
                    <input
                      type="text"
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder="DELETE"
                      className="w-full rounded-lg border border-red-300 bg-white px-2 py-2 text-sm shadow-inner focus:border-red-500 focus:outline-none dark:border-red-500/60 dark:bg-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleDeleteData}
                      className="self-start rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-red-400/40 hover:-translate-y-px transition disabled:opacity-70"
                      disabled={requestUserDeletion.isPending}
                    >
                      {requestUserDeletion.isPending ? "Deleting..." : "Delete everything"}
                    </button>
                  </div>
                </div>
              )}
              {dataMessage && <span className="text-sm text-muted">{dataMessage}</span>}
            </div>
          </div>
        </div>

        <div className="rounded-2xl surface-card border ring-1 ring-accent-blue/10 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-primary">Appearance</h2>
              <p className="text-sm text-muted">Choose light, dark, or follow your device.</p>
            </div>
            <span className="text-xs rounded-full bg-accent-blue-50 px-2 py-1 text-accent-blue-700 dark:bg-[rgba(48,122,207,0.14)] dark:text-primary">
              {(appState?.theme ?? "auto") === "auto" ? "Automatic" : (appState?.theme ?? "Light")}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "light", label: "Light", desc: "Bright surfaces" },
              { id: "dark", label: "Dark", desc: "Dimmed, low-glare" },
              { id: "auto", label: "Auto", desc: "Match device" },
            ].map((opt) => {
              const isActive = (appState?.theme ?? "auto") === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id as "light" | "dark" | "auto")}
                  className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition shadow-sm ${
                    isActive
                      ? "border-accent-blue/50 ring-1 ring-accent-blue/30 shadow-md"
                      : "border-slate-200/70 dark:border-slate-600/50 hover:border-accent-blue/40"
                  }`}
                >
                  <span
                    className={`inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border ${
                      opt.id === "light"
                        ? "bg-gradient-to-br from-white to-slate-100 text-slate-700"
                        : opt.id === "dark"
                          ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white"
                          : "bg-gradient-to-br from-slate-200 to-slate-800 text-white"
                    } ${isActive ? "border-accent-blue/40" : "border-transparent"}`}
                  >
                    {opt.id === "auto" ? "A" : opt.label[0]}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-primary">{opt.label}</span>
                    <span className="text-xs text-muted">{opt.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
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
            <p className="text-sm text-slate-600">Share a quick rating or leave us a note.</p>
            <form className="flex flex-col gap-3" onSubmit={submitReview}>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-semibold text-primary">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const isActive = reviewRating >= value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                        onClick={() => setReviewRating(value)}
                        className="rounded-full p-1 transition hover:scale-105"
                      >
                        <StarIcon
                          className={`h-6 w-6 ${isActive ? "text-amber-400" : "text-slate-300"}`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-muted">Tap to set 1-5 stars.</span>
              </div>
              <label className="flex flex-col gap-1 text-sm text-primary">
                Optional message
                <textarea
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  rows={3}
                  placeholder="What’s working well? What should we improve?"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-accent-blue focus:outline-none dark:border-slate-700 dark:bg-slate-900/70"
                />
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-accent-blue px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-accent-blue/30 hover:-translate-y-px transition disabled:opacity-70"
                  disabled={reviewRating < 1 || reviewRating > 5}
                >
                  Send review
                </button>
                {reviewStatus && <span className="text-sm text-muted">{reviewStatus}</span>}
              </div>
            </form>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-primary">Prefer email?</span>
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
            <h2 className="text-lg font-semibold text-slate-900">Follow Ottegi</h2>
            <p className="text-sm text-slate-600">Stay up to date with releases and progress.</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://discord.gg/qeKgAKVhXa"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-white px-3 py-2 text-sm font-semibold text-accent-blue shadow-sm hover:-translate-y-px transition"
                aria-label="Ottegi on Discord"
              >
                <img src={discordIcon} alt="Discord logo" className="h-5 w-5" />
              </a>
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
