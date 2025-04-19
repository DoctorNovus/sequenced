import icon from "@/assets/icon.png";

import TaskFeature from "../(Login)/TaskFeature";
import { useNavigate } from "react-router-dom";

export default function LoginHome() {
    const navigate = useNavigate();

    return (
        <div className="w-screen h-screen flex justify-center items-center absolute top-0 left-0 bg-gray-50">
            <div className="w-full h-full flex flex-col justify-center px-6 gap-6">
                <div className="flex flex-row items-center gap-6">
                    <div className="w-20 aspect-square shadow-xl border rounded-xl">
                        <img src={icon} className="w-full rounded-xl"/>
                    </div>
                    <div>
                        <h1 className="text-3xl">Sequenced</h1>
                        <h2 className="text-base text-gray-500">Task-based ADHD Management App</h2>
                    </div>
                </div>
                <div>
                    <ul className="flex flex-col gap-2">
                        <TaskFeature>Task-oriented scheduling</TaskFeature>
                        <TaskFeature>Reminders</TaskFeature>
                        <TaskFeature>Repeating Tasks</TaskFeature>
                        <TaskFeature>Easy Navigation</TaskFeature>
                        <TaskFeature>Simple Design</TaskFeature>
                        <TaskFeature>Colorful Aspects</TaskFeature>
                    </ul>
                </div>
                <div className="flex flex-col gap-6">
                    <button className="w-full shadow-md border py-3 bg-accent-blue text-accent-white rounded-md text-xl uppercase" onClick={() => navigate("/auth/login")}>Login</button>
                    <button className="w-full shadow-md border py-3 border-accent-blue text-accent-blue rounded-md text-xl uppercase" onClick={() => navigate("/auth/register")}>Sign Up</button>
                </div>
            </div>
        </div>
    )
}