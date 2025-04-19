import { useUser } from "@/hooks/user";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

import AuthProvider from "./Auth/AuthProvider";
import HomeIntroduction from "./(Home)/HomeIntroduction";
import HomeAgenda from "./(Home)/HomeAgenda";
import HomeUpcoming from "./(Home)/HomeUpcoming";

const Home = () => {
    const auth = useAuth();
    const user = useUser();

    if (auth.isSuccess && auth.data.message != "Logged In")
        return <Navigate to="/auth" />

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (auth.isLoading)
        return (
            <div className="w-full h-full flex flex-col px-4 py-2 gap-4">
                <HomeIntroduction skeleton="true" />
                <HomeAgenda skeleton="true" />
                <HomeUpcoming skeleton="true" />
            </div>
        )

    return (
        <AuthProvider>
            <div className="w-full h-full flex flex-col px-4 py-2 gap-4">
                <HomeIntroduction user={user} today={today} />
                <HomeAgenda />
                <HomeUpcoming />
            </div>
        </AuthProvider>
    )

};

export default Home;