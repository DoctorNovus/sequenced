import { useAuth } from "@/hooks/auth";
import { Navigate } from "react-router-dom";

export default function AuthProvider({ children }) {
    const auth = useAuth();

    if (auth.isError)
        throw auth.error;

    return (
        auth.isSuccess && (
            (auth.data.statusCode != 401 && auth.data.message) ?
                (
                    <div className="w-full h-full">
                        {children}
                    </div>
                ) : (
                    <Navigate to="/auth" />
                )
        )
    )
}