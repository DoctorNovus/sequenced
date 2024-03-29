import { Outlet } from "react-router-dom";
import NavBar from "../components/navigation/NavBar";
import { useEffect, useState } from "react";
// import NavItem from "../components/navigation/nav-item";

const Layout = () => {
  return (
    <div
      className="w-full h-full flex flex-col justify-between items-center"
      id="basis"
    >
      <div className="flex flex-row justify-center items-center w-full">
        {/* <NavBar></NavBar> */}
        <div className="my-1"></div>
      </div>
      <div className="flex flex-col justify-center items-center bg-accent-black text-accent-white w-full h-full overflow-y-scroll">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
