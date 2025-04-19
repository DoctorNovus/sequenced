import { fetchData } from "@/utils/data"
import { useNavigate } from "react-router-dom";

export default function ControllerUser() {
    const navigate = useNavigate();

    const loginAsUser = async () => {
        const id = document.getElementById("developer_uid")?.value;

        const res = await (await fetchData("/auth/loginAsUser", {
            method: "POST",
            body: {
                id
            }
        })).text();

        if (res == "OK")
            navigate(0);
    }

    return (
        <div className="flex flex-row gap-1">
            <input id="developer_uid" className="shadow-md border border-solid px-2 py-1 rounded-sm" name="developer_uid" type="text" autoComplete="off" placeholder="USER ID" />
            <button className="px-3 py-1 bg-accent-blue text-accent-white rounded-md" onClick={loginAsUser}>Login As User</button>
        </div>
    )
}