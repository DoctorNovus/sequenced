import AddIcon from "../Icons/AddIcon";
import HomeIcon from "../Icons/HomeIcon";
import SettingsIcon from "../Icons/SettingsIcon";
import { useState } from "react";
import TaskInfoMenu from "../TaskInfoMenu";
import TasksIcon from "../Icons/TasksIcon";
import NavItem from "./NavItem";
import ListsIcon from "../Icons/ListsIcon";
import { useAuth } from "@/hooks/auth";
import CalendarViewIcon from "../Icons/CalendarViewIcon";

export function NavBar() {
  const auth = useAuth();

  const [isAdding, setIsAdding] = useState(false);

  const renderBar = (isInteractive: boolean) => (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:px-4">
      <div className="pointer-events-auto nav-pad w-full max-w-2xl rounded-2xl bg-white/92 ring-1 ring-accent-blue/12 border border-white/70 h-16 md:h-20 bg-white">
        <div className="relative flex h-full items-center justify-between px-3 py-2 md:px-5">
          <div className="flex flex-1 items-center justify-evenly gap-2 md:pr-10">
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
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-accent-blue-700 to-accent-blue-500 text-white shadow-lg shadow-accent-blue/25 ring-1 ring-white transition hover:-translate-y-1 hover:scale-[1.05] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex justify-center items-center w-full h-full p-2 fill-current">
                <AddIcon />
              </div>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-evenly gap-2 md:pl-10">
            <NavItem to="#" title="Calendar" disabled>
              <CalendarViewIcon className="opacity-50 cursor-not-allowed" />
            </NavItem>
            <NavItem to="/settings" title="Settings">
              <SettingsIcon />
            </NavItem>
          </div>
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
          {renderBar(isAuthed)}
          <TaskInfoMenu type="add" isOpen={isAdding} setIsOpen={setIsAdding} />
        </>
      )}
    </>
  );
}
