import { Outlet, useLocation } from "react-router";

export default function DataContainer() {
    const location = useLocation();
    const isAuthRoute = location.pathname.startsWith("/auth");

    return (
        <div className="relative min-h-screen w-full">
            <div className="absolute inset-0 transition-[background] duration-200" style={{ background: "var(--app-background)" }} />
            <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 md:px-10 lg:px-12 pt-2 md:pt-28">
                <div className="flex flex-row justify-center items-center w-full">
                    <div className="my-1" />
                </div>
                <div className="flex flex-1 flex-col">
                    <div className="flex-1 rounded-3xl">
                        <div
                            id="unit-container"
                            className={`flex h-full ${isAuthRoute ? "min-h-screen justify-center" : "min-h-screen justify-start"} flex-col rounded-3xl py-2 md:px-8 overflow-y-auto`}
                            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
                        >
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
