import InputToggle from "@/components/inputs/InputToggle";
import { formatDateTime } from "@/utils/date";
import { Settings } from "@/hooks/settings";

export default function DailyNotifications(tempSettings, UpdateSettings) {
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