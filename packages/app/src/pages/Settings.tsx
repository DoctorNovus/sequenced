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

export default function SettingsPage() {
  const [tempSettings, setTempSettings] = useState<Settings>({});

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
    <div className="flex flex-col w-full h-full px-3 md:px-6 lg:px-10 py-4 gap-4 items-center">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-600">Control reminders, account status, and other settings.</p>
        </div>
      </div>
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <div className="rounded-2xl bg-white/90 shadow-md ring-1 ring-accent-blue/10 p-4">
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

        <div className="rounded-2xl bg-white/90 shadow-md ring-1 ring-accent-blue/10 p-4">
          <UserLogin />
        </div>

        <div className="rounded-2xl bg-white/90 shadow-md ring-1 ring-accent-blue/10 p-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Support Sequenced</h2>
            <p className="text-sm text-slate-600">
              I want to keep Sequenced free for everyone. If you’d like to help, consider a Ko-fi donation.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://ko-fi.com/DoctorNovus"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-gradient-to-r from-accent-blue-700 to-accent-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-accent-blue/30 hover:-translate-y-px transition"
              >
                <span className="text-lg">☕</span>
                Donate on Ko-fi
              </a>
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

        <div className="rounded-2xl bg-white/90 shadow-md ring-1 ring-accent-blue/10 p-4">
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
                <span className="text-lg">𝕏</span>
              </a>
              <a
                href="https://www.instagram.com/OttegiLLC"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-white px-3 py-2 text-sm font-semibold text-accent-blue shadow-sm hover:-translate-y-px transition"
                aria-label="Ottegi on Instagram"
              >
                <span className="text-lg">📸</span>
              </a>
              <a
                href="https://www.linkedin.com/company/ottegi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-white px-3 py-2 text-sm font-semibold text-accent-blue shadow-sm hover:-translate-y-px transition"
                aria-label="Ottegi on LinkedIn"
              >
                <span className="text-lg">in</span>
              </a>
              <a
                href="https://www.facebook.com/OttegiLLC"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-white px-3 py-2 text-sm font-semibold text-accent-blue shadow-sm hover:-translate-y-px transition"
                aria-label="Ottegi on Facebook"
              >
                <span className="text-lg">f</span>
              </a>
            </div>
          </div>
        </div>

        <DeveloperSettings>
          <div className="rounded-2xl bg-white/90 shadow-md ring-1 ring-accent-blue/10 p-4">
            <ControllerUser />
          </div>
        </DeveloperSettings>
      </div>
    </div>
  );
}
