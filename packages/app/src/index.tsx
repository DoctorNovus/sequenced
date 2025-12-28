import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

// Pages
import Home from "./pages/Home";
import Meds from "./pages/Meds";
import Mood from "./pages/Mood";
import Task from "@/pages/Task";
import Settings from "./pages/Settings";
import Calendar from "./pages/Calendar";
import Layout from "@/pages/Layout";
import NoPage from "@/pages/NoPage";
import Login from "@/pages/Auth/Login";
import LoginUser from "@/pages/Auth/LoginUser";
import RegisterUser from "@/pages/Auth/RegisterUser";
import ForgotPassword from "@/pages/Auth/ForgotPassword";

// Styles
import "./index.css";

import { initializeAdMob } from "@/utils/ads";
import { initializeNotifications } from "@/utils/notifs";

import { AppContext, useAppReducer } from "@/hooks/app";
import AuthProvider from "./pages/Auth/AuthProvider";

/* define the query client for react-query */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// TODO: remove tempActiveDate.

export default function App() {
  const reducer = useAppReducer();
  const [appState] = reducer;

  useEffect(() => {
    const updateThemeMeta = (theme: "light" | "dark") => {
      const themeMeta = document.querySelector<HTMLMetaElement>("#theme-color");
      const statusBar = document.querySelector<HTMLMetaElement>("#status-bar-style");

      if (statusBar) {
        statusBar.content = theme === "dark" ? "black" : "default";
      }

      if (themeMeta) {
        themeMeta.content = theme === "dark" ? "#0b0f14" : "#f7f9fb";
      }
    };

    const updateStatusBar = async (theme: "light" | "dark") => {
      if (Capacitor.getPlatform() !== "ios") return;
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: theme === "dark" ? "#0b0f14" : "#f7f9fb" });
        // Style.Dark = light text for dark backgrounds, Style.Light = dark text for light backgrounds
        await StatusBar.setStyle({ style: theme === "dark" ? Style.Dark : Style.Light });
      } catch (err) {
        console.warn("Failed to update native status bar", err);
      }
    };

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const resolveTheme = () => {
      if (appState?.theme === "auto") {
        return media?.matches ? "dark" : "light";
      }
      return appState?.theme === "dark" ? "dark" : "light";
    };

    const appliedTheme = resolveTheme();
    document.documentElement.classList.toggle("dark", appliedTheme === "dark");
    document.documentElement.setAttribute("data-theme", appliedTheme);
    updateThemeMeta(appliedTheme);
    updateStatusBar(appliedTheme);
    try {
      window.localStorage.setItem("sequenced-theme", appState?.theme ?? "light");
    } catch (err) {
      console.warn("Failed to persist theme preference", err);
    }

    if (appState?.theme === "auto" && media?.addEventListener) {
      const listener = () => {
        const next = resolveTheme();
        document.documentElement.classList.toggle("dark", next === "dark");
        document.documentElement.setAttribute("data-theme", next);
        updateThemeMeta(next);
        updateStatusBar(next);
      };
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [appState?.theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={reducer}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>


              <Route index element={<Home />} />
              <Route path="/tasks" element={<Task />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />}></Route>
              <Route path="*" element={<NoPage />} />

            </Route>
            <Route path="/auth" element={<Login />} />
            <Route path="/auth/login" element={<LoginUser />} />
            <Route path="/auth/register" element={<RegisterUser />} />
            <Route path="/auth/forgotPassword" element={<ForgotPassword />} />
          </Routes>
        </BrowserRouter>
      </AppContext.Provider>
    </QueryClientProvider>
  );
}

async function initialize() {
  // await initializeAdMob();
  await initializeNotifications();
}

createRoot(document.querySelector("#root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

initialize().catch((error) => console.error(error));
