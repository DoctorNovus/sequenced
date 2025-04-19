import { QueryClient, UseQueryResult, useQuery } from "@tanstack/react-query";
import { fetchData } from "@/utils/data";
import { User } from "@backend/user/user.entity";

async function getUser(): Promise<User> {
    const response = await fetchData("/user", {});
    return await response.json();
}

export async function updateName(first: string, last: string): Promise<void> {
    await fetchData("/user/name", {
        method: "PATCH",
        body: {
            first, last
        }
    })
}

export function useUser(): UseQueryResult<User> {
    return useQuery({
        queryKey: ["user"],
        queryFn: getUser,
        staleTime: Infinity
    });
}

export function reloadUser(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({ queryKey: ["user"] });
}

export function reloadToken(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({ queryKey: ["token"] });
}