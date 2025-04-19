import { Outlet } from "react-router-dom";

export default function DataContainer() {
    return (
        <div className="w-full h-full">
            <div
                className="w-full h-full flex flex-col justify-between items-center md:container md:px-16 md:py-2"
                id="basis"
            >
                <div className="flex flex-row justify-center items-center w-full">
                    <div className="my-1"></div>
                </div>
                <div className="flex flex-col justify-center items-center w-full h-full overflow-y-scroll">
                    <div
                        id="unit-container"
                        className="flex flex-col justify-center items-center w-full h-[100vh] overflow-y-scroll"
                    >
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}