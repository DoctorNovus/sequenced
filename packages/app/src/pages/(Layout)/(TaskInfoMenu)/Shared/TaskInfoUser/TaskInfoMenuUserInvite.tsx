import { useUser } from "@/hooks/user";
import { queryClient } from "@/index";
import { fetchData } from "@/utils/data";

export default function TaskInfoMenuUserInvite({ task, setStatus }) {

    const user = useUser();

    const inviteUser = async () => {
        const invitee = document.getElementById("user-invite-email").value;

        if (invitee == user.data.email) {
            setStatus({ status: "Error", message: "You cannot invite yourself." });
            return;
        }

        const resp = await fetchData("/task/invite", {
            method: "POST",
            body: {
                task,
                email: invitee
            }
        });

        if (resp.ok) {
            setStatus({ status: "Success", message: "User Invited." });
            document.getElementById("user-invite-email").value = "";
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