import AddIcon from "../Icons/AddIcon";
import HomeIcon from "../Icons/HomeIcon";
import SettingsIcon from "../Icons/SettingsIcon";
import { useState } from "react";
import TaskInfoMenu from "../TaskInfoMenu";
import TasksIcon from "../Icons/TasksIcon";
import NavItem from "./NavItem";
import ListsIcon from "../Icons/ListsIcon";
import { useAuth } from "@/hooks/auth";

export function NavBar() {
  const auth = useAuth();

  const [isAdding, setIsAdding] = useState(false);

  const renderBar = (isInteractive: boolean) => (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto nav-pad w-full max-w-3xl rounded-3xl bg-white/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(48,122,207,0.18)] ring-1 ring-accent-blue/15 border border-white/60">
        <div className="relative flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex flex-1 items-center justify-evenly gap-1 pr-20 md:pr-28">
            <NavItem to="/" title="Home">
              <HomeIcon />
            </NavItem>
            <NavItem to="/tasks" title="Tasks">
              <TasksIcon />
            </NavItem>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-6">
            <button
              disabled={!isInteractive}
              onClick={isInteractive ? () => setIsAdding(true) : undefined}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-accent-blue-700 to-accent-blue-500 text-white shadow-xl shadow-accent-blue/30 ring-2 ring-white transition hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex justify-center items-center w-full h-full p-1 fill-white">
                <AddIcon />
              </div>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-evenly gap-1 pl-20 md:pl-28">
            <NavItem to="#lists" title="">
              {/* <ListsIcon /> */}
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
