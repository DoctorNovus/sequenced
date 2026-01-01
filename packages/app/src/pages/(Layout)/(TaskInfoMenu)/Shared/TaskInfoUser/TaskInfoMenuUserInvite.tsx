import { Task } from "@/hooks/tasks";
import { useUser } from "@/hooks/user";
import { queryClient } from "@/index";
import { fetchData } from "@/utils/data";

export default function TaskInfoMenuUserInvite({ task, setStatus }: { task: Task, setStatus: (_: { status: string, message: string }) => void }) {
    const user = useUser();

    const inviteUser = async () => {
        const invitee = document.getElementById("user-invite-email") as HTMLInputElement;
        if (!invitee || !invitee.value) return;

        if (invitee.value == user.data?.email) {
            setStatus({ status: "Error", message: "You cannot invite yourself." });
            return;
        }

        const resp = await fetchData("/task/invite", {
            method: "POST",
            body: {
                task,
                email: invitee.value
            }
        });

        if (resp.ok) {
            setStatus({ status: "Success", message: "User Invited." });
            invitee.value = "";
            await queryClient.invalidateQueries({ queryKey: ["tasks", task.id, "users"] });
            return;
        }

        const { message } = await resp.json();

        setStatus({ status: "Error", message });
    }

    return (
        <div className="w-full h-full flex flex-row gap-2 items-center">
            <input id="user-invite-email" placeholder="Enter email address..." className="appearance-none w-full h-full text-base px-2 py-2 bg-white border border-accent-black-400 rounded-md text-accent-black overflow-x-hidden overflow-y-scroll" />
            <div className="" onClick={inviteUser}>
                <span className="bg-accent-blue text-white px-2 py-1 rounded-md">INVITE</span>
            </div>
        </div>
    )
}