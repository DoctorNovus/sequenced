import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import TaskInfoMenuUserInvite from "./TaskInfoMenuUserInvite";
import { useRemoveUser, useTaskUsers } from "@/hooks/tasks";
import { queryClient } from "@/index";
import { useUser } from "@/hooks/user";
import { Logger } from "@/utils/logger";

export default function TaskInfoMenuUser({ data }) {
    const host = useUser();

    const [addingUser, setAddingUser] = useState(false);
    const [status, setStatus] = useState({ status: "Error", message: "" });

    const { mutate: removeUser } = useRemoveUser();

    const users = useTaskUsers(data.id);

    if (users.isLoading)
        return "Loading...";

    if (users.isError)
        Logger.logError(users.error.message);

    if (users.isSuccess)
        return (
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between items-center">
                    <label className="text-lg">Users</label>
                    <div className="flex w-8 h-8 justify-center items-center">
                        {!addingUser && <PlusIcon onClick={() => setAddingUser(true)} />}
                        {addingUser && <MinusIcon onClick={() => setAddingUser(false)} />}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    {users.data.users.filter((user) => user.email != host.data.email).map((user, key) => (
                        <div key={key} className="flex flex-row justify-between gap-2">
                            <span className="w-full border border-black shadow-md px-2 py-1 rounded-md">{user.email}</span>
                            <MinusIcon className="w-8 h-8 fill-red-500" onClick={async () => {
                                if (host.data.email == user.email) {
                                    setStatus({ status: "Error", message: "You cannot delete yourself." });
                                    return;
                                }


                                removeUser({ taskId: data.id, userEmail: user.email })
                                setStatus({ status: "Error", message: "User Removed" });
                                setTimeout(() => {
                                    queryClient.invalidateQueries({ queryKey: ["tasks", data.id, "users"] });
                                }, 500);
                            }} />
                        </div>
                    ))}

                    {addingUser && (
                        <div>
                            <TaskInfoMenuUserInvite task={data} setStatus={setStatus} />
                        </div>
                    )}

                    <span className={`text-base ${status.status == "Success" ? "text-accent-blue" : "text-red-500"}`}>{status.message}</span>
                </div>
            </div>
        )
}