import { useMutation, useQuery, useQueryClient, UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { fetchData } from "@/utils/data";

export interface Announcement {
    id: string;
    title: string;
    body: string;
    date: string;
    ctaTitle?: string;
    ctaAction?: string;
    active: boolean;
    viewedBy?: Array<{
        id: string;
        first: string;
        last: string;
        email: string;
    } | string>;
    clickedBy?: Array<{
        id: string;
        first: string;
        last: string;
        email: string;
    } | string>;
}

export interface CreateAnnouncementInput {
    title: string;
    body: string;
    date?: string;
    ctaTitle?: string;
    ctaAction?: string;
    active?: boolean;
}

export interface UpdateAnnouncementInput extends Partial<CreateAnnouncementInput> {
    id: string;
}

async function getUnreadAnnouncements(): Promise<Announcement[]> {
    const response = await fetchData("/announcement", {});

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Unable to fetch announcements");
    }

    const data = await response.json().catch(() => []);
    return Array.isArray(data) ? data : [];
}

async function getAllAnnouncements(): Promise<Announcement[]> {
    const response = await fetchData("/announcement/all", {});

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Unable to fetch announcements");
    }

    const data = await response.json().catch(() => []);
    return Array.isArray(data) ? data : [];
}

async function markAnnouncementsRead(ids: string[]): Promise<void> {
    const response = await fetchData("/announcement/read", {
        method: "PATCH",
        body: { ids }
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Unable to mark announcement as read");
    }
}

async function createAnnouncement(input: CreateAnnouncementInput): Promise<Announcement> {
    const response = await fetchData("/announcement", {
        method: "POST",
        body: input
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.message || "Unable to create announcement");
    }

    return data as Announcement;
}

async function updateAnnouncement(input: UpdateAnnouncementInput): Promise<Announcement> {
    const { id, ...updates } = input;
    const response = await fetchData(`/announcement/${id}`, {
        method: "PATCH",
        body: updates
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.message || "Unable to update announcement");
    }

    return data as Announcement;
}

async function deleteAnnouncement(id: string): Promise<void> {
    const response = await fetchData(`/announcement/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Unable to delete announcement");
    }
}

async function trackAnnouncementView(id: string): Promise<void> {
    const response = await fetchData(`/announcement/${id}/view`, {
        method: "POST"
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Unable to track announcement view");
    }
}

async function trackAnnouncementClick(id: string): Promise<void> {
    const response = await fetchData(`/announcement/${id}/click`, {
        method: "POST"
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Unable to track announcement click");
    }
}

export function useUnreadAnnouncements(enabled = true): UseQueryResult<Announcement[]> {
    return useQuery({
        queryKey: ["announcements", "unread"],
        queryFn: getUnreadAnnouncements,
        staleTime: 1000 * 60 * 10,
        enabled
    });
}

export function useAllAnnouncements(enabled = true): UseQueryResult<Announcement[]> {
    return useQuery({
        queryKey: ["announcements", "all"],
        queryFn: getAllAnnouncements,
        staleTime: 1000 * 60 * 2,
        enabled
    });
}

export function useMarkAnnouncementsRead(): UseMutationResult<void, Error, string[]> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAnnouncementsRead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["announcements", "unread"] });
            await queryClient.invalidateQueries({ queryKey: ["user"] });
        }
    });
}

export function useCreateAnnouncement(): UseMutationResult<Announcement, Error, CreateAnnouncementInput> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAnnouncement,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["announcements", "all"] });
            await queryClient.invalidateQueries({ queryKey: ["announcements", "unread"] });
        }
    });
}

export function useUpdateAnnouncement(): UseMutationResult<Announcement, Error, UpdateAnnouncementInput> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAnnouncement,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["announcements", "all"] });
            await queryClient.invalidateQueries({ queryKey: ["announcements", "unread"] });
        }
    });
}

export function useDeleteAnnouncement(): UseMutationResult<void, Error, string> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAnnouncement,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["announcements", "all"] });
            await queryClient.invalidateQueries({ queryKey: ["announcements", "unread"] });
        }
    });
}

export function useTrackAnnouncementView(): UseMutationResult<void, Error, string> {
    return useMutation({
        mutationFn: trackAnnouncementView
    });
}

export function useTrackAnnouncementClick(): UseMutationResult<void, Error, string> {
    return useMutation({
        mutationFn: trackAnnouncementClick
    });
}
