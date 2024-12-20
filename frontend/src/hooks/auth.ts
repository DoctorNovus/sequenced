import { useMutation } from "@tanstack/react-query";
import { getToken, reloadUser } from "./user";
import { Preferences } from "@capacitor/preferences";
import { queryClient } from "..";

import { SERVER_IP } from "./app";

export async function fetchServer({ path, method, options, body, token, full }) {
    let headers = {
        "Content-Type": "application/json",
    }

    if (token)
        headers = Object.assign(headers, { "Authorization": `Bearer ${token}` });
    else
        headers = Object.assign(headers, { "Authorization": `Bearer ${await getToken()}` })

    const response = await fetch(`${SERVER_IP}${path}`, {
        method: method ?? "GET",
        body: JSON.stringify(body),
        headers,
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        if (full) {
            console.log(`[ERROR] ${data.message}`);
            return { type: "ERROR", message: data.message };
        }

        throw new Error(data.message);
    }

    if (response.status == 401) {
        console.log("NOT AUTHORIZED");
        await Preferences.remove({ key: "token" });
    }

    return data;
}

export function useLogin() {
    return useMutation({
        mutationFn: async (body: { email: string, password: string }) => {
            const data = await fetchServer({
                path: "/auth/login",
                method: "POST",
                body,
                full: true
            });

            if (data.type == "ERROR") {
                return data.message;
            }

            console.log(`Token set to ${data.token.token}`);

            await Preferences.set({ key: "token", value: data.token.token });
            
            reloadUser(queryClient);

            return data;
        }
    })
}

export function useRegister() {
    return useMutation({
        mutationFn: async (body: { email: string, password: string, confirm_password: string }) => {
            const data = await fetchServer({
                path: "/auth/register",
                method: "POST",
                body,
                full: true
            });

            if (data.type == "ERROR") {
                return data.message;
            }

            await Preferences.set({ key: "token", value: data.token.token });

            console.log(`Token set to ${data.token.token}`);

            reloadUser(queryClient);

            return data;
        }
    })
}

export async function signout() {
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.invalidateQueries({ queryKey: ["token"] });

    await Preferences.remove({ key: "token" });

    console.log("User Signed Out");
}