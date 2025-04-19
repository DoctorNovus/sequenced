import { useUser } from "@/hooks/user";

export default function DeveloperSettings({ children }) {
    const user = useUser();

    if (user.isLoading)
        return <></>

    if (user.isSuccess) {
        if (user.data.developer) {
            return (
                <div className="flex flex-col gap-2">
                    <h2>Developer Settings</h2>
                    <div>
                        {children}
                    </div>
                </div>
            )
        }
    }


}