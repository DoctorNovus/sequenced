import icon from "@/assets/icon.png";

import TaskFeature from "../(Login)/TaskFeature";
import { useNavigate } from "react-router-dom";

export default function LoginHome() {
    const navigate = useNavigate();

    return (
        <div className="relative flex w-full h-screen items-center justify-center bg-gradient-to-b from-accent-blue-50 via-white to-accent-white-50 px-5 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(48,122,207,0.1),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(48,122,207,0.08),transparent_30%)]" />
            <div className="relative z-10 flex w-full max-w-md flex-col gap-6 rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-accent-blue/10 backdrop-blur">
                <div className="flex flex-row items-center gap-4">
                    <div className="w-16 aspect-square shadow-lg border border-accent-blue/20 rounded-2xl overflow-hidden bg-accent-blue-50">
                        <img src={icon} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold text-slate-900">Sequenced</h1>
                        <h2 className="text-sm text-slate-500">Lightweight ADHD-friendly task flow</h2>
                    </div>
                </div>
                <div className="rounded-2xl border border-accent-blue/10 bg-accent-blue-50/40 p-4">
                    <ul className="flex flex-col gap-2">
                        <TaskFeature>Task-oriented scheduling</TaskFeature>
                        <TaskFeature>Reminders + repeats</TaskFeature>
                        <TaskFeature>Simple, focused navigation</TaskFeature>
                        <TaskFeature>Clean, calm design</TaskFeature>
                    </ul>
                </div>
                <div className="flex flex-col gap-3">
                    <button
                        className="w-full rounded-xl bg-gradient-to-r from-accent-blue-700 to-accent-blue-500 py-3 text-lg font-semibold text-white shadow-lg shadow-accent-blue/25 ring-1 ring-accent-blue/20 transition hover:translate-y-[-1px]"
                        onClick={() => navigate("/auth/login")}
                    >
                        Login
                    </button>
                    <button
                        className="w-full rounded-xl border border-accent-blue/30 bg-white py-3 text-lg font-semibold text-accent-blue shadow-md shadow-accent-blue/10 transition hover:translate-y-[-1px]"
                        onClick={() => navigate("/auth/register")}
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    )
}
