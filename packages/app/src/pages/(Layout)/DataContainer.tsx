import { Outlet } from "react-router-dom";

export default function DataContainer() {
    return (
        <div className="relative min-h-screen w-full">
            <div className="absolute inset-0 bg-gradient-to-b from-accent-blue-50/80 via-white to-accent-white-50" />
            <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-28 pt-6 md:px-10 lg:px-12">
                <div className="flex flex-row justify-center items-center w-full">
                    <div className="my-1" />
                </div>
                <div className="flex flex-1 flex-col">
                    <div className="flex-1 rounded-3xl">
                        <div
                            id="unit-container"
                            className="flex h-full min-h-[80vh] flex-col justify-center rounded-3xl px-4 py-6 md:px-8 overflow-y-auto"
                        >
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
