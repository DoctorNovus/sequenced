import { QueryClient, UseMutationResult, UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData } from "@/utils/data";
import { User } from "@backend/user/user.entity";

async function getUser(): Promise<User> {
    const response = await fetchData("/user", {});
    return await response.json();
}

export async function updateProfile(data: Partial<Pick<User, "first" | "last" | "email">>): Promise<void> {
    const response = await fetchData("/user", {
        method: "PATCH",
        body: data
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Unable to update profile");
    }
}

export async function updateName(first: string, last: string): Promise<void> {
    return updateProfile({ first, last });
}

export function useUser(): UseQueryResult<User> {
    return useQuery({
        queryKey: ["user"],
        queryFn: getUser,
        staleTime: Infinity
    });
}

export function useUpdateProfile(): UseMutationResult<void, Error, Partial<Pick<User, "first" | "last" | "email">>> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: () => reloadUser(queryClient)
    });
}

export function useChangePassword(): UseMutationResult<void, Error, { currentPassword: string; newPassword: string }> {
    return useMutation({
        mutationFn: async (body) => {
            const response = await fetchData("/user/password", {
                method: "PATCH",
                body
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.message || "Unable to update password");
            }
        }
    });
}

export async function exportUserData(): Promise<{ user: User | null; tasks: any[] }> {
    const response = await fetchData("/user/export", {});
    return await response.json();
}

export function useExportUserData(): UseMutationResult<{ user: User | null; tasks: any[] }> {
    return useMutation({
        mutationFn: exportUserData
    });
}

export async function requestUserDeletion(): Promise<{ deletedUser: boolean; removedFromTasks: number; deletedTasks: number }> {
    const response = await fetchData("/user/delete", {
        method: "POST"
    });
    return await response.json();
}

export function useRequestUserDeletion(): UseMutationResult<{ deletedUser: boolean; removedFromTasks: number; deletedTasks: number }> {
    return useMutation({
        mutationFn: requestUserDeletion
    });
}

export function reloadUser(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({ queryKey: ["user"] });
}

export function reloadToken(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({ queryKey: ["token"] });
}
