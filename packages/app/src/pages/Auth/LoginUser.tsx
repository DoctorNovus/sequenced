import { useNavigate } from "react-router-dom";
import ArrowBack from "../(Login)/ArrowBack";
import { reloadAuth, useLogin } from "@/hooks/auth";
import { useState } from "react";
import { useApp } from "@/hooks/app";

export default function LoginUser() {

    const { mutateAsync: login } = useLogin();
    const [app, setApp] = useApp();

    const navigate = useNavigate();

    const [status, setStatus] = useState("");

    const loginUser = async (e) => {
        e.preventDefault();

        const email = e.target[0].value;
        const password = e.target[1].value;

        const resp = await login({ email, password });

        if (resp)
            setStatus(resp.message);
        else {
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
                        <span className="text-xl">Login</span>
                    </div>
                </div>
                <form className="flex flex-col items-start gap-5" onSubmit={(e) => loginUser(e)}>
                    <div className="w-full flex flex-col gap-4">
                        <input required type="email" name="email" className="w-full border-b bg-transparent py-2 px-1 text-lg" placeholder="user@example.com" />
                        <input required type="password" name="password" className="w-full border-b bg-transparent py-2 px-1 text-lg" placeholder="password" />
                    </div>
                    {status.length > 0 && <span className="text-red-500">{status}</span>}
                    <button type="submit" className="w-full shadow-md border py-2 bg-accent-blue text-accent-white rounded-md my-4 text-xl uppercase">Sign In</button>
                    <div className="flex w-full justify-center">
                        <em className="text-center text-base text-gray-500">Forgot Password?</em>
                    </div>
                </form>
            </div>
        </div>
    )
}