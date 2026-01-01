import { updateName } from "@/hooks/user";
import { useNavigate } from "react-router";

export default function NameProvider() {
    const navigate = useNavigate();

    const updateInformation = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const first = (form.elements[0] as HTMLInputElement).value;
        const last = (form.elements[1] as HTMLInputElement).value;

        await updateName(first, last);
        navigate(0);
    }

    return (
        <div className="flex flex-col px-10 text-left gap-4 items-center">
            <span className="text-center text-gray-500">To better enhance your user experience, we are now requesting your first and last name.</span>
            <hr className="w-3/4 bg-black" />
            <form className="flex flex-col items-start gap-5" onSubmit={updateInformation}>
                <input required className="w-full border-b bg-transparent py-2 px-1 text-lg" placeholder="First Name" />
                <input required className="w-full border-b bg-transparent py-2 px-1 text-lg" placeholder="Last Name" />
                <div className="w-full flex items-center text-left gap-2 rounded-md">
                    <input required type="checkbox" className="w-6 h-6 aspect-square border border-accent-blue" />
                    <span>By continuing, you agree to our <span className="text-accent-blue underline">Terms of Service</span> and <span className="text-accent-blue underline">Privacy Policy</span>.</span>
                </div>
                <button type="submit" className="w-full shadow-md border py-2 bg-accent-blue text-accent-white rounded-md my-4 text-xl uppercase">Submit</button>
            </form>
        </div>
    )
}
