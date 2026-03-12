import { Outlet, useLocation } from "react-router";

export default function DataContainer() {
    const location = useLocation();
    const isAuthRoute = location.pathname.startsWith("/auth");

    return (
        <div className="relative min-h-screen">
            <div className="absolute inset-0 transition-[background] duration-200" style={{ background: "var(--app-background)" }} />
            <div className="relative z-10 min-h-screen flex flex-col md:ml-56 px-4 md:px-10 pt-2 md:pt-8">
                <div
                    id="unit-container"
                    className={`flex flex-1 flex-col ${isAuthRoute ? "justify-center items-center" : "justify-start"} py-2 overflow-y-auto`}
                    style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
                >
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
