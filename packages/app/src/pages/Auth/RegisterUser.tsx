import { useNavigate } from "react-router-dom";
import ArrowBack from "../(Login)/ArrowBack";
import { reloadAuth, useRegister } from "@/hooks/auth";
import { useState } from "react";
import { useApp } from "@/hooks/app";

export default function RegisterUser() {
    const navigate = useNavigate();

    const { mutateAsync: register } = useRegister();
    const [app, setApp] = useApp();


    const [status, setStatus] = useState("");

    const registerUser = async (e) => {
        e.preventDefault();

        const first = e.target[0].value;
        const last = e.target[1].value;
        const email = e.target[2].value;
        const password = e.target[3].value;

        const response = await register({ first, last, email, password });

        if (response.statusCode == 500) {
            setStatus(response.message);
        } else {
            setApp({
                ...app,
                authorized: true
            });

            await reloadAuth();
            await navigate("/");
            await navigate(0);
        }
    }

    return (
        <div className="relative flex w-full items-center justify-center bg-gradient-to-b from-accent-blue-50 via-white to-accent-white-50 px-5 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_5%_10%,rgba(48,122,207,0.1),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(48,122,207,0.08),transparent_30%)]" />
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-accent-blue/10 backdrop-blur">
                <div className="flex flex-row items-center justify-between mb-4">
                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue-50 text-accent-blue"
                        onClick={() => navigate("/auth")}
                    >
                        <ArrowBack />
                    </button>
                    <span className="text-lg font-semibold text-slate-900">Sign Up</span>
                    <div className="w-10" />
                </div>
                <form className="flex flex-col gap-5" onSubmit={(e) => registerUser(e)}>
                    <div className="w-full flex flex-col gap-4">
                        <label className="flex flex-col text-left text-sm font-semibold text-slate-600">
                            First Name
                            <input required className="mt-1 w-full rounded-xl border border-accent-blue/20 bg-white px-3 py-2 text-base shadow-inner focus:border-accent-blue focus:outline-none" placeholder="First Name" />
                        </label>
                        <label className="flex flex-col text-left text-sm font-semibold text-slate-600">
                            Last Name
                            <input required className="mt-1 w-full rounded-xl border border-accent-blue/20 bg-white px-3 py-2 text-base shadow-inner focus:border-accent-blue focus:outline-none" placeholder="Last Name" />
                        </label>
                        <label className="flex flex-col text-left text-sm font-semibold text-slate-600">
                            Email
                            <input required className="mt-1 w-full rounded-xl border border-accent-blue/20 bg-white px-3 py-2 text-base shadow-inner focus:border-accent-blue focus:outline-none" placeholder="Email Address" />
                        </label>
                        <label className="flex flex-col text-left text-sm font-semibold text-slate-600">
                            Password
                            <input required type="password" className="mt-1 w-full rounded-xl border border-accent-blue/20 bg-white px-3 py-2 text-base shadow-inner focus:border-accent-blue focus:outline-none" placeholder="Password" />
                        </label>
                    </div>
                    <label htmlFor="terms-policy" className="w-full flex items-center text-left gap-2 rounded-md text-sm text-slate-600">
                        <input id="terms-policy" required type="checkbox" className="w-5 h-5 aspect-square rounded-md border border-accent-blue/50" />
                        <span>By continuing, you agree to our <a href="https://www.ottegi.com/privacy" target="_blank" className="text-accent-blue underline">Privacy Policy</a>.</span>
                    </label>
                    {status.length > 0 && <span className="text-red-500 text-sm">{status}</span>}
                    <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-accent-blue-700 to-accent-blue-500 py-3 text-lg font-semibold text-white shadow-lg shadow-accent-blue/25 ring-1 ring-accent-blue/20 transition hover:translate-y-[-1px]">Get Started</button>
                </form>
            </div>
        </div>
    )
}
