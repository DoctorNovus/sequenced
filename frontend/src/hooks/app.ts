import { createContext, useContext, useReducer } from "react";
import { Task } from "./tasks";

export const AppContext = createContext(null);

export const SERVER_IP = process.env.NODE_ENV == "development" ? `http://localhost:8080` : `https://api.sequenced.ottegi.com`;
console.log("Running in ", process.env.NODE_ENV, " mode");

// TODO: remove tempActiveDate.
export interface AppOptions {
  activeDate?: Date;
  tempActiveDate?: Date;
  activeTask?: Task;
  activeParent?: Task;
}

const initialData: AppOptions = {
  activeDate: new Date(),
  tempActiveDate: undefined,
  activeTask: undefined,
  activeParent: undefined,
};

const reducer = (data: Record<string, any>, payload: Record<string, any>) => ({
  ...data,
  ...payload,
});

export function useAppReducer() {
  return useReducer(reducer, initialData);
}

export function useApp(): Iterator<AppOptions> | null {
  return useContext(AppContext);
}
