import tasks_icon from "@/assets/tasks.svg";
import lists_icon from "@/assets/lists.svg";

import AddIcon from "../Icons/AddIcon";
import HomeIcon from "../Icons/HomeIcon";
import SettingsIcon from "../Icons/SettingsIcon";
import { useState } from "react";
import TaskInfoMenu from "../TaskInfoMenu";
import { Link } from "react-router-dom";
import TasksIcon from "../Icons/TasksIcon";
import NavItem from "./NavItem";
import ListsIcon from "../Icons/ListsIcon";
import { useAuth } from "@/hooks/auth";

export function NavBar() {
  const auth = useAuth();

  const [isAdding, setIsAdding] = useState(false);

  if (auth.isLoading) {
    return (
      <div className="flex justify-center items-center w-full absolute bottom-0 nav-pad bg-accent-blue fill-white">
        <div className="w-full h-20 flex flex-row justify-evenly items-center rounded-t-md mb-1 md:container">
          <div className="flex flex-row grow justify-evenly items-center">
            <NavItem to="/" title="Home">
              <HomeIcon />
            </NavItem>
            <NavItem to="/tasks" title="Tasks">
              <TasksIcon />
            </NavItem>
          </div>
          <div className="flex justify-center items-center">
            <div className="flex justify-center items-center w-20 h-20 bg-accent-white rounded-full border-2 border-solid border-accent-blue hover:bg-accent-gray-50 mb-6">
              <button
                className="flex text-center justify-center items-center w-16 h-16 text-3xl rounded-full text-accent-blue"
              >
                <div className="flex justify-center items-center w-full h-full p-1 fill-accent-blue">
                  <AddIcon />
                </div>
              </button>
            </div>
          </div>
          <div className="flex flex-row grow justify-evenly">
            <NavItem to="#lists" title="">
              {/* <ListsIcon /> */}
            </NavItem>
            <NavItem to="/settings" title="Settings">
              <SettingsIcon />
            </NavItem>
          </div>
        </div>
      </div>
    )
  }

  return (
    auth.isSuccess && !auth.data.statusCode && (
      <div className="flex justify-center items-center w-full absolute bottom-0 nav-pad bg-accent-blue fill-white">
        <div className="w-full h-20 flex flex-row justify-evenly items-center rounded-t-md mb-1 md:container">
          <div className="flex flex-row grow justify-evenly items-center">
            <NavItem to="/" title="Home">
              <HomeIcon />
            </NavItem>
            <NavItem to="/tasks" title="Tasks">
              <TasksIcon />
            </NavItem>
          </div>
          <div className="flex justify-center items-center">
            <div className="flex justify-center items-center w-20 h-20 bg-accent-white rounded-full border-2 border-solid border-accent-blue hover:bg-accent-gray-50 mb-6">
              <button
                onClick={() => setIsAdding(true)}
                className="flex text-center justify-center items-center w-16 h-16 text-3xl rounded-full text-accent-blue"
              >
                <div className="flex justify-center items-center w-full h-full p-1 fill-accent-blue">
                  <AddIcon />
                </div>
              </button>
            </div>
          </div>
          <div className="flex flex-row grow justify-evenly">
            <NavItem to="#lists" title="">
              {/* <ListsIcon /> */}
            </NavItem>
            <NavItem to="/settings" title="Settings">
              <SettingsIcon />
            </NavItem>
          </div>
        </div>
        <TaskInfoMenu type="add" isOpen={isAdding} setIsOpen={setIsAdding} />
      </div>
    )
  );
}
