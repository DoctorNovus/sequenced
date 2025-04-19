import {
  cancelNotification,
  getPending,
  setDailyReminders,
} from "@/utils/notifs";

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

  return (
    <div className="flex flex-col w-full h-full px-2 py-4 gap-2 items-center">
      <div className="w-full justify-center text-center">
        <h1 className="text-2xl">Settings</h1>
      </div>
      <div className="w-3/4 py-2">
        <div className="flex flex-col gap-2">
          <DailyNotifications tempSettings={tempSettings} UpdateSettings={UpdateSettings} />
          <UserLogin />
          {tempSettings.sendDailyReminders && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-lg">Send Daily Time</label>
                <input
                  type="time"
                  value={tempSettings.sendDailyRemindersTime || "08:00"}
                  onChange={(e) => {
                    const newTime: string = e.target.value;
                    UpdateSettings({ sendDailyRemindersTime: newTime });
                    UpdateTime(newTime);
                  }}
                  className="text-accent-white bg-transparent border border-accent-white px-1 py-1 dark:[color-scheme:dark]"
                />
              </div>
              {/* <InputToggle
                title="Send Daily w/ 0 Tasks"
                defaultValue={tempSettings.sendDailyRemindersOverride}
                onChange={(val: boolean) =>
                  UpdateSettings({ sendDailyRemindersOverride: val })
                }
              /> */}
            </div>
          )}
          <DeveloperSettings>
            <ControllerUser />
          </DeveloperSettings>
        </div>
      </div>
    </div>
  );
}
