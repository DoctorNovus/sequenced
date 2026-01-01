import AddIcon from "../Icons/AddIcon";
import HomeIcon from "../Icons/HomeIcon";
import SettingsIcon from "../Icons/SettingsIcon";
import { useState } from "react";
import TaskInfoMenu from "../TaskInfoMenu";
import TasksIcon from "../Icons/TasksIcon";
import NavItem from "./NavItem";
import { useAuth } from "@/hooks/auth";
import CalendarViewIcon from "../Icons/CalendarViewIcon";

export function NavBar() {
  const auth = useAuth();

  const [isAdding, setIsAdding] = useState(false);

  const renderMobileBar = (isInteractive: boolean) => (
    <div className="pointer-events-none fixed inset-x-0 bottom-[env(safe-area-inset-bottom)] z-40 flex justify-center px-4 md:hidden">
      <div className="pointer-events-auto nav-pad w-full max-w-2xl h-19 rounded-3xl border ring-0 bg-(--surface-card) border-(--nav-border) backdrop-blur-xl shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="relative flex h-full items-center justify-between px-3 py-3">
          <div className="flex flex-1 items-center justify-evenly gap-2">
            <NavItem to="/" title="Home">
              <HomeIcon />
            </NavItem>
            <NavItem to="/tasks" title="Tasks">
              <TasksIcon />
            </NavItem>
          </div>

          <div className="flex flex-none items-center justify-center px-2">
            <button
              disabled={!isInteractive}
              onClick={isInteractive ? () => setIsAdding(true) : undefined}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-accent-blue-700 to-accent-blue-500 text-white shadow-lg shadow-accent-blue/25 ring-1 ring-white transition hover:-translate-y-1 hover:scale-[1.05] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex justify-center items-center w-full h-full p-2 fill-current">
                <AddIcon />
              </div>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-evenly gap-2">
            <NavItem to="/calendar" title="Calendar">
              <CalendarViewIcon />
            </NavItem>
            <NavItem to="/settings" title="Settings">
              <SettingsIcon />
            </NavItem>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDesktopBar = (isInteractive: boolean) => (
    <div className="hidden md:flex fixed inset-x-0 top-4 z-40 justify-center px-6">
      <div
        className="flex w-full max-w-5xl items-center gap-4 rounded-3xl border ring-1 backdrop-blur-xl bg-white/90 px-5 py-3 shadow-[0_14px_40px_rgba(15,23,42,0.12)] dark:bg-slate-900/85"
        style={{ borderColor: "var(--nav-border)" }}
      >
        <div className="flex items-center gap-3 pr-4">
          <span className="h-10 w-10 rounded-2xl bg-linear-to-br from-accent-blue-700 to-accent-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-accent-blue/25">
            S
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-primary">Sequenced</span>
            <span className="text-xs text-muted">Plan • Track • Repeat</span>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-2">
          <NavItem to="/" title="Home">
            <HomeIcon />
          </NavItem>
          <NavItem to="/tasks" title="Tasks">
            <TasksIcon />
          </NavItem>
          <NavItem to="/calendar" title="Calendar">
            <CalendarViewIcon />
          </NavItem>
          <NavItem to="/settings" title="Settings">
            <SettingsIcon />
          </NavItem>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={!isInteractive}
            onClick={isInteractive ? () => setIsAdding(true) : undefined}
            className="flex h-11 items-center justify-center rounded-full bg-linear-to-r from-accent-blue-700 to-accent-blue-500 px-4 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 ring-1 ring-white transition hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <AddIcon />
            </div>
            New Task
          </button>
        </div>
      </div>
    </div>
  );

  const isAuthed =
    auth.isSuccess && (auth.data?.message === "Logged In" || !auth.data?.statusCode);
  const showBar = auth.isLoading || auth.isFetching || isAuthed;

  return (
    <>
      {showBar && (
        <>
          {renderMobileBar(isAuthed)}
          {renderDesktopBar(isAuthed)}
          <TaskInfoMenu type="add" isOpen={isAdding} setIsOpen={setIsAdding} />
        </>
      )}
    </>
  );
}
