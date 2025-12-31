import { createContext, useContext, useReducer } from "react";
import { Logger } from "@/utils/logger";

import { Task } from "./tasks";


// Allow docker / hosted environments to inject an API base URL at build time.
export const SERVER_IP = import.meta.env.DEV ? `http://localhost:8080` : `https://api.sequenced.ottegi.com`;

Logger.log(`Running in ${import.meta.env.DEV ? "Development" : "Production"} mode.`);

// TODO: remove tempActiveDate.
type ThemeChoice = "light" | "dark" | "auto";

export interface AppOptions {
  storedDate?: Date;
  activeDate?: Date;
  tempActiveDate?: Date;
  activeTask?: Task;
  activeTags?: string[];

  theme?: ThemeChoice;

  authorized: boolean;
}

const initialData: AppOptions = {
  storedDate: undefined,
  activeDate: new Date(),
  tempActiveDate: undefined,
  activeTask: undefined,
  activeTags: [],

  theme: "auto",
  authorized: false
};

const reducer = (data: AppOptions, payload: Partial<AppOptions>): AppOptions => ({ ...data, ...payload });

export function useAppReducer(): [AppOptions, React.Dispatch<Partial<AppOptions>>] {
  const initializer = () => {
    let theme = initialData.theme;

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("sequenced-theme");
      if (stored === "light" || stored === "dark" || stored === "auto") {
        theme = stored;
      } else {
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
        theme = prefersDark ? "dark" : "light";
      }
    }

    return { ...initialData, theme };
  };

  return useReducer(reducer, initialData, initializer);
}

export const AppContext = createContext<[AppOptions, React.Dispatch<Partial<AppOptions>>] | null>(null);

export function useApp(): [AppOptions, React.Dispatch<Partial<AppOptions>>] {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("AppContext must have it's provider initialized before useApp() is called.");
  }

  return context;
}