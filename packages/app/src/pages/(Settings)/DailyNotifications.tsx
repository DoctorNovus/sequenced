import InputToggle from "@/components/inputs/InputToggle";
import { Settings } from "@/hooks/settings";

type DailyNotificationsProps = {
    tempSettings: Partial<Settings>;
    UpdateSettings: (value: Partial<Settings>) => void;
};

export default function DailyNotifications({ tempSettings, UpdateSettings }: DailyNotificationsProps) {
    return (
        <InputToggle
            title="Daily Notifications"
            defaultValue={tempSettings.sendDailyReminders}
            onChange={(val: boolean) =>
                UpdateSettings({ sendDailyReminders: val })
            }
        />
    )
}
