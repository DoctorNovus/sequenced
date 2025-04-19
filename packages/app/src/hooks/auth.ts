import { useMutation, useQuery } from "@tanstack/react-query";
import { reloadUser } from "./user";
import { queryClient } from "..";
import { fetchData } from "@/utils/data";
import { Logger } from "@/utils/logger";

export async function reloadAuth() {
    await queryClient.invalidateQueries({ queryKey: ['auth'] });
}

export async function getAuth() {
    return await (await fetchData("/auth", {})).json();
}

export function useAuth() {
    return useQuery({
        queryKey: ['auth'],
        queryFn: getAuth,
        staleTime: 1000 * 60 * 60 * 30
    });
}

export function useLogin() {
    return useMutation({
        mutationFn: async (body: { email: string, password: string }) => {
            const response = await fetchData("/auth/login", {
                method: "POST",
                body
            });

            if (!response.ok)
                return await response.json();

            if (response.ok){
                reloadUser(queryClient);
                reloadAuth();
            }
        }
    })
}

export function useRegister() {
    return useMutation({
        mutationFn: async (body: { email: string, password: string, confirm_password: string }) => {
            const response = await fetchData("/auth/register", {
                method: "POST",
                body
            });

            const data = await response.json();

            if (data.type == "ERROR") {
                return data.message;
            }

            reloadUser(queryClient);

            return data;
        }
    })
}

export async function signout() {
    queryClient.invalidateQueries({ queryKey: ["auth"] });
    queryClient.invalidateQueries({ queryKey: ["user"] });

    Logger.log("User Signed Out.");
}