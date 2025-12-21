import { createContext, useContext, useReducer } from "react";
import { Logger } from "@/utils/logger";

import { Task } from "./tasks";

export const AppContext = createContext(null);

// Allow docker / hosted environments to inject an API base URL at build time.
export const SERVER_IP = process.env.NODE_ENV == "development" ? `http://localhost:8080` : `https://api.sequenced.ottegi.com`;

Logger.log(`Running in ${process.env.NODE_ENV} mode.`);

// TODO: remove tempActiveDate.
type ThemeChoice = "light" | "dark" | "auto";

export interface AppOptions {
  activeDate?: Date;
  tempActiveDate?: Date;
  activeTask?: Task;
  activeTags?: string[];

  theme?: ThemeChoice;

  authorized: false;
}

const initialData: AppOptions = {
  activeDate: new Date(),
  tempActiveDate: undefined,
  activeTask: undefined,
  activeTags: [],

  theme: "auto",
  authorized: false
};

const reducer = (data: Record<string, any>, payload: Record<string, any>) => ({
  ...data,
  ...payload,
});

export function useAppReducer() {
  const initializer = () => {
    let theme: ThemeChoice = initialData.theme;

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

export function useApp(): Iterator<AppOptions> | null {
  return useContext(AppContext);
}
