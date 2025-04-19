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
        <div className="w-screen h-screen flex justify-center items-center absolute top-0 left-0 bg-gray-50">
            <div className="w-full px-10 text-center flex flex-col gap-10">
                <div className="flex flex-row justify-center items-center relative">
                    <div className="absolute left-0">
                        <div className="flex w-8 aspect-square items-center justify-center" onClick={() => navigate("/auth")}>
                            <ArrowBack />
                        </div>
                    </div>
                    <div className="">
                        <span className="text-xl">Sign Up</span>
                    </div>
                </div>
                <form className="flex flex-col items-start gap-5" onSubmit={(e) => registerUser(e)}>
                    <div className="w-full flex flex-col gap-4">
                        <input required className="w-full border-b bg-transparent py-2 px-1 text-lg" placeholder="First Name" />
                        <input required className="w-full border-b bg-transparent py-2 px-1 text-lg" placeholder="Last Name" />
                        <input required className="w-full border-b bg-transparent py-2 px-1 text-lg" placeholder="Email Address" />
                        <input required className="w-full border-b bg-transparent py-2 px-1 text-lg" placeholder="Password" />
                    </div>
                    <label htmlFor="terms-policy" className="w-full flex items-center text-left gap-2 rounded-md">
                        <input id="terms-policy" required type="checkbox" className="w-6 h-6 aspect-square border border-accent-blue" />
                        <span>By continuing, you agree to our <a href="https://www.ottegi.com/privacy" target="_blank" className="text-accent-blue underline">Privacy Policy</a>.</span>
                    </label>
                    {status.length > 0 && <span className="text-red-500">{status}</span>}
                    <button type="submit" className="w-full shadow-md border py-2 bg-accent-blue text-accent-white rounded-md my-4 text-xl uppercase">Get Started</button>
                </form>
            </div>
        </div>
    )
}