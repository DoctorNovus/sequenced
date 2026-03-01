import { UseMutationResult, UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData } from "@/utils/data";
import { Capacitor } from "@capacitor/core";
import { SecureToken } from "@/plugins/secureToken";

export interface NotificationPreference {
    id?: string;
    pushEnabled: boolean;
    remindersEnabled: boolean;
    summaryCadence: "off" | "daily" | "weekly";
    summaryTime: string;
    weeklyDay: number;
    utcOffsetMinutes: number;
}

export interface PendingServerNotification {
    id: string;
    title: string;
    body: string;
    ctaAction?: string;
    type: string;
    scheduledFor: string;
}

export interface DeveloperSendInput {
    to: "user" | "all";
    targetUserId?: string;
    title: string;
    body: string;
    ctaAction?: string;
    scheduledFor?: string;
    confirm: boolean;
}

async function fetchNotificationData(path: string, options: { method?: string; body?: unknown } = {}) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };

    if (Capacitor.getPlatform() !== "web") {
        const token = await SecureToken.getToken()
            .then((value) => value?.token || "")
            .catch(() => "");
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    return fetchData(path, {
        ...options,
        headers
    });
}

export interface NotificationQueueStatus {
    dueNow: number;
    upcoming: number;
    totalUndelivered: number;
    nextScheduledFor?: string | null;
}

async function getNotificationPreferences(): Promise<NotificationPreference> {
    const response = await fetchNotificationData("/notification/preferences");
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.message || "Unable to load notification preferences");
    }

    return {
        pushEnabled: Boolean(data?.pushEnabled ?? true),
        remindersEnabled: Boolean(data?.remindersEnabled ?? true),
        summaryCadence: ["off", "daily", "weekly"].includes(data?.summaryCadence) ? data.summaryCadence : "daily",
        summaryTime: typeof data?.summaryTime === "string" ? data.summaryTime : "08:00",
        weeklyDay: typeof data?.weeklyDay === "number" ? data.weeklyDay : 1,
        utcOffsetMinutes: typeof data?.utcOffsetMinutes === "number" ? data.utcOffsetMinutes : new Date().getTimezoneOffset()
    };
}

async function updateNotificationPreferences(data: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const response = await fetchNotificationData("/notification/preferences", {
        method: "PATCH",
        body: data
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload?.message || "Unable to update notification preferences");
    }

    return payload as NotificationPreference;
}

export async function pullPendingServerNotifications(): Promise<PendingServerNotification[]> {
    const response = await fetchNotificationData("/notification/pending");
    const data = await response.json().catch(() => []);

    if (!response.ok) {
        throw new Error(data?.message || "Unable to fetch pending notifications");
    }

    return Array.isArray(data) ? data : [];
}

export async function acknowledgeDeliveredNotifications(ids: string[]): Promise<number> {
    const response = await fetchNotificationData("/notification/ack", {
        method: "POST",
        body: { ids }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.message || "Unable to acknowledge delivered notifications");
    }
    return Number(data?.acknowledged ?? 0);
}

export async function getNotificationQueueStatus(): Promise<NotificationQueueStatus> {
    const response = await fetchNotificationData("/notification/status");
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.message || "Unable to load notification queue status");
    }

    return {
        dueNow: Number(data?.dueNow ?? 0),
        upcoming: Number(data?.upcoming ?? 0),
        totalUndelivered: Number(data?.totalUndelivered ?? 0),
        nextScheduledFor: data?.nextScheduledFor ?? null
    };
}

async function developerSendNotification(input: DeveloperSendInput): Promise<{ count: number }> {
    const response = await fetchNotificationData("/notification/developer/send", {
        method: "POST",
        body: input
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.message || "Unable to send notification");
    }

    return { count: Number(data?.count ?? 0) };
}

export function useNotificationPreferences(): UseQueryResult<NotificationPreference> {
    return useQuery({
        queryKey: ["notification", "preferences"],
        queryFn: getNotificationPreferences,
        staleTime: 1000 * 60 * 5
    });
}

export function useUpdateNotificationPreferences(): UseMutationResult<NotificationPreference, Error, Partial<NotificationPreference>> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateNotificationPreferences,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["notification", "preferences"] });
        }
    });
}

export function useDeveloperSendNotification(): UseMutationResult<{ count: number }, Error, DeveloperSendInput> {
    return useMutation({ mutationFn: developerSendNotification });
}
